/**
 * Tax Optimizer Service
 * 
 * Calculates the true after-tax impact of different saving strategies and makes tax optimization
 * feel like discovering bonus money rather than doing homework. Provides personalized suggestions
 * for tax-advantaged approaches that help users keep more of their hard-earned money.
 */

// 2024 Federal Tax Brackets (updated annually)
const FEDERAL_TAX_BRACKETS_2024 = {
  single: [
    { min: 0, max: 11000, rate: 0.10 },
    { min: 11000, max: 44725, rate: 0.12 },
    { min: 44725, max: 95375, rate: 0.22 },
    { min: 95375, max: 182050, rate: 0.24 },
    { min: 182050, max: 231250, rate: 0.32 },
    { min: 231250, max: 578125, rate: 0.35 },
    { min: 578125, max: Infinity, rate: 0.37 }
  ],
  marriedJointly: [
    { min: 0, max: 22000, rate: 0.10 },
    { min: 22000, max: 89450, rate: 0.12 },
    { min: 89450, max: 190750, rate: 0.22 },
    { min: 190750, max: 364200, rate: 0.24 },
    { min: 364200, max: 462500, rate: 0.32 },
    { min: 462500, max: 693750, rate: 0.35 },
    { min: 693750, max: Infinity, rate: 0.37 }
  ],
  marriedSeparately: [
    { min: 0, max: 11000, rate: 0.10 },
    { min: 11000, max: 44725, rate: 0.12 },
    { min: 44725, max: 95375, rate: 0.22 },
    { min: 95375, max: 182100, rate: 0.24 },
    { min: 182100, max: 231250, rate: 0.32 },
    { min: 231250, max: 346875, rate: 0.35 },
    { min: 346875, max: Infinity, rate: 0.37 }
  ],
  headOfHousehold: [
    { min: 0, max: 15700, rate: 0.10 },
    { min: 15700, max: 59850, rate: 0.12 },
    { min: 59850, max: 95350, rate: 0.22 },
    { min: 95350, max: 182050, rate: 0.24 },
    { min: 182050, max: 231250, rate: 0.32 },
    { min: 231250, max: 578100, rate: 0.35 },
    { min: 578100, max: Infinity, rate: 0.37 }
  ]
};

// State tax rates (simplified - in reality these vary significantly)
const STATE_TAX_RATES = {
  // No state income tax
  'Alaska': 0, 'Florida': 0, 'Nevada': 0, 'New Hampshire': 0, 'South Dakota': 0, 
  'Tennessee': 0, 'Texas': 0, 'Washington': 0, 'Wyoming': 0,
  
  // Low tax states
  'Utah': 0.0485, 'North Dakota': 0.029, 'Pennsylvania': 0.0307, 'Indiana': 0.0323,
  'Colorado': 0.0455, 'Illinois': 0.0495, 'Iowa': 0.0853, 'Kansas': 0.057,
  'Kentucky': 0.05, 'Louisiana': 0.06, 'Michigan': 0.0425, 'Mississippi': 0.05,
  'Missouri': 0.054, 'Montana': 0.0675, 'Nebraska': 0.0684, 'North Carolina': 0.0499,
  'Ohio': 0.0399, 'Oklahoma': 0.05, 'South Carolina': 0.07, 'West Virginia': 0.065,
  'Wisconsin': 0.0765,
  
  // Medium tax states
  'Alabama': 0.05, 'Arizona': 0.045, 'Arkansas': 0.0695, 'Connecticut': 0.0699,
  'Delaware': 0.066, 'Georgia': 0.0575, 'Idaho': 0.058, 'Maine': 0.0715,
  'Maryland': 0.0575, 'Massachusetts': 0.05, 'Minnesota': 0.0985, 'New Mexico': 0.059,
  'Rhode Island': 0.0599, 'Vermont': 0.0895, 'Virginia': 0.0575,
  
  // High tax states
  'California': 0.133, 'Hawaii': 0.11, 'New Jersey': 0.1075, 'New York': 0.109,
  'Oregon': 0.099, 'District of Columbia': 0.0975
};

// Standard deductions for 2024
const STANDARD_DEDUCTIONS_2024 = {
  single: 14600,
  marriedJointly: 29200,
  marriedSeparately: 14600,
  headOfHousehold: 21900
};

// IRA and 401k contribution limits for 2024
const CONTRIBUTION_LIMITS_2024 = {
  ira: 7000,
  iraOverAge50: 8000,
  traditional401k: 23000,
  traditional401kOverAge50: 30500,
  roth401k: 23000,
  roth401kOverAge50: 30500
};

