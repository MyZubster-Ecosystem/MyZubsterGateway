const express = require('express');
const router = express.Router();

// GET /api/robots - Returns robot status overview
router.get('/robots', async (req, res) => {
    try {
        res.json({
            total: 0,
            active: 0,
            robots: [],
            message: 'Robot monitoring active. Connect via MQTT/WebSocket for live data.'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/bounties - Returns bounty overview
router.get('/bounties', async (req, res) => {
    try {
        res.json({
            total: 0,
            rewards: 0,
            bounties: [],
            message: 'Bounty tracking active. Pull from GitHub for live data.'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
