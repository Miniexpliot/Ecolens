/**
 * @fileoverview EcoLens application module: step-1.js
 * Follows strict Google JavaScript Style Guide.
 */
import {
  sanitizeNumber,
  createSafeRangeInput,
  createRadioCards,
} from '../../sanitize.js';
import { updateInput, makeFormGroup } from './shared.js';

/**
 * Renders the first step of the calculator (Daily Travel).
 *
 * @param {Object} inputs - The current user inputs from the store.
 * @returns {HTMLDivElement} The constructed DOM element for Step 1.
 */
export function renderStep1(inputs) {
  const panel = document.createElement('div');

  const titleWrapper = document.createElement('div');
  titleWrapper.innerHTML = `
    <div class="calculator__step-title">
      <div class="calculator__step-icon calculator__step-icon--travel">
        <svg viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <circle cx="5.5" cy="17" r="2.5" stroke="#10b981" stroke-width="1.5" fill="none"/>
          <circle cx="16.5" cy="17" r="2.5" stroke="#10b981" stroke-width="1.5" fill="none"/>
          <path d="M3 14L5 9H13L16.5 14" stroke="#10b981" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          <line x1="3" y1="14" x2="19" y2="14" stroke="#10b981" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      <div>
        <h3>Daily Travel</h3>
        <p class="calculator__step-desc">How do you get around day to day?</p>
      </div>
    </div>
  `;
  panel.appendChild(titleWrapper.firstElementChild);

  const grid = document.createElement('div');
  grid.className = 'calculator__form-grid';

  grid.appendChild(
    makeFormGroup(
      createRadioCards({
        id: 'calc-car-type',
        name: 'carType',
        label: 'What type of car do you drive?',
        options: [
          { value: 'gas', text: 'Gasoline', icon: '⛽' },
          { value: 'hybrid', text: 'Hybrid', icon: '⚡⛽' },
          { value: 'ev', text: 'Electric', icon: '🔋' },
          { value: 'none', text: 'No Car', icon: '🚶' },
        ],
        defaultValue: inputs.travel?.carType || 'gas',
        onChange: (val) => updateInput('carType', val),
      })
    )
  );

  grid.appendChild(
    makeFormGroup(
      createSafeRangeInput({
        id: 'calc-commute-distance',
        name: 'commuteDistance',
        label: 'Daily commute distance (one way, miles)',
        min: 0,
        max: 100,
        step: 1,
        defaultValue: inputs.travel?.commuteDistance ?? 15,
        unit: 'miles',
        onChange: (val) =>
          updateInput('commuteDistance', sanitizeNumber(val, 0, 500, 15)),
      })
    )
  );

  grid.appendChild(
    makeFormGroup(
      createSafeRangeInput({
        id: 'calc-commute-days',
        name: 'commuteDays',
        label: 'How many days per week do you commute?',
        min: 0,
        max: 7,
        step: 1,
        defaultValue: inputs.travel?.commuteFrequency ?? 5,
        unit: 'days/wk',
        onChange: (val) =>
          updateInput('commuteDays', sanitizeNumber(val, 0, 7, 5)),
      })
    )
  );

  grid.appendChild(
    makeFormGroup(
      createSafeRangeInput({
        id: 'calc-transit-days',
        name: 'transitDays',
        label: 'Days per week using public transit',
        min: 0,
        max: 7,
        step: 1,
        defaultValue: inputs.travel?.transitFrequency ?? 0,
        unit: 'days/wk',
        onChange: (val) =>
          updateInput('transitDays', sanitizeNumber(val, 0, 7, 0)),
      })
    )
  );

  grid.appendChild(
    makeFormGroup(
      createSafeRangeInput({
        id: 'calc-bike-days',
        name: 'bikeDays',
        label: 'Days per week biking or walking',
        min: 0,
        max: 7,
        step: 1,
        defaultValue: inputs.travel?.bikeWalkFrequency ?? 0,
        unit: 'days/wk',
        onChange: (val) =>
          updateInput('bikeDays', sanitizeNumber(val, 0, 7, 0)),
      })
    )
  );

  panel.appendChild(grid);

  return panel;
}
