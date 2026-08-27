/**
 * Jurisdiction Policy Service
 * Centralized capability enforcement for Gateway (#1369)
 */

const { Jurisdiction, Capability } = require('./jurisdiction.constants');

const policyMatrix = Object.freeze({
  [Jurisdiction.GLOBAL]: {
    [Capability.WALLET_TRANSFER]: true,
    [Capability.EXCHANGE_FLOW]: true,
    [Capability.EXTERNAL_SETTLEMENT]: true,
    [Capability.PROVIDER_CRYPTO]: true,
  },

  [Jurisdiction.HK]: {
    [Capability.WALLET_TRANSFER]: true,
    [Capability.EXCHANGE_FLOW]: true,
    [Capability.EXTERNAL_SETTLEMENT]: true,
    [Capability.PROVIDER_CRYPTO]: true,
  },

  [Jurisdiction.CN_MAINLAND]: {
    [Capability.WALLET_TRANSFER]: false,
    [Capability.EXCHANGE_FLOW]: false,
    [Capability.EXTERNAL_SETTLEMENT]: false,
    [Capability.PROVIDER_CRYPTO]: false,
  },
});

function isCapabilityAllowed(jurisdiction, capability) {
  const profile = policyMatrix[jurisdiction];
  if (!profile) return false;
  return profile[capability] === true;
}

module.exports = {
  isCapabilityAllowed,
  policyMatrix,
};
