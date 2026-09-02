'use strict';

const crypto = require('node:crypto');

const TERMINAL = new Set(['PAID', 'FAILED']);
const STATES = new Set(['PENDING', 'ACCEPTED', 'SUBMITTED', 'CONFIRMED', 'PAID', 'FAILED', 'UNSETTLED', 'DISPUTED']);
const MODES = new Set(['real', 'simulation']);

class MemorySettlementStore {
  constructor() {
    this.records = new Map();
  }

  async findByBountyId(bountyId) {
    return clone(this.records.get(String(bountyId)) || null);
  }

  async create(record) {
    const key = String(record.bountyId);
    if (this.records.has(key)) return clone(this.records.get(key));
    this.records.set(key, clone(record));
    return clone(record);
  }

  async save(record) {
    this.records.set(String(record.bountyId), clone(record));
    return clone(record);
  }

  async list() {
    return [...this.records.values()].map(clone);
  }
}

class MongoSettlementStore {
  constructor({ model } = {}) {
    this.model = model || require('../../models/BountySettlement');
  }

  async findByBountyId(bountyId) {
    return this.model.findOne({ bountyId: String(bountyId) }).lean();
  }

  async create(record) {
    try {
      const created = await this.model.create(record);
      return created.toObject();
    } catch (error) {
      if (error && error.code === 11000) {
        const existing = await this.findByBountyId(record.bountyId);
        if (existing) return existing;
      }
      throw error;
    }
  }

  async save(record) {
    const { _id, __v, ...persisted } = record;
    const saved = await this.model.findOneAndUpdate(
      { bountyId: String(record.bountyId) },
      { $set: persisted },
      { new: true, runValidators: true }
    ).lean();
    if (!saved) throw new Error(`settlement not found: ${record.bountyId}`);
    return saved;
  }

  async list() {
    return this.model.find({}).sort({ createdAt: 1 }).lean();
  }
}

class SettlementLedger {
  constructor({ verifyTransaction, store = null, now = () => new Date() } = {}) {
    if (typeof verifyTransaction !== 'function') throw new TypeError('verifyTransaction is required');
    this.store = store || new MongoSettlementStore();
    if (!this.store ||
        typeof this.store.findByBountyId !== 'function' ||
        typeof this.store.create !== 'function' ||
        typeof this.store.save !== 'function' ||
        typeof this.store.list !== 'function') {
      throw new TypeError('store must implement findByBountyId, create, save and list');
    }
    this.verifyTransaction = verifyTransaction;
    this.now = now;
  }

  async create({ bountyId, issueNumber, pullRequestId = null, contributor, amount, asset, network, destination, mode = 'real' }) {
    if (!bountyId || !contributor || !amount || !asset || !network || !destination) {
      throw new Error('bountyId, contributor, amount, asset, network and destination are required');
    }
    if (!MODES.has(mode)) throw new Error('mode must be real or simulation');

    const normalized = {
      bountyId: String(bountyId),
      issueNumber: issueNumber ?? null,
      pullRequestId: pullRequestId == null ? null : String(pullRequestId),
      contributor: String(contributor),
      amount: String(amount),
      asset: String(asset),
      network: String(network),
      destination: String(destination),
      mode
    };
    const existing = await this.store.findByBountyId(normalized.bountyId);
    if (existing) {
      assertSameSettlement(existing, normalized);
      return existing;
    }

    const timestamp = this._timestamp();
    const record = {
      id: crypto.randomUUID(),
      ...normalized,
      status: 'PENDING',
      txId: null,
      verification: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      audit: []
    };
    this._audit(record, 'PENDING', { reason: 'settlement_created' });
    const created = await this.store.create(record);
    assertSameSettlement(created, normalized);
    return created;
  }

  async accept(bountyId, reviewer) {
    const record = await this._get(bountyId);
    if (record.status !== 'PENDING') throw new Error(`cannot accept from ${record.status}`);
    if (!reviewer) throw new Error('reviewer is required');
    record.reviewer = String(reviewer);
    this._transition(record, 'ACCEPTED', { actor: String(reviewer) });
    return this.store.save(record);
  }

