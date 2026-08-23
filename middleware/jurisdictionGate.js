/**
 * Jurisdiction Gate Middleware
 * Issue #1369 - deny-by-default capability enforcement
 */

const {
  isCapabilityAllowed,
} = require('../services/jurisdiction.service');

module.exports = function jurisdictionGate(capability) {
  return (req, res, next) => {
    const jurisdiction =
      req.headers['x-jurisdiction'] ||
      req.body?.jurisdiction ||
      req.query?.jurisdiction ||
      'GLOBAL';

    const allowed = isCapabilityAllowed(jurisdiction, capability);

    // Simple audit log (no secrets)
    console.info('[JurisdictionGate]', {
      result: allowed ? 'ALLOW' : 'DENY',
      jurisdiction,
      capability,
      path: req.originalUrl,
      method: req.method,
    });

    if (!allowed) {
      return res.status(403).json({
        error: {
          code: 'JURISDICTION_POLICY_DENIED',
          message: 'Operation unavailable in this jurisdiction',
        },
      });
    }

    req.jurisdiction = jurisdiction;
    next();
  };
};