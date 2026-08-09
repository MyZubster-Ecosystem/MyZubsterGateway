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
app.use(express.static(path.join(__dirname, "frontend/dist")));

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

// Routes
try {
  const notificationRoutes = require("./routes/notificationRoutes");
  app.use("/api/notifications", notificationRoutes);
} catch (e) { console.log('⚠️ Notification routes not found'); }

try {
  const messageRoutes = require("./routes/messageRoutes");
  app.use("/api/messages", messageRoutes);
} catch (e) { console.log('⚠️ Message routes not found'); }

try {
  const sensorRoutes = require("./routes/sensorRoutes");
  app.use("/api/sensors", sensorRoutes);
} catch (e) { console.log('⚠️ Sensor routes not found'); }

try {
  const fiatRoutes = require("./routes/fiatRoutes");
  app.use("/api/payments/fiat", fiatRoutes);
} catch (e) { console.log('⚠️ Fiat routes not found'); }

try {
  const cryptoRoutes = require("./routes/cryptoRoutes");
  app.use("/api/crypto", cryptoRoutes);
} catch (e) { console.log('⚠️ Crypto routes not found'); }

try {
  const armRoutes = require("./routes/armRoutes");
  app.use("/api/arm", armRoutes);
} catch (e) { console.log('⚠️ Arm routes not found'); }

try {
  const mobileRoutes = require("./routes/mobileRoutes");
  app.use("/api/mobile", mobileRoutes);
} catch (e) { console.log('⚠️ Mobile routes not found'); }

// Webhook routes
try {
  const webhookRoutes = require("./routes/webhookRoutes");
  app.use("/webhook", webhookRoutes);
} catch (e) { console.log('⚠️ Webhook routes not found'); }

// Benzina XMR routes
try {
  const benzinaXmrRoutes = require("./routes/benzinaXmr");
  app.use("/api/benzina-xmr", benzinaXmrRoutes);
} catch (e) { console.log('⚠️ Benzina XMR routes not found'); }

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
  console.log(`🧪 Test error: /api/test-error`);
  console.log(`🔒 Sentry monitoring: ${Sentry.captureException ? '✅' : '❌'}`);
});

module.exports = app;
