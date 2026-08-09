const Robot = require('../models/Robot');
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '../../data/robots.json');

class RobotService {
  constructor() {
    this.robots = new Map();
    this.jobs = new Map();
    this.payments = new Map();
    this.config = require('../config');
    this.loadFromFile();
  }

  loadFromFile() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        if (data.robots) {
          data.robots.forEach(r => this.robots.set(r.id, new Robot(r)));
        }
        if (data.jobs) {
          data.jobs.forEach(j => this.jobs.set(j.id, j));
        }
        if (data.payments) {
          data.payments.forEach(p => this.payments.set(p.id, p));
        }
        console.log(`✅ Caricati ${this.robots.size} robot da file`);
      }
    } catch (e) {
      console.log('⚠️ Nessun dato persistente trovato');
    }
  }

  saveToFile() {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      
      const data = {
        robots: Array.from(this.robots.values()).map(r => r.toJSON()),
        jobs: Array.from(this.jobs.values()),
        payments: Array.from(this.payments.values())
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('❌ Errore salvataggio:', e.message);
    }
  }

  async register(robotData) {
    const robot = new Robot(robotData);
    if (this.robots.has(robot.id)) {
      throw new Error('Robot already registered');
    }
    this.robots.set(robot.id, robot);
    this.saveToFile();
    return robot;
  }
  
  getRobot(robotId) {
    const robot = this.robots.get(robotId);
    if (!robot) throw new Error('Robot not found');
    return robot;
  }
  
  getAllRobots() {
    return Array.from(this.robots.values());
  }
  
  async requestPayment(robotId, amount, currency = 'XMR') {
    const robot = this.getRobot(robotId);
    const fees = {
      platform: amount * this.config.fees.platform,
      bosco: amount * this.config.fees.bosco,
      referral: robot.parentId ? amount * this.config.fees.referral : 0,
      total: amount * (this.config.fees.platform + this.config.fees.bosco) + 
             (robot.parentId ? amount * this.config.fees.referral : 0)
    };
    const totalAmount = amount + fees.total;
    const payment = {
      id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      robotId, amount, currency, totalAmount, fees,
      address: await this.generatePaymentAddress(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000).toISOString()
    };
    this.payments.set(payment.id, payment);
    this.saveToFile();
    return payment;
  }
  
  async checkPayment(paymentId) {
    const payment = this.payments.get(paymentId);
    if (!payment) throw new Error('Payment not found');
    payment.status = 'confirmed';
    payment.confirmedAt = new Date().toISOString();
    if (payment.status === 'confirmed') {
      const robot = this.getRobot(payment.robotId);
      const netAmount = payment.amount - payment.fees.total;
      robot.balance = (robot.balance || 0) + netAmount;
      robot.totalEarnings = (robot.totalEarnings || 0) + netAmount;
      if (robot.parentId) {
        const parent = this.getRobot(robot.parentId);
        if (parent) {
          parent.referralEarnings = (parent.referralEarnings || 0) + payment.fees.referral;
        }
      }
      this.saveToFile();
    }
    return payment;
  }
  
  async generatePaymentAddress() {
    return `4A${Math.random().toString(36).substr(2, 10)}...`;
  }
  
  async assignJob(robotId, jobData) {
    const robot = this.getRobot(robotId);
    const job = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      robotId, ...jobData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      assignedAt: new Date().toISOString(),
      acceptedAt: null, completedAt: null,
    };
    this.jobs.set(job.id, job);
    this.saveToFile();
    return job;
  }
  
  async acceptJob(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error('Job not found');
    job.status = 'accepted';
    job.acceptedAt = new Date().toISOString();
    this.saveToFile();
    return job;
  }
  
  async completeJob(jobId, result) {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error('Job not found');
    job.status = 'completed';
    job.completedAt = new Date().toISOString();
    job.result = result;
    if (job.amount) {
      await this.requestPayment(job.robotId, job.amount);
    }
    this.saveToFile();
    return job;
  }
  
  async cloneRobot(parentId, cloneData) {
    const parent = this.getRobot(parentId);
    cloneData.parentId = parentId;
    const clone = new Robot(cloneData);
    this.robots.set(clone.id, clone);
    parent.clones.push(clone.id);
    this.saveToFile();
    return clone;
  }
}

module.exports = new RobotService();