/**
 * Utility function to format currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${Math.round(amount / 1000)}k`;
  } else {
    return `$${Math.round(amount).toLocaleString()}`;
  }
}

/**
 * Calculate federal tax owed based on income and filing status
 * @param {number} taxableIncome - Income subject to federal tax
 * @param {string} filingStatus - Filing status (single, marriedJointly, etc.)
 * @returns {number} Federal tax owed
 */
function calculateFederalTax(taxableIncome, filingStatus = 'single') {
  const brackets = FEDERAL_TAX_BRACKETS_2024[filingStatus] || FEDERAL_TAX_BRACKETS_2024.single;
  let tax = 0;
  
  for (const bracket of brackets) {
    if (taxableIncome > bracket.min) {
      const taxableAtThisBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
      tax += taxableAtThisBracket * bracket.rate;
    }
  }
  
  return tax;
}

/**
 * Calculate state tax owed based on income and state
 * @param {number} taxableIncome - Income subject to state tax
 * @param {string} state - State name or abbreviation
 * @returns {number} State tax owed
 */
function calculateStateTax(taxableIncome, state) {
  const stateRate = STATE_TAX_RATES[state] || 0;
  return taxableIncome * stateRate;
}

/**
 * Calculate effective tax rate including federal and state taxes
 * @param {number} grossIncome - Total gross income
 * @param {string} state - State name
 * @param {string} filingStatus - Filing status
 * @param {number} deductions - Total deductions (defaults to standard deduction)
 * @returns {Object} Tax calculation details
 */
function calculateEffectiveTaxRate(grossIncome, state, filingStatus = 'single', deductions = null) {
  const standardDeduction = STANDARD_DEDUCTIONS_2024[filingStatus] || STANDARD_DEDUCTIONS_2024.single;
  const totalDeductions = deductions || standardDeduction;
  const taxableIncome = Math.max(0, grossIncome - totalDeductions);
  
  const federalTax = calculateFederalTax(taxableIncome, filingStatus);
  const stateTax = calculateStateTax(taxableIncome, state);
  const totalTax = federalTax + stateTax;
  
  const effectiveRate = grossIncome > 0 ? totalTax / grossIncome : 0;
  const marginalFederalRate = getMarginalTaxRate(taxableIncome, filingStatus);
  const marginalStateRate = STATE_TAX_RATES[state] || 0;
  const marginalRate = marginalFederalRate + marginalStateRate;
  
  return {
    grossIncome,
    taxableIncome,
    standardDeduction,
    totalDeductions,
    federalTax,
    stateTax,
    totalTax,
    netIncome: grossIncome - totalTax,
    effectiveRate,
    marginalRate,
    marginalFederalRate,
    marginalStateRate
  };
}

/**
 * Get marginal tax rate for additional income
 * @param {number} taxableIncome - Current taxable income
 * @param {string} filingStatus - Filing status
 * @returns {number} Marginal tax rate as decimal
 */
function getMarginalTaxRate(taxableIncome, filingStatus = 'single') {
  const brackets = FEDERAL_TAX_BRACKETS_2024[filingStatus] || FEDERAL_TAX_BRACKETS_2024.single;
  
  for (const bracket of brackets) {
    if (taxableIncome >= bracket.min && taxableIncome < bracket.max) {
      return bracket.rate;
    }
  }
  
  return brackets[brackets.length - 1].rate; // Return highest bracket if above all thresholds
}

/**
 * Project tax brackets at retirement based on inflation and potential tax changes
 * @param {number} currentIncome - Current income
 * @param {number} yearsUntilRetirement - Years until retirement
 * @param {number} retirementIncome - Projected retirement income
 * @param {string} state - State for retirement
 * @param {string} filingStatus - Filing status
 * @returns {Object} Projected retirement tax situation
 */
