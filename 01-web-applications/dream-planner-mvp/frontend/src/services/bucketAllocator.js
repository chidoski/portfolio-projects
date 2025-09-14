/**
 * Bucket Allocator Service
 * Intelligent allocation algorithm for distributing funds across Foundation, Dream, and Life buckets
 * 
 * The three-bucket system:
 * - Foundation: Long-term wealth building and retirement (minimum safety threshold)
 * - Dream: Targeted savings for specific goals and North Star Dream
 * - Life: Flexible funds for opportunities and unexpected expenses
 */

import { FinancialCalculators } from '../models/FinancialProfile.js';

/**
 * Strategy configurations for different risk profiles
 */
const STRATEGY_CONFIGS = {
  conservative: {
    foundationWeight: 0.6,    // 60% emphasis on Foundation
    dreamWeight: 0.25,        // 25% emphasis on Dream
    lifeWeight: 0.15,         // 15% emphasis on Life
    riskMultiplier: 0.8,      // Reduce allocations by 20% for safety
    emergencyFundMonths: 6,   // 6 months emergency fund required
    maxDreamAllocation: 0.3   // Max 30% to dreams
  },
  balanced: {
    foundationWeight: 0.5,    // 50% emphasis on Foundation
    dreamWeight: 0.35,        // 35% emphasis on Dream
    lifeWeight: 0.15,         // 15% emphasis on Life
    riskMultiplier: 1.0,      // No adjustment
    emergencyFundMonths: 4,   // 4 months emergency fund required
    maxDreamAllocation: 0.4   // Max 40% to dreams
  },
  aggressive: {
    foundationWeight: 0.4,    // 40% emphasis on Foundation
    dreamWeight: 0.45,        // 45% emphasis on Dream
    lifeWeight: 0.15,         // 15% emphasis on Life
    riskMultiplier: 1.2,      // Increase allocations by 20%
    emergencyFundMonths: 3,   // 3 months emergency fund required
    maxDreamAllocation: 0.5   // Max 50% to dreams
  }
};

/**
 * Calculate the minimum Foundation bucket amount needed
 * Uses the higher of: 15% of gross income OR amount needed to reach $1M by age 65
 * 
 * @param {Object} financialProfile - Complete financial profile
 * @returns {number} Minimum monthly Foundation allocation
 */
function calculateMinimumFoundation(financialProfile) {
  const grossMonthlyIncome = financialProfile.userProfile.getMonthlyGrossIncome();
  const currentAge = financialProfile.userProfile.age || 30;
  const retirementAge = financialProfile.northStarDream.targetAge || 65;
  const yearsToRetirement = Math.max(1, retirementAge - currentAge);
  const currentRetirementSavings = financialProfile.currentAssets.investments.total || 0;
  
  // Option 1: 15% of gross income
  const fifteenPercentGross = grossMonthlyIncome * 0.15;
  
  // Option 2: Amount needed to reach $1M by retirement age
  const targetRetirementAmount = 1000000;
  const expectedReturn = financialProfile.northStarDream.investmentStrategy?.expectedReturn || 0.07;
  const monthlyReturn = expectedReturn / 12;
  const monthsToRetirement = yearsToRetirement * 12;
  
  // Calculate future value of current savings
  const futureValueCurrent = currentRetirementSavings * Math.pow(1 + monthlyReturn, monthsToRetirement);
  
  // Calculate additional amount needed
  const additionalNeeded = Math.max(0, targetRetirementAmount - futureValueCurrent);
  
  // Calculate monthly payment needed for additional amount
  let monthlyForMillion = 0;
  if (additionalNeeded > 0 && monthsToRetirement > 0) {
    if (monthlyReturn > 0) {
      // PMT = FV * r / ((1 + r)^n - 1)
      const denominator = Math.pow(1 + monthlyReturn, monthsToRetirement) - 1;
      monthlyForMillion = additionalNeeded * monthlyReturn / denominator;
    } else {
      monthlyForMillion = additionalNeeded / monthsToRetirement;
    }
  }
  
  // Return the higher of the two options
  return Math.max(fifteenPercentGross, monthlyForMillion);
}

/**
 * Calculate Dream bucket allocation based on North Star Dream timeline
 * 
 * @param {Object} financialProfile - Complete financial profile
 * @param {number} availableAfterFoundation - Remaining funds after Foundation allocation
 * @returns {number} Recommended Dream bucket allocation
 */
