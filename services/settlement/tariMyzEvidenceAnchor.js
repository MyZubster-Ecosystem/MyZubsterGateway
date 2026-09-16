'use strict';

const { anchorMyzEvidence } = require('./myzEvidenceLedger');

const DEFAULT_NETWORK = 'tari-testnet';

function assertEvidence(record) {
  if (!record || record.asset !== 'MYZ' || !record.evidenceHash) throw new Error('valid MYZ evidence record is required');
  if (record.anchor) throw new Error('MYZ evidence is already anchored');
  return record;
}

/**
 * Test-first Tari anchoring boundary for MYZ evidence.
 * The injected wallet adapter must commit only the evidence hash and non-sensitive
 * identifiers. Full contribution/Marketplace payloads remain off-chain.
 */
async function anchorMyzEvidenceOnTari({ record, wallet, network = DEFAULT_NETWORK }) {
  assertEvidence(record);
  if (!wallet || typeof wallet.anchorEvidence !== 'function') throw new TypeError('Tari wallet anchorEvidence adapter is required');
  if (network === 'tari-mainnet') throw new Error('MYZ evidence anchoring is testnet-only until production review');

  const result = await wallet.anchorEvidence({
    evidenceHash: record.evidenceHash,
    evidenceId: record.evidenceId,
    asset: 'MYZ',
    type: record.type,
    sourceRef: record.sourceRef
  });

  if (!result || !result.transactionId) throw new Error('Tari wallet did not return a transactionId');
  if (result.confirmed !== true) throw new Error('Tari evidence transaction is not confirmed');

  return anchorMyzEvidence(record, {
    network: result.network || network,
    txId: result.transactionId,
    blockRef: result.blockRef || null,
    anchoredAt: result.confirmedAt || new Date().toISOString()
  });
}

module.exports = { DEFAULT_NETWORK, anchorMyzEvidenceOnTari };
