const crypto = require('node:crypto');

const TERMINAL = new Set(['PAID', 'FAILED', 'DISPUTED']);
const STATES = new Set(['PENDING', 'ACCEPTED', 'SUBMITTED', 'CONFIRMED', 'PAID', 'FAILED', 'UNSETTLED', 'DISPUTED']);

class SettlementLedger {
  constructor({ verifyTransaction, now = () => new Date() } = {}) {
    if (typeof verifyTransaction !== 'function') {
      throw new TypeError('verifyTransaction is required');
    }
    this.verifyTransaction = verifyTransaction;
    this.now = now;
    this.records = new Map();
  }

  create({ bountyId, issueNumber, contributor, amount, asset, network, destination, mode = 'real' }) {
    if (!bountyId || !contributor || !amount || !asset || !network || !destination) {
      throw new Error('bountyId, contributor, amount, asset, network and destination are required');
    }
    if (!['real', 'simulation'].includes(mode)) throw new Error('mode must be real or simulation');
    if (this.records.has(String(bountyId))) return this.records.get(String(bountyId));
    const record = {
      id: crypto.randomUUID(), bountyId: String(bountyId), issueNumber: issueNumber ?? null,
      contributor, amount: String(amount), asset, network, destination, mode,
      status: 'PENDING', txId: null, createdAt: this.now().toISOString(), updatedAt: this.now().toISOString(), audit: []
    };
    this._audit(record, 'PENDING');
    this.records.set(record.bountyId, record);
    return record;
  }

  accept(bountyId, reviewer) {
    const r = this._get(bountyId);
    if (r.status !== 'PENDING') throw new Error(`cannot accept from ${r.status}`);
    r.reviewer = reviewer;
    this._transition(r, 'ACCEPTED');
    return r;
  }

  submit(bountyId, txId) {
    const r = this._get(bountyId);
    if (r.status !== 'ACCEPTED') throw new Error(`cannot submit from ${r.status}`);
    if (r.mode !== 'real') throw new Error('simulation settlements cannot become PAID');
    if (!txId) throw new Error('txId is required');
    r.txId = txId;
    this._transition(r, 'SUBMITTED');
    return r;
  }

  async confirm(bountyId) {
    const r = this._get(bountyId);
    if (r.status !== 'SUBMITTED' || !r.txId) throw new Error('settlement must be SUBMITTED with a txId');
    const result = await this.verifyTransaction({ txId: r.txId, network: r.network, destination: r.destination, amount: r.amount, asset: r.asset });
    if (!result || result.verified !== true) {
      this._transition(r, 'UNSETTLED');
      return r;
    }
    this._transition(r, 'CONFIRMED');
    this._transition(r, 'PAID');
    return r;
  }

  reconcile(bountyId, evidence) {
    const r = this._get(bountyId);
    if (r.status === 'PAID') return r;
    if (!evidence || evidence.verified !== true || !evidence.txId || evidence.network !== r.network) {
      this._transition(r, 'UNSETTLED');
      return r;
    }
    r.txId = evidence.txId;
    this._transition(r, 'CONFIRMED');
    this._transition(r, 'PAID');
    return r;
  }

  get(bountyId) { return this.records.get(String(bountyId)) || null; }
  list() { return [...this.records.values()]; }

  _get(id) {
    const r = this.get(id);
    if (!r) throw new Error(`settlement not found: ${id}`);
    return r;
  }

  _transition(r, status) {
    if (!STATES.has(status)) throw new Error(`invalid settlement status: ${status}`);
    if (TERMINAL.has(r.status) && r.status !== status) throw new Error(`cannot transition from terminal state ${r.status}`);
    const allowed = {
      PENDING: ['ACCEPTED', 'UNSETTLED'], ACCEPTED: ['SUBMITTED', 'UNSETTLED'], SUBMITTED: ['CONFIRMED', 'UNSETTLED'],
      CONFIRMED: ['PAID'], UNSETTLED: ['SUBMITTED', 'CONFIRMED', 'PAID', 'DISPUTED'], DISPUTED: ['UNSETTLED', 'PAID']
    };
    if (!(allowed[r.status] || []).includes(status) && r.status !== status) throw new Error(`invalid transition ${r.status} -> ${status}`);
    r.status = status;
    r.updatedAt = this.now().toISOString();
    this._audit(r, status);
  }

  _audit(r, status) { r.audit.push({ status, at: this.now().toISOString() }); }
}

module.exports = { SettlementLedger, STATES };
