/**
 * @fileoverview EcoLens application module: tests.test.js
 * Follows strict Google JavaScript Style Guide.
 */
import { describe, test, expect } from 'vitest';
import {
  sanitizeNumber,
  sanitizeText,
  safeSetHTML,
  validateInputs,
} from './sanitize.js';
import {
  calculateTravelEmissions,
  calculateHomeEmissions,
  calculateDietWasteEmissions,
  calculateShoppingEmissions,
  calculateAllEmissions,
  calculateActionSavings,
  calculatePercentages,
} from './calculations.js';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const FIXTURE_LOW_FOOTPRINT = Object.freeze({
  travel: {
    carType: 'ev',
    commuteDistance: 10,
    commuteFrequency: 3,
    transitFrequency: 2,
    bikeWalkFrequency: 2,
  },
  home: {
    heatingCooling: 'minimal',
    unplugAppliances: 'alwaysUnplug',
    renewableEnergy: 'full',
  },
  diet: { meatConsumption: 'vegan', recycling: 'always', composting: 'yes' },
  shopping: { fastFashion: 'secondhand' },
});

const FIXTURE_HIGH_FOOTPRINT = Object.freeze({
  travel: {
    carType: 'gas',
    commuteDistance: 40,
    commuteFrequency: 5,
    transitFrequency: 0,
    bikeWalkFrequency: 0,
  },
  home: {
    heatingCooling: 'heavy',
    unplugAppliances: 'neverUnplug',
    renewableEnergy: 'none',
  },
  diet: { meatConsumption: 'daily', recycling: 'never', composting: 'no' },
  shopping: { fastFashion: 'high' },
});

const FIXTURE_AVERAGE = Object.freeze({
  travel: {
    carType: 'hybrid',
    commuteDistance: 15,
    commuteFrequency: 5,
    transitFrequency: 0,
    bikeWalkFrequency: 0,
  },
  home: {
    heatingCooling: 'moderate',
    unplugAppliances: 'sometimesUnplug',
    renewableEnergy: 'partial',
  },
  diet: {
    meatConsumption: 'frequently',
    recycling: 'sometimes',
    composting: 'no',
  },
  shopping: { fastFashion: 'moderate' },
});

// ---------------------------------------------------------------------------
// Test Suites
// ---------------------------------------------------------------------------

describe('sanitizeNumber', () => {
  test('typical in-range value passthrough', () => {
    expect(sanitizeNumber(42, 0, 100, 10)).toBe(42);
  });

  test('exactly at minimum boundary', () => {
    expect(sanitizeNumber(0, 0, 100, 10)).toBe(0);
  });

  test('exactly at maximum boundary', () => {
    expect(sanitizeNumber(100, 0, 100, 10)).toBe(100);
  });

  test('float parsed correctly', () => {
    expect(sanitizeNumber('12.7', 0, 100, 10)).toBeCloseTo(12.7, 2);
  });

  test('below minimum clamped to min', () => {
    expect(sanitizeNumber(-99, 0, 100, 10)).toBe(0);
  });

  test('above maximum clamped to max', () => {
    expect(sanitizeNumber(999, 0, 100, 10)).toBe(100);
  });

  test('NaN string returns fallback', () => {
    expect(sanitizeNumber('not-a-number', 0, 100, 15)).toBe(15);
  });

  test('null input returns fallback', () => {
    expect(sanitizeNumber(null, 0, 100, 7)).toBe(7);
  });

  test('undefined input returns fallback', () => {
    expect(sanitizeNumber(undefined, 0, 100, 5)).toBe(5);
  });

  test('Infinity treated as out-of-range', () => {
    expect(sanitizeNumber(Infinity, 0, 100, 10)).toBe(10);
  });

  test('-Infinity treated as out-of-range', () => {
    expect(sanitizeNumber(-Infinity, 0, 100, 10)).toBe(10);
  });
});

describe('sanitizeText', () => {
  test('plain text passthrough', () => {
    expect(sanitizeText('Hello World')).toBe('Hello World');
  });

  test('escapes <script> tags', () => {
    const safe = sanitizeText('<script>alert("xss")</script>');
    expect(safe).not.toContain('<script');
  });

  test('escapes HTML angle brackets', () => {
    const safe = sanitizeText('<b>bold</b>');
    expect(safe).not.toContain('<b>');
  });

  test('escapes img onerror payload', () => {
    const safe = sanitizeText('<img src=x onerror=alert(1)>');
    expect(safe).not.toContain('<img');
  });

  test('non-string returns empty string', () => {
    expect(sanitizeText(42)).toBe('');
    expect(sanitizeText(null)).toBe('');
    expect(sanitizeText({})).toBe('');
  });

  test('empty string returns empty string', () => {
    expect(sanitizeText('')).toBe('');
  });

  test('whitespace-only string preserved', () => {
    expect(sanitizeText('   ').trim()).toBe('');
  });
});

