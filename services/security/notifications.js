// Security Notifications Service — Closes #713
const crypto = require('crypto');

class SecurityNotificationService {
  constructor() {
    this.subscribers = new Map(); // userId => { channels: [], prefs: {} }
  }

  subscribe(userId, channels = ['email']) {
    this.subscribers.set(userId, {
      channels,
      prefs: {
        notifyOnLogin: true,
        notifyOnSend: true,
        notifyOnWhitelistChange: true,
        notifyOnLimitExceeded: true,
      }
    });
    return true;
  }

  async notify(userId, event) {
    const sub = this.subscribers.get(userId);
    if (!sub) return false;

    const eventHandlers = {
      'login': 'notifyOnLogin',
      'send': 'notifyOnSend',
      'whitelist_change': 'notifyOnWhitelistChange',
      'limit_exceeded': 'notifyOnLimitExceeded',
    };

    const prefKey = eventHandlers[event.type];
    if (prefKey && !sub.prefs[prefKey]) return false;

    const notification = {
      id: crypto.randomUUID(),
      userId,
      type: event.type,
      timestamp: new Date().toISOString(),
      data: event.data || {},
      channels: sub.channels,
    };

    // In production, dispatch to email/push/sms providers
    console.log([SECURITY-NOTIFY]', event.type, '=> user', userId, JSON.stringify(event.data));
    return notification;
  }

  // Log security events for audit
  async logSecurityEvent(userId, eventType, metadata = {}) {
    const event = {
      id: crypto.randomUUID(),
      userId,
      type: eventType,
      timestamp: new Date().toISOString(),
      metadata,
      ip: metadata.ip || 'unknown',
      userAgent: metadata.userAgent || 'unknown',
    };
    console.log([SECURITY-AUDIT]', JSON.stringify(event));
    return event;
  }
}
module.exports = new SecurityNotificationService();
