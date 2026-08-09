const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// ============================================================
// Pagamenti Fiat USD/EUR/GBP - MyZubster Gateway
// Issue #1040 - Reward: 300 MYZ + 1% lifetime
// ============================================================

const payments = {};
const webhookLog = [];
const conversionRates = {
  MYZ_USD: 0.15,  // Mock: 1 MYZ = $0.15
  MYZ_EUR: 0.14,  // 1 MYZ = €0.14
  MYZ_GBP: 0.12,  // 1 MYZ = £0.12
  updatedAt: new Date().toISOString()
};

// Stripe-like payment intent (mock)
router.post('/payments/fiat/create', (req, res) => {
  const { amount, currency, description, customerEmail, metadata } = req.body || {};

  if (!amount || !currency) {
    return res.status(400).json({ error: 'Campi obbligatori: amount, currency', ok: false });
  }

  const validCurrencies = ['USD', 'EUR', 'GBP'];
  if (!validCurrencies.includes(currency.toUpperCase())) {
    return res.status(400).json({
      error: `Valuta non supportata. Supportate: ${validCurrencies.join(', ')}`,
      ok: false
    });
  }

  const paymentId = `FIAT-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
  const payment = {
    paymentId,
    amount: parseFloat(amount),
    currency: currency.toUpperCase(),
    description: description || 'MyZubster Service Payment',
    customerEmail: customerEmail || null,
    metadata: metadata || {},
    status: 'created',
    stripePaymentIntentId: `pi_mock_${crypto.randomBytes(12).toString('hex')}`,
    clientSecret: `cs_${crypto.randomBytes(16).toString('hex')}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    events: [{
      type: 'payment.created',
      timestamp: new Date().toISOString()
    }]
  };

  // MYZ conversion
  const myzKey = `MYZ_${currency.toUpperCase()}`;
  const rate = conversionRates[myzKey] || 0.15;
  payment.myzEquivalent = parseFloat((parseFloat(amount) / rate).toFixed(2));

  payments[paymentId] = payment;

  res.status(201).json({
    ok: true,
    payment: {
      paymentId: payment.paymentId,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      clientSecret: payment.clientSecret,
      myzEquivalent: payment.myzEquivalent,
      createdAt: payment.createdAt
    }
  });
});

// Get payment status
router.get('/payments/fiat/status/:paymentId', (req, res) => {
  const payment = payments[req.params.paymentId];
  if (!payment) {
    return res.status(404).json({ error: 'Pagamento non trovato', ok: false });
  }

  res.json({
    ok: true,
    payment: {
      paymentId: payment.paymentId,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      description: payment.description,
      myzEquivalent: payment.myzEquivalent,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      events: payment.events
    }
  });
});

// Simulate payment confirmation (normally handled by Stripe webhook)
router.post('/payments/fiat/confirm/:paymentId', (req, res) => {
  const payment = payments[req.params.paymentId];
  if (!payment) {
    return res.status(404).json({ error: 'Pagamento non trovato', ok: false });
  }
  if (payment.status !== 'created') {
    return res.status(400).json({ error: `Pagamento già ${payment.status}`, ok: false });
  }

  payment.status = 'confirmed';
  payment.confirmedAt = new Date().toISOString();
  payment.updatedAt = new Date().toISOString();
  payment.events.push({ type: 'payment.confirmed', timestamp: new Date().toISOString() });

  // Trigger webhook
  webhookLog.push({
    webhookId: `wh_${crypto.randomBytes(8).toString('hex')}`,
    event: 'payment.confirmed',
    paymentId: payment.paymentId,
    timestamp: new Date().toISOString()
  });

  res.json({
    ok: true,
    payment: {
      paymentId: payment.paymentId,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      myzEquivalent: payment.myzEquivalent,
      confirmedAt: payment.confirmedAt
    }
  });
});

// Refund payment
router.post('/payments/fiat/refund/:paymentId', (req, res) => {
  const payment = payments[req.params.paymentId];
  if (!payment) {
    return res.status(404).json({ error: 'Pagamento non trovato', ok: false });
  }
  if (payment.status !== 'confirmed') {
    return res.status(400).json({
      error: `Impossibile rimborsare pagamento in stato '${payment.status}'`,
      ok: false
    });
  }

  const { reason } = req.body || {};
  payment.status = 'refunded';
  payment.refundReason = reason || 'Customer request';
  payment.refundedAt = new Date().toISOString();
  payment.updatedAt = new Date().toISOString();
  payment.events.push({
    type: 'payment.refunded',
    reason: payment.refundReason,
    timestamp: new Date().toISOString()
  });

  webhookLog.push({
    webhookId: `wh_${crypto.randomBytes(8).toString('hex')}`,
    event: 'payment.refunded',
    paymentId: payment.paymentId,
    timestamp: new Date().toISOString()
  });

  res.json({ ok: true, paymentId: payment.paymentId, status: 'refunded', refundReason: payment.refundReason });
});

