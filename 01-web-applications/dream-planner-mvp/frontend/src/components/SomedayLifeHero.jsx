import React, { useState, useEffect } from 'react'
import { Home, Trees, Mountain, Clock, DollarSign, Calendar, MapPin } from 'lucide-react'

/**
 * SomedayLifeHero Component
 * Hero section displaying the ultimate vision with dual progress rings
 * Shows both property cost and living expenses for sustainable lifestyle
 */
const SomedayLifeHero = ({ 
  userAge = 28, 
  targetAge = 52,
  propertyTarget = 450000,
  livingExpensesPerYear = 40000,
  yearsOfExpenses = 25,
  currentPropertySaved = 45000,
  currentExpensesSaved = 120000
}) => {
  
  const [animationStarted, setAnimationStarted] = useState(false)
  
  // Calculate totals and progress
  const totalLivingExpenses = livingExpensesPerYear * yearsOfExpenses
  const totalSomedayLifeCost = propertyTarget + totalLivingExpenses
  const totalCurrentSaved = currentPropertySaved + currentExpensesSaved
  
  const propertyProgress = (currentPropertySaved / propertyTarget) * 100
  const expensesProgress = (currentExpensesSaved / totalLivingExpenses) * 100
  const overallProgress = (totalCurrentSaved / totalSomedayLifeCost) * 100
  
  const yearsRemaining = targetAge - userAge
  const currentYear = new Date().getFullYear()
  const targetYear = currentYear + yearsRemaining
  
  // Animation effect
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
  
  // Progress ring component
  const ProgressRing = ({ progress, size = 120, strokeWidth = 8, color = "#0B7A75", label, value, target }) => {
    const normalizedRadius = (size - strokeWidth) / 2
    const circumference = normalizedRadius * 2 * Math.PI
    const strokeDasharray = `${circumference} ${circumference}`
    const strokeDashoffset = animationStarted ? circumference - (progress / 100) * circumference : circumference
    
    return (
      <div className="relative flex flex-col items-center">
        <div className="relative">
          <svg height={size} width={size} className="transform -rotate-90">
            {/* Background circle */}
            <circle
              stroke="#E5E7EB"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={normalizedRadius}
              cx={size / 2}
              cy={size / 2}
            />
            {/* Progress circle */}
            <circle
              stroke={color}
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={size / 2}
              cy={size / 2}
              style={{
                transition: 'stroke-dashoffset 2s ease-in-out'
              }}
            />
          </svg>
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-lg font-bold text-gray-900">{progress.toFixed(0)}%</div>
            <div className="text-xs text-gray-600">complete</div>
          </div>
        </div>
        <div className="mt-3 text-center">
          <div className="text-sm font-medium text-gray-900">{label}</div>
          <div className="text-xs text-gray-600">{formatCurrency(value)} of {formatCurrency(target)}</div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 rounded-3xl p-8 shadow-lg border border-green-100">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-full shadow-lg">
            <Home className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Someday Life</h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          Maine Cottage Lifestyle — Complete financial freedom at age {targetAge}
        </p>
      </div>
      
      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8 items-center">
        
        {/* Left: Property Progress */}
        <div className="text-center">
          <ProgressRing
            progress={propertyProgress}
            color="#059669"
            label="Property Cost"
            value={currentPropertySaved}
            target={propertyTarget}
          />
        </div>
        
        {/* Center: Vision & Timeline */}
        <div className="text-center">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
            {/* Lifestyle Image Placeholder */}
            <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-xl p-8 mb-6 flex flex-col items-center justify-center min-h-[160px]">
              <div className="flex space-x-4 mb-4">
                <Trees className="w-8 h-8 text-green-600" />
                <Mountain className="w-8 h-8 text-blue-600" />
                <MapPin className="w-8 h-8 text-green-700" />
              </div>
              <div className="text-sm font-medium text-gray-700 text-center">
                Peaceful cottage by the lake<br />
                Morning coffee on the porch<br />
                Complete work flexibility
              </div>
            </div>
            
            {/* Timeline Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2 text-lg font-bold text-gray-900">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span>Achievable at Age {targetAge}</span>
              </div>
              <div className="text-sm text-gray-600">
                Target Year: {targetYear} ({yearsRemaining} years away)
              </div>
              <div className="bg-yellow-100 rounded-lg p-3 border border-yellow-200">
                <div className="text-sm font-medium text-yellow-800">
                  Overall Progress: {overallProgress.toFixed(1)}%
                </div>
                <div className="w-full bg-yellow-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full transition-all duration-2000 ease-out"
                    style={{ 
                      width: animationStarted ? `${overallProgress}%` : '0%' 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right: Living Expenses Progress */}
        <div className="text-center">
          <ProgressRing
            progress={expensesProgress}
            color="#0B7A75"
            label="Living Fund"
            value={currentExpensesSaved}
            target={totalLivingExpenses}
          />
          <div className="mt-3 text-xs text-gray-600">
            {yearsOfExpenses} years × {formatCurrency(livingExpensesPerYear)}/year
          </div>
        </div>
      </div>
      
      {/* Bottom Stats */}
      <div className="mt-8 pt-6 border-t border-green-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(propertyTarget)}</div>
            <div className="text-sm text-gray-600">Property Cost</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalLivingExpenses)}</div>
            <div className="text-sm text-gray-600">Living Fund</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalSomedayLifeCost)}</div>
            <div className="text-sm text-gray-600">Total Target</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalCurrentSaved)}</div>
            <div className="text-sm text-gray-600">Current Saved</div>
          </div>
        </div>
      </div>
      
      {/* Key Insight */}
      <div className="mt-6 bg-blue-100 rounded-xl p-4 border border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="bg-blue-500 rounded-full p-2 mt-1">
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-medium text-blue-900 mb-1">
              Complete Lifestyle, Not Just Retirement
            </div>
            <div className="text-sm text-blue-800">
              This isn't just buying property — it's funding {yearsOfExpenses} years of your ideal lifestyle 
              with {formatCurrency(livingExpensesPerYear)} annual living expenses. 
              True financial freedom means never having to work again.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SomedayLifeHero
