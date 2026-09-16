'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createContributionEvidence,
  createMarketplaceEvidence,
  anchorMyzEvidence,
  verifyMyzEvidence
} = require('../services/settlement/myzEvidenceLedger');

const contribution = { contributorRef: 'github:user-123', action: 'pull-request', repo: 'MyZubsterGateway', ref: 'pr-1409' };
const marketplace = { orderRef: 'order-42', listingRef: 'listing-9', sellerRef: 'seller-7', state: 'completed' };

test('creates verifiable MYZ contribution evidence without storing the contribution payload', () => {
  const record = createContributionEvidence({ evidenceId: 'myz-contrib-1', sourceRef: 'pr-1409', amountMYZ: '25', payload: contribution, createdAt: '2026-09-16T04:00:00.000Z' });
  assert.equal(record.asset, 'MYZ');
  assert.equal(record.type, 'CONTRIBUTION');
  assert.equal(record.status, 'RECORDED');
  assert.equal(record.payload, undefined);
  assert.equal(verifyMyzEvidence(record, contribution), true);
});

test('creates verifiable MYZ marketplace evidence', () => {
  const record = createMarketplaceEvidence({ evidenceId: 'myz-market-1', sourceRef: 'order-42', amountMYZ: '100', payload: marketplace, createdAt: '2026-09-16T04:00:00.000Z' });
  assert.equal(record.type, 'MARKETPLACE');
  assert.equal(verifyMyzEvidence(record, marketplace), true);
});

test('any mutation of the source payload invalidates evidence', () => {
  const record = createMarketplaceEvidence({ evidenceId: 'myz-market-2', sourceRef: 'order-42', amountMYZ: '100', payload: marketplace, createdAt: '2026-09-16T04:00:00.000Z' });
  assert.equal(verifyMyzEvidence(record, { ...marketplace, state: 'refunded' }), false);
});

test('evidence records can form an append-only hash chain', () => {
  const first = createContributionEvidence({ evidenceId: 'myz-1', sourceRef: 'pr-1', amountMYZ: '10', payload: { ref: 'pr-1' }, createdAt: '2026-09-16T04:00:00.000Z' });
  const secondPayload = { ref: 'order-1' };
  const second = createMarketplaceEvidence({ evidenceId: 'myz-2', sourceRef: 'order-1', amountMYZ: '20', payload: secondPayload, previousHash: first.evidenceHash, createdAt: '2026-09-16T04:01:00.000Z' });
  assert.equal(verifyMyzEvidence(second, secondPayload, first), true);
  assert.equal(verifyMyzEvidence(second, secondPayload, { ...first, evidenceHash: 'a'.repeat(64) }), false);
});

test('blockchain anchor is immutable once attached', () => {
  const record = createContributionEvidence({ evidenceId: 'myz-anchor-1', sourceRef: 'issue-1', amountMYZ: '5', payload: { ref: 'issue-1' } });
  const anchored = anchorMyzEvidence(record, { network: 'testnet', txId: 'tx-test-123', blockRef: '100' });
  assert.equal(anchored.status, 'ANCHORED');
  assert.equal(anchored.anchor.txId, 'tx-test-123');
  assert.throws(() => anchorMyzEvidence(anchored, { network: 'testnet', txId: 'replacement' }), /already anchored/);
});

test('rejects invalid MYZ amounts and incomplete anchor evidence', () => {
  assert.throws(() => createContributionEvidence({ evidenceId: 'bad', sourceRef: 'x', amountMYZ: '0', payload: { ref: 'x' } }), /amountMYZ/);
  const record = createContributionEvidence({ evidenceId: 'good', sourceRef: 'x', amountMYZ: '1', payload: { ref: 'x' } });
  assert.throws(() => anchorMyzEvidence(record, { network: 'testnet' }), /network and txId/);
});
