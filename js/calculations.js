/**
 * @fileoverview Pure Emission Calculation Functions
 *
 * Every function in this module is a **pure computation** — no DOM access,
 * no side-effects, no external API calls. Functions are:
 *   - Single-responsibility: each computes exactly one thing.
 *   - Deterministic: same inputs always produce the same outputs.
 *   - Safe: all numeric outputs are bounded and rounded consistently.
 *
 * Units used throughout this module:
 *   - Intermediate per-mile factors → kg CO₂e per mile
 *   - All *return* values           → metric tons CO₂e per year
 *
 * @module calculations
 */

import { EMISSION_FACTORS } from './constants.js';

// ---------------------------------------------------------------------------
// Type aliases (JSDoc-only — aids editor tooling)
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} TravelInputs
 * @property {'gas'|'hybrid'|'ev'|'none'} carType     – Vehicle fuel type
 * @property {number} commuteDistance                  – One-way miles per day
 * @property {number} commuteFrequency                 – Car days per week
 * @property {number} transitFrequency                 – Transit days per week
 * @property {number} bikeWalkFrequency                – Active-transport days per week
 */

/**
 * @typedef {Object} HomeInputs
 * @property {'heavy'|'moderate'|'minimal'|'none'} heatingCooling
 * @property {'neverUnplug'|'sometimesUnplug'|'alwaysUnplug'} unplugAppliances
 * @property {'none'|'partial'|'full'} renewableEnergy
 */

/**
 * @typedef {Object} DietInputs
 * @property {'daily'|'frequently'|'occasionally'|'vegetarian'|'vegan'} meatConsumption
 * @property {'never'|'sometimes'|'always'} recycling
 * @property {'yes'|'no'} composting
 */

/**
 * @typedef {Object} ShoppingInputs
 * @property {'high'|'moderate'|'minimal'|'secondhand'} fastFashion
 */

/**
 * @typedef {Object} AllInputs
 * @property {TravelInputs} travel
 * @property {HomeInputs} home
 * @property {DietInputs} diet
 * @property {ShoppingInputs} shopping
 */

/**
 * @typedef {Object} EmissionsBreakdown
 * @property {number} travel   – Annual tons CO₂e from travel
 * @property {number} home     – Annual tons CO₂e from home energy
 * @property {number} diet     – Annual tons CO₂e from diet & waste
 * @property {number} shopping – Annual tons CO₂e from shopping
 * @property {number} total    – Sum of all categories
 */

/**
 * @typedef {Object} PercentagesBreakdown
 * @property {number} travel
 * @property {number} home
 * @property {number} diet
 * @property {number} shopping
 */

// ---------------------------------------------------------------------------
// Private utility
// ---------------------------------------------------------------------------

/**
 * Rounds a raw floating-point emission value to exactly 2 decimal places.
 * Using this consistently prevents floating-point drift across display layers.
 *
 * Time complexity: O(1)
 *
 * @param {number} rawTons – Unrounded emission value in tons CO₂e
 * @returns {number} Value rounded to 2 decimal places
 */
function _roundTons(rawTons) {
  return Math.round(rawTons * 100) / 100;
}

/**
 * Converts kilograms to metric tons.
 *
 * Time complexity: O(1)
 *
 * @param {number} kilograms – Raw kg value
 * @returns {number} Equivalent metric tons
 */
function _kgToTons(kilograms) {
  return kilograms / 1000;
}

// ---------------------------------------------------------------------------
// Private sub-calculators (single-responsibility helpers)
// ---------------------------------------------------------------------------

/**
 * Computes the annual car commute emissions in **kilograms** CO₂e.
 *
 * Formula:
 *   roundTripMiles × carFactor(kg/mi) × carDaysPerWeek × weeksPerYear
 *
 * The effective car days per week is clamped to ≥ 0 so that alternative
 * transport (transit/bike) cannot push the value negative.
 *
 * Time complexity: O(1)
 *
 * @param {TravelInputs} inputs
 * @returns {number} Annual car commute emissions in kg CO₂e
 */
