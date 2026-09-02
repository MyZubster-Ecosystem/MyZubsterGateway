'use strict';

const mongoose = require('mongoose');

const STATES = ['PENDING', 'ACCEPTED', 'SUBMITTED', 'CONFIRMED', 'PAID', 'FAILED', 'UNSETTLED', 'DISPUTED'];

const AuditEntrySchema = new mongoose.Schema(
  {
    status: { type: String, enum: STATES, required: true },
    at: { type: Date, required: true },
    actor: { type: String, default: null },
    reason: { type: String, default: null }
  },
  { _id: false }
);

const VerificationSchema = new mongoose.Schema(
  {
    verified: { type: Boolean, required: true },
    confirmed: { type: Boolean, required: true },
    txId: { type: String, default: null },
    network: { type: String, default: null },
    destination: { type: String, default: null },
    amount: { type: String, default: null },
    asset: { type: String, default: null },
    verificationSource: { type: String, default: null },
    checkedAt: { type: Date, required: true }
  },
  { _id: false }
);

const BountySettlementSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    bountyId: { type: String, required: true, unique: true, index: true },
    issueNumber: { type: Number, default: null },
    pullRequestId: { type: String, default: null },
    contributor: { type: String, required: true },
    amount: { type: String, required: true },
    asset: { type: String, required: true },
    network: { type: String, required: true },
    destination: { type: String, required: true },
    mode: { type: String, enum: ['real', 'simulation'], required: true, default: 'real' },
    status: { type: String, enum: STATES, required: true, default: 'PENDING', index: true },
    reviewer: { type: String, default: null },
    txId: { type: String, default: null },
    verification: { type: VerificationSchema, default: null },
    audit: { type: [AuditEntrySchema], default: [] },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true }
  },
  {
    collection: 'bounty_settlements',
    versionKey: false
  }
);

BountySettlementSchema.index(
  { bountyId: 1, status: 1 },
  { name: 'bounty_settlement_status' }
);

module.exports =
  mongoose.models.BountySettlement ||
  mongoose.model('BountySettlement', BountySettlementSchema);
