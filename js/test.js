/**
 * @fileoverview Test / Validation Suite for Carbon Footprint Tracker
 *
 * Tests the emission calculation logic, sanitization functions, and edge
 * cases.  Runnable as a standalone ES module in the browser console or
 * importable for automated use via the exported `runAllTests()` function.
 *
 * Usage (browser console):
 *   import('./js/test.js').then(m => m.runAllTests());
 *
 * @module test
 */

import {
  calculateTravelEmissions,
  calculateHomeEmissions,
  calculateDietWasteEmissions,
  calculateShoppingEmissions,
  calculateAllEmissions,
  calculateActionSavings,
  calculatePercentages
} from './calculations.js';

import { sanitizeNumber } from './sanitize.js';

import { EMISSION_FACTORS, ACTION_ITEMS } from './constants.js';

// ---------------------------------------------------------------------------
// Test harness
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} TestResult
 * @property {string}  name   – Test name
 * @property {boolean} passed – Whether the test passed
 * @property {string}  [error] – Error message if failed
 */

/**
 * Assert helper – throws with message on failure.
 * @param {boolean} condition
 * @param {string} message
 */
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

/**
 * Assert approximate equality (for floating point).
 * @param {number} actual
 * @param {number} expected
 * @param {number} tolerance
 * @param {string} label
 */
function assertApprox(actual, expected, tolerance, label) {
  const diff = Math.abs(actual - expected);
  if (diff > tolerance) {
    throw new Error(
      `${label}: expected ≈${expected} (±${tolerance}), got ${actual} (diff ${diff.toFixed(6)})`
    );
  }
}

/**
 * Assert strict equality.
 * @param {*} actual
 * @param {*} expected
 * @param {string} label
 */
function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

// ---------------------------------------------------------------------------
// Test cases
// ---------------------------------------------------------------------------

