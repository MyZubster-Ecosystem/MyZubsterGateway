const mongoose = require('mongoose');

const twoFactorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  secret: {
    type: String,
    required: true
  },
  enabled: {
    type: Boolean,
    default: false
  },
  backupCodes: [{
    code: String,
    used: { type: Boolean, default: false }
  }],
  lastVerified: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

twoFactorSchema.index({ userId: 1 });

module.exports = mongoose.model('TwoFactor', twoFactorSchema);
