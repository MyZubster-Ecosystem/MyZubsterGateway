'use strict';

const crypto = require('crypto');

/**
 * Mock escrow payment service.
 *
 * Provides an in-memory stand-in for a real escrow/payment provider so that
 * the future end-to-end payment flow (bounty -> escrow -> payout) can be
 * built and tested against a stable interface before real integration.
 */
class EscrowService {
  constructor() {
    // In-memory transaction store: transactionId -> transaction record
    this.transactions = new Map();
  }

  /**
   * Create a new escrow payment transaction.
   * @param {{ bountyId: string, amount: number, contributor: string }} params
   * @returns {object} the created transaction record
   */
  createPayment({ bountyId, amount, contributor }) {
    const transactionId = crypto.randomUUID();

    const transaction = {
      transactionId,
      bountyId,
      amount,
      contributor,
      status: 'pending',
      createdAt: new Date().toISOString(),
      retries: 0,
    };

    this.transactions.set(transactionId, transaction);

    return transaction;
  }

  /**
   * Mark a transaction as confirmed.
   * @param {string} transactionId
   * @returns {object} the updated transaction record
   */
  complete(transactionId) {
    const transaction = this.transactions.get(transactionId);

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    transaction.status = 'confirmed';
    transaction.confirmedAt = new Date().toISOString();

    return transaction;
  }

  /**
   * Retrieve a transaction by ID.
   * @param {string} transactionId
   * @returns {object|undefined} the transaction record, if found
   */
  get(transactionId) {
    return this.transactions.get(transactionId);
  }
    /**
   * Reconcile a transaction using its transaction ID.
   */
  reconcile(transactionId) {
    const transaction = this.transactions.get(transactionId);

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    return {
      transactionId: transaction.transactionId,
      status: transaction.status,
      confirmedAt: transaction.confirmedAt || null,
    };
  }
}

module.exports = { EscrowService };