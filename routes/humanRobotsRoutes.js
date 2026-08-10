const express = require('express');
const router = express.Router();
const humanRobots = require('../human-robots/human-robots-tokenization');

router.get('/stats', (req, res) => {
  res.json({ success: true, stats: humanRobots.getStats() });
});

router.get('/all', (req, res) => {
  res.json({ success: true, humanRobots });
});

router.get('/androidi', (req, res) => {
  res.json({ success: true, androidi: humanRobots.androidi });
});

router.get('/cyborg', (req, res) => {
  res.json({ success: true, cyborg: humanRobots.cyborg });
});

router.get('/protesi', (req, res) => {
  res.json({ success: true, protesi: humanRobots.protesi });
});

router.get('/ai-avatars', (req, res) => {
  res.json({ success: true, aiAvatars: humanRobots.aiAvatars });
});

router.get('/aziende', (req, res) => {
  res.json({ success: true, aziende: humanRobots.aziende });
});

module.exports = router;
