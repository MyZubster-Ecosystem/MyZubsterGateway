/**
 * Jurisdiction Gate Middleware
 * Issue #1369 - deny-by-default capability enforcement
 *
 * Enforcement jurisdiction MUST come from trusted server-side state only:
 *   1. req.verifiedJurisdiction, populated by authenticated/verified middleware
 *   2. MYZUBSTER_JURISDICTION, configured by the server environment
 *
 * Client-controlled headers, body and query parameters are intentionally ignored.
 * Missing or unknown trusted jurisdiction fails closed.
 */

const {
  isCapabilityAllowed,
} = require('../services/jurisdiction.service');

const TRUSTED_JURISDICTION_ENV = 'MYZUBSTER_JURISDICTION';

function getTrustedJurisdiction(req) {
  const verified = req && req.verifiedJurisdiction;
  if (typeof verified === 'string' && verified.trim()) {
    return verified.trim();
  }

  const configured = process.env[TRUSTED_JURISDICTION_ENV];
  if (typeof configured === 'string' && configured.trim()) {
    return configured.trim();
  }

  return null;
}

function jurisdictionGate(capability) {
  return (req, res, next) => {
    const jurisdiction = getTrustedJurisdiction(req);
    const allowed = isCapabilityAllowed(jurisdiction, capability);

    console.info('[JurisdictionGate]', {
      result: allowed ? 'ALLOW' : 'DENY',
      jurisdiction: jurisdiction || 'UNKNOWN',
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
}

module.exports = jurisdictionGate;
module.exports.getTrustedJurisdiction = getTrustedJurisdiction;
module.exports.TRUSTED_JURISDICTION_ENV = TRUSTED_JURISDICTION_ENV;
