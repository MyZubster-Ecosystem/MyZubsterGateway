class HeraRobot {
  constructor(data) {
    this.id = data.id || data.robotId || `hera-${Date.now()}`;
    this.name = data.name || 'Hera Robot';
    this.type = data.type || 'urban_agriculture';
    this.brand = data.brand || 'MyZubster';
    this.model = data.model || 'Hera v1.0';
    this.walletAddress = data.walletAddress || '45M4DW1ug8bdQowWpxucTpgsfjLbVxbYaAra79VewmBobuuhgqTjyD4R3DzpqLM2veiphcB16n24qN1QbLg3y2PYGK3Qkoe';
    this.owner = data.owner || '45M4DW1ug8bdQowWpxucTpgsfjLbVxbYaAra79VewmBobuuhgqTjyD4R3DzpqLM2veiphcB16n24qN1QbLg3y2PYGK3Qkoe';
    this.capabilities = data.capabilities || [];
    this.metadata = {
      batteryLife: data.metadata?.batteryLife || 120,
      weight: data.metadata?.weight || 5.2,
      sensors: data.metadata?.sensors || ['ph', 'temperature', 'humidity', 'light', 'moisture'],
      firmware: data.metadata?.firmware || 'hera-v1.0.0',
      autonomy: data.metadata?.autonomy || 120,
      chargingTime: data.metadata?.chargingTime || 60,
      areaCapacity: data.metadata?.areaCapacity || 50,
      ...data.metadata
    };
    this.status = data.status || 'registered';
    this.balance = data.balance || 0;
    this.registeredAt = data.registeredAt || new Date().toISOString();
    this.lastActive = data.lastActive || new Date().toISOString();
    this.totalEarnings = data.totalEarnings || 0;
    this.jobsCompleted = data.jobsCompleted || 0;
    this.areaCovered = data.areaCovered || 0;
    this.plantsTended = data.plantsTended || 0;
  }
  
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      brand: this.brand,
      model: this.model,
      walletAddress: this.walletAddress,
      owner: this.owner,
      capabilities: this.capabilities,
      metadata: this.metadata,
      status: this.status,
      balance: this.balance,
      registeredAt: this.registeredAt,
      lastActive: this.lastActive,
      totalEarnings: this.totalEarnings,
      jobsCompleted: this.jobsCompleted,
      areaCovered: this.areaCovered,
      plantsTended: this.plantsTended
    };
  }
}

module.exports = HeraRobot;
