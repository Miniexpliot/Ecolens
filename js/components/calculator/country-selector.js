/**
 * @fileoverview Country Selector Modal Component.
 * Renders a WCAG-compliant modal dialog for selecting a comparison
 * country/region. Includes search, keyboard navigation, focus
 * trapping, and Escape-to-close.
 */
import { NATIONAL_AVERAGES } from '../../constants.js';
import { updateInput } from './shared.js';

/**
 * Map of country names to their flag emoji icons.
 * @type {Record<string, string>}
 */
const COUNTRY_ICONS = {
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

/**
 * Renders the custom country selector modal component.
 * Allows users to choose a region for average footprint comparison.
 *
 * @param {string} currentCountry - The currently selected country name.
 * @returns {HTMLDivElement} The constructed DOM element.
 */
export function renderCountrySelector(currentCountry) {
  const countryGroup = document.createElement('div');
  countryGroup.className = 'form-group custom-country-group';

  const label = document.createElement('label');
  label.textContent = 'Country/region for comparison';
  countryGroup.appendChild(label);

  const button = document.createElement('button');
  button.className = 'country-selector-btn';
  button.type = 'button';
  button.setAttribute('aria-haspopup', 'dialog');
  button.innerHTML = `
    <span class="country-selector-value">
      <span class="country-icon">${COUNTRY_ICONS[currentCountry] || '🗺️'}</span>
      ${currentCountry}
    </span>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2" aria-hidden="true">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  `;

  // ── Modal Overlay ────────────────────────────────────────────
  const modal = document.createElement('div');
  modal.className = 'country-modal-overlay hidden';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Select a country for comparison');

  const modalContent = document.createElement('div');
  modalContent.className = 'country-modal';

  const modalHeader = document.createElement('div');
  modalHeader.className = 'country-modal-header';
  modalHeader.innerHTML = '<h3>Select a Country</h3>';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'country-modal-close';
  closeBtn.type = 'button';
  closeBtn.innerHTML = '&times;';
  closeBtn.setAttribute('aria-label', 'Close country selector');
  modalHeader.appendChild(closeBtn);

  const searchInput = document.createElement('input');
  searchInput.className = 'country-modal-search';
  searchInput.type = 'text';
  searchInput.placeholder = 'Search countries...';
  searchInput.setAttribute('aria-label', 'Search countries');

  const optionsGrid = document.createElement('div');
  optionsGrid.className = 'country-modal-grid';
  optionsGrid.setAttribute('role', 'listbox');
  optionsGrid.setAttribute('aria-label', 'Available countries');

  // ── Close helper ─────────────────────────────────────────────

  /** @type {HTMLElement|null} Element to restore focus to on close. */
  let previousFocus = null;

  /**
   * Close the modal and restore focus to the trigger element.
   */
  function closeModal() {
    modal.classList.add('hidden');
    if (previousFocus) {
      previousFocus.focus();
    }
  }

  closeBtn.onclick = closeModal;

  // Close on overlay backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // ── Escape key + focus trap ──────────────────────────────────
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
      return;
    }

    // Focus trap — Tab cycles within the modal
    if (e.key === 'Tab') {
      const focusable = modal.querySelectorAll(
        'button, [href], input, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // ── Render country cards ─────────────────────────────────────

  /**
   * Render the filtered country cards into the grid.
   * @param {string} filter - Search filter string.
   */
  const renderCountries = (filter = '') => {
    optionsGrid.innerHTML = '';
    Object.keys(NATIONAL_AVERAGES).forEach((key) => {
      if (!key.toLowerCase().includes(filter.toLowerCase())) return;

      const card = document.createElement('div');
      card.className =
        `country-modal-card ${key === currentCountry ? 'selected' : ''}`;
      card.setAttribute('role', 'option');
      card.setAttribute('aria-selected',
        key === currentCountry ? 'true' : 'false');
      card.setAttribute('tabindex', '0');
      card.innerHTML = `
        <span class="cm-icon">${COUNTRY_ICONS[key] || '🗺️'}</span>
        <span class="cm-name">${key}</span>
        <span class="cm-val">${NATIONAL_AVERAGES[key]}t</span>
      `;

      /**
       * Select a country and close the modal.
       */
      const selectCountry = () => {
        updateInput('country', key);
        button.querySelector('.country-selector-value').innerHTML = `
          <span class="country-icon">${COUNTRY_ICONS[key] || '🗺️'}</span>
          ${key}
        `;
        optionsGrid
          .querySelectorAll('.country-modal-card')
          .forEach((c) => {
            c.classList.remove('selected');
            c.setAttribute('aria-selected', 'false');
          });
        card.classList.add('selected');
        card.setAttribute('aria-selected', 'true');
        closeModal();
      };

      card.onclick = selectCountry;
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectCountry();
        }
      });

      optionsGrid.appendChild(card);
    });
  };

  searchInput.addEventListener('input', (e) => {
    renderCountries(e.target.value);
  });
  renderCountries();

  // ── Assemble modal ───────────────────────────────────────────
  modalContent.appendChild(modalHeader);
  modalContent.appendChild(searchInput);
  modalContent.appendChild(optionsGrid);
  modal.appendChild(modalContent);

  // ── Open handler ─────────────────────────────────────────────
  button.onclick = () => {
    previousFocus = document.activeElement;
    modal.classList.remove('hidden');
    searchInput.value = '';
    renderCountries();
    searchInput.focus();
  };

  countryGroup.appendChild(button);
  countryGroup.appendChild(modal);

  return countryGroup;
}
