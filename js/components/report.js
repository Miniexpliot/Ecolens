/**
 * EcoLens — Report / Results Component
 * Displays the AI-generated report, emissions breakdown with charts,
 * comparison gauge, and a live-updating projected score.
 */

import { Store } from '../state.js';
import { SAFE_TARGET, CATEGORY_COLORS, CATEGORY_LABELS } from '../constants.js';
import { generateReport } from '../ai-engine.js';
import { renderDonutChart, renderBarChart, renderComparisonGauge } from '../charts.js';

/**
 * Render the full results / report section.
 * @returns {HTMLElement}
 */
export function renderReport() {
  const state = Store.getState();
  const { emissions, inputs, percentages, totalSavings, projectedScore } = state;

  // Generate report data from the AI engine
  const report = generateReport(emissions, inputs);

  const section = document.createElement('section');
  section.className = 'report section';
  section.setAttribute('aria-label', 'Your carbon footprint report');

  const container = document.createElement('div');
  container.className = 'container';

  // Header
  const header = document.createElement('header');
  header.className = 'report__header';
  header.innerHTML = `
    <div class="section-badge">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="5" stroke="#10b981" stroke-width="1.5" fill="none"/>
        <polyline points="4.5,7 6.5,9 9.5,5" stroke="#10b981" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Results
    </div>
    <h2>Your Carbon Footprint Report</h2>
    <p style="color: var(--text-secondary);">Here's your personalized analysis based on your daily habits.</p>
  `;
  container.appendChild(header);

  // Grid layout
  const grid = document.createElement('div');
  grid.className = 'report__grid';

  // ─── 1. AI Assistant Panel ─────────────────────────────────
  grid.appendChild(buildAIPanel(report));

  // ─── 2. Emissions Breakdown ────────────────────────────────
  grid.appendChild(buildEmissionsBreakdown(emissions, percentages));

  // ─── 3. Comparison Section ─────────────────────────────────
  grid.appendChild(buildComparisonSection(report, emissions));

  // ─── 4. Projected Score ────────────────────────────────────
  grid.appendChild(buildProjectedScore(emissions, totalSavings, projectedScore));

  // ─── 5. Unlocked Badges ────────────────────────────────────
  if (state.unlockedBadges && state.unlockedBadges.length > 0) {
    grid.appendChild(buildBadgesSection(state.unlockedBadges));
  }

  container.appendChild(grid);
  section.appendChild(container);

  // Render charts after the section is in the DOM
  requestAnimationFrame(() => {
    renderEmissionsDonut(emissions, percentages);
    renderComparisonGaugeChart(emissions, inputs);
  });

  return section;
}

/* ── AI Assistant Panel ──────────────────────────────────────── */

function buildAIPanel(report) {
  const card = document.createElement('div');
  card.className = 'glass-card glass-card--static ai-panel';
  card.setAttribute('aria-live', 'polite');
  card.setAttribute('role', 'region');
  card.setAttribute('aria-label', 'AI Assistant analysis');

  const insightsHTML = (report.insights || []).map(
    insight => `<div class="ai-panel__insight">${escapeHTML(insight)}</div>`
  ).join('');

  card.innerHTML = `
    <div class="ai-panel__header">
      <div class="ai-panel__icon">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="6" width="18" height="13" rx="3" stroke="#10b981" stroke-width="1.5" fill="none"/>
          <circle cx="9" cy="13" r="1.5" fill="#10b981"/>
          <circle cx="15" cy="13" r="1.5" fill="#10b981"/>
          <path d="M9 16.5C9 16.5 10.5 18 12 18C13.5 18 15 16.5 15 16.5" stroke="#10b981" stroke-width="1.2" stroke-linecap="round" fill="none"/>
          <line x1="9" y1="3" x2="9" y2="6" stroke="#10b981" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="15" y1="3" x2="15" y2="6" stroke="#10b981" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      <div>
        <div class="ai-panel__title">EcoLens AI Assistant</div>
        <div class="ai-panel__subtitle">Personalized carbon analysis</div>
      </div>
      <div style="margin-left: auto;">
        <span class="rating-badge rating-badge--${report.ratingClass || 'average'}">
          ${report.ratingEmoji || '📊'} ${escapeHTML(report.rating || 'Average')}
        </span>
      </div>
    </div>

    <div class="ai-panel__summary">${escapeHTML(report.summary || '')}</div>

    ${insightsHTML ? `
      <h4 style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: var(--space-sm); text-transform: uppercase; letter-spacing: 0.05em;">Key Insights</h4>
      <div class="ai-panel__insights">${insightsHTML}</div>
    ` : ''}

    ${report.savingsText ? `
      <div class="glass-card" style="margin-top: var(--space-md); background: rgba(16,185,129,0.05); border-color: rgba(16,185,129,0.15);">
        <h4 style="color: var(--color-primary); font-size: 0.9rem; margin-bottom: var(--space-sm);">💰 Savings Potential</h4>
        <p style="font-size: 0.9rem; line-height: 1.6;">${escapeHTML(report.savingsText)}</p>
      </div>
    ` : ''}
  `;

  return card;
}

