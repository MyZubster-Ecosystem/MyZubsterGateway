'use strict';

const crypto = require('crypto');

function safeEqual(actual, expected) {
  const left = Buffer.from(actual || '');
  const right = Buffer.from(expected || '');
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function adminDashboardAuth(req, res, next) {
  const configuredToken = process.env.ADMIN_DASHBOARD_TOKEN;
  if (!configuredToken) {
    return res.status(503).json({
      success: false,
      error: 'Admin dashboard is disabled until ADMIN_DASHBOARD_TOKEN is configured',
    });
  }

  const authorization = req.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!safeEqual(token, configuredToken)) {
    return res.status(401).json({ success: false, error: 'Invalid admin credentials' });
  }

  return next();
}

module.exports = { adminDashboardAuth, safeEqual };
