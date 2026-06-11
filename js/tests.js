/**
 * @fileoverview In-Browser Unit Test Suite for the Debug Panel.
 *
 * This module is loaded dynamically by `debug-panel.js` when the user clicks
 * "Run Tests" in the on-page debug panel (Ctrl+Shift+D). It runs entirely
 * in the browser without build tools, complementing the Vitest-based CI
 * test suites in `*.test.js` files.
 *
 * Test categories:
 *   1. Happy-path   — Typical valid inputs produce expected outputs.
 *   2. Edge-cases   — Boundaries, zeros, extreme values, empty objects.
 *   3. Failure-path — Null inputs, invalid types, out-of-range values.
 *   4. Security     — XSS payloads, injection strings, oversized inputs.
 *
 * @module tests
 */

import { TestRunner } from './test-runner.js';
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
// Fixtures — reusable, well-typed test data
// ---------------------------------------------------------------------------

/** @type {import('./calculations.js').AllInputs} */
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

/** @type {import('./calculations.js').AllInputs} */
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

/** @type {import('./calculations.js').AllInputs} */
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
// Test suite
// ---------------------------------------------------------------------------

/**
 * Registers and runs the full EcoLens test suite.
 * Exported so `app.js` can invoke it via the debug panel.
 *
 * @returns {Promise<import('./test-runner.js').RunSummary>} Suite run summary
 */
