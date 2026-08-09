// Security middleware for MyZubster Gateway
// Fixes identified vulnerabilities (Closes #889)

const helmet = require('helmet');

/**
 * Security middleware setup
 * - Helmet for HTTP security headers
 * - Rate limiting placeholder
 * - Input sanitization
 */

function setupSecurity(app) {
  // 1. Helmet security headers (XSS protection, CSP, HSTS, etc.)
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
    },
    frameguard: { action: 'deny' },
    noSniff: true,
    xssFilter: true,
  }));

  // 2. CORS configuration - restrict in production
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:8080'];
  
  const cors = require('cors');
  app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (corsOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      // In development, allow all
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }));

  // 3. Input sanitization middleware
  app.use((req, res, next) => {
    // Sanitize query params
    if (req.query) {
      for (const key of Object.keys(req.query)) {
        const val = req.query[key];
        if (typeof val === 'string') {
          req.query[key] = val.replace(/[<>'"]/g, '');
        }
      }
    }
    // Sanitize URL params
    if (req.params) {
      for (const key of Object.keys(req.params)) {
        const val = req.params[key];
        if (typeof val === 'string') {
          req.params[key] = val.replace(/[<>'"]/g, '');
        }
      }
    }
    next();
  });

  // 4. Basic rate limiting (lightweight, no external deps)
  const requestCounts = new Map();
  const RATE_LIMIT_WINDOW = 60000; // 1 minute
  const RATE_LIMIT_MAX = 100; // max requests per window

  app.use((req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const windowKey = Math.floor(now / RATE_LIMIT_WINDOW);
    const key = `${ip}:${windowKey}`;
    
    const count = (requestCounts.get(key) || 0) + 1;
    requestCounts.set(key, count);
    
    // Cleanup old entries periodically
    if (Math.random() < 0.01) {
      const expired = Math.floor(now / RATE_LIMIT_WINDOW) - 2;
      for (const k of requestCounts.keys()) {
        const w = parseInt(k.split(':').pop());
        if (w < expired) requestCounts.delete(k);
      }
    }
    
    if (count > RATE_LIMIT_MAX) {
      return res.status(429).json({ error: 'Too many requests', retryAfter: 60 });
    }
    
    res.setHeader('X-Rate-Limit-Remaining', Math.max(0, RATE_LIMIT_MAX - count));
    next();
  });

  console.log('[SECURITY] Helmet, CORS, input sanitization, and rate limiting enabled');
  return app;
}

module.exports = { setupSecurity };
