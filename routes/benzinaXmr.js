/**
 * Benzina XMR Routes — Bounty P8 / #272
 * 
 * Endpoint REST per operazioni Monero (XMR):
 *   POST /api/benzina-xmr/lock      — Blocca XMR in escrow
 *   POST /api/benzina-xmr/release   — Rilascia XMR al destinatario
 *   POST /api/benzina-xmr/refund    — Rimborsa XMR al cliente
 *   GET  /api/benzina-xmr/health    — Health check wallet
 */

const express = require('express');
const router = express.Router();
const xmrWallet = require('../gateway/xmr_wallet');
const jurisdictionGate = require('../middleware/jurisdictionGate');
const { Capability } = require('../services/jurisdiction.constants');

// Health
router.get('/health', async (req, res) => {
  try {
    const status = await xmrWallet.healthCheck();
    res.json(status);
  } catch (err) {
    res.status(503).json({ ok: false, error: err.message });
  }
});

// Lock XMR
router.post('/lock', jurisdictionGate(Capability.WALLET_TRANSFER), async (req, res) => {
  try {
    const { amount, account = 0, memo = '' } = req.body;
    if (!amount) return res.status(400).json({ error: 'amount required' });
    const result = await xmrWallet.lockXMR(parseFloat(amount), account, memo);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[benzina-xmr] lock error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Release XMR
router.post('/release', jurisdictionGate(Capability.EXTERNAL_SETTLEMENT), async (req, res) => {
  try {
    const { fromAddress, toAddress, amount } = req.body;
    if (!fromAddress || !toAddress) return res.status(400).json({ error: 'fromAddress and toAddress required' });
    const result = await xmrWallet.releaseXMR(fromAddress, toAddress, amount ? parseFloat(amount) : null);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[benzina-xmr] release error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Refund XMR
router.post('/refund', jurisdictionGate(Capability.EXTERNAL_SETTLEMENT), async (req, res) => {
  try {
    const { fromAddress, toAddress, amount } = req.body;
    if (!fromAddress || !toAddress || !amount) return res.status(400).json({ error: 'fromAddress, toAddress, and amount required' });
    const result = await xmrWallet.refundXMR(fromAddress, toAddress, parseFloat(amount));
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[benzina-xmr] refund error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
