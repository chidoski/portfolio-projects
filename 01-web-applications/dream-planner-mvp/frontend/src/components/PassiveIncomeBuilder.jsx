import React, { useState, useEffect } from 'react';

/**
 * PassiveIncomeBuilder Component
 * Shows how small passive income streams compound toward dream achievement
 * Progresses from simple to sophisticated strategies with timeline impact calculations
 */
const PassiveIncomeBuilder = ({ dreamGoals, currentProfile, onIncomeChange }) => {
  const [selectedStreams, setSelectedStreams] = useState([]);
  const [customStream, setCustomStream] = useState({ name: '', amount: 0, risk: 2 });
  const [timelineImpact, setTimelineImpact] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Passive income opportunities organized by complexity and risk
  const passiveIncomeOpportunities = {
    simple: [
      {
        id: 'parking_spot',
        name: 'Rent Your Parking Spot',
        description: 'Rent unused parking space to neighbors or commuters',
        monthlyIncome: [50, 150],
        setupTime: '1-2 weeks',
        upfrontCost: 0,
        risk: 1,
        effort: 'low',
        category: 'space_rental',
        requirements: ['Unused parking space', 'Local demand'],
        pros: ['Immediate income', 'No upfront investment', 'Flexible terms'],
        cons: ['Location dependent', 'Seasonal variation'],
        gettingStarted: [
          'Research local parking rates',
          'Post on neighborhood apps (Nextdoor, Facebook)',
          'Create simple rental agreement',
          'Set up payment method'
        ]
      },
      {
        id: 'storage_rental',
        name: 'Rent Storage Space',
        description: 'Rent basement, garage, or spare room for storage',
        monthlyIncome: [75, 300],
        setupTime: '1-3 weeks',
        upfrontCost: 100,
        risk: 1,
        effort: 'low',
        category: 'space_rental',
        requirements: ['Extra space', 'Security measures'],
        pros: ['Steady income', 'Low maintenance'],
        cons: ['Insurance considerations', 'Access logistics']
      },
      {
        id: 'car_rental',
        name: 'Rent Your Car (Turo)',
        description: 'Rent your car when not using it through car-sharing platforms',
        monthlyIncome: [200, 800],
        setupTime: '1 week',
        upfrontCost: 0,
        risk: 2,
        effort: 'medium',
        category: 'asset_rental',
        requirements: ['Reliable car', 'Good driving record'],
        pros: ['High income potential', 'Use existing asset'],
        cons: ['Wear and tear', 'Insurance complexity', 'Scheduling conflicts']
      },
      {
        id: 'room_rental',
        name: 'Rent a Room (Airbnb)',
        description: 'Rent spare room or entire home short-term',
        monthlyIncome: [300, 1500],
        setupTime: '2-4 weeks',
        upfrontCost: 200,
        risk: 2,
        effort: 'medium',
        category: 'space_rental',
        requirements: ['Spare room/property', 'Local regulations compliance'],
        pros: ['High income potential', 'Meet interesting people'],
        cons: ['Privacy impact', 'Cleaning/maintenance', 'Guest management']
      },
      {
        id: 'equipment_rental',
        name: 'Rent Equipment/Tools',
        description: 'Rent power tools, camping gear, or specialized equipment',
        monthlyIncome: [100, 400],
        setupTime: '1-2 weeks',
        upfrontCost: 500,
        risk: 2,
        effort: 'medium',
        category: 'asset_rental',
        requirements: ['Quality equipment', 'Storage space'],
        pros: ['Use existing assets', 'Help community'],
        cons: ['Maintenance costs', 'Damage risk', 'Inventory management']
      }
    ],

    intermediate: [
      {
        id: 'dividend_stocks',
        name: 'Dividend Stock Portfolio',
        description: 'Invest in dividend-paying stocks for regular income',
        monthlyIncome: [50, 500],
        setupTime: '1-2 weeks',
        upfrontCost: 5000,
        risk: 3,
        effort: 'medium',
        category: 'investments',
        requirements: ['Investment capital', 'Basic market knowledge'],
        pros: ['Compound growth', 'Tax advantages', 'Liquidity'],
        cons: ['Market volatility', 'Requires capital', 'Tax implications']
      },
      {
        id: 'online_course',
        name: 'Create Online Course',
        description: 'Monetize your expertise through online course platforms',
        monthlyIncome: [100, 2000],
        setupTime: '2-6 months',
        upfrontCost: 500,
        risk: 3,
        effort: 'high',
        category: 'digital_products',
        requirements: ['Expertise in subject', 'Content creation skills'],
        pros: ['Scalable income', 'Build authority', 'Help others'],
        cons: ['High upfront effort', 'Market competition', 'Platform dependency']
      },
      {
        id: 'etf_investing',
        name: 'REITs & Income ETFs',
        description: 'Invest in Real Estate Investment Trusts and income-focused ETFs',
        monthlyIncome: [100, 800],
        setupTime: '1 week',
        upfrontCost: 3000,
        risk: 2,
        effort: 'low',
        category: 'investments',
        requirements: ['Investment capital', 'Brokerage account'],
        pros: ['Diversification', 'Professional management', 'Regular distributions'],
        cons: ['Market risk', 'Interest rate sensitivity', 'Fees']
      },
      {
        id: 'affiliate_marketing',
        name: 'Affiliate Marketing',
        description: 'Earn commissions promoting products you believe in',
        monthlyIncome: [50, 1000],
        setupTime: '1-3 months',
        upfrontCost: 200,
        risk: 3,
        effort: 'high',
        category: 'digital_marketing',
        requirements: ['Online presence', 'Content creation', 'Marketing skills'],
        pros: ['No inventory', 'Location independent', 'Unlimited potential'],
        cons: ['Income volatility', 'Requires audience', 'Compliance complexity']
      }
    ],

    sophisticated: [
      {
        id: 'rental_property',
        name: 'Rental Property Investment',
        description: 'Purchase property specifically for rental income',
        monthlyIncome: [500, 2000],
        setupTime: '3-6 months',
        upfrontCost: 50000,
        risk: 4,
        effort: 'high',
        category: 'real_estate',
        requirements: ['Significant capital', 'Real estate knowledge', 'Property management'],
        pros: ['Appreciation potential', 'Tax benefits', 'Hedge against inflation'],
        cons: ['High capital requirement', 'Property management', 'Market risk']
      },
      {
        id: 'cottage_rental_unit',
        name: 'Dream Cottage with Rental Unit',
        description: 'Design your cottage to include a rental unit, making it partially self-funding',
        monthlyIncome: [800, 2500],
        setupTime: '1-2 years',
        upfrontCost: 75000,
        risk: 3,
        effort: 'very high',
        category: 'dream_integration',
        requirements: ['Property planning', 'Construction knowledge', 'Zoning compliance'],
        pros: ['Funds your dream', 'Appreciation', 'Live in your dream while earning'],
        cons: ['Complex planning', 'Higher initial cost', 'Privacy considerations'],
        dreamIntegration: true
      },
      {
        id: 'business_investment',
        name: 'Silent Partner Investment',
        description: 'Invest in local businesses as a silent partner',
        monthlyIncome: [200, 1500],
        setupTime: '6-12 months',
        upfrontCost: 25000,
        risk: 4,
        effort: 'medium',
        category: 'business_investment',
        requirements: ['Investment capital', 'Due diligence skills', 'Legal knowledge'],
        pros: ['Higher returns potential', 'Support local economy', 'Business relationships'],
        cons: ['High risk', 'Illiquid investment', 'Partner dependency']
      },
      {
        id: 'saas_product',
        name: 'Software as a Service (SaaS)',
        description: 'Develop a software product with recurring subscription revenue',
        monthlyIncome: [500, 10000],
        setupTime: '6-24 months',
        upfrontCost: 10000,
        risk: 5,
        effort: 'very high',
        category: 'digital_business',
        requirements: ['Technical skills', 'Market research', 'Product development'],
        pros: ['Scalable income', 'High margins', 'Location independent'],
        cons: ['High failure rate', 'Technical complexity', 'Competitive market']
      }
    ]
  };

  // Calculate timeline impact when selected streams change
  useEffect(() => {
    calculateTimelineImpact();
  }, [selectedStreams, dreamGoals]);

  const calculateTimelineImpact = () => {
    if (!dreamGoals || selectedStreams.length === 0) {
      setTimelineImpact(null);
      return;
    }

    const totalMonthlyIncome = selectedStreams.reduce((total, stream) => {
      const avgIncome = (stream.monthlyIncome[0] + stream.monthlyIncome[1]) / 2;
      return total + avgIncome;
    }, 0);

    const targetAmount = dreamGoals.targetAmount || 500000;
    const currentSaved = dreamGoals.currentSaved || 0;
    const remainingAmount = targetAmount - currentSaved;
    const currentMonthlySavings = dreamGoals.monthlySavings || 2000;

    // Calculate timeline without passive income
    const monthsWithoutPassive = remainingAmount / currentMonthlySavings;
    
    // Calculate timeline with passive income (assume 80% goes to savings after taxes)
    const additionalMonthlySavings = totalMonthlyIncome * 0.8;
    const newMonthlySavings = currentMonthlySavings + additionalMonthlySavings;
    const monthsWithPassive = remainingAmount / newMonthlySavings;

    const monthsSaved = monthsWithoutPassive - monthsWithPassive;
    const yearsSaved = monthsSaved / 12;

    const currentAge = dreamGoals.currentAge || 32;
    const originalTargetAge = currentAge + (monthsWithoutPassive / 12);
    const newTargetAge = currentAge + (monthsWithPassive / 12);

    setTimelineImpact({
      totalMonthlyIncome,
      monthsSaved: Math.round(monthsSaved),
      yearsSaved: Math.round(yearsSaved * 10) / 10,
      originalTargetAge: Math.round(originalTargetAge),
      newTargetAge: Math.round(newTargetAge),
      additionalMonthlySavings: Math.round(additionalMonthlySavings)
    });
  };

  const toggleStream = (stream) => {
    setSelectedStreams(prev => {
      const exists = prev.find(s => s.id === stream.id);
      if (exists) {
        return prev.filter(s => s.id !== stream.id);
      } else {
        return [...prev, stream];
      }
    });
  };

  const addCustomStream = () => {
    if (customStream.name && customStream.amount > 0) {
      const newStream = {
        id: `custom_${Date.now()}`,
        name: customStream.name,
        description: 'Custom passive income stream',
        monthlyIncome: [customStream.amount, customStream.amount],
        risk: customStream.risk,
        category: 'custom',
        isCustom: true
      };
      
      setSelectedStreams(prev => [...prev, newStream]);
      setCustomStream({ name: '', amount: 0, risk: 2 });
    }
  };

  const getRiskStars = (riskLevel) => {
    const stars = '★★★★★';
    const filledStars = stars.slice(0, riskLevel);
    const emptyStars = '☆☆☆☆☆'.slice(0, 5 - riskLevel);
    return filledStars + emptyStars;
  };

  const getRiskColor = (riskLevel) => {
    const colors = {
      1: 'text-green-600',
      2: 'text-yellow-600',
      3: 'text-orange-600',
      4: 'text-red-600',
      5: 'text-red-700'
    };
    return colors[riskLevel] || 'text-gray-600';
  };

  const getRiskLabel = (riskLevel) => {
    const labels = {
      1: 'Very Low Risk',
      2: 'Low Risk',
      3: 'Medium Risk',
      4: 'High Risk',
      5: 'Very High Risk'
    };
    return labels[riskLevel] || 'Unknown Risk';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const renderOpportunityCard = (opportunity) => {
    const isSelected = selectedStreams.find(s => s.id === opportunity.id);
    const avgIncome = (opportunity.monthlyIncome[0] + opportunity.monthlyIncome[1]) / 2;

    return (
      <div
        key={opportunity.id}
        className={`border rounded-lg p-6 cursor-pointer transition-all hover:shadow-md ${
          isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
        } ${opportunity.dreamIntegration ? 'ring-2 ring-purple-200' : ''}`}
        onClick={() => toggleStream(opportunity)}
      >
        {opportunity.dreamIntegration && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-purple-600">🏡</span>
            <span className="text-sm font-medium text-purple-600">Dream Integration</span>
          </div>
        )}

        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">{opportunity.name}</h3>
            <p className="text-gray-600 text-sm mb-2">{opportunity.description}</p>
          </div>
          <div className="text-right ml-4">
            <div className="text-xl font-bold text-green-600">
              {formatCurrency(opportunity.monthlyIncome[0])}-{formatCurrency(opportunity.monthlyIncome[1])}
            </div>
            <div className="text-xs text-gray-500">per month</div>
          </div>
        </div>

        {/* Risk Rating */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-lg ${getRiskColor(opportunity.risk)}`}>
            {getRiskStars(opportunity.risk)}
          </span>
          <span className="text-sm text-gray-600">{getRiskLabel(opportunity.risk)}</span>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
          <div>
            <span className="text-gray-500">Setup Time:</span>
            <div className="font-medium">{opportunity.setupTime}</div>
          </div>
          <div>
            <span className="text-gray-500">Upfront Cost:</span>
            <div className="font-medium">
              {opportunity.upfrontCost === 0 ? 'Free' : formatCurrency(opportunity.upfrontCost)}
            </div>
          </div>
          <div>
            <span className="text-gray-500">Effort:</span>
            <div className="font-medium capitalize">{opportunity.effort}</div>
          </div>
        </div>

        {/* Timeline Impact Preview */}
        {isSelected && (
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
            <p className="text-purple-700 font-medium text-sm">
              💰 Adding ${Math.round(avgIncome)}/month removes ~{Math.round((avgIncome * 0.8 * 12) / (dreamGoals?.monthlySavings || 2000) * 12)} months from your timeline
            </p>
          </div>
        )}

        {isSelected && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <details>
              <summary className="cursor-pointer text-indigo-600 font-medium text-sm mb-2">
                Getting Started Guide
              </summary>
              <div className="space-y-2">
                {opportunity.gettingStarted?.map((step, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-indigo-500 font-bold">{index + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
                
                {opportunity.pros && (
                  <div className="mt-3">
                    <h4 className="font-medium text-green-700 mb-1">Pros:</h4>
                    <ul className="text-xs text-green-600 space-y-1">
                      {opportunity.pros.map((pro, i) => (
                        <li key={i}>✓ {pro}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {opportunity.cons && (
                  <div className="mt-2">
                    <h4 className="font-medium text-red-700 mb-1">Considerations:</h4>
                    <ul className="text-xs text-red-600 space-y-1">
                      {opportunity.cons.map((con, i) => (
                        <li key={i}>• {con}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </details>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          💰 Passive Income Builder
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover how small income streams compound toward your dreams. 
          Every $100/month brings your Someday Life closer to reality.
        </p>
      </div>

      {/* Timeline Impact Summary */}
      {timelineImpact && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-8 border border-green-200">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                +{formatCurrency(timelineImpact.totalMonthlyIncome)}
              </div>
              <div className="text-sm text-gray-600">Total Monthly Passive Income</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                -{timelineImpact.monthsSaved} months
              </div>
              <div className="text-sm text-gray-600">Faster to Your Dream</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                Age {timelineImpact.newTargetAge}
              </div>
              <div className="text-sm text-gray-600">
                New Achievement Age (was {timelineImpact.originalTargetAge})
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-white rounded-lg">
            <p className="text-gray-700 text-center">
              <strong>Impact:</strong> These passive income streams add {formatCurrency(timelineImpact.additionalMonthlySavings)}/month 
              to your savings, reducing your timeline by {timelineImpact.yearsSaved} years.
            </p>
          </div>
        </div>
      )}

      {/* Custom Income Stream */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Add Custom Income Stream</h2>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Stream Name</label>
            <input
              type="text"
              value={customStream.name}
              onChange={(e) => setCustomStream(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Freelance Writing"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Income</label>
            <input
              type="number"
              value={customStream.amount}
              onChange={(e) => setCustomStream(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="$100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
            <select
              value={customStream.risk}
              onChange={(e) => setCustomStream(prev => ({ ...prev, risk: parseInt(e.target.value) }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value={1}>★ Very Low</option>
              <option value={2}>★★ Low</option>
              <option value={3}>★★★ Medium</option>
              <option value={4}>★★★★ High</option>
              <option value={5}>★★★★★ Very High</option>
            </select>
          </div>
          <button
            onClick={addCustomStream}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add Stream
          </button>
        </div>
      </div>

      {/* Simple Opportunities */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">🟢 Simple Income Streams</h2>
        <p className="text-gray-600 mb-6">Start here: Low risk, quick setup, immediate impact</p>
        <div className="grid md:grid-cols-2 gap-6">
          {passiveIncomeOpportunities.simple.map(renderOpportunityCard)}
        </div>
      </div>

      {/* Intermediate Opportunities */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">🟡 Intermediate Strategies</h2>
        <p className="text-gray-600 mb-6">Build on success: Moderate risk, higher returns</p>
        <div className="grid md:grid-cols-2 gap-6">
          {passiveIncomeOpportunities.intermediate.map(renderOpportunityCard)}
        </div>
      </div>

      {/* Sophisticated Opportunities */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">🔴 Sophisticated Investments</h2>
        <p className="text-gray-600 mb-6">Advanced strategies: Higher capital, maximum impact</p>
        <div className="grid md:grid-cols-2 gap-6">
          {passiveIncomeOpportunities.sophisticated.map(renderOpportunityCard)}
        </div>
      </div>

      {/* Selected Streams Summary */}
      {selectedStreams.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Your Passive Income Portfolio</h2>
          
          <div className="space-y-4 mb-6">
            {selectedStreams.map((stream) => (
              <div key={stream.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-medium text-gray-800">{stream.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${getRiskColor(stream.risk)}`}>
                        {getRiskStars(stream.risk)}
                      </span>
                      <span className="text-xs text-gray-500">{getRiskLabel(stream.risk)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">
                    {stream.isCustom 
                      ? formatCurrency(stream.monthlyIncome[0])
                      : `${formatCurrency(stream.monthlyIncome[0])}-${formatCurrency(stream.monthlyIncome[1])}`
                    }
                  </div>
                  <div className="text-xs text-gray-500">per month</div>
                </div>
                <button
                  onClick={() => toggleStream(stream)}
                  className="ml-4 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Compound Effect Visualization */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-800 mb-4">💎 The Compound Effect</h3>
            <p className="text-purple-700 mb-4">
              Watch how multiple income streams accelerate your timeline:
            </p>
            <div className="space-y-2">
              {selectedStreams.map((stream, index) => {
                const avgIncome = stream.isCustom 
                  ? stream.monthlyIncome[0] 
                  : (stream.monthlyIncome[0] + stream.monthlyIncome[1]) / 2;
                const monthsReduced = Math.round((avgIncome * 0.8 * 12) / (dreamGoals?.monthlySavings || 2000) * 12);
                
                return (
                  <div key={stream.id} className="flex items-center justify-between text-sm">
                    <span className="text-purple-700">{stream.name}</span>
                    <span className="text-purple-600 font-medium">-{monthsReduced} months</span>
                  </div>
                );
              })}
              <div className="border-t border-purple-200 pt-2 mt-2">
                <div className="flex items-center justify-between font-bold text-purple-800">
                  <span>Total Impact:</span>
                  <span>-{timelineImpact?.monthsSaved || 0} months</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-8 mt-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">🚀 Start Building Your Passive Income</h2>
        <p className="text-green-100 mb-6 max-w-2xl mx-auto">
          Every $100/month of passive income brings your dreams months closer. 
          Start with simple strategies and build toward sophisticated investments.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button className="bg-white text-green-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            📝 Create Action Plan
          </button>
          <button className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-400 transition-colors">
            📈 Track Income Streams
          </button>
        </div>
      </div>
    </div>
  );
};

export default PassiveIncomeBuilder;
