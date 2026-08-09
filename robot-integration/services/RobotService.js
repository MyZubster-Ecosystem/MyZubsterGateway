const Robot = require('../models/Robot');
const axios = require('axios');

class RobotService {
  constructor() {
    this.robots = new Map();
    this.jobs = new Map();
    this.payments = new Map();
    this.config = require('../config');
  }
  
  // Registra un robot
  async register(robotData) {
    const robot = new Robot(robotData);
    
    if (this.robots.has(robot.id)) {
      throw new Error('Robot already registered');
    }
    
    this.robots.set(robot.id, robot);
    return robot;
  }
  
  // Ottieni robot
  getRobot(robotId) {
    const robot = this.robots.get(robotId);
    if (!robot) {
      throw new Error('Robot not found');
    }
    return robot;
  }
  
  // Ottieni tutti i robot
  getAllRobots() {
    return Array.from(this.robots.values());
  }
  
  // Richiedi pagamento (x402)
  async requestPayment(robotId, amount, currency = 'XMR') {
    const robot = this.getRobot(robotId);
    
    // Calcola le fee
    const fees = {
      platform: amount * this.config.fees.platform,
      bosco: amount * this.config.fees.bosco,
      referral: robot.parentId ? amount * this.config.fees.referral : 0,
      total: amount * (this.config.fees.platform + this.config.fees.bosco) + 
             (robot.parentId ? amount * this.config.fees.referral : 0)
    };
    
    const totalAmount = amount + fees.total;
    
    // Genera indirizzo di pagamento
    const payment = {
      id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      robotId,
      amount,
      currency,
      totalAmount,
      fees,
      address: await this.generatePaymentAddress(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 ora
    };
    
    this.payments.set(payment.id, payment);
    return payment;
  }
  
  // Verifica pagamento
  async checkPayment(paymentId) {
    const payment = this.payments.get(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }
    
    // Verifica sulla blockchain (simulato)
    payment.status = 'confirmed';
    payment.confirmedAt = new Date().toISOString();
    
    // Aggiorna il saldo del robot
    if (payment.status === 'confirmed') {
      const robot = this.getRobot(payment.robotId);
      const netAmount = payment.amount - payment.fees.total;
      robot.balance = (robot.balance || 0) + netAmount;
      robot.totalEarnings = (robot.totalEarnings || 0) + netAmount;
      
      // Bonus referral
      if (robot.parentId) {
        const parent = this.getRobot(robot.parentId);
        if (parent) {
          parent.referralEarnings = (parent.referralEarnings || 0) + payment.fees.referral;
        }
      }
    }
    
    return payment;
  }
  
  // Genera indirizzo di pagamento Monero
  async generatePaymentAddress() {
    // In produzione, usa monero-wallet-rpc
    return `4A${Math.random().toString(36).substr(2, 10)}...`;
  }
  
  // Assegna un lavoro a un robot
  async assignJob(robotId, jobData) {
    const robot = this.getRobot(robotId);
    
    const job = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      robotId,
      ...jobData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      assignedAt: new Date().toISOString(),
      acceptedAt: null,
      completedAt: null,
    };
    
    this.jobs.set(job.id, job);
    return job;
  }
  
  // Accetta un lavoro
  async acceptJob(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    
    job.status = 'accepted';
    job.acceptedAt = new Date().toISOString();
    return job;
  }
  
  // Completa un lavoro
  async completeJob(jobId, result) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    
    job.status = 'completed';
    job.completedAt = new Date().toISOString();
    job.result = result;
    
    // Pagamento automatico
    if (job.amount) {
      await this.requestPayment(job.robotId, job.amount);
    }
    
    return job;
  }
  
  // Clona un robot
  async cloneRobot(parentId, cloneData) {
    const parent = this.getRobot(parentId);
    if (!parent) {
      throw new Error('Parent robot not found');
    }
    
    cloneData.parentId = parentId;
    const clone = new Robot(cloneData);
    this.robots.set(clone.id, clone);
    parent.clones.push(clone.id);
    
    return clone;
  }
}

module.exports = new RobotService();
