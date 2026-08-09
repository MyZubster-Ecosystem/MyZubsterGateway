const express = require('express');
const router = express.Router();
const colonization = require('../colonization/colonization-system');

// 🚀 Statistiche colonizzazione
router.get('/stats', (req, res) => {
  res.json({
    success: true,
    stats: colonization.getStats()
  });
});

// 🌍 Tutte le colonie
router.get('/colonies', (req, res) => {
  res.json({
    success: true,
    colonies: colonization.colonies
  });
});

// 🌍 Dettaglio colonia
router.get('/colonies/:id', (req, res) => {
  const colony = colonization.colonies.find(c => c.id === req.params.id);
  if (!colony) {
    return res.status(404).json({ error: 'Colonia non trovata' });
  }
  res.json({ success: true, colony });
});

// 🆕 Crea colonia
router.post('/colonies', (req, res) => {
  const { name, planet, population, infrastructure } = req.body;
  if (!name || !planet) {
    return res.status(400).json({ error: 'Nome e pianeta richiesti' });
  }
  
  const colony = colonization.addColony(name, planet, population || 1000, infrastructure);
  res.json({ success: true, colony });
});

// 🔧 Sviluppa infrastruttura
router.post('/colonies/:id/infrastructure', (req, res) => {
  const { type } = req.body;
  if (!type) {
    return res.status(400).json({ error: 'Tipo infrastruttura richiesto' });
  }
  
  const colony = colonization.developInfrastructure(req.params.id, type);
  if (!colony) {
    return res.status(404).json({ error: 'Colonia non trovata' });
  }
  
  res.json({ success: true, colony });
});

// 👨‍👩‍👧‍👦 Espandi popolazione
router.post('/colonies/:id/expand', (req, res) => {
  const { growth } = req.body;
  if (!growth || growth <= 0) {
    return res.status(400).json({ error: 'Incremento popolazione richiesto' });
  }
  
  const colony = colonization.expandPopulation(req.params.id, growth);
  if (!colony) {
    return res.status(404).json({ error: 'Colonia non trovata' });
  }
  
  res.json({ success: true, colony });
});

// 📊 Rapporto completo
router.get('/report', (req, res) => {
  res.json({
    success: true,
    report: colonization.generateReport()
  });
});

// 🚀 Pianifica missione
router.post('/missions', (req, res) => {
  const { destination, objective, resources } = req.body;
  if (!destination || !objective) {
    return res.status(400).json({ error: 'Destinazione e obiettivo richiesti' });
  }
  
  const mission = colonization.planMission(destination, objective, resources);
  res.json({ success: true, mission });
});

module.exports = router;
