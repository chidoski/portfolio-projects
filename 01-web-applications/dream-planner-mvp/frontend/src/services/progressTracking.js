/**
 * Progress Tracking Service
 * Provides functions for tracking daily progress, calculating streaks, and analyzing completion projections
 */

// Storage keys
const STORAGE_KEYS = {
  PROGRESS_ENTRIES: 'progressEntries',
  DREAM_STREAKS: 'dreamStreaks'
}

/**
 * Check if localStorage is available and functional
 * @returns {boolean} True if localStorage is available
 */
function isLocalStorageAvailable() {
  try {
    const test = '__localStorage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch (e) {
    return false
  }
}

/**
 * Safely parse JSON with error handling
 * @param {string} jsonString - JSON string to parse
 * @param {*} fallback - Fallback value if parsing fails
 * @returns {*} Parsed object or fallback
 */
function safeJsonParse(jsonString, fallback = null) {
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    console.warn('Failed to parse JSON from localStorage:', error)
    return fallback
  }
}

/**
 * Safely stringify object with error handling
 * @param {*} data - Data to stringify
 * @returns {string|null} JSON string or null if failed
 */
function safeJsonStringify(data) {
  try {
    return JSON.stringify(data)
  } catch (error) {
    console.error('Failed to stringify data:', error)
    return null
  }
}

/**
 * Format date to YYYY-MM-DD string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDateString(date) {
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

/**
 * Get all progress entries from localStorage
 * @returns {Array} Array of all progress entries
 */
function getAllProgressEntries() {
  if (!isLocalStorageAvailable()) {
    return []
  }

  try {
    const entriesString = localStorage.getItem(STORAGE_KEYS.PROGRESS_ENTRIES)
    if (!entriesString) {
      return []
    }

    const entries = safeJsonParse(entriesString, [])
    return Array.isArray(entries) ? entries : []
  } catch (error) {
    console.error('Error loading progress entries:', error)
    return []
  }
}

/**
 * Save all progress entries to localStorage
 * @param {Array} entries - Array of progress entries
 * @returns {Object} Result object with success status
 */
function saveAllProgressEntries(entries) {
  if (!isLocalStorageAvailable()) {
    return {
      success: false,
      error: 'localStorage is not available',
      code: 'STORAGE_UNAVAILABLE'
    }
  }

  try {
    const jsonString = safeJsonStringify(entries)
    if (!jsonString) {
      return {
        success: false,
        error: 'Failed to serialize progress entries',
        code: 'SERIALIZATION_ERROR'
      }
    }

    localStorage.setItem(STORAGE_KEYS.PROGRESS_ENTRIES, jsonString)
    return {
      success: true,
      message: 'Progress entries saved successfully'
    }
  } catch (error) {
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      return {
        success: false,
        error: 'Storage quota exceeded. Please clear some browser data.',
        code: 'QUOTA_EXCEEDED'
      }
    }

    return {
      success: false,
      error: 'Failed to save progress entries',
      code: 'STORAGE_ERROR',
      originalError: error.message
    }
  }
}

/**
 * Mark daily progress for a dream
 * @param {string} dreamId - ID of the dream
 * @param {number} amount - Amount saved for this entry
 * @param {Date|string} date - Date of the progress (defaults to today)
 * @returns {Object} Result object with success status and entry data
 */
