/**
 * Income Analysis Service
 * Comprehensive analysis of income, expenses, and savings capacity
 * Provides realistic assessments and actionable recommendations
 */

/**
 * Tax brackets and rates for 2024 (Federal)
 */
const FEDERAL_TAX_BRACKETS_2024 = {
  single: [
    { min: 0, max: 11600, rate: 0.10 },
    { min: 11600, max: 47150, rate: 0.12 },
    { min: 47150, max: 100525, rate: 0.22 },
    { min: 100525, max: 191950, rate: 0.24 },
    { min: 191950, max: 243725, rate: 0.32 },
    { min: 243725, max: 609350, rate: 0.35 },
    { min: 609350, max: Infinity, rate: 0.37 }
  ],
  marriedJoint: [
    { min: 0, max: 23200, rate: 0.10 },
    { min: 23200, max: 94300, rate: 0.12 },
    { min: 94300, max: 201050, rate: 0.22 },
    { min: 201050, max: 383900, rate: 0.24 },
    { min: 383900, max: 487450, rate: 0.32 },
    { min: 487450, max: 731200, rate: 0.35 },
    { min: 731200, max: Infinity, rate: 0.37 }
  ]
};

/**
 * State tax rates (simplified averages)
 */
const STATE_TAX_RATES = {
  // No state income tax
  'Alaska': 0, 'Florida': 0, 'Nevada': 0, 'New Hampshire': 0, 'South Dakota': 0, 
  'Tennessee': 0, 'Texas': 0, 'Washington': 0, 'Wyoming': 0,
  
  // Low tax states (0-4%)
  'Arizona': 0.025, 'Colorado': 0.0463, 'Illinois': 0.0495, 'Indiana': 0.0323,
  'Iowa': 0.0453, 'Kentucky': 0.045, 'Michigan': 0.0425, 'Mississippi': 0.04,
  'Missouri': 0.0395, 'Montana': 0.0475, 'New Mexico': 0.049, 'North Carolina': 0.0475,
  'North Dakota': 0.0295, 'Ohio': 0.0399, 'Oklahoma': 0.04, 'Pennsylvania': 0.0307,
  'South Carolina': 0.04, 'Utah': 0.0495, 'West Virginia': 0.0465, 'Wisconsin': 0.0465,
  
  // Medium tax states (4-7%)
  'Alabama': 0.04, 'Arkansas': 0.0515, 'Connecticut': 0.0599, 'Delaware': 0.0555,
  'Georgia': 0.0549, 'Idaho': 0.058, 'Kansas': 0.057, 'Louisiana': 0.0425,
  'Maine': 0.0715, 'Maryland': 0.0575, 'Massachusetts': 0.05, 'Minnesota': 0.0598,
  'Nebraska': 0.0584, 'New Jersey': 0.0637, 'Rhode Island': 0.0599, 'Vermont': 0.066,
  'Virginia': 0.0575,
  
  // High tax states (7%+)
  'California': 0.093, 'Hawaii': 0.08, 'New York': 0.0685, 'Oregon': 0.087,
  'Washington DC': 0.0575
};

/**
 * FICA and other payroll taxes
 */
const PAYROLL_TAXES = {
  socialSecurity: 0.062, // 6.2% up to wage base
  medicare: 0.0145, // 1.45%
  medicareAdditional: 0.009, // 0.9% on income over $200k
  socialSecurityWageBase: 160200 // 2024 wage base
};

/**
 * Calculate comprehensive income analysis
 * @param {Object} incomeData - Gross income information
 * @param {Array} debts - Array of debt objects
 * @param {Object} fixedExpenses - Fixed monthly expenses
 * @param {Object} options - Analysis options
 * @returns {Object} Comprehensive income analysis
 */
