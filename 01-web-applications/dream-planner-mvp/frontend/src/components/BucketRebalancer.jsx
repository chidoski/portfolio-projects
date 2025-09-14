import { useState, useEffect, useMemo } from 'react'
import { 
  Clock, 
  TrendingUp, 
  Balance, 
  Wallet, 
  Target, 
  Calendar,
  DollarSign,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { allocateFunds } from '../services/bucketAllocator'

/**
 * BucketRebalancer Component
 * 
 * Appears when users add a new life milestone, showing three animated scenarios:
 * 1. Delay Dream - maintain current savings, extend timeline
 * 2. Boost Savings - show exactly how much more per month to maintain timeline
 * 3. Hybrid Approach - slight delay plus slight increase
 * 
 * Includes interactive sliders and specific impact messaging
 */
export default function BucketRebalancer({ 
  isOpen, 
  onClose, 
  newMilestone, 
  currentFinancialProfile, 
  currentDream, 
  availableMonthly,
  onApplyScenario 
}) {
  const [selectedScenario, setSelectedScenario] = useState('hybrid')
  const [delayMonths, setDelayMonths] = useState(6)
  const [boostAmount, setBoostAmount] = useState(0)
  const [hybridDelayMonths, setHybridDelayMonths] = useState(3)
  const [hybridBoostAmount, setHybridBoostAmount] = useState(0)
  const [showLifeBucketOption, setShowLifeBucketOption] = useState(false)
  const [lifeBucketBorrow, setLifeBucketBorrow] = useState(0)
  const [animationStep, setAnimationStep] = useState(0)

  // Get current allocations
  const currentAllocation = useMemo(() => {
    if (!currentFinancialProfile || !availableMonthly) return null
    return allocateFunds(availableMonthly, currentFinancialProfile, 'balanced')
  }, [currentFinancialProfile, availableMonthly])

  // Calculate scenarios
  const scenarios = useMemo(() => {
    if (!currentDream || !newMilestone || !currentAllocation) return null

    const currentAge = currentFinancialProfile?.userProfile?.age || 30
    const dreamTargetAge = currentDream.targetAge || 65
    const originalTimelineYears = dreamTargetAge - currentAge
    const milestoneAmount = newMilestone.amount || 0
    const currentDreamMonthly = currentAllocation.dream || 0
    
    // Calculate how much additional monthly savings needed for milestone
    const milestoneMonthsToTarget = newMilestone.timeframe || 12
    const milestoneMonthlyNeeded = milestoneAmount / milestoneMonthsToTarget

    // Scenario 1: Delay Dream
    const delayScenario = {
      type: 'delay',
      name: 'Delay Dream',
      icon: Clock,
      color: 'blue',
      description: 'Keep current savings rate, extend dream timeline',
      dreamMonthly: currentDreamMonthly,
      milestoneMonthly: milestoneMonthlyNeeded,
      totalNeeded: currentDreamMonthly + milestoneMonthlyNeeded,
      newTimelineYears: originalTimelineYears + (delayMonths / 12),
      newTargetAge: Math.round(dreamTargetAge + (delayMonths / 12)),
      impact: `${currentDream.title} moves from age ${dreamTargetAge} to ${Math.round(dreamTargetAge + (delayMonths / 12))}`,
      feasible: (currentDreamMonthly + milestoneMonthlyNeeded) <= availableMonthly,
      shortfall: Math.max(0, (currentDreamMonthly + milestoneMonthlyNeeded) - availableMonthly)
    }

    // Scenario 2: Boost Savings
    const additionalNeeded = milestoneMonthlyNeeded
    const boostScenario = {
      type: 'boost',
      name: 'Boost Savings',
      icon: TrendingUp,
      color: 'green',
      description: 'Increase monthly savings to maintain timeline',
      dreamMonthly: currentDreamMonthly,
      milestoneMonthly: milestoneMonthlyNeeded,
      totalNeeded: currentDreamMonthly + milestoneMonthlyNeeded + boostAmount,
      additionalMonthly: additionalNeeded + boostAmount,
      newTimelineYears: originalTimelineYears,
      newTargetAge: dreamTargetAge,
      impact: `Maintain ${currentDream.title} at age ${dreamTargetAge}, add $${(additionalNeeded + boostAmount).toFixed(0)}/month`,
      feasible: (currentDreamMonthly + milestoneMonthlyNeeded + boostAmount) <= availableMonthly,
      shortfall: Math.max(0, (currentDreamMonthly + milestoneMonthlyNeeded + boostAmount) - availableMonthly)
    }

    // Scenario 3: Hybrid Approach
    const hybridTotalMonthly = currentDreamMonthly + milestoneMonthlyNeeded + hybridBoostAmount
    const hybridScenario = {
      type: 'hybrid',
      name: 'Hybrid Approach',
      icon: Balance,
      color: 'purple',
      description: 'Balanced mix of slight delay and modest increase',
      dreamMonthly: currentDreamMonthly,
      milestoneMonthly: milestoneMonthlyNeeded,
      additionalMonthly: hybridBoostAmount,
      totalNeeded: hybridTotalMonthly,
      newTimelineYears: originalTimelineYears + (hybridDelayMonths / 12),
      newTargetAge: Math.round(dreamTargetAge + (hybridDelayMonths / 12)),
      impact: `${currentDream.title} moves from age ${dreamTargetAge} to ${Math.round(dreamTargetAge + (hybridDelayMonths / 12))}, add $${hybridBoostAmount.toFixed(0)}/month`,
      feasible: hybridTotalMonthly <= availableMonthly,
      shortfall: Math.max(0, hybridTotalMonthly - availableMonthly)
    }

    return { delayScenario, boostScenario, hybridScenario }
  }, [currentDream, newMilestone, currentAllocation, delayMonths, boostAmount, hybridDelayMonths, hybridBoostAmount, availableMonthly, currentFinancialProfile])

  // Check if Life Bucket has sufficient funds for borrowing
  useEffect(() => {
    if (currentAllocation?.life > 100) { // At least $100 available
      setShowLifeBucketOption(true)
      setLifeBucketBorrow(Math.min(currentAllocation.life * 0.5, 200)) // Default to 50% or $200, whichever is less
    }
  }, [currentAllocation])

  // Animation effect
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setAnimationStep(1), 100)
      const timer2 = setTimeout(() => setAnimationStep(2), 300)
      const timer3 = setTimeout(() => setAnimationStep(3), 500)
      return () => {
        clearTimeout(timer)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    }
  }, [isOpen])

  // Update boost amount based on shortfall
  useEffect(() => {
    if (scenarios?.boostScenario?.shortfall > 0) {
      setBoostAmount(scenarios.boostScenario.shortfall)
    }
  }, [scenarios?.boostScenario?.shortfall])

  // Update hybrid amounts for balanced approach
  useEffect(() => {
    if (scenarios?.delayScenario && scenarios?.boostScenario) {
      const optimalBoost = scenarios.boostScenario.shortfall * 0.6 // 60% of needed boost
      const optimalDelay = Math.max(2, Math.min(6, scenarios.boostScenario.shortfall / 50)) // 2-6 months based on shortfall
      setHybridBoostAmount(optimalBoost)
      setHybridDelayMonths(optimalDelay)
    }
  }, [scenarios?.delayScenario, scenarios?.boostScenario])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getScenarioData = () => {
    if (!scenarios) return null
    
    switch (selectedScenario) {
      case 'delay':
        return scenarios.delayScenario
      case 'boost':
        return scenarios.boostScenario
      case 'hybrid':
        return scenarios.hybridScenario
      default:
        return scenarios.hybridScenario
    }
  }

  const currentScenario = getScenarioData()

  if (!isOpen || !scenarios || !currentScenario) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Rebalance Your Buckets
              </h2>
              <p className="text-gray-600">
                You're adding "{newMilestone?.title}" (${formatCurrency(newMilestone?.amount || 0)}). 
                Let's see how this affects your dream timeline.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Current Situation */}
          <div className="mb-8 p-4 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Situation</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <Target className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <div className="text-sm text-gray-600">Dream Monthly</div>
                  <div className="font-semibold">{formatCurrency(currentAllocation?.dream || 0)}</div>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <div className="text-sm text-gray-600">Target Age</div>
                  <div className="font-semibold">{currentDream?.targetAge || 65} years old</div>
                </div>
              </div>
              <div className="flex items-center">
                <Wallet className="w-5 h-5 text-purple-600 mr-2" />
                <div>
                  <div className="text-sm text-gray-600">Available Monthly</div>
                  <div className="font-semibold">{formatCurrency(availableMonthly || 0)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Scenario Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Approach</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Delay Dream Scenario */}
              <div 
                className={`scenario-card ${selectedScenario === 'delay' ? 'selected' : ''} ${animationStep >= 1 ? 'animate-in' : ''}`}
                onClick={() => setSelectedScenario('delay')}
              >
                <div className="flex items-center mb-3">
                  <Clock className="w-6 h-6 text-blue-600 mr-2" />
                  <h4 className="font-semibold text-gray-900">Delay Dream</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Keep current savings rate, extend timeline
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Monthly Savings:</span>
                    <span className="font-medium">{formatCurrency(scenarios.delayScenario.dreamMonthly)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>New Target Age:</span>
                    <span className="font-medium text-blue-600">{scenarios.delayScenario.newTargetAge}</span>
                  </div>
                </div>
                {!scenarios.delayScenario.feasible && (
                  <div className="mt-2 flex items-center text-red-600 text-sm">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    <span>Shortfall: {formatCurrency(scenarios.delayScenario.shortfall)}</span>
                  </div>
                )}
              </div>

              {/* Boost Savings Scenario */}
              <div 
                className={`scenario-card ${selectedScenario === 'boost' ? 'selected' : ''} ${animationStep >= 2 ? 'animate-in' : ''}`}
                onClick={() => setSelectedScenario('boost')}
              >
                <div className="flex items-center mb-3">
                  <TrendingUp className="w-6 h-6 text-green-600 mr-2" />
                  <h4 className="font-semibold text-gray-900">Boost Savings</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Increase monthly savings to maintain timeline
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Additional Monthly:</span>
                    <span className="font-medium text-green-600">+{formatCurrency(scenarios.boostScenario.additionalMonthly)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Target Age:</span>
                    <span className="font-medium">{scenarios.boostScenario.newTargetAge}</span>
                  </div>
                </div>
                {!scenarios.boostScenario.feasible && (
                  <div className="mt-2 flex items-center text-red-600 text-sm">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    <span>Shortfall: {formatCurrency(scenarios.boostScenario.shortfall)}</span>
                  </div>
                )}
              </div>

              {/* Hybrid Approach Scenario */}
              <div 
                className={`scenario-card ${selectedScenario === 'hybrid' ? 'selected' : ''} ${animationStep >= 3 ? 'animate-in' : ''}`}
                onClick={() => setSelectedScenario('hybrid')}
              >
                <div className="flex items-center mb-3">
                  <Balance className="w-6 h-6 text-purple-600 mr-2" />
                  <h4 className="font-semibold text-gray-900">Hybrid Approach</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Balanced mix of slight delay and modest increase
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Additional Monthly:</span>
                    <span className="font-medium text-purple-600">+{formatCurrency(scenarios.hybridScenario.additionalMonthly)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>New Target Age:</span>
                    <span className="font-medium">{scenarios.hybridScenario.newTargetAge}</span>
                  </div>
                </div>
                {!scenarios.hybridScenario.feasible && (
                  <div className="mt-2 flex items-center text-red-600 text-sm">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    <span>Shortfall: {formatCurrency(scenarios.hybridScenario.shortfall)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Sliders */}
          <div className="mb-8 p-6 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Fine-tune Your Choice</h3>
            
            {selectedScenario === 'delay' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delay Timeline by: {delayMonths} months
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="24"
                    value={delayMonths}
                    onChange={(e) => setDelayMonths(parseInt(e.target.value))}
                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider-blue"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 month</span>
                    <span>24 months</span>
                  </div>
                </div>
              </div>
            )}

            {selectedScenario === 'boost' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Monthly Savings: {formatCurrency(boostAmount)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max={Math.min(availableMonthly * 0.3, 1000)}
                    step="25"
                    value={boostAmount}
                    onChange={(e) => setBoostAmount(parseInt(e.target.value))}
                    className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer slider-green"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>$0</span>
                    <span>{formatCurrency(Math.min(availableMonthly * 0.3, 1000))}</span>
                  </div>
                </div>
              </div>
            )}

            {selectedScenario === 'hybrid' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delay Timeline by: {hybridDelayMonths} months
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={hybridDelayMonths}
                    onChange={(e) => setHybridDelayMonths(parseInt(e.target.value))}
                    className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer slider-purple"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 month</span>
                    <span>12 months</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Monthly Savings: {formatCurrency(hybridBoostAmount)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max={Math.min(availableMonthly * 0.2, 500)}
                    step="25"
                    value={hybridBoostAmount}
                    onChange={(e) => setHybridBoostAmount(parseInt(e.target.value))}
                    className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer slider-purple"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>$0</span>
                    <span>{formatCurrency(Math.min(availableMonthly * 0.2, 500))}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Life Bucket Borrowing Option */}
          {showLifeBucketOption && (
            <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center mb-4">
                <Wallet className="w-6 h-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Borrow from Life Bucket</h3>
              </div>
              <p className="text-gray-600 mb-4">
                You have {formatCurrency(currentAllocation?.life || 0)} available in your Life Bucket. 
                You can temporarily borrow from this to reduce the impact on your dream timeline.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Borrow Amount: {formatCurrency(lifeBucketBorrow)}
                </label>
                <input
                  type="range"
                  min="0"
                  max={currentAllocation?.life || 0}
                  step="25"
                  value={lifeBucketBorrow}
                  onChange={(e) => setLifeBucketBorrow(parseInt(e.target.value))}
                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider-blue"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$0</span>
                  <span>{formatCurrency(currentAllocation?.life || 0)}</span>
                </div>
              </div>
              {lifeBucketBorrow > 0 && (
                <div className="mt-3 p-3 bg-blue-100 rounded-lg">
                  <div className="flex items-center text-blue-800 text-sm">
                    <Info className="w-4 h-4 mr-2" />
                    <span>
                      This reduces your emergency fund buffer. Consider replenishing within 6-12 months.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Impact Summary */}
          <div className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Impact Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                <div className="flex items-center">
                  <ArrowRight className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">{currentScenario.impact}</span>
                </div>
                {currentScenario.feasible ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                )}
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">
                    New total monthly allocation: {formatCurrency(currentScenario.totalNeeded - lifeBucketBorrow)}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {lifeBucketBorrow > 0 && `(${formatCurrency(lifeBucketBorrow)} from Life Bucket)`}
                </div>
              </div>

              {newMilestone && (
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <Target className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">
                      "{newMilestone.title}" funded at {formatCurrency(newMilestone.amount / (newMilestone.timeframe || 12))}/month
                    </span>
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    {newMilestone.timeframe || 12} months
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const scenarioData = {
                  type: selectedScenario,
                  scenario: currentScenario,
                  lifeBucketBorrow,
                  newMilestone
                }
                onApplyScenario(scenarioData)
              }}
              disabled={!currentScenario.feasible && lifeBucketBorrow === 0}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Apply This Scenario
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scenario-card {
          @apply p-4 border-2 border-gray-200 rounded-xl cursor-pointer transition-all duration-300 opacity-0 transform translate-y-4;
        }
        
        .scenario-card.animate-in {
          @apply opacity-100 transform translate-y-0;
        }
        
        .scenario-card:hover {
          @apply border-gray-300 shadow-md;
        }
        
        .scenario-card.selected {
          @apply border-blue-500 bg-blue-50 shadow-lg;
        }
        
        .slider-blue::-webkit-slider-thumb {
          @apply appearance-none w-5 h-5 bg-blue-600 rounded-full cursor-pointer;
        }
        
        .slider-green::-webkit-slider-thumb {
          @apply appearance-none w-5 h-5 bg-green-600 rounded-full cursor-pointer;
        }
        
        .slider-purple::-webkit-slider-thumb {
          @apply appearance-none w-5 h-5 bg-purple-600 rounded-full cursor-pointer;
        }
        
        .slider-blue::-moz-range-thumb {
          @apply w-5 h-5 bg-blue-600 rounded-full cursor-pointer border-0;
        }
        
        .slider-green::-moz-range-thumb {
          @apply w-5 h-5 bg-green-600 rounded-full cursor-pointer border-0;
        }
        
        .slider-purple::-moz-range-thumb {
          @apply w-5 h-5 bg-purple-600 rounded-full cursor-pointer border-0;
        }
      `}</style>
    </div>
  )
}
