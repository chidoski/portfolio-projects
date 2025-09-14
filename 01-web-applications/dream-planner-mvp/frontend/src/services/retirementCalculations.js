/**
 * Retirement Calculations Service
 * Provides comprehensive retirement planning calculations including portfolio sizing,
 * inflation adjustments, and lifestyle cost analysis
 */

/**
 * Financial constants used in retirement calculations
 */
const FINANCIAL_CONSTANTS = {
  SAFE_WITHDRAWAL_RATE: 0.04, // 4% safe withdrawal rule
  DEFAULT_INFLATION_RATE: 0.03, // 3% annual inflation
  DEFAULT_INVESTMENT_RETURN: 0.07, // 7% annual investment return
  CONSERVATIVE_RETURN: 0.05, // 5% conservative investment return
  AGGRESSIVE_RETURN: 0.09, // 9% aggressive investment return
  MONTHS_PER_YEAR: 12
};

/**
 * Calculate the total retirement portfolio needed using the 4% safe withdrawal rule
 * @param {number} annualExpenses - Current annual living expenses
 * @param {number} yearsUntilRetirement - Years until retirement begins
 * @param {number} expectedRetirementLength - Expected years in retirement (default: 30)
 * @param {number} inflationRate - Annual inflation rate (default: 3%)
 * @param {number} currentAge - Current age for timeline calculations
 * @param {number} currentSavings - Current retirement savings (default: 0)
 * @returns {Object} Comprehensive retirement calculation results
 */
export function calculateTotalRetirementNeed(
  annualExpenses,
  yearsUntilRetirement,
  expectedRetirementLength = 30,
  inflationRate = FINANCIAL_CONSTANTS.DEFAULT_INFLATION_RATE,
  currentAge = null,
  currentSavings = 0
) {
  // Validate inputs
  if (annualExpenses <= 0) {
    throw new Error('Annual expenses must be greater than 0');
  }
  if (yearsUntilRetirement <= 0) {
    throw new Error('Years until retirement must be greater than 0');
  }
  if (expectedRetirementLength <= 0) {
    throw new Error('Expected retirement length must be greater than 0');
  }

  // Calculate inflation-adjusted annual expenses at retirement
  const futureAnnualExpenses = annualExpenses * Math.pow(1 + inflationRate, yearsUntilRetirement);

  // Calculate required portfolio size using 4% safe withdrawal rule
  const requiredPortfolioSize = futureAnnualExpenses / FINANCIAL_CONSTANTS.SAFE_WITHDRAWAL_RATE;

  // Calculate net amount needed (accounting for current savings growth)
  const futureValueCurrentSavings = currentSavings * Math.pow(
    1 + FINANCIAL_CONSTANTS.DEFAULT_INVESTMENT_RETURN, 
    yearsUntilRetirement
  );
  const netAmountNeeded = Math.max(0, requiredPortfolioSize - futureValueCurrentSavings);

  // Calculate monthly savings needed for three different strategies
  const savingsStrategies = calculateSavingsStrategies(
    netAmountNeeded,
    yearsUntilRetirement,
    currentSavings
  );

  // Calculate retirement timeline
  const retirementAge = currentAge ? currentAge + yearsUntilRetirement : null;
  const endOfRetirementAge = retirementAge ? retirementAge + expectedRetirementLength : null;

  // Calculate total retirement cost (portfolio + lifestyle assets)
  const totalRetirementCost = requiredPortfolioSize;

  // Calculate purchasing power analysis
  const purchasingPowerAnalysis = calculatePurchasingPowerAnalysis(
    annualExpenses,
    futureAnnualExpenses,
    yearsUntilRetirement,
    inflationRate
  );

  // Calculate withdrawal schedule
  const withdrawalSchedule = calculateWithdrawalSchedule(
    requiredPortfolioSize,
    futureAnnualExpenses,
    expectedRetirementLength,
    inflationRate
  );

  return {
    // Core calculations
    currentAnnualExpenses: Math.round(annualExpenses),
    futureAnnualExpenses: Math.round(futureAnnualExpenses),
    requiredPortfolioSize: Math.round(requiredPortfolioSize),
    netAmountNeeded: Math.round(netAmountNeeded),
    
    // Current savings analysis
    currentSavings: Math.round(currentSavings),
    futureValueCurrentSavings: Math.round(futureValueCurrentSavings),
    savingsGapPercentage: currentSavings > 0 ? 
      Math.round(((netAmountNeeded / requiredPortfolioSize) * 100) * 100) / 100 : 100,
    
    // Savings strategies
    savingsStrategies,
    
    // Timeline information
    yearsUntilRetirement,
    expectedRetirementLength,
    retirementAge,
    endOfRetirementAge,
    currentAge,
    
    // Financial assumptions
    inflationRate: inflationRate * 100, // Convert to percentage
    safeWithdrawalRate: FINANCIAL_CONSTANTS.SAFE_WITHDRAWAL_RATE * 100,
    
    // Analysis
    purchasingPowerAnalysis,
    withdrawalSchedule,
    
    // Summary metrics
    totalRetirementCost: Math.round(totalRetirementCost),
    inflationImpact: Math.round(futureAnnualExpenses - annualExpenses),
    yearsOfExpensesCovered: Math.round(requiredPortfolioSize / futureAnnualExpenses),
    
    // Validation
    isAchievable: netAmountNeeded <= (savingsStrategies.aggressive.monthlySavings * 12 * yearsUntilRetirement * 2),
    
    // Metadata
    calculatedAt: new Date().toISOString(),
    assumptions: {
      safeWithdrawalRate: FINANCIAL_CONSTANTS.SAFE_WITHDRAWAL_RATE,
      inflationRate,
      investmentReturn: FINANCIAL_CONSTANTS.DEFAULT_INVESTMENT_RETURN,
      expectedRetirementLength
    }
  };
}

