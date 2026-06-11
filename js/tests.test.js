import { test, expect } from 'vitest';
import { runAllTests } from './tests.js';

test('EcoLens Custom Test Suite', async () => {
  const summary = await runAllTests();
  // Ensure no tests failed in our custom harness
  expect(summary.failed).toBe(0);
  // Ensure we actually ran tests
  expect(summary.total).toBeGreaterThan(0);
});
