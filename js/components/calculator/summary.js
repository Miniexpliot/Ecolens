/**
 * @fileoverview EcoLens application module: summary.js
 * Follows strict Google JavaScript Style Guide.
 */
import { formatValue } from './shared.js';

/**
 * Builds the visual summary of all user inputs for the final calculator step.
 *
 * @param {Object} inputs - The current user inputs from the store.
 * @returns {HTMLDivElement} The constructed DOM element displaying the summary.
 */
export function buildSummaryPreview(inputs) {
  const wrapper = document.createElement('div');
  wrapper.className = 'calculator__summary';
  wrapper.innerHTML = `
    <h4 class="calculator__summary-title">Summary of Your Inputs</h4>

    <div class="calculator__summary-group">
      <div class="calculator__summary-group-title calculator__summary-group-title--travel">🚗 Daily Travel</div>
      <div class="calculator__summary-item">
        <span class="calculator__summary-item-label">Car Type</span>
        <span class="calculator__summary-item-value">${formatValue(inputs.travel?.carType, { gas: 'Gasoline', hybrid: 'Hybrid', ev: 'Electric', none: 'No Car' })}</span>
      </div>
      <div class="calculator__summary-item">
        <span class="calculator__summary-item-label">Commute Distance</span>
        <span class="calculator__summary-item-value">${inputs.travel?.commuteDistance ?? 15} miles</span>
      </div>
      <div class="calculator__summary-item">
        <span class="calculator__summary-item-label">Commute Days/Week</span>
        <span class="calculator__summary-item-value">${inputs.travel?.commuteFrequency ?? 5}</span>
      </div>
      <div class="calculator__summary-item">
        <span class="calculator__summary-item-label">Transit Days/Week</span>
        <span class="calculator__summary-item-value">${inputs.travel?.transitFrequency ?? 0}</span>
      </div>
      <div class="calculator__summary-item">
        <span class="calculator__summary-item-label">Bike/Walk Days/Week</span>
        <span class="calculator__summary-item-value">${inputs.travel?.bikeWalkFrequency ?? 0}</span>
      </div>
    </div>

    <div class="calculator__summary-group">
      <div class="calculator__summary-group-title calculator__summary-group-title--home">🏠 Home Energy</div>
      <div class="calculator__summary-item">
        <span class="calculator__summary-item-label">Heating/Cooling</span>
        <span class="calculator__summary-item-value">${formatValue(inputs.home?.heatingCooling, { heavy: 'Heavy Use', moderate: 'Moderate', minimal: 'Minimal', none: 'Off / N/A' })}</span>
      </div>
      <div class="calculator__summary-item">
        <span class="calculator__summary-item-label">Unplug Appliances</span>
        <span class="calculator__summary-item-value">${formatValue(inputs.home?.unplugAppliances, { neverUnplug: 'Never', sometimesUnplug: 'Sometimes', alwaysUnplug: 'Always' })}</span>
      </div>
      <div class="calculator__summary-item">
        <span class="calculator__summary-item-label">Renewable Energy</span>
        <span class="calculator__summary-item-value">${formatValue(inputs.home?.renewableEnergy, { none: 'None', partial: 'Partial', full: '100% Renewable' })}</span>
      </div>
    </div>

    <div class="calculator__summary-group">
      <div class="calculator__summary-group-title calculator__summary-group-title--diet">🥗 Diet & Waste</div>
      <div class="calculator__summary-item">
        <span class="calculator__summary-item-label">Meat Consumption</span>
        <span class="calculator__summary-item-value">${formatValue(inputs.diet?.meatConsumption, { daily: 'Daily', frequently: 'Frequently', occasionally: 'Occasionally', vegetarian: 'Vegetarian', vegan: 'Vegan' })}</span>
      </div>
      <div class="calculator__summary-item">
        <span class="calculator__summary-item-label">Recycling</span>
        <span class="calculator__summary-item-value">${formatValue(inputs.diet?.recycling, { never: 'Never', sometimes: 'Sometimes', always: 'Always' })}</span>
      </div>
      <div class="calculator__summary-item">
        <span class="calculator__summary-item-label">Composting</span>
        <span class="calculator__summary-item-value">${formatValue(inputs.diet?.composting, { yes: 'Yes', no: 'No' })}</span>
      </div>
    </div>

    <div class="calculator__summary-group">
      <div class="calculator__summary-group-title calculator__summary-group-title--shopping">🛍️ Shopping</div>
      <div class="calculator__summary-item">
        <span class="calculator__summary-item-label">Fast Fashion</span>
        <span class="calculator__summary-item-value">${formatValue(inputs.shopping?.fastFashion, { high: 'High (Monthly)', moderate: 'Moderate', minimal: 'Minimal', secondhand: 'Secondhand' })}</span>
      </div>
      <div class="calculator__summary-item">
        <span class="calculator__summary-item-label">Comparison Country</span>
        <span class="calculator__summary-item-value">${inputs.country || 'United States'}</span>
      </div>
    </div>
  `;

  return wrapper;
}
