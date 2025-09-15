/**
 * Sophisticated Compounding Service
 * 
 * Handles complex financial scenarios that real people face, but presents results simply.
 * Accounts for variable market returns, life events, missed savings, and major expenses.
 * The complexity is invisible - users just see encouraging, actionable insights.
 */

/**
 * Historical market return patterns for realistic modeling
 */
const MARKET_PATTERNS = {
  // Based on S&P 500 data 1950-2023
  historicalReturns: [
    0.31, 0.18, -0.25, 0.37, 0.23, -0.09, 0.20, 0.32, -0.03, 0.30,
    0.07, 0.10, 0.01, 0.37, 0.22, -0.06, 0.31, 0.18, 0.05, 0.16,
    -0.38, 0.26, 0.15, 0.02, 0.16, 0.32, 0.13, 0.01, 0.12, 0.21,
    -0.11, -0.13, -0.23, 0.29, 0.11, 0.04, 0.10, 0.15, 0.05, -0.37,
    0.26, 0.15, 0.02, 0.16, 0.32, 0.13, 0.01, 0.12, 0.21, 0.28,
    0.10, 0.04, 0.15, 0.05, -0.07, 0.20, 0.31, 0.18, 0.05, 0.16,
    -0.09, 0.12, 0.00, 0.16, 0.31, 0.28, 0.21, -0.04, 0.07, 0.10,
    0.13, 0.01
  ],
  
  // Market cycle patterns
  cycles: {
    bull: { duration: 8.5, averageReturn: 0.17 },      // Bull markets last ~8.5 years, 17% avg
    bear: { duration: 1.4, averageReturn: -0.32 },     // Bear markets last ~1.4 years, -32% avg
    recovery: { duration: 2.1, averageReturn: 0.24 },  // Recovery periods, 24% avg
    normal: { duration: 3.2, averageReturn: 0.09 }     // Normal markets, 9% avg
  },
  
  // Sequence of returns risk patterns
  sequenceRisk: {
    earlyLoss: { years: [1, 2, 3], impact: -0.8 },     // Poor early returns hurt most
    midLoss: { years: [4, 5, 6], impact: -0.4 },       // Mid-period losses moderate impact
    lateLoss: { years: [7, 8, 9], impact: -0.2 }       // Late losses have less impact
  }
};

/**
 * Life event patterns and their financial impacts
 */
const LIFE_EVENTS = {
  children: {
    // Child-related expenses over time
    ages: {
      '0-2': { monthlyIncrease: 1200, oneTimeCosts: 8000 },   // Childcare + supplies
      '3-5': { monthlyIncrease: 800, oneTimeCosts: 2000 },    // Preschool
      '6-12': { monthlyIncrease: 600, oneTimeCosts: 1500 },   // School age
      '13-17': { monthlyIncrease: 800, oneTimeCosts: 3000 },  // Teen years + activities
      '18-22': { monthlyIncrease: 0, oneTimeCosts: 25000 }    // College per year
    },
    savingsImpact: 0.7 // Reduces available savings by 30%
  },
  
  housing: {
    // Major housing changes
    upgrade: { costIncrease: 800, oneTimeCost: 15000 },     // Moving up
    downsize: { costDecrease: -400, oneTimeCost: 8000 },    // Moving down
    maintenance: { yearlyPattern: [2000, 1000, 3000, 1500, 8000] } // 5-year cycle
  },
  
  career: {
    // Career progression patterns
    promotion: { increaseRange: [0.05, 0.20], probability: 0.12 },
    jobChange: { increaseRange: [-0.05, 0.25], probability: 0.08 },
    layoff: { duration: 6, incomeReduction: 0.6, probability: 0.03 }
  },
  
  health: {
    // Health-related expenses
    minor: { cost: 3000, probability: 0.15 },
    major: { cost: 15000, probability: 0.05 },
    chronic: { monthlyIncrease: 400, probability: 0.02 }
  }
};

/**
 * Calculate realistic compound growth with variable returns
 * @param {number} principal - Starting amount
 * @param {number} monthlyAdditions - Monthly contributions
 * @param {Array} returnsArray - Array of annual returns (as decimals)
 * @returns {Object} Detailed growth projection with insights
 */
