/**
 * @fileoverview EcoLens application module: navbar.js
 * Follows strict Google JavaScript Style Guide.
 */
/**
 * EcoLens — Navbar Component
 * Fixed-top glassmorphic navigation bar with mobile hamburger menu,
 * skip navigation link, and accessible ARIA attributes.
 */

/**
 * Render the main navigation bar.
 * @returns {HTMLElement} The navbar element.
 */
export function renderNavbar() {
  const nav = document.createElement('nav');
  nav.className = 'navbar';
  nav.setAttribute('role', 'navigation');
  nav.setAttribute('aria-label', 'Main navigation');

  nav.innerHTML = `
    <div class="navbar__inner">
      <!-- Logo -->
      <a href="#" class="navbar__logo" aria-label="EcoLens home">
        <svg class="navbar__logo-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M16 2C16 2 6 10 6 18C6 23.52 10.48 28 16 28C21.52 28 26 23.52 26 18C26 10 16 2 16 2Z" fill="url(#leaf-gradient)" opacity="0.9"/>
          <path d="M16 8C16 8 12 14 12 18C12 20.21 13.79 22 16 22C18.21 22 20 20.21 20 18C20 14 16 8 16 8Z" fill="url(#leaf-gradient-inner)" opacity="0.6"/>
          <line x1="16" y1="12" x2="16" y2="26" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M16 18C14 16 12 17 11 19" stroke="rgba(255,255,255,0.2)" stroke-width="1" stroke-linecap="round" fill="none"/>
          <path d="M16 21C18 19 20 20 21 22" stroke="rgba(255,255,255,0.2)" stroke-width="1" stroke-linecap="round" fill="none"/>
          <defs>
            <linearGradient id="leaf-gradient" x1="6" y1="2" x2="26" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#10b981"/>
              <stop offset="100%" stop-color="#06b6d4"/>
            </linearGradient>
            <linearGradient id="leaf-gradient-inner" x1="12" y1="8" x2="20" y2="22" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#34d399"/>
              <stop offset="100%" stop-color="#22d3ee"/>
            </linearGradient>
          </defs>
        </svg>
        EcoLens
      </a>

      <!-- Desktop Navigation Links -->
      <div class="navbar__links" id="nav-links" role="menubar">
        <a href="#" class="nav-link active" role="menuitem" aria-current="page">Home</a>
        <a href="#climate101" class="nav-link" role="menuitem" aria-current="false">Climate 101</a>
        <a href="#calculator" class="nav-link" role="menuitem" aria-current="false">Calculator</a>
        <a href="#results" class="nav-link" role="menuitem" aria-current="false">Results</a>
      </div>

      <!-- Mobile Hamburger Button -->
      <button class="navbar__hamburger" id="nav-hamburger"
              aria-label="Toggle navigation menu"
              aria-expanded="false"
              aria-controls="nav-links">
        <span class="navbar__hamburger-line" aria-hidden="true"></span>
        <span class="navbar__hamburger-line" aria-hidden="true"></span>
        <span class="navbar__hamburger-line" aria-hidden="true"></span>
      </button>
    </div>
  `;

  // Hamburger toggle logic
  const hamburger = nav.querySelector('#nav-hamburger');
  const links = nav.querySelector('#nav-links');

  hamburger.addEventListener('click', () => {
    const isOpen = links.classList.toggle('navbar__links--open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close mobile menu when a link is clicked
  links.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      links.classList.remove('navbar__links--open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Close mobile menu on Escape key
  nav.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && links.classList.contains('navbar__links--open')) {
      links.classList.remove('navbar__links--open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.focus();
    }
  });

  return nav;
}
