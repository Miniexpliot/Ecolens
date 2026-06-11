/**
 * EcoLens — Multi-Step Carbon Calculator Component
 * 4-step form with step indicators, accessible inputs,
 * and immediate Store synchronisation on every change.
 */

import { Store } from '../state.js';
import { NATIONAL_AVERAGES } from '../constants.js';
import { sanitizeNumber, createSafeRangeInput, createRadioCards, validateInputs } from '../sanitize.js';
import { navigate } from '../router.js';

/* ── Step definitions ────────────────────────────────────────── */
const STEPS = [
  { id: 1, label: 'Daily Travel', icon: 'travel' },
  { id: 2, label: 'Home Energy', icon: 'home' },
  { id: 3, label: 'Diet & Waste', icon: 'diet' },
  { id: 4, label: 'Shopping & Review', icon: 'shopping' }
];

let currentStep = 1;

/**
 * Render the full multi-step calculator section.
 * @returns {HTMLElement}
 */
export function renderCalculator() {
  currentStep = 1;
  const state = Store.getState();

  const section = document.createElement('section');
  section.className = 'calculator section';
  section.setAttribute('aria-label', 'Carbon footprint calculator');

  const container = document.createElement('div');
  container.className = 'container container--narrow';

  // Header
  const header = document.createElement('header');
  header.className = 'calculator__header';
  header.innerHTML = `
    <div class="section-badge">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="10" height="10" rx="2" stroke="#10b981" stroke-width="1.5"/>
        <line x1="5" y1="5" x2="9" y2="5" stroke="#10b981" stroke-width="1" stroke-linecap="round"/>
        <line x1="5" y1="7.5" x2="8" y2="7.5" stroke="#10b981" stroke-width="1" stroke-linecap="round"/>
        <line x1="5" y1="10" x2="7" y2="10" stroke="#10b981" stroke-width="1" stroke-linecap="round"/>
      </svg>
      Calculator
    </div>
    <h2>Calculate Your Footprint</h2>
    <p style="color: var(--text-secondary);">Answer a few questions about your daily habits to estimate your annual carbon emissions.</p>
  `;
  container.appendChild(header);

  // Step indicator
  const stepIndicator = buildStepIndicator(currentStep);
  container.appendChild(stepIndicator);

  // Step content area
  const stepContent = document.createElement('div');
  stepContent.id = 'calculator-step-content';
  stepContent.setAttribute('role', 'region');
  stepContent.setAttribute('aria-live', 'polite');
  container.appendChild(stepContent);

  section.appendChild(container);

  // Render the first step
  renderStep(stepContent, currentStep, state.inputs);

  return section;
}

/* ── Step Indicator ──────────────────────────────────────────── */

function buildStepIndicator(active) {
  const wrapper = document.createElement('div');
  wrapper.className = 'step-indicator';
  wrapper.setAttribute('role', 'list');
  wrapper.setAttribute('aria-label', 'Calculator steps');
  wrapper.id = 'step-indicator';

  STEPS.forEach((step, i) => {
    const isActive = step.id === active;
    const isCompleted = step.id < active;

    const stepEl = document.createElement('div');
    stepEl.className = 'step-indicator__step';
    if (isActive) stepEl.classList.add('step-indicator__step--active');
    if (isCompleted) stepEl.classList.add('step-indicator__step--completed');
    stepEl.setAttribute('role', 'listitem');

    const circle = document.createElement('div');
    circle.className = 'step-indicator__circle';
    if (isCompleted) {
      circle.innerHTML = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><polyline points="4,9 8,13 14,5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    } else {
      circle.textContent = step.id;
    }

    const label = document.createElement('div');
    label.className = 'step-indicator__label';
    label.textContent = step.label;

    stepEl.appendChild(circle);
    stepEl.appendChild(label);
    wrapper.appendChild(stepEl);

    // Add connector line between steps
    if (i < STEPS.length - 1) {
      const line = document.createElement('div');
      line.className = 'step-indicator__line';
      if (isCompleted) line.classList.add('step-indicator__line--completed');
      wrapper.appendChild(line);
    }
  });

  return wrapper;
}

