/**
 * @fileoverview EcoLens application module: components.test.js
 * Follows strict Google JavaScript Style Guide.
 */
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { Store } from './state.js';
import { renderNavbar } from './components/navbar.js';
import { renderHero } from './components/hero.js';
import { renderCalculator } from './components/calculator/index.js';
import { renderChatWidget } from './components/chat-widget.js';
import { renderReport } from './components/report.js';
import { renderActionPlan } from './components/action-plan.js';
import { renderClimate101 } from './components/climate101.js';
import { renderDebugPanel } from './components/debug-panel.js';
import { updateProjectedScore } from './components/results-updater.js';
import {
  initScrollObserver,
  observeScrollElements,
} from './components/scroll-observer.js';

// Mock IntersectionObserver globally for JSDOM environment
globalThis.IntersectionObserver = vi.fn().mockImplementation(
  class {
    constructor(callback) {
      this.callback = callback;
    }
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
);

// Mock THREE.js globally for canvas 3D loader
globalThis.THREE = {
  WebGLRenderer: vi.fn().mockImplementation(() => ({
    setSize: vi.fn(),
    domElement: document.createElement('canvas'),
    render: vi.fn(),
  })),
  Scene: vi.fn().mockImplementation(() => ({
    add: vi.fn(),
  })),
  PerspectiveCamera: vi.fn(),
  BufferGeometry: vi.fn(),
  PointsMaterial: vi.fn(),
  Points: vi.fn(),
  Vector3: vi.fn(),
};

describe('UI Component Suite', () => {
  beforeEach(() => {
    Store.reset();
    document.body.innerHTML = '';
  });

  test('renderNavbar renders links and handles SPA highlights', () => {
    const nav = renderNavbar();
    expect(nav).not.toBeNull();
    expect(nav.querySelector('.navbar__logo').textContent).toContain('EcoLens');
    expect(nav.querySelectorAll('.nav-link').length).toBe(4);
  });

  test('renderHero renders main call-to-action sections', () => {
    const hero = renderHero();
    expect(hero).not.toBeNull();
    expect(hero.getAttribute('aria-label')).toContain('EcoLens');
    expect(hero.querySelector('h1').textContent).toContain('Impact');
    expect(hero.querySelector('a[href="#calculator"]')).not.toBeNull();
  });

  test('renderClimate101 renders educational sections and averages', () => {
    const content = renderClimate101();
    expect(content).not.toBeNull();
    expect(content.querySelector('h2').textContent).toContain('Climate 101');
    expect(content.querySelector('#country-grid')).not.toBeNull();
  });

  test('renderCalculator boots up multi-step forms on step 1', () => {
    const calc = renderCalculator();
    expect(calc).not.toBeNull();
    expect(calc.querySelector('h2').textContent).toContain(
      'Calculate Your Footprint'
    );

    // Step indicator shows 4 items
    const steps = calc.querySelectorAll('.step-indicator__step');
    expect(steps.length).toBe(4);
    expect(steps[0].className).toContain('active');
  });

  test('renderChatWidget expands, collapses, and transitions keyboard focus', () => {
    const chat = renderChatWidget();
    document.body.appendChild(chat);

    const fab = chat.querySelector('.chat-widget__fab');
    const panel = chat.querySelector('.chat-widget__panel');

    expect(chat.classList.contains('collapsed')).toBe(true);

    // Expand chat widget
    fab.click();
    expect(chat.classList.contains('collapsed')).toBe(false);

    // Escape key closes chat
    const escapeEvent = new window.KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
    });
    panel.dispatchEvent(escapeEvent);
    expect(chat.classList.contains('collapsed')).toBe(true);
  });

  test('renderReport returns dashboard content when report is generated', () => {
    // Before generating report, Store emissions are empty
    Store.generateReport();
    const report = renderReport();
    expect(report).not.toBeNull();
    expect(report.querySelector('.report-card-title').textContent).toContain(
      'Emissions Breakdown'
    );
  });

  test('renderActionPlan outputs correct recommendation checkboxes', () => {
    Store.setState({ inputs: { travel: { carType: 'gas' } } });
    Store.generateReport();

    const plan = renderActionPlan();
    expect(plan).not.toBeNull();
    expect(plan.querySelector('h2').textContent).toContain('Action Plan');
    expect(plan.querySelectorAll('.action-item').length).toBeGreaterThan(0);
  });

  test('renderDebugPanel generates unit testing debugger panel', () => {
    const debug = renderDebugPanel();
    expect(debug).not.toBeNull();
    expect(debug.querySelector('.debug-panel__title').textContent).toContain(
      'EcoLens Debug'
    );
  });

  test('results-updater updates score nodes on toggling actions', () => {
    const parent = document.createElement('div');
    parent.innerHTML = `
      <div data-current>0.00</div>
      <div data-savings>0.00</div>
      <div data-projected data-class="projected-score__value">0.00</div>
    `;

    const state = {
      emissions: { total: 5.6 },
      totalSavings: 1.2,
      projectedScore: 4.4,
    };

    updateProjectedScore(state, parent);

    expect(parent.querySelector('[data-current]').textContent).toBe('5.60');
    expect(parent.querySelector('[data-savings]').textContent).toBe('1.20');
    expect(parent.querySelector('[data-projected]').textContent).toBe('4.40');
  });

  test('scroll-observer sets up IntersectionObservers', () => {
    initScrollObserver();
    const wrapper = document.createElement('div');
    const el = document.createElement('div');
    el.className = 'animate-on-scroll';
    wrapper.appendChild(el);

    observeScrollElements(wrapper);
    expect(globalThis.IntersectionObserver).toHaveBeenCalled();
  });
});
