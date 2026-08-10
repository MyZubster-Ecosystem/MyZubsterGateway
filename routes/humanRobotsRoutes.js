const express = require('express');
const router = express.Router();
const humanRobots = require('../human-robots/human-robots-tokenization');

router.get('/stats', (req, res) => {
  res.json({ success: true, stats: humanRobots.getStats() });
});

router.get('/all', (req, res) => {
  res.json({ success: true, humanRobots: humanRobots.generateReport() });
});

router.get('/androids', (req, res) => {
  res.json({ success: true, androids: humanRobots.androids });
});

router.get('/cyborgs', (req, res) => {
  res.json({ success: true, cyborgs: humanRobots.cyborgs });
});

router.get('/prosthetics', (req, res) => {
  res.json({ success: true, prosthetics: humanRobots.prosthetics });
});

router.get('/ai-avatars', (req, res) => {
  res.json({ success: true, aiAvatars: humanRobots.aiAvatars });
});

router.get('/companies', (req, res) => {
  res.json({ success: true, companies: humanRobots.companies });
});

module.exports = router;
