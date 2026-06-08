/**
 * @fileoverview Pure Emission Calculation Functions
 *
 * Every function in this module is a pure computation — no DOM access,
 * no side-effects.  Import EMISSION_FACTORS from constants.js and operate
 * exclusively on the validated input objects produced by sanitize.js.
 *
 * @module calculations
 */

import { EMISSION_FACTORS } from './constants.js';

// ---------------------------------------------------------------------------
// Per-category calculators
// ---------------------------------------------------------------------------

/**
 * Calculate annual travel emissions in tons CO₂e.
 *
 * Formula
 * -------
 * - Car:     commuteDistance × 2 (round trip) × carFactor × carDaysPerWeek × weeksPerYear
 * - Transit: commuteDistance × 2 × avgTransitFactor × transitFrequency × weeksPerYear
 * - Bike/Walk: 0
 *
 * @param {Object} inputs
 * @param {string} inputs.carType           – 'gas' | 'hybrid' | 'ev' | 'none'
 * @param {number} inputs.commuteDistance    – one-way miles
 * @param {number} inputs.commuteFrequency  – days per week commuting by car
 * @param {number} inputs.transitFrequency  – days per week using transit
 * @param {number} inputs.bikeWalkFrequency – days per week biking/walking
 * @returns {number} Annual tons CO₂e
 */
export function calculateTravelEmissions(inputs) {
  const { carType, commuteDistance, commuteFrequency, transitFrequency, bikeWalkFrequency } = inputs;
  const carFactor = EMISSION_FACTORS.travel.carPerMile[carType] || 0;
  const roundTripMiles = commuteDistance * 2;

  // Days per week driving = commute frequency minus days using alternatives
  const carDaysPerWeek = Math.max(0, commuteFrequency - transitFrequency - bikeWalkFrequency);
  const weeksPerYear = 50; // accounting for ~2 weeks vacation

  // Car emissions (kg)
  const carEmissionsKg = roundTripMiles * carFactor * carDaysPerWeek * weeksPerYear;

  // Transit emissions — average of bus and train factors (kg)
  const avgTransitFactor =
    (EMISSION_FACTORS.travel.transitPerMile.bus + EMISSION_FACTORS.travel.transitPerMile.train) / 2;
  const transitEmissionsKg = roundTripMiles * avgTransitFactor * transitFrequency * weeksPerYear;

  // Bike/walk = 0 emissions

  return (carEmissionsKg + transitEmissionsKg) / 1000; // kg → tons
}

/**
 * Calculate annual home energy emissions in tons CO₂e.
 *
 * Formula: (heatingCooling + appliances) × renewableFactor
 *
 * @param {Object} inputs
 * @param {string} inputs.heatingCooling   – 'heavy' | 'moderate' | 'minimal' | 'none'
 * @param {string} inputs.unplugAppliances – 'neverUnplug' | 'sometimesUnplug' | 'alwaysUnplug'
 * @param {string} inputs.renewableEnergy  – 'none' | 'partial' | 'full'
 * @returns {number} Annual tons CO₂e
 */
export function calculateHomeEmissions(inputs) {
  const { heatingCooling, unplugAppliances, renewableEnergy } = inputs;
  const heatingTons = EMISSION_FACTORS.home.heatingCooling[heatingCooling] || 1.5;
  const applianceTons = EMISSION_FACTORS.home.appliances[unplugAppliances] || 0.5;
  const renewFactor = EMISSION_FACTORS.home.renewableFactor[renewableEnergy] || 1.0;

  return (heatingTons + applianceTons) * renewFactor;
}

/**
 * Calculate annual diet and waste emissions in tons CO₂e.
 *
 * Formula: meatEmissions + recyclingEmissions + compostingEmissions
 *
 * @param {Object} inputs
 * @param {string} inputs.meatConsumption – 'daily' | 'frequently' | 'occasionally' | 'vegetarian' | 'vegan'
 * @param {string} inputs.recycling       – 'never' | 'sometimes' | 'always'
 * @param {string} inputs.composting      – 'yes' | 'no'
 * @returns {number} Annual tons CO₂e
 */
