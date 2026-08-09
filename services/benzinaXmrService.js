<<<<<<< HEAD
// services/benzinaXmrService.js - BENZINA-XMR: Pagamento carburante con Monero
const xmrService = require('./xmrService');
const xmrFuelConversionService = require('./xmrFuelConversionService');
const crypto = require('crypto');

const stations = new Map();
const transactions = new Map();
const receipts = new Map();

class BenzinaXmrService {
  constructor() {
    this.defaultWallet = process.env.MYZUBSTER_XMR_WALLET_ADDRESS || '4BenzinaXMRWalletAddressMonero';
  }

  async processFuelPayment({ stationId, xmrAmount, fuelType, licensePlate }) {
    const conversion = await xmrFuelConversionService.xmrToLiters(xmrAmount, fuelType || 'benzina');
    const txId = crypto.randomBytes(16).toString('hex');
    const payment = {
      txId, stationId, xmrAmount, fuelType: fuelType || 'benzina',
      liters: conversion.liters, eurValue: conversion.eurValue,
      pricePerLiter: conversion.pricePerLiter, licensePlate,
      status: 'completed', timestamp: new Date().toISOString()
    };
    transactions.set(txId, payment);
    const receipt = {
      receiptId: 'RCP-' + Date.now() + '-' + crypto.randomBytes(3).toString('hex'),
      ...payment, walletAddress: this.defaultWallet, generatedAt: new Date().toISOString()
    };
    receipts.set(receipt.receiptId, receipt);
    const station = stations.get(stationId);
    if (station) {
      station.balance = (station.balance || 0) + xmrAmount;
      station.totalReceived = (station.totalReceived || 0) + xmrAmount;
      station.lastActivity = new Date().toISOString();
    }
    return { success: true, payment, receipt };
  }

  generateStationWallet(stationId, stationName) {
    const wallet = {
      stationId, stationName,
      address: '4Station' + crypto.randomBytes(16).toString('hex'),
      balance: 0, totalReceived: 0,
      createdAt: new Date().toISOString(), lastActivity: null
    };
    stations.set(stationId, wallet);
    return wallet;
  }

  getStationWallet(stationId) {
    const station = stations.get(stationId);
    if (!station) return null;
    const txs = Array.from(transactions.values()).filter(tx => tx.stationId === stationId).slice(-20);
    return { ...station, transactions: txs };
  }

  getAllStations() {
    return Array.from(stations.values()).map(s => ({
      stationId: s.stationId, stationName: s.stationName,
      address: s.address, balance: s.balance,
      totalReceived: s.totalReceived, lastActivity: s.lastActivity
    }));
  }

  getStationDashboard(stationId) {
    const station = stations.get(stationId);
    if (!station) return null;
    const txs = Array.from(transactions.values()).filter(tx => tx.stationId === stationId);
    const totalXmr = txs.reduce((s, tx) => s + tx.xmrAmount, 0);
    const totalLiters = txs.reduce((s, tx) => s + tx.liters, 0);
    const totalEur = txs.reduce((s, tx) => s + tx.eurValue, 0);
    return {
      wallet: station,
      stats: {
        totalTransactions: txs.length,
        totalXmrReceived: Math.round(totalXmr * 1e6) / 1e6,
        totalLitersSold: Math.round(totalLiters * 100) / 100,
        totalEurValue: Math.round(totalEur * 100) / 100
      },
      recentTransactions: txs.slice(-10).reverse()
    };
  }

  generatePaymentQR({ stationId, amount, fuelType }) {
    const paymentId = crypto.randomBytes(8).toString('hex');
    const qrData = 'monero:' + this.defaultWallet + '?tx_amount=' + amount + '&tx_payment_id=' + paymentId + '&recipient_name=' + stationId;
    return {
      paymentId, qrData, walletAddress: this.defaultWallet,
      amount, fuelType: fuelType || 'benzina', stationId,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      generatedAt: new Date().toISOString()
    };
  }

  verifyQRPayment(paymentId) {
    const tx = Array.from(transactions.values()).find(tx => tx.paymentId === paymentId);
    return tx ? { verified: true, transaction: tx } : { verified: false };
  }

  async getFuelPrices() {
    const { xmrEur } = await xmrFuelConversionService.getXmrRate();
    return {
      xmrEurRate: xmrEur,
      prices: {
        benzina: await xmrFuelConversionService.getFuelPrice('benzina'),
        diesel: await xmrFuelConversionService.getFuelPrice('diesel'),
        elettrico: await xmrFuelConversionService.getFuelPrice('elettrico')
      },
      updatedAt: new Date().toISOString()
    };
  }

  getReceipt(receiptId) {
    return receipts.get(receiptId) || null;
  }
}

module.exports = new BenzinaXmrService();
=======
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
>>>>>>> origin/main
