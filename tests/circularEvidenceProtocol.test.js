'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  canonicalize,
  createCircularEvidenceEvent,
  verifyCircularEvidenceEvent,
  markEvidenceVerified,
  attachAnchorReceipt
} = require('../services/settlement/circularEvidenceProtocol');

const payload = { note: 'pilot evidence', quantity: 12 };

function makeEvent(overrides = {}) {
  return createCircularEvidenceEvent({
    eventId: 'evt-1',
    pilotId: 'pilot-1',
    pilotType: 'AHP',
    eventType: 'COLLECTION_RECORDED',
    actorRef: 'operator-pseudonym-1',
    subjectRef: 'lot-1',
    payload,
    measurement: { value: 12, unit: 'kg', method: 'calibrated-scale' },
    createdAt: '2026-09-16T04:00:00.000Z',
    ...overrides
  });
}

test('canonicalization is deterministic and normalizes strings', () => {
  assert.equal(canonicalize({ b: 2, a: 'cafe\u0301' }), canonicalize({ a: 'café', b: 2 }));
});

test('rejects unsupported/non-finite canonical values', () => {
  assert.throws(() => canonicalize({ x: undefined }), /unsupported value type/);
  assert.throws(() => canonicalize({ x: Infinity }), /non-finite/);
});

test('creates and verifies evidence for measurable circular flow', () => {
  const event = makeEvent();
  assert.equal(event.pilotType, 'AHP');
  assert.equal(event.measurement.unit, 'kg');
  assert.equal(event.verification.state, 'DECLARED');
  assert.equal(verifyCircularEvidenceEvent(event, payload), true);
  assert.equal(verifyCircularEvidenceEvent(event, { ...payload, quantity: 13 }), false);
});

test('supports non-weight contribution evidence for sound systems', () => {
  const event = makeEvent({
    pilotType: 'SOUNDSYSTEM',
    eventType: 'EQUIPMENT_REPAIRED',
    subjectRef: 'amp-42',
    measurement: { value: 3, unit: 'items', method: 'service-log' }
  });
  assert.equal(verifyCircularEvidenceEvent(event, payload), true);
});

test('enforces append-only previous hash linkage', () => {
  const first = makeEvent();
  const second = makeEvent({ eventId: 'evt-2', previousHash: first.evidenceHash });
  assert.equal(verifyCircularEvidenceEvent(second, payload, first), true);
  assert.equal(verifyCircularEvidenceEvent(second, payload, makeEvent({ eventId: 'other' })), false);
});

test('separates declaration, verification and blockchain anchor receipt', () => {
  const event = makeEvent();
  const verified = markEvidenceVerified(event, { verifierRef: 'auditor-1', verifiedAt: '2026-09-16T05:00:00.000Z' });
  const anchored = attachAnchorReceipt(verified, {
    network: 'testnet',
    txId: 'tx-demo',
    blockRef: '100',
    anchoredAt: '2026-09-16T05:10:00.000Z'
  });
  assert.equal(anchored.verification.state, 'VERIFIED');
  assert.equal(anchored.anchor.network, 'testnet');
  assert.throws(() => attachAnchorReceipt(anchored, { network: 'testnet', txId: 'again' }), /already anchored/);
});
