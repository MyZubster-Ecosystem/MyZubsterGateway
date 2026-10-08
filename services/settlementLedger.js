const BountySettlement = require('../models/BountySettlement');
const { createVerifier } = require('./transactionVerifier');

const verifier = createVerifier();

async function appendAudit(record, status, actor, note) {
  record.auditTrail = record.auditTrail || [];
  record.auditTrail.push({ status, timestamp: new Date(), actor, note });
}

async function createSettlement({
  bountyId, prId, contributor, asset, amount, network, destination, simulation = false, actor = 'system'
}) {
  const idempotencyKey = `${bountyId}:${prId || 'no-pr'}:${asset}:${amount}:${destination}`;
  const existing = await BountySettlement.findOne({ idempotencyKey });
  if (existing) {
    const err = new Error('Duplicate settlement for idempotency key');
    err.code = 11000;
    throw err;
  }

  const record = new BountySettlement({
    bountyId,
    prId,
    contributor,
    asset,
    amount,
    network,
    destination,
    simulation,
    idempotencyKey,
    status: 'PENDING'
  });
  await appendAudit(record, 'PENDING', actor, 'Settlement record created');
  await record.save();
  return record;
}

async function transitionStatus(record, nextStatus, actor, note) {
  const allowed = {
    PENDING: ['ACCEPTED', 'FAILED', 'UNSETTLED'],
    ACCEPTED: ['SUBMITTED', 'FAILED', 'UNSETTLED'],
    SUBMITTED: ['CONFIRMED', 'FAILED', 'UNSETTLED'],
    CONFIRMED: ['PAID', 'DISPUTED', 'UNSETTLED'],
    PAID: [],
    FAILED: ['UNSETTLED'],
    UNSETTLED: ['ACCEPTED', 'FAILED'],
    DISPUTED: ['UNSETTLED', 'FAILED']
  };

  const current = record.status;
  if (!allowed[current] || !allowed[current].includes(nextStatus)) {
    throw new Error(`Illegal state transition: ${current} -> ${nextStatus}`);
  }

  record.status = nextStatus;
  await appendAudit(record, nextStatus, actor, note);
  await record.save();
  return record;
}

async function submitTransaction(record, txId, actor = 'system') {
  if (!txId) {
    throw new Error('txId is required for SUBMITTED');
  }
  record.txId = txId;
  record.txVerificationStatus = 'pending';
  await transitionStatus(record, 'SUBMITTED', actor, `Transaction submitted: ${txId}`);
  return record;
}

async function verifyTransaction(record, actor = 'system') {
  if (!record.txId) {
    throw new Error('No txId to verify');
  }

  const result = verifier.verify({ txId: record.txId, network: record.network, asset: record.asset });
  record.txVerificationStatus = result.status;
  await appendAudit(record, record.status, actor, `Verification result: ${result.detail}`);
  await record.save();
  return { record, verification: result };
}

async function confirmTransaction(record, actor = 'system') {
  if (record.txVerificationStatus !== 'verified') {
    throw new Error('Transaction must be verified before CONFIRMED');
  }
  await transitionStatus(record, 'CONFIRMED', actor, 'Transaction independently verified');
  return record;
}

async function markPaid(record, actor = 'system') {
  if (record.status !== 'CONFIRMED') {
    throw new Error('Only CONFIRMED settlements can reach PAID');
  }
  if (record.txVerificationStatus !== 'verified') {
    throw new Error('PAID requires verified transaction');
  }
  await transitionStatus(record, 'PAID', actor, 'Marked as paid after verification');
  return record;
}

async function reconcile() {
  const needsReview = await BountySettlement.find({
    $or: [
      { status: 'UNSETTLED' },
      { status: 'DISPUTED' },
      { txVerificationStatus: 'unverified' },
      { txId: null }
    ]
  });

  const totals = await BountySettlement.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  const missingTx = await BountySettlement.countDocuments({ txId: null });
  const paidWithoutVerification = await BountySettlement.countDocuments({
    status: 'PAID',
    txVerificationStatus: { $ne: 'verified' }
  });

  return {
    totals,
    needsReviewCount: needsReview.length,
    needsReview,
    missingTxCount: missingTx,
    paidWithoutVerificationCount: paidWithoutVerification
  };
}

module.exports = {
  createSettlement,
  transitionStatus,
  submitTransaction,
  verifyTransaction,
  confirmTransaction,
  markPaid,
  reconcile
};
