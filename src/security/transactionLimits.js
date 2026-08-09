const mongoose = require('mongoose');

const limitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  dailyLimit: {
    type: Number,
    default: 10000
  },
  perTransactionLimit: {
    type: Number,
    default: 5000
  },
  dailySpent: {
    type: Number,
    default: 0
  },
  lastResetDate: {
    type: Date,
    default: Date.now
  },
  require2FAThreshold: {
    type: Number,
    default: 1000
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Limits = mongoose.model('TransactionLimits', limitSchema);

class TransactionLimitsService {
  /**
   * Get or create limits for a user
   */
  static async getLimits(userId) {
    let limits = await Limits.findOne({ userId });
    if (!limits) {
      limits = await Limits.create({ userId });
    }
    
    // Reset daily spent if new day
    const now = new Date();
    const lastReset = new Date(limits.lastResetDate);
    if (now.toDateString() !== lastReset.toDateString()) {
      limits.dailySpent = 0;
      limits.lastResetDate = now;
      await limits.save();
    }
    
    return limits;
  }

  /**
   * Check if a transaction is within limits
   */
  static async checkTransaction(userId, amount, options = {}) {
    const limits = await this.getLimits(userId);
    
    const checks = [];
    
    // Per-transaction limit
    if (amount > limits.perTransactionLimit) {
      checks.push({
        passed: false,
        rule: 'perTransactionLimit',
        limit: limits.perTransactionLimit,
        amount,
        message: `Amount ${amount} exceeds per-transaction limit of ${limits.perTransactionLimit}`
      });
    }
    
    // Daily limit
    if (limits.dailySpent + amount > limits.dailyLimit) {
      checks.push({
        passed: false,
        rule: 'dailyLimit',
        limit: limits.dailyLimit,
        current: limits.dailySpent,
        amount,
        message: `Cumulative daily total of ${limits.dailySpent + amount} would exceed daily limit of ${limits.dailyLimit}`
      });
    }
    
    const allPassed = checks.length === 0;
    
    return {
      allowed: allPassed,
      checks,
      requires2FA: amount >= limits.require2FAThreshold,
      dailyRemaining: limits.dailyLimit - limits.dailySpent
    };
  }

  /**
   * Record a successful transaction
   */
  static async recordTransaction(userId, amount) {
    const limits = await this.getLimits(userId);
    limits.dailySpent += amount;
    limits.updatedAt = new Date();
    await limits.save();
    
    return {
      dailyRemaining: limits.dailyLimit - limits.dailySpent,
      dailySpent: limits.dailySpent
    };
  }

  /**
   * Update limits for a user
   */
  static async updateLimits(userId, updates) {
    const allowed = ['dailyLimit', 'perTransactionLimit', 'require2FAThreshold'];
    const filtered = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        filtered[key] = updates[key];
      }
    }
    
    const limits = await Limits.findOneAndUpdate(
      { userId },
      { ...filtered, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    
    return limits;
  }
}

module.exports = TransactionLimitsService;
