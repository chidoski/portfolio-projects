import React, { useState } from 'react'
import { format } from 'date-fns'
import { CheckCircle, Target, Calendar } from 'lucide-react'
// @ts-ignore - localStorage.js doesn't have TypeScript declarations
import { updateDream } from '../services/localStorage'

/**
 * DreamCard Component
 * Displays an individual dream with progress tracking and daily completion functionality
 */
const DreamCard = ({ dream, onUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Calculate progress and amounts
  const currentSaved = dream.currentSaved || 0
  const targetAmount = dream.target_amount
  const progressPercentage = Math.min(100, (currentSaved / targetAmount) * 100)
  const remainingAmount = Math.max(0, targetAmount - currentSaved)

  // Calculate daily savings needed
  const today = new Date()
  const targetDate = new Date(dream.target_date)
  const daysRemaining = Math.max(1, Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24)))
  const dailySavingsTarget = remainingAmount / daysRemaining

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Format currency with cents for smaller amounts
  const formatCurrencyDetailed = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
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

  // Handle marking today complete
  const handleMarkComplete = async () => {
    if (isUpdating) return

    setIsUpdating(true)

    try {
      // Add today's daily amount to current saved
      const newSavedAmount = currentSaved + dailySavingsTarget
      const newProgress = Math.min(100, (newSavedAmount / targetAmount) * 100)

      // Update dream in localStorage
      const result = updateDream(dream.id, {
        currentSaved: newSavedAmount,
        progress: newProgress,
        lastUpdated: new Date().toISOString(),
        // Track completion dates
        completionDates: [
          ...(dream.completionDates || []),
          format(today, 'yyyy-MM-dd')
        ]
      })

      if (result.success) {
        // Show success animation
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 2000)

        // Notify parent component of update
        if (onUpdate) {
          onUpdate(result.dream)
        }
      } else {
        console.error('Failed to update dream:', result.error)
        alert('Failed to update progress. Please try again.')
      }
    } catch (error) {
      console.error('Error updating dream:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  // Check if today is already marked complete
  const todayString = format(today, 'yyyy-MM-dd')
  const isTodayComplete = dream.completionDates?.includes(todayString) || false

  const categoryColor = getCategoryColor(dream.category)

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 relative overflow-hidden">
      {/* Success Animation Overlay */}
      {showSuccess && (
        <div className="absolute inset-0 bg-green-500 bg-opacity-90 flex items-center justify-center z-10 rounded-xl">
          <div className="text-center text-white">
            <CheckCircle className="w-12 h-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Great job!</p>
            <p className="text-sm">Today's progress saved</p>
          </div>
        </div>
      )}

      {/* Dream Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900 flex-1 pr-4">{dream.title}</h3>
          <span className={`px-3 py-1 text-xs font-medium rounded-full bg-${categoryColor}-100 text-${categoryColor}-700 whitespace-nowrap`}>
            {dream.category.charAt(0).toUpperCase() + dream.category.slice(1)}
          </span>
        </div>
        {dream.description && (
          <p className="text-gray-600 text-sm line-clamp-2">{dream.description}</p>
        )}
      </div>

      {/* Circular Progress Ring */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-32">
          {/* Background circle */}
          <div className="w-full h-full rounded-full border-8 border-gray-200"></div>
          
          {/* Progress circle */}
          <div 
            className="absolute inset-0 w-full h-full rounded-full border-8 border-transparent transition-all duration-1000 ease-out"
            style={{
              background: `conic-gradient(from 0deg, #3b82f6 0deg, #3b82f6 ${progressPercentage * 3.6}deg, transparent ${progressPercentage * 3.6}deg)`,
              borderRadius: '50%',
              mask: 'radial-gradient(circle, transparent 50%, black 50%)',
              WebkitMask: 'radial-gradient(circle, transparent 50%, black 50%)'
            }}
          ></div>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-900">
              {progressPercentage.toFixed(0)}%
            </span>
            <span className="text-xs text-gray-500 mt-1">Complete</span>
          </div>
        </div>
      </div>

      {/* Amount Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-medium text-gray-900">
            {formatCurrency(currentSaved)} / {formatCurrency(targetAmount)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>Started: {format(new Date(dream.createdAt), 'MMM dd')}</span>
          <span>Target: {format(new Date(dream.target_date), 'MMM dd, yyyy')}</span>
        </div>
      </div>

      {/* Daily Savings Target */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Target className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-900">Daily Target</span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrencyDetailed(dailySavingsTarget)}
            </div>
            <div className="text-xs text-blue-700">per day</div>
          </div>
        </div>
        
        {daysRemaining > 0 && (
          <div className="flex items-center mt-2 text-xs text-blue-700">
            <Calendar className="w-3 h-3 mr-1" />
            <span>{daysRemaining} days remaining</span>
          </div>
        )}
      </div>

      {/* Mark Today Complete Button */}
      <div className="space-y-3">
        {progressPercentage >= 100 ? (
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-green-800 font-semibold">Dream Achieved! 🎉</p>
            <p className="text-green-600 text-sm">Congratulations on reaching your goal!</p>
          </div>
        ) : isTodayComplete ? (
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-green-800 font-medium">Today's Progress Complete!</p>
            <p className="text-green-600 text-sm">Great job staying on track</p>
          </div>
        ) : (
          <button
            onClick={handleMarkComplete}
            disabled={isUpdating}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
              isUpdating
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md active:transform active:scale-95'
            }`}
          >
            {isUpdating ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Mark Today Complete (+{formatCurrencyDetailed(dailySavingsTarget)})
              </div>
            )}
          </button>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">{formatCurrency(remainingAmount)}</div>
            <div className="text-xs text-gray-600">Remaining</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">
              {dream.completionDates?.length || 0}
            </div>
            <div className="text-xs text-gray-600">Days Completed</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DreamCard
