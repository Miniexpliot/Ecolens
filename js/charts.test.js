/**
 * @fileoverview EcoLens application module: charts.test.js
 * Follows strict Google JavaScript Style Guide.
 */
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import {
  renderDonutChart,
  updateDonutChart,
  renderBarChart,
  renderComparisonGauge,
} from './charts.js';

describe('SVG Chart Renderer', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'chart-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('renderDonutChart renders correct SVG structure and tables', () => {
    const segments = [
      { label: 'Travel', value: 3.5, color: '#10b981' },
      { label: 'Home', value: 1.5, color: '#3b82f6' },
    ];

    renderDonutChart('chart-container', segments);

    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg.getAttribute('viewBox')).toBe('0 0 300 300');

    // Segments should exist and be focusable
    const donutSegments = container.querySelectorAll('.donut-segment');
    expect(donutSegments.length).toBe(2);
    expect(donutSegments[0].getAttribute('tabindex')).toBe('0');
    expect(donutSegments[0].getAttribute('role')).toBe('button');

    // Fallback screen-reader table should be rendered
    const table = container.querySelector('table.sr-only');
    expect(table).not.toBeNull();
    expect(table.textContent).toContain('Travel');
    expect(table.textContent).toContain('3.50');
  });

  test('renderDonutChart handles empty segments showing clean error state', () => {
    renderDonutChart('chart-container', []);
    const errorCard = container.querySelector('.chart-error-card');
    expect(errorCard).not.toBeNull();
    expect(errorCard.textContent).toContain('No values found');
  });

  test('updateDonutChart updates existing segments smoothly', () => {
    const segments1 = [{ label: 'Travel', value: 2.0, color: '#10b981' }];
    renderDonutChart('chart-container', segments1);

    const segments2 = [{ label: 'Travel', value: 4.0, color: '#10b981' }];
    updateDonutChart('chart-container', segments2);

    const segment = container.querySelector('.donut-segment');
    expect(segment.getAttribute('data-value')).toBe('4.00');
  });

  test('renderBarChart renders bars and comparison data', () => {
    const bars = [
      { label: 'Germany', value: 9.6, color: '#6366f1' },
      { label: 'World Average', value: 4.7, color: '#94a3b8' },
    ];

    renderBarChart('chart-container', bars);

    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();

    const rects = container.querySelectorAll('.bar-rect');
    expect(rects.length).toBe(2);
    expect(rects[0].getAttribute('tabindex')).toBe('0');
    expect(rects[0].getAttribute('role')).toBe('button');

    const table = container.querySelector('table.sr-only');
    expect(table).not.toBeNull();
    expect(table.textContent).toContain('Germany');
    expect(table.textContent).toContain('9.60');
  });

  test('renderComparisonGauge renders safe target and user average markers', () => {
    renderComparisonGauge('chart-container', 6.5, 15.0, 2.0);

    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();

    const textElements = Array.from(svg.querySelectorAll('text')).map(
      (t) => t.textContent
    );
    expect(textElements).toContain('🎯 Safe: 2t');
    expect(textElements).toContain('🌍 Avg: 15t');
    expect(textElements).toContain('You: 6.5t');
  });

  test('charts focus/blur events trigger tooltip show/hide', () => {
    const segments = [{ label: 'Travel', value: 3.5, color: '#10b981' }];
    renderDonutChart('chart-container', segments);

    const segment = container.querySelector('.donut-segment');
    const tooltip = container.querySelector('.chart-tooltip');
    expect(tooltip).not.toBeNull();
    expect(tooltip.classList.contains('visible')).toBe(false);

    // Simulate focus event
    const focusEvent = new Event('focusin', { bubbles: true });
    segment.dispatchEvent(focusEvent);
    expect(tooltip.classList.contains('visible')).toBe(true);
    expect(tooltip.innerHTML).toContain('Travel');

    // Simulate blur event
    const blurEvent = new Event('focusout', { bubbles: true });
    segment.dispatchEvent(blurEvent);
    expect(tooltip.classList.contains('visible')).toBe(false);
  });
});
