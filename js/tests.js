import { TestRunner } from './test-runner.js';
import { sanitizeNumber, sanitizeText, validateInputs } from './sanitize.js';
import { calculateAllEmissions } from './calculations.js';

export async function runAllTests() {
  const runner = new TestRunner();

  // --- Sanitize Tests ---
  runner.test('sanitizeNumber: respects min bounds', (t) => {
    t.assertEqual(sanitizeNumber(-5, 0, 100, 10), 0);
  });

  runner.test('sanitizeNumber: respects max bounds', (t) => {
    t.assertEqual(sanitizeNumber(150, 0, 100, 10), 100);
  });

  runner.test('sanitizeNumber: uses fallback for NaN', (t) => {
    t.assertEqual(sanitizeNumber('invalid', 0, 100, 15), 15);
  });

  runner.test('sanitizeText: escapes HTML', (t) => {
    const raw = '<script>alert(1)</script>';
    const safe = sanitizeText(raw);
    t.assert(!safe.includes('<script>'), 'Script tags should be escaped or removed');
  });

  // --- Validate Inputs Tests ---
  runner.test('validateInputs: assigns valid defaults to empty object', (t) => {
    const result = validateInputs({});
    t.assert(result.valid, 'Empty object should be validated as valid with defaults');
    t.assertEqual(result.data.travel.carType, 'gas');
    t.assertEqual(result.data.home.heatingCooling, 'moderate');
    t.assertEqual(result.data.country, 'United States');
  });

  // --- Calculations Tests ---
  runner.test('calculateAllEmissions: computes correct EV output', (t) => {
    const mockData = {
      travel: { carType: 'ev', commuteDistance: 20, commuteFrequency: 5, transitFrequency: 0, bikeWalkFrequency: 0 },
      home: { heatingCooling: 'none', unplugAppliances: 'alwaysUnplug', renewableEnergy: 'full' },
      diet: { meatConsumption: 'vegan', recycling: 'always', composting: 'yes' },
      shopping: { fastFashion: 'minimal' }
    };

    const e = calculateAllEmissions(mockData);
    
    // EV = 20 * 5 * 52 * 0.098 = 509.6 kg = 0.5096 tons
    // Home = (0.3 + 0.3) * 0.1 = 0.06 tons
    // Diet = 1.0 + 0.15 - 0.1 = 1.05 tons
    // Shopping = 0.2 tons
    
    t.assertClose(e.travel, 0.51, 0.1);
    t.assertClose(e.home, 0.06, 0.05);
    t.assertClose(e.diet, 1.05, 0.05);
    t.assertClose(e.shopping, 0.2, 0.05);
  });

  await runner.run();
}
