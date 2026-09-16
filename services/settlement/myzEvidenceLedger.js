'use strict';

const crypto = require('node:crypto');

const TYPES = new Set(['CONTRIBUTION', 'MARKETPLACE']);
const SHA256_RE = /^[0-9a-f]{64}$/;

function canonicalize(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`).join(',')}}`;
}

function sha256(value) {
  return crypto.createHash('sha256').update(canonicalize(value), 'utf8').digest('hex');
}

function normalizeMyzAmount(value) {
  const amount = String(value ?? '');
  if (!/^[1-9][0-9]*$/.test(amount)) throw new Error('amountMYZ must be a positive integer string');
  return amount;
}

function createMyzEvidence({ evidenceId, type, sourceRef, amountMYZ, payload, previousHash = null, createdAt = new Date().toISOString() }) {
  if (!evidenceId || typeof evidenceId !== 'string') throw new Error('evidenceId is required');
  if (!TYPES.has(type)) throw new Error('type must be CONTRIBUTION or MARKETPLACE');
  if (!sourceRef || typeof sourceRef !== 'string') throw new Error('sourceRef is required');
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('payload must be an object');
  if (previousHash !== null && !SHA256_RE.test(String(previousHash))) throw new Error('previousHash must be a SHA-256 digest');

  const record = {
    evidenceId: evidenceId.trim(),
    asset: 'MYZ',
    type,
    sourceRef: sourceRef.trim(),
    amountMYZ: normalizeMyzAmount(amountMYZ),
    payloadHash: sha256(payload),
    previousHash,
    createdAt
  };
  return { ...record, evidenceHash: sha256(record), anchor: null, status: 'RECORDED' };
}

function anchorMyzEvidence(record, { network, txId, blockRef = null, anchoredAt = new Date().toISOString() }) {
  if (!record || !SHA256_RE.test(String(record.evidenceHash || ''))) throw new Error('valid evidence record is required');
  if (record.anchor) throw new Error('evidence is already anchored');
  if (!network || !txId) throw new Error('network and txId are required');
  return {
    ...record,
    anchor: { network: String(network), txId: String(txId), blockRef: blockRef === null ? null : String(blockRef), anchoredAt },
    status: 'ANCHORED'
  };
}

function verifyMyzEvidence(record, payload, previousRecord = null) {
  if (!record || !SHA256_RE.test(String(record.evidenceHash || ''))) return false;
  if (sha256(payload) !== record.payloadHash) return false;
  const base = {
    evidenceId: record.evidenceId,
    asset: record.asset,
    type: record.type,
    sourceRef: record.sourceRef,
    amountMYZ: record.amountMYZ,
    payloadHash: record.payloadHash,
    previousHash: record.previousHash,
    createdAt: record.createdAt
  };
  if (sha256(base) !== record.evidenceHash) return false;
  if (record.previousHash !== null) {
    if (!previousRecord || previousRecord.evidenceHash !== record.previousHash) return false;
  }
  return true;
}

function createContributionEvidence(input) {
  return createMyzEvidence({ ...input, type: 'CONTRIBUTION' });
}

function createMarketplaceEvidence(input) {
  return createMyzEvidence({ ...input, type: 'MARKETPLACE' });
}

module.exports = {
  TYPES,
  canonicalize,
  sha256,
  createMyzEvidence,
  createContributionEvidence,
  createMarketplaceEvidence,
  anchorMyzEvidence,
  verifyMyzEvidence
};
