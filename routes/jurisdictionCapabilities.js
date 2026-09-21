const express = require('express');
const {
  JurisdictionCapabilityService
} = require('../services/jurisdictionCapabilityService');

function createJurisdictionCapabilitiesRouter({ service, audit } = {}) {
  const router = express.Router();
  const capabilityService = service || new JurisdictionCapabilityService({
    audit: audit || ((event) => console.info('[JurisdictionPolicy]', JSON.stringify(event)))
  });

  router.get('/:countryCode', (req, res, next) => {
    try {
      res.json(capabilityService.discover(req.params.countryCode, req.query.subdivision));
    } catch (error) {
      next(error);
    }
  });

  router.post('/decision', (req, res, next) => {
    try {
      const decision = capabilityService.decide(req.body || {});
      res.status(decision.allowed ? 200 : 403).json(decision);
    } catch (error) {
      error.status = 400;
      next(error);
    }
  });

  return router;
}

module.exports = { createJurisdictionCapabilitiesRouter };
