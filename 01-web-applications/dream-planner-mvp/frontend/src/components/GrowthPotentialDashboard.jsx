import React, { useState, useEffect } from 'react'
import { TrendingUp, Zap, Clock, Target, DollarSign, Sparkles } from 'lucide-react'

/**
 * GrowthPotentialDashboard Component
 * Specialized dashboard for users with 20+ years to retirement
 * Emphasizes compound growth potential and motivational messaging
 */
const GrowthPotentialDashboard = ({ 
  currentAge = 25,
  retirementAge = 65,
  monthlyContribution = 500,
  currentSavings = 5000,
  dreams = []
}) => {
  const [animationStarted, setAnimationStarted] = useState(false)
  const [selectedScenario, setSelectedScenario] = useState('moderate')
  
  const yearsToRetirement = retirementAge - currentAge
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimationStarted(true), 500)
    return () => clearTimeout(timer)
  }, [])
  
  // Growth scenarios with different return rates
  const scenarios = {
    conservative: { rate: 0.05, label: 'Conservative (5%)', color: 'blue' },
    moderate: { rate: 0.07, label: 'Moderate (7%)', color: 'green' },
    aggressive: { rate: 0.09, label: 'Aggressive (9%)', color: 'purple' }
  }
  
  // Calculate compound growth for different scenarios
  const calculateGrowth = (rate) => {
    const annualContribution = monthlyContribution * 12
    const futureValue = currentSavings * Math.pow(1 + rate, yearsToRetirement) + 
      annualContribution * ((Math.pow(1 + rate, yearsToRetirement) - 1) / rate)
    return futureValue
  }
  
  // Format currency
  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }
  
  // Calculate milestone years
  const getMilestones = () => {
    const milestones = []
    const rate = scenarios[selectedScenario].rate
    const annualContribution = monthlyContribution * 12
    
    // Calculate when they'll hit major milestones
    const targets = [100000, 250000, 500000, 1000000, 2000000]
    
    targets.forEach(target => {
      // Solve for years to reach target (simplified calculation)
      let years = 0
      let value = currentSavings
      
      while (value < target && years <= yearsToRetirement) {
        value = value * (1 + rate) + annualContribution
        years++
      }
      
      if (years <= yearsToRetirement) {
        milestones.push({
          amount: target,
          years,
          age: currentAge + years
        })
      }
    })
    
    return milestones
  }
  
  const milestones = getMilestones()
  const finalAmount = calculateGrowth(scenarios[selectedScenario].rate)
  
  return (
    <div className="space-y-6">
      {/* Hero Section with Compound Growth Visualization */}
      <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 rounded-2xl p-8 border border-green-100">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Wealth-Building Superpower</h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            With {yearsToRetirement} years ahead, you have the ultimate advantage: TIME. 
            Watch small contributions become life-changing wealth.
          </p>
        </div>
        
        {/* Scenario Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md">
            {Object.entries(scenarios).map(([key, scenario]) => (
              <button
                key={key}
                onClick={() => setSelectedScenario(key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedScenario === key
                    ? `bg-${scenario.color}-500 text-white`
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {scenario.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Big Number Display */}
        <div className="text-center mb-8">
          <div className="text-6xl font-bold text-gray-900 mb-2">
            {formatCurrency(finalAmount)}
          </div>
          <p className="text-lg text-gray-600">
            at retirement with {formatCurrency(monthlyContribution)}/month
          </p>
          <div className="mt-4 bg-white rounded-lg p-4 shadow-sm inline-block">
            <div className="text-sm text-gray-600">That's</div>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(finalAmount / (monthlyContribution * 12 * yearsToRetirement))}x
            </div>
            <div className="text-sm text-gray-600">your total contributions!</div>
          </div>
        </div>
      </div>
      
      {/* Milestone Timeline */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Your Wealth Milestones</h3>
        
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className={`w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4`}>
                  {index + 1}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(milestone.amount)} Milestone
                  </div>
                  <div className="text-sm text-gray-600">
                    Age {milestone.age} • {milestone.years} years from now
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  {2030 + milestone.years}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Power of Starting Early */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Start Now</h4>
            <div className="text-2xl font-bold text-green-600 mb-1">
              {formatCurrency(calculateGrowth(0.07))}
            </div>
            <div className="text-sm text-gray-600">by retirement</div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="bg-yellow-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Wait 5 Years</h4>
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {formatCurrency(calculateGrowth(0.07) * 0.7)} {/* Simplified calculation */}
            </div>
            <div className="text-sm text-gray-600">by retirement</div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="bg-red-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-red-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Wait 10 Years</h4>
            <div className="text-2xl font-bold text-red-600 mb-1">
              {formatCurrency(calculateGrowth(0.07) * 0.5)} {/* Simplified calculation */}
            </div>
            <div className="text-sm text-gray-600">by retirement</div>
          </div>
        </div>
      </div>
      
      {/* Dreams Integration */}
      {dreams.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Dreams + Retirement = Double Win</h3>
          <p className="text-gray-600 mb-6">
            The beautiful part? You can pursue your dreams AND build massive retirement wealth. Here's how:
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Your Dreams Timeline</h4>
              <div className="space-y-3">
                {dreams.slice(0, 3).map((dream, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{dream.title}</div>
                      <div className="text-sm text-gray-600">
                        {formatCurrency(dream.target_amount)}
                      </div>
                    </div>
                    <div className="text-sm text-blue-600 font-medium">
                      {new Date(dream.target_date).getFullYear()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">The Strategy</h4>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>Build your Foundation first - this creates the safety net for dream-chasing</div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>Save for dreams in parallel - achieving them early adds to life satisfaction</div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>Every dollar not spent on dreams compounds for retirement</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Motivational Call to Action */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl p-8 text-white text-center">
        <h3 className="text-2xl font-bold mb-4">The Time Is NOW</h3>
        <p className="text-lg mb-6 max-w-2xl mx-auto">
          Every month you wait costs you thousands in retirement wealth. 
          Your future self is counting on the decision you make today.
        </p>
        <div className="flex justify-center space-x-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="text-2xl font-bold">{yearsToRetirement}</div>
            <div className="text-sm">years of compound growth</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="text-2xl font-bold">{Math.round(yearsToRetirement * 12)}</div>
            <div className="text-sm">opportunities to invest</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="text-2xl font-bold">1</div>
            <div className="text-sm">chance to get it right</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GrowthPotentialDashboard
