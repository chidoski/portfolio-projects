import React, { useState, useEffect, useMemo } from 'react';
import { calculateWithKids } from '../services/familyFinancialDynamics.js';
import { allocateFunds } from '../services/bucketAllocator.js';
import { FinancialProfile, UserProfile, NorthStarDream } from '../models/FinancialProfile.js';

const FamilyMilestoneIntegrator = ({ 
  parentProfile, 
  children = [], 
  onTimelineUpdate,
  className = "" 
}) => {
  const [selectedScenario, setSelectedScenario] = useState('baseline');
  const [scenarioParams, setScenarioParams] = useState({});
  const [timelineData, setTimelineData] = useState(null);
  const [milestoneImpacts, setMilestoneImpacts] = useState([]);

  // Sample data if no props provided
  const defaultParentProfile = useMemo(() => new FinancialProfile({
    userProfile: new UserProfile({
      firstName: 'Sarah',
      lastName: 'Johnson',
      age: 42,
      income: {
        gross: { annual: 95000, monthly: 7917 },
        net: { annual: 76000, monthly: 6333 },
        taxRate: 0.2
      },
      location: { state: 'Maine', city: 'Portland' }
    }),
    northStarDream: new NorthStarDream({
      title: 'Maine Coastal Cottage',
      description: 'A peaceful seaside cottage with ocean views and a cozy reading nook',
      targetAge: 62,
      currentAge: 42,
      monthlyLivingExpenses: 4200,
      primaryResidence: {
        targetValue: 650000,
        location: 'Maine Coast',
        type: 'cottage',
        desiredFeatures: ['ocean views', 'reading nook', 'garden', 'fireplace']
      }
    }),
    fixedExpenses: {
      housing: { total: 2200 },
      transportation: { total: 550 },
      insurance: { total: 450 },
      other: { total: 300 }
    },
    variableExpenses: {
      food: 600,
      entertainment: 350,
      healthcare: 280,
      miscellaneous: 370,
      total: 1600
    },
    currentAssets: {
      liquid: { total: 25000 },
      investments: { total: 185000 },
      total: 210000
    }
  }), []);

  const defaultChildren = useMemo(() => [
    {
      id: 'emma',
      name: 'Emma',
      age: 16,
      milestones: [
        { type: 'graduation', age: 18, description: 'High school graduation' },
        { type: 'college_start', age: 18, description: 'College begins' },
        { type: 'college_end', age: 22, description: 'College graduation' },
        { type: 'independence', age: 24, description: 'Financial independence' }
      ],
      collegePlans: {
        attending: true,
        type: 'private',
        estimatedCost: 55000,
        duration: 4
      }
    },
    {
      id: 'max',
      name: 'Max',
      age: 14,
      milestones: [
        { type: 'graduation', age: 18, description: 'High school graduation' },
        { type: 'college_start', age: 18, description: 'College begins' },
        { type: 'college_end', age: 22, description: 'College graduation' },
        { type: 'independence', age: 24, description: 'Financial independence' }
      ],
      collegePlans: {
        attending: true,
        type: 'state',
        estimatedCost: 25000,
        duration: 4
      }
    }
  ], []);

  const profile = parentProfile || defaultParentProfile;
  const kids = children.length > 0 ? children : defaultChildren;

  // Scenario definitions
  const scenarios = {
    baseline: {
      title: 'Current Plan',
      description: 'Original education and timeline plans',
      icon: '📋',
      changes: {}
    },
    scholarships: {
      title: 'Scholarship Success',
      description: 'What if they get substantial scholarships?',
      icon: '🎓',
      changes: {
        scholarshipPercentage: 60, // 60% scholarship coverage
        description: 'Merit scholarships cover 60% of college costs'
      }
    },
    state_schools: {
      title: 'State School Path',
      description: 'What if they choose state schools over private?',
      icon: '🏛️',
      changes: {
        forceStateSchool: true,
        description: 'All children attend in-state public universities'
      }
    },
    downsizing: {
      title: 'Empty Nest Downsize',
      description: 'What if you downsize when they leave?',
      icon: '🏡',
      changes: {
        downsizeAt: 'empty_nest',
        downsizeAmount: 200000, // $200k equity release
        description: 'Sell current home and downsize when children leave'
      }
    },
    community_start: {
      title: 'Community College First',
      description: 'What if they start at community college?',
      icon: '🎯',
      changes: {
        communityFirst: true,
        transferAfter: 2,
        description: '2 years community college, then transfer to 4-year'
      }
    },
    gap_years: {
      title: 'Gap Year Strategy',
      description: 'What if they take gap years to work/save?',
      icon: '🗓️',
      changes: {
        gapYears: 1,
        gapYearEarnings: 25000,
        description: 'One gap year working before college'
      }
    }
  };

  // Calculate timeline impacts for different scenarios
  const calculateScenarioImpact = (scenario) => {
    const changes = scenarios[scenario].changes;
    let adjustedKids = [...kids];
    let adjustedProfile = { ...profile };
    
    // Apply scenario changes
    if (changes.scholarshipPercentage) {
      adjustedKids = adjustedKids.map(child => ({
        ...child,
        collegePlans: {
          ...child.collegePlans,
          estimatedCost: child.collegePlans.estimatedCost * (1 - changes.scholarshipPercentage / 100)
        }
      }));
    }
    
    if (changes.forceStateSchool) {
      adjustedKids = adjustedKids.map(child => ({
        ...child,
        collegePlans: {
          ...child.collegePlans,
          type: 'state',
          estimatedCost: 25000
        }
      }));
    }
    
    if (changes.communityFirst) {
      adjustedKids = adjustedKids.map(child => ({
        ...child,
        collegePlans: {
          ...child.collegePlans,
          estimatedCost: (8000 * 2) + (child.collegePlans.estimatedCost * 2) // 2 years CC + 2 years university
        }
      }));
    }
    
    if (changes.gapYears) {
      adjustedKids = adjustedKids.map(child => ({
        ...child,
        milestones: child.milestones.map(milestone => ({
          ...milestone,
          age: milestone.type.includes('college') ? milestone.age + changes.gapYears : milestone.age
        })),
        collegePlans: {
          ...child.collegePlans,
          estimatedCost: child.collegePlans.estimatedCost - changes.gapYearEarnings
        }
      }));
    }
    
    if (changes.downsizeAt === 'empty_nest') {
      // Calculate when empty nest occurs
      const latestIndependence = Math.max(...adjustedKids.map(child => 
        child.milestones.find(m => m.type === 'independence')?.age || 24
      ));
      const emptyNestYear = latestIndependence - profile.userProfile.age;
      
      // Add windfall to profile at empty nest year
      adjustedProfile = {
        ...adjustedProfile,
        plannedWindfalls: [{
          year: emptyNestYear,
          amount: changes.downsizeAmount,
          description: 'Home downsizing proceeds'
        }]
      };
    }
    
    return { adjustedKids, adjustedProfile, changes };
  };

  // Calculate college costs and timeline impact
  const calculateCollegeImpact = (kidsData, profileData) => {
    const currentAge = profileData.userProfile.age;
    const originalDreamAge = profileData.northStarDream.targetAge;
    const originalYearsToGoal = originalDreamAge - currentAge;
    
    // Calculate total college costs and timing
    let totalCollegeCosts = 0;
    let collegeYears = [];
    
    kidsData.forEach((child, index) => {
      const collegeStart = child.milestones.find(m => m.type === 'college_start')?.age || 18;
      const collegeDuration = child.collegePlans.duration || 4;
      const annualCost = child.collegePlans.estimatedCost || 25000;
      
      for (let year = 0; year < collegeDuration; year++) {
        const childAge = collegeStart + year;
        const parentAge = currentAge + (childAge - child.age);
        
        if (parentAge >= currentAge) {
          collegeYears.push({
            year: parentAge - currentAge,
            parentAge,
            childName: child.name,
            cost: annualCost,
            description: `${child.name}'s ${year === 0 ? 'freshman' : year === 1 ? 'sophomore' : year === 2 ? 'junior' : 'senior'} year`
          });
          totalCollegeCosts += annualCost;
        }
      }
    });
    
    // Calculate available capacity
    const baseDisposable = profileData.calculateDisposableIncome();
    const baseAllocation = allocateFunds(baseDisposable, profileData, 'balanced');
    
    // Estimate impact on dream timeline
    const averageAnnualCollegeCost = totalCollegeCosts / Math.max(1, collegeYears.length / 4);
    const monthlyCollegeImpact = averageAnnualCollegeCost / 12;
    
    // Reduce dream allocation during college years
    const adjustedDreamAllocation = Math.max(0, baseAllocation.dream - monthlyCollegeImpact * 0.8);
    const dreamReductionRatio = adjustedDreamAllocation / baseAllocation.dream;
    
    // Calculate new timeline
    const requiredNetWorth = profileData.northStarDream.calculateRequiredNetWorth();
    const currentNetWorth = profileData.currentAssets.netWorth || 0;
    const monthlyGrowthRate = 0.07 / 12; // 7% annual growth
    
    // Simplified timeline calculation
    let adjustedYearsToGoal = originalYearsToGoal;
    if (dreamReductionRatio < 1) {
      const delayFactor = 1 / dreamReductionRatio;
      adjustedYearsToGoal = Math.ceil(originalYearsToGoal * delayFactor);
    }
    
    // Apply windfall benefits if any
    if (profileData.plannedWindfalls) {
      profileData.plannedWindfalls.forEach(windfall => {
        const yearsUntilWindfall = windfall.year;
        if (yearsUntilWindfall < adjustedYearsToGoal) {
          // Windfall accelerates timeline
          const windfallImpact = windfall.amount / requiredNetWorth;
          adjustedYearsToGoal = Math.max(originalYearsToGoal - 2, adjustedYearsToGoal - (windfallImpact * 10));
        }
      });
    }
    
    return {
      originalYearsToGoal,
      adjustedYearsToGoal: Math.round(adjustedYearsToGoal),
      delay: Math.round(adjustedYearsToGoal - originalYearsToGoal),
      totalCollegeCosts,
      collegeYears,
      monthlyImpact: monthlyCollegeImpact,
      dreamReduction: (1 - dreamReductionRatio) * 100
    };
  };

  // Generate milestone timeline
  const generateMilestoneTimeline = () => {
    const currentAge = profile.userProfile.age;
    const timeline = [];
    
    // Add parent dream milestone
    const dreamAge = profile.northStarDream.targetAge;
    timeline.push({
      year: dreamAge - currentAge,
      age: dreamAge,
      type: 'parent_dream',
      title: profile.northStarDream.title,
      description: `Achieve ${profile.northStarDream.title}`,
      person: 'You',
      priority: 'high',
      icon: '🌟'
    });
    
    // Add children milestones
    kids.forEach(child => {
      child.milestones.forEach(milestone => {
        const yearFromNow = milestone.age - child.age;
        if (yearFromNow >= 0 && yearFromNow <= 25) {
          timeline.push({
            year: yearFromNow,
            age: currentAge + yearFromNow,
            type: milestone.type,
            title: milestone.description,
            description: `${child.name}: ${milestone.description}`,
            person: child.name,
            childId: child.id,
            priority: milestone.type.includes('college') ? 'high' : 'medium',
            icon: milestone.type === 'graduation' ? '🎓' : 
                  milestone.type.includes('college') ? '🎒' : 
                  milestone.type === 'independence' ? '🕊️' : '📅'
          });
        }
      });
    });
    
    return timeline.sort((a, b) => a.year - b.year);
  };

  // Calculate impacts when scenario changes
  useEffect(() => {
    const { adjustedKids, adjustedProfile } = calculateScenarioImpact(selectedScenario);
    const impact = calculateCollegeImpact(adjustedKids, adjustedProfile);
    const timeline = generateMilestoneTimeline();
    
    setTimelineData(impact);
    setMilestoneImpacts(timeline);
    
    if (onTimelineUpdate) {
      onTimelineUpdate({ scenario: selectedScenario, impact, timeline });
    }
  }, [selectedScenario, kids, profile]);

  const renderScenarioCard = (scenarioKey, scenarioData) => (
    <div
      key={scenarioKey}
      onClick={() => setSelectedScenario(scenarioKey)}
      className={`
        cursor-pointer rounded-xl p-4 transition-all duration-300 transform hover:scale-105
        ${selectedScenario === scenarioKey 
          ? 'bg-purple-100 border-2 border-purple-500 shadow-lg' 
          : 'bg-white border-2 border-gray-200 hover:border-purple-300 shadow-md'
        }
      `}
    >
      <div className="flex items-center mb-2">
        <span className="text-2xl mr-3">{scenarioData.icon}</span>
        <h4 className="text-lg font-bold text-gray-800">{scenarioData.title}</h4>
      </div>
      <p className="text-gray-600 text-sm mb-3">{scenarioData.description}</p>
      
      {scenarioData.changes.description && (
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-xs text-gray-700">{scenarioData.changes.description}</p>
        </div>
      )}
    </div>
  );

  const renderTimelineImpact = () => {
    if (!timelineData) return null;
    
    const impactMessage = timelineData.delay > 0 
      ? `Delays Maine cottage by ${timelineData.delay} year${timelineData.delay !== 1 ? 's' : ''}`
      : timelineData.delay < 0 
        ? `Accelerates Maine cottage by ${Math.abs(timelineData.delay)} year${Math.abs(timelineData.delay) !== 1 ? 's' : ''}`
        : 'No impact on cottage timeline';
    
    const encouragementMessage = getEncouragementMessage(selectedScenario, timelineData);
    
    return (
      <div className={`
        rounded-xl p-6 transition-all duration-500
        ${timelineData.delay > 0 ? 'bg-yellow-50 border-yellow-200' : 
          timelineData.delay < 0 ? 'bg-green-50 border-green-200' : 
          'bg-blue-50 border-blue-200'}
        border-2
      `}>
        <div className="flex items-center mb-4">
          <span className="text-3xl mr-3">
            {timelineData.delay > 0 ? '⏰' : timelineData.delay < 0 ? '🚀' : '⚖️'}
          </span>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Timeline Impact</h3>
            <p className={`text-lg font-medium ${
              timelineData.delay > 0 ? 'text-yellow-700' : 
              timelineData.delay < 0 ? 'text-green-700' : 'text-blue-700'
            }`}>
              {impactMessage}
            </p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-700 mb-2">Original Timeline:</h4>
            <p className="text-gray-600">Maine cottage at age {profile.userProfile.age + timelineData.originalYearsToGoal}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-700 mb-2">Adjusted Timeline:</h4>
            <p className="text-gray-600">Maine cottage at age {profile.userProfile.age + timelineData.adjustedYearsToGoal}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-700 mb-2">Financial Impact:</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total College Costs:</span>
              <div className="font-bold text-gray-800">${timelineData.totalCollegeCosts.toLocaleString()}</div>
            </div>
            <div>
              <span className="text-gray-600">Monthly Impact:</span>
              <div className="font-bold text-gray-800">${timelineData.monthlyImpact.toLocaleString()}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-purple-800 mb-2">💭 The Bigger Picture:</h4>
          <p className="text-purple-700 text-sm">{encouragementMessage}</p>
        </div>
      </div>
    );
  };

  const getEncouragementMessage = (scenario, impact) => {
    const messages = {
      baseline: `Funding your children's education is an investment in their future. Even with a ${impact.delay}-year delay, you'll arrive at your Maine cottage debt-free and able to help with grandchildren's dreams too.`,
      
      scholarships: `Amazing! Scholarships not only reduce costs but ${impact.delay === 0 ? 'maintain your original timeline' : impact.delay < 0 ? 'actually accelerate your cottage dream' : 'minimize delays'}. Encourage academic excellence - it pays dividends for the whole family.`,
      
      state_schools: `State schools offer excellent education at a fraction of the cost. ${impact.delay <= 1 ? 'This keeps your cottage dream on track' : 'The modest delay is worth the huge savings'}, and your kids graduate with less debt too.`,
      
      downsizing: `Empty nest downsizing is a powerful strategy! Not only does it ${impact.delay < 0 ? 'accelerate your cottage timeline' : 'offset college costs'}, but it also simplifies your life right when you're ready for your next adventure.`,
      
      community_start: `Community college transfers are brilliant financial moves. You save thousands while your kids get the same degree. ${impact.delay <= 1 ? 'Your cottage timeline stays strong' : 'Any delay is minimal compared to the savings'}.`,
      
      gap_years: `Gap years can be transformative! Your kids gain work experience and contribute to college costs, ${impact.delay === 0 ? 'keeping your timeline intact' : 'while any delays are offset by their maturity and reduced debt'}.`
    };
    
    return messages[scenario] || messages.baseline;
  };

  const renderMilestoneTimeline = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-800 mb-4">📅 Family Milestone Timeline</h3>
      <div className="relative">
        {milestoneImpacts.slice(0, 10).map((milestone, index) => (
          <div key={index} className="flex items-center mb-4 relative">
            {/* Timeline line */}
            {index < milestoneImpacts.slice(0, 10).length - 1 && (
              <div className="absolute left-4 top-8 w-0.5 h-6 bg-gray-300"></div>
            )}
            
            {/* Milestone marker */}
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-lg z-10
              ${milestone.type === 'parent_dream' ? 'bg-purple-500' : 
                milestone.priority === 'high' ? 'bg-yellow-400' : 'bg-blue-400'}
            `}>
              {milestone.icon}
            </div>
            
            {/* Milestone content */}
            <div className="ml-4 flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-800">{milestone.title}</h4>
                  <p className="text-gray-600 text-sm">{milestone.person} • {milestone.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Year {milestone.year}</div>
                  <div className="text-sm text-gray-500">Age {milestone.age}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`bg-gradient-to-br from-purple-50 via-white to-blue-50 rounded-2xl p-8 ${className}`}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">👨‍👩‍👧‍👦 Family Milestone Integrator</h2>
        <p className="text-lg text-gray-600">
          See how your children's milestones affect your dreams - and discover creative ways to achieve both
        </p>
      </div>

      {/* Scenario Selection */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🎯 Explore Different Scenarios</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(scenarios).map(([key, scenario]) => 
            renderScenarioCard(key, scenario)
          )}
        </div>
      </div>

      {/* Current Scenario Impact */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Scenario Analysis</h3>
        {renderTimelineImpact()}
      </div>

      {/* Children Profile Summary */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">👧👦 Your Children</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {kids.map((child, index) => (
            <div key={child.id || index} className="bg-white rounded-xl p-4 shadow-md">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                  {child.name[0]}
                </div>
                <div className="ml-3">
                  <h4 className="font-bold text-gray-800">{child.name}</h4>
                  <p className="text-gray-600 text-sm">Age {child.age}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">College Plan:</span>
                  <span className="font-medium text-gray-800">
                    {child.collegePlans.type === 'private' ? 'Private' : 
                     child.collegePlans.type === 'state' ? 'State' : 'Community'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Est. Annual Cost:</span>
                  <span className="font-medium text-gray-800">
                    ${child.collegePlans.estimatedCost?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Years to College:</span>
                  <span className="font-medium text-gray-800">
                    {Math.max(0, 18 - child.age)} years
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Milestone Timeline */}
      <div className="mb-8">
        {renderMilestoneTimeline()}
      </div>

      {/* Key Insights */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">💡 Key Insights</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-green-800 mb-2">Financial Wisdom:</h4>
            <ul className="text-green-700 text-sm space-y-1">
              <li>• Children can borrow for college; you can't borrow for retirement</li>
              <li>• State schools often provide equal opportunities at lower costs</li>
              <li>• Scholarships and financial aid can dramatically change timelines</li>
              <li>• Empty nest periods create acceleration opportunities</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">Family Strategy:</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Involve kids in financial planning discussions</li>
              <li>• Explore all education funding options early</li>
              <li>• Consider gap years for work experience and savings</li>
              <li>• Your dreams matter too - find the balance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyMilestoneIntegrator;
