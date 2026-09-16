'use strict';

const crypto = require('node:crypto');

const PILOT_TYPES = new Set([
  'KEFIR',
  'HEMP',
  'AHP',
  'CIRCULAR_WATER',
  'SOUNDSYSTEM',
  'AGRICULTURE',
  'MARKETPLACE',
  'CONTRIBUTION'
]);

const SHA256_RE = /^[0-9a-f]{64}$/;

function canonicalize(value) {
  if (value === null) return 'null';
  if (typeof value === 'string') return JSON.stringify(value.normalize('NFC'));
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('non-finite numbers are not supported');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  if (typeof value !== 'object') throw new Error(`unsupported value type: ${typeof value}`);
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key.normalize('NFC'))}:${canonicalize(value[key])}`).join(',')}}`;
}

function sha256(value) {
  return crypto.createHash('sha256').update(canonicalize(value), 'utf8').digest('hex');
}

function requireString(value, field) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${field} is required`);
  return value.trim();
}

function normalizeMeasurement(measurement) {
  if (measurement == null) return null;
  if (typeof measurement !== 'object' || Array.isArray(measurement)) throw new Error('measurement must be an object');
  const unit = requireString(measurement.unit, 'measurement.unit');
  const value = measurement.value;
  if ((typeof value !== 'number' || !Number.isFinite(value)) && (typeof value !== 'string' || !value.trim())) {
    throw new Error('measurement.value must be a finite number or non-empty string');
  }
  return {
    value,
    unit,
    method: measurement.method ? requireString(measurement.method, 'measurement.method') : null
  };
}

function createCircularEvidenceEvent({
  eventId,
  pilotId,
  pilotType,
  eventType,
  actorRef,
  subjectRef,
  payload,
  measurement = null,
  previousHash = null,
  marketplaceRef = null,
  destinationRef = null,
  createdAt = new Date().toISOString(),
  schemaVersion = 1
}) {
  if (!PILOT_TYPES.has(pilotType)) throw new Error(`unsupported pilotType: ${pilotType}`);
  if (!Number.isInteger(schemaVersion) || schemaVersion < 1) throw new Error('schemaVersion must be a positive integer');
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('payload must be an object');
  if (previousHash !== null && !SHA256_RE.test(String(previousHash))) throw new Error('previousHash must be a SHA-256 digest');

  const record = {
    schema: 'myzubster.circular-evidence',
    schemaVersion,
    eventId: requireString(eventId, 'eventId'),
    pilotId: requireString(pilotId, 'pilotId'),
    pilotType,
    eventType: requireString(eventType, 'eventType'),
    actorRef: requireString(actorRef, 'actorRef'),
    subjectRef: requireString(subjectRef, 'subjectRef'),
    measurement: normalizeMeasurement(measurement),
    payloadHash: sha256(payload),
    previousHash,
    marketplaceRef: marketplaceRef ? requireString(marketplaceRef, 'marketplaceRef') : null,
    destinationRef: destinationRef ? requireString(destinationRef, 'destinationRef') : null,
    createdAt: requireString(createdAt, 'createdAt')
  };

  return {
    ...record,
    evidenceHash: sha256(record),
    verification: { state: 'DECLARED', verifiedAt: null, verifierRef: null },
    anchor: null
  };
}

function verifyCircularEvidenceEvent(record, payload, previousRecord = null) {
  if (!record || !SHA256_RE.test(String(record.evidenceHash || ''))) return false;
  if (sha256(payload) !== record.payloadHash) return false;
  const base = {
    schema: record.schema,
    schemaVersion: record.schemaVersion,
    eventId: record.eventId,
    pilotId: record.pilotId,
    pilotType: record.pilotType,
    eventType: record.eventType,
    actorRef: record.actorRef,
    subjectRef: record.subjectRef,
    measurement: record.measurement,
    payloadHash: record.payloadHash,
    previousHash: record.previousHash,
    marketplaceRef: record.marketplaceRef,
    destinationRef: record.destinationRef,
    createdAt: record.createdAt
  };
  if (sha256(base) !== record.evidenceHash) return false;
  if (record.previousHash !== null && (!previousRecord || previousRecord.evidenceHash !== record.previousHash)) return false;
  return true;
}

function markEvidenceVerified(record, { verifierRef, verifiedAt = new Date().toISOString() }) {
  if (!record || !SHA256_RE.test(String(record.evidenceHash || ''))) throw new Error('valid evidence record is required');
  return {
    ...record,
    verification: {
      state: 'VERIFIED',
      verifierRef: requireString(verifierRef, 'verifierRef'),
      verifiedAt: requireString(verifiedAt, 'verifiedAt')
    }
  };
}

function attachAnchorReceipt(record, { network, txId, blockRef = null, anchoredAt = new Date().toISOString() }) {
  if (!record || !SHA256_RE.test(String(record.evidenceHash || ''))) throw new Error('valid evidence record is required');
  if (record.anchor) throw new Error('evidence is already anchored');
  return {
    ...record,
    anchor: {
      network: requireString(network, 'network'),
      txId: requireString(txId, 'txId'),
      blockRef: blockRef == null ? null : String(blockRef),
      anchoredAt: requireString(anchoredAt, 'anchoredAt')
    }
  };
}

module.exports = {
  PILOT_TYPES,
  canonicalize,
  sha256,
  createCircularEvidenceEvent,
  verifyCircularEvidenceEvent,
  markEvidenceVerified,
  attachAnchorReceipt
};
