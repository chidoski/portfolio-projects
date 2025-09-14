/**
 * Projection Engine Service
 * Monte Carlo simulations for someday life achievement probability
 * Presents results as confidence levels with actionable improvement suggestions
 */

/**
 * Market and economic assumptions based on historical data
 */
const MARKET_ASSUMPTIONS = {
  // Stock market returns (S&P 500 historical data)
  stocks: {
    meanReturn: 0.10, // 10% average annual return
    standardDeviation: 0.16, // 16% volatility
    minReturn: -0.40, // Worst case scenario (2008 crisis)
    maxReturn: 0.35 // Best case scenario
  },
  
  // Bond market returns
  bonds: {
    meanReturn: 0.05, // 5% average annual return
    standardDeviation: 0.04, // 4% volatility
    minReturn: -0.10,
    maxReturn: 0.15
  },
  
  // Cash/savings returns
  cash: {
    meanReturn: 0.02, // 2% average (high-yield savings)
    standardDeviation: 0.01, // Very low volatility
    minReturn: 0.001,
    maxReturn: 0.05
  },
  
  // Inflation assumptions
  inflation: {
    meanRate: 0.03, // 3% average inflation
    standardDeviation: 0.015, // 1.5% volatility
    minRate: -0.02, // Deflation scenario
    maxRate: 0.08 // High inflation scenario
  },
  
  // Economic cycle probabilities
  economicCycles: {
    recession: {
      probability: 0.15, // 15% chance per year
      duration: 1.5, // Average 1.5 years
      marketImpact: -0.25 // 25% market decline
    },
    boom: {
      probability: 0.10, // 10% chance per year
      duration: 2, // Average 2 years
      marketImpact: 0.15 // 15% market boost
    }
  }
};

/**
 * Life event probabilities and financial impacts
 */
const LIFE_EVENT_PROBABILITIES = {
  // Career events
  jobLoss: {
    probability: 0.03, // 3% per year
    duration: 6, // 6 months average
    incomeImpact: -1.0, // 100% income loss
    recoveryFactor: 0.95 // 95% of previous income on average
  },
  
  promotion: {
    probability: 0.08, // 8% per year
    incomeBoost: 0.15 // 15% salary increase
  },
  
  careerChange: {
    probability: 0.05, // 5% per year
    incomeImpact: 0.05, // 5% increase on average
    volatility: 0.20 // High variance
  },
  
  // Health events
  majorMedical: {
    probability: 0.02, // 2% per year
    cost: 25000, // Average major medical expense
    volatility: 2.0 // High variance in costs
  },
  
  // Family events
  marriage: {
    probability: 0.03, // 3% per year (if single)
    expenseIncrease: 0.20, // 20% expense increase
    incomeBoost: 0.30 // Dual income benefit
  },
  
  children: {
    probability: 0.05, // 5% per year (if married)
    expenseIncrease: 0.25, // 25% expense increase per child
    duration: 18 // Years of impact
  },
  
  // Property events
  homeRepair: {
    probability: 0.15, // 15% per year (if homeowner)
    cost: 8000, // Average major repair
    volatility: 1.5
  }
};

/**
 * Run Monte Carlo simulation for someday life achievement
 * @param {Object} financialProfile - User's financial profile
 * @param {Object} goals - Someday life goals
 * @param {Object} options - Simulation options
 * @returns {Object} Simulation results with confidence levels and scenarios
 */
export function runSomedayProjection(financialProfile, goals, options = {}) {
  const {
    simulations = 10000,
    yearsToProject = goals.yearsToSomeday || 30,
    includeLifeEvents = true,
    riskTolerance = 'moderate'
  } = options;

  console.log(`Running ${simulations} Monte Carlo simulations...`);
  
  const results = [];
  const scenarios = {
    optimistic: null,
    realistic: null,
    pessimistic: null
  };

  // Run simulations
  for (let i = 0; i < simulations; i++) {
    const simulation = runSingleSimulation(financialProfile, goals, yearsToProject, includeLifeEvents);
    results.push(simulation);
  }

  // Analyze results
  const analysis = analyzeSimulationResults(results, goals);
  
  // Generate scenarios
  scenarios.optimistic = generateScenario(results, 'optimistic', financialProfile, goals);
  scenarios.realistic = generateScenario(results, 'realistic', financialProfile, goals);
  scenarios.pessimistic = generateScenario(results, 'pessimistic', financialProfile, goals);

  // Generate improvement suggestions
  const improvements = generateImprovementSuggestions(analysis, financialProfile, goals);

  return {
    confidenceLevel: analysis.successRate,
    scenarios,
    improvements,
    analysis,
    projectionData: {
      simulations,
      yearsProjected: yearsToProject,
      targetAmount: goals.totalRequired,
      currentAmount: financialProfile.currentAssets
    },
    calculatedAt: new Date().toISOString()
  };
}

