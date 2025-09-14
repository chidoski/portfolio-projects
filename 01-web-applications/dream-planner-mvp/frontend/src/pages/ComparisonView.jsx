import React, { useState, useEffect } from 'react';
import { sarahCompleteDemo } from '../data/demoSomedayLife.js';

const ComparisonView = ({ className = "" }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [animationStep, setAnimationStep] = useState(0);
  const [showEmotionalImpact, setShowEmotionalImpact] = useState(false);

  // Animation sequence for revealing differences
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationStep(prev => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Traditional retirement calculation for Sarah
  const traditionalApproach = {
    strategy: {
      name: 'Traditional Retirement Planning',
      description: 'Save 15% of income until age 65, invest in target-date funds',
      targetAge: 65,
      savingsRate: 0.15,
      approach: 'Generic one-size-fits-all'
    },
    
    calculations: {
      currentAge: 32,
      yearsToRetirement: 33, // 65 - 32
      currentIncome: 93000, // Sarah's current total income
      monthlySavings: 1162, // 15% of $93K / 12
      projectedIncome65: 93000 * Math.pow(1.03, 33), // 3% annual increases
      
      // Conservative target-date fund returns
      expectedReturn: 0.065, // 6.5% average
      inflationRate: 0.03,
      
      // Final calculations
      totalContributions: 0,
      investmentGrowth: 0,
      finalValue: 0,
      monthlyWithdrawal: 0
    },
    
    milestoneHandling: {
      wedding: { funded: false, impact: 'Derails savings for 2 years' },
      homeOwnership: { funded: false, impact: 'Delayed until 40s' },
      collegeKids: { funded: false, impact: 'Loans or delayed retirement' },
      parentCare: { funded: false, impact: 'Emergency fund depletion' },
      careerTransition: { funded: false, impact: 'Not possible without income' }
    },
    
    emotionalExperience: {
      vision: 'Vague hope for "comfortable retirement"',
      motivation: 'Fear-based (running out of money)',
      flexibility: 'Rigid 15% rule regardless of life changes',
      engagement: 'Set it and forget it (often forgotten)',
      stress: 'High anxiety about market performance',
      fulfillment: 'Delayed gratification with uncertain payoff'
    }
  };

  // Calculate traditional approach numbers
  useEffect(() => {
    const calc = traditionalApproach.calculations;
    const monthlyReturn = calc.expectedReturn / 12;
    const totalMonths = calc.yearsToRetirement * 12;
    
    // Future value of annuity calculation
    const futureValue = calc.monthlySavings * 
      ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn);
    
    calc.totalContributions = calc.monthlySavings * totalMonths;
    calc.investmentGrowth = futureValue - calc.totalContributions;
    calc.finalValue = futureValue;
    calc.monthlyWithdrawal = (futureValue * 0.04) / 12; // 4% rule
  }, []);

  // Someday Life approach using Sarah's actual data
  const somedayApproach = {
    strategy: {
      name: 'Someday Life Planning',
      description: 'Vision-driven planning with integrated life goals and dynamic allocation',
      targetAge: 52,
      savingsRate: 'Variable (optimized)',
      approach: 'Personalized three-bucket system'
    },
    
    vision: {
      title: 'Maine Cottage Art Studio Life',
      description: sarahCompleteDemo.profile.northStarDream.description,
      location: 'Freeport, Maine',
      lifestyle: 'Artist and workshop teacher',
      images: [
        'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600'
      ]
    },
    
    calculations: sarahCompleteDemo.bucketStrategy.projectedOutcomes,
    
    milestoneHandling: {
      wedding: { 
        funded: true, 
        cost: 25000, 
        impact: 'Celebrated without financial stress',
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400'
      },
      homeOwnership: { 
        funded: true, 
        cost: 75000, 
        impact: 'Builds equity for cottage down payment',
        image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400'
      },
      collegeKids: { 
        funded: true, 
        cost: 200000, 
        impact: 'Kids graduate debt-free',
        image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400'
      },
      parentCare: { 
        funded: true, 
        cost: 30000, 
        impact: 'Parents well cared for with dignity',
        image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400'
      },
      careerTransition: { 
        funded: true, 
        cost: 15000, 
        impact: 'Smooth transition to artistic career',
        image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400'
      }
    },
    
    emotionalExperience: {
      vision: 'Crystal clear picture of ideal life',
      motivation: 'Excitement about future possibilities',
      flexibility: 'Adapts to life changes and opportunities',
      engagement: 'Active planning with regular progress celebration',
      stress: 'Confidence from systematic approach',
      fulfillment: 'Continuous progress toward meaningful goals'
    }
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

  // Format large numbers
  const formatLargeNumber = (amount) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return formatCurrency(amount);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Two Approaches to Your Future
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            See how traditional retirement planning compares to the Someday Life approach. 
            Same person, same income, dramatically different outcomes.
          </p>
          
          {/* Sarah Introduction */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                S
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-gray-800">Meet Sarah Chen</h3>
                <p className="text-gray-600">32, Marketing Manager, Boston</p>
                <p className="text-sm text-gray-500">$93K income • $2K monthly savings capacity</p>
              </div>
            </div>
            <p className="text-gray-700 text-sm">
              Sarah dreams of a cottage in Maine where she can paint and teach art workshops. 
              Let's see how different planning approaches affect her journey.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl shadow-lg p-2 flex space-x-2">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'timeline', label: 'Timeline', icon: '⏰' },
              { id: 'milestones', label: 'Life Events', icon: '🎯' },
              { id: 'emotional', label: 'Experience', icon: '❤️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Comparison Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Traditional Approach */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white p-6">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-3xl">📈</span>
                <h2 className="text-2xl font-bold">Traditional Retirement Planning</h2>
              </div>
              <p className="text-gray-200">The standard "15% until 65" approach</p>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Strategy Overview */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">The Strategy</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Save 15% of income religiously</li>
                      <li>• Invest in target-date funds</li>
                      <li>• Hope market performs well</li>
                      <li>• Retire at 65 with "enough"</li>
                    </ul>
                  </div>

                  {/* Numbers */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">Monthly Savings</span>
                      <span className="text-lg font-bold text-gray-800">
                        {formatCurrency(traditionalApproach.calculations.monthlySavings)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">Retirement Age</span>
                      <span className="text-lg font-bold text-gray-800">65 years old</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">Final Portfolio</span>
                      <span className="text-lg font-bold text-gray-800">
                        {formatLargeNumber(traditionalApproach.calculations.finalValue)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">Monthly Income</span>
                      <span className="text-lg font-bold text-gray-800">
                        {formatCurrency(traditionalApproach.calculations.monthlyWithdrawal)}
                      </span>
                    </div>
                  </div>

                  {/* Generic Chart Placeholder */}
                  <div className="bg-gray-100 rounded-lg p-8 text-center">
                    <div className="text-6xl mb-4">📊</div>
                    <h4 className="font-semibold text-gray-700 mb-2">Generic Growth Chart</h4>
                    <p className="text-sm text-gray-500">
                      Standard portfolio growth projection<br />
                      No personalization or life context
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'timeline' && (
                <div className="space-y-6">
                  <h4 className="text-xl font-bold text-gray-800 mb-4">33-Year Journey to Retirement</h4>
                  
                  <div className="space-y-4">
                    {[
                      { age: '32-40', event: 'Early Career', description: 'Save 15%, ignore life events' },
                      { age: '40-50', event: 'Mid Career', description: 'Continue saving, stress about market' },
                      { age: '50-60', event: 'Late Career', description: 'Panic about retirement readiness' },
                      { age: '60-65', event: 'Pre-Retirement', description: 'Hope you have enough' },
                      { age: '65+', event: 'Retirement', description: 'Generic lifestyle, uncertain future' }
                    ].map((phase, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{phase.event}</div>
                          <div className="text-sm text-gray-600">Age {phase.age}</div>
                          <div className="text-xs text-gray-500">{phase.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'milestones' && (
                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-gray-800 mb-4">Life Events Impact</h4>
                  
                  {Object.entries(traditionalApproach.milestoneHandling).map(([milestone, data]) => (
                    <div key={milestone} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-800 capitalize">
                          {milestone.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-red-600 font-semibold">❌ Not Planned</span>
                      </div>
                      <p className="text-sm text-red-700">{data.impact}</p>
                    </div>
                  ))}
                  
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h5 className="font-semibold text-yellow-800 mb-2">⚠️ The Reality</h5>
                    <p className="text-sm text-yellow-700">
                      Life events force you to choose between your goals and your retirement savings. 
                      Most people end up delaying retirement or going into debt.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'emotional' && (
                <div className="space-y-6">
                  <h4 className="text-xl font-bold text-gray-800 mb-4">The Emotional Journey</h4>
                  
                  <div className="space-y-4">
                    {Object.entries(traditionalApproach.emotionalExperience).map(([aspect, description]) => (
                      <div key={aspect} className="p-4 bg-gray-50 rounded-lg">
                        <div className="font-medium text-gray-800 capitalize mb-1">
                          {aspect.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <p className="text-sm text-gray-600">{description}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gray-100 rounded-lg p-6 text-center">
                    <div className="text-4xl mb-3">😰</div>
                    <h5 className="font-semibold text-gray-700 mb-2">Common Feelings</h5>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>"Am I saving enough?"</p>
                      <p>"What if the market crashes?"</p>
                      <p>"Will I ever be able to retire?"</p>
                      <p>"I have no idea what I'm working toward"</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Someday Life Approach */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-3xl">✨</span>
                <h2 className="text-2xl font-bold">Someday Life Planning</h2>
              </div>
              <p className="text-blue-100">Vision-driven planning with integrated life goals</p>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Vision Board */}
                  <div className="relative rounded-lg overflow-hidden">
                    <img
                      src={somedayApproach.vision.images[animationStep % somedayApproach.vision.images.length]}
                      alt="Maine Cottage Life"
                      className="w-full h-48 object-cover transition-all duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <div className="p-4 text-white">
                        <h4 className="font-bold text-lg">{somedayApproach.vision.title}</h4>
                        <p className="text-sm opacity-90">{somedayApproach.vision.location}</p>
                      </div>
                    </div>
                  </div>

                  {/* Strategy Overview */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">The Strategy</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Three-bucket dynamic allocation</li>
                      <li>• Integrated life milestone planning</li>
                      <li>• Vision-driven motivation</li>
                      <li>• Achieve someday life at 52</li>
                    </ul>
                  </div>

                  {/* Numbers */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium text-gray-700">Monthly Savings</span>
                      <span className="text-lg font-bold text-green-600">$2,000 (optimized)</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium text-gray-700">Someday Life Age</span>
                      <span className="text-lg font-bold text-green-600">52 years old</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium text-gray-700">Total Net Worth</span>
                      <span className="text-lg font-bold text-green-600">
                        {formatLargeNumber(somedayApproach.calculations.foundationBucket.finalValue + 
                                         somedayApproach.calculations.dreamBucket.totalDreamAssets)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium text-gray-700">Dream Income</span>
                      <span className="text-lg font-bold text-green-600">$5,000/month</span>
                    </div>
                  </div>

                  {/* Three Buckets Visualization */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-blue-100 rounded-lg p-3 text-center">
                      <div className="text-2xl mb-1">🏛️</div>
                      <div className="text-xs font-medium text-blue-800">Foundation</div>
                      <div className="text-sm font-bold text-blue-600">$600K</div>
                    </div>
                    <div className="bg-purple-100 rounded-lg p-3 text-center">
                      <div className="text-2xl mb-1">✨</div>
                      <div className="text-xs font-medium text-purple-800">Dream</div>
                      <div className="text-sm font-bold text-purple-600">$850K</div>
                    </div>
                    <div className="bg-green-100 rounded-lg p-3 text-center">
                      <div className="text-2xl mb-1">🎯</div>
                      <div className="text-xs font-medium text-green-800">Life</div>
                      <div className="text-sm font-bold text-green-600">All Funded</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'timeline' && (
                <div className="space-y-6">
                  <h4 className="text-xl font-bold text-gray-800 mb-4">20-Year Journey to Someday Life</h4>
                  
                  <div className="space-y-4">
                    {[
                      { 
                        age: '32-35', 
                        event: 'Foundation Building', 
                        description: 'Wedding, debt payoff, emergency fund',
                        color: 'bg-blue-500',
                        image: '💒'
                      },
                      { 
                        age: '35-40', 
                        event: 'Asset Accumulation', 
                        description: 'Home purchase, career growth, art development',
                        color: 'bg-green-500',
                        image: '🏠'
                      },
                      { 
                        age: '40-45', 
                        event: 'Family & Growth', 
                        description: 'College fund, parent care, skill building',
                        color: 'bg-purple-500',
                        image: '👨‍👩‍👧‍👦'
                      },
                      { 
                        age: '45-50', 
                        event: 'Transition Prep', 
                        description: 'Art income, cottage savings, career shift',
                        color: 'bg-yellow-500',
                        image: '🎨'
                      },
                      { 
                        age: '50-52', 
                        event: 'Someday Life', 
                        description: 'Maine cottage, art studio, financial freedom',
                        color: 'bg-indigo-500',
                        image: '🏡'
                      }
                    ].map((phase, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                        <div className={`w-12 h-12 ${phase.color} rounded-full flex items-center justify-center text-white text-xl`}>
                          {phase.image}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{phase.event}</div>
                          <div className="text-sm text-gray-600">Age {phase.age}</div>
                          <div className="text-xs text-gray-500">{phase.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'milestones' && (
                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-gray-800 mb-4">Life Events Celebration</h4>
                  
                  {Object.entries(somedayApproach.milestoneHandling).map(([milestone, data]) => (
                    <div key={milestone} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <img
                          src={data.image}
                          alt={milestone}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-800 capitalize">
                              {milestone.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <div className="text-right">
                              <span className="text-green-600 font-semibold">✅ Funded</span>
                              <div className="text-sm text-gray-600">{formatCurrency(data.cost)}</div>
                            </div>
                          </div>
                          <p className="text-sm text-green-700">{data.impact}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-semibold text-blue-800 mb-2">🎉 The Reality</h5>
                    <p className="text-sm text-blue-700">
                      Every major life event is planned and funded. You celebrate milestones 
                      without financial stress while staying on track for your someday life.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'emotional' && (
                <div className="space-y-6">
                  <h4 className="text-xl font-bold text-gray-800 mb-4">The Emotional Journey</h4>
                  
                  <div className="space-y-4">
                    {Object.entries(somedayApproach.emotionalExperience).map(([aspect, description]) => (
                      <div key={aspect} className="p-4 bg-blue-50 rounded-lg">
                        <div className="font-medium text-blue-800 capitalize mb-1">
                          {aspect.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <p className="text-sm text-blue-700">{description}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-6 text-center">
                    <div className="text-4xl mb-3">😊</div>
                    <h5 className="font-semibold text-gray-700 mb-2">Common Feelings</h5>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>"I can see my future clearly"</p>
                      <p>"Every dollar has a purpose"</p>
                      <p>"I'm excited about my progress"</p>
                      <p>"I'm living my best life now AND later"</p>
                    </div>
                  </div>

                  {/* Vision Gallery */}
                  <div className="grid grid-cols-3 gap-2">
                    {somedayApproach.vision.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Vision ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Comparison Summary */}
        <div className="mt-12 bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-8">
            The Dramatic Difference
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Traditional Results */}
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="text-6xl mb-4">😕</div>
              <h4 className="text-xl font-bold text-gray-800 mb-4">Traditional Approach</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Retirement Age:</span>
                  <span className="font-semibold">65 years old</span>
                </div>
                <div className="flex justify-between">
                  <span>Years Working:</span>
                  <span className="font-semibold">33 more years</span>
                </div>
                <div className="flex justify-between">
                  <span>Life Events:</span>
                  <span className="font-semibold text-red-600">Unfunded stress</span>
                </div>
                <div className="flex justify-between">
                  <span>Retirement Vision:</span>
                  <span className="font-semibold">Vague hope</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Income:</span>
                  <span className="font-semibold">{formatCurrency(traditionalApproach.calculations.monthlyWithdrawal)}</span>
                </div>
              </div>
            </div>

            {/* Someday Life Results */}
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
              <div className="text-6xl mb-4">🎉</div>
              <h4 className="text-xl font-bold text-gray-800 mb-4">Someday Life Approach</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Someday Life Age:</span>
                  <span className="font-semibold text-green-600">52 years old</span>
                </div>
                <div className="flex justify-between">
                  <span>Years Working:</span>
                  <span className="font-semibold text-green-600">20 years total</span>
                </div>
                <div className="flex justify-between">
                  <span>Life Events:</span>
                  <span className="font-semibold text-green-600">All celebrated</span>
                </div>
                <div className="flex justify-between">
                  <span>Life Vision:</span>
                  <span className="font-semibold text-green-600">Maine cottage artist</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Income:</span>
                  <span className="font-semibold text-green-600">$5,000 + art sales</span>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-8 text-center">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6">
              <h4 className="text-2xl font-bold mb-2">Sarah Gets 13 Extra Years</h4>
              <p className="text-blue-100 mb-4">
                Same income, same discipline, completely different outcome. 
                The difference? A clear vision and systematic planning.
              </p>
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                Start Your Someday Life Plan
              </button>
            </div>
          </div>
        </div>

        {/* Emotional Impact Toggle */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowEmotionalImpact(!showEmotionalImpact)}
            className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            {showEmotionalImpact ? 'Hide' : 'Show'} Emotional Impact Comparison
          </button>
        </div>

        {/* Emotional Impact Section */}
        {showEmotionalImpact && (
          <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">
              Beyond the Numbers: The Human Experience
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-gray-700">Traditional Planning Journey</h4>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-red-50 rounded-lg">😰 "Am I saving enough for retirement?"</div>
                  <div className="p-3 bg-red-50 rounded-lg">💸 "I can't afford this wedding AND retirement"</div>
                  <div className="p-3 bg-red-50 rounded-lg">📉 "The market crashed - am I screwed?"</div>
                  <div className="p-3 bg-red-50 rounded-lg">⏰ "Will I ever be able to retire?"</div>
                  <div className="p-3 bg-red-50 rounded-lg">🤷‍♀️ "I have no idea what retirement will look like"</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-gray-700">Someday Life Planning Journey</h4>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-green-50 rounded-lg">🎯 "I can see my Maine cottage clearly"</div>
                  <div className="p-3 bg-green-50 rounded-lg">💒 "Our wedding is fully funded and stress-free"</div>
                  <div className="p-3 bg-green-50 rounded-lg">📈 "Market ups and downs don't scare me"</div>
                  <div className="p-3 bg-green-50 rounded-lg">🎨 "I'm already transitioning to my art career"</div>
                  <div className="p-3 bg-green-50 rounded-lg">✨ "Every day brings me closer to my someday life"</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparisonView;
