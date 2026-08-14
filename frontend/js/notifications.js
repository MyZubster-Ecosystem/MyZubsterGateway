/**
 * MyZubsterGateway - In-app Notification System (issue #207)
 * ---------------------------------------------------------
 * Self-contained, dependency-free notification bell + panel + toasts.
 *
 * It injects its UI straight into <body> and uses a MutationObserver to
 * re-attach itself after SPA re-renders, so it keeps working regardless of
 * which framework/page renders the app.
 *
 * Public API (also mirrored as window.showNotification):
 *   window.MyZubsterNotifications.showNotification({
 *     title:    string,
 *     message:  string,
 *     type:     'info' | 'success' | 'warning' | 'error',
 *     persistent: boolean  (default true -> kept in the feed),
 *     toast:    boolean     (default true -> also shown as a toast)
 *   })
 *   window.MyZubsterNotifications.subscribe(fn)   -> unsubscribe()
 *   window.MyZubsterNotifications.markAllRead()
 *   window.MyZubsterNotifications.getFeed()
 *   window.MyZubsterNotifications.getUnreadCount()
 *
 * Read state is persisted in localStorage. A small demo subscription seeds a
 * few notifications on first run and reacts to connectivity changes.
 *
 * Include it on any page with:
 *   <link rel="stylesheet" href="/frontend/css/notifications.css">
 *   <script src="/frontend/js/notifications.js"></script>
 */
