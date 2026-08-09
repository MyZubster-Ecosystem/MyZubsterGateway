const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN || null,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV || 'production',
});

module.exports = Sentry;
