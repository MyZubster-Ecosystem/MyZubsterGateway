// Transaction Limits Service — Closes #713
class TransactionLimitsService {
  constructor() {
    this.defaults = {
      dailyLimit: 10000,    // 10,000 MYZ default daily
      singleLimit: 5000,    // 5,000 MYZ max single tx
      hourlyLimit: 2000,    // 2,000 MYZ per hour
    };
    this.userLimits = new Map();    // userId => custom limits
    this.userVolumes = new Map();   // userId => {daily: N, hourly: N, lastHour: timestamp}
  }

  setUserLimit(userId, limitType, value) {
    if (!this.userLimits.has(userId)) {
      this.userLimits.set(userId, {...this.defaults});
    }
    this.userLimits.get(userId)[limitType] = value;
  }

  getUserLimits(userId) {
    return this.userLimits.get(userId) || {...this.defaults};
  }

  checkTransaction(userId, amount) {
    const limits = this.getUserLimits(userId);

    // Check single transaction limit
    if (amount > limits.singleLimit) {
      return { allowed: false, reason: Single transaction exceeds limit of 5000 MYZ };
    }

    // Check hourly limit
    const now = Date.now();
    if (!this.userVolumes.has(userId)) {
      this.userVolumes.set(userId, { daily: 0, hourly: 0, lastHour: now, lastDay: now });
    }
    const vol = this.userVolumes.get(userId);

    // Reset hourly if needed
    if (now - vol.lastHour > 3600000) {
      vol.hourly = 0;
      vol.lastHour = now;
    }

    // Reset daily if needed
    if (now - vol.lastDay > 86400000) {
      vol.daily = 0;
      vol.lastDay = now;
    }

    if (vol.hourly + amount > limits.hourlyLimit) {
      return { allowed: false, reason: Hourly limit of 2000 MYZ would be exceeded };
    }

    if (vol.daily + amount > limits.dailyLimit) {
      return { allowed: false, reason: Daily limit of 10000 MYZ would be exceeded };
    }

    // Record volume
    vol.hourly += amount;
    vol.daily += amount;

    return { allowed: true, remaining: {
      single: limits.singleLimit,
      hourly: limits.hourlyLimit - vol.hourly,
      daily: limits.dailyLimit - vol.daily
    }};
  }

  resetLimits(userId) {
    this.userVolumes.delete(userId);
    this.userLimits.delete(userId);
  }

  getUserVolume(userId) {
    if (!this.userVolumes.has(userId)) return null;
    return { ...this.userVolumes.get(userId) };
  }
}
module.exports = new TransactionLimitsService();
