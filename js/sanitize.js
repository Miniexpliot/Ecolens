/**
 * @fileoverview Input Sanitization & XSS Prevention Module
 *
 * Provides strict validation, numeric bounds-checking, HTML entity escaping,
 * and safe DOM element factories used by the calculator UI.
 *
 * @module sanitize
 */

import { NATIONAL_AVERAGES } from './constants.js';

// ---------------------------------------------------------------------------
// Primitive sanitizers
// ---------------------------------------------------------------------------

/**
 * Sanitizes a numeric input value with strict bounds.
 * Prevents NaN injection by defaulting invalid values.
 * @param {*} value - Raw input value
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @param {number} fallback - Default value if invalid
 * @returns {number} Sanitized number
 */
export function sanitizeNumber(value, min, max, fallback) {
  const num = parseFloat(value);
  if (Number.isNaN(num) || !Number.isFinite(num)) return fallback;
  return Math.max(min, Math.min(max, num));
}

/**
 * Sanitizes text input to prevent XSS attacks.
 * Escapes HTML entities and strips dangerous patterns.
 * @param {string} value - Raw text input
 * @returns {string} Sanitized text
 */
export function sanitizeText(value) {
  if (typeof value !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

/**
 * Safely sets innerHTML with sanitized content.
 * Wraps the content through a sanitization pass.
 * @param {HTMLElement} element - Target DOM element
 * @param {string} html - HTML string (already constructed safely)
 */
export function safeSetHTML(element, html) {
  // We trust internally generated HTML but still strip script tags as defense-in-depth
  const cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  element.innerHTML = cleaned;
}

// ---------------------------------------------------------------------------
// DOM element factories
// ---------------------------------------------------------------------------

/**
 * Creates a validated select element with proper labels and ARIA.
 * @param {Object} config
 * @param {string} config.id - Element ID
 * @param {string} config.label - Label text
 * @param {string} config.name - Input name
 * @param {Array<{value: string, text: string}>} config.options - Select options
 * @param {string} config.defaultValue - Default selected value
 * @param {string} [config.ariaDescribedBy] - Optional aria description ID
 * @returns {HTMLElement} Container with label + select
 */
export function createSafeSelect(config) {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-group';

  const label = document.createElement('label');
  label.setAttribute('for', config.id);
  label.textContent = config.label;

  const select = document.createElement('select');
  select.id = config.id;
  select.name = config.name;
  if (config.ariaDescribedBy) {
    select.setAttribute('aria-describedby', config.ariaDescribedBy);
  }

  config.options.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.text;
    if (opt.value === config.defaultValue) option.selected = true;
    select.appendChild(option);
  });

  wrapper.appendChild(label);
  wrapper.appendChild(select);
  return wrapper;
}

/**
 * Creates a validated number input with proper labels, ARIA, and bounds.
 * @param {Object} config
 * @param {string} config.id - Element ID
 * @param {string} config.label - Label text
 * @param {string} config.name - Input name
 * @param {number} config.min - Minimum value
 * @param {number} config.max - Maximum value
 * @param {number} config.step - Step increment
 * @param {number} config.defaultValue - Default value
 * @param {string} config.unit - Unit suffix to display
 * @param {string} [config.ariaDescribedBy] - Optional aria description ID
 * @returns {HTMLElement} Container with label + input
 */
export function createSafeNumberInput(config) {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-group';

  const label = document.createElement('label');
  label.setAttribute('for', config.id);
  label.textContent = config.label;

  const inputWrapper = document.createElement('div');
  inputWrapper.className = 'input-with-unit';

  const input = document.createElement('input');
  input.type = 'number';
  input.id = config.id;
  input.name = config.name;
  input.min = config.min;
  input.max = config.max;
  input.step = config.step || 1;
  input.value = config.defaultValue;
  input.setAttribute('aria-label', config.label);
  if (config.ariaDescribedBy) {
    input.setAttribute('aria-describedby', config.ariaDescribedBy);
  }

  // Enforce bounds on input
  input.addEventListener('input', () => {
    const val = parseFloat(input.value);
    if (Number.isNaN(val)) input.value = config.defaultValue;
    else if (val < config.min) input.value = config.min;
    else if (val > config.max) input.value = config.max;
  });

  inputWrapper.appendChild(input);

  if (config.unit) {
    const unit = document.createElement('span');
    unit.className = 'input-unit';
    unit.textContent = config.unit;
    inputWrapper.appendChild(unit);
  }

  wrapper.appendChild(label);
  wrapper.appendChild(inputWrapper);
  return wrapper;
}

