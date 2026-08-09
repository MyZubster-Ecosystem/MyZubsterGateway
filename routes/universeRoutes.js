const express = require('express');
const router = express.Router();
const universe = require('../universe/universe-tokenization');

// 🌌 Statistiche universo
router.get('/stats', (req, res) => {
  res.json({
    success: true,
    stats: universe.getStats()
  });
});

// 🌌 Tutti gli oggetti
router.get('/all', (req, res) => {
  res.json({
    success: true,
    universe: universe.generateReport()
  });
});

// 🌌 Galassie
router.get('/galaxies', (req, res) => {
  res.json({
    success: true,
    galaxies: universe.galaxies
  });
});

// 🌌 Stelle
router.get('/stars', (req, res) => {
  res.json({
    success: true,
    stars: universe.stars
  });
});

// 🌍 Pianeti
router.get('/planets', (req, res) => {
  res.json({
    success: true,
    planets: universe.planets
  });
});

// 🌌 Nebulose
router.get('/nebulae', (req, res) => {
  res.json({
    success: true,
    nebulae: universe.nebulae
  });
});

// 🌀 Buchi neri
router.get('/blackholes', (req, res) => {
  res.json({
    success: true,
    blackholes: universe.blackholes
  });
});

// ⭐ Costellazioni
router.get('/constellations', (req, res) => {
  res.json({
    success: true,
    constellations: universe.constellations
  });
});

module.exports = router;
