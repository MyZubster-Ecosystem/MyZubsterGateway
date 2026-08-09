// Address Whitelist Service — Closes #713
const crypto = require('crypto');

class WhitelistService {
  constructor() {
    this.whitelist = new Map(); // userId => Set<address>
    this.maxAddresses = 20; // Maximum whitelist entries per user
  }

  addAddress(userId, address) {
    if (!this.whitelist.has(userId)) {
      this.whitelist.set(userId, new Set());
    }
    const userList = this.whitelist.get(userId);
    if (userList.size >= this.maxAddresses) {
      throw new Error(Maximum whitelist size (20) exceeded);
    }
    // Normalize address
    const normalized = address.toLowerCase().trim();
    if (userList.has(normalized)) {
      return false; // Already in whitelist
    }
    userList.add(normalized);
    return true;
  }

  removeAddress(userId, address) {
    if (!this.whitelist.has(userId)) return false;
    return this.whitelist.get(userId).delete(address.toLowerCase().trim());
  }

  isWhitelisted(userId, address) {
    if (!this.whitelist.has(userId)) return false;
    return this.whitelist.get(userId).has(address.toLowerCase().trim());
  }

  getWhitelist(userId) {
    if (!this.whitelist.has(userId)) return [];
    return Array.from(this.whitelist.get(userId));
  }

  // Check if address is trusted (whitelisted OR first-time)
  verifyAddress(userId, address) {
    if (!this.whitelist.has(userId) || this.whitelist.get(userId).size === 0) {
      return { trusted: true, reason: 'first_time' };
    }
    if (this.isWhitelisted(userId, address)) {
      return { trusted: true, reason: 'whitelisted' };
    }
    return { trusted: false, reason: 'not_whitelisted' };
  }
}
module.exports = new WhitelistService();