/**
 * Creates a validated range input (slider) with proper labels, ARIA, and bounds.
 * @param {Object} config
 * @param {string} config.id - Element ID
 * @param {string} config.label - Label text
 * @param {string} config.name - Input name
 * @param {number} config.min - Minimum value
 * @param {number} config.max - Maximum value
 * @param {number} config.step - Step increment
 * @param {number} config.defaultValue - Default value
 * @param {string} config.unit - Unit suffix to display
 * @param {string} [config.ariaDescribedBy] - Optional aria description ID
 * @returns {HTMLElement} Container with label + range input + value display
 */
export function createSafeRangeInput(config) {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-group range-group';

  const labelWrapper = document.createElement('div');
  labelWrapper.className = 'range-label-wrapper';
  
  const label = document.createElement('label');
  label.setAttribute('for', config.id);
  label.textContent = config.label;

  const valueDisplay = document.createElement('span');
  valueDisplay.className = 'range-value-display';
  valueDisplay.textContent = `${config.defaultValue} ${config.unit || ''}`;

  labelWrapper.appendChild(label);
  labelWrapper.appendChild(valueDisplay);

  const inputWrapper = document.createElement('div');
  inputWrapper.className = 'input-with-unit';

  const input = document.createElement('input');
  input.type = 'range';
  input.id = config.id;
  input.name = config.name;
  input.min = config.min;
  input.max = config.max;
  input.step = config.step || 1;
  input.value = config.defaultValue;
  input.setAttribute('aria-label', config.label);
  if (config.ariaDescribedBy) {
    input.setAttribute('aria-describedby', config.ariaDescribedBy);
  }

  // Update visual value on drag
  input.addEventListener('input', () => {
    valueDisplay.textContent = `${input.value} ${config.unit || ''}`;
  });

  inputWrapper.appendChild(input);
  
  wrapper.appendChild(labelWrapper);
  wrapper.appendChild(inputWrapper);
  return wrapper;
}

/**
 * Creates a stylish set of radio cards for an option selection.
 * @param {Object} config
 * @param {string} config.id - Base Element ID
 * @param {string} config.label - Label text for the group
 * @param {string} config.name - Input name
 * @param {Array<{value: string, text: string, icon: string}>} config.options - Options with icons
 * @param {string} config.defaultValue - Default selected value
 * @returns {HTMLFieldSetElement} Fieldset container with radio cards
 */
export function createRadioCards(config) {
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'form-group radio-fieldset';
  wrapper.style.border = 'none';
  wrapper.style.padding = '0';

  const groupLabel = document.createElement('legend');
  groupLabel.textContent = config.label;
  groupLabel.className = 'form-label';
  wrapper.appendChild(groupLabel);

  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'radio-cards-container';

  config.options.forEach((opt, index) => {
    const radioId = `${config.id}-${index}`;
    
    const cardLabel = document.createElement('label');
    cardLabel.className = 'radio-card';
    cardLabel.setAttribute('for', radioId);

    const input = document.createElement('input');
    input.type = 'radio';
    input.id = radioId;
    input.name = config.name;
    input.value = opt.value;
    input.className = 'sr-only'; // Hide the actual radio input
    if (opt.value === config.defaultValue) {
      input.checked = true;
    }

    const cardVisual = document.createElement('div');
    cardVisual.className = 'radio-card__visual';
    
    const iconEl = document.createElement('div');
    iconEl.className = 'radio-card__icon';
    iconEl.textContent = opt.icon || '•';

    const textEl = document.createElement('div');
    textEl.className = 'radio-card__text';
    textEl.textContent = opt.text;

    cardVisual.appendChild(iconEl);
    cardVisual.appendChild(textEl);

    cardLabel.appendChild(input);
    cardLabel.appendChild(cardVisual);
    cardsContainer.appendChild(cardLabel);
  });

  wrapper.appendChild(cardsContainer);
  return wrapper;
}

