import React, { useState } from 'react'
import { Car, Heart, GraduationCap, Home, MapPin, Clock, AlertTriangle, CheckCircle, Circle } from 'lucide-react'

/**
 * LifeMilestonesTimeline Component
 * Shows upcoming life goals as connected waypoints leading to the Someday Life
 * Displays the impact each milestone has on the ultimate timeline
 */
const LifeMilestonesTimeline = ({ dreams = [], somedayLifeAge = 52 }) => {
  const [selectedMilestone, setSelectedMilestone] = useState(null)
  
  // Process dreams into milestones with timeline impact calculations
  const milestones = dreams.map(dream => {
    const targetDate = new Date(dream.target_date)
    const currentYear = new Date().getFullYear()
    const yearsFromNow = targetDate.getFullYear() - currentYear
    
    // Calculate timeline impact (simplified: $50k = 6 months delay)
    const impactMonths = Math.round((dream.target_amount / 50000) * 6)
    const impactText = impactMonths > 12 
      ? `${Math.round(impactMonths / 12)} year${Math.round(impactMonths / 12) > 1 ? 's' : ''}`
      : `${impactMonths} month${impactMonths !== 1 ? 's' : ''}`
    
    return {
      id: dream.id,
      title: dream.title,
      category: dream.category,
      targetYear: targetDate.getFullYear(),
      targetAge: 28 + yearsFromNow, // Assuming current age is 28
      amount: dream.target_amount,
      progress: dream.progress || 0,
      impactMonths,
      impactText,
      yearsFromNow,
      status: dream.progress >= 100 ? 'completed' : dream.progress > 0 ? 'in-progress' : 'planned'
    }
  }).filter(milestone => milestone.yearsFromNow >= 0)
  
  // Sort by target year
  milestones.sort((a, b) => a.targetYear - b.targetYear)
  
  // Get category icon and color
  const getCategoryDetails = (category) => {
    const details = {
      home: { icon: Home, color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-700', borderColor: 'border-green-300' },
      travel: { icon: MapPin, color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-700', borderColor: 'border-blue-300' },
      education: { icon: GraduationCap, color: 'purple', bgColor: 'bg-purple-100', textColor: 'text-purple-700', borderColor: 'border-purple-300' },
      family: { icon: Heart, color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-700', borderColor: 'border-red-300' },
      lifestyle: { icon: Car, color: 'indigo', bgColor: 'bg-indigo-100', textColor: 'text-indigo-700', borderColor: 'border-indigo-300' },
      freedom: { icon: MapPin, color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', borderColor: 'border-yellow-300' }
    }
    return details[category] || details.lifestyle
  }
  
  // Get status icon and color
  const getStatusDetails = (status, progress) => {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' }
      case 'in-progress':
        return { icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-100' }
      default:
        return { icon: Circle, color: 'text-gray-500', bgColor: 'bg-gray-100' }
    }
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
  
  // Calculate total timeline impact
  const totalImpactMonths = milestones.reduce((sum, milestone) => sum + milestone.impactMonths, 0)
  const totalImpactText = totalImpactMonths > 12 
    ? `${Math.round(totalImpactMonths / 12)} year${Math.round(totalImpactMonths / 12) > 1 ? 's' : ''}`
    : `${totalImpactMonths} month${totalImpactMonths !== 1 ? 's' : ''}`
  
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Life Milestones Along the Way</h2>
        <p className="text-gray-600">
          Your journey to the Someday Life includes these meaningful stops — each one shapes your path
        </p>
      </div>
      
      {milestones.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No milestones yet</h3>
          <p className="text-gray-600 mb-4">
            Add some dreams to see your journey unfold with connected milestones
          </p>
        </div>
      ) : (
        <>
          {/* Timeline Path */}
          <div className="relative">
            
            {/* Main timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-300 via-blue-300 to-yellow-400"></div>
            
            {/* Milestones */}
            <div className="space-y-8">
              {milestones.map((milestone, index) => {
                const categoryDetails = getCategoryDetails(milestone.category)
                const statusDetails = getStatusDetails(milestone.status, milestone.progress)
                const Icon = categoryDetails.icon
                const StatusIcon = statusDetails.icon
                
                return (
                  <div 
                    key={milestone.id}
                    className={`relative flex items-start cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                      selectedMilestone?.id === milestone.id ? 'bg-blue-50 rounded-lg p-4 -m-4' : ''
                    }`}
                    onClick={() => setSelectedMilestone(selectedMilestone?.id === milestone.id ? null : milestone)}
                  >
                    
                    {/* Timeline Node */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className={`w-16 h-16 rounded-full ${categoryDetails.bgColor} ${categoryDetails.borderColor} border-2 flex items-center justify-center shadow-sm`}>
                        <Icon className={`w-6 h-6 ${categoryDetails.textColor}`} />
                      </div>
                      
                      {/* Status indicator */}
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${statusDetails.bgColor} border-2 border-white flex items-center justify-center`}>
                        <StatusIcon className={`w-3 h-3 ${statusDetails.color}`} />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="ml-6 flex-1">
                      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{milestone.title}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>Age {milestone.targetAge}</span>
                              <span>•</span>
                              <span>{milestone.targetYear}</span>
                              <span>•</span>
                              <span>{formatCurrency(milestone.amount)}</span>
                            </div>
                          </div>
                          
                          {/* Timeline Impact */}
                          <div className="text-right">
                            <div className="text-sm text-orange-600 font-medium">Timeline Impact</div>
                            <div className="text-lg font-bold text-orange-700">+{milestone.impactText}</div>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium text-gray-900">{milestone.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-1000 bg-${categoryDetails.color}-500`}
                              style={{ width: `${milestone.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        {/* Impact Explanation */}
                        {selectedMilestone?.id === milestone.id && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                              <div className="flex items-start space-x-3">
                                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                                <div>
                                  <div className="font-medium text-orange-900 mb-1">
                                    How this affects your Someday Life timeline:
                                  </div>
                                  <div className="text-sm text-orange-800">
                                    Spending {formatCurrency(milestone.amount)} on this milestone adds approximately{' '}
                                    <span className="font-semibold">{milestone.impactText}</span> to reaching your Maine cottage lifestyle.
                                    This is money that could otherwise compound toward your {formatCurrency(1450000)} Someday Life goal.
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                      </div>
                    </div>
                  </div>
                )
              })}
              
              {/* Final Destination */}
              <div className="relative flex items-start">
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 border-2 border-yellow-300 flex items-center justify-center shadow-lg">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                <div className="ml-6 flex-1">
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6 border-2 border-yellow-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">🏡 Maine Cottage Lifestyle</h3>
                    <p className="text-gray-700 mb-3">
                      Your ultimate destination — complete financial freedom at age {somedayLifeAge}
                    </p>
                    <div className="text-sm text-yellow-700 bg-yellow-100 rounded-lg p-3">
                      <strong>With current milestones:</strong> Timeline extended by {totalImpactText} total
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
          
          {/* Summary Stats */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{milestones.length}</div>
                <div className="text-sm text-gray-600">Total Milestones</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {milestones.filter(m => m.status === 'in-progress').length}
                </div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {milestones.filter(m => m.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">+{totalImpactText}</div>
                <div className="text-sm text-gray-600">Total Impact</div>
              </div>
            </div>
          </div>
          
        </>
      )}
    </div>
  )
}

export default LifeMilestonesTimeline
