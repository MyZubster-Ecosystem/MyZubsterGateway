'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const DEFAULT_CONFIG = path.join(__dirname, '..', 'config', 'onion-nodes.json');
const DEFAULT_OUTPUT = '/health/onion-health.json';
const DEFAULT_SOCKS_PROXY = '127.0.0.1:9050';
const DEFAULT_INTERVAL_MS = 30000;

function buildProbeUrl(node) {
  const base = new URL(node.publicUrl);
  const healthPath = typeof node.healthPath === 'string' && node.healthPath.startsWith('/')
    ? node.healthPath
    : '/';
  return new URL(healthPath, `${base.toString().replace(/\/$/, '')}/`).toString();
}

function probeNode(node, options = {}) {
  const socksProxy = options.socksProxy || DEFAULT_SOCKS_PROXY;
  const timeoutSeconds = Number(options.timeoutSeconds || 45);
  const url = buildProbeUrl(node);
  const result = (options.spawnSync || spawnSync)('curl', [
    '--silent',
    '--show-error',
    '--output', '/dev/null',
    '--write-out', '%{http_code}',
    '--socks5-hostname', socksProxy,
    '--connect-timeout', '15',
    '--max-time', String(timeoutSeconds),
    url,
  ], { encoding: 'utf8' });

  const checkedAt = new Date((options.now || Date.now)()).toISOString();
  const statusCode = Number(String(result.stdout || '').trim());
  const healthy = result.status === 0 && statusCode >= 200 && statusCode < 400;

  return {
    healthy,
    checkedAt,
    statusCode: Number.isFinite(statusCode) && statusCode > 0 ? statusCode : null,
    reason: healthy
      ? null
      : result.status !== 0
        ? `curl-exit-${result.status == null ? 'unknown' : result.status}`
        : `http-status-${statusCode || 'unknown'}`,
  };
}

function writeSnapshot(outputPath, snapshot) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const temporary = `${outputPath}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(snapshot, null, 2)}\n`, { mode: 0o644 });
  fs.renameSync(temporary, outputPath);
}

function runOnce(options = {}) {
  const configPath = options.configPath || process.env.ONION_DISCOVERY_CONFIG || DEFAULT_CONFIG;
  const outputPath = options.outputPath || process.env.ONION_DISCOVERY_HEALTH_FILE || DEFAULT_OUTPUT;
  const socksProxy = options.socksProxy || process.env.ONION_DISCOVERY_SOCKS_PROXY || DEFAULT_SOCKS_PROXY;
  const config = options.config || JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const snapshot = {};

  for (const node of config.nodes || []) {
    snapshot[node.id] = probeNode(node, {
      socksProxy,
      timeoutSeconds: process.env.ONION_DISCOVERY_PROBE_TIMEOUT_SECONDS || 45,
      spawnSync: options.spawnSync,
      now: options.now,
    });
  }

  (options.writeSnapshot || writeSnapshot)(outputPath, snapshot);
  return snapshot;
}

async function watch() {
  const intervalMs = Number(process.env.ONION_DISCOVERY_PROBE_INTERVAL_MS || DEFAULT_INTERVAL_MS);
  for (;;) {
    try {
      const snapshot = runOnce();
      const healthy = Object.entries(snapshot).filter(([, value]) => value.healthy).map(([id]) => id);
      console.log(`[OnionProbe] healthy=${healthy.join(',') || 'none'}`);
    } catch (error) {
      console.error(`[OnionProbe] ${error.message}`);
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

if (require.main === module) {
  if (process.argv.includes('--watch')) {
    watch().catch((error) => {
      console.error(error);
      process.exit(1);
    });
  } else {
    runOnce();
  }
}

module.exports = { buildProbeUrl, probeNode, runOnce, writeSnapshot };
