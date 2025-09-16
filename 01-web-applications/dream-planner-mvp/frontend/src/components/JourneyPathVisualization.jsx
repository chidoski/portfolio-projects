import React, { useState, useEffect } from 'react'
import { Home, Car, Heart, GraduationCap, MapPin, Clock, DollarSign, Star, Target } from 'lucide-react'

/**
 * JourneyPathVisualization Component
 * Horizontal path visualization showing a road from current age to retirement
 * Replaces the Life Journey Timeline with a more immersive journey representation
 */
const JourneyPathVisualization = ({ 
  dreams = [], 
  userAge = 28, 
  retirementAge = 65, 
  somedayLifeAge = 52,
  timeHorizonType = 'growth' // 'growth', 'optimization', 'validation'
}) => {
  const [hoveredMilestone, setHoveredMilestone] = useState(null)
  const [animationStarted, setAnimationStarted] = useState(false)
  
  // Calculate timeline parameters
  const totalJourneyYears = retirementAge - userAge
  const somedayLifePosition = ((somedayLifeAge - userAge) / totalJourneyYears) * 100
  const currentYear = new Date().getFullYear()
  
  // Animation effect
  useEffect(() => {
    const timer = setTimeout(() => setAnimationStarted(true), 500)
    return () => clearTimeout(timer)
  }, [])
  
  // Process dreams into milestones
  const milestones = dreams.map(dream => {
    const targetDate = new Date(dream.target_date)
    const yearsFromNow = targetDate.getFullYear() - currentYear
    const ageAtTarget = userAge + yearsFromNow
    
    // Calculate impact on retirement timeline
    const retirementImpact = calculateRetirementImpact(dream, userAge, retirementAge)
    
    return {
      id: dream.id,
      title: dream.title,
      age: ageAtTarget,
      year: targetDate.getFullYear(),
      amount: dream.target_amount,
      category: dream.category,
      progress: dream.progress || 0,
      retirementImpact,
      position: Math.min(((ageAtTarget - userAge) / totalJourneyYears) * 100, 100),
      status: dream.progress >= 100 ? 'completed' : dream.progress > 0 ? 'in_progress' : 'upcoming'
    }
  }).filter(milestone => milestone.age <= retirementAge && milestone.age >= userAge)
  
  // Sort milestones by age
  milestones.sort((a, b) => a.age - b.age)
  
  // Get category icon
  const getCategoryIcon = (category) => {
    const icons = {
      home: Home,
      travel: MapPin,
      education: GraduationCap,
      family: Heart,
      lifestyle: Car,
      freedom: MapPin
    }
    return icons[category] || Target
  }
  
  // Get milestone visual treatment based on status
  const getMilestoneStyle = (status, progress) => {
    switch (status) {
      case 'completed':
        return {
          bgColor: 'bg-green-500',
          borderColor: 'border-green-600',
          iconColor: 'text-white',
          pulseColor: 'shadow-green-400'
        }
      case 'in_progress':
        return {
          bgColor: 'bg-blue-500',
          borderColor: 'border-blue-600',
          iconColor: 'text-white',
          pulseColor: 'shadow-blue-400'
        }
      default:
        return {
          bgColor: 'bg-white',
          borderColor: 'border-gray-300',
          iconColor: 'text-gray-600',
          pulseColor: 'shadow-gray-400'
        }
    }
  }
  
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
  
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Life Journey Path</h2>
        <p className="text-gray-600">
          From age {userAge} to retirement at {retirementAge} — every milestone shapes your financial destiny
        </p>
      </div>
      
      {/* Path Visualization Container */}
      <div className="relative mb-8">
        {/* Background path/road */}
        <div className="relative h-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full shadow-inner">
          {/* Road markings */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-white opacity-50 transform -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-yellow-300 transform -translate-y-1/2"></div>
          
          {/* Progress overlay showing journey progression */}
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 via-green-400 to-yellow-400 rounded-full opacity-30 transition-all duration-3000 ease-out"
            style={{ 
              width: animationStarted ? '100%' : '0%' 
            }}
          ></div>
        </div>
        
        {/* Age labels at start and end */}
        <div className="flex justify-between items-center mt-4 mb-6">
          <div className="text-center">
            <div className="bg-blue-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
              Today - Age {userAge}
            </div>
            <div className="text-xs text-gray-500 mt-1">{currentYear}</div>
          </div>
          <div className="text-center">
            <div className="bg-purple-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
              Retirement - Age {retirementAge}
            </div>
            <div className="text-xs text-gray-500 mt-1">{currentYear + totalJourneyYears}</div>
          </div>
        </div>
        
        {/* Current position marker */}
        <div className="absolute -top-4 left-0 transform -translate-x-1/2">
          <div className="w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
        </div>
        
        {/* Someday Life marker (if different from retirement) */}
        {somedayLifeAge !== retirementAge && (
          <div 
            className="absolute -top-4 transform -translate-x-1/2"
            style={{ left: `${somedayLifePosition}%` }}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-center min-w-max">
              <div className="text-xs font-medium text-yellow-600">Someday Life</div>
              <div className="text-xs text-gray-500">Age {somedayLifeAge}</div>
            </div>
          </div>
        )}
        
        {/* Retirement destination marker */}
        <div className="absolute -top-4 right-0 transform translate-x-1/2">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
            <Home className="w-6 h-6 text-white" />
          </div>
        </div>
        
        {/* Milestone markers along the path */}
        {milestones.map((milestone) => {
          const Icon = getCategoryIcon(milestone.category)
          const style = getMilestoneStyle(milestone.status, milestone.progress)
          
          return (
            <div
              key={milestone.id}
              className="absolute -top-2 transform -translate-x-1/2 cursor-pointer group"
              style={{ left: `${milestone.position}%` }}
              onMouseEnter={() => setHoveredMilestone(milestone)}
              onMouseLeave={() => setHoveredMilestone(null)}
            >
              <div className={`
                w-6 h-6 rounded-full border-2 shadow-lg flex items-center justify-center 
                transition-all duration-300 hover:scale-125 hover:shadow-xl
                ${style.bgColor} ${style.borderColor} ${style.iconColor}
                ${animationStarted ? 'animate-pulse' : ''}
              `}>
                <Icon className="w-3 h-3" />
              </div>
              
              {/* Milestone label */}
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center min-w-max opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="bg-white rounded-lg p-2 shadow-lg border border-gray-200">
                  <div className="text-xs font-medium text-gray-900">{milestone.title}</div>
                  <div className="text-xs text-gray-500">Age {milestone.age}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Milestone Hover Details */}
      {hoveredMilestone && (
        <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-gray-900 text-lg">{hoveredMilestone.title}</h4>
              <div className="space-y-2 mt-3">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Target:</span> Age {hoveredMilestone.age} ({hoveredMilestone.year})
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Amount:</span> {formatCurrency(hoveredMilestone.amount)}
                </p>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${hoveredMilestone.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{hoveredMilestone.progress}% complete</span>
                </div>
              </div>
            </div>
            <div className="text-center md:text-right">
              <div className="bg-white rounded-xl p-4 border border-orange-200">
                <div className="text-sm text-orange-600 font-medium mb-1">
                  Retirement Impact
                </div>
                <div className="text-2xl font-bold text-orange-700">
                  {hoveredMilestone.retirementImpact.months > 0 ? '+' : ''}{hoveredMilestone.retirementImpact.months} months
                </div>
                <div className="text-xs text-orange-600 mb-2">
                  to retirement timeline
                </div>
                <div className="text-xs text-gray-600">
                  {hoveredMilestone.retirementImpact.explanation}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 border border-green-600 rounded-full mr-2"></div>
          <span className="text-gray-600">Completed Milestones</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-500 border border-blue-600 rounded-full mr-2"></div>
          <span className="text-gray-600">In Progress</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-white border border-gray-300 rounded-full mr-2"></div>
          <span className="text-gray-600">Planned</span>
        </div>
        <div className="flex items-center">
          <div className="w-5 h-5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full mr-2 flex items-center justify-center">
            <Star className="w-2.5 h-2.5 text-white" />
          </div>
          <span className="text-gray-600">Someday Life</span>
        </div>
        <div className="flex items-center">
          <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full mr-2 flex items-center justify-center">
            <Home className="w-2.5 h-2.5 text-white" />
          </div>
          <span className="text-gray-600">Retirement</span>
        </div>
      </div>
      
      {/* Journey Summary Stats */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{totalJourneyYears}</div>
            <div className="text-sm text-gray-600">Years to Retirement</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{milestones.length}</div>
            <div className="text-sm text-gray-600">Life Milestones</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {milestones.filter(m => m.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Achieved</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {somedayLifeAge - userAge}
            </div>
            <div className="text-sm text-gray-600">Years to Someday Life</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Calculate the impact of achieving a dream on retirement timeline
 */
function calculateRetirementImpact(dream, userAge, retirementAge) {
  // Simplified calculation - in reality this would be more complex
  const dreamValue = dream.target_amount
  const yearsToRetirement = retirementAge - userAge
  
  // Assume achieving this dream either accelerates or delays retirement
  // based on whether it's an investment or expense
  const isInvestmentDream = ['education', 'home'].includes(dream.category)
  
  if (isInvestmentDream) {
    // Investment dreams can accelerate retirement
    const monthsAccelerated = Math.min(Math.floor(dreamValue / 10000), 24) // Max 2 years acceleration
    return {
      months: -monthsAccelerated,
      explanation: `This investment could accelerate your retirement by reducing future expenses or increasing income.`
    }
  } else {
    // Lifestyle dreams might delay retirement slightly
    const monthsDelayed = Math.min(Math.floor(dreamValue / 25000), 12) // Max 1 year delay
    return {
      months: monthsDelayed,
      explanation: `This lifestyle investment requires additional savings but enhances your journey quality.`
    }
  }
}

export default JourneyPathVisualization
