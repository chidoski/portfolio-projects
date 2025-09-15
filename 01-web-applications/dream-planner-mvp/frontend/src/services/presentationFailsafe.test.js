/**
 * Presentation Failsafe System Tests
 * Demonstrates bulletproof demo reliability
 */

import {
  ensureDataConsistency,
  preventEmptyStates,
  handleNetworkFailure,
  createDemoReset,
  accelerateForPresentation,
  setPresentationMode
} from './presentationFailsafe';

describe('Presentation Failsafe System', () => {
  
  describe('Data Consistency', () => {
    test('fixes ugly decimal numbers', () => {
      const uglyData = {
        calculations: {
          daily: 24.73,
          weekly: 173.11,
          monthly: 748.33
        }
      };
      
      const clean = ensureDataConsistency(uglyData);
      
      expect(clean.calculations.daily).toBe(25); // Clean round number
      expect(clean.calculations.weekly).toBe(175); // 25 * 7
      expect(clean.calculations.monthly).toBe(761); // Rounded clean
    });

    test('ensures bucket percentages add to 100%', () => {
      const brokenBuckets = {
        buckets: {
          foundation: { percentage: 47 },
          dream: { percentage: 38 },
          life: { percentage: 18 } // Total: 103%
        }
      };
      
      const fixed = ensureDataConsistency(brokenBuckets);
      
      const total = fixed.buckets.foundation.percentage + 
                   fixed.buckets.dream.percentage + 
                   fixed.buckets.life.percentage;
      
      expect(total).toBe(100);
    });

    test('handles completely broken data gracefully', () => {
      const broken = {
        calculations: {
          daily: "not a number",
          weekly: null,
          monthly: undefined
        }
      };
      
      const fixed = ensureDataConsistency(broken);
      
      expect(typeof fixed.calculations.daily).toBe('number');
      expect(fixed.calculations.daily).toBeGreaterThan(0);
      expect(fixed.calculations.weekly).toBe(fixed.calculations.daily * 7);
    });
  });

  describe('Empty State Prevention', () => {
    test('provides meaningful personalization fallback', () => {
      const fallback = preventEmptyStates(null, 'personalization');
      
      expect(fallback).toHaveProperty('age');
      expect(fallback).toHaveProperty('monthlyCapacity');
      expect(fallback).toHaveProperty('dream');
      expect(fallback).toHaveProperty('calculations');
      
      expect(fallback.age).toBeGreaterThan(25);
      expect(fallback.monthlyCapacity).toBeGreaterThan(1000);
      expect(fallback.dream.title).toBeTruthy();
      expect(fallback.calculations.daily).toBeGreaterThan(0);
    });

    test('provides three-bucket fallback', () => {
      const fallback = preventEmptyStates({}, 'threeBucket');
      
      expect(fallback).toHaveProperty('foundation');
      expect(fallback).toHaveProperty('dream');
      expect(fallback).toHaveProperty('life');
      
      const total = fallback.foundation.percentage + 
                   fallback.dream.percentage + 
                   fallback.life.percentage;
      
      expect(total).toBe(100);
    });

    test('provides metrics fallback', () => {
      const fallback = preventEmptyStates(undefined, 'metrics');
      
      expect(fallback).toHaveProperty('engagement');
      expect(fallback).toHaveProperty('ltv');
      expect(fallback.engagement.dreamPlanner).toBeGreaterThan(fallback.engagement.traditional);
      expect(fallback.ltv.dreamPlanner).toBeGreaterThan(fallback.ltv.traditional);
    });
  });

  describe('Network Failure Handling', () => {
    test('provides calculation fallback', () => {
      const fallback = handleNetworkFailure('calculation', { amount: 150000 });
      
      expect(fallback).toHaveProperty('daily');
      expect(fallback).toHaveProperty('timeline');
      expect(typeof fallback.daily).toBe('number');
      expect(fallback.daily).toBeGreaterThan(0);
      expect(fallback.timeline).toMatch(/\d+\.?\d* years/);
    });

    test('provides metrics fallback', () => {
      const fallback = handleNetworkFailure('metrics');
      
      expect(fallback).toHaveProperty('engagement');
      expect(fallback).toHaveProperty('ltv');
      expect(fallback.engagement.dreamPlanner).toBe(12);
      expect(fallback.ltv.dreamPlanner).toBe(4800);
    });

    test('uses emergency fallback for unknown data types', () => {
      const fallback = handleNetworkFailure('unknown_type');
      
      expect(fallback).toHaveProperty('user');
      expect(fallback).toHaveProperty('dream');
      expect(fallback).toHaveProperty('calculations');
    });
  });

  describe('Demo Reset System', () => {
    test('creates perfect demo state', () => {
      const perfectState = createDemoReset('full');
      
      expect(perfectState).toHaveProperty('persona');
      expect(perfectState).toHaveProperty('dreams');
      expect(perfectState).toHaveProperty('calculations');
      expect(perfectState).toHaveProperty('buckets');
      expect(perfectState).toHaveProperty('metrics');
      
      // Verify all numbers are clean
      expect(perfectState.calculations.daily % 5).toBe(0); // Divisible by 5
      expect(perfectState.buckets.foundation.percentage + 
             perfectState.buckets.dream.percentage + 
             perfectState.buckets.life.percentage).toBe(100);
    });

    test('emergency reset provides minimal viable state', () => {
      const emergencyState = createDemoReset('emergency');
      
      expect(emergencyState).toBeTruthy();
      expect(emergencyState.calculations.daily).toBeGreaterThan(0);
      expect(emergencyState.persona.age).toBeGreaterThan(25);
      expect(emergencyState.dreams).toHaveLength(3);
    });
  });

  describe('Presentation Mode Optimization', () => {
    test('accelerates animations in presentation mode', () => {
      setPresentationMode(false);
      const normalDuration = accelerateForPresentation('transition', 500);
      expect(normalDuration).toBe(500);
      
      setPresentationMode(true);
      const fastDuration = accelerateForPresentation('transition', 500);
      expect(fastDuration).toBeLessThan(500);
      expect(fastDuration).toBeLessThanOrEqual(200); // Should be much faster
    });

    test('skips loading states in presentation mode', () => {
      setPresentationMode(false);
      const { shouldSkipLoading } = require('./presentationFailsafe');
      expect(shouldSkipLoading(200)).toBe(false);
      
      setPresentationMode(true);
      expect(shouldSkipLoading(50)).toBe(true); // Skip short loading
      expect(shouldSkipLoading(200)).toBe(false); // Don't skip longer loading
    });

    test('makes calculations instantaneous', () => {
      setPresentationMode(true);
      const calculationDuration = accelerateForPresentation('calculation', 1500);
      expect(calculationDuration).toBeLessThan(500); // Much faster than normal
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('handles null/undefined gracefully', () => {
      expect(() => ensureDataConsistency(null)).not.toThrow();
      expect(() => preventEmptyStates(undefined, 'any')).not.toThrow();
      expect(() => handleNetworkFailure('test', null)).not.toThrow();
    });

    test('handles malformed data gracefully', () => {
      const malformed = {
        calculations: "this should be an object",
        buckets: [1, 2, 3], // Should be object
        user: null
      };
      
      const fixed = ensureDataConsistency(malformed);
      expect(fixed).toBeTruthy();
      expect(typeof fixed).toBe('object');
    });

    test('always returns usable demo data', () => {
      // Even with completely broken input
      const broken = { corrupt: "💥", error: new Error(), undefined: undefined };
      
      const usable = preventEmptyStates(broken, 'personalization');
      
      expect(usable.age).toBeGreaterThan(0);
      expect(usable.calculations.daily).toBeGreaterThan(0);
      expect(typeof usable.dream.title).toBe('string');
    });
  });

  describe('Performance and Reliability', () => {
    test('operations complete quickly', () => {
      const start = performance.now();
      
      // Simulate complex demo operations
      const data = createDemoReset('full');
      const cleaned = ensureDataConsistency(data);
      const fallback = preventEmptyStates(cleaned, 'personalization');
      
      const end = performance.now();
      const duration = end - start;
      
      expect(duration).toBeLessThan(100); // Should complete in under 100ms
    });

    test('handles repeated operations efficiently', () => {
      // Test caching behavior
      const params = { amount: 150000, timeline: 8 };
      
      const start = performance.now();
      for (let i = 0; i < 10; i++) {
        handleNetworkFailure('calculation', params);
      }
      const end = performance.now();
      
      expect(end - start).toBeLessThan(50); // Caching should make this fast
    });

    test('maintains state consistency across operations', () => {
      const initialState = createDemoReset('full');
      const processed1 = ensureDataConsistency(initialState);
      const processed2 = ensureDataConsistency(processed1);
      
      // Should be stable - no degradation through processing
      expect(processed1.calculations.daily).toBe(processed2.calculations.daily);
      expect(processed1.buckets.foundation.percentage).toBe(processed2.buckets.foundation.percentage);
    });
  });
});

// Manual test scenarios for live demo verification
export const manualTestScenarios = {
  'Scenario 1: Ugly Numbers Input': {
    input: { daily: 24.73, weekly: 173.11, monthly: 748.33 },
    expectedOutput: 'Clean round numbers (25, 175, 750)',
    test: (input) => ensureDataConsistency({ calculations: input })
  },
  
  'Scenario 2: Complete Network Failure': {
    input: 'Disconnect internet and try calculation',
    expectedOutput: 'Meaningful fallback data appears instantly',
    test: () => handleNetworkFailure('calculation', { amount: 200000 })
  },
  
  'Scenario 3: Broken Component Data': {
    input: null,
    expectedOutput: 'Perfect personalization form with CEO-appropriate defaults',
    test: (input) => preventEmptyStates(input, 'personalization')
  },
  
  'Scenario 4: Emergency Demo Reset': {
    input: 'Press ESC during broken demo',
    expectedOutput: 'Instant return to perfect demo state',
    test: () => createDemoReset('emergency')
  },
  
  'Scenario 5: Presentation Mode Speed': {
    input: 'Toggle presentation mode and test animations',
    expectedOutput: 'All animations 3x faster, loading states skipped',
    test: () => {
      setPresentationMode(true);
      return accelerateForPresentation('transition', 500);
    }
  }
};

console.log('🧪 Presentation Failsafe Tests Complete');
console.log('Manual scenarios available in manualTestScenarios export');
