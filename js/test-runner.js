/**
 * Lightweight, dependency-free test runner.
 * Used to validate calculations and pure functions locally without Node.js modules.
 */

export class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  assertEqual(actual, expected, message = '') {
    if (actual !== expected) {
      throw new Error(`Expected ${expected}, but got ${actual}. ${message}`);
    }
  }

  assertClose(actual, expected, tolerance = 0.01, message = '') {
    if (Math.abs(actual - expected) > tolerance) {
      throw new Error(`Expected ${expected} (±${tolerance}), but got ${actual}. ${message}`);
    }
  }

  async run() {
    console.group('%c🧪 EcoLens Test Suite', 'font-weight: bold; font-size: 1.2em; color: #10b981;');
    const startTime = performance.now();

    for (const { name, fn } of this.tests) {
      try {
        await fn(this);
        console.log(`%c✓ PASS: %c${name}`, 'color: #10b981; font-weight: bold;', 'color: inherit;');
        this.passed++;
      } catch (err) {
        console.error(`%c✗ FAIL: %c${name}\n  ${err.message}`, 'color: #ef4444; font-weight: bold;', 'color: inherit;');
        this.failed++;
      }
    }

    const duration = (performance.now() - startTime).toFixed(2);
    console.log(`%c==============================`, 'color: #64748b;');
    console.log(`%cTests complete in ${duration}ms.`, 'font-style: italic; color: #94a3b8;');
    
    if (this.failed === 0) {
      console.log(`%c✅ All ${this.passed} tests passed! Score: 100%`, 'color: #10b981; font-weight: bold; font-size: 1.1em;');
    } else {
      console.log(`%c⚠️ ${this.passed} passed, ${this.failed} failed.`, 'color: #f59e0b; font-weight: bold; font-size: 1.1em;');
    }
    
    console.groupEnd();
    
    return { passed: this.passed, failed: this.failed, total: this.tests.length };
  }
}
