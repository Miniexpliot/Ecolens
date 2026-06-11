/**
 * @fileoverview Unit tests for the Action Plan helper functions.
 * Covers category grouping, metric calculation, memoization,
 * and accessible card rendering.
 */
import { describe, test, expect, beforeEach, vi } from 'vitest';
import {
  groupByCategory,
  calculateMetrics,
  buildActionCard,
} from './actionPlanHelpers.js';

// Mock the Store module
vi.mock('../state.js', () => ({
  Store: {
    getState: vi.fn(() => ({
      projectedScore: 5.5,
      checkedActions: new Set(['action-1']),
    })),
    toggleAction: vi.fn(),
  },
}));

// Mock the sanitize module
vi.mock('../sanitize.js', () => ({
  sanitizeSafeHTML: vi.fn((str) => str),
}));

describe('actionPlanHelpers', () => {
  describe('groupByCategory', () => {
    test('groups actions by their category property', () => {
      const actions = [
        { id: '1', category: 'travel', title: 'Drive less' },
        { id: '2', category: 'diet', title: 'Eat less meat' },
        { id: '3', category: 'travel', title: 'Use public transit' },
      ];

      const result = groupByCategory(actions);

      expect(result.travel).toHaveLength(2);
      expect(result.diet).toHaveLength(1);
      expect(result.travel[0].id).toBe('1');
      expect(result.travel[1].id).toBe('3');
    });

    test('assigns "other" category when none is specified', () => {
      const actions = [
        { id: '1', title: 'Mystery action' },
      ];

      const result = groupByCategory(actions);

      expect(result.other).toHaveLength(1);
    });

    test('returns empty object for empty input', () => {
      const result = groupByCategory([]);
      expect(Object.keys(result)).toHaveLength(0);
    });

    test('memoizes result for the same input reference', () => {
      const actions = [
        { id: '1', category: 'home', title: 'Insulate' },
      ];

      const result1 = groupByCategory(actions);
      const result2 = groupByCategory(actions);

      expect(result1).toBe(result2); // Same reference = cache hit
    });

    test('recomputes for a different input reference', () => {
      const actions1 = [
        { id: '1', category: 'home', title: 'Insulate' },
      ];
      const actions2 = [
        { id: '2', category: 'diet', title: 'Compost' },
      ];

      const result1 = groupByCategory(actions1);
      const result2 = groupByCategory(actions2);

      expect(result1).not.toBe(result2);
      expect(result2.diet).toHaveLength(1);
    });
  });

  describe('calculateMetrics', () => {
    test('computes totalPotential from savingsTons', () => {
      const actions = [
        { id: '1', savingsTons: 1.5 },
        { id: '2', savingsTons: 2.5 },
      ];

      const metrics = calculateMetrics(actions);

      expect(metrics.totalPotential).toBe(4.0);
    });

    test('handles missing savingsTons gracefully', () => {
      const actions = [
        { id: '1' },
        { id: '2', savingsTons: 3.0 },
      ];

      const metrics = calculateMetrics(actions);

      expect(metrics.totalPotential).toBe(3.0);
    });

    test('returns projectedScore from Store state', () => {
      const actions = [{ id: '1', savingsTons: 1 }];
      const metrics = calculateMetrics(actions);

      expect(metrics.projectedScore).toBe(5.5);
    });

    test('returns checkedCount from Store state', () => {
      const actions = [{ id: '1', savingsTons: 1 }];
      const metrics = calculateMetrics(actions);

      expect(metrics.checkedCount).toBe(1);
    });
  });

  describe('buildActionCard', () => {
    const mockAction = {
      id: 'test-1',
      title: 'Test Action',
      description: 'A test description',
      savingsTons: 1.25,
    };

    test('creates a div element with correct class', () => {
      const card = buildActionCard(mockAction, false);

      expect(card.tagName).toBe('DIV');
      expect(card.className).toBe('action-item');
    });

    test('adds checked class when isChecked is true', () => {
      const card = buildActionCard(mockAction, true);

      expect(card.className).toContain('action-item--checked');
    });

    test('sets role="listitem" on the card', () => {
      const card = buildActionCard(mockAction, false);

      expect(card.getAttribute('role')).toBe('listitem');
    });

    test('sets aria-checked attribute correctly', () => {
      const unchecked = buildActionCard(mockAction, false);
      const checked = buildActionCard(mockAction, true);

      expect(unchecked.getAttribute('aria-checked')).toBe('false');
      expect(checked.getAttribute('aria-checked')).toBe('true');
    });

    test('renders the action title and description', () => {
      const card = buildActionCard(mockAction, false);

      expect(card.querySelector('.action-item__title').textContent)
        .toBe('Test Action');
      expect(card.querySelector('.action-item__description').textContent)
        .toBe('A test description');
    });

    test('renders the savings amount', () => {
      const card = buildActionCard(mockAction, false);
      const savings = card.querySelector('.action-item__savings');

      expect(savings.textContent).toContain('1.25');
    });

    test('makes the card keyboard-focusable (tabindex=0)', () => {
      const card = buildActionCard(mockAction, false);

      expect(card.getAttribute('tabindex')).toBe('0');
    });

    test('checkbox has correct id and aria-label', () => {
      const card = buildActionCard(mockAction, false);
      const checkbox = card.querySelector('input[type="checkbox"]');

      expect(checkbox.id).toBe('action-test-1');
      expect(checkbox.getAttribute('aria-label')).toBe('Test Action');
    });

    test('checkbox toggles on card click', () => {
      const card = buildActionCard(mockAction, false);
      const checkbox = card.querySelector('input[type="checkbox"]');

      // Click the card's content area (not the checkbox directly)
      const content = card.querySelector('.action-item__content');
      content.click();

      expect(checkbox.checked).toBe(true);
    });
  });
});
