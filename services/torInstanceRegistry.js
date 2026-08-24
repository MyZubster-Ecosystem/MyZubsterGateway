'use strict';

const fs = require('fs');

const SECRET_KEYS = new Set([
  'privateKey',
  'secretKey',
  'clientAuth',
  'controlPassword',
  'cookie',
]);

function assertPublicOnionUrl(value, id) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`Tor instance ${id} has an invalid publicUrl`);
  }
  if (url.protocol !== 'http:' || !url.hostname.endsWith('.onion')) {
    throw new Error(`Tor instance ${id} publicUrl must be an http://*.onion URL`);
  }
  return url.toString().replace(/\/$/, '');
}

function normalizeInstance(instance, index) {
  if (!instance || typeof instance !== 'object' || Array.isArray(instance)) {
    throw new Error(`Tor instance at index ${index} must be an object`);
  }
  for (const key of Object.keys(instance)) {
    if (SECRET_KEYS.has(key)) {
      throw new Error(`Tor instance ${instance.id || index} includes forbidden secret field ${key}`);
    }
  }
  if (!/^[a-z0-9][a-z0-9-]{0,62}$/.test(instance.id || '')) {
    throw new Error(`Tor instance at index ${index} has an invalid id`);
  }

  return {
    id: instance.id,
    publicUrl: assertPublicOnionUrl(instance.publicUrl, instance.id),
    region: String(instance.region || 'unspecified'),
    priority: Number.isInteger(instance.priority) && instance.priority >= 0
      ? instance.priority
      : 100,
    statusFile: instance.statusFile ? String(instance.statusFile) : null,
  };
}

function readStatus(instance, readFile = fs.readFileSync, now = Date.now, maxStatusAgeMs = 120000) {
  if (!instance.statusFile) {
    return { healthy: false, checkedAt: null, reason: 'status-unavailable' };
  }
  try {
    const status = JSON.parse(readFile(instance.statusFile, 'utf8'));
    const checkedAt = typeof status.checkedAt === 'string' ? status.checkedAt : null;
    const checkedAtMs = checkedAt ? Date.parse(checkedAt) : Number.NaN;
    if (!Number.isFinite(checkedAtMs) || now() - checkedAtMs > maxStatusAgeMs) {
      return { healthy: false, checkedAt, reason: 'status-stale' };
    }
    const healthy = status.healthy === true;
    return {
      healthy,
      checkedAt,
      reason: healthy ? null : String(status.reason || 'health-check-failed'),
    };
  } catch {
    return { healthy: false, checkedAt: null, reason: 'status-unavailable' };
  }
}

class TorInstanceRegistry {
  constructor(config, options = {}) {
    if (!config || config.enabled !== true) {
      this.enabled = false;
      this.instances = [];
      this.directHttpsUrl = config && config.directHttpsUrl ? String(config.directHttpsUrl) : null;
      this.readFile = options.readFile;
      return;
    }
    if (!Array.isArray(config.instances) || config.instances.length === 0) {
      throw new Error('At least one Tor instance is required when Tor is enabled');
    }
    this.enabled = true;
    this.directHttpsUrl = config.directHttpsUrl ? String(config.directHttpsUrl) : null;
    this.instances = config.instances.map(normalizeInstance);
    this.readFile = options.readFile;
    this.now = options.now;
    this.maxStatusAgeMs = Number.isFinite(options.maxStatusAgeMs)
      ? options.maxStatusAgeMs
      : 120000;
  }

  snapshot() {
    const instances = this.instances
      .map((instance) => ({
        ...instance,
        ...readStatus(instance, this.readFile, this.now, this.maxStatusAgeMs),
      }))
      .sort((left, right) => left.priority - right.priority || left.id.localeCompare(right.id))
      .map(({ statusFile, ...publicInstance }) => publicInstance);

    const selected = instances.find((instance) => instance.healthy) || null;
    return {
      enabled: this.enabled,
      selectedInstance: selected ? selected.id : null,
      directHttpsAvailable: Boolean(this.directHttpsUrl),
      instances,
    };
  }
}

function loadRegistry(configPath, options) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  return new TorInstanceRegistry(config, options);
}

module.exports = { TorInstanceRegistry, loadRegistry };
