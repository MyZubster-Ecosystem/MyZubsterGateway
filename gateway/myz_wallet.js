/**
 * Tari (MYZ) Wallet Integration — Bounty B4 / #257
 * 
 * Sostituisce lo stub con chiamate RPC reali al wallet Tari (tari_wallet).
 * 
 * Configurazione via env:
 *   TARI_WALLET_URL=http://127.0.0.1:12021/json_rpc
 *   PLATFORM_WALLET_ID= (wallet ID piattaforma)
 * 
 * API:
 *   lockMYZ(amount, fromWallet, memo)   → { txid, address }
 *   releaseMYZ(txid, toAddress)         → { txid }
 *   refundMYZ(txid, fromAddress)        → { txid }
 */

const http = require('http');
const https = require('https');

const TARI_WALLET_URL = process.env.TARI_WALLET_URL || 'http://127.0.0.1:12021/json_rpc';
const PLATFORM_WALLET_ID = process.env.PLATFORM_WALLET_ID || 'primary';

/**
 * Chiamata JSON-RPC al wallet Tari.
 */
function rpcCall(method, params = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(TARI_WALLET_URL);
    const transport = url.protocol === 'https:' ? https : http;
    const payload = JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now().toString(),
      method,
      params
    });

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 30000
    };

    const req = transport.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.error) {
            return reject(new Error(`Tari RPC error: ${response.error.message || JSON.stringify(response.error)}`));
          }
          resolve(response.result);
        } catch (e) {
          reject(new Error(`Tari RPC parse error: ${e.message}`));
        }
      });
    });

    req.on('error', (err) => reject(new Error(`Tari RPC connection failed: ${err.message}`)));
    req.on('timeout', () => { req.destroy(); reject(new Error('Tari RPC timeout (30s)')); });
    req.write(payload);
    req.end();
  });
}

/**
 * lockMYZ — Blocca MYZ trasferendoli a un indirizzo escrow.
 * Fa una stima dei fee prima del trasferimento.
 * 
 * @param {number} amount - Importo in MYZ da bloccare
 * @param {string} fromWallet - ID wallet sorgente
 * @param {string} memo - Nota descrittiva
 * @returns {{ txid: string, address: string, amount: number }}
 */
async function lockMYZ(amount, fromWallet = null, memo = '') {
  if (!amount || amount <= 0) {
    throw new Error('lockMYZ: amount must be positive');
  }

  const wallet = fromWallet || PLATFORM_WALLET_ID;

  // Genera un nuovo indirizzo per l'escrow
  const newAddr = await rpcCall('generate_new_address', {
    wallet_id: wallet,
    label: `escrow-${Date.now()}`
  });

  if (!newAddr || !newAddr.address) {
    throw new Error('lockMYZ: failed to generate escrow address');
  }

  // Stima fee
  let feeEstimate = 0;
  try {
    const fee = await rpcCall('estimate_fee', {
      amount: amount,
      fee_per_gram: 1
    });
    feeEstimate = fee.fee || 0;
  } catch (e) {
    console.warn(`[MYZ] Fee estimation failed, using default: ${e.message}`);
    feeEstimate = 1; // fallback
  }

  // Trasferisci all'indirizzo escrow
  const transfer = await rpcCall('transfer', {
    wallet_id: wallet,
    destinations: [{
      address: newAddr.address,
      amount: amount,
      fee_per_gram: Math.max(feeEstimate, 1)
    }]
  });

  if (!transfer || !transfer.transaction_id) {
    throw new Error('lockMYZ: transfer failed');
  }

  console.log(`[MYZ] Locked ${amount} MYZ → ${newAddr.address} (tx: ${transfer.transaction_id})`);
  if (memo) console.log(`[MYZ] Memo: ${memo}`);

  return {
    txid: transfer.transaction_id,
    address: newAddr.address,
    amount: amount,
    fee: feeEstimate
  };
}

/**
 * releaseMYZ — Sblocca MYZ dall'escrow al destinatario.
 * 
 * @param {string} fromAddress - Indirizzo escrow
 * @param {string} toAddress - Indirizzo destinatario (robot/piattaforma)
 * @param {number} amount - Importo (default: tutto il saldo)
 * @returns {{ txid: string, amount: number }}
 */
async function releaseMYZ(fromAddress, toAddress, amount = null) {
  if (!fromAddress || !toAddress) {
    throw new Error('releaseMYZ: fromAddress and toAddress required');
  }

  // Ottieni saldo
  let releaseAmount = amount;
  if (!releaseAmount) {
    try {
      const bal = await rpcCall('get_balance', { address: fromAddress });
      releaseAmount = bal.available_balance || bal.balance || 0;
    } catch (e) {
      throw new Error(`releaseMYZ: cannot get balance: ${e.message}`);
    }
  }

  if (releaseAmount <= 0) {
    throw new Error('releaseMYZ: insufficient balance');
  }

  const transfer = await rpcCall('transfer', {
    wallet_id: PLATFORM_WALLET_ID,
    destinations: [{
      address: toAddress,
      amount: releaseAmount,
      fee_per_gram: 1
    }]
  });

  if (!transfer || !transfer.transaction_id) {
    throw new Error('releaseMYZ: transfer failed');
  }

  console.log(`[MYZ] Released ${releaseAmount} MYZ → ${toAddress} (tx: ${transfer.transaction_id})`);

  return {
    txid: transfer.transaction_id,
    amount: releaseAmount
  };
}

/**
 * refundMYZ — Rimborsa MYZ al cliente originale.
 * 
 * @param {string} fromAddress - Indirizzo escrow
 * @param {string} toAddress - Indirizzo cliente
 * @param {number} amount - Importo da rimborsare
 * @returns {{ txid: string, amount: number }}
 */
async function refundMYZ(fromAddress, toAddress, amount) {
  if (!fromAddress || !toAddress || !amount || amount <= 0) {
    throw new Error('refundMYZ: fromAddress, toAddress, and amount required');
  }
  return releaseMYZ(fromAddress, toAddress, amount);
}

/**
 * Health check — verifica che il wallet Tari RPC sia raggiungibile.
 */
async function healthCheck() {
  try {
    const status = await rpcCall('get_status');
    return { ok: true, network: status.network || 'tari', version: status.version || 'unknown' };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

module.exports = { lockMYZ, releaseMYZ, refundMYZ, healthCheck };
