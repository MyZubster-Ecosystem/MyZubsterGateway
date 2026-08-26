'use strict';

const crypto = require('crypto');
const { JsonEscrowRepository } = require('./json-escrow.repository');
const { DisabledSettlementAdapter } = require('./disabled-settlement.adapter');

/** Max decimal places allowed for a transaction amount (deterministic, no float drift). */
const MAX_AMOUNT_DECIMALS = 8;

/**
 * Number of fractional digits in a numeric value, based on its exact
 * decimal string form (not floating-point-string heuristics).
 * @param {number} value
 * @returns {number}
 */
function countDecimals(value) {
  if (!Number.isFinite(value)) {
    return Infinity;
  }

  const str = value.toString();

  // Handle scientific notation such as 1e-8 correctly.
  const match = str.match(/^(\d+)(?:\.(\d+))?e([+-]?\d+)$/i);

  if (match) {
    const fractionalDigits = match[2] ? match[2].length : 0;
    const exponent = Number(match[3]);

    // For positive exponents, the decimal places become zero
    // once the decimal point is shifted right.
    if (exponent >= 0) {
      return Math.max(0, fractionalDigits - exponent);
    }

    // For negative exponents, the decimal point shifts left,
    // adding leading decimal places.
    return -exponent + fractionalDigits;
  }

  const parts = str.split('.');
  return parts.length === 2 ? parts[1].length : 0;
}

/**
 * Validates a monetary amount. Never coerces strings/other types to number.
 * @param {*} amount
 */
function assertValidAmount(amount) {
  if (typeof amount !== 'number') {
    throw new Error(`amount must be a number, received ${typeof amount}`);
  }
  if (!Number.isFinite(amount)) {
    throw new Error('amount must be a finite number (NaN/Infinity are not allowed)');
  }
  if (amount <= 0) {
    throw new Error('amount must be greater than zero');
  }
  const decimals = countDecimals(amount);
  if (decimals > MAX_AMOUNT_DECIMALS) {
    throw new Error(`amount precision exceeds the maximum of ${MAX_AMOUNT_DECIMALS} decimal places`);
  }
}

/**
 * Validates and normalizes a currency code. Never coerces non-strings.
 * @param {*} currency
 * @returns {string} normalized (trimmed, uppercased) currency code
 */
function assertAndNormalizeCurrency(currency) {
  if (typeof currency !== 'string' || currency.trim().length === 0) {
    throw new Error('currency must be a non-empty string');
  }
  return currency.trim().toUpperCase();
}

/**
 * Transaction lifecycle states.
 *
 * Allowed transitions:
 *   pending   -> confirmed
 *   pending   -> failed
 *   failed    -> pending    (retry)
 *   failed    -> failed     (idempotent re-fail)
 *   confirmed -> confirmed  (idempotent re-confirm)
 * Disallowed:
 *   confirmed -> pending
 *   confirmed -> failed
 *   pending   -> pending via retryPayment (retry only applies to failed)
 */
const STATUS = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
});

/**
 * Escrow payment service.
 * Business logic for bounty -> escrow -> payout, including an explicit,
 * idempotent transaction state machine. Persistence is delegated to an
 * injected EscrowRepository (defaults to a JSON-file adapter).
 */
class EscrowService {
  /** @param {{ repository?: import('./escrow.repository').EscrowRepository }} [opts] */
 constructor({ repository, settlementAdapter } = {}) {
    this.repository = repository || new JsonEscrowRepository();

    // External settlement is intentionally disabled unless an explicit
    // verified adapter is injected.
    this.settlementAdapter =
        settlementAdapter || new DisabledSettlementAdapter();
}

  /**
   * @param {{ bountyId: string, amount: number, currency: string, contributor: string }} params
   * @returns {object} the created transaction record
   */
  createPayment({ bountyId, amount, currency, contributor }) {
    assertValidAmount(amount);
    const normalizedCurrency = assertAndNormalizeCurrency(currency);

    const transaction = {
      transactionId: crypto.randomUUID(),
      bountyId,
      amount,
      currency: normalizedCurrency,
      contributor,
      status: STATUS.PENDING,
      createdAt: new Date().toISOString(),
      // retries doubles as "retryCount": 0 initially, incremented only on
      // each pending -> failed transition (see failPayment JSDoc below).
      retries: 0,
    };
    return this.repository.create(transaction);
  }

  /**
   * Verifies that a persisted transaction genuinely corresponds to the
   * bounty/expected payment it's about to be confirmed against.
   * @param {object} transaction persisted transaction (from repository.get())
   * @param {{ bountyId: string, amount: number, currency: string, contributor: string }} expected
   * @returns {true}
   * @throws {Error} describing every field mismatch found
   */
  validateTransactionOwnership(transaction, expected) {
    if (!transaction) {
      throw new Error('Cannot validate ownership: transaction is missing');
    }

    const expectedCurrency = assertAndNormalizeCurrency(expected.currency);
    const mismatches = [];

    if (transaction.bountyId !== expected.bountyId) {
      mismatches.push(`bountyId (expected "${expected.bountyId}", got "${transaction.bountyId}")`);
    }
    if (transaction.amount !== expected.amount) {
      mismatches.push(`amount (expected ${expected.amount}, got ${transaction.amount})`);
    }
    if (transaction.currency !== expectedCurrency) {
      mismatches.push(`currency (expected "${expectedCurrency}", got "${transaction.currency}")`);
    }
    if (transaction.contributor !== expected.contributor) {
      mismatches.push(`contributor (expected "${expected.contributor}", got "${transaction.contributor}")`);
    }

    if (mismatches.length > 0) {
      throw new Error(
        `Transaction ${transaction.transactionId} does not match expected bounty: ${mismatches.join('; ')}`
      );
    }
    return true;
  }

