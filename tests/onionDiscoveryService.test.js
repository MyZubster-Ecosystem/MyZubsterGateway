'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { OnionDiscoveryService } = require('../services/onionDiscoveryService');

const config = {
  nodes: [
    { id: 'primary', publicUrl: 'http://aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.onion', priority: 10 },
    { id: 'secondary', publicUrl: 'http://bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.onion', priority: 20 },
  ],
};

test('selects the highest-priority healthy node', () => {
  const now = Date.parse('2026-08-25T00:00:00Z');
  const health = JSON.stringify({
    primary: { healthy: false, checkedAt: '2026-08-24T23:59:30Z', reason: 'down' },
    secondary: { healthy: true, checkedAt: '2026-08-24T23:59:40Z' },
  });
  const service = new OnionDiscoveryService({
    config,
    healthFile: '/health.json',
    readFile: () => health,
    now: () => now,
    maxStatusAgeMs: 120000,
  });
  const snapshot = service.snapshot();
  assert.equal(snapshot.selectedNode, 'secondary');
  assert.equal(snapshot.nodes[0].healthy, false);
  assert.equal(snapshot.nodes[1].healthy, true);
});

test('fails closed when health is missing or stale', () => {
  const now = Date.parse('2026-08-25T00:05:00Z');
  const health = JSON.stringify({
    primary: { healthy: true, checkedAt: '2026-08-24T23:00:00Z' },
  });
  const service = new OnionDiscoveryService({
    config,
    healthFile: '/health.json',
    readFile: () => health,
    now: () => now,
    maxStatusAgeMs: 120000,
  });
  const snapshot = service.snapshot();
  assert.equal(snapshot.selectedNode, null);
  assert.equal(snapshot.nodes[0].reason, 'status-stale');
  assert.equal(snapshot.nodes[1].reason, 'status-unavailable');
});
