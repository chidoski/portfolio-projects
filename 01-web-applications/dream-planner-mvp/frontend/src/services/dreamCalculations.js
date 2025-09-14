/**
 * Dream Calculations Service
 * Provides functions for calculating different savings strategies to achieve dream goals
 */

/**
 * Life equivalents for daily spending amounts
 * Helps users understand their savings in terms of everyday purchases
 */
const LIFE_EQUIVALENTS = {
  coffee: { daily: 5, name: 'coffee', description: 'coffee' },
  lunch: { daily: 15, name: 'lunch', description: 'lunch' },
  netflix: { daily: 0.50, name: 'netflix', description: 'Netflix subscription' }, // $15/month
  spotify: { daily: 0.33, name: 'spotify', description: 'Spotify subscription' }, // $10/month
  gym: { daily: 1.67, name: 'gym', description: 'gym membership' }, // $50/month
  dinner: { daily: 60, name: 'dinner', description: 'restaurant dinner' },
  uber: { daily: 25, name: 'uber', description: 'Uber ride' },
  movie: { daily: 12, name: 'movie', description: 'movie ticket' },
  bubble_tea: { daily: 6, name: 'bubble_tea', description: 'bubble tea' },
  sandwich: { daily: 8, name: 'sandwich', description: 'deli sandwich' },
  gas: { daily: 4, name: 'gas', description: 'gallon of gas' },
  beer: { daily: 7, name: 'beer', description: 'craft beer' },
  smoothie: { daily: 9, name: 'smoothie', description: 'smoothie' },
  parking: { daily: 10, name: 'parking', description: 'parking fee' },
  snack: { daily: 3, name: 'snack', description: 'snack' },
  energy_drink: { daily: 3.5, name: 'energy_drink', description: 'energy drink' },
  donut: { daily: 2, name: 'donut', description: 'donut' },
  pizza_slice: { daily: 4, name: 'pizza_slice', description: 'pizza slice' },
  ice_cream: { daily: 5, name: 'ice_cream', description: 'ice cream' },
  magazine: { daily: 5, name: 'magazine', description: 'magazine' }
};

/**
 * Calculate the number of days between two dates
 * @param {Date|string} startDate - The start date
 * @param {Date|string} endDate - The end date
 * @returns {number} Number of days between the dates
 */
export function calculateDaysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const timeDifference = end.getTime() - start.getTime();
  return Math.ceil(timeDifference / (1000 * 3600 * 24));
}

/**
 * Add days to a date
 * @param {Date|string} date - The base date
 * @param {number} days - Number of days to add
 * @returns {Date} New date with days added
 */
