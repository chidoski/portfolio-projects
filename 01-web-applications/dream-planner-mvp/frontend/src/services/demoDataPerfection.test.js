/**
 * Tests for Demo Data Perfection Service
 * Ensures all demo numbers are compelling and memorable for CEO presentations
 */

import {
  createMarcusChenPersona,
  generateMarcusPerfectDreams,
  calculateMarcusPerfectBuckets,
  generatePerfectBusinessMetrics,
  perfectDemoCalculation,
  perfectNumberForDemo,
  getPerfectDemoPackage
} from './demoDataPerfection.js';

describe('Demo Data Perfection', () => {
  
  describe('Marcus Chen Persona', () => {
    test('creates relatable CEO-age persona with clean numbers', () => {
      const marcus = createMarcusChenPersona();
      
      expect(marcus.age).toBe(38); // Perfect CEO age
      expect(marcus.monthlyDisposableIncome).toBe(3500); // Clean $3.5k
      expect(marcus.monthlyIncome).toBe(12000); // Clean $12k
      expect(marcus.currentSavings).toBe(25000); // Clean $25k
      expect(marcus.name).toBe('Marcus Chen');
      expect(marcus.profession).toContain('Product Manager');
    });
  });

  describe('Perfect Dream Numbers', () => {
    test('all daily amounts are clean, memorable numbers', () => {
      const dreams = generateMarcusPerfectDreams();
      
      // Check that all daily amounts are perfect demo numbers
      const dailyAmounts = dreams.map(d => d.daily_amount);
      const expectedCleanAmounts = [25, 35, 15]; // $25, $35, $15
      
      expect(dailyAmounts).toEqual(expectedCleanAmounts);
    });

    test('all target amounts are round, memorable numbers', () => {
      const dreams = generateMarcusPerfectDreams();
      
      const targetAmounts = dreams.map(d => d.target_amount);
      const expectedTargets = [150000, 500000, 80000]; // $150k, $500k, $80k
      
      expect(targetAmounts).toEqual(expectedTargets);
    });

    test('progress percentages are psychologically satisfying', () => {
      const dreams = generateMarcusPerfectDreams();
      
      const progressAmounts = dreams.map(d => d.progress);
      const expectedProgress = [40, 15, 5]; // 40%, 15%, 5%
      
      expect(progressAmounts).toEqual(expectedProgress);
    });

    test('milestones hit perfect psychological points', () => {
      const dreams = generateMarcusPerfectDreams();
      
      dreams.forEach(dream => {
        const milestonePercentages = dream.milestones.map(m => m.percentage);
        expect(milestonePercentages).toEqual([25, 50, 75]);
      });
    });
  });

  describe('Three-Bucket Allocation', () => {
    test('bucket percentages add up to 100%', () => {
      const buckets = calculateMarcusPerfectBuckets();
      
      const totalPercent = buckets.foundation.percentage + 
                          buckets.dream.percentage + 
                          buckets.life.percentage;
      
      expect(totalPercent).toBe(100);
    });

    test('all monthly amounts are clean numbers', () => {
      const buckets = calculateMarcusPerfectBuckets();
      
      // Should be clean, round numbers
      expect(buckets.foundation.monthlyAmount % 25).toBe(0); // Divisible by 25
      expect(buckets.dream.monthlyAmount % 25).toBe(0);
      expect(buckets.life.monthlyAmount % 25).toBe(0);
    });

    test('total allocation equals disposable income', () => {
      const buckets = calculateMarcusPerfectBuckets();
      
      const totalAllocated = buckets.foundation.monthlyAmount + 
                            buckets.dream.monthlyAmount + 
                            buckets.life.monthlyAmount;
      
      expect(totalAllocated).toBe(buckets.monthlyDisposableIncome);
    });
  });

  describe('Perfect Number Rounding', () => {
    test('rounds ugly numbers to perfect presentation numbers', () => {
      // Test ugly daily amounts get rounded to perfect ones
      expect(perfectNumberForDemo(24.73, 'daily')).toBe(25);
      expect(perfectNumberForDemo(18.42, 'daily')).toBe(20);
      expect(perfectNumberForDemo(7.89, 'daily')).toBe(10);
      expect(perfectNumberForDemo(33.67, 'daily')).toBe(35);
    });

    test('weekly amounts round to clean numbers', () => {
      expect(perfectNumberForDemo(173.11, 'weekly')).toBe(175);
      expect(perfectNumberForDemo(247.50, 'weekly')).toBe(250);
      expect(perfectNumberForDemo(99.99, 'weekly')).toBe(100);
    });

    test('monthly amounts round to clean numbers', () => {
      expect(perfectNumberForDemo(748.33, 'monthly')).toBe(750);
      expect(perfectNumberForDemo(1247.89, 'monthly')).toBe(1250);
      expect(perfectNumberForDemo(2499.15, 'monthly')).toBe(2500);
    });
  });

  describe('Business Metrics', () => {
    test('all metrics are memorable round numbers', () => {
      const metrics = generatePerfectBusinessMetrics();
      
      // Engagement should be clean multiples
      expect(metrics.engagementTime.dreamPlanner).toBe(12);
      expect(metrics.engagementTime.traditional).toBe(2);
      
      // LTV should be memorable
      expect(metrics.lifetimeValue.dreamPlanner).toBe(4800);
      expect(metrics.lifetimeValue.traditional).toBe(45);
      
      // Retention should be round percentages
      expect(metrics.yearOneRetention.dreamPlanner).toBe(92);
      expect(metrics.yearOneRetention.traditional).toBe(15);
    });

    test('improvement ratios are compelling', () => {
      const metrics = generatePerfectBusinessMetrics();
      
      // Check that improvements are significant and memorable
      const engagementImprovement = metrics.engagementTime.dreamPlanner / metrics.engagementTime.traditional;
      expect(engagementImprovement).toBe(6); // Exactly 6x
      
      const ltvImprovement = metrics.lifetimeValue.dreamPlanner / metrics.lifetimeValue.traditional;
      expect(Math.round(ltvImprovement)).toBe(107); // ~107x
      
      const retentionImprovement = metrics.yearOneRetention.dreamPlanner / metrics.yearOneRetention.traditional;
      expect(Math.round(retentionImprovement)).toBe(6); // ~6x
    });
  });

  describe('Perfect Demo Calculations', () => {
    test('produces clean numbers for any input', () => {
      // Test with an ugly input that would normally produce messy numbers
      const uglyAmount = 73847; // Ugly target amount
      const uglyDate = '2027-03-17'; // Random date
      
      const result = perfectDemoCalculation(uglyAmount, uglyDate, 'balanced');
      
      // Daily amount should be clean
      expect([10, 15, 20, 25, 30, 35, 40, 50, 75, 100]).toContain(result.daily);
      
      // Weekly and monthly should also be clean
      expect(result.weekly % 5).toBe(0); // Should be divisible by 5
      expect(result.monthly % 25).toBe(0); // Should be divisible by 25
    });

    test('milestone amounts are round numbers', () => {
      const result = perfectDemoCalculation(123456, '2026-12-31', 'balanced');
      
      result.milestones.forEach(milestone => {
        // All milestone amounts should be round (no cents)
        expect(milestone.amount % 1).toBe(0);
        expect(milestone.percentage).toBeOneOf([25, 50, 75]);
      });
    });
  });

  describe('Complete Demo Package', () => {
    test('generates coherent, compelling demo story', () => {
      const demoPackage = getPerfectDemoPackage();
      
      // Should have all components
      expect(demoPackage).toHaveProperty('persona');
      expect(demoPackage).toHaveProperty('dreams');
      expect(demoPackage).toHaveProperty('buckets');
      expect(demoPackage).toHaveProperty('metrics');
      expect(demoPackage).toHaveProperty('competitive');
      expect(demoPackage).toHaveProperty('summary');
      
      // Dreams should be realistic but aspirational
      expect(demoPackage.dreams).toHaveLength(3);
      expect(demoPackage.dreams[0].title).toContain('Sabbatical');
      expect(demoPackage.dreams[1].title).toContain('Home');
      expect(demoPackage.dreams[2].title).toContain('Adventure');
      
      // Summary stats should be clean
      expect(demoPackage.summary.totalSaved % 1000).toBe(0); // Round thousands
      expect(demoPackage.summary.averageProgress % 5).toBe(0); // Round 5% increments
    });

    test('talking points are compelling and specific', () => {
      const demoPackage = getPerfectDemoPackage();
      
      const talkingPoints = demoPackage.summary.talkingPoints;
      expect(talkingPoints).toHaveLength(5);
      
      // Should mention specific numbers
      expect(talkingPoints[0]).toContain('$25/day');
      expect(talkingPoints[1]).toContain('$3,500');
      expect(talkingPoints[4]).toContain('125 days');
    });
  });

  describe('Edge Cases', () => {
    test('handles very small amounts gracefully', () => {
      const result = perfectNumberForDemo(0.50, 'daily');
      expect(result).toBeGreaterThan(0);
      expect([10, 15, 20, 25, 30, 35, 40, 50, 75, 100]).toContain(result);
    });

    test('handles very large amounts gracefully', () => {
      const result = perfectNumberForDemo(237.89, 'daily');
      expect(result).toBeLessThanOrEqual(100); // Should cap at reasonable demo amount
    });

    test('never returns ugly decimal amounts', () => {
      const testCases = [13.47, 28.91, 44.32, 67.81, 89.15];
      
      testCases.forEach(testAmount => {
        const result = perfectNumberForDemo(testAmount, 'daily');
        expect(result % 5).toBe(0); // Should always be divisible by 5
      });
    });
  });
});

// Helper function for testing
expect.extend({
  toBeOneOf(received, array) {
    const pass = array.includes(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be one of ${array}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be one of ${array}`,
        pass: false,
      };
    }
  },
});
