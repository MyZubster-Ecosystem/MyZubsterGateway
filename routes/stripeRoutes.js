const express = require('express');
const { createCheckoutSession } = require('../services/stripePayments');

const router = express.Router();

router.get('/status', (_req, res) => {
  res.json({
    provider: 'stripe',
    configured: Boolean(process.env.STRIPE_SECRET_KEY),
    webhookConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    mode: String(process.env.STRIPE_SECRET_KEY || '').startsWith('sk_live_') ? 'live' : 'test',
  });
});

router.post('/checkout-session', async (req, res, next) => {
  try {
    const {
      amountCents,
      currency = 'eur',
      description = 'MyZubster payment',
      orderId,
      userId,
      metadata = {},
    } = req.body || {};

    if (!orderId || typeof orderId !== 'string') {
      return res.status(400).json({ error: 'orderId is required', code: 'ORDER_ID_REQUIRED' });
    }

    const session = await createCheckoutSession({
      amountCents,
      currency,
      description,
      orderId,
      userId,
      metadata: metadata && typeof metadata === 'object' && !Array.isArray(metadata) ? metadata : {},
    });

    return res.status(201).json({
      id: session.id,
      url: session.url,
      status: session.status,
      payment_status: session.payment_status,
      expires_at: session.expires_at,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