/**
 * Calculate different savings strategies to reach retirement goal
 * @param {number} targetAmount - Amount needed to save
 * @param {number} yearsToSave - Years available to save
 * @param {number} currentSavings - Current savings amount
 * @returns {Object} Three savings strategies with different risk/return profiles
 */
function calculateSavingsStrategies(targetAmount, yearsToSave, currentSavings = 0) {
  const strategies = {
    conservative: {
      name: 'Conservative',
      description: 'Lower risk, steady growth with bonds and stable investments',
      expectedReturn: FINANCIAL_CONSTANTS.CONSERVATIVE_RETURN,
      riskLevel: 'Low',
      assetAllocation: { stocks: 30, bonds: 60, cash: 10 }
    },
    balanced: {
      name: 'Balanced',
      description: 'Moderate risk with diversified stock and bond portfolio',
      expectedReturn: FINANCIAL_CONSTANTS.DEFAULT_INVESTMENT_RETURN,
      riskLevel: 'Medium',
      assetAllocation: { stocks: 60, bonds: 30, cash: 10 }
    },
    aggressive: {
      name: 'Aggressive',
      description: 'Higher risk, higher potential returns with stock-heavy portfolio',
      expectedReturn: FINANCIAL_CONSTANTS.AGGRESSIVE_RETURN,
      riskLevel: 'High',
      assetAllocation: { stocks: 80, bonds: 15, cash: 5 }
    }
  };

  // Calculate monthly savings needed for each strategy
  Object.keys(strategies).forEach(strategyKey => {
    const strategy = strategies[strategyKey];
    const monthlyReturn = strategy.expectedReturn / FINANCIAL_CONSTANTS.MONTHS_PER_YEAR;
    const totalMonths = yearsToSave * FINANCIAL_CONSTANTS.MONTHS_PER_YEAR;
    
    // Future value of current savings
    const futureCurrentSavings = currentSavings * Math.pow(1 + strategy.expectedReturn, yearsToSave);
    
    // Net amount needed after current savings growth
    const netNeeded = Math.max(0, targetAmount - futureCurrentSavings);
    
    // Calculate monthly payment needed using future value of annuity formula
    let monthlySavings = 0;
    if (netNeeded > 0 && monthlyReturn > 0) {
      // PMT = FV * r / ((1 + r)^n - 1)
      const denominator = Math.pow(1 + monthlyReturn, totalMonths) - 1;
      monthlySavings = netNeeded * monthlyReturn / denominator;
    } else if (netNeeded > 0) {
      // If no return expected, simple division
      monthlySavings = netNeeded / totalMonths;
    }
    
    // Calculate total contributions and growth
    const totalContributions = monthlySavings * totalMonths;
    const totalGrowth = targetAmount - totalContributions - currentSavings;
    const projectedFinalAmount = futureCurrentSavings + (monthlySavings * totalMonths * (1 + strategy.expectedReturn / 2));
    
    // Add calculated values to strategy
    strategy.monthlySavings = Math.round(monthlySavings * 100) / 100;
    strategy.annualSavings = Math.round(monthlySavings * 12 * 100) / 100;
    strategy.totalContributions = Math.round(totalContributions * 100) / 100;
    strategy.totalGrowth = Math.round(totalGrowth * 100) / 100;
    strategy.projectedFinalAmount = Math.round(projectedFinalAmount * 100) / 100;
    strategy.savingsRate = strategy.monthlySavings > 0 ? 
      Math.round((strategy.monthlySavings * 12 / 50000) * 100 * 100) / 100 : 0; // Assuming $50k income for rate calc
    
    // Calculate success probability (simplified)
    strategy.successProbability = calculateSuccessProbability(strategy.riskLevel, yearsToSave);
  });

  return strategies;
}