  async submit(bountyId, txId) {
    const record = await this._get(bountyId);
    if (record.status !== 'ACCEPTED' && record.status !== 'UNSETTLED') {
      throw new Error(`cannot submit from ${record.status}`);
    }
    if (record.mode !== 'real') throw new Error('simulation settlements cannot be submitted as real payments');
    if (!txId) throw new Error('txId is required');
    if (record.txId && record.txId !== String(txId)) throw new Error('settlement already has a different txId');
    record.txId = String(txId);
    record.verification = null;
    this._transition(record, 'SUBMITTED');
    return this.store.save(record);
  }

  async fail(bountyId, reason, actor = null) {
    const record = await this._get(bountyId);
    if (!reason) throw new Error('failure reason is required');
    if (!['PENDING', 'ACCEPTED', 'SUBMITTED', 'UNSETTLED', 'DISPUTED'].includes(record.status)) {
      throw new Error(`cannot fail from ${record.status}`);
    }
    this._transition(record, 'FAILED', { actor, reason: String(reason) });
    return this.store.save(record);
  }

  async dispute(bountyId, reason, actor = null) {
    const record = await this._get(bountyId);
    if (!reason) throw new Error('dispute reason is required');
    if (!['ACCEPTED', 'SUBMITTED', 'CONFIRMED', 'UNSETTLED'].includes(record.status)) {
      throw new Error(`cannot dispute from ${record.status}`);
    }
    this._transition(record, 'DISPUTED', { actor, reason: String(reason) });
    return this.store.save(record);
  }

  async confirm(bountyId) {
    const record = await this._get(bountyId);
    if (record.status !== 'SUBMITTED' || !record.txId) {
      throw new Error('settlement must be SUBMITTED with a txId');
    }
    if (record.mode !== 'real') throw new Error('simulation settlements cannot become PAID');

    let result;
    try {
      result = await this.verifyTransaction(expectedVerification(record));
    } catch (error) {
      this._transition(record, 'UNSETTLED', { reason: 'verifier_unavailable' });
      return this.store.save(record);
    }

    if (!verificationMatches(record, result)) {
      record.verification = sanitizeVerification(result, this._timestamp());
      this._transition(record, 'UNSETTLED', { reason: 'independent_verification_failed' });
      return this.store.save(record);
    }

    record.verification = sanitizeVerification(result, this._timestamp());
    this._transition(record, 'CONFIRMED', { reason: 'independent_verification_succeeded' });
    this._transition(record, 'PAID', { reason: 'confirmed_transaction_required_for_paid' });
    return this.store.save(record);
  }

  async reconcile(bountyId, evidence) {
    const record = await this._get(bountyId);
    if (record.status === 'PAID') return record;
    if (record.status === 'FAILED') throw new Error('cannot reconcile a FAILED settlement');
    if (record.mode !== 'real') {
      this._transition(record, 'UNSETTLED', { reason: 'simulation_has_no_real_settlement' });
      return this.store.save(record);
    }
    if (record.status === 'SUBMITTED' || record.status === 'CONFIRMED') {
      throw new Error('submitted settlements must use independent confirm(), not historical reconcile()');
    }

    const candidate = evidence || {};
    if (!candidate.txId || (candidate.network && String(candidate.network) !== record.network)) {
      if (record.status !== 'UNSETTLED') {
        this._transition(record, 'UNSETTLED', { reason: 'historical_evidence_not_verifiable' });
      } else {
        this._audit(record, 'UNSETTLED', { reason: 'historical_evidence_not_verifiable' });
      }
      return this.store.save(record);
    }

    record.txId = String(candidate.txId);
    let result;
    try {
      result = await this.verifyTransaction(expectedVerification(record));
    } catch (error) {
      if (record.status !== 'UNSETTLED') {
        this._transition(record, 'UNSETTLED', { reason: 'historical_verifier_unavailable' });
      } else {
        this._audit(record, 'UNSETTLED', { reason: 'historical_verifier_unavailable' });
      }
      return this.store.save(record);
    }

    record.verification = sanitizeVerification(result, this._timestamp());
    if (!verificationMatches(record, result)) {
      if (record.status !== 'UNSETTLED') {
        this._transition(record, 'UNSETTLED', { reason: 'historical_independent_verification_failed' });
      } else {
        this._audit(record, 'UNSETTLED', { reason: 'historical_independent_verification_failed' });
      }
      return this.store.save(record);
    }

    if (record.status !== 'UNSETTLED') {
      this._transition(record, 'UNSETTLED', { reason: 'historical_reconciliation' });
    }
    this._transition(record, 'CONFIRMED', { reason: 'historical_independent_verification_succeeded' });
    this._transition(record, 'PAID', { reason: 'confirmed_transaction_required_for_paid' });
    return this.store.save(record);
  }

