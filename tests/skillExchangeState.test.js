const test = require('node:test');
const assert = require('node:assert/strict');
const {
  actorId,
  isParticipant,
  confirmStart,
  confirmCompletion,
} = require('../utils/skillExchangeState');

test('actorId supports common JWT identity fields', () => {
  assert.equal(actorId({ id: 'u1' }), 'u1');
  assert.equal(actorId({ userId: 'u2' }), 'u2');
  assert.equal(actorId({ sub: 'u3' }), 'u3');
  assert.equal(actorId(null), null);
});

test('exchange starts only after both matched participants confirm', () => {
  const exchange = {
    ownerId: 'owner',
    participantId: 'peer',
    status: 'matched',
    startConfirmedBy: [],
  };

  assert.equal(confirmStart(exchange, 'owner'), 'matched');
  assert.deepEqual(exchange.startConfirmedBy, ['owner']);
  assert.equal(confirmStart(exchange, 'peer'), 'active');
  assert.equal(exchange.status, 'active');
});

test('duplicate confirmation is idempotent', () => {
  const exchange = {
    ownerId: 'owner',
    participantId: 'peer',
    status: 'matched',
    startConfirmedBy: [],
  };

  confirmStart(exchange, 'owner');
  confirmStart(exchange, 'owner');
  assert.deepEqual(exchange.startConfirmedBy, ['owner']);
});

test('non-participant cannot confirm start', () => {
  const exchange = {
    ownerId: 'owner',
    participantId: 'peer',
    status: 'matched',
    startConfirmedBy: [],
  };

  assert.throws(() => confirmStart(exchange, 'outsider'), /Only exchange participants/);
});

test('completion requires active exchange and both confirmations', () => {
  const exchange = {
    ownerId: 'owner',
    participantId: 'peer',
    status: 'active',
    completionConfirmedBy: [],
  };

  assert.equal(confirmCompletion(exchange, 'peer'), 'active');
  assert.equal(confirmCompletion(exchange, 'owner'), 'completed');
  assert.equal(exchange.status, 'completed');
});

test('participant predicate is strict to the matched pair', () => {
  const exchange = { ownerId: 'owner', participantId: 'peer' };
  assert.equal(isParticipant(exchange, 'owner'), true);
  assert.equal(isParticipant(exchange, 'peer'), true);
  assert.equal(isParticipant(exchange, 'other'), false);
});
