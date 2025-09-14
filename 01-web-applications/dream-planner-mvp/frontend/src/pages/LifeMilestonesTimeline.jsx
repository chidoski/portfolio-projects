import React, { useState, useEffect, useRef, useCallback } from 'react';
import { calculateTotalRetirementNeed } from '../services/retirementCalculations.js';
import ThreeBucketDisplay from '../components/ThreeBucketDisplay.jsx';

const LifeMilestonesTimeline = () => {
  // Core timeline data
  const [currentAge, setCurrentAge] = useState(35);
  const [somedayAge, setSomedayAge] = useState(65);
  const [monthlyDisposableIncome, setMonthlyDisposableIncome] = useState(2000);
  const [annualExpenses, setAnnualExpenses] = useState(60000);

  // Milestones state
  const [milestones, setMilestones] = useState([
    {
      id: 'milestone-1',
      name: 'Kids College Fund',
      age: 45,
      cost: 80000,
      description: 'College education for children',
      category: 'family',
      icon: '🎓',
      color: 'bg-blue-500',
      isEditing: false
    },
    {
      id: 'milestone-2',
      name: 'Dream Vacation',
      age: 40,
      cost: 15000,
      description: 'European adventure trip',
      category: 'travel',
      icon: '✈️',
      color: 'bg-green-500',
      isEditing: false
    }
  ]);

  // Three-bucket allocation state
  const [bucketAllocations, setBucketAllocations] = useState({
    foundation: 60,
    dream: 25,
    life: 15
  });

  // Timeline impact calculations
  const [timelineImpact, setTimelineImpact] = useState({
    originalSomedayAge: 65,
    adjustedSomedayAge: 65,
    totalMilestoneCosts: 0,
    impactOnTimeline: 0,
    recommendedAdjustments: []
  });

  // UI state
  const [draggedMilestone, setDraggedMilestone] = useState(null);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [showBucketAdjustment, setShowBucketAdjustment] = useState(false);
  
  // Timeline refs
  const timelineRef = useRef(null);
  const [timelineWidth, setTimelineWidth] = useState(800);

  // Predefined milestone templates
  const milestoneTemplates = [
    { name: 'Kids College', cost: 80000, category: 'family', icon: '🎓', description: 'College education fund' },
    { name: 'Wedding', cost: 30000, category: 'family', icon: '💒', description: 'Wedding celebration' },
    { name: 'Home Down Payment', cost: 60000, category: 'housing', icon: '🏠', description: 'House purchase down payment' },
    { name: 'Sabbatical Year', cost: 50000, category: 'personal', icon: '🌴', description: 'Year off for personal growth' },
    { name: 'Start Business', cost: 100000, category: 'business', icon: '🚀', description: 'Business startup capital' },
    { name: 'Dream Vacation', cost: 15000, category: 'travel', icon: '✈️', description: 'Special travel experience' },
    { name: 'Car Purchase', cost: 40000, category: 'transportation', icon: '🚗', description: 'New vehicle purchase' },
    { name: 'Home Renovation', cost: 75000, category: 'housing', icon: '🔨', description: 'Major home improvements' },
    { name: 'Emergency Fund', cost: 25000, category: 'security', icon: '🛡️', description: 'Financial safety net' },
    { name: 'Parent Care', cost: 120000, category: 'family', icon: '👥', description: 'Elder care support' }
  ];

  // Category colors
  const categoryColors = {
    family: 'bg-blue-500',
    housing: 'bg-purple-500',
    travel: 'bg-green-500',
    personal: 'bg-yellow-500',
    business: 'bg-red-500',
    transportation: 'bg-indigo-500',
    security: 'bg-gray-500'
  };

  // Calculate timeline impact when milestones change
  useEffect(() => {
    calculateTimelineImpact();
  }, [milestones, bucketAllocations, monthlyDisposableIncome, currentAge, somedayAge, annualExpenses]);

  // Update timeline width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (timelineRef.current) {
        setTimelineWidth(timelineRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Calculate the impact of milestones on the overall timeline
  const calculateTimelineImpact = useCallback(() => {
    const totalMilestoneCosts = milestones.reduce((sum, milestone) => sum + milestone.cost, 0);
    
    // Calculate original retirement timeline
    const yearsUntilOriginalRetirement = somedayAge - currentAge;
    
    try {
      const originalRetirementCalc = calculateTotalRetirementNeed(
        annualExpenses,
        yearsUntilOriginalRetirement,
        30,
        0.03,
        currentAge,
        0
      );

      // Calculate additional savings needed for milestones
      const foundationAmount = (monthlyDisposableIncome * bucketAllocations.foundation) / 100;
      const dreamAmount = (monthlyDisposableIncome * bucketAllocations.dream) / 100;
      const lifeAmount = (monthlyDisposableIncome * bucketAllocations.life) / 100;

      // Estimate how milestones affect the timeline
      const totalMonthlySavings = foundationAmount + dreamAmount + lifeAmount;
      const monthsToSaveMilestones = totalMilestoneCosts / (lifeAmount + dreamAmount * 0.5);
      const yearsImpact = monthsToSaveMilestones / 12;

      const adjustedSomedayAge = Math.ceil(somedayAge + yearsImpact);

      // Generate recommendations
      const recommendations = [];
      if (yearsImpact > 2) {
        recommendations.push({
          type: 'extend_timeline',
          message: `Consider extending your someday timeline by ${Math.ceil(yearsImpact)} years`,
          impact: yearsImpact
        });
        recommendations.push({
          type: 'increase_savings',
          message: `Increase monthly savings by $${Math.ceil(totalMilestoneCosts / (yearsUntilOriginalRetirement * 12))} to maintain timeline`,
          amount: Math.ceil(totalMilestoneCosts / (yearsUntilOriginalRetirement * 12))
        });
        recommendations.push({
          type: 'reduce_costs',
          message: 'Consider reducing milestone costs or spreading them over more years',
          savings: totalMilestoneCosts * 0.2
        });
      }

      setTimelineImpact({
        originalSomedayAge: somedayAge,
        adjustedSomedayAge,
        totalMilestoneCosts,
        impactOnTimeline: yearsImpact,
        recommendedAdjustments: recommendations
      });

    } catch (error) {
      console.error('Error calculating timeline impact:', error);
      setTimelineImpact({
        originalSomedayAge: somedayAge,
        adjustedSomedayAge: somedayAge + 2,
        totalMilestoneCosts,
        impactOnTimeline: 2,
        recommendedAdjustments: []
      });
    }
  }, [milestones, bucketAllocations, monthlyDisposableIncome, currentAge, somedayAge, annualExpenses]);

  // Convert age to timeline position
  const ageToPosition = (age) => {
    const totalYears = somedayAge - currentAge;
    const yearFromStart = age - currentAge;
    return (yearFromStart / totalYears) * (timelineWidth - 100); // Leave margin for pins
  };

  // Convert position to age
  const positionToAge = (position) => {
    const totalYears = somedayAge - currentAge;
    const yearFromStart = (position / (timelineWidth - 100)) * totalYears;
    return Math.round(currentAge + yearFromStart);
  };

  // Handle milestone drag
  const handleMilestoneDrag = (milestoneId, newAge) => {
    if (newAge < currentAge || newAge > somedayAge) return;

    setMilestones(prev => prev.map(milestone => 
      milestone.id === milestoneId 
        ? { ...milestone, age: newAge }
        : milestone
    ));
  };

  // Add new milestone
  const addMilestone = (template, age) => {
    const newMilestone = {
      id: `milestone-${Date.now()}`,
      name: template.name,
      age: age || Math.round((currentAge + somedayAge) / 2),
      cost: template.cost,
      description: template.description,
      category: template.category,
      icon: template.icon,
      color: categoryColors[template.category] || 'bg-gray-500',
      isEditing: false
    };

    setMilestones(prev => [...prev, newMilestone]);
    setShowAddMilestone(false);
  };

  // Remove milestone
  const removeMilestone = (milestoneId) => {
    setMilestones(prev => prev.filter(m => m.id !== milestoneId));
    setSelectedMilestone(null);
  };

  // Update milestone
  const updateMilestone = (milestoneId, updates) => {
    setMilestones(prev => prev.map(milestone => 
      milestone.id === milestoneId 
        ? { ...milestone, ...updates, isEditing: false }
        : milestone
    ));
    setSelectedMilestone(null);
  };

  // Apply recommended adjustment
  const applyRecommendation = (recommendation) => {
    switch (recommendation.type) {
      case 'extend_timeline':
        setSomedayAge(prev => prev + Math.ceil(recommendation.impact));
        break;
      case 'increase_savings':
        // This would typically increase income or reduce expenses
        setMonthlyDisposableIncome(prev => prev + recommendation.amount);
        break;
      case 'reduce_costs':
        // Reduce all milestone costs by 20%
        setMilestones(prev => prev.map(m => ({
          ...m,
          cost: Math.round(m.cost * 0.8)
        })));
        break;
      default:
        break;
    }
  };

  // Timeline years array
  const timelineYears = [];
  for (let age = currentAge; age <= somedayAge; age += 5) {
    timelineYears.push(age);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Life Milestones Timeline
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Plan your journey from today to your someday life. Add milestones, see their impact, 
            and adjust your strategy to achieve all your goals.
          </p>
        </div>

        {/* Timeline Settings */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Age
              </label>
              <input
                type="number"
                value={currentAge}
                onChange={(e) => setCurrentAge(parseInt(e.target.value) || 35)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="18"
                max="80"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Someday Life Age
              </label>
              <input
                type="number"
                value={somedayAge}
                onChange={(e) => setSomedayAge(parseInt(e.target.value) || 65)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={currentAge + 5}
                max="90"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Available
              </label>
              <input
                type="number"
                value={monthlyDisposableIncome}
                onChange={(e) => setMonthlyDisposableIncome(parseInt(e.target.value) || 2000)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="500"
                step="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Annual Expenses
              </label>
              <input
                type="number"
                value={annualExpenses}
                onChange={(e) => setAnnualExpenses(parseInt(e.target.value) || 60000)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="20000"
                step="5000"
              />
            </div>
          </div>
        </div>

        {/* Timeline Impact Summary */}
        {timelineImpact.impactOnTimeline > 0.5 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  ⚠️ Timeline Impact Detected
                </h3>
                <p className="text-yellow-700 mb-4">
                  Your milestones will delay your someday life by approximately{' '}
                  <span className="font-bold">{Math.ceil(timelineImpact.impactOnTimeline)} years</span>.
                  Total milestone costs: <span className="font-bold">${timelineImpact.totalMilestoneCosts.toLocaleString()}</span>
                </p>
                
                {timelineImpact.recommendedAdjustments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-yellow-800">Recommended Adjustments:</h4>
                    {timelineImpact.recommendedAdjustments.map((rec, index) => (
                      <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3">
                        <span className="text-sm text-gray-700">{rec.message}</span>
                        <button
                          onClick={() => applyRecommendation(rec)}
                          className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600 transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setShowBucketAdjustment(!showBucketAdjustment)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Adjust Buckets
              </button>
            </div>
          </div>
        )}

        {/* Three Bucket Adjustment (Collapsible) */}
        {showBucketAdjustment && (
          <div className="mb-8">
            <ThreeBucketDisplay
              monthlyDisposableIncome={monthlyDisposableIncome}
              currentAge={currentAge}
              retirementAge={somedayAge}
              annualExpenses={annualExpenses}
              dreamGoalAmount={100000}
              dreamTimeframe={somedayAge - currentAge}
              lifeGoalAmount={timelineImpact.totalMilestoneCosts}
              lifeTimeframe={Math.ceil((somedayAge - currentAge) / 2)}
              onAllocationChange={(data) => setBucketAllocations(data.allocations)}
            />
          </div>
        )}

        {/* Main Timeline */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Your Life Journey</h3>
            <button
              onClick={() => setShowAddMilestone(true)}
              className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2"
            >
              <span>+</span>
              <span>Add Milestone</span>
            </button>
          </div>

          {/* Timeline Container */}
          <div className="relative" ref={timelineRef}>
            {/* Timeline Line */}
            <div className="relative h-20 mb-8">
              <div className="absolute top-10 left-12 right-12 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full"></div>
              
              {/* Age Markers */}
              {timelineYears.map((age) => (
                <div
                  key={age}
                  className="absolute transform -translate-x-1/2"
                  style={{ left: `${50 + ageToPosition(age)}px` }}
                >
                  <div className="w-4 h-4 bg-white border-2 border-gray-400 rounded-full mb-2"></div>
                  <div className="text-sm font-medium text-gray-600 text-center">
                    {age}
                  </div>
                </div>
              ))}

              {/* Current Age Marker */}
              <div
                className="absolute transform -translate-x-1/2"
                style={{ left: '50px' }}
              >
                <div className="w-6 h-6 bg-blue-500 rounded-full mb-2 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div className="text-sm font-bold text-blue-600 text-center whitespace-nowrap">
                  Today<br />({currentAge})
                </div>
              </div>

              {/* Someday Age Marker */}
              <div
                className="absolute transform -translate-x-1/2"
                style={{ left: `${50 + ageToPosition(somedayAge)}px` }}
              >
                <div className="w-6 h-6 bg-green-500 rounded-full mb-2 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div className="text-sm font-bold text-green-600 text-center whitespace-nowrap">
                  Someday<br />({somedayAge})
                </div>
              </div>

              {/* Milestone Pins */}
              {milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="absolute transform -translate-x-1/2 cursor-move group"
                  style={{ left: `${50 + ageToPosition(milestone.age)}px` }}
                  draggable
                  onDragStart={(e) => {
                    setDraggedMilestone(milestone.id);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragEnd={() => setDraggedMilestone(null)}
                  onClick={() => setSelectedMilestone(milestone)}
                >
                  <div className={`w-8 h-8 ${milestone.color} rounded-full mb-2 flex items-center justify-center text-white text-lg shadow-lg group-hover:scale-110 transition-transform ${draggedMilestone === milestone.id ? 'scale-125 shadow-2xl' : ''}`}>
                    {milestone.icon}
                  </div>
                  <div className="text-xs font-medium text-gray-600 text-center whitespace-nowrap max-w-20 overflow-hidden">
                    {milestone.name}
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    Age {milestone.age}
                  </div>
                </div>
              ))}
            </div>

            {/* Drag Drop Zone */}
            <div
              className="absolute top-0 left-12 right-12 h-20 opacity-0"
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedMilestone) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const newAge = positionToAge(x);
                  handleMilestoneDrag(draggedMilestone, newAge);
                }
              }}
            />
          </div>

          {/* Timeline Legend */}
          <div className="flex flex-wrap gap-4 justify-center mt-8 pt-6 border-t">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Current Age</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Someday Life</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Life Milestones</span>
            </div>
            <div className="text-sm text-gray-500">
              💡 Drag milestones to different ages to explore scenarios
            </div>
          </div>
        </div>

        {/* Milestone Details Panel */}
        {selectedMilestone && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Milestone Details</h3>
                <button
                  onClick={() => setSelectedMilestone(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Milestone Name
                  </label>
                  <input
                    type="text"
                    value={selectedMilestone.name}
                    onChange={(e) => setSelectedMilestone(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    value={selectedMilestone.age}
                    onChange={(e) => setSelectedMilestone(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min={currentAge}
                    max={somedayAge}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cost
                  </label>
                  <input
                    type="number"
                    value={selectedMilestone.cost}
                    onChange={(e) => setSelectedMilestone(prev => ({ ...prev, cost: parseInt(e.target.value) || 0 }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="0"
                    step="1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={selectedMilestone.description}
                    onChange={(e) => setSelectedMilestone(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows="3"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => updateMilestone(selectedMilestone.id, selectedMilestone)}
                    className="flex-1 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => removeMilestone(selectedMilestone.id)}
                    className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Milestone Modal */}
        {showAddMilestone && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Add Life Milestone</h3>
                <button
                  onClick={() => setShowAddMilestone(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {milestoneTemplates.map((template, index) => (
                  <div
                    key={index}
                    onClick={() => addMilestone(template)}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 cursor-pointer transition-all"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">{template.icon}</span>
                      <div>
                        <h4 className="font-semibold text-gray-800">{template.name}</h4>
                        <p className="text-sm text-gray-600">{template.description}</p>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-purple-600">
                      ${template.cost.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Milestones Summary */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Milestones Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {milestones.length}
              </div>
              <div className="text-sm text-gray-600">Total Milestones</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                ${timelineImpact.totalMilestoneCosts.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Cost</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {timelineImpact.adjustedSomedayAge}
              </div>
              <div className="text-sm text-gray-600">Adjusted Someday Age</div>
            </div>
          </div>

          {milestones.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Milestone Timeline:</h4>
              {milestones
                .sort((a, b) => a.age - b.age)
                .map((milestone) => (
                  <div key={milestone.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{milestone.icon}</span>
                      <div>
                        <h5 className="font-medium text-gray-800">{milestone.name}</h5>
                        <p className="text-sm text-gray-600">Age {milestone.age}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-800">
                        ${milestone.cost.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {milestone.age - currentAge} years away
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LifeMilestonesTimeline;