/**
 * Run a single Monte Carlo simulation
 * @param {Object} financialProfile - User's financial profile
 * @param {Object} goals - Financial goals
 * @param {number} years - Years to simulate
 * @param {boolean} includeLifeEvents - Whether to include random life events
 * @returns {Object} Single simulation result
 */
function runSingleSimulation(financialProfile, goals, years, includeLifeEvents) {
  let currentAssets = financialProfile.currentAssets;
  let monthlyIncome = financialProfile.monthlyIncome;
  let monthlyExpenses = financialProfile.monthlyExpenses;
  let monthlySavings = financialProfile.monthlySavings;
  
  const yearlyResults = [];
  let lifeEvents = [];

  for (let year = 0; year < years; year++) {
    // Generate market returns for this year
    const marketReturns = generateMarketReturns(financialProfile.assetAllocation);
    
    // Generate inflation for this year
    const inflationRate = generateInflation();
    
    // Apply life events if enabled
    if (includeLifeEvents) {
      const yearEvents = generateLifeEvents(year, financialProfile);
      lifeEvents = [...lifeEvents, ...yearEvents];
      
      // Apply life event impacts
      yearEvents.forEach(event => {
        if (event.incomeImpact) {
          monthlyIncome *= (1 + event.incomeImpact);
        }
        if (event.expenseImpact) {
          monthlyExpenses *= (1 + event.expenseImpact);
        }
        if (event.oneTimeCost) {
          currentAssets -= event.oneTimeCost;
        }
      });
    }

    // Apply inflation to expenses
    monthlyExpenses *= (1 + inflationRate);
    
    // Recalculate monthly savings
    monthlySavings = Math.max(0, monthlyIncome - monthlyExpenses);
    
    // Add monthly savings to assets
    currentAssets += monthlySavings * 12;
    
    // Apply market returns to assets
    currentAssets *= (1 + marketReturns);
    
    // Ensure assets don't go negative
    currentAssets = Math.max(0, currentAssets);

    yearlyResults.push({
      year: year + 1,
      assets: currentAssets,
      income: monthlyIncome * 12,
      expenses: monthlyExpenses * 12,
      savings: monthlySavings * 12,
      marketReturn: marketReturns,
      inflation: inflationRate,
      events: yearEvents
    });
  }

  const finalAssets = currentAssets;
  const targetAchieved = finalAssets >= goals.totalRequired;
  const successMargin = (finalAssets - goals.totalRequired) / goals.totalRequired;

  return {
    success: targetAchieved,
    finalAssets,
    targetAmount: goals.totalRequired,
    successMargin,
    yearlyResults,
    lifeEvents,
    totalReturn: (finalAssets - financialProfile.currentAssets) / financialProfile.currentAssets
  };
}

/**
 * Generate market returns for a given year
 * @param {Object} assetAllocation - Portfolio allocation
 * @returns {number} Annual return rate
 */
function generateMarketReturns(assetAllocation = { stocks: 70, bonds: 20, cash: 10 }) {
  const stockReturn = generateNormalRandom(
    MARKET_ASSUMPTIONS.stocks.meanReturn,
    MARKET_ASSUMPTIONS.stocks.standardDeviation
  );
  
  const bondReturn = generateNormalRandom(
    MARKET_ASSUMPTIONS.bonds.meanReturn,
    MARKET_ASSUMPTIONS.bonds.standardDeviation
  );
  
  const cashReturn = generateNormalRandom(
    MARKET_ASSUMPTIONS.cash.meanReturn,
    MARKET_ASSUMPTIONS.cash.standardDeviation
  );

  // Apply allocation weights
  const portfolioReturn = 
    (stockReturn * assetAllocation.stocks / 100) +
    (bondReturn * assetAllocation.bonds / 100) +
    (cashReturn * assetAllocation.cash / 100);

  // Apply bounds
  return Math.max(-0.50, Math.min(0.50, portfolioReturn));
}

