/**
 * Performance Middleware (MYZ bounty #208)
 * ------------------------------------------------------------
 * Additive, self-contained Express middleware that improves site
 * speed by sending performance + security related headers.
 *
 * Usage (server.js):
 *   const performance = require('./middleware/performance');
 *   app.use(performance);
 *
 * It is side-effect free and safe to mount alongside the existing
 * `securityHeaders` middleware: every header is only set when a
 * previous middleware/route has not already decided one, so it never
 * clobbers more specific decisions.
 *
 * NOTE on static assets: for `express.static(...)` to benefit from the
 * long-lived cache rules below, either mount this middleware *before*
 * `express.static`, or pass an explicit `maxAge` to `express.static`.
 * (By default `express.static` sends `Cache-Control: public, max-age=0`.)
 */

// Static assets get aggressively cached because their URLs are
// fingerprinted/immutable in this project. TTLs (in seconds) follow
// common best practice: long-lived immutable for fingerprinted assets,
// short-lived for data, and revalidated for HTML documents.
const CACHE_RULES = [
  { test: /\.(js|css)$/i, value: 'public, max-age=31536000, immutable' },
  { test: /\.(png|jpe?g|gif|svg|webp|avif|ico)$/i, value: 'public, max-age=31536000, immutable' },
  { test: /\.(woff2?|ttf|otf|eot)$/i, value: 'public, max-age=31536000, immutable' },
  { test: /\.(json|map)$/i, value: 'public, max-age=3600' },
  { test: /\.html?$/i, value: 'no-cache' }
];

function cacheControlFor(pathname) {
  const lower = String(pathname).split('?')[0].toLowerCase();
  for (let i = 0; i < CACHE_RULES.length; i += 1) {
    if (CACHE_RULES[i].test.test(lower)) {
      return CACHE_RULES[i].value;
    }
  }
  // Dynamic / API responses: never serve stale copies by default.
  return 'no-cache';
}

const performance = (req, res, next) => {
  const path = req.path || req.url || '/';

  // --- Cache-Control -----------------------------------------
  // Only set when the caller did not already decide (avoids
  // clobbering route-level cache decisions).
  if (!res.getHeader('Cache-Control')) {
    res.setHeader('Cache-Control', cacheControlFor(path));
  }

  // --- Security headers (additive to securityHeaders.js) -----
  if (!res.getHeader('X-Content-Type-Options')) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
  if (!res.getHeader('Referrer-Policy')) {
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  }
  // Permissions-Policy: disable resource-hungry browser features the
  // gateway UI does not use. Helps both security and speed.
  if (!res.getHeader('Permissions-Policy')) {
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()'
    );
  }

  // --- Compression note --------------------------------------
  // Express does not gzip out of the box. When the app runs behind
  // nginx/Caddy, or when `compression` is added:
  //     const compression = require('compression');
  //     app.use(compression());
  // ...text responses (HTML/CSS/JS/JSON) are gzipped, typically cutting
  // transfer size by 60-80%. We set a `Vary: Accept-Encoding` hint when
  // missing so shared caches store identity + compressed variants.
  if (!res.getHeader('Vary')) {
    res.setHeader('Vary', 'Accept-Encoding');
  }

  next();
};

module.exports = performance;
