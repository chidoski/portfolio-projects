import React, { useState, useEffect } from 'react';
import { Heart, Shield, RotateCcw, ChevronRight, AlertCircle, TrendingDown, Calendar, DollarSign, MapPin } from 'lucide-react';
import { sarahProfile, sarahMilestones, sarahBucketStrategy } from '../data/demoSomedayLife.js';
import { FinancialProfile } from '../models/FinancialProfile.js';

/**
 * EmergencyMode Component
 * Activates when users report a life crisis, providing empathetic support
 * and three immediate options with gentle impact calculations
 */
const EmergencyMode = ({ userProfile = sarahProfile, onNavigateBack, onUpdateProfile }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [impactCalculations, setImpactCalculations] = useState(null);
  const [showRecoveryPlan, setShowRecoveryPlan] = useState(false);
  const [currentStep, setCurrentStep] = useState('crisis-acknowledgment');

  // Initialize with user's current financial profile or demo data
  const profile = userProfile || sarahProfile;
  const somedayDream = profile.northStarDream;
  const milestones = sarahMilestones; // Use demo milestones for calculations

  // Crisis response options
  const crisisOptions = [
    {
      id: 'pause-savings',
      title: 'Pause all savings temporarily',
      description: 'Stop all Dream bucket contributions while maintaining Foundation security',
      icon: Shield,
      severity: 'moderate',
      bucketImpact: {
        foundation: 0, // No change to Foundation
        dream: -100,   // Stop Dream contributions
        life: 0        // Keep Life bucket as-is
      }
    },
    {
      id: 'survival-minimums',
      title: 'Reduce to survival minimums',
      description: 'Cut all non-essential spending and reduce savings to absolute minimums',
      icon: AlertCircle,
      severity: 'high',
      bucketImpact: {
        foundation: -50, // Reduce Foundation by 50%
        dream: -80,      // Reduce Dream by 80%
        life: -60        // Reduce Life by 60%
      }
    },
    {
      id: 'reshape-entirely',
      title: 'Reshape the plan entirely',
      description: 'Completely redesign your financial strategy for a new reality',
      icon: RotateCcw,
      severity: 'major',
      bucketImpact: {
        foundation: -30, // Moderate reduction
        dream: -90,      // Major reduction
        life: -40        // Moderate reduction
      }
    }
  ];

  /**
   * Calculate the impact of a crisis option on the Someday Life timeline
   */
  const calculateImpact = (option) => {
    const currentAge = profile.userProfile.age;
    const targetAge = somedayDream.targetAge;
    const originalYearsToGoal = targetAge - currentAge;
    
    // Current monthly savings capacity
    const currentMonthlySavings = sarahBucketStrategy.monthlySavingsCapacity;
    
    // Calculate new allocation percentages
    const currentAllocation = sarahBucketStrategy.currentAllocation;
    const newAllocation = {
      foundation: Math.max(0, currentAllocation.foundation + option.bucketImpact.foundation),
      dream: Math.max(0, currentAllocation.dream + option.bucketImpact.dream),
      life: Math.max(0, currentAllocation.life + option.bucketImpact.life)
    };

    // Calculate new monthly amounts
    const newMonthlyAmounts = {
      foundation: (currentMonthlySavings * newAllocation.foundation) / 100,
      dream: (currentMonthlySavings * newAllocation.dream) / 100,
      life: (currentMonthlySavings * newAllocation.life) / 100
    };

    // Calculate delay to Someday Life
    const originalDreamContribution = (currentMonthlySavings * currentAllocation.dream) / 100;
    const newDreamContribution = newMonthlyAmounts.dream;
    
    // Simple calculation: if contributions are reduced, extend timeline proportionally
    let delayMonths = 0;
    if (newDreamContribution < originalDreamContribution && newDreamContribution > 0) {
      const contributionRatio = originalDreamContribution / newDreamContribution;
      delayMonths = Math.round((originalYearsToGoal * 12 * (contributionRatio - 1)));
    } else if (newDreamContribution === 0) {
      // If no dream contributions, calculate based on reduced timeline
      delayMonths = Math.round(originalYearsToGoal * 12 * 0.3); // Estimate 30% delay
    }

    // Find which milestones are affected
    const affectedMilestones = milestones.filter(milestone => {
      return milestone.fundingPlan.bucketSource === 'dream' || 
             milestone.fundingPlan.bucketSource === 'life';
    });

    return {
      delayMonths,
      delayYears: Math.round(delayMonths / 12 * 10) / 10, // Round to 1 decimal
      newTargetAge: targetAge + Math.round(delayMonths / 12),
      affectedMilestones,
      newAllocation,
      newMonthlyAmounts,
      foundationSecurity: newAllocation.foundation >= 40 ? 'secure' : 'at-risk',
      emergencyFundImpact: option.severity === 'high' ? 'may-need-use' : 'preserved'
    };
  };

  /**
   * Calculate recovery plan for getting back on track
   */
  const calculateRecoveryPlan = (selectedImpact, crisisMonths = 6) => {
    const currentAllocation = sarahBucketStrategy.currentAllocation;
    const monthlySavings = sarahBucketStrategy.monthlySavingsCapacity;
    
    // Calculate lost contributions during crisis
    const originalDreamMonthly = (monthlySavings * currentAllocation.dream) / 100;
    const crisisDreamMonthly = selectedImpact.newMonthlyAmounts.dream;
    const monthlyShortfall = originalDreamMonthly - crisisDreamMonthly;
    const totalLostContributions = monthlyShortfall * crisisMonths;

    // Recovery options
    const recoveryOptions = [
      {
        name: 'Gradual Recovery',
        timeframe: '24 months',
        additionalMonthly: totalLostContributions / 24,
        description: 'Spread the catch-up over 2 years with gentle increases'
      },
      {
        name: 'Accelerated Recovery',
        timeframe: '12 months',
        additionalMonthly: totalLostContributions / 12,
        description: 'More aggressive catch-up over 1 year'
      },
      {
        name: 'Extended Timeline',
        timeframe: 'Permanent adjustment',
        additionalMonthly: 0,
        description: 'Accept the new timeline and adjust expectations'
      }
    ];

    return {
      totalLostContributions,
      crisisMonths,
      recoveryOptions,
      foundationRebuild: selectedImpact.foundationSecurity === 'at-risk' ? {
        priority: 'high',
        timeframe: '6-12 months',
        monthlyAmount: monthlySavings * 0.3 // 30% focus on Foundation rebuild
      } : null
    };
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    const impact = calculateImpact(option);
    setImpactCalculations(impact);
    setCurrentStep('impact-review');
  };

  const handleConfirmChoice = () => {
    const recovery = calculateRecoveryPlan(impactCalculations);
    setShowRecoveryPlan(recovery);
    setCurrentStep('recovery-planning');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Crisis Acknowledgment Header */}
        <div className="text-center mb-8 pt-8">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Life just happened.
          </h1>
          <h2 className="text-xl md:text-2xl text-purple-700 font-medium">
            Let's figure this out together.
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            We know this is hard. Whatever brought you here – job loss, health crisis, family emergency – 
            you're not alone. Let's protect what matters most and create a path forward.
          </p>
        </div>

        {currentStep === 'crisis-acknowledgment' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-purple-500">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Your Current Someday Life Goal
              </h3>
              <div className="flex items-center space-x-4 mb-4">
                <MapPin className="w-5 h-5 text-purple-600" />
                <span className="text-gray-700">{somedayDream.title}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>Target: Age {somedayDream.targetAge}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span>Monthly Need: {formatCurrency(somedayDream.monthlyLivingExpenses)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingDown className="w-4 h-4 text-purple-500" />
                  <span>Progress: {somedayDream.currentProgress}%</span>
                </div>
              </div>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Choose your path forward
              </h3>
              <p className="text-gray-600">
                Each option protects your future differently. We'll show you exactly how this affects your Maine cottage dream.
              </p>
            </div>

            {/* Crisis Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {crisisOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <div
                    key={option.id}
                    onClick={() => handleOptionSelect(option)}
                    className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-purple-200"
                  >
                    <div className="text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                        option.severity === 'moderate' ? 'bg-blue-100' :
                        option.severity === 'high' ? 'bg-orange-100' : 'bg-purple-100'
                      }`}>
                        <IconComponent className={`w-8 h-8 ${
                          option.severity === 'moderate' ? 'text-blue-600' :
                          option.severity === 'high' ? 'text-orange-600' : 'text-purple-600'
                        }`} />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {option.title}
                      </h4>
                      <p className="text-gray-600 text-sm mb-4">
                        {option.description}
                      </p>
                      <div className="flex items-center justify-center text-purple-600 text-sm font-medium">
                        See Impact <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {currentStep === 'impact-review' && selectedOption && impactCalculations && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Impact on Your Someday Life
              </h3>
              <div className="bg-purple-50 rounded-lg p-6 mb-6">
                <div className="text-center">
                  <h4 className="text-lg font-medium text-purple-900 mb-2">
                    "{selectedOption.title}"
                  </h4>
                  <p className="text-purple-700 text-sm">
                    {selectedOption.description}
                  </p>
                </div>
              </div>

              {/* Gentle Impact Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Here's how this affects your journey:</h4>
                
                {impactCalculations.delayMonths > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Calendar className="w-5 h-5 text-blue-500 mt-1" />
                      <div>
                        <p className="text-gray-700">
                          <span className="font-medium">This delays Maine by {impactCalculations.delayYears} years</span>
                          {impactCalculations.delayYears < 1 ? ' (less than a year)' : ''}
                          , but keeps your Foundation secure.
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          New target: Age {impactCalculations.newTargetAge} instead of {somedayDream.targetAge}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-green-500 mt-1" />
                      <div>
                        <p className="text-gray-700">
                          <span className="font-medium">Your retirement security remains {impactCalculations.foundationSecurity}</span>
                          {impactCalculations.foundationSecurity === 'secure' ? ' with continued Foundation contributions.' : ' but may need attention.'}
                        </p>
                      </div>
                    </div>

                    {impactCalculations.emergencyFundImpact === 'may-need-use' && (
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-orange-500 mt-1" />
                        <div>
                          <p className="text-gray-700">
                            <span className="font-medium">You may need to use some emergency savings</span> during this time.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-700 font-medium">
                      Good news: This approach has minimal impact on your Maine cottage timeline.
                    </p>
                  </div>
                )}
              </div>

              {/* New Bucket Allocation */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Your new monthly allocation:</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="bg-blue-100 p-3 rounded-lg mb-2">
                      <p className="text-sm text-blue-700 font-medium">Foundation</p>
                      <p className="text-lg font-bold text-blue-900">
                        {formatCurrency(impactCalculations.newMonthlyAmounts.foundation)}
                      </p>
                      <p className="text-xs text-blue-600">
                        {impactCalculations.newAllocation.foundation}%
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-purple-100 p-3 rounded-lg mb-2">
                      <p className="text-sm text-purple-700 font-medium">Dream</p>
                      <p className="text-lg font-bold text-purple-900">
                        {formatCurrency(impactCalculations.newMonthlyAmounts.dream)}
                      </p>
                      <p className="text-xs text-purple-600">
                        {impactCalculations.newAllocation.dream}%
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-100 p-3 rounded-lg mb-2">
                      <p className="text-sm text-green-700 font-medium">Life</p>
                      <p className="text-lg font-bold text-green-900">
                        {formatCurrency(impactCalculations.newMonthlyAmounts.life)}
                      </p>
                      <p className="text-xs text-green-600">
                        {impactCalculations.newAllocation.life}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Affected Milestones */}
              {impactCalculations.affectedMilestones.length > 0 && (
                <div className="bg-yellow-50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Life milestones that may be affected:</h4>
                  <ul className="space-y-1">
                    {impactCalculations.affectedMilestones.slice(0, 3).map((milestone) => (
                      <li key={milestone.id} className="text-sm text-gray-700 flex items-center space-x-2">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                        <span>{milestone.name} (Age {milestone.age})</span>
                      </li>
                    ))}
                  </ul>
                  {impactCalculations.affectedMilestones.length > 3 && (
                    <p className="text-sm text-gray-600 mt-2">
                      And {impactCalculations.affectedMilestones.length - 3} other milestones
                    </p>
                  )}
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={() => setCurrentStep('crisis-acknowledgment')}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Choose Different Option
                </button>
                <button
                  onClick={handleConfirmChoice}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Continue with This Plan
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'recovery-planning' && showRecoveryPlan && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-center mb-6">
                <div className="bg-gradient-to-r from-green-500 to-blue-600 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <RotateCcw className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Your Recovery Plan
                </h3>
                <p className="text-gray-600">
                  When you're ready to get back on track, here's how to catch up
                </p>
              </div>

              {/* Crisis Impact Summary */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-2">During your {showRecoveryPlan.crisisMonths}-month adjustment period:</h4>
                <div className="text-sm text-gray-700">
                  <p>• Total reduced contributions: {formatCurrency(showRecoveryPlan.totalLostContributions)}</p>
                  <p>• Your Foundation security: {impactCalculations.foundationSecurity}</p>
                  <p>• Emergency fund: {impactCalculations.emergencyFundImpact === 'preserved' ? 'Preserved' : 'May be partially used'}</p>
                </div>
              </div>

              {/* Recovery Options */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-4">Choose your recovery approach:</h4>
                <div className="space-y-4">
                  {showRecoveryPlan.recoveryOptions.map((option, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium text-gray-900">{option.name}</h5>
                        <span className="text-sm text-purple-600 font-medium">{option.timeframe}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{option.description}</p>
                      {option.additionalMonthly > 0 && (
                        <p className="text-sm font-medium text-gray-700">
                          Additional monthly: {formatCurrency(option.additionalMonthly)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Foundation Rebuild (if needed) */}
              {showRecoveryPlan.foundationRebuild && (
                <div className="bg-orange-50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Shield className="w-4 h-4 text-orange-600 mr-2" />
                    Foundation Rebuild Priority
                  </h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Your retirement security needs attention. Consider prioritizing Foundation rebuilding:
                  </p>
                  <div className="text-sm text-gray-700">
                    <p>• Timeframe: {showRecoveryPlan.foundationRebuild.timeframe}</p>
                    <p>• Suggested monthly: {formatCurrency(showRecoveryPlan.foundationRebuild.monthlyAmount)}</p>
                  </div>
                </div>
              )}

              {/* Encouragement */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Remember:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• This is temporary. Life crises pass, but your dreams remain.</li>
                  <li>• Every small step forward counts, even during difficult times.</li>
                  <li>• Your Maine cottage is still waiting for you – just a little further down the path.</li>
                  <li>• You showed wisdom by protecting your Foundation during this crisis.</li>
                </ul>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={onNavigateBack}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Save & Return to Dashboard
                </button>
                <button
                  onClick={() => {
                    // Here you would typically save the new allocation and call onUpdateProfile
                    if (onUpdateProfile) {
                      onUpdateProfile({
                        emergencyMode: true,
                        selectedOption: selectedOption,
                        newAllocation: impactCalculations.newAllocation,
                        recoveryPlan: showRecoveryPlan
                      });
                    }
                    onNavigateBack();
                  }}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Activate This Plan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyMode;
