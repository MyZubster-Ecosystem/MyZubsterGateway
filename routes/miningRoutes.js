const express = require('express');
const router = express.Router();

// Database miniere e risorse
const miningData = {
  resources: [],
  operations: [],
  stats: {}
};

// Middleware auth
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization required' });
  }
  req.user = { id: 'miner' };
  next();
};

// Avvia estrazione
router.post('/start', authMiddleware, (req, res) => {
  try {
    const { resourceType, location, quantity } = req.body;
    
    const operation = {
      id: `extract_${Date.now()}`,
      resourceType: resourceType || 'asteroid',
      location: location || 'cintura_asteroidi',
      quantity: quantity || 1000,
      status: 'extracting',
      startedAt: new Date().toISOString(),
      progress: 0,
      reward: 0
    };
    
    miningData.operations.push(operation);
    
    res.status(201).json({
      success: true,
      message: `⛏️ Estrazione avviata!`,
      operation
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Stato estrazione
router.get('/status/:id', (req, res) => {
  const operation = miningData.operations.find(o => o.id === req.params.id);
  if (!operation) {
    return res.status(404).json({ error: 'Operazione non trovata' });
  }
  res.json({ success: true, operation });
});

// Lista operazioni
router.get('/operations', (req, res) => {
  res.json({
    success: true,
    count: miningData.operations.length,
    operations: miningData.operations
  });
});

// Risorse estratte
router.get('/resources', (req, res) => {
  res.json({
    success: true,
    resources: miningData.resources
  });
});

// Statistiche
router.get('/stats', (req, res) => {
  const totalExtracted = miningData.resources.reduce((sum, r) => sum + r.quantity, 0);
  const totalOperations = miningData.operations.length;
  
  res.json({
    success: true,
    stats: {
      totalExtracted,
      totalOperations,
      resources: miningData.resources
    }
  });
});

// Completa estrazione
router.post('/complete/:id', authMiddleware, (req, res) => {
  const operation = miningData.operations.find(o => o.id === req.params.id);
  if (!operation) {
    return res.status(404).json({ error: 'Operazione non trovata' });
  }
  
  operation.status = 'completed';
  operation.completedAt = new Date().toISOString();
  operation.progress = 100;
  
  // Calcola reward
  const reward = operation.quantity * 0.1;
  operation.reward = reward;
  
  // Aggiungi alle risorse
  miningData.resources.push({
    id: `res_${Date.now()}`,
    type: operation.resourceType,
    quantity: operation.quantity,
    location: operation.location,
    extractedAt: operation.completedAt,
    reward: reward
  });
  
  res.json({
    success: true,
    message: `✅ Estrazione completata!`,
    operation,
    reward: `${reward} MYZ`
  });
});

module.exports = router;
