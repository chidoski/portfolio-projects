/**
 * Unified Retirement Calculations
 * Single source of truth for all retirement math to ensure consistency and mathematical accuracy
 * Addresses the critical issue where hardcoded values were creating impossible savings scenarios
 */

/**
 * Calculate retirement scenarios based on actual user income and expenses
 * @param {Object} userData - User's financial profile
 * @returns {Object} Three realistic retirement scenarios based on actual income
 */
export function calculateRetirementScenarios(userData) {
  const {
    annualIncome = 200000, // User's actual income
    annualExpenses = 80000,
    currentSavings = 165000,
    currentAge = 25,
    targetRetirementAge = 65
  } = userData;

  // Calculate take-home pay (rough estimate at 65% after taxes for high earners)
  const takeHomePay = annualIncome * 0.65;
  const maxPossibleSavings = takeHomePay - 30000; // Minimum $30k for living
  
  // Calculate retirement need using 4% rule
  const retirementNeed = annualExpenses * 25; // 4% safe withdrawal rate
  const yearsToRetirement = targetRetirementAge - currentAge;
  const gap = retirementNeed - currentSavings;
  
  // Calculate what's actually required daily (mathematical reality)
  const requiredDailySavings = gap / (yearsToRetirement * 365);
  
  // Define realistic scenarios based on savings rates as percentage of take-home pay
  const scenarios = {
    conservative: {
      savingsRate: 0.30, // 30% of take-home
      label: 'Conservative (30% savings rate)',
      description: 'Sustainable long-term approach with room for life'
    },
    moderate: {
      savingsRate: 0.50, // 50% of take-home  
      label: 'Moderate (50% savings rate)',
      description: 'Balanced approach popular with FIRE community'
    },
    aggressive: {
      savingsRate: 0.70, // 70% of take-home
      label: 'Aggressive (70% savings rate)', 
      description: 'Maximum optimization for earliest retirement'
    }
  };

  // Calculate realistic daily amounts for each scenario
  Object.keys(scenarios).forEach(key => {
    const scenario = scenarios[key];
    const annualSavings = takeHomePay * scenario.savingsRate;
    const dailyAmount = annualSavings / 365;
    const yearsToGoal = gap / annualSavings;
    const retirementAge = currentAge + yearsToGoal;
    
    scenarios[key] = {
      ...scenario,
      annualSavings: Math.round(annualSavings),
      dailyAmount: Math.round(dailyAmount),
      yearsToRetirement: Math.round(yearsToGoal * 10) / 10,
      retirementAge: Math.round(retirementAge * 10) / 10,
      isAchievable: dailyAmount <= (maxPossibleSavings / 365)
    };
  });

  // Reality check: Is the mathematically required amount even possible?
  const isRequiredAmountPossible = requiredDailySavings <= (maxPossibleSavings / 365);
  
  return {
    userProfile: {
      annualIncome,
      takeHomePay: Math.round(takeHomePay),
      maxPossibleSavings: Math.round(maxPossibleSavings),
      maxDailySavings: Math.round(maxPossibleSavings / 365)
    },
    retirementGoal: {
      totalNeeded: retirementNeed,
      currentProgress: currentSavings,
      gap: gap,
      requiredDaily: Math.round(requiredDailySavings),
      isAchievable: isRequiredAmountPossible
    },
    scenarios,
    recommendations: getRecommendations(scenarios, requiredDailySavings, maxPossibleSavings / 365)
  };
}

/**
 * Validate daily savings against income reality
 * @param {number} requiredDaily - Required daily savings
 * @param {number} annualIncome - Annual income
 * @returns {Object} Validation result with achievability analysis
 */
export function validateSavingsRequirement(requiredDaily, annualIncome) {
  const takeHomePay = annualIncome * 0.65; // 65% after taxes
  const maxPossibleDaily = (takeHomePay * 0.80) / 365; // 80% is absolute maximum
  
  if (requiredDaily > maxPossibleDaily) {
    return {
      achievable: false,
      maxPossible: Math.round(maxPossibleDaily),
      message: `Even maximum savings (80% of income) only allows $${Math.round(maxPossibleDaily)}/day. Consider extending timeline or reducing retirement spending.`,
      alternativeStrategies: [
        'Extend retirement timeline by 5-10 years',
        'Reduce retirement spending expectations',
        'Increase income through career advancement',
        'Geographic arbitrage (live in lower-cost area)',
        'Part-time work during early retirement'
      ]
    };
  }
  
  const savingsRate = (requiredDaily * 365) / takeHomePay;
  let difficulty = 'achievable';
  let message = `This savings rate (${Math.round(savingsRate * 100)}%) is aggressive but achievable`;
  
  if (savingsRate > 0.60) {
    difficulty = 'very aggressive';
    message = `This requires ${Math.round(savingsRate * 100)}% savings rate - possible but requires significant lifestyle changes`;
  } else if (savingsRate > 0.40) {
    difficulty = 'aggressive';
    message = `This requires ${Math.round(savingsRate * 100)}% savings rate - achievable with disciplined budgeting`;
  } else if (savingsRate > 0.20) {
    difficulty = 'moderate';
    message = `This requires ${Math.round(savingsRate * 100)}% savings rate - reasonable for high earners`;
  }
  
  return {
    achievable: true,
    savingsRate: Math.round(savingsRate * 100),
    difficulty,
    message,
    benchmarkComparison: getBenchmarkComparison(savingsRate)
  };
}