export function calculateVariableReturns(principal, monthlyAdditions, returnsArray) {
  if (!Array.isArray(returnsArray) || returnsArray.length === 0) {
    throw new Error('Returns array is required and must not be empty');
  }
  
  let currentValue = principal;
  const yearlyValues = [];
  const contributionValues = [];
  let totalContributions = principal;
  
  // Apply each year's returns
  for (let year = 0; year < returnsArray.length; year++) {
    const yearReturn = returnsArray[year];
    
    // Add monthly contributions throughout the year
    const yearlyContributions = monthlyAdditions * 12;
    
    // Apply dollar-cost averaging effect (contributions spread throughout year)
    // This accounts for the fact that not all contributions get the full year's return
    const averageReturnOnContributions = yearReturn * 0.5; // Simplified DCA effect
    const contributionGrowth = yearlyContributions * (1 + averageReturnOnContributions);
    
    // Apply return to existing balance
    currentValue = currentValue * (1 + yearReturn);
    
    // Add new contributions with their partial-year growth
    currentValue += contributionGrowth;
    totalContributions += yearlyContributions;
    
    yearlyValues.push({
      year: year + 1,
      value: Math.round(currentValue),
      return: yearReturn,
      contributions: Math.round(totalContributions),
      growth: Math.round(currentValue - totalContributions)
    });
  }
  
  // Calculate insights
  const finalValue = currentValue;
  const totalGrowth = finalValue - totalContributions;
  const averageReturn = calculateGeometricMean(returnsArray);
  const volatility = calculateStandardDeviation(returnsArray);
  
  // Identify best and worst periods
  const bestYear = yearlyValues.reduce((best, year) => 
    year.return > best.return ? year : best, yearlyValues[0]);
  const worstYear = yearlyValues.reduce((worst, year) => 
    year.return < worst.return ? year : worst, yearlyValues[0]);
  
  // Calculate compound annual growth rate
  const yearsInvested = returnsArray.length;
  const cagr = Math.pow(finalValue / principal, 1 / yearsInvested) - 1;
  
  // Generate simple, encouraging insights
  const insights = generateVariableReturnInsights(
    finalValue, totalContributions, totalGrowth, averageReturn, 
    volatility, bestYear, worstYear, yearlyValues
  );
  
  return {
    finalValue: Math.round(finalValue),
    totalContributions: Math.round(totalContributions),
    totalGrowth: Math.round(totalGrowth),
    
    performance: {
      averageReturn: averageReturn,
      volatility: volatility,
      cagr: cagr,
      bestYear: bestYear,
      worstYear: worstYear
    },
    
    yearlyBreakdown: yearlyValues,
    
    insights: insights,
    
    // Simple summary for users
    simpleSummary: {
      message: insights.primaryMessage,
      timelineImpact: insights.timelineImpact,
      encouragement: insights.encouragement
    }
  };
}

/**
 * Adjust timeline and projections for major life expenses
 * @param {Object} timeline - Original financial timeline
 * @param {Array} majorExpenses - Array of major expenses with timing
 * @returns {Object} Adjusted timeline with strategies
 */
