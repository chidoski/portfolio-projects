import { useState, useEffect, useMemo } from 'react'
import { 
  Calendar, 
  Trophy, 
  Target, 
  TrendingUp, 
  Award, 
  Star,
  Flame,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react'
import { format, subDays, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from 'date-fns'
import { getBucketBalances } from '../services/bucketTransactions'
import { allocateFunds } from '../services/bucketAllocator'

/**
 * SavingsStreakTracker Component
 * 
 * Gamifies consistent saving with:
 * - GitHub-style calendar heat map for daily progress
 * - Separate streak counters for each bucket
 * - Perfect Month badges
 * - Personalized motivational messages
 */
export default function SavingsStreakTracker({ 
  financialProfile, 
  currentDream, 
  availableMonthly,
  className = '' 
}) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('month') // 'month' or 'year'
  const [currentViewDate, setCurrentViewDate] = useState(new Date())
  const [savingsData, setSavingsData] = useState({})
  const [bucketTargets, setBucketTargets] = useState({})
  const [showTooltip, setShowTooltip] = useState(null)

  // Get current bucket allocation targets
  useEffect(() => {
    if (financialProfile && availableMonthly) {
      const allocation = allocateFunds(availableMonthly, financialProfile, 'balanced')
      setBucketTargets({
        foundation: allocation.foundation || 0,
        dream: allocation.dream || 0,
        life: allocation.life || 0
      })
    }
  }, [financialProfile, availableMonthly])

  // Generate mock savings data for demonstration
  useEffect(() => {
    const generateMockData = () => {
      const data = {}
      const startDate = subDays(new Date(), 365) // Last year
      const endDate = new Date()
      
      const interval = eachDayOfInterval({ start: startDate, end: endDate })
      
      interval.forEach(date => {
        const dateKey = format(date, 'yyyy-MM-dd')
        const dayOfWeek = date.getDay()
        
        // Higher probability of saving on weekdays
        const baseChance = dayOfWeek === 0 || dayOfWeek === 6 ? 0.6 : 0.8
        
        // Create realistic saving patterns
        const foundationTarget = bucketTargets.foundation || 200
        const dreamTarget = bucketTargets.dream || 150
        const lifeTarget = bucketTargets.life || 50
        
        const foundationSaved = Math.random() < baseChance ? 
          foundationTarget * (0.7 + Math.random() * 0.6) : 0
        const dreamSaved = Math.random() < baseChance ? 
          dreamTarget * (0.7 + Math.random() * 0.6) : 0
        const lifeSaved = Math.random() < baseChance ? 
          lifeTarget * (0.7 + Math.random() * 0.6) : 0
        
        data[dateKey] = {
          foundation: {
            saved: Math.round(foundationSaved * 100) / 100,
            target: foundationTarget,
            achieved: foundationSaved >= foundationTarget
          },
          dream: {
            saved: Math.round(dreamSaved * 100) / 100,
            target: dreamTarget,
            achieved: dreamSaved >= dreamTarget
          },
          life: {
            saved: Math.round(lifeSaved * 100) / 100,
            target: lifeTarget,
            achieved: lifeSaved >= lifeTarget
          },
          allTargetsMet: foundationSaved >= foundationTarget && 
                        dreamSaved >= dreamTarget && 
                        lifeSaved >= lifeTarget,
          totalSaved: Math.round((foundationSaved + dreamSaved + lifeSaved) * 100) / 100
        }
      })
      
      setSavingsData(data)
    }
    
    if (Object.keys(bucketTargets).length > 0) {
      generateMockData()
    }
  }, [bucketTargets])

  // Calculate streaks for each bucket
  const streakStats = useMemo(() => {
    const stats = {
      foundation: { current: 0, longest: 0 },
      dream: { current: 0, longest: 0 },
      life: { current: 0, longest: 0 },
      perfect: { current: 0, longest: 0 } // All three buckets
    }

    const sortedDates = Object.keys(savingsData).sort().reverse()
    
    Object.keys(stats).forEach(bucket => {
      let currentStreak = 0
      let longestStreak = 0
      let tempStreak = 0
      
      // Calculate current streak (from today backwards)
      for (const dateKey of sortedDates) {
        const dayData = savingsData[dateKey]
        let achieved = false
        
        if (bucket === 'perfect') {
          achieved = dayData.allTargetsMet
        } else {
          achieved = dayData[bucket]?.achieved || false
        }
        
        if (achieved) {
          if (currentStreak === tempStreak) {
            currentStreak++
          }
          tempStreak++
        } else {
          if (currentStreak === tempStreak) {
            currentStreak = 0
          }
          longestStreak = Math.max(longestStreak, tempStreak)
          tempStreak = 0
        }
      }
      
      longestStreak = Math.max(longestStreak, tempStreak)
      stats[bucket] = { current: currentStreak, longest: longestStreak }
    })
    
    return stats
  }, [savingsData])

  // Calculate perfect month badges
  const perfectMonths = useMemo(() => {
    const months = {}
    
    Object.entries(savingsData).forEach(([dateKey, dayData]) => {
      const date = new Date(dateKey)
      const monthKey = format(date, 'yyyy-MM')
      
      if (!months[monthKey]) {
        months[monthKey] = {
          daysInMonth: endOfMonth(date).getDate(),
          perfectDays: 0,
          totalSaved: 0
        }
      }
      
      if (dayData.allTargetsMet) {
        months[monthKey].perfectDays++
      }
      months[monthKey].totalSaved += dayData.totalSaved
    })
    
    // Identify perfect months (all days in month achieved targets)
    const perfectMonthsList = Object.entries(months)
      .filter(([monthKey, data]) => data.perfectDays === data.daysInMonth)
      .map(([monthKey]) => monthKey)
    
    return perfectMonthsList
  }, [savingsData])

  // Generate motivational messages
  const motivationalMessage = useMemo(() => {
    if (!currentDream) return "Keep building your financial future, one day at a time! 💪"
    
    const dreamTitle = currentDream.title || "your dream"
    const progressPercentage = currentDream.progress || 0
    const remainingPercentage = 100 - progressPercentage
    const dailyProgress = remainingPercentage > 0 ? (1 / (remainingPercentage * 100)) * 100 : 0
    
    const messages = [
      `Each day gets you ${dailyProgress.toFixed(1)}% closer to ${dreamTitle}! 🎯`,
      `Your ${dreamTitle} is ${progressPercentage}% funded - keep the momentum! 🚀`,
      `Every contribution brings ${dreamTitle} within reach! ✨`,
      `Building towards ${dreamTitle}, one day at a time! 🏗️`,
      `Your consistent saving is making ${dreamTitle} a reality! 🌟`
    ]
    
    // Add streak-based messages
    if (streakStats.perfect.current >= 7) {
      messages.push(`${streakStats.perfect.current} perfect days in a row - you're unstoppable! 🔥`)
    }
    
    if (perfectMonths.length > 0) {
      messages.push(`${perfectMonths.length} perfect months completed - you're a savings champion! 🏆`)
    }
    
    return messages[Math.floor(Math.random() * messages.length)]
  }, [currentDream, streakStats, perfectMonths])

  // Get heat map intensity for a specific date
  const getHeatMapIntensity = (date) => {
    const dateKey = format(date, 'yyyy-MM-dd')
    const dayData = savingsData[dateKey]
    
    if (!dayData || dayData.totalSaved === 0) return 0
    
    const totalTarget = (bucketTargets.foundation || 0) + (bucketTargets.dream || 0) + (bucketTargets.life || 0)
    if (totalTarget === 0) return 0
    
    const percentage = dayData.totalSaved / totalTarget
    
    // Return intensity level 1-4 based on percentage
    if (percentage >= 1.5) return 4 // 150%+ - darkest
    if (percentage >= 1.2) return 3 // 120%+ - dark
    if (percentage >= 1.0) return 2 // 100%+ - medium
    if (percentage >= 0.5) return 1 // 50%+ - light
    return 0 // Less than 50% - no color
  }

  // Get CSS class for heat map cell
  const getHeatMapCellClass = (intensity, isSelected = false, isPerfectDay = false) => {
    let baseClass = 'w-3 h-3 rounded-sm border border-gray-200 cursor-pointer transition-all duration-200 hover:border-gray-400'
    
    if (isSelected) {
      baseClass += ' ring-2 ring-blue-500'
    }
    
    if (isPerfectDay) {
      baseClass += ' ring-1 ring-yellow-400'
    }
    
    switch (intensity) {
      case 4: return `${baseClass} bg-green-600`
      case 3: return `${baseClass} bg-green-500`
      case 2: return `${baseClass} bg-green-400`
      case 1: return `${baseClass} bg-green-200`
      default: return `${baseClass} bg-gray-100`
    }
  }

  // Generate calendar days for month view
  const getMonthDays = () => {
    const start = startOfMonth(currentViewDate)
    const end = endOfMonth(currentViewDate)
    
    // Get all days in the month
    const monthDays = eachDayOfInterval({ start, end })
    
    // Add padding days to complete weeks
    const startDay = start.getDay()
    const endDay = end.getDay()
    
    const paddingStart = Array.from({ length: startDay }, (_, i) => 
      subDays(start, startDay - i)
    )
    
    const paddingEnd = Array.from({ length: 6 - endDay }, (_, i) => 
      addDays(end, i + 1)
    )
    
    return [...paddingStart, ...monthDays, ...paddingEnd]
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const monthDays = getMonthDays()
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Calendar className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">Savings Streak Tracker</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentViewDate(subDays(currentViewDate, 30))}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-gray-600 min-w-[120px] text-center">
            {format(currentViewDate, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setCurrentViewDate(addDays(currentViewDate, 30))}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Motivational Message */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <div className="flex items-center">
          <Star className="w-5 h-5 text-yellow-500 mr-2" />
          <p className="text-gray-700 font-medium">{motivationalMessage}</p>
        </div>
      </div>

      {/* Streak Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Foundation Streak */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Target className="w-4 h-4 text-blue-600 mr-1" />
              <span className="text-sm font-medium text-blue-800">Foundation</span>
            </div>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{streakStats.foundation.current}</div>
          <div className="text-xs text-blue-600">days • best: {streakStats.foundation.longest}</div>
        </div>

        {/* Dream Streak */}
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-purple-600 mr-1" />
              <span className="text-sm font-medium text-purple-800">Dream</span>
            </div>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-purple-900">{streakStats.dream.current}</div>
          <div className="text-xs text-purple-600">days • best: {streakStats.dream.longest}</div>
        </div>

        {/* Life Streak */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-sm font-medium text-green-800">Life</span>
            </div>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-green-900">{streakStats.life.current}</div>
          <div className="text-xs text-green-600">days • best: {streakStats.life.longest}</div>
        </div>

        {/* Perfect Days Streak */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Trophy className="w-4 h-4 text-yellow-600 mr-1" />
              <span className="text-sm font-medium text-yellow-800">Perfect</span>
            </div>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-yellow-900">{streakStats.perfect.current}</div>
          <div className="text-xs text-yellow-600">days • best: {streakStats.perfect.longest}</div>
        </div>
      </div>

      {/* Perfect Month Badges */}
      {perfectMonths.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <Award className="w-5 h-5 text-gold-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Perfect Month Badges</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {perfectMonths.map(monthKey => (
              <div
                key={monthKey}
                className="flex items-center bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md"
              >
                <Trophy className="w-3 h-3 mr-1" />
                {format(new Date(monthKey + '-01'), 'MMM yyyy')}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Heat Map Calendar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Daily Progress Heat Map</h3>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>Less</span>
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-gray-100 rounded-sm border border-gray-200"></div>
              <div className="w-3 h-3 bg-green-200 rounded-sm border border-gray-200"></div>
              <div className="w-3 h-3 bg-green-400 rounded-sm border border-gray-200"></div>
              <div className="w-3 h-3 bg-green-500 rounded-sm border border-gray-200"></div>
              <div className="w-3 h-3 bg-green-600 rounded-sm border border-gray-200"></div>
            </div>
            <span>More</span>
          </div>
        </div>

        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-xs text-gray-500 text-center py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {monthDays.map((date, index) => {
            const dateKey = format(date, 'yyyy-MM-dd')
            const dayData = savingsData[dateKey]
            const intensity = getHeatMapIntensity(date)
            const isSelected = selectedDate && isSameDay(date, selectedDate)
            const isPerfectDay = dayData?.allTargetsMet
            const isCurrentMonth = isSameMonth(date, currentViewDate)
            
            return (
              <div
                key={index}
                className={`relative ${!isCurrentMonth ? 'opacity-30' : ''}`}
                onMouseEnter={() => setShowTooltip({ date, data: dayData, index })}
                onMouseLeave={() => setShowTooltip(null)}
                onClick={() => setSelectedDate(date)}
              >
                <div className={getHeatMapCellClass(intensity, isSelected, isPerfectDay)}>
                  {/* Day number for larger screens */}
                  <div className="text-[8px] text-gray-600 absolute inset-0 flex items-center justify-center font-medium">
                    {format(date, 'd')}
                  </div>
                </div>
                
                {/* Tooltip */}
                {showTooltip?.index === index && (
                  <div className="absolute z-10 bg-gray-900 text-white p-3 rounded-lg shadow-lg text-xs min-w-[200px] bottom-6 left-1/2 transform -translate-x-1/2">
                    <div className="font-semibold mb-2">{format(date, 'MMM d, yyyy')}</div>
                    {dayData ? (
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Foundation:</span>
                          <span className={dayData.foundation.achieved ? 'text-green-400' : 'text-red-400'}>
                            {formatCurrency(dayData.foundation.saved)} / {formatCurrency(dayData.foundation.target)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Dream:</span>
                          <span className={dayData.dream.achieved ? 'text-green-400' : 'text-red-400'}>
                            {formatCurrency(dayData.dream.saved)} / {formatCurrency(dayData.dream.target)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Life:</span>
                          <span className={dayData.life.achieved ? 'text-green-400' : 'text-red-400'}>
                            {formatCurrency(dayData.life.saved)} / {formatCurrency(dayData.life.target)}
                          </span>
                        </div>
                        <div className="border-t border-gray-600 pt-1 mt-2">
                          <div className="flex justify-between font-semibold">
                            <span>Total:</span>
                            <span>{formatCurrency(dayData.totalSaved)}</span>
                          </div>
                          {dayData.allTargetsMet && (
                            <div className="text-yellow-400 text-center mt-1">
                              ⭐ Perfect Day!
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-400">No activity</div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDate && savingsData[format(selectedDate, 'yyyy-MM-dd')] && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(savingsData[format(selectedDate, 'yyyy-MM-dd')]).map(([bucket, data]) => {
              if (typeof data === 'object' && data.saved !== undefined) {
                return (
                  <div key={bucket} className="flex items-center justify-between p-3 bg-white rounded border">
                    <div className="flex items-center">
                      <CheckCircle className={`w-4 h-4 mr-2 ${data.achieved ? 'text-green-500' : 'text-gray-300'}`} />
                      <span className="capitalize font-medium">{bucket}</span>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${data.achieved ? 'text-green-600' : 'text-gray-600'}`}>
                        {formatCurrency(data.saved)}
                      </div>
                      <div className="text-xs text-gray-500">
                        of {formatCurrency(data.target)}
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center mb-2">
          <Info className="w-4 h-4 text-blue-600 mr-2" />
          <span className="text-sm font-medium text-blue-800">How to read the heat map</span>
        </div>
        <div className="text-xs text-blue-700 space-y-1">
          <div>• <strong>Darker green</strong> = Higher percentage of daily targets met</div>
          <div>• <strong>Yellow ring</strong> = Perfect day (all three buckets funded)</div>
          <div>• <strong>Streaks</strong> = Consecutive days meeting bucket targets</div>
          <div>• <strong>Perfect Month</strong> = All days in month achieved all targets</div>
        </div>
      </div>
    </div>
  )
}
