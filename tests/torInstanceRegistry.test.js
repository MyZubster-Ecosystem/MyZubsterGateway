'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { TorInstanceRegistry } = require('../services/torInstanceRegistry');

const config = {
  enabled: true,
  directHttpsUrl: 'https://gateway.example.invalid',
  instances: [
    {
      id: 'secondary',
      publicUrl: 'http://secondaryexampleaddress.onion',
      region: 'zone-b',
      priority: 20,
      statusFile: '/status/secondary.json',
    },
    {
      id: 'primary',
      publicUrl: 'http://primaryexampleaddress.onion',
      region: 'zone-a',
      priority: 10,
      statusFile: '/status/primary.json',
    },
  ],
};

test('Tor stays disabled by default and keeps direct HTTPS independent', () => {
  const registry = new TorInstanceRegistry({
    directHttpsUrl: 'https://gateway.example.invalid',
  });
  assert.deepEqual(registry.snapshot(), {
    enabled: false,
    selectedInstance: null,
    directHttpsAvailable: true,
    instances: [],
  });
});

test('selects the healthiest instance with the lowest priority', () => {
  const statuses = {
    '/status/primary.json': JSON.stringify({ healthy: false, reason: 'probe-failed' }),
    '/status/secondary.json': JSON.stringify({
      healthy: true,
      checkedAt: '2026-08-19T00:00:00Z',
    }),
  };
  const registry = new TorInstanceRegistry(config, {
    readFile: (path) => statuses[path],
    now: () => Date.parse('2026-08-19T00:01:00Z'),
  });
  const snapshot = registry.snapshot();
  assert.equal(snapshot.selectedInstance, 'secondary');
  assert.equal(snapshot.directHttpsAvailable, true);
  assert.equal(snapshot.instances[0].id, 'primary');
  assert.equal('statusFile' in snapshot.instances[0], false);
});

test('fails closed when health status is unavailable', () => {
  const registry = new TorInstanceRegistry(config, {
    readFile: () => { throw new Error('missing'); },
  });
  const snapshot = registry.snapshot();
  assert.equal(snapshot.selectedInstance, null);
  assert.ok(snapshot.instances.every((instance) => instance.healthy === false));
  assert.ok(snapshot.instances.every((instance) => instance.reason === 'status-unavailable'));
});

test('does not select an instance with stale health status', () => {
  const registry = new TorInstanceRegistry(config, {
    readFile: () => JSON.stringify({ healthy: true, checkedAt: '2026-08-19T00:00:00Z' }),
    now: () => Date.parse('2026-08-19T00:03:00Z'),
  });
  const snapshot = registry.snapshot();
  assert.equal(snapshot.selectedInstance, null);
  assert.ok(snapshot.instances.every((instance) => instance.reason === 'status-stale'));
});

test('rejects secret fields and non-onion discovery URLs', () => {
  assert.throws(() => new TorInstanceRegistry({
    enabled: true,
    instances: [{
      id: 'bad',
      publicUrl: 'https://example.com',
      privateKey: 'must-not-be-here',
    }],
  }), /forbidden secret field/);

  assert.throws(() => new TorInstanceRegistry({
    enabled: true,
    instances: [{ id: 'bad', publicUrl: 'https://example.com' }],
  }), /must be an http:\/\/\*\.onion URL/);
});
