/**
 * Monero (XMR) Wallet Integration — Bounty P8 / #272
 * 
 * Sostituisce lo stub con chiamate RPC reali al wallet Monero.
 * 
 * Configurazione via env:
 *   XMR_WALLET_URL=http://127.0.0.1:18083/json_rpc
 *   XMR_WALLET_PASSWORD= (opzionale)
 * 
 * API:
 *   lockXMR(amount, fromAccount, memo)   → { txid, address }
 *   releaseXMR(txid, toAddress)          → { txid }
 *   refundXMR(txid, fromAddress)         → { txid }
 */

const http = require('http');
const https = require('https');

const XMR_WALLET_URL = process.env.XMR_WALLET_URL || 'http://127.0.0.1:18083/json_rpc';
const XMR_WALLET_PASSWORD = process.env.XMR_WALLET_PASSWORD || '';

/**
 * Chiamata JSON-RPC al wallet Monero.
 */
function rpcCall(method, params = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(XMR_WALLET_URL);
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
            return reject(new Error(`Monero RPC error: ${response.error.message || JSON.stringify(response.error)}`));
          }
          resolve(response.result);
        } catch (e) {
          reject(new Error(`Monero RPC parse error: ${e.message}`));
        }
      });
    });

    req.on('error', (err) => reject(new Error(`Monero RPC connection failed: ${err.message}`)));
    req.on('timeout', () => { req.destroy(); reject(new Error('Monero RPC timeout (30s)')); });
    req.write(payload);
    req.end();
  });
}

/**
 * lockXMR — Crea un sotto-account escrow per bloccare fondi.
 * 
 * @param {number} amount - Importo in XMR da bloccare
 * @param {string} fromAccount - Indice account sorgente (default: 0)
 * @param {string} memo - Nota descrittiva
 * @returns {{ txid: string, address: string, amount: number }}
 */
async function lockXMR(amount, fromAccount = 0, memo = '') {
  if (!amount || amount <= 0) {
    throw new Error('lockXMR: amount must be positive');
  }

  // Crea un sotto-indirizzo per l'escrow
  const newAddr = await rpcCall('create_address', {
    account_index: fromAccount,
    label: `escrow-${Date.now()}`
  });

  if (!newAddr || !newAddr.address) {
    throw new Error('lockXMR: failed to create escrow address');
  }

  // Trasferisci fondi all'indirizzo escrow
  const destinations = [{
    amount: Math.floor(amount * 1e12), // XMR → atomic units
    address: newAddr.address
  }];

  const transfer = await rpcCall('transfer', {
    destinations,
    account_index: fromAccount,
    priority: 0,
    ring_size: 11
  });

  if (!transfer || !transfer.tx_hash) {
    throw new Error('lockXMR: transfer failed');
  }

  console.log(`[XMR] Locked ${amount} XMR → ${newAddr.address} (tx: ${transfer.tx_hash})`);
  if (memo) console.log(`[XMR] Memo: ${memo}`);

  return {
    txid: transfer.tx_hash,
    address: newAddr.address,
    amount: transfer.amount / 1e12,
    fee: transfer.fee / 1e12
  };
}

/**
 * releaseXMR — Trasferisce XMR dall'escrow al destinatario.
 * 
 * @param {string} fromAddress - Indirizzo escrow
 * @param {string} toAddress - Indirizzo destinatario (robot/piattaforma)
 * @param {number} amount - Importo (default: tutto il saldo)
 * @returns {{ txid: string, amount: number }}
 */
async function releaseXMR(fromAddress, toAddress, amount = null) {
  if (!fromAddress || !toAddress) {
    throw new Error('releaseXMR: fromAddress and toAddress required');
  }

  // Ottieni saldo dell'indirizzo escrow
  const balance = await rpcCall('get_balance', { account_index: 0 });
  const releaseAmount = amount ? Math.floor(amount * 1e12) : balance.unlocked_balance;

  if (releaseAmount <= 0) {
    throw new Error('releaseXMR: insufficient balance');
  }

  const destinations = [{
    amount: releaseAmount,
    address: toAddress
  }];

  const transfer = await rpcCall('transfer', {
    destinations,
    account_index: 0,
    priority: 0,
    ring_size: 11
  });

  if (!transfer || !transfer.tx_hash) {
    throw new Error('releaseXMR: transfer failed');
  }

  console.log(`[XMR] Released ${releaseAmount / 1e12} XMR → ${toAddress} (tx: ${transfer.tx_hash})`);

  return {
    txid: transfer.tx_hash,
    amount: transfer.amount / 1e12,
    fee: transfer.fee / 1e12
  };
}

/**
 * refundXMR — Rimborsa XMR al cliente originale.
 * 
 * @param {string} fromAddress - Indirizzo escrow
 * @param {string} toAddress - Indirizzo cliente
 * @param {number} amount - Importo da rimborsare
 * @returns {{ txid: string, amount: number }}
 */
async function refundXMR(fromAddress, toAddress, amount) {
  if (!fromAddress || !toAddress || !amount || amount <= 0) {
    throw new Error('refundXMR: fromAddress, toAddress, and amount required');
  }
  return releaseXMR(fromAddress, toAddress, amount);
}

/**
 * Health check — verifica che il wallet RPC sia raggiungibile.
 */
async function healthCheck() {
  try {
    const version = await rpcCall('get_version');
    return { ok: true, version: version.version || 'unknown', network: 'monero' };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

module.exports = { lockXMR, releaseXMR, refundXMR, healthCheck };
