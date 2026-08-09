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
  console.log('⚠️ Sentry non configurato');
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
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: "*", credentials: true }));
app.use(morgan("combined"));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// Static files
app.use(express.static(path.join(__dirname, "frontend/build")));
app.use(express.static(path.join(__dirname, "frontend/dist")));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "online", version: "1.0.0", timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// Robot assign
app.get("/api/robot/assign", (req, res) => {
  try { res.json({ message: "Robot assign endpoint", status: "ok" }); }
  catch (error) { Sentry.captureException(error); res.status(500).json({ error: error.message }); }
});

// Token balance
app.get("/api/tokens/balance/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    res.json({ userId, balances: { MYZ: 1250.50, XMR: 0.75, BTC: 0.012, ETH: 0.45, ADA: 125.00 }, totalUSD: 1450.75, totalSGD: 1950.50, timestamp: new Date().toISOString() });
  } catch (error) { Sentry.captureException(error); res.status(500).json({ error: error.message }); }
});

// Test error
app.get("/api/test-error", (req, res) => {
  try { throw new Error('Test error for Sentry'); }
  catch (error) { Sentry.captureException(error); res.status(500).json({ error: 'Test error captured by Sentry', message: error.message }); }
});

// ============ ROUTES ============

// Notifications
try { const routes = require("./routes/notificationRoutes"); app.use("/api/notifications", routes); } catch(e) {}

// Messages
try { const routes = require("./routes/messageRoutes"); app.use("/api/messages", routes); } catch(e) {}

// IoT Sensors
try { const routes = require("./routes/sensorRoutes"); app.use("/api/sensors", routes); } catch(e) {}

// Fiat Payments
try { const routes = require("./routes/fiatRoutes"); app.use("/api/payments/fiat", routes); } catch(e) {}

// Crypto
try { const routes = require("./routes/cryptoRoutes"); app.use("/api/crypto", routes); } catch(e) {}

// EVA IONI Arm
try { const routes = require("./routes/armRoutes"); app.use("/api/arm", routes); } catch(e) {}

// Mobile App
try { const routes = require("./routes/mobileRoutes"); app.use("/api/mobile", routes); } catch(e) {}

// Webhook
try { const routes = require("./routes/webhookRoutes"); app.use("/webhook", routes); } catch(e) {}

// Benzina XMR
try { const routes = require("./routes/benzinaXmr"); app.use("/api/benzina-xmr", routes); } catch(e) {}

// Mass Bounty 990
try { const routes = require("./routes/massBounty990"); app.use("/api/bounty-990", routes); } catch(e) {}

// Mass Bounty 991
try { const routes = require("./routes/massBounty991"); app.use("/api/bounty-991", routes); } catch(e) {}

// Mass Bounty 992
try { const routes = require("./routes/massBounty992"); app.use("/api/bounty-992", routes); } catch(e) {}

// Mass Bounty 993
try { const routes = require("./routes/massBounty993"); app.use("/api/bounty-993", routes); } catch(e) {}

// Mass Bounty 994
try { const routes = require("./routes/massBounty994"); app.use("/api/bounty-994", routes); } catch(e) {}

// Mass Bounty 995
try { const routes = require("./routes/massBounty995"); app.use("/api/bounty-995", routes); } catch(e) {}

// Mass Bounty 996
try { const routes = require("./routes/massBounty996"); app.use("/api/bounty-996", routes); } catch(e) {}

// Mass Bounty 997
try { const routes = require("./routes/massBounty997"); app.use("/api/bounty-997", routes); } catch(e) {}

// Mass Bounty 998
try { const routes = require("./routes/massBounty998"); app.use("/api/bounty-998", routes); } catch(e) {}

// Mass Bounty 999
try { const routes = require("./routes/massBounty999"); app.use("/api/bounty-999", routes); } catch(e) {}

// Swagger UI
try {
  const swaggerUi = require('swagger-ui-express');
  const YAML = require('yamljs');
  const swaggerDocument = YAML.load('./docs/swagger.yaml');
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log('📚 Swagger UI available at /api/docs');
} catch(err) { console.log('⚠️ Swagger not available'); }

// Sentry error handler
app.use(Sentry.Handlers.errorHandler());

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error", status: err.status || 500 });
});

// Serve React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/build", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚪 MyZubster Gateway avviato sulla porta ${PORT}`);
  console.log(`🔍 Health: /api/health`);
  console.log(`📚 Swagger: /api/docs`);
  console.log(`🔒 Sentry: ${Sentry.captureException ? '✅' : '❌'}`);
});

module.exports = app;
