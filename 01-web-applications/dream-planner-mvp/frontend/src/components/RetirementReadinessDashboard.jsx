import React, { useState, useEffect } from 'react'
import { Shield, CheckCircle, AlertCircle, TrendingUp, DollarSign, Calendar, Target } from 'lucide-react'
import { calculateRetirementReadiness } from '../utils/timeHorizonUtils'

/**
 * RetirementReadinessDashboard Component
 * Specialized dashboard for users within 10 years of retirement
 * Focuses on validation and "Am I ready?" indicators
 */
const RetirementReadinessDashboard = ({ 
  currentAge = 55,
  retirementAge = 65,
  currentSavings = 500000,
  monthlyContribution = 2000,
  desiredRetirementIncome = 80000,
  dreams = []
}) => {
  const [animationStarted, setAnimationStarted] = useState(false)
  
  // Calculate readiness metrics
  const readiness = calculateRetirementReadiness(
    currentAge, 
    retirementAge, 
    currentSavings, 
    monthlyContribution, 
    desiredRetirementIncome
  )
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimationStarted(true), 500)
    return () => clearTimeout(timer)
  }, [])
  
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
  
  // Get readiness color and icon
  const getReadinessIndicator = (status) => {
    switch (status) {
      case 'on-track':
        return { color: 'green', icon: CheckCircle, bgColor: 'bg-green-50', borderColor: 'border-green-200' }
      case 'close':
        return { color: 'yellow', icon: AlertCircle, bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' }
      default:
        return { color: 'red', icon: AlertCircle, bgColor: 'bg-red-50', borderColor: 'border-red-200' }
    }
  }
  
  const indicator = getReadinessIndicator(readiness.status)
  const ReadinessIcon = indicator.icon
  
  return (
    <div className="space-y-6">
      {/* Main Readiness Score */}
      <div className={`${indicator.bgColor} ${indicator.borderColor} border rounded-2xl p-8`}>
        <div className="text-center mb-6">
          <div className={`bg-${indicator.color}-500 text-white p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4`}>
            <ReadinessIcon className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Retirement Readiness Score</h2>
          <div className="text-6xl font-bold text-gray-900 mb-2">{readiness.score}%</div>
          <p className={`text-lg text-${indicator.color}-700 font-medium`}>{readiness.message}</p>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div 
            className={`bg-${indicator.color}-500 h-4 rounded-full transition-all duration-2000 ease-out`}
            style={{ width: animationStarted ? `${readiness.score}%` : '0%' }}
          ></div>
        </div>
        
        <div className="text-center text-gray-600">
          <p className="text-sm">Based on current savings trajectory and retirement income goals</p>
        </div>
      </div>
      
      {/* Key Metrics Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Projected Savings</h3>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(readiness.projectedSavings)}</div>
          <div className="text-sm text-gray-600">at retirement</div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Annual Income</h3>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(readiness.projectedAnnualIncome)}</div>
          <div className="text-sm text-gray-600">4% withdrawal rate</div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Income Goal</h3>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(desiredRetirementIncome)}</div>
          <div className="text-sm text-gray-600">target annual income</div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="bg-orange-100 p-3 rounded-full mr-4">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Years Left</h3>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{retirementAge - currentAge}</div>
          <div className="text-sm text-gray-600">to build wealth</div>
        </div>
      </div>
      
      {/* Detailed Analysis */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths & Opportunities */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Readiness Analysis</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-green-700 mb-2">✅ Strengths</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Consistent monthly savings of {formatCurrency(monthlyContribution)}</li>
                <li>• {(retirementAge - currentAge)} years of compound growth remaining</li>
                <li>• Current savings of {formatCurrency(currentSavings)} established</li>
                {readiness.score >= 80 && <li>• On track to meet retirement income goals</li>}
              </ul>
            </div>
            
            {readiness.shortfall > 0 && (
              <div>
                <h4 className="font-semibold text-orange-700 mb-2">⚠️ Areas for Improvement</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Annual income shortfall of {formatCurrency(readiness.shortfall)}</li>
                  <li>• Consider increasing monthly contributions</li>
                  <li>• Explore catch-up contribution opportunities</li>
                  <li>• Review investment allocation for optimal growth</li>
                </ul>
              </div>
            )}
          </div>
        </div>
        
        {/* Action Items */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Next Steps</h3>
          
          <div className="space-y-3">
            {readiness.score < 100 && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">To Close the Gap:</h4>
                <p className="text-sm text-blue-800">
                  Increase monthly savings by {formatCurrency((readiness.shortfall * 0.04) / 12)} 
                  to reach your income goal.
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Shield className="w-4 h-4 text-gray-500 mr-2" />
                <span>Review and optimize investment risk allocation</span>
              </div>
              <div className="flex items-center text-sm">
                <Shield className="w-4 h-4 text-gray-500 mr-2" />
                <span>Consider healthcare and long-term care planning</span>
              </div>
              <div className="flex items-center text-sm">
                <Shield className="w-4 h-4 text-gray-500 mr-2" />
                <span>Plan withdrawal strategy and tax implications</span>
              </div>
              <div className="flex items-center text-sm">
                <Shield className="w-4 h-4 text-gray-500 mr-2" />
                <span>Review Social Security claiming strategy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dreams Impact on Retirement */}
      {dreams.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Dreams Impact on Retirement</h3>
          <p className="text-gray-600 mb-4">
            How pursuing your remaining dreams affects your retirement timeline:
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dreams.slice(0, 3).map((dream, index) => {
              const dreamImpact = (dream.target_amount / readiness.projectedSavings) * 100
              return (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{dream.title}</h4>
                  <div className="text-sm text-gray-600">
                    <p className="mb-1">Cost: {formatCurrency(dream.target_amount)}</p>
                    <p className="text-orange-600">
                      Impact: -{dreamImpact.toFixed(1)}% retirement funds
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default RetirementReadinessDashboard
