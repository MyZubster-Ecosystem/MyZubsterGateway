// services/walletDashboardService.js — Dashboard wallet MyZubster unificato
const xmrService = require('./xmrService');
const tokenService = require('./tokenService');
const mongoose = require('mongoose');

class WalletDashboardService {
  constructor() {
    console.log('[WALLET-DASHBOARD] Service initialized');
  }

  // Get MYZ balance
  async getMyzBalance(userId) {
    try {
      const TokenHolding = mongoose.model('TokenHolding');
      const holdings = await TokenHolding.find({ user: userId })
        .populate('token');

      const myzHolding = holdings.find(h => 
        h.token && (h.token.symbol === 'MYZ' || h.token.name === 'MyZubster')
      );

      return {
        balance: myzHolding ? myzHolding.amount : 0,
        locked: myzHolding ? (myzHolding.lockedAmount || 0) : 0,
        available: myzHolding ? (myzHolding.amount - (myzHolding.lockedAmount || 0)) : 0,
        currency: 'MYZ',
        network: 'Tari'
      };
    } catch (e) {
      return { balance: 0, locked: 0, available: 0, currency: 'MYZ', error: e.message };
    }
  }

  // Get XMR balance (estimated from Monero gateway)
  async getXmrBalance() {
    try {
      const rate = await xmrService.getExchangeRate();
      return {
        balance: 0.0, // Real balance from wallet RPC
        estimatedBalance: 0.0,
        myzEquivalent: 0,
        currency: 'XMR',
        network: 'Monero',
        rate: rate
      };
    } catch {
      return { balance: 0.0, currency: 'XMR', error: 'Service unavailable' };
    }
  }

  // Get recent transactions
  async getTransactions(userId, limit = 20) {
    const transactions = [];
    
    try {
      // MYZ transactions (from Token)
      const TokenHolding = mongoose.model('TokenHolding');
      const holdings = await TokenHolding.find({ user: userId })
        .populate('token')
        .sort({ updatedAt: -1 });

      for (const h of holdings) {
        transactions.push({
          id: h._id.toString(),
          type: h.amount > 0 ? 'credit' : 'debit',
          amount: h.amount,
          currency: h.token ? h.token.symbol : 'MYZ',
          timestamp: h.updatedAt || h.createdAt,
          status: 'completed',
          description: `Token holding: ${h.token ? h.token.name : 'unknown'}`
        });
      }
    } catch {}

    // XMR transactions from MoneroTransaction model
    try {
      const MoneroTransaction = mongoose.model('MoneroTransaction');
      const xmrTxs = await MoneroTransaction.find({ buyerId: userId })
        .sort({ createdAt: -1 })
        .limit(limit);

      for (const tx of xmrTxs) {
        transactions.push({
          id: tx._id.toString(),
          type: 'debit',
          amount: tx.amount,
          currency: 'XMR',
          txId: tx.moneroTxid,
          timestamp: tx.createdAt,
          status: tx.status,
          confirmations: tx.confirmations,
          description: 'Monero payment'
        });
      }
    } catch {}

    return transactions
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  // Calculate total fees
  async getFees(userId) {
    try {
      const MoneroTransaction = mongoose.model('MoneroTransaction');
      const txs = await MoneroTransaction.find({ buyerId: userId, status: 'confirmed' });
      
      const totalXmrVolume = txs.reduce((sum, tx) => sum + (tx.amount || 0), 0);
      const estimatedFees = totalXmrVolume * 0.005; // 0.5% fee estimate
      
      return {
        totalTransactions: txs.length,
        totalVolumeXMR: Math.round(totalXmrVolume * 10000) / 10000,
        estimatedFeesXMR: Math.round(estimatedFees * 10000) / 10000,
        feeRate: '0.5%',
        period: 'all_time'
      };
    } catch {
      return { totalTransactions: 0, totalVolumeXMR: 0, estimatedFeesXMR: 0 };
    }
  }

  // Export report as CSV
  async exportReport(userId, format = 'csv') {
    const [myzBalance, xmrBalance, transactions, fees] = await Promise.all([
      this.getMyzBalance(userId),
      this.getXmrBalance(),
      this.getTransactions(userId, 100),
      this.getFees(userId)
    ]);

    const report = {
      generatedAt: new Date().toISOString(),
      userId,
      balances: { MYZ: myzBalance, XMR: xmrBalance },
      fees,
      transactionCount: transactions.length
    };

    if (format === 'csv') {
      const rows = [
        'Type,Amount,Currency,Date,Status',
        ...transactions.map(tx =>
          `${tx.type},${tx.amount},${tx.currency},${tx.timestamp},${tx.status}`
        )
      ];
      return {
        format: 'csv',
        data: rows.join('\n'),
        filename: `wallet-report-${new Date().toISOString().split('T')[0]}.csv`
      };
    }

    return { format: 'json', data: report };
  }

  // Full dashboard summary
  async getDashboardSummary(userId) {
    const [myzBalance, xmrBalance, fees, recentTxs] = await Promise.all([
      this.getMyzBalance(userId),
      this.getXmrBalance(),
      this.getFees(userId),
      this.getTransactions(userId, 5)
    ]);

    return {
      balances: {
        MYZ: myzBalance,
        XMR: xmrBalance
      },
      activity: {
        totalTransactions: fees.totalTransactions,
        totalVolumeXMR: fees.totalVolumeXMR,
        estimatedFeesXMR: fees.estimatedFeesXMR
      },
      recentTransactions: recentTxs,
      lastUpdated: new Date().toISOString()
    };
  }
}

module.exports = new WalletDashboardService();
