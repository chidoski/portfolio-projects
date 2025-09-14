import { useState, useEffect } from 'react'
import { Heart, Sparkles, TrendingUp, X, DollarSign, Target, Calendar } from 'lucide-react'

/**
 * SpendingDecisionHelper Component
 * Appears when users log purchases above a threshold
 * Frames spending as dream impact choices rather than restrictions
 * Celebrates conscious decision-making and provides positive reinforcement
 */
function SpendingDecisionHelper({ 
  purchase, 
  dream, 
  onDecision, 
  onClose, 
  isVisible = false,
  threshold = 100 
}) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationType, setCelebrationType] = useState(null)
  const [dreamImpact, setDreamImpact] = useState(null)

  // Calculate dream impact when component mounts or data changes
  useEffect(() => {
    if (purchase && dream) {
      const impact = calculateDreamImpact(purchase.amount, dream)
      setDreamImpact(impact)
    }
  }, [purchase, dream])

  // Handle animation states
  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
      setShowCelebration(false)
    }
  }, [isVisible])

  // Calculate how the purchase impacts the dream timeline
  const calculateDreamImpact = (amount, dream) => {
    if (!dream || !dream.daily_amount) return null

    const dailyAmount = dream.daily_amount
    const daysImpact = amount / dailyAmount
    const weeksImpact = daysImpact / 7
    const monthsImpact = daysImpact / 30

    // Choose the most meaningful time unit
    let timeText = ''
    let timeValue = 0
    let timeUnit = ''

    if (daysImpact < 1) {
      timeValue = Math.round(daysImpact * 24)
      timeUnit = timeValue === 1 ? 'hour' : 'hours'
      timeText = `${timeValue} ${timeUnit}`
    } else if (daysImpact < 7) {
      timeValue = Math.round(daysImpact * 10) / 10
      timeUnit = timeValue === 1 ? 'day' : 'days'
      timeText = `${timeValue} ${timeUnit}`
    } else if (weeksImpact < 4) {
      timeValue = Math.round(weeksImpact * 10) / 10
      timeUnit = timeValue === 1 ? 'week' : 'weeks'
      timeText = `${timeValue} ${timeUnit}`
    } else {
      timeValue = Math.round(monthsImpact * 10) / 10
      timeUnit = timeValue === 1 ? 'month' : 'months'
      timeText = `${timeValue} ${timeUnit}`
    }

    return {
      daysImpact: Math.round(daysImpact * 10) / 10,
      timeText,
      timeValue,
      timeUnit,
      percentage: (amount / dream.target_amount) * 100
    }
  }

  // Handle "Worth it!" decision
  const handleWorthIt = () => {
    setCelebrationType('worth-it')
    setShowCelebration(true)
    
    setTimeout(() => {
      onDecision({
        decision: 'worth-it',
        purchase,
        message: 'Conscious choice celebrated! 🎉'
      })
    }, 2000)
  }

  // Handle "Maybe not" decision with dream boost animation
  const handleMaybeNot = () => {
    setCelebrationType('dream-boost')
    setShowCelebration(true)
    
    setTimeout(() => {
      onDecision({
        decision: 'dream-boost',
        purchase,
        amountAdded: purchase.amount,
        message: `$${purchase.amount} added to your ${dream?.title || 'dream'}! 🚀`
      })
    }, 2500)
  }

  // Generate contextual messages based on purchase type and amount
  const generateContextualMessage = () => {
    if (!purchase || !dream || !dreamImpact) return ''

    const { amount, category, description } = purchase
    const { title: dreamTitle } = dream
    const { timeText } = dreamImpact

    // Category-specific messages
    const categoryMessages = {
      dining: [
        `This $${amount} dinner is ${timeText} of ${dreamTitle} savings. Savor every bite?`,
        `That $${amount} meal could delay ${dreamTitle} by ${timeText}. Worth the experience?`,
        `$${amount} for dining out = ${timeText} less time to ${dreamTitle}. Enjoying the moment?`
      ],
      shopping: [
        `This $${amount} purchase pushes ${dreamTitle} back by ${timeText}. Love what you're getting?`,
        `$${amount} shopping spree = ${timeText} delay for ${dreamTitle}. Totally worth it?`,
        `That $${amount} buy moves ${dreamTitle} ${timeText} further. Happy with your choice?`
      ],
      entertainment: [
        `$${amount} for fun delays ${dreamTitle} by ${timeText}. Making memories?`,
        `This $${amount} entertainment choice costs ${timeText} of ${dreamTitle}. Enjoying yourself?`,
        `$${amount} for entertainment = ${timeText} less progress toward ${dreamTitle}. Worth the joy?`
      ],
      travel: [
        `$${amount} for travel delays ${dreamTitle} by ${timeText}. Adventure calling?`,
        `This $${amount} trip pushes ${dreamTitle} back ${timeText}. Creating lasting memories?`,
        `$${amount} travel expense = ${timeText} delay for ${dreamTitle}. Wanderlust winning?`
      ],
      default: [
        `This $${amount} purchase delays ${dreamTitle} by ${timeText}. Worth it to you?`,
        `$${amount} spent = ${timeText} less progress toward ${dreamTitle}. Happy with this choice?`,
        `That $${amount} expense pushes ${dreamTitle} back by ${timeText}. Feeling good about it?`
      ]
    }

    const messages = categoryMessages[category?.toLowerCase()] || categoryMessages.default
    return messages[Math.floor(Math.random() * messages.length)]
  }

  if (!isVisible || !purchase || !dream) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-full transition-all duration-500 ${
        isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        
        {!showCelebration ? (
          // Main decision interface
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Dream Impact Check</h3>
                  <p className="text-sm text-gray-600">Conscious spending choice</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Purchase details */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Purchase</span>
                <span className="text-lg font-bold text-gray-900">${purchase.amount}</span>
              </div>
              <p className="text-sm text-gray-700">{purchase.description || purchase.category}</p>
              {purchase.category && (
                <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {purchase.category}
                </span>
              )}
            </div>

            {/* Dream impact visualization */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Impact on {dream.title}</span>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-700 mb-1">
                  {dreamImpact?.timeText}
                </div>
                <p className="text-sm text-purple-600">
                  delay in reaching your dream
                </p>
                
                {dreamImpact?.percentage > 0 && (
                  <div className="mt-3 bg-white/60 rounded-lg p-2">
                    <div className="text-xs text-purple-600">
                      That's {dreamImpact.percentage.toFixed(2)}% of your total dream cost
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contextual message */}
            <div className="text-center mb-6">
              <p className="text-gray-700 text-base leading-relaxed">
                {generateContextualMessage()}
              </p>
            </div>

            {/* Decision buttons */}
            <div className="space-y-3">
              <button
                onClick={handleWorthIt}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Heart className="w-5 h-5" />
                <span>Worth it! 💚</span>
              </button>
              
              <button
                onClick={handleMaybeNot}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <TrendingUp className="w-5 h-5" />
                <span>Maybe not - boost my dream! 🚀</span>
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              Either choice is perfectly valid - you're making conscious decisions! ✨
            </p>
          </div>
        ) : (
          // Celebration animations
          <CelebrationScreen 
            type={celebrationType}
            purchase={purchase}
            dream={dream}
            dreamImpact={dreamImpact}
          />
        )}
      </div>
    </div>
  )
}

/**
 * Celebration Screen Component
 * Shows different animations based on user's decision
 */
function CelebrationScreen({ type, purchase, dream, dreamImpact }) {
  const [animationPhase, setAnimationPhase] = useState(0)

  useEffect(() => {
    const phases = type === 'dream-boost' ? 3 : 2
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % phases)
    }, 800)

    return () => clearInterval(interval)
  }, [type])

  if (type === 'worth-it') {
    return (
      <div className="p-8 text-center">
        <div className="mb-6">
          <div className={`text-6xl transition-all duration-500 ${
            animationPhase === 0 ? 'scale-100' : 'scale-110'
          }`}>
            🎉
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Conscious Choice Celebrated!
        </h3>
        
        <p className="text-gray-600 mb-4">
          You chose to enjoy your ${purchase.amount} purchase, and that's perfectly valid! 
          Making intentional decisions is what matters most.
        </p>
        
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-center space-x-2 text-green-700">
            <Heart className="w-5 h-5" />
            <span className="font-medium">Mindful spending = winning! 💚</span>
          </div>
        </div>
      </div>
    )
  }

  if (type === 'dream-boost') {
    return (
      <div className="p-8 text-center">
        <div className="mb-6">
          <div className={`text-6xl transition-all duration-500 ${
            animationPhase === 0 ? 'scale-100' : 
            animationPhase === 1 ? 'scale-110 rotate-12' : 'scale-100'
          }`}>
            🚀
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Dream Boost Activated!
        </h3>
        
        <p className="text-gray-600 mb-4">
          Amazing choice! You just accelerated your {dream.title} by {dreamImpact?.timeText}!
        </p>
        
        {/* Money animation */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 mb-4">
          <div className={`transition-all duration-1000 ${
            animationPhase >= 1 ? 'transform translate-y-0 opacity-100' : 'transform translate-y-4 opacity-0'
          }`}>
            <div className="flex items-center justify-center space-x-2 text-purple-700 mb-2">
              <DollarSign className="w-5 h-5" />
              <span className="text-lg font-bold">${purchase.amount}</span>
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="text-sm text-purple-600">
              Added to your {dream.title} fund!
            </p>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center justify-center space-x-2 text-yellow-700">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">You're {dreamImpact?.timeText} closer to your dream! ✨</span>
          </div>
        </div>
      </div>
    )
  }

  return null
}

