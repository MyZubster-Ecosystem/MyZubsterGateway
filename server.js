#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const app = express();
const PORT = Number(process.env.PORT || 5002);

let Sentry = null;
try {
  Sentry = require('./config/sentry');
  console.log('[Sentry] monitoring available');
} catch (error) {
  console.log('[Sentry] not configured; continuing without it');
}

if (Sentry?.Handlers?.requestHandler) {
  app.use(Sentry.Handlers.requestHandler());
}

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: '*', credentials: true }));
app.use(morgan('combined'));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

const frontendBuild = path.join(__dirname, 'frontend', 'build');
const frontendDist = path.join(__dirname, 'frontend', 'dist');
app.use(express.static(frontendBuild));
app.use(express.static(frontendDist));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/api/status', (_req, res) => {
  res.json({ ok: true, service: 'myzubster-gateway', status: 'online' });
});

function safeMount(routePath, modulePath, label = modulePath) {
  try {
    const loaded = require(modulePath);
    const router = loaded?.default || loaded;
    app.use(routePath, router);
    console.log(`[Route] ${label} mounted at ${routePath}`);
  } catch (error) {
    console.warn(`[Route] ${label} unavailable: ${error.message}`);
  }
}

safeMount('/api/robots', './robot-integration/api/routes', 'Robot Universal Integration');
safeMount('/api/nft', './routes/nftRoutes', 'NFT');
safeMount('/api/deepseek', './routes/deepseekRoutes', 'DeepSeek');
safeMount('/api/data-import', './routes/dataImportRoutes', 'Zorgax data import');
safeMount('/api/notifications', './routes/notificationRoutes', 'Notifications');
safeMount('/api/messages', './routes/messageRoutes', 'Messages');
safeMount('/api/sensors', './routes/sensorRoutes', 'IoT Sensors');
safeMount('/api/payments/fiat', './routes/fiatRoutes', 'Fiat Payments');
safeMount('/api/crypto', './routes/cryptoRoutes', 'Crypto');
safeMount('/api/arm', './routes/armRoutes', 'EVA IONI Arm');
safeMount('/api/mobile', './routes/mobileRoutes', 'Mobile');
safeMount('/webhook', './routes/webhookRoutes', 'Webhook');
safeMount('/api/benzina-xmr', './routes/benzinaXmr', 'Benzina XMR');
safeMount('/api/tari', './routes/tari', 'Tari');
safeMount('/api/alien', './routes/alienConnectionRoutes', 'Zorgax connection');
safeMount('/api/colonization', './routes/colonizationRoutes', 'Colonization');
safeMount('/api/universe', './routes/universeRoutes', 'Universe');
safeMount('/api/tv', './routes/tvRoutes', 'TV');
safeMount('/api/human-robots', './routes/humanRobotsRoutes', 'Human robots');
safeMount('/api/politics', './routes/politicsRoutes', 'Politics');
safeMount('/api/churches', './routes/churchesRoutes', 'Churches');
safeMount('/api/nature', './routes/natureRoutes', 'Nature');
safeMount('/api/sport', './routes/sportRoutes', 'Sport');
safeMount('/api/music', './routes/musicRoutes', 'Music');
safeMount('/api/food', './routes/foodRoutes', 'Food');
safeMount('/api/cities', './routes/citiesRoutes', 'Cities');
safeMount('/api/gaming', './routes/gamingRoutes', 'Gaming');
safeMount('/api/fashion', './routes/fashionRoutesRoutes', 'Fashion');
safeMount('/api/minerals', './routes/mineralsRoutes', 'Minerals');
safeMount('/api/chemistry', './routes/chemistryRoutes', 'Chemistry');
safeMount('/api/history', './routes/historyRoutes', 'History');
safeMount('/api/anthea/payroll', './core-backend/routes/antheaPayroll', 'Anthea payroll');
safeMount('/api/anthea/compliance', './core-backend/routes/antheaCompliance', 'Anthea compliance');
safeMount('/api/anthea/welfare', './core-backend/routes/antheaWelfare', 'Anthea welfare');
safeMount('/api/bounty-settlement', './routes/bountySettlement', 'Bounty Settlement');

for (let id = 990; id <= 999; id += 1) {
  safeMount(`/api/bounty-${id}`, `./routes/massBounty${id}`, `Mass bounty ${id}`);
}

try {
  const { createTariNftRouter } = require('./routes/tariNft');
  if (typeof createTariNftRouter === 'function') {
    app.use('/api/tari/nfts', createTariNftRouter());
    console.log('[Route] Tari NFT marketplace mounted');
  }
} catch (error) {
  console.warn(`[Route] Tari NFT marketplace unavailable: ${error.message}`);
}

try {
  const notificationService = require('./notifications');
  app.get('/api/notifications/status', (_req, res) => {
    res.json({ status: 'ok', providers: notificationService.getStatus() });
  });
} catch (error) {
  console.warn(`[Notify] notification service unavailable: ${error.message}`);
}

try {
  const swaggerUi = require('swagger-ui-express');
  const YAML = require('yamljs');
  const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'swagger.yaml'));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {
  console.warn(`[Swagger] unavailable: ${error.message}`);
}

app.get('/alien', (_req, res) => {
  const file = path.join(__dirname, 'public', 'alien-zorgax.html');
  if (!fs.existsSync(file)) return res.status(404).json({ error: 'alien page not available' });
  return res.sendFile(file);
});

app.get('/benzina-pagamento', (_req, res) => {
  const file = path.join(frontendDist, 'benzina-pagamento.html');
  if (!fs.existsSync(file)) return res.status(404).json({ error: 'payment page not available' });
  return res.sendFile(file);
});

if (Sentry?.Handlers?.errorHandler) {
  app.use(Sentry.Handlers.errorHandler());
}

app.use((err, _req, res, _next) => {
  console.error('Gateway error:', err.stack || err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500,
    ...(err.code ? { code: err.code } : {}),
  });
});

app.get('*', (_req, res) => {
  const indexFile = path.join(frontendBuild, 'index.html');
  if (fs.existsSync(indexFile)) return res.sendFile(indexFile);
  return res.status(404).json({ error: 'Not found' });
});

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MyZubster Gateway listening on 0.0.0.0:${PORT}`);
    console.log('Health: /api/health');
    console.log('Status: /api/status');
  });
}

module.exports = app;
