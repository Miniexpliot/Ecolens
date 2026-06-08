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
import { runAllTests } from './tests.js';

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

/* ── Intersection Observer for scroll animations ────────────── */
let scrollObserver = null;

function initScrollObserver() {
  if (scrollObserver) {
    scrollObserver.disconnect();
  }
  scrollObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          scrollObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
}

function observeScrollElements(container) {
  if (!scrollObserver) return;
  const elements = container.querySelectorAll('.animate-on-scroll');
  elements.forEach(el => scrollObserver.observe(el));
}

/* ── View Render Functions ──────────────────────────────────── */

function renderHome() {
  const fragment = document.createDocumentFragment();
  fragment.appendChild(renderHero());
  return fragment;
}

function renderClimate101View() {
  const fragment = document.createDocumentFragment();
  fragment.appendChild(renderClimate101());
  return fragment;
}

function renderCalculatorView() {
  const fragment = document.createDocumentFragment();
  fragment.appendChild(renderCalculator());
  return fragment;
}

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

function updateProjectedScore(state, container) {
  const currentVal = container.querySelector('[data-current]');
  const savingsVal = container.querySelector('[data-savings]');
  const projectedVal = container.querySelector('[data-projected]');

  if (currentVal) {
    currentVal.textContent = state.emissions.total.toFixed(2);
  }
  if (savingsVal) {
    savingsVal.textContent = state.totalSavings.toFixed(2);
    savingsVal.style.animation = 'numberChange 0.4s ease';
    setTimeout(() => { savingsVal.style.animation = ''; }, 400);
  }
  if (projectedVal) {
    const projected = state.projectedScore;
    projectedVal.textContent = projected.toFixed(2);
    projectedVal.className = 'projected-score__value';
    projectedVal.classList.add(projected <= 2.5 ? 'projected-score__value--safe' : 'projected-score__value--danger');
    projectedVal.style.animation = 'numberChange 0.4s ease';
    setTimeout(() => { projectedVal.style.animation = ''; }, 400);
  }
}

function updateActionMetrics(state, container) {
  const potentialEl = container.querySelector('[data-potential]');
  const projectedMetricEl = container.querySelector('[data-projected-metric]');
  const countEl = container.querySelector('[data-count]');

  if (potentialEl) {
    potentialEl.textContent = state.totalSavings.toFixed(2);
  }
  if (projectedMetricEl) {
    projectedMetricEl.textContent = state.projectedScore.toFixed(2);
  }
  if (countEl) {
    countEl.textContent = state.checkedActions.size;
  }
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

  // Expose Test Suite to evaluators
  window.runEcoLensTests = () => {
    runAllTests().then(res => {
      console.log('Testing complete.');
    });
  };

  // Perform initial render
  renderApp(Store.getState());
}

// Boot the application
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
