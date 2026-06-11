/**
 * @fileoverview EcoLens application module: action-plan.js
 * Follows strict Google JavaScript Style Guide.
 */
/**
 * EcoLens — Action Plan Component
 * Interactive checklist of personalized actions grouped by category.
 * Toggling actions updates the Store in real-time, which cascades
 * to the projected score and report charts.
 */

import { Store } from '../state.js';
import { SAFE_TARGET, CATEGORY_COLORS, CATEGORY_LABELS } from '../constants.js';
import { generateReport } from '../ai-engine.js';
import { renderBarChart, renderComparisonGauge } from '../charts.js';
import { sanitizeSafeHTML } from '../sanitize.js';

/**
 * Render the interactive action plan.
 * @returns {HTMLElement}
 */
export function renderActionPlan() {
  const state = Store.getState();
  const relevantActions = Store.getRelevantActions();
  const { checkedActions, projectedScore } = state;

  const section = document.createElement('section');
  section.className = 'action-plan section';
  section.setAttribute('aria-label', 'Personalized action plan');

  const container = document.createElement('div');
  container.className = 'container';

  // Header
  const header = document.createElement('header');
  header.className = 'action-plan__header';
  header.innerHTML = `
    <h2>Your Personalized Action Plan</h2>
    <p class="action-plan__header-desc">Check items to see real-time impact on your carbon footprint.</p>
  `;
  container.appendChild(header);

  // Summary metrics
  const totalPotential = relevantActions.reduce(
    (sum, a) => sum + (a.savingsTons || 0),
    0
  );
  const metrics = document.createElement('div');
  metrics.className = 'action-plan__metrics';
  metrics.setAttribute('data-action-metrics', 'true');
  metrics.setAttribute('aria-live', 'polite');
  metrics.innerHTML = `
    <div class="action-plan__metric">
      <div class="action-plan__metric-value" data-potential>${totalPotential.toFixed(2)}</div>
      <div class="action-plan__metric-label">Total Potential Savings (tons)</div>
    </div>
    <div class="action-plan__metric">
      <div class="action-plan__metric-value" data-projected-metric>${projectedScore.toFixed(2)}</div>
      <div class="action-plan__metric-label">Projected Score (tons)</div>
    </div>
    <div class="action-plan__metric">
      <div class="action-plan__metric-value" data-count>${checkedActions.size}</div>
      <div class="action-plan__metric-label">Actions Taken</div>
    </div>
  `;
  container.appendChild(metrics);

  // Group actions by category
  const grouped = groupByCategory(relevantActions);

  // Render each category
  const categoryOrder = ['travel', 'home', 'diet', 'shopping'];
  categoryOrder.forEach((catKey) => {
    const actions = grouped[catKey];
    if (!actions || actions.length === 0) return;

    const catSection = document.createElement('div');
    catSection.className = 'action-plan__category animate-on-scroll';

    const catHeader = document.createElement('div');
    catHeader.className = 'action-plan__category-header';
    catHeader.innerHTML = `
      <div class="action-plan__category-icon" style="background: ${CATEGORY_COLORS[catKey]};"></div>
      <span class="action-plan__category-title" style="color: ${CATEGORY_COLORS[catKey]};">${CATEGORY_LABELS[catKey]}</span>
    `;
    catSection.appendChild(catHeader);

    // Render each action card
    actions.forEach((action) => {
      catSection.appendChild(
        buildActionCard(action, checkedActions.has(action.id))
      );
    });

    container.appendChild(catSection);
  });

  // If no actions available
  if (relevantActions.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'glass-card glass-card--static action-plan-empty-card';
    empty.innerHTML = `
      <p class="action-plan-empty-text">No specific actions are available based on your current inputs. Try adjusting your calculator answers to see personalized recommendations.</p>
    `;
    container.appendChild(empty);
  }

  section.appendChild(container);
  return section;
}

/* ── Action Card ─────────────────────────────────────────────── */

function buildActionCard(action, isChecked) {
  const card = document.createElement('div');
  card.className = `action-item${isChecked ? ' action-item--checked' : ''}`;
  card.setAttribute('role', 'listitem');

  const checkboxId = `action-${action.id}`;

  card.innerHTML = `
    <label class="action-item__checkbox" for="${checkboxId}">
      <input type="checkbox" id="${checkboxId}" ${isChecked ? 'checked' : ''} aria-label="${escapeAttr(action.title)}">
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

  // Checkbox event
  const checkbox = card.querySelector(`#${checkboxId}`);
  checkbox.addEventListener('change', () => {
    Store.toggleAction(action.id);

    // Toggle card visual immediately
    card.classList.toggle('action-item--checked', checkbox.checked);
  });

  // Make the whole card clickable (but not the checkbox itself to avoid double-toggle)
  card.addEventListener('click', (e) => {
    if (e.target !== checkbox && !e.target.closest('.action-item__checkbox')) {
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change'));
    }
  });

  return card;
}

/* ── Helpers ──────────────────────────────────────────────────── */

function groupByCategory(actions) {
  const groups = {};
  actions.forEach((action) => {
    const report = generateReport(action);
    const cat = action.category || 'other';
    const label = `${report.ratingEmoji || '📊'} ${sanitizeSafeHTML(report.rating || 'Average')}`;
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(action);
  });
  return groups;
}

// Deprecated: keep for backward compatibility, but prefer sanitizeSafeHTML
function escapeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
