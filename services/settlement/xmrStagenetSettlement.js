'use strict';

const STAGENET = 'stagenet';
const XMR = 'XMR';
const ATOMIC_RE = /^[1-9][0-9]*$/;
const TXID_RE = /^[0-9a-fA-F]{64}$/;

function normalizeAtomic(value) {
  const atomic = String(value ?? '');
  if (!ATOMIC_RE.test(atomic)) throw new Error('amountAtomic must be a positive decimal integer string');
  return atomic;
}

function assertStagenetIntent(intent = {}) {
  if (!intent.settlementId) throw new Error('settlementId is required');
  if (intent.asset !== XMR) throw new Error('asset must be XMR');
  if (intent.network !== STAGENET) throw new Error('XMR settlement is stagenet-only');
  if (!intent.recipient || typeof intent.recipient !== 'string') throw new Error('recipient is required');
  return {
    ...intent,
    asset: XMR,
    network: STAGENET,
    amountAtomic: normalizeAtomic(intent.amountAtomic),
    status: intent.status || 'PENDING'
  };
}

function assertTxId(txId) {
  if (!TXID_RE.test(String(txId || ''))) throw new Error('txId must be a 64-character hexadecimal Monero transaction id');
  return String(txId).toLowerCase();
}

/**
 * Submission boundary. The injected submitTransaction function is expected to
 * talk to an explicitly configured monero-wallet-rpc STAGENET instance.
 * Its response can only advance a settlement to SUBMITTED.
 */
async function submitXmrStagenet({ intent, submitTransaction, existingSubmission = null }) {
  const normalized = assertStagenetIntent(intent);
  if (typeof submitTransaction !== 'function') throw new TypeError('submitTransaction is required');

  if (existingSubmission) {
    if (existingSubmission.settlementId !== normalized.settlementId) {
      throw new Error('existing submission belongs to a different settlementId');
    }
    return existingSubmission;
  }

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
    recipient: submission.recipient,
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
  assertStagenetIntent,
  submitXmrStagenet,
  verifyXmrStagenet
};
