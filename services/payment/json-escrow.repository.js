'use strict';

const fs = require('fs');
const path = require('path');
const { EscrowRepository } = require('./escrow.repository');

const DEFAULT_FILE_PATH = path.join(process.cwd(), 'data', 'escrow-transactions.json');

/**
 * JSON-file-backed EscrowRepository.
 * Persists transactions as a { transactionId: record } map. Writes are
 * atomic (temp file + rename) so a crash mid-write can't corrupt the store.
 */
class JsonEscrowRepository extends EscrowRepository {
  /**
   * @param {string} [filePath] Defaults to <cwd>/data/escrow-transactions.json
   *   (outside services/, configurable per instance).
   */
  constructor(filePath = DEFAULT_FILE_PATH) {
    super();
    this.filePath = filePath;
    this._ensureFile();
  }

  _ensureFile() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.filePath)) {
      this._writeAll({});
    }
  }

  _readAll() {
    let raw;
    try {
      raw = fs.readFileSync(this.filePath, 'utf8');
    } catch (err) {
      throw new Error(`Failed to read escrow store at ${this.filePath}: ${err.message}`);
    }
    if (!raw.trim()) return {};
    try {
      return JSON.parse(raw);
    } catch (err) {
      throw new Error(`Escrow store at ${this.filePath} contains invalid JSON: ${err.message}`);
    }
  }

  /** Writes the full map atomically: temp file in same dir, then rename. */
  _writeAll(data) {
    const tmpPath = `${this.filePath}.${process.pid}.${Date.now()}.tmp`;
    try {
      fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
      fs.renameSync(tmpPath, this.filePath);
    } catch (err) {
      throw new Error(`Failed to persist escrow store at ${this.filePath}: ${err.message}`);
    }
  }

  create(transaction) {
    const all = this._readAll();
    all[transaction.transactionId] = transaction;
    this._writeAll(all);
    return transaction;
  }

  get(transactionId) {
    return this._readAll()[transactionId];
  }

  update(transactionId, changes) {
    const all = this._readAll();
    const existing = all[transactionId];
    if (!existing) {
      throw new Error(`Cannot update unknown transaction: ${transactionId}`);
    }
    const updated = { ...existing, ...changes };
    all[transactionId] = updated;
    this._writeAll(all);
    return updated;
  }

  list() {
    return Object.values(this._readAll());
  }
}

module.exports = { JsonEscrowRepository, DEFAULT_FILE_PATH };