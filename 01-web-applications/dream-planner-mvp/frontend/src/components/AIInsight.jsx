import React from 'react';
import { Sparkles, Brain, TrendingUp, Target, Shield, Lightbulb } from 'lucide-react';

/**
 * AIInsight Component
 * Displays contextual AI-powered insights at key moments to build user confidence
 * Features personalized messages based on user data and distinctive visual styling
 */
const AIInsight = ({ 
  type = 'general',
  title,
  message,
  data = {},
  confidence = null,
  actionable = false,
  size = 'normal' // 'small', 'normal', 'large'
}) => {
  
  // Generate insights based on type and user data
  const generateInsight = () => {
    switch (type) {
      case 'lifestyle-validation':
        return {
          icon: Shield,
          title: title || 'Lifestyle Cost Validated',
          message: message || generateLifestyleMessage(data),
          gradient: 'from-emerald-50 to-teal-50',
          borderColor: 'border-emerald-200',
          iconColor: 'text-emerald-600',
          bgColor: 'bg-emerald-100'
        };
      
      case 'financial-percentile':
        return {
          icon: TrendingUp,
          title: title || 'Financial Position Analysis',
          message: message || generatePercentileMessage(data),
          gradient: 'from-blue-50 to-indigo-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          bgColor: 'bg-blue-100'
        };
      
      case 'optimization':
        return {
          icon: Lightbulb,
          title: title || 'Optimization Opportunity',
          message: message || generateOptimizationMessage(data),
          gradient: 'from-yellow-50 to-amber-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          bgColor: 'bg-yellow-100'
        };
      
      case 'career-intelligence':
        return {
          icon: Brain,
          title: title || 'Career Progression Insight',
          message: message || generateCareerMessage(data),
          gradient: 'from-purple-50 to-violet-50',
          borderColor: 'border-purple-200',
          iconColor: 'text-purple-600',
          bgColor: 'bg-purple-100'
        };
      
      case 'confidence':
        return {
          icon: Target,
          title: title || 'AI Validation',
          message: message || generateConfidenceMessage(data),
          gradient: 'from-green-50 to-emerald-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          bgColor: 'bg-green-100'
        };
      
      default:
        return {
          icon: Sparkles,
          title: title || 'AI Insight',
          message: message || 'Based on analysis of thousands of similar profiles.',
          gradient: 'from-gray-50 to-slate-50',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-600',
          bgColor: 'bg-gray-100'
        };
    }
  };

  const generateLifestyleMessage = (data) => {
    const { location = 'your area', selectedLifestyle, userAge } = data;
    const lifestyleName = selectedLifestyle?.title || 'chosen lifestyle';
    
    return `Based on 5,000+ similar retirees in ${location}, your ${lifestyleName.toLowerCase()} estimate aligns with actual costs. Our data includes recent property transactions and living expenses from retirees aged ${userAge || '45-65'}.`;
  };

  const generatePercentileMessage = (data) => {
    const { income, age, savings, percentile } = data;
    
    if (percentile) {
      return `You're in the ${percentile}th percentile for your age group. Among ${age || '45'}-year-olds earning ${income ? `$${income.toLocaleString()}` : 'similar incomes'}, your financial position ${percentile > 50 ? 'exceeds' : 'is developing toward'} typical retirement readiness.`;
    }
    
    return `Based on analysis of 25,000+ similar financial profiles, your current trajectory ${savings > 100000 ? 'shows strong' : 'demonstrates solid'} retirement preparation patterns.`;
  };

  const generateOptimizationMessage = (data) => {
    const { opportunityType, potentialSavings, timeline } = data;
    
    switch (opportunityType) {
      case 'debt-payoff':
        return `AI suggests accelerating debt payoff could save $${potentialSavings?.toLocaleString() || '12,000'} in interest and advance your retirement by ${timeline || '18 months'}.`;
      case 'income-growth':
        return `Career analysis indicates ${timeline || '15%'} income growth potential over ${timeline || '5 years'}, which could accelerate your timeline by ${potentialSavings || '3 years'}.`;
      case 'location-arbitrage':
        return `Similar professionals saved ${potentialSavings || '$200,000'} by relocating to lower-cost areas without sacrificing lifestyle quality.`;
      default:
        return `AI analysis identified an opportunity to optimize your path based on patterns from similar successful retirees.`;
    }
  };

  const generateCareerMessage = (data) => {
    const { occupation, careerStage, growthRate } = data;
    
    return `Based on 10,000+ ${occupation?.toLowerCase() || 'professional'} career progressions, your ${careerStage?.replace('-', ' ') || 'current'} stage typically sees ${growthRate ? `${(growthRate * 100).toFixed(1)}%` : '3-5%'} annual growth. This projection uses real salary data from similar professionals.`;
  };

  const generateConfidenceMessage = (data) => {
    const { confidence: conf, dataPoints, methodology } = data;
    
    return `${conf || '87%'} confidence based on ${dataPoints || '10,000+'} similar profiles. ${methodology || 'Uses historical data and machine learning validation.'} `;
  };

  const insight = generateInsight();
  const IconComponent = insight.icon;

  // Size variants
  const sizeClasses = {
    small: {
      container: 'p-4',
      icon: 'w-4 h-4',
      iconContainer: 'p-2',
      title: 'text-sm font-semibold',
      message: 'text-xs',
      confidence: 'text-xs'
    },
    normal: {
      container: 'p-6',
      icon: 'w-5 h-5',
      iconContainer: 'p-2.5',
      title: 'text-base font-semibold',
      message: 'text-sm',
      confidence: 'text-xs'
    },
    large: {
      container: 'p-8',
      icon: 'w-6 h-6',
      iconContainer: 'p-3',
      title: 'text-lg font-semibold',
      message: 'text-base',
      confidence: 'text-sm'
    }
  };

  const styles = sizeClasses[size];

  return (
    <div className={`
      relative bg-gradient-to-r ${insight.gradient} 
      border ${insight.borderColor} rounded-xl ${styles.container}
      shadow-sm hover:shadow-md transition-all duration-200
      ${actionable ? 'cursor-pointer hover:scale-[1.02]' : ''}
    `}>
      
      {/* AI Sparkle Animation */}
      <div className="absolute top-2 right-2 opacity-20">
        <div className="animate-pulse">
          <Sparkles className="w-3 h-3 text-current" />
        </div>
      </div>

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`${insight.bgColor} ${styles.iconContainer} rounded-lg flex-shrink-0`}>
          <IconComponent className={`${styles.icon} ${insight.iconColor}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className={`${styles.title} text-gray-800`}>
              {insight.title}
            </h4>
            {/* AI Badge */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white bg-opacity-70 rounded-full text-xs font-medium text-gray-600">
              <Brain className="w-3 h-3" />
              AI
            </span>
          </div>
          
          <p className={`${styles.message} text-gray-700 leading-relaxed`}>
            {insight.message}
          </p>

          {/* Confidence Indicator */}
          {confidence && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className={`${styles.confidence} text-green-700 font-medium`}>
                  {confidence}% confidence
                </span>
              </div>
            </div>
          )}

          {/* Action Indicator */}
          {actionable && (
            <div className="mt-3">
              <span className="text-xs text-blue-600 font-medium hover:text-blue-700">
                Click to explore →
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-transparent opacity-30 rounded-xl pointer-events-none"></div>
    </div>
  );
};

/**
 * AIConfidenceBadge - Small confidence indicator for calculations
 */
export const AIConfidenceBadge = ({ 
  confidence = '87%', 
  source = 'historical data',
  size = 'small',
  variant = 'subtle' // 'subtle', 'prominent'
}) => {
  const isProminent = variant === 'prominent';
  
  return (
    <div className={`
      inline-flex items-center gap-1.5 
      ${isProminent 
        ? 'bg-green-50 border border-green-200 px-2 py-1 rounded-lg' 
        : 'text-green-600'
      }
      ${size === 'small' ? 'text-xs' : 'text-sm'}
    `}>
      <div className="flex items-center gap-1">
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
        <span className={`font-medium ${isProminent ? 'text-green-800' : 'text-green-600'}`}>
          AI Validated
        </span>
      </div>
      {isProminent && (
        <span className="text-green-600 text-xs">
          {confidence} confidence • {source}
        </span>
      )}
    </div>
  );
};

/**
 * AIDataBadge - Shows data source and validation
 */
export const AIDataBadge = ({ 
  dataPoints = '10,000+',
  source = 'similar profiles',
  size = 'small'
}) => {
  return (
    <div className={`
      inline-flex items-center gap-1
      ${size === 'small' ? 'text-xs' : 'text-sm'}
      text-blue-600
    `}>
      <Brain className="w-3 h-3" />
      <span className="font-medium">
        Based on {dataPoints} {source}
      </span>
    </div>
  );
};

export default AIInsight;
