const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');
const express = require('express');

const {
  createJurisdictionCapabilitiesRouter
} = require('../routes/jurisdictionCapabilities');

function request(app, { method = 'GET', path, body }) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, '127.0.0.1', () => {
      const payload = body ? JSON.stringify(body) : null;
      const req = http.request({
        hostname: '127.0.0.1',
        port: server.address().port,
        method,
        path,
        headers: payload ? {
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(payload)
        } : {}
      }, (res) => {
        let responseBody = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { responseBody += chunk; });
        res.on('end', () => {
          server.close(() => resolve({
            status: res.statusCode,
            body: JSON.parse(responseBody)
          }));
        });
      });
      req.on('error', (error) => server.close(() => reject(error)));
      if (payload) req.write(payload);
      req.end();
    });
  });
}

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/jurisdictions', createJurisdictionCapabilitiesRouter({ audit: () => {} }));
  app.use((error, _req, res, _next) => {
    res.status(error.status || 500).json({ error: error.message });
  });
  return app;
}

test('capability discovery exposes an effective subdivision profile', async () => {
  const response = await request(createApp(), {
    path: '/api/jurisdictions/US?subdivision=US-NY'
  });
  assert.equal(response.status, 200);
  assert.equal(response.body.jurisdiction.subdivisionCode, 'US-NY');
  assert.equal(response.body.capabilities.crypto.state, 'RESTRICTED');
  assert.equal(response.body.policyVersion, '2026-08-19.1');
});

test('decision endpoint returns 403 for an unknown regulated jurisdiction', async () => {
  const response = await request(createApp(), {
    method: 'POST',
    path: '/api/jurisdictions/decision',
    body: { countryCode: 'ZZ', capability: 'settlement' }
  });
  assert.equal(response.status, 403);
  assert.equal(response.body.allowed, false);
  assert.equal(response.body.reason, 'missing_regulated_approval');
});
