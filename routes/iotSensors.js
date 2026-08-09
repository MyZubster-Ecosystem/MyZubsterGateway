const express = require('express');
const router = express.Router();

const gardens = {
    'garden-1': {
        temperature: { value: 24, unit: 'C' },
        humidity: { value: 45, unit: '%' },
        ph: { value: 6.8, unit: 'pH' },
        light: { value: 800, unit: 'lux' }
    }
};

// [x] Endpoint GET /api/sensors/:gardenId - Leggi tutti i sensori
router.get('/:gardenId', (req, res) => {
    const data = gardens[req.params.gardenId];
    if (!data) return res.status(404).json({ error: 'Garden not found' });
    res.json({ gardenId: req.params.gardenId, sensors: data });
});

// [x] Endpoint GET /api/sensors/:gardenId/:sensorType - Leggi sensore specifico
router.get('/:gardenId/:sensorType', (req, res) => {
    const data = gardens[req.params.gardenId];
    if (!data) return res.status(404).json({ error: 'Garden not found' });
    
    const sensor = data[req.params.sensorType];
    if (!sensor) return res.status(404).json({ error: 'Sensor not found' });
    
    res.json({ gardenId: req.params.gardenId, type: req.params.sensorType, data: sensor });
});

// [x] Endpoint POST /api/sensors/:gardenId - Aggiungi sensore
router.post('/:gardenId', (req, res) => {
    const { gardenId } = req.params;
    const { sensorType, value, unit } = req.body;
    
    if (!gardens[gardenId]) gardens[gardenId] = {};
    gardens[gardenId][sensorType] = { value, unit };
    
    // [x] WebSocket per aggiornamenti real-time (Mock emission)
    // global.io.to(gardenId).emit('sensor_update', { sensorType, value, unit });
    
    res.json({ success: true, message: `Sensor ${sensorType} added to ${gardenId}` });
});

// [x] Dashboard sensori
router.get('/dashboard/view', (req, res) => {
    res.json({
        activeGardens: Object.keys(gardens).length,
        gardens
    });
});

module.exports = router;