  /**
   * Confirm a transaction. State machine:
   *  - missing            -> throws "Transaction not found"
   *  - pending  -> confirmed
   *  - confirmed -> confirmed (idempotent: returns existing record unchanged,
   *                 no repository write, no timestamp mutation)
   *  - failed   -> rejected; must be retried back to pending first
   * Never mints a new transactionId and never resets createdAt.
   * @param {string} transactionId
   * @returns {object} the confirmed (or already-confirmed) transaction record
   */
  complete(transactionId) {
    const transaction = this.repository.get(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.status === STATUS.CONFIRMED) {
      // Idempotent: same transaction, no state transition, no write.
      return transaction;
    }

    if (transaction.status === STATUS.FAILED) {
      throw new Error(
        `Cannot confirm transaction ${transactionId}: it is in "failed" state and must be retried (failed -> pending) before it can be confirmed`
      );
    }

    if (transaction.status !== STATUS.PENDING) {
      throw new Error(
        `Cannot confirm transaction ${transactionId}: invalid transition from "${transaction.status}" to "${STATUS.CONFIRMED}"`
      );
    }

    return this.repository.update(transactionId, {
      status: STATUS.CONFIRMED,
      confirmedAt: new Date().toISOString(),
    });
  }

  /**
   * Mark a transaction as failed. State machine:
   *  - missing   -> throws "Transaction not found"
   *  - pending   -> failed   (retries/retryCount incremented by 1)
   *  - confirmed -> rejected; a confirmed payment cannot be failed
   *  - failed    -> idempotent: returns existing record unchanged, retries
   *                 NOT incremented again, no repository write
   * Identity/ownership fields (transactionId, bountyId, amount, currency,
   * contributor) and createdAt are never altered.
   * @param {string} transactionId
   * @returns {object} the failed (or already-failed) transaction record
   */
  failPayment(transactionId) {
    const transaction = this.repository.get(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.status === STATUS.FAILED) {
      // Idempotent: same failed transaction, no additional retry increment.
      return transaction;
    }

    if (transaction.status === STATUS.CONFIRMED) {
      throw new Error(`Cannot fail transaction ${transactionId}: a confirmed payment cannot be failed`);
    }

    if (transaction.status !== STATUS.PENDING) {
      throw new Error(
        `Cannot fail transaction ${transactionId}: invalid transition from "${transaction.status}" to "${STATUS.FAILED}"`
      );
    }

    return this.repository.update(transactionId, {
      status: STATUS.FAILED,
      retries: (transaction.retries || 0) + 1,
    });
  }
    /**
   * Attempt external settlement.
   *
   * SECURITY BOUNDARY:
   * This operation is intentionally separate from createPayment()/complete().
   * Real value movement requires:
   *   1. an explicitly injected, verified settlement adapter
   *   2. explicit human authorization
   *
   * The default adapter is disabled and will always reject settlement.
   *
   * @param {string} transactionId
   * @param {{ humanApproved?: boolean }} authorization
   * @returns {Promise<object>}
   */
  async settle(transactionId, authorization = {}) {
    const transaction = this.repository.get(transactionId);

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (authorization.humanApproved !== true) {
      throw new Error('Human authorization is required for settlement');
    }

    if (!this.settlementAdapter?.enabled) {
      throw new Error('External settlement is disabled by default');
    }

    return this.settlementAdapter.settle(transaction, authorization);
  }

  /**
   * Retry a failed transaction, transitioning it back to pending so it can
   * be confirmed or failed again. Does NOT generate a new transactionId and
   * does NOT reset retries/retryCount (that only changes on the next
   * pending -> failed transition, per failPayment).
   *  - missing   -> throws "Transaction not found"
   *  - pending   -> rejected; already pending
   *  - confirmed -> rejected; confirmed payments cannot be retried
   *  - failed    -> failed -> pending
   * @param {string} transactionId
   * @returns {object} the transaction record, now pending
   */
  retryPayment(transactionId) {
    const transaction = this.repository.get(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.status === STATUS.PENDING) {
      throw new Error(`Cannot retry transaction ${transactionId}: it is already pending`);
    }

    if (transaction.status === STATUS.CONFIRMED) {
      throw new Error(`Cannot retry transaction ${transactionId}: confirmed payments cannot be retried`);
    }

    if (transaction.status !== STATUS.FAILED) {
      throw new Error(
        `Cannot retry transaction ${transactionId}: invalid transition from "${transaction.status}" to "${STATUS.PENDING}"`
      );
    }

    return this.repository.update(transactionId, {
      status: STATUS.PENDING,
    });
  }

  /** @param {string} transactionId @returns {object|undefined} */
  get(transactionId) {
    return this.repository.get(transactionId);
  }

  /** @param {string} transactionId */
  reconcile(transactionId) {
    const transaction = this.repository.get(transactionId);
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


EscrowService.STATUS = STATUS;

module.exports = { EscrowService };