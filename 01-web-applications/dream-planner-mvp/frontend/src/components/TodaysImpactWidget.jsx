import React, { useState, useEffect } from 'react'
import { DollarSign, Target, Shield, Home, TrendingUp, Clock, ArrowRight, Zap } from 'lucide-react'

/**
 * TodaysImpactWidget Component
 * Shows how daily savings are distributed across the three-bucket system
 * and the impact on each goal's timeline
 */
const TodaysImpactWidget = ({ 
  dailySavings = 47,
  dreams = [],
  somedayLifeTarget = 1450000,
  foundationTarget = 100000, // Emergency fund + foundation
  currentSomedayLifeSaved = 165000,
  currentFoundationSaved = 35000
}) => {
  const [isAnimated, setIsAnimated] = useState(false)
  
  // Three-bucket allocation (can be customized by user preferences)
  const bucketAllocation = {
    someday: 0.425,     // ~42.5% to Someday Life
    foundation: 0.32,   // ~32% to Foundation (emergency fund, stability)
    milestones: 0.255   // ~25.5% to next milestone
  }
  
  // Calculate daily allocations
  const dailyToSomeday = dailySavings * bucketAllocation.someday
  const dailyToFoundation = dailySavings * bucketAllocation.foundation
  const dailyToMilestones = dailySavings * bucketAllocation.milestones
  
  // Find next milestone (earliest target date)
  const nextMilestone = dreams
    .filter(dream => dream.progress < 100)
    .sort((a, b) => new Date(a.target_date) - new Date(b.target_date))[0]
  
  // Calculate impacts
  const somedayImpact = {
    daysCloser: (somedayLifeTarget - currentSomedayLifeSaved) / dailyToSomeday,
    yearsCloser: ((somedayLifeTarget - currentSomedayLifeSaved) / dailyToSomeday) / 365
  }
  
  const foundationImpact = {
    daysCloser: (foundationTarget - currentFoundationSaved) / dailyToFoundation,
    monthsCloser: ((foundationTarget - currentFoundationSaved) / dailyToFoundation) / 30
  }
  
  const milestoneImpact = nextMilestone ? {
    daysCloser: ((nextMilestone.target_amount * (1 - nextMilestone.progress / 100)) / dailyToMilestones),
    monthsCloser: ((nextMilestone.target_amount * (1 - nextMilestone.progress / 100)) / dailyToMilestones) / 30
  } : null
  
  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 300)
    return () => clearTimeout(timer)
  }, [])
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }
  
  // Format impact text
  const formatImpact = (days) => {
    if (days < 1) return `${(days * 24).toFixed(1)} hours closer`
    if (days < 30) return `${days.toFixed(1)} days closer`
    if (days < 365) return `${(days / 30).toFixed(1)} months closer`
    return `${(days / 365).toFixed(1)} years closer`
  }
  
  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 shadow-sm border border-purple-100">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex justify-center mb-3">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-3 rounded-full">
            <Zap className="w-6 h-6 text-white" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Today's Impact</h3>
        <p className="text-gray-600 text-sm">
          How your <span className="font-semibold text-purple-700">{formatCurrency(dailySavings)}</span> daily savings moves your entire life plan forward
        </p>
      </div>
      
      {/* Three-Bucket Flow Visualization */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Someday Life Bucket */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-yellow-200 transition-all duration-500 hover:scale-105">
            <div className="text-center">
              <div className="bg-yellow-100 rounded-full p-2 w-10 h-10 flex items-center justify-center mx-auto mb-3">
                <Home className="w-5 h-5 text-yellow-600" />
              </div>
              <h4 className="font-semibold text-gray-900 text-sm mb-2">Someday Life</h4>
              <div className="text-lg font-bold text-yellow-700">{formatCurrency(dailyToSomeday)}</div>
              <div className="text-xs text-gray-600 mb-2">{(bucketAllocation.someday * 100).toFixed(1)}% allocation</div>
              
              {/* Impact */}
              <div className="bg-yellow-50 rounded-lg p-2 mt-3">
                <div className="text-xs font-medium text-yellow-800">
                  {formatImpact(somedayImpact.daysCloser)}
                </div>
                <div className="text-xs text-yellow-700">to Maine cottage</div>
              </div>
            </div>
          </div>
          
          {/* Foundation Bucket */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-green-200 transition-all duration-500 hover:scale-105">
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-2 w-10 h-10 flex items-center justify-center mx-auto mb-3">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 text-sm mb-2">Foundation</h4>
              <div className="text-lg font-bold text-green-700">{formatCurrency(dailyToFoundation)}</div>
              <div className="text-xs text-gray-600 mb-2">{(bucketAllocation.foundation * 100).toFixed(1)}% allocation</div>
              
              {/* Impact */}
              <div className="bg-green-50 rounded-lg p-2 mt-3">
                <div className="text-xs font-medium text-green-800">
                  {formatImpact(foundationImpact.daysCloser)}
                </div>
                <div className="text-xs text-green-700">to full security</div>
              </div>
            </div>
          </div>
          
          {/* Next Milestone Bucket */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-200 transition-all duration-500 hover:scale-105">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-2 w-10 h-10 flex items-center justify-center mx-auto mb-3">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 text-sm mb-2">Next Milestone</h4>
              <div className="text-lg font-bold text-blue-700">{formatCurrency(dailyToMilestones)}</div>
              <div className="text-xs text-gray-600 mb-2">{(bucketAllocation.milestones * 100).toFixed(1)}% allocation</div>
              
              {/* Impact */}
              <div className="bg-blue-50 rounded-lg p-2 mt-3">
                {nextMilestone ? (
                  <>
                    <div className="text-xs font-medium text-blue-800">
                      {formatImpact(milestoneImpact.daysCloser)}
                    </div>
                    <div className="text-xs text-blue-700">to {nextMilestone.title}</div>
                  </>
                ) : (
                  <div className="text-xs text-blue-700">Ready for new milestone</div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>
      
      {/* Integrated Impact Summary */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-4 text-center">Complete Journey Impact</h4>
        
        <div className="space-y-3">
          {/* Someday Life Impact */}
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Home className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-gray-700">Maine Cottage Timeline</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-yellow-700">
                -{somedayImpact.daysCloser.toFixed(1)} days
              </div>
              <div className="text-xs text-gray-600">
                ({somedayImpact.yearsCloser.toFixed(2)} years faster)
              </div>
            </div>
          </div>
          
          {/* Foundation Impact */}
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-700">Security Foundation</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-green-700">
                -{foundationImpact.daysCloser.toFixed(1)} days
              </div>
              <div className="text-xs text-gray-600">
                ({foundationImpact.monthsCloser.toFixed(1)} months faster)
              </div>
            </div>
          </div>
          
          {/* Milestone Impact */}
          {nextMilestone && milestoneImpact && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-700">{nextMilestone.title}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-blue-700">
                  -{milestoneImpact.daysCloser.toFixed(1)} days
                </div>
                <div className="text-xs text-gray-600">
                  ({milestoneImpact.monthsCloser.toFixed(1)} months faster)
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Daily Compound Effect */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-start space-x-3">
              <TrendingUp className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <div className="font-medium text-purple-900 mb-1">
                  Compound Effect in Action
                </div>
                <div className="text-sm text-purple-800">
                  This {formatCurrency(dailySavings)} daily habit accelerates your <strong>entire life plan</strong> simultaneously. 
                  Each bucket builds on the others: Foundation creates stability for bigger risks, 
                  milestones maintain motivation, and Someday Life grows with compound returns.
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Annual Impact Preview */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-lg font-bold text-gray-900">{formatCurrency(dailySavings * 365)}</div>
            <div className="text-xs text-gray-600">Annual Impact</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-lg font-bold text-gray-900">
              {((somedayImpact.daysCloser + foundationImpact.daysCloser + (milestoneImpact?.daysCloser || 0)) / 365).toFixed(1)}
            </div>
            <div className="text-xs text-gray-600">Years Accelerated</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-lg font-bold text-gray-900">3</div>
            <div className="text-xs text-gray-600">Goals Advanced</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TodaysImpactWidget
