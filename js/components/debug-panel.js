/**
 * EcoLens — Debug Panel Component
 * Engineering debug overlay toggled with Ctrl+Shift+D.
 * Shows live state, emissions breakdown, performance metrics,
 * and a button to run the test suite.
 */

import { Store } from '../state.js';

let debugVisible = false;

/**
 * Render the debug panel element (hidden by default).
 * @returns {HTMLElement}
 */
export function renderDebugPanel() {
  const panel = document.createElement('div');
  panel.className = 'debug-panel';
  panel.id = 'debug-panel';
  panel.setAttribute('role', 'complementary');
  panel.setAttribute('aria-label', 'Developer debug panel');

  panel.innerHTML = `
    <div class="debug-panel__header">
      <span class="debug-panel__title">🔧 EcoLens Debug</span>
      <button class="debug-panel__close" id="debug-close" aria-label="Close debug panel">&times;</button>
    </div>

    <div class="debug-panel__section">
      <div class="debug-panel__section-title">Performance</div>
      <div class="debug-panel__performance" id="debug-perf">
        <div class="debug-panel__perf-item">
          <div class="debug-panel__perf-label">Last Render</div>
          <div class="debug-panel__perf-value" id="debug-render-time">—</div>
        </div>
        <div class="debug-panel__perf-item">
          <div class="debug-panel__perf-label">State Updates</div>
          <div class="debug-panel__perf-value" id="debug-state-updates">0</div>
        </div>
      </div>
    </div>

    <div class="debug-panel__section">
      <div class="debug-panel__section-title">Current State</div>
      <pre class="debug-panel__pre" id="debug-state">Loading…</pre>
    </div>

    <div class="debug-panel__section">
      <div class="debug-panel__section-title">Emission Breakdown</div>
      <pre class="debug-panel__pre" id="debug-emissions">—</pre>
    </div>

    <div class="debug-panel__section">
      <div class="debug-panel__section-title">Inputs</div>
      <pre class="debug-panel__pre" id="debug-inputs">—</pre>
    </div>

    <div class="debug-panel__section">
      <div class="debug-panel__section-title">Action Savings</div>
      <pre class="debug-panel__pre" id="debug-actions">—</pre>
    </div>

    <div class="debug-panel__section" style="display: flex; gap: var(--space-sm); flex-wrap: wrap;">
      <button class="btn btn--primary btn--sm" id="debug-run-tests">Run Tests</button>
      <button class="btn btn--danger btn--sm" id="debug-reset">Reset State</button>
    </div>

    <div class="debug-panel__section" id="debug-test-results" style="display: none;">
      <div class="debug-panel__section-title">Test Results</div>
      <pre class="debug-panel__pre debug-panel__test-results" id="debug-test-output"></pre>
    </div>
  `;

  // Close button
  panel.querySelector('#debug-close').addEventListener('click', () => {
    toggleDebugPanel(false);
  });

  // Run tests button
  panel.querySelector('#debug-run-tests').addEventListener('click', async () => {
    const output = panel.querySelector('#debug-test-output');
    const section = panel.querySelector('#debug-test-results');
    section.style.display = 'block';
    output.textContent = 'Running tests…';

    try {
      const testModule = await import('../tests.js');
      if (typeof testModule.runAllTests === 'function') {
        const results = await testModule.runAllTests();
        if (results) {
          const total = (results.passed || 0) + (results.failed || 0);
          let resultText = `Tests: ${results.passed}/${total} passed\n\n`;
          if (results.details && Array.isArray(results.details)) {
            results.details.forEach(d => {
              const icon = d.passed ? '✅' : '❌';
              resultText += `${icon} ${d.name}\n`;
              if (!d.passed && d.error) {
                resultText += `   Error: ${d.error}\n`;
              }
            });
          }
          output.textContent = resultText;
        } else {
          output.textContent = 'Tests completed (no structured results returned).';
        }
      } else {
        output.textContent = 'Error: tests.js does not export runAllTests()';
      }
    } catch (err) {
      output.textContent = `Error loading tests: ${err.message}`;
    }
  });

  // Reset state button
  panel.querySelector('#debug-reset').addEventListener('click', () => {
    Store.reset();
    refreshDebugData(panel);
  });

  // Subscribe to Store for live updates
  let updateCount = 0;
  Store.subscribe(() => {
    updateCount++;
    if (debugVisible) {
      refreshDebugData(panel, updateCount);
    }
  });

  return panel;
}

/**
 * Initialise the Ctrl+Shift+D keyboard shortcut.
 */
export function initDebugShortcut() {
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
      e.preventDefault();
      toggleDebugPanel();
    }
  });
}

/* ── Toggle visibility ───────────────────────────────────────── */

function toggleDebugPanel(forceState) {
  const panel = document.getElementById('debug-panel');
  if (!panel) return;

  debugVisible = forceState !== undefined ? forceState : !debugVisible;
  panel.classList.toggle('debug-panel--visible', debugVisible);

  if (debugVisible) {
    refreshDebugData(panel);
  }
}

/* ── Refresh debug data ──────────────────────────────────────── */

function refreshDebugData(panel, updateCount) {
  const state = Store.getState();

  // Render time
  const renderTimeEl = panel.querySelector('#debug-render-time');
  if (renderTimeEl) {
    renderTimeEl.textContent = (window.__ecolensRenderTime || '—') + 'ms';
  }

  // Update count
  const updatesEl = panel.querySelector('#debug-state-updates');
  if (updatesEl && updateCount !== undefined) {
    updatesEl.textContent = updateCount;
  }

  // State (serialize checkedActions Set for display)
  const stateEl = panel.querySelector('#debug-state');
  if (stateEl) {
    const displayState = {
      currentView: state.currentView,
      reportGenerated: state.reportGenerated,
      totalSavings: state.totalSavings,
      projectedScore: state.projectedScore,
      checkedActions: Array.from(state.checkedActions || [])
    };
    stateEl.textContent = JSON.stringify(displayState, null, 2);
  }

  // Emissions
  const emissionsEl = panel.querySelector('#debug-emissions');
  if (emissionsEl) {
    emissionsEl.textContent = JSON.stringify(state.emissions || {}, null, 2);
  }

  // Inputs
  const inputsEl = panel.querySelector('#debug-inputs');
  if (inputsEl) {
    inputsEl.textContent = JSON.stringify(state.inputs || {}, null, 2);
  }

  // Actions
  const actionsEl = panel.querySelector('#debug-actions');
  if (actionsEl) {
    try {
      const actions = Store.getRelevantActions();
      const actionData = actions.map(a => ({
        id: a.id,
        title: a.title,
        category: a.category,
        savingsTons: a.savingsTons ? a.savingsTons.toFixed(3) : '0',
        checked: state.checkedActions.has(a.id)
      }));
      actionsEl.textContent = JSON.stringify(actionData, null, 2);
    } catch (e) {
      actionsEl.textContent = 'Error: ' + e.message;
    }
  }
}