export function calculateIncomeAnalysis(incomeData, debts = [], fixedExpenses = {}, options = {}) {
  const {
    grossAnnualIncome,
    filingStatus = 'single',
    state = 'California',
    dependents = 0,
    pre401k = 0, // Pre-tax 401k contributions
    preHealthInsurance = 0, // Pre-tax health insurance
    otherPreTax = 0 // Other pre-tax deductions
  } = incomeData;

  const {
    includeStateDisability = true,
    assumeStandardDeduction = true,
    conservativeEstimate = true
  } = options;

  // Validate inputs
  if (!grossAnnualIncome || grossAnnualIncome <= 0) {
    throw new Error('Gross annual income must be provided and greater than 0');
  }

  // Calculate pre-tax deductions
  const totalPreTaxDeductions = pre401k + preHealthInsurance + otherPreTax;
  const taxableIncome = Math.max(0, grossAnnualIncome - totalPreTaxDeductions);

  // Calculate taxes
  const taxCalculation = calculateTaxes(taxableIncome, filingStatus, state, dependents, {
    includeStateDisability,
    assumeStandardDeduction
  });

  // Calculate net income
  const netAnnualIncome = grossAnnualIncome - taxCalculation.totalTaxes - totalPreTaxDeductions;
  const netMonthlyIncome = netAnnualIncome / 12;

  // Analyze debts
  const debtAnalysis = analyzeDebts(debts, netMonthlyIncome);

  // Analyze fixed expenses
  const expenseAnalysis = analyzeFixedExpenses(fixedExpenses, netMonthlyIncome);

  // Calculate available savings capacity
  const savingsCapacity = calculateSavingsCapacity(
    netMonthlyIncome,
    debtAnalysis.totalMonthlyPayments,
    expenseAnalysis.totalFixedExpenses,
    conservativeEstimate
  );

  // Generate recommendations
  const recommendations = generateRecommendations(
    grossAnnualIncome,
    netMonthlyIncome,
    savingsCapacity,
    debtAnalysis,
    expenseAnalysis,
    taxCalculation
  );

  return {
    // Income breakdown
    income: {
      gross: {
        annual: grossAnnualIncome,
        monthly: grossAnnualIncome / 12
      },
      preTaxDeductions: {
        retirement401k: pre401k,
        healthInsurance: preHealthInsurance,
        other: otherPreTax,
        total: totalPreTaxDeductions
      },
      taxable: {
        annual: taxableIncome,
        monthly: taxableIncome / 12
      },
      net: {
        annual: netAnnualIncome,
        monthly: netMonthlyIncome
      }
    },

    // Tax breakdown
    taxes: taxCalculation,

    // Debt analysis
    debts: debtAnalysis,

    // Expense analysis
    expenses: expenseAnalysis,

    // Savings capacity
    savingsCapacity,

    // Recommendations
    recommendations,

    // Financial ratios
    ratios: {
      effectiveTaxRate: (taxCalculation.totalTaxes / grossAnnualIncome) * 100,
      debtToIncomeRatio: (debtAnalysis.totalMonthlyPayments / netMonthlyIncome) * 100,
      housingRatio: (expenseAnalysis.housingExpenses / netMonthlyIncome) * 100,
      savingsRate: (savingsCapacity.availableForSavings / netMonthlyIncome) * 100,
      expenseRatio: ((debtAnalysis.totalMonthlyPayments + expenseAnalysis.totalFixedExpenses) / netMonthlyIncome) * 100
    },

    // Metadata
    calculatedAt: new Date().toISOString(),
    assumptions: {
      filingStatus,
      state,
      dependents,
      conservativeEstimate,
      includeStateDisability,
      assumeStandardDeduction
    }
  };
}

/**
 * Calculate federal and state taxes
 * @param {number} taxableIncome - Annual taxable income
 * @param {string} filingStatus - Tax filing status
 * @param {string} state - State for tax calculation
 * @param {number} dependents - Number of dependents
 * @param {Object} options - Tax calculation options
 * @returns {Object} Tax breakdown
 */
