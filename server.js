<<<<<<< HEAD
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Initialize app
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/myzubster', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ============ ROUTES ============

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Token Balance Routes (BOUNTY #1)
const tokenBalanceRoutes = require("./routes/tokenBalanceRoutes");
app.use("/api/tokens", tokenBalanceRoutes);

// Notification Routes (BOUNTY #2)
const notificationRoutes = require("./routes/notificationRoutes");
app.use("/api/notifications", notificationRoutes);

// Message Routes (BOUNTY #3)
const messageRoutes = require("./routes/messageRoutes");
app.use("/api/messages", messageRoutes);

// ============ START SERVER ============
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
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
