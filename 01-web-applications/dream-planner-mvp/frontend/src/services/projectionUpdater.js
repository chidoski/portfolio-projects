/**
 * Projection Updater Service
 * Recalculates all timelines when market conditions, life events, or economic factors change
 * Focuses on tangible impact to cottage timeline rather than abstract percentages
 */

import { calculateSavingsStrategies, calculateTargetDate, formatCurrency } from './dreamCalculations.js';

/**
 * Standard cottage cost for reference (used as baseline for impact calculations)
 * This would typically come from user's profile/dream data
 */
const DEFAULT_COTTAGE_COST = 400000; // $400k cottage dream

/**
 * Market condition constants based on historical data
 */
const MARKET_CONSTANTS = {
  // Conservative investment returns
  conservative: {
    stocks: 0.06,  // 6% during market downturns
    bonds: 0.03,   // 3% bonds in tough times
    cash: 0.015    // 1.5% high-yield savings
  },
  
  // Normal market conditions
  normal: {
    stocks: 0.10,  // 10% historical S&P 500
    bonds: 0.05,   // 5% bond returns
    cash: 0.025    // 2.5% savings rates
  },
  
  // Optimistic market conditions
  optimistic: {
    stocks: 0.14,  // 14% in bull markets
    bonds: 0.07,   // 7% bonds in good times
    cash: 0.04     // 4% when rates are high
  },

  // Typical asset allocation for different buckets
  assetAllocation: {
    foundation: { stocks: 0.80, bonds: 0.15, cash: 0.05 }, // Aggressive long-term
    dream: { stocks: 0.60, bonds: 0.30, cash: 0.10 },      // Moderate 5-7 year goal
    life: { stocks: 0.20, bonds: 0.30, cash: 0.50 }        // Conservative short-term
  }
};

/**
 * Life event impact factors on savings and spending
 */
const LIFE_EVENT_IMPACTS = {
  marriage: {
    incomeChange: 0.75,      // 75% combined income efficiency (some duplication)
    expenseChange: 0.85,     // 85% combined expenses (shared costs)
    oneTimeCost: 15000,      // Wedding costs
    monthlyChange: 800       // Net monthly savings increase
  },
  
  firstChild: {
    incomeChange: 0.95,      // 95% income (maybe some time off)
    expenseChange: 1.25,     // 25% expense increase
    oneTimeCost: 8000,       // Baby prep costs
    monthlyChange: -1200     // Net monthly savings decrease
  },
  
  secondChild: {
    incomeChange: 1.0,       // Income stable
    expenseChange: 1.15,     // 15% additional expense increase
    oneTimeCost: 3000,       // Less prep needed
    monthlyChange: -600      // Smaller impact than first child
  },
  
  jobPromotion: {
    incomeChange: 1.25,      // 25% income increase
    expenseChange: 1.05,     // 5% lifestyle inflation
    oneTimeCost: 0,
    monthlyChange: 2000      // Significant monthly boost
  },
  
  jobLoss: {
    incomeChange: 0.65,      // 65% income replacement (unemployment/new job)
    expenseChange: 0.85,     // 15% expense reduction
    oneTimeCost: 5000,       // Job search costs
    monthlyChange: -2500     // Major monthly impact
  },
  
  homeUpgrade: {
    incomeChange: 1.0,       // Income unchanged
    expenseChange: 1.20,     // 20% expense increase (mortgage/maintenance)
    oneTimeCost: 25000,      // Down payment/moving costs
    monthlyChange: -1500     // Higher monthly housing costs
  },
  
  parentCare: {
    incomeChange: 0.90,      // 10% income reduction (time off)
    expenseChange: 1.15,     // 15% expense increase
    oneTimeCost: 10000,      // Initial care setup
    monthlyChange: -1800     // Ongoing care costs
  }
};

/**
 * Update financial projections for inflation changes
 * @param {Object} currentProfile - User's current financial profile
 * @param {number} inflationRate - New inflation rate (as decimal, e.g., 0.05 for 5%)
 * @returns {Object} Updated profile with inflation impact and cottage timeline effect
 */