export function addDaysToDate(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Convert daily amount to weekly amount
 * @param {number} dailyAmount - Daily savings amount
 * @returns {number} Weekly savings amount
 */
export function dailyToWeekly(dailyAmount) {
  return dailyAmount * 7;
}

/**
 * Convert daily amount to monthly amount (assumes 30.44 days per month on average)
 * @param {number} dailyAmount - Daily savings amount
 * @returns {number} Monthly savings amount
 */
export function dailyToMonthly(dailyAmount) {
  return dailyAmount * 30.44; // Average days per month
}

/**
 * Convert weekly amount to daily amount
 * @param {number} weeklyAmount - Weekly savings amount
 * @returns {number} Daily savings amount
 */
export function weeklyToDaily(weeklyAmount) {
  return weeklyAmount / 7;
}

/**
 * Convert monthly amount to daily amount
 * @param {number} monthlyAmount - Monthly savings amount
 * @returns {number} Daily savings amount
 */
export function monthlyToDaily(monthlyAmount) {
  return monthlyAmount / 30.44; // Average days per month
}

/**
 * Format currency amount to 2 decimal places
 * @param {number} amount - Amount to format
 * @returns {number} Formatted amount
 */
export function formatCurrency(amount) {
  return Math.round(amount * 100) / 100;
}

/**
 * Calculate a single savings strategy
 * @param {number} dreamAmount - Total amount needed for the dream
 * @param {number} totalDays - Number of days to save
 * @param {Date} adjustedTargetDate - The target date for this strategy
 * @returns {Object} Strategy object with daily, weekly, monthly amounts and target date
 */
function calculateStrategy(dreamAmount, totalDays, adjustedTargetDate) {
  const dailyAmount = dreamAmount / totalDays;
  
  return {
    dailyAmount: formatCurrency(dailyAmount),
    weeklyAmount: formatCurrency(dailyToWeekly(dailyAmount)),
    monthlyAmount: formatCurrency(dailyToMonthly(dailyAmount)),
    adjustedTargetDate: adjustedTargetDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
    totalDays: totalDays
  };
}

/**
 * Calculate three different savings strategies for achieving a dream
 * @param {number} dreamAmount - Total amount needed for the dream
 * @param {Date|string} targetDate - Desired target date
 * @returns {Object} Object containing aggressive, balanced, and relaxed strategies
 */
export function calculateSavingsStrategies(dreamAmount, targetDate) {
  const today = new Date();
  const target = new Date(targetDate);
  
  // Validate inputs
  if (dreamAmount <= 0) {
    throw new Error('Dream amount must be greater than 0');
  }
  
  if (target <= today) {
    throw new Error('Target date must be in the future');
  }
  
  // Calculate base days to target
  const baseDays = calculateDaysBetween(today, target);
  
  // Calculate days for each strategy
  const aggressiveDays = Math.ceil(baseDays * 0.75); // 25% faster (75% of original time)
  const balancedDays = baseDays; // Same as target
  const relaxedDays = Math.ceil(baseDays * 1.5); // 50% longer
  
  // Calculate adjusted target dates
  const aggressiveTargetDate = addDaysToDate(today, aggressiveDays);
  const balancedTargetDate = new Date(target);
  const relaxedTargetDate = addDaysToDate(today, relaxedDays);
  
  // Calculate strategies
  const aggressive = calculateStrategy(dreamAmount, aggressiveDays, aggressiveTargetDate);
  const balanced = calculateStrategy(dreamAmount, balancedDays, balancedTargetDate);
  const relaxed = calculateStrategy(dreamAmount, relaxedDays, relaxedTargetDate);
  
  return {
    aggressive: {
      ...aggressive,
      name: 'Aggressive',
      description: 'Reach your goal 25% faster with higher daily savings',
      intensity: 'high'
    },
    balanced: {
      ...balanced,
      name: 'Balanced',
      description: 'Achieve your goal on your target date with moderate savings',
      intensity: 'medium'
    },
    relaxed: {
      ...relaxed,
      name: 'Relaxed',
      description: 'Take 50% more time with lower daily savings for easier budgeting',
      intensity: 'low'
    },
    metadata: {
      dreamAmount: formatCurrency(dreamAmount),
      originalTargetDate: target.toISOString().split('T')[0],
      calculatedOn: today.toISOString().split('T')[0],
      baseDays: baseDays
    }
  };
}

/**
 * Calculate how much you need to save per period to reach a goal
 * @param {number} dreamAmount - Total amount needed
 * @param {number} timeInDays - Number of days available
 * @param {string} period - 'daily', 'weekly', or 'monthly'
 * @returns {number} Amount needed per period
 */
export function calculateSavingsPerPeriod(dreamAmount, timeInDays, period = 'daily') {
  const dailyAmount = dreamAmount / timeInDays;
  
  switch (period.toLowerCase()) {
    case 'weekly':
      return formatCurrency(dailyToWeekly(dailyAmount));
    case 'monthly':
      return formatCurrency(dailyToMonthly(dailyAmount));
    case 'daily':
    default:
      return formatCurrency(dailyAmount);
  }
}

/**
 * Calculate when you'll reach your goal given a savings rate
 * @param {number} dreamAmount - Total amount needed
 * @param {number} savingsAmount - Amount saved per period
 * @param {string} period - 'daily', 'weekly', or 'monthly'
 * @param {Date|string} startDate - When to start calculating from (defaults to today)
 * @returns {Object} Object with target date and number of days
 */
export function calculateTargetDate(dreamAmount, savingsAmount, period = 'daily', startDate = new Date()) {
  let dailySavings;
  
  switch (period.toLowerCase()) {
    case 'weekly':
      dailySavings = weeklyToDaily(savingsAmount);
      break;
    case 'monthly':
      dailySavings = monthlyToDaily(savingsAmount);
      break;
    case 'daily':
    default:
      dailySavings = savingsAmount;
      break;
  }
  
  if (dailySavings <= 0) {
    throw new Error('Savings amount must be greater than 0');
  }
  
  const daysNeeded = Math.ceil(dreamAmount / dailySavings);
  const targetDate = addDaysToDate(startDate, daysNeeded);
  
  return {
    targetDate: targetDate.toISOString().split('T')[0],
    daysNeeded: daysNeeded,
    dailySavings: formatCurrency(dailySavings),
    weeklySavings: formatCurrency(dailyToWeekly(dailySavings)),
    monthlySavings: formatCurrency(dailyToMonthly(dailySavings))
  };
}

/**
 * Convert a daily dollar amount to relatable life equivalents
 * @param {number} dailyAmount - Daily savings amount in dollars
 * @returns {Array} Array of equivalent purchases with descriptions
 */
export function convertToLifeEquivalents(dailyAmount) {
  const equivalents = [];
  
  if (dailyAmount <= 0) {
    return [{ description: 'No savings needed', type: 'none', amount: 0 }];
  }
  
  // Sort items by daily cost for better matching
  const sortedItems = Object.values(LIFE_EQUIVALENTS).sort((a, b) => a.daily - b.daily);
  
  // Find exact or close matches
  const exactMatches = sortedItems.filter(item => 
    Math.abs(item.daily - dailyAmount) < 0.50
  );
  
  if (exactMatches.length > 0) {
    // Add exact matches
    exactMatches.forEach(item => {
      equivalents.push({
        description: `Skip one ${item.description} per day`,
        type: 'daily',
        amount: item.daily,
        difference: Math.abs(item.daily - dailyAmount)
      });
    });
  }
  
  // Find weekly equivalents (divide by 7)
  const weeklyAmount = dailyAmount * 7;
  sortedItems.forEach(item => {
    const timesPerWeek = weeklyAmount / item.daily;
    if (timesPerWeek >= 1 && timesPerWeek <= 7) {
      const roundedTimes = Math.round(timesPerWeek);
      if (roundedTimes === 1) {
        equivalents.push({
          description: `Skip one ${item.description} per week`,
          type: 'weekly',
          amount: item.daily,
          frequency: 1
        });
      } else if (roundedTimes <= 7) {
        equivalents.push({
          description: `Skip ${item.description} ${roundedTimes} times per week`,
          type: 'weekly',
          amount: item.daily * roundedTimes,
          frequency: roundedTimes
        });
      }
    }
  });
  
  // Find monthly equivalents (multiply by 30)
  const monthlyAmount = dailyAmount * 30;
  sortedItems.forEach(item => {
    const timesPerMonth = monthlyAmount / item.daily;
    if (timesPerMonth >= 1 && timesPerMonth <= 30) {
      const roundedTimes = Math.round(timesPerMonth);
      if (roundedTimes === 1) {
        equivalents.push({
          description: `Skip one ${item.description} per month`,
          type: 'monthly',
          amount: item.daily,
          frequency: 1
        });
      } else if (roundedTimes <= 10) {
        equivalents.push({
          description: `Skip ${item.description} ${roundedTimes} times per month`,
          type: 'monthly',
          amount: item.daily * roundedTimes,
          frequency: roundedTimes
        });
      }
    }
  });
  
  // Find combination equivalents for larger amounts
  if (dailyAmount > 20) {
    // Try combinations of 2 items
    for (let i = 0; i < sortedItems.length; i++) {
      for (let j = i + 1; j < sortedItems.length; j++) {
        const combo = sortedItems[i].daily + sortedItems[j].daily;
        if (Math.abs(combo - dailyAmount) < 2) {
          equivalents.push({
            description: `Skip one ${sortedItems[i].description} and one ${sortedItems[j].description} per day`,
            type: 'combination',
            amount: combo,
            items: [sortedItems[i].description, sortedItems[j].description]
          });
        }
      }
    }
  }
  
  // Find multiples of single items
  sortedItems.forEach(item => {
    const multiple = Math.round(dailyAmount / item.daily);
    if (multiple >= 2 && multiple <= 5 && Math.abs((item.daily * multiple) - dailyAmount) < 1) {
      equivalents.push({
        description: `Skip ${multiple} ${item.description}s per day`,
        type: 'multiple',
        amount: item.daily * multiple,
        multiplier: multiple
      });
    }
  });
  
  // Remove duplicates and sort by accuracy
  const uniqueEquivalents = equivalents
    .filter((equiv, index, self) => 
      index === self.findIndex(e => e.description === equiv.description)
    )
    .sort((a, b) => {
      // Prioritize exact matches, then by type preference
      const aAccuracy = Math.abs((a.amount || 0) - dailyAmount);
      const bAccuracy = Math.abs((b.amount || 0) - dailyAmount);
      
      if (aAccuracy !== bAccuracy) {
        return aAccuracy - bAccuracy;
      }
      
      // Prefer daily, then weekly, then monthly
      const typeOrder = { daily: 1, weekly: 2, multiple: 3, monthly: 4, combination: 5 };
      return (typeOrder[a.type] || 6) - (typeOrder[b.type] || 6);
    })
    .slice(0, 5); // Return top 5 matches
  
  // If no good matches found, provide a general comparison
  if (uniqueEquivalents.length === 0) {
    const closestItem = sortedItems.reduce((prev, curr) => 
      Math.abs(curr.daily - dailyAmount) < Math.abs(prev.daily - dailyAmount) ? curr : prev
    );
    
    if (dailyAmount < closestItem.daily) {
      equivalents.push({
        description: `Less than one ${closestItem.description} per day`,
        type: 'comparison',
        amount: closestItem.daily
      });
    } else {
      const multiple = (dailyAmount / closestItem.daily).toFixed(1);
      equivalents.push({
        description: `About ${multiple} ${closestItem.description}s per day`,
        type: 'comparison',
        amount: dailyAmount
      });
    }
    return equivalents;
  }
  
  return uniqueEquivalents;
}

/**
 * Calculate milestone checkpoints for a dream savings goal
 * @param {number} dreamAmount - Total amount needed for the dream
 * @param {Date|string} startDate - When saving begins
 * @param {Date|string} targetDate - When the goal should be reached
 * @returns {Array} Array of milestone objects with percentage, amount, date, and celebration message
 */
export function calculateMilestones(dreamAmount, startDate, targetDate) {
  const start = new Date(startDate);
  const target = new Date(targetDate);
  
  // Validate inputs
  if (dreamAmount <= 0) {
    throw new Error('Dream amount must be greater than 0');
  }
  
  if (target <= start) {
    throw new Error('Target date must be after start date');
  }
  
  // Calculate total days between start and target
  const totalDays = calculateDaysBetween(start, target);
  
  // Define milestone percentages and their celebration messages
  const milestoneData = [
    {
      percentage: 10,
      message: "First milestone! You're officially on your way! 🎉"
    },
    {
      percentage: 25,
      message: "Quarter of the way there! Your discipline is paying off! 💪"
    },
    {
      percentage: 50,
      message: "Halfway point achieved! You're crushing this goal! 🔥"
    },
    {
      percentage: 75,
      message: "Three quarters complete! The finish line is in sight! 🏆"
    },
    {
      percentage: 90,
      message: "Almost there! Just a final push to make your dream reality! 🌟"
    }
  ];
  
  // Calculate milestones
  const milestones = milestoneData.map(milestone => {
    // Calculate amount for this milestone
    const amount = formatCurrency((dreamAmount * milestone.percentage) / 100);
    
    // Calculate expected date (proportional to percentage)
    const daysToMilestone = Math.floor((totalDays * milestone.percentage) / 100);
    const expectedDate = addDaysToDate(start, daysToMilestone);
    
    return {
      percentage: milestone.percentage,
      amount: amount,
      expectedDate: expectedDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      celebrationMessage: milestone.message,
      daysFromStart: daysToMilestone,
      remainingAmount: formatCurrency(dreamAmount - amount),
      remainingPercentage: 100 - milestone.percentage
    };
  });
  
  // Sort by date (should already be sorted, but ensuring it)
  milestones.sort((a, b) => new Date(a.expectedDate) - new Date(b.expectedDate));
  
  // Add metadata
  const milestonesWithMetadata = {
    milestones: milestones,
    metadata: {
      dreamAmount: formatCurrency(dreamAmount),
      startDate: start.toISOString().split('T')[0],
      targetDate: target.toISOString().split('T')[0],
      totalDays: totalDays,
      averageDailyAmount: formatCurrency(dreamAmount / totalDays),
      generatedOn: new Date().toISOString().split('T')[0]
    }
  };
  
  return milestonesWithMetadata;
}

/**
 * Check which milestones have been reached based on current savings
 * @param {Array} milestones - Array of milestone objects from calculateMilestones
 * @param {number} currentAmount - Current amount saved
 * @returns {Object} Object with completed and next milestone information
 */
export function checkMilestoneProgress(milestones, currentAmount) {
  const milestonesArray = milestones.milestones || milestones;
  
  const completed = milestonesArray.filter(milestone => currentAmount >= milestone.amount);
  const remaining = milestonesArray.filter(milestone => currentAmount < milestone.amount);
  const nextMilestone = remaining.length > 0 ? remaining[0] : null;
  
  // Calculate progress to next milestone
  let progressToNext = null;
  if (nextMilestone) {
    const previousAmount = completed.length > 0 ? completed[completed.length - 1].amount : 0;
    const progressAmount = currentAmount - previousAmount;
    const totalNeeded = nextMilestone.amount - previousAmount;
    const progressPercentage = Math.min(100, Math.max(0, (progressAmount / totalNeeded) * 100));
    
    progressToNext = {
      percentage: formatCurrency(progressPercentage),
      amountNeeded: formatCurrency(nextMilestone.amount - currentAmount),
      daysRemaining: nextMilestone.daysFromStart - calculateDaysBetween(milestones.metadata?.startDate || new Date(), new Date())
    };
  }
  
  return {
    completed: completed,
    remaining: remaining,
    nextMilestone: nextMilestone,
    progressToNext: progressToNext,
    completionPercentage: completed.length > 0 ? completed[completed.length - 1].percentage : 0,
    totalMilestones: milestonesArray.length,
    completedCount: completed.length
  };
}
