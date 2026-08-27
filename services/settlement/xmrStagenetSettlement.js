'use strict';

const STAGENET = 'stagenet';
const XMR = 'XMR';
const ATOMIC_RE = /^[1-9][0-9]*$/;
const TXID_RE = /^[0-9a-fA-F]{64}$/;
const MONERO_BASE58_RE = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
const STANDARD_ADDRESS_LENGTH = 95;
const INTEGRATED_ADDRESS_LENGTH = 106;

function normalizeAtomic(value) {
  const atomic = String(value ?? '');
  if (!ATOMIC_RE.test(atomic)) throw new Error('amountAtomic must be a positive decimal integer string');
  return atomic;
}

function assertStagenetRecipient(recipient) {
  if (typeof recipient !== 'string') throw new Error('recipient is required');
  const address = recipient.trim();
  if (!address) throw new Error('recipient is required');
  if (!MONERO_BASE58_RE.test(address)) throw new Error('recipient must be a Monero base58 address');

  const validLength = address.length === STANDARD_ADDRESS_LENGTH || address.length === INTEGRATED_ADDRESS_LENGTH;
  if (!validLength) throw new Error('recipient must have a valid Monero address length');

  // Monero stagenet standard/integrated addresses begin with 5; stagenet
  // subaddresses begin with 7. This is a network/format guard. Final economic
  // verification must still use the independently configured Monero verifier.
  const expectedPrefix = address.length === INTEGRATED_ADDRESS_LENGTH ? '5' : null;
  if (expectedPrefix && address[0] !== expectedPrefix) {
    throw new Error('recipient is not a Monero stagenet address');
  }
  if (!expectedPrefix && address[0] !== '5' && address[0] !== '7') {
    throw new Error('recipient is not a Monero stagenet address');
  }

  return address;
}

function assertStagenetIntent(intent = {}) {
  if (!intent.settlementId || typeof intent.settlementId !== 'string' || !intent.settlementId.trim()) {
    throw new Error('settlementId is required');
  }
  if (intent.asset !== XMR) throw new Error('asset must be XMR');
  if (intent.network !== STAGENET) throw new Error('XMR settlement is stagenet-only');
  return {
    ...intent,
    settlementId: intent.settlementId.trim(),
    asset: XMR,
    network: STAGENET,
    recipient: assertStagenetRecipient(intent.recipient),
    amountAtomic: normalizeAtomic(intent.amountAtomic),
    status: intent.status || 'PENDING'
  };
}

function assertTxId(txId) {
  if (!TXID_RE.test(String(txId || ''))) throw new Error('txId must be a 64-character hexadecimal Monero transaction id');
  return String(txId).toLowerCase();
}

function assertExistingSubmissionMatches(existingSubmission, normalizedIntent) {
  if (!existingSubmission || typeof existingSubmission !== 'object') {
    throw new Error('existing submission must be an object');
  }
  if (existingSubmission.settlementId !== normalizedIntent.settlementId) {
    throw new Error('existing submission belongs to a different settlementId');
  }
  if (existingSubmission.asset !== XMR || existingSubmission.network !== STAGENET) {
    throw new Error('existing submission asset/network mismatch');
  }
  if (assertStagenetRecipient(existingSubmission.recipient) !== normalizedIntent.recipient) {
    throw new Error('existing submission recipient mismatch');
  }
  if (normalizeAtomic(existingSubmission.amountAtomic) !== normalizedIntent.amountAtomic) {
    throw new Error('existing submission amount mismatch');
  }
  if (existingSubmission.status !== 'SUBMITTED') {
    throw new Error('existing submission must be SUBMITTED');
  }
  assertTxId(existingSubmission.txId);
  return existingSubmission;
}

/**
 * Submission boundary. The injected submitTransaction function is expected to
 * talk to an explicitly configured monero-wallet-rpc STAGENET instance.
 * Its response can only advance a settlement to SUBMITTED.
 */
async function submitXmrStagenet({ intent, submitTransaction, existingSubmission = null }) {
  const normalized = assertStagenetIntent(intent);

  if (existingSubmission) {
    return assertExistingSubmissionMatches(existingSubmission, normalized);
  }

  if (typeof submitTransaction !== 'function') throw new TypeError('submitTransaction is required');

  const result = await submitTransaction({
    settlementId: normalized.settlementId,
    network: STAGENET,
    recipient: normalized.recipient,
    amountAtomic: normalized.amountAtomic
  });

  const txId = assertTxId(result && result.txId);
  return {
    settlementId: normalized.settlementId,
    asset: XMR,
    network: STAGENET,
    recipient: normalized.recipient,
    amountAtomic: normalized.amountAtomic,
    txId,
    status: 'SUBMITTED'
  };
}

function verificationMatchesExpected(verification, expected, minConfirmations) {
  if (!verification || verification.verified !== true) return false;
  if (String(verification.txId || '').toLowerCase() !== expected.txId) return false;
  if (verification.asset !== XMR || verification.network !== STAGENET) return false;
  if (verification.recipientMatch !== true || verification.amountMatch !== true) return false;
  if (verification.confirmed !== true) return false;
  const confirmations = Number(verification.confirmations);
  if (!Number.isInteger(confirmations) || confirmations < minConfirmations) return false;
  if (!verification.evidenceMethod || typeof verification.evidenceMethod !== 'string') return false;
  return true;
}

/**
 * Independent verification boundary. The verifier must not expose transfer or
 * signing capability. Any exception, timeout, malformed result, mismatch, or
 * insufficient confirmations leaves the settlement UNSETTLED.
 */
async function verifyXmrStagenet({ submission, verifyTransaction, minConfirmations = 10 }) {
  if (typeof verifyTransaction !== 'function') throw new TypeError('verifyTransaction is required');
  if (!Number.isInteger(minConfirmations) || minConfirmations < 1) throw new Error('minConfirmations must be a positive integer');
  if (!submission || submission.status !== 'SUBMITTED') throw new Error('settlement must be SUBMITTED before verification');
  if (submission.asset !== XMR || submission.network !== STAGENET) throw new Error('submission must be XMR stagenet');

  const expected = {
    txId: assertTxId(submission.txId),
    asset: XMR,
    network: STAGENET,
    recipient: assertStagenetRecipient(submission.recipient),
    amountAtomic: normalizeAtomic(submission.amountAtomic)
  };

  let verification;
  try {
    verification = await verifyTransaction({
      settlementId: submission.settlementId,
      txId: expected.txId,
      expected: {
        asset: XMR,
        network: STAGENET,
        recipient: expected.recipient,
        amountAtomic: expected.amountAtomic
      }
    });
  } catch (error) {
    return { ...submission, status: 'UNSETTLED', verificationError: 'verifier_unavailable' };
  }

  if (!verificationMatchesExpected(verification, expected, minConfirmations)) {
    return { ...submission, status: 'UNSETTLED', verification };
  }

  return {
    ...submission,
    status: 'PAID',
    verification: {
      txId: expected.txId,
      asset: XMR,
      network: STAGENET,
      recipientMatch: true,
      amountMatch: true,
      confirmed: true,
      confirmations: Number(verification.confirmations),
      evidenceMethod: verification.evidenceMethod
    }
  };
}

module.exports = {
  STAGENET,
  XMR,
  assertStagenetRecipient,
  assertStagenetIntent,
  submitXmrStagenet,
  verifyXmrStagenet
};