function projectRetirementTaxBrackets(currentIncome, yearsUntilRetirement, retirementIncome, state, filingStatus = 'single') {
  // Assume tax brackets increase with inflation (3% annually)
  const inflationRate = 0.03;
  const futureStandardDeduction = STANDARD_DEDUCTIONS_2024[filingStatus] * Math.pow(1 + inflationRate, yearsUntilRetirement);
  
  // Project future tax brackets (simplified - assumes structure stays same but amounts inflate)
  const currentBrackets = FEDERAL_TAX_BRACKETS_2024[filingStatus];
  const futureBrackets = currentBrackets.map(bracket => ({
    min: bracket.min * Math.pow(1 + inflationRate, yearsUntilRetirement),
    max: bracket.max === Infinity ? Infinity : bracket.max * Math.pow(1 + inflationRate, yearsUntilRetirement),
    rate: bracket.rate // Assume rates stay the same (conservative assumption)
  }));
  
  const currentTax = calculateEffectiveTaxRate(currentIncome, state, filingStatus);
  
  // Calculate retirement tax with projected brackets
  const retirementTaxableIncome = Math.max(0, retirementIncome - futureStandardDeduction);
  let retirementFederalTax = 0;
  
  for (const bracket of futureBrackets) {
    if (retirementTaxableIncome > bracket.min) {
      const taxableAtThisBracket = Math.min(retirementTaxableIncome, bracket.max) - bracket.min;
      retirementFederalTax += taxableAtThisBracket * bracket.rate;
    }
  }
  
  const retirementStateTax = calculateStateTax(retirementTaxableIncome, state);
  const retirementTotalTax = retirementFederalTax + retirementStateTax;
  const retirementEffectiveRate = retirementIncome > 0 ? retirementTotalTax / retirementIncome : 0;
  
  return {
    current: currentTax,
    retirement: {
      grossIncome: retirementIncome,
      taxableIncome: retirementTaxableIncome,
      standardDeduction: futureStandardDeduction,
      federalTax: retirementFederalTax,
      stateTax: retirementStateTax,
      totalTax: retirementTotalTax,
      netIncome: retirementIncome - retirementTotalTax,
      effectiveRate: retirementEffectiveRate
    },
    comparison: {
      taxRateChange: retirementEffectiveRate - currentTax.effectiveRate,
      taxSavings: currentTax.totalTax - retirementTotalTax,
      message: retirementEffectiveRate < currentTax.effectiveRate ? 
        'Your retirement tax rate will likely be lower - perfect for traditional accounts!' :
        'Your retirement tax rate might be higher - Roth accounts could be your secret weapon!'
    }
  };
}

/**
 * Calculate how much gross income is needed to have a specific after-tax amount for goals
 * @param {number} grossAmount - Amount needed after taxes
 * @param {Object} userProfile - User's financial profile
 * @param {number} yearsUntilGoal - Years until the goal is needed
 * @returns {Object} Detailed breakdown of tax impact and required gross amount
 */
export function calculateAfterTaxNeeded(grossAmount, userProfile, yearsUntilGoal) {
  const {
    location: { state = 'California' } = {},
    income: { gross: { annual = 75000 } = {} } = {},
    age = 35,
    dependents: { count = 0 } = {}
  } = userProfile;
  
  // Determine filing status based on profile
  const filingStatus = count > 0 ? 'headOfHousehold' : 'single';
  
  // Calculate current tax situation
  const currentTax = calculateEffectiveTaxRate(annual, state, filingStatus);
  
  // Calculate retirement projections
  const retirementAge = 65;
  const yearsToRetirement = Math.max(1, retirementAge - age);
  const retirementIncome = annual * 0.7; // Assume 70% of current income in retirement
  const retirementTax = projectRetirementTaxBrackets(annual, yearsToRetirement, retirementIncome, state, filingStatus);
  
  // Determine relevant tax rate based on goal timing
  const isRetirementGoal = yearsUntilGoal >= yearsToRetirement;
  const applicableTaxRate = isRetirementGoal ? 
    retirementTax.retirement.effectiveRate : 
    currentTax.effectiveRate;
  
  // Calculate gross amount needed
  const grossAmountNeeded = grossAmount / (1 - applicableTaxRate);
  const taxCost = grossAmountNeeded - grossAmount;
  const taxMultiplier = grossAmountNeeded / grossAmount;
  
  // Calculate potential savings from tax-advantaged accounts
  const traditionalIRABenefit = grossAmount * currentTax.marginalRate;
  const rothIRABenefit = isRetirementGoal && retirementTax.retirement.effectiveRate < currentTax.effectiveRate ?
    grossAmount * (currentTax.marginalRate - retirementTax.retirement.effectiveRate) : 0;
  
  return {
    goalDetails: {
      afterTaxAmount: grossAmount,
      grossAmountNeeded: Math.round(grossAmountNeeded),
      taxCost: Math.round(taxCost),
      taxMultiplier: taxMultiplier.toFixed(2),
      yearsUntilGoal,
      isRetirementGoal
    },
    
    currentTaxSituation: {
      grossIncome: annual,
      effectiveRate: (currentTax.effectiveRate * 100).toFixed(1) + '%',
      marginalRate: (currentTax.marginalRate * 100).toFixed(1) + '%',
      annualTax: Math.round(currentTax.totalTax),
      takeHome: Math.round(currentTax.netIncome),
      state: state
    },
    
    retirementProjection: isRetirementGoal ? {
      projectedIncome: retirementIncome,
      projectedTaxRate: (retirementTax.retirement.effectiveRate * 100).toFixed(1) + '%',
      taxRateChange: retirementTax.comparison.taxRateChange >= 0 ? 
        `+${(retirementTax.comparison.taxRateChange * 100).toFixed(1)}%` :
        `${(retirementTax.comparison.taxRateChange * 100).toFixed(1)}%`,
      message: retirementTax.comparison.message
    } : null,
    
    taxOptimizationOpportunities: {
      traditionalIRA: {
        maxContribution: CONTRIBUTION_LIMITS_2024.ira,
        potentialSavings: Math.round(traditionalIRABenefit),
        message: `Contributing to a traditional IRA could save you ${formatCurrency(traditionalIRABenefit)} in taxes this year!`
      },
      rothIRA: {
        maxContribution: CONTRIBUTION_LIMITS_2024.ira,
        potentialSavings: Math.round(rothIRABenefit),
        message: rothIRABenefit > 0 ? 
          `A Roth IRA could save you ${formatCurrency(rothIRABenefit)} on your goal since your retirement tax rate will be lower!` :
          `A Roth IRA provides tax-free growth for your goal - pure bonus money in retirement!`
      },
      traditional401k: {
        maxContribution: CONTRIBUTION_LIMITS_2024.traditional401k,
        potentialSavings: Math.round(Math.min(CONTRIBUTION_LIMITS_2024.traditional401k, grossAmount) * currentTax.marginalRate),
        message: `Maximizing your 401(k) could reduce your tax bill by up to ${formatCurrency(CONTRIBUTION_LIMITS_2024.traditional401k * currentTax.marginalRate)} per year!`
      }
    },
    
    bonusMoneyInsights: generateBonusMoneyMessages(grossAmount, taxCost, currentTax, userProfile),
    
    actionableSteps: generateActionableSteps(grossAmount, currentTax, userProfile, yearsUntilGoal)
  };
}

