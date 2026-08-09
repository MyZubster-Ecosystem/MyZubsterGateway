/**
 * Sensor Routes - Integrazione Sensori Ambientali Avanzata
 * Bounty #1026
 */
const express = require('express');
const router = express.Router();
const sensorService = require('../services/sensorAdvancedService');

// Registra sensore
router.post('/register', (req, res) => {
  try {
    const sensor = sensorService.registerSensor(req.body);
    res.json({ success: true, sensor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Registra lettura
router.post('/reading', (req, res) => {
  try {
    const { sensorId, value, metadata } = req.body;
    if (!sensorId || value === undefined) {
      return res.status(400).json({ error: 'sensorId and value required' });
    }
    const reading = sensorService.recordReading(sensorId, value, metadata);
    res.json({ success: true, reading });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Batch readings (MQTT ingestion)
router.post('/readings/batch', (req, res) => {
  try {
    const readings = sensorService.recordBatchReadings(req.body.readings || []);
    res.json({ success: true, count: readings.length, readings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// MQTT ingestion simulation
router.post('/mqtt/ingest', (req, res) => {
  try {
    const { topic, payload } = req.body;
    const result = sensorService.simulateMQTTIngestion(topic, payload);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Letture per categoria
router.get('/category/:category', (req, res) => {
  try {
    const readings = sensorService.getReadingsByCategory(
      req.params.category,
      parseInt(req.query.limit) || 100
    );
    res.json({ category: req.params.category, count: readings.length, readings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ultime letture sensore
router.get('/:sensorId/latest', (req, res) => {
  try {
    const readings = sensorService.getLatestReadings(
      req.params.sensorId,
      parseInt(req.query.limit) || 20
    );
    res.json({ sensorId: req.params.sensorId, count: readings.length, readings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Media mobile
router.get('/:sensorId/average', (req, res) => {
  try {
    const avg = sensorService.getMovingAverage(
      req.params.sensorId,
      parseInt(req.query.window) || 10
    );
    res.json(avg || { message: 'No readings available' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check soglia
router.post('/:sensorId/threshold', (req, res) => {
  try {
    const alerts = sensorService.checkThreshold(req.params.sensorId, req.body);
    res.json({
      sensorId: req.params.sensorId,
      hasAlerts: alerts !== null,
      alerts: alerts?.alerts || [],
      reading: alerts?.reading || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Statistiche globali
router.get('/stats/global', (req, res) => {
  try {
    const stats = sensorService.getGlobalStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lista sensori
router.get('/list', (req, res) => {
  try {
    res.json({
      total: Object.keys(sensorService.sensors).length,
      sensors: Object.values(sensorService.sensors)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