export function markDailyProgress(dreamId, amount, date = new Date()) {
  // Validate inputs
  if (!dreamId || typeof dreamId !== 'string') {
    return {
      success: false,
      error: 'Invalid dream ID provided',
      code: 'INVALID_DREAM_ID'
    }
  }

  if (typeof amount !== 'number' || amount <= 0) {
    return {
      success: false,
      error: 'Amount must be a positive number',
      code: 'INVALID_AMOUNT'
    }
  }

  const dateString = formatDateString(date)
  const timestamp = new Date().toISOString()

  try {
    // Get existing entries
    const allEntries = getAllProgressEntries()

    // Check if entry already exists for this dream and date
    const existingEntryIndex = allEntries.findIndex(
      entry => entry.dreamId === dreamId && entry.date === dateString
    )

    const progressEntry = {
      id: existingEntryIndex >= 0 ? allEntries[existingEntryIndex].id : `${dreamId}_${dateString}_${Date.now()}`,
      dreamId: dreamId,
      amount: amount,
      date: dateString,
      timestamp: timestamp,
      type: 'daily_progress'
    }

    if (existingEntryIndex >= 0) {
      // Update existing entry
      allEntries[existingEntryIndex] = {
        ...allEntries[existingEntryIndex],
        amount: amount,
        timestamp: timestamp,
        updatedAt: timestamp
      }
    } else {
      // Add new entry
      allEntries.push(progressEntry)
    }

    // Sort entries by date (newest first)
    allEntries.sort((a, b) => new Date(b.date) - new Date(a.date))

    // Save updated entries
    const saveResult = saveAllProgressEntries(allEntries)
    if (!saveResult.success) {
      return saveResult
    }

    return {
      success: true,
      message: existingEntryIndex >= 0 ? 'Progress entry updated successfully' : 'Progress entry added successfully',
      entry: progressEntry,
      isUpdate: existingEntryIndex >= 0
    }

  } catch (error) {
    return {
      success: false,
      error: 'Failed to mark daily progress',
      code: 'PROCESSING_ERROR',
      originalError: error.message
    }
  }
}

/**
 * Get progress history for a specific dream
 * @param {string} dreamId - ID of the dream
 * @returns {Array} Array of progress entries for the dream, sorted by date (newest first)
 */
export function getProgressHistory(dreamId) {
  if (!dreamId || typeof dreamId !== 'string') {
    console.warn('Invalid dream ID provided to getProgressHistory')
    return []
  }

  try {
    const allEntries = getAllProgressEntries()
    
    // Filter entries for this dream and sort by date
    const dreamEntries = allEntries
      .filter(entry => entry.dreamId === dreamId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))

    return dreamEntries
  } catch (error) {
    console.error('Error getting progress history:', error)
    return []
  }
}

/**
 * Calculate current streak for a dream based on progress history
 * @param {Array} progressHistory - Array of progress entries (should be sorted by date, newest first)
 * @returns {Object} Object containing streak information
 */
export function calculateStreak(progressHistory) {
  if (!Array.isArray(progressHistory) || progressHistory.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastProgressDate: null,
      isActiveToday: false
    }
  }

  try {
    // Sort by date to ensure proper order (newest first)
    const sortedHistory = [...progressHistory].sort((a, b) => new Date(b.date) - new Date(a.date))
    
    const today = formatDateString(new Date())
    const yesterday = formatDateString(new Date(Date.now() - 24 * 60 * 60 * 1000))
    
    // Check if user has progress today
    const isActiveToday = sortedHistory.some(entry => entry.date === today)
    
    // Calculate current streak
    let currentStreak = 0
    let checkDate = new Date()
    
    // If no progress today, start checking from yesterday
    if (!isActiveToday) {
      checkDate = new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
    
    // Count consecutive days with progress
    while (true) {
      const checkDateString = formatDateString(checkDate)
      const hasProgressOnDate = sortedHistory.some(entry => entry.date === checkDateString)
      
      if (hasProgressOnDate) {
        currentStreak++
        checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000) // Go back one day
      } else {
        break
      }
      
      // Safety check to prevent infinite loops
      if (currentStreak > 365) break
    }
    
    // Calculate longest streak
    let longestStreak = 0
    let tempStreak = 0
    let previousDate = null
    
    // Sort by date ascending for longest streak calculation
    const ascendingHistory = [...sortedHistory].sort((a, b) => new Date(a.date) - new Date(b.date))
    
    for (const entry of ascendingHistory) {
      const entryDate = new Date(entry.date)
      
      if (previousDate === null) {
        tempStreak = 1
      } else {
        const daysDiff = Math.round((entryDate - previousDate) / (24 * 60 * 60 * 1000))
        
        if (daysDiff === 1) {
          // Consecutive day
          tempStreak++
        } else {
          // Gap in streak, reset
          longestStreak = Math.max(longestStreak, tempStreak)
          tempStreak = 1
        }
      }
      
      previousDate = entryDate
    }
    
    longestStreak = Math.max(longestStreak, tempStreak)
    
    return {
      currentStreak: currentStreak,
      longestStreak: longestStreak,
      lastProgressDate: sortedHistory.length > 0 ? sortedHistory[0].date : null,
      isActiveToday: isActiveToday,
      totalProgressDays: sortedHistory.length,
      averageAmount: sortedHistory.length > 0 ? 
        sortedHistory.reduce((sum, entry) => sum + entry.amount, 0) / sortedHistory.length : 0
    }
  } catch (error) {
    console.error('Error calculating streak:', error)
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastProgressDate: null,
      isActiveToday: false,
      error: error.message
    }
  }
}