function calculateTaxes(taxableIncome, filingStatus, state, dependents, options = {}) {
  const { includeStateDisability = true, assumeStandardDeduction = true } = options;

  // Standard deduction for 2024
  const standardDeductions = {
    single: 14600,
    marriedJoint: 29200,
    marriedSeparate: 14600,
    headOfHousehold: 21900
  };

  const standardDeduction = standardDeductions[filingStatus] || standardDeductions.single;
  
  // Calculate federal taxable income
  let federalTaxableIncome = taxableIncome;
  if (assumeStandardDeduction) {
    federalTaxableIncome = Math.max(0, taxableIncome - standardDeduction);
  }

  // Calculate federal income tax
  const federalTax = calculateFederalTax(federalTaxableIncome, filingStatus);

  // Calculate FICA taxes
  const socialSecurityTax = Math.min(
    taxableIncome * PAYROLL_TAXES.socialSecurity,
    PAYROLL_TAXES.socialSecurityWageBase * PAYROLL_TAXES.socialSecurity
  );
  
  const medicareTax = taxableIncome * PAYROLL_TAXES.medicare;
  const additionalMedicareTax = taxableIncome > 200000 ? 
    (taxableIncome - 200000) * PAYROLL_TAXES.medicareAdditional : 0;

  // Calculate state income tax
  const stateRate = STATE_TAX_RATES[state] || 0.05; // Default to 5% if state not found
  const stateTax = federalTaxableIncome * stateRate;

  // State disability insurance (where applicable)
  const stateDisabilityTax = includeStateDisability && ['California', 'New York', 'New Jersey'].includes(state) ?
    Math.min(taxableIncome * 0.009, 1500) : 0; // Simplified SDI calculation

  const totalTaxes = federalTax + socialSecurityTax + medicareTax + additionalMedicareTax + stateTax + stateDisabilityTax;

  return {
    federal: {
      incomeTax: federalTax,
      socialSecurity: socialSecurityTax,
      medicare: medicareTax,
      additionalMedicare: additionalMedicareTax,
      total: federalTax + socialSecurityTax + medicareTax + additionalMedicareTax
    },
    state: {
      incomeTax: stateTax,
      disability: stateDisabilityTax,
      total: stateTax + stateDisabilityTax
    },
    totalTaxes,
    effectiveRate: (totalTaxes / taxableIncome) * 100,
    marginalRate: getMarginalTaxRate(federalTaxableIncome, filingStatus, stateRate) * 100,
    standardDeduction: assumeStandardDeduction ? standardDeduction : 0
  };
}

/**
 * Calculate federal income tax using brackets
 * @param {number} taxableIncome - Federal taxable income
 * @param {string} filingStatus - Tax filing status
 * @returns {number} Federal income tax owed
 */
function calculateFederalTax(taxableIncome, filingStatus) {
  const brackets = FEDERAL_TAX_BRACKETS_2024[filingStatus] || FEDERAL_TAX_BRACKETS_2024.single;
  let tax = 0;
  let previousMax = 0;

  for (const bracket of brackets) {
    if (taxableIncome <= previousMax) break;
    
    const taxableAtThisBracket = Math.min(taxableIncome, bracket.max) - previousMax;
    tax += taxableAtThisBracket * bracket.rate;
    previousMax = bracket.max;
    
    if (taxableIncome <= bracket.max) break;
  }

  return tax;
}

/**
 * Get marginal tax rate
 * @param {number} taxableIncome - Taxable income
 * @param {string} filingStatus - Filing status
 * @param {number} stateRate - State tax rate
 * @returns {number} Marginal tax rate (decimal)
 */
function getMarginalTaxRate(taxableIncome, filingStatus, stateRate) {
  const brackets = FEDERAL_TAX_BRACKETS_2024[filingStatus] || FEDERAL_TAX_BRACKETS_2024.single;
  
  let federalMarginalRate = 0.10; // Default to lowest bracket
  for (const bracket of brackets) {
    if (taxableIncome > bracket.min) {
      federalMarginalRate = bracket.rate;
    } else {
      break;
    }
  }

  // Add FICA taxes (if applicable)
  const ficaRate = taxableIncome < PAYROLL_TAXES.socialSecurityWageBase ? 
    PAYROLL_TAXES.socialSecurity + PAYROLL_TAXES.medicare : PAYROLL_TAXES.medicare;

  return federalMarginalRate + stateRate + ficaRate;
}

/**
 * Analyze debt obligations
 * @param {Array} debts - Array of debt objects
 * @param {number} monthlyIncome - Net monthly income
 * @returns {Object} Debt analysis
 */
