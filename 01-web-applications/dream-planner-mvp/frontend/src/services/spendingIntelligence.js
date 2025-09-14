/**
 * Spending Intelligence Service
 * Learns from user spending patterns to provide personalized insights and optimizations
 * Focuses on empowering choices rather than shaming spending habits
 */

import { format, subMonths, isAfter, isBefore, parseISO } from 'date-fns'

/**
 * Predict monthly spending needs for a category based on historical data
 * Uses rolling 3-month average with seasonal adjustments
 * @param {string} category - The spending category
 * @param {Array} historyArray - Array of spending records with date, amount, category
 * @returns {Object} Prediction object with amount, confidence, and insights
 */
export function predictMonthlyNeeds(category, historyArray) {
  if (!historyArray || historyArray.length === 0) {
    return {
      predictedAmount: 0,
      confidence: 'low',
      insight: 'No historical data available for this category',
      trend: 'stable',
      seasonalFactor: 1.0
    }
  }

  // Filter records for the specific category and last 12 months
  const twelveMonthsAgo = subMonths(new Date(), 12)
  const categoryHistory = historyArray
    .filter(record => 
      record.category === category && 
      isAfter(parseISO(record.date), twelveMonthsAgo)
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  if (categoryHistory.length === 0) {
    return {
      predictedAmount: 0,
      confidence: 'low',
      insight: `No recent spending data for ${category}`,
      trend: 'stable',
      seasonalFactor: 1.0
    }
  }

  // Group by month and calculate monthly totals
  const monthlyTotals = {}
  categoryHistory.forEach(record => {
    const monthKey = format(parseISO(record.date), 'yyyy-MM')
    monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + record.amount
  })

  const monthlyAmounts = Object.values(monthlyTotals)
  
  // Calculate rolling 3-month average
  const recentMonths = monthlyAmounts.slice(0, 3)
  const rollingAverage = recentMonths.reduce((sum, amount) => sum + amount, 0) / recentMonths.length

  // Calculate overall average for trend analysis
  const overallAverage = monthlyAmounts.reduce((sum, amount) => sum + amount, 0) / monthlyAmounts.length

  // Determine trend
  let trend = 'stable'
  const trendThreshold = 0.15 // 15% change threshold
  if (rollingAverage > overallAverage * (1 + trendThreshold)) {
    trend = 'increasing'
  } else if (rollingAverage < overallAverage * (1 - trendThreshold)) {
    trend = 'decreasing'
  }

  // Calculate seasonal factor based on current month
  const currentMonth = new Date().getMonth()
  const seasonalFactor = calculateSeasonalFactor(category, currentMonth, monthlyTotals)

  // Adjust prediction with seasonal factor
  const predictedAmount = Math.round(rollingAverage * seasonalFactor)

  // Determine confidence based on data consistency
  const variance = calculateVariance(recentMonths)
  const coefficientOfVariation = Math.sqrt(variance) / rollingAverage
  let confidence = 'high'
  if (coefficientOfVariation > 0.5) {
    confidence = 'low'
  } else if (coefficientOfVariation > 0.25) {
    confidence = 'medium'
  }

  // Generate insight
  let insight = `Based on your last 3 months, you typically spend $${Math.round(rollingAverage)} on ${category}`
  if (trend === 'increasing') {
    insight += '. Your spending in this category has been trending upward.'
  } else if (trend === 'decreasing') {
    insight += '. Your spending in this category has been trending downward.'
  }

  if (seasonalFactor !== 1.0) {
    const seasonalChange = Math.round((seasonalFactor - 1) * 100)
    if (seasonalChange > 0) {
      insight += ` This month typically sees ${seasonalChange}% higher spending.`
    } else {
      insight += ` This month typically sees ${Math.abs(seasonalChange)}% lower spending.`
    }
  }

  return {
    predictedAmount,
    confidence,
    insight,
    trend,
    seasonalFactor,
    historicalAverage: Math.round(overallAverage),
    dataPoints: monthlyAmounts.length
  }
}

/**
 * Calculate seasonal adjustment factor for a category
 * @param {string} category - Spending category
 * @param {number} currentMonth - Current month (0-11)
 * @param {Object} monthlyTotals - Historical monthly totals
 * @returns {number} Seasonal factor (1.0 = no adjustment)
 */
function calculateSeasonalFactor(category, currentMonth, monthlyTotals) {
  // Define seasonal patterns for different categories
  const seasonalPatterns = {
    'groceries': [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.1, 1.1, 1.0, 1.0, 1.2, 1.3], // Higher in summer/holidays
    'utilities': [1.3, 1.2, 1.1, 1.0, 0.9, 0.8, 0.8, 0.8, 0.9, 1.0, 1.1, 1.2], // Higher in winter
    'entertainment': [1.0, 1.0, 1.1, 1.1, 1.2, 1.3, 1.3, 1.2, 1.0, 1.0, 1.1, 1.2], // Higher in summer/holidays
    'clothing': [0.9, 0.9, 1.1, 1.2, 1.1, 1.0, 0.9, 1.1, 1.2, 1.1, 1.2, 1.3], // Higher during shopping seasons
    'travel': [0.8, 0.8, 1.1, 1.2, 1.3, 1.4, 1.5, 1.4, 1.1, 1.0, 0.9, 1.2], // Higher in vacation months
    'healthcare': [1.1, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.1, 1.1, 1.0], // Slightly higher in winter/year-end
    'default': [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0] // No seasonal adjustment
  }

  const pattern = seasonalPatterns[category.toLowerCase()] || seasonalPatterns['default']
  return pattern[currentMonth]
}

/**
 * Calculate variance of an array of numbers
 * @param {Array} numbers - Array of numbers
 * @returns {number} Variance
 */
function calculateVariance(numbers) {
  if (numbers.length === 0) return 0
  
  const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length
  const squaredDifferences = numbers.map(num => Math.pow(num - mean, 2))
  return squaredDifferences.reduce((sum, diff) => sum + diff, 0) / numbers.length
}

/**
 * Detect spending anomalies compared to historical patterns
 * @param {number} currentSpend - Current month's spending amount
 * @param {number} historicalAverage - Historical average spending
 * @param {Object} options - Additional options for anomaly detection
 * @returns {Object} Anomaly detection result
 */
export function detectAnomalies(currentSpend, historicalAverage, options = {}) {
  const {
    sensitivity = 'medium', // 'low', 'medium', 'high'
    category = 'unknown',
    previousMonthSpend = null
  } = options

  // Define thresholds based on sensitivity
  const thresholds = {
    low: { minor: 0.5, major: 1.0 },      // 50%, 100%
    medium: { minor: 0.3, major: 0.7 },   // 30%, 70%
    high: { minor: 0.2, major: 0.5 }      // 20%, 50%
  }

  const threshold = thresholds[sensitivity] || thresholds.medium

  if (historicalAverage === 0) {
    return {
      isAnomaly: currentSpend > 0,
      severity: currentSpend > 0 ? 'new_category' : 'none',
      message: currentSpend > 0 ? `New spending detected in ${category}` : 'No spending detected',
      recommendation: currentSpend > 0 ? 'Consider if this aligns with your goals' : null,
      percentageChange: null
    }
  }

  const percentageChange = (currentSpend - historicalAverage) / historicalAverage
  const absoluteChange = Math.abs(percentageChange)

  let severity = 'none'
  let isAnomaly = false

  if (absoluteChange >= threshold.major) {
    severity = 'major'
    isAnomaly = true
  } else if (absoluteChange >= threshold.minor) {
    severity = 'minor'
    isAnomaly = true
  }

  // Generate contextual message
  let message = ''
  let recommendation = null

  if (!isAnomaly) {
    message = `Your ${category} spending is within normal range`
  } else {
    const changeDirection = percentageChange > 0 ? 'higher' : 'lower'
    const changePercent = Math.round(Math.abs(percentageChange) * 100)
    
    message = `Your ${category} spending is ${changePercent}% ${changeDirection} than usual`
    
    if (percentageChange > 0) {
      // Higher spending
      if (severity === 'major') {
        recommendation = `This significant increase might impact your dream timeline. Consider if this was planned or if adjustments are needed.`
      } else {
        recommendation = `Slight increase noticed. This could be seasonal or due to special circumstances.`
      }
    } else {
      // Lower spending
      if (severity === 'major') {
        recommendation = `Great job reducing spending in this category! This could accelerate your dreams.`
      } else {
        recommendation = `Nice work keeping spending lower than usual in this category.`
      }
    }
  }

  return {
    isAnomaly,
    severity,
    message,
    recommendation,
    percentageChange: Math.round(percentageChange * 100),
    absoluteChange: Math.round(Math.abs(currentSpend - historicalAverage)),
    threshold: threshold,
    category
  }
}

/**
 * Suggest spending optimizations to accelerate dream achievement
 * Frames suggestions as empowering choices rather than restrictions
 * @param {Array} spendingHistory - Historical spending data
 * @param {Object} northStarDream - Primary dream/goal object
 * @param {Object} options - Additional options
 * @returns {Array} Array of optimization suggestions
 */
export function suggestOptimizations(spendingHistory, northStarDream, options = {}) {
  const {
    maxSuggestions = 5,
    minImpactMonths = 0.5, // Minimum months of impact to suggest
    excludeCategories = ['healthcare', 'insurance', 'rent', 'mortgage'] // Essential categories to avoid
  } = options

  if (!spendingHistory || spendingHistory.length === 0 || !northStarDream) {
    return []
  }

  // Calculate monthly spending by category
  const threeMonthsAgo = subMonths(new Date(), 3)
  const recentSpending = spendingHistory.filter(record => 
    isAfter(parseISO(record.date), threeMonthsAgo)
  )

  const categoryTotals = {}
  recentSpending.forEach(record => {
    categoryTotals[record.category] = (categoryTotals[record.category] || 0) + record.amount
  })

  // Calculate monthly averages
  const monthlyAverages = {}
  Object.keys(categoryTotals).forEach(category => {
    monthlyAverages[category] = categoryTotals[category] / 3
  })

  // Calculate dream timeline impact
  const dreamTarget = northStarDream.target_amount || northStarDream.amount || 0
  const currentSaved = northStarDream.current_amount || 0
  const remainingAmount = dreamTarget - currentSaved
  const currentMonthlySavings = northStarDream.monthly_amount || 0
  const currentTimelineMonths = remainingAmount / (currentMonthlySavings || 1)

  // Generate optimization suggestions
  const suggestions = []

  Object.entries(monthlyAverages)
    .filter(([category]) => !excludeCategories.includes(category.toLowerCase()))
    .sort(([, a], [, b]) => b - a) // Sort by spending amount (highest first)
    .forEach(([category, monthlyAmount]) => {
      if (monthlyAmount < 50) return // Skip very small amounts

      // Calculate different reduction scenarios
      const reductionScenarios = [
        { percentage: 0.1, label: '10%' },
        { percentage: 0.2, label: '20%' },
        { percentage: 0.3, label: '30%' },
        { percentage: 0.5, label: '50%' }
      ]

      reductionScenarios.forEach(scenario => {
        const monthlyReduction = monthlyAmount * scenario.percentage
        const newMonthlySavings = currentMonthlySavings + monthlyReduction
        const newTimelineMonths = remainingAmount / newMonthlySavings
        const timelineSavings = currentTimelineMonths - newTimelineMonths

        if (timelineSavings >= minImpactMonths) {
          const suggestion = createOptimizationSuggestion(
            category,
            monthlyAmount,
            monthlyReduction,
            scenario.label,
            timelineSavings,
            northStarDream,
            spendingHistory
          )
          
          if (suggestion) {
            suggestions.push(suggestion)
          }
        }
      })
    })

  // Sort by impact and return top suggestions
  return suggestions
    .sort((a, b) => b.timelineImpactMonths - a.timelineImpactMonths)
    .slice(0, maxSuggestions)
}

/**
 * Create a personalized optimization suggestion
 * @param {string} category - Spending category
 * @param {number} currentAmount - Current monthly spending
 * @param {number} reductionAmount - Proposed reduction amount
 * @param {string} reductionLabel - Reduction percentage label
 * @param {number} timelineImpact - Impact on dream timeline in months
 * @param {Object} dream - Dream object
 * @param {Array} spendingHistory - Historical spending data
 * @returns {Object} Optimization suggestion
 */
function createOptimizationSuggestion(category, currentAmount, reductionAmount, reductionLabel, timelineImpact, dream, spendingHistory) {
  // Get category-specific insights
  const categoryInsights = getCategoryInsights(category, spendingHistory)
  
  // Format timeline impact
  const impactText = timelineImpact >= 12 
    ? `${Math.round(timelineImpact / 12 * 10) / 10} years`
    : timelineImpact >= 1
      ? `${Math.round(timelineImpact)} months`
      : `${Math.round(timelineImpact * 30)} days`

  // Create empowering, choice-focused message
  const dreamName = dream.title || dream.name || 'your dream'
  const messages = generateCategoryMessages(category, dreamName, impactText, reductionAmount, reductionLabel)

  return {
    category,
    currentMonthlySpending: Math.round(currentAmount),
    proposedReduction: Math.round(reductionAmount),
    reductionPercentage: reductionLabel,
    timelineImpactMonths: Math.round(timelineImpact * 10) / 10,
    timelineImpactText: impactText,
    message: messages.primary,
    alternativeMessage: messages.alternative,
    actionSuggestions: messages.actions,
    insights: categoryInsights,
    priority: calculatePriority(timelineImpact, reductionAmount, category),
    tone: 'empowering' // Always empowering, never shaming
  }
}

/**
 * Generate category-specific messages for optimization suggestions
 * @param {string} category - Spending category
 * @param {string} dreamName - Name of the dream
 * @param {string} impactText - Formatted timeline impact
 * @param {number} reductionAmount - Monthly reduction amount
 * @param {string} reductionLabel - Reduction percentage
 * @returns {Object} Message object with primary, alternative, and actions
 */
function generateCategoryMessages(category, dreamName, impactText, reductionAmount, reductionLabel) {
  const categoryMessages = {
    'dining': {
      primary: `Your dining out habit could delay ${dreamName} by ${impactText}. Worth the convenience and experiences to you?`,
      alternative: `Reducing dining out by ${reductionLabel} ($${Math.round(reductionAmount)}/month) could bring ${dreamName} ${impactText} closer.`,
      actions: ['Try cooking one extra meal per week', 'Look for happy hour deals', 'Set a monthly dining budget', 'Explore meal prep options']
    },
    'coffee': {
      primary: `Your coffee ritual could delay ${dreamName} by ${impactText}. Worth the daily comfort and routine to you?`,
      alternative: `Cutting coffee spending by ${reductionLabel} could accelerate ${dreamName} by ${impactText}.`,
      actions: ['Make coffee at home 2-3 days per week', 'Try a smaller size', 'Look for loyalty programs', 'Invest in a good home coffee setup']
    },
    'entertainment': {
      primary: `Your entertainment spending could delay ${dreamName} by ${impactText}. Worth the fun and relaxation to you?`,
      alternative: `Reducing entertainment by ${reductionLabel} could bring ${dreamName} ${impactText} closer.`,
      actions: ['Try free local events', 'Share streaming subscriptions', 'Look for discount days', 'Explore outdoor activities']
    },
    'shopping': {
      primary: `Your shopping habits could delay ${dreamName} by ${impactText}. Worth the items and retail therapy to you?`,
      alternative: `Cutting shopping by ${reductionLabel} could accelerate ${dreamName} by ${impactText}.`,
      actions: ['Try the 24-hour rule before purchases', 'Unsubscribe from promotional emails', 'Shop your closet first', 'Set a monthly shopping budget']
    },
    'subscriptions': {
      primary: `Your subscriptions could delay ${dreamName} by ${impactText}. Worth the convenience and content to you?`,
      alternative: `Reducing subscriptions by ${reductionLabel} could bring ${dreamName} ${impactText} closer.`,
      actions: ['Audit unused subscriptions', 'Share family plans', 'Try free alternatives', 'Rotate subscriptions seasonally']
    },
    'transportation': {
      primary: `Your transportation costs could delay ${dreamName} by ${impactText}. Worth the convenience and comfort to you?`,
      alternative: `Optimizing transportation by ${reductionLabel} could accelerate ${dreamName} by ${impactText}.`,
      actions: ['Try carpooling or public transit', 'Combine errands into one trip', 'Walk or bike for short distances', 'Look into ride-sharing']
    },
    'default': {
      primary: `Your ${category} spending could delay ${dreamName} by ${impactText}. Worth it to you?`,
      alternative: `Reducing ${category} by ${reductionLabel} could bring ${dreamName} ${impactText} closer.`,
      actions: [`Review your ${category} expenses`, `Look for alternatives in ${category}`, `Set a monthly ${category} budget`, `Track ${category} spending more closely`]
    }
  }

  return categoryMessages[category.toLowerCase()] || categoryMessages['default']
}

/**
 * Get category-specific insights and patterns
 * @param {string} category - Spending category
 * @param {Array} spendingHistory - Historical spending data
 * @returns {Object} Category insights
 */
function getCategoryInsights(category, spendingHistory) {
  const categoryHistory = spendingHistory.filter(record => record.category === category)
  
  if (categoryHistory.length === 0) {
    return { pattern: 'insufficient_data', frequency: 'unknown' }
  }

  // Analyze spending frequency
  const uniqueDays = new Set(categoryHistory.map(record => record.date.split('T')[0])).size
  const totalTransactions = categoryHistory.length
  const avgTransactionsPerDay = totalTransactions / uniqueDays

  let frequency = 'occasional'
  if (avgTransactionsPerDay >= 1) {
    frequency = 'daily'
  } else if (avgTransactionsPerDay >= 0.5) {
    frequency = 'frequent'
  } else if (avgTransactionsPerDay >= 0.2) {
    frequency = 'regular'
  }

  // Analyze spending patterns
  const amounts = categoryHistory.map(record => record.amount)
  const avgAmount = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length
  const maxAmount = Math.max(...amounts)
  const minAmount = Math.min(...amounts)

  let pattern = 'consistent'
  if (maxAmount > avgAmount * 2) {
    pattern = 'variable'
  } else if (maxAmount - minAmount < avgAmount * 0.3) {
    pattern = 'very_consistent'
  }

  return {
    frequency,
    pattern,
    averageAmount: Math.round(avgAmount),
    totalTransactions,
    uniqueDays,
    priceRange: { min: Math.round(minAmount), max: Math.round(maxAmount) }
  }
}

/**
 * Calculate priority score for optimization suggestions
 * @param {number} timelineImpact - Timeline impact in months
 * @param {number} reductionAmount - Monthly reduction amount
 * @param {string} category - Spending category
 * @returns {string} Priority level
 */
function calculatePriority(timelineImpact, reductionAmount, category) {
  // Categories that are typically easier to optimize
  const easyCategories = ['dining', 'coffee', 'entertainment', 'subscriptions']
  const difficultyMultiplier = easyCategories.includes(category.toLowerCase()) ? 1.2 : 1.0

  const score = (timelineImpact * reductionAmount * difficultyMultiplier) / 100

  if (score >= 5) return 'high'
  if (score >= 2) return 'medium'
  return 'low'
}

/**
 * Get spending insights summary for a user
 * @param {Array} spendingHistory - Historical spending data
 * @param {Array} dreams - User's dreams
 * @returns {Object} Comprehensive spending insights
 */
export function getSpendingInsights(spendingHistory, dreams = []) {
  if (!spendingHistory || spendingHistory.length === 0) {
    return {
      totalInsights: 0,
      predictions: [],
      anomalies: [],
      optimizations: [],
      summary: 'No spending data available for analysis'
    }
  }

  const insights = {
    totalInsights: 0,
    predictions: [],
    anomalies: [],
    optimizations: [],
    summary: ''
  }

  // Get unique categories
  const categories = [...new Set(spendingHistory.map(record => record.category))]
  
  // Generate predictions for each category
  categories.forEach(category => {
    const prediction = predictMonthlyNeeds(category, spendingHistory)
    if (prediction.predictedAmount > 0) {
      insights.predictions.push({
        category,
        ...prediction
      })
    }
  })

  // Generate optimizations for primary dream
  const primaryDream = dreams.find(dream => dream.status === 'active') || dreams[0]
  if (primaryDream) {
    insights.optimizations = suggestOptimizations(spendingHistory, primaryDream)
  }

  // Generate summary
  const totalPredicted = insights.predictions.reduce((sum, pred) => sum + pred.predictedAmount, 0)
  const topOptimization = insights.optimizations[0]
  
  let summary = `Based on your spending patterns, you typically spend $${Math.round(totalPredicted)} monthly across ${categories.length} categories.`
  
  if (topOptimization) {
    summary += ` Your biggest opportunity to accelerate your dreams is in ${topOptimization.category}, which could save you ${topOptimization.timelineImpactText}.`
  }

  insights.summary = summary
  insights.totalInsights = insights.predictions.length + insights.optimizations.length

  return insights
}

export default {
  predictMonthlyNeeds,
  detectAnomalies,
  suggestOptimizations,
  getSpendingInsights
}
