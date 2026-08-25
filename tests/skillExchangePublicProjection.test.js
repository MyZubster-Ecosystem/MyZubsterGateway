const test = require('node:test');
const assert = require('node:assert/strict');
const { publicOfferProjection } = require('../utils/skillExchangePublicProjection');

test('public offer projection strips actor ids, exact location and private state', () => {
  const offer = {
    _id: 'offer-1',
    ownerId: 'owner-secret-id',
    participantId: 'participant-secret-id',
    title: 'Scambio potatura per inglese',
    description: 'Descrizione pubblica',
    offeredSkill: 'potatura',
    requestedSkill: 'inglese',
    mode: 'local',
    location: 'Via Riservata 42, Rimini',
    status: 'completed',
    applications: [{ applicantId: 'applicant-secret-id', message: 'private message' }],
    startConfirmedBy: ['owner-secret-id'],
    completionConfirmedBy: ['participant-secret-id'],
    reviews: [
      {
        reviewerId: 'owner-secret-id',
        revieweeId: 'participant-secret-id',
        rating: 5,
        comment: 'Ottimo scambio',
      },
    ],
  };

  const projected = publicOfferProjection(offer);
  const serialized = JSON.stringify(projected);

  assert.equal(projected._id, 'offer-1');
  assert.equal(projected.hasPrivateLocation, true);
  assert.equal(projected.reviews[0].rating, 5);
  assert.equal(projected.reviews[0].comment, 'Ottimo scambio');
  assert.equal(serialized.includes('owner-secret-id'), false);
  assert.equal(serialized.includes('participant-secret-id'), false);
  assert.equal(serialized.includes('applicant-secret-id'), false);
  assert.equal(serialized.includes('Via Riservata'), false);
  assert.equal(serialized.includes('private message'), false);
});

test('public offer projection indicates when no private location was supplied', () => {
  const projected = publicOfferProjection({
    _id: 'offer-2',
    title: 'Remote exchange',
    mode: 'remote',
    location: '',
    reviews: [],
  });

  assert.equal(projected.hasPrivateLocation, false);
});