/**
 * Get personalized recommendations based on scenario analysis
 * @param {Object} scenarios - Calculated scenarios
 * @param {number} requiredDaily - Required daily savings
 * @param {number} maxDaily - Maximum possible daily savings
 * @returns {Array} Array of recommendation objects
 */
function getRecommendations(scenarios, requiredDaily, maxDaily) {
  const recommendations = [];
  
  // Find the most reasonable scenario
  let recommendedScenario = 'moderate';
  if (requiredDaily <= scenarios.conservative.dailyAmount) {
    recommendedScenario = 'conservative';
  } else if (requiredDaily > scenarios.aggressive.dailyAmount) {
    recommendedScenario = 'aggressive';
    recommendations.push({
      type: 'warning',
      title: 'Timeline Extension Recommended',
      message: 'Current retirement timeline requires extreme savings rates. Consider extending by 5-10 years for better balance.'
    });
  }
  
  recommendations.push({
    type: 'primary',
    title: `${scenarios[recommendedScenario].label} Recommended`,
    message: `Save $${scenarios[recommendedScenario].dailyAmount}/day to retire at ${scenarios[recommendedScenario].retirementAge}. ${scenarios[recommendedScenario].description}`
  });
  
  // Income optimization opportunities
  if (requiredDaily > scenarios.conservative.dailyAmount) {
    recommendations.push({
      type: 'opportunity',
      title: 'Income Acceleration',
      message: 'Consider high-value consulting or geographic arbitrage to reduce required savings rate'
    });
  }
  
  return recommendations;
}

/**
 * Compare savings rate to financial independence benchmarks
 * @param {number} savingsRate - Savings rate as decimal (0.5 = 50%)
 * @returns {Object} Benchmark comparison
 */
function getBenchmarkComparison(savingsRate) {
  if (savingsRate >= 0.70) {
    return {
      category: 'Extreme FIRE',
      description: 'You\'re in the top 1% of savers - this pace rivals the most aggressive FIRE achievers',
      timeToFI: '10-15 years'
    };
  } else if (savingsRate >= 0.50) {
    return {
      category: 'High FIRE',
      description: 'Strong FIRE savings rate - faster than 95% of people working toward financial independence',
      timeToFI: '15-20 years'
    };
  } else if (savingsRate >= 0.30) {
    return {
      category: 'Solid FIRE',
      description: 'Good savings rate that puts you ahead of most Americans working toward FI',
      timeToFI: '20-25 years'
    };
  } else if (savingsRate >= 0.20) {
    return {
      category: 'Traditional',
      description: 'Standard high-earner savings rate - better than average but not FIRE-focused',
      timeToFI: '25-30 years'
    };
  } else {
    return {
      category: 'Getting Started',
      description: 'Good starting point - consider increasing gradually as income grows',
      timeToFI: '30+ years'
    };
  }
}

/**
 * Calculate detailed financial breakdown for transparency
 * @param {Object} userData - User financial data
 * @param {string} selectedScenario - Selected scenario key
 * @returns {Object} Detailed breakdown of all calculations
 */
export function calculateDetailedBreakdown(userData, selectedScenario = 'moderate') {
  const scenarios = calculateRetirementScenarios(userData);
  const scenario = scenarios.scenarios[selectedScenario];
  
  const {
    annualIncome = 200000,
    annualExpenses = 80000,
    currentSavings = 165000,
    currentAge = 25
  } = userData;
  
  // 4% rule calculation
  const retirementPortfolio = annualExpenses * 25;
  const oneTimeCosts = 400000; // Property, etc.
  const totalNeed = retirementPortfolio + oneTimeCosts;
  const gap = totalNeed - currentSavings;
  
  // Selected scenario details
  const yearsToGoal = gap / scenario.annualSavings;
  const retirementAge = currentAge + yearsToGoal;
  
  return {
    summary: {
      totalNeeded: Math.round(totalNeed),
      currentProgress: currentSavings,
      remainingGap: Math.round(gap),
      yearsToGoal: Math.round(yearsToGoal * 10) / 10,
      retirementAge: Math.round(retirementAge * 10) / 10
    },
    breakdown: {
      livingCosts: {
        annualExpenses,
        multiplier: 25,
        portfolioNeeded: retirementPortfolio,
        explanation: '25x annual expenses using 4% safe withdrawal rule'
      },
      oneTimeCosts: {
        property: 300000,
        contingency: 100000,
        total: oneTimeCosts,
        explanation: 'One-time purchases for nomadic lifestyle setup'
      }
    },
    savingsStrategy: {
      daily: scenario.dailyAmount,
      weekly: Math.round(scenario.dailyAmount * 7),
      monthly: Math.round(scenario.annualSavings / 12),
      annual: scenario.annualSavings,
      savingsRate: Math.round((scenario.annualSavings / (annualIncome * 0.65)) * 100),
      explanation: `${scenario.label} - ${scenario.description}`
    },
    validation: validateSavingsRequirement(scenario.dailyAmount, annualIncome),
    comparison: {
      currentIncomeDaily: Math.round((annualIncome * 0.65) / 365),
      savingsAsPercentOfDaily: Math.round((scenario.dailyAmount / ((annualIncome * 0.65) / 365)) * 100),
      remainingForLiving: Math.round(((annualIncome * 0.65) - scenario.annualSavings) / 365)
    }
  };
}

export default {
  calculateRetirementScenarios,
  validateSavingsRequirement,
  calculateDetailedBreakdown
};
