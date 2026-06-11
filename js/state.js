/**
 * @fileoverview Reactive State Management Store
 *
 * Implements a lightweight pub/sub store with memoisation for expensive
 * emission calculations.  All UI components subscribe to the store and
 * re-render reactively when state changes.
 *
 * @module state
 */

import { calculateAllEmissions, calculateActionSavings, calculatePercentages } from './calculations.js';
import { validateInputs } from './sanitize.js';
import { ACTION_ITEMS, SAFE_TARGET, NATIONAL_AVERAGES } from './constants.js';

// ---------------------------------------------------------------------------
// Private state
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'ecoLensState';

/** @type {import('./types.js').ApplicationState} Default application state. */
const defaultState = {
  currentView: 'home', // 'home' | 'climate101' | 'calculator' | 'results'
  inputs: {
    travel: {
      carType: 'gas',
      commuteDistance: 15,
      commuteFrequency: 5,
      transitFrequency: 0,
      bikeWalkFrequency: 0
    },
    home: {
      heatingCooling: 'moderate',
      unplugAppliances: 'sometimesUnplug',
      renewableEnergy: 'none'
    },
    diet: {
      meatConsumption: 'frequently',
      recycling: 'sometimes',
      composting: 'no'
    },
    shopping: {
      fastFashion: 'moderate'
    },
    country: 'United States'
  },
  emissions: null,
  percentages: null,
  checkedActions: new Set(),
  totalSavings: 0,
  projectedScore: 0,
  reportGenerated: false,
  unlockedBadges: []
};

/**
 * Load persisted state from localStorage, validating saved inputs
 * and recomputing derived state to prevent tampered data injection.
 * @returns {import('./types.js').ApplicationState} The sanitized application state.
 */
function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);

      // Restore Set (JSON.stringify converts Set → Array)
      parsed.checkedActions = new Set(parsed.checkedActions || []);

      // Validate inputs using our strict whitelist
      const validation = validateInputs(parsed.inputs);
      const safeInputs = validation.data;

      // Recompute derived fields rather than trusting stored values
      let emissions = null;
      let percentages = null;
      if (parsed.reportGenerated) {
        emissions = calculateAllEmissions(safeInputs);
        percentages = calculatePercentages(emissions);
      }

      return {
        ...defaultState,
        ...parsed,
        inputs: safeInputs,
        emissions,
        percentages,
        checkedActions: parsed.checkedActions,
        unlockedBadges: Array.isArray(parsed.unlockedBadges)
          ? parsed.unlockedBadges
          : [...defaultState.unlockedBadges]
      };
    }
  } catch (e) {
    console.warn('Failed to load state from local storage', e);
  }

  // Cold start: clone defaults manually to avoid JSON.stringify destroying the Set
  return {
    ...defaultState,
    inputs: JSON.parse(JSON.stringify(defaultState.inputs)),
    checkedActions: new Set(defaultState.checkedActions),
    unlockedBadges: [...defaultState.unlockedBadges]
  };
}

function saveState() {
  try {
    const stateToSave = { ..._state, checkedActions: Array.from(_state.checkedActions) };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  } catch (e) {
    console.warn('Failed to save state to local storage', e);
  }
}

/** @type {Object} Internal application state — never exposed directly. */
const _state = loadState();

// ---------------------------------------------------------------------------
// Memoisation cache
// ---------------------------------------------------------------------------

/** @type {{ key: string, value: Object|null }} */
let _emissionsCache = { key: '', value: null };

// ---------------------------------------------------------------------------
// Subscriber management
// ---------------------------------------------------------------------------

/** @type {Set<Function>} */
const _listeners = new Set();

/**
 * Notify all registered listeners with a shallow copy of the current state.
 * Errors in individual listeners are caught so one bad subscriber cannot
 * break the others.
 * @private
 */
