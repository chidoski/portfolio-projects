/**
 * Family Financial Dynamics Service
 * Calculates how children impact financial capacity across different life phases
 * Provides strategies and encouragement for each phase of family financial planning
 */

import { allocateFunds } from './bucketAllocator.js';
import { FinancialProfile, UserProfile, FixedExpenses } from '../models/FinancialProfile.js';

/**
 * Child cost data by age and phase
 * Based on USDA and real-world family expense data
 */
const CHILD_COSTS = {
  // Monthly costs by age range
  infant: { // 0-2 years
    daycare: 1200,        // Average daycare cost
    medical: 150,         // Pediatric visits, formula, diapers
    clothing: 50,         // Growing out of clothes quickly
    food: 100,            // Formula, baby food
    miscellaneous: 100,   // Toys, equipment, misc baby items
    total: 1600
  },
  preschool: { // 3-5 years
    daycare: 900,         // Preschool typically less than infant care
    medical: 100,         // Less frequent doctor visits
    clothing: 75,         // Still growing, but slower
    food: 150,            // More regular food
    miscellaneous: 125,   // Activities, toys, books
    total: 1350
  },
  elementary: { // 6-11 years
    daycare: 400,         // After-school care only
    medical: 80,          // Annual checkups, occasional sick visits
    clothing: 100,        // School clothes, sports equipment
    food: 200,            // Growing appetite
    activities: 150,      // Sports, music lessons, camps
    miscellaneous: 100,   // School supplies, toys
    total: 1030
  },
  middle: { // 12-14 years
    daycare: 200,         // Minimal supervision needed
    medical: 100,         // Orthodontics might start
    clothing: 150,        // Brand consciousness begins
    food: 250,            // Big appetites
    activities: 200,      // More expensive activities, travel teams
    technology: 50,       // Phone, computer needs
    miscellaneous: 100,   // School supplies, social activities
    total: 1050
  },
  high: { // 15-18 years
    daycare: 0,           // Independent
    medical: 120,         // Orthodontics, sports physicals
    clothing: 200,        // More expensive tastes
    food: 300,            // Peak eating years
    activities: 250,      // Car insurance, gas, expensive activities
    technology: 100,      // Phone, laptop, software
    car: 200,             // Insurance, gas, maintenance
    miscellaneous: 150,   // Dates, movies, college prep
    total: 1320
  },
  college: { // 18-22 years (if attending college)
    tuition: 800,         // Average monthly for state school
    room_board: 900,      // Dorm or apartment costs
    books: 100,           // Textbooks and supplies
    personal: 300,        // Food, entertainment, misc
    total: 2100
  }
};

/**
 * Determine child phase based on age
 */
function getChildPhase(age) {
  if (age <= 2) return 'infant';
  if (age <= 5) return 'preschool';
  if (age <= 11) return 'elementary';
  if (age <= 14) return 'middle';
  if (age <= 17) return 'high';
  if (age <= 22) return 'college';
  return 'independent';
}

/**
 * Calculate total monthly child costs for given ages
 */
function calculateChildCosts(ages, collegePlans = {}) {
  let totalCosts = 0;
  const costBreakdown = {};
  
  ages.forEach((age, index) => {
    const phase = getChildPhase(age);
    
    if (phase === 'college') {
      // Check if this child is attending college
      const childId = `child_${index}`;
      const isAttendingCollege = collegePlans[childId]?.attending !== false;
      
      if (isAttendingCollege) {
        const collegeType = collegePlans[childId]?.type || 'state';
        const collegeMultiplier = {
          community: 0.4,
          state: 1.0,
          private: 2.2,
          elite: 3.5
        }[collegeType] || 1.0;
        
        const collegeCosts = CHILD_COSTS.college.total * collegeMultiplier;
        totalCosts += collegeCosts;
        costBreakdown[`child_${index}_college`] = collegeCosts;
      }
    } else if (phase !== 'independent') {
      const phaseCosts = CHILD_COSTS[phase].total;
      totalCosts += phaseCosts;
      costBreakdown[`child_${index}_${phase}`] = phaseCosts;
    }
  });
  
  return { totalCosts, costBreakdown };
}

