import React, { useState, useEffect } from 'react'
import { Home, Car, Heart, GraduationCap, MapPin, Clock, DollarSign } from 'lucide-react'

/**
 * LifeJourneyTimeline Component
 * Visualizes the complete financial journey from current age to Someday Life achievement
 * Shows life milestones as pins along a horizontal timeline with impact calculations
 */
const LifeJourneyTimeline = ({ dreams = [], userAge = 28, somedayLifeAge = 52 }) => {
  const [hoveredMilestone, setHoveredMilestone] = useState(null)
  
  // Calculate timeline parameters
  const timelineYears = somedayLifeAge - userAge
  const currentYear = new Date().getFullYear()
  
  // Process dreams into milestones
  const milestones = dreams.map(dream => {
    const targetDate = new Date(dream.target_date)
    const yearsFromNow = targetDate.getFullYear() - currentYear
    const ageAtTarget = userAge + yearsFromNow
    
    // Calculate impact on Someday Life timeline (simplified calculation)
    const timelineImpact = Math.round((dream.target_amount / 50000) * 6) // 6 months per $50k
    
    return {
      id: dream.id,
      title: dream.title,
      age: ageAtTarget,
      year: targetDate.getFullYear(),
      amount: dream.target_amount,
      category: dream.category,
      progress: dream.progress || 0,
      timelineImpact,
      position: ((ageAtTarget - userAge) / timelineYears) * 100,
      status: dream.progress >= 100 ? 'achieved' : 'upcoming'
    }
  }).filter(milestone => milestone.age <= somedayLifeAge && milestone.age >= userAge)
  
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
    return icons[category] || Home
  }
  
  // Get milestone color based on status
  const getMilestoneColor = (status, progress) => {
    if (status === 'achieved') return 'text-green-600 bg-green-100 border-green-300'
    if (progress > 0) return 'text-blue-600 bg-blue-100 border-blue-300'
    return 'text-gray-600 bg-gray-100 border-gray-300'
  }
  
  // Format currency
  const formatCurrency = (amount) => {
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Life Journey Timeline</h2>
        <p className="text-gray-600">
          From age {userAge} to your Someday Life at {somedayLifeAge} — every milestone brings you closer to freedom
        </p>
      </div>
      
      {/* Timeline Container */}
      <div className="relative">
        {/* Age Labels */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600">Today</div>
            <div className="text-lg font-bold text-gray-900">Age {userAge}</div>
            <div className="text-xs text-gray-500">{currentYear}</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-yellow-600">Someday Life</div>
            <div className="text-lg font-bold text-yellow-700">Age {somedayLifeAge}</div>
            <div className="text-xs text-yellow-600">{currentYear + timelineYears}</div>
          </div>
        </div>
        
        {/* Main Timeline Bar */}
        <div className="relative h-2 bg-gradient-to-r from-gray-200 via-blue-200 to-yellow-300 rounded-full mb-8">
          {/* Current Position Marker */}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2">
            <div className="w-4 h-4 bg-gray-600 rounded-full border-2 border-white shadow-md"></div>
          </div>
          
          {/* Someday Life Marker */}
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2">
            <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
              <Home className="w-3 h-3 text-white" />
            </div>
          </div>
          
          {/* Milestone Markers */}
          {milestones.map((milestone) => {
            const Icon = getCategoryIcon(milestone.category)
            const colorClass = getMilestoneColor(milestone.status, milestone.progress)
            
            return (
              <div
                key={milestone.id}
                className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 cursor-pointer"
                style={{ left: `${milestone.position}%` }}
                onMouseEnter={() => setHoveredMilestone(milestone)}
                onMouseLeave={() => setHoveredMilestone(null)}
              >
                <div className={`w-5 h-5 rounded-full border-2 shadow-md flex items-center justify-center transition-all duration-200 hover:scale-110 ${colorClass}`}>
                  <Icon className="w-2.5 h-2.5" />
                </div>
                
                {/* Milestone Label */}
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center min-w-max">
                  <div className="text-xs font-medium text-gray-900">{milestone.title}</div>
                  <div className="text-xs text-gray-500">Age {milestone.age}</div>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Milestone Hover Details */}
        {hoveredMilestone && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">{hoveredMilestone.title}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Target: Age {hoveredMilestone.age} ({hoveredMilestone.year})
                </p>
                <p className="text-sm text-gray-600">
                  Amount: {formatCurrency(hoveredMilestone.amount)}
                </p>
                <div className="mt-2">
                  <div className="flex items-center text-sm">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${hoveredMilestone.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-gray-600">{hoveredMilestone.progress}% complete</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-orange-600 font-medium">
                  Timeline Impact
                </div>
                <div className="text-lg font-bold text-orange-700">
                  +{hoveredMilestone.timelineImpact} months
                </div>
                <div className="text-xs text-orange-600">
                  to Someday Life
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Legend */}
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded-full mr-2"></div>
            <span className="text-gray-600">Achieved</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded-full mr-2"></div>
            <span className="text-gray-600">In Progress</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded-full mr-2"></div>
            <span className="text-gray-600">Planned</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full mr-2"></div>
            <span className="text-gray-600">Someday Life</span>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{milestones.length}</div>
              <div className="text-sm text-gray-600">Milestones</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {milestones.filter(m => m.progress > 0).length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {milestones.filter(m => m.status === 'achieved').length}
              </div>
              <div className="text-sm text-gray-600">Achieved</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LifeJourneyTimeline