const TEST_CASES = [
  // ===================================================================
  // 1. Travel – gas car, typical commute
  // ===================================================================
  {
    name: 'Travel: gas car, 15 mi commute, 5 days/week',
    fn() {
      const result = calculateTravelEmissions({
        carType: 'gas',
        commuteDistance: 15,
        commuteFrequency: 5,
        transitFrequency: 0,
        bikeWalkFrequency: 0
      });
      // 15 * 2 * 0.411 * 5 * 50 / 1000 = 3.0825
      assertApprox(result, 3.0825, 0.01, 'Gas car travel emissions');
    }
  },

  // ===================================================================
  // 2. Travel – EV
  // ===================================================================
  {
    name: 'Travel: EV, 20 mi commute, 5 days/week',
    fn() {
      const result = calculateTravelEmissions({
        carType: 'ev',
        commuteDistance: 20,
        commuteFrequency: 5,
        transitFrequency: 0,
        bikeWalkFrequency: 0
      });
      // 20 * 2 * 0.098 * 5 * 50 / 1000 = 0.98
      assertApprox(result, 0.98, 0.01, 'EV travel emissions');
    }
  },

  // ===================================================================
  // 3. Travel – no car
  // ===================================================================
  {
    name: 'Travel: no car (carType=none), should be ~0',
    fn() {
      const result = calculateTravelEmissions({
        carType: 'none',
        commuteDistance: 10,
        commuteFrequency: 5,
        transitFrequency: 0,
        bikeWalkFrequency: 0
      });
      // carFactor = 0, so car = 0; transit = 0 freq; bike = 0
      assertApprox(result, 0, 0.001, 'No-car travel emissions');
    }
  },

  // ===================================================================
  // 4. Travel – transit usage offsets car days
  // ===================================================================
  {
    name: 'Travel: gas car + 2 transit days → 3 car days',
    fn() {
      const result = calculateTravelEmissions({
        carType: 'gas',
        commuteDistance: 10,
        commuteFrequency: 5,
        transitFrequency: 2,
        bikeWalkFrequency: 0
      });
      // car: 10*2*0.411*3*50/1000 = 1.233
      // transit avg factor = (0.089 + 0.041)/2 = 0.065
      // transit: 10*2*0.065*2*50/1000 = 0.13
      // total = 1.363
      assertApprox(result, 1.363, 0.01, 'Gas + transit travel');
    }
  },

  // ===================================================================
  // 5. Travel – zero commute distance
  // ===================================================================
  {
    name: 'Travel: zero commute distance → 0 emissions',
    fn() {
      const result = calculateTravelEmissions({
        carType: 'gas',
        commuteDistance: 0,
        commuteFrequency: 5,
        transitFrequency: 0,
        bikeWalkFrequency: 0
      });
      assertApprox(result, 0, 0.001, 'Zero distance emissions');
    }
  },

  // ===================================================================
  // 6. Home – heavy heating, no renewables
  // ===================================================================
  {
    name: 'Home: heavy heating, neverUnplug, no renewables',
    fn() {
      const result = calculateHomeEmissions({
        heatingCooling: 'heavy',
        unplugAppliances: 'neverUnplug',
        renewableEnergy: 'none'
      });
      // (2.5 + 0.8) * 1.0 = 3.3
      assertApprox(result, 3.3, 0.001, 'Heavy home emissions');
    }
  },

  // ===================================================================
  // 7. Home – full renewables slashes emissions
  // ===================================================================
  {
    name: 'Home: moderate heating, full renewables → 90% reduction',
    fn() {
      const result = calculateHomeEmissions({
        heatingCooling: 'moderate',
        unplugAppliances: 'sometimesUnplug',
        renewableEnergy: 'full'
      });
      // (1.5 + 0.5) * 0.1 = 0.2
      assertApprox(result, 0.2, 0.001, 'Full renewable home');
    }
  },

  // ===================================================================
  // 8. Diet & waste – daily meat, no recycling
  // ===================================================================
  {
    name: 'Diet: daily meat, never recycle, no compost',
    fn() {
      const result = calculateDietWasteEmissions({
        meatConsumption: 'daily',
        recycling: 'never',
        composting: 'no'
      });
      // 3.3 + 0.5 + 0 = 3.8
      assertApprox(result, 3.8, 0.001, 'High-impact diet');
    }
  },

  // ===================================================================
  // 9. Diet & waste – vegan, always recycle, compost
  // ===================================================================
  {
    name: 'Diet: vegan, always recycle, compost → low',
    fn() {
      const result = calculateDietWasteEmissions({
        meatConsumption: 'vegan',
        recycling: 'always',
        composting: 'yes'
      });
      // 1.0 + 0.15 + (-0.1) = 1.05
      assertApprox(result, 1.05, 0.001, 'Low-impact diet');
    }
  },

  // ===================================================================
  // 10. Shopping – high fast fashion
  // ===================================================================
  {
    name: 'Shopping: high fast fashion → 1.0t',
    fn() {
      const result = calculateShoppingEmissions({ fastFashion: 'high' });
      assertApprox(result, 1.0, 0.001, 'High fashion emissions');
    }
  },

  // ===================================================================
  // 11. Shopping – secondhand
  // ===================================================================
  {
    name: 'Shopping: secondhand → 0.1t',
    fn() {
      const result = calculateShoppingEmissions({ fastFashion: 'secondhand' });
      assertApprox(result, 0.1, 0.001, 'Secondhand fashion');
    }
  },

  // ===================================================================
  // 12. calculateAllEmissions – full aggregate
  // ===================================================================
  {
    name: 'calculateAllEmissions: full aggregate with rounding',
    fn() {
      const inputs = {
        travel: { carType: 'gas', commuteDistance: 15, commuteFrequency: 5, transitFrequency: 0, bikeWalkFrequency: 0 },
        home: { heatingCooling: 'moderate', unplugAppliances: 'sometimesUnplug', renewableEnergy: 'none' },
        diet: { meatConsumption: 'frequently', recycling: 'sometimes', composting: 'no' },
        shopping: { fastFashion: 'moderate' }
      };
      const result = calculateAllEmissions(inputs);
      // travel: 3.08 (rounded), home: 2.0, diet: 2.8, shopping: 0.5
      assert(typeof result.total === 'number', 'total should be a number');
      assert(result.total > 0, 'total should be positive');
      assertApprox(result.travel, 3.08, 0.02, 'Aggregate travel');
      assertApprox(result.home, 2.0, 0.01, 'Aggregate home');
      assertApprox(result.diet, 2.8, 0.01, 'Aggregate diet');
      assertApprox(result.shopping, 0.5, 0.01, 'Aggregate shopping');
      const expectedTotal = result.travel + result.home + result.diet + result.shopping;
      assertApprox(result.total, expectedTotal, 0.02, 'Aggregate total');
    }
  },

  // ===================================================================
  // 13. calculatePercentages – normal
  // ===================================================================
  {
    name: 'calculatePercentages: sums ≈ 100',
    fn() {
      const emissions = { travel: 3, home: 2, diet: 2.5, shopping: 0.5, total: 8 };
      const pct = calculatePercentages(emissions);
      const sum = pct.travel + pct.home + pct.diet + pct.shopping;
      // Sum may differ by 1-2 due to rounding, that's ok
      assert(sum >= 98 && sum <= 102, `Percentage sum ${sum} should be near 100`);
      assertEqual(pct.travel, 38, 'Travel pct'); // 3/8 = 37.5 → 38
      assertEqual(pct.home, 25, 'Home pct');
    }
  },

  // ===================================================================
  // 14. calculatePercentages – zero total edge case
  // ===================================================================
  {
    name: 'calculatePercentages: zero total → equal split',
    fn() {
      const pct = calculatePercentages({ travel: 0, home: 0, diet: 0, shopping: 0, total: 0 });
      assertEqual(pct.travel, 25, 'Zero total travel pct');
      assertEqual(pct.home, 25, 'Zero total home pct');
    }
  },

  // ===================================================================
  // 15. sanitizeNumber – valid, clamped, and NaN
  // ===================================================================
  {
    name: 'sanitizeNumber: valid number within bounds',
    fn() {
      assertEqual(sanitizeNumber(50, 0, 100, 10), 50, 'Valid number');
    }
  },
  {
    name: 'sanitizeNumber: clamp to min',
    fn() {
      assertEqual(sanitizeNumber(-10, 0, 100, 10), 0, 'Clamp to min');
    }
  },
  {
    name: 'sanitizeNumber: clamp to max',
    fn() {
      assertEqual(sanitizeNumber(999, 0, 100, 10), 100, 'Clamp to max');
    }
  },
  {
    name: 'sanitizeNumber: NaN falls back to default',
    fn() {
      assertEqual(sanitizeNumber(NaN, 0, 100, 42), 42, 'NaN fallback');
    }
  },
  {
    name: 'sanitizeNumber: undefined falls back to default',
    fn() {
      assertEqual(sanitizeNumber(undefined, 0, 100, 7), 7, 'Undefined fallback');
    }
  },
  {
    name: 'sanitizeNumber: string "abc" falls back to default',
    fn() {
      assertEqual(sanitizeNumber('abc', 0, 100, 5), 5, 'String fallback');
    }
  },
  {
    name: 'sanitizeNumber: Infinity falls back to default',
    fn() {
      assertEqual(sanitizeNumber(Infinity, 0, 100, 10), 10, 'Infinity fallback');
    }
  },

  // ===================================================================
  // 16. calculateActionSavings – scaling
  // ===================================================================
  {
    name: 'calculateActionSavings: scales with category emissions',
    fn() {
      const action = ACTION_ITEMS.find(a => a.id === 'switch-hybrid');
      assert(action, 'switch-hybrid action should exist');

      const lowEmissions = { travel: 1, home: 2, diet: 3, shopping: 0.5, total: 6.5 };
      const highEmissions = { travel: 8, home: 2, diet: 3, shopping: 0.5, total: 13.5 };

      const lowSavings = calculateActionSavings(action, lowEmissions);
      const highSavings = calculateActionSavings(action, highEmissions);

      assert(highSavings > lowSavings,
        `Higher category emissions (${highSavings}) should yield greater savings than lower (${lowSavings})`);
      assert(lowSavings > 0, 'Savings should be positive');
    }
  },

  // ===================================================================
  // 17. Edge: max commute distance
  // ===================================================================
  {
    name: 'Travel: extreme 500-mile commute → very high but finite',
    fn() {
      const result = calculateTravelEmissions({
        carType: 'gas',
        commuteDistance: 500,
        commuteFrequency: 7,
        transitFrequency: 0,
        bikeWalkFrequency: 0
      });
      assert(Number.isFinite(result), 'Result should be finite');
      assert(result > 50, 'Extreme commute should be very high');
    }
  },

  // ===================================================================
  // 18. Edge: all alternatives exceed commute days
  // ===================================================================
  {
    name: 'Travel: transit + bike > commute → car days clamped to 0',
    fn() {
      const result = calculateTravelEmissions({
        carType: 'gas',
        commuteDistance: 10,
        commuteFrequency: 3,
        transitFrequency: 2,
        bikeWalkFrequency: 3
      });
      // carDaysPerWeek = max(0, 3-2-3) = 0
      // only transit: 10*2*0.065*2*50/1000 = 0.13
      assertApprox(result, 0.13, 0.01, 'Clamped car days');
    }
  },

  // ===================================================================
  // 19. Edge: unknown enum value fallback
  // ===================================================================
  {
    name: 'Home: unknown heatingCooling value → fallback 1.5',
    fn() {
      const result = calculateHomeEmissions({
        heatingCooling: 'INVALID',
        unplugAppliances: 'sometimesUnplug',
        renewableEnergy: 'none'
      });
      // fallback: (1.5 + 0.5) * 1.0 = 2.0
      assertApprox(result, 2.0, 0.001, 'Invalid enum fallback');
    }
  },

  // ===================================================================
  // 20. Action condition functions
  // ===================================================================
  {
    name: 'Action conditions: gas car triggers switch-hybrid, not EV',
    fn() {
      const gasInputs = {
        travel: { carType: 'gas', commuteDistance: 15, transitFrequency: 0, bikeWalkFrequency: 0 },
        home: { heatingCooling: 'moderate', unplugAppliances: 'sometimesUnplug', renewableEnergy: 'none' },
        diet: { meatConsumption: 'frequently', recycling: 'sometimes', composting: 'no' },
        shopping: { fastFashion: 'moderate' }
      };
      const evInputs = {
        ...gasInputs,
        travel: { ...gasInputs.travel, carType: 'ev' }
      };

      const switchHybrid = ACTION_ITEMS.find(a => a.id === 'switch-hybrid');
      assert(switchHybrid.condition(gasInputs), 'switch-hybrid should be relevant for gas');
      assert(!switchHybrid.condition(evInputs), 'switch-hybrid should NOT be relevant for ev');
    }
  },

  // ===================================================================
  // 21. Composting negative offset
  // ===================================================================
  {
    name: 'Diet: composting yields a negative offset (-0.1)',
    fn() {
      const withCompost = calculateDietWasteEmissions({
        meatConsumption: 'occasionally',
        recycling: 'sometimes',
        composting: 'yes'
      });
      const without = calculateDietWasteEmissions({
        meatConsumption: 'occasionally',
        recycling: 'sometimes',
        composting: 'no'
      });
      // with: 1.7 + 0.3 - 0.1 = 1.9; without: 1.7 + 0.3 + 0 = 2.0
      assertApprox(without - withCompost, 0.1, 0.001, 'Composting saves 0.1t');
    }
  }
];

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

