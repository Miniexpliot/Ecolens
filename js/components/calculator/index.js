/**
 * @fileoverview EcoLens application module: index.js
 * Follows strict Google JavaScript Style Guide.
 */
import { Store } from '../../state.js';
import { STEPS } from './shared.js';
import { buildStepIndicator, updateStepIndicator } from './step-indicator.js';
import { renderStep1 } from './step-1.js';
import { renderStep2 } from './step-2.js';
import { renderStep3 } from './step-3.js';
import { renderStep4 } from './step-4.js';
import { validateInputs } from '../../sanitize.js';
import { navigate } from '../../router.js';

let currentStep = 1;

/**
 * Renders the full carbon footprint calculator.
 * Coordinates all sub-steps, state management, and navigation.
 *
 * @returns {HTMLElement} The calculator section element.
 */
export function renderCalculator() {
  currentStep = 1;
  const state = Store.getState();

  const section = document.createElement('section');
  section.className = 'calculator section';
  section.setAttribute('aria-label', 'Carbon footprint calculator');

  const container = document.createElement('div');
  container.className = 'container container--narrow';

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
    <p class="calculator-header-desc">Answer a few questions about your daily habits to estimate your annual carbon emissions.</p>
  `;
  container.appendChild(header);

  const stepIndicator = buildStepIndicator(currentStep);
  container.appendChild(stepIndicator);

  const stepContent = document.createElement('div');
  stepContent.id = 'calculator-step-content';
  stepContent.setAttribute('role', 'region');
  stepContent.setAttribute('aria-live', 'polite');
  container.appendChild(stepContent);

  section.appendChild(container);

  renderStep(stepContent, currentStep, state.inputs);

  return section;
}

function renderStep(container, stepNum, inputs) {
  container.innerHTML = '';
  let stepElement;
  switch (stepNum) {
    case 1:
      stepElement = renderStep1(inputs);
      break;
    case 2:
      stepElement = renderStep2(inputs);
      break;
    case 3:
      stepElement = renderStep3(inputs);
      break;
    case 4:
      stepElement = renderStep4(inputs);
      break;
  }

  if (stepElement) {
    stepElement.className = 'calculator__step';
    stepElement.appendChild(buildNavButtons(stepNum));
    container.appendChild(stepElement);
  }
}

function buildNavButtons(step) {
  const nav = document.createElement('div');
  nav.className = 'calculator__nav';

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
    calcBtn.id = 'calculate-btn'; // added for testing
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
      if (
        !validation.valid &&
        validation.errors.some((e) => e.includes('No input sections found'))
      ) {
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
        errorBanner.innerHTML =
          '<strong>Error:</strong> No values found. Please provide valid inputs before calculating.';
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

function goToStep(step) {
  currentStep = step;
  updateStepIndicator(step);
  const contentArea = document.getElementById('calculator-step-content');
  if (contentArea) {
    const state = Store.getState();
    renderStep(contentArea, step, state.inputs);
  }
}
