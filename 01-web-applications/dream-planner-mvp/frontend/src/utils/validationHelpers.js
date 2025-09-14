/**
 * Validation Helpers
 * Provides functions for validating dream feasibility and providing realistic assessments
 */

/**
 * Validate the feasibility of a dream savings goal
 * @param {number} dailyAmount - Daily savings amount required
 * @param {number} monthlyAmount - Monthly savings amount required
 * @returns {Object} Feasibility assessment with difficulty level and suggestions
 */
export function validateDreamFeasibility(dailyAmount, monthlyAmount) {
  // Constants for assessment
  const MEDIAN_MONTHLY_INCOME = 5000; // Assumed median monthly income
  const RECOMMENDED_SAVINGS_RATE = 0.20; // 20% of income is ideal savings rate
  const COMFORTABLE_SAVINGS_RATE = 0.15; // 15% is comfortable
  const MODERATE_SAVINGS_RATE = 0.25; // 25% is moderate challenge
  const CHALLENGING_SAVINGS_RATE = 0.35; // 35% is challenging
  
  // Validate inputs
  if (dailyAmount < 0 || monthlyAmount < 0) {
    return {
      isAchievable: false,
      difficultyLevel: 'invalid',
      incomePercentage: 0,
      suggestion: 'Invalid savings amounts. Please enter positive values.',
      error: true
    };
  }
  
  if (dailyAmount === 0 && monthlyAmount === 0) {
    return {
      isAchievable: true,
      difficultyLevel: 'easy',
      incomePercentage: 0,
      suggestion: 'No savings required - your dream is already within reach!',
      special: true
    };
  }
  
  // Calculate income percentage
  const incomePercentage = (monthlyAmount / MEDIAN_MONTHLY_INCOME) * 100;
  
  // Determine difficulty level and achievability
  let difficultyLevel;
  let isAchievable;
  let suggestion;
  
  if (incomePercentage <= COMFORTABLE_SAVINGS_RATE * 100) {
    // 0-15% of income
    difficultyLevel = 'easy';
    isAchievable = true;
    suggestion = generateEasySuggestion(dailyAmount, monthlyAmount, incomePercentage);
  } else if (incomePercentage <= RECOMMENDED_SAVINGS_RATE * 100) {
    // 15-20% of income
    difficultyLevel = 'easy';
    isAchievable = true;
    suggestion = generateEasySuggestion(dailyAmount, monthlyAmount, incomePercentage);
  } else if (incomePercentage <= MODERATE_SAVINGS_RATE * 100) {
    // 20-25% of income
    difficultyLevel = 'moderate';
    isAchievable = true;
    suggestion = generateModerateSuggestion(dailyAmount, monthlyAmount, incomePercentage);
  } else if (incomePercentage <= CHALLENGING_SAVINGS_RATE * 100) {
    // 25-35% of income
    difficultyLevel = 'challenging';
    isAchievable = true;
    suggestion = generateChallengingSuggestion(dailyAmount, monthlyAmount, incomePercentage);
  } else {
    // 35%+ of income
    difficultyLevel = 'very challenging';
    isAchievable = incomePercentage <= 50; // Still possible up to 50% of income
    suggestion = generateVeryChallengingSuggestion(dailyAmount, monthlyAmount, incomePercentage, isAchievable);
  }
  
  return {
    isAchievable,
    difficultyLevel,
    incomePercentage: Math.round(incomePercentage * 100) / 100, // Round to 2 decimal places
    suggestion,
    metadata: {
      dailyAmount: Math.round(dailyAmount * 100) / 100,
      monthlyAmount: Math.round(monthlyAmount * 100) / 100,
      medianIncome: MEDIAN_MONTHLY_INCOME,
      assessmentDate: new Date().toISOString().split('T')[0]
    }
  };
}

/**
 * Generate suggestion for easy savings goals (0-20% of income)
 * @param {number} dailyAmount - Daily savings amount
 * @param {number} monthlyAmount - Monthly savings amount
 * @param {number} incomePercentage - Percentage of median income
 * @returns {string} Suggestion text
 */
