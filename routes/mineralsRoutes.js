const express = require('express');
const router = express.Router();
const minerals = require('../minerals/minerals-tokenization');

router.get('/stats', (req, res) => {
  res.json({ success: true, stats: minerals.getStats() });
});

router.get('/all', (req, res) => {
  res.json({ success: true, minerals });
});

router.get('/precious', (req, res) => {
  res.json({ success: true, precious: minerals.precious });
});

router.get('/gemstones', (req, res) => {
  res.json({ success: true, gemstones: minerals.gemstones });
});

router.get('/rare-earth', (req, res) => {
  res.json({ success: true, rare_earth: minerals.rare_earth });
});

router.get('/industrial', (req, res) => {
  res.json({ success: true, industrial: minerals.industrial });
});

module.exports = router;