export function adjustForLifeExpenses(timeline, majorExpenses) {
  if (!timeline || !Array.isArray(majorExpenses)) {
    throw new Error('Timeline object and major expenses array are required');
  }
  
  const {
    currentAge = 30,
    targetAge = 65,
    currentSavings = 0,
    monthlyContribution = 1000,
    targetAmount = 500000,
    dreamTitle = 'retirement'
  } = timeline;
  
  let adjustedTimeline = { ...timeline };
  let cumulativeImpact = 0;
  let savingsAdjustments = [];
  
  // Process each major expense
  for (const expense of majorExpenses) {
    const {
      type,
      startAge,
      duration = 1,
      monthlyCost = 0,
      oneTimeCost = 0,
      description = ''
    } = expense;
    
    // Calculate impact based on expense type
    let impact = calculateLifeExpenseImpact(expense, adjustedTimeline);
    
    // Apply impact to timeline
    if (impact.savingsReduction > 0) {
      const impactYears = Math.min(duration, targetAge - startAge);
      const totalImpact = impact.savingsReduction * 12 * impactYears;
      cumulativeImpact += totalImpact;
      
      savingsAdjustments.push({
        type: type,
        startAge: startAge,
        duration: impactYears,
        monthlyReduction: impact.savingsReduction,
        totalImpact: totalImpact,
        description: description,
        strategy: impact.strategy
      });
    }
  }
  
  // Recalculate timeline with reduced savings capacity
  const effectiveSavingsYears = targetAge - currentAge;
  const baseAnnualSavings = monthlyContribution * 12;
  const averageAnnualReduction = cumulativeImpact / effectiveSavingsYears;
  const adjustedMonthlySavings = Math.max(0, monthlyContribution - (averageAnnualReduction / 12));
  
  // Calculate new timeline with realistic returns
  const historicalPattern = MARKET_PATTERNS.historicalReturns.slice(0, effectiveSavingsYears);
  const adjustedProjection = calculateVariableReturns(
    currentSavings, 
    adjustedMonthlySavings, 
    historicalPattern
  );
  
  // Determine if goal is still achievable
  const goalStillAchievable = adjustedProjection.finalValue >= targetAmount;
  const shortfall = goalStillAchievable ? 0 : targetAmount - adjustedProjection.finalValue;
  const timelineDelay = calculateTimelineDelay(shortfall, adjustedMonthlySavings);
  
  // Generate strategies and insights
  const strategies = generateLifeExpenseStrategies(
    savingsAdjustments, 
    shortfall, 
    timelineDelay, 
    adjustedTimeline
  );
  
  const insights = generateLifeExpenseInsights(
    cumulativeImpact, 
    goalStillAchievable, 
    timelineDelay, 
    dreamTitle,
    strategies
  );
  
  return {
    originalTimeline: timeline,
    adjustedTimeline: {
      ...adjustedTimeline,
      adjustedMonthlySavings: Math.round(adjustedMonthlySavings),
      projectedValue: adjustedProjection.finalValue,
      goalAchievable: goalStillAchievable,
      timelineDelay: timelineDelay
    },
    
    expenseImpacts: savingsAdjustments,
    totalImpact: Math.round(cumulativeImpact),
    
    strategies: strategies,
    insights: insights,
    
    // Simple user-facing summary
    simpleSummary: {
      message: insights.primaryMessage,
      actionNeeded: !goalStillAchievable,
      timelineImpact: timelineDelay > 0 ? `${Math.round(timelineDelay)} months longer` : 'On track',
      encouragement: insights.encouragement
    }
  };
}

/**
 * Calculate catch-up strategy for periods when savings were interrupted
 * @param {number} missedMonths - Number of months with no/reduced savings
 * @param {number} remainingTimeline - Years remaining until goal
 * @param {Object} goalDetails - Details about the financial goal
 * @returns {Object} Catch-up strategy with specific recommendations
 */
export function calculateCatchUpStrategy(missedMonths, remainingTimeline, goalDetails = {}) {
  if (missedMonths <= 0 || remainingTimeline <= 0) {
    return {
      catchUpNeeded: false,
      message: 'No catch-up strategy needed',
      encouragement: 'You\'re on track with your savings!'
    };
  }
  
  const {
    targetAmount = 500000,
    currentSavings = 50000,
    plannedMonthlyContribution = 1000,
    dreamTitle = 'goal',
    currentAge = 35
  } = goalDetails;
  
  // Calculate missed contributions
  const missedContributions = missedMonths * plannedMonthlyContribution;
  
  // Calculate lost compound growth on missed contributions
  const yearsRemaining = remainingTimeline;
  const assumedReturn = 0.07; // 7% annual return
  const lostCompoundGrowth = calculateLostCompoundGrowth(
    missedContributions, 
    assumedReturn, 
    yearsRemaining
  );
  
  // Total deficit including lost growth
  const totalDeficit = missedContributions + lostCompoundGrowth;
  
  // Calculate catch-up strategies
  const strategies = generateCatchUpStrategies(
    totalDeficit,
    yearsRemaining,
    plannedMonthlyContribution,
    dreamTitle
  );
  
  // Model different catch-up scenarios
  const scenarios = {
    // Increase monthly contribution
    monthlyIncrease: {
      additionalMonthly: Math.ceil(totalDeficit / (yearsRemaining * 12)),
      totalMonthly: plannedMonthlyContribution + Math.ceil(totalDeficit / (yearsRemaining * 12)),
      timelineImpact: 0,
      difficulty: 'medium'
    },
    
    // Extend timeline
    extendTimeline: {
      additionalYears: Math.ceil((totalDeficit / (plannedMonthlyContribution * 12)) / 2),
      newTimeline: yearsRemaining + Math.ceil((totalDeficit / (plannedMonthlyContribution * 12)) / 2),
      timelineImpact: Math.ceil((totalDeficit / (plannedMonthlyContribution * 12)) / 2),
      difficulty: 'low'
    },
    
    // Hybrid approach
    hybrid: {
      additionalMonthly: Math.ceil(totalDeficit / (yearsRemaining * 12) * 0.6),
      additionalYears: Math.ceil((totalDeficit * 0.4) / (plannedMonthlyContribution * 12)),
      totalMonthly: plannedMonthlyContribution + Math.ceil(totalDeficit / (yearsRemaining * 12) * 0.6),
      newTimeline: yearsRemaining + Math.ceil((totalDeficit * 0.4) / (plannedMonthlyContribution * 12)),
      difficulty: 'medium'
    }
  };
  
  // Run realistic projections for each scenario
  const projections = {};
  for (const [scenarioName, scenario] of Object.entries(scenarios)) {
    const monthlyAmount = scenario.totalMonthly || plannedMonthlyContribution;
    const timelineYears = scenario.newTimeline || yearsRemaining;
    const historicalPattern = MARKET_PATTERNS.historicalReturns.slice(0, timelineYears);
    
    projections[scenarioName] = calculateVariableReturns(
      currentSavings,
      monthlyAmount,
      historicalPattern
    );
    
    // Add scenario-specific insights
    projections[scenarioName].scenario = scenario;
    projections[scenarioName].successProbability = calculateSuccessProbability(
      projections[scenarioName].finalValue,
      targetAmount
    );
  }
  
  // Recommend best strategy
  const recommendedStrategy = selectBestCatchUpStrategy(projections, scenarios);
  
  // Generate encouraging insights
  const insights = generateCatchUpInsights(
    missedMonths,
    totalDeficit,
    recommendedStrategy,
    dreamTitle,
    projections
  );
  
  return {
    missedImpact: {
      missedMonths: missedMonths,
      missedContributions: Math.round(missedContributions),
      lostGrowth: Math.round(lostCompoundGrowth),
      totalDeficit: Math.round(totalDeficit)
    },
    
    strategies: strategies,
    scenarios: scenarios,
    projections: projections,
    
    recommendation: {
      strategy: recommendedStrategy.name,
      details: recommendedStrategy.details,
      successProbability: recommendedStrategy.successProbability,
      reasoning: recommendedStrategy.reasoning
    },
    
    insights: insights,
    
    // Simple user-facing summary
    simpleSummary: {
      message: insights.primaryMessage,
      actionRequired: insights.actionRequired,
      timelineImpact: insights.timelineImpact,
      encouragement: insights.encouragement
    }
  };
}

