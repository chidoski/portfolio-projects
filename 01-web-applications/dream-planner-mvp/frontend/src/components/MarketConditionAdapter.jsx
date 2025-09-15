import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  DollarSign,
  Target,
  Lightbulb,
  ArrowRight,
  Sparkles,
  Umbrella,
  ShoppingCart
} from 'lucide-react';

/**
 * MarketConditionAdapter Component
 * 
 * Adjusts projections and messaging based on current market conditions without causing panic.
 * Reframes market volatility as opportunities and provides appropriate strategies for each condition.
 * Shows market conditions as friendly weather metaphors with actionable insights.
 */
const MarketConditionAdapter = ({ 
  userProfile = {},
  dreamGoal = {},
  currentMarketData = {},
  monthlyContribution = 500,
  className = ""
}) => {
  const [currentCondition, setCurrentCondition] = useState('sunny');
  const [previousValues, setPreviousValues] = useState({});
  const [showAnimation, setShowAnimation] = useState(false);

  // Mock market data - in real app, this would come from an API
  const marketData = {
    spy500Change: currentMarketData.spy500Change || -2.3, // Last 30 days
    vixLevel: currentMarketData.vixLevel || 28, // Volatility index
    bondYield: currentMarketData.bondYield || 4.2,
    dollarCostAdvantage: currentMarketData.dollarCostAdvantage || 18, // Percentage more shares bought
    portfolioGrowth: currentMarketData.portfolioGrowth || -1200, // Monthly change
    ...currentMarketData
  };

  // Determine market condition based on data
  const determineMarketCondition = () => {
    const { spy500Change, vixLevel } = marketData;
    
    if (spy500Change >= 3 && vixLevel < 20) {
      return 'sunny'; // Bull market
    } else if (spy500Change <= -5 || vixLevel > 30) {
      return 'rainy'; // Bear market
    } else {
      return 'cloudy'; // Uncertain/sideways market
    }
  };

  useEffect(() => {
    const newCondition = determineMarketCondition();
    if (newCondition !== currentCondition) {
      setCurrentCondition(newCondition);
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 2000);
    }
  }, [marketData, currentCondition]);

  // Weather condition configurations
  const weatherConditions = {
    sunny: {
      icon: Sun,
      name: 'Sunny Skies',
      color: 'text-yellow-500',
      bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50',
      borderColor: 'border-yellow-200',
      description: 'Bull Market - Markets Rising',
      mood: '😊',
      strategy: 'Ride the Wave'
    },
    cloudy: {
      icon: Cloud,
      name: 'Partly Cloudy',
      color: 'text-gray-500',
      bgColor: 'bg-gradient-to-br from-gray-50 to-blue-50',
      borderColor: 'border-gray-200',
      description: 'Mixed Signals - Markets Sideways',
      mood: '🤔',
      strategy: 'Stay the Course'
    },
    rainy: {
      icon: CloudRain,
      name: 'Market Showers',
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200',
      description: 'Bear Market - Sale Season!',
      mood: '🛍️',
      strategy: 'Shopping Time'
    }
  };

  const condition = weatherConditions[currentCondition];

  // Generate positive messages based on market conditions
  const getMarketMessage = () => {
    const dreamTitle = dreamGoal.title || 'Maine cottage';
    const monthlyAmount = monthlyContribution;
    
    switch (currentCondition) {
      case 'sunny':
        const portfolioGain = Math.abs(marketData.portfolioGrowth);
        const daysCloser = Math.round(portfolioGain / (monthlyAmount / 30));
        return {
          title: 'Your Savings Are Growing! 🌱',
          message: `Your existing savings grew by $${portfolioGain.toLocaleString()} this month - that's ${daysCloser} days closer to ${dreamTitle}!`,
          actionMessage: 'Keep contributing steadily to capture continued growth.',
          insight: `Bull markets reward patience. Your consistent investing is paying off beautifully!`
        };
        
      case 'rainy':
        const extraShares = marketData.dollarCostAdvantage;
        return {
          title: 'Market Sale in Progress! 🛍️',
          message: `Market sale! Your monthly savings buy ${extraShares}% more future wealth than they did last month.`,
          actionMessage: 'Consider adding extra this month if possible - it\'s like getting a discount on your dreams.',
          insight: `Bear markets are when wealth is built. You're buying future prosperity at today's discounted prices!`
        };
        
      case 'cloudy':
        return {
          title: 'Steady as She Goes ⚓',
          message: `Markets are taking a breather, but your ${dreamTitle} fund keeps growing with every contribution.`,
          actionMessage: 'Perfect time to review your strategy and maybe increase contributions.',
          insight: `Sideways markets test patience but reward consistency. You're building wealth while others worry!`
        };
        
      default:
        return {
          title: 'Your Financial Journey Continues',
          message: `Every contribution brings you closer to ${dreamTitle}, regardless of market noise.`,
          actionMessage: 'Stay focused on your long-term goals.',
          insight: 'Time in the market beats timing the market every time.'
        };
    }
  };

  // Get strategies for current market condition
  const getStrategies = () => {
    const baseStrategies = [
      {
        icon: Target,
        title: 'Maintain Your Course',
        description: 'Keep your regular contributions on autopilot',
        priority: 'high'
      },
      {
        icon: Calendar,
        title: 'Review Timeline',
        description: 'Check if your goal timeline needs adjustment',
        priority: 'medium'
      }
    ];

    const conditionStrategies = {
      sunny: [
        {
          icon: TrendingUp,
          title: 'Capture Momentum',
          description: 'Consider increasing contributions while markets are favorable',
          priority: 'medium'
        },
        {
          icon: Lightbulb,
          title: 'Rebalance Check',
          description: 'Your portfolio may be overweight in stocks after gains',
          priority: 'low'
        }
      ],
      cloudy: [
        {
          icon: Lightbulb,
          title: 'Strategy Review',
          description: 'Perfect time to reassess your investment allocation',
          priority: 'medium'
        },
        {
          icon: DollarSign,
          title: 'Opportunity Fund',
          description: 'Build extra cash for the next clear market direction',
          priority: 'low'
        }
      ],
      rainy: [
        {
          icon: ShoppingCart,
          title: 'Buying Opportunity',
          description: 'Add extra if possible - you\'re getting more for your money',
          priority: 'high'
        },
        {
          icon: Umbrella,
          title: 'Stay Protected',
          description: 'Don\'t panic sell - this is when wealth is built',
          priority: 'high'
        }
      ]
    };

    return [...baseStrategies, ...(conditionStrategies[currentCondition] || [])];
  };

  const message = getMarketMessage();
  const strategies = getStrategies();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Market Weather Widget */}
      <div className={`${condition.bgColor} ${condition.borderColor} border-2 rounded-2xl p-6 transition-all duration-500 ${showAnimation ? 'scale-105' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <condition.icon className={`w-8 h-8 ${condition.color}`} />
            <div>
              <h3 className="text-lg font-bold text-gray-800">{condition.name}</h3>
              <p className="text-sm text-gray-600">{condition.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl">{condition.mood}</div>
            <div className="text-xs text-gray-500 font-medium">{condition.strategy}</div>
          </div>
        </div>

        {/* Market Impact Message */}
        <div className="bg-white/60 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">{message.title}</h4>
              <p className="text-gray-700 mb-2">{message.message}</p>
              <p className="text-sm text-purple-600 font-medium">{message.actionMessage}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Market Insights */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-800">Market Insight</h3>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
          <p className="text-gray-700 italic">{message.insight}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {marketData.spy500Change > 0 ? '+' : ''}{marketData.spy500Change}%
            </div>
            <div className="text-xs text-gray-600">Market (30 days)</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              +{marketData.dollarCostAdvantage}%
            </div>
            <div className="text-xs text-gray-600">Dollar Cost Advantage</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {marketData.vixLevel}
            </div>
            <div className="text-xs text-gray-600">Volatility Level</div>
          </div>
        </div>
      </div>

      {/* Strategies for Current Conditions */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <Target className="w-5 h-5 text-green-500" />
          <h3 className="text-lg font-semibold text-gray-800">Your Action Plan</h3>
        </div>

        <div className="space-y-3">
          {strategies.map((strategy, index) => (
            <div 
              key={index}
              className={`flex items-start space-x-3 p-3 rounded-lg transition-colors duration-200 hover:bg-gray-50 ${
                strategy.priority === 'high' 
                  ? 'border-l-4 border-green-500 bg-green-50/50' 
                  : strategy.priority === 'medium'
                  ? 'border-l-4 border-yellow-500 bg-yellow-50/50'
                  : 'border-l-4 border-gray-300 bg-gray-50/50'
              }`}
            >
              <strategy.icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                strategy.priority === 'high' 
                  ? 'text-green-600' 
                  : strategy.priority === 'medium'
                  ? 'text-yellow-600'
                  : 'text-gray-600'
              }`} />
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">{strategy.title}</h4>
                <p className="text-sm text-gray-600">{strategy.description}</p>
              </div>
              {strategy.priority === 'high' && (
                <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                  Priority
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Progress Acceleration Display */}
      {currentCondition === 'rainy' && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <ShoppingCart className="w-6 h-6" />
            <h3 className="text-lg font-bold">Market Sale Advantage</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold mb-1">
                +{marketData.dollarCostAdvantage}%
              </div>
              <div className="text-sm opacity-90">More shares per dollar</div>
            </div>
            <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold mb-1">
                {Math.round(marketData.dollarCostAdvantage * 0.6)} days
              </div>
              <div className="text-sm opacity-90">Closer to your goal</div>
            </div>
          </div>
          
          <p className="text-sm mt-4 opacity-90">
            Market downturns are when future millionaires are made. You're building wealth while others worry!
          </p>
        </div>
      )}

      {/* Growth Celebration for Bull Markets */}
      {currentCondition === 'sunny' && marketData.portfolioGrowth > 0 && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-6 h-6" />
            <h3 className="text-lg font-bold">Your Money is Growing!</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold mb-1">
                {formatCurrency(Math.abs(marketData.portfolioGrowth))}
              </div>
              <div className="text-sm opacity-90">Portfolio growth this month</div>
            </div>
            <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold mb-1">
                {Math.round(Math.abs(marketData.portfolioGrowth) / (monthlyContribution / 30))} days
              </div>
              <div className="text-sm opacity-90">Ahead of schedule</div>
            </div>
          </div>
          
          <p className="text-sm mt-4 opacity-90">
            Your consistent investing strategy is paying off! This is compound growth in action.
          </p>
        </div>
      )}
    </div>
  );
};

export default MarketConditionAdapter;