function updateStepIndicator(active) {
  const old = document.getElementById('step-indicator');
  if (old) {
    const newIndicator = buildStepIndicator(active);
    old.replaceWith(newIndicator);
  }
}

/* ── Step Rendering ──────────────────────────────────────────── */

function renderStep(container, stepNum, inputs) {
  container.innerHTML = '';
  const panel = document.createElement('div');
  panel.className = 'calculator__step';

  switch (stepNum) {
    case 1: renderStep1(panel, inputs); break;
    case 2: renderStep2(panel, inputs); break;
    case 3: renderStep3(panel, inputs); break;
    case 4: renderStep4(panel, inputs); break;
  }

  container.appendChild(panel);
}

/* ── Step 1: Daily Travel ────────────────────────────────────── */

function renderStep1(panel, inputs) {
  panel.innerHTML = `
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
        <p style="color: var(--text-muted); font-size: 0.85rem;">How do you get around day to day?</p>
      </div>
    </div>
  `;

  const grid = document.createElement('div');
  grid.className = 'calculator__form-grid';

  // Car type
  grid.appendChild(makeFormGroup(
    createRadioCards({
      id: 'calc-car-type',
      name: 'carType',
      label: 'What type of car do you drive?',
      options: [
        { value: 'gas', text: 'Gasoline', icon: '⛽' },
        { value: 'hybrid', text: 'Hybrid', icon: '⚡⛽' },
        { value: 'ev', text: 'Electric', icon: '🔋' },
        { value: 'none', text: 'No Car', icon: '🚶' }
      ],
      defaultValue: inputs.travel?.carType || 'gas',
      onChange: (val) => updateInput('carType', val)
    })
  ));

  // Daily commute distance
  grid.appendChild(makeFormGroup(
    createSafeRangeInput({
      id: 'calc-commute-distance',
      name: 'commuteDistance',
      label: 'Daily commute distance (one way, miles)',
      min: 0,
      max: 100,
      step: 1,
      defaultValue: inputs.travel?.commuteDistance ?? 15,
      unit: 'miles',
      onChange: (val) => updateInput('commuteDistance', sanitizeNumber(val, 0, 500, 15))
    })
  ));

  // Days commuting
  grid.appendChild(makeFormGroup(
    createSafeRangeInput({
      id: 'calc-commute-days',
      name: 'commuteDays',
      label: 'How many days per week do you commute?',
      min: 0,
      max: 7,
      step: 1,
      defaultValue: inputs.travel?.commuteFrequency ?? 5,
      unit: 'days/wk',
      onChange: (val) => updateInput('commuteDays', sanitizeNumber(val, 0, 7, 5))
    })
  ));

  // Public transit days
  grid.appendChild(makeFormGroup(
    createSafeRangeInput({
      id: 'calc-transit-days',
      name: 'transitDays',
      label: 'Days per week using public transit',
      min: 0,
      max: 7,
      step: 1,
      defaultValue: inputs.travel?.transitFrequency ?? 0,
      unit: 'days/wk',
      onChange: (val) => updateInput('transitDays', sanitizeNumber(val, 0, 7, 0))
    })
  ));

  // Biking / walking days
  grid.appendChild(makeFormGroup(
    createSafeRangeInput({
      id: 'calc-bike-days',
      name: 'bikeDays',
      label: 'Days per week biking or walking',
      min: 0,
      max: 7,
      step: 1,
      defaultValue: inputs.travel?.bikeWalkFrequency ?? 0,
      unit: 'days/wk',
      onChange: (val) => updateInput('bikeDays', sanitizeNumber(val, 0, 7, 0))
    })
  ));

  panel.appendChild(grid);
  panel.appendChild(buildNavButtons(1));
}

/* ── Step 2: Home Energy ─────────────────────────────────────── */

