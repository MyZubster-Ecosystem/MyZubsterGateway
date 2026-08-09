const mongoose = require('mongoose');

const whitelistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address: {
    type: String,
    required: true
  },
  label: String,
  network: {
    type: String,
    default: 'tari'
  },
  verified: {
    type: Boolean,
    default: false
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

whitelistSchema.index({ userId: 1, address: 1 }, { unique: true });

const Whitelist = mongoose.model('Whitelist', whitelistSchema);

class WhitelistService {
  /**
   * Add address to whitelist
   */
  static async addAddress(userId, address, label = '', network = 'tari') {
    const entry = await Whitelist.findOneAndUpdate(
      { userId, address },
      { label, network, verified: true },
      { upsert: true, new: true }
    );
    return entry;
  }

  /**
   * Remove address from whitelist
   */
  static async removeAddress(userId, address) {
    await Whitelist.deleteOne({ userId, address });
    return { removed: true };
  }

  /**
   * Check if address is whitelisted
   */
  static async isWhitelisted(userId, address) {
    const entry = await Whitelist.findOne({ userId, address });
    return !!entry;
  }

  /**
   * Get all whitelisted addresses for a user
   */
  static async getAddresses(userId, network = null) {
    const filter = { userId };
    if (network) filter.network = network;
    return await Whitelist.find(filter).sort({ addedAt: -1 });
  }

  /**
   * Check if transaction destination is allowed
   */
  static async validateTransaction(userId, destinationAddress, options = {}) {
    const { enforceWhitelist = false } = options;
    
    if (enforceWhitelist) {
      const allowed = await this.isWhitelisted(userId, destinationAddress);
      if (!allowed) {
        return {
          allowed: false,
          reason: `Address ${destinationAddress} is not whitelisted.`
        };
      }
    }
    
    return { allowed: true };
  }
}

module.exports = WhitelistService;
