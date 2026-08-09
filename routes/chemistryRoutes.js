const express = require('express');
const router = express.Router();
const chemistry = require('../chemistry/chemistry-tokenization');

router.get('/stats', (req, res) => {
  res.json({ success: true, stats: chemistry.getStats() });
});

router.get('/all', (req, res) => {
  res.json({ success: true, chemistry });
});

router.get('/elements', (req, res) => {
  res.json({ success: true, elements: chemistry.elements });
});

router.get('/compounds', (req, res) => {
  res.json({ success: true, compounds: chemistry.compounds });
});

router.get('/molecules', (req, res) => {
  res.json({ success: true, molecules: chemistry.molecules });
});

router.get('/reactions', (req, res) => {
  res.json({ success: true, reactions: chemistry.reactions });
});

router.get('/materials', (req, res) => {
  res.json({ success: true, materials: chemistry.materials });
});

router.get('/discoveries', (req, res) => {
  res.json({ success: true, discoveries: chemistry.discoveries });
});

router.get('/nobel', (req, res) => {
  res.json({ success: true, nobel: chemistry.nobel });
});

module.exports = router;
