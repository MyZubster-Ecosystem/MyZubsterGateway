// robot-integration/api/routes.js — BOT-8 Hardware Bridge Routes
const express = require('express');
const router = express.Router();
const RobotService = require('../services/RobotService');

// ---- HARDWARE CONNECT (Bounty #345) ----
// POST /api/robot/hardware/connect
router.post('/hardware/connect', (req, res) => {
  try {
    const result = RobotService.connectHardware(req.body);
    res.status(201).json(result);
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

// POST /api/robot/hardware/disconnect
router.post('/hardware/disconnect', (req, res) => {
  try {
    const result = RobotService.disconnectHardware(req.body.robotId);
    res.json(result);
  } catch (e) {
    res.status(404).json({ success: false, error: e.message });
  }
});

// GET /api/robot/hardware/connected
router.get('/hardware/connected', (req, res) => {
  res.json(RobotService.listConnected());
});

// ---- COMMANDS (Bounty #345) ----
// POST /api/robot/hardware/command
router.post('/hardware/command', (req, res) => {
  try {
    const { robotId, command, params, priority } = req.body;
    if (!robotId || !command) throw new Error('robotId and command are required');
    const result = RobotService.sendCommand(robotId, { command, params, priority });
    res.json(result);
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

// GET /api/robot/hardware/command/:robotId/history
router.get('/hardware/command/:robotId/history', (req, res) => {
  try {
    const result = RobotService.getCommandHistory(req.params.robotId, parseInt(req.query.limit) || 20);
    res.json(result);
  } catch (e) {
    res.status(404).json({ success: false, error: e.message });
  }
});

// ---- TELEMETRY (Bounty #345) ----
// POST /api/robot/hardware/telemetry
router.post('/hardware/telemetry', (req, res) => {
  try {
    const { robotId, ...telemetry } = req.body;
    if (!robotId) throw new Error('robotId is required');
    const result = RobotService.receiveTelemetry(robotId, telemetry);
    res.json(result);
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

// GET /api/robot/hardware/telemetry/:robotId?
router.get('/hardware/telemetry/:robotId?', (req, res) => {
  try {
    const result = RobotService.getTelemetry(req.params.robotId, parseInt(req.query.limit) || 50);
    res.json(result);
  } catch (e) {
    res.status(404).json({ success: false, error: e.message });
  }
});

// ---- HEARTBEAT ----
// POST /api/robot/hardware/heartbeat
router.post('/hardware/heartbeat', (req, res) => {
  try {
    const { robotId } = req.body;
    if (!robotId) throw new Error('robotId is required');
    const result = RobotService.heartbeat(robotId);
    res.json(result);
  } catch (e) {
    res.status(404).json({ success: false, error: e.message });
  }
});

// ---- DOCS ----
// GET /api/robot/hardware/docs
router.get('/hardware/docs', (req, res) => {
  res.json(RobotService.getIntegrationDocs());
});

module.exports = router;
