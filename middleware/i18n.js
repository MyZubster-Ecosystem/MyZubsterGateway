const { detectLanguage, translate } = require('../config/i18n');

function i18nMiddleware(req, res, next) {
  const language = detectLanguage(req.get('Accept-Language'));
  
  // RTL Support
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  req.isRTL = rtlLanguages.includes(language);
  
  req.language = language;
  req.t = (key, params = {}) => {
    res.set('Content-Language', language);
    res.vary('Accept-Language');
    return translate(language, key, params);
  };

  next();
}

module.exports = i18nMiddleware;