/**
 * Generate life phase analysis for the family
 */
function generateLifePhaseAnalysis(ages, collegePlans, yearsToAnalyze = 25) {
  const phases = [];
  let currentYear = 0;
  
  while (currentYear < yearsToAnalyze) {
    const futureAges = ages.map(age => age + currentYear);
    const { totalCosts, costBreakdown } = calculateChildCosts(futureAges, collegePlans);
    
    // Determine dominant phase
    const phaseCounts = {};
    futureAges.forEach(age => {
      const phase = getChildPhase(age);
      if (phase !== 'independent') {
        phaseCounts[phase] = (phaseCounts[phase] || 0) + 1;
      }
    });
    
    const dominantPhase = Object.keys(phaseCounts).length > 0 
      ? Object.keys(phaseCounts).reduce((a, b) => phaseCounts[a] > phaseCounts[b] ? a : b)
      : 'empty_nest';
    
    phases.push({
      year: currentYear,
      dominantPhase,
      childAges: [...futureAges],
      totalMonthlyCosts: totalCosts,
      costBreakdown,
      activeChildren: futureAges.filter(age => age >= 0 && age <= 22).length
    });
    
    currentYear++;
  }
  
  return phases;
}

/**
 * Generate phase-specific strategies and messaging
 */
function getPhaseStrategy(phase, childCount = 1) {
  const strategies = {
    infant: {
      title: 'The Foundation Years',
      emoji: '👶',
      priority: 'Maintain Foundation, reduce Dreams temporarily',
      strategy: [
        'Keep Foundation contributions steady - this is your safety net during unpredictable baby years',
        'Reduce Dream bucket by 30-50% but don\'t eliminate completely',
        'Increase Life bucket for unexpected baby expenses and emergency fund',
        'Take advantage of dependent tax credits and FSA/HSA accounts'
      ],
      encouragement: 'This is temporary! The expensive baby years end around age 3. You\'re building the most important foundation of all - your family.',
      timeframe: '2-3 years',
      costIntensity: 'high',
      financialFocus: 'Cash flow and emergency preparedness'
    },
    
    preschool: {
      title: 'The Transition Years',
      emoji: '👧',
      priority: 'Begin Dream recovery, maintain Foundation',
      strategy: [
        'Daycare costs decrease - redirect 25% of savings back to Dreams',
        'Start 529 college savings plans if not already established',
        'Foundation stays steady - you\'re in the long-game now',
        'Consider flexible work arrangements to optimize childcare costs'
      ],
      encouragement: 'You\'re through the most expensive phase! Costs are decreasing and your income is likely growing. Time to cautiously restart those dreams.',
      timeframe: '3 years',
      costIntensity: 'medium-high',
      financialFocus: 'Gradual dream recovery and education planning'
    },
    
    elementary: {
      title: 'The Golden Years',
      emoji: '🎒',
      priority: 'Accelerate Dreams, boost college savings',
      strategy: [
        'Major expense relief! Redirect daycare savings to Dreams (40-60% recovery)',
        'Aggressive 529 contributions - you have 12+ years until college',
        'Consider increasing Foundation if behind due to early child years',
        'This is your catch-up window - maximize it!'
      ],
      encouragement: 'This is it - the sweet spot! Lower childcare costs, stable income, and time to supercharge your dreams. Make this decade count!',
      timeframe: '6 years',
      costIntensity: 'medium',
      financialFocus: 'Dream acceleration and college preparation'
    },
    
    middle: {
      title: 'The Activity Years',
      emoji: '⚽',
      priority: 'Balance Dreams with increasing activity costs',
      strategy: [
        'Activity costs increase but still manageable',
        'Dreams continue at steady pace - don\'t sacrifice long-term for short-term activities',
        'Evaluate activity ROI - not every expensive sport/activity is worth it',
        'College planning becomes more concrete - adjust 529 contributions accordingly'
      ],
      encouragement: 'Your kids are becoming people with real interests! Budget wisely for activities while keeping your family dreams alive.',
      timeframe: '3 years',
      costIntensity: 'medium',
      financialFocus: 'Balancing current activities with future goals'
    },
    
    high: {
      title: 'The Pre-Launch Years',
      emoji: '🚗',
      priority: 'College prep while maintaining Dreams',
      strategy: [
        'Car insurance and teen expenses increase, but manage carefully',
        'Final college savings push - but don\'t sacrifice retirement',
        'Start college financial aid planning and scholarship research',
        'Dreams may slow but shouldn\'t stop - your someday life is still important'
      ],
      encouragement: 'Almost there! These are the last high-cost years before launch. Stay focused on both college AND your own dreams.',
      timeframe: '4 years',
      costIntensity: 'medium-high',
      financialFocus: 'College preparation and dream preservation'
    },
    
    college: {
      title: 'The Investment Years',
      emoji: '🎓',
      priority: 'Strategic college funding without derailing retirement',
      strategy: [
        'Use 529 funds first, then current income, loans as last resort',
        'Maintain minimum Foundation - never raid retirement for college',
        'Dreams may pause temporarily but set firm restart date',
        'Consider state schools, community college transfers, and merit scholarships'
      ],
      encouragement: 'You\'re investing in their future! Remember: they can borrow for college, you can\'t borrow for retirement. Stay balanced.',
      timeframe: '4 years per child',
      costIntensity: 'very high',
      financialFocus: 'Education funding without retirement sacrifice'
    },
    
    empty_nest: {
      title: 'The Liberation Years',
      emoji: '🕊️',
      priority: 'Dream acceleration and retirement boost',
      strategy: [
        'Major expense relief - redirect ALL child costs to Dreams and Foundation',
        'This is your final pre-retirement sprint - make it count!',
        'Consider lifestyle inflation carefully - you\'ve lived efficiently for years',
        'Your someday life is now closer than ever - aggressive pursuit mode!'
      ],
      encouragement: 'Freedom! 🎉 All those years of sacrifice are paying off. Time to aggressively pursue YOUR dreams while you\'re young enough to enjoy them.',
      timeframe: '10+ years',
      costIntensity: 'low',
      financialFocus: 'Maximum dream and retirement acceleration'
    }
  };
  
  return strategies[phase] || strategies.empty_nest;
}

