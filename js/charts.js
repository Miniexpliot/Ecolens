/**
 * @fileoverview Pure SVG Chart Rendering Module
 *
 * Renders beautiful, animated donut charts, bar charts and comparison gauges
 * using raw SVG — zero external dependencies.  All charts are responsive
 * (viewBox-based), fully ARIA-labelled, and use CSS transitions and
 * stroke-dasharray animation for smooth interactivity.
 *
 * @module charts
 */

// ---------------------------------------------------------------------------
// Shared SVG namespace & helpers
// ---------------------------------------------------------------------------

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Create an SVG element in the correct namespace.
 * @param {string} tag – SVG tag name
 * @param {Object} attrs – Attribute key/value pairs
 * @returns {SVGElement}
 */
function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

/**
 * Generate a unique ID to avoid collisions when multiple charts exist.
 * @param {string} prefix
 * @returns {string}
 */
let _idCounter = 0;
function uid(prefix = 'chart') {
  return `${prefix}-${++_idCounter}-${Date.now().toString(36)}`;
}

/**
 * Inject shared CSS styles once into the document head.
 * @private
 */
let _stylesInjected = false;
function _injectStyles() {
  if (_stylesInjected) return;
  _stylesInjected = true;

  const style = document.createElement('style');
  style.textContent = `
    /* ── Chart container ────────────────────────────────────────────────── */
    .eco-chart-container {
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
      position: relative;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    }
    .eco-chart-container svg {
      width: 100%;
      height: auto;
      display: block;
      overflow: visible;
    }

    /* ── Donut chart ────────────────────────────────────────────────────── */
    .donut-segment {
      transition: stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1),
                  opacity 0.3s ease;
      cursor: pointer;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.12));
    }
    .donut-segment:hover {
      opacity: 0.85;
      filter: drop-shadow(0 4px 12px rgba(0,0,0,0.25));
    }
    .donut-segment:focus-visible {
      outline: 3px solid #10b981;
      outline-offset: 4px;
      opacity: 0.9;
    }

    /* ── Bar chart ──────────────────────────────────────────────────────── */
    .bar-rect {
      transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1),
                  opacity 0.3s ease;
      cursor: pointer;
    }
    .bar-rect:hover {
      opacity: 0.85;
      filter: drop-shadow(0 2px 8px rgba(0,0,0,0.2));
    }
    .bar-rect:focus-visible {
      outline: 3px solid #10b981;
      outline-offset: 2px;
      opacity: 0.9;
    }

    /* ── Gauge ──────────────────────────────────────────────────────────── */
    .gauge-marker {
      transition: cx 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* ── Tooltip ────────────────────────────────────────────────────────── */
    .chart-tooltip {
      position: absolute;
      background: rgba(15, 23, 42, 0.92);
      color: #f1f5f9;
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 13px;
      line-height: 1.4;
      pointer-events: none;
      opacity: 0;
      transform: translateY(4px);
      transition: opacity 0.2s ease, transform 0.2s ease;
      z-index: 1000;
      white-space: nowrap;
      box-shadow: 0 4px 16px rgba(0,0,0,0.25);
    }
    .chart-tooltip.visible {
      opacity: 1;
      transform: translateY(0);
    }

    /* ── Legend ──────────────────────────────────────────────────────────── */
    .chart-legend {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 16px;
      margin-top: 12px;
      font-size: 13px;
      color: #475569;
    }
    .chart-legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .chart-legend-swatch {
      width: 12px;
      height: 12px;
      border-radius: 3px;
      flex-shrink: 0;
    }
  `;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Tooltip management
// ---------------------------------------------------------------------------

/**
 * Create a tooltip element bound to a container.
 * @param {HTMLElement} container
 * @returns {{ show: Function, hide: Function, el: HTMLElement }}
 */
function createTooltip(container) {
  const el = document.createElement('div');
  el.className = 'chart-tooltip';
  el.setAttribute('role', 'tooltip');
  container.style.position = 'relative';
  container.appendChild(el);

  return {
    el,
    show(x, y, html) {
      el.innerHTML = html;
      el.classList.add('visible');
      // Position relative to container
      const rect = container.getBoundingClientRect();
      const tipRect = el.getBoundingClientRect();
      let left = x - rect.left - tipRect.width / 2;
      let top = y - rect.top - tipRect.height - 12;
      // Clamp to container bounds
      left = Math.max(4, Math.min(left, rect.width - tipRect.width - 4));
      if (top < 0) top = y - rect.top + 16;
      el.style.left = `${left}px`;
      el.style.top = `${top}px`;
    },
    hide() {
      el.classList.remove('visible');
    },
  };
}

// ---------------------------------------------------------------------------
// Gradient definitions
// ---------------------------------------------------------------------------

/**
 * Create radial & linear gradient defs for a given color.
 * @param {SVGDefsElement} defs
 * @param {string} color – Base hex color
 * @param {string} id    – Gradient ID
 */
function addGradient(defs, color, id) {
  // Radial gradient for donut segments
  const radial = svgEl('radialGradient', {
    id: `${id}-radial`,
    cx: '50%',
    cy: '50%',
    r: '50%',
  });
  const stop1 = svgEl('stop', {
    offset: '0%',
    'stop-color': _lighten(color, 20),
  });
  const stop2 = svgEl('stop', { offset: '100%', 'stop-color': color });
  radial.appendChild(stop1);
  radial.appendChild(stop2);
  defs.appendChild(radial);

  // Linear gradient for bar charts
  const linear = svgEl('linearGradient', {
    id: `${id}-linear`,
    x1: '0',
    y1: '0',
    x2: '1',
    y2: '0',
  });
  const ls1 = svgEl('stop', { offset: '0%', 'stop-color': color });
  const ls2 = svgEl('stop', {
    offset: '100%',
    'stop-color': _lighten(color, 15),
  });
  linear.appendChild(ls1);
  linear.appendChild(ls2);
  defs.appendChild(linear);
}

/**
 * Lighten a hex color by a percentage.
 * @param {string} hex
 * @param {number} percent
 * @returns {string}
 */
function _lighten(hex, percent) {
  hex = hex.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.min(255, (num >> 16) + Math.round(2.55 * percent));
  const g = Math.min(255, ((num >> 8) & 0x00ff) + Math.round(2.55 * percent));
  const b = Math.min(255, (num & 0x0000ff) + Math.round(2.55 * percent));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

// ---------------------------------------------------------------------------
// DONUT CHART
// ---------------------------------------------------------------------------

/**
 * Render an animated donut chart inside the specified container.
 *
 * @param {string} containerId – DOM element ID for the chart container
 * @param {Array<{label: string, value: number, color: string, percentage: number}>} segments
 */
export function renderDonutChart(containerId, segments) {
  _injectStyles();

  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`renderDonutChart: container #${containerId} not found`);
    return;
  }

  container.innerHTML = '';
  container.classList.add('eco-chart-container');

  // Filter out zero-value segments
  const validSegments = segments.filter((s) => s.value > 0);
  if (validSegments.length === 0) {
    container.innerHTML = `
      <div class="glass-card glass-card--danger chart-error-card">
        <h4 class="chart-error-title">⚠️ Error</h4>
        <p class="chart-error-text">No values found for the chart.</p>
      </div>`;
    return;
  }

  const total = validSegments.reduce((sum, s) => sum + s.value, 0);
  const chartId = uid('donut');

  // SVG dimensions (viewBox-based for responsiveness)
  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 110;
  const strokeWidth = 36;
  const r = outerR - strokeWidth / 2; // centre radius of the stroke ring
  const circumference = 2 * Math.PI * r;

  const svg = svgEl('svg', {
    viewBox: `0 0 ${size} ${size}`,
    'aria-label': 'Donut chart showing carbon footprint breakdown by category',
    role: 'img',
  });

  // ── Defs: gradients + shadow filter ───────────────────────────────────
  const defs = svgEl('defs');

  // Drop shadow filter
  const filter = svgEl('filter', {
    id: `${chartId}-shadow`,
    x: '-20%',
    y: '-20%',
    width: '140%',
    height: '140%',
  });
  const feGauss = svgEl('feGaussianBlur', {
    in: 'SourceAlpha',
    stdDeviation: '3',
    result: 'blur',
  });
  const feOffset = svgEl('feOffset', {
    in: 'blur',
    dx: '0',
    dy: '2',
    result: 'shifted',
  });
  const feFlood = svgEl('feFlood', {
    'flood-color': 'rgba(0,0,0,0.15)',
    result: 'color',
  });
  const feComposite = svgEl('feComposite', {
    in: 'color',
    in2: 'shifted',
    operator: 'in',
    result: 'shadow',
  });
  const feMerge = svgEl('feMerge');
  const fmn1 = svgEl('feMergeNode', { in: 'shadow' });
  const fmn2 = svgEl('feMergeNode', { in: 'SourceGraphic' });
  feMerge.appendChild(fmn1);
  feMerge.appendChild(fmn2);
  filter.appendChild(feGauss);
  filter.appendChild(feOffset);
  filter.appendChild(feFlood);
  filter.appendChild(feComposite);
  filter.appendChild(feMerge);
  defs.appendChild(filter);

  validSegments.forEach((seg, i) =>
    addGradient(defs, seg.color, `${chartId}-seg${i}`)
  );
  svg.appendChild(defs);

  // ── Background ring ───────────────────────────────────────────────────
  const bgRing = svgEl('circle', {
    cx,
    cy,
    r,
    fill: 'none',
    stroke: '#e2e8f0',
    'stroke-width': strokeWidth,
    opacity: '0.5',
  });
  svg.appendChild(bgRing);

  // ── Segments ──────────────────────────────────────────────────────────
  let cumulativeOffset = 0;

  validSegments.forEach((seg, i) => {
    const fraction = seg.value / total;
    const segLength = fraction * circumference;
    const gap = validSegments.length > 1 ? 4 : 0; // small gap between segments
    const dashLength = Math.max(0, segLength - gap);

    const circle = svgEl('circle', {
      cx,
      cy,
      r,
      fill: 'none',
      stroke: `url(#${chartId}-seg${i}-radial)`,
      'stroke-width': strokeWidth,
      'stroke-dasharray': `${dashLength} ${circumference - dashLength}`,
      'stroke-dashoffset': `${-cumulativeOffset - gap / 2}`,
      'stroke-linecap': 'butt',
      transform: `rotate(-90 ${cx} ${cy})`,
      filter: `url(#${chartId}-shadow)`,
      'data-index': i,
      'data-label': seg.label,
      'data-value': seg.value.toFixed(2),
      'data-pct': (fraction * 100).toFixed(1),
      tabindex: '0',
      role: 'button',
      'aria-label': `${seg.label}: ${seg.value.toFixed(2)} tons (${(fraction * 100).toFixed(1)}%)`,
    });
    circle.classList.add('donut-segment');

    // Animate in from zero
    const targetOffset = -cumulativeOffset - gap / 2;
    circle.setAttribute('stroke-dashoffset', String(circumference));
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        circle.setAttribute('stroke-dashoffset', String(targetOffset));
      });
    });

    svg.appendChild(circle);
    cumulativeOffset += segLength;
  });

  // ── Centre label ──────────────────────────────────────────────────────
  const centerCircle = svgEl('circle', {
    cx,
    cy,
    r: outerR - strokeWidth - 6,
    fill: 'white',
    filter: `url(#${chartId}-shadow)`,
  });
  svg.appendChild(centerCircle);

  const totalLabel = svgEl('text', {
    x: cx,
    y: cy - 10,
    'text-anchor': 'middle',
    'font-size': '14',
    'font-weight': '600',
    fill: '#64748b',
  });
  totalLabel.textContent = 'Total';
  svg.appendChild(totalLabel);

  const totalValue = svgEl('text', {
    x: cx,
    y: cy + 16,
    'text-anchor': 'middle',
    'font-size': '28',
    'font-weight': '700',
    fill: '#0f172a',
  });
  totalValue.textContent = `${total.toFixed(1)}`;
  svg.appendChild(totalValue);

  const totalUnit = svgEl('text', {
    x: cx,
    y: cy + 34,
    'text-anchor': 'middle',
    'font-size': '11',
    fill: '#94a3b8',
  });
  totalUnit.textContent = 'tons CO₂e/yr';
  svg.appendChild(totalUnit);

  container.appendChild(svg);

  // ── Tooltip ───────────────────────────────────────────────────────────
  const tooltip = createTooltip(container);

  svg.addEventListener('mousemove', (e) => {
    const target = e.target.closest('.donut-segment');
    if (!target) {
      tooltip.hide();
      return;
    }
    const label = target.getAttribute('data-label');
    const value = target.getAttribute('data-value');
    const pct = target.getAttribute('data-pct');
    tooltip.show(
      e.clientX,
      e.clientY,
      `<strong>${label}</strong><br>${value} tons CO₂e (${pct}%)`
    );
  });
  svg.addEventListener('mouseleave', () => tooltip.hide());

  // Keyboard navigation for tooltip
  svg.addEventListener('focusin', (e) => {
    const target = e.target.closest('.donut-segment');
    if (!target) return;
    const label = target.getAttribute('data-label');
    const value = target.getAttribute('data-value');
    const pct = target.getAttribute('data-pct');
    const elRect = target.getBoundingClientRect();
    tooltip.show(
      elRect.left + elRect.width / 2,
      elRect.top + elRect.height / 2,
      `<strong>${label}</strong><br>${value} tons CO₂e (${pct}%)`
    );
  });
  svg.addEventListener('focusout', () => tooltip.hide());
  svg.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') tooltip.hide();
  });

  // ── Legend ────────────────────────────────────────────────────────────
  const legend = document.createElement('div');
  legend.className = 'chart-legend';
  legend.setAttribute('aria-label', 'Chart legend');

  validSegments.forEach((seg) => {
    const item = document.createElement('div');
    item.className = 'chart-legend-item';
    const swatch = document.createElement('span');
    swatch.className = 'chart-legend-swatch';
    swatch.style.background = seg.color;
    const text = document.createElement('span');
    const pct = ((seg.value / total) * 100).toFixed(0);
    text.textContent = `${seg.label} (${pct}%)`;
    item.appendChild(swatch);
    item.appendChild(text);
    legend.appendChild(item);
  });

  container.appendChild(legend);

  // ── Accessible Data Table Fallback ────────────────────────────────────
  const table = document.createElement('table');
  table.className = 'sr-only';
  table.innerHTML = `
    <caption>Carbon Emissions Breakdown</caption>
    <thead>
      <tr>
        <th scope="col">Category</th>
        <th scope="col">Emissions (tons CO₂e)</th>
        <th scope="col">Percentage</th>
      </tr>
    </thead>
    <tbody>
      ${validSegments
        .map(
          (s) => `
        <tr>
          <td>${s.label}</td>
          <td>${s.value.toFixed(2)}</td>
          <td>${((s.value / total) * 100).toFixed(1)}%</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  `;
  container.appendChild(table);
}

// ---------------------------------------------------------------------------
// UPDATE DONUT (smooth transition)
// ---------------------------------------------------------------------------

/**
 * Update an existing donut chart with new segment values, animating smoothly.
 *
 * @param {string} containerId
 * @param {Array<{label: string, value: number, color: string, percentage: number}>} segments
 */
export function updateDonutChart(containerId, segments) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const svg = container.querySelector('svg');
  if (!svg) {
    // No existing chart — render fresh
    renderDonutChart(containerId, segments);
    return;
  }

  const validSegments = segments.filter((s) => s.value > 0);
  if (validSegments.length === 0) {
    container.innerHTML = `
      <div class="glass-card glass-card--danger chart-error-card">
        <h4 class="chart-error-title">⚠️ Error</h4>
        <p class="chart-error-text">No values found for the chart.</p>
      </div>`;
    return;
  }

  const total = validSegments.reduce((sum, s) => sum + s.value, 0);
  const circles = svg.querySelectorAll('.donut-segment');

  // If segment count changed, re-render entirely
  if (circles.length !== validSegments.length) {
    renderDonutChart(containerId, segments);
    return;
  }

  // Recalculate ring geometry
  const r = 110 - 36 / 2;
  const circumference = 2 * Math.PI * r;
  let cumulativeOffset = 0;

  validSegments.forEach((seg, i) => {
    const fraction = seg.value / total;
    const segLength = fraction * circumference;
    const gap = validSegments.length > 1 ? 4 : 0;
    const dashLength = Math.max(0, segLength - gap);

    const circle = circles[i];
    circle.setAttribute(
      'stroke-dasharray',
      `${dashLength} ${circumference - dashLength}`
    );
    circle.setAttribute('stroke-dashoffset', `${-cumulativeOffset - gap / 2}`);
    circle.setAttribute('data-label', seg.label);
    circle.setAttribute('data-value', seg.value.toFixed(2));
    circle.setAttribute('data-pct', (fraction * 100).toFixed(1));

    cumulativeOffset += segLength;
  });

  // Update centre text
  const texts = svg.querySelectorAll('text');
  if (texts.length >= 2) {
    texts[1].textContent = `${total.toFixed(1)}`;
  }

  // Update legend
  const legend = container.querySelector('.chart-legend');
  if (legend) {
    const items = legend.querySelectorAll('.chart-legend-item');
    validSegments.forEach((seg, i) => {
      if (items[i]) {
        const pct = ((seg.value / total) * 100).toFixed(0);
        const textSpan = items[i].querySelector('span:last-child');
        if (textSpan) textSpan.textContent = `${seg.label} (${pct}%)`;
      }
    });
  }
}

// ---------------------------------------------------------------------------
// BAR CHART
// ---------------------------------------------------------------------------

/**
 * Render a horizontal bar chart.
 *
 * @param {string} containerId
 * @param {Array<{label: string, value: number, color: string}>} bars
 */
export function renderBarChart(containerId, bars) {
  _injectStyles();

  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`renderBarChart: container #${containerId} not found`);
    return;
  }

  container.innerHTML = '';
  container.classList.add('eco-chart-container');

  if (!bars || bars.length === 0) {
    container.innerHTML = `
      <div class="glass-card glass-card--danger chart-error-card">
        <h4 class="chart-error-title">⚠️ Error</h4>
        <p class="chart-error-text">No values found for the chart.</p>
      </div>`;
    return;
  }

  const chartId = uid('bar');
  const maxValue = Math.max(...bars.map((b) => b.value), 0.1);

  const barHeight = 36;
  const barGap = 20;
  const labelWidth = 130;
  const valueWidth = 80;
  const chartPadding = 16;
  const totalHeight = bars.length * (barHeight + barGap) + chartPadding * 2;
  const svgWidth = 500;
  const barAreaWidth = svgWidth - labelWidth - valueWidth - chartPadding * 2;

  const svg = svgEl('svg', {
    viewBox: `0 0 ${svgWidth} ${totalHeight}`,
    'aria-label': 'Bar chart comparing emission values',
    role: 'img',
  });

  // Defs
  const defs = svgEl('defs');

  // Shadow filter
  const filter = svgEl('filter', {
    id: `${chartId}-barshadow`,
    x: '-5%',
    y: '-20%',
    width: '110%',
    height: '160%',
  });
  const feGauss = svgEl('feGaussianBlur', {
    in: 'SourceAlpha',
    stdDeviation: '2',
    result: 'blur',
  });
  const feOff = svgEl('feOffset', {
    in: 'blur',
    dx: '0',
    dy: '1',
    result: 'shifted',
  });
  const feFlood = svgEl('feFlood', {
    'flood-color': 'rgba(0,0,0,0.1)',
    result: 'color',
  });
  const feComp = svgEl('feComposite', {
    in: 'color',
    in2: 'shifted',
    operator: 'in',
    result: 'shadow',
  });
  const feMerge = svgEl('feMerge');
  feMerge.appendChild(svgEl('feMergeNode', { in: 'shadow' }));
  feMerge.appendChild(svgEl('feMergeNode', { in: 'SourceGraphic' }));
  filter.appendChild(feGauss);
  filter.appendChild(feOff);
  filter.appendChild(feFlood);
  filter.appendChild(feComp);
  filter.appendChild(feMerge);
  defs.appendChild(filter);

  bars.forEach((bar, i) => addGradient(defs, bar.color, `${chartId}-bar${i}`));
  svg.appendChild(defs);

  // Render bars
  bars.forEach((bar, i) => {
    const y = chartPadding + i * (barHeight + barGap);
    const barWidth = (bar.value / maxValue) * barAreaWidth;

    // Label
    const label = svgEl('text', {
      x: labelWidth - 8,
      y: y + barHeight / 2 + 5,
      'text-anchor': 'end',
      'font-size': '14',
      'font-weight': '600',
      fill: '#f8fafc',
    });
    label.textContent = bar.label;
    svg.appendChild(label);

    // Background track
    const track = svgEl('rect', {
      x: labelWidth,
      y: y + 4,
      width: barAreaWidth,
      height: barHeight - 8,
      rx: (barHeight - 8) / 2,
      fill: 'rgba(255, 255, 255, 0.1)',
    });
    svg.appendChild(track);

    // Bar
    const rect = svgEl('rect', {
      x: labelWidth,
      y: y + 4,
      width: 0, // animate from 0
      height: barHeight - 8,
      rx: (barHeight - 8) / 2,
      fill: `url(#${chartId}-bar${i}-linear)`,
      filter: `url(#${chartId}-barshadow)`,
      'data-label': bar.label,
      'data-value': bar.value.toFixed(2),
      tabindex: '0',
      role: 'button',
      'aria-label': `${bar.label}: ${bar.value.toFixed(2)} tons CO₂e`,
    });
    rect.classList.add('bar-rect');

    // Animate width
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        rect.setAttribute('width', String(Math.max(0, barWidth)));
      });
    });

    svg.appendChild(rect);

    // Value
    const value = svgEl('text', {
      x: labelWidth + barAreaWidth + 12,
      y: y + barHeight / 2 + 5,
      'text-anchor': 'start',
      'font-size': '15',
      'font-weight': '700',
      fill: '#f8fafc',
    });
    value.textContent = `${bar.value.toFixed(1)}t`;
    svg.appendChild(value);
  });

  container.appendChild(svg);

  // Tooltip
  const tooltip = createTooltip(container);
  svg.addEventListener('mousemove', (e) => {
    const target = e.target.closest('.bar-rect');
    if (!target) {
      tooltip.hide();
      return;
    }
    tooltip.show(
      e.clientX,
      e.clientY,
      `<strong>${target.getAttribute('data-label')}</strong><br>${target.getAttribute('data-value')} tons CO₂e`
    );
  });
  svg.addEventListener('mouseleave', () => tooltip.hide());

  // Keyboard navigation for tooltip
  svg.addEventListener('focusin', (e) => {
    const target = e.target.closest('.bar-rect');
    if (!target) return;
    const elRect = target.getBoundingClientRect();
    tooltip.show(
      elRect.left + elRect.width / 2,
      elRect.top + elRect.height / 2,
      `<strong>${target.getAttribute('data-label')}</strong><br>${target.getAttribute('data-value')} tons CO₂e`
    );
  });
  svg.addEventListener('focusout', () => tooltip.hide());
  svg.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') tooltip.hide();
  });

  // ── Accessible Data Table Fallback ────────────────────────────────────
  const table = document.createElement('table');
  table.className = 'sr-only';
  table.innerHTML = `
    <caption>Emissions Comparison</caption>
    <thead>
      <tr>
        <th scope="col">Category</th>
        <th scope="col">Emissions (tons CO₂e)</th>
      </tr>
    </thead>
    <tbody>
      ${bars
        .map(
          (b) => `
        <tr>
          <td>${b.label}</td>
          <td>${b.value.toFixed(2)}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  `;
  container.appendChild(table);
}

// ---------------------------------------------------------------------------
// COMPARISON GAUGE
// ---------------------------------------------------------------------------

/**
 * Render a horizontal gauge/scale comparing the user's value against
 * a national average and the safe target.
 *
 * @param {string} containerId
 * @param {number} userValue   – User's total emissions (tons)
 * @param {number} nationalAvg – National average (tons)
 * @param {number} safeTarget  – Paris Agreement safe target (tons)
 */
export function renderComparisonGauge(
  containerId,
  userValue,
  nationalAvg,
  safeTarget
) {
  _injectStyles();

  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`renderComparisonGauge: container #${containerId} not found`);
    return;
  }

  container.innerHTML = '';
  container.classList.add('eco-chart-container');

  const chartId = uid('gauge');
  const svgWidth = 500;
  const svgHeight = 140;
  const trackY = 65;
  const trackHeight = 18;
  const trackPadX = 40;
  const trackWidth = svgWidth - trackPadX * 2;

  // Scale: 0 to max(userValue, nationalAvg, safeTarget) * 1.3
  const scaleMax = Math.max(userValue, nationalAvg, safeTarget) * 1.3;

  function toX(val) {
    return trackPadX + (Math.min(val, scaleMax) / scaleMax) * trackWidth;
  }

  const svg = svgEl('svg', {
    viewBox: `0 0 ${svgWidth} ${svgHeight}`,
    'aria-label': `Gauge comparing your footprint (${userValue.toFixed(1)}t) to national average (${nationalAvg}t) and safe target (${safeTarget}t)`,
    role: 'img',
  });

  // Defs
  const defs = svgEl('defs');

  // Track gradient (green → yellow → red)
  const trackGrad = svgEl('linearGradient', {
    id: `${chartId}-track`,
    x1: '0',
    y1: '0',
    x2: '1',
    y2: '0',
  });
  const tStops = [
    { offset: '0%', color: '#22c55e' },
    { offset: '25%', color: '#84cc16' },
    { offset: '50%', color: '#eab308' },
    { offset: '75%', color: '#f97316' },
    { offset: '100%', color: '#ef4444' },
  ];
  tStops.forEach((s) => {
    trackGrad.appendChild(
      svgEl('stop', { offset: s.offset, 'stop-color': s.color })
    );
  });
  defs.appendChild(trackGrad);

  // Glow filter for user marker
  const glow = svgEl('filter', {
    id: `${chartId}-glow`,
    x: '-50%',
    y: '-50%',
    width: '200%',
    height: '200%',
  });
  const feGauss = svgEl('feGaussianBlur', {
    stdDeviation: '3',
    result: 'glow',
  });
  const feMerge = svgEl('feMerge');
  feMerge.appendChild(svgEl('feMergeNode', { in: 'glow' }));
  feMerge.appendChild(svgEl('feMergeNode', { in: 'SourceGraphic' }));
  glow.appendChild(feGauss);
  glow.appendChild(feMerge);
  defs.appendChild(glow);

  svg.appendChild(defs);

  // ── Title ─────────────────────────────────────────────────────────────
  const title = svgEl('text', {
    x: svgWidth / 2,
    y: 20,
    'text-anchor': 'middle',
    'font-size': '14',
    'font-weight': '600',
    fill: '#334155',
  });
  title.textContent = 'Your Footprint vs Benchmarks';
  svg.appendChild(title);

  // ── Track background ──────────────────────────────────────────────────
  const trackBg = svgEl('rect', {
    x: trackPadX,
    y: trackY,
    width: trackWidth,
    height: trackHeight,
    rx: trackHeight / 2,
    fill: '#e2e8f0',
  });
  svg.appendChild(trackBg);

  // ── Coloured track ────────────────────────────────────────────────────
  const trackFill = svgEl('rect', {
    x: trackPadX,
    y: trackY,
    width: trackWidth,
    height: trackHeight,
    rx: trackHeight / 2,
    fill: `url(#${chartId}-track)`,
    opacity: '0.6',
  });
  svg.appendChild(trackFill);

  // ── Safe target marker ────────────────────────────────────────────────
  const safeX = toX(safeTarget);

  const safeLine = svgEl('line', {
    x1: safeX,
    y1: trackY - 8,
    x2: safeX,
    y2: trackY + trackHeight + 8,
    stroke: '#16a34a',
    'stroke-width': '2.5',
    'stroke-dasharray': '4 2',
  });
  svg.appendChild(safeLine);

  const safeLabel = svgEl('text', {
    x: safeX,
    y: trackY + trackHeight + 26,
    'text-anchor': 'middle',
    'font-size': '11',
    'font-weight': '600',
    fill: '#16a34a',
  });
  safeLabel.textContent = `🎯 Safe: ${safeTarget}t`;
  svg.appendChild(safeLabel);

  // ── National average marker ───────────────────────────────────────────
  const natX = toX(nationalAvg);

  const natLine = svgEl('line', {
    x1: natX,
    y1: trackY - 8,
    x2: natX,
    y2: trackY + trackHeight + 8,
    stroke: '#6366f1',
    'stroke-width': '2.5',
    'stroke-dasharray': '4 2',
  });
  svg.appendChild(natLine);

  const natLabel = svgEl('text', {
    x: natX,
    y: trackY - 16,
    'text-anchor': 'middle',
    'font-size': '11',
    'font-weight': '600',
    fill: '#6366f1',
  });
  natLabel.textContent = `🌍 Avg: ${nationalAvg}t`;
  svg.appendChild(natLabel);

  // ── User marker (animated) ────────────────────────────────────────────
  const userX = toX(userValue);

  // Outer glow ring
  const userGlow = svgEl('circle', {
    cx: trackPadX, // start from left, animate to userX
    cy: trackY + trackHeight / 2,
    r: 16,
    fill: 'none',
    stroke: _getUserColor(userValue, safeTarget, nationalAvg),
    'stroke-width': '2',
    opacity: '0.35',
    filter: `url(#${chartId}-glow)`,
  });
  userGlow.classList.add('gauge-marker');
  svg.appendChild(userGlow);

  // Inner marker
  const userDot = svgEl('circle', {
    cx: trackPadX,
    cy: trackY + trackHeight / 2,
    r: 10,
    fill: _getUserColor(userValue, safeTarget, nationalAvg),
    stroke: 'white',
    'stroke-width': '3',
    filter: `url(#${chartId}-glow)`,
  });
  userDot.classList.add('gauge-marker');
  svg.appendChild(userDot);

  // User value label
  const userLabel = svgEl('text', {
    x: trackPadX,
    y: trackY - 30,
    'text-anchor': 'middle',
    'font-size': '15',
    'font-weight': '700',
    fill: _getUserColor(userValue, safeTarget, nationalAvg),
  });
  userLabel.textContent = `You: ${userValue.toFixed(1)}t`;
  userLabel.classList.add('gauge-marker');
  svg.appendChild(userLabel);

  // Animate marker to position
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      userGlow.setAttribute('cx', String(userX));
      userDot.setAttribute('cx', String(userX));
      userLabel.setAttribute('x', String(userX));
    });
  });

  // ── Scale labels ──────────────────────────────────────────────────────
  const scaleStart = svgEl('text', {
    x: trackPadX,
    y: trackY + trackHeight + 38,
    'text-anchor': 'middle',
    'font-size': '10',
    fill: '#94a3b8',
  });
  scaleStart.textContent = '0t';
  svg.appendChild(scaleStart);

  const scaleEnd = svgEl('text', {
    x: trackPadX + trackWidth,
    y: trackY + trackHeight + 38,
    'text-anchor': 'middle',
    'font-size': '10',
    fill: '#94a3b8',
  });
  scaleEnd.textContent = `${scaleMax.toFixed(0)}t`;
  svg.appendChild(scaleEnd);

  container.appendChild(svg);

  // ── Accessible Data Table Fallback ────────────────────────────────────
  const table = document.createElement('table');
  table.className = 'sr-only';
  table.innerHTML = `
    <caption>Your Footprint vs Benchmarks</caption>
    <thead>
      <tr>
        <th scope="col">Metric</th>
        <th scope="col">Emissions (tons CO₂e)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Your Footprint</td>
        <td>${userValue.toFixed(2)}</td>
      </tr>
      <tr>
        <td>Safe Target</td>
        <td>${safeTarget.toFixed(2)}</td>
      </tr>
      <tr>
        <td>National Average</td>
        <td>${nationalAvg.toFixed(2)}</td>
      </tr>
    </tbody>
  `;
  container.appendChild(table);
}

/**
 * Determine user marker color based on how they compare to targets.
 * @private
 */
function _getUserColor(userValue, safeTarget, nationalAvg) {
  if (userValue <= safeTarget) return '#16a34a'; // green
  if (userValue <= safeTarget * 2) return '#84cc16'; // lime
  if (userValue <= nationalAvg) return '#eab308'; // yellow
  return '#ef4444'; // red
}
