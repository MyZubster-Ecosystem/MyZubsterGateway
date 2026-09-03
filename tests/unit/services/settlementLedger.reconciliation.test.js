const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const BountySettlement = require('../../../models/BountySettlement');
const { createSettlement, transitionStatus, submitTransaction, verifyTransaction, confirmTransaction, markPaid, reconcile } = require('../../../services/settlementLedger');

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  await BountySettlement.deleteMany({});
});

test('reconciliation smoke run covers all branches', async () => {
  const a = await createSettlement({
    bountyId: 'SMOKE-A', contributor: 'alice', asset: 'MYZ-TEST', amount: 50, network: 'testnet', destination: 'destA', simulation: true
  });
  await transitionStatus(a, 'ACCEPTED', 'system');
  await submitTransaction(a, 'tx_a', 'system');
  await verifyTransaction(a, 'system');
  await confirmTransaction(a, 'system');
  await markPaid(a, 'system');

  const b = await createSettlement({
    bountyId: 'SMOKE-B', contributor: 'bob', asset: 'MYZ-TEST', amount: 75, network: 'testnet', destination: 'destB', simulation: true
  });
  await transitionStatus(b, 'FAILED', 'system', 'submission failed');

  const c = await createSettlement({
    bountyId: 'SMOKE-C', contributor: 'carol', asset: 'MYZ-TEST', amount: 25, network: 'testnet', destination: 'destC', simulation: true
  });
  await transitionStatus(c, 'UNSETTLED', 'system', 'awaiting review');

  const d = await createSettlement({
    bountyId: 'SMOKE-D', contributor: 'dave', asset: 'MYZ-TEST', amount: 40, network: 'testnet', destination: 'destD', simulation: true
  });
  await transitionStatus(d, 'ACCEPTED', 'system');
  await submitTransaction(d, 'tx_d', 'system');
  await verifyTransaction(d, 'system');
  await confirmTransaction(d, 'system');
  await transitionStatus(d, 'DISPUTED', 'system', 'dispute opened');

  const report = await reconcile();
  console.log(JSON.stringify(report, null, 2));
  expect(report.totals.length).toBeGreaterThanOrEqual(4);
  expect(report.needsReviewCount).toBeGreaterThanOrEqual(3);
});
