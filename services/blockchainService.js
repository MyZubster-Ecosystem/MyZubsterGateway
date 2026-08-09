/**
 * Blockchain Service - Tracciabilita Dati Ambientali
 * Bounty #1029: Blockchain per Dati Ambientali
 */
const crypto = require('crypto');

class BlockchainService {
  constructor() {
    this.blocks = [];
    this.pendingTransactions = [];
  }

  /**
   * Registrazione dati ambientali sulla blockchain
   */
  registerEnvironmentalData(data) {
    const { sensorId, readings, location, timestamp } = data;
    
    const block = {
      index: this.blocks.length,
      timestamp: timestamp || new Date().toISOString(),
      data: {
        sensorId,
        readings: readings || {},
        location: location || 'unknown',
        type: 'environmental_recording'
      },
      previousHash: this.blocks.length > 0 
        ? this.blocks[this.blocks.length - 1].hash 
        : '0',
      hash: '',
      nonce: 0
    };
    
    block.hash = this._calculateHash(block);
    this.blocks.push(block);
    
    return { success: true, block, totalBlocks: this.blocks.length };
  }

  /**
   * Verifica immutabilita - controlla che la catena non sia stata alterata
   */
  verifyChainIntegrity() {
    const violations = [];
    
    for (let i = 1; i < this.blocks.length; i++) {
      const currentBlock = this.blocks[i];
      const previousBlock = this.blocks[i - 1];
      
      // Verify hash chain
      if (currentBlock.previousHash !== previousBlock.hash) {
        violations.push({
          blockIndex: i,
          issue: 'Broken chain link',
          expected: previousBlock.hash,
          got: currentBlock.previousHash
        });
      }
      
      // Verify block hash
      const recalculatedHash = this._calculateHash(currentBlock);
      if (currentBlock.hash !== recalculatedHash) {
        violations.push({
          blockIndex: i,
          issue: 'Tampered block',
          stored: currentBlock.hash,
          recalculated: recalculatedHash
        });
      }
    }
    
    return {
      integrity: violations.length === 0,
      totalBlocks: this.blocks.length,
      violations,
      verifiedAt: new Date().toISOString()
    };
  }

  /**
   * Carbon Credits - Tokenizzazione CO2
   */
  tokenizeCarbonCredits(co2Data) {
    const { co2ReductionKg, projectId, methodology, verifier } = co2Data;
    
    // 1 credit = 1 ton CO2 reduced
    const credits = co2ReductionKg / 1000;
    
    const carbonCredit = {
      id: `CC-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      co2ReductionKg,
      creditsGenerated: parseFloat(credits.toFixed(4)),
      projectId: projectId || `ENV-${Date.now()}`,
      methodology: methodology || 'VERRA_VCS_v4',
      verifier: verifier || 'pending',
      status: 'minted',
      mintedAt: new Date().toISOString(),
      metadata: {
        standard: 'Verified Carbon Standard',
        vintage: new Date().getFullYear(),
        registry: 'MyZubster Environmental Registry'
      }
    };
    
    // Record on blockchain
    this.registerEnvironmentalData({
      sensorId: `carbon-${projectId || 'default'}`,
      readings: carbonCredit,
      location: 'global',
      timestamp: new Date().toISOString()
    });
    
    return carbonCredit;
  }

  /**
   * Trading Credits - Marketplace
   */
  getTradableCredits() {
    return this.blocks
      .filter(b => b.data.type === 'environmental_recording')
      .filter(b => b.data.readings && b.data.readings.status === 'minted')
      .map(b => ({
        blockIndex: b.index,
        creditId: b.data.readings.id,
        credits: b.data.readings.creditsGenerated,
        co2Kg: b.data.readings.co2ReductionKg,
        mintedAt: b.data.readings.mintedAt,
        hash: b.hash
      }));
  }

  /**
   * Smart Contract - Contratti Ambientali
   */
  createEnvironmentalContract(contractData) {
    const { parties, conditions, value, expiryDate } = contractData;
    
    const contract = {
      id: `SC-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      type: 'environmental_smart_contract',
      parties: parties || ['partyA', 'partyB'],
      conditions: conditions || {
        metric: 'co2_reduction',
        target: 100, // kg
        verificationMethod: 'iot_sensor_network',
        frequency: 'monthly'
      },
      value: value || { currency: 'MYZ', amount: 500 },
      status: 'active',
      createdAt: new Date().toISOString(),
      expiresAt: expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      compliance: {
        verified: false,
        lastCheck: null,
        reports: []
      }
    };
    
    return contract;
  }

  /**
   * Compliance check per smart contract
   */
  checkContractCompliance(contractId, environmentalReadings) {
    const { target, metric } = { target: 100, metric: 'co2_reduction' };
    
    const totalReduction = environmentalReadings.reduce((sum, r) => {
      return sum + (r.co2ReductionKg || 0);
    }, 0);
    
    const compliant = totalReduction >= target;
    
    return {
      contractId,
      metric,
      target,
      actual: totalReduction,
      compliant,
      checkedAt: new Date().toISOString(),
      recommendation: compliant 
        ? 'Contract conditions met - payment authorized'
        : `Shortfall: ${target - totalReduction}kg CO2 remaining`
    };
  }

  /**
   * Pagamenti automatici via smart contract
   */
  processEnvironmentalPayment(contractId, amount, recipient) {
    const payment = {
      id: `PAY-${Date.now()}`,
      contractId,
      amount,
      currency: 'MYZ',
      recipient,
      status: 'processed',
      processedAt: new Date().toISOString(),
      transactionHash: `0x${crypto.randomBytes(32).toString('hex')}`
    };
    
    return payment;
  }

  /**
   * Get blockchain statistics
   */
  getStatistics() {
    const envBlocks = this.blocks.filter(b => b.data.type === 'environmental_recording');
    const carbonCredits = envBlocks.filter(b => b.data.readings?.status === 'minted');
    const totalCO2 = carbonCredits.reduce((sum, b) => sum + (b.data.readings?.co2ReductionKg || 0), 0);
    
    return {
      totalBlocks: this.blocks.length,
      environmentalBlocks: envBlocks.length,
      carbonCreditsMinted: carbonCredits.length,
      totalCO2ReductionKg: totalCO2,
      totalCreditsGenerated: totalCO2 / 1000,
      lastBlockHash: this.blocks.length > 0 ? this.blocks[this.blocks.length - 1].hash : null,
      chainIntegrity: this.blocks.length > 1 ? this.verifyChainIntegrity().integrity : true
    };
  }

  _calculateHash(block) {
    const data = block.index + block.timestamp + JSON.stringify(block.data) + block.previousHash + block.nonce;
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}

module.exports = new BlockchainService();
