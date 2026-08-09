/**
 * Security Notification Service
 * Logs and dispatches security-related events
 */
class SecurityNotificationsService {
  /**
   * Log security event
   */
  static async notify(userId, event, details = {}) {
    const timestamp = new Date().toISOString();
    const log = {
      userId,
      event,
      details,
      timestamp
    };
    
    // Log to console (can be extended to email, Telegram, etc.)
    console.log(`[SECURITY] [${timestamp}] User ${userId}: ${event}`, JSON.stringify(details));
    
    // Store in database if available
    try {
      const SecurityLog = require('../models/SecurityLog');
      await SecurityLog.create(log);
    } catch (e) {
      // Model may not exist yet; log is still emitted
      console.error('[SECURITY] Failed to persist log:', e.message);
    }
    
    return log;
  }

  /**
   * Security event types
   */
  static EVENTS = {
    LOGIN_SUCCESS: 'login_success',
    LOGIN_FAILED: 'login_failed',
    TWO_FA_ENABLED: '2fa_enabled',
    TWO_FA_DISABLED: '2fa_disabled',
    TWO_FA_FAILED: '2fa_failed',
    ADDRESS_ADDED: 'address_added',
    ADDRESS_REMOVED: 'address_removed',
    TRANSACTION_BLOCKED: 'transaction_blocked',
    TRANSACTION_LIMIT_EXCEEDED: 'limit_exceeded',
    BACKUP_CODE_USED: 'backup_code_used',
    LIMITS_UPDATED: 'limits_updated',
    SUSPICIOUS_ACTIVITY: 'suspicious_activity'
  };
}

module.exports = SecurityNotificationsService;
