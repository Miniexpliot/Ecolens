/**
 * EcoLens — Main Application Entry Point
 * Orchestrates the router, all UI components, Store subscriptions,
 * view transitions, the debug panel, and scroll-triggered animations.
 */

import { initRouter } from './router.js';
import { Store } from './state.js';
import { renderNavbar } from './components/navbar.js';
import { renderHero } from './components/hero.js';
import { renderClimate101 } from './components/climate101.js';
import { renderCalculator } from './components/calculator.js';
import { renderReport } from './components/report.js';
import { renderActionPlan } from './components/action-plan.js';
import { renderDebugPanel, initDebugShortcut } from './components/debug-panel.js';
import { init3DBackground } from './components/background-3d.js';
import { renderChatWidget } from './components/chat-widget.js';
import { updateProjectedScore, updateActionMetrics } from './components/results-updater.js';
import { initScrollObserver, observeScrollElements } from './components/scroll-observer.js';

/* ── DOM References ─────────────────────────────────────────── */
const appRoot = document.getElementById('app-root');

/* ── View Renderers Map ─────────────────────────────────────── */
const viewRenderers = {
  home: renderHome,
  climate101: renderClimate101View,
  calculator: renderCalculatorView,
  results: renderResultsView
};

/* ── Previous view for diff-checking ────────────────────────── */
let previousView = null;

/* ── View Render Functions ──────────────────────────────────── */

/**
 * Renders the Home view fragment.
 * @returns {DocumentFragment}
 */

function renderHome() {
  const fragment = document.createDocumentFragment();
  fragment.appendChild(renderHero());
  return fragment;
}

/**
 * Renders the Climate 101 educational view fragment.
 * @returns {DocumentFragment}
 */
function renderClimate101View() {
  const fragment = document.createDocumentFragment();
  fragment.appendChild(renderClimate101());
  return fragment;
}

/**
 * Renders the Calculator multi-step form view fragment.
 * @returns {DocumentFragment}
 */
function renderCalculatorView() {
  const fragment = document.createDocumentFragment();
  fragment.appendChild(renderCalculator());
  return fragment;
}

/**
 * Renders the Results dashboard view fragment.
 * Handles the fallback welcome message if no report exists.
 * @returns {DocumentFragment}
 */
function renderResultsView() {
  const state = Store.getState();
  const fragment = document.createDocumentFragment();

  // If no report generated yet, show a welcome/redirect message
  if (!state.reportGenerated) {
    const welcome = document.createElement('section');
    welcome.className = 'section container';
    welcome.innerHTML = `
      <div class="glass-card glass-card--static welcome-message" style="margin-top: 2rem;">
        <h3>No Report Yet</h3>
        <p>You haven't calculated your carbon footprint yet.<br>
           Use the calculator to get your personalized report.</p>
        <a href="#calculator" class="btn btn--primary" style="margin-top: 1rem;">Open Calculator</a>
      </div>
    `;
    fragment.appendChild(welcome);
    return fragment;
  }

  fragment.appendChild(renderReport());
  fragment.appendChild(renderActionPlan());
  return fragment;
}

/* ── Main Render Loop ───────────────────────────────────────── */

/**
 * Handles the main rendering logic for the application, transitioning
 * between views and setting up root elements.
 * 
 * @param {import('./types.js').ApplicationState} state - Current application state
 */
function renderApp(state) {
  const currentView = state.currentView || 'home';

  // Only re-render content area if the view actually changed
  if (currentView === previousView) {
    return;
  }

  const startTime = performance.now();

  // Ensure navbar is rendered once
  if (!document.querySelector('.navbar')) {
    appRoot.appendChild(renderNavbar());
  }

  // Get or create the main content wrapper
  let mainContent = document.getElementById('main-content');
  if (!mainContent) {
    mainContent = document.createElement('main');
    mainContent.id = 'main-content';
    mainContent.className = 'view-container';
    mainContent.setAttribute('role', 'main');
    appRoot.appendChild(mainContent);
  }

  // Ensure debug panel exists
  if (!document.querySelector('.debug-panel')) {
    appRoot.appendChild(renderDebugPanel());
  }

  // Ensure chat widget exists
  if (!document.querySelector('.chat-widget')) {
    appRoot.appendChild(renderChatWidget());
  }

  // View transition
  const oldView = previousView;
  previousView = currentView;

  // Perform the transition
  if (oldView !== null) {
    mainContent.classList.add('view-exit');
    // Wait for exit animation, then swap content
    const onTransitionEnd = () => {
      mainContent.classList.remove('view-exit');
      swapContent(mainContent, currentView, startTime);
    };
    // Use a timeout fallback in case animation doesn't fire
    setTimeout(onTransitionEnd, 300);
  } else {
    // First render, no exit animation needed
    swapContent(mainContent, currentView, startTime);
  }
}

/**
 * Swaps the main content with the new view and manages entry animations.
 * 
 * @param {HTMLElement} mainContent - The main view container
 * @param {string} currentView - The identifier of the new view
 * @param {number} startTime - Performance timestamp for render metrics
 */
function swapContent(mainContent, currentView, startTime) {
  // Clear existing content
  mainContent.innerHTML = '';

  // Render new view
  const renderFn = viewRenderers[currentView];
  if (renderFn) {
    const content = renderFn();
    mainContent.appendChild(content);
    mainContent.classList.add('view-enter');

    // Remove the animation class after it finishes
    setTimeout(() => {
      mainContent.classList.remove('view-enter');
    }, 500);
  }

  // Re-observe scroll animation elements
  initScrollObserver();
  observeScrollElements(mainContent);

  // Store render time for debug panel
  const renderTime = (performance.now() - startTime).toFixed(2);
  window.__ecolensRenderTime = renderTime;
}

/* ── Force Re-render (for results view live updates) ────────── */

/**
 * Subscribe callback triggered whenever the global Store changes.
 * Either re-renders the full app or applies targeted DOM updates.
 * 
 * @param {import('./types.js').ApplicationState} state - Current application state
 */
function handleStoreUpdate(state) {
  const currentView = state.currentView || 'home';

  // If we're on the results view, check for live updates
  if (currentView === 'results' && previousView === 'results') {
    // Re-render projected score and action plan live
    const projectedEl = document.querySelector('[data-projected-score]');
    const actionMetricsEl = document.querySelector('[data-action-metrics]');

    if (projectedEl) {
      updateProjectedScore(state, projectedEl);
    }
    if (actionMetricsEl) {
      updateActionMetrics(state, actionMetricsEl);
    }
    return;
  }

  // Otherwise render the full app
  renderApp(state);
}

/* ── Initialisation ─────────────────────────────────────────── */

function init() {
  // Subscribe to Store — this drives all rendering
  Store.subscribe(handleStoreUpdate);

  // Set up the router
  initRouter();

  // Set up debug shortcut (Ctrl+Shift+D)
  initDebugShortcut();

  // Initialize 3D interactive background
  init3DBackground();

  // Perform initial render
  renderApp(Store.getState());
}

// Boot the application
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