function analyzeDebts(debts, monthlyIncome) {
  if (!Array.isArray(debts) || debts.length === 0) {
    return {
      totalBalance: 0,
      totalMonthlyPayments: 0,
      totalMinimumPayments: 0,
      debtToIncomeRatio: 0,
      averageInterestRate: 0,
      payoffSchedules: {},
      recommendations: []
    };
  }

  const totalBalance = debts.reduce((sum, debt) => sum + (debt.currentBalance || 0), 0);
  const totalMonthlyPayments = debts.reduce((sum, debt) => sum + (debt.monthlyPayment || 0), 0);
  const totalMinimumPayments = debts.reduce((sum, debt) => sum + (debt.minimumPayment || debt.monthlyPayment || 0), 0);
  
  const weightedInterestRate = debts.reduce((sum, debt) => 
    sum + ((debt.interestRate || 0) * (debt.currentBalance || 0)), 0) / totalBalance;

  // Calculate payoff schedules
  const payoffSchedules = {
    minimum: calculateDebtPayoffSchedule(debts, 'minimum'),
    avalanche: calculateDebtPayoffSchedule(debts, 'avalanche'),
    snowball: calculateDebtPayoffSchedule(debts, 'snowball')
  };

  // Generate debt recommendations
  const debtRecommendations = [];
  const dtiRatio = (totalMonthlyPayments / monthlyIncome) * 100;

  if (dtiRatio > 40) {
    debtRecommendations.push({
      type: 'debt_consolidation',
      priority: 'high',
      message: 'Consider debt consolidation to reduce monthly payments',
      potentialSavings: totalMonthlyPayments * 0.2
    });
  }

  if (dtiRatio > 20) {
    debtRecommendations.push({
      type: 'avalanche_strategy',
      priority: 'medium',
      message: 'Use avalanche method to save on interest payments',
      potentialSavings: payoffSchedules.minimum.totalInterest - payoffSchedules.avalanche.totalInterest
    });
  }

  // Check for high-interest debt
  const highInterestDebts = debts.filter(debt => (debt.interestRate || 0) > 15);
  if (highInterestDebts.length > 0) {
    debtRecommendations.push({
      type: 'high_interest_focus',
      priority: 'high',
      message: 'Prioritize paying off high-interest debt (>15% APR)',
      affectedDebts: highInterestDebts.length
    });
  }

  return {
    totalBalance,
    totalMonthlyPayments,
    totalMinimumPayments,
    debtToIncomeRatio: dtiRatio,
    averageInterestRate: weightedInterestRate || 0,
    payoffSchedules,
    recommendations: debtRecommendations,
    highInterestCount: highInterestDebts.length,
    debtCount: debts.length
  };
}

/**
 * Calculate debt payoff schedule
 * @param {Array} debts - Array of debt objects
 * @param {string} strategy - Payoff strategy (minimum, avalanche, snowball)
 * @returns {Object} Payoff schedule details
 */
function calculateDebtPayoffSchedule(debts, strategy) {
  if (!debts || debts.length === 0) {
    return { totalMonths: 0, totalInterest: 0, totalPayments: 0 };
  }

  let workingDebts = debts.map(debt => ({
    ...debt,
    remainingBalance: debt.currentBalance || 0,
    monthlyPayment: debt.monthlyPayment || debt.minimumPayment || 0
  }));

  // Sort debts based on strategy
  switch (strategy) {
    case 'avalanche':
      workingDebts.sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0));
      break;
    case 'snowball':
      workingDebts.sort((a, b) => (a.remainingBalance || 0) - (b.remainingBalance || 0));
      break;
    case 'minimum':
    default:
      // Keep original order for minimum payments
      break;
  }

  let totalInterest = 0;
  let totalPayments = 0;
  let months = 0;
  const maxMonths = 600; // 50 years maximum

  while (workingDebts.some(debt => debt.remainingBalance > 0) && months < maxMonths) {
    months++;
    
    workingDebts.forEach(debt => {
      if (debt.remainingBalance > 0) {
        const monthlyInterestRate = (debt.interestRate || 0) / 100 / 12;
        const interestPayment = debt.remainingBalance * monthlyInterestRate;
        const principalPayment = Math.min(
          Math.max(0, debt.monthlyPayment - interestPayment),
          debt.remainingBalance
        );
        
        debt.remainingBalance -= principalPayment;
        totalInterest += interestPayment;
        totalPayments += debt.monthlyPayment;
        
        if (debt.remainingBalance < 0) debt.remainingBalance = 0;
      }
    });
  }

  return {
    totalMonths: months,
    totalInterest: Math.round(totalInterest),
    totalPayments: Math.round(totalPayments),
    strategy
  };
}

/**
 * Analyze fixed expenses
 * @param {Object} fixedExpenses - Fixed expense categories
 * @param {number} monthlyIncome - Net monthly income
 * @returns {Object} Expense analysis
 */
