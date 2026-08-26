'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { BountyController } = require('../bounty/controllers/bounty.controller');

test('payment request records internal escrow state without external settlement', async () => {
  let settlementCalls = 0;

  const controller = new BountyController();

  // Replace the controller's default service with a controlled test double.
  controller.escrow = {
    createPayment({ bountyId, amount, currency, contributor }) {
      return {
        transactionId: 'tx_internal_only',
        bountyId,
        amount,
        currency,
        contributor,
        status: 'pending',
      };
    },

    async settle() {
      settlementCalls += 1;
      throw new Error('settlement must not be called');
    },
  };

  controller.bounties = [
    {
      id: 'bounty-1',
      status: 'completed',
      paymentRequested: false,
      bountyAmount: 500,
      currency: 'MYZ',
      assignedTo: 'user-1',

      requestPayment() {
        this.paymentRequested = true;
      },

      attachTransaction(transactionId) {
        this.transactionId = transactionId;
      },

      toJSON() {
        return {
          id: this.id,
          paymentRequested: this.paymentRequested,
          transactionId: this.transactionId,
        };
      },
    },
  ];

  controller.saveBounties = () => {};

  const req = {
    params: {
      id: 'bounty-1',
    },
  };

  let statusCode = 200;
  let responseBody;

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },

    json(body) {
      responseBody = body;
      return this;
    },
  };

  await controller.requestPayment(req, res);

  assert.equal(statusCode, 200);
  assert.equal(responseBody.success, true);
  assert.equal(responseBody.transaction.status, 'pending');
  assert.equal(responseBody.settlement.mode, 'internal');
  assert.equal(responseBody.settlement.externalTransfer, false);
  assert.equal(settlementCalls, 0);
});