const express = require('express');
const router = express.Router();
const gaming = require('../gaming/gaming-tokenization');

router.get('/stats', (req, res) => {
  res.json({ success: true, stats: gaming.getStats() });
});

router.get('/all', (req, res) => {
  res.json({ success: true, gaming });
});

router.get('/games', (req, res) => {
  res.json({ success: true, games: gaming.games });
});

router.get('/characters', (req, res) => {
  res.json({ success: true, characters: gaming.characters });
});

router.get('/consoles', (req, res) => {
  res.json({ success: true, consoles: gaming.consoles });
});

router.get('/esports', (req, res) => {
  res.json({ success: true, esports: gaming.esports });
});

module.exports = router;