function _calculateCarEmissionsKg(inputs) {
  const { carType, commuteDistance, commuteFrequency, transitFrequency, bikeWalkFrequency } = inputs;

  const carFactorKgPerMile = EMISSION_FACTORS.travel.carPerMile[carType] ?? 0;
  const roundTripMiles     = commuteDistance * 2;
  const weeksPerYear       = 50; // ≈ 50 active working weeks (2 weeks holiday)

  // Days effectively driven = raw commute days minus days replaced by alternatives.
  const effectiveCarDays = Math.max(0, commuteFrequency - transitFrequency - bikeWalkFrequency);

  return roundTripMiles * carFactorKgPerMile * effectiveCarDays * weeksPerYear;
}

/**
 * Computes the annual public-transit emissions in **kilograms** CO₂e.
 *
 * Uses the arithmetic mean of bus and train per-mile factors as a
 * conservative proxy for a mixed transit mode.
 *
 * Time complexity: O(1)
 *
 * @param {TravelInputs} inputs
 * @returns {number} Annual transit emissions in kg CO₂e
 */
function _calculateTransitEmissionsKg(inputs) {
  const { commuteDistance, transitFrequency } = inputs;

  const { bus, train } = EMISSION_FACTORS.travel.transitPerMile;
  const avgTransitFactorKgPerMile = (bus + train) / 2;
  const roundTripMiles            = commuteDistance * 2;
  const weeksPerYear              = 50;

  return roundTripMiles * avgTransitFactorKgPerMile * transitFrequency * weeksPerYear;
}

// ---------------------------------------------------------------------------
// Public per-category calculators
// ---------------------------------------------------------------------------

/**
 * Calculates annual travel-related emissions in tons CO₂e.
 *
 * Aggregates car commute + public transit. Bike/walk are explicitly
 * zero-emission and do not appear in the formula.
 *
 * Time complexity: O(1)
 *
 * @param {TravelInputs} inputs – Validated travel inputs
 * @returns {number} Annual tons CO₂e from travel
 */
export function calculateTravelEmissions(inputs) {
  const carKg     = _calculateCarEmissionsKg(inputs);
  const transitKg = _calculateTransitEmissionsKg(inputs);

  return _roundTons(_kgToTons(carKg + transitKg));
}

/**
 * Calculates annual home-energy emissions in tons CO₂e.
 *
 * Formula:
 *   (heatingCoolingTons + applianceTons) × renewableMultiplier
 *
 * The renewable multiplier reduces total home emissions proportionally
 * based on the fraction of clean energy sourced (e.g., `full` → 0.1×).
 *
 * Time complexity: O(1)
 *
 * @param {HomeInputs} inputs – Validated home inputs
 * @returns {number} Annual tons CO₂e from home energy
 */
export function calculateHomeEmissions(inputs) {
  const { heatingCooling, unplugAppliances, renewableEnergy } = inputs;

  const heatingTons    = EMISSION_FACTORS.home.heatingCooling[heatingCooling]   ?? 1.5;
  const applianceTons  = EMISSION_FACTORS.home.appliances[unplugAppliances]      ?? 0.5;
  const renewFactor    = EMISSION_FACTORS.home.renewableFactor[renewableEnergy]  ?? 1.0;

  return _roundTons((heatingTons + applianceTons) * renewFactor);
}

/**
 * Calculates annual diet and waste emissions in tons CO₂e.
 *
 * Formula:
 *   meatEmissions + recyclingEmissions + compostingEmissions
 *
 * Composting provides a small negative offset (−0.1 tons) that is
 * already baked into the EMISSION_FACTORS constant.
 *
 * Time complexity: O(1)
 *
 * @param {DietInputs} inputs – Validated diet inputs
 * @returns {number} Annual tons CO₂e from diet & waste
 */
export function calculateDietWasteEmissions(inputs) {
  const { meatConsumption, recycling, composting } = inputs;

  const meatTons      = EMISSION_FACTORS.diet.meatConsumption[meatConsumption] ?? 2.5;
  const recyclingTons = EMISSION_FACTORS.waste.recycling[recycling]            ?? 0.3;
  const compostTons   = EMISSION_FACTORS.waste.composting[composting]          ?? 0;

  return _roundTons(meatTons + recyclingTons + compostTons);
}

