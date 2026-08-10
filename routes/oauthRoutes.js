const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Database in memoria
const clients = {};
const tokens = {};

router.post('/register', (req, res) => {
  const { clientId, clientSecret, redirectUri, scopes } = req.body;
  
  if (!clientId || !clientSecret) {
    return res.status(400).json({ error: 'clientId and clientSecret required' });
  }
  
  clients[clientId] = { clientId, clientSecret, redirectUri, scopes, created: new Date().toISOString() };
  
  res.json({
    success: true,
    clientId,
    clientSecret,
    message: 'Client registered successfully'
  });
});

router.post('/token', (req, res) => {
  const { grant_type, client_id, client_secret } = req.body;
  
  if (grant_type !== 'client_credentials') {
    return res.status(400).json({ error: 'unsupported_grant_type' });
  }
  
  if (!clients[client_id] || clients[client_id].clientSecret !== client_secret) {
    return res.status(401).json({ error: 'invalid_client' });
  }
  
  // Genera token JWT
  const accessToken = jwt.sign(
    { clientId: client_id, scope: 'read write execute' },
    process.env.JWT_SECRET || 'myzubster-oauth-secret',
    { expiresIn: '1h' }
  );
  
  const refreshToken = Math.random().toString(36).substr(2, 32);
  
  tokens[accessToken] = { clientId: client_id, created: Date.now() };
  tokens[`refresh:${refreshToken}`] = { clientId: client_id };
  
  res.json({
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: 'Bearer',
    expires_in: 3600,
    scope: 'read write execute'
  });
});

// Middleware per verificare il token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header required' });
  }
  
  const [type, token] = authHeader.split(' ');
  if (type !== 'Bearer') {
    return res.status(401).json({ error: 'Invalid authorization type' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'myzubster-oauth-secret');
    req.client = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Endpoint per verificare il token
router.get('/verify', verifyToken, (req, res) => {
  res.json({ valid: true, client: req.client });
});

module.exports = router;