/**
 * Generate inflation rate for a given year
 * @returns {number} Annual inflation rate
 */
function generateInflation() {
  const inflation = generateNormalRandom(
    MARKET_ASSUMPTIONS.inflation.meanRate,
    MARKET_ASSUMPTIONS.inflation.standardDeviation
  );
  
  return Math.max(
    MARKET_ASSUMPTIONS.inflation.minRate,
    Math.min(MARKET_ASSUMPTIONS.inflation.maxRate, inflation)
  );
}

/**
 * Generate random life events for a given year
 * @param {number} year - Current year in simulation
 * @param {Object} profile - User profile
 * @returns {Array} Array of life events for this year
 */
function generateLifeEvents(year, profile) {
  const events = [];
  
  // Check each possible life event
  Object.entries(LIFE_EVENT_PROBABILITIES).forEach(([eventType, eventData]) => {
    if (Math.random() < eventData.probability) {
      const event = {
        type: eventType,
        year: year + 1,
        ...generateEventImpact(eventType, eventData, profile)
      };
      events.push(event);
    }
  });

  return events;
}

/**
 * Generate specific impact for a life event
 * @param {string} eventType - Type of event
 * @param {Object} eventData - Event configuration
 * @param {Object} profile - User profile
 * @returns {Object} Event impact details
 */
function generateEventImpact(eventType, eventData, profile) {
  switch (eventType) {
    case 'jobLoss':
      return {
        name: 'Job Loss',
        description: 'Temporary unemployment period',
        incomeImpact: eventData.incomeImpact,
        duration: eventData.duration,
        severity: 'high',
        category: 'career'
      };
      
    case 'promotion':
      return {
        name: 'Job Promotion',
        description: 'Career advancement with salary increase',
        incomeImpact: eventData.incomeBoost,
        severity: 'positive',
        category: 'career'
      };
      
    case 'majorMedical':
      const cost = eventData.cost * (0.5 + Math.random() * eventData.volatility);
      return {
        name: 'Major Medical Expense',
        description: 'Unexpected health-related costs',
        oneTimeCost: cost,
        severity: 'medium',
        category: 'health'
      };
      
    case 'homeRepair':
      const repairCost = eventData.cost * (0.3 + Math.random() * eventData.volatility);
      return {
        name: 'Home Repair',
        description: 'Major home maintenance expense',
        oneTimeCost: repairCost,
        severity: 'low',
        category: 'housing'
      };
      
    default:
      return {
        name: 'Life Event',
        description: 'Unexpected life change',
        severity: 'medium',
        category: 'other'
      };
  }
}

/**
 * Analyze simulation results to determine success rates and patterns
 * @param {Array} results - Array of simulation results
 * @param {Object} goals - Financial goals
 * @returns {Object} Analysis summary
 */
function analyzeSimulationResults(results, goals) {
  const successfulSimulations = results.filter(r => r.success);
  const successRate = (successfulSimulations.length / results.length) * 100;
  
  // Calculate percentiles for final assets
  const finalAssets = results.map(r => r.finalAssets).sort((a, b) => a - b);
  const percentiles = {
    p10: finalAssets[Math.floor(results.length * 0.1)],
    p25: finalAssets[Math.floor(results.length * 0.25)],
    p50: finalAssets[Math.floor(results.length * 0.5)],
    p75: finalAssets[Math.floor(results.length * 0.75)],
    p90: finalAssets[Math.floor(results.length * 0.9)]
  };

  // Analyze common failure patterns
  const failureAnalysis = analyzeFailurePatterns(results.filter(r => !r.success));
  
  // Calculate average outcomes
  const averages = {
    finalAssets: results.reduce((sum, r) => sum + r.finalAssets, 0) / results.length,
    totalReturn: results.reduce((sum, r) => sum + r.totalReturn, 0) / results.length,
    lifeEventsPerSimulation: results.reduce((sum, r) => sum + r.lifeEvents.length, 0) / results.length
  };

  return {
    successRate,
    percentiles,
    averages,
    failureAnalysis,
    confidenceLevel: getConfidenceLevel(successRate),
    riskFactors: identifyRiskFactors(results)
  };
}

/**
 * Analyze patterns in failed simulations
 * @param {Array} failedResults - Failed simulation results
 * @returns {Object} Failure pattern analysis
 */
