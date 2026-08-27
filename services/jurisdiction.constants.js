/**
 * Jurisdiction & Capability Constants
 * Issue #1369 - Mainland China policy enforcement
 */

const Jurisdiction = Object.freeze({
  GLOBAL: 'GLOBAL',
  CN_MAINLAND: 'CN_MAINLAND',
  HK: 'HK',
});

const Capability = Object.freeze({
  WALLET_TRANSFER: 'wallet_transfer',
  EXCHANGE_FLOW: 'exchange_flow',
  EXTERNAL_SETTLEMENT: 'external_settlement',
  PROVIDER_CRYPTO: 'provider_crypto',
});

module.exports = {
  Jurisdiction,
  Capability,
};
