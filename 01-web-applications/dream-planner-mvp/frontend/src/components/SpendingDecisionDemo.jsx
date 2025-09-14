import { useState } from 'react'
import { ShoppingBag, Coffee, Utensils, Plane, Play } from 'lucide-react'
import SpendingDecisionHelper, { useSpendingDecisionHelper } from './SpendingDecisionHelper'

/**
 * Demo Component for SpendingDecisionHelper
 * Shows how to integrate the spending decision helper into your app
 * Includes sample purchases and dreams for testing
 */
function SpendingDecisionDemo() {
  const [lastDecision, setLastDecision] = useState(null)
  const { showHelper, SpendingDecisionHelper: Helper } = useSpendingDecisionHelper(75)

  // Sample dream data
  const sampleDream = {
    id: 'maine-cottage',
    title: 'Maine Cottage',
    target_amount: 75000,
    current_amount: 15000,
    daily_amount: 68.49, // Based on 2-year timeline
    status: 'active'
  }

  // Sample purchases that would trigger the helper
  const samplePurchases = [
    {
      id: 1,
      amount: 200,
      category: 'dining',
      description: 'Fancy dinner at Le Bernardin',
      icon: Utensils,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 2,
      amount: 150,
      category: 'shopping',
      description: 'New designer sneakers',
      icon: ShoppingBag,
      color: 'from-blue-500 to-purple-500'
    },
    {
      id: 3,
      amount: 85,
      category: 'coffee',
      description: 'Premium coffee subscription (monthly)',
      icon: Coffee,
      color: 'from-amber-500 to-orange-500'
    },
    {
      id: 4,
      amount: 350,
      category: 'travel',
      description: 'Weekend getaway to Napa Valley',
      icon: Plane,
      color: 'from-green-500 to-teal-500'
    }
  ]

  const handlePurchaseClick = (purchase) => {
    const wasShown = showHelper(purchase, sampleDream)
    if (!wasShown) {
      // Purchase was below threshold
      setLastDecision({
        type: 'below-threshold',
        purchase,
        message: `$${purchase.amount} purchase logged (below $75 threshold)`
      })
    }
  }

  const handleDecision = (decision) => {
    setLastDecision(decision)
    
    // Here you would typically:
    // 1. Log the purchase to your database
    // 2. Update the user's spending history
    // 3. If dream-boost was chosen, add amount to dream savings
    // 4. Update analytics/tracking
    
    console.log('Decision made:', decision)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Spending Decision Helper Demo
        </h1>
        <p className="text-gray-600">
          Click on any purchase above $75 to see the decision helper in action
        </p>
      </div>

      {/* Dream Context */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 mb-6">
        <h3 className="font-semibold text-purple-900 mb-2">Your Active Dream</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-800 font-medium">{sampleDream.title}</p>
            <p className="text-sm text-purple-600">
              ${sampleDream.current_amount.toLocaleString()} of ${sampleDream.target_amount.toLocaleString()} saved
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-purple-600">Daily target</p>
            <p className="font-bold text-purple-800">${sampleDream.daily_amount}</p>
          </div>
        </div>
      </div>

      {/* Sample Purchases */}
      <div className="space-y-4 mb-8">
        <h3 className="text-lg font-semibold text-gray-900">Sample Purchases</h3>
        {samplePurchases.map((purchase) => {
          const Icon = purchase.icon
          return (
            <button
              key={purchase.id}
              onClick={() => handlePurchaseClick(purchase)}
              className="w-full bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 text-left group"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 bg-gradient-to-r ${purchase.color} rounded-lg group-hover:scale-105 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{purchase.description}</h4>
                    <span className="text-lg font-bold text-gray-900">${purchase.amount}</span>
                  </div>
                  <p className="text-sm text-gray-600 capitalize">{purchase.category}</p>
                  {purchase.amount >= 75 && (
                    <p className="text-xs text-purple-600 mt-1">
                      ✨ Will trigger decision helper
                    </p>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Last Decision Display */}
      {lastDecision && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-2">Last Decision</h3>
          <div className="space-y-2">
            {lastDecision.decision === 'worth-it' && (
              <div className="flex items-center space-x-2 text-green-700">
                <span className="text-lg">💚</span>
                <span>You chose "Worth it!" - conscious spending celebrated!</span>
              </div>
            )}
            {lastDecision.decision === 'dream-boost' && (
              <div className="flex items-center space-x-2 text-purple-700">
                <span className="text-lg">🚀</span>
                <span>You chose "Dream boost!" - ${lastDecision.amountAdded} added to your dream!</span>
              </div>
            )}
            {lastDecision.type === 'below-threshold' && (
              <div className="flex items-center space-x-2 text-gray-600">
                <span className="text-lg">📝</span>
                <span>{lastDecision.message}</span>
              </div>
            )}
            <p className="text-sm text-gray-500">{lastDecision.message}</p>
          </div>
        </div>
      )}

      {/* Integration Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-medium text-blue-900 mb-2">Integration Guide</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p><strong>1. Import the hook:</strong> <code className="bg-blue-100 px-1 rounded">useSpendingDecisionHelper(threshold)</code></p>
          <p><strong>2. Show helper:</strong> <code className="bg-blue-100 px-1 rounded">showHelper(purchase, dream)</code></p>
          <p><strong>3. Handle decisions:</strong> Process the returned decision object</p>
          <p><strong>4. Add to your app:</strong> Include the Helper component in your JSX</p>
        </div>
      </div>

      {/* The actual SpendingDecisionHelper component */}
      <Helper onDecision={handleDecision} />
    </div>
  )
}

/**
 * Example integration code for reference
 */
export const integrationExample = `
import { useSpendingDecisionHelper } from './components/SpendingDecisionHelper'

function MyExpenseTracker() {
  const { showHelper, SpendingDecisionHelper } = useSpendingDecisionHelper(100)
  
  const logPurchase = (purchase) => {
    // Check if we should show the decision helper
    const wasShown = showHelper(purchase, userDream)
    
    if (!wasShown) {
      // Purchase was below threshold, log normally
      savePurchaseToDatabase(purchase)
    }
  }
  
  const handleDecision = (decision) => {
    if (decision.decision === 'worth-it') {
      // User chose to keep the purchase
      savePurchaseToDatabase(decision.purchase)
      showCelebration('Conscious choice!')
    } else if (decision.decision === 'dream-boost') {
      // User chose to skip purchase and boost dream
      addToDreamSavings(decision.amountAdded)
      showCelebration('Dream boosted!')
    }
  }
  
  return (
    <div>
      {/* Your expense tracking UI */}
      <SpendingDecisionHelper onDecision={handleDecision} />
    </div>
  )
}
`

export default SpendingDecisionDemo
