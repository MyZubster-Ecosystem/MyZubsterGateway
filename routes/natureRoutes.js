const express = require('express');
const router = express.Router();
const nature = require('../nature/nature-tokenization');

router.get('/stats', (req, res) => {
  res.json({ success: true, stats: nature.getStats() });
});

router.get('/all', (req, res) => {
  res.json({ success: true, nature });
});

router.get('/animals', (req, res) => {
  res.json({ success: true, animals: nature.animals });
});

router.get('/plants', (req, res) => {
  res.json({ success: true, plants: nature.plants });
});

router.get('/ecosystems', (req, res) => {
  res.json({ success: true, ecosystems: nature.ecosystems });
});

router.get('/conservation', (req, res) => {
  res.json({ success: true, conservation: nature.conservation });
});

module.exports = router;
