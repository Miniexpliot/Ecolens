/**
 * @fileoverview Helper functions for the Action Plan component.
 * Provides memoized utilities for metric calculation, category grouping,
 * and accessible action‑card rendering.
 */

import { Store } from '../state.js';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../constants.js';
import { sanitizeSafeHTML } from '../sanitize.js';
import { makeFocusable } from './accessibility.js';

// Simple memoization cache per render cycle
let _groupCache = null;
let _metricsCache = null;

/**
 * Group actions by their category.
 * @param {Array<Object>} actions
 * @returns {Object<string,Array<Object>>}
 */
export function groupByCategory(actions) {
  if (_groupCache && _groupCache.actions === actions) {
    return _groupCache.result;
  }
  const groups = {};
  actions.forEach((action) => {
    const cat = action.category || 'other';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(action);
  });
  _groupCache = { actions, result: groups };
  return groups;
}

/**
 * Compute aggregated metrics for the action plan.
 * @param {Array<Object>} actions
 * @returns {{ totalPotential: number, projectedScore: number, checkedCount: number }}
 */
export function calculateMetrics(actions) {
  if (_metricsCache && _metricsCache.actions === actions) {
    return _metricsCache.result;
  }
  const totalPotential = actions.reduce((sum, a) => sum + (a.savingsTons || 0), 0);
  const state = Store.getState();
  const { projectedScore, checkedActions } = state;
  const result = {
    totalPotential,
    projectedScore,
    checkedCount: checkedActions.size
  };
  _metricsCache = { actions, result };
  return result;
}

/**
 * Build an accessible action card element.
 * @param {Object} action
 * @param {boolean} isChecked
 * @returns {HTMLElement}
 */
export function buildActionCard(action, isChecked) {
  const card = document.createElement('div');
  card.className = `action-item${isChecked ? ' action-item--checked' : ''}`;
  card.setAttribute('role', 'listitem');
  // ARIA state for screen readers
  card.setAttribute('aria-checked', isChecked ? 'true' : 'false');

  const checkboxId = `action-${action.id}`;

  card.innerHTML = `
    <label class="action-item__checkbox" for="${checkboxId}">
      <input type="checkbox" id="${checkboxId}" ${isChecked ? 'checked' : ''} aria-label="${escapeAttr(action.title)}" />
      <div class="action-item__checkbox-visual" aria-hidden="true">
        <svg viewBox="0 0 14 14" fill="none">
          <polyline points="2.5,7 6,10.5 11.5,3.5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </label>
    <div class="action-item__content">
      <div class="action-item__title">${sanitizeSafeHTML(action.title)}</div>
      <div class="action-item__description">${sanitizeSafeHTML(action.description)}</div>
    </div>
    <div class="action-item__savings" aria-label="Saves ${action.savingsTons.toFixed(2)} tons per year">
      Save ${action.savingsTons.toFixed(2)}t/yr
    </div>
  `;

  const checkbox = card.querySelector(`#${checkboxId}`);
  checkbox.addEventListener('change', () => {
    Store.toggleAction(action.id);
    card.classList.toggle('action-item--checked', checkbox.checked);
    card.setAttribute('aria-checked', checkbox.checked ? 'true' : 'false');
  });

  // Click on card toggles checkbox (excluding the checkbox itself)
  card.addEventListener('click', (e) => {
    if (e.target !== checkbox && !e.target.closest('.action-item__checkbox')) {
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change'));
    }
  });

  // Keyboard accessibility – Enter / Space toggles
  makeFocusable(card, () => {
    checkbox.checked = !checkbox.checked;
    checkbox.dispatchEvent(new Event('change'));
  });

  return card;
}

/**
 * Escape HTML attributes safely (used in the template above).
 * @param {string} str
 * @returns {string}
 */
function escapeAttr(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
