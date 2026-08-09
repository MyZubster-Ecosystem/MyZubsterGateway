const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Mock fiat to MYZ exchange rates
const fiatExchangeRates = {
    USD: 0.50, // 1 USD = 0.50 MYZ
    EUR: 0.55, // 1 EUR = 0.55 MYZ
    GBP: 0.65  // 1 GBP = 0.65 MYZ
};

const fiatTransactions = {};

/**
 * 1. Get real-time Fiat to MYZ exchange rates (mocked)
 */
router.get('/rates', (req, res) => {
    res.json({
        success: true,
        baseCurrency: 'MYZ',
        rates: fiatExchangeRates,
        timestamp: new Date().toISOString()
    });
});

/**
 * 2. Process Fiat Payment via Gateway (Mock)
 */
router.post('/checkout', (req, res) => {
    const { currency, amount, cardToken } = req.body;
    
    if (!fiatExchangeRates[currency]) {
        return res.status(400).json({ error: 'Unsupported fiat currency. Use USD, EUR, or GBP.' });
    }

    if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Valid amount is required' });
    }

    if (!cardToken) {
        return res.status(400).json({ error: 'Payment method (cardToken) is required' });
    }

    const txId = crypto.randomUUID();
    const amountMYZ = amount * fiatExchangeRates[currency];
    
    // Simulate gateway processing delay
    fiatTransactions[txId] = {
        txId,
        currency,
        amountFiat: amount,
        amountMYZ,
        status: 'completed', // auto-approve for mock
        gatewayReceipt: 'receipt_' + crypto.randomBytes(8).toString('hex'),
        createdAt: new Date().toISOString()
    };

    res.json({
        success: true,
        message: 'Payment processed successfully',
        transaction: fiatTransactions[txId]
    });
});

/**
 * 3. Unified Dashboard for Fiat
 */
router.get('/dashboard', (req, res) => {
    const txList = Object.values(fiatTransactions);
    
    const summary = {
        totalMYZ_from_Fiat: txList.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amountMYZ, 0),
        countUSD: txList.filter(t => t.currency === 'USD').length,
        countEUR: txList.filter(t => t.currency === 'EUR').length,
        countGBP: txList.filter(t => t.currency === 'GBP').length
    };

    res.json({
        success: true,
        summary,
        transactions: txList.slice(-50)
    });
});

module.exports = router;