function calculateDreamAllocation(financialProfile, availableAfterFoundation) {
  const northStarDream = financialProfile.northStarDream;
  
  if (!northStarDream || !northStarDream.yearsToGoal || northStarDream.yearsToGoal <= 0) {
    // No specific dream timeline, allocate based on general wealth building
    return availableAfterFoundation * 0.3; // 30% default
  }
  
  const currentNetWorth = financialProfile.currentAssets.netWorth || 0;
  const requiredNetWorth = northStarDream.calculateRequiredNetWorth();
  const monthlySavingsNeeded = northStarDream.calculateMonthlySavingsNeeded(currentNetWorth);
  
  // If the North Star Dream requires more than available, cap it at available amount
  return Math.min(monthlySavingsNeeded, availableAfterFoundation);
}

/**
 * Calculate Life bucket allocation for opportunities and emergencies
 * 
 * @param {Object} financialProfile - Complete financial profile
 * @param {number} availableAfterOthers - Remaining funds after Foundation and Dream
 * @param {string} strategy - Investment strategy (conservative/balanced/aggressive)
 * @returns {number} Recommended Life bucket allocation
 */
function calculateLifeAllocation(financialProfile, availableAfterOthers, strategy) {
  const config = STRATEGY_CONFIGS[strategy];
  const monthlyExpenses = financialProfile.fixedExpenses.totalFixedExpenses + 
                         financialProfile.variableExpenses.total;
  const currentEmergencyFund = financialProfile.currentAssets.liquid.total || 0;
  const requiredEmergencyFund = monthlyExpenses * config.emergencyFundMonths;
  const emergencyFundGap = Math.max(0, requiredEmergencyFund - currentEmergencyFund);
  
  // If emergency fund is not adequate, prioritize building it
  if (emergencyFundGap > 0) {
    const emergencyFundMonthly = Math.min(emergencyFundGap / 6, availableAfterOthers * 0.5);
    return Math.max(emergencyFundMonthly, availableAfterOthers * 0.1); // At least 10%
  }
  
  // Emergency fund is adequate, allocate for opportunities
  // Reserve 10-20% based on strategy and available funds
  const minLifeAllocation = availableAfterOthers * 0.1;  // 10% minimum
  const maxLifeAllocation = availableAfterOthers * 0.2;  // 20% maximum
  
  // Conservative strategies lean toward higher Life allocation for safety
  const strategyMultiplier = strategy === 'conservative' ? 1.5 : 
                           strategy === 'balanced' ? 1.0 : 0.8;
  
  const recommendedLife = minLifeAllocation * strategyMultiplier;
  return Math.min(Math.max(recommendedLife, minLifeAllocation), maxLifeAllocation);
}

/**
 * Apply strategy-based adjustments to allocations
 * 
 * @param {Object} baseAllocations - Base allocation amounts
 * @param {string} strategy - Investment strategy
 * @param {number} availableMonthly - Total available monthly funds
 * @returns {Object} Adjusted allocations
 */
function applyStrategyAdjustments(baseAllocations, strategy, availableMonthly) {
  const config = STRATEGY_CONFIGS[strategy];
  const { foundationWeight, dreamWeight, lifeWeight, riskMultiplier, maxDreamAllocation } = config;
  
  // Calculate total base allocation
  const totalBase = baseAllocations.foundation + baseAllocations.dream + baseAllocations.life;
  
  // If total exceeds available, proportionally reduce
  if (totalBase > availableMonthly) {
    const reductionFactor = availableMonthly / totalBase;
    baseAllocations.foundation *= reductionFactor;
    baseAllocations.dream *= reductionFactor;
    baseAllocations.life *= reductionFactor;
  }
  
  // Apply strategy weights and risk multiplier
  const weightedTotal = (baseAllocations.foundation * foundationWeight) + 
                       (baseAllocations.dream * dreamWeight) + 
                       (baseAllocations.life * lifeWeight);
  
  if (weightedTotal > 0) {
    const adjustmentFactor = (availableMonthly * riskMultiplier) / weightedTotal;
    
    baseAllocations.foundation *= (foundationWeight * adjustmentFactor);
    baseAllocations.dream *= (dreamWeight * adjustmentFactor);
    baseAllocations.life *= (lifeWeight * adjustmentFactor);
  }
  
  // Ensure Dream allocation doesn't exceed maximum allowed by strategy
  const maxDreamAmount = availableMonthly * maxDreamAllocation;
  if (baseAllocations.dream > maxDreamAmount) {
    const excess = baseAllocations.dream - maxDreamAmount;
    baseAllocations.dream = maxDreamAmount;
    // Redistribute excess between Foundation and Life (70/30 split)
    baseAllocations.foundation += excess * 0.7;
    baseAllocations.life += excess * 0.3;
  }
  
  return baseAllocations;
}