function generateEasySuggestion(dailyAmount, monthlyAmount, incomePercentage) {
  const suggestions = [
    `This is very achievable with minimal lifestyle changes. Consider automating your savings to make it effortless.`,
    `Great goal! This savings rate is well within the recommended range. You could even consider increasing it slightly.`,
    `This is a comfortable savings rate that shouldn't impact your quality of life significantly.`,
    `Excellent! This goal aligns well with financial best practices. Consider setting up automatic transfers.`
  ];
  
  if (dailyAmount < 10) {
    return `${suggestions[0]} At just $${dailyAmount.toFixed(2)} per day, this is less than a typical coffee purchase.`;
  } else if (dailyAmount < 20) {
    return `${suggestions[1]} This is equivalent to skipping one meal out per day - very manageable.`;
  } else {
    return `${suggestions[2]} With good budgeting habits, this should be easily achievable.`;
  }
}

/**
 * Generate suggestion for moderate savings goals (20-25% of income)
 * @param {number} dailyAmount - Daily savings amount
 * @param {number} monthlyAmount - Monthly savings amount
 * @param {number} incomePercentage - Percentage of median income
 * @returns {string} Suggestion text
 */
function generateModerateSuggestion(dailyAmount, monthlyAmount, incomePercentage) {
  const suggestions = [
    `This is a moderate challenge that will require some lifestyle adjustments. Consider reviewing your discretionary spending.`,
    `Achievable with disciplined budgeting. Look for areas to cut back on entertainment and dining out.`,
    `This savings rate requires commitment but is definitely doable. Consider the 50/30/20 budgeting rule.`,
    `A solid savings goal that may require some sacrifice but will build great financial discipline.`
  ];
  
  if (dailyAmount < 30) {
    return `${suggestions[0]} Focus on reducing small daily expenses to reach your $${dailyAmount.toFixed(2)} daily target.`;
  } else if (dailyAmount < 50) {
    return `${suggestions[1]} This might mean cooking more meals at home and finding free entertainment options.`;
  } else {
    return `${suggestions[2]} Consider tracking all expenses for a month to identify savings opportunities.`;
  }
}

/**
 * Generate suggestion for challenging savings goals (25-35% of income)
 * @param {number} dailyAmount - Daily savings amount
 * @param {number} monthlyAmount - Monthly savings amount
 * @param {number} incomePercentage - Percentage of median income
 * @returns {string} Suggestion text
 */
function generateChallengingSuggestion(dailyAmount, monthlyAmount, incomePercentage) {
  const suggestions = [
    `This is challenging but achievable with significant lifestyle changes. Consider increasing your income or extending your timeline.`,
    `This savings rate requires serious commitment. Look into side hustles or freelance work to boost your income.`,
    `Ambitious goal! You'll need to be very disciplined with spending and possibly find additional income sources.`,
    `This is at the upper end of recommended savings rates. Consider if extending your timeline might be more sustainable.`
  ];
  
  if (dailyAmount < 50) {
    return `${suggestions[0]} Every dollar counts - consider meal prepping and eliminating subscription services.`;
  } else if (dailyAmount < 75) {
    return `${suggestions[1]} This might require significant changes like moving to a cheaper place or selling a car.`;
  } else {
    return `${suggestions[2]} Consider whether a longer timeline might make this more manageable and sustainable.`;
  }
}

/**
 * Generate suggestion for very challenging savings goals (35%+ of income)
 * @param {number} dailyAmount - Daily savings amount
 * @param {number} monthlyAmount - Monthly savings amount
 * @param {number} incomePercentage - Percentage of median income
 * @param {boolean} isAchievable - Whether the goal is considered achievable
 * @returns {string} Suggestion text
 */
