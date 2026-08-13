/**
 * Webhook Routes — Bounty P6 / #270
 * REST endpoints for webhook registration and management.
 */

const express = require('express');
const router = express.Router();
const { webhookManager } = require('../models/webhook');

/**
 * POST /api/webhooks/register
 * Register a new webhook URL for event notifications.
 *
 * Body: { userId, url, events?, secret? }
 * Response: { id, url, events, createdAt }
 */
router.post('/register', (req, res) => {
  try {
    const { userId, url, events, secret } = req.body;

    if (!userId || !url) {
      return res.status(400).json({ error: 'userId and url are required' });
    }

    const webhook = webhookManager.register(userId, url, events, secret);
    res.status(201).json(webhook);
  } catch (err) {
    console.error('[Webhook] Registration error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/webhooks/list/:userId
 * List all webhooks registered by a user.
 */
router.get('/list/:userId', (req, res) => {
  try {
    const hooks = webhookManager.listByUser(req.params.userId);
    res.json({ webhooks: hooks, total: hooks.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/webhooks/:id
 * Unregister a webhook by ID.
 */
router.delete('/:id', (req, res) => {
  try {
    const result = webhookManager.unregister(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

/**
 * GET /api/webhooks/stats
 * Get global webhook delivery statistics.
 */
router.get('/stats', (req, res) => {
  try {
    const stats = webhookManager.getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/webhooks/test/:id
 * Send a test ping to a registered webhook.
 */
router.post('/test/:id', async (req, res) => {
  try {
    const hooks = webhookManager.listByUser(req.body.userId || 'system');
    const hook = hooks.find(h => h.id === req.params.id);
    if (!hook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }
    const result = await webhookManager.deliver('test.ping', {
      message: 'Webhook test ping from MyZubsterGateway',
      timestamp: new Date().toISOString()
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
