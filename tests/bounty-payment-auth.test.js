'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { createBountyRouter } = require('../bounty/routes/bounty.routes');

function createMockController() {
  return {
    getBounties: (_req, res) => res.json({ success: true }),
    getBountyStats: (_req, res) => res.json({ success: true }),
    getBounty: (_req, res) => res.json({ success: true }),
    createBounty: (_req, res) => res.json({ success: true }),
    assignBounty: (_req, res) => res.json({ success: true }),
    updateBountyStatus: (_req, res) => res.json({ success: true }),
    addComment: (_req, res) => res.json({ success: true }),

    requestPayment: (_req, res) => {
      res.status(200).json({
        success: true,
        action: 'payment-requested',
      });
    },

    confirmPayment: (_req, res) => {
      res.status(200).json({
        success: true,
        action: 'payment-confirmed',
      });
    },
  };
}

function createTestRouter(user) {
  const authenticate = (req, res, next) => {
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Token non fornito',
      });
    }

    req.user = user;
    next();
  };

  const authorize = (...roles) => (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Utente non autenticato',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Permessi insufficienti',
      });
    }

    next();
  };

  return createBountyRouter({
    authenticate,
    authorize,
    bountyController: createMockController(),
  });
}

/**
 * Minimal Express-style test harness.
 *
 * We execute the router stack directly instead of opening a network port.
 */
async function invoke(router, method, url) {
  const req = {
    method,
    url,
    originalUrl: url,
    path: url,
    params: {},
    query: {},
    headers: {},
  };

  const response = {
    statusCode: 200,
    body: undefined,
    headers: {},
    finished: false,

    status(code) {
      this.statusCode = code;
      return this;
    },

    json(payload) {
      this.body = payload;
      this.finished = true;
      return this;
    },

    send(payload) {
      this.body = payload;
      this.finished = true;
      return this;
    },

    setHeader(name, value) {
      this.headers[name] = value;
    },

    get() {
      return undefined;
    },

    on() {},
  };

  let error;

  await new Promise((resolve) => {
    router.handle(req, response, (err) => {
      error = err;
      resolve();
    });

    // Middleware normally finishes synchronously in these tests.
    if (response.finished) {
      resolve();
    }
  });

  if (error) {
    throw error;
  }

  return response;
}

test('unauthenticated payment request returns 401', async () => {
  const router = createTestRouter(null);

  const response = await invoke(
    router,
    'POST',
    '/bounty-1/payment'
  );

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.success, false);
});

test('non-admin user cannot request payment', async () => {
  const router = createTestRouter({
    id: 'user-1',
    role: 'user',
  });

  const response = await invoke(
    router,
    'POST',
    '/bounty-1/payment'
  );

  assert.equal(response.statusCode, 403);
  assert.equal(response.body.success, false);
});

test('admin user can request payment', async () => {
  const router = createTestRouter({
    id: 'admin-1',
    role: 'admin',
  });

  const response = await invoke(
    router,
    'POST',
    '/bounty-1/payment'
  );

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.action, 'payment-requested');
});

test('non-admin user cannot confirm payment', async () => {
  const router = createTestRouter({
    id: 'user-1',
    role: 'user',
  });

  const response = await invoke(
    router,
    'POST',
    '/bounty-1/payment/confirm'
  );

  assert.equal(response.statusCode, 403);
  assert.equal(response.body.success, false);
});

test('admin user can confirm payment', async () => {
  const router = createTestRouter({
    id: 'admin-1',
    role: 'admin',
  });

  const response = await invoke(
    router,
    'POST',
    '/bounty-1/payment/confirm'
  );

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.action, 'payment-confirmed');
});