function _notifyListeners() {
  saveState();
  _listeners.forEach(fn => {
    try {
      fn({ ..._state });
    } catch (e) {
      console.error('State listener error:', e);
    }
  });
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Compute emissions from current inputs, with memoisation.
 * @private
 * @returns {Object} Emissions breakdown
 */
function _computeEmissions() {
  const key = JSON.stringify(_state.inputs);
  if (_emissionsCache.key === key && _emissionsCache.value) {
    return _emissionsCache.value;
  }
  const result = calculateAllEmissions(_state.inputs);
  _emissionsCache = { key, value: result };
  return result;
}

/**
 * Recalculate total savings and projected score based on checked action items.
 * @private
 */
function _recalculateSavings() {
  if (!_state.emissions) return;

  let totalSavings = 0;
  const relevantActions = ACTION_ITEMS.filter(item => item.condition(_state.inputs));

  relevantActions.forEach(item => {
    if (_state.checkedActions.has(item.id)) {
      totalSavings += calculateActionSavings(item, _state.emissions);
    }
  });

  _state.totalSavings = Math.round(totalSavings * 100) / 100;
  _state.projectedScore = Math.max(
    0,
    Math.round((_state.emissions.total - totalSavings) * 100) / 100
  );
}

/**
 * Calculate which badges the user has unlocked based on inputs and emissions.
 * @private
 */
function _calculateBadges() {
  const badges = [];
  const i = _state.inputs;

  if (i.travel.transitFrequency >= 3 || i.travel.bikeWalkFrequency >= 3) {
    badges.push({ id: 'transit_hero', name: 'Transit Hero', icon: '🚇', description: 'Uses sustainable transport 3+ days a week.' });
  }
  if (i.diet.meatConsumption === 'vegetarian' || i.diet.meatConsumption === 'vegan') {
    badges.push({ id: 'plant_pioneer', name: 'Plant-Based Pioneer', icon: '🌱', description: 'Maintains a low-impact diet.' });
  }
  if (i.home.renewableEnergy === 'full' || i.home.heatingCooling === 'minimal' || i.home.heatingCooling === 'none') {
    badges.push({ id: 'energy_saver', name: 'Energy Saver', icon: '⚡', description: 'Highly efficient home energy usage.' });
  }
  if (_state.emissions && _state.emissions.total < SAFE_TARGET * 1.5) {
    badges.push({ id: 'eco_champion', name: 'Eco Champion', icon: '🏆', description: 'Total footprint near the Paris Agreement target.' });
  }

  _state.unlockedBadges = badges;
}

// ---------------------------------------------------------------------------
// Public Store API
// ---------------------------------------------------------------------------

export const Store = {
  /**
   * Return a shallow copy of the current state.
   * @returns {Object} Current state snapshot
   */
  getState() {
    return { ..._state };
  },

  /**
   * Update state partially.  If `partial.inputs` is provided the nested
   * category objects are merged (not replaced).  Derived values are
   * recalculated automatically whenever a report has already been generated.
   *
   * @param {Object} partial – Fields to merge into state
   */
  setState(partial) {
    // Copy to avoid mutating the caller's object
    const updates = { ...partial };

    // Deep merge inputs if provided
    if (updates.inputs) {
      Object.keys(updates.inputs).forEach(category => {
        if (_state.inputs[category] && typeof _state.inputs[category] === 'object') {
          _state.inputs[category] = { ..._state.inputs[category], ...updates.inputs[category] };
        } else {
          _state.inputs[category] = updates.inputs[category];
        }
      });
      delete updates.inputs;
    }

    // Apply other state changes
    Object.assign(_state, partial);

    // Recalculate derived values if we already have a generated report
    if (_state.reportGenerated || _state.emissions) {
      _state.emissions = _computeEmissions();
      _state.percentages = calculatePercentages(_state.emissions);
      _recalculateSavings();
    }

    _notifyListeners();
  },

  /**
   * Generate the initial report from current inputs.
   * Resets checked actions and savings.
   */
  generateReport() {
    _state.emissions = _computeEmissions();
    _state.percentages = calculatePercentages(_state.emissions);
    _state.reportGenerated = true;
    _state.checkedActions = new Set();
    _state.totalSavings = 0;
    _state.projectedScore = _state.emissions.total;
    _calculateBadges();
    _notifyListeners();
  },

  /**
   * Toggle an action item checkbox.  Recalculates savings automatically.
   * @param {string} actionId – The action item's id
   */
  toggleAction(actionId) {
    if (_state.checkedActions.has(actionId)) {
      _state.checkedActions.delete(actionId);
    } else {
      _state.checkedActions.add(actionId);
    }
    _recalculateSavings();
    _notifyListeners();
  },

  /**
   * Subscribe to state changes.
   * @param {Function} listener – Callback invoked on every state change
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    _listeners.add(listener);
    return () => _listeners.delete(listener);
  },

  /**
   * Get action items that are relevant to the user's current profile,
   * each annotated with an adjusted savingsTons value.
   *
   * @returns {Array<Object>} Relevant action items with `savingsTons`
   */
  getRelevantActions() {
    if (!_state.emissions) return [];
    return ACTION_ITEMS
      .filter(item => item.condition(_state.inputs))
      .map(item => ({
        ...item,
        savingsTons: calculateActionSavings(item, _state.emissions)
      }));
  },

  /**
   * Get the national average for the selected country.
   * @returns {number} Tons CO₂e per capita per year
   */
  getNationalAverage() {
    return NATIONAL_AVERAGES[_state.inputs.country] || NATIONAL_AVERAGES['World Average'];
  },

  /**
   * Reset state to defaults (keeps input values but clears results).
   */
  reset() {
    _state.emissions = null;
    _state.percentages = null;
    _state.checkedActions = new Set();
    _state.totalSavings = 0;
    _state.projectedScore = 0;
    _state.reportGenerated = false;
    _state.unlockedBadges = [];
    _emissionsCache = { key: '', value: null };
    _notifyListeners();
  }
};
