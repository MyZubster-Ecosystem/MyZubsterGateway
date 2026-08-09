const { DEFAULT_LANGUAGE, translate } = require('./i18n');

function translateRequest(req, key) {
  return typeof req.t === 'function'
    ? req.t(key)
    : translate(DEFAULT_LANGUAGE, key);
}

function localizedRateLimitMessage(req) {
  return { error: translateRequest(req, 'errors.rateLimitExceeded') };
}

function localizedNotFoundMessage(req) {
  return { error: translateRequest(req, 'errors.notFound') };
}

module.exports = {
  localizedNotFoundMessage,
  localizedRateLimitMessage,
};