/**
 * Hook to manage SpendingDecisionHelper state
 * Provides easy integration with other components
 */
export function useSpendingDecisionHelper(threshold = 100) {
  const [isVisible, setIsVisible] = useState(false)
  const [currentPurchase, setCurrentPurchase] = useState(null)
  const [currentDream, setCurrentDream] = useState(null)

  const showHelper = (purchase, dream) => {
    if (purchase.amount >= threshold) {
      setCurrentPurchase(purchase)
      setCurrentDream(dream)
      setIsVisible(true)
      return true
    }
    return false
  }

  const hideHelper = () => {
    setIsVisible(false)
    setCurrentPurchase(null)
    setCurrentDream(null)
  }

  const handleDecision = (decision) => {
    // You can add analytics tracking here
    console.log('Spending decision made:', decision)
    hideHelper()
    return decision
  }

  return {
    isVisible,
    currentPurchase,
    currentDream,
    showHelper,
    hideHelper,
    handleDecision,
    SpendingDecisionHelper: (props) => (
      <SpendingDecisionHelper
        {...props}
        purchase={currentPurchase}
        dream={currentDream}
        isVisible={isVisible}
        onDecision={handleDecision}
        onClose={hideHelper}
        threshold={threshold}
      />
    )
  }
}

export default SpendingDecisionHelper
