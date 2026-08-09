<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// In-memory database for demo
const pumps = {};
const transactions = {};

const MYZUBSTER_XMR_ADDRESS = "44AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3H7otXft3XjrpDtQGv7SqSsaBYBb98uNbr2VBQp7fSyC5hVv5PeQQbpL";

/**
 * 1. Generazione QR con indirizzo XMR
 * Generate a payment request and a Monero URI for the QR code.
 */
router.post('/pump/:id/request-payment', (req, res) => {
    const pumpId = req.params.id;
    const { amountXMR } = req.body;

    if (!amountXMR || amountXMR <= 0) {
        return res.status(400).json({ error: 'Valid amountXMR is required' });
    }

    const txId = crypto.randomUUID();
    const paymentId = crypto.randomBytes(8).toString('hex'); // standard 64-bit payment ID or 256-bit

    // Construct standard Monero URI
    // Format: monero:<address>?tx_amount=<amount>&tx_payment_id=<payment_id>
    const moneroUri = \`monero:\${MYZUBSTER_XMR_ADDRESS}?tx_amount=\${amountXMR}&tx_payment_id=\${paymentId}\`;

    transactions[txId] = {
        txId,
        pumpId,
        amountXMR,
        paymentId,
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    pumps[pumpId] = {
        status: 'locked',
        currentTx: txId
    };

    res.json({
        success: true,
        txId,
        pumpId,
        moneroUri,
        paymentId,
        amountXMR,
        status: 'pending'
    });
});

/**
 * 2. Scansione automatica & 3. Conferma pagamento
 * Webhook or polling endpoint to simulate network confirmation of XMR payment
 */
router.post('/webhook/xmr-confirm', (req, res) => {
    const { txId, paymentId } = req.body;

    const tx = transactions[txId];
    if (!tx || tx.paymentId !== paymentId) {
        return res.status(404).json({ error: 'Transaction not found or invalid paymentId' });
    }

    if (tx.status === 'completed') {
        return res.json({ success: true, message: 'Already completed' });
    }

    // Confirm payment
    tx.status = 'completed';
    tx.confirmedAt = new Date().toISOString();

    // 4. Sblocco pompa
    if (pumps[tx.pumpId]) {
        pumps[tx.pumpId].status = 'unlocked';
    }

    res.json({
        success: true,
        message: 'Payment confirmed. Pump unlocked.',
        pumpStatus: 'unlocked',
        tx
    });
});

/**
 * Check pump status
 */
router.get('/pump/:id', (req, res) => {
    const pumpId = req.params.id;
    const pump = pumps[pumpId] || { status: 'locked', currentTx: null };
    res.json({ pumpId, ...pump });
=======
/**
 * BenzinaXMR Routes - #700 Pagamento + #701 Wallet Stazioni
 */
const express = require('express');
const router = express.Router();
const svc = require('../services/benzinaXmrService');

// #700: Pagamento Benzina in XMR
router.post('/calculate', async (req, res) => {
  try { const { liters, fuelType } = req.body; const price = await svc.calculatePrice(liters, fuelType); res.json(price); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/pay', async (req, res) => {
  try { const { stationId, liters, fuelType, licensePlate } = req.body; const payment = await svc.processPayment(stationId, liters, fuelType, licensePlate); res.json(payment); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/pay/:id', (req, res) => {
  const p = svc.getPayment(req.params.id);
  p ? res.json(p) : res.status(404).json({ error: 'Payment not found' });
});

router.get('/pay/:id/verify', async (req, res) => {
  try { const result = await svc.verifyPayment(req.params.id); res.json(result); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// #701: Wallet Monero Stazioni
router.post('/stations', (req, res) => {
  try { const { name, location, walletAddress } = req.body; const station = svc.registerStation(name, location, walletAddress); res.json(station); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/stations', (req, res) => { res.json(svc.getAllStations()); });

router.get('/stations/:id', (req, res) => {
  const s = svc.getStation(req.params.id);
  s ? res.json(s) : res.status(404).json({ error: 'Station not found' });
});

router.get('/stations/:id/dashboard', (req, res) => {
  const d = svc.getStationDashboard(req.params.id);
  d ? res.json(d) : res.status(404).json({ error: 'Station not found' });
});

router.get('/rate', async (req, res) => {
  try { const rate = await svc.getXmrRate(); res.json({ xmr_eur: rate }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/convert', async (req, res) => {
  try { const { xmr, fuelType } = req.query; const result = await svc.convertXmrToLiters(parseFloat(xmr), fuelType); res.json(result); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/receipt/:id', (req, res) => {
  const r = svc.getReceipt(req.params.id);
  r ? res.json(r) : res.status(404).json({ error: 'Receipt not found' });
>>>>>>> origin/main
});

module.exports = router;
