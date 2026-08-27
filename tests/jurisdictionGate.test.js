'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');

const jurisdictionGate = require('../middleware/jurisdictionGate');
const { isCapabilityAllowed } = require('../services/jurisdiction.service');
const { Jurisdiction, Capability } = require('../services/jurisdiction.constants');
const tariRouter = require('../routes/tari');

async function withServer(configure, run) {
  const app = express();
  app.use(express.json());
  if (configure) configure(app);
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  try {
    await run(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

async function withJurisdictionEnv(value, run) {
  const previous = process.env.MYZUBSTER_JURISDICTION;
  if (value === undefined) delete process.env.MYZUBSTER_JURISDICTION;
  else process.env.MYZUBSTER_JURISDICTION = value;
  try {
    await run();
  } finally {
    if (previous === undefined) delete process.env.MYZUBSTER_JURISDICTION;
    else process.env.MYZUBSTER_JURISDICTION = previous;
  }
}

async function assertTariLockDenied(baseUrl, requestOptions = {}) {
  const response = await fetch(`${baseUrl}/api/tari/lock${requestOptions.query || ''}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(requestOptions.headers || {}),
    },
    body: JSON.stringify({ amount: 1, ...(requestOptions.body || {}) }),
  });
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), {
    error: {
      code: 'JURISDICTION_POLICY_DENIED',
      message: 'Operation unavailable in this jurisdiction',
    },
  });
}

test('policy matrix explicitly denies Mainland China restricted capabilities', () => {
  for (const capability of Object.values(Capability)) {
    assert.equal(isCapabilityAllowed(Jurisdiction.CN_MAINLAND, capability), false);
  }
});

test('policy matrix keeps GLOBAL and HK explicitly allowed', () => {
  for (const jurisdiction of [Jurisdiction.GLOBAL, Jurisdiction.HK]) {
    for (const capability of Object.values(Capability)) {
      assert.equal(isCapabilityAllowed(jurisdiction, capability), true);
    }
  }
});

test('unknown or missing trusted jurisdiction fails closed', async () => {
  assert.equal(isCapabilityAllowed(undefined, Capability.WALLET_TRANSFER), false);
  assert.equal(isCapabilityAllowed('UNKNOWN', Capability.WALLET_TRANSFER), false);

  await withJurisdictionEnv(undefined, async () => {
    await withServer((app) => {
      app.post('/protected', jurisdictionGate(Capability.WALLET_TRANSFER), (req, res) => res.json({ ok: true }));
    }, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/protected?jurisdiction=GLOBAL`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-jurisdiction': 'GLOBAL' },
        body: JSON.stringify({ jurisdiction: 'GLOBAL' }),
      });
      assert.equal(response.status, 403);
    });
  });
});

test('trusted GLOBAL server configuration permits an allowed capability', async () => {
  await withJurisdictionEnv(Jurisdiction.GLOBAL, async () => {
    await withServer((app) => {
      app.post('/protected', jurisdictionGate(Capability.WALLET_TRANSFER), (req, res) => {
        res.json({ ok: true, jurisdiction: req.jurisdiction });
      });
    }, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/protected`, { method: 'POST' });
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), { ok: true, jurisdiction: Jurisdiction.GLOBAL });
    });
  });
});

test('route gate ignores spoofed x-jurisdiction header under CN_MAINLAND', async () => {
  await withJurisdictionEnv(Jurisdiction.CN_MAINLAND, async () => {
    await withServer((app) => app.use('/api/tari', tariRouter), async (baseUrl) => {
      await assertTariLockDenied(baseUrl, { headers: { 'x-jurisdiction': Jurisdiction.GLOBAL } });
    });
  });
});

test('route gate ignores spoofed body jurisdiction under CN_MAINLAND', async () => {
  await withJurisdictionEnv(Jurisdiction.CN_MAINLAND, async () => {
    await withServer((app) => app.use('/api/tari', tariRouter), async (baseUrl) => {
      await assertTariLockDenied(baseUrl, { body: { jurisdiction: Jurisdiction.GLOBAL } });
    });
  });
});

test('route gate ignores spoofed query jurisdiction under CN_MAINLAND', async () => {
  await withJurisdictionEnv(Jurisdiction.CN_MAINLAND, async () => {
    await withServer((app) => app.use('/api/tari', tariRouter), async (baseUrl) => {
      await assertTariLockDenied(baseUrl, { query: `?jurisdiction=${Jurisdiction.GLOBAL}` });
    });
  });
});

test('verified request context takes precedence over permissive server default', async () => {
  await withJurisdictionEnv(Jurisdiction.GLOBAL, async () => {
    await withServer((app) => {
      app.use((req, res, next) => {
        req.verifiedJurisdiction = Jurisdiction.CN_MAINLAND;
        next();
      });
      app.use('/api/tari', tariRouter);
    }, async (baseUrl) => {
      await assertTariLockDenied(baseUrl, {
        headers: { 'x-jurisdiction': Jurisdiction.GLOBAL },
        body: { jurisdiction: Jurisdiction.GLOBAL },
        query: `?jurisdiction=${Jurisdiction.GLOBAL}`,
      });
    });
  });
});
