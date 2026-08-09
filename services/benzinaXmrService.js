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