/**
 * Calculate adjusted financial capacity with children
 * @param {Array} ages - Current ages of children
 * @param {Object} collegePlans - College plans for each child
 * @param {FinancialProfile} currentProfile - Current financial profile
 * @returns {Object} Comprehensive family financial analysis
 */
export function calculateWithKids(ages = [], collegePlans = {}, currentProfile) {
  if (!currentProfile) {
    throw new Error('Financial profile is required');
  }
  
  // Calculate current child costs
  const { totalCosts: currentChildCosts } = calculateChildCosts(ages, collegePlans);
  
  // Generate life phase projections
  const lifePhases = generateLifePhaseAnalysis(ages, collegePlans);
  
  // Create adjusted profile with child costs
  const adjustedProfile = new FinancialProfile({
    ...currentProfile,
    variableExpenses: {
      ...currentProfile.variableExpenses,
      childcare: currentChildCosts,
      total: currentProfile.variableExpenses.total + currentChildCosts
    }
  });
  
  // Calculate current capacity with children
  const originalDisposable = currentProfile.calculateDisposableIncome();
  const adjustedDisposable = adjustedProfile.calculateDisposableIncome();
  const capacityImpact = originalDisposable - adjustedDisposable;
  
  // Get allocations for different scenarios
  const originalAllocations = allocateFunds(originalDisposable, currentProfile, 'balanced');
  const adjustedAllocations = allocateFunds(Math.max(0, adjustedDisposable), adjustedProfile, 'balanced');
  
  // Determine current dominant phase
  const currentPhases = ages.map(age => getChildPhase(age));
  const currentDominantPhase = currentPhases.length > 0 
    ? currentPhases.reduce((acc, phase) => {
        acc[phase] = (acc[phase] || 0) + 1;
        return acc;
      }, {})
    : { empty_nest: 1 };
  
  const dominantPhase = Object.keys(currentDominantPhase).reduce((a, b) => 
    currentDominantPhase[a] > currentDominantPhase[b] ? a : b
  );
  
  // Get current phase strategy
  const currentStrategy = getPhaseStrategy(dominantPhase, ages.length);
  
  // Calculate phase transitions and opportunities
  const phaseTransitions = [];
  for (let i = 0; i < lifePhases.length - 1; i++) {
    const current = lifePhases[i];
    const next = lifePhases[i + 1];
    
    if (current.dominantPhase !== next.dominantPhase) {
      const costChange = next.totalMonthlyCosts - current.totalMonthlyCosts;
      phaseTransitions.push({
        year: next.year,
        fromPhase: current.dominantPhase,
        toPhase: next.dominantPhase,
        costChange,
        isOpportunity: costChange < -200, // Significant cost reduction
        strategy: getPhaseStrategy(next.dominantPhase, next.activeChildren)
      });
    }
  }
  
  // Calculate dream recovery timeline
  const dreamRecoveryPlan = calculateDreamRecovery(lifePhases, originalAllocations.dream);
  
  // Generate family-specific bucket strategy
  const familyBucketStrategy = generateFamilyBucketStrategy(
    currentStrategy, 
    adjustedAllocations, 
    originalAllocations,
    capacityImpact
  );
  
  return {
    // Current state
    currentState: {
      childAges: ages,
      dominantPhase,
      currentChildCosts,
      capacityImpact,
      capacityReduction: Math.round((capacityImpact / originalDisposable) * 100)
    },
    
    // Allocations comparison
    allocations: {
      withoutKids: originalAllocations,
      withKids: adjustedAllocations,
      familyStrategy: familyBucketStrategy
    },
    
    // Current phase guidance
    currentPhase: {
      ...currentStrategy,
      customizedStrategy: familyBucketStrategy
    },
    
    // Timeline projections
    timeline: {
      phases: lifePhases,
      transitions: phaseTransitions,
      dreamRecovery: dreamRecoveryPlan,
      keyMilestones: generateKeyMilestones(ages, lifePhases)
    },
    
    // Encouragement and insights
    insights: {
      encouragingFacts: generateEncouragingFacts(lifePhases, capacityImpact),
      strategicOpportunities: identifyStrategicOpportunities(phaseTransitions),
      familyOptimizations: suggestFamilyOptimizations(ages, currentProfile)
    },
    
    // Calculations metadata
    metadata: {
      calculatedAt: new Date().toISOString(),
      childCount: ages.length,
      analysisYears: 25,
      includedCollegePlans: Object.keys(collegePlans).length
    }
  };
}