(function (global) {
  'use strict';

  var FEED_KEY = 'myzubster.notifications.feed.v1';
  var READ_KEY = 'myzubster.notifications.read.v1';

  var state = {
    feed: [],       // persistent notifications (newest first)
    read: {},       // id -> true
    unread: 0,
    initialized: false
  };

  /* ------------------------------------------------------------------ *
   * Small DOM / utility helpers
   * ------------------------------------------------------------------ */

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function uid() {
    return 'n-' + Date.now().toString(36) + '-' +
      Math.random().toString(36).slice(2, 8);
  }

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function timeAgo(ts) {
    var diff = Date.now() - ts;
    if (diff < 0) diff = 0;
    var sec = Math.floor(diff / 1000);
    if (sec < 60) return 'just now';
    var min = Math.floor(sec / 60);
    if (min < 60) return min + 'm ago';
    var hr = Math.floor(min / 60);
    if (hr < 24) return hr + 'h ago';
    var day = Math.floor(hr / 24);
    if (day < 7) return day + 'd ago';
    var d = new Date(ts);
    return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear();
  }

  function safeStorageGet(key) {
    try { return JSON.parse(window.localStorage.getItem(key)); } catch (e) { return null; }
  }

  function safeStorageSet(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* quota / private mode */ }
  }

  /* ------------------------------------------------------------------ *
   * State persistence
   * ------------------------------------------------------------------ */

  function loadState() {
    var feed = safeStorageGet(FEED_KEY);
    if (Array.isArray(feed)) state.feed = feed;
    var read = safeStorageGet(READ_KEY);
    if (read && typeof read === 'object') state.read = read;
    recalcUnread();
  }

  function persistFeed() {
    safeStorageSet(FEED_KEY, state.feed.slice(0, 100)); // cap the feed size
  }

  function persistRead() { safeStorageSet(READ_KEY, state.read); }

  function recalcUnread() {
    state.unread = state.feed.reduce(function (acc, n) {
      return acc + (state.read[n.id] ? 0 : 1);
    }, 0);
  }

  /* ------------------------------------------------------------------ *
   * Icon (Material "notifications" bell) - pure ASCII path
   * ------------------------------------------------------------------ */

  function bellSvg() {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '22');
    svg.setAttribute('height', '22');
    svg.setAttribute('fill', 'currentColor');
    svg.setAttribute('aria-hidden', 'true');
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d',
      'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-' +
      '.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.93 6 11v5l-2 2v1h16v-1l-2-2z');
    svg.appendChild(path);
    return svg;
  }

  /* ------------------------------------------------------------------ *
   * UI construction
   * ------------------------------------------------------------------ */

  var bell, badge, panel, panelList, panelEmpty, toastRoot, observer, renderTimer;

  function ensureUI() {
    if (bell && document.body.contains(bell)) {
      render();
      return;
    }
    if (!document.body) return;

    removeDetached();

    // Bell (top-right)
    bell = el('button', 'mzn-bell');
    bell.setAttribute('type', 'button');
    bell.setAttribute('aria-label', 'Notifications');
    bell.setAttribute('aria-haspopup', 'true');
    bell.appendChild(bellSvg());
    badge = el('span', 'mzn-bell-badge');
    badge.setAttribute('hidden', '');
    bell.appendChild(badge);
    bell.addEventListener('click', function (e) {
      e.stopPropagation();
      togglePanel();
    });

    // Panel
    panel = el('div', 'mzn-panel');
    panel.setAttribute('hidden', '');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Notifications panel');

    var head = el('div', 'mzn-panel-head');
    head.appendChild(el('span', 'mzn-panel-title', 'Notifications'));
    var markAll = el('button', 'mzn-panel-action', 'Mark all as read');
    markAll.setAttribute('type', 'button');
    markAll.addEventListener('click', function () { markAllRead(); });
    head.appendChild(markAll);

    panelList = el('ul', 'mzn-list');
    panelEmpty = el('div', 'mzn-empty', 'No notifications yet');

    panel.appendChild(head);
    panel.appendChild(panelList);
    panel.appendChild(panelEmpty);

    // Toasts root (bottom-right)
    toastRoot = el('div', 'mzn-toasts');
    toastRoot.setAttribute('aria-live', 'polite');

    document.body.appendChild(bell);
    document.body.appendChild(panel);
    document.body.appendChild(toastRoot);

    // Close panel on outside click / Escape
    document.addEventListener('click', function (e) {
      if (panel && !panel.hidden && bell && !bell.contains(e.target) && !panel.contains(e.target)) {
        closePanel();
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel && !panel.hidden) closePanel();
    });

    render();
  }

  function removeDetached() {
    [bell, panel, toastRoot].forEach(function (node) {
      if (node && node.parentNode) node.parentNode.removeChild(node);
    });
    bell = badge = panel = panelList = panelEmpty = toastRoot = null;
  }

  function togglePanel() {
    if (panel.hidden) {
      panel.hidden = false;
      markAllReadOnOpen();
    } else {
      closePanel();
    }
  }

  function closePanel() {
    if (panel) panel.hidden = true;
  }

  // Opening the panel marks everything as read (common UX pattern).
  function markAllReadOnOpen() {
    var changed = false;
    state.feed.forEach(function (n) {
      if (!state.read[n.id]) { state.read[n.id] = true; changed = true; }
    });
    if (changed) { persistRead(); recalcUnread(); render(); }
  }

  function markAllRead() {
    var changed = false;
    state.feed.forEach(function (n) {
      if (!state.read[n.id]) { state.read[n.id] = true; changed = true; }
    });
    if (changed) { persistRead(); recalcUnread(); render(); }
  }

  function dismissOne(id) {
    state.feed = state.feed.filter(function (n) { return n.id !== id; });
    delete state.read[id];
    persistFeed();
    recalcUnread();
    render();
  }

  function clearAll() {
    state.feed = [];
    state.read = {};
    persistFeed();
    persistRead();
    recalcUnread();
    render();
  }

  /* ------------------------------------------------------------------ *
   * Rendering
   * ------------------------------------------------------------------ */

  function render() {
    if (!bell) return;
    if (state.unread > 0) {
      badge.textContent = state.unread > 99 ? '99+' : String(state.unread);
      badge.removeAttribute('hidden');
      bell.classList.add('mzn-bell--unread');
    } else {
      badge.setAttribute('hidden', '');
      bell.classList.remove('mzn-bell--unread');
    }

    if (panelList) {
      panelList.textContent = '';
      if (state.feed.length === 0) {
        panelEmpty.style.display = 'block';
        panelList.style.display = 'none';
      } else {
        panelEmpty.style.display = 'none';
        panelList.style.display = '';
        state.feed.forEach(function (n) { panelList.appendChild(buildListItem(n)); });
      }
    }
  }

  function buildListItem(n) {
    var item = el('li', 'mzn-item' +
      (state.read[n.id] ? '' : ' mzn-item--unread') +
      ' mzn-item--' + (n.type || 'info'));
    item.setAttribute('data-id', n.id);

    var dot = el('span', 'mzn-item-dot');
    var body = el('div', 'mzn-item-body');
    body.appendChild(el('div', 'mzn-item-title', n.title || 'Notification'));
    if (n.message) body.appendChild(el('div', 'mzn-item-msg', n.message));
    body.appendChild(el('div', 'mzn-item-time', timeAgo(n.createdAt || Date.now())));

    var close = el('button', 'mzn-item-close');
    close.setAttribute('type', 'button');
    close.setAttribute('aria-label', 'Dismiss');
    close.innerHTML = '&times;';
    close.addEventListener('click', function (e) {
      e.stopPropagation();
      dismissOne(n.id);
    });

    item.appendChild(dot);
    item.appendChild(body);
    item.appendChild(close);

    item.addEventListener('click', function () {
      if (!state.read[n.id]) {
        state.read[n.id] = true;
        persistRead();
        recalcUnread();
        render();
      }
    });

    return item;
  }

  function buildToast(n) {
    var toast = el('div', 'mzn-toast mzn-toast--' + (n.type || 'info'));
    toast.setAttribute('role', 'status');

    var body = el('div', 'mzn-toast-body');
    body.appendChild(el('div', 'mzn-toast-title', n.title || 'Notification'));
    if (n.message) body.appendChild(el('div', 'mzn-toast-msg', n.message));

    var close = el('button', 'mzn-toast-close');
    close.setAttribute('type', 'button');
    close.setAttribute('aria-label', 'Dismiss');
    close.innerHTML = '&times;';

    var remove = function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    };
    close.addEventListener('click', remove);
    toast.addEventListener('click', remove);

    toast.appendChild(body);
    toast.appendChild(close);

    if (toastRoot) toastRoot.appendChild(toast);

    var ttl = typeof n.duration === 'number' ? n.duration : 5000;
    if (ttl > 0) setTimeout(remove, ttl);

    return toast;
  }

  /* ------------------------------------------------------------------ *
   * Pub/sub + demo subscription
   * ------------------------------------------------------------------ */

  var listeners = [];

  function emit(n) {
    listeners.forEach(function (fn) {
      try { fn(n); } catch (e) { /* never let a listener break the system */ }
    });
    try {
      global.dispatchEvent(new CustomEvent('myzubster:notification', { detail: n }));
    } catch (e) { /* older browsers without CustomEvent constructor */ }
  }

  function subscribe(fn) {
    if (typeof fn === 'function') listeners.push(fn);
    return function unsubscribe() {
      var i = listeners.indexOf(fn);
      if (i !== -1) listeners.splice(i, 1);
    };
  }

  // Small demo subscription: connectivity notifications (real, observable).
  function demoSubscription() {
    global.addEventListener('online', function () {
      showNotification({
        title: 'Connection restored',
        message: 'You are back online.',
        type: 'success',
        persistent: false
      });
    });
    global.addEventListener('offline', function () {
      showNotification({
        title: 'Connection lost',
        message: 'You are offline. Some features may be unavailable.',
        type: 'warning',
        persistent: false
      });
    });

    // Reflect every notification to the console (handy while integrating).
    subscribe(function (n) {
      if (global.console && console.info) {
        console.info('[MyZubster notification]', n.type, n.title, n.message || '');
      }
    });
  }

  function seedIfEmpty() {
    if (state.feed.length) return;
    showNotification({
      title: 'Welcome to MyZubster',
      message: 'In-app notifications are now active.',
      type: 'info',
      toast: false
    });
    showNotification({
      title: 'New bounty available',
      message: 'A new task was published on the Bounty page.',
      type: 'success',
      toast: false
    });
    showNotification({
      title: 'Tip of the day',
      message: 'Use showNotification() to push events from your app.',
      type: 'warning',
      toast: false
    });
  }

  /* ------------------------------------------------------------------ *
   * Core API
   * ------------------------------------------------------------------ */

  function showNotification(opts) {
    opts = opts || {};
    var n = {
      id: opts.id || uid(),
      title: opts.title || 'Notification',
      message: opts.message || '',
      type: ['info', 'success', 'warning', 'error'].indexOf(opts.type) !== -1 ? opts.type : 'info',
      createdAt: opts.createdAt || Date.now(),
      duration: opts.duration
    };

    var persistent = opts.persistent !== false;

    if (persistent) {
      // Upsert by id so re-sending the same event does not duplicate it.
      var existing = state.feed.filter(function (x) { return x.id === n.id; })[0];
      if (existing) {
        existing.title = n.title;
        existing.message = n.message;
        existing.type = n.type;
      } else {
        state.feed.unshift(n);
        state.feed = state.feed.slice(0, 100);
      }
      persistFeed();
      recalcUnread();
      render();
    }

    if (opts.toast !== false) {
      ensureUI();
      buildToast(n);
    }

    emit(n);
    return n.id;
  }

  /* ------------------------------------------------------------------ *
   * SPA survival: MutationObserver re-attaches the UI after re-renders
   * ------------------------------------------------------------------ */

  function startObserver() {
    if (typeof MutationObserver === 'undefined') return;
    observer = new MutationObserver(function () {
      // Throttle: re-check presence at most once per animation frame batch.
      if (renderTimer) return;
      renderTimer = setTimeout(function () {
        renderTimer = null;
        if (!bell || !document.body.contains(bell)) ensureUI();
      }, 200);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  /* ------------------------------------------------------------------ *
   * Bootstrap
   * ------------------------------------------------------------------ */

  function init() {
    if (state.initialized) return;
    state.initialized = true;
    loadState();

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        ensureUI();
        seedIfEmpty();
        startObserver();
        demoSubscription();
      });
    } else {
      ensureUI();
      seedIfEmpty();
      startObserver();
      demoSubscription();
    }
  }

  // Public surface
  var api = {
    showNotification: showNotification,
    subscribe: subscribe,
    markAllRead: markAllRead,
    dismiss: dismissOne,
    clearAll: clearAll,
    getFeed: function () { return state.feed.slice(); },
    getUnreadCount: function () { return state.unread; }
  };

  global.MyZubsterNotifications = api;
  global.showNotification = function (opts) { return showNotification(opts); };

  init();
})(typeof window !== 'undefined' ? window : this);
