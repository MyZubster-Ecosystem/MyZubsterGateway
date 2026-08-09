const express = require('express');
const path = require('path');
const zlib = require('zlib');
const app = express();
const PORT = process.env.PORT || 5002;

// Serve static files from frontend/dist with caching
app.use('/dist', express.static(path.join(__dirname, 'frontend', 'dist'), {
  maxAge: '1d',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    } else if (filePath.endsWith('.svg') || filePath.endsWith('.js')) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));

// Gzip compression for API responses (built-in zlib, no external deps)
app.use((req, res, next) => {
  const acceptEncoding = req.headers['accept-encoding'] || '';
  if (acceptEncoding.includes('gzip')) {
    const originalSend = res.send.bind(res);
    res.send = function(body) {
      if (typeof body === 'string' && body.length > 1024) {
        const compressed = zlib.gzipSync(body);
        res.setHeader('Content-Encoding', 'gzip');
        res.setHeader('Vary', 'Accept-Encoding');
        return originalSend(compressed);
      }
      return originalSend(body);
    };
  }
  next();
});

// Cache-Control for API responses
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  next();
});

// Redirect root to dashboard
app.get('/', (req, res) => {
  res.redirect('/dist/index.html');
});

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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Gateway running on port ${PORT}`);
});
