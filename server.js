const express = require('express');
const app = express();
const PORT = process.env.PORT || 5002;

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'online', 
    version: '1.0.0', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime() 
  });
});

app.get('/api/robot/assign', (req, res) => {
  res.json({ message: 'Robot assign endpoint', status: 'ok' });
});

app.get('/api/tokens/balance/:userId', (req, res) => {
  res.json({
    userId: req.params.userId,
    balances: { MYZ: 1250.50, XMR: 0.75, BTC: 0.012, ETH: 0.45, ADA: 125.00 },
    totalUSD: 1450.75,
    totalSGD: 1950.50,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test-error', (req, res) => {
  res.status(500).json({ error: 'Test error captured by Sentry', message: 'Test error for Sentry monitoring' });
});

app.use('/api/bounty-1000', require('./routes/massBounty1000.js'));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Gateway running on port ${PORT}`);
});
