const test = require('node:test');
const assert = require('node:assert/strict');

const { EscrowService } = require('../services/payment/escrow.service');
const { Bounty } = require('../bounty/models/bounty.model');

test('escrow payment lifecycle completes successfully', () => {
  const escrow = new EscrowService();

  const bounty = new Bounty({
    title: 'Escrow bounty',
    description: 'Testing payment flow',
    createdBy: 'admin',
    assignedTo: 'user_001',
    bountyAmount: 500,
  });

  // Reviewer approved bounty
  bounty.status = 'completed';

  // Request payment
  bounty.requestPayment();

  assert.equal(bounty.paymentRequested, true);
  assert.equal(bounty.paymentStatus, 'pending');

  // Create escrow transaction
  const tx = escrow.createPayment({
    bountyId: bounty.id,
    amount: bounty.bountyAmount,
    contributor: 'user_001',
  });

  bounty.attachTransaction(tx.transactionId);

  assert.equal(bounty.transactionId, tx.transactionId);
  assert.equal(tx.status, 'pending');

  // Confirm escrow
  escrow.complete(tx.transactionId);
  bounty.confirmPayment();

  assert.equal(bounty.paymentStatus, 'confirmed');

  const reconciled = escrow.reconcile(tx.transactionId);

  assert.equal(reconciled.status, 'confirmed');
  assert.ok(reconciled.confirmedAt);
});

test('cannot request payment before bounty is completed', () => {
  const bounty = new Bounty({
    title: 'Invalid bounty',
    description: 'Should fail',
    createdBy: 'admin',
    bountyAmount: 200,
  });

  assert.throws(() => bounty.requestPayment(), /completed/i);
});

test('cannot confirm payment without transaction', () => {
  const bounty = new Bounty({
    title: 'No tx',
    description: 'Should fail',
    createdBy: 'admin',
    bountyAmount: 300,
  });

  bounty.status = 'completed';
  bounty.requestPayment();

  assert.throws(() => bounty.confirmPayment(), /transaction/i);
});