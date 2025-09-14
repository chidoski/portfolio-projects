/**
 * Demo Data Service
 * Provides mock user data with realistic dreams and progress history
 */

import { format, subDays, addDays } from 'date-fns'

/**
 * Generate realistic progress history for a dream
 * @param {number} streakDays - Number of consecutive days
 * @param {number} dailyAmount - Target daily savings amount
 * @param {number} currentProgress - Current completion percentage (0-100)
 * @returns {Array} Array of progress entries
 */
function generateProgressHistory(streakDays, dailyAmount, currentProgress) {
  const history = []
  const today = new Date()
  let cumulativeAmount = 0
  
  // Calculate what the cumulative amount should be based on current progress
  // We'll work backwards from the target progress
  const targetCumulativeAmount = (currentProgress / 100) * (dailyAmount * streakDays * 2.5) // Rough estimate
  
  for (let i = streakDays - 1; i >= 0; i--) {
    const date = subDays(today, i)
    
    // Add some realistic variation to daily savings (80% to 120% of target)
    const variation = 0.8 + Math.random() * 0.4
    let savedAmount = dailyAmount * variation
    
    // Occasionally miss a day or save extra (more realistic)
    const randomFactor = Math.random()
    if (randomFactor < 0.05) {
      // 5% chance of missing the day entirely
      savedAmount = 0
    } else if (randomFactor < 0.15) {
      // 10% chance of saving less than half
      savedAmount = dailyAmount * (0.2 + Math.random() * 0.3)
    } else if (randomFactor > 0.9) {
      // 10% chance of saving extra (bonus day)
      savedAmount = dailyAmount * (1.5 + Math.random() * 0.5)
    }
    
    cumulativeAmount += savedAmount
    
    history.push({
      date: format(date, 'yyyy-MM-dd'),
      savedAmount: Math.round(savedAmount * 100) / 100,
      cumulativeAmount: Math.round(cumulativeAmount * 100) / 100,
      notes: generateRandomNote(savedAmount, dailyAmount),
      streak: streakDays - i,
      dayOfWeek: format(date, 'EEEE'),
      isWeekend: [0, 6].includes(date.getDay())
    })
  }
  
  // Adjust the cumulative amounts to match the target progress more closely
  const actualFinalAmount = history[history.length - 1].cumulativeAmount
  const adjustmentRatio = targetCumulativeAmount / actualFinalAmount
  
  history.forEach(entry => {
    entry.cumulativeAmount = Math.round(entry.cumulativeAmount * adjustmentRatio * 100) / 100
  })
  
  return history
}

/**
 * Generate random notes for savings entries
 * @param {number} savedAmount - Amount saved that day
 * @param {number} targetAmount - Target daily amount
 * @returns {string} Random note
 */
function generateRandomNote(savedAmount, targetAmount) {
  const notes = [
    "Skipped coffee today ☕",
    "Found $5 in old jeans! 💰",
    "Cooked dinner instead of ordering 🍳",
    "Walked to work, saved on gas ⛽",
    "Used a coupon at grocery store 🎫",
    "Sold some old books 📚",
    "Freelance payment came in 💻",
    "Returned unused items 📦",
    "Packed lunch for work 🥪",
    "Cancelled unused subscription 📱",
    "Got cashback from credit card 💳",
    "Saved on utilities this month ⚡",
    "Birthday money from grandma! 🎂",
    "Chose generic brand at store 🛒",
    "Biked instead of taking Uber 🚲",
    "Made coffee at home ☕",
    "Used library instead of buying book 📖",
    "Happy hour savings 🍻",
    "Meal prep Sunday success! 🥘",
    "Found a great deal online 💻"
  ]
  
  if (savedAmount === 0) {
    return "Missed today - will catch up tomorrow 😅"
  } else if (savedAmount < targetAmount * 0.5) {
    return "Tough day, but something is better than nothing 💪"
  } else if (savedAmount > targetAmount * 1.5) {
    return "Bonus day! Extra savings! 🎉"
  }
  
  return notes[Math.floor(Math.random() * notes.length)]
}

/**
 * Calculate milestone progress for a dream
 * @param {number} currentAmount - Current saved amount
 * @param {number} targetAmount - Target dream amount
 * @returns {Array} Array of milestone objects with completion status
 */
