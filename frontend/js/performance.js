/**
 * MyZubster Gateway - client-side performance optimizations (MYZ bounty #208)
 * ------------------------------------------------------------
 * Drop-in, dependency-free script. Load it with `defer` so it never
 * blocks first paint:
 *
 *   <script src="/js/performance.js" defer></script>
 *
 * What it does:
 *   1. Lazy-loads images via IntersectionObserver: images using
 *      `data-src` (and optional `data-srcset`) are only fetched when
 *      they approach the viewport, and get `loading="lazy"` +
 *      `decoding="async"` hints.
 *   2. Defers non-critical work until the browser is idle via
 *      `requestIdleCallback` (with a `setTimeout` fallback).
 *   3. Provides passive event-listener registration so scroll/touch/
 *      wheel handlers never block the main thread.
 */
(function () {
  'use strict';

  var PASSIVE = false;
  try {
    var opts = Object.defineProperty({}, 'passive', {
      get: function () {
        PASSIVE = true;
        return true;
      }
    });
    window.addEventListener('test-passive', null, opts);
    window.removeEventListener('test-passive', null, opts);
  } catch (e) {
    PASSIVE = false;
  }

  function scheduleIdle(fn, timeout) {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(fn, { timeout: timeout || 2000 });
    } else {
      window.setTimeout(fn, 200);
    }
  }

  function onPassive(target, type, handler) {
    target.addEventListener(type, handler, PASSIVE ? { passive: true } : false);
  }

  /* 1. Lazy image loading ------------------------------------------- */
  function loadImage(img) {
    var src = img.getAttribute('data-src');
    if (!src) {
      return;
    }
    var srcset = img.getAttribute('data-srcset');
    if (srcset) {
      img.srcset = srcset;
      img.removeAttribute('data-srcset');
    }
    img.src = src;
    img.removeAttribute('data-src');
  }

  function lazyLoadImages() {
    var images = Array.prototype.slice.call(
      document.querySelectorAll('img[data-src]')
    );
    if (!images.length) {
      return;
    }

    // Progressive enhancement: hint the browser up front so offscreen
    // images are deferred natively even before the swap happens.
    images.forEach(function (img) {
      img.loading = img.loading || 'lazy';
      if (img.decoding !== 'sync') {
        img.decoding = 'async';
      }
    });

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) {
              return;
            }
            loadImage(entry.target);
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: '200px 0px', threshold: 0.01 }
      );
      images.forEach(function (img) {
        observer.observe(img);
      });
    } else {
      // Fallback: load everything once the page is idle.
      scheduleIdle(function () {
        images.forEach(loadImage);
      });
    }
  }

  /* Boot ------------------------------------------------------------ */
  function boot() {
    lazyLoadImages();

    // Defer heavy, non-critical setup until the browser is idle so it
    // never competes with first paint or user interaction.
    scheduleIdle(function () {
      // Example: promote deferred font preloads once the page is idle.
      var links = Array.prototype.slice.call(
        document.querySelectorAll('link[rel="preload"][data-defer]')
      );
      links.forEach(function (link) {
        link.removeAttribute('data-defer');
      });
    });
  }

  // Tiny public API so other scripts can hook idle work and passive
  // listeners without re-implementing the feature detection above.
  window.MyZubsterPerformance = {
    scheduleIdle: scheduleIdle,
    onPassive: onPassive
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { passive: true });
  } else {
    boot();
  }
})();