/**
 * Generate allocation recommendations and insights
 * 
 * @param {Object} allocations - Final allocation amounts
 * @param {Object} financialProfile - Complete financial profile
 * @param {string} strategy - Investment strategy
 * @param {number} availableMonthly - Total available monthly funds
 * @returns {Object} Recommendations and insights
 */
function generateRecommendations(allocations, financialProfile, strategy, availableMonthly) {
  const recommendations = [];
  const insights = [];
  const warnings = [];
  
  const foundationPercentage = (allocations.foundation / availableMonthly) * 100;
  const dreamPercentage = (allocations.dream / availableMonthly) * 100;
  const lifePercentage = (allocations.life / availableMonthly) * 100;
  
  // Foundation analysis
  const minimumFoundation = calculateMinimumFoundation(financialProfile);
  if (allocations.foundation < minimumFoundation) {
    warnings.push({
      type: 'foundation_below_minimum',
      message: `Foundation allocation is below the recommended minimum of $${minimumFoundation.toFixed(2)}/month`,
      severity: 'high'
    });
  }
  
  if (foundationPercentage < 40) {
    recommendations.push({
      type: 'increase_foundation',
      message: 'Consider increasing Foundation allocation for better long-term security',
      priority: 'medium'
    });
  }
  
  // Dream analysis
  const northStarDream = financialProfile.northStarDream;
  if (northStarDream && northStarDream.yearsToGoal) {
    const requiredMonthly = northStarDream.calculateMonthlySavingsNeeded(
      financialProfile.currentAssets.netWorth || 0
    );
    
    if (allocations.dream < requiredMonthly * 0.8) {
      warnings.push({
        type: 'dream_underfunded',
        message: `Current Dream allocation may not meet your North Star Dream timeline. Consider allocating $${requiredMonthly.toFixed(2)}/month`,
        severity: 'medium'
      });
    }
    
    insights.push({
      type: 'dream_timeline',
      message: `At current allocation, you're ${allocations.dream >= requiredMonthly ? 'on track' : 'behind schedule'} for your ${northStarDream.title} goal`
    });
  }
  
  // Life bucket analysis
  const monthlyExpenses = financialProfile.fixedExpenses.totalFixedExpenses + 
                         financialProfile.variableExpenses.total;
  const currentEmergencyFund = financialProfile.currentAssets.liquid.total || 0;
  const emergencyFundMonths = monthlyExpenses > 0 ? currentEmergencyFund / monthlyExpenses : 0;
  
  if (emergencyFundMonths < 3) {
    recommendations.push({
      type: 'build_emergency_fund',
      message: 'Priority: Build emergency fund to at least 3 months of expenses',
      priority: 'high'
    });
  }
  
  // Strategy-specific insights
  if (strategy === 'conservative' && dreamPercentage > 35) {
    insights.push({
      type: 'strategy_alignment',
      message: 'Your Dream allocation is higher than typical for a conservative strategy. Consider if this aligns with your risk tolerance.'
    });
  }
  
  if (strategy === 'aggressive' && foundationPercentage > 60) {
    insights.push({
      type: 'strategy_alignment',
      message: 'Your Foundation allocation is higher than typical for an aggressive strategy. This provides extra security but may limit growth potential.'
    });
  }
  
  return {
    recommendations,
    insights,
    warnings,
    projections: {
      foundationGrowth: calculateProjectedGrowth(allocations.foundation, 30, 0.07),
      dreamTimeline: northStarDream ? northStarDream.yearsToGoal : null,
      emergencyFundMonths: emergencyFundMonths + (allocations.life / monthlyExpenses * 12)
    }
  };
}

