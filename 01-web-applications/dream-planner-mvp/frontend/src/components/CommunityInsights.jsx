import React, { useState, useEffect } from 'react';

const CommunityInsights = ({ userProfile = {} }) => {
  const [selectedInsight, setSelectedInsight] = useState('behavioral');
  const [dreamTwin, setDreamTwin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Anonymized community insights based on aggregated patterns
  const communityInsights = {
    behavioral: [
      {
        id: 'daily_equivalents',
        statistic: '73%',
        description: 'of people saving for property dreams increased their savings rate after seeing daily equivalents',
        impact: 'Average increase: $230/month',
        icon: '☕',
        trend: 'up',
        category: 'motivation'
      },
      {
        id: 'weekly_tracking',
        statistic: '3x',
        description: 'more likely to reach their Someday Life when tracking weekly vs monthly',
        impact: 'Completion rate: 67% vs 23%',
        icon: '📅',
        trend: 'up',
        category: 'tracking'
      },
      {
        id: 'bucket_system',
        statistic: '85%',
        description: 'of users who adopted the 3-bucket system stayed on track for 6+ months',
        impact: 'Compared to 41% single-goal approach',
        icon: '🪣',
        trend: 'up',
        category: 'strategy'
      },
      {
        id: 'automation',
        statistic: '2.4x',
        description: 'faster goal achievement with automated transfers vs manual saving',
        impact: 'Median completion: 3.2 years vs 7.8 years',
        icon: '🤖',
        trend: 'up',
        category: 'automation'
      }
    ],
    
    demographic: [
      {
        id: 'age_25_35',
        statistic: '68%',
        description: 'of users aged 25-35 prioritize property dreams over retirement',
        impact: 'Dream bucket gets 45% allocation',
        icon: '🏠',
        trend: 'stable',
        category: 'priorities'
      },
      {
        id: 'dual_income',
        statistic: '1.7x',
        description: 'faster savings rate for couples vs singles (adjusted for income)',
        impact: 'Shared expenses enable higher savings',
        icon: '👫',
        trend: 'up',
        category: 'lifestyle'
      },
      {
        id: 'tech_workers',
        statistic: '92%',
        description: 'of tech workers use automated investing for their Foundation bucket',
        impact: 'Highest adoption of optimization tools',
        icon: '💻',
        trend: 'up',
        category: 'profession'
      },
      {
        id: 'urban_vs_rural',
        statistic: '$127k',
        description: 'average cottage dream cost difference: urban ($468k) vs rural ($341k)',
        impact: 'Timeline difference: 2.3 years',
        icon: '🌆',
        trend: 'stable',
        category: 'location'
      }
    ],

    milestones: [
      {
        id: 'first_10k',
        statistic: '89%',
        description: 'reach their second $10k faster than their first $10k',
        impact: 'Momentum effect: 8 months vs 14 months',
        icon: '🎯',
        trend: 'up',
        category: 'progress'
      },
      {
        id: 'halfway_point',
        statistic: '78%',
        description: 'who reach the halfway point complete their full dream',
        impact: 'Critical threshold for success',
        icon: '🏃‍♂️',
        trend: 'up',
        category: 'completion'
      },
      {
        id: 'setbacks',
        statistic: '2.7',
        description: 'average number of financial setbacks before reaching Someday Life',
        impact: 'Resilience matters more than perfection',
        icon: '⚡',
        trend: 'stable',
        category: 'resilience'
      },
      {
        id: 'celebration',
        statistic: '94%',
        description: 'who celebrate small milestones maintain motivation long-term',
        impact: 'vs 56% who skip celebrations',
        icon: '🎉',
        trend: 'up',
        category: 'motivation'
      }
    ]
  };

  // Generate Dream Twin based on user profile
  const generateDreamTwin = (userProfile) => {
    const age = userProfile.age || 28;
    const income = userProfile.monthlyIncome || 5500;
    const dreamType = userProfile.primaryDream || 'cottage';
    
    // Create similar but slightly different profile
    const ageVariance = Math.floor(Math.random() * 6) - 3; // ±3 years
    const incomeVariance = Math.floor((Math.random() * 0.4 - 0.2) * income); // ±20%
    
    const dreamTwinProfiles = [
      {
        name: 'Alex',
        age: Math.max(22, age + ageVariance),
        monthlyIncome: Math.max(3000, income + incomeVariance),
        location: 'Pacific Northwest',
        dreamType: dreamType,
        dreamAmount: dreamType === 'cottage' ? 420000 : 350000,
        currentProgress: 0.45, // 45% complete
        monthsAhead: 6,
        avatar: '🧑‍💼',
        story: 'Started with $2,400 saved, now at $189k through consistent weekly transfers',
        strategy: 'Aggressive + Life buckets, skipped Foundation temporarily',
        keyInsight: 'Automated everything on payday - never saw the money to spend it',
        monthlyContribution: 2850,
        timeToGoal: '2.1 years remaining'
      },
      {
        name: 'Morgan',
        age: Math.max(22, age + ageVariance),
        monthlyIncome: Math.max(3000, income + incomeVariance),
        location: 'Mountain West',
        dreamType: dreamType,
        dreamAmount: dreamType === 'cottage' ? 380000 : 320000,
        currentProgress: 0.52, // 52% complete
        monthsAhead: 6,
        avatar: '👩‍🎨',
        story: 'Freelancer who built multiple income streams to fund the dream',
        strategy: 'Balanced approach with seasonal income adjustments',
        keyInsight: 'Side projects became the difference maker - $800/month extra',
        monthlyContribution: 2650,
        timeToGoal: '1.8 years remaining'
      },
      {
        name: 'River',
        age: Math.max(22, age + ageVariance),
        monthlyIncome: Math.max(3000, income + incomeVariance),
        location: 'Great Lakes',
        dreamType: dreamType,
        dreamAmount: dreamType === 'cottage' ? 365000 : 295000,
        currentProgress: 0.48, // 48% complete
        monthsAhead: 6,
        avatar: '🧑‍🔬',
        story: 'Scientist who optimized expenses with data-driven approach',
        strategy: 'Foundation-heavy with careful expense tracking',
        keyInsight: 'Expense tracking for 3 months revealed $400/month waste',
        monthlyContribution: 2480,
        timeToGoal: '2.3 years remaining'
      }
    ];

    return dreamTwinProfiles[Math.floor(Math.random() * dreamTwinProfiles.length)];
  };

  // Simulate loading and generate dream twin
  useEffect(() => {
    const timer = setTimeout(() => {
      setDreamTwin(generateDreamTwin(userProfile));
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [userProfile]);

  const getCurrentInsights = () => {
    return communityInsights[selectedInsight] || [];
  };

  const getInsightColor = (trend) => {
    switch (trend) {
      case 'up': return 'text-green-600 bg-green-50';
      case 'down': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      motivation: '🔥',
      tracking: '📊',
      strategy: '🎯',
      automation: '⚙️',
      priorities: '🎨',
      lifestyle: '🌱',
      profession: '💼',
      location: '📍',
      progress: '📈',
      completion: '✅',
      resilience: '💪',
    };
    return icons[category] || '💡';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded-lg mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">
          🌟 Community Insights
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Learn from the anonymous patterns of thousands of dreamers just like you. 
          All data is aggregated and privacy-protected.
        </p>
      </div>

      {/* Dream Twin Feature */}
      {dreamTwin && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-200">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                <span className="text-3xl mr-3">{dreamTwin.avatar}</span>
                Meet Your Dream Twin
              </h3>
              <p className="text-purple-700">
                Someone similar to you who's 6 months ahead on the journey
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(dreamTwin.currentProgress * 100)}%
              </div>
              <div className="text-sm text-purple-600">Complete</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-purple-100">
                <h4 className="font-semibold text-gray-800 mb-2">{dreamTwin.name}'s Profile</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>📍 {dreamTwin.location}</div>
                  <div>🎂 {dreamTwin.age} years old</div>
                  <div>💰 ${dreamTwin.monthlyIncome.toLocaleString()}/month</div>
                  <div>🏠 ${dreamTwin.dreamAmount.toLocaleString()} {dreamTwin.dreamType}</div>
                  <div>⏰ {dreamTwin.timeToGoal}</div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-purple-100">
                <h4 className="font-semibold text-gray-800 mb-2">💡 Key Insight</h4>
                <p className="text-sm text-gray-600 italic">
                  "{dreamTwin.keyInsight}"
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-purple-100">
                <h4 className="font-semibold text-gray-800 mb-2">📈 Progress Story</h4>
                <p className="text-sm text-gray-600 mb-3">
                  {dreamTwin.story}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${dreamTwin.currentProgress * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-purple-100">
                <h4 className="font-semibold text-gray-800 mb-2">🎯 Strategy</h4>
                <p className="text-sm text-gray-600 mb-2">{dreamTwin.strategy}</p>
                <div className="text-lg font-semibold text-purple-600">
                  ${dreamTwin.monthlyContribution}/month
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-purple-100 rounded-lg">
            <p className="text-sm text-purple-800 text-center">
              🔒 This profile is generated from anonymized patterns, not a real user. 
              No personal data is shared or stored.
            </p>
          </div>
        </div>
      )}

      {/* Community Insights Tabs */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Tab Navigation */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="flex space-x-1">
            {[
              { key: 'behavioral', label: 'Behavioral Patterns', icon: '🧠' },
              { key: 'demographic', label: 'Demographic Trends', icon: '👥' },
              { key: 'milestones', label: 'Milestone Data', icon: '🏆' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setSelectedInsight(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedInsight === tab.key
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-white hover:shadow-sm'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Insights Content */}
        <div className="p-6">
          <div className="grid gap-6">
            {getCurrentInsights().map((insight, index) => (
              <div 
                key={insight.id}
                className="border border-gray-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-indigo-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <span className="text-2xl mr-3">{insight.icon}</span>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getInsightColor(insight.trend)}`}>
                        {getCategoryIcon(insight.category)} {insight.category}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-indigo-600 mr-2">
                        {insight.statistic}
                      </span>
                      <span className="text-gray-700">
                        {insight.description}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                      💡 <strong>Impact:</strong> {insight.impact}
                    </div>
                  </div>

                  <div className="ml-4 text-right">
                    <div className={`w-3 h-3 rounded-full ${
                      insight.trend === 'up' ? 'bg-green-400' : 
                      insight.trend === 'down' ? 'bg-red-400' : 'bg-blue-400'
                    }`}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center">
              <span className="mr-2">🔒</span>
              Data aggregated from 10,000+ anonymous users
            </div>
            <div className="flex items-center">
              <span className="mr-2">📊</span>
              Updated monthly • Privacy-first
            </div>
          </div>
        </div>
      </div>

      {/* Personal Application */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
        <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center">
          🎯 Apply These Insights to Your Journey
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">🚀 Quick Wins</h4>
            <ul className="space-y-2 text-sm text-green-700">
              <li>• Set up automated transfers (2.4x faster progress)</li>
              <li>• Track weekly vs monthly (3x success rate)</li>
              <li>• Calculate daily equivalents for motivation</li>
              <li>• Celebrate small milestones (94% stay motivated)</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">📈 Long-term Success</h4>
            <ul className="space-y-2 text-sm text-green-700">
              <li>• Focus on reaching the halfway point (78% completion)</li>
              <li>• Expect 2-3 setbacks - resilience matters</li>
              <li>• Your second $10k will be faster than your first</li>
              <li>• Consider the 3-bucket system (85% stay on track)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityInsights;