/**
 * Calculate projected completion status based on dream and progress history
 * @param {Object} dream - Dream object with target_amount, target_date, etc.
 * @param {Array} progressHistory - Array of progress entries
 * @returns {Object} Object containing projection analysis
 */
export function calculateProjectedCompletion(dream, progressHistory) {
  if (!dream || !dream.target_amount || !dream.target_date) {
    return {
      status: 'unknown',
      error: 'Invalid dream data provided'
    }
  }

  try {
    const targetAmount = dream.target_amount
    const targetDate = new Date(dream.target_date)
    const today = new Date()
    const createdDate = new Date(dream.createdAt || today)
    
    // Calculate time periods
    const totalDays = Math.ceil((targetDate - createdDate) / (1000 * 60 * 60 * 24))
    const daysRemaining = Math.max(0, Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24)))
    const daysPassed = totalDays - daysRemaining
    
    // Calculate progress amounts
    const totalSaved = progressHistory.reduce((sum, entry) => sum + entry.amount, 0)
    const remainingAmount = Math.max(0, targetAmount - totalSaved)
    const progressPercentage = (totalSaved / targetAmount) * 100
    
    // Calculate required daily rate
    const originalDailyRate = targetAmount / totalDays
    const requiredDailyRate = daysRemaining > 0 ? remainingAmount / daysRemaining : 0
    
    // Calculate actual daily rate based on recent progress
    const recentEntries = progressHistory
      .filter(entry => {
        const entryDate = new Date(entry.date)
        const daysAgo = Math.ceil((today - entryDate) / (1000 * 60 * 60 * 24))
        return daysAgo <= 30 // Last 30 days
      })
    
    const actualDailyRate = recentEntries.length > 0 ? 
      recentEntries.reduce((sum, entry) => sum + entry.amount, 0) / Math.min(30, daysPassed) : 0
    
    // Determine status
    let status = 'on_track'
    let projectedCompletionDate = null
    let daysAheadBehind = 0
    
    if (progressPercentage >= 100) {
      status = 'completed'
    } else if (daysRemaining === 0) {
      status = 'overdue'
    } else {
      // Calculate projected completion based on current rate
      if (actualDailyRate > 0) {
        const daysToComplete = Math.ceil(remainingAmount / actualDailyRate)
        projectedCompletionDate = new Date(today.getTime() + daysToComplete * 24 * 60 * 60 * 1000)
        daysAheadBehind = daysRemaining - daysToComplete
        
        if (daysAheadBehind > 7) {
          status = 'ahead'
        } else if (daysAheadBehind < -7) {
          status = 'behind'
        } else {
          status = 'on_track'
        }
      } else {
        // No recent progress
        status = 'behind'
        daysAheadBehind = -daysRemaining
      }
    }
    
    // Calculate streak info
    const streakInfo = calculateStreak(progressHistory)
    
    return {
      status: status, // 'ahead', 'on_track', 'behind', 'completed', 'overdue'
      progressPercentage: Math.round(progressPercentage * 100) / 100,
      totalSaved: totalSaved,
      remainingAmount: remainingAmount,
      daysRemaining: daysRemaining,
      daysPassed: daysPassed,
      totalDays: totalDays,
      originalDailyRate: Math.round(originalDailyRate * 100) / 100,
      requiredDailyRate: Math.round(requiredDailyRate * 100) / 100,
      actualDailyRate: Math.round(actualDailyRate * 100) / 100,
      projectedCompletionDate: projectedCompletionDate ? projectedCompletionDate.toISOString().split('T')[0] : null,
      daysAheadBehind: daysAheadBehind,
      streak: streakInfo,
      recommendation: generateRecommendation(status, daysAheadBehind, streakInfo, requiredDailyRate, actualDailyRate)
    }
  } catch (error) {
    console.error('Error calculating projected completion:', error)
    return {
      status: 'error',
      error: error.message
    }
  }
}

