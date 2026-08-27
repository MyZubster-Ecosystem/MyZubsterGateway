'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  assertStagenetIntent,
  submitXmrStagenet,
  verifyXmrStagenet
} = require('../services/settlement/xmrStagenetSettlement');

const TXID = 'a'.repeat(64);
const RECIPIENT = 'stagenet-recipient-fixture';

function intent(overrides = {}) {
  return {
    settlementId: 'xmr-stagenet-001',
    asset: 'XMR',
    network: 'stagenet',
    recipient: RECIPIENT,
    amountAtomic: '100000000',
    status: 'PENDING',
    ...overrides
  };
}

function validVerification(overrides = {}) {
  return {
    verified: true,
    txId: TXID,
    asset: 'XMR',
    network: 'stagenet',
    recipientMatch: true,
    amountMatch: true,
    confirmed: true,
    confirmations: 10,
    evidenceMethod: 'authorized-wallet-rpc-proof-fixture',
    ...overrides
  };
}

test('rejects any network other than stagenet', () => {
  assert.throws(() => assertStagenetIntent(intent({ network: 'mainnet' })), /stagenet-only/);
});

test('requires canonical positive integer atomic amount', () => {
  assert.throws(() => assertStagenetIntent(intent({ amountAtomic: '0.1' })), /amountAtomic/);
  assert.throws(() => assertStagenetIntent(intent({ amountAtomic: '0' })), /amountAtomic/);
  assert.equal(assertStagenetIntent(intent()).amountAtomic, '100000000');
});

test('submit response can only become SUBMITTED, never PAID', async () => {
  const submission = await submitXmrStagenet({
    intent: intent(),
    submitTransaction: async () => ({ txId: TXID, status: 'PAID' })
  });
  assert.equal(submission.status, 'SUBMITTED');
  assert.equal(submission.txId, TXID);
});

test('idempotent retry returns the existing submission without submitting twice', async () => {
  let calls = 0;
  const submitTransaction = async () => { calls += 1; return { txId: TXID }; };
  const first = await submitXmrStagenet({ intent: intent(), submitTransaction });
  const second = await submitXmrStagenet({ intent: intent(), submitTransaction, existingSubmission: first });
  assert.equal(calls, 1);
  assert.deepEqual(second, first);
});

test('independent verifier is required', async () => {
  const submission = await submitXmrStagenet({ intent: intent(), submitTransaction: async () => ({ txId: TXID }) });
  await assert.rejects(() => verifyXmrStagenet({ submission }), /verifyTransaction is required/);
});

test('verifier timeout/failure fails closed to UNSETTLED', async () => {
  const submission = await submitXmrStagenet({ intent: intent(), submitTransaction: async () => ({ txId: TXID }) });
  const result = await verifyXmrStagenet({
    submission,
    verifyTransaction: async () => { throw new Error('timeout'); }
  });
  assert.equal(result.status, 'UNSETTLED');
  assert.equal(result.verificationError, 'verifier_unavailable');
});

test('wrong amount or recipient evidence never reaches PAID', async () => {
  const submission = await submitXmrStagenet({ intent: intent(), submitTransaction: async () => ({ txId: TXID }) });
  const wrongAmount = await verifyXmrStagenet({ submission, verifyTransaction: async () => validVerification({ amountMatch: false }) });
  const wrongRecipient = await verifyXmrStagenet({ submission, verifyTransaction: async () => validVerification({ recipientMatch: false }) });
  assert.equal(wrongAmount.status, 'UNSETTLED');
  assert.equal(wrongRecipient.status, 'UNSETTLED');
});

test('wrong network, wrong txid and insufficient confirmations never reach PAID', async () => {
  const submission = await submitXmrStagenet({ intent: intent(), submitTransaction: async () => ({ txId: TXID }) });
  const wrongNetwork = await verifyXmrStagenet({ submission, verifyTransaction: async () => validVerification({ network: 'mainnet' }) });
  const wrongTx = await verifyXmrStagenet({ submission, verifyTransaction: async () => validVerification({ txId: 'b'.repeat(64) }) });
  const unconfirmed = await verifyXmrStagenet({ submission, verifyTransaction: async () => validVerification({ confirmations: 9 }) });
  assert.equal(wrongNetwork.status, 'UNSETTLED');
  assert.equal(wrongTx.status, 'UNSETTLED');
  assert.equal(unconfirmed.status, 'UNSETTLED');
});

test('only a complete independent verification reaches PAID', async () => {
  const submission = await submitXmrStagenet({ intent: intent(), submitTransaction: async () => ({ txId: TXID }) });
  const result = await verifyXmrStagenet({ submission, verifyTransaction: async () => validVerification() });
  assert.equal(result.status, 'PAID');
  assert.equal(result.verification.confirmations, 10);
  assert.equal(result.verification.evidenceMethod, 'authorized-wallet-rpc-proof-fixture');
});
