'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  AdminDashboardService,
  clamp,
  publicUser,
  serializePayment,
} = require('../services/adminDashboardService');

test('clamp bounds pagination input', () => {
  assert.equal(clamp('0', 1, 100, 25), 1);
  assert.equal(clamp('500', 1, 100, 25), 100);
  assert.equal(clamp('bad', 1, 100, 25), 25);
});

test('publicUser never returns credentials', () => {
  const result = publicUser({ _id: 7, email: 'admin@example.test', passwordHash: 'secret', role: 'admin' });
  assert.deepEqual(result, {
    id: '7', name: '', email: 'admin@example.test', role: 'admin', status: 'active', createdAt: null, lastLoginAt: null,
  });
  assert.equal('passwordHash' in result, false);
});

test('serializePayment normalizes chain transaction fields', () => {
  assert.deepEqual(serializePayment({ _id: 'p1', amountPaid: '0.06', txid: 'abc', status: 'confirmed' }), {
    id: 'p1', amount: 0.06, currency: 'XMR', status: 'confirmed', txHash: 'abc', createdAt: null, updatedAt: null,
  });
});

test('report uses a bounded time window and aggregation', async () => {
  let receivedPipeline;
  const database = {
    collection() {
      return { aggregate(pipeline) { receivedPipeline = pipeline; return { toArray: async () => [{ count: 2 }] }; } };
    },
  };
  const now = new Date('2026-08-13T00:00:00.000Z');
  const service = new AdminDashboardService(database, { now: () => now });
  const result = await service.report(5000);
  assert.equal(result.days, 365);
  assert.equal(receivedPipeline[0].$match.createdAt.$gte.toISOString(), '2025-08-13T00:00:00.000Z');
  assert.deepEqual(result.payments, [{ count: 2 }]);
});

test('updateUser validates role before touching the database', async () => {
  const service = new AdminDashboardService({ collection() { throw new Error('should not run'); } });
  await assert.rejects(() => service.updateUser('1', { role: 'owner' }), /Unsupported user role/);
});
