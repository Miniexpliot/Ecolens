/**
 * @fileoverview EcoLens application module: step-3.js
 * Follows strict Google JavaScript Style Guide.
 */
import { createRadioCards } from '../../sanitize.js';
import { updateInput, makeFormGroup } from './shared.js';

/**
 * Renders the third step of the calculator (Diet & Waste).
 *
 * @param {Object} inputs - The current user inputs from the store.
 * @returns {HTMLDivElement} The constructed DOM element for Step 3.
 */
export function renderStep3(inputs) {
  const panel = document.createElement('div');

  const titleWrapper = document.createElement('div');
  titleWrapper.innerHTML = `
    <div class="calculator__step-title">
      <div class="calculator__step-icon calculator__step-icon--diet">
        <svg viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <path d="M11 2C11 2 5 7 5 13C5 16.31 7.69 19 11 19C14.31 19 17 16.31 17 13C17 7 11 2 11 2Z" fill="#f59e0b" opacity="0.12" stroke="#f59e0b" stroke-width="1.5"/>
          <line x1="11" y1="8" x2="11" y2="17" stroke="#f59e0b" stroke-width="1" stroke-linecap="round"/>
        </svg>
      </div>
      <div>
        <h3>Diet &amp; Waste</h3>
        <p class="calculator__step-desc">Your food choices and waste habits.</p>
      </div>
    </div>
  `;
  panel.appendChild(titleWrapper.firstElementChild);

  const grid = document.createElement('div');
  grid.className = 'calculator__form-grid';

  grid.appendChild(
    makeFormGroup(
      createRadioCards({
        id: 'calc-meat',
        name: 'meatConsumption',
        label: 'How often do you eat meat?',
        options: [
          { value: 'daily', text: 'Daily', icon: '🥩' },
          { value: 'frequently', text: '3-4x/wk', icon: '🍔' },
          { value: 'occasionally', text: '1-2x/wk', icon: '🍗' },
          { value: 'vegetarian', text: 'Vegetarian', icon: '🧀' },
          { value: 'vegan', text: 'Vegan', icon: '🥗' },
        ],
        defaultValue: inputs.diet?.meatConsumption || 'frequently',
        onChange: (val) => updateInput('meatConsumption', val),
      })
    )
  );

  grid.appendChild(
    makeFormGroup(
      createRadioCards({
        id: 'calc-recycle',
        name: 'recycling',
        label: 'Recycling habits',
        options: [
          { value: 'never', text: 'Never', icon: '🗑️' },
          { value: 'sometimes', text: 'Sometimes', icon: '♻️' },
          { value: 'always', text: 'Always', icon: '✅' },
        ],
        defaultValue: inputs.diet?.recycling || 'sometimes',
        onChange: (val) => updateInput('recycling', val),
      })
    )
  );

  grid.appendChild(
    makeFormGroup(
      createRadioCards({
        id: 'calc-compost',
        name: 'composting',
        label: 'Do you compost?',
        options: [
          { value: 'yes', text: 'Yes', icon: '🪱' },
          { value: 'no', text: 'No', icon: '🗑️' },
        ],
        defaultValue: inputs.diet?.composting || 'no',
        onChange: (val) => updateInput('composting', val),
      })
    )
  );

  panel.appendChild(grid);

  return panel;
}