/**
 * Generate family-specific bucket allocation strategy
 */
function generateFamilyBucketStrategy(phaseStrategy, adjustedAllocations, originalAllocations, capacityImpact) {
  const strategy = {
    foundation: { ...adjustedAllocations },
    recommendations: [],
    adjustments: {}
  };
  
  // Foundation adjustments
  if (capacityImpact > 500) {
    strategy.foundation.foundation = Math.max(
      adjustedAllocations.foundation * 0.9, // Never reduce Foundation below 90%
      originalAllocations.foundation * 0.8
    );
    strategy.recommendations.push({
      type: 'foundation',
      message: 'Maintaining 80-90% of Foundation during high-cost child years protects your long-term security',
      priority: 'high'
    });
  }
  
  // Dream adjustments based on phase
  const phaseAdjustments = {
    infant: { dreamMultiplier: 0.5, lifeMultiplier: 1.3 },
    preschool: { dreamMultiplier: 0.7, lifeMultiplier: 1.2 },
    elementary: { dreamMultiplier: 1.2, lifeMultiplier: 0.9 },
    middle: { dreamMultiplier: 1.0, lifeMultiplier: 1.0 },
    high: { dreamMultiplier: 0.9, lifeMultiplier: 1.1 },
    college: { dreamMultiplier: 0.6, lifeMultiplier: 1.4 }
  };
  
  const currentPhase = Object.keys(phaseAdjustments).find(phase => 
    phaseStrategy.title.toLowerCase().includes(phase)
  ) || 'elementary';
  
  const adjustments = phaseAdjustments[currentPhase];
  
  strategy.foundation.dream = adjustedAllocations.dream * adjustments.dreamMultiplier;
  strategy.foundation.life = adjustedAllocations.life * adjustments.lifeMultiplier;
  
  // Recalculate total
  strategy.foundation.total = strategy.foundation.foundation + strategy.foundation.dream + strategy.foundation.life;
  
  strategy.adjustments = {
    dreamAdjustment: adjustments.dreamMultiplier,
    lifeAdjustment: adjustments.lifeMultiplier,
    reasoning: `${currentPhase} phase optimization`
  };
  
  return strategy;
}

