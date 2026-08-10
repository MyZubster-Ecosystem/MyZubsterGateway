const express = require('express');
const router = express.Router();
const tv = require('../tv/tv-tokenization');

// 📺 Statistiche TV
router.get('/stats', (req, res) => {
  res.json({
    success: true,
    stats: tv.getStats()
  });
});

// 📺 Tutti gli oggetti TV
router.get('/all', (req, res) => {
  res.json({
    success: true,
    tv: tv.generateReport()
  });
});

// 📺 Canali
router.get('/channels', (req, res) => {
  res.json({
    success: true,
    channels: tv.channels
  });
});

// 📺 Contenuti
router.get('/content', (req, res) => {
  res.json({
    success: true,
    content: tv.content
  });
});

// 📺 Abbonamenti
router.get('/subscriptions', (req, res) => {
  res.json({
    success: true,
    subscriptions: tv.subscriptions
  });
});

// 📺 Dispositivi
router.get('/devices', (req, res) => {
  res.json({
    success: true,
    devices: tv.devices
  });
});

module.exports = router;
