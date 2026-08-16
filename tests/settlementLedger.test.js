const test = require('node:test');
const assert = require('node:assert/strict');
const { SettlementLedger } = require('../services/settlement/settlementLedger');

test('happy path reaches PAID only after independent verification', async () => {
  const ledger = new SettlementLedger({ verifyTransaction: async ({ txId }) => ({ verified: txId === 'tx-1' }) });
  ledger.create({ bountyId: '402', issueNumber: 404, contributor: 'alice', amount: 250, asset: 'MYZ', network: 'tari', destination: 'addr', mode: 'real' });
  ledger.accept('402', 'reviewer');
  ledger.submit('402', 'tx-1');
  const result = await ledger.confirm('402');
  assert.equal(result.status, 'PAID');
  assert.equal(result.txId, 'tx-1');
  assert.equal(result.audit.at(-1).status, 'PAID');
});

test('unverified transaction becomes UNSETTLED, never PAID', async () => {
  const ledger = new SettlementLedger({ verifyTransaction: async () => ({ verified: false }) });
  ledger.create({ bountyId: '403', contributor: 'bob', amount: 250, asset: 'MYZ', network: 'tari', destination: 'addr' });
  ledger.accept('403', 'reviewer');
  ledger.submit('403', 'unknown-tx');
  const result = await ledger.confirm('403');
  assert.equal(result.status, 'UNSETTLED');
});

test('simulation cannot be submitted as a real payment', () => {
  const ledger = new SettlementLedger({ verifyTransaction: async () => ({ verified: true }) });
  ledger.create({ bountyId: '404', contributor: 'carol', amount: 250, asset: 'MYZ', network: 'tari', destination: 'addr', mode: 'simulation' });
  ledger.accept('404', 'reviewer');
  assert.throws(() => ledger.submit('404', 'simulated-tx'), /simulation/);
});

test('duplicate bounty creation is idempotent', () => {
  const ledger = new SettlementLedger({ verifyTransaction: async () => ({ verified: true }) });
  const a = ledger.create({ bountyId: '405', contributor: 'dave', amount: 250, asset: 'MYZ', network: 'tari', destination: 'addr' });
  const b = ledger.create({ bountyId: '405', contributor: 'dave', amount: 250, asset: 'MYZ', network: 'tari', destination: 'addr' });
  assert.equal(a.id, b.id);
  assert.equal(ledger.list().length, 1);
});

test('cannot reach PAID without a transaction id', async () => {
  const ledger = new SettlementLedger({ verifyTransaction: async () => ({ verified: true }) });
  ledger.create({ bountyId: '406', contributor: 'erin', amount: 250, asset: 'MYZ', network: 'tari', destination: 'addr' });
  ledger.accept('406', 'reviewer');
  await assert.rejects(() => ledger.confirm('406'), /SUBMITTED/);
});

test('historical reconciliation requires verified evidence and matching network', () => {
  const ledger = new SettlementLedger({ verifyTransaction: async () => ({ verified: true }) });
  ledger.create({ bountyId: '407', contributor: 'frank', amount: 250, asset: 'MYZ', network: 'tari', destination: 'addr' });
  assert.equal(ledger.reconcile('407', { verified: true, txId: 'tx-x', network: 'wrong-network' }).status, 'UNSETTLED');
  assert.equal(ledger.reconcile('407', { verified: true, txId: 'tx-7', network: 'tari' }).status, 'PAID');
});
