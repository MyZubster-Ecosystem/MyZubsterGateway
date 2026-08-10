const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class OAuthService {
  constructor() {
    this.clients = new Map();
    this.tokens = new Map();
    this.JWT_SECRET = process.env.JWT_SECRET || 'myzubster-oauth-secret';
  }

  // Registra un client (robot)
  registerClient(clientId, clientSecret, redirectUri, scopes = ['read', 'write']) {
    this.clients.set(clientId, {
      clientId,
      clientSecret,
      redirectUri,
      scopes,
      created: new Date().toISOString()
    });
    return { clientId, clientSecret };
  }

  // Genera authorization code
  generateAuthCode(clientId, scope = 'read') {
    const code = crypto.randomBytes(32).toString('hex');
    this.tokens.set(`code:${code}`, {
      clientId,
      scope,
      created: Date.now(),
      expires: Date.now() + 600000 // 10 minuti
    });
    return code;
  }

  // Scambia code per token
  exchangeToken(code, clientId, clientSecret) {
    const entry = this.tokens.get(`code:${code}`);
    if (!entry) {
      throw new Error('Invalid code');
    }
    
    if (entry.clientId !== clientId) {
      throw new Error('Client mismatch');
    }
    
    // Genera access token e refresh token
    const accessToken = jwt.sign(
      { clientId, scope: entry.scope },
      this.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    const refreshToken = crypto.randomBytes(32).toString('hex');
    
    this.tokens.set(`token:${accessToken}`, {
      clientId,
      scope: entry.scope,
      created: Date.now(),
      expires: Date.now() + 3600000 // 1 ora
    });
    
    this.tokens.set(`refresh:${refreshToken}`, {
      clientId,
      scope: entry.scope,
      created: Date.now()
    });
    
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: 3600,
      scope: entry.scope
    };
  }

  // Verifica token
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET);
      const entry = this.tokens.get(`token:${token}`);
      if (!entry) {
        throw new Error('Token not found');
      }
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Middleware per Express
  middleware() {
    return (req, res, next) => {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ 
          error: 'unauthorized',
          message: 'Authorization header required'
        });
      }
      
      const [type, token] = authHeader.split(' ');
      if (type !== 'Bearer') {
        return res.status(401).json({ 
          error: 'unauthorized',
          message: 'Invalid authorization type'
        });
      }
      
      try {
        const decoded = this.verifyToken(token);
        req.client = decoded;
        next();
      } catch (error) {
        return res.status(401).json({
          error: 'unauthorized',
          message: error.message
        });
      }
    };
  }
}

module.exports = new OAuthService();
