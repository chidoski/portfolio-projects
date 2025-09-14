import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, DollarSign, Target, AlertTriangle, Lightbulb, Move, Plus, Minus, RotateCcw, TrendingUp } from 'lucide-react'
import { predictMonthlyNeeds, suggestOptimizations } from '../services/spendingIntelligence'
import { loadDreams } from '../services/localStorage'

/**
 * Zero-Based Planner Component
 * Implements "give every dollar a job" budgeting with drag-and-drop interface
 * Shows real-time impact on three buckets (Life, Dreams, Retirement)
 */
function ZeroBasedPlanner({ onBack }) {
  // Core state
  const [monthlyIncome, setMonthlyIncome] = useState(5000)
  const [availableAmount, setAvailableAmount] = useState(5000)
  const [categories, setCategories] = useState([])
  const [bucketAllocations, setBucketAllocations] = useState({
    life: 0,
    dreams: 0,
    retirement: 0
  })
  
  // UI state
  const [draggedCategory, setDraggedCategory] = useState(null)
  const [draggedAmount, setDraggedAmount] = useState(0)
  const [showOverspendingModal, setShowOverspendingModal] = useState(false)
  const [overspendingCategory, setOverspendingCategory] = useState(null)
  const [overspendingAmount, setOverspendingAmount] = useState(0)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [spendingOptimizations, setSpendingOptimizations] = useState([])
  const [userDreams, setUserDreams] = useState([])
  
  // Refs for drag and drop
  const dragRef = useRef(null)
  const dropZoneRef = useRef(null)

  // Default expense categories with smart suggestions
  const defaultCategories = [
    {
      id: 'housing',
      name: 'Housing',
      icon: '🏠',
      allocated: 0,
      suggested: 1500,
      lastMonth: 1450,
      description: 'Rent, mortgage, utilities, insurance'
    },
    {
      id: 'groceries',
      name: 'Groceries',
      icon: '🛒',
      allocated: 0,
      suggested: 400,
      lastMonth: 385,
      description: 'Food and household essentials'
    },
    {
      id: 'transportation',
      name: 'Transportation',
      icon: '🚗',
      allocated: 0,
      suggested: 300,
      lastMonth: 275,
      description: 'Gas, car payment, maintenance, public transit'
    },
    {
      id: 'dining',
      name: 'Dining Out',
      icon: '🍽️',
      allocated: 0,
      suggested: 200,
      lastMonth: 245,
      description: 'Restaurants, takeout, coffee'
    },
    {
      id: 'entertainment',
      name: 'Entertainment',
      icon: '🎬',
      allocated: 0,
      suggested: 150,
      lastMonth: 120,
      description: 'Movies, streaming, hobbies, activities'
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      icon: '🏥',
      allocated: 0,
      suggested: 200,
      lastMonth: 180,
      description: 'Insurance, medications, doctor visits'
    },
    {
      id: 'personal',
      name: 'Personal Care',
      icon: '💄',
      allocated: 0,
      suggested: 100,
      lastMonth: 95,
      description: 'Haircuts, clothing, personal items'
    },
    {
      id: 'miscellaneous',
      name: 'Miscellaneous',
      icon: '📦',
      allocated: 0,
      suggested: 150,
      lastMonth: 200,
      description: 'Gifts, unexpected expenses, other'
    }
  ]

  // Initialize categories and load user data on mount
  useEffect(() => {
    // Load user dreams
    const dreams = loadDreams()
    setUserDreams(dreams)
    
    // Generate mock spending history for demo purposes
    const mockSpendingHistory = generateMockSpendingHistory()
    
    // Get spending optimizations if user has dreams
    if (dreams.length > 0) {
      const primaryDream = dreams.find(dream => dream.status === 'active') || dreams[0]
      const optimizations = suggestOptimizations(mockSpendingHistory, primaryDream, { maxSuggestions: 3 })
      setSpendingOptimizations(optimizations)
    }
    
    // Update categories with AI predictions
    const updatedCategories = defaultCategories.map(category => {
      const prediction = predictMonthlyNeeds(category.id, mockSpendingHistory)
      return {
        ...category,
        suggested: prediction.predictedAmount > 0 ? prediction.predictedAmount : category.suggested,
        aiInsight: prediction.insight,
        confidence: prediction.confidence
      }
    })
    
    setCategories(updatedCategories)
  }, [])

  // Calculate totals
  const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocated, 0)
  const totalBucketAllocations = Object.values(bucketAllocations).reduce((sum, amount) => sum + amount, 0)
  const remainingToAllocate = monthlyIncome - totalAllocated - totalBucketAllocations

  // Update available amount when allocations change
  useEffect(() => {
    setAvailableAmount(remainingToAllocate)
  }, [remainingToAllocate])

  // Handle income change
  const handleIncomeChange = (newIncome) => {
    const income = Math.max(0, newIncome)
    setMonthlyIncome(income)
  }

  // Handle category allocation
  const allocateToCategory = (categoryId, amount) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, allocated: Math.max(0, cat.allocated + amount) }
        : cat
    ))
  }

  // Handle bucket allocation
  const allocateToBucket = (bucketType, amount) => {
    setBucketAllocations(prev => ({
      ...prev,
      [bucketType]: Math.max(0, prev[bucketType] + amount)
    }))
  }

  // Handle overspending
  const handleOverspending = (categoryId, overspendAmount) => {
    const category = categories.find(cat => cat.id === categoryId)
    setOverspendingCategory(category)
    setOverspendingAmount(overspendAmount)
    setShowOverspendingModal(true)
  }

  // Resolve overspending by reducing another category
  const resolveOverspendingFromCategory = (sourceCategory) => {
    if (!overspendingCategory) return

    // Reduce source category
    allocateToCategory(sourceCategory.id, -overspendingAmount)
    
    setShowOverspendingModal(false)
    setOverspendingCategory(null)
    setOverspendingAmount(0)
  }

  // Resolve overspending by borrowing from Life Bucket
  const resolveOverspendingFromLifeBucket = () => {
    if (!overspendingCategory) return

    // Reduce Life Bucket allocation
    allocateToBucket('life', -overspendingAmount)
    
    setShowOverspendingModal(false)
    setOverspendingCategory(null)
    setOverspendingAmount(0)
  }

  // Apply smart suggestions
  const applySuggestions = () => {
    setCategories(prev => prev.map(cat => ({
      ...cat,
      allocated: cat.suggested
    })))
  }

  // Reset all allocations
  const resetAllocations = () => {
    setCategories(prev => prev.map(cat => ({
      ...cat,
      allocated: 0
    })))
    setBucketAllocations({
      life: 0,
      dreams: 0,
      retirement: 0
    })
  }

  // Generate mock spending history for demo purposes
  const generateMockSpendingHistory = () => {
    const history = []
    const categories = ['housing', 'groceries', 'transportation', 'dining', 'entertainment', 'healthcare', 'personal', 'miscellaneous']
    const today = new Date()
    
    // Generate 6 months of mock data
    for (let month = 0; month < 6; month++) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - month, 1)
      
      categories.forEach(category => {
        // Generate 3-8 transactions per category per month
        const transactionCount = 3 + Math.floor(Math.random() * 6)
        
        for (let i = 0; i < transactionCount; i++) {
          const day = 1 + Math.floor(Math.random() * 28)
          const transactionDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), day)
          
          // Base amounts vary by category
          const baseAmounts = {
            housing: 1500, groceries: 80, transportation: 45, dining: 35,
            entertainment: 25, healthcare: 60, personal: 30, miscellaneous: 40
          }
          
          const baseAmount = baseAmounts[category] || 30
          const amount = baseAmount * (0.5 + Math.random()) // 50% to 150% of base
          
          history.push({
            date: transactionDate.toISOString().split('T')[0],
            amount: Math.round(amount * 100) / 100,
            category,
            description: `${category} expense`
          })
        }
      })
    }
    
    return history.sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  // Quick allocation buttons
  const quickAllocate = (amount) => {
    if (remainingToAllocate >= amount) {
      allocateToBucket('life', amount)
    }
  }

  // Drag and drop handlers
  const handleDragStart = (e, categoryId, amount) => {
    setDraggedCategory(categoryId)
    setDraggedAmount(amount)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, targetType, targetId = null) => {
    e.preventDefault()
    
    if (!draggedCategory) return

    if (targetType === 'bucket') {
      // Moving money from category to bucket
      allocateToCategory(draggedCategory, -draggedAmount)
      allocateToBucket(targetId, draggedAmount)
    } else if (targetType === 'category') {
      // Moving money between categories
      allocateToCategory(draggedCategory, -draggedAmount)
      allocateToCategory(targetId, draggedAmount)
    }

    setDraggedCategory(null)
    setDraggedAmount(0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Zero-Based Budget</h1>
              <p className="text-gray-600">Give every dollar a job</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Lightbulb className="w-4 h-4" />
              <span>Smart Tips</span>
            </button>
            <button
              onClick={resetAllocations}
              className="btn-secondary flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Income Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Monthly Income</h2>
                <p className="text-sm text-gray-600">Your total monthly income</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <input
                type="number"
                value={monthlyIncome}
                onChange={(e) => handleIncomeChange(Number(e.target.value))}
                className="text-2xl font-bold text-right border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
                style={{ width: '150px' }}
              />
              <span className="text-2xl font-bold text-green-600">$</span>
            </div>
          </div>
        </div>

        {/* Available Money Pool */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 mb-6 text-white">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">Available to Allocate</h3>
            <div className="text-4xl font-bold mb-2">
              ${remainingToAllocate.toLocaleString()}
            </div>
            <p className="text-blue-100">
              {remainingToAllocate === 0 
                ? "Perfect! Every dollar has a job 🎉" 
                : remainingToAllocate > 0 
                  ? "Drag money to categories or buckets below"
                  : "You've allocated more than your income!"
              }
            </p>
            
            {/* Quick allocation buttons */}
            {remainingToAllocate > 0 && (
              <div className="flex justify-center space-x-2 mt-4">
                {[100, 250, 500].map(amount => (
                  <button
                    key={amount}
                    onClick={() => quickAllocate(amount)}
                    disabled={remainingToAllocate < amount}
                    className="px-3 py-1 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +${amount}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Expense Categories */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Expense Categories</h3>
                <button
                  onClick={applySuggestions}
                  className="btn-primary text-sm flex items-center space-x-2"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>Apply Suggestions</span>
                </button>
              </div>

              <div className="space-y-4">
                {categories.map(category => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onAllocate={(amount) => {
                      if (amount > remainingToAllocate && remainingToAllocate >= 0) {
                        handleOverspending(category.id, amount - remainingToAllocate)
                      } else {
                        allocateToCategory(category.id, amount)
                      }
                    }}
                    onDragStart={handleDragStart}
                    showSuggestions={showSuggestions}
                    availableAmount={remainingToAllocate}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Three Buckets */}
          <div className="space-y-4">
            <BucketCard
              type="life"
              title="Life Bucket"
              description="Monthly expenses & fun"
              amount={bucketAllocations.life}
              color="blue"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onAllocate={(amount) => allocateToBucket('life', amount)}
              availableAmount={remainingToAllocate}
            />
            
            <BucketCard
              type="dreams"
              title="Dreams Bucket"
              description="Goals & aspirations"
              amount={bucketAllocations.dreams}
              color="purple"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onAllocate={(amount) => allocateToBucket('dreams', amount)}
              availableAmount={remainingToAllocate}
            />
            
            <BucketCard
              type="retirement"
              title="Retirement Bucket"
              description="Future security"
              amount={bucketAllocations.retirement}
              color="green"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onAllocate={(amount) => allocateToBucket('retirement', amount)}
              availableAmount={remainingToAllocate}
            />

            {/* Budget Summary */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-3">Budget Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Income:</span>
                  <span className="font-medium">${monthlyIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expenses:</span>
                  <span className="font-medium">${totalAllocated.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Buckets:</span>
                  <span className="font-medium">${totalBucketAllocations.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span className={remainingToAllocate === 0 ? 'text-green-600' : remainingToAllocate > 0 ? 'text-blue-600' : 'text-red-600'}>
                    Remaining:
                  </span>
                  <span className={remainingToAllocate === 0 ? 'text-green-600' : remainingToAllocate > 0 ? 'text-blue-600' : 'text-red-600'}>
                    ${remainingToAllocate.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Spending Insights */}
            {spendingOptimizations.length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <h4 className="font-medium text-purple-900">Smart Insights</h4>
                </div>
                <div className="space-y-3">
                  {spendingOptimizations.slice(0, 2).map((optimization, index) => (
                    <div key={index} className="bg-white/60 rounded-lg p-3">
                      <p className="text-sm text-purple-800 mb-1">
                        {optimization.message}
                      </p>
                      <div className="flex items-center justify-between text-xs text-purple-600">
                        <span>Current: ${optimization.currentMonthlySpending}/month</span>
                        <span className="font-medium">Save {optimization.timelineImpactText}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Overspending Modal */}
        {showOverspendingModal && overspendingCategory && (
          <OverspendingModal
            category={overspendingCategory}
            overspendAmount={overspendingAmount}
            categories={categories.filter(cat => cat.id !== overspendingCategory.id && cat.allocated > 0)}
            lifeBucketAmount={bucketAllocations.life}
            onResolveFromCategory={resolveOverspendingFromCategory}
            onResolveFromLifeBucket={resolveOverspendingFromLifeBucket}
            onCancel={() => setShowOverspendingModal(false)}
          />
        )}
      </div>
    </div>
  )
}

// Category Card Component
function CategoryCard({ category, onAllocate, onDragStart, showSuggestions, availableAmount }) {
  const [inputAmount, setInputAmount] = useState('')

  const handleQuickAdd = (amount) => {
    onAllocate(amount)
  }

  const handleInputAdd = () => {
    const amount = Number(inputAmount)
    if (amount > 0) {
      onAllocate(amount)
      setInputAmount('')
    }
  }

  const handleInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleInputAdd()
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{category.icon}</span>
          <div>
            <h4 className="font-medium text-gray-900">{category.name}</h4>
            <p className="text-sm text-gray-500">{category.description}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-semibold text-gray-900">
            ${category.allocated.toLocaleString()}
          </div>
          {category.allocated > 0 && (
            <div
              draggable
              onDragStart={(e) => onDragStart(e, category.id, category.allocated)}
              className="text-xs text-blue-600 cursor-move flex items-center justify-end space-x-1 mt-1"
            >
              <Move className="w-3 h-3" />
              <span>Drag to move</span>
            </div>
          )}
        </div>
      </div>

      {/* Smart Suggestion */}
      {showSuggestions && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
          <div className="flex items-center space-x-2 text-sm">
            <Lightbulb className="w-4 h-4 text-yellow-600" />
            <span className="text-yellow-800">
              {category.aiInsight ? (
                category.aiInsight
              ) : (
                <>Based on last month, you'll need about <strong>${category.suggested}</strong></>
              )}
            </span>
          </div>
          {category.confidence && (
            <div className="text-xs text-yellow-700 mt-1">
              Confidence: {category.confidence}
              {category.lastMonth !== category.suggested && ` • Last month: $${category.lastMonth}`}
            </div>
          )}
        </div>
      )}

      {/* Allocation Controls */}
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          {[50, 100, 250].map(amount => (
            <button
              key={amount}
              onClick={() => handleQuickAdd(amount)}
              disabled={amount > availableAmount && availableAmount >= 0}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +${amount}
            </button>
          ))}
        </div>
        
        <div className="flex items-center space-x-1 flex-1">
          <input
            type="number"
            value={inputAmount}
            onChange={(e) => setInputAmount(e.target.value)}
            onKeyPress={handleInputKeyPress}
            placeholder="Custom amount"
            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={handleInputAdd}
            disabled={!inputAmount || Number(inputAmount) <= 0}
            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {category.allocated > 0 && (
          <button
            onClick={() => onAllocate(-category.allocated)}
            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  )
}

// Bucket Card Component
function BucketCard({ type, title, description, amount, color, onDrop, onDragOver, onAllocate, availableAmount }) {
  const [inputAmount, setInputAmount] = useState('')

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 border-blue-200',
    purple: 'from-purple-500 to-purple-600 border-purple-200',
    green: 'from-green-500 to-green-600 border-green-200'
  }

  const handleQuickAdd = (amount) => {
    onAllocate(amount)
  }

  const handleInputAdd = () => {
    const amount = Number(inputAmount)
    if (amount > 0) {
      onAllocate(amount)
      setInputAmount('')
    }
  }

  return (
    <div
      onDrop={(e) => onDrop(e, 'bucket', type)}
      onDragOver={onDragOver}
      className={`bg-gradient-to-r ${colorClasses[color]} text-white rounded-xl p-4 shadow-lg border-2 border-dashed border-transparent hover:border-white/50 transition-all`}
    >
      <div className="text-center mb-4">
        <h4 className="font-semibold text-lg">{title}</h4>
        <p className="text-white/80 text-sm">{description}</p>
        <div className="text-2xl font-bold mt-2">
          ${amount.toLocaleString()}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex space-x-1">
          {[100, 250, 500].map(quickAmount => (
            <button
              key={quickAmount}
              onClick={() => handleQuickAdd(quickAmount)}
              disabled={quickAmount > availableAmount && availableAmount >= 0}
              className="flex-1 px-2 py-1 text-xs bg-white/20 rounded hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +${quickAmount}
            </button>
          ))}
        </div>
        
        <div className="flex items-center space-x-1">
          <input
            type="number"
            value={inputAmount}
            onChange={(e) => setInputAmount(e.target.value)}
            placeholder="Custom"
            className="flex-1 px-2 py-1 text-xs bg-white/20 placeholder-white/60 text-white rounded focus:outline-none focus:bg-white/30"
          />
          <button
            onClick={handleInputAdd}
            disabled={!inputAmount || Number(inputAmount) <= 0}
            className="px-2 py-1 text-xs bg-white/20 rounded hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {amount > 0 && (
          <button
            onClick={() => onAllocate(-amount)}
            className="w-full px-2 py-1 text-xs bg-white/20 rounded hover:bg-white/30 transition-colors flex items-center justify-center space-x-1"
          >
            <Minus className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>
    </div>
  )
}

// Overspending Modal Component
function OverspendingModal({ 
  category, 
  overspendAmount, 
  categories, 
  lifeBucketAmount, 
  onResolveFromCategory, 
  onResolveFromLifeBucket, 
  onCancel 
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Overspending Alert</h3>
            <p className="text-sm text-gray-600">
              You're trying to allocate ${overspendAmount} more than available
            </p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-800">
            <strong>{category.name}</strong> needs an extra <strong>${overspendAmount}</strong>. 
            Where should this come from?
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Reduce from another category:</h4>
          
          {categories.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => onResolveFromCategory(cat)}
                  disabled={cat.allocated < overspendAmount}
                  className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center space-x-2">
                    <span>{cat.icon}</span>
                    <span className="text-sm font-medium">{cat.name}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    ${cat.allocated} available
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No other categories have allocated funds</p>
          )}

          {lifeBucketAmount >= overspendAmount && (
            <>
              <div className="border-t pt-3">
                <h4 className="font-medium text-gray-900 mb-2">Or borrow from:</h4>
                <button
                  onClick={onResolveFromLifeBucket}
                  className="w-full flex items-center justify-between p-3 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Life Bucket</span>
                  </div>
                  <div className="text-sm text-blue-600">
                    ${lifeBucketAmount} available
                  </div>
                </button>
              </div>
            </>
          )}
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default ZeroBasedPlanner
