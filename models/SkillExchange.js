const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    applicantId: { type: String, required: true, trim: true },
    message: { type: String, trim: true, maxlength: 1000, default: '' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending',
    },
  },
  { timestamps: true, _id: true }
);

const reviewSchema = new mongoose.Schema(
  {
    reviewerId: { type: String, required: true, trim: true },
    revieweeId: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000, default: '' },
  },
  { timestamps: true, _id: true }
);

const skillExchangeSchema = new mongoose.Schema(
  {
    ownerId: { type: String, required: true, index: true, trim: true },
    participantId: { type: String, default: null, index: true, trim: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    offeredSkill: { type: String, required: true, trim: true, maxlength: 120, index: true },
    requestedSkill: { type: String, required: true, trim: true, maxlength: 120, index: true },
    mode: { type: String, enum: ['remote', 'local', 'hybrid'], default: 'remote' },
    location: { type: String, trim: true, maxlength: 160, default: '' },
    status: {
      type: String,
      enum: ['open', 'matched', 'active', 'completed', 'cancelled'],
      default: 'open',
      index: true,
    },
    applications: { type: [applicationSchema], default: [] },
    startConfirmedBy: { type: [String], default: [] },
    completionConfirmedBy: { type: [String], default: [] },
    reviews: { type: [reviewSchema], default: [] },
  },
  { timestamps: true }
);

skillExchangeSchema.index({ status: 1, offeredSkill: 1, requestedSkill: 1, createdAt: -1 });

module.exports = mongoose.models.SkillExchange || mongoose.model('SkillExchange', skillExchangeSchema);
