// Accessibility Enhancements - Closes #876
(function() {
  'use strict';

  // Inject skip-to-main link
  function injectSkipLink() {
    const main = document.querySelector('main, [role="main"], #main-content');
    if (!main) return;

    const existing = document.querySelector('.skip-to-main');
    if (existing) return;

    const link = document.createElement('a');
    link.className = 'skip-to-main sr-only';
    link.href = '#' + (main.id || 'main-content');
    link.textContent = 'Skip to main content';

    if (!main.id) main.id = 'main-content';

    link.addEventListener('click', (e) => {
      e.preventDefault();
      main.setAttribute('tabindex', '-1');
      main.focus({ preventScroll: false });
    });

    document.body.insertBefore(link, document.body.firstChild);
  }

  // Add ARIA labels to interactive elements missing them
  function enhanceAriaLabels() {
    // Links with icon-only content
    document.querySelectorAll('a[href]:empty, a[href]:has(svg:only-child)').forEach(el => {
      if (!el.getAttribute('aria-label')) {
        const text = el.textContent.trim() || el.getAttribute('title') || 'Link';
        el.setAttribute('aria-label', text);
      }
    });

    // Buttons without labels
    document.querySelectorAll('button:empty, button:has(svg:only-child)').forEach(el => {
      if (!el.getAttribute('aria-label')) {
        el.setAttribute('aria-label', el.getAttribute('title') || 'Button');
      }
    });
  }

  // Create ARIA live region for dynamic content
  function createLiveRegion() {
    const existing = document.getElementById('a11y-announcements');
    if (existing) return;

    const region = document.createElement('div');
    region.id = 'a11y-announcements';
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    document.body.appendChild(region);

    // Expose globally
    window.announceToScreenReader = function(message) {
      region.textContent = '';
      setTimeout(() => { region.textContent = message; }, 50);
    };
  }

  // Keyboard trap prevention for modals
  function setupFocusTraps() {
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;

      const modal = document.querySelector('[role="dialog"][open], .modal:not([hidden])');
      if (modal) {
        const closeBtn = modal.querySelector('[aria-label*="close" i], [aria-label*="Close" i], .close, .modal-close, [data-close]');
        if (closeBtn) closeBtn.click();
        e.preventDefault();
      }
    });
  }

  // Observe DOM for new content
  function observeDOM() {
    const observer = new MutationObserver(() => {
      enhanceAriaLabels();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Initial pass
    enhanceAriaLabels();
  }

  // Initialize on DOM ready
  function init() {
    injectSkipLink();
    createLiveRegion();
    setupFocusTraps();
    observeDOM();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