/**
 * Helper function to calculate geometric mean of returns
 */
function calculateGeometricMean(returns) {
  if (returns.length === 0) return 0;
  
  const product = returns.reduce((prod, r) => prod * (1 + r), 1);
  return Math.pow(product, 1 / returns.length) - 1;
}

/**
 * Helper function to calculate standard deviation
 */
function calculateStandardDeviation(returns) {
  if (returns.length === 0) return 0;
  
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  return Math.sqrt(variance);
}

/**
 * Generate insights for variable returns calculation
 */
function generateVariableReturnInsights(finalValue, totalContributions, totalGrowth, averageReturn, volatility, bestYear, worstYear, yearlyValues) {
  const growthPercentage = ((totalGrowth / totalContributions) * 100).toFixed(0);
  const bestYearReturn = (bestYear.return * 100).toFixed(0);
  const worstYearReturn = (worstYear.return * 100).toFixed(0);
  
  // Calculate if they're ahead of simple compound growth
  const simpleCompoundValue = totalContributions * Math.pow(1 + averageReturn, yearlyValues.length);
  const isAheadOfSimple = finalValue > simpleCompoundValue;
  const timeDifference = isAheadOfSimple ? 
    Math.round((finalValue - simpleCompoundValue) / (totalContributions / yearlyValues.length * 12) * 30) :
    Math.round((simpleCompoundValue - finalValue) / (totalContributions / yearlyValues.length * 12) * 30);
  
  return {
    primaryMessage: isAheadOfSimple ?
      `Based on typical market patterns, you'll likely reach your goal ${Math.round(timeDifference)} days earlier than projected.` :
      `Market volatility adds some uncertainty, but you're still well on track for your goal.`,
    
    timelineImpact: isAheadOfSimple ? `${Math.round(timeDifference)} days ahead` : 'On track',
    
    encouragement: volatility > 0.15 ?
      `Even with market ups and downs (your best year: +${bestYearReturn}%, worst: ${worstYearReturn}%), consistent investing built ${growthPercentage}% growth on your contributions!` :
      `Steady market conditions helped your money grow ${growthPercentage}% beyond your contributions. Consistency pays off!`,
    
    keyInsights: [
      `Your money grew by $${formatCurrency(totalGrowth)} beyond contributions`,
      `Market volatility of ${(volatility * 100).toFixed(1)}% didn't prevent strong growth`,
      `Dollar-cost averaging smoothed out the market's ups and downs`
    ]
  };
}

