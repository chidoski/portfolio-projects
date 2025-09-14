import React from 'react'
import { format } from 'date-fns'
import { 
  Coffee, 
  Calendar, 
  Lightbulb, 
  TrendingUp, 
  Target, 
  Clock,
  DollarSign,
  Zap,
  Heart,
  Star
} from 'lucide-react'

/**
 * InsightCard Component
 * Displays different types of insights about a dream
 * 
 * Props:
 * - type: 'comparison', 'milestone', or 'tip'
 * - data: Relevant data based on the type
 * - className: Additional CSS classes (optional)
 */
const InsightCard = ({ type, data, className = '' }) => {
  const baseClasses = "bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300"
  
  // Generate contextual tips based on dream data
  const generateTips = (dreamAmount, dailyAmount, daysRemaining) => {
    const tips = []
    
    // Amount-based tips
    if (dreamAmount >= 50000) {
      tips.push({
        icon: Target,
        title: "Big Dream Strategy",
        message: "Break this large goal into smaller monthly targets to stay motivated and track progress effectively.",
        color: "purple"
      })
    } else if (dreamAmount >= 10000) {
      tips.push({
        icon: TrendingUp,
        title: "Steady Growth",
        message: "Consider automating your savings to remove the temptation to spend this money elsewhere.",
        color: "blue"
      })
    } else {
      tips.push({
        icon: Zap,
        title: "Quick Win",
        message: "This achievable goal is perfect for building your savings habit. You've got this!",
        color: "green"
      })
    }
    
    // Daily amount-based tips
    if (dailyAmount >= 50) {
      tips.push({
        icon: DollarSign,
        title: "High Savings Rate",
        message: "Look for ways to increase income or reduce major expenses to make this more sustainable.",
        color: "orange"
      })
    } else if (dailyAmount >= 20) {
      tips.push({
        icon: Coffee,
        title: "Moderate Challenge",
        message: "Try the 'pay yourself first' method - save this amount as soon as you get paid.",
        color: "blue"
      })
    } else {
      tips.push({
        icon: Heart,
        title: "Gentle Start",
        message: "Small amounts add up! Consider rounding up purchases and saving the change.",
        color: "pink"
      })
    }
    
    // Timeline-based tips
    if (daysRemaining <= 365) {
      tips.push({
        icon: Clock,
        title: "Short Timeline",
        message: "With less than a year to go, consider a high-yield savings account to maximize your money.",
        color: "red"
      })
    } else if (daysRemaining <= 1095) { // 3 years
      tips.push({
        icon: Star,
        title: "Medium Term",
        message: "Perfect timeframe for a mix of savings accounts and conservative investments.",
        color: "indigo"
      })
    } else {
      tips.push({
        icon: Lightbulb,
        title: "Long Term Vision",
        message: "With time on your side, consider investment options that can grow your money faster.",
        color: "green"
      })
    }
    
    return tips
  }

  // Render comparison type (life equivalents)
  if (type === 'comparison') {
    const { equivalent } = data
    
    return (
      <div className={`${baseClasses} ${className} bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100`}>
        <div className="flex items-start">
          <div className="bg-blue-500 p-2 rounded-lg mr-4 flex-shrink-0">
            <Coffee className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">Daily Equivalent</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              {equivalent.description}
            </p>
            {equivalent.type && (
              <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                {equivalent.type}
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Render milestone type
  if (type === 'milestone') {
    const { milestone } = data
    
    return (
      <div className={`${baseClasses} ${className} bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100`}>
        <div className="flex items-start">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg mr-4 flex-shrink-0">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">
              {milestone.percentage}% Milestone
            </h3>
            <div className="space-y-1">
              <p className="text-lg font-bold text-purple-600">
                ${milestone.amount}
              </p>
              <p className="text-sm text-gray-600">
                Expected: {format(new Date(milestone.expectedDate), 'MMM dd, yyyy')}
              </p>
              <p className="text-xs text-purple-600 font-medium mt-2">
                {milestone.celebrationMessage.split('!')[0]}! 🎉
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render tip type
  if (type === 'tip') {
    const { dreamAmount, dailyAmount, daysRemaining, tipIndex = 0 } = data
    const tips = generateTips(dreamAmount, dailyAmount, daysRemaining)
    const tip = tips[tipIndex % tips.length]
    const Icon = tip.icon
    
    const colorClasses = {
      blue: 'from-blue-50 to-blue-100 border-blue-200',
      green: 'from-green-50 to-green-100 border-green-200',
      purple: 'from-purple-50 to-purple-100 border-purple-200',
      orange: 'from-orange-50 to-orange-100 border-orange-200',
      red: 'from-red-50 to-red-100 border-red-200',
      pink: 'from-pink-50 to-pink-100 border-pink-200',
      indigo: 'from-indigo-50 to-indigo-100 border-indigo-200'
    }
    
    const iconColorClasses = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500',
      pink: 'bg-pink-500',
      indigo: 'bg-indigo-500'
    }
    
    return (
      <div className={`${baseClasses} ${className} bg-gradient-to-br ${colorClasses[tip.color]}`}>
        <div className="flex items-start">
          <div className={`${iconColorClasses[tip.color]} p-2 rounded-lg mr-4 flex-shrink-0`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">{tip.title}</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              {tip.message}
            </p>
            <div className="mt-3">
              <span className={`inline-block px-2 py-1 bg-white bg-opacity-60 text-${tip.color}-700 text-xs rounded-full font-medium`}>
                💡 Pro Tip
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Fallback for unknown type
  return (
    <div className={`${baseClasses} ${className} bg-gray-50 border-gray-200`}>
      <div className="text-center text-gray-500">
        <Lightbulb className="w-8 h-8 mx-auto mb-2" />
        <p className="text-sm">Unknown insight type: {type}</p>
      </div>
    </div>
  )
}

export default InsightCard