export function updateForInflation(currentProfile, inflationRate) {
  const originalProfile = { ...currentProfile };
  
  // Calculate years to cottage goal
  const cottageGoal = currentProfile.dreams?.cottage || { amount: DEFAULT_COTTAGE_COST, targetDate: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000) };
  const yearsToGoal = Math.ceil((new Date(cottageGoal.targetDate) - new Date()) / (365 * 24 * 60 * 60 * 1000));
  
  // Apply inflation to future costs
  const inflationFactor = Math.pow(1 + inflationRate, yearsToGoal);
  const inflatedCottageAmount = cottageGoal.amount * inflationFactor;
  const additionalNeeded = inflatedCottageAmount - cottageGoal.amount;
  
  // Calculate impact on monthly savings needed
  const monthsToGoal = yearsToGoal * 12;
  const additionalMonthlySavings = additionalNeeded / monthsToGoal;
  
  // Apply inflation to current expenses (they'll grow over time)
  const currentExpenses = currentProfile.monthlyExpenses || 0;
  const inflatedExpenses = currentExpenses * Math.pow(1 + inflationRate, 1); // Next year's expenses
  const monthlyExpenseIncrease = inflatedExpenses - currentExpenses;
  
  // Calculate new available savings
  const currentMonthlySavings = (currentProfile.monthlyIncome || 0) - currentExpenses;
  const newMonthlySavings = currentMonthlySavings - monthlyExpenseIncrease;
  
  // Recalculate cottage timeline with new requirements
  const originalTimelineResult = calculateTargetDate(cottageGoal.amount, currentMonthlySavings, 'monthly');
  const newTimelineResult = calculateTargetDate(inflatedCottageAmount, newMonthlySavings, 'monthly');
  
  // Calculate timeline delay
  const originalDays = originalTimelineResult.daysNeeded;
  const newDays = newTimelineResult.daysNeeded;
  const additionalDays = newDays - originalDays;
  const additionalYears = Math.round((additionalDays / 365) * 10) / 10; // Round to 1 decimal

  const updatedProfile = {
    ...currentProfile,
    monthlyExpenses: currentExpenses, // Keep current, but note the pressure
    projectedExpenses: inflatedExpenses,
    inflationAdjustedGoals: {
      cottage: {
        originalAmount: cottageGoal.amount,
        inflatedAmount: Math.round(inflatedCottageAmount),
        additionalNeeded: Math.round(additionalNeeded),
        inflationRate: inflationRate
      }
    },
    cottageImpact: {
      timelineChange: {
        originalYears: Math.round((originalDays / 365) * 10) / 10,
        newYears: Math.round((newDays / 365) * 10) / 10,
        additionalYears: additionalYears,
        additionalMonths: Math.round(additionalYears * 12)
      },
      savingsImpact: {
        additionalMonthlySavings: Math.round(additionalMonthlySavings),
        monthlyExpenseIncrease: Math.round(monthlyExpenseIncrease),
        totalMonthlyImpact: Math.round(additionalMonthlySavings + monthlyExpenseIncrease)
      },
      inflationImpact: {
        cottageWillCost: Math.round(inflatedCottageAmount),
        extraNeeded: Math.round(additionalNeeded),
        yearlyInflationRate: Math.round(inflationRate * 100 * 10) / 10
      }
    },
    lastUpdated: new Date().toISOString(),
    updateReason: 'inflation_adjustment'
  };

  return {
    updatedProfile,
    impact: {
      summary: `Inflation of ${Math.round(inflationRate * 100)}% will delay your cottage by ${additionalYears} years`,
      details: {
        costIncrease: formatCurrency(additionalNeeded),
        timeDelay: `${additionalYears} years (${Math.round(additionalYears * 12)} months)`,
        extraMonthlySavings: formatCurrency(additionalMonthlySavings + monthlyExpenseIncrease),
        newCottageCost: formatCurrency(inflatedCottageAmount)
      },
      severity: additionalYears > 2 ? 'high' : additionalYears > 1 ? 'medium' : 'low',
      actionRequired: additionalYears > 1
    }
  };
}

/**
 * Update financial projections for investment return changes
 * @param {Object} investments - Current investment portfolio and allocation
 * @param {number} actualReturn - Actual return rate experienced (as decimal)
 * @returns {Object} Updated projections with cottage timeline impact
 */
