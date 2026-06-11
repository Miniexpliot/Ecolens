/**
 * @fileoverview EcoLens application module: state.test.js
 * Follows strict Google JavaScript Style Guide.
 */
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { Store } from './state.js';

describe('Store State Management', () => {
  beforeEach(() => {
    Store.reset();
    Store.setState({
      inputs: {
        travel: {
          carType: 'gas',
          commuteDistance: 15,
          commuteFrequency: 5,
          transitFrequency: 0,
          bikeWalkFrequency: 0,
        },
        home: {
          heatingCooling: 'moderate',
          unplugAppliances: 'sometimesUnplug',
          renewableEnergy: 'none',
        },
        diet: {
          meatConsumption: 'frequently',
          recycling: 'sometimes',
          composting: 'no',
        },
        shopping: {
          fastFashion: 'moderate',
        },
        country: 'United States',
      },
    });
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('getState returns initial default state structure', () => {
    const state = Store.getState();
    expect(state.currentView).toBe('home');
    expect(state.reportGenerated).toBe(false);
    expect(state.inputs.travel.carType).toBe('gas');
    expect(state.emissions).toBeNull();
  });

  test('setState updates shallow properties', () => {
    Store.setState({ currentView: 'calculator' });
    expect(Store.getState().currentView).toBe('calculator');
  });

  test('setState performs deep merge on inputs category objects', () => {
    Store.setState({
      inputs: {
        travel: { carType: 'ev', commuteDistance: 88 },
      },
    });
    const state = Store.getState();
    expect(state.inputs.travel.carType).toBe('ev');
    expect(state.inputs.travel.commuteDistance).toBe(88);
    // Unspecified travel attributes should remain unmodified (retaining defaults)
    expect(state.inputs.travel.commuteFrequency).toBe(5);
  });

  test('subscribe registers callback and calls it on changes', () => {
    const listener = vi.fn();
    const unsubscribe = Store.subscribe(listener);

    Store.setState({ currentView: 'climate101' });
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    Store.setState({ currentView: 'home' });
    // Should not be called again after unsubscribing
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test('generateReport calculates emissions and updates badges', () => {
    Store.setState({
      inputs: {
        travel: { carType: 'ev', commuteFrequency: 1, transitFrequency: 5 },
        diet: { meatConsumption: 'vegan' },
      },
    });

    Store.generateReport();
    const state = Store.getState();
    expect(state.reportGenerated).toBe(true);
    expect(state.emissions).not.toBeNull();
    expect(state.emissions.total).toBeGreaterThan(0);
    expect(state.percentages).not.toBeNull();

    // Badges should be unlocked
    expect(state.unlockedBadges).toContainEqual(
      expect.objectContaining({ id: 'transit_hero' })
    );
    expect(state.unlockedBadges).toContainEqual(
      expect.objectContaining({ id: 'plant_pioneer' })
    );
  });

  test('toggleAction toggles selected items and updates projected scores', () => {
    Store.setState({
      inputs: {
        travel: { carType: 'gas', commuteDistance: 25 },
      },
    });
    Store.generateReport();

    const originalProjected = Store.getState().projectedScore;
    expect(Store.getState().totalSavings).toBe(0);

    // Toggle public transport action
    Store.toggleAction('public-transit');
    expect(Store.getState().checkedActions.has('public-transit')).toBe(true);
    expect(Store.getState().totalSavings).toBeGreaterThan(0);
    expect(Store.getState().projectedScore).toBeLessThan(originalProjected);

    // Toggle off
    Store.toggleAction('public-transit');
    expect(Store.getState().checkedActions.has('public-transit')).toBe(false);
    expect(Store.getState().totalSavings).toBe(0);
  });

  test('getRelevantActions filters items matching input conditions', () => {
    Store.setState({
      inputs: {
        travel: { carType: 'gas' },
      },
    });
    Store.generateReport();

    const actions = Store.getRelevantActions();
    expect(actions.length).toBeGreaterThan(0);
    // Action to switch gas car to hybrid should be relevant
    const gasCarAction = actions.find((a) => a.id === 'switch-hybrid');
    expect(gasCarAction).toBeDefined();
  });

  test('getNationalAverage returns correct value for country', () => {
    Store.setState({ inputs: { country: 'Germany' } });
    expect(Store.getNationalAverage()).toBe(8.0);

    Store.setState({ inputs: { country: 'Atlantis' } }); // Unknown country
    expect(Store.getNationalAverage()).toBe(4.7); // World average fallback
  });

  test('reset clears report outcomes while preserving inputs', () => {
    Store.setState({
      inputs: { travel: { carType: 'ev' } },
    });
    Store.generateReport();
    Store.reset();

    const state = Store.getState();
    expect(state.reportGenerated).toBe(false);
    expect(state.emissions).toBeNull();
    expect(state.inputs.travel.carType).toBe('ev');
  });
});
