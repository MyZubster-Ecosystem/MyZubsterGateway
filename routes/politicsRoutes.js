const express = require('express');
const router = express.Router();
const politics = require('../politics/politics-tokenization');

// 🏛️ Statistiche politica
router.get('/stats', (req, res) => {
  res.json({
    success: true,
    stats: politics.getStats()
  });
});

// 🏛️ Tutti gli oggetti politici
router.get('/all', (req, res) => {
  res.json({
    success: true,
    politics: politics
  });
});

// 🏛️ Partiti
router.get('/parties', (req, res) => {
  res.json({
    success: true,
    parties: politics.parties
  });
});

// 🏛️ Rappresentanti
router.get('/representatives', (req, res) => {
  res.json({
    success: true,
    representatives: politics.representatives
  });
});

// 🏛️ Proposte
router.get('/proposals', (req, res) => {
  res.json({
    success: true,
    proposals: politics.proposals
  });
});

// 🏛️ Governance
router.get('/governance', (req, res) => {
  res.json({
    success: true,
    governance: politics.governance
  });
});

module.exports = router;
