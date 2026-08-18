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
    currency: 'MYZ',
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
    currency: bounty.currency,
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
test('confirming an already confirmed transaction is idempotent', () => {
  const escrow = new EscrowService();

  const tx = escrow.createPayment({
    bountyId: 'bounty_1',
    amount: 500,
    currency: 'MYZ',
    contributor: 'user_1',
  });

  const first = escrow.complete(tx.transactionId);
  const second = escrow.complete(tx.transactionId);

  assert.equal(second.status, 'confirmed');
  assert.equal(second.transactionId, first.transactionId);
  assert.equal(second.confirmedAt, first.confirmedAt);
});

test('pending transaction can fail and increments retries', () => {
  const escrow = new EscrowService();

  const tx = escrow.createPayment({
    bountyId: 'bounty_1',
    amount: 500,
    currency: 'MYZ',
    contributor: 'user_1',
  });

  const failed = escrow.failPayment(tx.transactionId);

  assert.equal(failed.status, 'failed');
  assert.equal(failed.retries, 1);
});

test('failed transaction can be retried without changing transactionId', () => {
  const escrow = new EscrowService();

  const tx = escrow.createPayment({
    bountyId: 'bounty_1',
    amount: 500,
    currency: 'MYZ',
    contributor: 'user_1',
  });

  escrow.failPayment(tx.transactionId);

  const retried = escrow.retryPayment(tx.transactionId);

  assert.equal(retried.status, 'pending');
  assert.equal(retried.transactionId, tx.transactionId);
  assert.equal(retried.retries, 1);
});

test('failed transaction cannot be confirmed before retry', () => {
  const escrow = new EscrowService();

  const tx = escrow.createPayment({
    bountyId: 'bounty_1',
    amount: 500,
    currency: 'MYZ',
    contributor: 'user_1',
  });

  escrow.failPayment(tx.transactionId);

  assert.throws(
    () => escrow.complete(tx.transactionId),
    /failed.*retried/i
  );
});

test('confirmed transaction cannot be retried', () => {
  const escrow = new EscrowService();

  const tx = escrow.createPayment({
    bountyId: 'bounty_1',
    amount: 500,
    currency: 'MYZ',
    contributor: 'user_1',
  });

  escrow.complete(tx.transactionId);

  assert.throws(
    () => escrow.retryPayment(tx.transactionId),
    /confirmed.*retried/i
  );
});
test('complete throws for a nonexistent transaction', () => {
  const escrow = new EscrowService();

  assert.throws(
    () => escrow.complete('does-not-exist'),
    /Transaction not found/
  );
});

test('failPayment throws for a nonexistent transaction', () => {
  const escrow = new EscrowService();

  assert.throws(
    () => escrow.failPayment('does-not-exist'),
    /Transaction not found/
  );
});

test('retryPayment throws for a nonexistent transaction', () => {
  const escrow = new EscrowService();

  assert.throws(
    () => escrow.retryPayment('does-not-exist'),
    /Transaction not found/
  );
});

test('invalid payment amount is rejected', () => {
  const escrow = new EscrowService();

  assert.throws(
    () =>
      escrow.createPayment({
        bountyId: 'bounty_1',
        amount: 0,
        currency: 'MYZ',
        contributor: 'user_1',
      }),
    /greater than zero/
  );

  assert.throws(
    () =>
      escrow.createPayment({
        bountyId: 'bounty_1',
        amount: -100,
        currency: 'MYZ',
        contributor: 'user_1',
      }),
    /greater than zero/
  );
});

test('invalid currency is rejected', () => {
  const escrow = new EscrowService();

  assert.throws(
    () =>
      escrow.createPayment({
        bountyId: 'bounty_1',
        amount: 100,
        currency: '',
        contributor: 'user_1',
      }),
    /currency must be a non-empty string/
  );
});
test('transaction ownership accepts matching bounty data', () => {
  const escrow = new EscrowService();

  const tx = escrow.createPayment({
    bountyId: 'bounty_1',
    amount: 500,
    currency: 'MYZ',
    contributor: 'user_1',
  });

  assert.equal(
    escrow.validateTransactionOwnership(tx, {
      bountyId: 'bounty_1',
      amount: 500,
      currency: 'MYZ',
      contributor: 'user_1',
    }),
    true
  );
});

test('transaction ownership rejects bountyId mismatch', () => {
  const escrow = new EscrowService();

  const tx = escrow.createPayment({
    bountyId: 'bounty_1',
    amount: 500,
    currency: 'MYZ',
    contributor: 'user_1',
  });

  assert.throws(
    () =>
      escrow.validateTransactionOwnership(tx, {
        bountyId: 'bounty_2',
        amount: 500,
        currency: 'MYZ',
        contributor: 'user_1',
      }),
    /bountyId/
  );
});

test('transaction ownership rejects amount mismatch', () => {
  const escrow = new EscrowService();

  const tx = escrow.createPayment({
    bountyId: 'bounty_1',
    amount: 500,
    currency: 'MYZ',
    contributor: 'user_1',
  });

  assert.throws(
    () =>
      escrow.validateTransactionOwnership(tx, {
        bountyId: 'bounty_1',
        amount: 700,
        currency: 'MYZ',
        contributor: 'user_1',
      }),
    /amount/
  );
});

test('transaction ownership rejects currency mismatch', () => {
  const escrow = new EscrowService();

  const tx = escrow.createPayment({
    bountyId: 'bounty_1',
    amount: 500,
    currency: 'MYZ',
    contributor: 'user_1',
  });

  assert.throws(
    () =>
      escrow.validateTransactionOwnership(tx, {
        bountyId: 'bounty_1',
        amount: 500,
        currency: 'USD',
        contributor: 'user_1',
      }),
    /currency/
  );
});

test('transaction ownership rejects contributor mismatch', () => {
  const escrow = new EscrowService();

  const tx = escrow.createPayment({
    bountyId: 'bounty_1',
    amount: 500,
    currency: 'MYZ',
    contributor: 'user_1',
  });

  assert.throws(
    () =>
      escrow.validateTransactionOwnership(tx, {
        bountyId: 'bounty_1',
        amount: 500,
        currency: 'MYZ',
        contributor: 'user_2',
      }),
    /contributor/
  );
});
test('escrow transaction persists across service instances', () => {
  const fs = require('node:fs');
  const os = require('node:os');
  const path = require('node:path');
  const { JsonEscrowRepository } = require('../services/payment/json-escrow.repository');

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'myz-escrow-test-'));
  const filePath = path.join(tempDir, 'escrow-transactions.json');

  try {
    const escrowA = new EscrowService({
      repository: new JsonEscrowRepository(filePath),
    });

    const created = escrowA.createPayment({
      bountyId: 'bounty_persist',
      amount: 500,
      currency: 'MYZ',
      contributor: 'user_1',
    });

    const escrowB = new EscrowService({
      repository: new JsonEscrowRepository(filePath),
    });

    const restored = escrowB.get(created.transactionId);

    assert.ok(restored);
    assert.equal(restored.transactionId, created.transactionId);
    assert.equal(restored.bountyId, 'bounty_persist');
    assert.equal(restored.amount, 500);
    assert.equal(restored.currency, 'MYZ');
    assert.equal(restored.contributor, 'user_1');
    assert.equal(restored.status, 'pending');
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});