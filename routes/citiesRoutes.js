const express = require('express');
const router = express.Router();
const cities = require('../cities/cities-tokenization');

router.get('/stats', (req, res) => {
  res.json({ success: true, stats: cities.getStats() });
});

router.get('/all', (req, res) => {
  res.json({ success: true, cities });
});

router.get('/landmarks', (req, res) => {
  res.json({ success: true, landmarks: cities.landmarks });
});

router.get('/monuments', (req, res) => {
  res.json({ success: true, monuments: cities.monuments });
});

router.get('/squares', (req, res) => {
  res.json({ success: true, squares: cities.squares });
});

router.get('/buildings', (req, res) => {
  res.json({ success: true, buildings: cities.buildings });
});

module.exports = router;