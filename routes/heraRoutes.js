const express = require('express');
const router = express.Router();
const HeraRobot = require('../models/HeraRobot');

// Database robot urbani
const robots = [];
let counter = 1;

// Middleware auth
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization required' });
  }
  req.user = { id: 'hera-user' };
  next();
};

// Registra robot urbano
router.post('/register', authMiddleware, (req, res) => {
  try {
    console.log('📝 Registrazione robot Hera:', req.body);
    
    const robotData = {
      id: req.body.id || `hera-${Date.now()}`,
      name: req.body.name || 'Hera Robot',
      type: req.body.type || 'urban_agriculture',
      brand: req.body.brand || 'MyZubster',
      model: req.body.model || 'Hera v1.0',
      walletAddress: req.body.walletAddress || '45M4DW1ug8bdQowWpxucTpgsfjLbVxbYaAra79VewmBobuuhgqTjyD4R3DzpqLM2veiphcB16n24qN1QbLg3y2PYGK3Qkoe',
      owner: req.body.owner || '45M4DW1ug8bdQowWpxucTpgsfjLbVxbYaAra79VewmBobuuhgqTjyD4R3DzpqLM2veiphcB16n24qN1QbLg3y2PYGK3Qkoe',
      capabilities: req.body.capabilities || [],
      metadata: req.body.metadata || {},
      status: 'registered'
    };
    
    const robot = new HeraRobot(robotData);
    
    // Verifica duplicati
    if (robots.find(r => r.id === robot.id)) {
      return res.status(400).json({ error: 'Robot already registered' });
    }
    
    robots.push(robot);
    console.log(`✅ Robot ${robot.name} registrato con ID: ${robot.id}`);
    
    res.status(201).json({
      success: true,
      message: `🌱 Robot urbano "${robot.name}" registrato!`,
      robot: robot.toJSON()
    });
  } catch (error) {
    console.error('❌ Errore registrazione:', error);
    res.status(400).json({ error: error.message });
  }
});

// Lista robot urbani
router.get('/all', (req, res) => {
  res.json({
    success: true,
    count: robots.length,
    robots: robots.map(r => r.toJSON())
  });
});

// Dettaglio robot
router.get('/:id', (req, res) => {
  const robot = robots.find(r => r.id === req.params.id);
  if (!robot) return res.status(404).json({ error: 'Robot not found' });
  res.json({ success: true, robot: robot.toJSON() });
});

// Stato robot
router.get('/status/:id', (req, res) => {
  const robot = robots.find(r => r.id === req.params.id);
  if (!robot) return res.status(404).json({ error: 'Robot not found' });
  res.json({
    success: true,
    status: robot.status,
    battery: robot.metadata.batteryLife,
    lastActive: robot.lastActive,
    jobsCompleted: robot.jobsCompleted,
    areaCovered: robot.areaCovered
  });
});

// Assegna lavoro urbano
router.post('/:id/job', authMiddleware, (req, res) => {
  try {
    const robot = robots.find(r => r.id === req.params.id);
    if (!robot) return res.status(404).json({ error: 'Robot not found' });
    
    const job = {
      id: `hera_job_${Date.now()}`,
      robotId: robot.id,
      type: req.body.type || 'irrigazione',
      status: 'assigned',
      assignedAt: new Date().toISOString(),
      parameters: req.body.parameters || {},
      amount: req.body.amount || 0.005,
      currency: req.body.currency || 'XMR'
    };
    
    // Aggiorna statistiche robot
    robot.lastActive = new Date().toISOString();
    robot.jobsCompleted = (robot.jobsCompleted || 0) + 1;
    robot.areaCovered = (robot.areaCovered || 0) + (req.body.area || 1);
    
    res.status(201).json({
      success: true,
      job,
      robot: robot.toJSON()
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Statistiche robot urbani
router.get('/stats', (req, res) => {
  const total = robots.length;
  const active = robots.filter(r => r.status === 'active').length;
  const totalJobs = robots.reduce((sum, r) => sum + (r.jobsCompleted || 0), 0);
  const totalArea = robots.reduce((sum, r) => sum + (r.areaCovered || 0), 0);
  
  res.json({
    success: true,
    stats: {
      totalRobots: total,
      activeRobots: active,
      totalJobs,
      totalAreaCovered: totalArea,
      averageJobsPerRobot: total > 0 ? (totalJobs / total).toFixed(1) : 0
    }
  });
});

module.exports = router;
