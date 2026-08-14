'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const payout = require('../gateway/tari_payout');

test('transferToAddress rejects a missing address', async () => {
  await assert.rejects(
    () => payout.transferToAddress('unit_user_a', '', 50),
    /Invalid address or amount/
  );
});

test('transferToAddress rejects a non-positive amount', async () => {
  await assert.rejects(
    () => payout.transferToAddress('unit_user_b', 'tari_addr_b', 0),
    /Invalid address or amount/
  );
  await assert.rejects(
    () => payout.transferToAddress('unit_user_b', 'tari_addr_b', -1),
    /Invalid address or amount/
  );
});

test('simulation mode returns a sent transfer with a simulated tx id', async () => {
  const result = await payout.transferToAddress('unit_user_c', 'tari_addr_c', 50);
  assert.equal(result.status, 'sent');
  assert.equal(result.simulated, true);
  assert.match(result.transferId, /^payout_/);
  assert.match(result.txId, /^tari_tx_sim_/);
});

test('getTransferStatus returns null for an unknown transfer id', () => {
  assert.equal(payout.getTransferStatus('does-not-exist'), null);
});

test('getTransferStatus reports amount, address and status after a transfer', async () => {
  const { transferId } = await payout.transferToAddress('unit_user_d', 'tari_addr_d', 75);
  const status = payout.getTransferStatus(transferId);
  assert.equal(status.transferId, transferId);
  assert.equal(status.status, 'sent');
  assert.equal(status.amount, 75);
  assert.equal(status.address, 'tari_addr_d');
  assert.ok(status.createdAt);
});

test('getUserTransfers returns only that user transfers', async () => {
  await payout.transferToAddress('unit_user_e', 'tari_addr_e1', 10);
  await payout.transferToAddress('unit_user_e', 'tari_addr_e2', 20);
  await payout.transferToAddress('unit_user_f', 'tari_addr_f', 30);

  const mine = payout.getUserTransfers('unit_user_e');
  assert.equal(mine.length, 2);
  assert.ok(mine.every((t) => t.userId === 'unit_user_e'));
  const amounts = mine.map((t) => t.amount).sort((a, b) => a - b);
  assert.deepEqual(amounts, [10, 20]);

  const other = payout.getUserTransfers('unit_user_f');
  assert.equal(other.length, 1);
  assert.equal(other[0].amount, 30);
});
