import React, { useState, useEffect } from 'react'
import { TrendingUp, Target, Zap, DollarSign, Clock, BarChart3, ArrowUp } from 'lucide-react'

/**
 * OptimizationDashboard Component
 * Specialized dashboard for users with 10-20 years to retirement
 * Focuses on optimization opportunities and acceleration strategies
 */
const OptimizationDashboard = ({ 
  currentAge = 45,
  retirementAge = 65,
  currentSavings = 250000,
  monthlyContribution = 1500,
  desiredRetirementIncome = 100000,
  dreams = []
}) => {
  const [animationStarted, setAnimationStarted] = useState(false)
  const [selectedOptimization, setSelectedOptimization] = useState(null)
  
  const yearsToRetirement = retirementAge - currentAge
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimationStarted(true), 500)
    return () => clearTimeout(timer)
  }, [])
  
  // Calculate current trajectory
  const calculateProjection = (savings, monthly, years, rate = 0.07) => {
    const annual = monthly * 12
    return savings * Math.pow(1 + rate, years) + annual * ((Math.pow(1 + rate, years) - 1) / rate)
  }
  
  const currentProjection = calculateProjection(currentSavings, monthlyContribution, yearsToRetirement)
  const targetNeeded = desiredRetirementIncome / 0.04 // 4% rule
  const gap = Math.max(0, targetNeeded - currentProjection)
  
  // Optimization opportunities
  const optimizations = [
    {
      id: 'increase-contributions',
      title: 'Increase Monthly Contributions',
      description: 'Boost your monthly savings by $500',
      currentValue: monthlyContribution,
      optimizedValue: monthlyContribution + 500,
      impact: calculateProjection(currentSavings, monthlyContribution + 500, yearsToRetirement) - currentProjection,
      effort: 'Medium',
      timeframe: 'Immediate',
      icon: DollarSign,
      color: 'green'
    },
    {
      id: 'catch-up-contributions',
      title: 'Maximize Catch-up Contributions',
      description: 'Use age 50+ catch-up limits if eligible',
      currentValue: monthlyContribution,
      optimizedValue: currentAge >= 50 ? monthlyContribution + 1000 : monthlyContribution + 500,
      impact: currentAge >= 50 ? 
        calculateProjection(currentSavings, monthlyContribution + 1000, yearsToRetirement) - currentProjection :
        calculateProjection(currentSavings, monthlyContribution + 500, yearsToRetirement) - currentProjection,
      effort: 'Low',
      timeframe: 'This year',
      icon: Target,
      color: 'blue'
    },
    {
      id: 'investment-optimization',
      title: 'Optimize Investment Mix',
      description: 'Shift to age-appropriate 70/30 stocks/bonds',
      currentValue: '60/40 mix (estimated)',
      optimizedValue: '70/30 mix',
      impact: calculateProjection(currentSavings, monthlyContribution, yearsToRetirement, 0.08) - currentProjection,
      effort: 'Low',
      timeframe: '1-2 hours',
      icon: BarChart3,
      color: 'purple'
    },
    {
      id: 'debt-elimination',
      title: 'Accelerate Debt Payoff',
      description: 'Eliminate high-interest debt, redirect to savings',
      currentValue: 'Estimated $300/month interest',
      optimizedValue: '$300/month → investments',
      impact: calculateProjection(0, 300, yearsToRetirement),
      effort: 'High',
      timeframe: '2-5 years',
      icon: TrendingUp,
      color: 'orange'
    }
  ]
  
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
  
  // Calculate efficiency score
  const efficiencyScore = Math.min(100, Math.round((currentProjection / targetNeeded) * 100))
  
  return (
    <div className="space-y-6">
      {/* Current Status Overview */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Optimization Opportunities</h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            You're in the strategic optimization phase. Every efficiency gain accelerates your path to retirement.
          </p>
        </div>
        
        {/* Progress Metrics */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 text-center shadow-sm">
            <div className="text-3xl font-bold text-gray-900 mb-2">{efficiencyScore}%</div>
            <div className="text-sm text-gray-600">Current Efficiency</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-2000 ease-out"
                style={{ width: animationStarted ? `${efficiencyScore}%` : '0%' }}
              ></div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 text-center shadow-sm">
            <div className="text-3xl font-bold text-gray-900 mb-2">{yearsToRetirement}</div>
            <div className="text-sm text-gray-600">Years to Optimize</div>
            <div className="text-xs text-orange-600 mt-2">Sweet spot for acceleration</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 text-center shadow-sm">
            <div className="text-3xl font-bold text-gray-900 mb-2">{formatCurrency(gap)}</div>
            <div className="text-sm text-gray-600">Gap to Close</div>
            <div className="text-xs text-green-600 mt-2">Achievable with optimization</div>
          </div>
        </div>
        
        {/* Current vs Target */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Retirement Income Projection</h3>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-gray-600">Current Trajectory</div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(currentProjection * 0.04)}</div>
              <div className="text-xs text-gray-500">annual income at retirement</div>
            </div>
            <ArrowUp className="w-8 h-8 text-blue-500" />
            <div>
              <div className="text-sm text-gray-600">Income Goal</div>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(desiredRetirementIncome)}</div>
              <div className="text-xs text-gray-500">target annual income</div>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-400 to-green-500 h-3 rounded-full transition-all duration-2000 ease-out"
              style={{ width: animationStarted ? `${Math.min(100, (currentProjection * 0.04 / desiredRetirementIncome) * 100)}%` : '0%' }}
            ></div>
          </div>
          <div className="text-center mt-2 text-sm text-gray-600">
            {((currentProjection * 0.04 / desiredRetirementIncome) * 100).toFixed(1)}% of goal achieved
          </div>
        </div>
      </div>
      
      {/* Optimization Opportunities */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Strategic Optimization Moves</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {optimizations.map((opt) => {
            const Icon = opt.icon
            return (
              <div 
                key={opt.id}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  selectedOptimization === opt.id 
                    ? `border-${opt.color}-300 bg-${opt.color}-50` 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedOptimization(selectedOptimization === opt.id ? null : opt.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-full bg-${opt.color}-100`}>
                    <Icon className={`w-6 h-6 text-${opt.color}-600`} />
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold text-${opt.color}-600`}>
                      +{formatCurrency(opt.impact)}
                    </div>
                    <div className="text-xs text-gray-500">potential gain</div>
                  </div>
                </div>
                
                <h4 className="font-semibold text-gray-900 mb-2">{opt.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{opt.description}</p>
                
                <div className="flex justify-between items-center text-xs">
                  <span className={`px-2 py-1 bg-${opt.color}-100 text-${opt.color}-700 rounded-full`}>
                    {opt.effort} effort
                  </span>
                  <span className="text-gray-500">{opt.timeframe}</span>
                </div>
                
                {selectedOptimization === opt.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm space-y-2">
                      <div>
                        <span className="font-medium">Current:</span> {opt.currentValue}
                      </div>
                      <div>
                        <span className="font-medium">Optimized:</span> {opt.optimizedValue}
                      </div>
                      <div className={`text-${opt.color}-600 font-medium`}>
                        Impact: {formatCurrency(opt.impact)} more at retirement
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Combined Impact Analysis */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Combined Optimization Impact</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">If You Implement All Optimizations:</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Current trajectory:</span>
                <span className="font-semibold">{formatCurrency(currentProjection)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Optimized projection:</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(currentProjection + optimizations.reduce((sum, opt) => sum + opt.impact, 0))}
                </span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="text-gray-900 font-semibold">Additional wealth:</span>
                <span className="text-green-600 font-bold text-lg">
                  +{formatCurrency(optimizations.reduce((sum, opt) => sum + opt.impact, 0))}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Acceleration Benefits:</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span>Retire {Math.round(gap / (currentSavings * 0.07) * 12)} months earlier</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span>Higher lifestyle confidence in retirement</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                <span>Better equipped for market volatility</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                <span>Potential for early retirement if desired</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dreams Integration */}
      {dreams.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Dreams vs. Retirement Optimization</h3>
          <p className="text-gray-600 mb-4">
            Balance pursuing your dreams with retirement optimization:
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">High-Impact Dreams</h4>
              {dreams.slice(0, 2).map((dream, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg mb-3">
                  <div className="font-medium text-gray-900">{dream.title}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {formatCurrency(dream.target_amount)} • Impact: -{((dream.target_amount / currentProjection) * 100).toFixed(1)}% retirement wealth
                  </div>
                </div>
              ))}
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Optimization Strategy</h4>
              <div className="text-sm text-gray-600 space-y-2">
                <p>• Prioritize low-effort, high-impact optimizations first</p>
                <p>• Use optimization gains to fund dream pursuits</p>
                <p>• Consider dreams that appreciate (home, education)</p>
                <p>• Delay or modify dreams that significantly impact retirement</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OptimizationDashboard
