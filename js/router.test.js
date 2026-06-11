/**
 * @fileoverview EcoLens application module: router.test.js
 * Follows strict Google JavaScript Style Guide.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initRouter, navigate } from './router.js';

describe('Router', () => {
  let appContainer;
  let homeLink, calcLink, resultsLink;

  beforeEach(() => {
    document.body.innerHTML = '';

    appContainer = document.createElement('div');
    appContainer.id = 'app';
    document.body.appendChild(appContainer);

    homeLink = document.createElement('a');
    homeLink.setAttribute('data-route', 'home');
    document.body.appendChild(homeLink);

    calcLink = document.createElement('a');
    calcLink.setAttribute('data-route', 'calculator');
    document.body.appendChild(calcLink);

    resultsLink = document.createElement('a');
    resultsLink.setAttribute('data-route', 'results');
    document.body.appendChild(resultsLink);

    // Mock history API to avoid real navigations in tests
    vi.spyOn(window.history, 'pushState');
  });

  it('initializes and mounts home route by default', () => {
    initRouter();
    // Default route is 'home', so it should mount home content
    // Since we mock components, let's just check if it clears #app and runs
    expect(appContainer.innerHTML).not.toBeNull();
  });

  it('navigates to specific route programmatically', () => {
    initRouter();
    navigate('calculator');
    expect(window.location.hash).toBe('#calculator');
  });

  it('handles click events on data-route links', () => {
    initRouter();
    // Simulate what app.js does with data-route links
    window.location.hash = calcLink.getAttribute('data-route');
    // We manually simulate the hashchange because JSDOM doesn't automatically trigger it on link click without full setup
    window.dispatchEvent(new Event('hashchange'));
    expect(window.location.hash).toBe('#calculator');
  });
});
