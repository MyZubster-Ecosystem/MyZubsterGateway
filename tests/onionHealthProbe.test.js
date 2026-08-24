'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { buildProbeUrl, probeNode, runOnce } = require('../scripts/onion-health-probe');

test('builds a Tor probe URL from a public onion node', () => {
  assert.equal(
    buildProbeUrl({ publicUrl: 'http://exampleexampleexampleexampleexampleexampleexampleexample.onion', healthPath: '/api/health' }),
    'http://exampleexampleexampleexampleexampleexampleexampleexample.onion/api/health',
  );
});

test('marks a 2xx curl response healthy', () => {
  const result = probeNode(
    { publicUrl: 'http://exampleexampleexampleexampleexampleexampleexampleexample.onion' },
    {
      now: () => Date.parse('2026-08-25T00:00:00Z'),
      spawnSync: (_command, args) => {
        assert.ok(args.includes('--socks5-hostname'));
        assert.ok(args.includes('127.0.0.1:9050'));
        return { status: 0, stdout: '200' };
      },
    },
  );
  assert.equal(result.healthy, true);
  assert.equal(result.statusCode, 200);
  assert.equal(result.reason, null);
});

test('runOnce writes health for every configured node', () => {
  let written = null;
  const snapshot = runOnce({
    config: {
      nodes: [
        { id: 'primary', publicUrl: 'http://aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.onion' },
        { id: 'secondary', publicUrl: 'http://bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.onion' },
      ],
    },
    outputPath: '/tmp/onion-health.json',
    now: () => Date.parse('2026-08-25T00:00:00Z'),
    spawnSync: () => ({ status: 0, stdout: '200' }),
    writeSnapshot: (outputPath, value) => { written = { outputPath, value }; },
  });

  assert.equal(Object.keys(snapshot).length, 2);
  assert.equal(written.outputPath, '/tmp/onion-health.json');
  assert.equal(written.value.primary.healthy, true);
  assert.equal(written.value.secondary.healthy, true);
});
