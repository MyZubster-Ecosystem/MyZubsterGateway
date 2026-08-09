// Theme Manager - Closes #875
(function() {
  'use strict';

  const THEME_KEY = 'myzubster-theme';
  const DARK = 'dark';
  const LIGHT = 'light';

  function getSystemPreference() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK : LIGHT;
  }

  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (e) {
      return null;
    }
  }

  function setStoredTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    updateToggleIcon(theme);
  }

  function updateToggleIcon(theme) {
    const toggle = document.querySelector('.theme-toggle');
    if (!toggle) return;
    toggle.setAttribute('aria-label', theme === DARK ? 'Switch to light mode' : 'Switch to dark mode');
    toggle.innerHTML = theme === DARK ? '☼' : '☽'; // sun / moon
  }

  function createToggle() {
    const existing = document.querySelector('.theme-toggle');
    if (existing) return existing;

    const button = document.createElement('button');
    button.className = 'theme-toggle';
    button.setAttribute('aria-label', 'Toggle theme');
    button.setAttribute('title', 'Toggle dark/light mode');
    button.setAttribute('type', 'button');
    
    button.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === DARK ? LIGHT : DARK;
      applyTheme(next);
      setStoredTheme(next);
    });

    document.body.appendChild(button);
    return button;
  }

  // Initialize
  function init() {
    const stored = getStoredTheme();
    const theme = stored || getSystemPreference();
    applyTheme(theme);
    createToggle();
    updateToggleIcon(theme);

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!getStoredTheme()) {
        applyTheme(e.matches ? DARK : LIGHT);
      }
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
