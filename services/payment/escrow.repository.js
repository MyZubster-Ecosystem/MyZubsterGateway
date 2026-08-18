'use strict';

/**
 * Abstract repository interface for escrow transactions.
 * Defines the contract any persistence adapter (JSON file, SQL, Mongo, etc.)
 * must implement. EscrowService depends only on this interface.
 * @abstract
 */
class EscrowRepository {
  /** @param {object} transaction @returns {object} */
  create(transaction) {
    throw new Error('EscrowRepository.create() must be implemented by subclass');
  }

  /** @param {string} transactionId @returns {object|undefined} */
  get(transactionId) {
    throw new Error('EscrowRepository.get() must be implemented by subclass');
  }

  /** @param {string} transactionId @param {object} changes @returns {object} */
  update(transactionId, changes) {
    throw new Error('EscrowRepository.update() must be implemented by subclass');
  }

  /** @returns {object[]} */
  list() {
    throw new Error('EscrowRepository.list() must be implemented by subclass');
  }
}

module.exports = { EscrowRepository };