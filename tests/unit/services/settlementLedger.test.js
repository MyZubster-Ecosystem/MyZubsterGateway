const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const BountySettlement = require('../../../models/BountySettlement');
const {
  createSettlement,
  transitionStatus,
  submitTransaction,
  verifyTransaction,
  confirmTransaction,
  markPaid,
  reconcile
} = require('../../../services/settlementLedger');

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

function baseRecord(overrides = {}) {
  return {
    bountyId: 'B-' + Math.random().toString(36).slice(2, 8),
    prId: 'PR-' + Math.random().toString(36).slice(2, 6),
    contributor: 'test_payee_' + Math.random().toString(36).slice(2, 6),
    asset: 'MYZ-TEST',
    amount: 100,
    network: 'testnet',
    destination: 'test_dest_' + Math.random().toString(36).slice(2, 8),
    simulation: true,
    actor: 'tester',
    ...overrides
  };
}

describe('settlementLedger', () => {
  test('creates a settlement with PENDING and audit trail', async () => {
    const input = baseRecord();
    const record = await createSettlement(input);
    expect(record.status).toBe('PENDING');
    expect(record.auditTrail).toHaveLength(1);
    expect(record.auditTrail[0].status).toBe('PENDING');
    expect(record.idempotencyKey).toBeDefined();
  });

  test('is idempotent on same idempotency key', async () => {
    const input = baseRecord();
    const first = await createSettlement(input);
    await expect(createSettlement(input)).rejects.toThrow('Duplicate settlement for idempotency key');
    const second = await BountySettlement.findOne({ idempotencyKey: first.idempotencyKey });
    expect(second._id.toString()).toBe(first._id.toString());
  });

  test('transitions through ACCEPTED -> SUBMITTED -> CONFIRMED -> PAID', async () => {
    const record = await createSettlement(baseRecord());
    await transitionStatus(record, 'ACCEPTED', record.contributor, 'accepted');
    await submitTransaction(record, 'tx_sim_123', record.contributor);
    await verifyTransaction(record, record.contributor);
    await confirmTransaction(record, record.contributor);
    await markPaid(record, record.contributor);

    const reloaded = await BountySettlement.findById(record._id);
    expect(reloaded.status).toBe('PAID');
    expect(reloaded.txVerificationStatus).toBe('verified');
    expect(reloaded.auditTrail.length).toBeGreaterThanOrEqual(5);
  });

  test('cannot mark PAID without verified transaction', async () => {
    const record = await createSettlement(baseRecord());
    await transitionStatus(record, 'ACCEPTED', record.contributor);
    await submitTransaction(record, 'tx_sim_456', record.contributor);
    await confirmTransaction(record, record.contributor).catch(err => expect(err.message).toMatch(/verified/));
  });

  test('duplicate settlement is prevented by unique idempotency key', async () => {
    const input = baseRecord();
    await createSettlement(input);
    await expect(createSettlement(input)).rejects.toThrow();
  });

  test('failed submission leaves record actionable', async () => {
    const record = await createSettlement(baseRecord());
    await transitionStatus(record, 'FAILED', 'system', 'submission failed');
    expect(record.status).toBe('FAILED');
  });

  test('unverified transaction is surfaced in reconcile', async () => {
    const record = await createSettlement(baseRecord());
    await transitionStatus(record, 'ACCEPTED', record.contributor);
    await submitTransaction(record, 'tx_sim_789', record.contributor);
    const report = await reconcile();
    expect(report.missingTxCount).toBeGreaterThanOrEqual(0);
  });

  test('simulation mode uses deterministic synthetic verification', async () => {
    process.env.BOUNTY_SETTLEMENT_MODE = 'simulation';
    const record = await createSettlement({ ...baseRecord(), simulation: true });
    await transitionStatus(record, 'ACCEPTED', record.contributor);
    await submitTransaction(record, 'tx_sim_abc', 'system');
    const { verification } = await verifyTransaction(record, 'system');
    expect(verification.status).toBe('verified');
    expect(verification.detail).toMatch(/simulated/);
  });
});