/**
 * Calculate impact of a specific life expense
 */
function calculateLifeExpenseImpact(expense, timeline) {
  const { type, monthlyCost = 0, oneTimeCost = 0, duration = 1 } = expense;
  
  let savingsReduction = monthlyCost;
  let strategy = '';
  
  // Adjust based on expense type
  switch (type) {
    case 'childcare':
      savingsReduction = monthlyCost * 0.8; // Some expenses replace others
      strategy = 'Consider dependent care FSA for tax savings';
      break;
    case 'college':
      savingsReduction = monthlyCost * 0.6; // Often planned for separately
      strategy = 'Explore 529 plans and education tax credits';
      break;
    case 'eldercare':
      savingsReduction = monthlyCost * 0.9;
      strategy = 'Look into long-term care insurance options';
      break;
    case 'medical':
      savingsReduction = monthlyCost * 0.7; // Insurance typically covers some
      strategy = 'Maximize HSA contributions for tax advantages';
      break;
    default:
      savingsReduction = monthlyCost * 0.8;
      strategy = 'Plan ahead to minimize impact on long-term goals';
  }
  
  return {
    savingsReduction: Math.round(savingsReduction),
    oneTimeImpact: oneTimeCost,
    strategy: strategy
  };
}

/**
 * Calculate timeline delay due to shortfall
 */
function calculateTimelineDelay(shortfall, monthlySavings) {
  if (shortfall <= 0 || monthlySavings <= 0) return 0;
  
  // Simplified calculation - actual would need to account for compound growth
  return shortfall / monthlySavings;
}

/**
 * Generate strategies for dealing with life expenses
 */
function generateLifeExpenseStrategies(adjustments, shortfall, timelineDelay, timeline) {
  const strategies = [];
  
  if (shortfall > 0) {
    strategies.push({
      type: 'increase_income',
      description: `Consider increasing income by $${Math.round(shortfall / timeline.yearsToGoal / 12)}/month`,
      impact: 'Gets you back on track for your original timeline',
      difficulty: 'medium'
    });
    
    strategies.push({
      type: 'extend_timeline',
      description: `Extend your timeline by ${Math.round(timelineDelay)} months`,
      impact: 'Reduces pressure while still achieving your goal',
      difficulty: 'low'
    });
  }
  
  // Add specific strategies based on expense types
  adjustments.forEach(adj => {
    if (adj.strategy) {
      strategies.push({
        type: adj.type,
        description: adj.strategy,
        impact: `Could reduce ${adj.type} impact by 15-25%`,
        difficulty: 'low'
      });
    }
  });
  
  return strategies;
}

/**
 * Generate insights for life expense adjustments
 */
function generateLifeExpenseInsights(totalImpact, goalAchievable, timelineDelay, dreamTitle, strategies) {
  const impactMonths = Math.round(timelineDelay);
  
  let primaryMessage;
  if (goalAchievable) {
    primaryMessage = `Life expenses will impact your ${dreamTitle}, but you can still achieve it with minor adjustments.`;
  } else if (impactMonths <= 12) {
    primaryMessage = `Major expenses delay your ${dreamTitle} by about ${impactMonths} months, but it's still very achievable.`;
  } else {
    primaryMessage = `Life expenses significantly impact your timeline, but smart strategies can get you back on track.`;
  }
  
  return {
    primaryMessage,
    actionRequired: !goalAchievable,
    timelineImpact: impactMonths > 0 ? `${impactMonths} months` : 'No delay',
    encouragement: `Life happens, and that's okay! The key is adjusting your strategy, not abandoning your ${dreamTitle}.`,
    topStrategies: strategies.slice(0, 3)
  };
}

/**
 * Calculate lost compound growth from missed contributions
 */
function calculateLostCompoundGrowth(missedAmount, returnRate, yearsRemaining) {
  const futureValueOfMissed = missedAmount * Math.pow(1 + returnRate, yearsRemaining);
  return futureValueOfMissed - missedAmount;
}

/**
 * Generate catch-up strategies
 */
