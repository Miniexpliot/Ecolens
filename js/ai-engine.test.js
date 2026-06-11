/**
 * @fileoverview EcoLens application module: ai-engine.test.js
 * Follows strict Google JavaScript Style Guide.
 */
import { describe, test, expect } from 'vitest';
import {
  generateReport,
  generateWelcomeMessage,
  chatRespond,
} from './ai-engine.js';

describe('Local AI Report Engine', () => {
  test('generateWelcomeMessage returns valid welcome HTML string', () => {
    const welcome = generateWelcomeMessage();
    expect(welcome).toContain('EcoLens AI Assistant');
    expect(welcome).toContain('transportation');
  });

  describe('generateReport', () => {
    test('produces Excellent rating for very low footprint', () => {
      const emissions = {
        travel: 0.1,
        home: 0.1,
        diet: 0.1,
        shopping: 0.1,
        total: 0.4,
      };
      const inputs = {
        country: 'United States',
        travel: {
          carType: 'ev',
          commuteDistance: 10,
          commuteFrequency: 3,
          transitFrequency: 2,
          bikeWalkFrequency: 2,
        },
        home: {
          renewableEnergy: 'full',
          heatingCooling: 'none',
          unplugAppliances: 'alwaysUnplug',
        },
        diet: {
          meatConsumption: 'vegan',
          recycling: 'always',
          composting: 'yes',
        },
        shopping: { fastFashion: 'secondhand' },
      };
      const report = generateReport(emissions, inputs);

      expect(report.rating).toBe('Excellent');
      expect(report.ratingEmoji).toBe('🌟');
      expect(report.insights.length).toBeGreaterThan(0);
      expect(report.primarySource.key).toBe('travel');
    });

    test('produces Needs Improvement rating for very high footprint', () => {
      const emissions = {
        travel: 10,
        home: 6,
        diet: 4,
        shopping: 2,
        total: 22,
      };
      const inputs = {
        country: 'United States',
        travel: { carType: 'gas', commuteDistance: 35 },
        home: { renewableEnergy: 'none', heatingCooling: 'heavy' },
        diet: { meatConsumption: 'daily', composting: 'no' },
        shopping: { fastFashion: 'high' },
      };
      const report = generateReport(emissions, inputs);

      expect(report.rating).toBe('Needs Improvement');
      expect(report.ratingEmoji).toBe('⚠️');
      expect(report.primarySource.key).toBe('travel');

      // Verifies personalized insights are triggered
      const insightsText = report.insights.join(' ');
      expect(insightsText).toContain('gasoline vehicle');
      expect(insightsText).toContain('renewable energy provider');
      expect(insightsText).toContain('Heavy heating/cooling');
      expect(insightsText).toContain('Daily meat');
      expect(insightsText).toContain('composting');
      expect(insightsText).toContain('fashion industry');
    });
  });

  describe('chatRespond conversational logic', () => {
    test('answers general knowledge without report', async () => {
      const state = { reportGenerated: false };
      const res = await chatRespond('what is a carbon footprint', state);
      expect(res).toContain('total amount of greenhouse gases');
    });

    test('refuses personalized questions if report is not yet generated', async () => {
      const state = { reportGenerated: false };
      const res = await chatRespond(
        'How can I reduce my travel emissions?',
        state
      );
      expect(res).toContain('complete the calculator first');
    });

    test('responds correctly to category reduce queries', async () => {
      const state = {
        reportGenerated: true,
        emissions: {
          travel: 4.5,
          home: 2.0,
          diet: 1.5,
          shopping: 0.5,
          total: 8.5,
        },
        inputs: {
          country: 'United States',
          travel: { carType: 'gas', commuteDistance: 20 },
          diet: { meatConsumption: 'daily' },
        },
      };

      const resTravel = await chatRespond('reduce travel', state);
      expect(resTravel).toContain('travel footprint');
      expect(resTravel).toContain('gas car');

      const resHome = await chatRespond('reduce home', state);
      expect(resHome).toContain('home energy footprint');
      expect(resHome).toContain('renewable energy plan');
    });

    test('evaluates relative status against national average', async () => {
      const state = {
        reportGenerated: true,
        emissions: {
          travel: 1.0,
          home: 1.0,
          diet: 1.0,
          shopping: 1.0,
          total: 4.0,
        },
        inputs: { country: 'United States' },
      };

      const res = await chatRespond('better than national average', state);
      expect(res).toContain('Yes!');
      expect(res).toContain('lower');
      expect(res).toContain('United States average');
    });

    test('suggests easiest way to save 1 ton', async () => {
      const state = {
        reportGenerated: true,
        emissions: {
          travel: 5.0,
          home: 1.0,
          diet: 1.0,
          shopping: 1.0,
          total: 8.0,
        },
        inputs: { country: 'United States', travel: { carType: 'gas' } },
      };

      const res = await chatRespond('easiest way to save 1 ton', state);
      expect(res).toContain('Replacing your gas car');
    });

    test('returns fallback response for unrecognized queries', async () => {
      const state = {
        reportGenerated: true,
        emissions: {
          travel: 5.0,
          home: 1.0,
          diet: 1.0,
          shopping: 1.0,
          total: 8.0,
        },
        inputs: {
          country: 'United States',
          travel: { carType: 'gas' },
          home: {},
          diet: {},
          shopping: {},
        },
      };

      const res = await chatRespond('xyzzy gibberish', state);
      expect(res).toContain('8.0');
      expect(res).toContain('travel');
    });
  });
});
