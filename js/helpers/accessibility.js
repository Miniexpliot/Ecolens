/**
 * @fileoverview Small utilities to make DOM elements keyboard‑focusable and
 * trigger a callback when the user activates them via Enter or Space.
 */

/**
 * Make an element focusable and bind a keyboard handler.
 * @param {HTMLElement} el - Element to enhance.
 * @param {Function} onActivate - Callback invoked on Enter/Space.
 */
export function makeFocusable(el, onActivate) {
  el.setAttribute('tabindex', '0');
  // Visual focus style – rely on CSS :focus-visible elsewhere.
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onActivate();
    }
  });
}
