const express = require('express');
const router = express.Router();
const history = require('../history/history-tokenization');

router.get('/stats', (req, res) => {
  res.json({ success: true, stats: history.getStats() });
});

router.get('/all', (req, res) => {
  res.json({ success: true, history });
});

router.get('/events', (req, res) => {
  res.json({ success: true, events: history.events });
});

router.get('/figures', (req, res) => {
  res.json({ success: true, figures: history.figures });
});

router.get('/civilizations', (req, res) => {
  res.json({ success: true, civilizations: history.civilizations });
});

router.get('/periods', (req, res) => {
  res.json({ success: true, periods: history.periods });
});

router.get('/monuments', (req, res) => {
  res.json({ success: true, monuments: history.monuments });
});

router.get('/battles', (req, res) => {
  res.json({ success: true, battles: history.battles });
});

router.get('/treaties', (req, res) => {
  res.json({ success: true, treaties: history.treaties });
});

router.get('/discoveries', (req, res) => {
  res.json({ success: true, discoveries: history.discoveries });
});

module.exports = router;
