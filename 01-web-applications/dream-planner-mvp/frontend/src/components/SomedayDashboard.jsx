import React, { useState, useEffect, useMemo } from 'react';
import { calculateTotalRetirementNeed } from '../services/retirementCalculations.js';
import { calculateIncomeAnalysis, performDreamRealityCheck } from '../services/incomeAnalysis.js';
import ThreeBucketDisplay from './ThreeBucketDisplay.jsx';

const SomedayDashboard = ({
  userProfile = {
    firstName: 'Alex',
    age: 35,
    monthlyIncome: 6000,
    currentSavings: 25000
  },
  northStarDream = {
    title: 'Coastal Cottage Life',
    description: 'Waking up to ocean views, writing by the window, evening walks on the beach...',
    location: 'Maine Coast',
    housingType: 'cottage',
    propertyCost: 425000,
    monthlyLivingExpenses: 3500,
    targetAge: 55,
    inspirationImages: [
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600'
    ]
  },
  currentAssets = {
    checking: 5000,
    savings: 15000,
    retirement401k: 45000,
    investments: 8000,
    realEstate: 0
  },
  bucketAllocations = {
    foundation: 60,
    dream: 25,
    life: 15
  },
  milestones = [
    {
      id: 'milestone-1',
      name: 'European Adventure',
      age: 38,
      cost: 12000,
      description: 'Three-week trip through Europe',
      icon: '✈️',
      color: 'bg-blue-500'
    },
    {
      id: 'milestone-2',
      name: 'Home Renovation',
      age: 40,
      cost: 35000,
      description: 'Kitchen and bathroom remodel',
      icon: '🔨',
      color: 'bg-purple-500'
    }
  ],
  onUpdateBuckets = () => {},
  className = ""
}) => {
  const [currentProgress, setCurrentProgress] = useState({
    totalAssets: 0,
    retirementProgress: 0,
    dreamProgress: 0,
    yearsToSomeday: 0
  });

  const [bucketBalances, setBucketBalances] = useState({
    foundation: 0,
    dream: 0,
    life: 0
  });

  const [showVisionBoard, setShowVisionBoard] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  // Calculate total current assets
  const totalCurrentAssets = useMemo(() => {
    return Object.values(currentAssets).reduce((sum, value) => sum + (value || 0), 0);
  }, [currentAssets]);

  // Calculate monthly savings based on bucket allocations
  const monthlySavings = useMemo(() => {
    const disposableIncome = userProfile.monthlyIncome * 0.3; // Assume 30% available for savings
    return {
      foundation: (disposableIncome * bucketAllocations.foundation) / 100,
      dream: (disposableIncome * bucketAllocations.dream) / 100,
      life: (disposableIncome * bucketAllocations.life) / 100,
      total: disposableIncome
    };
  }, [userProfile.monthlyIncome, bucketAllocations]);

  // Calculate retirement requirements
  const retirementAnalysis = useMemo(() => {
    try {
      const yearsUntilRetirement = northStarDream.targetAge - userProfile.age;
      const annualExpenses = northStarDream.monthlyLivingExpenses * 12;
      
      return calculateTotalRetirementNeed(
        annualExpenses,
        yearsUntilRetirement,
        30, // 30 years in retirement
        0.03, // 3% inflation
        userProfile.age,
        currentAssets.retirement401k + currentAssets.investments
      );
    } catch (error) {
      console.error('Error calculating retirement needs:', error);
      return {
        requiredPortfolioSize: northStarDream.monthlyLivingExpenses * 12 * 25, // 25x rule fallback
        netAmountNeeded: 500000,
        savingsStrategies: {
          balanced: { monthlySavings: 2000 }
        }
      };
    }
  }, [northStarDream, userProfile.age, currentAssets]);

  // Calculate progress and timeline
  useEffect(() => {
    const retirementAssets = currentAssets.retirement401k + currentAssets.investments;
    const retirementProgress = Math.min(100, (retirementAssets / retirementAnalysis.requiredPortfolioSize) * 100);
    
    const dreamAssets = currentAssets.savings + currentAssets.checking;
    const dreamProgress = Math.min(100, (dreamAssets / northStarDream.propertyCost) * 100);

    // Calculate years to someday based on current savings rate
    const monthsToRetirement = retirementAnalysis.netAmountNeeded / monthlySavings.foundation;
    const monthsToDream = (northStarDream.propertyCost - dreamAssets) / monthlySavings.dream;
    const yearsToSomeday = Math.max(monthsToRetirement, monthsToDream) / 12;

    setCurrentProgress({
      totalAssets: totalCurrentAssets,
      retirementProgress,
      dreamProgress,
      yearsToSomeday: Math.ceil(yearsToSomeday)
    });

    // Update bucket balances (simulated based on allocations)
    setBucketBalances({
      foundation: retirementAssets,
      dream: dreamAssets,
      life: currentAssets.checking * 0.3 // Assume 30% of checking is life fund
    });
  }, [totalCurrentAssets, retirementAnalysis, northStarDream, monthlySavings, currentAssets]);

  // Filter milestones for next 5 years
  const upcomingMilestones = milestones
    .filter(milestone => milestone.age <= userProfile.age + 5 && milestone.age > userProfile.age)
    .sort((a, b) => a.age - b.age);

  // Vision board image rotation
  useEffect(() => {
    if (northStarDream.inspirationImages && northStarDream.inspirationImages.length > 1) {
      const interval = setInterval(() => {
        setSelectedImage(prev => (prev + 1) % northStarDream.inspirationImages.length);
      }, 5000); // Change image every 5 seconds

      return () => clearInterval(interval);
    }
  }, [northStarDream.inspirationImages]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format years/months
  const formatTimeRemaining = (years) => {
    if (years < 1) {
      const months = Math.ceil(years * 12);
      return `${months} month${months !== 1 ? 's' : ''}`;
    }
    const wholeYears = Math.floor(years);
    const remainingMonths = Math.ceil((years - wholeYears) * 12);
    
    if (remainingMonths === 0) {
      return `${wholeYears} year${wholeYears !== 1 ? 's' : ''}`;
    }
    return `${wholeYears}y ${remainingMonths}m`;
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome back, {userProfile.firstName}! 👋
          </h1>
          <p className="text-lg text-gray-600">
            Your journey to {northStarDream.title} is underway
          </p>
        </div>

        {/* Vision Board Section */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
          <div className="relative h-96 md:h-[500px]">
            {/* Background Image */}
            {northStarDream.inspirationImages && northStarDream.inspirationImages.length > 0 && (
              <div className="absolute inset-0">
                <img
                  src={northStarDream.inspirationImages[selectedImage]}
                  alt="Someday Life Vision"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              </div>
            )}

            {/* Vision Board Content */}
            <div className="relative z-10 h-full flex flex-col justify-end p-8 text-white">
              <div className="max-w-3xl">
                <h2 className="text-3xl md:text-5xl font-bold mb-4">
                  {northStarDream.title}
                </h2>
                <p className="text-lg md:text-xl mb-6 leading-relaxed">
                  {northStarDream.description}
                </p>
                
                {/* Key Details */}
                <div className="flex flex-wrap gap-6 mb-6">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                    <div className="text-sm opacity-90">Location</div>
                    <div className="font-semibold">{northStarDream.location}</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                    <div className="text-sm opacity-90">Target Age</div>
                    <div className="font-semibold">{northStarDream.targetAge}</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                    <div className="text-sm opacity-90">Property Cost</div>
                    <div className="font-semibold">{formatCurrency(northStarDream.propertyCost)}</div>
                  </div>
                </div>

                {/* Countdown Timer */}
                <div className="bg-gradient-to-r from-purple-500/90 to-blue-500/90 backdrop-blur-sm rounded-2xl p-6 inline-block">
                  <div className="text-center">
                    <div className="text-4xl md:text-6xl font-bold mb-2">
                      {currentProgress.yearsToSomeday}
                    </div>
                    <div className="text-lg md:text-xl">
                      Years to Someday Life
                    </div>
                    <div className="text-sm opacity-90 mt-2">
                      At current savings rate
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Navigation Dots */}
            {northStarDream.inspirationImages && northStarDream.inspirationImages.length > 1 && (
              <div className="absolute bottom-4 right-4 flex space-x-2">
                {northStarDream.inspirationImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === selectedImage 
                        ? 'bg-white' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Assets */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Total Assets</h3>
              <span className="text-2xl">💰</span>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatCurrency(currentProgress.totalAssets)}
            </div>
            <div className="text-sm text-gray-600">
              Growing toward your someday life
            </div>
          </div>

          {/* Retirement Progress */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Retirement Security</h3>
              <span className="text-2xl">🏛️</span>
            </div>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-2xl font-bold text-blue-600">
                  {currentProgress.retirementProgress.toFixed(1)}%
                </span>
                <span className="text-sm text-gray-600">
                  {formatCurrency(retirementAnalysis.requiredPortfolioSize)} goal
                </span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, currentProgress.retirementProgress)}%` }}
                ></div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Foundation bucket: {formatCurrency(monthlySavings.foundation)}/month
            </div>
          </div>

          {/* Dream Progress */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Dream Property</h3>
              <span className="text-2xl">✨</span>
            </div>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-2xl font-bold text-purple-600">
                  {currentProgress.dreamProgress.toFixed(1)}%
                </span>
                <span className="text-sm text-gray-600">
                  {formatCurrency(northStarDream.propertyCost)} goal
                </span>
              </div>
              <div className="w-full bg-purple-100 rounded-full h-3">
                <div
                  className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, currentProgress.dreamProgress)}%` }}
                ></div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Dream bucket: {formatCurrency(monthlySavings.dream)}/month
            </div>
          </div>
        </div>

        {/* Three Bucket Display */}
        <div className="mb-8">
          <ThreeBucketDisplay
            monthlyDisposableIncome={monthlySavings.total}
            currentAge={userProfile.age}
            retirementAge={northStarDream.targetAge}
            annualExpenses={northStarDream.monthlyLivingExpenses * 12}
            dreamGoalAmount={northStarDream.propertyCost}
            dreamTimeframe={northStarDream.targetAge - userProfile.age}
            lifeGoalAmount={upcomingMilestones.reduce((sum, m) => sum + m.cost, 0)}
            lifeTimeframe={5}
            onAllocationChange={onUpdateBuckets}
          />
        </div>

        {/* Upcoming Milestones */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Upcoming Milestones</h3>
            <span className="text-sm text-gray-600">Next 5 years</span>
          </div>

          {upcomingMilestones.length > 0 ? (
            <div className="space-y-4">
              {upcomingMilestones.map((milestone) => {
                const yearsAway = milestone.age - userProfile.age;
                const monthsToSave = yearsAway * 12;
                const monthlySavingsNeeded = milestone.cost / monthsToSave;
                
                return (
                  <div key={milestone.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${milestone.color} rounded-full flex items-center justify-center text-white text-xl`}>
                        {milestone.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{milestone.name}</h4>
                        <p className="text-sm text-gray-600">{milestone.description}</p>
                        <p className="text-xs text-gray-500">
                          Age {milestone.age} • {formatTimeRemaining(yearsAway)} away
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-800">
                        {formatCurrency(milestone.cost)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatCurrency(monthlySavingsNeeded)}/month needed
                      </div>
                      <div className="text-xs text-gray-500">
                        From Life bucket
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🎯</span>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                No upcoming milestones
              </h4>
              <p className="text-gray-600 mb-4">
                Add some life milestones to track your progress toward important goals
              </p>
              <button className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                Add Milestone
              </button>
            </div>
          )}
        </div>

        {/* Asset Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Current Asset Allocation */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Asset Breakdown</h3>
            
            <div className="space-y-4">
              {Object.entries(currentAssets).map(([key, value]) => {
                const percentage = totalCurrentAssets > 0 ? (value / totalCurrentAssets) * 100 : 0;
                const labels = {
                  checking: { name: 'Checking Account', icon: '💳', color: 'bg-blue-500' },
                  savings: { name: 'Savings Account', icon: '💰', color: 'bg-green-500' },
                  retirement401k: { name: '401(k)', icon: '🏛️', color: 'bg-purple-500' },
                  investments: { name: 'Investments', icon: '📈', color: 'bg-red-500' },
                  realEstate: { name: 'Real Estate', icon: '🏠', color: 'bg-yellow-500' }
                };
                
                const label = labels[key] || { name: key, icon: '💼', color: 'bg-gray-500' };
                
                return (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{label.icon}</span>
                      <span className="font-medium text-gray-700">{label.name}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="font-semibold text-gray-800">
                          {formatCurrency(value)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className={`${label.color} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bucket Balances */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Bucket Balances</h3>
            
            <div className="space-y-6">
              {Object.entries(bucketBalances).map(([bucket, balance]) => {
                const configs = {
                  foundation: { name: 'Foundation', icon: '🏛️', color: 'bg-blue-500', target: retirementAnalysis.requiredPortfolioSize },
                  dream: { name: 'Dream', icon: '✨', color: 'bg-purple-500', target: northStarDream.propertyCost },
                  life: { name: 'Life', icon: '🎯', color: 'bg-green-500', target: upcomingMilestones.reduce((sum, m) => sum + m.cost, 0) || 25000 }
                };
                
                const config = configs[bucket];
                const progress = config.target > 0 ? (balance / config.target) * 100 : 0;
                
                return (
                  <div key={bucket}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{config.icon}</span>
                        <span className="font-medium text-gray-700">{config.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-800">
                          {formatCurrency(balance)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {progress.toFixed(1)}% of goal
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${config.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min(100, progress)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-center">
              <span className="text-2xl mb-2 block">📊</span>
              <span className="font-medium text-blue-800">View Detailed Progress</span>
            </button>
            
            <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors text-center">
              <span className="text-2xl mb-2 block">🎯</span>
              <span className="font-medium text-purple-800">Add Milestone</span>
            </button>
            
            <button className="p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors text-center">
              <span className="text-2xl mb-2 block">⚖️</span>
              <span className="font-medium text-green-800">Adjust Buckets</span>
            </button>
            
            <button className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-xl transition-colors text-center">
              <span className="text-2xl mb-2 block">💡</span>
              <span className="font-medium text-yellow-800">Get Recommendations</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SomedayDashboard;