function analyzeFailurePatterns(failedResults) {
  if (failedResults.length === 0) {
    return { commonCauses: [], averageShortfall: 0 };
  }

  const commonCauses = [];
  let totalShortfall = 0;
  let earlyFailures = 0;
  let lifeEventFailures = 0;
  let marketCrashFailures = 0;

  failedResults.forEach(result => {
    totalShortfall += Math.abs(result.successMargin);
    
    // Check for early failures (within first 10 years)
    const earlyYears = result.yearlyResults.slice(0, 10);
    if (earlyYears.some(year => year.assets < result.yearlyResults[0].assets * 0.5)) {
      earlyFailures++;
    }
    
    // Check for life event impact
    if (result.lifeEvents.length > 3) {
      lifeEventFailures++;
    }
    
    // Check for market crash impact
    if (result.yearlyResults.some(year => year.marketReturn < -0.20)) {
      marketCrashFailures++;
    }
  });

  if (earlyFailures > failedResults.length * 0.3) {
    commonCauses.push('Early market volatility');
  }
  if (lifeEventFailures > failedResults.length * 0.4) {
    commonCauses.push('Multiple life events');
  }
  if (marketCrashFailures > failedResults.length * 0.5) {
    commonCauses.push('Market downturns');
  }

  return {
    commonCauses,
    averageShortfall: totalShortfall / failedResults.length,
    earlyFailureRate: (earlyFailures / failedResults.length) * 100,
    lifeEventImpact: (lifeEventFailures / failedResults.length) * 100
  };
}

/**
 * Generate specific scenario based on simulation results
 * @param {Array} results - Simulation results
 * @param {string} scenarioType - 'optimistic', 'realistic', or 'pessimistic'
 * @param {Object} profile - Financial profile
 * @param {Object} goals - Financial goals
 * @returns {Object} Scenario details
 */
function generateScenario(results, scenarioType, profile, goals) {
  let percentile, description, assumptions, outcomes;
  
  switch (scenarioType) {
    case 'optimistic':
      percentile = 0.75; // 75th percentile
      description = 'Things go better than expected';
      assumptions = {
        marketReturns: 'Above average market performance (8-12% annually)',
        inflation: 'Low inflation environment (2-3% annually)',
        lifeEvents: 'Minimal unexpected expenses, possible career growth',
        economy: 'Stable economic growth with few recessions'
      };
      break;
      
    case 'realistic':
      percentile = 0.5; // 50th percentile (median)
      description = 'Most likely outcome based on historical patterns';
      assumptions = {
        marketReturns: 'Historical average returns (7-10% annually)',
        inflation: 'Normal inflation levels (3-4% annually)',
        lifeEvents: 'Typical life events (job changes, health expenses)',
        economy: 'Normal economic cycles with occasional downturns'
      };
      break;
      
    case 'pessimistic':
      percentile = 0.25; // 25th percentile
      description = 'Challenging but manageable circumstances';
      assumptions = {
        marketReturns: 'Below average performance (4-7% annually)',
        inflation: 'Higher inflation periods (4-6% annually)',
        lifeEvents: 'More frequent unexpected expenses',
        economy: 'Multiple recessions and slower growth periods'
      };
      break;
  }

  const sortedResults = results.sort((a, b) => a.finalAssets - b.finalAssets);
  const scenarioResult = sortedResults[Math.floor(results.length * percentile)];
  
  outcomes = {
    finalAssets: scenarioResult.finalAssets,
    successProbability: scenarioType === 'optimistic' ? 85 : 
                       scenarioType === 'realistic' ? 65 : 45,
    yearsToGoal: calculateYearsToGoal(scenarioResult, goals),
    monthlyContribution: profile.monthlySavings,
    totalContributions: profile.monthlySavings * 12 * goals.yearsToSomeday,
    investmentGrowth: scenarioResult.finalAssets - (profile.currentAssets + profile.monthlySavings * 12 * goals.yearsToSomeday)
  };

  return {
    type: scenarioType,
    description,
    assumptions,
    outcomes,
    keyInsights: generateScenarioInsights(scenarioType, outcomes, goals),
    actionItems: generateScenarioActions(scenarioType, outcomes, profile)
  };
}

/**
 * Generate improvement suggestions based on analysis
 * @param {Object} analysis - Simulation analysis
 * @param {Object} profile - Financial profile
 * @param {Object} goals - Financial goals
 * @returns {Array} Array of improvement suggestions
 */
