/**
 * @fileoverview EcoLens application module: country-selector.js
 * Follows strict Google JavaScript Style Guide.
 */
import { NATIONAL_AVERAGES } from '../../constants.js';
import { updateInput } from './shared.js';

/**
 * Renders the custom country selector modal component.
 * Allows users to choose a region for average footprint comparison.
 *
 * @param {string} currentCountry - The currently selected country name.
 * @returns {HTMLDivElement} The constructed DOM element for the country selector.
 */
export function renderCountrySelector(currentCountry) {
  const countryIcons = {
    'United States': '🇺🇸',
    Canada: '🇨🇦',
    Australia: '🇦🇺',
    'United Kingdom': '🇬🇧',
    Germany: '🇩🇪',
    France: '🇫🇷',
    Japan: '🇯🇵',
    China: '🇨🇳',
    India: '🇮🇳',
    Brazil: '🇧🇷',
    'World Average': '🌍',
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
    Object.keys(NATIONAL_AVERAGES).forEach((key) => {
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
        optionsGrid
          .querySelectorAll('.country-modal-card')
          .forEach((c) => c.classList.remove('selected'));
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

  return countryGroup;
}
