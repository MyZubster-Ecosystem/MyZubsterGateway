const express = require('express');
const router = express.Router();

// Database dei robot
const robots = [];
let robotIdCounter = 1;

// Funzione helper per trovare un robot (case-insensitive)
const findRobot = (robotId) => {
  if (!robotId) return null;
  return robots.find(r => r.robotId.toLowerCase() === robotId.toLowerCase());
};

// Middleware di autenticazione
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header required' });
  }
  req.user = { id: 'robot-user' };
  next();
};

// Registra un robot
router.post('/register', authMiddleware, (req, res) => {
  try {
    const { robotId, name, brand, model, walletAddress, capabilities, metadata } = req.body;
    
    if (!robotId || !name) {
      return res.status(400).json({ error: 'robotId and name required' });
    }
    
    if (findRobot(robotId)) {
      return res.status(400).json({ error: 'Robot already registered' });
    }
    
    const robot = {
      id: robotIdCounter++,
      robotId: robotId,
      name,
      brand: brand || 'Sconosciuto',
      model: model || 'Sconosciuto',
      walletAddress: walletAddress || 'N/A',
      capabilities: capabilities || [],
      metadata: metadata || {},
      status: 'registered',
      registeredAt: new Date().toISOString(),
      balance: 0
    };
    
    robots.push(robot);
    
    res.status(201).json({
      success: true,
      message: `🤖 Robot "${name}" registrato con successo!`,
      robot
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ottieni tutti i robot
router.get('/all', (req, res) => {
  res.json({
    success: true,
    count: robots.length,
    robots: robots
  });
});

// Ottieni lo stato del robot - usando sia query che param
router.get('/status', (req, res) => {
  // Prendi robotId da query o da params
  const robotId = req.query.robotId || req.params.robotId;
  
  console.log('🔍 Status request for robotId:', robotId);
  console.log('📋 Robots in memory:', robots.map(r => r.robotId));
  
  if (!robotId) {
    return res.status(400).json({ error: 'robotId query parameter required' });
  }
  
  const robot = findRobot(robotId);
  if (!robot) {
    return res.status(404).json({ error: `Robot not found: ${robotId}` });
  }
  
  res.json({ 
    success: true, 
    robotId: robot.robotId,
    name: robot.name,
    status: robot.status,
    brand: robot.brand,
    model: robot.model,
    registeredAt: robot.registeredAt,
    balance: robot.balance || 0,
    capabilities: robot.capabilities,
    metadata: robot.metadata
  });
});

// Ottieni il saldo del robot
router.get('/balance', (req, res) => {
  const robotId = req.query.robotId || req.params.robotId;
  
  console.log('💰 Balance request for robotId:', robotId);
  
  if (!robotId) {
    return res.status(400).json({ error: 'robotId query parameter required' });
  }
  
  const robot = findRobot(robotId);
  if (!robot) {
    return res.status(404).json({ error: `Robot not found: ${robotId}` });
  }
  
  res.json({ 
    success: true, 
    robotId: robot.robotId,
    name: robot.name,
    balance: robot.balance || 0,
    currency: 'XMR'
  });
});

// Aggiorna il saldo del robot
router.post('/balance/update', authMiddleware, (req, res) => {
  try {
    const { robotId, amount } = req.body;
    
    console.log('💳 Update balance for:', robotId, 'amount:', amount);
    
    if (!robotId || amount === undefined) {
      return res.status(400).json({ error: 'robotId and amount required' });
    }
    
    const robot = findRobot(robotId);
    if (!robot) {
      return res.status(404).json({ error: `Robot not found: ${robotId}` });
    }
    
    robot.balance = (robot.balance || 0) + amount;
    
    res.json({
      success: true,
      message: `💰 Saldo aggiornato per ${robot.name}`,
      robotId: robot.robotId,
      newBalance: robot.balance,
      currency: 'XMR'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mostra tutti i robot (debug)
router.get('/debug/all', (req, res) => {
  res.json({
    count: robots.length,
    robots: robots.map(r => ({
      robotId: r.robotId,
      name: r.name,
      balance: r.balance,
      status: r.status
    }))
  });
});

module.exports = router;
