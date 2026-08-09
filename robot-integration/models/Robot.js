class Robot {
  constructor(data) {
    this.id = data.id || data.robotId;
    this.name = data.name;
    this.brand = data.brand || 'Generic';
    this.model = data.model || 'Standard';
    this.type = data.type || 'general';
    this.walletAddress = data.walletAddress;
    this.owner = data.owner;
    this.capabilities = data.capabilities || [];
    this.metadata = data.metadata || {};
    this.status = data.status || 'registered';
    this.balance = data.balance || 0;
    this.registeredAt = data.registeredAt || new Date().toISOString();
    this.lastActive = data.lastActive || new Date().toISOString();
    this.clones = data.clones || [];
    this.parentId = data.parentId || null;
    this.referralEarnings = data.referralEarnings || 0;
    this.totalEarnings = data.totalEarnings || 0;
  }
  
  // Metodi del robot
  async requestPayment(amount, currency = 'XMR') {
    // Implementa x402
  }
  
  async getJobs() {
    // Ottieni lavori assegnati
  }
  
  async completeJob(jobId, result) {
    // Completa un lavoro
  }
  
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      brand: this.brand,
      model: this.model,
      type: this.type,
      walletAddress: this.walletAddress,
      owner: this.owner,
      capabilities: this.capabilities,
      metadata: this.metadata,
      status: this.status,
      balance: this.balance,
      registeredAt: this.registeredAt,
      lastActive: this.lastActive,
      clones: this.clones,
      parentId: this.parentId,
      referralEarnings: this.referralEarnings,
      totalEarnings: this.totalEarnings
    };
  }
}

module.exports = Robot;