function generateImprovementSuggestions(analysis, profile, goals) {
  const suggestions = [];
  
  // Based on success rate
  if (analysis.successRate < 70) {
    suggestions.push({
      category: 'savings',
      priority: 'high',
      title: 'Increase Monthly Savings',
      description: 'Boost your confidence level by saving more each month',
      impact: 'Could improve success rate by 15-25%',
      actions: [
        `Increase monthly savings by $${Math.ceil(profile.monthlySavings * 0.2)}`,
        'Automate savings to make it effortless',
        'Review and reduce non-essential expenses',
        'Consider a side income stream'
      ],
      timeframe: '1-3 months to implement',
      difficulty: 'moderate'
    });
  }

  if (analysis.successRate < 60) {
    suggestions.push({
      category: 'timeline',
      priority: 'medium',
      title: 'Extend Timeline Slightly',
      description: 'Give compound growth more time to work in your favor',
      impact: 'Could improve success rate by 20-30%',
      actions: [
        `Consider extending timeline by 2-3 years`,
        'Use extra time for career growth opportunities',
        'Allow for more conservative withdrawal rates',
        'Reduce pressure on monthly savings requirements'
      ],
      timeframe: 'Immediate adjustment',
      difficulty: 'easy'
    });
  }

  // Risk-based suggestions
  if (analysis.riskFactors.includes('market_volatility')) {
    suggestions.push({
      category: 'risk',
      priority: 'medium',
      title: 'Optimize Asset Allocation',
      description: 'Balance growth potential with stability',
      impact: 'Could reduce volatility by 10-15%',
      actions: [
        'Consider age-appropriate stock/bond allocation',
        'Add international diversification',
        'Include some inflation-protected securities',
        'Rebalance portfolio annually'
      ],
      timeframe: '1-2 months to implement',
      difficulty: 'moderate'
    });
  }

  // Emergency fund suggestion
  if (profile.emergencyFund < profile.monthlyExpenses * 6) {
    suggestions.push({
      category: 'protection',
      priority: 'high',
      title: 'Build Emergency Fund',
      description: 'Protect your long-term savings from unexpected expenses',
      impact: 'Prevents derailing your someday timeline',
      actions: [
        `Build emergency fund to $${Math.ceil(profile.monthlyExpenses * 6)}`,
        'Keep emergency fund in high-yield savings',
        'Separate from investment accounts',
        'Replenish immediately after use'
      ],
      timeframe: '6-12 months',
      difficulty: 'moderate'
    });
  }

  // Income optimization
  suggestions.push({
    category: 'income',
    priority: 'medium',
    title: 'Optimize Income Growth',
    description: 'Accelerate progress through strategic career moves',
    impact: 'Could improve timeline by 3-5 years',
    actions: [
      'Negotiate salary increases annually',
      'Develop high-value skills',
      'Consider career advancement opportunities',
      'Explore passive income streams'
    ],
    timeframe: '6-24 months',
    difficulty: 'challenging'
  });

  return suggestions.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

/**
 * Utility functions
 */

// Generate normally distributed random number (Box-Muller transform)
function generateNormalRandom(mean, stdDev) {
  let u = 0, v = 0;
  while(u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while(v === 0) v = Math.random();
  
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return z * stdDev + mean;
}

// Get confidence level description
function getConfidenceLevel(successRate) {
  if (successRate >= 85) return { level: 'very_high', description: 'Very High Confidence', color: 'green' };
  if (successRate >= 75) return { level: 'high', description: 'High Confidence', color: 'blue' };
  if (successRate >= 65) return { level: 'good', description: 'Good Confidence', color: 'yellow' };
  if (successRate >= 50) return { level: 'moderate', description: 'Moderate Confidence', color: 'orange' };
  return { level: 'needs_improvement', description: 'Needs Improvement', color: 'red' };
}

// Identify key risk factors
function identifyRiskFactors(results) {
  const factors = [];
  
  // Check for market volatility sensitivity
  const volatilityImpact = results.filter(r => 
    r.yearlyResults.some(year => Math.abs(year.marketReturn) > 0.20)
  ).length / results.length;
  
  if (volatilityImpact > 0.3) factors.push('market_volatility');
  
  // Check for inflation sensitivity
  const inflationImpact = results.filter(r =>
    r.yearlyResults.some(year => year.inflation > 0.05)
  ).length / results.length;
  
  if (inflationImpact > 0.2) factors.push('inflation_risk');
  
  // Check for life event sensitivity
  const lifeEventImpact = results.filter(r => r.lifeEvents.length > 2).length / results.length;
  
  if (lifeEventImpact > 0.4) factors.push('life_events');
  
  return factors;
}

// Calculate years to goal for a scenario
function calculateYearsToGoal(result, goals) {
  for (let i = 0; i < result.yearlyResults.length; i++) {
    if (result.yearlyResults[i].assets >= goals.totalRequired) {
      return i + 1;
    }
  }
  return result.yearlyResults.length; // Didn't reach goal within timeframe
}

// Generate scenario-specific insights
function generateScenarioInsights(scenarioType, outcomes, goals) {
  const insights = [];
  
  switch (scenarioType) {
    case 'optimistic':
      insights.push('Market conditions favor long-term investors');
      insights.push('Career growth opportunities accelerate progress');
      insights.push('Compound growth works powerfully in your favor');
      if (outcomes.yearsToGoal < goals.yearsToSomeday) {
        insights.push(`Could reach goal ${goals.yearsToSomeday - outcomes.yearsToGoal} years early`);
      }
      break;
      
    case 'realistic':
      insights.push('Historical patterns suggest this is most likely');
      insights.push('Normal market cycles are factored in');
      insights.push('Typical life events are manageable');
      insights.push('Steady progress toward your someday life');
      break;
      
    case 'pessimistic':
      insights.push('Even in challenging times, progress continues');
      insights.push('Multiple market downturns are survivable');
      insights.push('Emergency fund provides crucial protection');
      insights.push('Patience and persistence pay off long-term');
      break;
  }
  
  return insights;
}

// Generate scenario-specific action items
function generateScenarioActions(scenarioType, outcomes, profile) {
  const actions = [];
  
  switch (scenarioType) {
    case 'optimistic':
      actions.push('Stay the course with current strategy');
      actions.push('Consider increasing savings if income grows');
      actions.push('Rebalance portfolio to maintain target allocation');
      actions.push('Prepare for potential early achievement');
      break;
      
    case 'realistic':
      actions.push('Maintain consistent monthly contributions');
      actions.push('Review progress annually and adjust as needed');
      actions.push('Keep emergency fund well-funded');
      actions.push('Stay disciplined during market volatility');
      break;
      
    case 'pessimistic':
      actions.push('Consider increasing monthly savings by 10-20%');
      actions.push('Build larger emergency fund (8-12 months expenses)');
      actions.push('Diversify income sources when possible');
      actions.push('Focus on reducing unnecessary expenses');
      break;
  }
  
  return actions;
}

/**
 * Generate visualization data for charts and graphs
 * @param {Object} projectionResults - Results from runSomedayProjection
 * @returns {Object} Data formatted for visualization components
 */
export function generateVisualizationData(projectionResults) {
  const { scenarios, analysis } = projectionResults;
  
  // Confidence gauge data
  const confidenceGauge = {
    value: projectionResults.confidenceLevel,
    level: analysis.confidenceLevel.level,
    description: analysis.confidenceLevel.description,
    color: analysis.confidenceLevel.color
  };
  
  // Scenario comparison data
  const scenarioComparison = {
    labels: ['Pessimistic', 'Realistic', 'Optimistic'],
    datasets: [{
      label: 'Final Assets',
      data: [
        scenarios.pessimistic.outcomes.finalAssets,
        scenarios.realistic.outcomes.finalAssets,
        scenarios.optimistic.outcomes.finalAssets
      ],
      backgroundColor: ['#FEF3C7', '#DBEAFE', '#D1FAE5'],
      borderColor: ['#F59E0B', '#3B82F6', '#10B981']
    }]
  };
  
  // Probability distribution data
  const probabilityDistribution = {
    labels: ['10th', '25th', '50th', '75th', '90th'],
    percentiles: [
      analysis.percentiles.p10,
      analysis.percentiles.p25,
      analysis.percentiles.p50,
      analysis.percentiles.p75,
      analysis.percentiles.p90
    ]
  };
  
  return {
    confidenceGauge,
    scenarioComparison,
    probabilityDistribution,
    successRate: projectionResults.confidenceLevel,
    improvements: projectionResults.improvements
  };
}

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format percentage for display
 * @param {number} percentage - Percentage to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(percentage, decimals = 1) {
  return `${percentage.toFixed(decimals)}%`;
}

// Export main functions
export default {
  runSomedayProjection,
  generateVisualizationData,
  formatCurrency,
  formatPercentage
};