// ---------------------------------------------------------------------------
// Full-input validation
// ---------------------------------------------------------------------------

/**
 * Validates all user inputs and returns a clean object.
 * Every field is white-listed against its allowed enum values; anything
 * unexpected is replaced with a safe default.
 *
 * @param {Object} rawInputs - Raw form data
 * @returns {{ valid: boolean, data: Object, errors: string[] }}
 */
export function validateInputs(rawInputs) {
  const errors = [];

  // ── Travel ────────────────────────────────────────────────────────────
  const validCarTypes = ['gas', 'hybrid', 'ev', 'none'];
  const travelCarType = validCarTypes.includes(rawInputs.travel?.carType)
    ? rawInputs.travel.carType
    : 'gas';

  const travelCommuteDistance = sanitizeNumber(rawInputs.travel?.commuteDistance, 0, 500, 15);
  const travelCommuteFrequency = sanitizeNumber(rawInputs.travel?.commuteFrequency, 0, 7, 5);
  const travelTransitFrequency = sanitizeNumber(rawInputs.travel?.transitFrequency, 0, 7, 0);
  const travelBikeWalkFrequency = sanitizeNumber(rawInputs.travel?.bikeWalkFrequency, 0, 7, 0);

  // Validate that total travel days don't exceed 7
  const totalTravelDays = travelCommuteFrequency + travelTransitFrequency + travelBikeWalkFrequency;
  if (totalTravelDays > 7) {
    errors.push('Total travel days per week cannot exceed 7.');
  }

  // ── Home ──────────────────────────────────────────────────────────────
  const validHeating = ['heavy', 'moderate', 'minimal', 'none'];
  const homeHeatingCooling = validHeating.includes(rawInputs.home?.heatingCooling)
    ? rawInputs.home.heatingCooling
    : 'moderate';

  const validUnplug = ['neverUnplug', 'sometimesUnplug', 'alwaysUnplug'];
  const homeUnplugAppliances = validUnplug.includes(rawInputs.home?.unplugAppliances)
    ? rawInputs.home.unplugAppliances
    : 'sometimesUnplug';

  const validRenewable = ['none', 'partial', 'full'];
  const homeRenewableEnergy = validRenewable.includes(rawInputs.home?.renewableEnergy)
    ? rawInputs.home.renewableEnergy
    : 'none';

  // ── Diet & Waste ──────────────────────────────────────────────────────
  const validMeat = ['daily', 'frequently', 'occasionally', 'vegetarian', 'vegan'];
  const dietMeatConsumption = validMeat.includes(rawInputs.diet?.meatConsumption)
    ? rawInputs.diet.meatConsumption
    : 'frequently';

  const validRecycling = ['never', 'sometimes', 'always'];
  const dietRecycling = validRecycling.includes(rawInputs.diet?.recycling)
    ? rawInputs.diet.recycling
    : 'sometimes';

  const validComposting = ['yes', 'no'];
  const dietComposting = validComposting.includes(rawInputs.diet?.composting)
    ? rawInputs.diet.composting
    : 'no';

  // ── Shopping ──────────────────────────────────────────────────────────
  const validFashion = ['high', 'moderate', 'minimal', 'secondhand'];
  const shoppingFastFashion = validFashion.includes(rawInputs.shopping?.fastFashion)
    ? rawInputs.shopping.fastFashion
    : 'moderate';

  // ── Country ───────────────────────────────────────────────────────────
  const validCountries = Object.keys(NATIONAL_AVERAGES);
  const country = validCountries.includes(rawInputs.country)
    ? rawInputs.country
    : 'United States';

  const data = {
    travel: {
      carType: travelCarType,
      commuteDistance: travelCommuteDistance,
      commuteFrequency: travelCommuteFrequency,
      transitFrequency: travelTransitFrequency,
      bikeWalkFrequency: travelBikeWalkFrequency
    },
    home: {
      heatingCooling: homeHeatingCooling,
      unplugAppliances: homeUnplugAppliances,
      renewableEnergy: homeRenewableEnergy
    },
    diet: {
      meatConsumption: dietMeatConsumption,
      recycling: dietRecycling,
      composting: dietComposting
    },
    shopping: {
      fastFashion: shoppingFastFashion
    },
    country
  };

  return { valid: errors.length === 0, data, errors };
}
