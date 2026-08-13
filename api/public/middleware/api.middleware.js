/**
 * 🔌 API Middleware - Gestione API Pubbliche
 */

const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

// Rate limiting per le API pubbliche
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minuti
    max: 100, // limite di 100 richieste per windowMs
    message: {
        success: false,
        error: 'Troppe richieste, riprova tra 15 minuti'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiting più stringente per endpoint sensibili
const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 ora
    max: 20, // 20 richieste per ora
    message: {
        success: false,
        error: 'Limite richieste raggiunto, riprova tra 1 ora'
    }
});

// Verifica API Key
const validateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
        return res.status(401).json({
            success: false,
            error: 'API Key richiesta'
        });
    }
    
    // Verifica la validità dell'API Key
    // In produzione, verificare contro un database
    const validKeys = process.env.API_KEYS ? process.env.API_KEYS.split(',') : ['test_key_123'];
    
    if (!validKeys.includes(apiKey)) {
        return res.status(401).json({
            success: false,
            error: 'API Key non valida'
        });
    }
    
    next();
};

// Log delle richieste API
const apiLogger = (req, res, next) => {
    const start = Date.now();
    
    // Log quando la risposta viene inviata
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`📡 API: ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
        console.log(`   IP: ${req.ip}, User-Agent: ${req.get('User-Agent')}`);
    });
    
    next();
};

// CORS per le API
const corsOptions = {
    origin: process.env.API_CORS_ORIGIN ? process.env.API_CORS_ORIGIN.split(',') : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
    credentials: true,
    maxAge: 86400 // 24 ore
};

module.exports = {
    apiLimiter,
    strictLimiter,
    validateApiKey,
    apiLogger,
    corsOptions
};
