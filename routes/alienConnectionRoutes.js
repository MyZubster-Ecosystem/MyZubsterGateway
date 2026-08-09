const express = require('express');
const router = express.Router();
const earthConnection = require('../alien/earth-connection');

// 🌍 Connetti ZORGAX alla Terra
router.post('/connect', async (req, res) => {
  try {
    const result = await earthConnection.connect();
    res.json({
      success: result,
      status: earthConnection.getStatus(),
      message: result ? 'ZORGAX connesso alla Terra!' : 'Errore connessione'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📡 Ricevi messaggio dalla Terra
router.post('/message', (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Messaggio richiesto' });
  }
  
  const response = earthConnection.receiveMessage(message);
  res.json({
    success: true,
    message,
    response,
    timestamp: new Date()
  });
});

// 📊 Stato connessione
router.get('/status', (req, res) => {
  res.json({
    success: true,
    status: earthConnection.getStatus()
  });
});

// 📡 Dati Terra in tempo reale
router.get('/earth-data', (req, res) => {
  res.json({
    success: true,
    data: earthConnection.earthData,
    timestamp: new Date()
  });
});

// 📊 Statistiche connessione
router.get('/stats', (req, res) => {
  const status = earthConnection.getStatus();
  res.json({
    success: true,
    stats: {
      connected: status.status === 'connected',
      duration: status.connectedSince ? 
        `${Math.floor((Date.now() - new Date(status.connectedSince)) / 1000 / 60)} minuti` : 
        'Non connesso',
      messagesCount: status.messagesCount,
      lastMessage: status.lastMessage,
      earthTemperature: status.earthData.temperature,
      earthHumidity: status.earthData.humidity
    }
  });
});

// 🔌 Disconnetti
router.post('/disconnect', (req, res) => {
  earthConnection.disconnect();
  res.json({
    success: true,
    message: 'ZORGAX disconnesso dalla Terra'
  });
});

module.exports = router;
