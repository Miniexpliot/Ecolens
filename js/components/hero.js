/**
 * @fileoverview EcoLens application module: hero.js
 * Follows strict Google JavaScript Style Guide.
 */
/**
 * EcoLens — Hero / Landing Section Component
 * Animated gradient background, key stats, floating decorations,
 * and dual call-to-action buttons.
 */

/**
 * Render the hero section for the home view.
 * @returns {HTMLElement}
 */
export function renderHero() {
  const section = document.createElement('section');
  section.className = 'hero';
  section.setAttribute('aria-label', 'Welcome to EcoLens');

  section.innerHTML = `
    <!-- Animated gradient background -->
    <div class="hero__bg" aria-hidden="true"></div>

    <!-- Floating decorative SVG elements -->
    <div class="hero__decoration hero__decoration--1" aria-hidden="true">
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="38" stroke="#10b981" stroke-width="1.5" opacity="0.4"/>
        <circle cx="40" cy="40" r="24" stroke="#06b6d4" stroke-width="1" opacity="0.3"/>
      </svg>
    </div>
    <div class="hero__decoration hero__decoration--2" aria-hidden="true">
      <svg width="60" height="80" viewBox="0 0 60 80" fill="none">
        <path d="M30 5C30 5 10 25 10 45C10 56.05 18.95 65 30 65C41.05 65 50 56.05 50 45C50 25 30 5 30 5Z" fill="#10b981" opacity="0.12"/>
      </svg>
    </div>
    <div class="hero__decoration hero__decoration--3" aria-hidden="true">
      <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
        <circle cx="25" cy="25" r="23" stroke="#06b6d4" stroke-width="1" opacity="0.3"/>
        <circle cx="25" cy="25" r="12" fill="#06b6d4" opacity="0.06"/>
      </svg>
    </div>
    <div class="hero__decoration hero__decoration--4" aria-hidden="true">
      <svg width="70" height="90" viewBox="0 0 70 90" fill="none">
        <path d="M35 5C35 5 8 30 8 55C8 69.91 20.09 82 35 82C49.91 82 62 69.91 62 55C62 30 35 5 35 5Z" stroke="#10b981" stroke-width="1" opacity="0.15" fill="none"/>
        <line x1="35" y1="30" x2="35" y2="75" stroke="#10b981" stroke-width="0.8" opacity="0.15"/>
      </svg>
    </div>

    <!-- Main content -->
    <div class="container hero__container">
      <div class="hero__content">
      <div class="hero__badge">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 1C8 1 3 5 3 9C3 11.76 5.24 14 8 14C10.76 14 13 11.76 13 9C13 5 8 1 8 1Z" fill="#10b981"/>
        </svg>
        Open-Source &amp; Privacy-First
      </div>

      <h1 class="hero__title">
        Understand Your <span class="hero__title-highlight">Impact</span> on the Planet
      </h1>

      <p class="hero__subtitle">
        Track, understand, and reduce your carbon footprint with personalized insights
        powered by local AI. No data leaves your device.
      </p>

      <div class="hero__ctas">
        <a href="#climate101" class="btn btn--primary btn--lg">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M9 1.5V16.5M9 1.5L4.5 6M9 1.5L13.5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="rotate(180 9 9)"/>
          </svg>
          Learn About Climate
        </a>
        <a href="#calculator" class="btn btn--secondary btn--lg">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <rect x="2" y="2" width="14" height="14" rx="3" stroke="currentColor" stroke-width="1.5"/>
            <line x1="5" y1="6" x2="13" y2="6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="5" y1="9.5" x2="10" y2="9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="5" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          Calculate My Footprint
        </a>
      </div>

      <!-- Key stats row -->
      <div class="hero__stats">
        <div class="hero__stat animate-on-scroll">
          <div class="hero__stat-value">4.7 tons</div>
          <div class="hero__stat-label">World Average</div>
        </div>
        <div class="hero__stat animate-on-scroll">
          <div class="hero__stat-value">2.5 tons</div>
          <div class="hero__stat-label">Safe Target</div>
        </div>
        <div class="hero__stat animate-on-scroll">
          <div class="hero__stat-value">~50%</div>
          <div class="hero__stat-label">Reduction Needed</div>
        </div>
      </div>
    </div>
    </div>
  `;

  return section;
}
