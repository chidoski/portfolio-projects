import React from 'react'
import { format, differenceInDays } from 'date-fns'
import ProgressBar from './ProgressBar'

/**
 * SavingsBreakdown Component
 * Displays a detailed breakdown of savings requirements with progress visualizations
 */
const SavingsBreakdown = ({ amount, targetDate, strategy }) => {
  // Calculate days to goal
  const today = new Date()
  const target = new Date(targetDate)
  const totalDays = Math.max(0, differenceInDays(target, today))

  // Format currency helper
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  // Format large numbers for display
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  // Get strategy color scheme
  const getStrategyColors = (strategyType) => {
    switch (strategyType) {
      case 'aggressive':
        return {
          primary: 'bg-red-500',
          secondary: 'bg-red-100',
          text: 'text-red-700',
          border: 'border-red-200'
        }
      case 'balanced':
        return {
          primary: 'bg-blue-500',
          secondary: 'bg-blue-100',
          text: 'text-blue-700',
          border: 'border-blue-200'
        }
      case 'relaxed':
        return {
          primary: 'bg-green-500',
          secondary: 'bg-green-100',
          text: 'text-green-700',
          border: 'border-green-200'
        }
      default:
        return {
          primary: 'bg-gray-500',
          secondary: 'bg-gray-100',
          text: 'text-gray-700',
          border: 'border-gray-200'
        }
    }
  }

  const colors = getStrategyColors(strategy?.name?.toLowerCase())

  // Calculate savings amounts from strategy data
  const dailyAmount = strategy?.dailyAmount || 0
  const weeklyAmount = strategy?.weeklyAmount || 0
  const monthlyAmount = strategy?.monthlyAmount || 0

  // Progress bar data (for now showing empty bars, but structured for future progress tracking)
  const progressData = [
    {
      label: 'Daily savings required',
      amount: dailyAmount,
      progress: 0, // Will be populated with actual progress later
      maxValue: dailyAmount,
      frequency: 'per day'
    },
    {
      label: 'Weekly savings required',
      amount: weeklyAmount,
      progress: 0,
      maxValue: weeklyAmount,
      frequency: 'per week'
    },
    {
      label: 'Monthly savings required',
      amount: monthlyAmount,
      progress: 0,
      maxValue: monthlyAmount,
      frequency: 'per month'
    },
    {
      label: 'Total days to goal',
      amount: totalDays,
      progress: 0,
      maxValue: totalDays,
      frequency: 'days remaining',
      isNumeric: true
    }
  ]

  return (
    <div className={`bg-white rounded-lg shadow-lg border-2 ${colors.border} overflow-hidden`}>
      {/* Header */}
      <div className={`${colors.secondary} px-6 py-4 border-b ${colors.border}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {strategy?.name || 'Savings'} Strategy Breakdown
            </h3>
            <p className="text-sm text-gray-600">
              Target: {formatCurrency(amount)} by {format(target, 'MMM dd, yyyy')}
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${colors.secondary} ${colors.text}`}>
            {strategy?.intensity || 'medium'} intensity
          </div>
        </div>
      </div>

      {/* Breakdown Rows */}
      <div className="p-6 space-y-6">
        {progressData.map((item, index) => (
          <div key={index} className="space-y-3">
            {/* Row Header */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  {item.label}
                </h4>
                <p className="text-xs text-gray-500 capitalize">
                  {item.frequency}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  {item.isNumeric ? formatNumber(item.amount) : formatCurrency(item.amount)}
                </p>
                {!item.isNumeric && (
                  <p className="text-xs text-gray-500">
                    {item.frequency}
                  </p>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <ProgressBar
                percentage={item.progress}
                label=""
                showPercentage={false}
                height="h-3"
                backgroundColor="bg-gray-200"
                fillColor={colors.primary}
                animationDuration={800}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>
                  {item.isNumeric ? '0' : formatCurrency(0)} saved
                </span>
                <span>
                  Goal: {item.isNumeric ? formatNumber(item.maxValue) : formatCurrency(item.maxValue)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer with additional info */}
      <div className={`${colors.secondary} px-6 py-4 border-t ${colors.border}`}>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Strategy:</span>
            <span className={`ml-2 font-medium ${colors.text}`}>
              {strategy?.name || 'Standard'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Adjusted Target:</span>
            <span className="ml-2 font-medium text-gray-900">
              {strategy?.adjustedTargetDate ? 
                format(new Date(strategy.adjustedTargetDate), 'MMM dd, yyyy') : 
                format(target, 'MMM dd, yyyy')
              }
            </span>
          </div>
        </div>
        
        {strategy?.description && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {strategy.description}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SavingsBreakdown
