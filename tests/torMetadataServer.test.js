'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { TorInstanceRegistry } = require('../services/torInstanceRegistry');
const { createMetadataServer } = require('../tor/metadataServer');

async function withServer(registry, callback) {
  const server = createMetadataServer(registry);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const { port } = server.address();
    await callback(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('serves health and sanitized discovery metadata', async () => {
  const registry = new TorInstanceRegistry({
    enabled: true,
    directHttpsUrl: 'https://gateway.example.invalid',
    instances: [{
      id: 'primary',
      publicUrl: 'http://primaryexampleaddress.onion',
      priority: 10,
      statusFile: '/status/primary.json',
    }],
  }, {
    readFile: () => JSON.stringify({ healthy: true, checkedAt: '2026-08-19T00:00:00Z' }),
    now: () => Date.parse('2026-08-19T00:01:00Z'),
  });

  await withServer(registry, async (baseUrl) => {
    const health = await fetch(`${baseUrl}/healthz`);
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { status: 'ok', torEnabled: true });

    const discovery = await fetch(`${baseUrl}/v1/tor/instances`);
    assert.equal(discovery.headers.get('cache-control'), 'no-store');
    const body = await discovery.json();
    assert.equal(body.selectedInstance, 'primary');
    assert.equal(JSON.stringify(body).includes('statusFile'), false);
  });
});

test('rejects writes and unknown routes', async () => {
  const registry = new TorInstanceRegistry({ enabled: false });
  await withServer(registry, async (baseUrl) => {
    assert.equal((await fetch(`${baseUrl}/healthz`, { method: 'POST' })).status, 405);
    assert.equal((await fetch(`${baseUrl}/missing`)).status, 404);
  });
});