  async get(bountyId) {
    return this.store.findByBountyId(String(bountyId));
  }

  async list() {
    return this.store.list();
  }

  async _get(id) {
    const record = await this.get(id);
    if (!record) throw new Error(`settlement not found: ${id}`);
    return record;
  }

  _transition(record, status, meta = {}) {
    if (!STATES.has(status)) throw new Error(`invalid settlement status: ${status}`);
    if (TERMINAL.has(record.status) && record.status !== status) {
      throw new Error(`cannot transition from terminal state ${record.status}`);
    }
    const allowed = {
      PENDING: ['ACCEPTED', 'UNSETTLED', 'FAILED'],
      ACCEPTED: ['SUBMITTED', 'UNSETTLED', 'FAILED', 'DISPUTED'],
      SUBMITTED: ['CONFIRMED', 'UNSETTLED', 'FAILED', 'DISPUTED'],
      CONFIRMED: ['PAID', 'DISPUTED'],
      UNSETTLED: ['SUBMITTED', 'CONFIRMED', 'FAILED', 'DISPUTED'],
      DISPUTED: ['UNSETTLED', 'FAILED']
    };
    if (!(allowed[record.status] || []).includes(status) && record.status !== status) {
      throw new Error(`invalid transition ${record.status} -> ${status}`);
    }
    if (status === 'PAID') this._assertPaidGuard(record);
    record.status = status;
    record.updatedAt = this._timestamp();
    this._audit(record, status, meta);
  }

  _assertPaidGuard(record) {
    if (record.mode !== 'real') throw new Error('simulation settlements cannot become PAID');
    if (!record.txId || !record.network) throw new Error('PAID requires txId and network');
    if (!record.verification || record.verification.verified !== true || record.verification.confirmed !== true) {
      throw new Error('PAID requires independent confirmed transaction verification');
    }
    if (!verificationMatches(record, record.verification)) {
      throw new Error('PAID verification does not match settlement facts');
    }
  }

  _audit(record, status, { actor = null, reason = null } = {}) {
    record.audit.push({ status, at: this._timestamp(), actor: actor || null, reason: reason || null });
  }

  _timestamp() {
    return this.now().toISOString();
  }
}

function expectedVerification(record) {
  return {
    txId: record.txId,
    network: record.network,
    destination: record.destination,
    amount: record.amount,
    asset: record.asset
  };
}

function verificationMatches(record, result) {
  if (!result || result.verified !== true || result.confirmed !== true) return false;
  const source = result.verificationSource || result.evidenceMethod;
  if (!source || typeof source !== 'string') return false;
  return String(result.txId || '') === String(record.txId || '') &&
    String(result.network || '') === record.network &&
    String(result.destination || '') === record.destination &&
    String(result.amount || '') === record.amount &&
    String(result.asset || '') === record.asset;
}

function sanitizeVerification(result, checkedAt) {
  if (!result || typeof result !== 'object') return { verified: false, confirmed: false, checkedAt };
  return {
    verified: result.verified === true,
    confirmed: result.confirmed === true,
    txId: result.txId ? String(result.txId) : null,
    network: result.network ? String(result.network) : null,
    destination: result.destination ? String(result.destination) : null,
    amount: result.amount != null ? String(result.amount) : null,
    asset: result.asset ? String(result.asset) : null,
    verificationSource: result.verificationSource
      ? String(result.verificationSource)
      : (result.evidenceMethod ? String(result.evidenceMethod) : null),
    checkedAt
  };
}

function assertSameSettlement(existing, requested) {
  for (const field of ['contributor', 'amount', 'asset', 'network', 'destination', 'mode']) {
    if (String(existing[field]) !== String(requested[field])) {
      throw new Error(`idempotency conflict for bounty ${requested.bountyId}: ${field} differs`);
    }
  }
}

function clone(value) {
  if (value == null) return value;
  return structuredClone(value);
}

module.exports = {
  SettlementLedger,
  MemorySettlementStore,
  MongoSettlementStore,
  STATES
};