export async function runAllTests() {
  const runner = new TestRunner();

  // ==========================================================================
  // SECTION A — sanitizeNumber
  // ==========================================================================

  runner.test(
    'sanitizeNumber [happy]: typical in-range value passthrough',
    (t) => {
      t.assertEqual(sanitizeNumber(42, 0, 100, 10), 42);
    }
  );

  runner.test('sanitizeNumber [edge]: exactly at minimum boundary', (t) => {
    t.assertEqual(sanitizeNumber(0, 0, 100, 10), 0);
  });

  runner.test('sanitizeNumber [edge]: exactly at maximum boundary', (t) => {
    t.assertEqual(sanitizeNumber(100, 0, 100, 10), 100);
  });

  runner.test('sanitizeNumber [edge]: float parsed correctly', (t) => {
    t.assertClose(sanitizeNumber('12.7', 0, 100, 10), 12.7);
  });

  runner.test('sanitizeNumber [failure]: below minimum clamped to min', (t) => {
    t.assertEqual(sanitizeNumber(-99, 0, 100, 10), 0);
  });

  runner.test('sanitizeNumber [failure]: above maximum clamped to max', (t) => {
    t.assertEqual(sanitizeNumber(999, 0, 100, 10), 100);
  });

  runner.test('sanitizeNumber [failure]: NaN string returns fallback', (t) => {
    t.assertEqual(sanitizeNumber('not-a-number', 0, 100, 15), 15);
  });

  runner.test('sanitizeNumber [failure]: null input returns fallback', (t) => {
    t.assertEqual(sanitizeNumber(null, 0, 100, 7), 7);
  });

  runner.test(
    'sanitizeNumber [failure]: undefined input returns fallback',
    (t) => {
      t.assertEqual(sanitizeNumber(undefined, 0, 100, 5), 5);
    }
  );

  runner.test(
    'sanitizeNumber [security]: Infinity treated as out-of-range',
    (t) => {
      t.assertEqual(sanitizeNumber(Infinity, 0, 100, 10), 10);
    }
  );

  runner.test(
    'sanitizeNumber [security]: -Infinity treated as out-of-range',
    (t) => {
      t.assertEqual(sanitizeNumber(-Infinity, 0, 100, 10), 10);
    }
  );

  // ==========================================================================
  // SECTION B — sanitizeText
  // ==========================================================================

  runner.test('sanitizeText [happy]: plain text passthrough', (t) => {
    const result = sanitizeText('Hello World');
    t.assertEqual(result, 'Hello World');
  });

  runner.test('sanitizeText [security]: escapes <script> tags', (t) => {
    const payload = '<script>alert("xss")</script>';
    const safe = sanitizeText(payload);
    t.assert(
      !safe.includes('<script'),
      'Raw <script> must not appear in output'
    );
  });

  runner.test('sanitizeText [security]: escapes HTML angle brackets', (t) => {
    const result = sanitizeText('<b>bold</b>');
    t.assert(
      result.includes('&lt;b&gt;') || !result.includes('<b>'),
      'Angle brackets must be escaped'
    );
  });

  runner.test('sanitizeText [security]: escapes img onerror payload', (t) => {
    const payload = '<img src=x onerror=alert(1)>';
    const safe = sanitizeText(payload);
    t.assert(
      !safe.includes('<img'),
      'Unescaped img tags must not appear in output'
    );
  });

  runner.test(
    'sanitizeText [failure]: non-string returns empty string',
    (t) => {
      t.assertEqual(sanitizeText(42), '');
      t.assertEqual(sanitizeText(null), '');
      t.assertEqual(sanitizeText({}), '');
    }
  );

  runner.test('sanitizeText [edge]: empty string returns empty string', (t) => {
    t.assertEqual(sanitizeText(''), '');
  });

  runner.test('sanitizeText [edge]: whitespace-only string preserved', (t) => {
    const result = sanitizeText('   ');
    t.assertEqual(result.trim(), '');
  });

  // ==========================================================================
  // SECTION B2 — safeSetHTML
  // ==========================================================================

  runner.test('safeSetHTML [security]: removes <script> tags', (t) => {
    const el = document.createElement('div');
    safeSetHTML(el, '<script>alert(1)</script>Hello');
    t.assertEqual(
      el.innerHTML,
      'Hello',
      'Script tags should be removed completely'
    );
  });

  runner.test('safeSetHTML [security]: removes inline event handlers', (t) => {
    const el = document.createElement('div');
    safeSetHTML(el, '<img src="x" onerror="alert(1)">');
    t.assertEqual(
      el.innerHTML,
      '<img src="x">',
      'onerror attribute should be stripped'
    );
  });

  runner.test('safeSetHTML [security]: removes javascript: URIs', (t) => {
    const el = document.createElement('div');
    safeSetHTML(el, '<a href="javascript:alert(1)">Click</a>');
    t.assertEqual(
      el.innerHTML,
      '<a>Click</a>',
      'javascript: URI should be stripped'
    );
  });

  // ==========================================================================
  // SECTION C — validateInputs
  // ==========================================================================

  runner.test(
    'validateInputs [happy]: full valid input passes with identity',
    (t) => {
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
      t.assert(result.valid, 'Valid input should produce valid: true');
      t.assertEqual(result.data.travel.carType, 'ev');
      t.assertEqual(result.data.home.heatingCooling, 'none');
      t.assertEqual(result.data.country, 'United Kingdom');
    }
  );

  runner.test('validateInputs [edge]: unknown carType defaults to gas', (t) => {
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
    t.assertEqual(
      result.data.travel.carType,
      'gas',
      'Unknown carType should default to gas'
    );
  });

  runner.test(
    'validateInputs [edge]: unknown country defaults to United States',
    (t) => {
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
      t.assertEqual(result.data.country, 'United States');
    }
  );

  runner.test('validateInputs [failure]: null returns invalid result', (t) => {
    const result = validateInputs(null);
    t.assert(!result.valid, 'null input should return valid: false');
    t.assert(
      Array.isArray(result.errors) && result.errors.length > 0,
      'Should populate errors array'
    );
  });

  runner.test('validateInputs [failure]: empty object returns invalid', (t) => {
    const result = validateInputs({});
    t.assert(!result.valid, 'Empty object should return valid: false');
  });

  runner.test(
    'validateInputs [security]: XSS in carType safely defaulted',
    (t) => {
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
      t.assertEqual(
        result.data.travel.carType,
        'gas',
        'XSS payload in carType must be neutralised to default'
      );
    }
  );

  runner.test(
    'validateInputs [boundary]: negative distance is clamped to 0',
    (t) => {
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
      t.assertEqual(
        result.data.travel.commuteDistance,
        0,
        'Negative distance must be clamped to minimum (0)'
      );
    }
  );

  runner.test(
    'validateInputs [boundary]: excessive distance is clamped to 500',
    (t) => {
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
      t.assertEqual(
        result.data.travel.commuteDistance,
        500,
        'Excessive distance must be clamped to maximum (500)'
      );
    }
  );

  // ==========================================================================
  // SECTION D — calculateTravelEmissions
  // ==========================================================================

  runner.test(
    'calculateTravelEmissions [happy]: gas car typical commute',
    (t) => {
      const inputs = {
        carType: 'gas',
        commuteDistance: 15,
        commuteFrequency: 5,
        transitFrequency: 0,
        bikeWalkFrequency: 0,
      };
      const result = calculateTravelEmissions(inputs);
      // 15mi × 2 × 0.411 × 5 × 50 = 3082.5 kg = 3.08 tons
      t.assertClose(
        result,
        3.08,
        0.15,
        'Gas car commute should produce expected emissions'
      );
    }
  );

  runner.test(
    'calculateTravelEmissions [happy]: EV produces lower emissions than gas',
    (t) => {
      const gasInputs = {
        carType: 'gas',
        commuteDistance: 20,
        commuteFrequency: 5,
        transitFrequency: 0,
        bikeWalkFrequency: 0,
      };
      const evInputs = { ...gasInputs, carType: 'ev' };
      t.assert(
        calculateTravelEmissions(gasInputs) >
          calculateTravelEmissions(evInputs),
        'Gas must exceed EV'
      );
    }
  );

  runner.test(
    'calculateTravelEmissions [edge]: carType=none → zero car emissions',
    (t) => {
      const inputs = {
        carType: 'none',
        commuteDistance: 20,
        commuteFrequency: 5,
        transitFrequency: 0,
        bikeWalkFrequency: 0,
      };
      // Still has transit = 0, bike = 0, so all car travel = 0
      const result = calculateTravelEmissions(inputs);
      t.assert(result >= 0, 'Emissions cannot be negative');
      t.assertClose(result, 0, 0.01, 'No car, no transit → near zero');
    }
  );

  runner.test(
    'calculateTravelEmissions [edge]: commuteDistance=0 → near zero emissions',
    (t) => {
      const inputs = {
        carType: 'gas',
        commuteDistance: 0,
        commuteFrequency: 5,
        transitFrequency: 0,
        bikeWalkFrequency: 0,
      };
      t.assertClose(
        calculateTravelEmissions(inputs),
        0,
        0.01,
        'Zero distance should yield near-zero emissions'
      );
    }
  );

  runner.test(
    'calculateTravelEmissions [edge]: transit days cap car days at zero',
    (t) => {
      // Transit + bike > commuteFrequency → effective car days = 0
      const inputs = {
        carType: 'gas',
        commuteDistance: 20,
        commuteFrequency: 3,
        transitFrequency: 3,
        bikeWalkFrequency: 3,
      };
      const result = calculateTravelEmissions(inputs);
      // Should only have transit emissions, no car emissions
      t.assert(
        result >= 0,
        'Emissions cannot be negative even when alternatives exceed commute days'
      );
    }
  );

  runner.test(
    'calculateTravelEmissions [edge]: hybrid emits between EV and gas',
    (t) => {
      const base = {
        commuteDistance: 20,
        commuteFrequency: 5,
        transitFrequency: 0,
        bikeWalkFrequency: 0,
      };
      const evVal = calculateTravelEmissions({ ...base, carType: 'ev' });
      const hybVal = calculateTravelEmissions({ ...base, carType: 'hybrid' });
      const gasVal = calculateTravelEmissions({ ...base, carType: 'gas' });
      t.assert(
        evVal < hybVal && hybVal < gasVal,
        'EV < Hybrid < Gas must hold'
      );
    }
  );

  // ==========================================================================
  // SECTION E — calculateHomeEmissions
  // ==========================================================================

  runner.test(
    'calculateHomeEmissions [happy]: moderate settings baseline',
    (t) => {
      const inputs = {
        heatingCooling: 'moderate',
        unplugAppliances: 'sometimesUnplug',
        renewableEnergy: 'none',
      };
      const result = calculateHomeEmissions(inputs);
      // (1.5 + 0.5) × 1.0 = 2.0
      t.assertClose(result, 2.0, 0.05);
    }
  );

  runner.test(
    'calculateHomeEmissions [happy]: full renewable drastically reduces output',
    (t) => {
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
      t.assert(
        calculateHomeEmissions(heavyFossil) >
          calculateHomeEmissions(fullRenew) * 5,
        'Full renewable should cut >80% of emissions'
      );
    }
  );

  runner.test(
    'calculateHomeEmissions [edge]: heatingCooling=none + full renewable',
    (t) => {
      const inputs = {
        heatingCooling: 'none',
        unplugAppliances: 'alwaysUnplug',
        renewableEnergy: 'full',
      };
      const result = calculateHomeEmissions(inputs);
      // (0.3 + 0.3) × 0.1 = 0.06
      t.assertClose(
        result,
        0.06,
        0.01,
        'Minimum home footprint should be very low'
      );
    }
  );

  runner.test(
    'calculateHomeEmissions [edge]: partial renewable halves fossil emissions',
    (t) => {
      const fossil = calculateHomeEmissions({
        heatingCooling: 'moderate',
        unplugAppliances: 'sometimesUnplug',
        renewableEnergy: 'none',
      });
      const partial = calculateHomeEmissions({
        heatingCooling: 'moderate',
        unplugAppliances: 'sometimesUnplug',
        renewableEnergy: 'partial',
      });
      t.assertClose(
        partial,
        fossil * 0.5,
        0.05,
        'Partial renewable should halve emissions'
      );
    }
  );

  // ==========================================================================
  // SECTION F — calculateDietWasteEmissions
  // ==========================================================================

  runner.test('calculateDietWasteEmissions [happy]: typical omnivore', (t) => {
    const inputs = {
      meatConsumption: 'frequently',
      recycling: 'sometimes',
      composting: 'no',
    };
    const result = calculateDietWasteEmissions(inputs);
    // 2.5 + 0.3 + 0 = 2.8
    t.assertClose(result, 2.8, 0.05);
  });

  runner.test(
    'calculateDietWasteEmissions [happy]: vegan with full eco habits',
    (t) => {
      const inputs = {
        meatConsumption: 'vegan',
        recycling: 'always',
        composting: 'yes',
      };
      const result = calculateDietWasteEmissions(inputs);
      t.assert(
        result < 1.5,
        'Vegan + recycling + composting should yield <1.5t'
      );
    }
  );

  runner.test(
    'calculateDietWasteEmissions [happy]: daily meat worst-case',
    (t) => {
      const inputs = {
        meatConsumption: 'daily',
        recycling: 'never',
        composting: 'no',
      };
      const result = calculateDietWasteEmissions(inputs);
      // 3.3 + 0.5 + 0 = 3.8
      t.assertClose(
        result,
        3.8,
        0.05,
        'Daily meat + never recycling should be highest'
      );
    }
  );

  runner.test(
    'calculateDietWasteEmissions [edge]: vegan < vegetarian < occasionally < frequently < daily',
    (t) => {
      const produce = (meat) =>
        calculateDietWasteEmissions({
          meatConsumption: meat,
          recycling: 'sometimes',
          composting: 'no',
        });
      const [vegan, veg, occ, freq, daily] = [
        'vegan',
        'vegetarian',
        'occasionally',
        'frequently',
        'daily',
      ].map(produce);
      t.assert(
        vegan < veg && veg < occ && occ <= freq && freq <= daily,
        'Diet spectrum ordering must hold'
      );
    }
  );

  // ==========================================================================
  // SECTION G — calculateShoppingEmissions
  // ==========================================================================

  runner.test(
    'calculateShoppingEmissions [happy]: moderate returns 0.5',
    (t) => {
      t.assertClose(
        calculateShoppingEmissions({ fastFashion: 'moderate' }),
        0.5,
        0.01
      );
    }
  );

  runner.test(
    'calculateShoppingEmissions [happy]: secondhand < minimal < moderate < high',
    (t) => {
      const v = (f) => calculateShoppingEmissions({ fastFashion: f });
      t.assert(
        v('secondhand') <= v('minimal') &&
          v('minimal') <= v('moderate') &&
          v('moderate') <= v('high'),
        'Shopping spectrum ordering must hold'
      );
    }
  );

  // ==========================================================================
  // SECTION H — calculateAllEmissions (integration)
  // ==========================================================================

  runner.test(
    'calculateAllEmissions [happy]: low footprint fixture totals < 4t',
    (t) => {
      const result = calculateAllEmissions(FIXTURE_LOW_FOOTPRINT);
      t.assert(
        result.total < 4,
        `Low-footprint fixture total (${result.total}) should be below 4t`
      );
    }
  );

  runner.test(
    'calculateAllEmissions [happy]: high footprint fixture totals > 10t',
    (t) => {
      const result = calculateAllEmissions(FIXTURE_HIGH_FOOTPRINT);
      t.assert(
        result.total > 10,
        `High-footprint fixture total (${result.total}) should exceed 10t`
      );
    }
  );

  runner.test(
    'calculateAllEmissions [happy]: total equals sum of categories',
    (t) => {
      const r = calculateAllEmissions(FIXTURE_AVERAGE);
      const sumOfParts = parseFloat(
        (r.travel + r.home + r.diet + r.shopping).toFixed(2)
      );
      t.assertClose(
        r.total,
        sumOfParts,
        0.02,
        'total must equal sum of categories within rounding'
      );
    }
  );

  runner.test(
    'calculateAllEmissions [edge]: all categories are non-negative',
    (t) => {
      const r = calculateAllEmissions(FIXTURE_LOW_FOOTPRINT);
      t.assert(
        r.travel >= 0 &&
          r.home >= 0 &&
          r.diet >= 0 &&
          r.shopping >= 0 &&
          r.total >= 0,
        'No emission category may be negative'
      );
    }
  );

  runner.test(
    'calculateAllEmissions [edge]: high footprint > low footprint in every category',
    (t) => {
      const lo = calculateAllEmissions(FIXTURE_LOW_FOOTPRINT);
      const hi = calculateAllEmissions(FIXTURE_HIGH_FOOTPRINT);
      t.assert(hi.travel > lo.travel, 'High travel > low travel');
      t.assert(hi.home > lo.home, 'High home > low home');
      t.assert(hi.diet > lo.diet, 'High diet > low diet');
      t.assert(hi.shopping > lo.shopping, 'High shopping > low shopping');
    }
  );

  // ==========================================================================
  // SECTION I — calculatePercentages
  // ==========================================================================

  runner.test('calculatePercentages [happy]: percentages sum to ~100', (t) => {
    const e = calculateAllEmissions(FIXTURE_AVERAGE);
    const pct = calculatePercentages(e);
    const sum = pct.travel + pct.home + pct.diet + pct.shopping;
    t.assert(
      sum >= 98 && sum <= 102,
      `Percentages must sum within [98,102], got ${sum}`
    );
  });

  runner.test(
    'calculatePercentages [happy]: all percentages are non-negative integers',
    (t) => {
      const e = calculateAllEmissions(FIXTURE_HIGH_FOOTPRINT);
      const pct = calculatePercentages(e);
      for (const [key, val] of Object.entries(pct)) {
        t.assert(
          Number.isInteger(val) && val >= 0,
          `Percentage for ${key} must be non-negative integer, got ${val}`
        );
      }
    }
  );

  runner.test(
    'calculatePercentages [edge]: zero total returns equal 25% split',
    (t) => {
      const pct = calculatePercentages({
        travel: 0,
        home: 0,
        diet: 0,
        shopping: 0,
        total: 0,
      });
      t.assertEqual(pct.travel, 25);
      t.assertEqual(pct.home, 25);
      t.assertEqual(pct.diet, 25);
      t.assertEqual(pct.shopping, 25);
    }
  );

  runner.test(
    'calculatePercentages [failure]: null input returns equal splits',
    (t) => {
      const pct = calculatePercentages(null);
      t.assertEqual(pct.travel, 25);
      t.assertEqual(pct.shopping, 25);
    }
  );

  // ==========================================================================
  // SECTION J — calculateActionSavings
  // ==========================================================================

  runner.test(
    'calculateActionSavings [happy]: savings are non-negative',
    (t) => {
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
      const savings = calculateActionSavings(action, emissions);
      t.assert(savings >= 0, 'Savings must always be non-negative');
    }
  );

  runner.test(
    'calculateActionSavings [edge]: category emissions near zero clamps scale to 0.3',
    (t) => {
      const action = {
        id: 'clamp-test',
        category: 'travel',
        baseSavingsKg: 1000,
      };
      const emissions = {
        travel: 0.001,
        home: 2.0,
        diet: 2.5,
        shopping: 0.5,
        total: 5.0,
      };
      const savings = calculateActionSavings(action, emissions);
      // Minimum scale = 0.3, so savings = (1000 × 0.3) / 1000 = 0.3
      t.assertClose(savings, 0.3, 0.05);
    }
  );

  runner.test(
    'calculateActionSavings [edge]: extreme emissions clamp scale to 2.0',
    (t) => {
      const action = { id: 'clamp-max', category: 'home', baseSavingsKg: 1000 };
      const emissions = {
        travel: 3.0,
        home: 99.0,
        diet: 2.5,
        shopping: 0.5,
        total: 105.0,
      };
      const savings = calculateActionSavings(action, emissions);
      // Maximum scale = 2.0, so savings = (1000 × 2.0) / 1000 = 2.0
      t.assertClose(savings, 2.0, 0.05);
    }
  );

  // ==========================================================================
  // SECTION K — TestRunner harness self-tests
  // ==========================================================================

  runner.test(
    'TestRunner [meta]: assertThrows catches expected errors',
    (t) => {
      t.assertThrows(() => {
        throw new Error('expected failure');
      }, 'expected failure');
    }
  );

  runner.test(
    'TestRunner [meta]: assertDeepEqual passes on identical objects',
    (t) => {
      t.assertDeepEqual({ a: 1, b: 'x' }, { a: 1, b: 'x' });
    }
  );

  runner.test(
    'TestRunner [meta]: assertDeepEqual fails on different objects',
    (t) => {
      t.assertThrows(
        () => t.assertDeepEqual({ a: 1 }, { a: 2 }),
        'assertDeepEqual failed'
      );
    }
  );

  return runner.run();
}
