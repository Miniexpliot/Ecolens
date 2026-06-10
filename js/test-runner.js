/**
 * @fileoverview Test Runner — Lightweight in-browser unit test harness.
 *
 * Runs synchronous and asynchronous test suites entirely in the browser console
 * without any build tools or external dependencies. Provides assertion helpers
 * that are standard across most testing frameworks.
 *
 * Usage:
 *   const runner = new TestRunner();
 *   runner.test('description', (t) => { t.assertEqual(1 + 1, 2); });
 *   await runner.run();
 *
 * @module test-runner
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} TestResult
 * @property {string}  name    – Test case description
 * @property {boolean} passed  – Whether the test passed
 * @property {string}  [error] – Error message on failure
 * @property {number}  durationMs – Time taken to execute in milliseconds
 */

/**
 * @typedef {Object} RunSummary
 * @property {number}       passed  – Number of passing tests
 * @property {number}       failed  – Number of failing tests
 * @property {number}       total   – Total test count
 * @property {number}       durationMs – Total wall-clock duration in ms
 * @property {TestResult[]} results – Ordered list of individual results
 */

// ---------------------------------------------------------------------------
// TestRunner class
// ---------------------------------------------------------------------------

/**
 * Lightweight, dependency-free in-browser unit test runner.
 *
 * All public methods are fluent where possible.
 * Tests are stored and run sequentially (not in parallel) so that console
 * output remains readable and interleaved output is avoided.
 */
export class TestRunner {
  constructor() {
    /** @type {Array<{ name: string, fn: Function }>} */
    this._tests = [];

    /** @type {number} */
    this._passed = 0;

    /** @type {number} */
    this._failed = 0;

    /** @type {TestResult[]} */
    this._results = [];
  }

  // ── Public accessors ──────────────────────────────────────────────────────

  /** @returns {number} Count of registered tests. */
  get testCount() { return this._tests.length; }

  /** @returns {number} Count of passing tests (only valid after run()). */
  get passed() { return this._passed; }

  /** @returns {number} Count of failing tests (only valid after run()). */
  get failed() { return this._failed; }

  // ── Test registration ─────────────────────────────────────────────────────

  /**
   * Registers a named test case.
   *
   * @param {string}   name – Human-readable description of the test
   * @param {Function} fn   – Test body; receives `this` (the runner) as first arg
   * @returns {TestRunner} `this` for optional chaining
   */
  test(name, fn) {
    if (typeof name !== 'string' || name.trim() === '') {
      throw new TypeError('TestRunner.test: `name` must be a non-empty string.');
    }
    if (typeof fn !== 'function') {
      throw new TypeError(`TestRunner.test: \`fn\` for "${name}" must be a function.`);
    }
    this._tests.push({ name: name.trim(), fn });
    return this;
  }

  // ── Assertion helpers ─────────────────────────────────────────────────────

  /**
   * Asserts that a condition is truthy.
   *
   * @param {*}      condition – Value to check
   * @param {string} [message] – Custom failure description
   * @throws {Error} When condition is falsy
   */
  assert(condition, message = 'Assertion failed') {
    if (!condition) {
      throw new Error(message);
    }
  }

