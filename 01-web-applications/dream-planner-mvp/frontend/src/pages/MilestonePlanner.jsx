import React, { useState, useEffect, useMemo } from 'react';
import { calculateTotalRetirementNeed } from '../services/retirementCalculations.js';
import { calculateIncomeAnalysis } from '../services/incomeAnalysis.js';

const MilestonePlanner = ({
  userProfile = {
    firstName: 'Alex',
    age: 35,
    monthlyIncome: 6000,
    currentSavings: 25000
  },
  northStarDream = {
    title: 'Coastal Cottage Life',
    targetAge: 55,
    propertyCost: 425000,
    monthlyLivingExpenses: 3500
  },
  currentBucketAllocations = {
    foundation: 60,
    dream: 25,
    life: 15
  },
  existingMilestones = [],
  onAddMilestone = () => {},
  onUpdateAllocations = () => {},
  className = ""
}) => {
  // Form state for new milestone
  const [newMilestone, setNewMilestone] = useState({
    name: '',
    description: '',
    targetAge: userProfile.age + 3,
    cost: 25000,
    category: 'personal',
    priority: 'medium',
    flexibility: 'moderate' // high, moderate, low
  });

  // UI state
  const [showScenarios, setShowScenarios] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Scenario results
  const [scenarios, setScenarios] = useState({
    increaseSavings: null,
    delayTimeline: null,
    modifyGoal: null
  });

  // Milestone categories with templates
  const milestoneCategories = {
    family: {
      name: 'Family & Relationships',
      icon: '👨‍👩‍👧‍👦',
      color: 'bg-blue-500',
      templates: [
        { name: 'Wedding', cost: 30000, description: 'Dream wedding celebration' },
        { name: 'Baby Fund', cost: 15000, description: 'Preparing for a new baby' },
        { name: 'Kids College', cost: 80000, description: 'College education fund' },
        { name: 'Family Vacation', cost: 8000, description: 'Annual family trip' }
      ]
    },
    housing: {
      name: 'Housing & Property',
      icon: '🏠',
      color: 'bg-purple-500',
      templates: [
        { name: 'Home Down Payment', cost: 60000, description: 'Down payment for new home' },
        { name: 'Home Renovation', cost: 45000, description: 'Kitchen and bathroom remodel' },
        { name: 'Investment Property', cost: 100000, description: 'Rental property investment' },
        { name: 'Home Repairs', cost: 12000, description: 'Major home maintenance' }
      ]
    },
    transportation: {
      name: 'Transportation',
      icon: '🚗',
      color: 'bg-green-500',
      templates: [
        { name: 'New Car', cost: 35000, description: 'Brand new reliable vehicle' },
        { name: 'Used Car', cost: 18000, description: 'Quality pre-owned vehicle' },
        { name: 'Electric Vehicle', cost: 45000, description: 'Eco-friendly transportation' },
        { name: 'Motorcycle', cost: 12000, description: 'Fun weekend transportation' }
      ]
    },
    personal: {
      name: 'Personal Growth',
      icon: '🌱',
      color: 'bg-yellow-500',
      templates: [
        { name: 'Sabbatical Year', cost: 50000, description: 'Year off for personal growth' },
        { name: 'Advanced Degree', cost: 40000, description: 'Masters or professional degree' },
        { name: 'Skills Training', cost: 8000, description: 'Professional development course' },
        { name: 'Health & Wellness', cost: 15000, description: 'Comprehensive health program' }
      ]
    },
    travel: {
      name: 'Travel & Adventure',
      icon: '✈️',
      color: 'bg-red-500',
      templates: [
        { name: 'World Tour', cost: 25000, description: 'Multi-country adventure' },
        { name: 'European Adventure', cost: 12000, description: 'Three-week Europe trip' },
        { name: 'Safari Experience', cost: 18000, description: 'African wildlife safari' },
        { name: 'Cruise Vacation', cost: 6000, description: 'Luxury cruise experience' }
      ]
    },
    business: {
      name: 'Business & Investment',
      icon: '💼',
      color: 'bg-indigo-500',
      templates: [
        { name: 'Start Business', cost: 75000, description: 'Business startup capital' },
        { name: 'Franchise Investment', cost: 150000, description: 'Franchise opportunity' },
        { name: 'Stock Portfolio', cost: 50000, description: 'Investment portfolio building' },
        { name: 'Emergency Fund', cost: 30000, description: 'Financial safety net' }
      ]
    }
  };

  // Calculate current financial situation
  const currentFinancialSituation = useMemo(() => {
    const disposableIncome = userProfile.monthlyIncome * 0.35; // Assume 35% available for savings
    const yearsToSomeday = northStarDream.targetAge - userProfile.age;
    
    try {
      const retirementCalc = calculateTotalRetirementNeed(
        northStarDream.monthlyLivingExpenses * 12,
        yearsToSomeday,
        30,
        0.03,
        userProfile.age,
        userProfile.currentSavings
      );

      return {
        monthlyDisposableIncome: disposableIncome,
        currentAllocations: {
          foundation: (disposableIncome * currentBucketAllocations.foundation) / 100,
          dream: (disposableIncome * currentBucketAllocations.dream) / 100,
          life: (disposableIncome * currentBucketAllocations.life) / 100
        },
        retirementRequirement: retirementCalc.savingsStrategies.balanced.monthlySavings,
        minimumFoundationPercentage: Math.max(40, (retirementCalc.savingsStrategies.balanced.monthlySavings / disposableIncome) * 100),
        yearsToSomeday,
        currentSomedayDate: new Date(new Date().getFullYear() + yearsToSomeday, new Date().getMonth())
      };
    } catch (error) {
      console.error('Error calculating financial situation:', error);
      return {
        monthlyDisposableIncome: disposableIncome,
        currentAllocations: {
          foundation: disposableIncome * 0.6,
          dream: disposableIncome * 0.25,
          life: disposableIncome * 0.15
        },
        retirementRequirement: disposableIncome * 0.6,
        minimumFoundationPercentage: 60,
        yearsToSomeday,
        currentSomedayDate: new Date(new Date().getFullYear() + yearsToSomeday, new Date().getMonth())
      };
    }
  }, [userProfile, northStarDream, currentBucketAllocations]);

  // Calculate scenarios when milestone changes
  useEffect(() => {
    if (showScenarios && newMilestone.cost > 0 && newMilestone.targetAge > userProfile.age) {
      calculateScenarios();
    }
  }, [newMilestone, showScenarios]);

  // Calculate three scenarios for the new milestone
  const calculateScenarios = async () => {
    setIsCalculating(true);
    
    try {
      const yearsToMilestone = newMilestone.targetAge - userProfile.age;
      const monthsToMilestone = yearsToMilestone * 12;
      const monthlySavingsNeeded = newMilestone.cost / monthsToMilestone;

      // Scenario 1: Increase Savings (maintain timeline)
      const increaseSavingsScenario = calculateIncreaseSavingsScenario(monthlySavingsNeeded);
      
      // Scenario 2: Delay Timeline (maintain current savings)
      const delayTimelineScenario = calculateDelayTimelineScenario(monthlySavingsNeeded);
      
      // Scenario 3: Modify Goal (reduce cost/impact)
      const modifyGoalScenario = calculateModifyGoalScenario();

      setScenarios({
        increaseSavings: increaseSavingsScenario,
        delayTimeline: delayTimelineScenario,
        modifyGoal: modifyGoalScenario
      });
    } catch (error) {
      console.error('Error calculating scenarios:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  // Scenario 1: Increase savings to maintain timeline
  const calculateIncreaseSavingsScenario = (monthlySavingsNeeded) => {
    const currentLifeAllocation = currentFinancialSituation.currentAllocations.life;
    const additionalSavingsNeeded = Math.max(0, monthlySavingsNeeded - currentLifeAllocation);
    
    if (additionalSavingsNeeded === 0) {
      return {
        feasible: true,
        impact: 'none',
        description: 'Your current Life bucket can cover this milestone!',
        changes: {
          monthlyIncrease: 0,
          newAllocations: currentBucketAllocations,
          somedayDate: currentFinancialSituation.currentSomedayDate
        },
        recommendation: 'No changes needed - you\'re already saving enough in your Life bucket.'
      };
    }

    // Check if we can redistribute from Dream bucket
    const availableFromDream = currentFinancialSituation.currentAllocations.dream * 0.5; // Max 50% from dream
    const redistributionAmount = Math.min(additionalSavingsNeeded, availableFromDream);
    const remainingNeeded = additionalSavingsNeeded - redistributionAmount;

    if (remainingNeeded <= 0) {
      // Can achieve through redistribution
      const dreamReduction = (redistributionAmount / currentFinancialSituation.monthlyDisposableIncome) * 100;
      const newDreamAllocation = currentBucketAllocations.dream - dreamReduction;
      const newLifeAllocation = currentBucketAllocations.life + dreamReduction;

      return {
        feasible: true,
        impact: 'moderate',
        description: 'Achievable by temporarily reducing Dream bucket allocation',
        changes: {
          monthlyIncrease: 0,
          newAllocations: {
            foundation: currentBucketAllocations.foundation,
            dream: Math.round(newDreamAllocation * 10) / 10,
            life: Math.round(newLifeAllocation * 10) / 10
          },
          somedayDate: currentFinancialSituation.currentSomedayDate,
          dreamDelay: Math.ceil((redistributionAmount * 12) / currentFinancialSituation.currentAllocations.dream) // months
        },
        recommendation: `Temporarily reduce Dream savings by $${Math.round(redistributionAmount)}/month for ${newMilestone.targetAge - userProfile.age} years.`
      };
    }

    // Need to increase total income/savings
    const incomeIncreaseNeeded = remainingNeeded / 0.7; // Assume 30% goes to taxes/expenses
    
    return {
      feasible: remainingNeeded <= currentFinancialSituation.monthlyDisposableIncome * 0.3,
      impact: 'high',
      description: 'Requires increasing your monthly savings capacity',
      changes: {
        monthlyIncrease: Math.ceil(incomeIncreaseNeeded),
        newAllocations: currentBucketAllocations,
        somedayDate: currentFinancialSituation.currentSomedayDate
      },
      recommendation: `Increase monthly income by $${Math.ceil(incomeIncreaseNeeded)} through side hustle, raise, or expense reduction.`,
      strategies: [
        'Negotiate a salary increase',
        'Start a side business or freelance work',
        'Reduce non-essential expenses',
        'Sell items you no longer need',
        'Take on additional work hours'
      ]
    };
  };

  // Scenario 2: Delay timeline to maintain current savings
  const calculateDelayTimelineScenario = (monthlySavingsNeeded) => {
    const currentLifeAllocation = currentFinancialSituation.currentAllocations.life;
    
    if (monthlySavingsNeeded <= currentLifeAllocation) {
      return {
        feasible: true,
        impact: 'none',
        description: 'No timeline delay needed - Life bucket covers this milestone',
        changes: {
          timelineDelay: 0,
          newSomedayDate: currentFinancialSituation.currentSomedayDate,
          newAllocations: currentBucketAllocations
        },
        recommendation: 'Your current savings plan already accommodates this milestone.'
      };
    }

    // Calculate how much the milestone will delay the someday timeline
    const shortfall = monthlySavingsNeeded - currentLifeAllocation;
    const monthsOfDelay = Math.ceil((newMilestone.cost - (currentLifeAllocation * (newMilestone.targetAge - userProfile.age) * 12)) / currentLifeAllocation);
    const yearsOfDelay = monthsOfDelay / 12;

    const newSomedayDate = new Date(currentFinancialSituation.currentSomedayDate);
    newSomedayDate.setMonth(newSomedayDate.getMonth() + monthsOfDelay);

    return {
      feasible: true,
      impact: yearsOfDelay > 2 ? 'high' : yearsOfDelay > 1 ? 'moderate' : 'low',
      description: `Your someday timeline will be delayed by ${Math.ceil(yearsOfDelay)} year${yearsOfDelay > 1 ? 's' : ''}`,
      changes: {
        timelineDelay: yearsOfDelay,
        newSomedayDate,
        newSomedayAge: northStarDream.targetAge + Math.ceil(yearsOfDelay),
        newAllocations: currentBucketAllocations
      },
      recommendation: `Accept a ${Math.ceil(yearsOfDelay)}-year delay to your someday life to accommodate this milestone.`,
      tradeoffs: [
        `Someday life moves from age ${northStarDream.targetAge} to ${northStarDream.targetAge + Math.ceil(yearsOfDelay)}`,
        'All other financial goals remain on track',
        'No need to increase income or reduce other expenses',
        'Compound growth continues during extended timeline'
      ]
    };
  };

  // Scenario 3: Modify goal to minimize impact
  const calculateModifyGoalScenario = () => {
    const currentLifeAllocation = currentFinancialSituation.currentAllocations.life;
    const yearsToMilestone = newMilestone.targetAge - userProfile.age;
    const maxAffordableWithoutImpact = currentLifeAllocation * yearsToMilestone * 12;

    // Generate cost reduction suggestions based on category
    const category = milestoneCategories[newMilestone.category];
    const alternatives = generateCostAlternatives(newMilestone, maxAffordableWithoutImpact);

    return {
      feasible: true,
      impact: 'low',
      description: 'Modify the goal to fit within your current Life bucket capacity',
      changes: {
        maxAffordableCost: Math.floor(maxAffordableWithoutImpact),
        costReduction: newMilestone.cost - maxAffordableWithoutImpact,
        reductionPercentage: ((newMilestone.cost - maxAffordableWithoutImpact) / newMilestone.cost) * 100,
        newAllocations: currentBucketAllocations,
        somedayDate: currentFinancialSituation.currentSomedayDate
      },
      alternatives,
      recommendation: `Reduce milestone cost by $${Math.ceil(newMilestone.cost - maxAffordableWithoutImpact)} to avoid any impact on your someday timeline.`
    };
  };

  // Generate cost reduction alternatives based on milestone category
  const generateCostAlternatives = (milestone, maxAffordable) => {
    const category = milestone.category;
    const alternatives = [];

    switch (category) {
      case 'transportation':
        alternatives.push(
          { option: 'Buy certified pre-owned instead of new', savings: milestone.cost * 0.3 },
          { option: 'Consider a smaller/more efficient model', savings: milestone.cost * 0.25 },
          { option: 'Lease instead of buy', savings: milestone.cost * 0.4 },
          { option: 'Buy from private seller vs dealership', savings: milestone.cost * 0.15 }
        );
        break;
      case 'housing':
        alternatives.push(
          { option: 'DIY some of the work yourself', savings: milestone.cost * 0.3 },
          { option: 'Phase the project over multiple years', savings: 0, note: 'Spread cost over time' },
          { option: 'Choose mid-range materials vs premium', savings: milestone.cost * 0.25 },
          { option: 'Get multiple contractor quotes', savings: milestone.cost * 0.15 }
        );
        break;
      case 'travel':
        alternatives.push(
          { option: 'Travel during off-peak season', savings: milestone.cost * 0.3 },
          { option: 'Choose alternative destinations', savings: milestone.cost * 0.4 },
          { option: 'Stay in mid-range vs luxury accommodations', savings: milestone.cost * 0.25 },
          { option: 'Book flights and hotels separately', savings: milestone.cost * 0.15 }
        );
        break;
      case 'family':
        alternatives.push(
          { option: 'Smaller, more intimate celebration', savings: milestone.cost * 0.4 },
          { option: 'Off-peak timing (weekday vs weekend)', savings: milestone.cost * 0.2 },
          { option: 'DIY elements (photography, flowers, etc.)', savings: milestone.cost * 0.25 },
          { option: 'Alternative venue options', savings: milestone.cost * 0.3 }
        );
        break;
      default:
        alternatives.push(
          { option: 'Look for more affordable alternatives', savings: milestone.cost * 0.25 },
          { option: 'Phase the goal over multiple years', savings: 0, note: 'Spread cost over time' },
          { option: 'Consider used/refurbished options', savings: milestone.cost * 0.3 },
          { option: 'Shop around for better deals', savings: milestone.cost * 0.15 }
        );
    }

    return alternatives.map(alt => ({
      ...alt,
      newCost: milestone.cost - (alt.savings || 0),
      fitsInBudget: (milestone.cost - (alt.savings || 0)) <= maxAffordable
    }));
  };

  // Handle milestone template selection
  const selectTemplate = (template) => {
    setNewMilestone(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      cost: template.cost
    }));
  };

  // Handle form submission
  const handleAddMilestone = (scenarioType = null) => {
    const milestoneToAdd = {
      ...newMilestone,
      id: `milestone-${Date.now()}`,
      icon: milestoneCategories[newMilestone.category].icon,
      color: milestoneCategories[newMilestone.category].color,
      createdAt: new Date().toISOString()
    };

    let updatedAllocations = currentBucketAllocations;
    
    if (scenarioType && scenarios[scenarioType]) {
      const scenario = scenarios[scenarioType];
      if (scenario.changes.newAllocations) {
        updatedAllocations = scenario.changes.newAllocations;
      }
    }

    onAddMilestone(milestoneToAdd, updatedAllocations);
    
    // Reset form
    setNewMilestone({
      name: '',
      description: '',
      targetAge: userProfile.age + 3,
      cost: 25000,
      category: 'personal',
      priority: 'medium',
      flexibility: 'moderate'
    });
    setShowScenarios(false);
    setSelectedScenario(null);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 ${className}`}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Milestone Planner 🎯
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Add new life goals and see exactly how they impact your someday timeline. 
            We'll show you three ways to make it work.
          </p>
        </div>

        {/* Current Financial Overview */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Your Current Financial Picture</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(currentFinancialSituation.monthlyDisposableIncome)}
              </div>
              <div className="text-sm text-gray-600">Monthly Available</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(currentFinancialSituation.currentAllocations.life)}
              </div>
              <div className="text-sm text-gray-600">Life Bucket</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {northStarDream.targetAge}
              </div>
              <div className="text-sm text-gray-600">Someday Age</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {currentFinancialSituation.minimumFoundationPercentage.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Min Foundation</div>
            </div>
          </div>
        </div>

        {/* Milestone Creation Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Add New Life Milestone</h3>
          
          {/* Category Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose a Category
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(milestoneCategories).map(([key, category]) => (
                <button
                  key={key}
                  onClick={() => setNewMilestone(prev => ({ ...prev, category: key }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    newMilestone.category === key
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                  }`}
                >
                  <div className="text-2xl mb-2">{category.icon}</div>
                  <div className="text-sm font-medium text-gray-800">{category.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Template Selection */}
          {newMilestone.category && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Quick Start Templates (Optional)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {milestoneCategories[newMilestone.category].templates.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => selectTemplate(template)}
                    className="p-4 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-25 transition-all"
                  >
                    <div className="font-medium text-gray-800">{template.name}</div>
                    <div className="text-sm text-gray-600 mb-2">{template.description}</div>
                    <div className="text-lg font-bold text-purple-600">{formatCurrency(template.cost)}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Milestone Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Milestone Name
              </label>
              <input
                type="text"
                value={newMilestone.name}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., European Adventure"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Age
              </label>
              <input
                type="number"
                value={newMilestone.targetAge}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, targetAge: parseInt(e.target.value) || userProfile.age + 1 }))}
                min={userProfile.age + 1}
                max={northStarDream.targetAge - 1}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Cost
              </label>
              <input
                type="number"
                value={newMilestone.cost}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, cost: parseInt(e.target.value) || 0 }))}
                min="1000"
                step="1000"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority Level
              </label>
              <select
                value={newMilestone.priority}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="low">Low - Nice to have</option>
                <option value="medium">Medium - Important to me</option>
                <option value="high">High - Must achieve</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={newMilestone.description}
              onChange={(e) => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this milestone means to you..."
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Analyze Impact Button */}
          <div className="text-center">
            <button
              onClick={() => setShowScenarios(true)}
              disabled={!newMilestone.name || !newMilestone.cost || newMilestone.targetAge <= userProfile.age}
              className="px-8 py-4 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg"
            >
              Analyze Impact & Show Scenarios 🔍
            </button>
          </div>
        </div>

        {/* Scenario Analysis */}
        {showScenarios && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Impact Analysis: {newMilestone.name}
            </h3>

            {isCalculating ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Calculating scenarios...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Scenario Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Scenario 1: Increase Savings */}
                  <div className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                    selectedScenario === 'increaseSavings' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedScenario('increaseSavings')}>
                    <div className="text-center mb-4">
                      <span className="text-3xl mb-2 block">💪</span>
                      <h4 className="text-lg font-bold text-gray-800">Increase Savings</h4>
                      <p className="text-sm text-gray-600">Maintain your someday timeline</p>
                    </div>

                    {scenarios.increaseSavings && (
                      <div className="space-y-3">
                        <div className={`px-3 py-2 rounded-lg text-center ${
                          scenarios.increaseSavings.feasible 
                            ? scenarios.increaseSavings.impact === 'none' ? 'bg-green-100 text-green-800'
                              : scenarios.increaseSavings.impact === 'moderate' ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-orange-100 text-orange-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {scenarios.increaseSavings.feasible ? 'Feasible' : 'Challenging'}
                        </div>
                        
                        <div className="text-sm space-y-2">
                          {scenarios.increaseSavings.changes.monthlyIncrease > 0 && (
                            <div>
                              <span className="font-medium">Monthly increase needed:</span>
                              <div className="text-lg font-bold text-blue-600">
                                +{formatCurrency(scenarios.increaseSavings.changes.monthlyIncrease)}
                              </div>
                            </div>
                          )}
                          
                          {scenarios.increaseSavings.changes.dreamDelay && (
                            <div>
                              <span className="font-medium">Dream delay:</span>
                              <div className="text-sm text-gray-600">
                                {scenarios.increaseSavings.changes.dreamDelay} months
                              </div>
                            </div>
                          )}
                          
                          <div className="text-xs text-gray-500 mt-2">
                            {scenarios.increaseSavings.description}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Scenario 2: Delay Timeline */}
                  <div className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                    selectedScenario === 'delayTimeline' 
                      ? 'border-yellow-500 bg-yellow-50' 
                      : 'border-gray-200 hover:border-yellow-300'
                  }`}
                  onClick={() => setSelectedScenario('delayTimeline')}>
                    <div className="text-center mb-4">
                      <span className="text-3xl mb-2 block">⏰</span>
                      <h4 className="text-lg font-bold text-gray-800">Delay Timeline</h4>
                      <p className="text-sm text-gray-600">Keep current savings rate</p>
                    </div>

                    {scenarios.delayTimeline && (
                      <div className="space-y-3">
                        <div className={`px-3 py-2 rounded-lg text-center ${
                          scenarios.delayTimeline.impact === 'none' ? 'bg-green-100 text-green-800'
                            : scenarios.delayTimeline.impact === 'low' ? 'bg-yellow-100 text-yellow-800'
                            : scenarios.delayTimeline.impact === 'moderate' ? 'bg-orange-100 text-orange-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {scenarios.delayTimeline.impact === 'none' ? 'No Impact' : 
                           scenarios.delayTimeline.impact === 'low' ? 'Minor Delay' :
                           scenarios.delayTimeline.impact === 'moderate' ? 'Moderate Delay' : 'Major Delay'}
                        </div>
                        
                        <div className="text-sm space-y-2">
                          {scenarios.delayTimeline.changes.timelineDelay > 0 ? (
                            <>
                              <div>
                                <span className="font-medium">Someday delay:</span>
                                <div className="text-lg font-bold text-yellow-600">
                                  +{Math.ceil(scenarios.delayTimeline.changes.timelineDelay)} year{scenarios.delayTimeline.changes.timelineDelay > 1 ? 's' : ''}
                                </div>
                              </div>
                              <div>
                                <span className="font-medium">New someday age:</span>
                                <div className="text-sm text-gray-600">
                                  {scenarios.delayTimeline.changes.newSomedayAge}
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="text-green-600 font-medium">
                              No delay needed!
                            </div>
                          )}
                          
                          <div className="text-xs text-gray-500 mt-2">
                            {scenarios.delayTimeline.description}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Scenario 3: Modify Goal */}
                  <div className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                    selectedScenario === 'modifyGoal' 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                  onClick={() => setSelectedScenario('modifyGoal')}>
                    <div className="text-center mb-4">
                      <span className="text-3xl mb-2 block">🎨</span>
                      <h4 className="text-lg font-bold text-gray-800">Modify Goal</h4>
                      <p className="text-sm text-gray-600">Reduce cost or adjust approach</p>
                    </div>

                    {scenarios.modifyGoal && (
                      <div className="space-y-3">
                        <div className="px-3 py-2 rounded-lg text-center bg-green-100 text-green-800">
                          Smart Alternatives
                        </div>
                        
                        <div className="text-sm space-y-2">
                          <div>
                            <span className="font-medium">Max budget:</span>
                            <div className="text-lg font-bold text-green-600">
                              {formatCurrency(scenarios.modifyGoal.changes.maxAffordableCost)}
                            </div>
                          </div>
                          
                          <div>
                            <span className="font-medium">Cost reduction:</span>
                            <div className="text-sm text-gray-600">
                              {formatCurrency(scenarios.modifyGoal.changes.costReduction)} 
                              ({scenarios.modifyGoal.changes.reductionPercentage.toFixed(0)}%)
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-500 mt-2">
                            {scenarios.modifyGoal.description}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Detailed Scenario Information */}
                {selectedScenario && scenarios[selectedScenario] && (
                  <div className="bg-gray-50 rounded-xl p-6 mt-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-4">
                      Detailed Analysis: {
                        selectedScenario === 'increaseSavings' ? 'Increase Savings' :
                        selectedScenario === 'delayTimeline' ? 'Delay Timeline' :
                        'Modify Goal'
                      }
                    </h4>

                    <div className="space-y-4">
                      <p className="text-gray-700">
                        {scenarios[selectedScenario].recommendation}
                      </p>

                      {/* Specific details based on scenario */}
                      {selectedScenario === 'increaseSavings' && scenarios.increaseSavings.strategies && (
                        <div>
                          <h5 className="font-medium text-gray-800 mb-2">Suggested strategies:</h5>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                            {scenarios.increaseSavings.strategies.map((strategy, index) => (
                              <li key={index}>{strategy}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedScenario === 'delayTimeline' && scenarios.delayTimeline.tradeoffs && (
                        <div>
                          <h5 className="font-medium text-gray-800 mb-2">What this means:</h5>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                            {scenarios.delayTimeline.tradeoffs.map((tradeoff, index) => (
                              <li key={index}>{tradeoff}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedScenario === 'modifyGoal' && scenarios.modifyGoal.alternatives && (
                        <div>
                          <h5 className="font-medium text-gray-800 mb-2">Cost-saving alternatives:</h5>
                          <div className="space-y-2">
                            {scenarios.modifyGoal.alternatives.map((alt, index) => (
                              <div key={index} className={`p-3 rounded-lg ${alt.fitsInBudget ? 'bg-green-100' : 'bg-yellow-100'}`}>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-gray-800">{alt.option}</span>
                                  <div className="text-right">
                                    <div className="text-sm font-bold text-gray-800">
                                      {formatCurrency(alt.newCost)}
                                    </div>
                                    {alt.savings > 0 && (
                                      <div className="text-xs text-green-600">
                                        Save {formatCurrency(alt.savings)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {alt.fitsInBudget && (
                                  <div className="text-xs text-green-600 mt-1">
                                    ✓ Fits in your Life bucket
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="pt-4 border-t">
                        <button
                          onClick={() => handleAddMilestone(selectedScenario)}
                          className="w-full px-6 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors"
                        >
                          Add Milestone with This Approach
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Existing Milestones */}
        {existingMilestones.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Your Current Milestones</h3>
            
            <div className="space-y-4">
              {existingMilestones.map((milestone) => (
                <div key={milestone.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${milestone.color} rounded-full flex items-center justify-center text-white text-xl`}>
                      {milestone.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{milestone.name}</h4>
                      <p className="text-sm text-gray-600">{milestone.description}</p>
                      <p className="text-xs text-gray-500">
                        Age {milestone.age} • {milestone.age - userProfile.age} years away
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-800">
                      {formatCurrency(milestone.cost)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency(milestone.cost / ((milestone.age - userProfile.age) * 12))}/month
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MilestonePlanner;
