const express = require('express');
const router = express.Router();
const RobotService = require('../services/RobotService');

// Registra un robot
router.post('/register', async (req, res) => {
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

// Ottieni tutti i robot
router.get('/all', (req, res) => {
  const robots = RobotService.getAllRobots();
  res.json({
    success: true,
    count: robots.length,
    robots: robots.map(r => r.toJSON())
  });
});

// Ottieni un robot
router.get('/:robotId', (req, res) => {
  try {
    const robot = RobotService.getRobot(req.params.robotId);
    res.json({ success: true, robot: robot.toJSON() });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Richiedi pagamento (x402)
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

// Verifica pagamento
router.get('/payment/:paymentId', async (req, res) => {
  try {
    const payment = await RobotService.checkPayment(req.params.paymentId);
    res.json({ success: true, payment });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Assegna lavoro
router.post('/:robotId/job', async (req, res) => {
  try {
    const job = await RobotService.assignJob(req.params.robotId, req.body);
    res.status(201).json({ success: true, job });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Accetta lavoro
router.post('/job/:jobId/accept', async (req, res) => {
  try {
    const job = await RobotService.acceptJob(req.params.jobId);
    res.json({ success: true, job });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Completa lavoro
router.post('/job/:jobId/complete', async (req, res) => {
  try {
    const job = await RobotService.completeJob(req.params.jobId, req.body.result);
    res.json({ success: true, job });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Clona robot
router.post('/:parentId/clone', async (req, res) => {
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

// Ottieni lavori di un robot
router.get('/:robotId/jobs', (req, res) => {
  try {
    const robot = RobotService.getRobot(req.params.robotId);
    // Filtra i lavori per questo robot
    const jobs = Array.from(RobotService.jobs.values())
      .filter(j => j.robotId === robot.id);
    res.json({ success: true, jobs });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

module.exports = router;
