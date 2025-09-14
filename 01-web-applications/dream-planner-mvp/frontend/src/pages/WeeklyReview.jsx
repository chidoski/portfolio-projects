import { useState, useEffect, useMemo } from 'react'
import { 
  Calendar, 
  TrendingUp, 
  Heart, 
  Target, 
  Award,
  Coffee,
  Home,
  Sparkles,
  ChevronRight,
  Plus,
  Minus,
  CheckCircle,
  Star,
  MapPin,
  Clock,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Lightbulb,
  MessageCircle
} from 'lucide-react'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subDays, addDays, isSameDay } from 'date-fns'
import { getDailyMessage, getCelebrationMessage } from '../services/behavioralNudges'
import { getProgressHistory, calculateStreak } from '../services/progressTracking'
import { loadDreams } from '../services/localStorage'

/**
 * WeeklyReview Component
 * 
 * A supportive Sunday ritual that feels like a coaching session, not a performance review.
 * Includes beautiful visualizations, automated win detection, shame-free expense logging,
 * and personalized action planning for the cottage dream.
 */
export default function WeeklyReview({ currentDream, financialProfile, onClose }) {
  const [selectedWeek, setSelectedWeek] = useState(new Date())
  const [weeklyData, setWeeklyData] = useState(null)
  const [lifeExpenses, setLifeExpenses] = useState([])
  const [newExpense, setNewExpense] = useState({ amount: '', description: '', category: 'unexpected' })
  const [nextWeekFocus, setNextWeekFocus] = useState('')
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [celebrationShown, setCelebrationShown] = useState(false)

  // Get week boundaries
  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 }) // Monday start
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // Generate weekly data
  useEffect(() => {
    const generateWeeklyData = () => {
      const dreams = loadDreams()
      const primaryDream = currentDream || dreams[0] || {
        title: "Cottage by the Lake",
        target_amount: 85000,
        progress: 34,
        target_date: "2026-06-15"
      }

      // Generate realistic weekly progress data
      const dailyTarget = 45 // Target daily savings
      const weeklyTarget = dailyTarget * 7
      
      const dailyProgress = weekDays.map(day => {
        const dayOfWeek = day.getDay()
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
        
        // Realistic saving patterns
        let savedAmount = 0
        const baseChance = isWeekend ? 0.7 : 0.85
        
        if (Math.random() < baseChance) {
          savedAmount = dailyTarget * (0.8 + Math.random() * 0.4) // 80-120% of target
          
          // Occasional bonus or miss days
          const special = Math.random()
          if (special < 0.05) savedAmount = 0 // 5% chance of missing
          else if (special > 0.9) savedAmount *= 1.8 // 10% chance of bonus
        }
        
        return {
          date: day,
          saved: Math.round(savedAmount * 100) / 100,
          target: dailyTarget,
          achieved: savedAmount >= dailyTarget * 0.8, // 80% counts as achieved
          note: generateDayNote(savedAmount, dailyTarget, dayOfWeek)
        }
      })

      const totalSaved = dailyProgress.reduce((sum, day) => sum + day.saved, 0)
      const daysAchieved = dailyProgress.filter(day => day.achieved).length
      const perfectDays = dailyProgress.filter(day => day.saved >= day.target).length
      
      // Calculate timeline impact
      const weeklyShortfall = Math.max(0, weeklyTarget - totalSaved)
      const daysImpact = weeklyShortfall / dailyTarget
      
      setWeeklyData({
        dream: primaryDream,
        dailyProgress,
        totalSaved,
        weeklyTarget,
        daysAchieved,
        perfectDays,
        averageDaily: totalSaved / 7,
        timelineImpact: daysImpact,
        progressPercentage: (totalSaved / weeklyTarget) * 100
      })
    }

    generateWeeklyData()
  }, [selectedWeek, currentDream])

  // Detect wins automatically
  const weeklyWins = useMemo(() => {
    if (!weeklyData) return []
    
    const wins = []
    
    // Savings achievements
    if (weeklyData.progressPercentage >= 100) {
      wins.push({
        type: 'achievement',
        icon: Trophy,
        title: 'Weekly Target Crushed!',
        description: `You saved $${weeklyData.totalSaved.toFixed(0)} this week - that's ${(weeklyData.progressPercentage - 100).toFixed(0)}% above your target!`,
        color: 'gold'
      })
    } else if (weeklyData.progressPercentage >= 80) {
      wins.push({
        type: 'achievement',
        icon: Target,
        title: 'Strong Week!',
        description: `${weeklyData.progressPercentage.toFixed(0)}% of your weekly target achieved - you're building great momentum!`,
        color: 'green'
      })
    }
    
    // Consistency wins
    if (weeklyData.perfectDays >= 5) {
      wins.push({
        type: 'consistency',
        icon: Star,
        title: 'Consistency Champion',
        description: `${weeklyData.perfectDays} perfect saving days this week - your cottage is getting closer!`,
        color: 'purple'
      })
    } else if (weeklyData.daysAchieved >= 5) {
      wins.push({
        type: 'consistency',
        icon: CheckCircle,
        title: 'Steady Progress',
        description: `${weeklyData.daysAchieved} days of solid progress - consistency beats perfection!`,
        color: 'blue'
      })
    }
    
    // Milestone proximity
    const dreamProgress = weeklyData.dream.progress || 0
    if (dreamProgress >= 25 && dreamProgress < 30) {
      wins.push({
        type: 'milestone',
        icon: MapPin,
        title: 'Quarter Milestone Approaching',
        description: `You're ${dreamProgress}% toward your cottage - the 25% milestone is within reach!`,
        color: 'orange'
      })
    }
    
    // Add at least one encouraging win if none detected
    if (wins.length === 0) {
      wins.push({
        type: 'progress',
        icon: Heart,
        title: 'Every Step Counts',
        description: `$${weeklyData.totalSaved.toFixed(0)} saved this week brings your cottage dream closer to reality!`,
        color: 'pink'
      })
    }
    
    return wins
  }, [weeklyData])

  // Generate day note
  const generateDayNote = (saved, target, dayOfWeek) => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    if (saved === 0) return "Rest day - tomorrow's a new opportunity"
    if (saved >= target * 1.5) return "Bonus day! Extra cottage fund boost 🎉"
    if (saved >= target) return "Perfect day - cottage vibes strong!"
    if (saved >= target * 0.8) return "Solid progress toward the lake"
    return "Small steps still count"
  }

  // Handle expense addition
  const handleAddExpense = () => {
    if (newExpense.amount && newExpense.description) {
      const expense = {
        id: Date.now(),
        amount: parseFloat(newExpense.amount),
        description: newExpense.description,
        category: newExpense.category,
        date: new Date().toISOString(),
        week: format(selectedWeek, 'yyyy-MM-dd')
      }
      
      setLifeExpenses([...lifeExpenses, expense])
      setNewExpense({ amount: '', description: '', category: 'unexpected' })
      setShowAddExpense(false)
    }
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

  // Get progress visualization
  const getProgressVisualization = () => {
    if (!weeklyData) return null
    
    const { dailyProgress, weeklyTarget, totalSaved } = weeklyData
    const maxDaily = Math.max(...dailyProgress.map(d => d.saved), weeklyTarget / 7)
    
    return (
      <div className="space-y-4">
        {/* Weekly overview */}
        <div className="text-center mb-6">
          <div className="relative inline-block">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center mx-auto mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {weeklyData.progressPercentage.toFixed(0)}%
                </div>
                <div className="text-xs text-gray-600">of target</div>
              </div>
            </div>
            <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2">
              <Home className="w-4 h-4 text-yellow-800" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {formatCurrency(totalSaved)} saved this week
          </h3>
          <p className="text-gray-600">
            Target: {formatCurrency(weeklyTarget)} • {weeklyData.daysAchieved}/7 days achieved
          </p>
        </div>

        {/* Daily progress bars */}
        <div className="space-y-3">
          {dailyProgress.map((day, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-12 text-xs text-gray-500 text-right">
                {format(day.date, 'EEE')}
              </div>
              <div className="flex-1 relative">
                <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      day.achieved ? 'bg-gradient-to-r from-green-400 to-green-500' : 
                      day.saved > 0 ? 'bg-gradient-to-r from-blue-400 to-blue-500' : 'bg-gray-200'
                    }`}
                    style={{ width: `${Math.min((day.saved / maxDaily) * 100, 100)}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-between px-3">
                    <span className="text-xs font-medium text-white">
                      {day.saved > 0 ? formatCurrency(day.saved) : ''}
                    </span>
                    {day.achieved && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                </div>
              </div>
              <div className="w-4">
                {day.saved >= day.target * 1.5 && (
                  <Star className="w-4 h-4 text-yellow-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!weeklyData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Preparing your weekly review...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-green-500 p-4 rounded-full shadow-lg">
              <Calendar className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Weekly Review
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Week of {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </p>
          <div className="mt-4 inline-flex items-center bg-white rounded-full px-4 py-2 shadow-sm">
            <Home className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">
              {weeklyData.dream.title}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* This Week's Wins */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
              <div className="flex items-center mb-6">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">This Week's Wins</h2>
                  <p className="text-gray-600 text-sm">Celebrating your progress</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {weeklyWins.map((win, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                    <div className={`p-2 rounded-full ${
                      win.color === 'gold' ? 'bg-yellow-100' :
                      win.color === 'green' ? 'bg-green-100' :
                      win.color === 'purple' ? 'bg-purple-100' :
                      win.color === 'blue' ? 'bg-blue-100' :
                      win.color === 'orange' ? 'bg-orange-100' :
                      'bg-pink-100'
                    }`}>
                      <win.icon className={`w-5 h-5 ${
                        win.color === 'gold' ? 'text-yellow-600' :
                        win.color === 'green' ? 'text-green-600' :
                        win.color === 'purple' ? 'text-purple-600' :
                        win.color === 'blue' ? 'text-blue-600' :
                        win.color === 'orange' ? 'text-orange-600' :
                        'text-pink-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{win.title}</h3>
                      <p className="text-gray-600 text-sm">{win.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Life Happened */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
              <div className="flex items-center mb-6">
                <div className="bg-orange-100 p-3 rounded-full mr-4">
                  <Heart className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Life Happened</h2>
                  <p className="text-gray-600 text-sm">No shame, just reality</p>
                </div>
              </div>

              {lifeExpenses.length === 0 ? (
                <div className="text-center py-8">
                  <Coffee className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">
                    No unexpected expenses this week? That's amazing!
                  </p>
                  <button
                    onClick={() => setShowAddExpense(true)}
                    className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                  >
                    Add an expense if needed
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {lifeExpenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{expense.description}</div>
                        <div className="text-sm text-gray-600 capitalize">{expense.category}</div>
                      </div>
                      <div className="text-orange-600 font-semibold">
                        {formatCurrency(expense.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showAddExpense && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-3">
                    <input
                      type="number"
                      placeholder="Amount"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="What happened? (e.g., Car repair, Medical bill)"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <select
                      value={newExpense.category}
                      onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="unexpected">Unexpected</option>
                      <option value="medical">Medical</option>
                      <option value="car">Car/Transport</option>
                      <option value="home">Home/Repair</option>
                      <option value="family">Family</option>
                      <option value="other">Other</option>
                    </select>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleAddExpense}
                        className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        Add Expense
                      </button>
                      <button
                        onClick={() => setShowAddExpense(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {!showAddExpense && (
                <button
                  onClick={() => setShowAddExpense(true)}
                  className="w-full mt-4 py-2 border-2 border-dashed border-orange-300 rounded-lg text-orange-600 hover:border-orange-400 hover:text-orange-700 transition-colors"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add Life Expense
                </button>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Progress Visualization */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Your Week in Color</h2>
                  <p className="text-gray-600 text-sm">Beautiful progress, not just numbers</p>
                </div>
              </div>
              
              {getProgressVisualization()}
            </div>

            {/* Cottage Countdown */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
              <div className="flex items-center mb-6">
                <div className="bg-purple-100 p-3 rounded-full mr-4">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Cottage Countdown</h2>
                  <p className="text-gray-600 text-sm">Timeline impact from this week</p>
                </div>
              </div>

              <div className="text-center">
                {weeklyData.timelineImpact <= 0 ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="bg-green-100 p-4 rounded-full">
                        <ArrowUp className="w-8 h-8 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        On Track!
                      </div>
                      <p className="text-gray-600">
                        Your cottage timeline is secure. You're {weeklyData.progressPercentage.toFixed(0)}% of your weekly target - keep this momentum!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="bg-orange-100 p-4 rounded-full">
                        <ArrowDown className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600 mb-2">
                        +{weeklyData.timelineImpact.toFixed(1)} days
                      </div>
                      <p className="text-gray-600 mb-4">
                        This week's shortfall adds {weeklyData.timelineImpact.toFixed(1)} days to your cottage timeline. But here's the thing - you can make this up!
                      </p>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="text-sm text-orange-800">
                          💡 <strong>Coach's note:</strong> Every week is a fresh start. Next week's focus can get you back on track!
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Next Week's Focus */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-indigo-100">
              <div className="flex items-center mb-6">
                <div className="bg-indigo-100 p-3 rounded-full mr-4">
                  <Lightbulb className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Next Week's Focus</h2>
                  <p className="text-gray-600 text-sm">One specific action to improve</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Suggested actions based on this week's performance */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800">Suggested Focus Areas:</h3>
                  
                  {weeklyData.progressPercentage < 80 && (
                    <div className="p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                         onClick={() => setNextWeekFocus("Save $10 extra per day by skipping one small purchase")}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-blue-900">Boost Daily Savings</div>
                          <div className="text-sm text-blue-700">Save $10 extra per day by skipping one small purchase</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                  )}

                  {weeklyData.daysAchieved < 5 && (
                    <div className="p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                         onClick={() => setNextWeekFocus("Hit my daily target 5 out of 7 days")}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-green-900">Improve Consistency</div>
                          <div className="text-sm text-green-700">Hit my daily target 5 out of 7 days</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                  )}

                  <div className="p-3 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors"
                       onClick={() => setNextWeekFocus("Find one new way to save $25 this week")}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-purple-900">Discover New Savings</div>
                        <div className="text-sm text-purple-700">Find one new way to save $25 this week</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-purple-600" />
                    </div>
                  </div>
                </div>

                {/* Custom focus input */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or set your own focus:
                  </label>
                  <textarea
                    value={nextWeekFocus}
                    onChange={(e) => setNextWeekFocus(e.target.value)}
                    placeholder="What's one specific thing you want to focus on next week?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Motivational Footer */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl p-8 text-white">
            <div className="flex justify-center mb-4">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-4">Your Coach's Message</h3>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              {weeklyData.progressPercentage >= 100 
                ? `Incredible week! You're not just saving money - you're building the discipline that will make your cottage dream inevitable. Keep this energy flowing into next week!`
                : weeklyData.progressPercentage >= 80
                ? `Strong week! Your cottage is getting closer with every smart choice you make. ${weeklyData.daysAchieved} days of progress shows you've got the consistency to make this happen.`
                : `Every expert was once a beginner, and every cottage owner started with week one. You saved $${weeklyData.totalSaved.toFixed(0)} this week - that's $${weeklyData.totalSaved.toFixed(0)} more than if you hadn't started at all. Progress, not perfection!`
              }
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Close Review
          </button>
          <button
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 transition-colors"
          >
            Start Next Week Strong
          </button>
        </div>
      </div>
    </div>
  )
}