/**
 * Calculate lifestyle cost combining one-time asset purchases with ongoing expenses
 * @param {number} assetCost - One-time cost of lifestyle assets (property, etc.)
 * @param {number} annualExpenses - Ongoing annual living expenses
 * @param {number} yearsInRetirement - Expected years in retirement
 * @param {number} inflationRate - Annual inflation rate (default: 3%)
 * @param {Object} additionalAssets - Optional additional one-time purchases
 * @returns {Object} Comprehensive lifestyle cost analysis
 */
export function calculateLifestyleCost(
  assetCost,
  annualExpenses,
  yearsInRetirement,
  inflationRate = FINANCIAL_CONSTANTS.DEFAULT_INFLATION_RATE,
  additionalAssets = {}
) {
  // Validate inputs
  if (assetCost < 0) {
    throw new Error('Asset cost cannot be negative');
  }
  if (annualExpenses <= 0) {
    throw new Error('Annual expenses must be greater than 0');
  }
  if (yearsInRetirement <= 0) {
    throw new Error('Years in retirement must be greater than 0');
  }

  // Calculate total one-time costs
  const additionalAssetsCost = Object.values(additionalAssets).reduce((sum, cost) => sum + (cost || 0), 0);
  const totalOneTimeCosts = assetCost + additionalAssetsCost;

  // Calculate present value of all future expenses (inflation-adjusted)
  let totalFutureExpenses = 0;
  const yearlyExpenseBreakdown = [];
  
  for (let year = 1; year <= yearsInRetirement; year++) {
    const inflationAdjustedExpense = annualExpenses * Math.pow(1 + inflationRate, year - 1);
    const presentValue = inflationAdjustedExpense / Math.pow(1 + inflationRate, year - 1);
    
    totalFutureExpenses += inflationAdjustedExpense;
    yearlyExpenseBreakdown.push({
      year,
      nominalExpense: Math.round(inflationAdjustedExpense),
      presentValue: Math.round(presentValue),
      cumulativeTotal: Math.round(totalFutureExpenses)
    });
  }

  // Calculate portfolio needed for expenses using 4% rule
  const portfolioNeededForExpenses = annualExpenses / FINANCIAL_CONSTANTS.SAFE_WITHDRAWAL_RATE;

  // Total lifestyle cost (one-time + portfolio for ongoing expenses)
  const totalLifestyleCost = totalOneTimeCosts + portfolioNeededForExpenses;

  // Calculate breakdown by category
  const costBreakdown = {
    oneTimeCosts: {
      primaryAsset: Math.round(assetCost),
      additionalAssets: Math.round(additionalAssetsCost),
      total: Math.round(totalOneTimeCosts),
      percentage: Math.round((totalOneTimeCosts / totalLifestyleCost) * 100)
    },
    ongoingExpenses: {
      portfolioNeeded: Math.round(portfolioNeededForExpenses),
      totalFutureValue: Math.round(totalFutureExpenses),
      averageAnnualExpense: Math.round(totalFutureExpenses / yearsInRetirement),
      percentage: Math.round((portfolioNeededForExpenses / totalLifestyleCost) * 100)
    }
  };

  // Calculate alternative scenarios
  const scenarios = {
    noInflation: {
      totalExpenses: annualExpenses * yearsInRetirement,
      portfolioNeeded: annualExpenses / FINANCIAL_CONSTANTS.SAFE_WITHDRAWAL_RATE,
      totalCost: totalOneTimeCosts + (annualExpenses / FINANCIAL_CONSTANTS.SAFE_WITHDRAWAL_RATE),
      savings: totalLifestyleCost - (totalOneTimeCosts + (annualExpenses / FINANCIAL_CONSTANTS.SAFE_WITHDRAWAL_RATE))
    },
    higherInflation: calculateLifestyleCostScenario(assetCost, annualExpenses, yearsInRetirement, 0.04, additionalAssets),
    lowerExpenses: calculateLifestyleCostScenario(assetCost, annualExpenses * 0.8, yearsInRetirement, inflationRate, additionalAssets)
  };

  // Calculate monthly savings needed to achieve this lifestyle
  const savingsAnalysis = {
    fiveYears: calculateMonthlySavingsNeeded(totalLifestyleCost, 5),
    tenYears: calculateMonthlySavingsNeeded(totalLifestyleCost, 10),
    fifteenYears: calculateMonthlySavingsNeeded(totalLifestyleCost, 15),
    twentyYears: calculateMonthlySavingsNeeded(totalLifestyleCost, 20),
    twentyFiveYears: calculateMonthlySavingsNeeded(totalLifestyleCost, 25),
    thirtyYears: calculateMonthlySavingsNeeded(totalLifestyleCost, 30)
  };

  return {
    // Core calculations
    totalLifestyleCost: Math.round(totalLifestyleCost),
    totalOneTimeCosts: Math.round(totalOneTimeCosts),
    portfolioNeededForExpenses: Math.round(portfolioNeededForExpenses),
    
    // Detailed breakdown
    costBreakdown,
    yearlyExpenseBreakdown: yearlyExpenseBreakdown.slice(0, 10), // First 10 years for display
    
    // Asset details
    assetDetails: {
      primaryAsset: Math.round(assetCost),
      additionalAssets: Object.keys(additionalAssets).map(key => ({
        name: key,
        cost: Math.round(additionalAssets[key] || 0)
      })),
      totalAssets: Math.round(totalOneTimeCosts)
    },
    
    // Expense analysis
    expenseAnalysis: {
      currentAnnualExpenses: Math.round(annualExpenses),
      totalFutureExpenses: Math.round(totalFutureExpenses),
      averageAnnualExpense: Math.round(totalFutureExpenses / yearsInRetirement),
      inflationImpact: Math.round(totalFutureExpenses - (annualExpenses * yearsInRetirement)),
      yearsInRetirement
    },
    
    // Scenarios
    scenarios,
    
    // Savings analysis
    savingsAnalysis,
    
    // Financial metrics
    metrics: {
      costPerYear: Math.round(totalLifestyleCost / yearsInRetirement),
      costPerMonth: Math.round(totalLifestyleCost / (yearsInRetirement * 12)),
      assetToExpenseRatio: Math.round((totalOneTimeCosts / portfolioNeededForExpenses) * 100) / 100,
      inflationProtection: Math.round(((totalFutureExpenses - (annualExpenses * yearsInRetirement)) / (annualExpenses * yearsInRetirement)) * 100)
    },
    
    // Assumptions
    assumptions: {
      inflationRate: inflationRate * 100,
      safeWithdrawalRate: FINANCIAL_CONSTANTS.SAFE_WITHDRAWAL_RATE * 100,
      yearsInRetirement,
      investmentReturn: FINANCIAL_CONSTANTS.DEFAULT_INVESTMENT_RETURN * 100
    },
    
    // Metadata
    calculatedAt: new Date().toISOString()
  };
}

