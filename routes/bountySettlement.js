/**
 * @swagger
 * /api/bounty-settlement:
 *   post:
 *     summary: Create a new bounty settlement record
 *     tags: [BountySettlement]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bountyId, contributor, asset, amount, network, destination]
 *             properties:
 *               bountyId: { type: string }
 *               prId: { type: string }
 *               contributor: { type: string }
 *               asset: { type: string, enum: ['XMR', 'MYZ', 'ETH', 'USDC', 'BTC'] }
 *               amount: { type: number }
 *               network: { type: string }
 *               destination: { type: string }
 *               simulation: { type: boolean }
 *     responses:
 *       201:
 *         description: Settlement created
 *       409:
 *         description: Duplicate settlement
 */
const express = require('express');
const router = express.Router();
const BountySettlement = require('../models/BountySettlement');
const {
  createSettlement,
  transitionStatus,
  submitTransaction,
  verifyTransaction,
  confirmTransaction,
  markPaid,
  reconcile
} = require('../services/settlementLedger');

router.post('/', async (req, res) => {
  try {
    const record = await createSettlement(req.body);
    res.status(201).json(record);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Duplicate settlement', detail: err.message });
    }
    res.status(400).json({ error: err.message });
  }
});

router.post('/:id/accept', async (req, res) => {
  try {
    const record = await transitionStatus(req.params.id ? await BountySettlement.findById(req.params.id) : null, 'ACCEPTED', req.body.actor || 'system', req.body.note);
    res.json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/:id/submit', async (req, res) => {
  try {
    const record = await BountySettlement.findById(req.params.id);
    if (!record) return res.status(404).json({ error: 'Not found' });
    const updated = await submitTransaction(record, req.body.txId, req.body.actor || 'system');
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/:id/verify', async (req, res) => {
  try {
    const record = await BountySettlement.findById(req.params.id);
    if (!record) return res.status(404).json({ error: 'Not found' });
    const { record: updated, verification } = await verifyTransaction(record, req.body.actor || 'system');
    res.json({ record: updated, verification });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/:id/confirm', async (req, res) => {
  try {
    const record = await BountySettlement.findById(req.params.id);
    if (!record) return res.status(404).json({ error: 'Not found' });
    const updated = await confirmTransaction(record, req.body.actor || 'system');
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/:id/paid', async (req, res) => {
  try {
    const record = await BountySettlement.findById(req.params.id);
    if (!record) return res.status(404).json({ error: 'Not found' });
    const updated = await markPaid(record, req.body.actor || 'system');
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/reconcile', async (req, res) => {
  try {
    const report = await reconcile();
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
