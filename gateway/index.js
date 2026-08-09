const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static(__dirname));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/myzubster')
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// ============ DATA STORE ============
let users = [];
let comuni = [];
let enti = [];
let orti = [];

// ============ HEALTH ============
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ============ ROOT ============
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/hera', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ============ USERS API ============
app.post('/api/users', (req, res) => {
  const { nome, email, tari, xmr, citta } = req.body;
  if (!nome || !email || !tari || !xmr) {
    return res.status(400).json({ success: false, error: 'Nome, email, Tari e XMR obbligatori' });
  }
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ success: false, error: 'Email già registrata' });
  }
  const user = { id: Date.now(), nome, email, tari, xmr, citta, createdAt: new Date() };
  users.push(user);
  res.json({ success: true, data: user });
});

app.get('/api/users', (req, res) => {
  res.json({ success: true, data: users });
});

// ============ COMUNI API ============
app.post('/api/comuni', (req, res) => {
  const { nome, regione, provincia, tari, xmr, lat, lng } = req.body;
  if (!nome || !tari || !xmr) {
    return res.status(400).json({ success: false, error: 'Nome, Tari e XMR obbligatori' });
  }
  if (comuni.find(c => c.nome === nome)) {
    return res.status(400).json({ success: false, error: 'Comune già registrato' });
  }
  const comune = { id: Date.now(), nome, regione, provincia, tari, xmr, lat, lng, createdAt: new Date() };
  comuni.push(comune);
  res.json({ success: true, data: comune });
});

app.get('/api/comuni', (req, res) => {
  res.json({ success: true, data: comuni });
});

// ============ ENTI API ============
app.post('/api/enti', (req, res) => {
  const { nome, tipo, iva, tari, xmr, sede } = req.body;
  if (!nome || !tipo || !tari || !xmr) {
    return res.status(400).json({ success: false, error: 'Nome, tipo, Tari e XMR obbligatori' });
  }
  if (enti.find(e => e.nome === nome && e.tipo === tipo)) {
    return res.status(400).json({ success: false, error: 'Ente già registrato' });
  }
  const ente = { id: Date.now(), nome, tipo, iva, tari, xmr, sede, createdAt: new Date() };
  enti.push(ente);
  res.json({ success: true, data: ente });
});

app.get('/api/enti', (req, res) => {
  res.json({ success: true, data: enti });
});

// ============ ORTI API ============
app.post('/api/orti', (req, res) => {
  const { nome, comune, tari, xmr, lat, lng, dimensione } = req.body;
  if (!nome || !comune || !tari || !xmr) {
    return res.status(400).json({ success: false, error: 'Nome, comune, Tari e XMR obbligatori' });
  }
  const orto = { id: Date.now(), nome, comune, tari, xmr, lat, lng, dimensione, createdAt: new Date() };
  orti.push(orto);
  res.json({ success: true, data: orto });
});

app.get('/api/orti', (req, res) => {
  res.json({ success: true, data: orti });
});

// ============ TOKENS API ============
app.get('/api/tokens', (req, res) => {
  res.json({
    success: true,
    data: [
      { symbol: 'MBFT', name: 'Marina Bay Tower', price: 1000 },
      { symbol: 'SRET', name: 'Singapore Real Estate', price: 1000 },
      { symbol: 'HERA', name: 'Hera Token', price: 100 },
      { symbol: 'URBAN', name: 'Urban Garden Token', price: 50 }
    ]
  });
});

// ============ STATS API ============
app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      users: users.length,
      comuni: comuni.length,
      enti: enti.length,
      orti: orti.length,
      piante: 5,
      tokens: 4
    }
  });
});

// ============ WALLET API ============
app.get('/api/wallet/balance/:userId', (req, res) => {
  const { userId } = req.params;
  const user = users.find(u => u.id == userId);
  if (!user) {
    return res.status(404).json({ success: false, error: 'Utente non trovato' });
  }
  res.json({
    success: true,
    data: {
      userId: user.id,
      nome: user.nome,
      tari: user.tari,
      xmr: user.xmr,
      balance: {
        tari: '1000 MYZ',
        xmr: '0.5 XMR'
      }
    }
  });
});

// ============ START SERVER ============
app.listen(PORT, () => {
  console.log('MyZubster Gateway running on port ' + PORT);
  console.log('Health check: http://localhost:' + PORT + '/health');
  console.log('Dashboard: http://localhost:' + PORT);
  console.log('API: http://localhost:' + PORT + '/api');
});

module.exports = app;