/**
 * Calculate lifestyle cost for alternative scenarios
 * @param {number} assetCost - One-time asset cost
 * @param {number} annualExpenses - Annual expenses
 * @param {number} yearsInRetirement - Years in retirement
 * @param {number} inflationRate - Inflation rate
 * @param {Object} additionalAssets - Additional assets
 * @returns {Object} Scenario calculation results
 */
function calculateLifestyleCostScenario(assetCost, annualExpenses, yearsInRetirement, inflationRate, additionalAssets) {
  const additionalAssetsCost = Object.values(additionalAssets).reduce((sum, cost) => sum + (cost || 0), 0);
  const totalOneTimeCosts = assetCost + additionalAssetsCost;
  const portfolioNeeded = annualExpenses / FINANCIAL_CONSTANTS.SAFE_WITHDRAWAL_RATE;
  const totalCost = totalOneTimeCosts + portfolioNeeded;
  
  return {
    totalCost: Math.round(totalCost),
    portfolioNeeded: Math.round(portfolioNeeded),
    oneTimeCosts: Math.round(totalOneTimeCosts)
  };
}

/**
 * Calculate monthly savings needed to reach a target amount
 * @param {number} targetAmount - Target amount to save
 * @param {number} years - Years to save
 * @param {number} expectedReturn - Expected annual return (default: 7%)
 * @returns {Object} Monthly savings calculation
 */