  /**
   * Asserts strict equality (`===`).
   *
   * @param {*}      actual   – Computed value
   * @param {*}      expected – Reference value
   * @param {string} [message] – Custom failure description
   * @throws {Error} When values are not strictly equal
   */
  assertEqual(actual, expected, message = '') {
    if (actual !== expected) {
      const detail = message ? ` — ${message}` : '';
      throw new Error(`assertEqual failed${detail}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
  }

  /**
   * Asserts that two numbers are within a specified tolerance of each other.
   * Suitable for floating-point comparison where exact equality is unreliable.
   *
   * @param {number} actual    – Computed numeric value
   * @param {number} expected  – Reference numeric value
   * @param {number} [tolerance=0.01] – Maximum allowed absolute difference
   * @param {string} [message] – Custom failure description
   * @throws {Error} When |actual − expected| > tolerance
   */
  assertClose(actual, expected, tolerance = 0.01, message = '') {
    if (typeof actual   !== 'number') throw new TypeError(`assertClose: \`actual\` must be a number, got ${typeof actual}`);
    if (typeof expected !== 'number') throw new TypeError(`assertClose: \`expected\` must be a number, got ${typeof expected}`);
    const diff = Math.abs(actual - expected);
    if (diff > tolerance) {
      const detail = message ? ` — ${message}` : '';
      throw new Error(
        `assertClose failed${detail}: expected ${expected} ± ${tolerance}, got ${actual} (diff=${diff.toFixed(4)})`
      );
    }
  }

  /**
   * Asserts that a function throws an error.
   * Optionally validates the error message with a substring or RegExp match.
   *
   * @param {Function} fn               – Function expected to throw
   * @param {string|RegExp} [matchMsg]  – Optional match against error.message
   * @param {string} [message]          – Custom failure description
   * @throws {Error} When fn does NOT throw, or message does not match
   */
  assertThrows(fn, matchMsg, message = '') {
    let threw = false;
    let caught = null;
    try {
      fn();
    } catch (err) {
      threw = true;
      caught = err;
    }

    if (!threw) {
      const detail = message ? ` — ${message}` : '';
      throw new Error(`assertThrows failed${detail}: expected function to throw but it did not`);
    }

    if (matchMsg !== undefined) {
      const errorMsg = caught?.message ?? String(caught);
      const matches = matchMsg instanceof RegExp
        ? matchMsg.test(errorMsg)
        : errorMsg.includes(matchMsg);
      if (!matches) {
        throw new Error(`assertThrows: error message "${errorMsg}" did not match expected "${matchMsg}"`);
      }
    }
  }

  /**
   * Asserts that two plain objects have deeply equal primitive values.
   * Does NOT handle circular references or non-plain objects.
   *
   * @param {Object} actual
   * @param {Object} expected
   * @param {string} [message]
   * @throws {Error} When structure or values differ
   */
  assertDeepEqual(actual, expected, message = '') {
    const actualStr   = JSON.stringify(actual,   Object.keys(actual   ?? {}).sort());
    const expectedStr = JSON.stringify(expected, Object.keys(expected ?? {}).sort());
    if (actualStr !== expectedStr) {
      const detail = message ? ` — ${message}` : '';
      throw new Error(`assertDeepEqual failed${detail}:\n  expected: ${expectedStr}\n  got:      ${actualStr}`);
    }
  }

  // ── Runner ────────────────────────────────────────────────────────────────

  /**
   * Executes all registered tests sequentially and prints a formatted summary
   * to the browser console.
   *
   * Errors in individual tests are caught and recorded as failures; they do
   * NOT interrupt execution of subsequent tests.
   *
   * Time complexity: O(n) where n = number of registered tests.
   *
   * @returns {Promise<RunSummary>} Aggregated results once all tests complete
   */
  async run() {
    this._passed  = 0;
    this._failed  = 0;
    this._results = [];

    console.group('%c🧪 EcoLens Test Suite', 'font-weight:bold;font-size:1.2em;color:#10b981;');
    const suiteStart = performance.now();

    for (const { name, fn } of this._tests) {
      const testStart = performance.now();
      let passed = false;
      let errorMessage;

      try {
        await fn(this);
        passed = true;
      } catch (err) {
        // Intentionally never re-throw — failures are recorded, not fatal.
        errorMessage = err instanceof Error ? err.message : String(err);
      }

      const durationMs = parseFloat((performance.now() - testStart).toFixed(2));

      if (passed) {
        this._passed++;
        console.log(`%c✓ PASS %c${name} %c(${durationMs}ms)`,
          'color:#10b981;font-weight:bold;',
          'color:inherit;',
          'color:#64748b;font-size:0.85em;');
      } else {
        this._failed++;
        console.error(`%c✗ FAIL %c${name}\n   %c${errorMessage}`,
          'color:#ef4444;font-weight:bold;',
          'color:inherit;',
          'color:#94a3b8;');
      }

      this._results.push({ name, passed, error: errorMessage, durationMs });
    }

    const totalDurationMs = parseFloat((performance.now() - suiteStart).toFixed(2));
    this._printSummary(totalDurationMs);
    console.groupEnd();

    return {
      passed:     this._passed,
      failed:     this._failed,
      total:      this._tests.length,
      durationMs: totalDurationMs,
      results:    [...this._results]
    };
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  /**
   * Prints a formatted summary footer to the console.
   *
   * @private
   * @param {number} totalDurationMs – Wall-clock time for the entire suite
   */
  _printSummary(totalDurationMs) {
    console.log(`%c${'─'.repeat(50)}`, 'color:#334155;');
    console.log(`%cCompleted in ${totalDurationMs}ms`, 'font-style:italic;color:#94a3b8;');

    if (this._failed === 0) {
      console.log(
        `%c✅ All ${this._passed} tests passed — 100%`,
        'color:#10b981;font-weight:bold;font-size:1.1em;'
      );
    } else {
      console.log(
        `%c⚠️  ${this._passed} passed · ${this._failed} failed ` +
        `(${Math.round((this._passed / this._tests.length) * 100)}%)`,
        'color:#f59e0b;font-weight:bold;font-size:1.1em;'
      );
    }
  }
}
