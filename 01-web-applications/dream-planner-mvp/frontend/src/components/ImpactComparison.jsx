import React, { useState, useEffect, useRef } from 'react';
import { useCountUp } from '../utils/useCountUp';
import ProgressBar from './ProgressBar';
import { useIntersectionObserver } from '../utils/useIntersectionObserver';

const ImpactComparison = ({ triggerAnimation = false, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const containerRef = useRef(null);

  // Use intersection observer to trigger animations when component comes into view
  const isInView = useIntersectionObserver(containerRef, { threshold: 0.3 });

  // Trigger animations when component is visible or when triggerAnimation prop changes
  useEffect(() => {
    if ((isInView || triggerAnimation) && !hasTriggered) {
      setIsVisible(true);
      setHasTriggered(true);
    }
  }, [isInView, triggerAnimation, hasTriggered]);

  // Sarah's data for each approach
  const scenarios = {
    traditional: {
      title: "Traditional Advice",
      subtitle: "\"Save 15%, retire at 65\"",
      description: "Generic one-size-fits-all approach",
      color: "gray",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      iconColor: "text-gray-500",
      icon: "📊",
      outcomes: {
        monthlyContribution: 630, // 15% of $4200
        retirementAge: 65,
        retirementSavings: 980000,
        dreamAchieved: false,
        dreamAge: null,
        happinessScore: 65,
        stressLevel: 75,
        lifeBalance: 40
      },
      features: [
        "15% income to retirement",
        "No specific life goals",
        "Hope dreams work out",
        "Rigid, inflexible plan",
        "Delayed gratification only"
      ]
    },
    popularApps: {
      title: "Popular Apps",
      subtitle: "\"Budget everything separately\"",
      description: "Fragmented short-term focus",
      color: "orange",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      iconColor: "text-orange-500",
      icon: "📱",
      outcomes: {
        monthlyContribution: 200, // Minimal retirement savings
        retirementAge: 72,
        retirementSavings: 420000,
        dreamAchieved: false,
        dreamAge: null,
        happinessScore: 45,
        stressLevel: 85,
        lifeBalance: 25
      },
      features: [
        "Separate budgets for everything",
        "Car savings: $300/month",
        "Vacation fund: $150/month",
        "Retirement: whatever's left",
        "No integrated planning"
      ]
    },
    dreamPlanner: {
      title: "Dream Planner",
      subtitle: "\"Integrated life planning\"",
      description: "Mathematical certainty meets life vision",
      color: "purple",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      iconColor: "text-purple-500",
      icon: "✨",
      outcomes: {
        monthlyContribution: 500, // Foundation bucket
        retirementAge: 65,
        retirementSavings: 1200000, // Higher than traditional!
        dreamAchieved: true,
        dreamAge: 54, // After car setback
        happinessScore: 95,
        stressLevel: 25,
        lifeBalance: 90
      },
      features: [
        "Three-bucket system",
        "Specific dream: Maine cottage",
        "Retirement + dream achieved",
        "Handles life disruptions",
        "Mathematical certainty"
      ]
    }
  };

  // Animated counters for each scenario
  const createCounters = (scenario) => {
    const { outcomes } = scenarios[scenario];
    
    return {
      monthlyContribution: useCountUp({ 
        end: outcomes.monthlyContribution, 
        duration: 2000, 
        startOnTrigger: true 
      }),
      retirementSavings: useCountUp({ 
        end: outcomes.retirementSavings, 
        duration: 2500, 
        delay: 500,
        startOnTrigger: true 
      }),
      happinessScore: useCountUp({ 
        end: outcomes.happinessScore, 
        duration: 1500, 
        delay: 1000,
        startOnTrigger: true 
      }),
      stressLevel: useCountUp({ 
        end: outcomes.stressLevel, 
        duration: 1500, 
        delay: 1200,
        startOnTrigger: true 
      }),
      lifeBalance: useCountUp({ 
        end: outcomes.lifeBalance, 
        duration: 1500, 
        delay: 1400,
        startOnTrigger: true 
      })
    };
  };

  const traditionalCounters = createCounters('traditional');
  const popularAppsCounters = createCounters('popularApps');
  const dreamPlannerCounters = createCounters('dreamPlanner');

  // Trigger all animations when visible
  useEffect(() => {
    if (isVisible) {
      traditionalCounters.monthlyContribution.trigger();
      traditionalCounters.retirementSavings.trigger();
      traditionalCounters.happinessScore.trigger();
      traditionalCounters.stressLevel.trigger();
      traditionalCounters.lifeBalance.trigger();

      popularAppsCounters.monthlyContribution.trigger();
      popularAppsCounters.retirementSavings.trigger();
      popularAppsCounters.happinessScore.trigger();
      popularAppsCounters.stressLevel.trigger();
      popularAppsCounters.lifeBalance.trigger();

      dreamPlannerCounters.monthlyContribution.trigger();
      dreamPlannerCounters.retirementSavings.trigger();
      dreamPlannerCounters.happinessScore.trigger();
      dreamPlannerCounters.stressLevel.trigger();
      dreamPlannerCounters.lifeBalance.trigger();
    }
  }, [isVisible]);

  // Format currency
  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  };

  // Scenario card component
  const ScenarioCard = ({ scenarioKey, counters }) => {
    const scenario = scenarios[scenarioKey];
    const { outcomes } = scenario;
    
    return (
      <div className={`${scenario.bgColor} border-2 ${scenario.borderColor} rounded-2xl p-6 space-y-6 relative overflow-hidden transition-all duration-500 hover:shadow-lg ${
        scenarioKey === 'dreamPlanner' ? 'ring-2 ring-purple-300 ring-opacity-50' : ''
      }`}>
        
        {/* Winner badge for Dream Planner */}
        {scenarioKey === 'dreamPlanner' && (
          <div className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold transform rotate-12 shadow-lg">
            🏆 WINNER
          </div>
        )}

        {/* Header */}
        <div className="text-center space-y-2">
          <div className={`text-4xl ${scenario.iconColor} mb-2`}>
            {scenario.icon}
          </div>
          <h3 className="text-xl font-bold text-gray-800">{scenario.title}</h3>
          <p className="text-sm font-medium text-gray-600">{scenario.subtitle}</p>
          <p className="text-xs text-gray-500">{scenario.description}</p>
        </div>

        {/* Key Metrics */}
        <div className="space-y-4">
          {/* Monthly Savings */}
          <div className="bg-white rounded-lg p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Monthly Retirement Savings</p>
              <p className="text-2xl font-bold text-gray-800">
                {formatCurrency(counters.monthlyContribution.count)}
              </p>
            </div>
          </div>

          {/* Retirement by 65 */}
          <div className="bg-white rounded-lg p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Retirement Fund at 65</p>
              <p className="text-2xl font-bold text-gray-800 mb-3">
                {formatCurrency(counters.retirementSavings.count)}
              </p>
              <ProgressBar 
                percentage={(counters.retirementSavings.count / 1200000) * 100}
                showPercentage={false}
                height="sm"
                className="mb-2"
              />
              <p className="text-xs text-gray-500">
                vs $1.2M comfortable retirement
              </p>
            </div>
          </div>

          {/* Dream Achievement */}
          <div className="bg-white rounded-lg p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Maine Cottage Dream</p>
              {outcomes.dreamAchieved ? (
                <div>
                  <p className="text-lg font-bold text-green-600 mb-1">
                    ✅ Achieved at {outcomes.dreamAge}
                  </p>
                  <p className="text-xs text-green-600">$180K cottage purchased</p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-bold text-red-600 mb-1">
                    ❌ Never achieved
                  </p>
                  <p className="text-xs text-red-600">Dreams deferred indefinitely</p>
                </div>
              )}
            </div>
          </div>

          {/* Life Quality Metrics */}
          <div className="bg-white rounded-lg p-4 space-y-3">
            <p className="text-sm text-gray-600 text-center font-medium">Life Quality</p>
            
            {/* Happiness Score */}
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Happiness</span>
                <span>{counters.happinessScore.count}%</span>
              </div>
              <ProgressBar 
                percentage={counters.happinessScore.count}
                showPercentage={false}
                height="sm"
              />
            </div>

            {/* Stress Level (inverted - lower is better) */}
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Stress Level</span>
                <span>{counters.stressLevel.count}%</span>
              </div>
              <ProgressBar 
                percentage={counters.stressLevel.count}
                showPercentage={false}
                height="sm"
              />
            </div>

            {/* Life Balance */}
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Life Balance</span>
                <span>{counters.lifeBalance.count}%</span>
              </div>
              <ProgressBar 
                percentage={counters.lifeBalance.count}
                showPercentage={false}
                height="sm"
              />
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="bg-white rounded-lg p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Key Features:</p>
          <ul className="space-y-2">
            {scenario.features.map((feature, index) => (
              <li key={index} className="text-xs text-gray-600 flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom Summary */}
        <div className={`border-t-2 ${scenario.borderColor} pt-4`}>
          {scenarioKey === 'dreamPlanner' ? (
            <div className="text-center">
              <p className="text-sm font-bold text-purple-700">
                🎯 Higher retirement + Dream achieved
              </p>
              <p className="text-xs text-purple-600 mt-1">
                Mathematical certainty meets life vision
              </p>
            </div>
          ) : scenarioKey === 'traditional' ? (
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">
                ⚠️ Lower retirement + No dreams
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Generic advice falls short
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm font-medium text-orange-600">
                🚨 Lowest retirement + Fragmented goals
              </p>
              <p className="text-xs text-orange-500 mt-1">
                Reactive budgeting fails
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div ref={containerRef} className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-800">
          Why Dream Planner Wins
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          See how Sarah's outcomes compare across three different financial approaches. 
          Dream Planner doesn't just match traditional advice—it surpasses it.
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-4">
        <ScenarioCard scenarioKey="traditional" counters={traditionalCounters} />
        <ScenarioCard scenarioKey="popularApps" counters={popularAppsCounters} />
        <ScenarioCard scenarioKey="dreamPlanner" counters={dreamPlannerCounters} />
      </div>

      {/* Key Insights */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 border border-purple-200">
        <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
          🔍 Key Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border-l-4 border-green-400">
              <h4 className="font-semibold text-gray-800 mb-2">Higher Retirement Security</h4>
              <p className="text-sm text-gray-600">
                Dream Planner achieves $1.2M vs traditional's $980K—22% more retirement savings
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border-l-4 border-purple-400">
              <h4 className="font-semibold text-gray-800 mb-2">Dreams Actually Achieved</h4>
              <p className="text-sm text-gray-600">
                Maine cottage at 54 while others defer dreams indefinitely
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border-l-4 border-blue-400">
              <h4 className="font-semibold text-gray-800 mb-2">Integrated Life Planning</h4>
              <p className="text-sm text-gray-600">
                Three-bucket system handles life's surprises without derailing progress
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border-l-4 border-yellow-400">
              <h4 className="font-semibold text-gray-800 mb-2">Mathematical Certainty</h4>
              <p className="text-sm text-gray-600">
                No hoping or guessing—clear path to both security and fulfillment
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center bg-white rounded-2xl p-8 border-2 border-purple-200">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          The Dream Planner Advantage
        </h3>
        <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
          Why settle for less when you can have more retirement security AND achieve your dreams? 
          Traditional advice is outdated. Popular apps are fragmented. Dream Planner is integrated.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <div className="flex items-center space-x-2 bg-purple-50 px-4 py-2 rounded-full">
            <span className="text-purple-600">✓</span>
            <span className="text-purple-700">Higher retirement savings</span>
          </div>
          <div className="flex items-center space-x-2 bg-purple-50 px-4 py-2 rounded-full">
            <span className="text-purple-600">✓</span>
            <span className="text-purple-700">Dreams achieved earlier</span>
          </div>
          <div className="flex items-center space-x-2 bg-purple-50 px-4 py-2 rounded-full">
            <span className="text-purple-600">✓</span>
            <span className="text-purple-700">Life disruption resilience</span>
          </div>
          <div className="flex items-center space-x-2 bg-purple-50 px-4 py-2 rounded-full">
            <span className="text-purple-600">✓</span>
            <span className="text-purple-700">Mathematical certainty</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactComparison;