function calculateMilestoneProgress(currentAmount, targetAmount) {
  const milestones = [
    { percentage: 10, amount: targetAmount * 0.1, name: "First Steps" },
    { percentage: 25, amount: targetAmount * 0.25, name: "Quarter Way" },
    { percentage: 50, amount: targetAmount * 0.5, name: "Halfway Point" },
    { percentage: 75, amount: targetAmount * 0.75, name: "Three Quarters" },
    { percentage: 90, amount: targetAmount * 0.9, name: "Almost There" },
    { percentage: 100, amount: targetAmount, name: "Dream Achieved!" }
  ]
  
  return milestones.map(milestone => ({
    ...milestone,
    completed: currentAmount >= milestone.amount,
    completedDate: currentAmount >= milestone.amount ? 
      format(subDays(new Date(), Math.floor(Math.random() * 30)), 'yyyy-MM-dd') : null
  }))
}

/**
 * Get demo user data with three dreams in various stages
 * @returns {Object} Complete demo user object
 */
export function getDemoUser() {
  const today = new Date()
  
  // Dream 1: Trip to Japan (45% complete, 127-day streak)
  const japanDream = {
    id: 'demo-japan-trip',
    title: 'Trip to Japan',
    description: 'Two weeks exploring Tokyo, Kyoto, and Mount Fuji with cherry blossoms, amazing food, and cultural experiences.',
    category: 'travel',
    target_amount: 8500,
    target_date: format(addDays(today, 180), 'yyyy-MM-dd'), // 6 months from now
    image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
    status: 'active',
    progress: 45,
    current_amount: 3825, // 45% of 8500
    daily_amount: 25.50,
    weekly_amount: 178.50,
    monthly_amount: 765,
    selectedStrategy: 'balanced',
    streak: 127,
    longestStreak: 127,
    createdAt: format(subDays(today, 140), 'yyyy-MM-dd'),
    lastUpdated: format(today, 'yyyy-MM-dd'),
    progressHistory: generateProgressHistory(127, 25.50, 45),
    milestones: calculateMilestoneProgress(3825, 8500),
    tags: ['travel', 'adventure', 'culture', 'bucket-list'],
    notes: 'Researching best times to visit and booking flights early for better deals!'
  }
  
  // Dream 2: Tesla Model 3 (15% complete, 30-day streak)
  const teslaDream = {
    id: 'demo-tesla-model3',
    title: 'Tesla Model 3',
    description: 'Sustainable transportation with cutting-edge technology, autopilot features, and zero emissions for daily commuting.',
    category: 'lifestyle',
    target_amount: 45000,
    target_date: format(addDays(today, 720), 'yyyy-MM-dd'), // 2 years from now
    image_url: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',
    status: 'active',
    progress: 15,
    current_amount: 6750, // 15% of 45000
    daily_amount: 55.00,
    weekly_amount: 385.00,
    monthly_amount: 1650,
    selectedStrategy: 'relaxed',
    streak: 30,
    longestStreak: 45,
    createdAt: format(subDays(today, 45), 'yyyy-MM-dd'),
    lastUpdated: format(today, 'yyyy-MM-dd'),
    progressHistory: generateProgressHistory(30, 55.00, 15),
    milestones: calculateMilestoneProgress(6750, 45000),
    tags: ['car', 'electric', 'technology', 'environment'],
    notes: 'Waiting for the new model refresh and considering trade-in value of current car.'
  }
  
  // Dream 3: Home Renovation (75% complete, 200-day streak)
  const renovationDream = {
    id: 'demo-home-renovation',
    title: 'Home Renovation',
    description: 'Complete kitchen and bathroom remodel with modern appliances, new flooring, and improved lighting throughout.',
    category: 'home',
    target_amount: 25000,
    target_date: format(addDays(today, 60), 'yyyy-MM-dd'), // 2 months from now
    image_url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
    status: 'active',
    progress: 75,
    current_amount: 18750, // 75% of 25000
    daily_amount: 42.00,
    weekly_amount: 294.00,
    monthly_amount: 1260,
    selectedStrategy: 'aggressive',
    streak: 200,
    longestStreak: 200,
    createdAt: format(subDays(today, 220), 'yyyy-MM-dd'),
    lastUpdated: format(today, 'yyyy-MM-dd'),
    progressHistory: generateProgressHistory(200, 42.00, 75),
    milestones: calculateMilestoneProgress(18750, 25000),
    tags: ['home', 'renovation', 'investment', 'lifestyle'],
    notes: 'Already got quotes from contractors. Planning to start work in spring!'
  }
  
  // Calculate user statistics
  const dreams = [japanDream, teslaDream, renovationDream]
  const totalSaved = dreams.reduce((sum, dream) => sum + dream.current_amount, 0)
  const totalTarget = dreams.reduce((sum, dream) => sum + dream.target_amount, 0)
  const averageProgress = dreams.reduce((sum, dream) => sum + dream.progress, 0) / dreams.length
  const totalStreak = Math.max(...dreams.map(dream => dream.streak))
  const activeDreams = dreams.filter(dream => dream.status === 'active').length
  
  return {
    id: 'demo-user-123',
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    joinDate: format(subDays(today, 250), 'yyyy-MM-dd'),
    totalDreams: dreams.length,
    activeDreams: activeDreams,
    completedDreams: 0,
    totalSaved: Math.round(totalSaved * 100) / 100,
    totalTarget: totalTarget,
    averageProgress: Math.round(averageProgress * 100) / 100,
    longestStreak: totalStreak,
    currentStreak: Math.min(...dreams.map(dream => dream.streak)),
    dreams: dreams,
    achievements: [
      {
        id: 'first-dream',
        name: 'Dream Starter',
        description: 'Created your first dream',
        unlockedDate: format(subDays(today, 220), 'yyyy-MM-dd'),
        icon: '🌟'
      },
      {
        id: 'streak-30',
        name: '30-Day Streak',
        description: 'Saved consistently for 30 days',
        unlockedDate: format(subDays(today, 190), 'yyyy-MM-dd'),
        icon: '🔥'
      },
      {
        id: 'streak-100',
        name: '100-Day Streak',
        description: 'Saved consistently for 100 days',
        unlockedDate: format(subDays(today, 120), 'yyyy-MM-dd'),
        icon: '💯'
      },
      {
        id: 'milestone-master',
        name: 'Milestone Master',
        description: 'Reached 10 milestones across all dreams',
        unlockedDate: format(subDays(today, 80), 'yyyy-MM-dd'),
        icon: '🎯'
      },
      {
        id: 'big-saver',
        name: 'Big Saver',
        description: 'Saved over $10,000 total',
        unlockedDate: format(subDays(today, 50), 'yyyy-MM-dd'),
        icon: '💰'
      }
    ],
    preferences: {
      currency: 'USD',
      notifications: {
        dailyReminders: true,
        milestoneAlerts: true,
        weeklyReports: true
      },
      privacy: {
        shareProgress: false,
        publicProfile: false
      }
    },
    stats: {
      totalDaysSaving: 220,
      averageDailySavings: Math.round((totalSaved / 220) * 100) / 100,
      bestSavingDay: Math.max(...dreams.flatMap(dream => 
        dream.progressHistory.map(entry => entry.savedAmount)
      )),
      totalTransactions: dreams.reduce((sum, dream) => sum + dream.progressHistory.length, 0),
      favoriteCategory: 'home' // Based on highest progress
    }
  }
}

/**
 * Get demo data for a specific dream by ID
 * @param {string} dreamId - The dream ID to retrieve
 * @returns {Object|null} Dream object or null if not found
 */
export function getDemoDream(dreamId) {
  const user = getDemoUser()
  return user.dreams.find(dream => dream.id === dreamId) || null
}

/**
 * Get demo progress history for a specific dream
 * @param {string} dreamId - The dream ID
 * @param {number} days - Number of recent days to return (default: 30)
 * @returns {Array} Array of progress entries
 */
export function getDemoProgressHistory(dreamId, days = 30) {
  const dream = getDemoDream(dreamId)
  if (!dream) return []
  
  return dream.progressHistory.slice(-days)
}

/**
 * Get demo statistics summary
 * @returns {Object} Statistics object
 */
export function getDemoStats() {
  const user = getDemoUser()
  return {
    totalUsers: 1,
    totalDreams: user.totalDreams,
    totalSaved: user.totalSaved,
    averageProgress: user.averageProgress,
    mostPopularCategory: 'travel',
    successRate: 85.5
  }
}
