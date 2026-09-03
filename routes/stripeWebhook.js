const {
  verifyWebhookSignature,
  relayStripeEventToMyZubster,
} = require('../services/stripePayments');

const RELAY_EVENT_TYPES = new Set([
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
  'checkout.session.async_payment_failed',
  'payment_intent.payment_failed',
  'charge.refunded',
]);

async function stripeWebhook(req, res) {
  try {
    const signature = req.headers['stripe-signature'];
    const event = verifyWebhookSignature(req.body, signature);

    if (RELAY_EVENT_TYPES.has(event.type)) {
      await relayStripeEventToMyZubster(event);
    }

    return res.status(200).json({ received: true, event_id: event.id, event_type: event.type });
  } catch (error) {
    console.error('[Stripe webhook]', error.message);
    return res.status(error.status || 400).json({
      error: error.message || 'Stripe webhook rejected',
      code: error.code || 'STRIPE_WEBHOOK_ERROR',
    });
  }
}

module.exports = stripeWebhook;