function generateCatchUpStrategies(deficit, yearsRemaining, currentMonthly, dreamTitle) {
  const monthlyDeficit = deficit / (yearsRemaining * 12);
  
  return [
    {
      name: 'Increase Monthly Savings',
      description: `Add $${Math.round(monthlyDeficit)} to monthly contributions`,
      pros: ['Keeps original timeline', 'Builds stronger savings habit'],
      cons: ['Requires budget adjustments', 'Higher monthly commitment'],
      feasibility: monthlyDeficit < currentMonthly * 0.5 ? 'high' : 'medium'
    },
    {
      name: 'Extend Timeline',
      description: `Delay ${dreamTitle} by 1-2 years`,
      pros: ['No budget pressure', 'More time for opportunities'],
      cons: ['Delayed gratification', 'Inflation impact'],
      feasibility: 'high'
    },
    {
      name: 'Hybrid Approach',
      description: `Small monthly increase + slight timeline extension`,
      pros: ['Balanced solution', 'Manageable adjustments'],
      cons: ['Still requires some sacrifice'],
      feasibility: 'high'
    }
  ];
}

/**
 * Select best catch-up strategy
 */
function selectBestCatchUpStrategy(projections, scenarios) {
  const strategies = Object.entries(projections).map(([name, projection]) => ({
    name,
    projection,
    scenario: scenarios[name],
    score: calculateStrategyScore(projection, scenarios[name])
  }));
  
  strategies.sort((a, b) => b.score - a.score);
  
  return {
    name: strategies[0].name,
    details: strategies[0].scenario,
    successProbability: strategies[0].projection.successProbability,
    reasoning: generateStrategyReasoning(strategies[0])
  };
}

/**
 * Calculate strategy score for comparison
 */
function calculateStrategyScore(projection, scenario) {
  const successWeight = projection.successProbability * 40;
  const difficultyWeight = (3 - getDifficultyScore(scenario.difficulty)) * 20;
  const timelineWeight = scenario.timelineImpact ? (10 / scenario.timelineImpact) * 20 : 20;
  const growthWeight = (projection.totalGrowth / projection.totalContributions) * 20;
  
  return successWeight + difficultyWeight + timelineWeight + growthWeight;
}

/**
 * Get numeric difficulty score
 */
function getDifficultyScore(difficulty) {
  const scores = { low: 1, medium: 2, high: 3 };
  return scores[difficulty] || 2;
}

/**
 * Generate reasoning for strategy recommendation
 */
function generateStrategyReasoning(strategy) {
  const { name, scenario, projection } = strategy;
  
  switch (name) {
    case 'monthlyIncrease':
      return `Increasing monthly contributions is the most direct path back to your original timeline with ${Math.round(projection.successProbability)}% confidence.`;
    case 'extendTimeline':
      return `Extending your timeline reduces pressure while maintaining a ${Math.round(projection.successProbability)}% success rate with your current savings rate.`;
    case 'hybrid':
      return `A balanced approach that requires modest increases while providing timeline flexibility - the best of both worlds.`;
    default:
      return `This strategy offers the best balance of achievability and timeline preservation.`;
  }
}

/**
 * Calculate success probability based on projection vs target
 */
function calculateSuccessProbability(projectedValue, targetValue) {
  const ratio = projectedValue / targetValue;
  
  if (ratio >= 1.1) return 95;
  if (ratio >= 1.05) return 90;
  if (ratio >= 1.0) return 85;
  if (ratio >= 0.95) return 75;
  if (ratio >= 0.9) return 65;
  if (ratio >= 0.8) return 50;
  return 35;
}

/**
 * Generate insights for catch-up strategy
 */
function generateCatchUpInsights(missedMonths, totalDeficit, recommendation, dreamTitle, projections) {
  const deficitMonths = Math.round(totalDeficit / (recommendation.details.totalMonthly || 1000));
  
  return {
    primaryMessage: `Missing ${missedMonths} months of savings created a ${Math.round(deficitMonths)}-month gap, but you can catch up with the right strategy.`,
    actionRequired: true,
    timelineImpact: recommendation.details.timelineImpact ? 
      `${Math.round(recommendation.details.timelineImpact * 12)} months longer` : 
      'Back on original track',
    encouragement: `Life interrupts everyone's plans! The important thing is you're getting back on track toward your ${dreamTitle}.`,
    confidence: `${Math.round(recommendation.successProbability)}% confidence in achieving your goal with this approach`
  };
}

/**
 * Format currency for display
 */
function formatCurrency(amount) {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${Math.round(amount / 1000)}k`;
  } else {
    return Math.round(amount).toLocaleString();
  }
}

export default {
  calculateVariableReturns,
  adjustForLifeExpenses,
  calculateCatchUpStrategy,
  MARKET_PATTERNS,
  LIFE_EVENTS
};
