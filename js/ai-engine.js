/**
 * @fileoverview Local AI Report Engine
 *
 * Generates comprehensive, personalized natural-language impact reports using
 * pure JavaScript — **no external API calls**.  All analysis runs client-side
 * so no user data ever leaves the browser.
 *
 * @module ai-engine
 */

import { SAFE_TARGET, NATIONAL_AVERAGES, CATEGORY_LABELS } from './constants.js';
import { calculatePercentages } from './calculations.js';

// ---------------------------------------------------------------------------
// Report generation
// ---------------------------------------------------------------------------

/**
 * Generates a comprehensive, personalized natural language impact report.
 *
 * @param {Object} emissions – Emissions breakdown { travel, home, diet, shopping, total }
 * @param {Object} inputs    – User's validated input data
 * @returns {Object} Report sections:
 *   summary, insights[], savingsText, rating, ratingEmoji, ratingClass,
 *   vsNationalText, vsTargetText, potentialSavings, projectedWithChanges,
 *   primarySource, secondarySource
 */
export function generateReport(emissions, inputs) {
  const percentages = calculatePercentages(emissions);
  const country = inputs.country || 'United States';
  const nationalAvg = NATIONAL_AVERAGES[country] || NATIONAL_AVERAGES['World Average'];
  const safeTarget = SAFE_TARGET;

  // ── Sort categories by descending impact ──────────────────────────────
  const categories = [
    { key: 'travel', value: emissions.travel, label: CATEGORY_LABELS.travel },
    { key: 'home', value: emissions.home, label: CATEGORY_LABELS.home },
    { key: 'diet', value: emissions.diet, label: CATEGORY_LABELS.diet },
    { key: 'shopping', value: emissions.shopping, label: CATEGORY_LABELS.shopping }
  ].sort((a, b) => b.value - a.value);

  const primary = categories[0];
  const secondary = categories[1];

  // ── Contextual rating ─────────────────────────────────────────────────
  let rating, ratingEmoji, ratingClass;
  if (emissions.total <= safeTarget) {
    rating = 'Excellent';
    ratingEmoji = '🌟';
    ratingClass = 'rating-excellent';
  } else if (emissions.total <= safeTarget * 2) {
    rating = 'Good';
    ratingEmoji = '🌿';
    ratingClass = 'rating-good';
  } else if (emissions.total <= nationalAvg) {
    rating = 'Average';
    ratingEmoji = '🌍';
    ratingClass = 'rating-average';
  } else {
    rating = 'Needs Improvement';
    ratingEmoji = '⚠️';
    ratingClass = 'rating-needs-work';
  }

  // ── National & safe-target comparisons ────────────────────────────────
  const vsNational = emissions.total - nationalAvg;
  const vsNationalText = vsNational > 0
    ? `${Math.abs(vsNational).toFixed(1)} tons above`
    : `${Math.abs(vsNational).toFixed(1)} tons below`;

  const vsTarget = emissions.total - safeTarget;
  const vsTargetText = vsTarget > 0
    ? `${vsTarget.toFixed(1)} tons above`
    : 'You are within the safe zone!';

  // ── Summary paragraph ─────────────────────────────────────────────────
  const summary =
    `Based on your inputs, your estimated annual carbon footprint is ` +
    `<strong>${emissions.total.toFixed(1)} tons CO₂e</strong>. ` +
    `Your primary emission source is <strong>${primary.label}</strong>, accounting for ` +
    `<strong>${percentages[primary.key]}%</strong> of your total footprint` +
    (secondary.value > 0
      ? `, followed by <strong>${secondary.label}</strong> at <strong>${percentages[secondary.key]}%</strong>`
      : '') +
    `. Compared to the ${country} average of ${nationalAvg} tons, you are ` +
    `<strong>${vsNationalText}</strong>. ` +
    `The Paris Agreement safe target is ${safeTarget} tons per person per year — ` +
    `you are currently ${vsTargetText}.`;

  // ── Personalised insights ─────────────────────────────────────────────
  const insights = [];

  // Travel insights
  if (inputs.travel.carType === 'gas' && inputs.travel.commuteDistance > 10) {
    insights.push(
      `Your ${inputs.travel.commuteDistance}-mile daily commute in a gasoline vehicle is a ` +
      `significant emission source. Switching to a hybrid could save approximately ` +
      `${(emissions.travel * 0.45).toFixed(1)} tons annually.`
    );
  } else if (inputs.travel.carType === 'ev') {
    insights.push(
      'Great choice driving an EV! Your transportation emissions are significantly ' +
      'lower than the national average.'
    );
  }
  if (inputs.travel.transitFrequency >= 3) {
    insights.push(
      `Your frequent use of public transit (${inputs.travel.transitFrequency} days/week) ` +
      'is already helping reduce your transportation footprint.'
    );
  }

  // Home insights
  if (inputs.home.renewableEnergy === 'none') {
    insights.push(
      'Switching to a renewable energy provider could reduce your home energy emissions ' +
      `by up to 90%, saving approximately ${(emissions.home * 0.9).toFixed(1)} tons per year.`
    );
  } else if (inputs.home.renewableEnergy === 'full') {
    insights.push(
      'Powering your home with 100% renewable energy is one of the most impactful ' +
      'choices you can make. Well done!'
    );
  }
  if (inputs.home.heatingCooling === 'heavy') {
    insights.push(
      'Heavy heating/cooling usage is a major energy consumer. Even reducing by 2°F ' +
      'can save 6-8% on energy bills and emissions.'
    );
  }

  // Diet insights
  if (inputs.diet.meatConsumption === 'daily') {
    insights.push(
      `Daily meat consumption contributes approximately ${emissions.diet.toFixed(1)} tons ` +
      'to your footprint. Reducing to 1-2 times per week could save over 1 ton of CO₂e annually.'
    );
  } else if (inputs.diet.meatConsumption === 'vegan') {
    insights.push(
      'Your plant-based diet is one of the lowest-impact food choices possible. ' +
      'This alone saves over 2 tons compared to the average diet.'
    );
  }
  if (inputs.diet.composting === 'no') {
    insights.push(
      'Starting composting could divert organic waste from landfills, preventing ' +
      'methane emissions and saving ~0.1 tons CO₂e per year.'
    );
  }

  // Shopping insights
  if (inputs.shopping.fastFashion === 'high') {
    insights.push(
      'Frequent fast fashion purchases contribute significantly to emissions. ' +
      'The fashion industry accounts for ~10% of global carbon emissions.'
    );
  }

  // ── Potential savings estimate ─────────────────────────────────────────
  const potentialSavings = _estimatePotentialSavings(emissions, inputs);
  const projectedWithChanges = Math.max(0, emissions.total - potentialSavings);

  const savingsText =
    potentialSavings > 0
      ? `If you implement the suggested changes below, you could achieve an estimated ` +
        `<strong>Annual Footprint Savings of ${potentialSavings.toFixed(1)} tons</strong>, ` +
        `bringing your projected footprint to <strong>${projectedWithChanges.toFixed(1)} tons</strong>` +
        (projectedWithChanges <= safeTarget
          ? ' — within the safe target! 🎉'
          : ` — ${(projectedWithChanges - safeTarget).toFixed(1)} tons from the safe target.`)
      : 'Your footprint is already very low. Focus on maintaining your current habits!';

  return {
    summary,
    insights,
    savingsText,
    rating,
    ratingEmoji,
    ratingClass,
    vsNationalText,
    vsTargetText,
    potentialSavings,
    projectedWithChanges,
    primarySource: primary,
    secondarySource: secondary
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Estimate total potential savings if user adopts top recommendations.
 * @private
 * @param {Object} emissions
 * @param {Object} inputs
 * @returns {number} Estimated annual savings in tons CO₂e
 */
function _estimatePotentialSavings(emissions, inputs) {
  let savings = 0;

  // Travel savings
  if (inputs.travel.carType === 'gas') savings += emissions.travel * 0.45; // switch to hybrid
  if (inputs.travel.transitFrequency < 2) savings += emissions.travel * 0.15; // more transit

  // Home savings
  if (inputs.home.renewableEnergy === 'none') savings += emissions.home * 0.5;
  if (inputs.home.heatingCooling === 'heavy') savings += 0.3;
  if (inputs.home.unplugAppliances === 'neverUnplug') savings += 0.3;

  // Diet savings
  if (inputs.diet.meatConsumption === 'daily') savings += 1.0;
  else if (inputs.diet.meatConsumption === 'frequently') savings += 0.5;
  if (inputs.diet.recycling === 'never') savings += 0.3;
  if (inputs.diet.composting === 'no') savings += 0.1;

  // Shopping savings
  if (inputs.shopping.fastFashion === 'high') savings += 0.5;
  else if (inputs.shopping.fastFashion === 'moderate') savings += 0.2;

  return Math.round(savings * 100) / 100;
}

// ---------------------------------------------------------------------------
// Welcome message
// ---------------------------------------------------------------------------

/**
 * Generate a greeting message for the AI assistant panel.
 * @returns {string} Welcome message HTML
 */
export function generateWelcomeMessage() {
  return (
    `<p>👋 Welcome! I'm your <strong>EcoLens AI Assistant</strong>, powered entirely ` +
    `by local JavaScript — no data leaves your device.</p>` +
    `<p>Complete the carbon calculator to receive your personalized impact report ` +
    `with actionable insights tailored to your lifestyle.</p>` +
    `<p>I'll analyze your daily habits across <strong>transportation</strong>, ` +
    `<strong>home energy</strong>, <strong>diet</strong>, and <strong>shopping</strong> ` +
    `to calculate your annual carbon footprint and compare it against global targets.</p>`
  );
}

// ---------------------------------------------------------------------------
// Chatbot Logic
// ---------------------------------------------------------------------------

/**
 * Deterministic conversational tree for the Chat Widget.
 * Analyzes the user's query and returns a contextual response based on their data.
 * @param {string} query - User's chat message
 * @param {Object} state - Current application state (emissions, inputs)
 * @returns {string} Response HTML/Text
 */
export function chatRespond(query, state) {
  const q = query.toLowerCase();
  
  if (!state.reportGenerated) {
    return "I'd love to help, but you need to complete the calculator first so I have your data!";
  }
  
  const e = state.emissions;
  const i = state.inputs;

  // Matching logic
  if (q.includes('meat') || q.includes('diet') || q.includes('food')) {
    if (i.diet.meatConsumption === 'daily' || i.diet.meatConsumption === 'frequently') {
      return `Your diet contributes ${e.diet.toFixed(1)} tons to your footprint. Reducing meat to 1-2 times a week could save over 1 ton of CO₂e annually!`;
    }
    return `Your diet footprint is ${e.diet.toFixed(1)} tons. Because you already eat a low-meat or plant-based diet, you're doing great! Try focusing on reducing food waste next.`;
  }

  if (q.includes('car') || q.includes('drive') || q.includes('travel') || q.includes('commute')) {
    if (i.travel.carType === 'gas') {
      return `Your daily ${i.travel.commuteDistance} mile commute in a gas car adds up to ${e.travel.toFixed(1)} tons. Switching to an EV or hybrid is your #1 way to drop emissions.`;
    }
    return `Your travel footprint is ${e.travel.toFixed(1)} tons. You're already making smart choices! Try adding an extra day of walking, biking, or transit to lower it even more.`;
  }

  if (q.includes('home') || q.includes('energy') || q.includes('power') || q.includes('electricity')) {
    if (i.home.renewableEnergy === 'none') {
      return `Home energy accounts for ${e.home.toFixed(1)} tons of your footprint. Switching to a renewable energy provider is the easiest way to cut this down significantly without changing your habits.`;
    }
    return `Since you already use renewable energy, your home emissions are relatively low (${e.home.toFixed(1)} tons). Focus on unplugging unused appliances to save a bit more.`;
  }

  if (q.includes('reduce') || q.includes('improve') || q.includes('help') || q.includes('advice')) {
    const highest = Object.keys(e).filter(k => k !== 'total').reduce((a, b) => e[a] > e[b] ? a : b);
    return `Your highest emission category is **${highest}** (${e[highest].toFixed(1)} tons). Check your Action Plan for specific ways to target this area!`;
  }

  if (q.includes('hello') || q.includes('hi ') || q.includes('hey')) {
    return `Hi there! I'm analyzing your ${e.total.toFixed(1)} ton footprint. Ask me about your diet, travel, or home energy!`;
  }

  // Fallback
  return `That's an interesting question! Based on your footprint of ${e.total.toFixed(1)} tons, your biggest opportunity for improvement is in the ${Object.keys(e).filter(k => k !== 'total').reduce((a, b) => e[a] > e[b] ? a : b)} category. Let me know if you want to dive into that!`;
}
