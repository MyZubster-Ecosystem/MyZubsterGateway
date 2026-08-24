'use strict';

const fs = require('fs');
const path = require('path');

const DEFAULT_CONFIG_PATH = path.join(__dirname, '..', 'config', 'onion-nodes.json');
const DEFAULT_MAX_STATUS_AGE_MS = 120000;

function validateNode(node, index) {
  if (!node || typeof node !== 'object' || Array.isArray(node)) {
    throw new Error(`Onion node at index ${index} must be an object`);
  }
  if (!/^[a-z0-9][a-z0-9-]{0,62}$/.test(node.id || '')) {
    throw new Error(`Onion node at index ${index} has an invalid id`);
  }

  let url;
  try {
    url = new URL(node.publicUrl);
  } catch {
    throw new Error(`Onion node ${node.id} has an invalid publicUrl`);
  }
  if (url.protocol !== 'http:' || !url.hostname.endsWith('.onion')) {
    throw new Error(`Onion node ${node.id} publicUrl must be an http://*.onion URL`);
  }

  return {
    id: node.id,
    publicUrl: url.toString().replace(/\/$/, ''),
    region: String(node.region || 'unspecified'),
    priority: Number.isInteger(node.priority) && node.priority >= 0 ? node.priority : 100,
  };
}

function loadHealthFile(healthFile, readFile = fs.readFileSync) {
  if (!healthFile) return {};
  try {
    const parsed = JSON.parse(readFile(healthFile, 'utf8'));
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function evaluateHealth(record, nowMs, maxStatusAgeMs) {
  if (!record || typeof record !== 'object') {
    return { healthy: false, checkedAt: null, reason: 'status-unavailable' };
  }
  const checkedAt = typeof record.checkedAt === 'string' ? record.checkedAt : null;
  const checkedAtMs = checkedAt ? Date.parse(checkedAt) : Number.NaN;
  if (!Number.isFinite(checkedAtMs) || nowMs - checkedAtMs > maxStatusAgeMs) {
    return { healthy: false, checkedAt, reason: 'status-stale' };
  }
  const healthy = record.healthy === true;
  return {
    healthy,
    checkedAt,
    reason: healthy ? null : String(record.reason || 'health-check-failed'),
  };
}

class OnionDiscoveryService {
  constructor(options = {}) {
    const configPath = options.configPath || process.env.ONION_DISCOVERY_CONFIG || DEFAULT_CONFIG_PATH;
    const config = options.config || JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (!Array.isArray(config.nodes) || config.nodes.length === 0) {
      throw new Error('Onion discovery requires at least one node');
    }
    this.nodes = config.nodes.map(validateNode);
    this.healthFile = options.healthFile || process.env.ONION_DISCOVERY_HEALTH_FILE || null;
    this.readFile = options.readFile || fs.readFileSync;
    this.now = options.now || Date.now;
    this.maxStatusAgeMs = Number.isFinite(options.maxStatusAgeMs)
      ? options.maxStatusAgeMs
      : Number(process.env.ONION_DISCOVERY_MAX_STATUS_AGE_MS || DEFAULT_MAX_STATUS_AGE_MS);
  }

  snapshot() {
    const nowMs = this.now();
    const health = loadHealthFile(this.healthFile, this.readFile);
    const nodes = this.nodes
      .map((node) => ({
        ...node,
        ...evaluateHealth(health[node.id], nowMs, this.maxStatusAgeMs),
      }))
      .sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id));

    const selected = nodes.find((node) => node.healthy) || null;
    return {
      transport: 'onion',
      multiHost: true,
      selectionMode: 'priority-health-fail-closed',
      selectedNode: selected ? selected.id : null,
      nodes,
      generatedAt: new Date(nowMs).toISOString(),
    };
  }
}

module.exports = { OnionDiscoveryService, evaluateHealth, validateNode };
