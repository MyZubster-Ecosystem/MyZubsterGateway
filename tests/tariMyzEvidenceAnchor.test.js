'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createContributionEvidence, createMarketplaceEvidence } = require('../services/settlement/myzEvidenceLedger');
const { anchorMyzEvidenceOnTari } = require('../services/settlement/tariMyzEvidenceAnchor');

function contribution() {
  return createContributionEvidence({ evidenceId: 'myz-contrib-1', sourceRef: 'github:pr:1410', amountMYZ: '10', payload: { action: 'code-contribution' }, createdAt: '2026-09-16T00:00:00.000Z' });
}

test('anchors only the MYZ evidence hash and identifiers after confirmation', async () => {
  const record = contribution();
  let request;
  const anchored = await anchorMyzEvidenceOnTari({
    record,
    wallet: { anchorEvidence: async (input) => { request = input; return { transactionId: 'tari-test-tx-1', network: 'tari-testnet', blockRef: '100', confirmed: true, confirmedAt: '2026-09-16T00:01:00.000Z' }; } }
  });
  assert.equal(request.evidenceHash, record.evidenceHash);
  assert.equal(request.asset, 'MYZ');
  assert.equal(request.payload, undefined);
  assert.equal(anchored.status, 'ANCHORED');
  assert.equal(anchored.anchor.txId, 'tari-test-tx-1');
});

test('Marketplace evidence uses the same immutable Tari anchor path', async () => {
  const record = createMarketplaceEvidence({ evidenceId: 'myz-market-1', sourceRef: 'order:42', amountMYZ: '25', payload: { listingId: '42', state: 'completed' } });
  const anchored = await anchorMyzEvidenceOnTari({ record, wallet: { anchorEvidence: async () => ({ transactionId: 'tari-test-tx-2', confirmed: true }) } });
  assert.equal(anchored.status, 'ANCHORED');
  assert.equal(anchored.type, 'MARKETPLACE');
});

test('fails closed when Tari transaction is not confirmed', async () => {
  await assert.rejects(() => anchorMyzEvidenceOnTari({ record: contribution(), wallet: { anchorEvidence: async () => ({ transactionId: 'pending', confirmed: false }) } }), /not confirmed/);
});

test('rejects Tari mainnet until production review', async () => {
  await assert.rejects(() => anchorMyzEvidenceOnTari({ record: contribution(), network: 'tari-mainnet', wallet: { anchorEvidence: async () => ({ transactionId: 'x', confirmed: true }) } }), /testnet-only/);
});

test('does not anchor the same evidence twice', async () => {
  const first = await anchorMyzEvidenceOnTari({ record: contribution(), wallet: { anchorEvidence: async () => ({ transactionId: 'tari-test-tx-3', confirmed: true }) } });
  await assert.rejects(() => anchorMyzEvidenceOnTari({ record: first, wallet: { anchorEvidence: async () => ({ transactionId: 'again', confirmed: true }) } }), /already anchored/);
});