describe('safeSetHTML', () => {
  test('removes <script> tags', () => {
    const el = document.createElement('div');
    safeSetHTML(el, '<script>alert(1)</script>Hello');
    expect(el.innerHTML).toBe('Hello');
  });

  test('removes inline event handlers', () => {
    const el = document.createElement('div');
    safeSetHTML(el, '<img src="x" onerror="alert(1)">');
    expect(el.innerHTML).toBe('<img src="x">');
  });

  test('removes javascript: URIs', () => {
    const el = document.createElement('div');
    safeSetHTML(el, '<a href="javascript:alert(1)">Click</a>');
    expect(el.innerHTML).toBe('<a>Click</a>');
  });
});

describe('validateInputs', () => {
  test('full valid input passes with identity', () => {
    const result = validateInputs({
      travel: {
        carType: 'ev',
        commuteDistance: 20,
        commuteFrequency: 5,
        transitFrequency: 0,
        bikeWalkFrequency: 0,
      },
      home: {
        heatingCooling: 'none',
        unplugAppliances: 'alwaysUnplug',
        renewableEnergy: 'full',
      },
      diet: {
        meatConsumption: 'vegan',
        recycling: 'always',
        composting: 'yes',
      },
      shopping: { fastFashion: 'minimal' },
      country: 'United Kingdom',
    });
    expect(result.valid).toBe(true);
    expect(result.data.travel.carType).toBe('ev');
    expect(result.data.home.heatingCooling).toBe('none');
    expect(result.data.country).toBe('United Kingdom');
  });

  test('unknown carType defaults to gas', () => {
    const result = validateInputs({
      travel: {
        carType: 'diesel',
        commuteDistance: 10,
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
      shopping: { fastFashion: 'moderate' },
    });
    expect(result.data.travel.carType).toBe('gas');
  });

  test('unknown country defaults to United States', () => {
    const result = validateInputs({
      travel: {
        carType: 'gas',
        commuteDistance: 10,
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
      shopping: { fastFashion: 'moderate' },
      country: 'Wakanda',
    });
    expect(result.data.country).toBe('United States');
  });

  test('null returns invalid result', () => {
    const result = validateInputs(null);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('empty object returns invalid', () => {
    const result = validateInputs({});
    expect(result.valid).toBe(false);
  });

  test('XSS in carType safely defaulted', () => {
    const result = validateInputs({
      travel: {
        carType: '<img src=x onerror=alert(1)>',
        commuteDistance: 10,
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
      shopping: { fastFashion: 'moderate' },
    });
    expect(result.data.travel.carType).toBe('gas');
  });

  test('negative distance is clamped to 0', () => {
    const result = validateInputs({
      travel: {
        carType: 'gas',
        commuteDistance: -50,
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
      shopping: { fastFashion: 'moderate' },
    });
    expect(result.data.travel.commuteDistance).toBe(0);
  });

  test('excessive distance is clamped to 500', () => {
    const result = validateInputs({
      travel: {
        carType: 'gas',
        commuteDistance: 9999,
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
      shopping: { fastFashion: 'moderate' },
    });
    expect(result.data.travel.commuteDistance).toBe(500);
  });
});

describe('calculateTravelEmissions', () => {
  test('gas car typical commute', () => {
    const inputs = {
      carType: 'gas',
      commuteDistance: 15,
      commuteFrequency: 5,
      transitFrequency: 0,
      bikeWalkFrequency: 0,
    };
    expect(calculateTravelEmissions(inputs)).toBeCloseTo(3.08, 1);
  });

  test('EV produces lower emissions than gas', () => {
    const gasInputs = {
      carType: 'gas',
      commuteDistance: 20,
      commuteFrequency: 5,
      transitFrequency: 0,
      bikeWalkFrequency: 0,
    };
    const evInputs = { ...gasInputs, carType: 'ev' };
    expect(calculateTravelEmissions(gasInputs)).toBeGreaterThan(
      calculateTravelEmissions(evInputs)
    );
  });

  test('carType=none → zero car emissions', () => {
    const inputs = {
      carType: 'none',
      commuteDistance: 20,
      commuteFrequency: 5,
      transitFrequency: 0,
      bikeWalkFrequency: 0,
    };
    expect(calculateTravelEmissions(inputs)).toBeCloseTo(0, 2);
  });

  test('commuteDistance=0 → near zero emissions', () => {
    const inputs = {
      carType: 'gas',
      commuteDistance: 0,
      commuteFrequency: 5,
      transitFrequency: 0,
      bikeWalkFrequency: 0,
    };
    expect(calculateTravelEmissions(inputs)).toBeCloseTo(0, 2);
  });

  test('hybrid emits between EV and gas', () => {
    const base = {
      commuteDistance: 20,
      commuteFrequency: 5,
      transitFrequency: 0,
      bikeWalkFrequency: 0,
    };
    const evVal = calculateTravelEmissions({ ...base, carType: 'ev' });
    const hybVal = calculateTravelEmissions({ ...base, carType: 'hybrid' });
    const gasVal = calculateTravelEmissions({ ...base, carType: 'gas' });
    expect(evVal).toBeLessThan(hybVal);
    expect(hybVal).toBeLessThan(gasVal);
  });
});

describe('calculateHomeEmissions', () => {
  test('moderate settings baseline', () => {
    const inputs = {
      heatingCooling: 'moderate',
      unplugAppliances: 'sometimesUnplug',
      renewableEnergy: 'none',
    };
    expect(calculateHomeEmissions(inputs)).toBeCloseTo(2.0, 1);
  });

  test('full renewable drastically reduces output', () => {
    const heavyFossil = {
      heatingCooling: 'heavy',
      unplugAppliances: 'neverUnplug',
      renewableEnergy: 'none',
    };
    const fullRenew = {
      heatingCooling: 'heavy',
      unplugAppliances: 'neverUnplug',
      renewableEnergy: 'full',
    };
    expect(calculateHomeEmissions(heavyFossil)).toBeGreaterThan(
      calculateHomeEmissions(fullRenew) * 5
    );
  });

  test('heatingCooling=none + full renewable', () => {
    const inputs = {
      heatingCooling: 'none',
      unplugAppliances: 'alwaysUnplug',
      renewableEnergy: 'full',
    };
    expect(calculateHomeEmissions(inputs)).toBeCloseTo(0.06, 2);
  });
});

describe('calculateDietWasteEmissions', () => {
  test('typical omnivore', () => {
    const inputs = {
      meatConsumption: 'frequently',
      recycling: 'sometimes',
      composting: 'no',
    };
    expect(calculateDietWasteEmissions(inputs)).toBeCloseTo(2.8, 1);
  });

  test('vegan with full eco habits', () => {
    const inputs = {
      meatConsumption: 'vegan',
      recycling: 'always',
      composting: 'yes',
    };
    expect(calculateDietWasteEmissions(inputs)).toBeLessThan(1.5);
  });

  test('daily meat worst-case', () => {
    const inputs = {
      meatConsumption: 'daily',
      recycling: 'never',
      composting: 'no',
    };
    expect(calculateDietWasteEmissions(inputs)).toBeCloseTo(3.8, 1);
  });
});

describe('calculateShoppingEmissions', () => {
  test('moderate returns 0.5', () => {
    expect(calculateShoppingEmissions({ fastFashion: 'moderate' })).toBeCloseTo(
      0.5,
      2
    );
  });
});

describe('calculateAllEmissions', () => {
  test('low footprint fixture totals < 4t', () => {
    expect(calculateAllEmissions(FIXTURE_LOW_FOOTPRINT).total).toBeLessThan(4);
  });

  test('high footprint fixture totals > 10t', () => {
    expect(calculateAllEmissions(FIXTURE_HIGH_FOOTPRINT).total).toBeGreaterThan(
      10
    );
  });

  test('total equals sum of categories', () => {
    const r = calculateAllEmissions(FIXTURE_AVERAGE);
    const sum = r.travel + r.home + r.diet + r.shopping;
    expect(r.total).toBeCloseTo(sum, 2);
  });
});

describe('calculatePercentages', () => {
  test('percentages sum to ~100', () => {
    const e = calculateAllEmissions(FIXTURE_AVERAGE);
    const pct = calculatePercentages(e);
    const sum = pct.travel + pct.home + pct.diet + pct.shopping;
    expect(sum).toBeGreaterThanOrEqual(98);
    expect(sum).toBeLessThanOrEqual(102);
  });

  test('zero total returns equal 25% split', () => {
    const pct = calculatePercentages({
      travel: 0,
      home: 0,
      diet: 0,
      shopping: 0,
      total: 0,
    });
    expect(pct.travel).toBe(25);
    expect(pct.home).toBe(25);
    expect(pct.diet).toBe(25);
    expect(pct.shopping).toBe(25);
  });
});

describe('calculateActionSavings', () => {
  test('savings are non-negative', () => {
    const action = {
      id: 'test-action',
      category: 'travel',
      baseSavingsKg: 500,
    };
    const emissions = {
      travel: 3.0,
      home: 2.0,
      diet: 2.5,
      shopping: 0.5,
      total: 8.0,
    };
    expect(calculateActionSavings(action, emissions)).toBeGreaterThanOrEqual(0);
  });

  test('extreme emissions clamp scale to 2.0', () => {
    const action = { id: 'clamp-max', category: 'home', baseSavingsKg: 1000 };
    const emissions = {
      travel: 3.0,
      home: 99.0,
      diet: 2.5,
      shopping: 0.5,
      total: 105.0,
    };
    expect(calculateActionSavings(action, emissions)).toBeCloseTo(2.0, 1);
  });
});
