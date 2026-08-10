#!/usr/bin/env node

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const path = require("path");

// Importa Sentry in modo sicuro
let Sentry;
try {
  Sentry = require('./config/sentry');
  console.log('✅ Sentry monitoring attivo');
} catch (err) {
  console.log('⚠️ Sentry non configurato, continuo senza...');
  Sentry = {
    init: () => {},
    captureException: (err) => console.error('Sentry error:', err.message),
    Handlers: {
      requestHandler: () => (req, res, next) => next(),
      errorHandler: () => (err, req, res, next) => next(err)
    }
  };
}

const app = express();
const PORT = process.env.PORT || 5002;

// Sentry request handler (solo se disponibile)
if (Sentry.Handlers && Sentry.Handlers.requestHandler) {
  app.use(Sentry.Handlers.requestHandler());
} else {
  console.log('⚠️ Sentry requestHandler non disponibile');
}

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

// ============ ROUTES ============

// Robot Universal Integration
try {
  const robotIntegrationRoutes = require('./robot-integration/api/routes');
  app.use('/api/robots', robotIntegrationRoutes);
  console.log('✅ Robot Universal Integration loaded');
} catch(e) {
  console.log('⚠️ Robot Universal Integration not available:', e.message);
}

// NFT Routes
try {
  const routes = require("./routes/nftRoutes");
  app.use("/api/nft", routes);
  console.log("✅ NFT routes loaded");
} catch(e) {
  console.log("⚠️ NFT routes not available:", e.message);
}

// DeepSeek Routes
try {
  const deepseekRoutes = require("./routes/deepseekRoutes");
  app.use("/api/deepseek", deepseekRoutes);
  console.log("✅ DeepSeek routes loaded");
} catch(e) {
  console.log("⚠️ DeepSeek routes not available:", e.message);
}

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

// Mass Bounty 990-999
try { const routes = require("./routes/massBounty990"); app.use("/api/bounty-990", routes); } catch(e) {}
try { const routes = require("./routes/massBounty991"); app.use("/api/bounty-991", routes); } catch(e) {}
try { const routes = require("./routes/massBounty992"); app.use("/api/bounty-992", routes); } catch(e) {}
try { const routes = require("./routes/massBounty993"); app.use("/api/bounty-993", routes); } catch(e) {}
try { const routes = require("./routes/massBounty994"); app.use("/api/bounty-994", routes); } catch(e) {}
try { const routes = require("./routes/massBounty995"); app.use("/api/bounty-995", routes); } catch(e) {}
try { const routes = require("./routes/massBounty996"); app.use("/api/bounty-996", routes); } catch(e) {}
try { const routes = require("./routes/massBounty997"); app.use("/api/bounty-997", routes); } catch(e) {}
try { const routes = require("./routes/massBounty998"); app.use("/api/bounty-998", routes); } catch(e) {}
try { const routes = require("./routes/massBounty999"); app.use("/api/bounty-999", routes); } catch(e) {}

// Anthea modules
try { const routes = require("./core-backend/routes/antheaPayroll"); app.use("/api/anthea/payroll", routes); } catch(e) {}
try { const routes = require("./core-backend/routes/antheaCompliance"); app.use("/api/anthea/compliance", routes); } catch(e) {}
try { const routes = require("./core-backend/routes/antheaWelfare"); app.use("/api/anthea/welfare", routes); } catch(e) {}

// Swagger UI
try {
  const swaggerUi = require('swagger-ui-express');
  const YAML = require('yamljs');
  const swaggerDocument = YAML.load('./docs/swagger.yaml');
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log('📚 Swagger UI available at /api/docs');
} catch(err) { console.log('⚠️ Swagger not available'); }

// Sentry error handler
if (Sentry.Handlers && Sentry.Handlers.errorHandler) {
  app.use(Sentry.Handlers.errorHandler());
}

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack || err.message);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error", status: err.status || 500 });
});

// Serve React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/build", "index.html"));
});


// Tari blockchain routes
app.use('/api/tari', require('./routes/tari'));
// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚪 MyZubster Gateway avviato sulla porta ${PORT}`);
  console.log(`🔍 Health: /api/health`);
  console.log(`📚 Swagger: /api/docs`);
  console.log(`🤖 Robot Universal: /api/robots`);
  console.log(`🌌 NFT: /api/nft`);
  console.log(`🧠 DeepSeek: /api/deepseek`);
});

module.exports = app;

// 👽 Route Alieno Reale
app.get('/alien', (req, res) => {
  res.sendFile('/opt/MyZubster/MyZubsterGateway/public/alien-zorgax.html');
});

// 👽 Route Connessione ZORGAX-Terra
const alienConnectionRoutes = require('./routes/alienConnectionRoutes');
app.use('/api/alien', alienConnectionRoutes);

// 🚀 Route Colonizzazione Spaziale
const colonizationRoutes = require('./routes/colonizationRoutes');
app.use('/api/colonization', colonizationRoutes);

// 🌌 Route Tokenizzazione Universo
const universeRoutes = require('./routes/universeRoutes');
app.use('/api/universe', universeRoutes);

// 📺 Route Tokenizzazione TV
const tvRoutes = require('./routes/tvRoutes');
app.use('/api/tv', tvRoutes);

// 🏛️ Route Tokenizzazione Politica
const politicsRoutes = require('./routes/politicsRoutes');
app.use('/api/politics', politicsRoutes);

// ⛪ Route Tokenizzazione Chiese
const churchesRoutes = require('./routes/churchesRoutes');
app.use('/api/churches', churchesRoutes);

// 🌿 Route Tokenizzazione Natura
const natureRoutes = require('./routes/natureRoutes');
app.use('/api/nature', natureRoutes);

const fashionRoutesRoutes = require('./routes/fashionRoutesRoutes');
app.use('/api/fashion', fashionRoutesRoutes);

// 💎 Route Tokenizzazione Minerali
const mineralsRoutes = require('./routes/mineralsRoutes');
app.use('/api/minerals', mineralsRoutes);


// 🧪 Route Tokenizzazione Chimica
const chemistryRoutes = require('./routes/chemistryRoutes');
app.use('/api/chemistry', chemistryRoutes);


// 📜 Route Tokenizzazione Storia
const historyRoutes = require('./routes/historyRoutes');
app.use('/api/history', historyRoutes);