function analyzeFixedExpenses(fixedExpenses, monthlyIncome) {
  const {
    housing = 0,
    transportation = 0,
    insurance = 0,
    utilities = 0,
    subscriptions = 0,
    childcare = 0,
    other = 0
  } = fixedExpenses;

  const totalFixedExpenses = housing + transportation + insurance + utilities + subscriptions + childcare + other;
  const housingRatio = (housing / monthlyIncome) * 100;
  const totalExpenseRatio = (totalFixedExpenses / monthlyIncome) * 100;

  const recommendations = [];

  // Housing ratio recommendations
  if (housingRatio > 30) {
    recommendations.push({
      type: 'housing_cost',
      priority: 'high',
      message: 'Housing costs exceed 30% of income - consider downsizing or increasing income',
      currentRatio: housingRatio,
      targetRatio: 30,
      potentialSavings: housing - (monthlyIncome * 0.30)
    });
  }

  // Total expense ratio recommendations
  if (totalExpenseRatio > 70) {
    recommendations.push({
      type: 'expense_reduction',
      priority: 'high',
      message: 'Fixed expenses are too high - review and reduce where possible',
      currentRatio: totalExpenseRatio,
      targetRatio: 60,
      potentialSavings: totalFixedExpenses - (monthlyIncome * 0.60)
    });
  }

  // Subscription audit
  if (subscriptions > monthlyIncome * 0.05) {
    recommendations.push({
      type: 'subscription_audit',
      priority: 'low',
      message: 'Review subscriptions - cancel unused services',
      currentAmount: subscriptions,
      potentialSavings: subscriptions * 0.3
    });
  }

  return {
    breakdown: {
      housing,
      transportation,
      insurance,
      utilities,
      subscriptions,
      childcare,
      other
    },
    totalFixedExpenses,
    housingExpenses: housing,
    housingRatio,
    totalExpenseRatio,
    recommendations
  };
}

/**
 * Calculate true savings capacity
 * @param {number} netMonthlyIncome - Net monthly income
 * @param {number} debtPayments - Total monthly debt payments
 * @param {number} fixedExpenses - Total fixed expenses
 * @param {boolean} conservativeEstimate - Use conservative estimates
 * @returns {Object} Savings capacity analysis
 */
function calculateSavingsCapacity(netMonthlyIncome, debtPayments, fixedExpenses, conservativeEstimate = true) {
  // Estimate variable expenses as percentage of income
  const variableExpenseRatio = conservativeEstimate ? 0.25 : 0.20; // 20-25% for food, entertainment, etc.
  const emergencyBufferRatio = conservativeEstimate ? 0.05 : 0.03; // 3-5% buffer
  
  const estimatedVariableExpenses = netMonthlyIncome * variableExpenseRatio;
  const emergencyBuffer = netMonthlyIncome * emergencyBufferRatio;
  
  const totalExpenses = debtPayments + fixedExpenses + estimatedVariableExpenses + emergencyBuffer;
  const availableForSavings = Math.max(0, netMonthlyIncome - totalExpenses);
  
  const savingsRate = (availableForSavings / netMonthlyIncome) * 100;
  
  // Categorize savings capacity
  let capacityLevel = 'insufficient';
  if (savingsRate >= 20) capacityLevel = 'excellent';
  else if (savingsRate >= 15) capacityLevel = 'good';
  else if (savingsRate >= 10) capacityLevel = 'moderate';
  else if (savingsRate >= 5) capacityLevel = 'limited';

  return {
    netMonthlyIncome,
    totalExpenses,
    breakdown: {
      debtPayments,
      fixedExpenses,
      estimatedVariableExpenses,
      emergencyBuffer
    },
    availableForSavings,
    savingsRate,
    capacityLevel,
    isConservativeEstimate: conservativeEstimate
  };
}

/**
 * Generate comprehensive recommendations
 * @param {number} grossIncome - Gross annual income
 * @param {number} netMonthlyIncome - Net monthly income
 * @param {Object} savingsCapacity - Savings capacity analysis
 * @param {Object} debtAnalysis - Debt analysis
 * @param {Object} expenseAnalysis - Expense analysis
 * @param {Object} taxCalculation - Tax calculation
 * @returns {Array} Array of recommendations
 */