export function updateForReturns(investments, actualReturn) {
  const currentValue = investments.totalValue || 0;
  const monthlyContribution = investments.monthlyContribution || 0;
  const yearsToGoal = investments.yearsToGoal || 7;
  const targetAmount = investments.targetAmount || DEFAULT_COTTAGE_COST;
  
  // Calculate projected value with different return scenarios
  const scenarios = {
    conservative: calculateCompoundGrowth(currentValue, monthlyContribution, MARKET_CONSTANTS.conservative.stocks, yearsToGoal),
    normal: calculateCompoundGrowth(currentValue, monthlyContribution, MARKET_CONSTANTS.normal.stocks, yearsToGoal),
    actual: calculateCompoundGrowth(currentValue, monthlyContribution, actualReturn, yearsToGoal),
    optimistic: calculateCompoundGrowth(currentValue, monthlyContribution, MARKET_CONSTANTS.optimistic.stocks, yearsToGoal)
  };
  
  // Calculate how long it will take with actual returns
  const actualTimeToGoal = calculateTimeToTarget(currentValue, monthlyContribution, actualReturn, targetAmount);
  const normalTimeToGoal = calculateTimeToTarget(currentValue, monthlyContribution, MARKET_CONSTANTS.normal.stocks, targetAmount);
  
  // Calculate timeline impact
  const timelineDifference = actualTimeToGoal - normalTimeToGoal;
  const isAhead = timelineDifference < 0;
  const timeImpact = Math.abs(timelineDifference);
  
  // Calculate if monthly contribution needs to change
  const requiredMonthlyForOriginalTimeline = calculateRequiredMonthly(currentValue, actualReturn, yearsToGoal, targetAmount);
  const monthlyDifference = requiredMonthlyForOriginalTimeline - monthlyContribution;

  return {
    scenarios,
    cottageImpact: {
      timelineChange: {
        actualYearsToGoal: Math.round(actualTimeToGoal * 10) / 10,
        originalYearsToGoal: Math.round(normalTimeToGoal * 10) / 10,
        difference: isAhead ? -timeImpact : timeImpact,
        isAhead: isAhead,
        monthsImpact: Math.round(timeImpact * 12)
      },
      returnImpact: {
        actualReturn: Math.round(actualReturn * 100 * 10) / 10,
        expectedReturn: Math.round(MARKET_CONSTANTS.normal.stocks * 100 * 10) / 10,
        difference: Math.round((actualReturn - MARKET_CONSTANTS.normal.stocks) * 100 * 10) / 10,
        projectedValue: Math.round(scenarios.actual.finalValue),
        expectedValue: Math.round(scenarios.normal.finalValue),
        valueGap: Math.round(scenarios.actual.finalValue - scenarios.normal.finalValue)
      },
      adjustmentOptions: {
        maintainTimeline: {
          requiredMonthly: Math.round(requiredMonthlyForOriginalTimeline),
          currentMonthly: monthlyContribution,
          additionalNeeded: Math.round(monthlyDifference),
          feasible: monthlyDifference <= (monthlyContribution * 0.5) // Within 50% increase
        },
        maintainContribution: {
          newTargetDate: new Date(Date.now() + actualTimeToGoal * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          timelineDelay: Math.round(timeImpact * 12), // in months
          finalValue: Math.round(scenarios.actual.finalValue)
        }
      }
    },
    impact: {
      summary: isAhead 
        ? `Better returns will get you to the cottage ${timeImpact.toFixed(1)} years earlier`
        : `Lower returns will delay your cottage by ${timeImpact.toFixed(1)} years`,
      details: {
        returnDifference: `${(actualReturn - MARKET_CONSTANTS.normal.stocks) * 100 > 0 ? '+' : ''}${((actualReturn - MARKET_CONSTANTS.normal.stocks) * 100).toFixed(1)}%`,
        timeImpact: `${isAhead ? '-' : '+'}${timeImpact.toFixed(1)} years`,
        valueImpact: formatCurrency(scenarios.actual.finalValue - scenarios.normal.finalValue),
        monthlyAdjustment: monthlyDifference > 0 ? formatCurrency(monthlyDifference) : 'No increase needed'
      },
      severity: timeImpact > 2 ? 'high' : timeImpact > 1 ? 'medium' : 'low',
      favorable: isAhead
    },
    lastUpdated: new Date().toISOString(),
    updateReason: 'return_adjustment'
  };
}

/**
 * Update financial projections for major life events
 * @param {Object} profile - Current financial profile
 * @param {string} majorLifeEvent - Type of life event (marriage, firstChild, jobPromotion, etc.)
 * @returns {Object} Updated profile with life event impact on cottage timeline
 */
export function updateForLife(profile, majorLifeEvent) {
  const eventImpact = LIFE_EVENT_IMPACTS[majorLifeEvent];
  
  if (!eventImpact) {
    throw new Error(`Unknown life event: ${majorLifeEvent}. Available events: ${Object.keys(LIFE_EVENT_IMPACTS).join(', ')}`);
  }

  const originalIncome = profile.monthlyIncome || 0;
  const originalExpenses = profile.monthlyExpenses || 0;
  const originalSavings = originalIncome - originalExpenses;
  const currentAssets = profile.currentAssets || 0;
  
  // Apply life event changes
  const newIncome = originalIncome * eventImpact.incomeChange;
  const newExpenses = originalExpenses * eventImpact.expenseChange;
  const newSavings = newIncome - newExpenses + eventImpact.monthlyChange;
  const newAssets = Math.max(0, currentAssets - eventImpact.oneTimeCost);
  
  // Calculate cottage timeline impact
  const cottageGoal = profile.dreams?.cottage || { amount: DEFAULT_COTTAGE_COST, targetDate: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000) };
  
  // Calculate original timeline
  const originalTimelineResult = calculateTargetDate(cottageGoal.amount - currentAssets, originalSavings, 'monthly');
  
  // Calculate new timeline
  const remainingAmount = Math.max(0, cottageGoal.amount - newAssets);
  const newTimelineResult = newSavings > 0 
    ? calculateTargetDate(remainingAmount, newSavings, 'monthly')
    : { daysNeeded: Infinity, targetDate: 'Never at current rate' };
  
  // Calculate impact
  const originalYears = originalTimelineResult.daysNeeded / 365;
  const newYears = newTimelineResult.daysNeeded === Infinity ? Infinity : newTimelineResult.daysNeeded / 365;
  const timelineChange = newYears === Infinity ? Infinity : newYears - originalYears;
  
  // Determine event impact severity and type
  const isPositive = eventImpact.monthlyChange > 0;
  const impactMagnitude = Math.abs(eventImpact.monthlyChange);
  
  const updatedProfile = {
    ...profile,
    monthlyIncome: Math.round(newIncome),
    monthlyExpenses: Math.round(newExpenses),
    currentAssets: Math.round(newAssets),
    lifeEventHistory: [
      ...(profile.lifeEventHistory || []),
      {
        event: majorLifeEvent,
        date: new Date().toISOString(),
        impact: eventImpact,
        financialChanges: {
          incomeChange: Math.round(newIncome - originalIncome),
          expenseChange: Math.round(newExpenses - originalExpenses),
          savingsChange: Math.round(newSavings - originalSavings),
          oneTimeCost: eventImpact.oneTimeCost
        }
      }
    ],
    cottageImpact: {
      timelineChange: {
        originalYears: Math.round(originalYears * 10) / 10,
        newYears: newYears === Infinity ? 'Never' : Math.round(newYears * 10) / 10,
        difference: timelineChange === Infinity ? 'Never' : Math.round(timelineChange * 10) / 10,
        monthsImpact: timelineChange === Infinity ? 'Never' : Math.round(timelineChange * 12)
      },
      financialImpact: {
        incomeChange: Math.round(newIncome - originalIncome),
        expenseChange: Math.round(newExpenses - originalExpenses),
        netSavingsChange: Math.round(newSavings - originalSavings),
        oneTimeCost: eventImpact.oneTimeCost,
        newMonthlySavings: Math.round(newSavings)
      },
      assetImpact: {
        originalAssets: currentAssets,
        newAssets: Math.round(newAssets),
        assetChange: Math.round(newAssets - currentAssets)
      }
    },
    lastUpdated: new Date().toISOString(),
    updateReason: `life_event_${majorLifeEvent}`
  };

  // Generate impact summary
  const eventNames = {
    marriage: 'Getting married',
    firstChild: 'Having your first child',
    secondChild: 'Having a second child',
    jobPromotion: 'Getting promoted',
    jobLoss: 'Job loss',
    homeUpgrade: 'Upgrading your home',
    parentCare: 'Caring for aging parents'
  };

  let summary;
  if (timelineChange === Infinity) {
    summary = `${eventNames[majorLifeEvent]} will halt progress toward your cottage - need to increase income or reduce expenses`;
  } else if (isPositive) {
    summary = `${eventNames[majorLifeEvent]} will get you to the cottage ${Math.abs(timelineChange).toFixed(1)} years earlier!`;
  } else {
    summary = `${eventNames[majorLifeEvent]} will delay your cottage by ${Math.abs(timelineChange).toFixed(1)} years`;
  }

  return {
    updatedProfile,
    impact: {
      summary,
      details: {
        incomeChange: `${newIncome > originalIncome ? '+' : ''}${formatCurrency(newIncome - originalIncome)}/month`,
        expenseChange: `${newExpenses > originalExpenses ? '+' : ''}${formatCurrency(newExpenses - originalExpenses)}/month`,
        savingsChange: `${newSavings > originalSavings ? '+' : ''}${formatCurrency(newSavings - originalSavings)}/month`,
        oneTimeCost: eventImpact.oneTimeCost > 0 ? formatCurrency(eventImpact.oneTimeCost) : 'None',
        timelineImpact: timelineChange === Infinity ? 'Indefinite delay' : `${timelineChange > 0 ? '+' : ''}${timelineChange.toFixed(1)} years`,
        newTargetDate: newTimelineResult.targetDate
      },
      severity: timelineChange === Infinity ? 'critical' : Math.abs(timelineChange) > 3 ? 'high' : Math.abs(timelineChange) > 1 ? 'medium' : 'low',
      favorable: isPositive,
      actionRequired: timelineChange === Infinity || Math.abs(timelineChange) > 2
    }
  };
}

