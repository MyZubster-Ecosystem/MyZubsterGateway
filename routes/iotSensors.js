const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// In-memory data store for sensors
const sensorsData = {};

/**
 * 1. Sensori di temperatura e umidità
 * Receive telemetry data from IoT devices
 */
router.post('/telemetry', (req, res) => {
    const { deviceId, temperature, humidity } = req.body;
    
    if (!deviceId) {
        return res.status(400).json({ error: 'deviceId is required' });
    }

    if (!sensorsData[deviceId]) {
        sensorsData[deviceId] = [];
    }
    
    const telemetryEvent = {
        id: crypto.randomUUID(),
        temperature: Number(temperature),
        humidity: Number(humidity),
        timestamp: new Date().toISOString()
    };
    
    sensorsData[deviceId].push(telemetryEvent);

    // Keep only the last 100 readings
    if (sensorsData[deviceId].length > 100) {
        sensorsData[deviceId].shift();
    }

    res.json({
        success: true,
        message: 'Telemetry data saved',
        event: telemetryEvent
    });
});

/**
 * 3. Dashboard in tempo reale
 * Returns the current state and recent history for the real-time dashboard
 */
router.get('/dashboard/:deviceId', (req, res) => {
    const { deviceId } = req.params;
    const data = sensorsData[deviceId] || [];
    
    if (data.length === 0) {
        return res.json({
            deviceId,
            status: 'offline',
            current: null,
            history: []
        });
    }

    res.json({
        deviceId,
        status: 'online',
        current: data[data.length - 1],
        history: data
    });
});

/**
 * Get all active devices for integration
 */
router.get('/devices', (req, res) => {
    const devices = Object.keys(sensorsData).map(deviceId => ({
        deviceId,
        latestReading: sensorsData[deviceId][sensorsData[deviceId].length - 1]
    }));
    
    res.json({
        count: devices.length,
        devices
    });
});

module.exports = router;
