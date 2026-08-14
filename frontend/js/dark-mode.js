/* ============================================================================
   MyZubsterGateway - Dark Mode toggle + persistence (issue #200)
   ----------------------------------------------------------------------------
   Drop-in script. Add alongside the theme stylesheet:

     <link rel="stylesheet" href="frontend/css/dark-mode.css">
     <script src="frontend/js/dark-mode.js" defer></script>

   Behaviour
   ----------
   * On first visit the OS preference is read via matchMedia and, if dark,
     data-theme="dark" is applied to <html>.
   * A floating toggle button (bottom-right) is injected automatically.
   * The chosen theme is applied as data-theme="dark" on <html> (removed for
     light) and persisted in localStorage under the "myz-theme" key.
   * A MutationObserver re-injects the button if the page replaces <body>
     (single-page-app navigations), so the script stays drop-in.
   ========================================================================== */

(function () {
  'use strict';

  var STORAGE_KEY = 'myz-theme';

  /* Unicode escapes keep this file pure ASCII:
     \u263E = last-quarter moon, \u2600 = sun. */
  var GLYPH_DARK = '\u263E';
  var GLYPH_LIGHT = '\u2600';

  function readStoredTheme() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch (err) {
      return null;
    }
  }

  function writeStoredTheme(theme) {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch (err) {
      /* storage unavailable (private mode) - fall back to session only */
    }
  }

  function prefersDark() {
    return !!(window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  function resolveInitialTheme() {
    var stored = readStoredTheme();
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
    return prefersDark() ? 'dark' : 'light';
  }

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark'
      ? 'dark'
      : 'light';
  }

  function buttonGlyph(theme) {
    return theme === 'dark' ? GLYPH_DARK : GLYPH_LIGHT;
  }

  function syncButtons(theme) {
    var buttons = document.querySelectorAll('.mz-theme-toggle');
    var isDark = theme === 'dark';
    for (var i = 0; i < buttons.length; i += 1) {
      var btn = buttons[i];
      btn.textContent = buttonGlyph(theme);
      btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      btn.setAttribute(
        'aria-label',
        isDark ? 'Switch to light mode' : 'Switch to dark mode'
      );
      btn.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    }
  }

  function applyTheme(theme) {
    var root = document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
    syncButtons(theme);
  }

  function setTheme(theme) {
    writeStoredTheme(theme);
    applyTheme(theme);
  }

  function toggleTheme() {
    setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  }

  function createToggleButton() {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mz-theme-toggle';
    btn.setAttribute('aria-label', 'Toggle dark mode');
    btn.setAttribute('title', 'Toggle dark mode');
    btn.addEventListener('click', toggleTheme);
    return btn;
  }

  function injectToggle() {
    if (!document.body || document.querySelector('.mz-theme-toggle')) {
      return;
    }
    document.body.appendChild(createToggleButton());
    syncButtons(currentTheme());
  }

  function watchBody() {
    if (typeof MutationObserver === 'undefined') {
      return;
    }
    var observer = new MutationObserver(function () {
      injectToggle();
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  function init() {
    applyTheme(resolveInitialTheme());

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectToggle);
    } else {
      injectToggle();
    }

    watchBody();
  }

  init();
})();
