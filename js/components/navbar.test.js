/**
 * @fileoverview EcoLens application module: navbar.test.js
 * Follows strict Google JavaScript Style Guide.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { renderNavbar } from './navbar.js';

describe('Navbar Component', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders navbar correctly', () => {
    const nav = renderNavbar();
    document.body.appendChild(nav);

    expect(nav.querySelector('.navbar__logo')).not.toBeNull();
    expect(nav.querySelector('#nav-links')).not.toBeNull();
    expect(nav.querySelector('#nav-hamburger')).not.toBeNull();
  });

  it('toggles mobile menu on button click', () => {
    const nav = renderNavbar();
    document.body.appendChild(nav);

    const toggleBtn = nav.querySelector('#nav-hamburger');
    const menu = nav.querySelector('#nav-links');

    expect(menu.classList.contains('navbar__links--open')).toBe(false);

    // Open
    toggleBtn.click();
    expect(menu.classList.contains('navbar__links--open')).toBe(true);

    // Close
    toggleBtn.click();
    expect(menu.classList.contains('navbar__links--open')).toBe(false);
  });
});