/**
 * Generate recommendation based on projection analysis
 * @param {string} status - Current status (ahead, on_track, behind, etc.)
 * @param {number} daysAheadBehind - Days ahead (positive) or behind (negative)
 * @param {Object} streakInfo - Streak information
 * @param {number} requiredDailyRate - Required daily savings rate
 * @param {number} actualDailyRate - Actual daily savings rate
 * @returns {string} Recommendation message
 */
function generateRecommendation(status, daysAheadBehind, streakInfo, requiredDailyRate, actualDailyRate) {
  switch (status) {
    case 'completed':
      return '🎉 Congratulations! You\'ve achieved your dream! Time to celebrate and set a new goal.'
    
    case 'ahead':
      return `🚀 Excellent work! You're ${daysAheadBehind} days ahead of schedule. Consider maintaining this pace or setting a more ambitious goal.`
    
    case 'on_track':
      if (streakInfo.currentStreak >= 7) {
        return '✨ Perfect! You\'re on track and building great habits. Keep up the consistent progress!'
      } else {
        return '👍 You\'re on track to meet your goal. Try to build a longer streak for better momentum.'
      }
    
    case 'behind':
      if (Math.abs(daysAheadBehind) <= 14) {
        return `⚡ You're ${Math.abs(daysAheadBehind)} days behind, but it's recoverable! Increase your daily savings to $${requiredDailyRate.toFixed(2)} to get back on track.`
      } else {
        return `🎯 You're significantly behind schedule. Consider extending your target date or increasing your daily savings rate significantly.`
      }
    
    case 'overdue':
      return '📅 Your target date has passed. Consider setting a new realistic target date and adjusting your savings strategy.'
    
    default:
      return '📊 Keep tracking your progress to get personalized recommendations!'
  }
}

/**
 * Get progress statistics for all dreams
 * @returns {Object} Overall progress statistics
 */
export function getOverallProgressStats() {
  try {
    const allEntries = getAllProgressEntries()
    
    if (allEntries.length === 0) {
      return {
        totalEntries: 0,
        totalAmount: 0,
        activeDreams: 0,
        averageDaily: 0,
        lastProgressDate: null
      }
    }
    
    const totalAmount = allEntries.reduce((sum, entry) => sum + entry.amount, 0)
    const activeDreams = new Set(allEntries.map(entry => entry.dreamId)).size
    const lastProgressDate = allEntries.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date
    
    // Calculate average daily amount over last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const recentEntries = allEntries.filter(entry => new Date(entry.date) >= thirtyDaysAgo)
    const averageDaily = recentEntries.length > 0 ? 
      recentEntries.reduce((sum, entry) => sum + entry.amount, 0) / recentEntries.length : 0
    
    return {
      totalEntries: allEntries.length,
      totalAmount: Math.round(totalAmount * 100) / 100,
      activeDreams: activeDreams,
      averageDaily: Math.round(averageDaily * 100) / 100,
      lastProgressDate: lastProgressDate,
      recentEntries: recentEntries.length
    }
  } catch (error) {
    console.error('Error getting overall progress stats:', error)
    return {
      totalEntries: 0,
      totalAmount: 0,
      activeDreams: 0,
      averageDaily: 0,
      lastProgressDate: null,
      error: error.message
    }
  }
}

/**
 * Clear all progress entries (useful for testing or reset)
 * @returns {Object} Result object with success status
 */
export function clearAllProgressEntries() {
  if (!isLocalStorageAvailable()) {
    return {
      success: false,
      error: 'localStorage is not available',
      code: 'STORAGE_UNAVAILABLE'
    }
  }

  try {
    localStorage.removeItem(STORAGE_KEYS.PROGRESS_ENTRIES)
    return {
      success: true,
      message: 'All progress entries cleared successfully'
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to clear progress entries',
      code: 'STORAGE_ERROR',
      originalError: error.message
    }
  }
}
