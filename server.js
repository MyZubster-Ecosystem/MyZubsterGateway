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

// Static files
app.use(express.static(path.join(__dirname, "frontend/build")));

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

// Token Balance Endpoint
app.get("/api/tokens/balance/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    res.json({
      userId,
      balances: {
        MYZ: 1250.50,
        XMR: 0.75,
        BTC: 0.012,
        ETH: 0.45,
        ADA: 125.00
      },
      totalUSD: 1450.75,
      totalSGD: 1950.50,
      timestamp: new Date().toISOString()
    });
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

// Notification Routes
const notificationRoutes = require("./routes/notificationRoutes");
app.use("/api/notifications", notificationRoutes);

// Message Routes
const messageRoutes = require("./routes/messageRoutes");
app.use("/api/messages", messageRoutes);

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

// Serve React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/build", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚪 MyZubster Gateway avviato sulla porta ${PORT}`);
  console.log(`📡 Endpoint: /api/robot/assign`);
  console.log(`🔍 Health: /api/health`);
  console.log(`💰 Token Balance: /api/tokens/balance/:userId`);
  console.log(`📨 Notifications: /api/notifications`);
  console.log(`💬 Messages: /api/messages`);
  console.log(`🧪 Test error: /api/test-error`);
  console.log(`🔒 Sentry monitoring: ${Sentry.captureException ? '✅' : '❌'}`);
});

module.exports = app;
