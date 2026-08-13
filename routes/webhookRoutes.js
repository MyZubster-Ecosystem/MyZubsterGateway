'use strict';

// In-memory webhook log for testing
const webhookLog = [];

/**
 * POST /webhook/receive — Receive an incoming webhook
 * Logs the payload and returns acknowledgment
 */
function receiveWebhook(req, res) {
  const { headers, body, query } = req;
  const timestamp = new Date().toISOString();
  
  const entry = {
    id: webhookLog.length + 1,
    timestamp,
    headers: req.headers,
    body: req.body || {},
    query: req.query || {},
    method: req.method,
    path: req.path,
  };
  
  webhookLog.push(entry);
  
  // Keep only last 100 entries
  if (webhookLog.length > 100) {
    webhookLog.shift();
  }
  
  return res.status(200).json({
    success: true,
    message: 'Webhook received',
    webhookId: entry.id,
    timestamp,
  });
}

/**
 * GET /webhook/log — Retrieve webhook log
 */
function getWebhookLog(req, res) {
  const { limit, since } = req.query;
  let results = [...webhookLog];
  
  if (since) {
    const sinceDate = new Date(since);
    results = results.filter(e => new Date(e.timestamp) >= sinceDate);
  }
  
  if (limit) {
    results = results.slice(-parseInt(limit, 10));
  }
  
  return res.status(200).json({
    total: webhookLog.length,
    count: results.length,
    entries: results,
  });
}

/**
 * GET /webhook/status — Health check
 */
function getStatus(req, res) {
  return res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    webhooksReceived: webhookLog.length,
    timestamp: new Date().toISOString(),
  });
}

/**
 * DELETE /webhook/log — Clear webhook log (for testing)
 */
function clearWebhookLog(req, res) {
  webhookLog.length = 0;
  return res.status(200).json({
    success: true,
    message: 'Webhook log cleared',
  });
}

// Express router setup
const express = require('express');
const router = express.Router();

router.post('/receive', receiveWebhook);
router.get('/log', getWebhookLog);
router.get('/status', getStatus);
router.delete('/log', clearWebhookLog);

module.exports = router;
module.exports._webhookLog = webhookLog; // Expose for testing
