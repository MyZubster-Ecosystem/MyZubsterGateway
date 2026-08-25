const crypto = require('crypto');

function decodeBase64Url(value) {
  const normalized = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + padding, 'base64');
}

function timingSafeEqualBase64Url(left, right) {
  const a = Buffer.from(String(left || ''));
  const b = Buffer.from(String(right || ''));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function verifyToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  const parts = String(token || '').split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;
  let header;
  let payload;
  try {
    header = JSON.parse(decodeBase64Url(encodedHeader).toString('utf8'));
    payload = JSON.parse(decodeBase64Url(encodedPayload).toString('utf8'));
  } catch (_error) {
    return null;
  }

  if (header.alg !== 'HS256' || header.typ && header.typ !== 'JWT') return null;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  if (!timingSafeEqualBase64Url(signature, expectedSignature)) return null;

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp != null && Number(payload.exp) <= now) return null;
  if (payload.nbf != null && Number(payload.nbf) > now) return null;

  return payload;
}

module.exports = { verifyToken };
