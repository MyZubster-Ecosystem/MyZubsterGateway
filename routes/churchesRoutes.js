const express = require('express');
const router = express.Router();
const churches = require('../churches/churches-tokenization');

router.get('/stats', (req, res) => {
  res.json({ success: true, stats: churches.getStats() });
});

router.get('/all', (req, res) => {
  res.json({ success: true, churches });
});

router.get('/cathedrals', (req, res) => {
  res.json({ success: true, cathedrals: churches.cathedrals });
});

router.get('/saints', (req, res) => {
  res.json({ success: true, saints: churches.saints });
});

router.get('/events', (req, res) => {
  res.json({ success: true, events: churches.events });
});

router.get('/relics', (req, res) => {
  res.json({ success: true, relics: churches.relics });
});

router.get('/artworks', (req, res) => {
  res.json({ success: true, artworks: churches.artworks });
});

module.exports = router;
