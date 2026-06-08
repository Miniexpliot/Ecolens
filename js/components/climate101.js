/**
 * EcoLens — Climate 101 Educational Hub Component
 * Comprehensive educational content about carbon footprints,
 * climate science, the Paris Agreement, and actionable tips.
 */

import { NATIONAL_AVERAGES, SAFE_TARGET } from '../constants.js';

/**
 * Render the complete Climate 101 educational section.
 * @returns {HTMLElement}
 */
export function renderClimate101() {
  const section = document.createElement('section');
  section.className = 'climate101 section';
  section.setAttribute('aria-label', 'Climate 101 educational content');

  section.innerHTML = `
    <div class="container">

      <!-- Section Header -->
      <header class="climate101__header animate-on-scroll">
        <div class="section-badge">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 1C7 1 2 5 2 8.5C2 11.26 4.24 13 7 13C9.76 13 12 11.26 12 8.5C12 5 7 1 7 1Z" fill="#10b981"/>
          </svg>
          Climate Education
        </div>
        <h2>Climate 101</h2>
        <p>Everything you need to know about your carbon footprint and why it matters for our planet's future.</p>
      </header>

      <!-- ═══════════════════════════════════════════════════════
           SECTION 1: What is a Carbon Footprint?
           ═══════════════════════════════════════════════════════ -->
      <div class="climate101__section animate-on-scroll">
        <div class="climate101__section-title">
          <div class="climate101__section-icon">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="3" fill="#10b981"/>
              <circle cx="6" cy="8" r="2" fill="#10b981" opacity="0.6"/>
              <circle cx="18" cy="8" r="2" fill="#10b981" opacity="0.6"/>
              <line x1="9" y1="10" x2="12" y2="12" stroke="#10b981" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="15" y1="10" x2="12" y2="12" stroke="#10b981" stroke-width="1.5" stroke-linecap="round"/>
              <text x="4.5" y="6" fill="#10b981" font-size="3.5" font-weight="bold" font-family="sans-serif">O</text>
              <text x="11" y="16" fill="#10b981" font-size="3.5" font-weight="bold" font-family="sans-serif">C</text>
              <text x="16.5" y="6" fill="#10b981" font-size="3.5" font-weight="bold" font-family="sans-serif">O</text>
            </svg>
          </div>
          <h3>What is a Carbon Footprint?</h3>
        </div>

        <div class="glass-card glass-card--static">
          <p class="climate101__definition">
            A <strong>carbon footprint</strong> measures the total greenhouse gas emissions caused directly and
            indirectly by an individual, organization, event, or product, expressed as
            <strong>carbon dioxide equivalent (CO₂e)</strong>.
          </p>
          <p class="climate101__definition">
            <strong>CO₂e</strong> (carbon dioxide equivalent) is a standard unit that expresses the impact of all
            greenhouse gases — including methane (CH₄), nitrous oxide (N₂O), and fluorinated gases — in terms
            of the amount of CO₂ that would create the same warming effect. For example, one ton of methane
            has roughly 80 times the warming potential of one ton of CO₂ over a 20-year period, so it would
            be expressed as 80 tons CO₂e.
          </p>

          <!-- CO₂ Molecule Visual -->
          <div class="climate101__co2-visual" aria-label="Visual representation of a CO2 molecule">
            <svg width="200" height="80" viewBox="0 0 200 80" fill="none">
              <!-- Oxygen atom left -->
              <circle cx="40" cy="40" r="22" fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" stroke-width="1.5"/>
              <text x="40" y="45" text-anchor="middle" fill="#ef4444" font-size="16" font-weight="700" font-family="'Outfit', sans-serif">O</text>
              <!-- Bond left -->
              <line x1="62" y1="37" x2="78" y2="37" stroke="rgba(255,255,255,0.3)" stroke-width="2" stroke-linecap="round"/>
              <line x1="62" y1="43" x2="78" y2="43" stroke="rgba(255,255,255,0.3)" stroke-width="2" stroke-linecap="round"/>
              <!-- Carbon atom center -->
              <circle cx="100" cy="40" r="25" fill="rgba(148, 163, 184, 0.15)" stroke="#94a3b8" stroke-width="1.5"/>
              <text x="100" y="46" text-anchor="middle" fill="#f1f5f9" font-size="18" font-weight="700" font-family="'Outfit', sans-serif">C</text>
              <!-- Bond right -->
              <line x1="122" y1="37" x2="138" y2="37" stroke="rgba(255,255,255,0.3)" stroke-width="2" stroke-linecap="round"/>
              <line x1="122" y1="43" x2="138" y2="43" stroke="rgba(255,255,255,0.3)" stroke-width="2" stroke-linecap="round"/>
              <!-- Oxygen atom right -->
              <circle cx="160" cy="40" r="22" fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" stroke-width="1.5"/>
              <text x="160" y="45" text-anchor="middle" fill="#ef4444" font-size="16" font-weight="700" font-family="'Outfit', sans-serif">O</text>
              <!-- Label -->
              <text x="100" y="78" text-anchor="middle" fill="#64748b" font-size="10" font-family="'Inter', sans-serif">Carbon Dioxide (CO₂)</text>
            </svg>
          </div>

          <p class="climate101__definition">
            Your personal carbon footprint encompasses everything from the fuel burned in your car,
            to the electricity powering your home, the food on your plate, and the products you buy.
            Understanding it is the first step toward meaningful reduction.
          </p>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════
           SECTION 2: Why Does It Matter?
           ═══════════════════════════════════════════════════════ -->
      <div class="climate101__section">
        <div class="climate101__section-title animate-on-scroll">
          <div class="climate101__section-icon" style="background: rgba(239, 68, 68, 0.15);">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2L2 22H22L12 2Z" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
              <line x1="12" y1="9" x2="12" y2="15" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
              <circle cx="12" cy="18" r="1" fill="#ef4444"/>
            </svg>
          </div>
          <h3>Why Does It Matter?</h3>
        </div>

        <div class="climate101__impacts">
          <!-- Temperature Card -->
          <div class="glass-card climate101__impact-card animate-on-scroll">
            <div class="climate101__impact-icon climate101__impact-icon--danger">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="10" y="2" width="4" height="16" rx="2" stroke="#ef4444" stroke-width="1.5" fill="none"/>
                <circle cx="12" cy="20" r="3" fill="#ef4444" opacity="0.3" stroke="#ef4444" stroke-width="1.5"/>
                <rect x="11" y="10" width="2" height="8" rx="1" fill="#ef4444"/>
                <line x1="17" y1="6" x2="20" y2="6" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round"/>
                <line x1="17" y1="10" x2="19" y2="10" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round"/>
                <line x1="17" y1="14" x2="20" y2="14" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>
            <h4 class="climate101__impact-title">Rising Temperatures</h4>
            <p class="climate101__impact-text">
              Global temperatures have risen approximately <strong>1.1°C</strong> since pre-industrial times.
              Every fraction of a degree intensifies extreme weather events, from hurricanes and droughts
              to wildfires and flooding. The last decade (2011–2020) was the warmest on record, and
              2023 was confirmed as the hottest single year ever measured. Without rapid emissions cuts,
              we are on track for 2.5–4.5°C of warming by 2100.
            </p>
          </div>

          <!-- Ecosystems Card -->
          <div class="glass-card climate101__impact-card animate-on-scroll">
            <div class="climate101__impact-icon" style="background: rgba(59, 130, 246, 0.15);">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M2 12C2 12 5 8 8 10C11 12 10 16 13 16C16 16 15 12 18 10C21 8 22 12 22 12" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round" fill="none"/>
                <path d="M2 17C2 17 5 13 8 15C11 17 10 21 13 21C16 21 15 17 18 15C21 13 22 17 22 17" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.5"/>
                <path d="M2 7C2 7 5 3 8 5C11 7 10 11 13 11C16 11 15 7 18 5C21 3 22 7 22 7" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.5"/>
              </svg>
            </div>
            <h4 class="climate101__impact-title">Ecosystem Collapse</h4>
            <p class="climate101__impact-text">
              Rising CO₂ levels cause ocean acidification — oceans are now <strong>30% more acidic</strong>
              than before industrialization — threatening coral reefs that support 25% of all marine species.
              Arctic sea ice is declining at approximately <strong>13% per decade</strong>. Scientists estimate
              that 1 million species are currently at risk of extinction, with climate change as a primary driver.
              Each degree of warming pushes ecosystems closer to irreversible tipping points.
            </p>
          </div>

          <!-- Human Impact Card -->
          <div class="glass-card climate101__impact-card animate-on-scroll">
            <div class="climate101__impact-icon climate101__impact-icon--amber">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="7" r="4" stroke="#f59e0b" stroke-width="1.5" fill="none"/>
                <path d="M5 21C5 16.58 8.13 13 12 13C15.87 13 19 16.58 19 21" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round" fill="none"/>
                <circle cx="5" cy="10" r="2.5" stroke="#f59e0b" stroke-width="1" fill="none" opacity="0.5"/>
                <circle cx="19" cy="10" r="2.5" stroke="#f59e0b" stroke-width="1" fill="none" opacity="0.5"/>
              </svg>
            </div>
            <h4 class="climate101__impact-title">Human Impact</h4>
            <p class="climate101__impact-text">
              Climate change amplifies food insecurity, water scarcity, and forced displacement. The World
              Health Organization estimates <strong>250,000 additional deaths per year</strong> between
              2030–2050 from malnutrition, malaria, diarrhea, and heat stress alone. Over 200 million people
              could be displaced by 2050 due to sea-level rise and extreme weather. The economic cost of
              inaction is projected at $23 trillion annually by 2050.
            </p>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════
           SECTION 3: The Safe Target
           ═══════════════════════════════════════════════════════ -->
      <div class="climate101__section">
        <div class="climate101__section-title animate-on-scroll">
          <div class="climate101__section-icon" style="background: rgba(6, 182, 212, 0.15);">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="#06b6d4" stroke-width="1.5" fill="none"/>
              <circle cx="12" cy="12" r="6" stroke="#06b6d4" stroke-width="1.5" fill="none" opacity="0.6"/>
              <circle cx="12" cy="12" r="2.5" fill="#06b6d4"/>
            </svg>
          </div>
          <h3>The Safe Target</h3>
        </div>

        <div class="glass-card glass-card--static animate-on-scroll" style="margin-bottom: var(--space-xl);">
          <p class="climate101__definition">
            The <strong>2015 Paris Agreement</strong> is a landmark international treaty adopted by 196 parties.
            It aims to limit global warming to well below 2°C — and ideally to <strong>1.5°C</strong> — above
            pre-industrial levels. To achieve the 1.5°C target, global greenhouse gas emissions must fall
            approximately <strong>45% by 2030</strong> (from 2010 levels) and reach <strong>net-zero by 2050</strong>.
          </p>
          <p class="climate101__definition">
            Translating this global goal to the individual level, each person on Earth should aim for a
            sustainable personal footprint of approximately <strong>2 to 2.5 tons CO₂e per year by 2030</strong>.
            This is the target EcoLens uses — the green line on every chart — to help you gauge where you
            stand and what changes matter most.
          </p>
        </div>

        <h4 class="animate-on-scroll" style="margin-bottom: var(--space-lg); color: var(--text-secondary);">
          National Averages vs. Safe Target (tons CO₂e per person per year)
        </h4>

        <div class="climate101__country-grid" id="country-grid" role="list" aria-label="Carbon emissions by country">
          ${buildCountryCards()}
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════
           SECTION 4: What Can You Do?
           ═══════════════════════════════════════════════════════ -->
      <div class="climate101__section">
        <div class="climate101__section-title animate-on-scroll">
          <div class="climate101__section-icon" style="background: rgba(245, 158, 11, 0.15);">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </svg>
          </div>
          <h3>What Can You Do?</h3>
        </div>

        <div class="glass-card glass-card--static animate-on-scroll" style="margin-bottom: var(--space-xl);">
          <p class="climate101__definition">
            Individual action matters. While systemic change is essential — clean energy policy, industrial
            regulation, and corporate accountability — personal choices in transportation, energy, diet,
            and consumption collectively drive market demand and cultural norms. Every ton of CO₂ you avoid
            is a ton that doesn't heat the planet. Research shows that high-impact individual actions can
            reduce emissions by up to <strong>70%</strong>.
          </p>
        </div>

        <div class="climate101__actions-grid">
          <!-- Drive Less -->
          <div class="glass-card climate101__action-hint animate-on-scroll">
            <div class="climate101__action-hint-icon climate101__action-hint-icon--green">
              <svg viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <circle cx="7" cy="21" r="3" stroke="#10b981" stroke-width="1.5" fill="none"/>
                <circle cx="21" cy="21" r="3" stroke="#10b981" stroke-width="1.5" fill="none"/>
                <path d="M4 18L6 12H16L20 18" stroke="#10b981" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                <line x1="4" y1="18" x2="24" y2="18" stroke="#10b981" stroke-width="1.5" stroke-linecap="round"/>
                <line x1="13" y1="8" x2="11" y2="3" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round"/>
                <line x1="13" y1="8" x2="15" y2="3" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round"/>
                <line x1="13" y1="8" x2="13" y2="2" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>
            <h4>Drive Less</h4>
            <p>Walk, bike, carpool, or take public transit. A typical car emits about 4.6 metric tons of CO₂ per year. Switching to an EV or reducing driving days cuts this dramatically.</p>
          </div>

          <!-- Save Energy -->
          <div class="glass-card climate101__action-hint animate-on-scroll">
            <div class="climate101__action-hint-icon climate101__action-hint-icon--blue">
              <svg viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <path d="M10 2L7 14H13L10 26L21 10H14L18 2H10Z" fill="#3b82f6" opacity="0.15" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h4>Save Energy</h4>
            <p>Switch to LED bulbs, unplug idle devices, and insulate your home. Choosing a renewable energy provider can cut your home emissions by up to 100%. Every kilowatt-hour counts.</p>
          </div>

          <!-- Eat Green -->
          <div class="glass-card climate101__action-hint animate-on-scroll">
            <div class="climate101__action-hint-icon climate101__action-hint-icon--amber">
              <svg viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <path d="M14 3C14 3 6 8 6 16C6 20.42 9.58 24 14 24C18.42 24 22 20.42 22 16C22 8 14 3 14 3Z" fill="#f59e0b" opacity="0.12" stroke="#f59e0b" stroke-width="1.5"/>
                <line x1="14" y1="10" x2="14" y2="22" stroke="#f59e0b" stroke-width="1" stroke-linecap="round"/>
                <path d="M14 14C12 12.5 10 13 9 14.5" stroke="#f59e0b" stroke-width="1" stroke-linecap="round" fill="none"/>
                <path d="M14 17C16 15.5 18 16 19 17.5" stroke="#f59e0b" stroke-width="1" stroke-linecap="round" fill="none"/>
              </svg>
            </div>
            <h4>Eat Green</h4>
            <p>Reducing meat — especially beef and lamb — is one of the highest-impact changes you can make. A plant-rich diet can save up to 0.8 tons CO₂e per year. Composting food waste also helps significantly.</p>
          </div>

          <!-- Buy Less -->
          <div class="glass-card climate101__action-hint animate-on-scroll">
            <div class="climate101__action-hint-icon climate101__action-hint-icon--red">
              <svg viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <path d="M6 8H22L20 22H8L6 8Z" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                <line x1="2" y1="8" x2="26" y2="8" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round"/>
                <line x1="11" y1="4" x2="9" y2="8" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round"/>
                <line x1="17" y1="4" x2="19" y2="8" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round"/>
                <line x1="12" y1="12" x2="12" y2="18" stroke="#ef4444" stroke-width="1" stroke-linecap="round" opacity="0.6"/>
                <line x1="16" y1="12" x2="16" y2="18" stroke="#ef4444" stroke-width="1" stroke-linecap="round" opacity="0.6"/>
              </svg>
            </div>
            <h4>Buy Less</h4>
            <p>Fast fashion is the third-largest polluting industry. Buy secondhand, choose quality over quantity, and repair what you have. Extending a garment's life by 9 months cuts its carbon footprint by 20–30%.</p>
          </div>
        </div>

        <!-- CTA to calculator -->
        <div style="text-align: center; margin-top: var(--space-2xl);" class="animate-on-scroll">
          <a href="#calculator" class="btn btn--primary btn--lg">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <rect x="2" y="2" width="14" height="14" rx="3" stroke="currentColor" stroke-width="1.5"/>
              <line x1="9" y1="6" x2="9" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="6" y1="9" x2="12" y2="9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            Calculate Your Footprint
          </a>
        </div>
      </div>

    </div>
  `;

  return section;
}

