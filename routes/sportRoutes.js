const express = require('express');
const router = express.Router();
const sport = require('../sport/sport-tokenization');

router.get('/stats', (req, res) => {
  res.json({ success: true, stats: sport.getStats() });
});

router.get('/all', (req, res) => {
  res.json({ success: true, sport });
});

router.get('/teams', (req, res) => { res.json({ success: true, teams: sport.teams }); });
router.get('/athletes', (req, res) => { res.json({ success: true, athletes: sport.athletes }); });
router.get('/stadia', (req, res) => { res.json({ success: true, stadia: sport.stadia }); });
router.get('/events', (req, res) => { res.json({ success: true, events: sport.events }); });

module.exports = router;
