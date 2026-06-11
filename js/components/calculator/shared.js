/**
 * @fileoverview EcoLens application module: shared.js
 * Follows strict Google JavaScript Style Guide.
 */
import { Store } from '../../state.js';

/**
 * Shared step definitions for the calculator.
 * @type {Array<{id: number, label: string, icon: string}>}
 */
export const STEPS = [
  { id: 1, label: 'Daily Travel', icon: 'travel' },
  { id: 2, label: 'Home Energy', icon: 'home' },
  { id: 3, label: 'Diet & Waste', icon: 'diet' },
  { id: 4, label: 'Shopping & Review', icon: 'shopping' },
];

/**
 * Update the global store with a single input change.
 * Routes flat form keys into the correct nested state structure.
 * @param {string} key - Input key
 * @param {*} value - Updated value
 */
export function updateInput(key, value) {
  if (value === undefined) return;
  const state = Store.getState();

  const categoryMap = {
    carType: { category: 'travel', stateKey: 'carType' },
    commuteDistance: { category: 'travel', stateKey: 'commuteDistance' },
    commuteDays: { category: 'travel', stateKey: 'commuteFrequency' },
    transitDays: { category: 'travel', stateKey: 'transitFrequency' },
    bikeDays: { category: 'travel', stateKey: 'bikeWalkFrequency' },

    heatingUsage: { category: 'home', stateKey: 'heatingCooling' },
    unplugHabit: { category: 'home', stateKey: 'unplugAppliances' },
    renewableEnergy: { category: 'home', stateKey: 'renewableEnergy' },

    meatConsumption: { category: 'diet', stateKey: 'meatConsumption' },
    recycling: { category: 'diet', stateKey: 'recycling' },
    composting: { category: 'diet', stateKey: 'composting' },

    fastFashion: { category: 'shopping', stateKey: 'fastFashion' },
    country: { category: 'root', stateKey: 'country' },
  };

  const mapping = categoryMap[key];
  if (!mapping) return;

  const { category, stateKey } = mapping;

  if (category === 'root') {
    Store.setState({
      inputs: { ...state.inputs, [stateKey]: value },
    });
  } else {
    Store.setState({
      inputs: {
        ...state.inputs,
        [category]: {
          ...state.inputs[category],
          [stateKey]: value,
        },
      },
    });
  }
}

/**
 * Formats a value using a translation map.
 * @param {string} val - Key to look up
 * @param {Object} map - Translation dictionary
 * @returns {string} Formatted label
 */
export function formatValue(val, map) {
  if (!val) return map[Object.keys(map)[0]] || '—';
  return map[val] || val;
}

/**
 * Wrap a form element created by createSafeSelect / createSafeNumberInput
 * inside a .form-group container for consistent layout.
 *
 * @param {HTMLElement} element - The form element to wrap.
 * @returns {HTMLDivElement} The wrapped form group element.
 */
export function makeFormGroup(element) {
  const group = document.createElement('div');
  group.className = 'form-group';
  group.appendChild(element);
  return group;
}
