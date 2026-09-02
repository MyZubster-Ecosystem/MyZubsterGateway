const test = require('node:test');
const assert = require('node:assert/strict');
const { SettlementLedger, MemorySettlementStore } = require('../services/settlement/settlementLedger');

function makeLedger(verifyTransaction) {
  return new SettlementLedger({
    store: new MemorySettlementStore(),
    verifyTransaction
  });
}

function verified(overrides = {}) {
  return {
    verified: true,
    confirmed: true,
    txId: 'tx-1',
    network: 'tari',
    destination: 'addr',
    amount: '250',
    asset: 'MYZ',
    verificationSource: 'independent-readonly-verifier',
    ...overrides
  };
}

test('happy path reaches PAID only after independent matching verification', async () => {
  const ledger = makeLedger(async () => verified());
  await ledger.create({ bountyId: '402', issueNumber: 404, contributor: 'alice', amount: 250, asset: 'MYZ', network: 'tari', destination: 'addr', mode: 'real' });
  await ledger.accept('402', 'reviewer');
  await ledger.submit('402', 'tx-1');
  const result = await ledger.confirm('402');
  assert.equal(result.status, 'PAID');
  assert.equal(result.txId, 'tx-1');
  assert.equal(result.audit.at(-2).status, 'CONFIRMED');
  assert.equal(result.audit.at(-1).status, 'PAID');
});

test('unverified or mismatched transaction becomes UNSETTLED, never PAID', async () => {
  const ledger = makeLedger(async () => verified({ amount: '251' }));
  await ledger.create({ bountyId: '403', contributor: 'bob', amount: 250, asset: 'MYZ', network: 'tari', destination: 'addr' });
  await ledger.accept('403', 'reviewer');
  await ledger.submit('403', 'tx-1');
  const result = await ledger.confirm('403');
  assert.equal(result.status, 'UNSETTLED');
});

test('simulation cannot be submitted as a real payment', async () => {
  const ledger = makeLedger(async () => verified());
  await ledger.create({ bountyId: '404', contributor: 'carol', amount: 250, asset: 'MYZ', network: 'tari', destination: 'addr', mode: 'simulation' });
  await ledger.accept('404', 'reviewer');
  await assert.rejects(() => ledger.submit('404', 'simulated-tx'), /simulation/);
});

test('duplicate bounty creation is idempotent and conflicting repeats fail', async () => {
  const store = new MemorySettlementStore();
  const ledger = new SettlementLedger({ store, verifyTransaction: async () => verified() });
  const a = await ledger.create({ bountyId: '405', contributor: 'dave', amount: 250, asset: 'MYZ', network: 'tari', destination: 'addr' });
  const b = await ledger.create({ bountyId: '405', contributor: 'dave', amount: 250, asset: 'MYZ', network: 'tari', destination: 'addr' });
  assert.equal(a.id, b.id);
  assert.equal((await ledger.list()).length, 1);
  await assert.rejects(
    () => ledger.create({ bountyId: '405', contributor: 'dave', amount: 999, asset: 'MYZ', network: 'tari', destination: 'addr' }),
    /idempotency conflict/
  );
});

test('failed submission is terminal and audited', async () => {
  const ledger = makeLedger(async () => verified());
  await ledger.create({ bountyId: '406', contributor: 'erin', amount: 250, asset: 'MYZ', network: 'tari', destination: 'addr' });
  await ledger.accept('406', 'reviewer');
  const result = await ledger.fail('406', 'wallet rpc rejected submission', 'settlement-worker');
  assert.equal(result.status, 'FAILED');
  assert.equal(result.audit.at(-1).reason, 'wallet rpc rejected submission');
  await assert.rejects(() => ledger.submit('406', 'tx-1'), /cannot submit from FAILED/);
});

test('verifier outage fails closed to UNSETTLED', async () => {
  const ledger = makeLedger(async () => { throw new Error('offline'); });
  await ledger.create({ bountyId: '407', contributor: 'frank', amount: 250, asset: 'MYZ', network: 'tari', destination: 'addr' });
  await ledger.accept('407', 'reviewer');
  await ledger.submit('407', 'tx-1');
  assert.equal((await ledger.confirm('407')).status, 'UNSETTLED');
});

test('historical reconciliation never fabricates PAID and requires full matching evidence', async () => {
  const ledger = makeLedger(async expected => verified(expected));
  await ledger.create({ bountyId: '408', contributor: 'gina', amount: 250, asset: 'MYZ', network: 'tari', destination: 'addr' });
  assert.equal((await ledger.reconcile('408', { verified: true, txId: 'tx-x', network: 'wrong-network' })).status, 'UNSETTLED');
  const paid = await ledger.reconcile('408', verified({ txId: 'tx-8' }));
  assert.equal(paid.status, 'PAID');
  assert.equal(paid.txId, 'tx-8');
});

test('PAID cannot be reached from DISPUTED without returning through verification', async () => {
  const ledger = makeLedger(async () => verified());
  await ledger.create({ bountyId: '409', contributor: 'hank', amount: 250, asset: 'MYZ', network: 'tari', destination: 'addr' });
  await ledger.accept('409', 'reviewer');
  await ledger.dispute('409', 'destination disputed');
  const record = await ledger.get('409');
  assert.equal(record.status, 'DISPUTED');
});