/**
 * Generate encouraging "bonus money" messages about tax optimization
 * @param {number} grossAmount - Goal amount after taxes
 * @param {number} taxCost - Amount lost to taxes
 * @param {Object} currentTax - Current tax situation
 * @param {Object} userProfile - User profile
 * @returns {Array} Array of encouraging tax optimization messages
 */
function generateBonusMoneyMessages(grossAmount, taxCost, currentTax, userProfile) {
  const dreamTitle = userProfile.northStarDream?.title || 'your dream';
  const state = userProfile.location?.state || 'your state';
  
  const messages = [
    {
      type: 'reality_check',
      title: 'The Tax Reality',
      message: `Right now, Uncle Sam and ${state} want ${formatCurrency(taxCost)} of your ${dreamTitle} fund. But we're going to outsmart them legally!`,
      tone: 'motivational'
    },
    {
      type: 'bonus_discovery',
      title: 'Hidden Bonus Money',
      message: `Every dollar you save in taxes is bonus money for ${dreamTitle}. Tax optimization isn't cheating - it's playing the game by smarter rules!`,
      tone: 'encouraging'
    },
    {
      type: 'compound_effect',
      title: 'Tax Savings That Multiply',
      message: `Save ${formatCurrency(currentTax.marginalRate * 1000)} in taxes, invest it for 10 years at 7%, and you've got ${formatCurrency(1000 * currentTax.marginalRate * Math.pow(1.07, 10))} extra for ${dreamTitle}!`,
      tone: 'exciting'
    },
    {
      type: 'immediate_action',
      title: 'Free Money Right Now',
      message: `Your marginal tax rate is ${(currentTax.marginalRate * 100).toFixed(1)}%. That means every $100 you put in a traditional 401(k) only costs you $${(100 * (1 - currentTax.marginalRate)).toFixed(0)} out of pocket!`,
      tone: 'actionable'
    }
  ];
  
  return messages;
}

/**
 * Generate actionable steps for tax optimization
 * @param {number} grossAmount - Goal amount
 * @param {Object} currentTax - Current tax situation
 * @param {Object} userProfile - User profile
 * @param {number} yearsUntilGoal - Years until goal
 * @returns {Array} Array of actionable tax optimization steps
 */
function generateActionableSteps(grossAmount, currentTax, userProfile, yearsUntilGoal) {
  const dreamTitle = userProfile.northStarDream?.title || 'your dream';
  const currentAge = userProfile.age || 35;
  const isNearRetirement = yearsUntilGoal >= (65 - currentAge);
  
  const steps = [
    {
      priority: 'high',
      action: 'Maximize employer 401(k) match',
      impact: 'Instant 100% return on investment',
      timeline: 'This paycheck',
      description: `If your employer matches 401(k) contributions, you're leaving free money on the table. It's like finding ${formatCurrency(currentTax.marginalRate * 1000)} under your couch cushions!`
    },
    {
      priority: 'high',
      action: `Choose ${isNearRetirement ? 'Roth' : 'Traditional'} accounts strategically`,
      impact: `Save ${formatCurrency(grossAmount * 0.15)} in lifetime taxes`,
      timeline: 'Next contribution',
      description: isNearRetirement ? 
        `Since you're close to retirement, Roth accounts give you tax-free income when you might need flexibility most.` :
        `Traditional accounts give you tax breaks now when you're earning more, then you pay lower taxes in retirement.`
    },
    {
      priority: 'medium',
      action: 'Consider HSA if available',
      impact: 'Triple tax advantage',
      timeline: 'Open enrollment',
      description: `HSAs are the ultimate tax hack: deductible going in, grows tax-free, and tax-free coming out for medical expenses. It's like a Roth IRA with superpowers!`
    },
    {
      priority: 'medium',
      action: 'Review state tax strategy',
      impact: `Potential ${formatCurrency(grossAmount * (STATE_TAX_RATES[userProfile.location?.state] || 0.05))} savings`,
      timeline: 'Before retirement',
      description: `Some retirees move to no-tax states and keep their money instead of giving it to the government. Your ${dreamTitle} could fund a lot more freedom!`
    }
  ];
  
  return steps;
}