/**
 * Calculate when dream contributions can return to pre-child levels
 */
function calculateDreamRecovery(lifePhases, originalDreamAllocation) {
  const recoveryPlan = {
    fullRecoveryYear: null,
    partialRecoveryMilestones: [],
    accelerationOpportunities: []
  };
  
  let dreamCapacity = 0;
  
  lifePhases.forEach((phase, index) => {
    const availableForDreams = Math.max(0, 2000 - phase.totalMonthlyCosts); // Assuming $2000 baseline
    const recoveryPercentage = Math.min(100, (availableForDreams / originalDreamAllocation) * 100);
    
    if (recoveryPercentage >= 50 && recoveryPlan.partialRecoveryMilestones.length === 0) {
      recoveryPlan.partialRecoveryMilestones.push({
        year: phase.year,
        percentage: Math.round(recoveryPercentage),
        phase: phase.dominantPhase,
        message: 'Dream contributions can return to 50% of pre-child levels'
      });
    }
    
    if (recoveryPercentage >= 100 && !recoveryPlan.fullRecoveryYear) {
      recoveryPlan.fullRecoveryYear = phase.year;
    }
    
    // Look for acceleration opportunities (major cost drops)
    if (index > 0) {
      const costReduction = lifePhases[index - 1].totalMonthlyCosts - phase.totalMonthlyCosts;
      if (costReduction > 500) {
        recoveryPlan.accelerationOpportunities.push({
          year: phase.year,
          costReduction,
          phase: phase.dominantPhase,
          opportunity: `${costReduction.toLocaleString()} monthly savings can accelerate dreams`
        });
      }
    }
  });
  
  return recoveryPlan;
}

/**
 * Generate key family financial milestones
 */
function generateKeyMilestones(ages, lifePhases) {
  const milestones = [];
  
  ages.forEach((age, index) => {
    // School start milestone
    const schoolStartYear = Math.max(0, 6 - age);
    if (schoolStartYear <= 25) {
      milestones.push({
        year: schoolStartYear,
        type: 'cost_reduction',
        description: `Child ${index + 1} starts school - daycare costs reduce significantly`,
        financialImpact: 'Expect $400-800/month savings to redirect to dreams'
      });
    }
    
    // College start milestone
    const collegeStartYear = Math.max(0, 18 - age);
    if (collegeStartYear <= 25) {
      milestones.push({
        year: collegeStartYear,
        type: 'major_expense',
        description: `Child ${index + 1} college starts`,
        financialImpact: 'Major expense period begins - maintain Foundation at minimum'
      });
    }
    
    // Independence milestone
    const independenceYear = Math.max(0, 22 - age);
    if (independenceYear <= 25) {
      milestones.push({
        year: independenceYear,
        type: 'liberation',
        description: `Child ${index + 1} becomes financially independent`,
        financialImpact: 'Major expense relief - accelerate dreams and retirement!'
      });
    }
  });
  
  return milestones.sort((a, b) => a.year - b.year);
}