function generateRecommendations(grossIncome, netMonthlyIncome, savingsCapacity, debtAnalysis, expenseAnalysis, taxCalculation) {
  const recommendations = [];

  // Income optimization recommendations
  if (savingsCapacity.savingsRate < 15) {
    recommendations.push({
      category: 'income',
      type: 'increase_income',
      priority: 'high',
      title: 'Increase Your Income',
      message: 'Your current savings rate is below the recommended 15%. Focus on increasing income.',
      suggestions: [
        'Ask for a raise or promotion at your current job',
        'Develop new skills for higher-paying positions',
        'Start a side hustle or freelance work',
        'Consider changing to a higher-paying career',
        'Rent out a room or parking space',
        'Sell items you no longer need'
      ],
      potentialImpact: {
        raiseIncrease: grossIncome * 0.10, // 10% raise
        sideHustleIncome: 500, // $500/month side hustle
        roomRental: 800 // $800/month room rental
      }
    });
  }

  // Tax optimization recommendations
  if (taxCalculation.effectiveRate > 20) {
    recommendations.push({
      category: 'taxes',
      type: 'tax_optimization',
      priority: 'medium',
      title: 'Optimize Your Tax Strategy',
      message: 'You may be able to reduce your tax burden through strategic planning.',
      suggestions: [
        'Maximize 401(k) contributions to reduce taxable income',
        'Consider HSA contributions if eligible',
        'Look into tax-loss harvesting for investments',
        'Consult with a tax professional for advanced strategies',
        'Consider moving to a lower-tax state if feasible'
      ],
      potentialSavings: grossIncome * 0.03 // Potential 3% savings
    });
  }

  // Debt optimization recommendations
  if (debtAnalysis.debtToIncomeRatio > 20) {
    recommendations.push({
      category: 'debt',
      type: 'debt_optimization',
      priority: 'high',
      title: 'Optimize Your Debt Strategy',
      message: 'Reducing debt payments will free up money for savings.',
      suggestions: [
        'Use the avalanche method to minimize interest payments',
        'Consider debt consolidation for lower rates',
        'Look into balance transfer options for credit cards',
        'Negotiate with creditors for better terms',
        'Consider refinancing high-interest loans'
      ],
      potentialSavings: debtAnalysis.totalMonthlyPayments * 0.15 // 15% reduction potential
    });
  }

  // Expense reduction recommendations
  if (expenseAnalysis.totalExpenseRatio > 60) {
    recommendations.push({
      category: 'expenses',
      type: 'expense_reduction',
      priority: 'medium',
      title: 'Reduce Fixed Expenses',
      message: 'Your fixed expenses are consuming too much of your income.',
      suggestions: [
        'Review and negotiate insurance rates',
        'Consider downsizing housing if possible',
        'Audit and cancel unnecessary subscriptions',
        'Shop around for better utility rates',
        'Use public transportation or carpool to reduce transportation costs',
        'Cook at home more often to reduce food expenses'
      ],
      potentialSavings: expenseAnalysis.totalFixedExpenses * 0.10 // 10% reduction potential
    });
  }

  // Emergency fund recommendations
  const emergencyFundMonths = (netMonthlyIncome * 0.1) / (expenseAnalysis.totalFixedExpenses + netMonthlyIncome * 0.25);
  if (emergencyFundMonths < 3) {
    recommendations.push({
      category: 'emergency',
      type: 'emergency_fund',
      priority: 'high',
      title: 'Build Emergency Fund First',
      message: 'Establish 3-6 months of expenses in emergency savings before pursuing other goals.',
      targetAmount: (expenseAnalysis.totalFixedExpenses + netMonthlyIncome * 0.25) * 6,
      monthsToComplete: Math.ceil(((expenseAnalysis.totalFixedExpenses + netMonthlyIncome * 0.25) * 3) / savingsCapacity.availableForSavings)
    });
  }

  return recommendations;
}

/**
 * Perform reality check on financial dreams
 * @param {Object} dreams - Array of financial dreams/goals
 * @param {Object} incomeAnalysis - Complete income analysis
 * @param {number} timeHorizon - Years available to achieve goals
 * @returns {Object} Reality check results with suggestions
 */
