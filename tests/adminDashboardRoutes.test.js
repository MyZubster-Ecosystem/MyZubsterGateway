'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { createAdminDashboardRouter } = require('../routes/adminDashboard');

async function withServer(service, run) {
  const app = express();
  app.use(express.json());
  app.use('/api/admin/dashboard', createAdminDashboardRouter({
    service,
    authenticate: (req, res, next) => req.get('authorization') === 'Bearer test-token'
      ? next()
      : res.status(401).json({ success: false, error: 'Unauthorized' }),
  }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  try {
    await run(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('dashboard endpoints reject missing admin credentials', async () => {
  await withServer({ overview: async () => ({}) }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/admin/dashboard/overview`);
    assert.equal(response.status, 401);
  });
});

test('overview returns service data in a consistent envelope', async () => {
  const expected = { users: { total: 12 } };
  await withServer({ overview: async () => expected }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/admin/dashboard/overview`, {
      headers: { authorization: 'Bearer test-token' },
    });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { success: true, data: expected });
  });
});

test('user updates pass route parameters and body to the service', async () => {
  let received;
  const service = {
    updateUser: async (id, body) => {
      received = { id, body };
      return { id, ...body };
    },
  };
  await withServer(service, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/admin/dashboard/users/507f1f77bcf86cd799439011`, {
      method: 'PATCH',
      headers: { authorization: 'Bearer test-token', 'content-type': 'application/json' },
      body: JSON.stringify({ status: 'suspended' }),
    });
    assert.equal(response.status, 200);
    assert.deepEqual(received, { id: '507f1f77bcf86cd799439011', body: { status: 'suspended' } });
  });
});
