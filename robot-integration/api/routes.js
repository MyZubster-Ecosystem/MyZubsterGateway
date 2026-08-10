const express = require('express');
const router = express.Router();
const RobotService = require('../services/RobotService');

// Middleware di autenticazione
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header required' });
  }
  req.user = { id: 'robot-user' };
  next();
};

// ============ REGISTRAZIONE ============
router.post('/register', authMiddleware, async (req, res) => {
  try {
    const robot = await RobotService.register(req.body);
    res.status(201).json({
      success: true,
      message: `🤖 Robot "${robot.name}" registrato con successo!`,
      robot: robot.toJSON()
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============ LISTA ROBOT ============
router.get('/all', (req, res) => {
  const robots = RobotService.getAllRobots();
  res.json({
    success: true,
    count: robots.length,
    robots: robots.map(r => r.toJSON())
  });
});

// ============ DETTAGLIO ROBOT ============
router.get('/:robotId', (req, res) => {
  try {
    const robot = RobotService.getRobot(req.params.robotId);
    res.json({ success: true, robot: robot.toJSON() });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// ============ STATO ROBOT ============
router.get('/status', (req, res) => {
  try {
    const robotId = req.query.robotId;
    if (!robotId) {
      return res.status(400).json({ error: 'robotId required' });
    }
    const robot = RobotService.getRobot(robotId);
    res.json({
      success: true,
      status: robot.status,
      balance: robot.balance,
      robotId: robot.id,
      name: robot.name,
      registeredAt: robot.registeredAt
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// ============ SALDO ROBOT ============
router.get('/balance', (req, res) => {
  try {
    const robotId = req.query.robotId;
    if (!robotId) {
      return res.status(400).json({ error: 'robotId required' });
    }
    const robot = RobotService.getRobot(robotId);
    res.json({
      success: true,
      robotId: robot.id,
      name: robot.name,
      balance: robot.balance || 0,
      currency: 'XMR'
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// ============ RICHIESTA PAGAMENTO (x402) ============
router.get('/:robotId/payment', async (req, res) => {
  try {
    const { amount, currency = 'XMR' } = req.query;
    if (!amount) {
      return res.status(400).json({ error: 'Amount required' });
    }
    
    const payment = await RobotService.requestPayment(
      req.params.robotId,
      parseFloat(amount),
      currency
    );
    
    res.status(402).json({
      status: 'payment_required',
      ...payment
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============ VERIFICA PAGAMENTO ============
router.get('/payment/:paymentId', async (req, res) => {
  try {
    const payment = await RobotService.checkPayment(req.params.paymentId);
    res.json({ success: true, payment });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// ============ ASSEGNA LAVORO ============
router.post('/:robotId/job', authMiddleware, async (req, res) => {
  try {
    const job = await RobotService.assignJob(req.params.robotId, req.body);
    res.status(201).json({
      success: true,
      job: {
        id: job.id,
        type: job.type,
        status: job.status,
        amount: job.amount,
        currency: job.currency,
        description: job.description,
        createdAt: job.createdAt
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============ ACCETTA LAVORO ============
router.post('/job/:jobId/accept', authMiddleware, async (req, res) => {
  try {
    const job = await RobotService.acceptJob(req.params.jobId);
    res.json({
      success: true,
      job: {
        id: job.id,
        status: job.status,
        acceptedAt: job.acceptedAt
      }
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// ============ COMPLETA LAVORO ============
router.post('/job/:jobId/complete', authMiddleware, async (req, res) => {
  try {
    const job = await RobotService.completeJob(req.params.jobId, req.body.result);
    res.json({
      success: true,
      job: {
        id: job.id,
        status: job.status,
        completedAt: job.completedAt,
        result: job.result
      }
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// ============ LISTA LAVORI ============
router.get('/:robotId/jobs', (req, res) => {
  try {
    const robot = RobotService.getRobot(req.params.robotId);
    // Filtra i lavori per questo robot
    const jobs = Array.from(RobotService.jobs.values())
      .filter(j => j.robotId === robot.id);
    res.json({
      success: true,
      jobs: jobs.map(j => ({
        id: j.id,
        type: j.type,
        status: j.status,
        amount: j.amount,
        currency: j.currency,
        description: j.description,
        createdAt: j.createdAt,
        acceptedAt: j.acceptedAt,
        completedAt: j.completedAt
      }))
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// ============ CLONA ROBOT ============
router.post('/:parentId/clone', authMiddleware, async (req, res) => {
  try {
    const clone = await RobotService.cloneRobot(req.params.parentId, req.body);
    res.status(201).json({
      success: true,
      message: '🤖 Robot clonato con successo!',
      clone: clone.toJSON()
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
