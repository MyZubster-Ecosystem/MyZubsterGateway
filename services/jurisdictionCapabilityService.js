const fs = require('fs');
const path = require('path');

const STATES = new Set([
  'SUPPORTED',
  'PILOT_ONLY',
  'RESTRICTED',
  'BLOCKED',
  'REVIEW_REQUIRED'
]);

const DEFAULT_REGISTRY_PATH = path.join(
  __dirname,
  '..',
  'data',
  'jurisdictions',
  'v1.json'
);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function validateCapabilityRecord(record, location) {
  if (!record || !STATES.has(record.state)) {
    throw new Error(`${location} has an invalid capability state`);
  }
  if (!Array.isArray(record.evidence)) {
    throw new Error(`${location} must provide an evidence array`);
  }
  if (record.state === 'SUPPORTED' && !record.approval) {
    throw new Error(`${location} cannot be SUPPORTED without approval`);
  }
}

function validateRegistry(registry) {
  if (!registry || !/^\d+\.\d+\.\d+$/.test(registry.schemaVersion || '')) {
    throw new Error('registry schemaVersion must use semantic versioning');
  }
  if (!registry.policyVersion || !registry.jurisdictions) {
    throw new Error('registry must include policyVersion and jurisdictions');
  }
  if (!Array.isArray(registry.regulatedCapabilities)) {
    throw new Error('registry must list regulatedCapabilities');
  }
  if (!STATES.has(registry.defaultPolicy?.regulated) ||
      !STATES.has(registry.defaultPolicy?.nonRegulated)) {
    throw new Error('registry defaultPolicy contains an invalid state');
  }

  for (const [countryCode, profile] of Object.entries(registry.jurisdictions)) {
    if (!/^[A-Z]{2}$/.test(countryCode)) {
      throw new Error(`invalid ISO 3166-1 country code: ${countryCode}`);
    }
    for (const [capability, record] of Object.entries(profile.capabilities || {})) {
      validateCapabilityRecord(record, `${countryCode}.${capability}`);
    }
    for (const [subdivisionCode, subdivision] of Object.entries(profile.subdivisions || {})) {
      if (!subdivisionCode.startsWith(`${countryCode}-`)) {
        throw new Error(`${subdivisionCode} is not a subdivision of ${countryCode}`);
      }
      for (const [capability, record] of Object.entries(subdivision.capabilities || {})) {
        validateCapabilityRecord(record, `${subdivisionCode}.${capability}`);
      }
    }
  }
  return registry;
}

function loadRegistry(registryPath = DEFAULT_REGISTRY_PATH) {
  return validateRegistry(JSON.parse(fs.readFileSync(registryPath, 'utf8')));
}

class JurisdictionCapabilityService {
  constructor({ registry = loadRegistry(), audit = () => {} } = {}) {
    this.registry = validateRegistry(clone(registry));
    this.audit = audit;
    this.regulated = new Set(this.registry.regulatedCapabilities);
  }

  resolve(countryCode, subdivisionCode) {
    const requestedCountry = String(countryCode || '').trim().toUpperCase();
    const canonicalCountry = this.registry.aliases?.[requestedCountry] || requestedCountry;
    const requestedSubdivision = subdivisionCode
      ? String(subdivisionCode).trim().toUpperCase()
      : null;
    const profile = this.registry.jurisdictions[canonicalCountry];
    const subdivision = profile?.subdivisions?.[requestedSubdivision] || null;

    return {
      requestedCountry,
      countryCode: profile ? canonicalCountry : null,
      countryName: profile?.name || null,
      requestedSubdivision,
      subdivisionCode: subdivision ? requestedSubdivision : null,
      subdivisionName: subdivision?.name || null,
      known: Boolean(profile),
      subdivisionKnown: requestedSubdivision ? Boolean(subdivision) : null,
      profile,
      subdivision
    };
  }

  discover(countryCode, subdivisionCode) {
    const resolution = this.resolve(countryCode, subdivisionCode);
    const capabilities = {
      ...(resolution.profile?.capabilities || {}),
      ...(resolution.subdivision?.capabilities || {})
    };

    return {
      schemaVersion: this.registry.schemaVersion,
      policyVersion: this.registry.policyVersion,
      jurisdiction: {
        requestedCountry: resolution.requestedCountry,
        countryCode: resolution.countryCode,
        countryName: resolution.countryName,
        requestedSubdivision: resolution.requestedSubdivision,
        subdivisionCode: resolution.subdivisionCode,
        subdivisionName: resolution.subdivisionName,
        known: resolution.known,
        subdivisionKnown: resolution.subdivisionKnown
      },
      defaults: clone(this.registry.defaultPolicy),
      regulatedCapabilities: [...this.regulated],
      capabilities: clone(capabilities)
    };
  }

  decide({ countryCode, subdivisionCode, capability, environment = 'production' }) {
    const discovery = this.discover(countryCode, subdivisionCode);
    const normalizedCapability = String(capability || '').trim().toLowerCase();
    if (!normalizedCapability) {
      throw new Error('capability is required');
    }

    const regulated = this.regulated.has(normalizedCapability);
    const configured = discovery.capabilities[normalizedCapability] || null;
    const state = configured?.state || (
      regulated ? discovery.defaults.regulated : discovery.defaults.nonRegulated
    );
    const pilotEnvironment = ['pilot', 'sandbox', 'test'].includes(
      String(environment).toLowerCase()
    );
    const allowed = state === 'SUPPORTED' || (state === 'PILOT_ONLY' && pilotEnvironment);
    const decision = {
      timestamp: new Date().toISOString(),
      schemaVersion: discovery.schemaVersion,
      policyVersion: discovery.policyVersion,
      jurisdiction: discovery.jurisdiction,
      capability: normalizedCapability,
      regulated,
      environment,
      state,
      allowed,
      approval: configured?.approval || null,
      evidence: clone(configured?.evidence || []),
      reason: configured
        ? (allowed ? 'explicit_policy_allows' : 'explicit_policy_denies')
        : (regulated ? 'missing_regulated_approval' : 'missing_capability_policy')
    };

    this.audit(clone(decision));
    return decision;
  }
}

module.exports = {
  STATES,
  JurisdictionCapabilityService,
  loadRegistry,
  validateRegistry
};
