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
 * Find the emission category with the highest value, excluding 'total'.
 * Returns 'travel' as a safe fallback if no valid categories exist.
 * @param {Object} emissions - Emissions object with category keys and numeric values.
 * @returns {string} The key of the highest-emitting category.
 */
function _findHighestCategory(emissions) {
  const categories = Object.keys(emissions).filter(k => k !== 'total');
  if (categories.length === 0) return 'travel';
  return categories.reduce((a, b) => emissions[a] > emissions[b] ? a : b, categories[0]);
}

/**
 * Simulated HTTP fetch to demonstrate robust error handling for timeouts and missing HTML tags.
 */
async function simulateHttpFetch(query) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (query.includes('simulate timeout')) {
        reject(new Error('Timeout'));
      } else if (query.includes('simulate html error')) {
        reject(new Error('Missing HTML tags'));
      } else {
        resolve();
      }
    }, 300);
  });
}

/**
 * Deterministic conversational tree for the Chat Widget.
 * Analyzes the user's query and returns a contextual response based on their data.
 * @param {string} query - User's chat message
 * @param {Object} state - Current application state (emissions, inputs)
 * @returns {Promise<string>} Response HTML/Text
 */
export async function chatRespond(query, state) {
  const q = query.toLowerCase();
  
  // General Knowledge (Always available)
  if (q.includes('what is a carbon footprint') || q.includes('carbon footprint')) {
    return "A carbon footprint is the total amount of greenhouse gases (including carbon dioxide and methane) that are generated by our actions. It's usually measured in tons of CO₂ equivalent (CO₂e) per year.";
  }
  if (q.includes('climate change important') || q.includes('why care')) {
    return "Climate change affects everything from extreme weather patterns to global food supplies. Reducing your personal footprint is a crucial step towards building a sustainable future!";
  }
  
  if (!state.reportGenerated) {
    return "I'd love to give you personalized advice, but you need to complete the calculator first so I can analyze your data!";
  }
  
  // Simulate HTTP fetch with robust error handling for HTTP timeouts and missing HTML tags
  try {
    await simulateHttpFetch(q);
  } catch (error) {
    if (error.message === 'Timeout') {
      return "⚠️ Network Error: The HTTP request timed out while connecting to the AI service. Please try again.";
    }
    if (error.message === 'Missing HTML tags') {
      return "⚠️ Parsing Error: The response was missing expected HTML tags. The layout could not be parsed.";
    }
    return `⚠️ Error: ${error.message}`;
  }

  const e = state.emissions;
  const i = state.inputs;
  const p = calculatePercentages(e);
  const nationalAvg = NATIONAL_AVERAGES[i.country || 'United States'] || 15;

  // Question 1: How can I reduce my [highest] emissions?
  if (q.includes('reduce') && (q.includes('travel') || q.includes('home') || q.includes('diet') || q.includes('shopping'))) {
    if (q.includes('travel')) {
      return `Your travel footprint is **${e.travel.toFixed(1)}t** (${p.travel}% of your total). Since you drive a ${i.travel.carType} car ${i.travel.commuteDistance} miles a day, switching to an EV or carpooling 3 days a week could cut this by nearly half!`;
    }
    if (q.includes('home')) {
      return `Your home energy footprint is **${e.home.toFixed(1)}t**. By switching to a 100% renewable energy plan and adjusting your thermostat by just 2 degrees, you could shave off up to 1.5 tons annually.`;
    }
    if (q.includes('diet')) {
      return `Your diet footprint is **${e.diet.toFixed(1)}t**. As someone who eats meat ${i.diet.meatConsumption}, simply swapping beef for chicken or plant-based meals twice a week makes a massive difference!`;
    }
    if (q.includes('shopping')) {
      return `Shopping contributes **${e.shopping.toFixed(1)}t**. Focusing on buying second-hand or reducing fast-fashion purchases can easily lower this by 0.5 tons.`;
    }
  }

  // Question 2: Am I doing better than the national average?
  if (q.includes('national average') || q.includes('better than')) {
    if (e.total < nationalAvg) {
      return `**Yes!** Your footprint is **${e.total.toFixed(1)}t**, which is **${(nationalAvg - e.total).toFixed(1)}t lower** than the ${i.country || 'US'} average of ${nationalAvg}t. Great job! 🎉`;
    } else {
      return `Not quite yet. Your footprint is **${e.total.toFixed(1)}t**, which is **${(e.total - nationalAvg).toFixed(1)}t higher** than the ${i.country || 'US'} average of ${nationalAvg}t. Check the Action Plan below to see how you can beat it!`;
    }
  }

  // Question 3: What is the easiest way to save 1 ton of CO2?
  if (q.includes('1 ton') || q.includes('easiest way')) {
    let bestAction = "Switching your home energy to a 100% renewable plan";
    if (e.travel > 3 && i.travel.carType === 'gas') {
      bestAction = "Replacing your gas car with a hybrid or EV";
    } else if (e.diet > 2 && i.diet.meatConsumption === 'daily') {
      bestAction = "Eating fully plant-based just 3 days a week";
    }
    return `The single most impactful thing you could do based on your profile is: **${bestAction}**. That alone would save you over 1 ton of CO₂e per year!`;
  }

  // Fallback responses
  if (q.includes('meat') || q.includes('diet') || q.includes('food')) {
    if (i.diet.meatConsumption === 'daily' || i.diet.meatConsumption === 'frequently') {
      return `Your diet contributes ${e.diet.toFixed(1)} tons to your footprint, which is **${p.diet}%** of your total emissions! Reducing meat to 1-2 times a week could save over 1 ton of CO₂e annually.`;
    }
    return `Your diet footprint is relatively low at ${e.diet.toFixed(1)} tons. Keep focusing on plant-based and locally sourced foods!`;
  }

  if (q.includes('car') || q.includes('drive') || q.includes('travel') || q.includes('commute')) {
    if (i.travel.carType === 'gas') {
      return `Your daily ${i.travel.commuteDistance}-mile commute in a gas car adds up to ${e.travel.toFixed(1)} tons (**${p.travel}%** of your total). Switching to an EV or hybrid is your #1 way to drop emissions.`;
    }
    return `Your travel footprint is ${e.travel.toFixed(1)} tons (${p.travel}% of total). You're already making smart choices! Try adding an extra day of walking, biking, or transit to lower it even more.`;
  }

  if (q.includes('home') || q.includes('energy') || q.includes('power') || q.includes('electricity')) {
    if (i.home.renewableEnergy === 'none') {
      return `Home energy accounts for ${e.home.toFixed(1)} tons (**${p.home}%** of your footprint). Switching to a renewable energy provider is the easiest way to cut this down significantly without changing your habits.`;
    }
    return `Since you already use renewable energy, your home emissions are relatively low (${e.home.toFixed(1)} tons, ${p.home}% of total). Focus on unplugging unused appliances to save a bit more.`;
  }

  if (q.includes('reduce') || q.includes('improve') || q.includes('help') || q.includes('advice')) {
    const highest = _findHighestCategory(e);
    return `Your highest emission category is **${highest}** (${e[highest].toFixed(1)} tons, which is **${p[highest]}%** of your total). Check your Action Plan for specific ways to target this area!`;
  }

  if (q.includes('hello') || q.includes('hi ') || q.includes('hey')) {
    return `Hi there! I'm analyzing your ${e.total.toFixed(1)} ton footprint. Ask me about your diet, travel, or home energy! You can also type 'simulate timeout' or 'simulate html error' to test robust error handling.`;
  }

  // Fallback
  const fallbackHighest = _findHighestCategory(e);
  return `That's an interesting question! Based on your footprint of ${e.total.toFixed(1)} tons, your biggest opportunity for improvement is in the **${fallbackHighest}** category. Let me know if you want to dive into that!`;
}

