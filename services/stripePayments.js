const crypto = require('crypto');

const STRIPE_API_BASE = 'https://api.stripe.com/v1';
const DEFAULT_CURRENCY = 'eur';
const MIN_AMOUNT_CENTS = 50;
const MAX_AMOUNT_CENTS = 100000000;

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    const error = new Error(`${name} is not configured`);
    error.status = 503;
    error.code = 'STRIPE_NOT_CONFIGURED';
    throw error;
  }
  return value;
}

function normalizeMetadata(metadata = {}) {
  const normalized = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (value === undefined || value === null || value === '') continue;
    normalized[String(key).slice(0, 40)] = String(value).slice(0, 500);
  }
  return normalized;
}

async function stripePost(path, params) {
  const secretKey = requiredEnv('STRIPE_SECRET_KEY');
  const body = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    body.append(key, String(value));
  }

  const response = await fetch(`${STRIPE_API_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Stripe-Version': process.env.STRIPE_API_VERSION || '2026-08-27.basil',
    },
    body,
  });

  const payload = await response.json();
  if (!response.ok) {
    const error = new Error(payload?.error?.message || 'Stripe API request failed');
    error.status = response.status >= 500 ? 502 : 400;
    error.code = payload?.error?.code || 'STRIPE_API_ERROR';
    throw error;
  }
  return payload;
}

async function createCheckoutSession({
  amountCents,
  currency = DEFAULT_CURRENCY,
  description = 'MyZubster payment',
  orderId,
  userId,
  metadata = {},
}) {
  const amount = Number(amountCents);
  if (!Number.isInteger(amount) || amount < MIN_AMOUNT_CENTS || amount > MAX_AMOUNT_CENTS) {
    const error = new Error(`amountCents must be an integer between ${MIN_AMOUNT_CENTS} and ${MAX_AMOUNT_CENTS}`);
    error.status = 400;
    error.code = 'INVALID_AMOUNT';
    throw error;
  }

  const normalizedCurrency = String(currency || DEFAULT_CURRENCY).toLowerCase();
  if (!/^[a-z]{3}$/.test(normalizedCurrency)) {
    const error = new Error('currency must be a 3-letter ISO currency code');
    error.status = 400;
    error.code = 'INVALID_CURRENCY';
    throw error;
  }

  const successUrl = requiredEnv('STRIPE_SUCCESS_URL');
  const cancelUrl = requiredEnv('STRIPE_CANCEL_URL');
  const safeMetadata = normalizeMetadata({
    myzubster_order_id: orderId,
    myzubster_user_id: userId,
    ...metadata,
  });

  const params = {
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: orderId,
    'line_items[0][quantity]': 1,
    'line_items[0][price_data][currency]': normalizedCurrency,
    'line_items[0][price_data][unit_amount]': amount,
    'line_items[0][price_data][product_data][name]': String(description).slice(0, 127),
  };

  for (const [key, value] of Object.entries(safeMetadata)) {
    params[`metadata[${key}]`] = value;
    params[`payment_intent_data[metadata][${key}]`] = value;
  }

  return stripePost('/checkout/sessions', params);
}

function parseStripeSignature(signatureHeader) {
  const parts = String(signatureHeader || '').split(',');
  let timestamp = null;
  const signatures = [];

  for (const part of parts) {
    const [key, value] = part.split('=', 2);
    if (key === 't') timestamp = value;
    if (key === 'v1') signatures.push(value);
  }
  return { timestamp, signatures };
}

function verifyWebhookSignature(rawBody, signatureHeader) {
  const secret = requiredEnv('STRIPE_WEBHOOK_SECRET');
  const { timestamp, signatures } = parseStripeSignature(signatureHeader);
  if (!timestamp || signatures.length === 0) {
    const error = new Error('Missing Stripe webhook signature');
    error.status = 400;
    error.code = 'INVALID_STRIPE_SIGNATURE';
    throw error;
  }

  const toleranceSeconds = Number(process.env.STRIPE_WEBHOOK_TOLERANCE_SECONDS || 300);
  const timestampNumber = Number(timestamp);
  const age = Math.abs(Math.floor(Date.now() / 1000) - timestampNumber);
  if (!Number.isFinite(timestampNumber) || age > toleranceSeconds) {
    const error = new Error('Stripe webhook timestamp outside tolerance');
    error.status = 400;
    error.code = 'STALE_STRIPE_WEBHOOK';
    throw error;
  }

  const payload = `${timestamp}.${rawBody.toString('utf8')}`;
  const expected = crypto.createHmac('sha256', secret).update(payload, 'utf8').digest('hex');
  const expectedBuffer = Buffer.from(expected, 'hex');

  const valid = signatures.some((signature) => {
    if (!/^[0-9a-f]+$/i.test(signature) || signature.length !== expected.length) return false;
    const receivedBuffer = Buffer.from(signature, 'hex');
    return receivedBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
  });

  if (!valid) {
    const error = new Error('Invalid Stripe webhook signature');
    error.status = 400;
    error.code = 'INVALID_STRIPE_SIGNATURE';
    throw error;
  }

  return JSON.parse(rawBody.toString('utf8'));
}

async function relayStripeEventToMyZubster(event) {
  const relayUrl = process.env.MYZUBSTER_STRIPE_EVENT_URL;
  if (!relayUrl) return { relayed: false, reason: 'not_configured' };

  const headers = { 'Content-Type': 'application/json' };
  if (process.env.MYZUBSTER_STRIPE_EVENT_TOKEN) {
    headers.Authorization = `Bearer ${process.env.MYZUBSTER_STRIPE_EVENT_TOKEN}`;
  }

  const response = await fetch(relayUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      source: 'stripe',
      event_id: event.id,
      event_type: event.type,
      created: event.created,
      livemode: event.livemode,
      data: event.data?.object || null,
    }),
  });

  if (!response.ok) {
    const error = new Error(`MyZubster Stripe event relay failed with HTTP ${response.status}`);
    error.status = 502;
    error.code = 'MYZUBSTER_STRIPE_RELAY_FAILED';
    throw error;
  }

  return { relayed: true };
}

module.exports = {
  createCheckoutSession,
  verifyWebhookSignature,
  relayStripeEventToMyZubster,
};
