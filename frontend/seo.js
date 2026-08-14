/*!
 * MyZubsterGateway - SEO meta injector
 * ====================================
 * Drop-in, framework-agnostic script that keeps the SEO-critical metadata of
 * every page in sync with the current route:
 *
 *   - <title> and meta description
 *   - canonical URL
 *   - Open Graph (og:*) tags
 *   - Twitter Card (twitter:*) tags
 *   - JSON-LD Organization structured data (schema.org)
 *
 * Usage (include once, before the closing </head> of every page):
 *   <script src="/frontend/seo.js" defer></script>
 *
 * The script is idempotent, safe to load after the DOM is ready, and reacts
 * to client-side navigation (history API and <head> mutations) thanks to a
 * MutationObserver, so it works on single-page applications too.
 */
(function (window, document) {
  'use strict';

  var BASE_URL = 'https://www.myzubster.com';
  var SITE_NAME = 'MyZubster Gateway';
  var SITE_TAGLINE = 'Blockchain, AI, IoT and Nature Tokenization gateway';
  var DEFAULT_DESCRIPTION =
    'MyZubster Gateway is the open-source gateway that connects blockchain, ' +
    'artificial intelligence, IoT devices and nature tokenization into a ' +
    'single interoperable platform.';
  var DEFAULT_IMAGE = BASE_URL + '/assets/og-image.png';
  var TWITTER_SITE = '@myzubster';
  var LOGO_URL = BASE_URL + '/assets/logo.png';

  // Per-route SEO configuration. Keys are matched against the current
  // pathname (trailing slashes are normalised). The '*' entry is the fallback.
  var ROUTES = {
    '/': {
      title: 'MyZubster Gateway - ' + SITE_TAGLINE,
      description: DEFAULT_DESCRIPTION
    },
    '/bounty': {
      title: 'Bounty Program - MyZubster Gateway',
      description:
        'Explore and claim open bounties across blockchain, AI, IoT and ' +
        'nature tokenization. Contribute to the MyZubster ecosystem and get rewarded.'
    },
    '/garden': {
      title: 'Urban Garden Dashboard - MyZubster Gateway',
      description:
        'Monitor and manage tokenized urban gardens: sensors, irrigation and ' +
        'growth data on the MyZubster Gateway.'
    },
    '/hospital': {
      title: 'Hospital Dashboard - MyZubster Gateway',
      description:
        'Real-time hospital operations dashboard for the MyZubster Gateway ' +
        'ecosystem: devices, telemetry and interoperability.'
    },
    '/transactions': {
      title: 'Transaction History - MyZubster Gateway',
      description:
        'Browse and audit the transaction history of the MyZubster Gateway ' +
        'blockchain network.'
    },
    '/api-docs': {
      title: 'API Documentation - MyZubster Gateway',
      description:
        'Developer documentation for the MyZubster Gateway REST and WebSocket ' +
        'APIs. Integrate blockchain, AI and IoT services.'
    },
    '*': {
      title: SITE_NAME + ' - ' + SITE_TAGLINE,
      description: DEFAULT_DESCRIPTION
    }
  };

  function currentPath() {
    var path = window.location.pathname;
    if (path.length > 1) {
      path = path.replace(/\/+$/, '');
    }
    return path || '/';
  }

  function routeConfig() {
    var path = currentPath();
    return ROUTES[path] || ROUTES['*'];
  }

  function canonicalUrl() {
    return BASE_URL + currentPath() + window.location.search;
  }

  // Create or update a <meta> element looked up by name or property.
  function upsertMeta(attribute, key, content) {
    var tag = document.querySelector(
      'meta[' + attribute + '="' + key + '"]'
    );
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(attribute, key);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
    return tag;
  }

  // Create or update a <link> element looked up by rel.
  function upsertLink(rel, href, extra) {
    var tag = document.querySelector('link[rel="' + rel + '"]');
    if (!tag) {
      tag = document.createElement('link');
      tag.setAttribute('rel', rel);
      document.head.appendChild(tag);
    }
    tag.setAttribute('href', href);
    if (extra) {
      Object.keys(extra).forEach(function (k) {
        tag.setAttribute(k, extra[k]);
      });
    }
    return tag;
  }

  // Create or update a JSON-LD block identified by its @id.
  function upsertJsonLd(id, data) {
    var tag = document.querySelector(
      'script[type="application/ld+json"][data-seo-id="' + id + '"]'
    );
    if (!tag) {
      tag = document.createElement('script');
      tag.setAttribute('type', 'application/ld+json');
      tag.setAttribute('data-seo-id', id);
      document.head.appendChild(tag);
    }
    tag.textContent = JSON.stringify(data);
    return tag;
  }

  function setTitle(text) {
    document.title = text;
    var title = document.querySelector('title');
    if (!title) {
      title = document.createElement('title');
      document.head.appendChild(title);
    }
    title.textContent = text;
    return title;
  }

  function applyMeta() {
    var cfg = routeConfig();
    var url = canonicalUrl();

    setTitle(cfg.title);
    upsertMeta('name', 'description', cfg.description);

    // Canonical
    upsertLink('canonical', url);

    // Open Graph
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:title', cfg.title);
    upsertMeta('property', 'og:description', cfg.description);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', DEFAULT_IMAGE);

    // Twitter Card
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:site', TWITTER_SITE);
    upsertMeta('name', 'twitter:title', cfg.title);
    upsertMeta('name', 'twitter:description', cfg.description);
    upsertMeta('name', 'twitter:image', DEFAULT_IMAGE);

    // JSON-LD Organization schema
    upsertJsonLd('organization', {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': BASE_URL + '/#organization',
      name: SITE_NAME,
      url: BASE_URL,
      logo: LOGO_URL,
      description: DEFAULT_DESCRIPTION,
      sameAs: [
        'https://github.com/MyZubster-Ecosystem/MyZubsterGateway'
      ]
    });

    // JSON-LD WebSite schema
    upsertJsonLd('website', {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': BASE_URL + '/#website',
      name: SITE_NAME,
      url: BASE_URL,
      publisher: {
        '@id': BASE_URL + '/#organization'
      }
    });
  }

  // Re-apply whenever the <head> mutates (e.g. a router re-renders tags).
  var scheduled = false;
  function scheduleApply() {
    if (scheduled) {
      return;
    }
    scheduled = true;
    window.requestAnimationFrame(function () {
      scheduled = false;
      applyMeta();
    });
  }

  function install() {
    if (!document.head) {
      return;
    }
    applyMeta();

    var observer = new window.MutationObserver(scheduleApply);
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true
    });

    // Keep metadata in sync on SPA navigation.
    window.addEventListener('popstate', scheduleApply);
    var originalPushState = window.history.pushState;
    var originalReplaceState = window.history.replaceState;
    window.history.pushState = function () {
      var result = originalPushState.apply(window.history, arguments);
      scheduleApply();
      return result;
    };
    window.history.replaceState = function () {
      var result = originalReplaceState.apply(window.history, arguments);
      scheduleApply();
      return result;
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }
})(window, document);