/**
 * Calculate compound growth with regular contributions
 * @param {number} principal - Initial amount
 * @param {number} monthlyContribution - Monthly addition
 * @param {number} annualRate - Annual return rate
 * @param {number} years - Number of years
 * @returns {Object} Growth calculation results
 */
function calculateCompoundGrowth(principal, monthlyContribution, annualRate, years) {
  const monthlyRate = annualRate / 12;
  const totalMonths = years * 12;
  
  // Future value of principal
  const principalGrowth = principal * Math.pow(1 + annualRate, years);
  
  // Future value of annuity (monthly contributions)
  const contributionGrowth = monthlyContribution * 
    (Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate;
  
  const finalValue = principalGrowth + contributionGrowth;
  const totalContributions = monthlyContribution * totalMonths;
  const totalGrowth = finalValue - principal - totalContributions;
  
  return {
    finalValue,
    totalContributions,
    totalGrowth,
    principalGrowth: principalGrowth - principal,
    contributionGrowth,
    effectiveRate: Math.pow(finalValue / (principal + totalContributions), 1/years) - 1
  };
}

/**
 * Calculate time needed to reach a target with compound growth
 * @param {number} principal - Current amount
 * @param {number} monthlyContribution - Monthly addition
 * @param {number} annualRate - Annual return rate
 * @param {number} target - Target amount
 * @returns {number} Years needed to reach target
 */
function calculateTimeToTarget(principal, monthlyContribution, annualRate, target) {
  if (monthlyContribution <= 0 && principal >= target) {
    return 0;
  }
  
  if (monthlyContribution <= 0 && principal < target) {
    return Infinity; // Never reach target without contributions
  }
  
  const monthlyRate = annualRate / 12;
  
  // If no return, simple linear calculation
  if (annualRate === 0) {
    return (target - principal) / (monthlyContribution * 12);
  }
  
  // Use iterative approach for complex compound interest with contributions
  let currentValue = principal;
  let months = 0;
  const maxMonths = 50 * 12; // Maximum 50 years
  
  while (currentValue < target && months < maxMonths) {
    currentValue = currentValue * (1 + monthlyRate) + monthlyContribution;
    months++;
  }
  
  return months >= maxMonths ? Infinity : months / 12;
}

/**
 * Calculate required monthly contribution to reach target in specified time
 * @param {number} principal - Current amount
 * @param {number} annualRate - Annual return rate
 * @param {number} years - Years available
 * @param {number} target - Target amount
 * @returns {number} Required monthly contribution
 */
function calculateRequiredMonthly(principal, annualRate, years, target) {
  const monthlyRate = annualRate / 12;
  const totalMonths = years * 12;
  
  // Future value of current principal
  const principalFuture = principal * Math.pow(1 + annualRate, years);
  
  // Amount needed from contributions
  const neededFromContributions = target - principalFuture;
  
  if (neededFromContributions <= 0) {
    return 0; // Already have enough
  }
  
  if (annualRate === 0) {
    return neededFromContributions / totalMonths;
  }
  
  // PMT = FV * r / ((1 + r)^n - 1)
  const denominator = Math.pow(1 + monthlyRate, totalMonths) - 1;
  return neededFromContributions * monthlyRate / denominator;
}

/**
 * Get cottage timeline impact summary for any type of update
 * @param {Object} beforeProfile - Profile before update
 * @param {Object} afterProfile - Profile after update
 * @param {string} updateType - Type of update (inflation, returns, life_event)
 * @returns {Object} Human-readable impact summary
 */
export function getCottageTimelineImpact(beforeProfile, afterProfile, updateType) {
  const before = beforeProfile.cottageImpact?.timelineChange;
  const after = afterProfile.cottageImpact?.timelineChange;
  
  if (!before || !after) {
    return {
      summary: 'Unable to calculate timeline impact',
      severity: 'unknown'
    };
  }
  
  const timeDifference = after.newYears - before.originalYears;
  const isImprovement = timeDifference < 0;
  const magnitude = Math.abs(timeDifference);
  
  const impactMessages = {
    inflation: {
      positive: `Lower inflation gives you ${magnitude.toFixed(1)} extra years to reach your cottage`,
      negative: `Higher inflation delays your cottage by ${magnitude.toFixed(1)} years`
    },
    returns: {
      positive: `Better market returns get you to the cottage ${magnitude.toFixed(1)} years sooner`,
      negative: `Market downturn delays your cottage by ${magnitude.toFixed(1)} years`
    },
    life_event: {
      positive: `This life change accelerates your cottage timeline by ${magnitude.toFixed(1)} years`,
      negative: `This life change delays your cottage by ${magnitude.toFixed(1)} years`
    }
  };
  
  const messageType = isImprovement ? 'positive' : 'negative';
  const summary = impactMessages[updateType]?.[messageType] || 
    `This change ${isImprovement ? 'improves' : 'worsens'} your cottage timeline by ${magnitude.toFixed(1)} years`;
  
  return {
    summary,
    severity: magnitude > 3 ? 'high' : magnitude > 1 ? 'medium' : 'low',
    favorable: isImprovement,
    yearImpact: isImprovement ? -magnitude : magnitude,
    monthImpact: Math.round((isImprovement ? -magnitude : magnitude) * 12)
  };
}

/**
 * Run comprehensive projection update combining multiple factors
 * @param {Object} currentProfile - Current financial profile
 * @param {Object} changes - Object containing multiple change types
 * @returns {Object} Comprehensive update results
 */
export function updateProjections(currentProfile, changes = {}) {
  let updatedProfile = { ...currentProfile };
  const impacts = [];
  
  // Apply inflation adjustments
  if (changes.inflationRate !== undefined) {
    const inflationResult = updateForInflation(updatedProfile, changes.inflationRate);
    updatedProfile = inflationResult.updatedProfile;
    impacts.push({
      type: 'inflation',
      ...inflationResult.impact
    });
  }
  
  // Apply return adjustments
  if (changes.actualReturn !== undefined && changes.investments) {
    const returnResult = updateForReturns(changes.investments, changes.actualReturn);
    updatedProfile = {
      ...updatedProfile,
      investments: returnResult.scenarios,
      ...returnResult
    };
    impacts.push({
      type: 'returns',
      ...returnResult.impact
    });
  }
  
  // Apply life event changes
  if (changes.lifeEvent) {
    const lifeResult = updateForLife(updatedProfile, changes.lifeEvent);
    updatedProfile = lifeResult.updatedProfile;
    impacts.push({
      type: 'life_event',
      ...lifeResult.impact
    });
  }
  
  // Calculate combined impact
  const totalTimelineImpact = impacts.reduce((total, impact) => {
    if (impact.details?.timelineImpact && typeof impact.details.timelineImpact === 'string') {
      const years = parseFloat(impact.details.timelineImpact.replace(/[^-\d.]/g, ''));
      return total + (isNaN(years) ? 0 : years);
    }
    return total;
  }, 0);
  
  return {
    updatedProfile,
    impacts,
    combinedImpact: {
      summary: totalTimelineImpact === 0 
        ? 'No net change to your cottage timeline'
        : totalTimelineImpact > 0 
          ? `Combined changes delay your cottage by ${totalTimelineImpact.toFixed(1)} years`
          : `Combined changes accelerate your cottage by ${Math.abs(totalTimelineImpact).toFixed(1)} years`,
      totalYearImpact: totalTimelineImpact,
      totalMonthImpact: Math.round(totalTimelineImpact * 12),
      severity: Math.abs(totalTimelineImpact) > 3 ? 'high' : Math.abs(totalTimelineImpact) > 1 ? 'medium' : 'low'
    },
    lastUpdated: new Date().toISOString(),
    updateReason: 'comprehensive_update'
  };
}

export default {
  updateForInflation,
  updateForReturns,
  updateForLife,
  getCottageTimelineImpact,
  updateProjections,
  MARKET_CONSTANTS,
  LIFE_EVENT_IMPACTS
};
