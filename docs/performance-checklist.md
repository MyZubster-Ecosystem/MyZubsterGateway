# Site Performance Checklist

Actionable, ordered checklist for the MyZubster Gateway site speed
(MYZ bounty #208). Each item is small and independently shippable; tick
them off as they land.

## 1. Response headers (server)

- [ ] Mount the performance middleware early in `server.js`:

  ```js
  const performance = require('./middleware/performance');
  app.use(performance);
  ```

- [ ] Mount it *before* `express.static(...)` so static assets receive
  long-lived `Cache-Control` (or pass `maxAge` to `express.static`).
- [ ] Confirm headers on a live response:

  ```sh
  curl -I https://<host>/
  ```

  Check for `Cache-Control`, `X-Content-Type-Options`,
  `Referrer-Policy` and `Permissions-Policy`.

## 2. Asset compression

- [ ] Enable gzip/brotli in the reverse proxy (nginx `gzip on`, Caddy
  enables it automatically) or add `compression` middleware to Express.
- [ ] Verify `Content-Encoding: gzip` / `br` on text assets (HTML, CSS,
  JS, JSON).

## 3. Image lazy loading (client)

- [ ] Load the client script with `defer` in the page `<head>`:

  ```html
  <script src="/js/performance.js" defer></script>
  ```

- [ ] Opt images into lazy loading by using `data-src` (and optional
  `data-srcset`) instead of a plain `src`.
- [ ] Keep the hero / LCP image eager: use a normal `src` and, ideally,
  `fetchpriority="high"` so first paint is not delayed.
- [ ] Serve modern formats (WebP/AVIF) and always provide `width` and
  `height` attributes to avoid Cumulative Layout Shift.

## 4. Fonts

- [ ] Preload the primary font files:

  ```html
  <link rel="preload" as="font" type="font/woff2" href="/fonts/main.woff2" crossorigin>
  ```

- [ ] Use `font-display: swap` so text renders immediately with a
  fallback font while webfonts load.

## 5. Deferred & passive work (client)

- [ ] Move non-critical JS to idle time via
  `window.MyZubsterPerformance.scheduleIdle(fn)`.
- [ ] Register scroll/touch/wheel handlers via
  `window.MyZubsterPerformance.onPassive(el, 'scroll', fn)`.

## 6. Measure

- [ ] Run Lighthouse (Performance category) before and after; target
  LCP < 2.5s, CLS < 0.1 and TBT < 200ms.
- [ ] Re-check with PageSpeed Insights / web.dev/measure after each
  change and watch for regressions.