function renderStep2(panel, inputs) {
  panel.innerHTML = `
    <div class="calculator__step-title">
      <div class="calculator__step-icon calculator__step-icon--home">
        <svg viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <path d="M3 11L11 3L19 11" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          <path d="M5 10V19H9V14H13V19H17V10" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>
      </div>
      <div>
        <h3>Home Energy</h3>
        <p style="color: var(--text-muted); font-size: 0.85rem;">Tell us about your home energy usage.</p>
      </div>
    </div>
  `;

  const grid = document.createElement('div');
  grid.className = 'calculator__form-grid';

  // Heating / Cooling usage
  grid.appendChild(makeFormGroup(
    createRadioCards({
      id: 'calc-heating',
      name: 'heatingUsage',
      label: 'Heating/cooling usage',
      options: [
        { value: 'heavy', text: 'Heavy', icon: '🔥❄️' },
        { value: 'moderate', text: 'Moderate', icon: '🌡️' },
        { value: 'minimal', text: 'Minimal', icon: '🧥' },
        { value: 'none', text: 'Off/NA', icon: '🚫' }
      ],
      defaultValue: inputs.home?.heatingCooling || 'moderate',
      onChange: (val) => updateInput('heatingCooling', val)
    })
  ));

  // Unplug appliances
  grid.appendChild(makeFormGroup(
    createRadioCards({
      id: 'calc-unplug',
      name: 'unplugHabit',
      label: 'Do you unplug appliances when not in use?',
      options: [
        { value: 'neverUnplug', text: 'Never', icon: '🔌' },
        { value: 'sometimesUnplug', text: 'Sometimes', icon: '🤔' },
        { value: 'alwaysUnplug', text: 'Always', icon: '✅' }
      ],
      defaultValue: inputs.home?.unplugAppliances || 'sometimesUnplug',
      onChange: (val) => updateInput('unplugAppliances', val)
    })
  ));

  // Renewable energy
  grid.appendChild(makeFormGroup(
    createRadioCards({
      id: 'calc-renewable',
      name: 'renewableEnergy',
      label: 'Renewable energy mix',
      options: [
        { value: 'none', text: 'None', icon: '🏭' },
        { value: 'partial', text: 'Partial', icon: '🌤️' },
        { value: 'full', text: '100% Renewable', icon: '☀️' }
      ],
      defaultValue: inputs.home?.renewableEnergy || 'none',
      onChange: (val) => updateInput('renewableEnergy', val)
    })
  ));

  panel.appendChild(grid);
  panel.appendChild(buildNavButtons(2));
}

/* ── Step 3: Diet & Waste ────────────────────────────────────── */

function renderStep3(panel, inputs) {
  panel.innerHTML = `
    <div class="calculator__step-title">
      <div class="calculator__step-icon calculator__step-icon--diet">
        <svg viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <path d="M11 2C11 2 5 7 5 13C5 16.31 7.69 19 11 19C14.31 19 17 16.31 17 13C17 7 11 2 11 2Z" fill="#f59e0b" opacity="0.12" stroke="#f59e0b" stroke-width="1.5"/>
          <line x1="11" y1="8" x2="11" y2="17" stroke="#f59e0b" stroke-width="1" stroke-linecap="round"/>
        </svg>
      </div>
      <div>
        <h3>Diet &amp; Waste</h3>
        <p style="color: var(--text-muted); font-size: 0.85rem;">Your food choices and waste habits.</p>
      </div>
    </div>
  `;

  const grid = document.createElement('div');
  grid.className = 'calculator__form-grid';

  // Meat consumption
  grid.appendChild(makeFormGroup(
    createRadioCards({
      id: 'calc-meat',
      name: 'meatConsumption',
      label: 'How often do you eat meat?',
      options: [
        { value: 'daily', text: 'Daily', icon: '🥩' },
        { value: 'frequently', text: '3-4x/wk', icon: '🍔' },
        { value: 'occasionally', text: '1-2x/wk', icon: '🍗' },
        { value: 'vegetarian', text: 'Vegetarian', icon: '🧀' },
        { value: 'vegan', text: 'Vegan', icon: '🥗' }
      ],
      defaultValue: inputs.diet?.meatConsumption || 'frequently',
      onChange: (val) => updateInput('meatConsumption', val)
    })
  ));

  // Recycling
  grid.appendChild(makeFormGroup(
    createRadioCards({
      id: 'calc-recycle',
      name: 'recycling',
      label: 'Recycling habits',
      options: [
        { value: 'never', text: 'Never', icon: '🗑️' },
        { value: 'sometimes', text: 'Sometimes', icon: '♻️' },
        { value: 'always', text: 'Always', icon: '✅' }
      ],
      defaultValue: inputs.diet?.recycling || 'sometimes',
      onChange: (val) => updateInput('recycling', val)
    })
  ));

  // Composting
  grid.appendChild(makeFormGroup(
    createRadioCards({
      id: 'calc-compost',
      name: 'composting',
      label: 'Do you compost?',
      options: [
        { value: 'yes', text: 'Yes', icon: '🪱' },
        { value: 'no', text: 'No', icon: '🗑️' }
      ],
      defaultValue: inputs.diet?.composting || 'no',
      onChange: (val) => updateInput('composting', val)
    })
  ));

  panel.appendChild(grid);
  panel.appendChild(buildNavButtons(3));
}

