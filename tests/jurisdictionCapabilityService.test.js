const assert = require('node:assert/strict');
const test = require('node:test');

const {
  JurisdictionCapabilityService,
  loadRegistry,
  validateRegistry
} = require('../services/jurisdictionCapabilityService');

test('loads and validates the versioned registry', () => {
  const registry = loadRegistry();
  assert.equal(registry.schemaVersion, '1.0.0');
  assert.ok(registry.jurisdictions.CN);
  assert.ok(registry.jurisdictions.SG);
  assert.ok(registry.jurisdictions.US.subdivisions['US-CA']);
});

test('rejects malformed profiles during CI validation', () => {
  const invalid = loadRegistry();
  invalid.jurisdictions.SG.capabilities.payments.state = 'MAYBE';
  assert.throws(() => validateRegistry(invalid), /invalid capability state/);
});

test('resolves CN_MAINLAND without route-specific logic', () => {
  const service = new JurisdictionCapabilityService();
  const result = service.discover('CN_MAINLAND');
  assert.equal(result.jurisdiction.countryCode, 'CN');
  assert.equal(result.capabilities.payments.state, 'BLOCKED');
});

test('keeps SG regulated capabilities fail-closed without approval', () => {
  const service = new JurisdictionCapabilityService();
  const result = service.decide({ countryCode: 'SG', capability: 'payments' });
  assert.equal(result.allowed, false);
  assert.equal(result.state, 'REVIEW_REQUIRED');
});

test('applies a US subdivision override over the country profile', () => {
  const service = new JurisdictionCapabilityService();
  const result = service.decide({
    countryCode: 'US',
    subdivisionCode: 'US-CA',
    capability: 'token_rwa'
  });
  assert.equal(result.jurisdiction.subdivisionCode, 'US-CA');
  assert.equal(result.state, 'BLOCKED');
  assert.equal(result.allowed, false);
});

test('allows pilot-only software capabilities only outside production', () => {
  const service = new JurisdictionCapabilityService();
  const production = service.decide({ countryCode: 'US', capability: 'gardens' });
  const pilot = service.decide({
    countryCode: 'US',
    capability: 'gardens',
    environment: 'pilot'
  });
  assert.equal(production.allowed, false);
  assert.equal(pilot.allowed, true);
});

test('defaults unknown jurisdictions to deny for regulated capabilities', () => {
  const audit = [];
  const service = new JurisdictionCapabilityService({ audit: (event) => audit.push(event) });
  const result = service.decide({ countryCode: 'ZZ', capability: 'custody' });
  assert.equal(result.jurisdiction.known, false);
  assert.equal(result.allowed, false);
  assert.equal(result.state, 'BLOCKED');
  assert.equal(result.reason, 'missing_regulated_approval');
  assert.equal(audit.length, 1);
  assert.equal(audit[0].policyVersion, result.policyVersion);
});

test('unknown subdivisions do not inherit a fabricated approval', () => {
  const service = new JurisdictionCapabilityService();
  const result = service.decide({
    countryCode: 'US',
    subdivisionCode: 'US-XX',
    capability: 'exchange'
  });
  assert.equal(result.jurisdiction.subdivisionKnown, false);
  assert.equal(result.allowed, false);
});
