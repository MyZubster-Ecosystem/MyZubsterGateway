'use strict';

const crypto = require('node:crypto');
const { assertStagenetIntent, submitXmrStagenet, verifyXmrStagenet } = require('./xmrStagenetSettlement');

const SHA256_RE = /^[0-9a-f]{64}$/;

function canonicalize(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`).join(',')}}`;
}

function hashDemoContract(contract) {
  if (!contract || typeof contract !== 'object' || Array.isArray(contract)) throw new TypeError('contract must be an object');
  return crypto.createHash('sha256').update(canonicalize(contract), 'utf8').digest('hex');
}

function assertContractBinding(binding = {}) {
  if (!binding.contractId || typeof binding.contractId !== 'string' || !binding.contractId.trim()) throw new Error('contractId is required');
  const contractHash = String(binding.contractHash || '').toLowerCase();
  if (!SHA256_RE.test(contractHash)) throw new Error('contractHash must be a SHA-256 hex digest');
  const version = Number(binding.contractVersion ?? 1);
  if (!Number.isInteger(version) || version < 1) throw new Error('contractVersion must be a positive integer');
  return { contractId: binding.contractId.trim(), contractHash, contractVersion: version };
}

function createDemoContractSettlementIntent({ contractId, contract, contractVersion = 1, settlementId, recipient, amountAtomic }) {
  const binding = assertContractBinding({ contractId, contractHash: hashDemoContract(contract), contractVersion });
  return assertStagenetIntent({
    settlementId: settlementId || `demo-contract:${binding.contractId}:v${binding.contractVersion}`,
    asset: 'XMR',
    network: 'stagenet',
    recipient,
    amountAtomic,
    purpose: 'demo-contract',
    sourceRef: binding.contractId,
    contractBinding: binding,
    status: 'PENDING'
  });
}

function assertSubmissionBinding(submission, binding) {
  const expected = assertContractBinding(binding);
  const observed = assertContractBinding(submission && submission.contractBinding);
  if (observed.contractId !== expected.contractId || observed.contractHash !== expected.contractHash || observed.contractVersion !== expected.contractVersion) {
    throw new Error('contract binding mismatch');
  }
  return expected;
}

async function submitDemoContractXmr({ intent, submitTransaction, existingSubmission = null }) {
  const binding = assertContractBinding(intent && intent.contractBinding);
  if (existingSubmission) assertSubmissionBinding(existingSubmission, binding);
  const submission = await submitXmrStagenet({ intent, submitTransaction, existingSubmission });
  return { ...submission, purpose: 'demo-contract', sourceRef: binding.contractId, contractBinding: binding };
}

async function verifyDemoContractXmr({ submission, verifyTransaction, minConfirmations = 10 }) {
  const binding = assertContractBinding(submission && submission.contractBinding);
  const result = await verifyXmrStagenet({ submission, verifyTransaction, minConfirmations });
  return { ...result, purpose: 'demo-contract', sourceRef: binding.contractId, contractBinding: binding };
}

function verifyContractDocument(contract, binding) {
  const expected = assertContractBinding(binding);
  return hashDemoContract(contract) === expected.contractHash;
}

module.exports = {
  canonicalize,
  hashDemoContract,
  assertContractBinding,
  createDemoContractSettlementIntent,
  submitDemoContractXmr,
  verifyDemoContractXmr,
  verifyContractDocument
};