/**
 * Calculate projected growth over time
 * 
 * @param {number} monthlyContribution - Monthly contribution amount
 * @param {number} years - Number of years to project
 * @param {number} annualReturn - Expected annual return rate
 * @returns {number} Projected future value
 */
function calculateProjectedGrowth(monthlyContribution, years, annualReturn) {
  const monthlyReturn = annualReturn / 12;
  const months = years * 12;
  
  if (monthlyReturn === 0) {
    return monthlyContribution * months;
  }
  
  return monthlyContribution * ((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn);
}

/**
 * Main allocation function - distributes available monthly funds across three buckets
 * 
 * @param {number} availableMonthly - Available monthly funds for allocation
 * @param {Object} financialProfile - Complete financial profile object
 * @param {string} strategy - Allocation strategy ('conservative', 'balanced', 'aggressive')
 * @returns {Object} Allocation recommendations with amounts and analysis
 */
export function allocateFunds(availableMonthly, financialProfile, strategy = 'balanced') {
  // Validate inputs
  if (!availableMonthly || availableMonthly <= 0) {
    return {
      foundation: 0,
      dream: 0,
      life: 0,
      total: 0,
      error: 'No funds available for allocation'
    };
  }
  
  if (!financialProfile) {
    return {
      foundation: 0,
      dream: 0,
      life: 0,
      total: 0,
      error: 'Financial profile is required'
    };
  }
  
  if (!STRATEGY_CONFIGS[strategy]) {
    strategy = 'balanced'; // Default fallback
  }
  
  try {
    // Step 1: Calculate minimum Foundation allocation (never goes below this)
    const minimumFoundation = calculateMinimumFoundation(financialProfile);
    const foundationAllocation = Math.min(minimumFoundation, availableMonthly * 0.8); // Cap at 80% of available
    
    // Step 2: Calculate remaining funds after Foundation
    const remainingAfterFoundation = Math.max(0, availableMonthly - foundationAllocation);
    
    // Step 3: Calculate Dream allocation based on North Star Dream timeline
    const dreamAllocation = calculateDreamAllocation(financialProfile, remainingAfterFoundation);
    
    // Step 4: Calculate remaining funds after Foundation and Dream
    const remainingAfterDream = Math.max(0, remainingAfterFoundation - dreamAllocation);
    
    // Step 5: Calculate Life allocation for opportunities and emergencies
    const lifeAllocation = calculateLifeAllocation(financialProfile, remainingAfterDream, strategy);
    
    // Step 6: Create base allocations object
    let allocations = {
      foundation: foundationAllocation,
      dream: dreamAllocation,
      life: lifeAllocation
    };
    
    // Step 7: Apply strategy-based adjustments
    allocations = applyStrategyAdjustments(allocations, strategy, availableMonthly);
    
    // Step 8: Ensure Foundation never goes below minimum safe amount
    if (allocations.foundation < minimumFoundation * 0.8) {
      const shortfall = (minimumFoundation * 0.8) - allocations.foundation;
      allocations.foundation = minimumFoundation * 0.8;
      
      // Reduce other allocations proportionally
      const totalOthers = allocations.dream + allocations.life;
      if (totalOthers > 0) {
        const reductionFactor = Math.max(0, (totalOthers - shortfall) / totalOthers);
        allocations.dream *= reductionFactor;
        allocations.life *= reductionFactor;
      }
    }
    
    // Step 9: Final validation and rounding
    const total = allocations.foundation + allocations.dream + allocations.life;
    
    // If total exceeds available, proportionally reduce
    if (total > availableMonthly) {
      const adjustmentFactor = availableMonthly / total;
      allocations.foundation *= adjustmentFactor;
      allocations.dream *= adjustmentFactor;
      allocations.life *= adjustmentFactor;
    }
    
    // Round to nearest cent
    allocations.foundation = Math.round(allocations.foundation * 100) / 100;
    allocations.dream = Math.round(allocations.dream * 100) / 100;
    allocations.life = Math.round(allocations.life * 100) / 100;
    
    // Step 10: Generate recommendations and insights
    const analysis = generateRecommendations(allocations, financialProfile, strategy, availableMonthly);
    
    return {
      ...allocations,
      total: allocations.foundation + allocations.dream + allocations.life,
      strategy,
      percentages: {
        foundation: Math.round((allocations.foundation / availableMonthly) * 100),
        dream: Math.round((allocations.dream / availableMonthly) * 100),
        life: Math.round((allocations.life / availableMonthly) * 100)
      },
      minimumFoundation,
      analysis,
      metadata: {
        calculatedAt: new Date().toISOString(),
        availableMonthly,
        strategyUsed: strategy
      }
    };
    
  } catch (error) {
    console.error('Error in allocateFunds:', error);
    return {
      foundation: 0,
      dream: 0,
      life: 0,
      total: 0,
      error: 'Calculation error occurred',
      details: error.message
    };
  }
}

/**
 * Get strategy configuration details
 * 
 * @param {string} strategy - Strategy name
 * @returns {Object} Strategy configuration object
 */
export function getStrategyConfig(strategy) {
  return STRATEGY_CONFIGS[strategy] || STRATEGY_CONFIGS.balanced;
}

/**
 * Compare allocations across different strategies
 * 
 * @param {number} availableMonthly - Available monthly funds
 * @param {Object} financialProfile - Complete financial profile
 * @returns {Object} Comparison of all three strategies
 */
export function compareStrategies(availableMonthly, financialProfile) {
  const strategies = ['conservative', 'balanced', 'aggressive'];
  const comparison = {};
  
  strategies.forEach(strategy => {
    comparison[strategy] = allocateFunds(availableMonthly, financialProfile, strategy);
  });
  
  return comparison;
}

/**
 * Calculate optimal allocation based on specific goals and constraints
 * 
 * @param {Object} params - Parameters object
 * @param {number} params.availableMonthly - Available monthly funds
 * @param {Object} params.financialProfile - Complete financial profile
 * @param {Object} params.constraints - Specific constraints (min/max allocations)
 * @param {Object} params.goals - Specific goals and priorities
 * @returns {Object} Optimized allocation
 */
export function optimizeAllocation({ availableMonthly, financialProfile, constraints = {}, goals = {} }) {
  // Start with balanced strategy as baseline
  let allocation = allocateFunds(availableMonthly, financialProfile, 'balanced');
  
  // Apply constraints
  if (constraints.minFoundation && allocation.foundation < constraints.minFoundation) {
    const increase = constraints.minFoundation - allocation.foundation;
    allocation.foundation = constraints.minFoundation;
    
    // Reduce other allocations proportionally
    const totalOthers = allocation.dream + allocation.life;
    if (totalOthers > increase) {
      const reductionFactor = (totalOthers - increase) / totalOthers;
      allocation.dream *= reductionFactor;
      allocation.life *= reductionFactor;
    }
  }
  
  if (constraints.maxDream && allocation.dream > constraints.maxDream) {
    const excess = allocation.dream - constraints.maxDream;
    allocation.dream = constraints.maxDream;
    // Redistribute excess to Foundation and Life
    allocation.foundation += excess * 0.7;
    allocation.life += excess * 0.3;
  }
  
  // Apply goal-based adjustments
  if (goals.prioritizeEmergencyFund) {
    const currentEmergencyFund = financialProfile.currentAssets.liquid.total || 0;
    const monthlyExpenses = financialProfile.fixedExpenses.totalFixedExpenses + 
                           financialProfile.variableExpenses.total;
    const emergencyFundMonths = monthlyExpenses > 0 ? currentEmergencyFund / monthlyExpenses : 0;
    
    if (emergencyFundMonths < 6) {
      // Increase Life allocation for emergency fund building
      const emergencyFundBoost = Math.min(availableMonthly * 0.2, allocation.dream * 0.3);
      allocation.life += emergencyFundBoost;
      allocation.dream -= emergencyFundBoost;
    }
  }
  
  if (goals.accelerateDream) {
    // Increase Dream allocation by reducing Life allocation
    const dreamBoost = Math.min(availableMonthly * 0.1, allocation.life * 0.5);
    allocation.dream += dreamBoost;
    allocation.life -= dreamBoost;
  }
  
  // Recalculate totals and percentages
  allocation.total = allocation.foundation + allocation.dream + allocation.life;
  allocation.percentages = {
    foundation: Math.round((allocation.foundation / availableMonthly) * 100),
    dream: Math.round((allocation.dream / availableMonthly) * 100),
    life: Math.round((allocation.life / availableMonthly) * 100)
  };
  
  return allocation;
}

export default {
  allocateFunds,
  getStrategyConfig,
  compareStrategies,
  optimizeAllocation
};
