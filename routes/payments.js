const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const MoneroTransaction = require('../models/MoneroTransaction');
const Escrow = require('../models/Escrow');

// Dashboard monitoraggio pagamenti — statistiche aggregate
router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const last24h = new Date(now - 24 * 60 * 60 * 1000);
    const last7d = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const [txStats, orderStats, escrowStats, moneroStats, recentTx, dailyVolume] = await Promise.all([
      Transaction.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } }
      ]),
      Order.aggregate([
        { $group: { _id: '$moneroPaymentStatus', count: { $sum: 1 }, totalAmount: { $sum: '$totalPrice' } } }
      ]),
      Escrow.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } }
      ]),
      MoneroTransaction.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$amountPaid' } } }
      ]),
      Transaction.find().sort({ createdAt: -1 }).limit(10).lean(),
      Transaction.aggregate([
        { $match: { createdAt: { $gte: last7d }, status: 'completed' } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ])
    ]);

    // Transazioni ultime 24h
    const tx24h = await Transaction.countDocuments({ createdAt: { $gte: last24h } });
    const tx24hCompleted = await Transaction.countDocuments({ createdAt: { $gte: last24h }, status: 'completed' });
    const tx24hFailed = await Transaction.countDocuments({ createdAt: { $gte: last24h }, status: 'failed' });
    const tx24hVolume = await Transaction.aggregate([
      { $match: { createdAt: { $gte: last24h }, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      data: {
        transactions: {
          byStatus: Object.fromEntries(txStats.map(s => [s._id || 'unknown', { count: s.count, amount: s.totalAmount }])),
          last24h: { count: tx24h, completed: tx24hCompleted, failed: tx24hFailed, volume: tx24hVolume[0]?.total || 0 },
          recent: recentTx
        },
        orders: {
          byMoneroStatus: Object.fromEntries(orderStats.map(s => [s._id || 'unknown', { count: s.count, amount: s.totalAmount }]))
        },
        escrow: {
          byStatus: Object.fromEntries(escrowStats.map(s => [s._id || 'unknown', { count: s.count, amount: s.totalAmount }]))
        },
        monero: {
          byStatus: Object.fromEntries(moneroStats.map(s => [s._id || 'unknown', { count: s.count, amount: s.totalAmount }]))
        },
        dailyVolume: dailyVolume
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Alert — transazioni che richiedono attenzione
router.get('/alerts', async (req, res) => {
  try {
    const now = new Date();
    const staleThreshold = new Date(now - 30 * 60 * 1000); // 30 min

    const [stalePending, stuckEscrow, expiredMonero, highValuePending] = await Promise.all([
      Transaction.find({ status: 'pending', createdAt: { $lt: staleThreshold } }).sort({ createdAt: 1 }).limit(20).lean(),
      Escrow.find({ status: { $in: ['disputed', 'escalated'] } }).sort({ createdAt: -1 }).limit(10).lean(),
      MoneroTransaction.find({ status: 'pending', expiresAt: { $lt: now } }).sort({ createdAt: -1 }).limit(10).lean(),
      Transaction.find({ status: 'pending', amount: { $gte: 100 } }).sort({ amount: -1 }).limit(10).lean()
    ]);

    res.json({
      success: true,
      data: {
        stalePending: { count: stalePending.length, items: stalePending },
        stuckEscrow: { count: stuckEscrow.length, items: stuckEscrow },
        expiredMonero: { count: expiredMonero.length, items: expiredMonero },
        highValuePending: { count: highValuePending.length, items: highValuePending }
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Report periodico
router.get('/report', async (req, res) => {
  try {
    const now = new Date();
    const last30d = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const [totalTx, totalVolume, completedTx, failedTx, refundedTx, avgAmount, topTx] = await Promise.all([
      Transaction.countDocuments({ createdAt: { $gte: last30d } }),
      Transaction.aggregate([{ $match: { createdAt: { $gte: last30d }, status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Transaction.countDocuments({ createdAt: { $gte: last30d }, status: 'completed' }),
      Transaction.countDocuments({ createdAt: { $gte: last30d }, status: 'failed' }),
      Transaction.countDocuments({ createdAt: { $gte: last30d }, status: 'refunded' }),
      Transaction.aggregate([{ $match: { createdAt: { $gte: last30d }, status: 'completed' } }, { $group: { _id: null, avg: { $avg: '$amount' } } }]),
      Transaction.find({ createdAt: { $gte: last30d } }).sort({ amount: -1 }).limit(5).lean()
    ]);

    res.json({
      success: true,
      data: {
        period: { from: last30d.toISOString(), to: now.toISOString() },
        summary: {
          totalTransactions: totalTx,
          completedTransactions: completedTx,
          failedTransactions: failedTx,
          refundedTransactions: refundedTx,
          totalVolume: totalVolume[0]?.total || 0,
          averageAmount: Math.round(avgAmount[0]?.avg || 0)
        },
        topTransactions: topTx
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
