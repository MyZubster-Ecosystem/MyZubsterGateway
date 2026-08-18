// gateway/tari_payout.js — Tari network payout service for MYZ withdrawals
const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const TARI_WALLET_GRPC_ADDRESS = process.env.TARI_WALLET_GRPC_ADDRESS || '127.0.0.1:18143';
const TARI_FEE_PER_GRAM = BigInt(process.env.TARI_FEE_PER_GRAM || '100');
const TARI_PAYMENT_TYPE = Number(process.env.TARI_PAYMENT_TYPE || '2');
const TARI_GRPC_TIMEOUT_MS = Number(process.env.TARI_GRPC_TIMEOUT_MS || '30000');
const TARI_SIMULATION = process.env.TARI_SIMULATION === 'true';

const protoPath = path.join(__dirname, 'tari_wallet.proto');
const packageDefinition = protoLoader.loadSync(protoPath, { keepCase: false, longs: String, enums: Number, defaults: true, oneofs: true });
const tariRpc = grpc.loadPackageDefinition(packageDefinition).tari.rpc;

function createWalletClient() {
  return new tariRpc.Wallet(TARI_WALLET_GRPC_ADDRESS, grpc.credentials.createInsecure());
}

function addAuthenticationMetadata(metadata) {
  const username = process.env.TARI_WALLET_GRPC_USERNAME;
  const password = process.env.TARI_WALLET_GRPC_PASSWORD;
  if (username || password) {
    if (!username || !password) throw new Error('TARI_WALLET_GRPC_USERNAME and TARI_WALLET_GRPC_PASSWORD must be set together');
    metadata.set('authorization', `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`);
  }
  return metadata;
}

function amountToMicroTari(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) throw new Error('Amount must be a positive number');
  const decimal = String(value);
  const [whole, fraction = ''] = decimal.split('.');
  if (fraction.length > 6) throw new Error('Amount supports at most 6 decimal places');
  const micro = BigInt(whole) * 1_000_000n + BigInt((fraction + '000000').slice(0, 6));
  if (micro <= 0n || micro > 18_446_744_073_709_551_615n) throw new Error('Amount is outside the Tari uint64 range');
  return micro.toString();
}

function rpcTransfer(client, request) {
  return new Promise((resolve, reject) => {
    const metadata = addAuthenticationMetadata(new grpc.Metadata());
    const deadline = new Date(Date.now() + TARI_GRPC_TIMEOUT_MS);
    client.transfer(request, metadata, { deadline }, (error, response) => error ? reject(error) : resolve(response));
  });
}

class TariPayout {
  constructor() {
    this.pendingTransfers = new Map();
  }

  async transferToAddress(userId, address, amount) {
    if (!address || typeof address !== 'string') throw new Error('Invalid Tari address');
    const amountMicroTari = amountToMicroTari(amount);
    const transferId = `payout_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const transfer = { userId, address, amount, amountMicroTari, status: 'pending', createdAt: new Date().toISOString() };
    this.pendingTransfers.set(transferId, transfer);

    try {
      if (TARI_SIMULATION) {
        const simTxId = `tari_tx_sim_${Date.now()}`;
        Object.assign(transfer, { status: 'sent', txId: simTxId, networkTxId: simTxId, simulated: true, note: 'TARI_SIMULATION=true' });
        this.pendingTransfers.set(transferId, transfer);
        console.log(`💸 [TariPayout] SIMULATED: ${amount} MYZ → ${address.slice(0, 12)}... (tx: ${simTxId})`);
        return { transferId, txId: simTxId, status: 'sent', simulated: true };
      }

      const client = createWalletClient();
      let response;
      try {
        response = await rpcTransfer(client, {
          recipients: [{ address, amount: amountMicroTari, feePerGram: TARI_FEE_PER_GRAM.toString(), paymentType: TARI_PAYMENT_TYPE }],
          singleTx: false
        });
      } finally {
        client.close();
      }

      const result = response?.results?.[0];
      if (!result) throw new Error('Tari wallet returned an empty TransferResponse');
      if (!result.isSuccess) throw new Error(result.failureMessage || 'Tari wallet rejected the transfer');

      const txId = String(result.transactionId);
      Object.assign(transfer, { status: 'sent', txId, networkTxId: txId, simulated: false });
      this.pendingTransfers.set(transferId, transfer);
      return { transferId, txId, status: 'sent', simulated: false };
    } catch (err) {
      transfer.status = 'failed';
      transfer.error = err.message;
      this.pendingTransfers.set(transferId, transfer);
      throw new Error(`Tari transfer failed: ${err.message}`);
    }
  }

  getTransferStatus(transferId) {
    const transfer = this.pendingTransfers.get(transferId);
    if (!transfer) return null;
    return { transferId, status: transfer.status, amount: transfer.amount, amountMicroTari: transfer.amountMicroTari, address: transfer.address, txId: transfer.txId, simulated: transfer.simulated || false, error: transfer.error, createdAt: transfer.createdAt };
  }

  getUserTransfers(userId) {
    const transfers = [];
    this.pendingTransfers.forEach((t, id) => { if (t.userId === userId) transfers.push({ transferId: id, ...t }); });
    return transfers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

module.exports = new TariPayout();
