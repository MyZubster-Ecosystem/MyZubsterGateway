const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Mock exchange rates: 1 MYZ = ?
const exchangeRates = {
    BTC: 0.0000005,
    ETH: 0.00001,
    ADA: 0.05
};

const wallets = {};
const transactions = {};

/**
 * 1. Get real-time exchange rates (mocked)
 */
router.get('/rates', (req, res) => {
    res.json({
        success: true,
        baseCurrency: 'MYZ',
        rates: exchangeRates,
        timestamp: new Date().toISOString()
    });
});

/**
 * 2. Generate Payment Address (BTC/ETH/ADA)
 */
router.post('/payment/request', (req, res) => {
    const { currency, amountMYZ } = req.body;
    
    if (!exchangeRates[currency]) {
        return res.status(400).json({ error: 'Unsupported cryptocurrency. Use BTC, ETH, or ADA.' });
    }

    if (!amountMYZ || amountMYZ <= 0) {
        return res.status(400).json({ error: 'Valid amountMYZ is required' });
    }

    const txId = crypto.randomUUID();
    const cryptoAmount = amountMYZ * exchangeRates[currency];
    
    // Mock addresses based on currency
    let address = '';
    if (currency === 'BTC') address = 'bc1q' + crypto.randomBytes(20).toString('hex');
    if (currency === 'ETH') address = '0x' + crypto.randomBytes(20).toString('hex');
    if (currency === 'ADA') address = 'addr1' + crypto.randomBytes(25).toString('hex');

    transactions[txId] = {
        txId,
        currency,
        amountMYZ,
        cryptoAmount,
        address,
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    res.json({
        success: true,
        txId,
        currency,
        address,
        amountMYZ,
        cryptoAmount,
        status: 'pending'
    });
});

/**
 * 3. Unified Dashboard for Multi-currency
 */
router.get('/dashboard', (req, res) => {
    const txList = Object.values(transactions);
    
    const summary = {
        totalMYZ: txList.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amountMYZ, 0),
        pendingBTC: txList.filter(t => t.status === 'pending' && t.currency === 'BTC').length,
        pendingETH: txList.filter(t => t.status === 'pending' && t.currency === 'ETH').length,
        pendingADA: txList.filter(t => t.status === 'pending' && t.currency === 'ADA').length
    };

    res.json({
        success: true,
        summary,
        transactions: txList.slice(-50) // Last 50 transactions
    });
});

/**
 * 4. Webhook to confirm payment and auto-convert
 */
router.post('/webhook/confirm', (req, res) => {
    const { txId, txHash } = req.body;
    
    const tx = transactions[txId];
    if (!tx) {
        return res.status(404).json({ error: 'Transaction not found' });
    }

    if (tx.status === 'completed') {
        return res.json({ success: true, message: 'Already converted' });
    }

    tx.status = 'completed';
    tx.txHash = txHash || crypto.randomUUID();
    tx.confirmedAt = new Date().toISOString();

    res.json({
        success: true,
        message: \`Payment confirmed. \${tx.cryptoAmount} \${tx.currency} successfully auto-converted to \${tx.amountMYZ} MYZ.\`,
        tx
    });
});

module.exports = router;