/**
 * Generate encouraging facts about family finances
 */
function generateEncouragingFacts(lifePhases, capacityImpact) {
  const facts = [];
  
  // Find the most expensive year
  const maxCostYear = lifePhases.reduce((max, phase) => 
    phase.totalMonthlyCosts > max.totalMonthlyCosts ? phase : max
  );
  
  facts.push({
    title: 'Peak Expenses Are Temporary',
    message: `Your highest child costs (${maxCostYear.totalMonthlyCosts.toLocaleString()}/month) occur in year ${maxCostYear.year}. After that, costs generally decrease!`,
    emoji: '📈➡️📉'
  });
  
  // Find cost relief periods
  const reliefPeriods = lifePhases.filter((phase, index) => {
    if (index === 0) return false;
    return lifePhases[index - 1].totalMonthlyCosts - phase.totalMonthlyCosts > 300;
  });
  
  if (reliefPeriods.length > 0) {
    facts.push({
      title: 'Multiple Relief Periods Coming',
      message: `You have ${reliefPeriods.length} major cost reduction periods ahead where you can accelerate your dreams`,
      emoji: '🌈'
    });
  }
  
  // Total child investment perspective
  const totalChildInvestment = lifePhases.reduce((sum, phase) => sum + (phase.totalMonthlyCosts * 12), 0);
  facts.push({
    title: 'Investment in the Future',
    message: `While children require significant investment, remember you're building the next generation AND can still achieve your dreams`,
    emoji: '💝'
  });
  
  // Recovery timeline
  const lowCostPhases = lifePhases.filter(phase => phase.totalMonthlyCosts < 500);
  if (lowCostPhases.length > 0) {
    facts.push({
      title: 'Dream Acceleration Ahead',
      message: `Starting year ${lowCostPhases[0].year}, your child costs drop significantly, allowing major dream acceleration`,
      emoji: '🚀'
    });
  }
  
  return facts;
}

/**
 * Identify strategic opportunities in the family timeline
 */
function identifyStrategicOpportunities(phaseTransitions) {
  return phaseTransitions
    .filter(transition => transition.isOpportunity)
    .map(transition => ({
      year: transition.year,
      opportunity: transition.strategy.title,
      strategy: `${transition.costChange * -1} monthly savings available - perfect time to ${transition.strategy.priority.toLowerCase()}`,
      actionItems: transition.strategy.strategy.slice(0, 2) // Top 2 strategies
    }));
}

/**
 * Suggest family-specific optimizations
 */
function suggestFamilyOptimizations(ages, currentProfile) {
  const optimizations = [];
  
  // Young children optimizations
  if (ages.some(age => age <= 5)) {
    optimizations.push({
      category: 'Tax Optimization',
      suggestion: 'Maximize dependent care FSA ($5,000/year) and child tax credits',
      savings: 'Up to $1,500/year in tax savings'
    });
    
    optimizations.push({
      category: 'Childcare Strategy',
      suggestion: 'Consider nanny shares or family daycare to reduce costs',
      savings: 'Potential $300-600/month savings'
    });
  }
  
  // School-age optimizations
  if (ages.some(age => age >= 6 && age <= 17)) {
    optimizations.push({
      category: '529 Planning',
      suggestion: 'Aggressive 529 contributions during elementary years while costs are lower',
      savings: 'Tax-advantaged growth for 6-12 years before college'
    });
    
    optimizations.push({
      category: 'Activity Budgeting',
      suggestion: 'Set activity budgets per child to prevent lifestyle inflation',
      savings: 'Prevents $200-500/month in activity creep'
    });
  }
  
  // College-bound optimizations
  if (ages.some(age => age >= 14)) {
    optimizations.push({
      category: 'College Strategy',
      suggestion: 'Research merit scholarships and consider state schools for best ROI',
      savings: 'Potential $10,000-40,000 per year in college costs'
    });
  }
  
  return optimizations;
}

