/**
 * Monte Carlo Simulator Service
 * 
 * Runs 1000 scenarios for reaching Someday Life goals but presents results simply.
 * Instead of scary probability distributions, shows three clear outcomes and actionable insights.
 * Never shows complex math, just confidence levels and specific improvement suggestions.
 */

/**
 * Default market assumptions for simulations
 */
const DEFAULT_MARKET_ASSUMPTIONS = {
  // Stock market parameters
  stocks: {
    meanReturn: 0.07,        // 7% average annual return (conservative)
    volatility: 0.15,        // 15% standard deviation
    minReturn: -0.35,        // Worst case scenario
    maxReturn: 0.30          // Best case scenario
  },
  
  // Bond market parameters
  bonds: {
    meanReturn: 0.04,        // 4% average annual return
    volatility: 0.05,        // 5% standard deviation
    minReturn: -0.08,
    maxReturn: 0.12
  },
  
  // Cash/savings parameters
  cash: {
    meanReturn: 0.02,        // 2% high-yield savings
    volatility: 0.005,       // Very stable
    minReturn: 0.001,
    maxReturn: 0.045
  },
  
  // Inflation parameters
  inflation: {
    meanRate: 0.03,          // 3% average inflation
    volatility: 0.015,       // 1.5% standard deviation
    minRate: -0.01,          // Mild deflation
    maxRate: 0.07            // High inflation scenario
  }
};

/**
 * Life event probabilities and impacts
 */
const LIFE_EVENTS = {
  jobLoss: {
    annualProbability: 0.03,   // 3% chance per year
    duration: 6,               // 6 months average
    incomeImpact: -1.0,        // Complete income loss
    recoveryFactor: 0.95       // 95% income recovery
  },
  
  majorExpense: {
    annualProbability: 0.15,   // 15% chance per year
    averageAmount: 8000,       // $8,000 average unexpected expense
    range: [2000, 25000]       // Range of possible expenses
  },
  
  healthIssue: {
    annualProbability: 0.08,   // 8% chance per year
    averageAmount: 12000,      // $12,000 average medical expense
    range: [3000, 50000]
  },
  
  promotion: {
    annualProbability: 0.12,   // 12% chance per year
    incomeBoost: 0.15,         // 15% salary increase
    range: [0.05, 0.30]        // 5-30% increase range
  },
  
  windfall: {
    annualProbability: 0.05,   // 5% chance per year (inheritance, bonus, etc.)
    averageAmount: 15000,
    range: [5000, 75000]
  }
};

/**
 * Generate random number following normal distribution (Box-Muller transform)
 * @param {number} mean - Mean value
 * @param {number} stdDev - Standard deviation
 * @returns {number} Random number from normal distribution
 */
