const express = require('express');
const router = express.Router();

// Mock exchange rates (base MYZ)
const rates = {
    BTC: 0.000015,
    ETH: 0.00028,
    ADA: 0.85,
    XMR: 0.0042,
    MYZ: 1.0
};

// Mock multi-currency wallet
let wallet = {
    userId: 'mock-user-123',
    balances: {
        BTC: 0.05,
        ETH: 1.2,
        ADA: 500,
        XMR: 10,
        MYZ: 1500
    }
};

// [x] Endpoint GET /api/crypto/rates
router.get('/rates', (req, res) => {
    // [x] Conversioni in tempo reale (mock)
    res.json({
        base: 'MYZ',
        timestamp: new Date().toISOString(),
        rates: rates
    });
});

// [x] Endpoint POST /api/crypto/swap
router.post('/swap', (req, res) => {
    const { fromCurrency, toCurrency, amount } = req.body;
    
    if (!rates[fromCurrency] || !rates[toCurrency]) {
        return res.status(400).json({ error: 'Unsupported currency' });
    }
    
    if (wallet.balances[fromCurrency] < amount) {
        return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    // [x] Integrazione Exchange API (mock math)
    const amountInMYZ = amount / rates[fromCurrency];
    const amountOut = amountInMYZ * rates[toCurrency];
    
    wallet.balances[fromCurrency] -= amount;
    wallet.balances[toCurrency] += amountOut;
    
    res.json({
        success: true,
        message: `Swapped ${amount} ${fromCurrency} to ${amountOut} ${toCurrency}`,
        newBalances: wallet.balances
    });
});

// [x] Wallet multi-currency (GET status)
router.get('/wallet', (req, res) => {
    res.json(wallet);
});

module.exports = router;
