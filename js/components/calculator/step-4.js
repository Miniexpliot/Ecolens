/**
 * @fileoverview EcoLens application module: step-4.js
 * Follows strict Google JavaScript Style Guide.
 */
import { createRadioCards } from '../../sanitize.js';
import { updateInput, makeFormGroup } from './shared.js';
import { renderCountrySelector } from './country-selector.js';
import { buildSummaryPreview } from './summary.js';

/**
 * Renders the fourth step of the calculator (Shopping & Review).
 *
 * @param {Object} inputs - The current user inputs from the store.
 * @returns {HTMLDivElement} The constructed DOM element for Step 4.
 */
export function renderStep4(inputs) {
  const panel = document.createElement('div');

  const titleWrapper = document.createElement('div');
  titleWrapper.innerHTML = `
    <div class="calculator__step-title">
      <div class="calculator__step-icon calculator__step-icon--shopping">
        <svg viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <path d="M5 7H19L17.5 18H6.5L5 7Z" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          <line x1="2" y1="7" x2="20" y2="7" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="9" y1="4" x2="7.5" y2="7" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="13" y1="4" x2="14.5" y2="7" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      <div>
        <h3>Shopping &amp; Review</h3>
        <p class="calculator__step-desc">Your shopping habits and a summary of your inputs.</p>
      </div>
    </div>
  `;
  panel.appendChild(titleWrapper.firstElementChild);

  const grid = document.createElement('div');
  grid.className = 'calculator__form-grid';

  grid.appendChild(
    makeFormGroup(
      createRadioCards({
        id: 'calc-fashion',
        name: 'fastFashion',
        label: 'Fast fashion purchases',
        options: [
          { value: 'high', text: 'High', icon: '👗' },
          { value: 'moderate', text: 'Moderate', icon: '👕' },
          { value: 'minimal', text: 'Minimal', icon: '🌿' },
          { value: 'secondhand', text: '2nd-hand', icon: '♻️' },
        ],
        defaultValue: inputs.shopping?.fastFashion || 'moderate',
        onChange: (val) => updateInput('fastFashion', val),
      })
    )
  );

  const currentCountry = inputs.country || 'United States';
  grid.appendChild(renderCountrySelector(currentCountry));

  panel.appendChild(grid);

  const summary = buildSummaryPreview(inputs);
  panel.appendChild(summary);

  return panel;
}