function normalRandom(mean, stdDev) {
  let u = 0, v = 0;
  while(u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while(v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdDev + mean;
}

/**
 * Generate random market return for a given asset class
 * @param {Object} assetParams - Asset parameters (meanReturn, volatility, etc.)
 * @returns {number} Annual return for this scenario
 */
function generateMarketReturn(assetParams) {
  const { meanReturn, volatility, minReturn, maxReturn } = assetParams;
  let randomReturn = normalRandom(meanReturn, volatility);
  
  // Cap returns at realistic bounds
  randomReturn = Math.max(minReturn, Math.min(maxReturn, randomReturn));
  return randomReturn;
}

/**
 * Generate life events for a given year
 * @param {Object} financialProfile - User's financial profile
 * @param {number} currentIncome - Current annual income
 * @returns {Array} Array of life events that occurred this year
 */
function generateLifeEvents(financialProfile, currentIncome) {
  const events = [];
  
  // Check each possible life event
  for (const [eventType, eventData] of Object.entries(LIFE_EVENTS)) {
    if (Math.random() < eventData.annualProbability) {
      let event = { type: eventType };
      
      switch (eventType) {
        case 'jobLoss':
          event.duration = Math.floor(normalRandom(eventData.duration, 2));
          event.incomeImpact = eventData.incomeImpact;
          event.recoveryFactor = eventData.recoveryFactor;
          break;
          
        case 'majorExpense':
        case 'healthIssue':
          const [min, max] = eventData.range;
          event.amount = Math.random() * (max - min) + min;
          break;
          
        case 'promotion':
          const [minBoost, maxBoost] = eventData.range;
          event.incomeBoost = Math.random() * (maxBoost - minBoost) + minBoost;
          break;
          
        case 'windfall':
          const [minWind, maxWind] = eventData.range;
          event.amount = Math.random() * (maxWind - minWind) + minWind;
          break;
      }
      
      events.push(event);
    }
  }
  
  return events;
}

/**
 * Run a single Monte Carlo scenario
 * @param {Object} financialProfile - User's financial profile
 * @param {Object} marketAssumptions - Market return assumptions
 * @returns {Object} Scenario result
 */
function runSingleScenario(financialProfile, marketAssumptions) {
  const {
    userProfile,
    currentAssets,
    northStarDream,
    fixedExpenses,
    variableExpenses
  } = financialProfile;
  
  const currentAge = userProfile.age;
  const targetAge = northStarDream.targetAge;
  const yearsToGoal = targetAge - currentAge;
  const targetNetWorth = northStarDream.targetNetWorth;
  
  // Starting values
  let currentNetWorth = currentAssets.totalAssets;
  let currentIncome = userProfile.income.gross.annual;
  let monthlyExpenses = fixedExpenses.totalFixedExpenses + variableExpenses.total;
  let monthlySavings = (currentIncome / 12) - monthlyExpenses;
  
  // Asset allocation (simplified)
  const assetAllocation = northStarDream.investmentStrategy.assetAllocation;
  const stocksPercent = assetAllocation.stocks / 100;
  const bondsPercent = assetAllocation.bonds / 100;
  const cashPercent = (assetAllocation.cash + assetAllocation.realEstate) / 100;
  
  let temporaryIncomeReduction = 0; // For job loss scenarios
  let temporaryReductionDuration = 0;
  
  // Run simulation year by year
  for (let year = 0; year < yearsToGoal; year++) {
    // Generate market returns
    const stockReturn = generateMarketReturn(marketAssumptions.stocks);
    const bondReturn = generateMarketReturn(marketAssumptions.bonds);
    const cashReturn = generateMarketReturn(marketAssumptions.cash);
    const inflationRate = generateMarketReturn(marketAssumptions.inflation);
    
    // Calculate portfolio return
    const portfolioReturn = (stockReturn * stocksPercent) + 
                           (bondReturn * bondsPercent) + 
                           (cashReturn * cashPercent);
    
    // Apply market returns to existing assets
    currentNetWorth *= (1 + portfolioReturn);
    
    // Handle ongoing job loss
    let adjustedIncome = currentIncome;
    if (temporaryReductionDuration > 0) {
      adjustedIncome *= (1 + temporaryIncomeReduction);
      temporaryReductionDuration--;
      
      // Recovery
      if (temporaryReductionDuration === 0) {
        currentIncome *= LIFE_EVENTS.jobLoss.recoveryFactor;
        temporaryIncomeReduction = 0;
      }
    }
    
    // Generate life events
    const lifeEvents = generateLifeEvents(financialProfile, adjustedIncome);
    
    // Apply life events
    for (const event of lifeEvents) {
      switch (event.type) {
        case 'jobLoss':
          temporaryIncomeReduction = event.incomeImpact;
          temporaryReductionDuration = event.duration / 12; // Convert months to fraction of year
          break;
          
        case 'majorExpense':
        case 'healthIssue':
          currentNetWorth -= event.amount;
          break;
          
        case 'promotion':
          currentIncome *= (1 + event.incomeBoost);
          break;
          
        case 'windfall':
          currentNetWorth += event.amount;
          break;
      }
    }
    
    // Adjust expenses for inflation
    monthlyExpenses *= (1 + inflationRate);
    
    // Calculate new monthly savings based on adjusted income and expenses
    monthlySavings = (adjustedIncome / 12) - monthlyExpenses;
    
    // Add annual savings to net worth (if positive)
    if (monthlySavings > 0) {
      const annualSavings = monthlySavings * 12;
      currentNetWorth += annualSavings;
    } else {
      // If expenses exceed income, reduce net worth
      currentNetWorth += monthlySavings * 12; // This will be negative
    }
    
    // Ensure net worth doesn't go negative (bankruptcy protection)
    currentNetWorth = Math.max(0, currentNetWorth);
  }
  
  // Check if goal was achieved
  const goalAchieved = currentNetWorth >= targetNetWorth;
  const shortfall = goalAchieved ? 0 : targetNetWorth - currentNetWorth;
  const surplus = goalAchieved ? currentNetWorth - targetNetWorth : 0;
  
  return {
    goalAchieved,
    finalNetWorth: currentNetWorth,
    targetNetWorth,
    shortfall,
    surplus,
    shortfallPercentage: targetNetWorth > 0 ? (shortfall / targetNetWorth) * 100 : 0
  };
}

/**
 * Run Monte Carlo simulation with 1000 scenarios
 * @param {Object} financialProfile - User's complete financial profile
 * @param {Object} marketAssumptions - Optional market assumptions (uses defaults if not provided)
 * @returns {Object} Simple, actionable simulation results
 */
export function runSimulation(financialProfile, marketAssumptions = DEFAULT_MARKET_ASSUMPTIONS) {
  const numScenarios = 1000;
  const results = [];
  
  // Validate inputs
  if (!financialProfile || !financialProfile.northStarDream) {
    throw new Error('Financial profile with North Star Dream is required');
  }
  
  // Run 1000 scenarios
  for (let i = 0; i < numScenarios; i++) {
    const scenarioResult = runSingleScenario(financialProfile, marketAssumptions);
    results.push(scenarioResult);
  }
  
  // Calculate success rate
  const successfulScenarios = results.filter(r => r.goalAchieved).length;
  const successRate = (successfulScenarios / numScenarios) * 100;
  
  // Calculate statistics for failed scenarios
  const failedScenarios = results.filter(r => !r.goalAchieved);
  const averageShortfall = failedScenarios.length > 0 ? 
    failedScenarios.reduce((sum, r) => sum + r.shortfall, 0) / failedScenarios.length : 0;
  
  // Calculate statistics for successful scenarios
  const successfulScenariosData = results.filter(r => r.goalAchieved);
  const averageSurplus = successfulScenariosData.length > 0 ?
    successfulScenariosData.reduce((sum, r) => sum + r.surplus, 0) / successfulScenariosData.length : 0;
  
  // Determine confidence level
  let confidenceLevel;
  let confidenceMessage;
  let confidenceColor;
  
  if (successRate >= 80) {
    confidenceLevel = 'Highly Likely';
    confidenceMessage = `Excellent! You're on track to achieve your ${financialProfile.northStarDream.title} in ${Math.round(successRate)}% of scenarios. Keep up the great work!`;
    confidenceColor = 'green';
  } else if (successRate >= 50) {
    confidenceLevel = 'Good Chances';
    confidenceMessage = `You're doing well! Your ${financialProfile.northStarDream.title} succeeds in ${Math.round(successRate)}% of scenarios. A few small adjustments could really boost your odds.`;
    confidenceColor = 'yellow';
  } else {
    confidenceLevel = 'Needs Adjustment';
    confidenceMessage = `Your ${financialProfile.northStarDream.title} needs some fine-tuning. Currently succeeding in ${Math.round(successRate)}% of scenarios, but we can definitely improve these odds together!`;
    confidenceColor = 'red';
  }
  
  // Format currency for display
  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${Math.round(amount / 1000)}k`;
    } else {
      return `$${Math.round(amount).toLocaleString()}`;
    }
  };
  
  return {
    // Simple outcome classification
    outcome: {
      level: confidenceLevel,
      successRate: Math.round(successRate),
      message: confidenceMessage,
      color: confidenceColor
    },
    
    // Key insights without scary math
    insights: {
      targetAmount: formatCurrency(financialProfile.northStarDream.targetNetWorth),
      yearsToGoal: financialProfile.northStarDream.yearsToGoal,
      averageShortfall: averageShortfall > 0 ? formatCurrency(averageShortfall) : null,
      averageSurplus: averageSurplus > 0 ? formatCurrency(averageSurplus) : null,
      dreamTitle: financialProfile.northStarDream.title
    },
    
    // Encouraging context
    positiveFraming: {
      scenariosSucceeded: successfulScenarios,
      totalScenarios: numScenarios,
      confidenceDescription: getConfidenceDescription(successRate),
      motivationalMessage: getMotivationalMessage(successRate, financialProfile.northStarDream.title)
    },
    
    // Raw data for improvement suggestions (internal use)
    _rawData: {
      successRate,
      averageShortfall,
      averageSurplus,
      results: results.slice(0, 10) // Store sample results for analysis
    }
  };
}

/**
 * Get improvement suggestions based on simulation results
 * @param {Object} simulationResults - Results from runSimulation
 * @param {Object} financialProfile - User's financial profile
 * @returns {Array} Specific, actionable improvement suggestions
 */
export function getImprovementSuggestions(simulationResults, financialProfile) {
  const { successRate, averageShortfall } = simulationResults._rawData;
  const currentIncome = financialProfile.userProfile.income.gross.annual;
  const monthlyIncome = currentIncome / 12;
  const yearsToGoal = financialProfile.northStarDream.yearsToGoal;
  const dreamTitle = financialProfile.northStarDream.title;
  
  const suggestions = [];
  
  // Calculate current monthly surplus/deficit
  const monthlyExpenses = financialProfile.fixedExpenses.totalFixedExpenses + 
                         financialProfile.variableExpenses.total;
  const currentMonthlySavings = monthlyIncome - monthlyExpenses;
  
  // Suggestion 1: Increase monthly savings
  if (successRate < 80) {
    const monthlyShortfall = averageShortfall / (yearsToGoal * 12);
    const suggestedIncrease = Math.ceil(monthlyShortfall / 10) * 10; // Round to nearest $10
    
    // Run quick simulation to estimate impact
    const estimatedNewSuccessRate = Math.min(95, successRate + (suggestedIncrease / 50) * 8);
    
    suggestions.push({
      type: 'increase_savings',
      title: 'Boost Your Monthly Savings',
      action: `Add $${suggestedIncrease} to your monthly savings`,
      impact: `Increases your success rate from ${Math.round(successRate)}% to approximately ${Math.round(estimatedNewSuccessRate)}%`,
      difficulty: 'medium',
      timeframe: 'immediate',
      explanation: `This small increase would significantly improve your odds of reaching your ${dreamTitle}. Even an extra $${suggestedIncrease}/month compounds to serious money over ${yearsToGoal} years!`,
      priority: 'high'
    });
  }
  
  // Suggestion 2: Reduce monthly expenses
  if (currentMonthlySavings < monthlyIncome * 0.2) { // Less than 20% savings rate
    const expenseReduction = Math.ceil(monthlyExpenses * 0.1 / 50) * 50; // 10% expense reduction, rounded
    const newSuccessRate = Math.min(95, successRate + (expenseReduction / 100) * 12);
    
    suggestions.push({
      type: 'reduce_expenses',
      title: 'Optimize Your Monthly Spending',
      action: `Find ways to reduce monthly expenses by $${expenseReduction}`,
      impact: `Could improve your success rate from ${Math.round(successRate)}% to about ${Math.round(newSuccessRate)}%`,
      difficulty: 'medium',
      timeframe: 'next 3 months',
      explanation: `Reducing expenses has the same impact as earning more money, but you get to keep it all! Small cuts across multiple categories add up to big progress toward your ${dreamTitle}.`,
      priority: 'high'
    });
  }
  
  // Suggestion 3: Increase income
  const incomeIncrease = Math.ceil(currentIncome * 0.1); // 10% income increase
  const monthlyIncomeIncrease = incomeIncrease / 12;
  const incomeImpactSuccessRate = Math.min(95, successRate + (monthlyIncomeIncrease / 200) * 15);
  
  suggestions.push({
    type: 'increase_income',
    title: 'Grow Your Earning Power',
    action: `Work toward a ${Math.round((incomeIncrease / currentIncome) * 100)}% income increase (about $${Math.round(incomeIncrease).toLocaleString()}/year)`,
    impact: `Could boost your success rate from ${Math.round(successRate)}% to approximately ${Math.round(incomeImpactSuccessRate)}%`,
    difficulty: 'high',
    timeframe: '6-18 months',
    explanation: `A promotion, job change, or side hustle earning $${Math.round(monthlyIncomeIncrease).toLocaleString()}/month would dramatically accelerate your path to ${dreamTitle}. Your skills are your best investment!`,
    priority: 'medium'
  });
  
  // Suggestion 4: Optimize investment allocation
  const currentStockAllocation = financialProfile.northStarDream.investmentStrategy.assetAllocation.stocks;
  if (currentStockAllocation < 70 && yearsToGoal > 10) {
    suggestions.push({
      type: 'optimize_allocation',
      title: 'Optimize Your Investment Mix',
      action: `Consider increasing stock allocation from ${currentStockAllocation}% to 70-80%`,
      impact: `Could improve long-term returns and increase success rate by 5-12%`,
      difficulty: 'low',
      timeframe: 'immediate',
      explanation: `With ${yearsToGoal} years until your ${dreamTitle}, you have time to ride out market volatility. A more aggressive allocation could significantly boost your results.`,
      priority: 'medium'
    });
  }
  
  // Suggestion 5: Build emergency fund
  const emergencyFund = financialProfile.currentAssets.liquid.total;
  const monthlyExpensesTotal = monthlyExpenses;
  const emergencyFundMonths = emergencyFund / monthlyExpensesTotal;
  
  if (emergencyFundMonths < 3) {
    suggestions.push({
      type: 'emergency_fund',
      title: 'Strengthen Your Safety Net',
      action: `Build emergency fund to 3-6 months of expenses (about $${Math.round(monthlyExpensesTotal * 3).toLocaleString()})`,
      impact: `Protects your ${dreamTitle} savings from unexpected expenses`,
      difficulty: 'medium',
      timeframe: '6-12 months',
      explanation: `A solid emergency fund means you won't have to raid your ${dreamTitle} savings when life throws curveballs. It's like insurance for your dreams!`,
      priority: 'high'
    });
  }
  
  // Suggestion 6: Delay goal if severely behind
  if (successRate < 30) {
    const delayedYears = yearsToGoal + 3;
    const delayedSuccessRate = Math.min(85, successRate + 25);
    
    suggestions.push({
      type: 'extend_timeline',
      title: 'Consider Extending Your Timeline',
      action: `Delay your ${dreamTitle} by 3 years (to age ${financialProfile.userProfile.age + delayedYears})`,
      impact: `Could improve success rate from ${Math.round(successRate)}% to about ${Math.round(delayedSuccessRate)}%`,
      difficulty: 'low',
      timeframe: 'planning decision',
      explanation: `Sometimes the best gift you can give your future self is more time. Three extra years of growth and savings could make your ${dreamTitle} much more achievable.`,
      priority: 'low'
    });
  }
  
  // Sort suggestions by priority and potential impact
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  suggestions.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
  
  return suggestions.slice(0, 4); // Return top 4 suggestions
}

/**
 * Get confidence description based on success rate
 * @param {number} successRate - Success rate percentage
 * @returns {string} Human-friendly confidence description
 */
function getConfidenceDescription(successRate) {
  if (successRate >= 85) {
    return "Your financial plan is rock solid! You're prepared for almost any scenario life throws at you.";
  } else if (successRate >= 70) {
    return "You're in great shape! Your plan succeeds in most realistic scenarios.";
  } else if (successRate >= 50) {
    return "You're on the right track! A few tweaks could really boost your confidence level.";
  } else if (successRate >= 30) {
    return "Your foundation is good, but some adjustments would help ensure success.";
  } else {
    return "Let's work together to strengthen your plan and improve these odds!";
  }
}

/**
 * Get motivational message based on success rate
 * @param {number} successRate - Success rate percentage
 * @param {string} dreamTitle - User's dream title
 * @returns {string} Encouraging message
 */
function getMotivationalMessage(successRate, dreamTitle) {
  if (successRate >= 80) {
    return `Your ${dreamTitle} isn't just a dream anymore - it's a plan that's working! Keep up the fantastic momentum.`;
  } else if (successRate >= 60) {
    return `You're closer to your ${dreamTitle} than you might think! Small improvements will make a big difference.`;
  } else if (successRate >= 40) {
    return `Your ${dreamTitle} is absolutely achievable! We just need to fine-tune a few things to boost your odds.`;
  } else {
    return `Every great ${dreamTitle} starts with a first step, and you've taken that step! Now let's build a stronger path forward.`;
  }
}

/**
 * Run a quick sensitivity analysis to show impact of specific changes
 * @param {Object} financialProfile - User's financial profile
 * @param {Object} changes - Proposed changes to test
 * @returns {Object} Before/after comparison
 */
export function testScenarioChanges(financialProfile, changes = {}) {
  // Create modified profile
  const modifiedProfile = JSON.parse(JSON.stringify(financialProfile));
  
  // Apply changes
  if (changes.monthlyIncrease) {
    const currentSavings = modifiedProfile.userProfile.income.gross.annual / 12 - 
                          modifiedProfile.fixedExpenses.totalFixedExpenses - 
                          modifiedProfile.variableExpenses.total;
    modifiedProfile.userProfile.income.gross.annual += changes.monthlyIncrease * 12;
  }
  
  if (changes.expenseReduction) {
    modifiedProfile.fixedExpenses.totalFixedExpenses -= changes.expenseReduction;
  }
  
  if (changes.timelineExtension) {
    modifiedProfile.northStarDream.targetAge += changes.timelineExtension;
    modifiedProfile.northStarDream.yearsToGoal += changes.timelineExtension;
  }
  
  // Run simulations
  const originalResults = runSimulation(financialProfile);
  const modifiedResults = runSimulation(modifiedProfile);
  
  return {
    original: {
      successRate: originalResults.outcome.successRate,
      outcome: originalResults.outcome.level
    },
    modified: {
      successRate: modifiedResults.outcome.successRate,
      outcome: modifiedResults.outcome.level
    },
    improvement: {
      successRateChange: modifiedResults.outcome.successRate - originalResults.outcome.successRate,
      outcomeImproved: modifiedResults.outcome.level !== originalResults.outcome.level
    }
  };
}

export default {
  runSimulation,
  getImprovementSuggestions,
  testScenarioChanges,
  DEFAULT_MARKET_ASSUMPTIONS
};
