'use strict';

const crypto = require('crypto');

const endpoint = process.env.TARI_WALLET_URL;
const token = process.env.TARI_WALLET_TOKEN;

async function rpc(method, params) {
  if (!endpoint) throw new Error('TARI_WALLET_URL is not configured');
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ jsonrpc: '2.0', id: crypto.randomUUID(), method, params }),
  });
  const payload = await response.json();
  if (!response.ok || payload.error) throw new Error(payload.error?.message || `Tari wallet HTTP ${response.status}`);
  return payload.result;
}

async function mintNft({ tokenId, owner, metadata }) {
  const result = await rpc('mint_confidential_output', { token_id: tokenId, owner, metadata });
  return { transactionId: result.transaction_id || result.tx_id, network: result.network };
}

async function purchaseNft({ tokenId, buyer, seller, amountMyz }) {
  const result = await rpc('transfer_nft', { token_id: tokenId, buyer, seller, amount_myz: amountMyz });
  return { transactionId: result.transaction_id || result.tx_id };
}

module.exports = { rpc, mintNft, purchaseNft };