function calculateMonthlySavingsNeeded(targetAmount, years, expectedReturn = FINANCIAL_CONSTANTS.DEFAULT_INVESTMENT_RETURN) {
  const monthlyReturn = expectedReturn / FINANCIAL_CONSTANTS.MONTHS_PER_YEAR;
  const totalMonths = years * FINANCIAL_CONSTANTS.MONTHS_PER_YEAR;
  
  let monthlySavings = 0;
  if (monthlyReturn > 0) {
    // PMT = FV * r / ((1 + r)^n - 1)
    const denominator = Math.pow(1 + monthlyReturn, totalMonths) - 1;
    monthlySavings = targetAmount * monthlyReturn / denominator;
  } else {
    monthlySavings = targetAmount / totalMonths;
  }
  
  const totalContributions = monthlySavings * totalMonths;
  const totalGrowth = targetAmount - totalContributions;
  
  return {
    monthlySavings: Math.round(monthlySavings * 100) / 100,
    annualSavings: Math.round(monthlySavings * 12 * 100) / 100,
    totalContributions: Math.round(totalContributions * 100) / 100,
    totalGrowth: Math.round(totalGrowth * 100) / 100,
    years,
    expectedReturn: expectedReturn * 100
  };
}

/**
 * Calculate purchasing power analysis showing inflation impact
 * @param {number} currentExpenses - Current annual expenses
 * @param {number} futureExpenses - Future annual expenses (inflation-adjusted)
 * @param {number} years - Years until retirement
 * @param {number} inflationRate - Annual inflation rate
 * @returns {Object} Purchasing power analysis
 */
