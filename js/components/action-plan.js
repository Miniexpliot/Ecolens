/**
 * @fileoverview EcoLens Action Plan Component.
 * Interactive checklist of personalized actions grouped by category.
 * Toggling actions updates the Store in real-time, which cascades
 * to the projected score and report charts.
 */

import {Store} from '../state.js';
import {CATEGORY_COLORS, CATEGORY_LABELS} from '../constants.js';
import {groupByCategory, buildActionCard} from '../helpers/actionPlanHelpers.js';

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
