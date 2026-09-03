const mongoose = require('mongoose');

const BountySettlementSchema = new mongoose.Schema({
  bountyId: { type: String, required: true, index: true },
  prId: { type: String, default: null },
  contributor: { type: String, required: true },
  asset: { type: String, required: true, enum: ['XMR', 'MYZ', 'ETH', 'USDC', 'BTC', 'MYZ-TEST', 'XMR-TEST'] },
  amount: { type: Number, required: true, min: 0 },
  network: { type: String, required: true },
  destination: { type: String, required: true },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'SUBMITTED', 'CONFIRMED', 'PAID', 'FAILED', 'UNSETTLED', 'DISPUTED'],
    default: 'PENDING'
  },
  txId: { type: String, default: null },
  txVerificationStatus: {
    type: String,
    enum: ['unverified', 'pending', 'verified', 'invalid'],
    default: 'unverified'
  },
  simulation: { type: Boolean, default: false },
  idempotencyKey: { type: String, required: true, unique: true },
  failureReason: { type: String, default: null },
  auditTrail: [{
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    actor: { type: String, required: true },
    note: { type: String, default: null }
  }],
  metadata: { type: Object, default: {} }
}, { timestamps: true });

// Partial unique index: at most one PAID row per bountyId
BountySettlementSchema.index(
  { bountyId: 1 },
  { unique: true, partialFilterExpression: { status: 'PAID' } }
);

module.exports = mongoose.model('BountySettlement', BountySettlementSchema);
