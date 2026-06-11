/**
 * @fileoverview EcoLens application module: router.js
 * Follows strict Google JavaScript Style Guide.
 */
/**
 * EcoLens — Hash-Based SPA Router
 * Maps URL hash fragments to application views and keeps
 * the navigation UI in sync with the current route.
 */

import { Store } from './state.js';

export const VIEWS = Object.freeze({
  HOME: 'home',
  CLIMATE101: 'climate101',
  CALCULATOR: 'calculator',
  RESULTS: 'results',
});

export const ROUTES = Object.freeze({
  '': VIEWS.HOME,
  climate101: VIEWS.CLIMATE101,
  calculator: VIEWS.CALCULATOR,
  results: VIEWS.RESULTS,
});

/**
 * Initialise the router. Listens for hashchange events
 * and performs an initial route resolution.
 */
export function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute(); // resolve the initial route on page load
}

/**
 * Read the current hash, map it to a view name,
 * update the Store and synchronise the navbar links.
 */
function handleRoute() {
  const hash = window.location.hash.slice(1) || '';
  const view = ROUTES[hash] || VIEWS.HOME;
  Store.setState({ currentView: view });

  // Update nav active states and ARIA attributes
  document.querySelectorAll('.nav-link').forEach((link) => {
    const linkHash = link.getAttribute('href') || '';
    const isActive = linkHash === `#${hash}`;
    link.classList.toggle('active', isActive);
    link.setAttribute('aria-current', isActive ? 'page' : 'false');
  });

  // Scroll to top on route change
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Programmatically navigate to a hash route.
 * @param {string} hash — the route hash (e.g. 'calculator')
 */
export function navigate(hash) {
  window.location.hash = hash;
}