/**
 * Run all test cases and return structured results.
 *
 * @returns {{ passed: number, failed: number, total: number, results: TestResult[] }}
 */
export function runAllTests() {
  /** @type {TestResult[]} */
  const results = [];
  let passed = 0;
  let failed = 0;

  for (const tc of TEST_CASES) {
    try {
      tc.fn();
      results.push({ name: tc.name, passed: true });
      passed++;
      console.log(`  ✅ PASS: ${tc.name}`);
    } catch (err) {
      results.push({ name: tc.name, passed: false, error: err.message });
      failed++;
      console.error(`  ❌ FAIL: ${tc.name}`);
      console.error(`         ${err.message}`);
    }
  }

  const total = passed + failed;

  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log(`  Test Results: ${passed}/${total} passed, ${failed} failed`);
  console.log('═══════════════════════════════════════════════');

  if (failed === 0) {
    console.log('  🎉 All tests passed!');
  } else {
    console.warn(`  ⚠️  ${failed} test(s) failed — see errors above.`);
  }

  return { passed, failed, total, results };
}

// ---------------------------------------------------------------------------
// Auto-run when loaded as a standalone module
// ---------------------------------------------------------------------------
console.log('');
console.log('═══════════════════════════════════════════════');
console.log('  EcoLens Carbon Tracker — Test Suite');
console.log('═══════════════════════════════════════════════');
console.log('');

runAllTests();
