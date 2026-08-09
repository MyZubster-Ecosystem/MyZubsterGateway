require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { createOrder, onPaymentReceived } = require('./buy_myz');
const { createEscrow, lockFunds, submitProof, release, dispute, getEscrow } = require('./escrow_simulator');
const { mint, balance } = require('./token_simulator');
const { assignReward } = require('./services/rewardService');

const app = express();
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/myzubster')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ---------- API ROUTES (TUTTE prima del frontend SPA) ----------
app.post('/buy-myz', (req, res) => {
  const { userTariWallet, amountMYZ } = req.body;
  const order = createOrder(userTariWallet, amountMYZ);
  onPaymentReceived(order.id, 10);
  res.json({ orderId: order.id, xmrAddress: order.xmrAddress, amountXMR: order.amountXMR, status: 'pending' });
});

app.post('/escrow/create', (req, res) => {
  const { escrowId, buyer, seller, amount } = req.body;
  try {
    const id = createEscrow(escrowId, buyer, seller, amount);
    res.json({ escrowId: id, status: 'created' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.use('/api/rewards', require('./routes/rewards'));
app.use('/api/bounty', require('./routes/bounty'));
app.use('/api/stake', require('./routes/stake'));
app.use('/api/escrow/house', require('./routes/escrowHouse'));

console.log('✅ Caricamento routes robot...');
app.use('/api/robot', require('./routes/robot'));
app.use('/api/robot/escrow', require('./routes/robotEscrow'));
app.use('/api/robot/logo', require('./routes/robotLogo'));

console.log('✅ Caricamento routes robotCode...');
app.use('/api/robot/code', require('./routes/robotCode'));

console.log('✅ Caricamento routes robotAnimal...');
app.use('/api/robot/animal', require('./routes/robotAnimal'));

console.log('✅ Caricamento routes benzina XMR...');
app.use('/api/benzina/xmr', require('./routes/benzinaXmr'));

console.log('✅ Caricamento routes benzina XMR Wallet...');
app.use('/api/benzina/wallet', require('./routes/benzinaXmrWallet'));

console.log('✅ Caricamento routes IoT sensors...');
app.use('/api/iot/sensors', require('./routes/iotSensors'));

console.log('✅ Caricamento routes EVA IONI Arm...');
app.use('/api/robot/eva-ioni-arm', require('./routes/evaIoniArm'));

console.log('✅ Caricamento routes Multi-Currency...');
app.use('/api/payments/multi-currency', require('./routes/multiCurrency'));

console.log('✅ Caricamento routes Fiat Payments...');
app.use('/api/payments/fiat', require('./routes/fiatPayments'));

console.log('✅ Caricamento routes Smart Contract...');
app.use('/api/blockchain/smart-contract', require('./routes/smartContract'));

app.use('/api/backup', require('./routes/backup'));

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      telegram: !!process.env.TELEGRAM_BOT_TOKEN,
      github: !!process.env.GITHUB_TOKEN,
      ai: !!process.env.OPENAI_API_KEY
    }
  });
});

// ---------- FRONTEND STATIC SERVING (DOPO le API) ----------
const frontendDist = path.join(__dirname, 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
  console.log(`✅ Serving frontend from ${frontendDist}`);
} else {
  console.log('ℹ️ Frontend dist not found. Run "npm run build" in frontend/ first.');
}

// ---------- START SERVER ----------
const PORT = process.env.PORT || 10000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Gateway running on http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM ricevuto, chiusura graceful...');
  server.close(() => {
    console.log('✅ Server chiuso');
    process.exit(0);
  });
});