/**
 * Suggest tax-advantaged approaches for specific dream goals
 * @param {Object} dreamGoal - Specific dream goal details
 * @param {Object} userProfile - User's financial profile
 * @returns {Object} Personalized tax-advantaged suggestions
 */
export function suggestTaxAdvantagedApproaches(dreamGoal, userProfile) {
  const {
    title = 'cottage',
    targetAmount = 400000,
    yearsToGoal = 7,
    category = 'home'
  } = dreamGoal;
  
  const taxAnalysis = calculateAfterTaxNeeded(targetAmount, userProfile, yearsToGoal);
  const currentAge = userProfile.age || 35;
  const retirementAge = 65;
  const isRetirementGoal = yearsToGoal >= (retirementAge - currentAge);
  
  const suggestions = [];
  
  // Retirement-related goals
  if (isRetirementGoal || category === 'retirement') {
    suggestions.push({
      strategy: 'Traditional 401(k) + IRA',
      taxSavings: taxAnalysis.taxOptimizationOpportunities.traditional401k.potentialSavings,
      message: `Contributing to a traditional 401(k) for your ${title} could save you ${formatCurrency(taxAnalysis.taxOptimizationOpportunities.traditional401k.potentialSavings)} in taxes annually. That's like getting a ${formatCurrency(taxAnalysis.taxOptimizationOpportunities.traditional401k.potentialSavings)} discount on your ${title}!`,
      confidence: 'high',
      timeline: 'Immediate',
      action: 'Increase 401(k) contribution percentage'
    });
    
    suggestions.push({
      strategy: 'Roth IRA Conversion Ladder',
      taxSavings: taxAnalysis.taxOptimizationOpportunities.rothIRA.potentialSavings,
      message: `A Roth conversion ladder could give you tax-free access to your ${title} fund in retirement. Every dollar grows tax-free forever - it's like your money earned a PhD in tax avoidance!`,
      confidence: 'medium',
      timeline: 'Multi-year strategy',
      action: 'Consult with tax professional for conversion timing'
    });
  }
  
  // Home purchase goals
  if (category === 'home' || title.toLowerCase().includes('house') || title.toLowerCase().includes('cottage')) {
    suggestions.push({
      strategy: 'First-Time Homebuyer IRA Withdrawal',
      taxSavings: Math.min(10000, targetAmount * 0.1),
      message: `You can withdraw up to $10,000 from an IRA penalty-free for your first home. That's ${formatCurrency(Math.min(10000, targetAmount * 0.1))} of bonus money the government actually encourages you to use for your ${title}!`,
      confidence: 'high',
      timeline: 'When ready to purchase',
      action: 'Verify first-time buyer eligibility'
    });
    
    suggestions.push({
      strategy: 'Employer Down Payment Assistance',
      taxSavings: 5000, // Estimated average
      message: `Many employers offer down payment assistance programs that can be tax-advantaged. Check if your company wants to help fund your ${title} - it's like they're invested in your happiness!`,
      confidence: 'medium',
      timeline: 'Research immediately',
      action: 'Check HR benefits portal'
    });
  }
  
  // Education goals
  if (category === 'education') {
    suggestions.push({
      strategy: '529 Education Savings Plan',
      taxSavings: targetAmount * (STATE_TAX_RATES[userProfile.location?.state] || 0.05),
      message: `A 529 plan grows tax-free for education expenses. Your ${title} fund could save ${formatCurrency(targetAmount * 0.05)} in state taxes, plus grow completely tax-free. It's like the government is paying you to get smarter!`,
      confidence: 'high',
      timeline: 'Open account this month',
      action: 'Research state-specific 529 benefits'
    });
  }
  
  // Healthcare goals
  if (category === 'healthcare' || title.toLowerCase().includes('medical')) {
    suggestions.push({
      strategy: 'Health Savings Account (HSA)',
      taxSavings: Math.min(targetAmount, 4300) * taxAnalysis.currentTaxSituation.marginalRate,
      message: `HSAs are the ultimate healthcare tax hack: deductible contributions, tax-free growth, and tax-free withdrawals for medical expenses. Your ${title} could be funded with triple tax-advantaged dollars!`,
      confidence: 'high',
      timeline: 'Next open enrollment',
      action: 'Switch to high-deductible health plan if beneficial'
    });
  }
  
  // General investment goals
  if (yearsToGoal > 5) {
    suggestions.push({
      strategy: 'Tax-Loss Harvesting',
      taxSavings: targetAmount * 0.02, // Estimated 2% annual benefit
      message: `Smart tax-loss harvesting could save you about ${formatCurrency(targetAmount * 0.02)} annually in taxes on your ${title} investments. It's like turning market volatility into a tax discount!`,
      confidence: 'medium',
      timeline: 'Ongoing strategy',
      action: 'Use tax-loss harvesting investment platform'
    });
  }
  
  // Calculate total potential savings
  const totalPotentialSavings = suggestions.reduce((sum, suggestion) => sum + suggestion.taxSavings, 0);
  
  return {
    dreamGoal: {
      title,
      targetAmount: formatCurrency(targetAmount),
      yearsToGoal,
      afterTaxCost: formatCurrency(taxAnalysis.goalDetails.grossAmountNeeded)
    },
    
    taxImpact: {
      grossAmountNeeded: formatCurrency(taxAnalysis.goalDetails.grossAmountNeeded),
      taxCost: formatCurrency(taxAnalysis.goalDetails.taxCost),
      taxMultiplier: taxAnalysis.goalDetails.taxMultiplier,
      currentTaxRate: taxAnalysis.currentTaxSituation.effectiveRate
    },
    
    suggestions: suggestions.sort((a, b) => b.taxSavings - a.taxSavings), // Sort by potential savings
    
    totalImpact: {
      potentialSavings: formatCurrency(totalPotentialSavings),
      percentOfGoal: ((totalPotentialSavings / targetAmount) * 100).toFixed(1) + '%',
      message: `These tax strategies could save you ${formatCurrency(totalPotentialSavings)} on your ${title} - that's ${((totalPotentialSavings / targetAmount) * 100).toFixed(1)}% of your goal funded by outsmarting the tax code!`
    },
    
    nextSteps: [
      'Review current retirement account contributions',
      'Research employer benefits and assistance programs',
      'Consider meeting with a tax professional',
      'Evaluate state-specific tax advantages',
      'Set up automatic contributions to tax-advantaged accounts'
    ],
    
    motivationalMessage: `Every tax dollar you save is a dollar that goes directly to your ${title} instead of disappearing into government programs. You've worked hard for this money - let's make sure you keep as much as possible for the things that matter to you!`
  };
}

