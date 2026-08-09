const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// [x] Conversion rates MYZ/Fiat
const fiatExchangeRates = {
    USD: 0.50, // 1 USD = 0.50 MYZ
    EUR: 0.55, // 1 EUR = 0.55 MYZ
    GBP: 0.65  // 1 GBP = 0.65 MYZ
};

const fiatTransactions = {};

// [x] Endpoint POST /api/payments/fiat/create
router.post('/create', (req, res) => {
    const { currency, amount } = req.body;
    
    if (!fiatExchangeRates[currency]) {
        return res.status(400).json({ error: 'Unsupported fiat currency' });
    }

    const txId = crypto.randomUUID();
    const amountMYZ = amount * fiatExchangeRates[currency];
    
    // [x] Integrazione Stripe per pagamenti (Mock)
    const stripeSessionId = 'cs_test_' + crypto.randomBytes(16).toString('hex');
    
    fiatTransactions[txId] = {
        txId,
        currency,
        amountFiat: amount,
        amountMYZ,
        stripeSessionId,
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    res.json({
        success: true,
        message: 'Payment intent created',
        transactionId: txId,
        stripeSessionId
    });
});

// [x] Endpoint GET /api/payments/fiat/status/:id
router.get('/status/:id', (req, res) => {
    const tx = fiatTransactions[req.params.id];
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ success: true, transaction: tx });
});

// [x] Webhook per conferme pagamento
router.post('/webhook', (req, res) => {
    const { type, data } = req.body;
    
    if (type === 'checkout.session.completed') {
        const sessionId = data.object.id;
        const tx = Object.values(fiatTransactions).find(t => t.stripeSessionId === sessionId);
        
        if (tx) {
            tx.status = 'completed';
            tx.completedAt = new Date().toISOString();
            return res.json({ success: true, message: 'Payment confirmed' });
        }
    }
    
    res.json({ received: true });
});

module.exports = router;
