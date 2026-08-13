/**
 * Hardware Bridge Routes — Bounty BOT-8 / #345
 * REST API for managing physical robot connections.
 */

const express = require('express');
const router = express.Router();

// HardwareBridge instance will be injected by the main server
let bridge = null;

function setBridge(b) { bridge = b; }

/**
 * POST /api/robot/hardware/connect
 * Register a physical robot connection.
 *
 * Body: { robotId, type?, board?, firmware?, capabilities? }
 */
router.post('/connect', (req, res) => {
  try {
    const { robotId, type, board, firmware, capabilities } = req.body;
    if (!robotId) {
      return res.status(400).json({ error: 'robotId is required' });
    }

    const result = bridge ? bridge.connect(robotId, { type, board, firmware, capabilities })
                          : { connected: true, robotId, note: 'Bridge not attached to WebSocket server' };

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/robot/hardware/list
 * List all connected physical robots.
 */
router.get('/list', (req, res) => {
  try {
    const robots = bridge ? bridge.listRobots() : [];
    res.json({ robots, total: robots.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/robot/hardware/:robotId
 * Get a specific robot's status and telemetry.
 */
router.get('/:robotId', (req, res) => {
  try {
    const robot = bridge ? bridge.getRobot(req.params.robotId) : null;
    if (!robot) {
      return res.status(404).json({ error: 'Robot not found' });
    }
    res.json(robot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/robot/hardware/:robotId/command
 * Send a command to a physical robot.
 *
 * Body: { command, params?, timeoutMs? }
 */
router.post('/:robotId/command', async (req, res) => {
  try {
    const { command, params, timeoutMs } = req.body;
    if (!command) {
      return res.status(400).json({ error: 'command is required' });
    }
    if (!bridge) {
      return res.status(503).json({ error: 'Hardware bridge not initialized' });
    }

    const result = await bridge.sendCommand(req.params.robotId, command, params || {}, timeoutMs || 30000);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/robot/hardware/:robotId/disconnect
 * Disconnect a physical robot.
 */
router.post('/:robotId/disconnect', (req, res) => {
  try {
    const result = bridge ? bridge.disconnect(req.params.robotId) : { robotId: req.params.robotId, disconnected: true };
    res.json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

module.exports = { router, setBridge };