function calculatePurchasingPowerAnalysis(currentExpenses, futureExpenses, years, inflationRate) {
  const inflationImpact = futureExpenses - currentExpenses;
  const inflationMultiplier = Math.pow(1 + inflationRate, years);
  
  // Calculate what $1 today will be worth in the future
  const dollarValueInFuture = 1 / inflationMultiplier;
  
  // Calculate cumulative inflation over retirement period
  const cumulativeInflation = ((inflationMultiplier - 1) * 100);
  
  return {
    currentExpenses: Math.round(currentExpenses),
    futureExpenses: Math.round(futureExpenses),
    inflationImpact: Math.round(inflationImpact),
    inflationMultiplier: Math.round(inflationMultiplier * 100) / 100,
    dollarValueInFuture: Math.round(dollarValueInFuture * 100) / 100,
    cumulativeInflation: Math.round(cumulativeInflation * 100) / 100,
    annualInflationRate: inflationRate * 100,
    
    // Examples for clarity
    examples: {
      coffeeToday: 5,
      coffeeInFuture: Math.round(5 * inflationMultiplier * 100) / 100,
      groceriesToday: 100,
      groceriesInFuture: Math.round(100 * inflationMultiplier * 100) / 100
    }
  };
}

/**
 * Calculate withdrawal schedule showing portfolio depletion over time
 * @param {number} portfolioSize - Initial portfolio size
 * @param {number} annualWithdrawal - Annual withdrawal amount
 * @param {number} retirementYears - Years in retirement
 * @param {number} inflationRate - Annual inflation rate
 * @returns {Array} Year-by-year withdrawal schedule
 */
function calculateWithdrawalSchedule(portfolioSize, annualWithdrawal, retirementYears, inflationRate) {
  const schedule = [];
  let remainingPortfolio = portfolioSize;
  let currentWithdrawal = annualWithdrawal;
  
  for (let year = 1; year <= Math.min(retirementYears, 30); year++) {
    // Adjust withdrawal for inflation
    if (year > 1) {
      currentWithdrawal *= (1 + inflationRate);
    }
    
    // Calculate portfolio growth (assuming 4% real return after inflation)
    const portfolioGrowth = remainingPortfolio * 0.04;
    
    // Apply withdrawal
    remainingPortfolio = remainingPortfolio + portfolioGrowth - currentWithdrawal;
    
    schedule.push({
      year,
      startingBalance: Math.round(remainingPortfolio + currentWithdrawal - portfolioGrowth),
      growth: Math.round(portfolioGrowth),
      withdrawal: Math.round(currentWithdrawal),
      endingBalance: Math.round(Math.max(0, remainingPortfolio)),
      portfolioDepletion: remainingPortfolio <= 0
    });
    
    // Stop if portfolio is depleted
    if (remainingPortfolio <= 0) break;
  }
  
  return schedule;
}

/**
 * Calculate success probability based on risk level and time horizon
 * @param {string} riskLevel - Risk level (Low, Medium, High)
 * @param {number} years - Years to invest
 * @returns {number} Success probability percentage
 */
function calculateSuccessProbability(riskLevel, years) {
  // Simplified probability model based on historical data
  const baseRates = {
    'Low': 85,
    'Medium': 75,
    'High': 65
  };
  
  const timeBonus = Math.min(years * 0.5, 15); // Up to 15% bonus for longer time horizons
  return Math.min(95, baseRates[riskLevel] + timeBonus);
}

/**
 * Utility function to format currency values
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
 * Utility function to format percentage values
 * @param {number} percentage - Percentage to format
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(percentage, decimals = 1) {
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Validate retirement calculation inputs
 * @param {Object} inputs - Input parameters to validate
 * @returns {Object} Validation result with errors array
 */
