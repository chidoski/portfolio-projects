import React, { useState, useEffect } from 'react';

const MicroLearningCards = ({ 
  userProfile = {}, 
  context = 'default',
  onComplete = () => {},
  autoShow = true 
}) => {
  const [currentCard, setCurrentCard] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasSeenCards, setHasSeenCards] = useState(new Set());
  const [isVisible, setIsVisible] = useState(false);

  // Sample user data - would come from props in real app
  const userData = {
    monthlyIncome: userProfile.monthlyIncome || 5500,
    monthlyExpenses: userProfile.monthlyExpenses || 3800,
    currentAge: userProfile.age || 28,
    retirementAge: userProfile.retirementAge || 65,
    dreamAmount: userProfile.dreamAmount || 400000,
    dreamTimeline: userProfile.dreamTimeline || 7,
    emergencyFund: userProfile.emergencyFund || 15000,
    monthlySavings: (userProfile.monthlyIncome || 5500) - (userProfile.monthlyExpenses || 3800),
    bucketAllocation: {
      foundation: 423,
      dream: 634,
      life: 200
    }
  };

  // Micro-learning cards with personalized content
  const learningCards = {
    threeBuckets: {
      id: 'threeBuckets',
      title: 'Why Three Buckets?',
      quickExplanation: `Your Foundation ($${userData.bucketAllocation.foundation}/month) ensures you won't eat cat food. Your Dream ($${userData.bucketAllocation.dream}/month) makes you excited to save. Your Life bucket ($${userData.bucketAllocation.life}/month) means you never have to say no to important moments.`,
      icon: '🪣',
      readTime: '20 seconds',
      context: ['buckets', 'setup', 'default'],
      expandedContent: {
        visual: 'bucketDiagram',
        sections: [
          {
            title: 'Foundation Bucket: Your Safety Net',
            content: `At $${userData.bucketAllocation.foundation}/month, you'll have $${userData.emergencyFund.toLocaleString()} emergency fund in ${Math.ceil(userData.emergencyFund / userData.bucketAllocation.foundation)} months. This prevents financial disasters from derailing your dreams.`,
            icon: '🛡️',
            color: 'green'
          },
          {
            title: 'Dream Bucket: Your Motivation',
            content: `$${userData.bucketAllocation.dream}/month gets you to $${userData.dreamAmount.toLocaleString()} in ${userData.dreamTimeline} years. This bucket makes saving feel exciting, not sacrificial.`,
            icon: '✨',
            color: 'purple'
          },
          {
            title: 'Life Bucket: Your Freedom',
            content: `$${userData.bucketAllocation.life}/month means saying YES to a $${userData.bucketAllocation.life * 3} weekend getaway or $${userData.bucketAllocation.life * 2} dinner without guilt. Life happens - be ready.`,
            icon: '🌟',
            color: 'blue'
          }
        ]
      }
    },

    compoundInterest: {
      id: 'compoundInterest',
      title: 'The Magic of Starting Early',
      quickExplanation: `Starting at ${userData.currentAge}, your $${userData.bucketAllocation.foundation}/month Foundation becomes $${Math.round(userData.bucketAllocation.foundation * 12 * Math.pow(1.07, userData.retirementAge - userData.currentAge) / 1000)}k by retirement. Wait 5 years? Only $${Math.round(userData.bucketAllocation.foundation * 12 * Math.pow(1.07, userData.retirementAge - userData.currentAge - 5) / 1000)}k. Time is your superpower.`,
      icon: '📈',
      readTime: '25 seconds',
      context: ['foundation', 'retirement', 'delay'],
      expandedContent: {
        visual: 'compoundChart',
        sections: [
          {
            title: 'The Time Advantage',
            content: `Every year you wait costs you approximately $${Math.round((userData.bucketAllocation.foundation * 12 * Math.pow(1.07, userData.retirementAge - userData.currentAge) - userData.bucketAllocation.foundation * 12 * Math.pow(1.07, userData.retirementAge - userData.currentAge - 1)) / 1000)}k in retirement money.`,
            icon: '⏰',
            color: 'orange'
          },
          {
            title: 'Your Numbers',
            content: `Start now: $${Math.round(userData.bucketAllocation.foundation * 12 * Math.pow(1.07, userData.retirementAge - userData.currentAge) / 1000)}k at retirement. Start at ${userData.currentAge + 5}: $${Math.round(userData.bucketAllocation.foundation * 12 * Math.pow(1.07, userData.retirementAge - userData.currentAge - 5) / 1000)}k. Start at ${userData.currentAge + 10}: $${Math.round(userData.bucketAllocation.foundation * 12 * Math.pow(1.07, userData.retirementAge - userData.currentAge - 10) / 1000)}k.`,
            icon: '🎯',
            color: 'green'
          }
        ]
      }
    },

    dollarCostAveraging: {
      id: 'dollarCostAveraging',
      title: 'Why Consistent Beats Perfect',
      quickExplanation: `Your $${userData.bucketAllocation.foundation}/month buys more shares when markets are down, fewer when up. Over ${userData.retirementAge - userData.currentAge} years, this "dollar-cost averaging" smooths out volatility and builds wealth automatically.`,
      icon: '📊',
      readTime: '22 seconds',
      context: ['investing', 'market', 'automation'],
      expandedContent: {
        visual: 'dollarCostChart',
        sections: [
          {
            title: 'Market Timing is Impossible',
            content: `Even experts can't time the market. But your automatic $${userData.bucketAllocation.foundation}/month means you buy at every price level, averaging out the highs and lows.`,
            icon: '🎲',
            color: 'blue'
          },
          {
            title: 'Your Advantage',
            content: `While others panic during market drops, your system keeps buying. A 20% market crash means your $${userData.bucketAllocation.foundation} buys 25% more shares that month.`,
            icon: '💪',
            color: 'green'
          }
        ]
      }
    },

    emergencyFund: {
      id: 'emergencyFund',
      title: 'Your Emergency Fund Math',
      quickExplanation: `Your $${userData.monthlyExpenses.toLocaleString()}/month expenses mean a $${userData.emergencyFund.toLocaleString()} emergency fund covers ${Math.round(userData.emergencyFund / userData.monthlyExpenses)} months. That's the difference between a setback and a catastrophe.`,
      icon: '🚨',
      readTime: '18 seconds',
      context: ['emergency', 'foundation', 'security'],
      expandedContent: {
        visual: 'emergencyTimeline',
        sections: [
          {
            title: 'Why 6 Months?',
            content: `Job searches average 3-6 months. Medical emergencies can sideline you for months. ${Math.round(userData.emergencyFund / userData.monthlyExpenses)} months gives you breathing room to make good decisions, not desperate ones.`,
            icon: '🛡️',
            color: 'green'
          },
          {
            title: 'Peace of Mind Value',
            content: `With $${userData.emergencyFund.toLocaleString()} saved, you can take calculated risks, negotiate better, and sleep well knowing one crisis won't derail your dreams.`,
            icon: '😌',
            color: 'blue'
          }
        ]
      }
    },

    inflationProtection: {
      id: 'inflationProtection',
      title: 'Why Cash Loses Buying Power',
      quickExplanation: `Your $${userData.dreamAmount.toLocaleString()} cottage costs $${Math.round(userData.dreamAmount * Math.pow(1.03, userData.dreamTimeline)).toLocaleString()} in ${userData.dreamTimeline} years with 3% inflation. That's why your Dream bucket needs to grow, not just sit in savings.`,
      icon: '💰',
      readTime: '24 seconds',
      context: ['inflation', 'investing', 'dream'],
      expandedContent: {
        visual: 'inflationChart',
        sections: [
          {
            title: 'The Inflation Tax',
            content: `Every year, inflation reduces your cash's buying power by ~3%. That $${userData.dreamAmount.toLocaleString()} cottage becomes $${Math.round(userData.dreamAmount * 1.03).toLocaleString()} next year just from inflation.`,
            icon: '📉',
            color: 'red'
          },
          {
            title: 'Growth Protection',
            content: `Investing your Dream bucket in diversified funds that average 7-10% returns helps you stay ahead of inflation and reach your goal faster.`,
            icon: '📈',
            color: 'green'
          }
        ]
      }
    },

    lifestyle_inflation: {
      id: 'lifestyle_inflation',
      title: 'The Lifestyle Inflation Trap',
      quickExplanation: `Your $${userData.monthlySavings.toLocaleString()}/month savings rate is your wealth-building engine. Every $100 raise that goes to expenses instead of savings costs you $${Math.round(100 * 12 * Math.pow(1.07, 30) / 1000)}k over 30 years.`,
      icon: '⬆️',
      readTime: '26 seconds',
      context: ['income', 'expenses', 'raises'],
      expandedContent: {
        visual: 'lifestyleChart',
        sections: [
          {
            title: 'The Wealth Killer',
            content: `Most people spend every raise. If you save just 50% of raises while spending the other 50%, you accelerate wealth building without feeling deprived.`,
            icon: '⚖️',
            color: 'orange'
          },
          {
            title: 'Your Opportunity',
            content: `Next $1,000 raise: Spend $500, save $500. You improve your lifestyle AND add $${Math.round(500 * 12 * Math.pow(1.07, 30) / 1000)}k to your 30-year net worth.`,
            icon: '🚀',
            color: 'green'
          }
        ]
      }
    }
  };

  // Context-based card selection
  const getContextualCards = (context) => {
    return Object.values(learningCards).filter(card => 
      card.context.includes(context) || card.context.includes('default')
    );
  };

  // Auto-show card based on context
  useEffect(() => {
    if (autoShow && !currentCard) {
      const availableCards = getContextualCards(context);
      const unseenCards = availableCards.filter(card => !hasSeenCards.has(card.id));
      
      if (unseenCards.length > 0) {
        const randomCard = unseenCards[Math.floor(Math.random() * unseenCards.length)];
        setCurrentCard(randomCard);
        setIsVisible(true);
      }
    }
  }, [context, autoShow, hasSeenCards, currentCard]);

  const handleCardComplete = () => {
    if (currentCard) {
      setHasSeenCards(prev => new Set([...prev, currentCard.id]));
      setIsVisible(false);
      setIsExpanded(false);
      setTimeout(() => {
        setCurrentCard(null);
        onComplete();
      }, 300);
    }
  };

  const handleLearnMore = () => {
    setIsExpanded(!isExpanded);
  };

  const renderVisual = (visual, card) => {
    switch (visual) {
      case 'bucketDiagram':
        return (
          <div className="my-6">
            <div className="flex justify-center space-x-4">
              {card.expandedContent.sections.map((section, index) => (
                <div key={index} className={`flex-1 bg-${section.color}-50 border-2 border-${section.color}-200 rounded-lg p-4 text-center`}>
                  <div className="text-2xl mb-2">{section.icon}</div>
                  <div className={`text-${section.color}-800 font-semibold text-sm`}>
                    {section.title.split(':')[0]}
                  </div>
                  <div className={`text-${section.color}-600 text-xs mt-1`}>
                    ${userData.bucketAllocation[Object.keys(userData.bucketAllocation)[index]]}/mo
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'compoundChart':
        const years = [0, 10, 20, 30];
        const values = years.map(year => 
          userData.bucketAllocation.foundation * 12 * Math.pow(1.07, year) / 1000
        );
        return (
          <div className="my-6">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
              <div className="flex justify-between items-end h-32">
                {years.map((year, index) => (
                  <div key={year} className="flex-1 text-center">
                    <div 
                      className="bg-gradient-to-t from-green-500 to-blue-500 mx-2 rounded-t"
                      style={{ height: `${(values[index] / Math.max(...values)) * 100}%` }}
                    ></div>
                    <div className="text-xs font-semibold mt-2">Year {year}</div>
                    <div className="text-xs text-gray-600">${Math.round(values[index])}k</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'dollarCostChart':
        return (
          <div className="my-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-semibold text-gray-700">Market Volatility</div>
                <div className="text-sm font-semibold text-gray-700">Your Purchases</div>
              </div>
              <div className="space-y-2">
                {[
                  { month: 'Jan', price: '$50', shares: '8.5 shares' },
                  { month: 'Feb', price: '$40', shares: '10.6 shares' },
                  { month: 'Mar', price: '$60', shares: '7.1 shares' },
                  { month: 'Apr', price: '$45', shares: '9.4 shares' }
                ].map((data, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{data.month}: {data.price}</span>
                    <span className="text-green-600">{data.shares}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'emergencyTimeline':
        return (
          <div className="my-6">
            <div className="bg-red-50 rounded-lg p-4">
              <div className="space-y-3">
                {[
                  { month: 'Month 1-2', event: 'Job search begins', stress: 'Low' },
                  { month: 'Month 3-4', event: 'Pressure builds', stress: 'Medium' },
                  { month: 'Month 5-6', event: 'Desperation sets in', stress: 'High' },
                  { month: 'Month 6+', event: 'You\'re covered!', stress: 'Protected' }
                ].map((data, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{data.month}</span>
                    <span className="text-sm text-gray-600">{data.event}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      data.stress === 'Protected' ? 'bg-green-200 text-green-800' :
                      data.stress === 'High' ? 'bg-red-200 text-red-800' :
                      data.stress === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-blue-200 text-blue-800'
                    }`}>
                      {data.stress}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!currentCard || !isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className={`bg-white rounded-2xl shadow-2xl border border-gray-200 transition-all duration-300 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      } ${isExpanded ? 'max-w-lg' : ''}`}>
        {/* Card Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <span className="text-2xl mr-3">{currentCard.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">{currentCard.title}</h3>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <span className="mr-2">⏱️</span>
                  <span>{currentCard.readTime}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleCardComplete}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Quick Explanation */}
        <div className="p-4">
          <p className="text-gray-700 text-sm leading-relaxed">
            {currentCard.quickExplanation}
          </p>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-gray-100">
            {currentCard.expandedContent.visual && 
              renderVisual(currentCard.expandedContent.visual, currentCard)
            }
            
            <div className="p-4 space-y-4">
              {currentCard.expandedContent.sections.map((section, index) => (
                <div key={index} className={`bg-${section.color}-50 border-l-4 border-${section.color}-400 p-3 rounded-r`}>
                  <h4 className="font-semibold text-gray-800 text-sm flex items-center mb-2">
                    <span className="mr-2">{section.icon}</span>
                    {section.title}
                  </h4>
                  <p className="text-gray-700 text-xs leading-relaxed">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-4 border-t border-gray-100 flex space-x-3">
          <button
            onClick={handleLearnMore}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
          >
            {isExpanded ? 'Show Less' : 'Learn More'}
          </button>
          <button
            onClick={handleCardComplete}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            Got It
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>💡 Micro-Learning</span>
            <span>{hasSeenCards.size + 1} of {Object.keys(learningCards).length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
            <div 
              className="bg-indigo-600 h-1 rounded-full transition-all duration-300"
              style={{ width: `${((hasSeenCards.size + 1) / Object.keys(learningCards).length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MicroLearningCards;
