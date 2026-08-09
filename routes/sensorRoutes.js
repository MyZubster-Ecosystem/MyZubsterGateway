const express = require('express');
const router = express.Router();

// Database sensori in memoria (in produzione usa MongoDB)
const sensorData = [];

// Middleware di autenticazione
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header required' });
  }
  req.user = { id: 'sensor-user' };
  next();
};

// POST /api/sensors/data - Invia dati sensori
router.post('/data', authMiddleware, (req, res) => {
  try {
    const { robotId, timestamp, sensors, location } = req.body;
    
    if (!robotId) {
      return res.status(400).json({ error: 'robotId required' });
    }
    
    const data = {
      id: sensorData.length + 1,
      robotId,
      timestamp: timestamp || new Date().toISOString(),
      sensors: sensors || {},
      location: location || null,
      receivedAt: new Date().toISOString()
    };
    
    sensorData.push(data);
    
    res.status(201).json({
      success: true,
      message: `✅ Dati sensori ricevuti da ${robotId}`,
      data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/sensors/data - Ottieni dati sensori
router.get('/data', (req, res) => {
  try {
    const { robotId, limit = 10 } = req.query;
    
    let data = sensorData;
    if (robotId) {
      data = data.filter(d => d.robotId === robotId);
    }
    
    // Ordina per timestamp decrescente e limita
    data = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, parseInt(limit));
    
    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/sensors/status - Ottieni ultimo stato sensori
router.get('/status', (req, res) => {
  try {
    const { robotId } = req.query;
    
    if (!robotId) {
      return res.status(400).json({ error: 'robotId required' });
    }
    
    const lastData = sensorData
      .filter(d => d.robotId === robotId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    
    if (!lastData) {
      return res.status(404).json({ error: 'No sensor data found for this robot' });
    }
    
    res.json({
      success: true,
      robotId,
      lastUpdate: lastData.timestamp,
      sensors: lastData.sensors,
      location: lastData.location
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/sensors/stats - Statistiche sensori
router.get('/stats', (req, res) => {
  try {
    const { robotId } = req.query;
    
    let data = sensorData;
    if (robotId) {
      data = data.filter(d => d.robotId === robotId);
    }
    
    if (data.length === 0) {
      return res.json({
        success: true,
        count: 0,
        stats: {}
      });
    }
    
    // Calcola medie
    const stats = {
      count: data.length,
      firstReading: data[data.length - 1]?.timestamp,
      lastReading: data[0]?.timestamp,
      averages: {}
    };
    
    // Calcola medie per ogni sensore numerico
    const sensorKeys = Object.keys(data[0]?.sensors || {});
    for (const key of sensorKeys) {
      const values = data.map(d => d.sensors[key]).filter(v => typeof v === 'number' && !isNaN(v));
      if (values.length > 0) {
        stats.averages[key] = values.reduce((a, b) => a + b, 0) / values.length;
      }
    }
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