export function performDreamRealityCheck(dreams, incomeAnalysis, timeHorizon = 30) {
  if (!Array.isArray(dreams) || dreams.length === 0) {
    return {
      isAchievable: true,
      totalCost: 0,
      monthlyRequirement: 0,
      availableCapacity: incomeAnalysis.savingsCapacity.availableForSavings,
      gap: 0,
      suggestions: []
    };
  }

  const totalDreamCost = dreams.reduce((sum, dream) => sum + (dream.cost || dream.targetAmount || 0), 0);
  const monthlyRequirement = totalDreamCost / (timeHorizon * 12);
  const availableCapacity = incomeAnalysis.savingsCapacity.availableForSavings;
  const gap = monthlyRequirement - availableCapacity;
  const isAchievable = gap <= 0;

  const suggestions = [];

  if (!isAchievable) {
    // Calculate different scenarios
    const incomeIncreaseNeeded = gap * 12 / (1 - incomeAnalysis.taxes.effectiveRate / 100);
    const timeExtensionNeeded = (monthlyRequirement / availableCapacity) * timeHorizon;
    const costReductionNeeded = gap * timeHorizon * 12;

    suggestions.push({
      type: 'increase_income',
      title: 'Increase Annual Income',
      description: `Increase your gross income by $${Math.ceil(incomeIncreaseNeeded).toLocaleString()} annually`,
      impact: 'Maintains current timeline',
      difficulty: 'medium',
      timeframe: '1-2 years',
      steps: [
        'Negotiate a raise or seek promotion',
        'Develop high-value skills',
        'Start a profitable side business',
        'Change to a higher-paying career'
      ]
    });

    suggestions.push({
      type: 'extend_timeline',
      title: 'Extend Timeline',
      description: `Extend your goal timeline to ${Math.ceil(timeExtensionNeeded)} years`,
      impact: `${Math.ceil(timeExtensionNeeded - timeHorizon)} additional years`,
      difficulty: 'easy',
      timeframe: 'immediate',
      steps: [
        'Adjust expectations for goal achievement',
        'Focus on compound growth over time',
        'Celebrate smaller milestones along the way'
      ]
    });

    suggestions.push({
      type: 'reduce_costs',
      title: 'Reduce Dream Costs',
      description: `Reduce total dream costs by $${Math.ceil(costReductionNeeded).toLocaleString()}`,
      impact: 'Maintains current timeline and income',
      difficulty: 'medium',
      timeframe: 'immediate',
      steps: [
        'Prioritize most important dreams',
        'Find more affordable alternatives',
        'Phase dreams over longer periods',
        'Consider shared or collaborative approaches'
      ]
    });

    suggestions.push({
      type: 'optimize_finances',
      title: 'Optimize Current Finances',
      description: 'Maximize savings from current income through optimization',
      impact: `Potential additional $${Math.ceil(availableCapacity * 0.3).toLocaleString()}/month`,
      difficulty: 'medium',
      timeframe: '3-6 months',
      steps: [
        'Eliminate high-interest debt',
        'Reduce unnecessary expenses',
        'Optimize tax strategy',
        'Increase investment returns'
      ]
    });

    // Hybrid approach
    const hybridIncome = incomeIncreaseNeeded * 0.5;
    const hybridTime = timeHorizon * 1.2;
    const hybridCost = costReductionNeeded * 0.3;

    suggestions.push({
      type: 'hybrid_approach',
      title: 'Balanced Approach',
      description: 'Combine moderate changes across multiple areas',
      impact: 'Achievable with reasonable effort',
      difficulty: 'medium',
      timeframe: '6-12 months',
      steps: [
        `Increase income by $${Math.ceil(hybridIncome).toLocaleString()} annually`,
        `Extend timeline by ${Math.ceil(hybridTime - timeHorizon)} years`,
        `Reduce costs by $${Math.ceil(hybridCost).toLocaleString()}`,
        'Optimize current financial situation'
      ],
      recommended: true
    });
  } else {
    suggestions.push({
      type: 'acceleration',
      title: 'Accelerate Your Dreams',
      description: 'Your dreams are achievable! Consider ways to reach them faster.',
      impact: 'Earlier achievement of goals',
      difficulty: 'optional',
      timeframe: 'ongoing',
      steps: [
        'Increase savings rate further',
        'Optimize investment strategy',
        'Look for additional income opportunities',
        'Consider more aggressive financial strategies'
      ]
    });
  }

  return {
    isAchievable,
    totalCost: totalDreamCost,
    monthlyRequirement: Math.round(monthlyRequirement),
    availableCapacity: Math.round(availableCapacity),
    gap: Math.round(gap),
    gapPercentage: availableCapacity > 0 ? (gap / availableCapacity) * 100 : 0,
    suggestions,
    scenarios: {
      incomeIncrease: {
        amount: Math.ceil(incomeIncreaseNeeded),
        newMonthlySavings: monthlyRequirement,
        timeline: timeHorizon
      },
      timeExtension: {
        newTimeline: Math.ceil(timeExtensionNeeded),
        monthlySavings: availableCapacity,
        additionalYears: Math.ceil(timeExtensionNeeded - timeHorizon)
      },
      costReduction: {
        reduction: Math.ceil(costReductionNeeded),
        newMonthlySavings: availableCapacity,
        timeline: timeHorizon
      }
    }
  };
}

