/**
 * @fileoverview EcoLens application module: debug-panel.test.js
 * Follows strict Google JavaScript Style Guide.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { renderDebugPanel, initDebugShortcut } from './debug-panel.js';
import { Store } from '../state.js';

describe('Debug Panel Component', () => {
  beforeEach(() => {
    Store.reset();
    document.body.innerHTML = '';
  });

  it('renders debug panel but hidden by default', () => {
    const panel = renderDebugPanel();
    document.body.appendChild(panel);

    expect(panel.classList.contains('debug-panel--visible')).toBe(false);
  });

  it('shows panel when initDebugShortcut detects Ctrl+Shift+D', () => {
    const panel = renderDebugPanel();
    document.body.appendChild(panel);

    initDebugShortcut();

    const event = new window.KeyboardEvent('keydown', {
      key: 'D',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
    });

    document.dispatchEvent(event);

    expect(
      document
        .getElementById('debug-panel')
        .classList.contains('debug-panel--visible')
    ).toBe(true);
  });

  it('fills random data when fill button is clicked', () => {
    const panel = renderDebugPanel();
    document.body.appendChild(panel);

    const fillBtn = panel.querySelector('.btn--primary');
    fillBtn.click();

    const state = Store.getState();
    expect(state.inputs.travel.commuteDistance).toBeGreaterThan(0);
    expect(['gas', 'hybrid', 'ev', 'none']).toContain(
      state.inputs.travel.carType
    );
  });
});
