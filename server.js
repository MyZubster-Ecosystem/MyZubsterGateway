<<<<<<< HEAD
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const compression = require('compression');
const hpp = require('hpp');

const app = express();

// ============ SECURITY MIDDLEWARE ============

// Helmet - header di sicurezza HTTP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.myzubster.com"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Rate Limiting - protezione DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 100, // max 100 richieste per IP
  message: 'Troppe richieste da questo IP, riprova tra 15 minuti'
});
app.use('/api', limiter);

// CORS - limitato ai domini autorizzati
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'];
app.use(cors({
  origin: function(origin, callback) {
    // Permetti richieste senza origin (come da Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true
}));

// Body parser - limita dimensione per prevenire DoS
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Sanitizzazione - protezione NoSQL injection
app.use(mongoSanitize());

// XSS protection
app.use(xss());

// Compressione
app.use(compression());

// HPP - protezione parameter pollution
app.use(hpp());

// Logging
app.use(morgan('combined'));

// ============ DATABASE ============
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ============ ROUTES ============

// Health check con info sicurezza
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    security: {
      rateLimit: 'active',
      helmet: 'active',
      cors: 'restricted',
      sanitize: 'active',
      xss: 'active',
      hpp: 'active'
    }
  });
});

// Token Balance Routes
const tokenBalanceRoutes = require("./routes/tokenBalanceRoutes");
app.use("/api/tokens/balance", tokenBalanceRoutes);

// Notification Routes
const notificationRoutes = require("./routes/notificationRoutes");
app.use("/api/notifications", notificationRoutes);

// Message Routes
const messageRoutes = require("./routes/messageRoutes");
app.use("/api/messages", messageRoutes);

// Wallet Routes
const walletRoutes = require("./routes/walletRoutes");
app.use("/api/wallet", walletRoutes);

// Swap Routes
const swapRoutes = require("./routes/swapRoutes");
app.use("/api/swap", swapRoutes);

// Token Routes
const tokenRoutes = require("./routes/tokenRoutes");
app.use("/api/tokens", tokenRoutes);

// Distribution Routes
const distributionRoutes = require("./routes/distributionRoutes");
app.use("/api/distributions", distributionRoutes);

// ============ ERROR HANDLER ============
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// ============ START SERVER ============
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔒 Security: Rate Limiting, Helmet, CORS, Sanitization, XSS, HPP`);
});

// Status Routes
const statusRoutes = require("./routes/statusRoutes");
app.use("/api/status", statusRoutes);

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));
=======
#!/usr/bin/env node

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const path = require("path");

// Importa Sentry
let Sentry;
try {
  Sentry = require('./config/sentry');
  console.log('✅ Sentry monitoring attivo');
} catch (err) {
  console.log('⚠️ Sentry non configurato - continuo senza monitoring');
  Sentry = {
    init: () => {},
    captureException: (err) => console.error('Sentry error:', err),
    Handlers: {
      requestHandler: () => (req, res, next) => next(),
      errorHandler: () => (err, req, res, next) => next(err)
    }
  };
}

const app = express();
const PORT = process.env.PORT || 5002;

// Sentry request handler
app.use(Sentry.Handlers.requestHandler());

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true
}));
app.use(morgan("combined"));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.get("/api/robot/assign", (req, res) => {
  try {
    res.json({ message: "Robot assign endpoint", status: "ok" });
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ error: error.message });
  }
});

// Test error endpoint (per verificare Sentry)
app.get("/api/test-error", (req, res) => {
  try {
    throw new Error('Test error for Sentry monitoring');
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ 
      error: 'Test error captured by Sentry',
      message: error.message 
    });
  }
});

// Sentry error handler
app.use(Sentry.Handlers.errorHandler());

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    status: err.status || 500
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚪 MyZubster Gateway avviato sulla porta ${PORT}`);
  console.log(`📡 Endpoint: /api/robot/assign`);
  console.log(`🔍 Health: /api/health`);
  console.log(`🧪 Test error: /api/test-error`);
  console.log(`🔒 Sentry monitoring: ${Sentry.captureException ? '✅' : '❌'}`);
});

module.exports = app;
>>>>>>> main
