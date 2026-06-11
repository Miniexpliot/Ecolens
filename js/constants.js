/**
 * @fileoverview Carbon Footprint Tracker — Constants & Emission Factors
 *
 * All emission factors, national averages, safe targets, category metadata,
 * and action-plan item definitions live here as the single source of truth.
 *
 * Units:
 *   - Per-mile factors are in **kg CO₂e per mile**.
 *   - Annual totals (heating, diet, waste, shopping) are in **tons CO₂e/year**.
 *   - baseSavingsKg on action items is in **kg CO₂e/year**.
 *
 * @module constants
 */

// ---------------------------------------------------------------------------
// Safe target per person per year in tons CO2e (Paris Agreement aligned)
// ---------------------------------------------------------------------------
export const SAFE_TARGET = 2.5;

// ---------------------------------------------------------------------------
// National averages in tons CO2e per capita per year
// ---------------------------------------------------------------------------
export const NATIONAL_AVERAGES = {
  'United States': 16.0,
  Canada: 15.5,
  Australia: 15.0,
  'United Kingdom': 5.5,
  Germany: 8.0,
  France: 5.0,
  Japan: 9.0,
  China: 7.7,
  India: 1.9,
  Brazil: 2.2,
  'World Average': 4.7,
};

// ---------------------------------------------------------------------------
// Emission factors – all values in kg CO2e unless noted
// ---------------------------------------------------------------------------
export const EMISSION_FACTORS = {
  travel: {
    carPerMile: { gas: 0.411, hybrid: 0.227, ev: 0.098, none: 0 }, // kg CO2e per mile (EPA-based)
    transitPerMile: { bus: 0.089, train: 0.041 }, // kg CO2e per passenger-mile
    bikeWalk: 0, // zero emissions
    workingDaysPerYear: 250,
  },
  home: {
    heatingCooling: {
      // tons CO2e per year
      heavy: 2.5,
      moderate: 1.5,
      minimal: 0.8,
      none: 0.3,
    },
    appliances: {
      // tons CO2e per year
      neverUnplug: 0.8,
      sometimesUnplug: 0.5,
      alwaysUnplug: 0.3,
    },
    renewableFactor: {
      // multiplier applied to home total
      none: 1.0,
      partial: 0.5,
      full: 0.1,
    },
  },
  diet: {
    // tons CO2e per year
    meatConsumption: {
      daily: 3.3,
      frequently: 2.5, // 3-4 times/week
      occasionally: 1.7, // 1-2 times/week
      vegetarian: 1.5,
      vegan: 1.0,
    },
  },
  waste: {
    // tons CO2e per year
    recycling: {
      never: 0.5,
      sometimes: 0.3,
      always: 0.15,
    },
    composting: {
      yes: -0.1, // net negative = saves
      no: 0,
    },
  },
  shopping: {
    // tons CO2e per year
    fastFashion: {
      high: 1.0, // buys new clothes monthly
      moderate: 0.5, // few times a year
      minimal: 0.2, // rarely, sustainable choices
      secondhand: 0.1, // mostly secondhand
    },
  },
};

// ---------------------------------------------------------------------------
// Category colors for charts
// ---------------------------------------------------------------------------
export const CATEGORY_COLORS = {
  travel: '#10b981', // emerald
  home: '#3b82f6', // blue
  diet: '#f59e0b', // amber
  shopping: '#ef4444', // red
};

// ---------------------------------------------------------------------------
// Human-readable category labels
// ---------------------------------------------------------------------------
export const CATEGORY_LABELS = {
  travel: 'Transportation',
  home: 'Home Energy',
  diet: 'Diet & Waste',
  shopping: 'Shopping & Fashion',
};

// ---------------------------------------------------------------------------
// Action plan items
// ---------------------------------------------------------------------------
/**
 * @typedef {Object} ActionItem
 * @property {string}   id             – Unique action identifier
 * @property {string}   category       – Matches an emissions category key
 * @property {string}   title          – Short human-readable title
 * @property {string}   description    – Explanatory paragraph
 * @property {number}   baseSavingsKg  – Baseline annual savings in kg CO₂e
 * @property {function} condition      – Returns true when this action is relevant
 */
