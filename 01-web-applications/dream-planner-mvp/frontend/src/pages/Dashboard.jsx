import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Sparkles, Plus, Target, Calendar, DollarSign, TrendingUp, Calculator } from 'lucide-react'
import ProgressBar from '../components/ProgressBar'
// @ts-ignore - localStorage.js doesn't have TypeScript declarations
import { loadDreams, updateDream, deleteDream } from '../services/localStorage'

/**
 * Dashboard Component
 * Main dashboard for managing and viewing all user dreams
 */
const Dashboard = ({ onAddDream, highlightedDreamId, onNavigateToZeroBasedPlanner }) => {
  const [dreams, setDreams] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDream, setSelectedDream] = useState(null)

  // Load dreams on component mount
  useEffect(() => {
    const loadUserDreams = () => {
      try {
        const savedDreams = loadDreams()
        setDreams(savedDreams)
        
        // If there's a highlighted dream ID, find and select it
        if (highlightedDreamId) {
          const highlightedDream = savedDreams.find(dream => dream.id === highlightedDreamId)
          if (highlightedDream) {
            setSelectedDream(highlightedDream)
          }
        }
      } catch (error) {
        console.error('Error loading dreams:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserDreams()
  }, [highlightedDreamId])

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Calculate days remaining
  const getDaysRemaining = (targetDate) => {
    const today = new Date()
    const target = new Date(targetDate)
    const diffTime = target - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      travel: 'blue',
      home: 'green',
      education: 'purple',
      family: 'red',
      freedom: 'yellow',
      lifestyle: 'indigo',
      health: 'pink'
    }
    return colors[category] || 'gray'
  }

  // Calculate total statistics
  const totalStats = dreams.reduce((acc, dream) => {
    acc.totalAmount += dream.target_amount
    acc.totalProgress += dream.progress || 0
    return acc
  }, { totalAmount: 0, totalProgress: 0 })

  const averageProgress = dreams.length > 0 ? totalStats.totalProgress / dreams.length : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dreams...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Dreams Dashboard</h1>
              <p className="text-gray-600">Track your progress and stay motivated on your journey</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onNavigateToZeroBasedPlanner}
                className="btn-secondary flex items-center px-4 py-2"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Budget Planner
              </button>
              <button
                onClick={onAddDream}
                className="btn-primary flex items-center px-6 py-3"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Dream
              </button>
            </div>
          </div>
        </div>

        {dreams.length === 0 ? (
          // Empty state
          <div className="text-center py-12">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Start Your Dream Journey</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Create your first dream and discover how small daily actions can turn into life-changing achievements.
            </p>
            <button
              onClick={onAddDream}
              className="btn-primary px-8 py-3 text-lg"
            >
              Create Your First Dream
            </button>
          </div>
        ) : (
          <>
            {/* Statistics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Dreams</p>
                    <p className="text-2xl font-bold text-gray-900">{dreams.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalStats.totalAmount)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-3 rounded-full mr-4">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Progress</p>
                    <p className="text-2xl font-bold text-gray-900">{averageProgress.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="bg-orange-100 p-3 rounded-full mr-4">
                    <Calendar className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Dreams</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dreams.filter(dream => dream.status === 'active').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dreams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dreams.map((dream) => (
                <DreamCard
                  key={dream.id}
                  dream={dream}
                  isHighlighted={dream.id === highlightedDreamId}
                  onSelect={() => setSelectedDream(dream)}
                  formatCurrency={formatCurrency}
                  getDaysRemaining={getDaysRemaining}
                  getCategoryColor={getCategoryColor}
                />
              ))}
            </div>
          </>
        )}

        {/* Dream Detail Modal */}
        {selectedDream && (
          <DreamDetailModal
            dream={selectedDream}
            onClose={() => setSelectedDream(null)}
            formatCurrency={formatCurrency}
            getDaysRemaining={getDaysRemaining}
            getCategoryColor={getCategoryColor}
          />
        )}
      </div>
    </div>
  )
}

/**
 * Individual Dream Card Component
 */
const DreamCard = ({ dream, isHighlighted, onSelect, formatCurrency, getDaysRemaining, getCategoryColor }) => {
  const categoryColor = getCategoryColor(dream.category)
  const daysRemaining = getDaysRemaining(dream.target_date)
  const progress = dream.progress || 0

  return (
    <div
      className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${
        isHighlighted ? 'ring-2 ring-blue-500 ring-opacity-50 shadow-lg' : ''
      }`}
      onClick={onSelect}
    >
      {/* Dream Header */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{dream.title}</h3>
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full bg-${categoryColor}-100 text-${categoryColor}-700`}>
              {dream.category.charAt(0).toUpperCase() + dream.category.slice(1)}
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Target</p>
            <p className="font-bold text-gray-900">{formatCurrency(dream.target_amount)}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <ProgressBar
            percentage={progress}
            label="Progress"
            showPercentage={true}
            animationDuration={1200}
          />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-lg font-bold text-blue-600">
              ${((dream.target_amount * (1 - progress / 100)) / Math.max(daysRemaining, 1)).toFixed(2)}
            </p>
            <p className="text-xs text-blue-700">per day needed</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-lg font-bold text-green-600">{daysRemaining}</p>
            <p className="text-xs text-green-700">days left</p>
          </div>
        </div>

        {/* Target Date */}
        <div className="text-sm text-gray-500">
          <p>Target: {format(new Date(dream.target_date), 'MMM dd, yyyy')}</p>
        </div>

        {/* New Dream Indicator */}
        {isHighlighted && (
          <div className="mt-3 text-center">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              ✨ Just Created!
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Dream Detail Modal Component
 */
const DreamDetailModal = ({ dream, onClose, formatCurrency, getDaysRemaining, getCategoryColor }) => {
  const categoryColor = getCategoryColor(dream.category)
  const daysRemaining = getDaysRemaining(dream.target_date)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{dream.title}</h2>
              <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full bg-${categoryColor}-100 text-${categoryColor}-700`}>
                {dream.category.charAt(0).toUpperCase() + dream.category.slice(1)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Description */}
          {dream.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{dream.description}</p>
            </div>
          )}

          {/* Progress */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Progress</h3>
            <ProgressBar
              percentage={dream.progress || 0}
              label="Overall Progress"
              showPercentage={true}
              animationDuration={1500}
            />
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Target Amount</h4>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(dream.target_amount)}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Target Date</h4>
              <p className="text-lg text-gray-700">{format(new Date(dream.target_date), 'MMMM dd, yyyy')}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Days Remaining</h4>
              <p className="text-lg text-gray-700">{daysRemaining} days</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Created</h4>
              <p className="text-lg text-gray-700">{format(new Date(dream.createdAt), 'MMM dd, yyyy')}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button className="btn-primary flex-1">
              Update Progress
            </button>
            <button className="btn-secondary flex-1">
              Edit Dream
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