/**
 * Calculates annual shopping/fashion emissions in tons CO₂e.
 *
 * Time complexity: O(1)
 *
 * @param {ShoppingInputs} inputs – Validated shopping inputs
 * @returns {number} Annual tons CO₂e from shopping
 */
export function calculateShoppingEmissions(inputs) {
  const { fastFashion } = inputs;
  return _roundTons(EMISSION_FACTORS.shopping.fastFashion[fastFashion] ?? 0.5);
}

// ---------------------------------------------------------------------------
// Aggregate calculator
// ---------------------------------------------------------------------------

/**
 * Calculates a complete, rounded emissions breakdown across all four categories.
 *
 * Each category is computed independently and summed. The total is derived
 * from the already-rounded category values so display sums are always
 * consistent with individual rows.
 *
 * Time complexity: O(1) — four O(1) sub-calls, constant work.
 *
 * @param {AllInputs} inputs – Validated user inputs across all categories
 * @returns {EmissionsBreakdown} Rounded annual emission values per category + total
 */
export function calculateAllEmissions(inputs) {
  const travel   = calculateTravelEmissions(inputs.travel);
  const home     = calculateHomeEmissions(inputs.home);
  const diet     = calculateDietWasteEmissions(inputs.diet);
  const shopping = calculateShoppingEmissions(inputs.shopping);
  const total    = _roundTons(travel + home + diet + shopping);

  return { travel, home, diet, shopping, total };
}

// ---------------------------------------------------------------------------
// Action-item savings calculator
// ---------------------------------------------------------------------------

/**
 * Calculates the adjusted annual CO₂ savings for a single action item,
 * scaled to the user's *actual* emissions (not a hardcoded average).
 *
 * Scaling is clamped to [0.3×, 2.0×] to prevent wildly unrealistic values
 * for users at the extremes of the distribution.
 *
 * Time complexity: O(1)
 *
 * @param {{ baseSavingsKg: number, category: string }} actionItem
 *   Action item definition from constants (must expose `baseSavingsKg` and `category`)
 * @param {EmissionsBreakdown} emissions – Current emissions breakdown
 * @returns {number} Adjusted annual savings in tons CO₂e (rounded to 2 dp)
 */
export function calculateActionSavings(actionItem, emissions) {
  /** @type {Record<string, number>} Baseline emissions assumed by action-item authors */
  const BASELINE_CATEGORY_TONS = Object.freeze({ travel: 4.0, home: 2.0, diet: 3.0, shopping: 0.5 });

  const categoryEmissions = emissions[actionItem.category] ?? 0;
  const baseline          = BASELINE_CATEGORY_TONS[actionItem.category] ?? 1;

  // Clamp scale factor to prevent nonsensical savings estimates.
  const scaleFactor       = Math.max(0.3, Math.min(2.0, categoryEmissions / baseline));
  const adjustedSavingsKg = actionItem.baseSavingsKg * scaleFactor;

  return _roundTons(_kgToTons(adjustedSavingsKg));
}

// ---------------------------------------------------------------------------
// Percentage breakdown
// ---------------------------------------------------------------------------

/**
 * Calculates the integer-percentage contribution of each category.
 *
 * Guard: when total is 0 (all inputs are zero/clean), returns equal 25%
 * splits so the chart remains visually meaningful rather than showing
 * a blank/degenerate state.
 *
 * Note: percentages are rounded individually and may not sum to exactly 100%
 * due to integer rounding. This is standard and expected behaviour; the
 * display layer must not assert that they sum to 100.
 *
 * Time complexity: O(1)
 *
 * @param {EmissionsBreakdown} emissions – Rounded breakdown from calculateAllEmissions
 * @returns {PercentagesBreakdown} Integer percentages per category
 */
export function calculatePercentages(emissions) {
  if (!emissions || emissions.total === 0) {
    return { travel: 25, home: 25, diet: 25, shopping: 25 };
  }

  const { total } = emissions;

  return {
    travel:   Math.round((emissions.travel   / total) * 100),
    home:     Math.round((emissions.home     / total) * 100),
    diet:     Math.round((emissions.diet     / total) * 100),
    shopping: Math.round((emissions.shopping / total) * 100)
  };
}