export const ACTION_ITEMS = [
  // ── TRAVEL actions ──────────────────────────────────────────────────────
  {
    id: 'switch-hybrid',
    category: 'travel',
    title: 'Switch to a Hybrid Vehicle',
    description:
      'Hybrid cars produce ~45% less emissions than gasoline vehicles per mile driven.',
    baseSavingsKg: 460,
    condition: (inputs) => inputs.travel.carType === 'gas',
  },
  {
    id: 'switch-ev',
    category: 'travel',
    title: 'Switch to an Electric Vehicle',
    description:
      'EVs produce ~76% less emissions than gas cars, even accounting for grid electricity.',
    baseSavingsKg: 780,
    condition: (inputs) =>
      inputs.travel.carType === 'gas' || inputs.travel.carType === 'hybrid',
  },
  {
    id: 'carpool',
    category: 'travel',
    title: 'Carpool 3 Days per Week',
    description:
      'Sharing rides cuts your per-person travel emissions roughly in half on carpool days.',
    baseSavingsKg: 520,
    condition: (inputs) =>
      inputs.travel.carType !== 'none' && inputs.travel.commuteDistance > 5,
  },
  {
    id: 'public-transit',
    category: 'travel',
    title: 'Take Public Transit Twice a Week',
    description:
      'Buses and trains produce a fraction of per-passenger emissions compared to solo driving.',
    baseSavingsKg: 680,
    condition: (inputs) =>
      inputs.travel.carType !== 'none' && inputs.travel.transitFrequency < 3,
  },
  {
    id: 'bike-short-trips',
    category: 'travel',
    title: 'Bike or Walk for Short Trips',
    description:
      'Replace car trips under 3 miles with walking or cycling for zero-emission travel.',
    baseSavingsKg: 320,
    condition: (inputs) => inputs.travel.carType !== 'none',
  },
  {
    id: 'work-from-home',
    category: 'travel',
    title: 'Work from Home 2 Days a Week',
    description:
      'Remote work eliminates commute emissions entirely on those days.',
    baseSavingsKg: 550,
    condition: (inputs) => inputs.travel.commuteDistance > 0,
  },

  // ── HOME actions ────────────────────────────────────────────────────────
  {
    id: 'reduce-heating',
    category: 'home',
    title: 'Reduce Heating/Cooling by 2°F',
    description:
      'Each degree adjustment saves ~3% on heating/cooling energy bills and emissions.',
    baseSavingsKg: 300,
    condition: (inputs) =>
      inputs.home.heatingCooling !== 'none' &&
      inputs.home.heatingCooling !== 'minimal',
  },
  {
    id: 'led-bulbs',
    category: 'home',
    title: 'Switch to LED Lighting',
    description:
      'LEDs use 75% less energy than incandescent bulbs and last 25x longer.',
    baseSavingsKg: 200,
    condition: () => true,
  },
  {
    id: 'unplug-appliances',
    category: 'home',
    title: 'Unplug Unused Appliances',
    description:
      'Phantom power from idle electronics accounts for 5-10% of residential energy use.',
    baseSavingsKg: 300,
    condition: (inputs) => inputs.home.unplugAppliances !== 'alwaysUnplug',
  },
  {
    id: 'renewable-energy',
    category: 'home',
    title: 'Switch to a Renewable Energy Provider',
    description:
      'Green energy tariffs can reduce your home electricity emissions by up to 90%.',
    baseSavingsKg: 1500,
    condition: (inputs) => inputs.home.renewableEnergy !== 'full',
  },
  {
    id: 'smart-thermostat',
    category: 'home',
    title: 'Install a Smart Thermostat',
    description:
      'Smart thermostats learn your schedule and can save 10-15% on heating and cooling.',
    baseSavingsKg: 500,
    condition: (inputs) => inputs.home.heatingCooling !== 'none',
  },
  {
    id: 'air-dry-laundry',
    category: 'home',
    title: 'Air-Dry Your Laundry',
    description:
      'Dryers are one of the most energy-intensive home appliances. Air-drying saves significant energy.',
    baseSavingsKg: 200,
    condition: () => true,
  },

  // ── DIET actions ────────────────────────────────────────────────────────
  {
    id: 'reduce-meat',
    category: 'diet',
    title: 'Reduce Meat to 1-2 Times per Week',
    description:
      'Beef production generates 60kg CO2e per kg — 20x more than legumes.',
    baseSavingsKg: 800,
    condition: (inputs) =>
      inputs.diet.meatConsumption === 'daily' ||
      inputs.diet.meatConsumption === 'frequently',
  },
  {
    id: 'go-vegetarian',
    category: 'diet',
    title: 'Try a Vegetarian Diet',
    description:
      'Eliminating meat entirely can reduce your food carbon footprint by over 50%.',
    baseSavingsKg: 1200,
    condition: (inputs) =>
      inputs.diet.meatConsumption !== 'vegetarian' &&
      inputs.diet.meatConsumption !== 'vegan',
  },
  {
    id: 'buy-local',
    category: 'diet',
    title: 'Buy Local & Seasonal Produce',
    description:
      'Locally-sourced food travels fewer miles, reducing transportation emissions.',
    baseSavingsKg: 300,
    condition: () => true,
  },
  {
    id: 'reduce-food-waste',
    category: 'diet',
    title: 'Reduce Food Waste by Half',
    description:
      'The average person wastes ~200 lbs of food/year. Reducing waste cuts methane from landfills.',
    baseSavingsKg: 300,
    condition: () => true,
  },
  {
    id: 'start-recycling',
    category: 'diet',
    title: 'Start Recycling Consistently',
    description:
      'Proper recycling diverts waste from landfills and reduces raw material extraction emissions.',
    baseSavingsKg: 300,
    condition: (inputs) => inputs.diet.recycling !== 'always',
  },
  {
    id: 'start-composting',
    category: 'diet',
    title: 'Start Composting Organic Waste',
    description:
      'Composting prevents methane emissions from food decomposing in landfills.',
    baseSavingsKg: 200,
    condition: (inputs) => inputs.diet.composting !== 'yes',
  },

  // ── SHOPPING actions ────────────────────────────────────────────────────
  {
    id: 'secondhand-clothing',
    category: 'shopping',
    title: 'Buy Secondhand Clothing',
    description:
      'The fashion industry accounts for ~10% of global emissions. Secondhand extends garment life.',
    baseSavingsKg: 500,
    condition: (inputs) =>
      inputs.shopping.fastFashion !== 'secondhand' &&
      inputs.shopping.fastFashion !== 'minimal',
  },
  {
    id: 'reduce-plastics',
    category: 'shopping',
    title: 'Eliminate Single-Use Plastics',
    description:
      'Reusable bags, bottles, and containers reduce petroleum-based plastic production emissions.',
    baseSavingsKg: 100,
    condition: () => true,
  },
];
