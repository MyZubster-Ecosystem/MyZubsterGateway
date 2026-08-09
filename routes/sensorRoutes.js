// routes/sensorRoutes.js - IoT Sensor Routes for Urban Gardens
const express = require('express');
const router = express.Router();
const sensorService = require('../services/sensorService');

// GET /api/sensors/:gardenId - Read all sensors for a garden
router.get('/:gardenId', async (req, res) => {
  try {
    const { gardenId } = req.params;
    const { days = 7 } = req.query;
    const data = await sensorService.getGardenData(gardenId, parseInt(days));
    res.json({ success: true, gardenId, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/sensors/:gardenId/:sensorType - Read specific sensor type
router.get('/:gardenId/:sensorType', async (req, res) => {
  try {
    const { gardenId, sensorType } = req.params;
    const validTypes = ['ph', 'ec', 'temperature', 'humidity'];
    if (!validTypes.includes(sensorType)) {
      return res.status(400).json({ success: false, error: 'Invalid sensor type. Valid: ph, ec, temperature, humidity' });
    }
    const { days = 7 } = req.query;
    const allData = await sensorService.getGardenData(gardenId, parseInt(days));
    const filtered = allData.map(d => ({
      gardenId: d.gardenId,
      value: d[sensorType],
      timestamp: d.timestamp
    })).filter(d => d.value !== null && d.value !== undefined);
    res.json({ success: true, gardenId, sensorType, count: filtered.length, data: filtered });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/sensors/:gardenId - Add sensor reading
router.post('/:gardenId', async (req, res) => {
  try {
    const { gardenId } = req.params;
    const data = { ...req.body, gardenId };
    const sensorData = await sensorService.receiveSensorData(data);
    // Emit WebSocket event
    const wsServer = req.app.get('wsServer');
    if (wsServer) {
      wsServer.to('sensors').emit('sensorUpdate', { gardenId, data: sensorData });
    }
    res.json({ success: true, data: sensorData });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET /api/sensors/:gardenId/stats - Statistics
router.get('/:gardenId/stats', async (req, res) => {
  try {
    const { gardenId } = req.params;
    const stats = await sensorService.getGardenStats(gardenId);
    res.json({ success: true, gardenId, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/sensors/:gardenId/latest - Latest reading
router.get('/:gardenId/latest', async (req, res) => {
  try {
    const { gardenId } = req.params;
    const data = await sensorService.getLatestData(gardenId);
    res.json({ success: true, gardenId, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
