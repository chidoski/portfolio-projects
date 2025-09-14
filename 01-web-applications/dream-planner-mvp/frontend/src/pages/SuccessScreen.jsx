import React from 'react'
import { format } from 'date-fns'
import { Sparkles, Target, Calendar, TrendingUp, ArrowRight } from 'lucide-react'
// @ts-ignore - dreamCalculations.js doesn't have TypeScript declarations
import { convertToLifeEquivalents, calculateMilestones } from '../services/dreamCalculations'
import InsightCard from '../components/InsightCard'

/**
 * SuccessScreen Component
 * Displays after dream creation to show success and key information
 * Props:
 * - dream: The created dream object
 * - selectedStrategy: The chosen savings strategy ('aggressive', 'balanced', 'relaxed')
 * - savingsCalculations: The calculated savings strategies
 * - onViewDashboard: Function to navigate to dashboard
 * - onCreateAnother: Function to create another dream
 */
const SuccessScreen = ({ 
  dream, 
  selectedStrategy, 
  savingsCalculations, 
  onViewDashboard, 
  onCreateAnother 
}) => {
  // Get the selected strategy data
  const strategy = savingsCalculations[selectedStrategy]
  
  // Calculate life equivalents for the daily amount
  const lifeEquivalents = convertToLifeEquivalents(strategy.dailyAmount)
  
  // Calculate milestones for the dream
  const milestonesData = calculateMilestones(
    dream.target_amount, 
    new Date(), 
    dream.target_date
  )
  
  // Get first three milestones
  const firstThreeMilestones = milestonesData.milestones.slice(0, 3)
  
  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Format daily amount with 2 decimal places
  const formatDailyAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  // Get strategy color based on intensity
  const getStrategyColor = (strategyName) => {
    const colors = {
      aggressive: 'red',
      balanced: 'blue', 
      relaxed: 'green'
    }
    return colors[strategyName] || 'blue'
  }

  const strategyColor = getStrategyColor(selectedStrategy)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12">
          {/* Success Icon */}
          <div className="bg-gradient-to-r from-green-400 to-blue-500 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8 animate-pulse">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          
          {/* Success Message */}
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🎉 Dream Created Successfully! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Your journey to achieving your dream starts now!
          </p>
          <p className="text-lg text-gray-500">
            Here's everything you need to know about your savings plan
          </p>
        </div>

        {/* Dream Title and Strategy Display */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{dream.title}</h2>
            <div className="flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-gray-500 mr-2" />
              <span className="text-lg text-gray-600">
                Target: {formatCurrency(dream.target_amount)} by {format(new Date(dream.target_date), 'MMMM dd, yyyy')}
              </span>
            </div>
          </div>

          {/* Strategy Badge */}
          <div className="text-center mb-6">
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium bg-${strategyColor}-100 text-${strategyColor}-700`}>
              {strategy.name} Strategy - {strategy.description}
            </span>
          </div>

          {/* Daily Amount Highlight */}
          <div className={`bg-gradient-to-r from-${strategyColor}-500 to-${strategyColor}-600 text-white p-8 rounded-xl text-center mb-6`}>
            <p className="text-lg mb-2">Your daily savings goal:</p>
            <div className="text-6xl font-bold mb-2">
              {formatDailyAmount(strategy.dailyAmount)}
            </div>
            <p className="text-lg opacity-90">per day</p>
            <div className="grid grid-cols-2 gap-6 mt-6 pt-6 border-t border-white/20">
              <div>
                <p className="text-sm opacity-80 mb-1">Weekly</p>
                <p className="text-2xl font-bold">{formatCurrency(strategy.weeklyAmount)}</p>
              </div>
              <div>
                <p className="text-sm opacity-80 mb-1">Monthly</p>
                <p className="text-2xl font-bold">{formatCurrency(strategy.monthlyAmount)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Insights Grid */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Your Dream Insights
          </h3>
          <p className="text-lg text-gray-600 text-center mb-8">
            Everything you need to know about achieving your goal
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Life Equivalents Cards */}
            {lifeEquivalents.slice(0, 3).map((equivalent, index) => (
              <InsightCard
                key={`comparison-${index}`}
                type="comparison"
                data={{ equivalent }}
              />
            ))}
            
            {/* Milestone Cards */}
            {firstThreeMilestones.map((milestone, index) => (
              <InsightCard
                key={`milestone-${index}`}
                type="milestone"
                data={{ milestone }}
              />
            ))}
            
            {/* Tip Cards */}
            {[0, 1, 2].map((tipIndex) => (
              <InsightCard
                key={`tip-${tipIndex}`}
                type="tip"
                data={{
                  dreamAmount: dream.target_amount,
                  dailyAmount: strategy.dailyAmount,
                  daysRemaining: Math.ceil((new Date(dream.target_date) - new Date()) / (1000 * 60 * 60 * 24)),
                  tipIndex
                }}
              />
            ))}
          </div>
          
          {/* Additional Info */}
          <div className="text-center mt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-medium text-blue-700">
                  {lifeEquivalents.length} ways to think about your daily savings
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="font-medium text-purple-700">
                  {milestonesData.milestones.length} milestones to celebrate
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="font-medium text-green-700">
                  Personalized tips based on your goal
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onViewDashboard}
            className="btn-primary px-8 py-4 text-lg flex items-center justify-center"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            View Dashboard
          </button>
          
          <button
            onClick={onCreateAnother}
            className="btn-secondary px-8 py-4 text-lg flex items-center justify-center"
          >
            <ArrowRight className="w-5 h-5 mr-2" />
            Create Another Dream
          </button>
        </div>

        {/* Motivational Footer */}
        <div className="text-center mt-12 pb-8">
          <p className="text-lg text-gray-600 italic">
            "Every great dream begins with a dreamer. You have the strength, patience, and passion to make your dreams reality."
          </p>
          <p className="text-gray-500 mt-2">- Harriet Tubman</p>
        </div>
      </div>
    </div>
  )
}

export default SuccessScreen
