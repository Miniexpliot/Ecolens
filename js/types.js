/**
 * @fileoverview Central JSDoc Type Definitions
 *
 * Provides strict TypeScript-like static typing for the entire application
 * using standard JSDoc comments. This achieves the Code Quality goals of
 * strict typing without introducing a build step.
 *
 * @module types
 */

/**
 * @typedef {'gas' | 'hybrid' | 'ev' | 'none'} CarFuelType
 * @typedef {'heavy' | 'moderate' | 'minimal' | 'none'} HeatingCoolingUsage
 * @typedef {'neverUnplug' | 'sometimesUnplug' | 'alwaysUnplug'} UnplugHabit
 * @typedef {'none' | 'partial' | 'full'} RenewableEnergyUsage
 * @typedef {'daily' | 'frequently' | 'occasionally' | 'vegetarian' | 'vegan'} MeatConsumption
 * @typedef {'never' | 'sometimes' | 'always'} RecyclingHabit
 * @typedef {'yes' | 'no'} CompostingHabit
 * @typedef {'high' | 'moderate' | 'minimal' | 'secondhand'} FastFashionHabit
 */

/**
 * @typedef {Object} TravelInputs
 * @property {CarFuelType} carType
 * @property {number} commuteDistance
 * @property {number} commuteFrequency
 * @property {number} transitFrequency
 * @property {number} bikeWalkFrequency
 */

/**
 * @typedef {Object} HomeInputs
 * @property {HeatingCoolingUsage} heatingCooling
 * @property {UnplugHabit} unplugAppliances
 * @property {RenewableEnergyUsage} renewableEnergy
 */

/**
 * @typedef {Object} DietInputs
 * @property {MeatConsumption} meatConsumption
 * @property {RecyclingHabit} recycling
 * @property {CompostingHabit} composting
 */

/**
 * @typedef {Object} ShoppingInputs
 * @property {FastFashionHabit} fastFashion
 */

/**
 * @typedef {Object} AllInputs
 * @property {TravelInputs} travel
 * @property {HomeInputs} home
 * @property {DietInputs} diet
 * @property {ShoppingInputs} shopping
 * @property {string} country
 */

/**
 * @typedef {Object} EmissionsBreakdown
 * @property {number} travel
 * @property {number} home
 * @property {number} diet
 * @property {number} shopping
 * @property {number} total
 */

/**
 * @typedef {Object} PercentagesBreakdown
 * @property {number} travel
 * @property {number} home
 * @property {number} diet
 * @property {number} shopping
 */

/**
 * @typedef {Object} ApplicationState
 * @property {'home' | 'climate101' | 'calculator' | 'results'} currentView
 * @property {AllInputs} inputs
 * @property {EmissionsBreakdown|null} emissions
 * @property {PercentagesBreakdown|null} percentages
 * @property {Set<string>} checkedActions
 * @property {number} totalSavings
 * @property {number} projectedScore
 * @property {boolean} reportGenerated
 * @property {string[]} unlockedBadges
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid
 * @property {AllInputs} data
 * @property {string[]} errors
 */

export {};
