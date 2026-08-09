const express = require('express');
const router = express.Router();

const startTime = Date.now();
const metrics = {
    requests: 0,
    errors: 0,
    alerts: []
};

/**
 * 1. Uptime Monitoring
 */
router.get('/uptime', (req, res) => {
    const uptimeMs = Date.now() - startTime;
    const uptimeSeconds = Math.floor(uptimeMs / 1000);
    res.json({
        success: true,
        uptime_seconds: uptimeSeconds,
        status: 'Operational'
    });
});

/**
 * 2. Performance Metrics
 */
router.get('/metrics', (req, res) => {
    const uptimeMs = Date.now() - startTime;
    res.json({
        success: true,
        total_requests: metrics.requests,
        total_errors: metrics.errors,
        error_rate: metrics.requests > 0 ? (metrics.errors / metrics.requests).toFixed(4) : 0,
        memory_usage: process.memoryUsage(),
        uptime_ms: uptimeMs
    });
});

/**
 * 3. Error Tracking (Mock manual error log)
 */
router.post('/track-error', (req, res) => {
    metrics.errors++;
    const { message, level } = req.body;
    
    if (level === 'critical') {
        metrics.alerts.push({ message, time: new Date().toISOString() });
    }

    res.json({ success: true, message: 'Error tracked' });
});

/**
 * 4. Alert System
 */
router.get('/alerts', (req, res) => {
    res.json({
        success: true,
        active_alerts: metrics.alerts
    });
});

/**
 * 5. Dashboard Monitoring
 */
router.get('/dashboard', (req, res) => {
    res.json({
        status: metrics.errors > 50 ? 'Warning' : 'Healthy',
        uptime: Math.floor((Date.now() - startTime) / 1000),
        req_count: metrics.requests,
        err_count: metrics.errors,
        active_alerts_count: metrics.alerts.length
    });
});

module.exports = router;