// Webhook receiver (Stripe webhook mock)
router.post('/webhooks/stripe', (req, res) => {
  const { type, data } = req.body || {};
  if (!type) {
    return res.status(400).json({ error: 'Tipo evento webhook obbligatorio', ok: false });
  }

  const webhook = {
    webhookId: `wh_${crypto.randomBytes(8).toString('hex')}`,
    event: type,
    data: data || {},
    receivedAt: new Date().toISOString(),
    verified: true
  };
  webhookLog.push(webhook);

  // Process known events
  if (type === 'payment_intent.succeeded' && data?.object?.metadata?.paymentId) {
    const p = payments[data.object.metadata.paymentId];
    if (p && p.status === 'created') {
      p.status = 'confirmed';
      p.updatedAt = new Date().toISOString();
      p.events.push({ type: 'payment.confirmed', via: 'webhook', timestamp: new Date().toISOString() });
    }
  }

  res.status(200).json({ ok: true, received: true, webhookId: webhook.webhookId });
});

// Webhook log
router.get('/webhooks/log', (req, res) => {
  const { limit, event } = req.query;
  let log = [...webhookLog];
  if (event) log = log.filter(w => w.event === event);
  const maxResults = parseInt(limit) || 20;
  log = log.slice(-maxResults);

  res.json({ ok: true, totalWebhooks: webhookLog.length, results: log });
});

// Conversion rates
router.get('/conversion/rates', (req, res) => {
  res.json({
    ok: true,
    rates: conversionRates,
    note: 'Tassi mock. In produzione, usa Stripe FX o provider esterno.'
  });
});

// Update conversion rates
router.post('/conversion/rates', (req, res) => {
  const { MYZ_USD, MYZ_EUR, MYZ_GBP } = req.body || {};
  if (MYZ_USD !== undefined) conversionRates.MYZ_USD = parseFloat(MYZ_USD);
  if (MYZ_EUR !== undefined) conversionRates.MYZ_EUR = parseFloat(MYZ_EUR);
  if (MYZ_GBP !== undefined) conversionRates.MYZ_GBP = parseFloat(MYZ_GBP);
  conversionRates.updatedAt = new Date().toISOString();

  res.json({ ok: true, rates: conversionRates });
});

// Calculate MYZ equivalent
router.post('/conversion/calculate', (req, res) => {
  const { amount, fromCurrency, toCurrency } = req.body || {};
  if (!amount || !fromCurrency || !toCurrency) {
    return res.status(400).json({ error: 'Campi obbligatori: amount, fromCurrency, toCurrency', ok: false });
  }

  const fromKey = `${fromCurrency.toUpperCase()}_${toCurrency.toUpperCase()}`;
  let rate;

  if (conversionRates[fromKey]) {
    rate = conversionRates[fromKey];
  } else {
    // Inverse lookup
    const invKey = `${toCurrency.toUpperCase()}_${fromCurrency.toUpperCase()}`;
    if (conversionRates[invKey]) {
      rate = 1 / conversionRates[invKey];
    } else {
      return res.status(400).json({ error: 'Coppia di valute non supportata', ok: false });
    }
  }

  const converted = parseFloat((parseFloat(amount) * rate).toFixed(4));

  res.json({
    ok: true,
    input: { amount: parseFloat(amount), currency: fromCurrency.toUpperCase() },
    output: { amount: converted, currency: toCurrency.toUpperCase() },
    rate,
    timestamp: new Date().toISOString()
  });
});

// Payment history
router.get('/payments/fiat/history', (req, res) => {
  const { status, currency, from, to } = req.query;
  let results = Object.values(payments);

  if (status) results = results.filter(p => p.status === status);
  if (currency) results = results.filter(p => p.currency === currency.toUpperCase());
  if (from) results = results.filter(p => new Date(p.createdAt) >= new Date(from));
  if (to) results = results.filter(p => new Date(p.createdAt) <= new Date(to));

  const totalAmount = results.reduce((sum, p) => {
    if (p.status === 'refunded') return sum;
    return sum + p.amount;
  }, 0);

  res.json({
    ok: true,
    count: results.length,
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    byStatus: {
      created: results.filter(p => p.status === 'created').length,
      confirmed: results.filter(p => p.status === 'confirmed').length,
      refunded: results.filter(p => p.status === 'refunded').length
    },
    results: results.map(p => ({
      paymentId: p.paymentId,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      myzEquivalent: p.myzEquivalent,
      createdAt: p.createdAt
    }))
  });
});

module.exports = router;