export function validateRetirementInputs(inputs) {
  const errors = [];
  
  if (!inputs.annualExpenses || inputs.annualExpenses <= 0) {
    errors.push('Annual expenses must be greater than 0');
  }
  
  if (!inputs.yearsUntilRetirement || inputs.yearsUntilRetirement <= 0) {
    errors.push('Years until retirement must be greater than 0');
  }
  
  if (inputs.yearsUntilRetirement > 50) {
    errors.push('Years until retirement seems unrealistic (over 50 years)');
  }
  
  if (inputs.expectedRetirementLength && inputs.expectedRetirementLength > 50) {
    errors.push('Expected retirement length seems unrealistic (over 50 years)');
  }
  
  if (inputs.inflationRate && (inputs.inflationRate < 0 || inputs.inflationRate > 0.15)) {
    errors.push('Inflation rate should be between 0% and 15%');
  }
  
  if (inputs.currentAge && (inputs.currentAge < 18 || inputs.currentAge > 80)) {
    errors.push('Current age should be between 18 and 80');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get recommended retirement strategies based on age and risk tolerance
 * @param {number} currentAge - Current age
 * @param {string} riskTolerance - Risk tolerance (conservative, moderate, aggressive)
 * @param {number} yearsUntilRetirement - Years until retirement
 * @returns {Object} Personalized retirement strategy recommendations
 */
export function getRetirementStrategyRecommendations(currentAge, riskTolerance, yearsUntilRetirement) {
  const strategies = {
    assetAllocation: {},
    savingsRate: {},
    recommendations: []
  };
  
  // Age-based asset allocation (rule of thumb: 100 - age = stock percentage)
  const stockPercentage = Math.max(20, Math.min(90, 100 - currentAge));
  
  // Adjust based on risk tolerance
  const riskAdjustments = {
    conservative: -20,
    moderate: 0,
    aggressive: +15
  };
  
  const adjustedStockPercentage = Math.max(10, Math.min(95, 
    stockPercentage + (riskAdjustments[riskTolerance] || 0)
  ));
  
  strategies.assetAllocation = {
    stocks: adjustedStockPercentage,
    bonds: Math.max(5, 100 - adjustedStockPercentage - 5),
    cash: 5
  };
  
  // Savings rate recommendations based on years until retirement
  if (yearsUntilRetirement >= 30) {
    strategies.savingsRate = { recommended: 15, minimum: 10, aggressive: 20 };
    strategies.recommendations.push('You have time on your side - focus on consistent saving and growth investments');
  } else if (yearsUntilRetirement >= 20) {
    strategies.savingsRate = { recommended: 20, minimum: 15, aggressive: 25 };
    strategies.recommendations.push('Increase savings rate and maintain balanced growth strategy');
  } else if (yearsUntilRetirement >= 10) {
    strategies.savingsRate = { recommended: 25, minimum: 20, aggressive: 35 };
    strategies.recommendations.push('Time is getting shorter - consider increasing savings significantly');
  } else {
    strategies.savingsRate = { recommended: 35, minimum: 30, aggressive: 50 };
    strategies.recommendations.push('Retirement is approaching - maximize savings and consider catch-up contributions');
  }
  
  // Age-specific recommendations
  if (currentAge < 30) {
    strategies.recommendations.push('Take advantage of compound growth with aggressive investments');
    strategies.recommendations.push('Consider Roth IRA for tax-free retirement income');
  } else if (currentAge < 50) {
    strategies.recommendations.push('Balance growth and stability in your portfolio');
    strategies.recommendations.push('Maximize employer 401(k) matching');
  } else {
    strategies.recommendations.push('Consider catch-up contributions if available');
    strategies.recommendations.push('Begin shifting toward more conservative investments');
  }
  
  return strategies;
}

// Export all functions and constants
export default {
  calculateTotalRetirementNeed,
  calculateLifestyleCost,
  formatCurrency,
  formatPercentage,
  validateRetirementInputs,
  getRetirementStrategyRecommendations,
  FINANCIAL_CONSTANTS
};
