'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  hashDemoContract,
  createDemoContractSettlementIntent,
  submitDemoContractXmr,
  verifyDemoContractXmr,
  verifyContractDocument
} = require('../services/settlement/demoContractXmrEvidence');

const RECIPIENT = '5' + 'A'.repeat(94);
const TXID = 'c'.repeat(64);
const contract = { title: 'MyZubster demo contract', terms: { category: 'soundsystem', demo: true }, parties: ['seller', 'buyer'] };

function validVerification() {
  return { verified: true, txId: TXID, asset: 'XMR', network: 'stagenet', recipientMatch: true, amountMatch: true, confirmed: true, confirmations: 10, evidenceMethod: 'authorized-wallet-rpc-proof-fixture' };
}

test('creates deterministic SHA-256 contract hash independent of object key order', () => {
  const reordered = { parties: ['seller', 'buyer'], terms: { demo: true, category: 'soundsystem' }, title: 'MyZubster demo contract' };
  assert.equal(hashDemoContract(contract), hashDemoContract(reordered));
});

test('binds a demo contract version to an XMR stagenet settlement intent', () => {
  const intent = createDemoContractSettlementIntent({ contractId: 'demo-001', contract, recipient: RECIPIENT, amountAtomic: '100000000' });
  assert.equal(intent.purpose, 'demo-contract');
  assert.equal(intent.sourceRef, 'demo-001');
  assert.equal(intent.contractBinding.contractVersion, 1);
  assert.match(intent.contractBinding.contractHash, /^[0-9a-f]{64}$/);
});

test('submission preserves immutable contract binding and rejects mutation on retry', async () => {
  const intent = createDemoContractSettlementIntent({ contractId: 'demo-001', contract, recipient: RECIPIENT, amountAtomic: '100000000' });
  const first = await submitDemoContractXmr({ intent, submitTransaction: async () => ({ txId: TXID }) });
  assert.equal(first.status, 'SUBMITTED');
  const mutated = { ...intent, contractBinding: { ...intent.contractBinding, contractHash: 'a'.repeat(64) } };
  await assert.rejects(() => submitDemoContractXmr({ intent: mutated, existingSubmission: first }), /contract binding mismatch/);
});

test('verified XMR settlement retains contract evidence and reaches PAID only after independent verification', async () => {
  const intent = createDemoContractSettlementIntent({ contractId: 'demo-001', contract, recipient: RECIPIENT, amountAtomic: '100000000' });
  const submission = await submitDemoContractXmr({ intent, submitTransaction: async () => ({ txId: TXID }) });
  const paid = await verifyDemoContractXmr({ submission, verifyTransaction: async () => validVerification() });
  assert.equal(paid.status, 'PAID');
  assert.equal(paid.contractBinding.contractHash, hashDemoContract(contract));
  assert.equal(verifyContractDocument(contract, paid.contractBinding), true);
  assert.equal(verifyContractDocument({ ...contract, title: 'altered' }, paid.contractBinding), false);
});
