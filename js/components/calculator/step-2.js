/**
 * @fileoverview EcoLens application module: step-2.js
 * Follows strict Google JavaScript Style Guide.
 */
import { createRadioCards } from '../../sanitize.js';
import { updateInput, makeFormGroup } from './shared.js';

/**
 * Renders the second step of the calculator (Home Energy).
 *
 * @param {Object} inputs - The current user inputs from the store.
 * @returns {HTMLDivElement} The constructed DOM element for Step 2.
 */
export function renderStep2(inputs) {
  const panel = document.createElement('div');

  const titleWrapper = document.createElement('div');
  titleWrapper.innerHTML = `
    <div class="calculator__step-title">
      <div class="calculator__step-icon calculator__step-icon--home">
        <svg viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <path d="M3 11L11 3L19 11" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          <path d="M5 10V19H9V14H13V19H17V10" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>
      </div>
      <div>
        <h3>Home Energy</h3>
        <p class="calculator__step-desc">Tell us about your home energy usage.</p>
      </div>
    </div>
  `;
  panel.appendChild(titleWrapper.firstElementChild);

  const grid = document.createElement('div');
  grid.className = 'calculator__form-grid';

  grid.appendChild(
    makeFormGroup(
      createRadioCards({
        id: 'calc-heating',
        name: 'heatingUsage',
        label: 'Heating/cooling usage',
        options: [
          { value: 'heavy', text: 'Heavy', icon: '🔥❄️' },
          { value: 'moderate', text: 'Moderate', icon: '🌡️' },
          { value: 'minimal', text: 'Minimal', icon: '🧥' },
          { value: 'none', text: 'Off/NA', icon: '🚫' },
        ],
        defaultValue: inputs.home?.heatingCooling || 'moderate',
        onChange: (val) => updateInput('heatingUsage', val),
      })
    )
  );

  grid.appendChild(
    makeFormGroup(
      createRadioCards({
        id: 'calc-unplug',
        name: 'unplugHabit',
        label: 'Do you unplug appliances when not in use?',
        options: [
          { value: 'neverUnplug', text: 'Never', icon: '🔌' },
          { value: 'sometimesUnplug', text: 'Sometimes', icon: '🤔' },
          { value: 'alwaysUnplug', text: 'Always', icon: '✅' },
        ],
        defaultValue: inputs.home?.unplugAppliances || 'sometimesUnplug',
        onChange: (val) => updateInput('unplugHabit', val),
      })
    )
  );

  grid.appendChild(
    makeFormGroup(
      createRadioCards({
        id: 'calc-renewable',
        name: 'renewableEnergy',
        label: 'Renewable energy mix',
        options: [
          { value: 'none', text: 'None', icon: '🏭' },
          { value: 'partial', text: 'Partial', icon: '🌤️' },
          { value: 'full', text: '100% Renewable', icon: '☀️' },
        ],
        defaultValue: inputs.home?.renewableEnergy || 'none',
        onChange: (val) => updateInput('renewableEnergy', val),
      })
    )
  );

  panel.appendChild(grid);

  return panel;
}
