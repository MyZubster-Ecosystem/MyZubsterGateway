const Sentry = require('@sentry/node');

// Inizializza Sentry con configurazione base
Sentry.init({
  dsn: process.env.SENTRY_DSN || '',
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
});

module.exports = Sentry;