/* ── Helper: Build Country Comparison Cards ──────────────── */

function buildCountryCards() {
  const countries = [
    { name: 'United States', code: 'US', value: 16 },
    { name: 'Canada', code: 'CA', value: 15.5 },
    { name: 'Australia', code: 'AU', value: 15 },
    { name: 'Germany', code: 'DE', value: 8 },
    { name: 'Japan', code: 'JP', value: 9 },
    { name: 'China', code: 'CN', value: 7.7 },
    { name: 'United Kingdom', code: 'UK', value: 5.5 },
    { name: 'France', code: 'FR', value: 5 },
    { name: 'India', code: 'IN', value: 1.9 },
    { name: 'World Avg', code: 'WORLD', value: 4.7 }
  ];

  const maxValue = 18; // for proportional bar width

  return countries.map(c => {
    const barPercent = Math.min((c.value / maxValue) * 100, 100);
    const targetPercent = (SAFE_TARGET / maxValue) * 100;
    const isSafe = c.value <= SAFE_TARGET;
    const barColor = isSafe
      ? '#10b981'
      : c.value <= 6 ? '#06b6d4' : c.value <= 10 ? '#f59e0b' : '#ef4444';

    return `
      <div class="climate101__country-card animate-on-scroll" role="listitem" aria-label="${c.name}: ${c.value} tons CO₂e per year">
        <div class="climate101__country-name">${c.name}</div>
        <div class="climate101__country-value" style="color: ${barColor}">${c.value}t</div>
        <div class="climate101__country-bar-track">
          <div class="climate101__country-bar-fill" style="width: ${barPercent}%; background: ${barColor};"></div>
          <div class="climate101__country-bar-target" style="left: ${targetPercent}%;" title="Safe target: ${SAFE_TARGET}t" aria-label="Safe target: ${SAFE_TARGET} tons"></div>
        </div>
      </div>
    `;
  }).join('');
}