/**
 * Calculate tax-efficient withdrawal strategies for retirement goals
 * @param {Object} retirementProfile - Retirement savings profile
 * @param {Object} userProfile - User's current profile
 * @returns {Object} Tax-efficient withdrawal strategy
 */
export function calculateTaxEfficientWithdrawal(retirementProfile, userProfile) {
  const {
    traditional401k = 500000,
    rothIRA = 200000,
    brokerage = 150000,
    pensionIncome = 0,
    socialSecurity = 24000
  } = retirementProfile;
  
  const currentAge = userProfile.age || 35;
  const retirementAge = 65;
  const state = userProfile.location?.state || 'California';
  const filingStatus = 'single'; // Simplified
  
  // Calculate optimal withdrawal sequence
  const totalRetirementAssets = traditional401k + rothIRA + brokerage;
  const guaranteedIncome = pensionIncome + socialSecurity;
  
  // Project retirement tax brackets
  const retirementTax = projectRetirementTaxBrackets(
    userProfile.income?.gross?.annual || 75000,
    retirementAge - currentAge,
    guaranteedIncome + 40000, // Assume some withdrawals
    state,
    filingStatus
  );
  
  // Withdrawal strategy: Fill lower tax brackets with traditional accounts first
  const standardDeduction = retirementTax.retirement.standardDeduction;
  const lowTaxBracketLimit = 50000; // Simplified - first few brackets
  
  const optimalWithdrawalStrategy = {
    phase1: {
      ages: '65-70',
      strategy: 'Traditional account withdrawals',
      rationale: 'Fill up lower tax brackets while they\'re available',
      annualAmount: Math.min(40000, lowTaxBracketLimit - guaranteedIncome),
      taxRate: '10-12%',
      message: `Withdraw ${formatCurrency(40000)} annually from traditional accounts to stay in low tax brackets. This is like getting a senior discount on your own money!`
    },
    
    phase2: {
      ages: '70+',
      strategy: 'Required minimum distributions + Roth supplements',
      rationale: 'RMDs force traditional withdrawals, supplement with tax-free Roth',
      annualAmount: traditional401k * 0.04, // Simplified RMD calculation
      taxRate: 'Variable',
      message: `At 70, you'll need to take ${formatCurrency(traditional401k * 0.04)} in required distributions. Supplement with Roth withdrawals for tax-free income!`
    },
    
    phase3: {
      ages: 'As needed',
      strategy: 'Brokerage account for large expenses',
      rationale: 'Long-term capital gains rates are lower than ordinary income',
      annualAmount: 'Variable',
      taxRate: '0-20%',
      message: `For big expenses, use brokerage accounts with favorable capital gains treatment. It\'s like the government gives you a discount for being patient!`
    }
  };
  
  // Calculate lifetime tax savings from optimal strategy
  const suboptimalLifetimeTax = totalRetirementAssets * 0.25; // Assume 25% average tax
  const optimalLifetimeTax = totalRetirementAssets * 0.15; // Assume 15% with strategy
  const lifetimeSavings = suboptimalLifetimeTax - optimalLifetimeTax;
  
  return {
    currentSituation: {
      traditional401k: formatCurrency(traditional401k),
      rothIRA: formatCurrency(rothIRA),
      brokerage: formatCurrency(brokerage),
      totalAssets: formatCurrency(totalRetirementAssets),
      guaranteedIncome: formatCurrency(guaranteedIncome)
    },
    
    withdrawalStrategy: optimalWithdrawalStrategy,
    
    taxImpact: {
      suboptimalApproach: formatCurrency(suboptimalLifetimeTax),
      optimalApproach: formatCurrency(optimalLifetimeTax),
      lifetimeSavings: formatCurrency(lifetimeSavings),
      savingsPercentage: ((lifetimeSavings / totalRetirementAssets) * 100).toFixed(1) + '%'
    },
    
    actionableInsights: [
      {
        action: 'Roth conversions in low-income years',
        benefit: 'Convert traditional funds to Roth when your tax rate is temporarily low',
        timing: 'Between retirement and age 70',
        impact: formatCurrency(lifetimeSavings * 0.3)
      },
      {
        action: 'Geographic arbitrage',
        benefit: 'Consider retiring in a no-tax state',
        timing: 'Before retirement',
        impact: formatCurrency(totalRetirementAssets * (STATE_TAX_RATES[state] || 0.05))
      },
      {
        action: 'Charitable giving strategies',
        benefit: 'Qualified charitable distributions from IRAs',
        timing: 'Age 70.5+',
        impact: 'Tax-free fulfillment of RMDs'
      }
    ],
    
    bonusMoneyMessage: `Smart withdrawal sequencing could save you ${formatCurrency(lifetimeSavings)} in lifetime taxes. That's like finding an extra ${((lifetimeSavings / totalRetirementAssets) * 100).toFixed(1)}% return on your entire retirement portfolio just by being strategic about timing!`,
    
    nextSteps: [
      'Model Roth conversion opportunities',
      'Research state tax implications of retirement location',
      'Consider tax-loss harvesting in brokerage accounts',
      'Plan charitable giving strategy if applicable',
      'Review beneficiary designations for tax efficiency'
    ]
  };
}

