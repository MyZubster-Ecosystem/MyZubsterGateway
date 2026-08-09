const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// In-memory state for rate limiting and API keys
const rateLimits = {};
const apiKeys = {
    'test-key-123': { active: true, owner: 'wasim' }
};
const responseCache = {};

/**
 * Middleware: Request Logging
 */
router.use((req, res, next) => {
    console.log(\`[API Gateway] \${new Date().toISOString()} | \${req.method} \${req.originalUrl} | IP: \${req.ip}\`);
    next();
});

/**
 * Middleware: API Key Management
 */
router.use((req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;
    if (!apiKey || !apiKeys[apiKey] || !apiKeys[apiKey].active) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or missing API Key' });
    }
    next();
});

/**
 * Middleware: Rate Limiting per IP
 */
router.use((req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    
    if (!rateLimits[ip]) {
        rateLimits[ip] = { count: 1, windowStart: now };
    } else {
        // Reset window every 1 minute
        if (now - rateLimits[ip].windowStart > 60000) {
            rateLimits[ip] = { count: 1, windowStart: now };
        } else {
            rateLimits[ip].count++;
            if (rateLimits[ip].count > 100) { // Limit: 100 reqs / min
                return res.status(429).json({ error: 'Too Many Requests' });
            }
        }
    }
    next();
});

/**
 * 1. Generate new API Key
 */
router.post('/keys/generate', (req, res) => {
    const { owner } = req.body;
    const newKey = 'myz_' + crypto.randomBytes(16).toString('hex');
    
    apiKeys[newKey] = { active: true, owner: owner || 'anonymous' };
    
    res.json({ success: true, apiKey: newKey });
});

/**
 * 2. Example Cached Endpoint
 */
router.get('/cached-data', (req, res) => {
    const cacheKey = 'data-endpoint';
    const now = Date.now();

    if (responseCache[cacheKey] && (now - responseCache[cacheKey].timestamp < 30000)) {
        // Return cached response (valid for 30 seconds)
        return res.json(responseCache[cacheKey].data);
    }

    const newData = {
        message: 'This is expensive data to calculate',
        time: new Date().toISOString()
    };

    responseCache[cacheKey] = {
        timestamp: now,
        data: newData
    };

    res.json(newData);
});

/**
 * Middleware: Global Error Handling
 */
router.use((err, req, res, next) => {
    console.error(\`[API Gateway Error] \${err.message}\`);
    res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = router;
