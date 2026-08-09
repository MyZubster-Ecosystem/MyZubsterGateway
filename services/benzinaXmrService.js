/**
 * BenzinaXMR Service - Monero fuel payment system
 * Closes #700, Closes #701
 */
const monero = require('../utils/monero');
const stations = new Map();
const payments = new Map();
const receipts = new Map();

class BenzinaXMRService {
  // #700: Pagamento Benzina in XMR
  async calculatePrice(liters, fuelType) {
    const rates = { benzina: 1.85, diesel: 1.72, gpl: 0.78, metano: 1.05 };
    const eurPrice = liters * (rates[fuelType] || 1.85);
    const xmrRate = await monero.getXmrEurRate();
    return { eur: eurPrice.toFixed(2), xmr: (eurPrice / xmrRate).toFixed(6), rate: xmrRate };
  }

  async processPayment(stationId, liters, fuelType, licensePlate) {
    const price = await this.calculatePrice(liters, fuelType);
    const paymentId = 'PAY-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
    const payment = {
      id: paymentId, stationId, liters, fuelType, licensePlate,
      amountXmr: price.xmr, amountEur: price.eur, rate: price.rate,
      status: 'pending', createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 15*60000).toISOString()
    };
    payments.set(paymentId, payment);
    return payment;
  }

  async verifyPayment(paymentId) {
    const payment = payments.get(paymentId);
    if (!payment) return { status: 'not_found' };
    if (new Date() > new Date(payment.expiresAt)) { payment.status = 'expired'; return payment; }
    const verified = await monero.checkPayment(paymentId, payment.amountXmr);
    if (verified) { payment.status = 'confirmed'; this.generateReceipt(payment); }
    return payment;
  }

  generateReceipt(payment) {
    const receipt = {
      id: 'RCPT-' + payment.id, paymentId: payment.id,
      stationId: payment.stationId, fuelType: payment.fuelType,
      liters: payment.liters, amountEur: payment.amountEur,
      amountXmr: payment.amountXmr, licensePlate: payment.licensePlate,
      timestamp: new Date().toISOString()
    };
    receipts.set(receipt.id, receipt);
    if (payment.stationId && stations.has(payment.stationId)) {
      const s = stations.get(payment.stationId);
      s.totalRevenue = (s.totalRevenue || 0) + parseFloat(payment.amountXmr);
      s.transactions.push(receipt);
    }
    return receipt;
  }

  // #701: Wallet Monero Stazioni
  registerStation(name, location, walletAddress) {
    const id = 'ST-' + Date.now();
    const station = { id, name, location, walletAddress, totalRevenue: 0, transactions: [], registeredAt: new Date().toISOString() };
    stations.set(id, station);
    return station;
  }

  getStation(id) { return stations.get(id) || null; }
  getAllStations() { return Array.from(stations.values()); }

  getStationDashboard(id) {
    const s = stations.get(id);
    if (!s) return null;
    const txs = s.transactions || [];
    const recentTxs = txs.slice(-10).reverse();
    const totalEur = txs.reduce((sum, t) => sum + parseFloat(t.amountEur || 0), 0);
    return { station: s, totalRevenue: s.totalRevenue || 0, totalEur: totalEur.toFixed(2), transactionCount: txs.length, recentTransactions: recentTxs };
  }

  getPayment(id) { return payments.get(id) || null; }
  getReceipt(id) { return receipts.get(id) || null; }
  getXmrRate() { return monero.getXmrEurRate(); }
  async convertXmrToLiters(xmr, fuelType) {
    const rate = await monero.getXmrEurRate();
    const rates = { benzina: 1.85, diesel: 1.72, gpl: 0.78, metano: 1.05 };
    return { liters: (xmr * rate / (rates[fuelType] || 1.85)).toFixed(2), fuelType, xmr, rate };
  }
}

module.exports = new BenzinaXMRService();