/**
 * Compare tax impact of different savings vehicles for a specific goal
 * @param {number} monthlyContribution - Monthly savings amount
 * @param {number} yearsToGoal - Years until goal is needed
 * @param {Object} userProfile - User's financial profile
 * @returns {Object} Comparison of different savings approaches
 */
export function compareSavingsVehicleTaxImpact(monthlyContribution, yearsToGoal, userProfile) {
  const annualContribution = monthlyContribution * 12;
  const currentAge = userProfile.age || 35;
  const retirementAge = 65;
  const isRetirementGoal = yearsToGoal >= (retirementAge - currentAge);
  
  const taxSituation = calculateEffectiveTaxRate(
    userProfile.income?.gross?.annual || 75000,
    userProfile.location?.state || 'California',
    'single'
  );
  
  // Assume 7% annual return
  const annualReturn = 0.07;
  const futureValue = monthlyContribution * (Math.pow(1 + annualReturn/12, yearsToGoal * 12) - 1) / (annualReturn/12);
  
  const scenarios = {
    taxableAccount: {
      name: 'Regular Savings/Investment Account',
      upfrontTaxSavings: 0,
      futureValue: futureValue * (1 - 0.15), // Assume 15% capital gains tax
      withdrawalTaxes: futureValue * 0.15,
      netAmount: futureValue * 0.85,
      pros: ['Flexible access', 'No contribution limits', 'Lower capital gains rates'],
      cons: ['No tax deduction', 'Taxes on gains', 'Taxes on dividends'],
      message: `Your money grows but Uncle Sam takes ${formatCurrency(futureValue * 0.15)} in capital gains taxes. It's like having a silent partner who didn't do any of the work!`
    },
    
    traditional401k: {
      name: 'Traditional 401(k)',
      upfrontTaxSavings: annualContribution * taxSituation.marginalRate * yearsToGoal,
      futureValue: futureValue,
      withdrawalTaxes: isRetirementGoal ? futureValue * 0.15 : futureValue * taxSituation.marginalRate,
      netAmount: isRetirementGoal ? futureValue * 0.85 : futureValue * (1 - taxSituation.marginalRate),
      pros: ['Immediate tax deduction', 'Employer matching potential', 'Lower retirement tax rates'],
      cons: ['Required minimum distributions', 'Early withdrawal penalties', 'Ordinary income tax rates'],
      message: `Save ${formatCurrency(annualContribution * taxSituation.marginalRate)} in taxes each year, then pay lower rates in retirement. It's like getting a government loan at 0% interest!`
    },
    
    rothIRA: {
      name: 'Roth IRA',
      upfrontTaxSavings: 0,
      futureValue: futureValue,
      withdrawalTaxes: 0,
      netAmount: futureValue,
      pros: ['Tax-free growth', 'Tax-free withdrawals', 'No required distributions'],
      cons: ['No upfront tax deduction', 'Income limits', 'Contribution limits'],
      message: `Pay taxes now, never again. Every dollar of growth is pure bonus money - ${formatCurrency(futureValue - (annualContribution * yearsToGoal))} of tax-free gains!`
    },
    
    hsa: {
      name: 'Health Savings Account (if eligible)',
      upfrontTaxSavings: Math.min(annualContribution, 4300) * taxSituation.marginalRate * yearsToGoal,
      futureValue: futureValue,
      withdrawalTaxes: 0, // For medical expenses
      netAmount: futureValue,
      pros: ['Triple tax advantage', 'No use-it-or-lose-it', 'Becomes IRA at age 65'],
      cons: ['High-deductible health plan required', 'Medical expenses only (until 65)', 'Contribution limits'],
      message: `The ultimate tax hack: deductible, grows tax-free, withdraws tax-free for medical expenses. It's like the government paying you to stay healthy!`
    }
  };
  
  // Calculate best scenario
  const bestScenario = Object.entries(scenarios).reduce((best, [key, scenario]) => {
    const totalBenefit = scenario.netAmount + scenario.upfrontTaxSavings;
    return totalBenefit > (best.totalBenefit || 0) ? 
      { name: key, scenario, totalBenefit } : best;
  }, {});
  
  return {
    contributionDetails: {
      monthly: formatCurrency(monthlyContribution),
      annual: formatCurrency(annualContribution),
      years: yearsToGoal,
      totalContributions: formatCurrency(annualContribution * yearsToGoal),
      expectedValue: formatCurrency(futureValue)
    },
    
    scenarios: Object.fromEntries(
      Object.entries(scenarios).map(([key, scenario]) => [
        key,
        {
          ...scenario,
          upfrontTaxSavings: formatCurrency(scenario.upfrontTaxSavings),
          futureValue: formatCurrency(scenario.futureValue),
          withdrawalTaxes: formatCurrency(scenario.withdrawalTaxes),
          netAmount: formatCurrency(scenario.netAmount),
          totalBenefit: formatCurrency(scenario.netAmount + scenario.upfrontTaxSavings)
        }
      ])
    ),
    
    recommendation: {
      bestChoice: bestScenario.name,
      reason: bestScenario.scenario.message,
      advantage: formatCurrency(bestScenario.totalBenefit - Math.min(...Object.values(scenarios).map(s => s.netAmount + s.upfrontTaxSavings))),
      confidence: 'high'
    },
    
    taxOptimizationTips: [
      'Max out employer 401(k) match first - it\'s free money',
      'Consider your current vs. future tax bracket',
      'Diversify tax treatment (traditional + Roth)',
      'Use HSA if available - triple tax advantage',
      'Don\'t let perfect be the enemy of good - start somewhere!'
    ],
    
    motivationalMessage: `The difference between the best and worst tax strategy here is ${formatCurrency(Math.max(...Object.values(scenarios).map(s => s.netAmount + s.upfrontTaxSavings)) - Math.min(...Object.values(scenarios).map(s => s.netAmount + s.upfrontTaxSavings)))}. That's not just money - that's freedom, choices, and the power to live life on your terms!`
  };
}

export default {
  calculateAfterTaxNeeded,
  suggestTaxAdvantagedApproaches,
  calculateTaxEfficientWithdrawal,
  compareSavingsVehicleTaxImpact,
  calculateEffectiveTaxRate,
  projectRetirementTaxBrackets,
  formatCurrency
};
