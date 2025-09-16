import React, { useState, useEffect, useCallback } from 'react';
import { calculateTotalRetirementNeed } from '../services/retirementCalculations.js';

const ThreeBucketDisplay = ({ 
  monthlyDisposableIncome = 1000,
  currentAge = 35,
  retirementAge = 65,
  annualExpenses = 50000,
  dreamGoalAmount = 100000,
  dreamTimeframe = 5,
  lifeGoalAmount = 25000,
  lifeTimeframe = 2,
  onAllocationChange = () => {},
  className = ""
}) => {
  // Allocation state (percentages that must sum to 100)
  const [allocations, setAllocations] = useState({
    foundation: 60, // Retirement savings
    dream: 25,      // Specific lifestyle goal
    life: 15        // Upcoming milestones buffer
  });

  // Calculated amounts based on allocations
  const [bucketAmounts, setBucketAmounts] = useState({
    foundation: 0,
    dream: 0,
    life: 0
  });

  // Timeline impacts
  const [timelineImpacts, setTimelineImpacts] = useState({
    retirementDate: null,
    dreamDate: null,
    lifeDate: null,
    somedayDate: null
  });

  // Minimum foundation allocation (calculated based on safe retirement needs)
  const [minimumFoundation, setMinimumFoundation] = useState(40);

  // Animation states
  const [isAnimating, setIsAnimating] = useState(false);
  const [previousAllocations, setPreviousAllocations] = useState(allocations);

  // Calculate minimum foundation allocation needed for safe retirement
  const calculateMinimumFoundation = useCallback(() => {
    try {
      const yearsUntilRetirement = retirementAge - currentAge;
      if (yearsUntilRetirement <= 0) return 90; // If already at retirement age

      const retirementCalc = calculateTotalRetirementNeed(
        annualExpenses,
        yearsUntilRetirement,
        30, // 30 years in retirement
        0.03, // 3% inflation
        currentAge,
        0 // Assume starting from 0 for minimum calculation
      );

      const requiredMonthlySavings = retirementCalc.savingsStrategies.balanced.monthlySavings;
      const minimumPercentage = Math.min(90, Math.max(25, 
        (requiredMonthlySavings / monthlyDisposableIncome) * 100
      ));

      return Math.round(minimumPercentage);
    } catch (error) {
      console.error('Error calculating minimum foundation:', error);
      return 40; // Fallback to 40%
    }
  }, [annualExpenses, currentAge, retirementAge, monthlyDisposableIncome]);

  // Update minimum foundation when inputs change
  useEffect(() => {
    const newMinimum = calculateMinimumFoundation();
    setMinimumFoundation(newMinimum);
    
    // Adjust allocations if current foundation is below minimum
    if (allocations.foundation < newMinimum) {
      const adjustment = newMinimum - allocations.foundation;
      const newAllocations = {
        foundation: newMinimum,
        dream: Math.max(5, allocations.dream - adjustment / 2),
        life: Math.max(5, allocations.life - adjustment / 2)
      };
      
      // Ensure total is 100%
      const total = newAllocations.foundation + newAllocations.dream + newAllocations.life;
      if (total !== 100) {
        const diff = 100 - total;
        newAllocations.dream += diff / 2;
        newAllocations.life += diff / 2;
      }
      
      setAllocations(newAllocations);
    }
  }, [calculateMinimumFoundation, allocations.foundation]);

  // Calculate bucket amounts and timeline impacts
  useEffect(() => {
    const foundationAmount = (monthlyDisposableIncome * allocations.foundation) / 100;
    const dreamAmount = (monthlyDisposableIncome * allocations.dream) / 100;
    const lifeAmount = (monthlyDisposableIncome * allocations.life) / 100;

    setBucketAmounts({
      foundation: foundationAmount,
      dream: dreamAmount,
      life: lifeAmount
    });

    // Calculate timeline impacts
    const calculateTimelines = () => {
      // Foundation (Retirement) timeline
      let retirementDate = null;
      try {
        const yearsUntilRetirement = retirementAge - currentAge;
        const retirementCalc = calculateTotalRetirementNeed(
          annualExpenses,
          yearsUntilRetirement,
          30,
          0.03,
          currentAge,
          0
        );
        
        const requiredMonthlySavings = retirementCalc.savingsStrategies.balanced.monthlySavings;
        if (foundationAmount >= requiredMonthlySavings) {
          retirementDate = new Date();
          retirementDate.setFullYear(retirementDate.getFullYear() + yearsUntilRetirement);
        } else {
          // Calculate extended timeline if not saving enough
          const actualYearsNeeded = (requiredMonthlySavings / foundationAmount) * yearsUntilRetirement;
          retirementDate = new Date();
          retirementDate.setFullYear(retirementDate.getFullYear() + Math.ceil(actualYearsNeeded));
        }
      } catch (error) {
        console.error('Error calculating retirement timeline:', error);
      }

      // Dream goal timeline
      let dreamDate = null;
      if (dreamAmount > 0) {
        const monthsNeeded = dreamGoalAmount / dreamAmount;
        dreamDate = new Date();
        dreamDate.setMonth(dreamDate.getMonth() + Math.ceil(monthsNeeded));
      }

      // Life goal timeline
      let lifeDate = null;
      if (lifeAmount > 0) {
        const monthsNeeded = lifeGoalAmount / lifeAmount;
        lifeDate = new Date();
        lifeDate.setMonth(lifeDate.getMonth() + Math.ceil(monthsNeeded));
      }

      // Overall "someday" date (when both retirement and dream goals are met)
      const somedayDate = retirementDate && dreamDate ? 
        (retirementDate > dreamDate ? retirementDate : dreamDate) : 
        (retirementDate || dreamDate);

      return {
        retirementDate,
        dreamDate,
        lifeDate,
        somedayDate
      };
    };

    setTimelineImpacts(calculateTimelines());
    
    // Notify parent component of allocation changes
    onAllocationChange({
      allocations,
      amounts: { foundation: foundationAmount, dream: dreamAmount, life: lifeAmount },
      timelines: calculateTimelines()
    });
  }, [allocations, monthlyDisposableIncome, annualExpenses, currentAge, retirementAge, 
      dreamGoalAmount, lifeGoalAmount, onAllocationChange]);

  // Handle allocation changes with validation
  const handleAllocationChange = (bucket, newValue) => {
    // Prevent foundation from going below minimum
    if (bucket === 'foundation' && newValue < minimumFoundation) {
      return;
    }

    setIsAnimating(true);
    setPreviousAllocations(allocations);

    const newAllocations = { ...allocations };
    const oldValue = allocations[bucket];
    const difference = newValue - oldValue;

    newAllocations[bucket] = newValue;

    // Distribute the difference among other buckets
    const otherBuckets = Object.keys(allocations).filter(b => b !== bucket);
    const totalOthers = otherBuckets.reduce((sum, b) => sum + allocations[b], 0);

    if (totalOthers > 0) {
      otherBuckets.forEach(otherBucket => {
        const proportion = allocations[otherBucket] / totalOthers;
        let adjustment = -difference * proportion;
        
        // Ensure foundation doesn't go below minimum
        if (otherBucket === 'foundation') {
          const newFoundationValue = allocations[otherBucket] + adjustment;
          if (newFoundationValue < minimumFoundation) {
            adjustment = minimumFoundation - allocations[otherBucket];
          }
        }
        
        // Ensure no bucket goes below 5%
        const newValue = Math.max(5, allocations[otherBucket] + adjustment);
        newAllocations[otherBucket] = newValue;
      });
    }

    // Normalize to ensure total is 100%
    const total = Object.values(newAllocations).reduce((sum, val) => sum + val, 0);
    if (total !== 100) {
      const factor = 100 / total;
      Object.keys(newAllocations).forEach(key => {
        if (key === 'foundation') {
          newAllocations[key] = Math.max(minimumFoundation, newAllocations[key] * factor);
        } else {
          newAllocations[key] = Math.max(5, newAllocations[key] * factor);
        }
      });
    }

    setAllocations(newAllocations);
    
    // Stop animation after a delay
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'Never at current rate';
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // Calculate progress percentages for visual display
  const calculateProgress = (bucket) => {
    const amount = bucketAmounts[bucket];
    let target = 0;
    let timeframe = 1;

    switch (bucket) {
      case 'foundation':
        try {
          const yearsUntilRetirement = retirementAge - currentAge;
          const retirementCalc = calculateTotalRetirementNeed(
            annualExpenses, yearsUntilRetirement, 30, 0.03, currentAge, 0
          );
          target = retirementCalc.savingsStrategies.balanced.monthlySavings;
        } catch {
          target = monthlyDisposableIncome * 0.6; // Fallback
        }
        break;
      case 'dream':
        target = dreamGoalAmount / (dreamTimeframe * 12);
        break;
      case 'life':
        target = lifeGoalAmount / (lifeTimeframe * 12);
        break;
      default:
        target = 100;
    }

    return Math.min(100, (amount / target) * 100);
  };

  // Bucket configuration
  const bucketConfig = {
    foundation: {
      name: 'Foundation',
      description: 'Retirement Security',
      color: 'bg-blue-500',
      lightColor: 'bg-blue-100',
      textColor: 'text-blue-700',
      icon: '🏛️',
      target: 'Safe Retirement',
      colorStyle: { backgroundColor: 'var(--primary-color)' },
      lightColorStyle: { backgroundColor: 'var(--secondary-color)' }
    },
    dream: {
      name: 'Dream',
      description: 'Lifestyle Goal',
      color: 'bg-purple-500',
      lightColor: 'bg-purple-100',
      textColor: 'text-purple-700',
      icon: '✨',
      target: 'Someday Life',
      colorStyle: { backgroundColor: 'var(--accent-color)' },
      lightColorStyle: { backgroundColor: 'var(--secondary-color)' }
    },
    life: {
      name: 'Life',
      description: 'Milestones Buffer',
      color: 'bg-green-500',
      lightColor: 'bg-green-100',
      textColor: 'text-green-700',
      icon: '🎯',
      target: 'Near-term Goals',
      colorStyle: { backgroundColor: 'var(--success-green)' },
      lightColorStyle: { backgroundColor: 'var(--secondary-color)' }
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl p-8 ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Three-Bucket Savings Strategy
        </h3>
        <p className="text-gray-600">
          Allocate your ${monthlyDisposableIncome.toLocaleString()}/month across your financial priorities
        </p>
      </div>

      {/* Someday Date Impact */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 text-center">
        <h4 className="text-lg font-semibold text-gray-800 mb-2">
          Your "Someday" Timeline
        </h4>
        <div className="text-3xl font-bold text-purple-600 mb-2">
          {formatDate(timelineImpacts.somedayDate)}
        </div>
        <p className="text-sm text-gray-600">
          When both retirement security and dream goals are achieved
        </p>
      </div>

      {/* Bucket Displays */}
      <div className="space-y-8 mb-8">
        {Object.entries(bucketConfig).map(([bucketKey, config]) => {
          const allocation = allocations[bucketKey];
          const amount = bucketAmounts[bucketKey];
          const progress = calculateProgress(bucketKey);
          const isMinimumReached = bucketKey === 'foundation' && allocation >= minimumFoundation;

          return (
            <div key={bucketKey} className="space-y-4">
              {/* Bucket Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{config.icon}</span>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      {config.name} Bucket
                    </h4>
                    <p className="text-sm text-gray-600">{config.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-800">
                    ${amount.toLocaleString()}/month
                  </div>
                  <div className="text-sm text-gray-600">
                    {allocation.toFixed(1)}% of income
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative">
                <div className={`h-6 rounded-full overflow-hidden`}
                     style={config.lightColorStyle}>
                  <div
                    className={`h-full transition-all duration-500 ease-out ${
                      isAnimating ? 'animate-pulse' : ''
                    }`}
                    style={{ 
                      width: `${Math.min(100, progress)}%`, 
                      ...config.colorStyle
                    }}
                  />
                  {progress > 100 && (
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-400 to-green-400 opacity-75"
                      style={{ width: `${Math.min(100, (progress - 100) / 2)}%` }}
                    />
                  )}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-600">
                  <span>Current Rate</span>
                  <span className={progress >= 100 ? 'text-green-600 font-semibold' : ''}>
                    {progress.toFixed(1)}% of target
                  </span>
                </div>
              </div>

              {/* Allocation Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-700">
                    Allocation Percentage
                  </label>
                  {bucketKey === 'foundation' && (
                    <span className="text-xs text-blue-600">
                      Min: {minimumFoundation}%
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min={bucketKey === 'foundation' ? minimumFoundation : 5}
                    max="80"
                    value={allocation}
                    onChange={(e) => handleAllocationChange(bucketKey, parseFloat(e.target.value))}
                    className={`w-full h-2 rounded-lg appearance-none cursor-pointer slider-${bucketKey}`}
                    style={{
                      background: `linear-gradient(to right, ${
                        bucketKey === 'foundation' ? 'var(--primary-color)' : 
                        bucketKey === 'dream' ? 'var(--accent-color)' : 'var(--success-green)'
                      } 0%, ${
                        bucketKey === 'foundation' ? 'var(--primary-color)' : 
                        bucketKey === 'dream' ? 'var(--accent-color)' : 'var(--success-green)'
                      } ${allocation}%, #E5E7EB ${allocation}%, #E5E7EB 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{bucketKey === 'foundation' ? minimumFoundation : 5}%</span>
                    <span>80%</span>
                  </div>
                </div>
              </div>

              {/* Timeline Impact */}
              <div className={`p-4 rounded-lg`}
                   style={config.lightColorStyle}>
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${config.textColor}`}>
                    {config.target} Timeline:
                  </span>
                  <span className={`text-sm font-bold ${config.textColor}`}>
                    {bucketKey === 'foundation' ? formatDate(timelineImpacts.retirementDate) :
                     bucketKey === 'dream' ? formatDate(timelineImpacts.dreamDate) :
                     formatDate(timelineImpacts.lifeDate)}
                  </span>
                </div>
                
                {/* Status indicators */}
                {bucketKey === 'foundation' && (
                  <div className="mt-2 flex items-center space-x-2">
                    {isMinimumReached ? (
                      <span className="text-xs text-green-600 flex items-center">
                        ✓ Meeting minimum retirement security
                      </span>
                    ) : (
                      <span className="text-xs text-orange-600 flex items-center">
                        ⚠️ Below recommended minimum
                      </span>
                    )}
                  </div>
                )}
                
                {progress >= 100 && (
                  <div className="mt-2">
                    <span className="text-xs text-green-600 flex items-center">
                      🎉 Exceeding target rate - ahead of schedule!
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="border-t pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-800">
              ${monthlyDisposableIncome.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Monthly Available</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-800">
              {Object.values(allocations).reduce((sum, val) => sum + val, 0).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Total Allocated</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">
              {timelineImpacts.somedayDate ? 
                Math.ceil((timelineImpacts.somedayDate - new Date()) / (1000 * 60 * 60 * 24 * 365.25)) : 
                '∞'
              }
            </div>
            <div className="text-sm text-gray-600">Years to Someday</div>
          </div>
        </div>
      </div>

      {/* Optimization Suggestions */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h5 className="font-semibold text-yellow-800 mb-2">💡 Optimization Tips</h5>
        <ul className="text-sm text-yellow-700 space-y-1">
          {allocations.foundation < minimumFoundation && (
            <li>• Consider increasing Foundation allocation to meet retirement security minimum</li>
          )}
          {allocations.dream < 20 && (
            <li>• Your dream timeline could be accelerated with higher Dream allocation</li>
          )}
          {allocations.life > 25 && (
            <li>• Consider if Life allocation could be reduced to boost long-term goals</li>
          )}
          {Object.values(allocations).reduce((sum, val) => sum + val, 0) < 95 && (
            <li>• You have unallocated income that could accelerate your goals</li>
          )}
        </ul>
      </div>

      <style jsx>{`
        .slider-foundation::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: var(--primary-color);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider-dream::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: var(--accent-color);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider-life::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: var(--success-green);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider-foundation::-moz-range-thumb,
        .slider-dream::-moz-range-thumb,
        .slider-life::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default ThreeBucketDisplay;
