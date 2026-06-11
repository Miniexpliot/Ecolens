/**
 * @fileoverview Results View Live Updater
 * 
 * Handles DOM updates for the results view when the user toggles
 * action items, without requiring a full re-render.
 *
 * @module results-updater
 */

/**
 * Updates the projected score DOM elements with new state values.
 * Applies a brief animation to highlight the change.
 * 
 * @param {import('../types.js').ApplicationState} state - Current application state
 * @param {HTMLElement} container - Container holding the projected score elements
 */
export function updateProjectedScore(state, container) {
  const currentVal = container.querySelector('[data-current]');
  const savingsVal = container.querySelector('[data-savings]');
  const projectedVal = container.querySelector('[data-projected]');

  if (currentVal && state.emissions) {
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

/**
 * Updates the action plan metric summary elements.
 * 
 * @param {import('../types.js').ApplicationState} state - Current application state
 * @param {HTMLElement} container - Container holding the metric elements
 */
export function updateActionMetrics(state, container) {
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
    countEl.textContent = state.checkedActions.size.toString();
  }
}
