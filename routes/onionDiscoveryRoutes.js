'use strict';

const express = require('express');
const { OnionDiscoveryService } = require('../services/onionDiscoveryService');

const router = express.Router();

router.get('/nodes', (_req, res) => {
  try {
    const service = new OnionDiscoveryService();
    return res.json(service.snapshot());
  } catch (error) {
    return res.status(503).json({
      error: 'onion-discovery-unavailable',
      message: error.message,
    });
  }
});

module.exports = router;
