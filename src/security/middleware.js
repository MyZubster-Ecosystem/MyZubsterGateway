const TwoFactorService = require('./twoFactor');
const WhitelistService = require('./whitelist');
const TransactionLimitsService = require('./transactionLimits');
const SecurityNotifications = require('./securityNotifications');

class SecurityMiddleware {
  /**
   * Middleware: require 2FA for route access
   */
  static require2FA(req, res, next) {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const token = req.headers['x-2fa-token'] || req.body.twoFactorToken;
    if (!token) {
      return res.status(403).json({ 
        error: '2FA token required',
        code: '2FA_REQUIRED'
      });
    }
    
    TwoFactorService.verifyToken(userId, token)
      .then(result => {
        if (!result.valid) {
          SecurityNotifications.notify(userId, SecurityNotifications.EVENTS.TWO_FA_FAILED, {
            method: result.method || 'totp'
          });
          return res.status(403).json({ 
            error: 'Invalid 2FA token',
            code: '2FA_INVALID'
          });
        }
        
        if (result.method === 'backup') {
          SecurityNotifications.notify(userId, SecurityNotifications.EVENTS.BACKUP_CODE_USED, {
            remaining: result.remainingBackups
          });
        }
        
        req.twoFactorVerified = true;
        next();
      })
      .catch(err => {
        console.error('[Security] 2FA middleware error:', err);
        res.status(500).json({ error: 'Security verification failed' });
      });
  }

  /**
   * Middleware: enforce transaction limits
   */
  static enforceLimits(req, res, next) {
    const userId = req.user?._id || req.user?.id;
    const amount = parseFloat(req.body.amount || req.body.value || 0);
    
    if (!userId || !amount) {
      return next(); // Skip if no amount to check
    }
    
    TransactionLimitsService.checkTransaction(userId, amount)
      .then(result => {
        if (!result.allowed) {
          SecurityNotifications.notify(userId, SecurityNotifications.EVENTS.TRANSACTION_LIMIT_EXCEEDED, {
            amount,
            checks: result.checks
          });
          return res.status(403).json({
            error: 'Transaction exceeds limits',
            code: 'LIMIT_EXCEEDED',
            details: result.checks
          });
        }
        
        req.transactionLimits = result;
        next();
      })
      .catch(err => {
        console.error('[Security] Limits middleware error:', err);
        next(); // Fail open for non-critical middleware
      });
  }

  /**
   * Middleware: validate destination address against whitelist
   */
  static validateDestination(req, res, next) {
    const userId = req.user?._id || req.user?.id;
    const destination = req.body.destination || req.body.to || req.body.address;
    
    if (!userId || !destination) {
      return next();
    }
    
    const enforceWhitelist = req.body.enforceWhitelist === true;
    
    WhitelistService.validateTransaction(userId, destination, { enforceWhitelist })
      .then(result => {
        if (!result.allowed) {
          SecurityNotifications.notify(userId, SecurityNotifications.EVENTS.TRANSACTION_BLOCKED, {
            destination,
            reason: result.reason
          });
          return res.status(403).json({
            error: result.reason,
            code: 'ADDRESS_NOT_WHITELISTED'
          });
        }
        next();
      })
      .catch(err => {
        console.error('[Security] Whitelist middleware error:', err);
        next();
      });
  }

  /**
   * Record successful transaction for limits tracking
   */
  static async recordTransaction(userId, amount) {
    if (!userId || !amount) return;
    try {
      return await TransactionLimitsService.recordTransaction(userId, amount);
    } catch (e) {
      console.error('[Security] Record transaction error:', e);
    }
  }
}

module.exports = SecurityMiddleware;