/* ── Emissions Breakdown ─────────────────────────────────────── */

function buildEmissionsBreakdown(emissions, percentages) {
  const card = document.createElement('div');
  card.className = 'glass-card glass-card--static';
  card.setAttribute('role', 'region');
  card.setAttribute('aria-label', 'Emissions breakdown by category');

  const categories = [
    { key: 'travel', label: CATEGORY_LABELS.travel, color: CATEGORY_COLORS.travel },
    { key: 'home', label: CATEGORY_LABELS.home, color: CATEGORY_COLORS.home },
    { key: 'diet', label: CATEGORY_LABELS.diet, color: CATEGORY_COLORS.diet },
    { key: 'shopping', label: CATEGORY_LABELS.shopping, color: CATEGORY_COLORS.shopping }
  ];

  const legendItems = categories.map(cat => `
    <div class="emissions-legend__item">
      <div class="emissions-legend__color" style="background: ${cat.color};"></div>
      <span class="emissions-legend__label">${cat.label}</span>
      <span class="emissions-legend__value">${(emissions[cat.key] || 0).toFixed(2)}t</span>
      <span class="emissions-legend__pct">${(percentages[cat.key] || 0).toFixed(0)}%</span>
    </div>
  `).join('');

  card.innerHTML = `
    <h3 style="margin-bottom: var(--space-lg); font-size: 1.1rem;">Emissions Breakdown</h3>

    <div class="emissions-total">
      <div class="emissions-total__value">${(emissions.total || 0).toFixed(2)}</div>
      <div class="emissions-total__unit">tons CO₂e per year</div>
    </div>

    <div class="emissions-breakdown">
      <div class="chart-container chart-container--bar" id="emissions-bar-chart" role="img" aria-label="Bar chart showing emissions by category">
      </div>
      <div class="emissions-legend">
        ${legendItems}
      </div>
    </div>
  `;

  return card;
}

/* ── Comparison Section ──────────────────────────────────────── */

function buildComparisonSection(report, emissions) {
  const card = document.createElement('div');
  card.className = 'glass-card glass-card--static';
  card.setAttribute('role', 'region');
  card.setAttribute('aria-label', 'Comparison with national average and safe target');

  card.innerHTML = `
    <h3 style="margin-bottom: var(--space-lg); font-size: 1.1rem;">How You Compare</h3>

    <div class="chart-container chart-container--gauge" id="comparison-gauge-chart" role="img" aria-label="Gauge comparing your emissions to national average and safe target">
    </div>

    <div class="comparison-section" style="margin-top: var(--space-lg);">
      ${report.vsNationalText ? `
        <div class="comparison-text">
          <strong>🏳️ vs National Average:</strong> ${report.vsNationalText}
        </div>
      ` : ''}
      ${report.vsTargetText ? `
        <div class="comparison-text">
          <strong>🎯 vs Safe Target (${SAFE_TARGET}t):</strong> ${report.vsTargetText}
        </div>
      ` : ''}
    </div>
  `;

  return card;
}

/* ── Projected Score ─────────────────────────────────────────── */