/* ── Step 4: Shopping & Review ───────────────────────────────── */

function renderStep4(panel, inputs) {
  panel.innerHTML = `
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
        <p style="color: var(--text-muted); font-size: 0.85rem;">Your shopping habits and a summary of your inputs.</p>
      </div>
    </div>
  `;

  const grid = document.createElement('div');
  grid.className = 'calculator__form-grid';

  // Fast fashion
  grid.appendChild(makeFormGroup(
    createRadioCards({
      id: 'calc-fashion',
      name: 'fastFashion',
      label: 'Fast fashion purchases',
      options: [
        { value: 'high', text: 'High', icon: '👗' },
        { value: 'moderate', text: 'Moderate', icon: '👕' },
        { value: 'minimal', text: 'Minimal', icon: '🌿' },
        { value: 'secondhand', text: '2nd-hand', icon: '♻️' }
      ],
      defaultValue: inputs.shopping?.fastFashion || 'moderate',
      onChange: (val) => updateInput('fastFashion', val)
    })
  ));

  // Custom Country Modal
  const currentCountry = inputs.country || 'United States';
  const countryIcons = {
    'United States': '🇺🇸', 'Canada': '🇨🇦', 'Australia': '🇦🇺',
    'United Kingdom': '🇬🇧', 'Germany': '🇩🇪', 'France': '🇫🇷',
    'Japan': '🇯🇵', 'China': '🇨🇳', 'India': '🇮🇳',
    'Brazil': '🇧🇷', 'World Average': '🌍'
  };

  const countryGroup = document.createElement('div');
  countryGroup.className = 'form-group custom-country-group';
  
  const label = document.createElement('label');
  label.textContent = 'Country/region for comparison';
  countryGroup.appendChild(label);

  const button = document.createElement('button');
  button.className = 'country-selector-btn';
  button.type = 'button';
  button.innerHTML = `
    <span class="country-selector-value">
      <span class="country-icon">${countryIcons[currentCountry] || '🗺️'}</span>
      ${currentCountry}
    </span>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  `;

  // The Modal Overlay
  const modal = document.createElement('div');
  modal.className = 'country-modal-overlay hidden';
  
  const modalContent = document.createElement('div');
  modalContent.className = 'country-modal';
  
  const modalHeader = document.createElement('div');
  modalHeader.className = 'country-modal-header';
  modalHeader.innerHTML = '<h3>Select a Country</h3>';
  const closeBtn = document.createElement('button');
  closeBtn.className = 'country-modal-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.onclick = () => modal.classList.add('hidden');
  modalHeader.appendChild(closeBtn);
  
  const searchInput = document.createElement('input');
  searchInput.className = 'country-modal-search';
  searchInput.type = 'text';
  searchInput.placeholder = 'Search countries...';
  
  const optionsGrid = document.createElement('div');
  optionsGrid.className = 'country-modal-grid';

  const renderCountries = (filter = '') => {
    optionsGrid.innerHTML = '';
    Object.keys(NATIONAL_AVERAGES).forEach(key => {
      if (!key.toLowerCase().includes(filter.toLowerCase())) return;
      
      const card = document.createElement('div');
      card.className = `country-modal-card ${key === currentCountry ? 'selected' : ''}`;
      card.innerHTML = `
        <span class="cm-icon">${countryIcons[key] || '🗺️'}</span>
        <span class="cm-name">${key}</span>
        <span class="cm-val">${NATIONAL_AVERAGES[key]}t</span>
      `;
      
      card.onclick = () => {
        updateInput('country', key);
        button.querySelector('.country-selector-value').innerHTML = `
          <span class="country-icon">${countryIcons[key] || '🗺️'}</span> ${key}
        `;
        modal.classList.add('hidden');
        // Update selection visually in grid
        optionsGrid.querySelectorAll('.country-modal-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      };
      
      optionsGrid.appendChild(card);
    });
  };

  searchInput.addEventListener('input', (e) => renderCountries(e.target.value));
  renderCountries();

  modalContent.appendChild(modalHeader);
  modalContent.appendChild(searchInput);
  modalContent.appendChild(optionsGrid);
  modal.appendChild(modalContent);

  button.onclick = () => {
    modal.classList.remove('hidden');
    searchInput.focus();
  };

  countryGroup.appendChild(button);
  countryGroup.appendChild(modal);
  grid.appendChild(countryGroup);

  panel.appendChild(grid);

  // Summary preview
  const summary = buildSummaryPreview(inputs);
  panel.appendChild(summary);

  // Nav buttons (with Calculate CTA)
  panel.appendChild(buildNavButtons(4));
}

/* ── Summary Preview ─────────────────────────────────────────── */

function buildSummaryPreview(inputs) {
  const wrapper = document.createElement('div');
  wrapper.className = 'calculator__summary';
  wrapper.innerHTML = `
    <h4 style="margin-bottom: var(--space-sm); color: var(--text-secondary);">Summary of Your Inputs</h4>

    <div class="calculator__summary-group">
      <div class="calculator__summary-group-title" style="color: var(--color-travel);">🚗 Daily Travel</div>
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
      <div class="calculator__summary-group-title" style="color: var(--color-home);">🏠 Home Energy</div>
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
      <div class="calculator__summary-group-title" style="color: var(--color-diet);">🥗 Diet & Waste</div>
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
      <div class="calculator__summary-group-title" style="color: var(--color-shopping);">🛍️ Shopping</div>
      <div class="calculator__summary-item">
        <span class="calculator__summary-item-label">Fast Fashion</span>
        <span class="calculator__summary-item-value">${formatValue(inputs.shopping?.fastFashion, { high: 'High (Monthly)', moderate: 'Moderate', minimal: 'Minimal', secondhand: 'Secondhand' })}</span>
      </div>
      <div class="calculator__summary-item">
        <span class="calculator__summary-item-label">Comparison Country</span>
        <span class="calculator__summary-item-value">${inputs.country || 'US'}</span>
      </div>
    </div>
  `;

  return wrapper;
}

/* ── Navigation Buttons ──────────────────────────────────────── */

function buildNavButtons(step) {
  const nav = document.createElement('div');
  nav.className = 'calculator__nav';

  // Left side
  const leftSide = document.createElement('div');
  if (step > 1) {
    const backBtn = document.createElement('button');
    backBtn.type = 'button';
    backBtn.className = 'btn btn--ghost';
    backBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Back
    `;
    backBtn.addEventListener('click', () => goToStep(step - 1));
    leftSide.appendChild(backBtn);
  } else {
    leftSide.innerHTML = `<span class="calculator__nav-hint">Step ${step} of ${STEPS.length}</span>`;
  }
  nav.appendChild(leftSide);

  // Right side
  const rightSide = document.createElement('div');
  if (step < 4) {
    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'btn btn--primary';
    nextBtn.innerHTML = `
      Next
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M6 4L10 8L6 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    nextBtn.addEventListener('click', () => goToStep(step + 1));
    rightSide.appendChild(nextBtn);
  } else {
    const calcBtn = document.createElement('button');
    calcBtn.type = 'button';
    calcBtn.className = 'btn btn--primary btn--lg';
    calcBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M9 1C9 1 3 5 3 10C3 13.31 5.69 16 9 16C12.31 16 15 13.31 15 10C15 5 9 1 9 1Z" fill="currentColor" opacity="0.2"/>
        <path d="M9 1C9 1 3 5 3 10C3 13.31 5.69 16 9 16C12.31 16 15 13.31 15 10C15 5 9 1 9 1Z" stroke="currentColor" stroke-width="1.5"/>
      </svg>
      Calculate My Footprint
    `;
    calcBtn.addEventListener('click', () => {
      const state = Store.getState();
      const validation = validateInputs(state.inputs);
      if (!validation.valid && validation.errors.includes('No values found')) {
        let errorBanner = document.getElementById('calc-error-banner');
        if (!errorBanner) {
          errorBanner = document.createElement('div');
          errorBanner.id = 'calc-error-banner';
          errorBanner.className = 'form-error';
          errorBanner.style.padding = '10px';
          errorBanner.style.marginBottom = '15px';
          errorBanner.style.background = 'rgba(239, 68, 68, 0.15)';
          errorBanner.style.border = '1px solid #ef4444';
          errorBanner.style.borderRadius = 'var(--radius-sm)';
          if (nav.parentNode) {
            nav.parentNode.insertBefore(errorBanner, nav);
          }
        }
        errorBanner.innerHTML = '<strong>Error:</strong> No values found. Please provide valid inputs before calculating.';
        return;
      }
      Store.generateReport();
      navigate('results');
    });
    rightSide.appendChild(calcBtn);
  }
  nav.appendChild(rightSide);

  return nav;
}

/* ── Step Navigation ─────────────────────────────────────────── */

function goToStep(step) {
  currentStep = step;
  updateStepIndicator(step);
  const contentArea = document.getElementById('calculator-step-content');
  if (contentArea) {
    const state = Store.getState();
    renderStep(contentArea, step, state.inputs);
  }
}

/* ── Helpers ─────────────────────────────────────────────────── */

/**
 * Update the global store with a single input change.
 * Routes flat form keys into the correct nested state structure.
 * @param {string} key - Input key
 * @param {*} value - Updated value
 */
function updateInput(key, value) {
  if (value === undefined) return;
  const state = Store.getState();
  
  const categoryMap = {
    carType: { category: 'travel', stateKey: 'carType' },
    commuteDistance: { category: 'travel', stateKey: 'commuteDistance' },
    commuteDays: { category: 'travel', stateKey: 'commuteFrequency' },
    transitDays: { category: 'travel', stateKey: 'transitFrequency' },
    bikeDays: { category: 'travel', stateKey: 'bikeWalkFrequency' },
    
    heatingUsage: { category: 'home', stateKey: 'heatingCooling' },
    unplugHabit: { category: 'home', stateKey: 'unplugAppliances' },
    renewableEnergy: { category: 'home', stateKey: 'renewableEnergy' },
    
    meatConsumption: { category: 'diet', stateKey: 'meatConsumption' },
    recycling: { category: 'diet', stateKey: 'recycling' },
    composting: { category: 'diet', stateKey: 'composting' },
    
    fastFashion: { category: 'shopping', stateKey: 'fastFashion' },
    country: { category: 'root', stateKey: 'country' }
  };
  
  const mapping = categoryMap[key];
  if (!mapping) return;
  
  const { category, stateKey } = mapping;
  
  if (category === 'root') {
    Store.setState({
      inputs: { ...state.inputs, [stateKey]: value }
    });
  } else {
    Store.setState({
      inputs: {
        ...state.inputs,
        [category]: {
          ...state.inputs[category],
          [stateKey]: value
        }
      }
    });
  }
}

/**
 * Formats a value using a translation map.
 * @param {string} val - Key to look up
 * @param {Object} map - Translation dictionary
 * @returns {string} Formatted label
 */
function formatValue(val, map) {
  if (!val) return map[Object.keys(map)[0]] || '—';
  return map[val] || val;
}

/**
 * Wrap a form element created by createSafeSelect / createSafeNumberInput
 * inside a .form-group container for consistent layout.
 */
function makeFormGroup(element) {
  const group = document.createElement('div');
  group.className = 'form-group';
  group.appendChild(element);
  return group;
}
