const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// In-memory db for stations and transactions
const stationWallets = {};
const stationTransactions = {};

/**
 * 1. Generazione wallet
 * Generates a mock XMR wallet for a station
 */
router.post('/station/:id/wallet', (req, res) => {
    const stationId = req.params.id;
    // Mock Monero address generation (4/8 format)
    const walletAddress = '4' + crypto.randomBytes(47).toString('hex');
    
    stationWallets[stationId] = {
        address: walletAddress,
        balance: 0,
        createdAt: new Date().toISOString()
    };
    
    stationTransactions[stationId] = [];

    res.json({
        success: true,
        stationId,
        walletAddress,
        message: 'Wallet generated successfully'
    });
});

/**
 * 2. Ricezione XMR
 * Mock endpoint to receive XMR payments
 */
router.post('/station/:id/receive', (req, res) => {
    const stationId = req.params.id;
    const { amountXMR, txHash } = req.body;
    
    if (!stationWallets[stationId]) {
        return res.status(404).json({ error: 'Wallet not found for this station' });
    }

    stationWallets[stationId].balance += Number(amountXMR);
    
    const tx = {
        txHash: txHash || crypto.randomUUID(),
        amount: Number(amountXMR),
        timestamp: new Date().toISOString(),
        type: 'receive'
    };
    
    stationTransactions[stationId].push(tx);

    res.json({
        success: true,
        message: 'XMR received',
        newBalance: stationWallets[stationId].balance,
        tx
    });
});

/**
 * 3. Dashboard incassi
 * Returns the total revenue and metrics for a station
 */
router.get('/station/:id/dashboard', (req, res) => {
    const stationId = req.params.id;
    const wallet = stationWallets[stationId];
    
    if (!wallet) {
        return res.status(404).json({ error: 'Wallet not found' });
    }

    const txs = stationTransactions[stationId] || [];
    const txCount = txs.length;

    res.json({
        stationId,
        address: wallet.address,
        totalBalance: wallet.balance,
        transactionCount: txCount,
        lastUpdated: new Date().toISOString()
    });
});

/**
 * 4. Storico transazioni
 * Returns the transaction history
 */
router.get('/station/:id/history', (req, res) => {
    const stationId = req.params.id;
    
    if (!stationWallets[stationId]) {
        return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json({
        stationId,
        transactions: stationTransactions[stationId] || []
    });
});

module.exports = router;
