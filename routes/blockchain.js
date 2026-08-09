/**
 * Blockchain Routes - Tracciabilita Dati Ambientali
 * Bounty #1029
 */
const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchainService');

// Registrazione dati ambientali
router.post('/register', (req, res) => {
  try {
    const { sensorId, readings, location } = req.body;
    if (!readings) return res.status(400).json({ error: 'readings required' });
    
    const result = blockchainService.registerEnvironmentalData({
      sensorId: sensorId || `sensor-${Date.now()}`,
      readings,
      location: location || 'unknown'
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verifica integrita catena
router.get('/verify', (req, res) => {
  try {
    const result = blockchainService.verifyChainIntegrity();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tokenizzazione Carbon Credits
router.post('/carbon-credits/tokenize', (req, res) => {
  try {
    const { co2ReductionKg, projectId, methodology, verifier } = req.body;
    if (!co2ReductionKg) return res.status(400).json({ error: 'co2ReductionKg required' });
    
    const credit = blockchainService.tokenizeCarbonCredits({
      co2ReductionKg,
      projectId,
      methodology,
      verifier
    });
    
    res.json({ success: true, carbonCredit: credit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lista crediti tradabili
router.get('/carbon-credits', (req, res) => {
  try {
    const credits = blockchainService.getTradableCredits();
    res.json({ total: credits.length, credits });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Smart Contract ambientale
router.post('/contracts', (req, res) => {
  try {
    const contract = blockchainService.createEnvironmentalContract(req.body || {});
    res.json({ success: true, contract });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Compliance check
router.post('/contracts/:id/compliance', (req, res) => {
  try {
    const { readings } = req.body;
    const result = blockchainService.checkContractCompliance(req.params.id, readings || []);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pagamento automatico
router.post('/payments', (req, res) => {
  try {
    const { contractId, amount, recipient } = req.body;
    const payment = blockchainService.processEnvironmentalPayment(contractId, amount, recipient);
    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Statistiche blockchain
router.get('/stats', (req, res) => {
  try {
    const stats = blockchainService.getStatistics();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
