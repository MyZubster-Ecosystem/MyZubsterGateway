/**
 * Tari Blockchain Routes — Bounty B4 / #257
 * 
 * Endpoint REST per operazioni Tari (MYZ):
 *   POST /api/tari/lock      — Blocca MYZ in escrow
 *   POST /api/tari/release   — Rilascia MYZ al destinatario
 *   POST /api/tari/refund    — Rimborsa MYZ al cliente
 *   GET  /api/tari/health    — Health check wallet
 */

const express = require('express');
const router = express.Router();
const myzWallet = require('../gateway/myz_wallet');
const jurisdictionGate = require('../middleware/jurisdictionGate');
const { Capability } = require('../services/jurisdiction.constants');

// Health
router.get('/health', async (req, res) => {
  try {
    const status = await myzWallet.healthCheck();
    res.json(status);
  } catch (err) {
    res.status(503).json({ ok: false, error: err.message });
  }
});

// Lock MYZ
router.post('/lock', jurisdictionGate(Capability.WALLET_TRANSFER), async (req, res) => {
  try {
    const { amount, wallet, memo = '' } = req.body;
    if (!amount) return res.status(400).json({ error: 'amount required' });
    const result = await myzWallet.lockMYZ(parseFloat(amount), wallet || null, memo);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[tari] lock error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Release MYZ
router.post('/release', jurisdictionGate(Capability.EXTERNAL_SETTLEMENT), async (req, res) => {
  try {
    const { fromAddress, toAddress, amount } = req.body;
    if (!fromAddress || !toAddress) return res.status(400).json({ error: 'fromAddress and toAddress required' });
    const result = await myzWallet.releaseMYZ(fromAddress, toAddress, amount ? parseFloat(amount) : null);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[tari] release error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Refund MYZ
router.post('/refund', jurisdictionGate(Capability.EXTERNAL_SETTLEMENT), async (req, res) => {
  try {
    const { fromAddress, toAddress, amount } = req.body;
    if (!fromAddress || !toAddress || !amount) return res.status(400).json({ error: 'fromAddress, toAddress, and amount required' });
    const result = await myzWallet.refundMYZ(fromAddress, toAddress, parseFloat(amount));
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[tari] refund error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