function generateVeryChallengingSuggestion(dailyAmount, monthlyAmount, incomePercentage, isAchievable) {
  if (!isAchievable) {
    return `This savings rate (${incomePercentage.toFixed(1)}% of median income) may not be sustainable. Consider extending your timeline by 50-100% or finding ways to significantly increase your income. A more realistic approach would make your dream more achievable.`;
  }
  
  const suggestions = [
    `This is extremely challenging and requires major lifestyle changes. Consider if this timeline is realistic for your situation.`,
    `This savings rate is at the absolute upper limit of what's typically sustainable. You may need to make significant sacrifices.`,
    `Very ambitious! This would require living extremely frugally and possibly finding additional income sources.`,
    `This is only achievable with extraordinary discipline and major lifestyle changes. Consider extending your timeline.`
  ];
  
  if (dailyAmount < 75) {
    return `${suggestions[0]} This might mean living like a student again - shared housing, minimal entertainment, and strict budgeting.`;
  } else if (dailyAmount < 100) {
    return `${suggestions[1]} Consider whether a longer timeline would be more sustainable and less stressful.`;
  } else {
    return `${suggestions[2]} At $${dailyAmount.toFixed(2)} per day, this requires exceptional financial discipline. Strongly consider extending your timeline.`;
  }
}

/**
 * Get income bracket assessment based on savings amount
 * @param {number} monthlyAmount - Monthly savings amount
 * @returns {Object} Income bracket information and recommendations
 */
export function getIncomeBracketAssessment(monthlyAmount) {
  const INCOME_BRACKETS = [
    { min: 0, max: 3000, label: 'Lower Income', savingsTarget: 0.10 },
    { min: 3000, max: 5000, label: 'Median Income', savingsTarget: 0.15 },
    { min: 5000, max: 8000, label: 'Above Median', savingsTarget: 0.20 },
    { min: 8000, max: 12000, label: 'High Income', savingsTarget: 0.25 },
    { min: 12000, max: Infinity, label: 'Very High Income', savingsTarget: 0.30 }
  ];
  
  const assessments = INCOME_BRACKETS.map(bracket => {
    const targetSavings = bracket.max === Infinity ? 
      bracket.min * bracket.savingsTarget : 
      ((bracket.min + bracket.max) / 2) * bracket.savingsTarget;
    
    const feasible = monthlyAmount <= targetSavings;
    const percentage = bracket.max === Infinity ? 
      (monthlyAmount / bracket.min) * 100 :
      (monthlyAmount / ((bracket.min + bracket.max) / 2)) * 100;
    
    return {
      bracket: bracket.label,
      incomeRange: bracket.max === Infinity ? 
        `$${bracket.min.toLocaleString()}+` : 
        `$${bracket.min.toLocaleString()} - $${bracket.max.toLocaleString()}`,
      feasible,
      percentage: Math.round(percentage * 100) / 100,
      recommendation: feasible ? 'Achievable' : 'Consider longer timeline'
    };
  });
  
  return {
    assessments,
    bestFitBracket: assessments.find(a => a.feasible) || assessments[assessments.length - 1]
  };
}

/**
 * Calculate alternative timelines for better feasibility
 * @param {number} monthlyAmount - Current monthly savings requirement
 * @param {number} dreamAmount - Total dream amount
 * @returns {Array} Array of alternative timeline options
 */
export function calculateAlternativeTimelines(monthlyAmount, dreamAmount) {
  const COMFORTABLE_MONTHLY_RATES = [500, 750, 1000, 1250, 1500]; // More comfortable monthly amounts
  
  return COMFORTABLE_MONTHLY_RATES
    .filter(rate => rate < monthlyAmount) // Only show easier options
    .map(rate => {
      const months = Math.ceil(dreamAmount / rate);
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      
      let timelineText;
      if (years === 0) {
        timelineText = `${months} months`;
      } else if (remainingMonths === 0) {
        timelineText = `${years} ${years === 1 ? 'year' : 'years'}`;
      } else {
        timelineText = `${years} ${years === 1 ? 'year' : 'years'} and ${remainingMonths} months`;
      }
      
      return {
        monthlyAmount: rate,
        timeline: timelineText,
        months: months,
        difficultyReduction: `${Math.round(((monthlyAmount - rate) / monthlyAmount) * 100)}% easier`,
        incomePercentage: Math.round((rate / 5000) * 100 * 100) / 100
      };
    })
    .sort((a, b) => a.months - b.months);
}
