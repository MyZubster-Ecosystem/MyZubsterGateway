// services/moneroBlockchainService.js — Blockchain confirmations + security
const EventEmitter = require('events');

class MoneroBlockchainService extends EventEmitter {
  constructor() {
    super();
    this.pendingChecks = new Map();
    this.confirmationThreshold = parseInt(process.env.MONERO_CONFIRMATIONS) || 10;
    this.checkInterval = parseInt(process.env.MONERO_CHECK_INTERVAL_MS) || 30000;
    this.maxRetries = 5;
    this.retryDelay = 10000;
    
    // Start periodic check
    this._interval = setInterval(() => this._checkPending(), this.checkInterval);
    console.log('[BLOCKCHAIN] Monitoring service started');
  }

  // Track a transaction for confirmation
  trackTransaction(txId, requiredConfirmations = this.confirmationThreshold) {
    const tracker = {
      txId,
      requiredConfirmations,
      currentConfirmations: 0,
      status: 'pending',
      retries: 0,
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.pendingChecks.set(txId, tracker);
    return tracker;
  }

  // Get current confirmation count
  async getConfirmations(txId) {
    const tracker = this.pendingChecks.get(txId);
    if (!tracker) return 0;
    return tracker.currentConfirmations;
  }

  // Internal: check all pending transactions
  async _checkPending() {
    for (const [txId, tracker] of this.pendingChecks) {
      if (tracker.status === 'confirmed' || tracker.status === 'failed') continue;
      
      try {
        // Simulate blockchain check (in production: query daemon)
        tracker.currentConfirmations += Math.floor(Math.random() * 3) + 1;
        tracker.updatedAt = new Date().toISOString();
        
        if (tracker.currentConfirmations >= tracker.requiredConfirmations) {
          tracker.status = 'confirmed';
          this.emit('confirmed', { txId, confirmations: tracker.currentConfirmations });
          this.pendingChecks.delete(txId);
        }
      } catch (err) {
        tracker.retries++;
        if (tracker.retries >= this.maxRetries) {
          tracker.status = 'failed';
          this.emit('failed', { txId, error: err.message });
        }
      }
    }
  }

  // Security: validate transaction structure
  validateTransaction(tx) {
    const required = ['txId', 'amount', 'address'];
    for (const field of required) {
      if (!tx[field]) {
        return { valid: false, error: `Missing field: ${field}` };
      }
    }
    if (tx.amount <= 0 || tx.amount > 100000) {
      return { valid: false, error: 'Amount out of range (0-100000 XMR)' };
    }
    return { valid: true };
  }

  // Cleanup
  stop() {
    clearInterval(this._interval);
    this.pendingChecks.clear();
  }
}

module.exports = new MoneroBlockchainService();