/**
 * Calculate income optimization scenarios
 * @param {Object} currentAnalysis - Current income analysis
 * @param {Array} optimizationTargets - Target improvements
 * @returns {Object} Optimization scenarios
 */
export function calculateIncomeOptimizationScenarios(currentAnalysis, optimizationTargets = []) {
  const scenarios = {};

  // Scenario 1: 10% income increase
  scenarios.incomeIncrease10 = {
    name: '10% Income Increase',
    grossIncome: currentAnalysis.income.gross.annual * 1.1,
    additionalMonthlySavings: (currentAnalysis.income.gross.annual * 0.1 * 0.7) / 12, // After taxes
    timeToImplement: '6-12 months',
    difficulty: 'medium'
  };

  // Scenario 2: Debt elimination
  scenarios.debtElimination = {
    name: 'Eliminate All Debt',
    additionalMonthlySavings: currentAnalysis.debts.totalMonthlyPayments,
    timeToImplement: `${Math.ceil(currentAnalysis.debts.payoffSchedules.avalanche.totalMonths / 12)} years`,
    difficulty: 'high'
  };

  // Scenario 3: Expense reduction
  scenarios.expenseReduction = {
    name: '15% Expense Reduction',
    additionalMonthlySavings: currentAnalysis.expenses.totalFixedExpenses * 0.15,
    timeToImplement: '3-6 months',
    difficulty: 'medium'
  };

  // Scenario 4: Tax optimization
  scenarios.taxOptimization = {
    name: 'Tax Strategy Optimization',
    additionalMonthlySavings: (currentAnalysis.income.gross.annual * 0.03) / 12, // 3% tax savings
    timeToImplement: '1-3 months',
    difficulty: 'low'
  };

  // Combined scenario
  scenarios.combined = {
    name: 'Combined Optimization',
    additionalMonthlySavings: 
      scenarios.incomeIncrease10.additionalMonthlySavings * 0.5 +
      scenarios.expenseReduction.additionalMonthlySavings * 0.7 +
      scenarios.taxOptimization.additionalMonthlySavings,
    timeToImplement: '6-18 months',
    difficulty: 'high',
    recommended: true
  };

  return scenarios;
}

/**
 * Utility functions for formatting and validation
 */
export const IncomeAnalysisUtils = {
  formatCurrency: (amount) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount),

  formatPercentage: (percentage, decimals = 1) => `${percentage.toFixed(decimals)}%`,

  validateIncomeData: (incomeData) => {
    const errors = [];
    
    if (!incomeData.grossAnnualIncome || incomeData.grossAnnualIncome <= 0) {
      errors.push('Gross annual income is required and must be greater than 0');
    }
    
    if (incomeData.grossAnnualIncome > 10000000) {
      errors.push('Income seems unrealistic (over $10M annually)');
    }
    
    if (incomeData.pre401k && incomeData.pre401k > incomeData.grossAnnualIncome * 0.5) {
      errors.push('401k contributions cannot exceed 50% of income');
    }
    
    return { isValid: errors.length === 0, errors };
  },

  getSavingsCapacityLevel: (savingsRate) => {
    if (savingsRate >= 20) return { level: 'excellent', color: 'green' };
    if (savingsRate >= 15) return { level: 'good', color: 'blue' };
    if (savingsRate >= 10) return { level: 'moderate', color: 'yellow' };
    if (savingsRate >= 5) return { level: 'limited', color: 'orange' };
    return { level: 'insufficient', color: 'red' };
  }
};

export default {
  calculateIncomeAnalysis,
  performDreamRealityCheck,
  calculateIncomeOptimizationScenarios,
  IncomeAnalysisUtils
};