export function calculateDietWasteEmissions(inputs) {
  const { meatConsumption, recycling, composting } = inputs;
  const meatTons = EMISSION_FACTORS.diet.meatConsumption[meatConsumption] || 2.5;
  const recyclingTons = EMISSION_FACTORS.waste.recycling[recycling] || 0.3;
  const compostingTons = EMISSION_FACTORS.waste.composting[composting] || 0;

  return meatTons + recyclingTons + compostingTons;
}

/**
 * Calculate annual shopping/fashion emissions in tons CO₂e.
 *
 * @param {Object} inputs
 * @param {string} inputs.fastFashion – 'high' | 'moderate' | 'minimal' | 'secondhand'
 * @returns {number} Annual tons CO₂e
 */
export function calculateShoppingEmissions(inputs) {
  const { fastFashion } = inputs;
  return EMISSION_FACTORS.shopping.fastFashion[fastFashion] || 0.5;
}

// ---------------------------------------------------------------------------
// Aggregate calculator
// ---------------------------------------------------------------------------

/**
 * Calculate complete emissions breakdown across all categories.
 *
 * @param {Object} inputs - Validated user inputs (travel, home, diet, shopping)
 * @returns {{ travel: number, home: number, diet: number, shopping: number, total: number }}
 */
export function calculateAllEmissions(inputs) {
  const travel = calculateTravelEmissions(inputs.travel);
  const home = calculateHomeEmissions(inputs.home);
  const diet = calculateDietWasteEmissions(inputs.diet);
  const shopping = calculateShoppingEmissions(inputs.shopping);
  const total = travel + home + diet + shopping;

  return {
    travel: Math.round(travel * 100) / 100,
    home: Math.round(home * 100) / 100,
    diet: Math.round(diet * 100) / 100,
    shopping: Math.round(shopping * 100) / 100,
    total: Math.round(total * 100) / 100
  };
}

// ---------------------------------------------------------------------------
// Action-item savings calculator
// ---------------------------------------------------------------------------

/**
 * Calculate dynamic savings for an action item based on user's actual inputs.
 * Adjusts base savings proportionally to user's current emissions in that category.
 *
 * @param {Object} actionItem  – Action item from constants (must have baseSavingsKg, category)
 * @param {Object} emissions   – Current emissions breakdown
 * @returns {number} Adjusted annual savings in tons CO₂e
 */
export function calculateActionSavings(actionItem, emissions) {
  const categoryEmissions = emissions[actionItem.category] || 0;
  // Scale base savings relative to the user's actual category emissions.
  // Base savings assume average behaviour; scale proportionally.
  const avgCategoryEmissions = { travel: 4.0, home: 2.0, diet: 3.0, shopping: 0.5 };
  const scaleFactor = categoryEmissions / (avgCategoryEmissions[actionItem.category] || 1);
  const adjustedSavingsKg = actionItem.baseSavingsKg * Math.max(0.3, Math.min(2.0, scaleFactor));
  return Math.round(adjustedSavingsKg) / 1000; // kg → tons
}

// ---------------------------------------------------------------------------
// Percentage breakdown
// ---------------------------------------------------------------------------

/**
 * Calculate percentage breakdown of emissions by category.
 *
 * @param {Object} emissions – Emissions breakdown { travel, home, diet, shopping, total }
 * @returns {{ travel: number, home: number, diet: number, shopping: number }}
 */
export function calculatePercentages(emissions) {
  if (emissions.total === 0) {
    return { travel: 25, home: 25, diet: 25, shopping: 25 };
  }
  return {
    travel: Math.round((emissions.travel / emissions.total) * 100),
    home: Math.round((emissions.home / emissions.total) * 100),
    diet: Math.round((emissions.diet / emissions.total) * 100),
    shopping: Math.round((emissions.shopping / emissions.total) * 100)
  };
}
