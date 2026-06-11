/**
 * @fileoverview EcoLens application module: step-indicator.js
 * Follows strict Google JavaScript Style Guide.
 */
import { STEPS } from './shared.js';

/**
 * Builds the visual step progress indicator for the calculator.
 *
 * @param {number} active - The currently active step (1-4).
 * @returns {HTMLDivElement} The constructed DOM element for the step indicator.
 */
export function buildStepIndicator(active) {
  const wrapper = document.createElement('div');
  wrapper.className = 'step-indicator';
  wrapper.setAttribute('role', 'list');
  wrapper.setAttribute('aria-label', 'Calculator steps');
  wrapper.id = 'step-indicator';

  STEPS.forEach((step, i) => {
    const isActive = step.id === active;
    const isCompleted = step.id < active;

    const stepEl = document.createElement('div');
    stepEl.className = 'step-indicator__step';
    if (isActive) stepEl.classList.add('step-indicator__step--active');
    if (isCompleted) stepEl.classList.add('step-indicator__step--completed');
    stepEl.setAttribute('role', 'listitem');

    const circle = document.createElement('div');
    circle.className = 'step-indicator__circle';
    if (isCompleted) {
      circle.innerHTML = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><polyline points="4,9 8,13 14,5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    } else {
      circle.textContent = step.id;
    }

    const label = document.createElement('div');
    label.className = 'step-indicator__label';
    label.textContent = step.label;

    stepEl.appendChild(circle);
    stepEl.appendChild(label);
    wrapper.appendChild(stepEl);

    // Add connector line between steps
    if (i < STEPS.length - 1) {
      const line = document.createElement('div');
      line.className = 'step-indicator__line';
      if (isCompleted) line.classList.add('step-indicator__line--completed');
      wrapper.appendChild(line);
    }
  });

  return wrapper;
}

/**
 * Replaces the existing step indicator in the DOM with a new one.
 *
 * @param {number} active - The currently active step (1-4).
 */
export function updateStepIndicator(active) {
  const old = document.getElementById('step-indicator');
  if (old) {
    const newIndicator = buildStepIndicator(active);
    old.replaceWith(newIndicator);
  }
}