function buildProjectedScore(emissions, totalSavings, projectedScore) {
  const card = document.createElement('div');
  card.className = 'glass-card glass-card--static';
  card.setAttribute('role', 'region');
  card.setAttribute('aria-label', 'Projected carbon footprint after taking actions');
  card.setAttribute('data-projected-score', 'true');

  const isSafe = projectedScore <= SAFE_TARGET;

  card.innerHTML = `
    <h3 style="margin-bottom: var(--space-lg); font-size: 1.1rem;">Projected Impact</h3>
    <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: var(--space-lg);">
      Check actions in your Action Plan below to see this update in real-time.
    </p>

    <div class="projected-score" aria-live="polite">
      <div class="projected-score__item">
        <div class="projected-score__label">Current</div>
        <div class="projected-score__value projected-score__value--current" data-current>${(emissions.total || 0).toFixed(2)}</div>
        <span class="projected-score__unit">tons CO₂e/yr</span>
      </div>
      <div class="projected-score__item">
        <div class="projected-score__label">Savings</div>
        <div class="projected-score__value projected-score__value--savings" data-savings>${totalSavings.toFixed(2)}</div>
        <span class="projected-score__unit">tons CO₂e/yr</span>
      </div>
      <div class="projected-score__item">
        <div class="projected-score__label">Projected</div>
        <div class="projected-score__value ${isSafe ? 'projected-score__value--safe' : 'projected-score__value--danger'}" data-projected>${projectedScore.toFixed(2)}</div>
        <span class="projected-score__unit">tons CO₂e/yr</span>
      </div>
    </div>

    ${isSafe ? `
      <div style="text-align: center; margin-top: var(--space-lg);">
        <span class="pill pill--primary">🎉 Within safe target!</span>
      </div>
    ` : `
      <div style="text-align: center; margin-top: var(--space-lg);">
        <span class="pill pill--amber">⚡ Check more actions to reach the ${SAFE_TARGET}t target</span>
      </div>
    `}
  `;

  return card;
}

/* ── Unlocked Badges ─────────────────────────────────────────── */

function buildBadgesSection(badges) {
  const card = document.createElement('div');
  card.className = 'glass-card glass-card--static badges-section';
  card.style.gridColumn = '1 / -1'; // span full width
  
  const badgesHTML = badges.map(b => `
    <div class="badge-item">
      <div class="badge-icon">${b.icon}</div>
      <div class="badge-info">
        <div class="badge-name">${b.name}</div>
        <div class="badge-desc">${b.description}</div>
      </div>
    </div>
  `).join('');

  card.innerHTML = `
    <h3 style="margin-bottom: var(--space-md); font-size: 1.1rem; color: var(--color-primary);">🏆 Unlocked Achievements</h3>
    <div class="badges-grid">
      ${badgesHTML}
    </div>
  `;

  return card;
}

/* ── Chart Rendering Helpers ─────────────────────────────────── */

function renderEmissionsDonut(emissions, percentages) {
  const categories = [
    { key: 'travel', label: CATEGORY_LABELS.travel, color: CATEGORY_COLORS.travel },
    { key: 'home', label: CATEGORY_LABELS.home, color: CATEGORY_COLORS.home },
    { key: 'diet', label: CATEGORY_LABELS.diet, color: CATEGORY_COLORS.diet },
    { key: 'shopping', label: CATEGORY_LABELS.shopping, color: CATEGORY_COLORS.shopping }
  ];

  const segments = categories.map(cat => ({
    label: cat.label,
    value: emissions[cat.key] || 0,
    color: cat.color,
    percentage: percentages[cat.key] || 0
  }));

  try {
    renderBarChart('emissions-bar-chart', segments);
  } catch (e) {
    console.warn('Could not render bar chart:', e);
  }
}

function renderComparisonGaugeChart(emissions, inputs) {
  const nationalAvg = Store.getNationalAverage();

  try {
    renderComparisonGauge('comparison-gauge-chart', emissions.total || 0, nationalAvg, SAFE_TARGET);
  } catch (e) {
    console.warn('Could not render comparison gauge:', e);
  }
}

/* ── Utility ─────────────────────────────────────────────────── */

/**
 * Safely escapes HTML entities to prevent XSS.
 * @param {string} str - Raw input string
 * @returns {string} Escaped HTML string
 */
function escapeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