/**
 * Get simplified family phase summary
 * @param {Array} ages - Current ages of children
 * @returns {Object} Simple phase summary for quick reference
 */
export function getFamilyPhaseSummary(ages = []) {
  if (ages.length === 0) {
    return {
      phase: 'No Children',
      emoji: '👫',
      message: 'Full capacity for dreams and goals',
      strategy: 'Aggressive pursuit of someday life'
    };
  }
  
  const phases = ages.map(age => getChildPhase(age));
  const phaseCounts = phases.reduce((acc, phase) => {
    acc[phase] = (acc[phase] || 0) + 1;
    return acc;
  }, {});
  
  const dominantPhase = Object.keys(phaseCounts).reduce((a, b) => 
    phaseCounts[a] > phaseCounts[b] ? a : b
  );
  
  const strategy = getPhaseStrategy(dominantPhase, ages.length);
  
  return {
    phase: strategy.title,
    emoji: strategy.emoji,
    message: strategy.encouragement.split('.')[0] + '.',
    strategy: strategy.priority,
    timeframe: strategy.timeframe,
    costIntensity: strategy.costIntensity
  };
}

/**
 * Calculate college savings recommendations
 * @param {Array} ages - Current ages of children
 * @param {Object} collegePlans - College plans for each child
 * @param {number} monthlyCapacity - Available monthly savings capacity
 * @returns {Object} College savings recommendations
 */
export function calculateCollegeSavingsStrategy(ages, collegePlans = {}, monthlyCapacity = 1000) {
  const recommendations = [];
  
  ages.forEach((age, index) => {
    const childId = `child_${index}`;
    const yearsToCollege = Math.max(0, 18 - age);
    const collegePlan = collegePlans[childId] || { type: 'state', attending: true };
    
    if (collegePlan.attending && yearsToCollege > 0) {
      const collegeMultiplier = {
        community: 0.4,
        state: 1.0,
        private: 2.2,
        elite: 3.5
      }[collegePlan.type] || 1.0;
      
      const estimatedAnnualCost = 25200 * collegeMultiplier; // Base state school cost
      const totalCollegeCost = estimatedAnnualCost * 4;
      
      // Calculate monthly savings needed
      const monthlyNeeded = totalCollegeCost / (yearsToCollege * 12);
      const recommendedMonthly = Math.min(monthlyNeeded, monthlyCapacity * 0.25); // Max 25% of capacity per child
      
      recommendations.push({
        childIndex: index,
        age,
        yearsToCollege,
        collegeType: collegePlan.type,
        estimatedTotalCost: totalCollegeCost,
        monthlyNeeded,
        recommendedMonthly,
        message: yearsToCollege > 10 
          ? `Plenty of time! $${recommendedMonthly.toFixed(0)}/month builds a strong foundation` 
          : yearsToCollege > 5
          ? `Moderate urgency. $${recommendedMonthly.toFixed(0)}/month recommended`
          : `High urgency! Consider increasing to $${monthlyNeeded.toFixed(0)}/month if possible`
      });
    }
  });
  
  return {
    recommendations,
    totalMonthlyRecommended: recommendations.reduce((sum, rec) => sum + rec.recommendedMonthly, 0),
    capacityUsed: (recommendations.reduce((sum, rec) => sum + rec.recommendedMonthly, 0) / monthlyCapacity) * 100
  };
}

export default {
  calculateWithKids,
  getFamilyPhaseSummary,
  calculateCollegeSavingsStrategy
};
