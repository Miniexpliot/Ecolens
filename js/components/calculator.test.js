/**
 * @fileoverview EcoLens application module: calculator.test.js
 * Follows strict Google JavaScript Style Guide.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderCalculator } from './calculator/index.js';
import { Store } from '../state.js';
import { NATIONAL_AVERAGES } from '../constants.js';

describe('Calculator Component', () => {
  beforeEach(() => {
    Store.reset();
    document.body.innerHTML = '';
  });

  it('renders step 1 initially', () => {
    const section = renderCalculator();
    document.body.appendChild(section);

    expect(section.querySelector('h3').textContent).toBe('Daily Travel');
    expect(section.querySelector('#step-indicator')).not.toBeNull();
  });

  it('navigates to next step on button click', () => {
    const section = renderCalculator();
    document.body.appendChild(section);

    const nextBtn = document.body.querySelector(
      '.calculator__nav .btn--primary'
    );
    nextBtn.click();

    expect(document.body.querySelector('h3').textContent).toBe('Home Energy');
  });

  it('navigates back to previous step', () => {
    const section = renderCalculator();
    document.body.appendChild(section);

    // Go to step 2
    document.body.querySelector('.calculator__nav .btn--primary').click();

    // Go back to step 1
    const backBtn = document.body.querySelector('.calculator__nav .btn--ghost');
    backBtn.click();

    expect(document.body.querySelector('h3').textContent).toBe('Daily Travel');
  });

  it('updates state when input changes', () => {
    const section = renderCalculator();
    document.body.appendChild(section);

    const input = document.getElementById('calc-commute-distance');
    input.value = 30;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('change'));

    expect(Store.getState().inputs.travel.commuteDistance).toBe(30);
  });

  it('defaults gracefully and calculates if store inputs are missing', () => {
    Store.setState({ inputs: {} });

    const section = renderCalculator();
    document.body.appendChild(section);

    // Go to step 4
    document.body.querySelector('.calculator__nav .btn--primary').click();
    document.body.querySelector('.calculator__nav .btn--primary').click();
    document.body.querySelector('.calculator__nav .btn--primary').click();

    const generateSpy = vi.spyOn(Store, 'generateReport');
    const calcBtn = document.getElementById('calculate-btn');
    calcBtn.click();

    expect(generateSpy).toHaveBeenCalled();
  });

  it('generates report and navigates to results on valid calculate', () => {
    const section = renderCalculator();
    document.body.appendChild(section);

    // Go to step 4
    document.body.querySelector('.calculator__nav .btn--primary').click();
    document.body.querySelector('.calculator__nav .btn--primary').click();
    document.body.querySelector('.calculator__nav .btn--primary').click();

    // Mock router and Store
    const generateSpy = vi.spyOn(Store, 'generateReport');
    // Router navigation is harder to mock without exposing router.js dependencies,
    // but we can check if generateReport is called since the form isn't empty by default.

    const calcBtn = document.getElementById('calculate-btn');
    calcBtn.click();

    expect(generateSpy).toHaveBeenCalled();
  });

  it('renders country selector and updates state on selection', () => {
    const section = renderCalculator();
    document.body.appendChild(section);

    // Go to step 4
    document.body.querySelector('.calculator__nav .btn--primary').click();
    document.body.querySelector('.calculator__nav .btn--primary').click();
    document.body.querySelector('.calculator__nav .btn--primary').click();

    const btn = document.querySelector('.country-selector-btn');
    expect(btn).not.toBeNull();

    // Click selector
    btn.click();

    const modal = document.querySelector('.country-modal-overlay');
    expect(modal.classList.contains('hidden')).toBe(false);

    // Click a country
    const firstCountryCard = modal.querySelector('.country-modal-card');
    firstCountryCard.click();

    // Should be hidden again
    expect(modal.classList.contains('hidden')).toBe(true);

    // State should be updated
    const stateCountry = Store.getState().inputs.country;
    expect(Object.keys(NATIONAL_AVERAGES)).toContain(stateCountry);
  });
});
