import React, { useState, useEffect } from 'react';
import { FinancialProfile, UserProfile, NorthStarDream } from '../models/FinancialProfile.js';
import { allocateFunds, compareStrategies } from '../services/bucketAllocator.js';

const CouplesPlanningMode = ({ onComplete, onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [profiles, setProfiles] = useState({
    partner1: null,
    partner2: null,
    combined: null
  });
  const [dreamAnalysis, setDreamAnalysis] = useState(null);
  const [allocations, setAllocations] = useState(null);
  const [negotiatorRecommendations, setNegotiatorRecommendations] = useState([]);
  const [selectedNegotiation, setSelectedNegotiation] = useState(null);

  // Load existing profiles if available
  useEffect(() => {
    loadProfilesFromStorage();
  }, []);

  const loadProfilesFromStorage = () => {
    try {
      const partner1Data = localStorage.getItem('partner1_profile');
      const partner2Data = localStorage.getItem('partner2_profile');
      
      if (partner1Data) {
        const p1 = FinancialProfile.fromJSON(JSON.parse(partner1Data));
        setProfiles(prev => ({ ...prev, partner1: p1 }));
      }
      
      if (partner2Data) {
        const p2 = FinancialProfile.fromJSON(JSON.parse(partner2Data));
        setProfiles(prev => ({ ...prev, partner2: p2 }));
      }
    } catch (error) {
      console.error('Error loading partner profiles:', error);
    }
  };

  const saveProfileToStorage = (partnerId, profile) => {
    localStorage.setItem(`${partnerId}_profile`, JSON.stringify(profile.toJSON()));
  };

  // Create sample profiles for demo purposes
  const createSampleProfiles = () => {
    const johnProfile = new FinancialProfile({
      userProfile: new UserProfile({
        firstName: 'John',
        lastName: 'Smith',
        age: 32,
        income: {
          gross: { annual: 85000, monthly: 7083 },
          net: { annual: 68000, monthly: 5667 },
          taxRate: 0.2
        },
        location: { state: 'Colorado', city: 'Denver' }
      }),
      northStarDream: new NorthStarDream({
        title: 'Waterfront Cottage with Sailboat',
        description: 'A peaceful lakefront cottage in Colorado with a private dock and sailboat',
        targetAge: 62,
        currentAge: 32,
        monthlyLivingExpenses: 4500,
        primaryResidence: {
          targetValue: 750000,
          location: 'Colorado lakefront',
          type: 'cottage',
          desiredFeatures: ['private dock', 'sailboat', 'mountain views', 'fire pit']
        }
      }),
      fixedExpenses: {
        housing: { total: 1800 },
        transportation: { total: 650 },
        insurance: { total: 400 },
        other: { total: 300 }
      },
      variableExpenses: {
        food: 600,
        entertainment: 400,
        healthcare: 300,
        miscellaneous: 350,
        total: 1650
      },
      currentAssets: {
        liquid: { total: 15000 },
        investments: { total: 65000 },
        total: 80000
      }
    });

    const sarahProfile = new FinancialProfile({
      userProfile: new UserProfile({
        firstName: 'Sarah',
        lastName: 'Smith',
        age: 29,
        income: {
          gross: { annual: 72000, monthly: 6000 },
          net: { annual: 57600, monthly: 4800 },
          taxRate: 0.2
        },
        location: { state: 'Colorado', city: 'Denver' }
      }),
      northStarDream: new NorthStarDream({
        title: 'Garden Paradise Homestead',
        description: 'A sustainable homestead with extensive gardens, greenhouse, and space for farming',
        targetAge: 59,
        currentAge: 29,
        monthlyLivingExpenses: 3800,
        primaryResidence: {
          targetValue: 650000,
          location: 'Colorado foothills',
          type: 'farmhouse',
          desiredFeatures: ['large garden', 'greenhouse', 'chicken coop', 'solar panels']
        }
      }),
      fixedExpenses: {
        housing: { total: 1400 },
        transportation: { total: 450 },
        insurance: { total: 350 },
        other: { total: 250 }
      },
      variableExpenses: {
        food: 500,
        entertainment: 300,
        healthcare: 250,
        miscellaneous: 300,
        total: 1350
      },
      currentAssets: {
        liquid: { total: 22000 },
        investments: { total: 45000 },
        total: 67000
      }
    });

    setProfiles({
      partner1: johnProfile,
      partner2: sarahProfile,
      combined: null
    });

    saveProfileToStorage('partner1', johnProfile);
    saveProfileToStorage('partner2', sarahProfile);
  };

  // Intelligent dream merging logic
  const analyzeDreamCompatibility = (p1Dream, p2Dream) => {
    const conflicts = [];
    const synergies = [];
    const compromises = [];

    // Location analysis
    if (p1Dream.primaryResidence.location !== p2Dream.primaryResidence.location) {
      const p1Location = p1Dream.primaryResidence.location.toLowerCase();
      const p2Location = p2Dream.primaryResidence.location.toLowerCase();
      
      if (p1Location.includes('lakefront') && p2Location.includes('foothills')) {
        synergies.push({
          type: 'location',
          description: 'Both want Colorado - lakefront foothills location could provide waterfront access AND gardening space',
          solution: 'Properties near lakes in the Colorado foothills offer the best of both worlds'
        });
      } else {
        conflicts.push({
          type: 'location',
          issue: `${profiles.partner1.userProfile.firstName} wants ${p1Location}, ${profiles.partner2.userProfile.firstName} wants ${p2Location}`,
          severity: 'medium'
        });
      }
    }

    // Property type and features analysis
    const p1Features = p1Dream.primaryResidence.desiredFeatures || [];
    const p2Features = p2Dream.primaryResidence.desiredFeatures || [];
    const sharedFeatures = p1Features.filter(f => p2Features.includes(f));
    const uniqueP1 = p1Features.filter(f => !p2Features.includes(f));
    const uniqueP2 = p2Features.filter(f => !p1Features.includes(f));

    if (sharedFeatures.length > 0) {
      synergies.push({
        type: 'features',
        description: `Both want: ${sharedFeatures.join(', ')}`,
        solution: 'These shared features should be prioritized in your property search'
      });
    }

    // Combine unique features for comprehensive solution
    if (uniqueP1.length > 0 && uniqueP2.length > 0) {
      const boatFeatures = uniqueP1.filter(f => f.includes('dock') || f.includes('sailboat'));
      const gardenFeatures = uniqueP2.filter(f => f.includes('garden') || f.includes('greenhouse'));
      
      if (boatFeatures.length > 0 && gardenFeatures.length > 0) {
        synergies.push({
          type: 'lifestyle',
          description: 'Water activities + gardening = complete sustainable lifestyle',
          solution: 'Lakefront property with southern exposure and rich soil for gardening'
        });
      }
    }

    // Budget analysis
    const budgetDiff = Math.abs(p1Dream.primaryResidence.targetValue - p2Dream.primaryResidence.targetValue);
    const avgBudget = (p1Dream.primaryResidence.targetValue + p2Dream.primaryResidence.targetValue) / 2;
    
    if (budgetDiff > 100000) {
      conflicts.push({
        type: 'budget',
        issue: `$${budgetDiff.toLocaleString()} difference in property budget`,
        severity: 'high'
      });
      
      compromises.push({
        type: 'budget',
        proposal: `Target property value: $${avgBudget.toLocaleString()}`,
        tradeoff: 'Compromise allows for both priorities within realistic budget'
      });
    }

    // Timeline analysis
    const timelineDiff = Math.abs(p1Dream.yearsToGoal - p2Dream.yearsToGoal);
    if (timelineDiff > 3) {
      conflicts.push({
        type: 'timeline',
        issue: `${timelineDiff} year difference in target timeline`,
        severity: 'medium'
      });
    }

    return { conflicts, synergies, compromises };
  };

  // Dream Negotiator - generates compromise scenarios
  const generateNegotiationScenarios = (p1, p2) => {
    const scenarios = [];
    
    // Scenario 1: Phased approach
    scenarios.push({
      id: 'phased',
      title: 'The Phased Dream Approach',
      description: 'Start with land/cottage, add features over time',
      timeline: {
        year1: 'Purchase lakefront property with basic cottage',
        year3: 'Add greenhouse and initial gardens',
        year5: 'Build dock and purchase sailboat',
        year7: 'Complete homestead with full garden infrastructure'
      },
      budgetImpact: {
        initialCost: 525000,
        phase2Cost: 75000,
        phase3Cost: 85000,
        phase4Cost: 65000,
        totalCost: 750000
      },
      benefits: [
        'Lower initial investment',
        'Time to learn and adjust',
        'Both dreams ultimately fulfilled',
        'Reduced financial stress'
      ],
      monthlyAllocation: {
        partner1: { foundation: 850, dream: 1200, life: 400 },
        partner2: { foundation: 720, dream: 1000, life: 350 }
      }
    });

    // Scenario 2: Location compromise
    scenarios.push({
      id: 'location_compromise',
      title: 'The Perfect Location Compromise',
      description: 'Lakefront foothills property combining both visions',
      timeline: {
        targetYear: Math.round((p1.northStarDream.yearsToGoal + p2.northStarDream.yearsToGoal) / 2),
        features: 'Combined property with lake access and gardening land'
      },
      budgetImpact: {
        propertyValue: 700000,
        improvements: 100000,
        totalCost: 800000
      },
      benefits: [
        'Both get core desires fulfilled',
        'Shared timeline reduces pressure',
        'Property value optimization',
        'Unified vision moves faster'
      ],
      tradeoffs: [
        'Slightly higher total cost',
        'Requires finding specific property type',
        'May need more rural location'
      ],
      monthlyAllocation: {
        partner1: { foundation: 900, dream: 1400, life: 450 },
        partner2: { foundation: 750, dream: 1200, life: 400 }
      }
    });

    // Scenario 3: Accelerated approach
    scenarios.push({
      id: 'accelerated',
      title: 'The Accelerated Dream',
      description: 'Higher savings rate to achieve dreams 3 years earlier',
      timeline: {
        targetYear: Math.min(p1.northStarDream.yearsToGoal, p2.northStarDream.yearsToGoal) - 3,
        approach: 'Aggressive savings and strategic compromises'
      },
      budgetImpact: {
        monthlyIncrease: 800,
        totalSavings: 150000,
        dreamValue: 650000
      },
      benefits: [
        'Dreams achieved much earlier',
        'More years to enjoy lifestyle',
        'Reduced total interest costs',
        'Higher motivation through urgency'
      ],
      requirements: [
        'Reduce current lifestyle expenses by $400/month',
        'Take on side income or promotions',
        'Delay some discretionary spending',
        'Focus on high-impact dream elements'
      ],
      monthlyAllocation: {
        partner1: { foundation: 750, dream: 1600, life: 300 },
        partner2: { foundation: 650, dream: 1400, life: 250 }
      }
    });

    return scenarios;
  };

  // Create combined financial profile
  const createCombinedProfile = (p1, p2) => {
    const combinedIncome = {
      gross: {
        annual: p1.userProfile.income.gross.annual + p2.userProfile.income.gross.annual,
        monthly: p1.userProfile.getMonthlyGrossIncome() + p2.userProfile.getMonthlyGrossIncome()
      },
      net: {
        annual: p1.userProfile.income.net.annual + p2.userProfile.income.net.annual,
        monthly: p1.userProfile.getMonthlyNetIncome() + p2.userProfile.getMonthlyNetIncome()
      },
      taxRate: (p1.userProfile.income.taxRate + p2.userProfile.income.taxRate) / 2
    };

    const combinedExpenses = {
      housing: { total: Math.max(p1.fixedExpenses.housing.total, p2.fixedExpenses.housing.total) },
      transportation: { total: p1.fixedExpenses.transportation.total + p2.fixedExpenses.transportation.total },
      insurance: { total: p1.fixedExpenses.insurance.total + p2.fixedExpenses.insurance.total },
      other: { total: p1.fixedExpenses.other.total + p2.fixedExpenses.other.total }
    };

    const combinedVariableExpenses = {
      food: p1.variableExpenses.food + p2.variableExpenses.food,
      entertainment: p1.variableExpenses.entertainment + p2.variableExpenses.entertainment,
      healthcare: p1.variableExpenses.healthcare + p2.variableExpenses.healthcare,
      miscellaneous: p1.variableExpenses.miscellaneous + p2.variableExpenses.miscellaneous,
      total: p1.variableExpenses.total + p2.variableExpenses.total
    };

    const combinedAssets = {
      liquid: { total: p1.currentAssets.liquid.total + p2.currentAssets.liquid.total },
      investments: { total: p1.currentAssets.investments.total + p2.currentAssets.investments.total },
      total: p1.currentAssets.total + p2.currentAssets.total
    };

    // Create a merged dream that combines both visions
    const mergedDream = new NorthStarDream({
      title: 'Lakefront Garden Paradise',
      description: 'A sustainable lakefront homestead with sailing access, extensive gardens, and peaceful mountain views',
      targetAge: Math.round((p1.northStarDream.targetAge + p2.northStarDream.targetAge) / 2),
      currentAge: Math.round((p1.userProfile.age + p2.userProfile.age) / 2),
      monthlyLivingExpenses: (p1.northStarDream.monthlyLivingExpenses + p2.northStarDream.monthlyLivingExpenses) / 2,
      primaryResidence: {
        targetValue: (p1.northStarDream.primaryResidence.targetValue + p2.northStarDream.primaryResidence.targetValue) / 2,
        location: 'Colorado lakefront foothills',
        type: 'lakefront homestead',
        desiredFeatures: [
          ...p1.northStarDream.primaryResidence.desiredFeatures,
          ...p2.northStarDream.primaryResidence.desiredFeatures
        ]
      }
    });

    return new FinancialProfile({
      userProfile: new UserProfile({
        firstName: `${p1.userProfile.firstName} & ${p2.userProfile.firstName}`,
        lastName: p1.userProfile.lastName,
        age: Math.round((p1.userProfile.age + p2.userProfile.age) / 2),
        income: combinedIncome,
        location: p1.userProfile.location
      }),
      northStarDream: mergedDream,
      fixedExpenses: combinedExpenses,
      variableExpenses: combinedVariableExpenses,
      currentAssets: combinedAssets
    });
  };

  // Calculate coordinated allocations
  const calculateCoordinatedAllocations = (p1, p2, combined) => {
    const p1Disposable = p1.calculateDisposableIncome();
    const p2Disposable = p2.calculateDisposableIncome();
    const combinedDisposable = combined.calculateDisposableIncome();

    const p1Allocation = allocateFunds(p1Disposable, p1, 'balanced');
    const p2Allocation = allocateFunds(p2Disposable, p2, 'balanced');
    const combinedAllocation = allocateFunds(combinedDisposable, combined, 'balanced');

    return {
      individual: { partner1: p1Allocation, partner2: p2Allocation },
      combined: combinedAllocation,
      coordination: {
        totalFoundation: p1Allocation.foundation + p2Allocation.foundation,
        totalDream: p1Allocation.dream + p2Allocation.dream,
        totalLife: p1Allocation.life + p2Allocation.life,
        efficiency: Math.round(((combinedAllocation.total) / (p1Allocation.total + p2Allocation.total)) * 100)
      }
    };
  };

  const handleStepNext = () => {
    if (currentStep === 1 && (!profiles.partner1 || !profiles.partner2)) {
      createSampleProfiles();
    }
    
    if (currentStep === 2 && profiles.partner1 && profiles.partner2) {
      const combined = createCombinedProfile(profiles.partner1, profiles.partner2);
      const analysis = analyzeDreamCompatibility(
        profiles.partner1.northStarDream,
        profiles.partner2.northStarDream
      );
      const allocations = calculateCoordinatedAllocations(profiles.partner1, profiles.partner2, combined);
      const negotiations = generateNegotiationScenarios(profiles.partner1, profiles.partner2);

      setProfiles(prev => ({ ...prev, combined }));
      setDreamAnalysis(analysis);
      setAllocations(allocations);
      setNegotiatorRecommendations(negotiations);
    }

    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handleStepBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const ProgressIndicator = () => (
    <div className="mb-8">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Couples Financial Planning</h2>
        <p className="text-gray-600">Step {currentStep} of 4</p>
      </div>
      
      <div className="flex justify-center items-center space-x-4">
        {[1, 2, 3, 4].map((step) => (
          <React.Fragment key={step}>
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center font-semibold
              transition-all duration-300 ${
                step === currentStep 
                  ? 'bg-purple-500 text-white scale-110' 
                  : step < currentStep 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
              }
            `}>
              {step < currentStep ? '✓' : step}
            </div>
            {step < 4 && (
              <div className={`
                w-16 h-1 transition-all duration-300 ${
                  step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                }
              `} />
            )}
          </React.Fragment>
        ))}
      </div>
      
      <div className="flex justify-center mt-2 text-sm text-gray-600">
        <div className="flex space-x-12">
          <span className={currentStep === 1 ? 'font-semibold text-purple-600' : ''}>Profiles</span>
          <span className={currentStep === 2 ? 'font-semibold text-purple-600' : ''}>Dreams</span>
          <span className={currentStep === 3 ? 'font-semibold text-purple-600' : ''}>Strategy</span>
          <span className={currentStep === 4 ? 'font-semibold text-purple-600' : ''}>Plan</span>
        </div>
      </div>
    </div>
  );

  const renderProfilesStep = () => (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-gray-800 mb-4">Partner Financial Profiles</h3>
        <p className="text-lg text-gray-600">
          {profiles.partner1 ? 'Review and adjust partner profiles' : 'Create profiles for both partners to begin planning together'}
        </p>
      </div>

      {!profiles.partner1 ? (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">💕</div>
          <h4 className="text-2xl font-bold text-gray-800 mb-4">Ready to Plan Together?</h4>
          <p className="text-gray-600 mb-6">
            Let's create sample profiles to demonstrate how couples can coordinate their financial dreams.
          </p>
          <button
            onClick={createSampleProfiles}
            className="px-8 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-colors"
          >
            Create Sample Couple Profiles
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Partner 1 Profile */}
          <div className="bg-blue-50 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {profiles.partner1.userProfile.firstName[0]}
              </div>
              <div className="ml-4">
                <h4 className="text-xl font-bold text-blue-800">{profiles.partner1.userProfile.getFullName()}</h4>
                <p className="text-blue-600">Age {profiles.partner1.userProfile.age}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-blue-700 font-medium">Annual Income:</span>
                <span className="text-blue-800 font-bold">${profiles.partner1.userProfile.income.gross.annual.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 font-medium">Monthly Disposable:</span>
                <span className="text-blue-800 font-bold">${profiles.partner1.calculateDisposableIncome().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 font-medium">Current Assets:</span>
                <span className="text-blue-800 font-bold">${profiles.partner1.currentAssets.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-blue-200">
              <h5 className="font-semibold text-blue-800 mb-2">Dream:</h5>
              <p className="text-blue-700 text-sm">{profiles.partner1.northStarDream.title}</p>
              <p className="text-blue-600 text-xs mt-1">Target: Age {profiles.partner1.northStarDream.targetAge}</p>
            </div>
          </div>

          {/* Partner 2 Profile */}
          <div className="bg-pink-50 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {profiles.partner2.userProfile.firstName[0]}
              </div>
              <div className="ml-4">
                <h4 className="text-xl font-bold text-pink-800">{profiles.partner2.userProfile.getFullName()}</h4>
                <p className="text-pink-600">Age {profiles.partner2.userProfile.age}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-pink-700 font-medium">Annual Income:</span>
                <span className="text-pink-800 font-bold">${profiles.partner2.userProfile.income.gross.annual.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-pink-700 font-medium">Monthly Disposable:</span>
                <span className="text-pink-800 font-bold">${profiles.partner2.calculateDisposableIncome().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-pink-700 font-medium">Current Assets:</span>
                <span className="text-pink-800 font-bold">${profiles.partner2.currentAssets.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-pink-200">
              <h5 className="font-semibold text-pink-800 mb-2">Dream:</h5>
              <p className="text-pink-700 text-sm">{profiles.partner2.northStarDream.title}</p>
              <p className="text-pink-600 text-xs mt-1">Target: Age {profiles.partner2.northStarDream.targetAge}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end mt-8">
        <button
          onClick={handleStepNext}
          disabled={!profiles.partner1 || !profiles.partner2}
          className="px-8 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Analyze Dreams Together →
        </button>
      </div>
    </div>
  );

  const renderDreamAnalysis = () => (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-gray-800 mb-4">Dream Compatibility Analysis</h3>
        <p className="text-lg text-gray-600">
          Let's see how your individual dreams can merge into something even better together
        </p>
      </div>

      {dreamAnalysis && (
        <div className="space-y-8">
          {/* Synergies */}
          {dreamAnalysis.synergies.length > 0 && (
            <div className="bg-green-50 rounded-xl p-6">
              <h4 className="text-xl font-bold text-green-800 mb-4 flex items-center">
                <span className="mr-2">🤝</span>
                Perfect Synergies
              </h4>
              {dreamAnalysis.synergies.map((synergy, index) => (
                <div key={index} className="mb-4 last:mb-0">
                  <h5 className="font-semibold text-green-700 capitalize">{synergy.type}:</h5>
                  <p className="text-green-600 text-sm mt-1">{synergy.description}</p>
                  <p className="text-green-700 text-sm font-medium mt-2">💡 {synergy.solution}</p>
                </div>
              ))}
            </div>
          )}

          {/* Dream Integration */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
            <h4 className="text-xl font-bold text-purple-800 mb-4 flex items-center">
              <span className="mr-2">✨</span>
              Your Merged Dream
            </h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-bold text-purple-700 mb-2">{profiles.combined?.northStarDream.title}</h5>
                <p className="text-purple-600 text-sm mb-4">{profiles.combined?.northStarDream.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-purple-700 font-medium">Target Value:</span>
                    <span className="text-purple-800 font-bold">${profiles.combined?.northStarDream.primaryResidence.targetValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-700 font-medium">Target Age:</span>
                    <span className="text-purple-800 font-bold">{profiles.combined?.northStarDream.targetAge}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-700 font-medium">Monthly Living:</span>
                    <span className="text-purple-800 font-bold">${profiles.combined?.northStarDream.monthlyLivingExpenses.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="font-bold text-purple-700 mb-2">Combined Features:</h5>
                <div className="grid grid-cols-2 gap-2">
                  {profiles.combined?.northStarDream.primaryResidence.desiredFeatures.map((feature, index) => (
                    <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Conflicts & Solutions */}
          {dreamAnalysis.conflicts.length > 0 && (
            <div className="bg-yellow-50 rounded-xl p-6">
              <h4 className="text-xl font-bold text-yellow-800 mb-4 flex items-center">
                <span className="mr-2">⚖️</span>
                Areas for Negotiation
              </h4>
              {dreamAnalysis.conflicts.map((conflict, index) => (
                <div key={index} className="mb-4 last:mb-0 p-4 bg-yellow-100 rounded-lg">
                  <h5 className="font-semibold text-yellow-700 capitalize">{conflict.type} Difference:</h5>
                  <p className="text-yellow-600 text-sm mt-1">{conflict.issue}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${
                    conflict.severity === 'high' ? 'bg-red-100 text-red-700' :
                    conflict.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {conflict.severity} priority
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between mt-8">
        <button
          onClick={handleStepBack}
          className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
        >
          ← Back to Profiles
        </button>
        <button
          onClick={handleStepNext}
          className="px-8 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-colors"
        >
          Find Solutions →
        </button>
      </div>
    </div>
  );

  const renderNegotiator = () => (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-gray-800 mb-4">🎯 Dream Negotiator</h3>
        <p className="text-lg text-gray-600">
          Smart compromise scenarios that help you both win
        </p>
      </div>

      <div className="space-y-6">
        {negotiatorRecommendations.map((scenario, index) => (
          <div
            key={scenario.id}
            onClick={() => setSelectedNegotiation(selectedNegotiation === scenario.id ? null : scenario.id)}
            className={`
              cursor-pointer rounded-xl p-6 transition-all duration-300 border-2
              ${selectedNegotiation === scenario.id 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-200 hover:border-purple-300 bg-gray-50 hover:bg-purple-25'
              }
            `}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-xl font-bold text-gray-800">{scenario.title}</h4>
                <p className="text-gray-600 mt-1">{scenario.description}</p>
              </div>
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center transition-colors
                ${selectedNegotiation === scenario.id ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-500'}
              `}>
                {selectedNegotiation === scenario.id ? '−' : '+'}
              </div>
            </div>

            {selectedNegotiation === scenario.id && (
              <div className="mt-6 space-y-6">
                {/* Timeline */}
                {scenario.timeline && (
                  <div className="bg-white rounded-lg p-4">
                    <h5 className="font-bold text-purple-800 mb-3">Timeline & Approach:</h5>
                    {typeof scenario.timeline === 'object' && !scenario.timeline.targetYear ? (
                      Object.entries(scenario.timeline).map(([key, value], i) => (
                        <div key={i} className="flex items-center mb-2 last:mb-0">
                          <span className="w-16 text-sm font-medium text-purple-700 capitalize">{key}:</span>
                          <span className="text-gray-700 text-sm">{value}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-700 text-sm">
                        <p><strong>Target:</strong> {scenario.timeline.targetYear} years</p>
                        <p><strong>Approach:</strong> {scenario.timeline.approach || scenario.timeline.features}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Budget Impact */}
                <div className="bg-white rounded-lg p-4">
                  <h5 className="font-bold text-purple-800 mb-3">Financial Impact:</h5>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {Object.entries(scenario.budgetImpact).map(([key, value], i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <span className="font-semibold text-gray-800">
                          {typeof value === 'number' ? `$${value.toLocaleString()}` : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Monthly Allocations */}
                {scenario.monthlyAllocation && (
                  <div className="bg-white rounded-lg p-4">
                    <h5 className="font-bold text-purple-800 mb-3">Coordinated Monthly Allocations:</h5>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded p-3">
                        <h6 className="font-semibold text-blue-800 mb-2">{profiles.partner1?.userProfile.firstName}:</h6>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-blue-700">Foundation:</span>
                            <span className="font-medium text-blue-800">${scenario.monthlyAllocation.partner1.foundation}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">Dream:</span>
                            <span className="font-medium text-blue-800">${scenario.monthlyAllocation.partner1.dream}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">Life:</span>
                            <span className="font-medium text-blue-800">${scenario.monthlyAllocation.partner1.life}</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-pink-50 rounded p-3">
                        <h6 className="font-semibold text-pink-800 mb-2">{profiles.partner2?.userProfile.firstName}:</h6>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-pink-700">Foundation:</span>
                            <span className="font-medium text-pink-800">${scenario.monthlyAllocation.partner2.foundation}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-pink-700">Dream:</span>
                            <span className="font-medium text-pink-800">${scenario.monthlyAllocation.partner2.dream}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-pink-700">Life:</span>
                            <span className="font-medium text-pink-800">${scenario.monthlyAllocation.partner2.life}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Benefits */}
                <div className="bg-white rounded-lg p-4">
                  <h5 className="font-bold text-purple-800 mb-3">Why This Works:</h5>
                  <ul className="space-y-2">
                    {scenario.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-green-500 mr-2 mt-1">✓</span>
                        <span className="text-gray-700 text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tradeoffs/Requirements */}
                {(scenario.tradeoffs || scenario.requirements) && (
                  <div className="bg-white rounded-lg p-4">
                    <h5 className="font-bold text-purple-800 mb-3">
                      {scenario.tradeoffs ? 'Trade-offs:' : 'Requirements:'}
                    </h5>
                    <ul className="space-y-2">
                      {(scenario.tradeoffs || scenario.requirements).map((item, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-yellow-500 mr-2 mt-1">⚠</span>
                          <span className="text-gray-700 text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={handleStepBack}
          className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
        >
          ← Back to Analysis
        </button>
        <button
          onClick={handleStepNext}
          className="px-8 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-colors"
        >
          Create Action Plan →
        </button>
      </div>
    </div>
  );

  const renderFinalPlan = () => (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-gray-800 mb-4">🎉 Your Couples Financial Plan</h3>
        <p className="text-lg text-gray-600">
          Coordinated strategy to achieve your shared someday life
        </p>
      </div>

      {allocations && (
        <div className="space-y-8">
          {/* Combined Overview */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
            <h4 className="text-xl font-bold text-purple-800 mb-4">Combined Household Power</h4>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  ${(profiles.partner1?.userProfile.income.gross.annual + profiles.partner2?.userProfile.income.gross.annual).toLocaleString()}
                </div>
                <div className="text-purple-700 font-medium">Combined Income</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  ${allocations.combined.total.toLocaleString()}
                </div>
                <div className="text-purple-700 font-medium">Monthly Savings Power</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {allocations.coordination.efficiency}%
                </div>
                <div className="text-purple-700 font-medium">Efficiency Gain</div>
              </div>
            </div>
          </div>

          {/* Three Bucket Coordination */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Foundation Bucket */}
            <div className="bg-green-50 rounded-xl p-6">
              <h4 className="text-xl font-bold text-green-800 mb-4 flex items-center">
                <span className="mr-2">🏗️</span>
                Foundation
              </h4>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ${allocations.coordination.totalFoundation.toLocaleString()}
                  </div>
                  <div className="text-green-700 text-sm">Combined Monthly</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-green-700 text-sm">{profiles.partner1?.userProfile.firstName}:</span>
                    <span className="font-semibold text-green-800">${allocations.individual.partner1.foundation}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-700 text-sm">{profiles.partner2?.userProfile.firstName}:</span>
                    <span className="font-semibold text-green-800">${allocations.individual.partner2.foundation}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-green-200">
                  <div className="text-green-700 text-sm">
                    <strong>Strategy:</strong> Combined retirement accounts, tax optimization, long-term wealth building
                  </div>
                </div>
              </div>
            </div>

            {/* Dream Bucket */}
            <div className="bg-purple-50 rounded-xl p-6">
              <h4 className="text-xl font-bold text-purple-800 mb-4 flex items-center">
                <span className="mr-2">✨</span>
                Dream
              </h4>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    ${allocations.coordination.totalDream.toLocaleString()}
                  </div>
                  <div className="text-purple-700 text-sm">Combined Monthly</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-700 text-sm">{profiles.partner1?.userProfile.firstName}:</span>
                    <span className="font-semibold text-purple-800">${allocations.individual.partner1.dream}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-700 text-sm">{profiles.partner2?.userProfile.firstName}:</span>
                    <span className="font-semibold text-purple-800">${allocations.individual.partner2.dream}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-purple-200">
                  <div className="text-purple-700 text-sm">
                    <strong>Goal:</strong> {profiles.combined?.northStarDream.title} by age {profiles.combined?.northStarDream.targetAge}
                  </div>
                </div>
              </div>
            </div>

            {/* Life Bucket */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h4 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
                <span className="mr-2">🌟</span>
                Life
              </h4>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    ${allocations.coordination.totalLife.toLocaleString()}
                  </div>
                  <div className="text-blue-700 text-sm">Combined Monthly</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700 text-sm">{profiles.partner1?.userProfile.firstName}:</span>
                    <span className="font-semibold text-blue-800">${allocations.individual.partner1.life}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700 text-sm">{profiles.partner2?.userProfile.firstName}:</span>
                    <span className="font-semibold text-blue-800">${allocations.individual.partner2.life}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-blue-200">
                  <div className="text-blue-700 text-sm">
                    <strong>Purpose:</strong> Emergency fund, opportunities, flexibility
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Smart Coordination Insights */}
          <div className="bg-yellow-50 rounded-xl p-6">
            <h4 className="text-xl font-bold text-yellow-800 mb-4 flex items-center">
              <span className="mr-2">🧠</span>
              Smart Coordination Benefits
            </h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-semibold text-yellow-700 mb-2">Efficiency Gains:</h5>
                <ul className="text-yellow-700 text-sm space-y-1">
                  <li>• Shared housing costs reduce individual burden</li>
                  <li>• Combined investment accounts for better rates</li>
                  <li>• Dual income reduces individual risk</li>
                  <li>• Tax optimization through joint filing</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-yellow-700 mb-2">Dream Synergies:</h5>
                <ul className="text-yellow-700 text-sm space-y-1">
                  <li>• Lakefront + gardening = sustainable lifestyle</li>
                  <li>• Water activities + outdoor living</li>
                  <li>• Shared property maintenance and costs</li>
                  <li>• Combined timeline accelerates both dreams</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-xl font-bold text-gray-800 mb-4">🎯 Next Steps</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-semibold text-gray-700 mb-2">This Month:</h5>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>✓ Set up joint savings accounts for dream bucket</li>
                  <li>✓ Review and optimize current investment allocations</li>
                  <li>✓ Research properties in Colorado lakefront foothills</li>
                  <li>✓ Create shared budget tracking system</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-gray-700 mb-2">Next 3 Months:</h5>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>✓ Visit potential areas and properties</li>
                  <li>✓ Automate coordinated savings transfers</li>
                  <li>✓ Meet with financial advisor for tax optimization</li>
                  <li>✓ Start planning specific dream timeline</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-8">
        <button
          onClick={handleStepBack}
          className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
        >
          ← Back to Negotiator
        </button>
        <button
          onClick={() => onComplete && onComplete()}
          className="px-8 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
        >
          Start Your Journey Together! 🚀
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <ProgressIndicator />
        
        {currentStep === 1 && renderProfilesStep()}
        {currentStep === 2 && renderDreamAnalysis()}
        {currentStep === 3 && renderNegotiator()}
        {currentStep === 4 && renderFinalPlan()}
      </div>
    </div>
  );
};

export default CouplesPlanningMode;
