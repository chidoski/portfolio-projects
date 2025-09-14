import React, { useState, useEffect } from 'react';
import { FinancialProfile, FinancialObligations } from '../models/FinancialProfile.js';
import { TrendingUp, DollarSign, Calendar, Zap, Target, Award, ArrowRight } from 'lucide-react';

const DebtOptimizationDisplay = ({ debts, onScenarioSelect }) => {
  const [scenarios, setScenarios] = useState(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState(null);

  // Calculate all three scenarios
  useEffect(() => {
    if (!debts || debts.length === 0) return;

    const calculateScenarios = () => {
      // Create a temporary financial profile for calculations
      const financialObligations = new FinancialObligations({ debts });
      const tempProfile = new FinancialProfile({ financialObligations });

      // Scenario 1: Current Path (minimum payments only)
      const currentPath = tempProfile.calculateDebtPayoffTimeline('avalanche', 0);
      
      // Scenario 2: Optimized Path (avalanche method with same total payment)
      const totalMinimumPayments = debts.reduce((sum, debt) => sum + debt.monthlyPayment, 0);
      const optimizedPath = tempProfile.calculateDebtPayoffTimeline('avalanche', 0);
      
      // Scenario 3: Accelerated Freedom (add $100/month)
      const acceleratedPath = tempProfile.calculateDebtPayoffTimeline('avalanche', 100);

      // Calculate individual debt timelines for current path
      const individualTimelines = debts.map(debt => {
        const remainingMonths = debt.calculateRemainingMonths();
        return {
          debt,
          remainingMonths,
          payoffDate: debt.calculatePayoffDate(),
          totalInterest: debt.calculateTotalInterest()
        };
      });

      return {
        current: {
          ...currentPath,
          title: 'Current Path',
          subtitle: 'Minimum payments only',
          icon: Calendar,
          color: 'gray',
          monthlyPayment: totalMinimumPayments,
          individualTimelines
        },
        optimized: {
          ...optimizedPath,
          title: 'Optimized Path',
          subtitle: 'Avalanche method (same payment)',
          icon: Target,
          color: 'blue',
          monthlyPayment: totalMinimumPayments,
          interestSaved: currentPath.totalInterest - optimizedPath.totalInterest,
          monthsSaved: currentPath.totalMonths - optimizedPath.totalMonths
        },
        accelerated: {
          ...acceleratedPath,
          title: 'Accelerated Freedom',
          subtitle: 'Add just $100/month',
          icon: Zap,
          color: 'green',
          monthlyPayment: totalMinimumPayments + 100,
          interestSaved: currentPath.totalInterest - acceleratedPath.totalInterest,
          monthsSaved: currentPath.totalMonths - acceleratedPath.totalMonths,
          extraPayment: 100
        }
      };
    };

    setScenarios(calculateScenarios());
  }, [debts]);

  // Animate timeline bars
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationProgress(100);
    }, 500);

    return () => clearTimeout(timer);
  }, [scenarios]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format time duration
  const formatDuration = (months) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0) return `${months} months`;
    if (remainingMonths === 0) return `${years} ${years === 1 ? 'year' : 'years'}`;
    return `${years}y ${remainingMonths}m`;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  // Get timeline bar width percentage
  const getTimelineWidth = (months, maxMonths) => {
    return Math.min((months / maxMonths) * 100, 100);
  };

  // Handle scenario selection
  const handleScenarioSelect = (scenarioKey) => {
    setSelectedScenario(scenarioKey);
    if (onScenarioSelect) {
      onScenarioSelect(scenarios[scenarioKey]);
    }
  };

  if (!scenarios) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const maxMonths = Math.max(
    scenarios.current.totalMonths,
    scenarios.optimized.totalMonths,
    scenarios.accelerated.totalMonths
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Your Debt Freedom Scenarios
        </h3>
        <p className="text-gray-600">
          See how different strategies can dramatically change your timeline
        </p>
      </div>

      {/* Scenarios Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {Object.entries(scenarios).map(([key, scenario]) => {
          const Icon = scenario.icon;
          const isSelected = selectedScenario === key;
          
          return (
            <div
              key={key}
              onClick={() => handleScenarioSelect(key)}
              className={`
                relative bg-white rounded-xl p-6 border-2 cursor-pointer transition-all duration-300 hover:scale-105
                ${isSelected 
                  ? `border-${scenario.color}-500 shadow-xl ring-4 ring-${scenario.color}-100` 
                  : 'border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl'
                }
              `}
            >
              {/* Header */}
              <div className="flex items-center mb-4">
                <div className={`bg-${scenario.color}-100 p-3 rounded-full mr-4`}>
                  <Icon className={`w-6 h-6 text-${scenario.color}-600`} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-800">{scenario.title}</h4>
                  <p className={`text-sm text-${scenario.color}-600 font-medium`}>
                    {scenario.subtitle}
                  </p>
                </div>
              </div>

              {/* Timeline Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Timeline</span>
                  <span className="text-sm font-bold text-gray-800">
                    {formatDuration(scenario.totalMonths)}
                  </span>
                </div>
                
                <div className="relative bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className={`
                      absolute top-0 left-0 h-full bg-gradient-to-r transition-all duration-2000 ease-out
                      ${scenario.color === 'gray' 
                        ? 'from-gray-400 to-gray-500' 
                        : scenario.color === 'blue'
                        ? 'from-blue-400 to-blue-600'
                        : 'from-green-400 to-green-600'
                      }
                    `}
                    style={{
                      width: `${(animationProgress / 100) * getTimelineWidth(scenario.totalMonths, maxMonths)}%`
                    }}
                  />
                  
                  {/* Timeline markers */}
                  <div className="absolute inset-0 flex items-center justify-end pr-2">
                    <span className="text-xs font-bold text-white drop-shadow">
                      {formatDate(scenario.payoffDate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Monthly Payment:</span>
                  <span className="font-bold text-gray-800">
                    {formatCurrency(scenario.monthlyPayment)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Interest:</span>
                  <span className="font-bold text-gray-800">
                    {formatCurrency(scenario.totalInterest)}
                  </span>
                </div>

                {/* Savings (for optimized and accelerated) */}
                {scenario.interestSaved > 0 && (
                  <>
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-600 font-medium">Interest Saved:</span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(scenario.interestSaved)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-600 font-medium">Time Saved:</span>
                        <span className="font-bold text-green-600">
                          {formatDuration(scenario.monthsSaved)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Special callouts */}
              {key === 'accelerated' && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center text-green-800">
                    <Award className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">
                      Just $100/month = {formatDuration(scenario.monthsSaved)} faster freedom!
                    </span>
                  </div>
                </div>
              )}

              {key === 'optimized' && scenario.monthsSaved > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center text-blue-800">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">
                      Same payment, {formatDuration(scenario.monthsSaved)} sooner!
                    </span>
                  </div>
                </div>
              )}

              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <div className={`bg-${scenario.color}-500 text-white rounded-full w-8 h-8 flex items-center justify-center`}>
                    ✓
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detailed Comparison */}
      {selectedScenario && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center mb-6">
            <div className={`bg-${scenarios[selectedScenario].color}-100 p-3 rounded-full mr-4`}>
              {React.createElement(scenarios[selectedScenario].icon, {
                className: `w-6 h-6 text-${scenarios[selectedScenario].color}-600`
              })}
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-800">
                {scenarios[selectedScenario].title} Details
              </h4>
              <p className="text-gray-600">
                {scenarios[selectedScenario].subtitle}
              </p>
            </div>
          </div>

          {/* Payoff Order (for optimized and accelerated) */}
          {selectedScenario !== 'current' && scenarios[selectedScenario].payoffOrder && (
            <div className="mb-6">
              <h5 className="font-semibold text-gray-800 mb-3">Recommended Payoff Order:</h5>
              <div className="space-y-2">
                {scenarios[selectedScenario].payoffOrder.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`bg-${scenarios[selectedScenario].color}-100 text-${scenarios[selectedScenario].color}-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3`}>
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-800">{item.debtName}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Month {item.month}</div>
                      <div className="text-xs text-gray-500">
                        {formatCurrency(item.originalBalance)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Individual Debt Timeline (for current path) */}
          {selectedScenario === 'current' && scenarios.current.individualTimelines && (
            <div className="mb-6">
              <h5 className="font-semibold text-gray-800 mb-3">Individual Debt Timelines:</h5>
              <div className="space-y-3">
                {scenarios.current.individualTimelines.map((timeline, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-800">{timeline.debt.name}</span>
                      <span className="text-sm font-bold text-gray-600">
                        {formatDuration(timeline.remainingMonths)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Balance: {formatCurrency(timeline.debt.currentBalance)}</span>
                      <span>Paid off: {formatDate(timeline.payoffDate)}</span>
                    </div>
                    {timeline.totalInterest > 0 && (
                      <div className="text-xs text-orange-600 mt-1">
                        +{formatCurrency(timeline.totalInterest)} interest
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-center">
            <button
              onClick={() => {
                if (onScenarioSelect) {
                  onScenarioSelect(scenarios[selectedScenario]);
                }
              }}
              className={`
                bg-gradient-to-r text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center
                ${scenarios[selectedScenario].color === 'gray'
                  ? 'from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
                  : scenarios[selectedScenario].color === 'blue'
                  ? 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                  : 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                }
              `}
            >
              Choose {scenarios[selectedScenario].title}
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* Summary Comparison */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <h4 className="text-lg font-bold text-gray-800 mb-4 text-center">
          💡 The Power of Strategy
        </h4>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatCurrency(scenarios.optimized.interestSaved)}
            </div>
            <div className="text-sm text-gray-700">
              Saved with Optimized Path<br />
              <span className="text-xs text-gray-500">(same monthly payment)</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatDuration(scenarios.accelerated.monthsSaved)}
            </div>
            <div className="text-sm text-gray-700">
              Faster with $100 extra<br />
              <span className="text-xs text-gray-500">({formatCurrency(scenarios.accelerated.interestSaved)} saved)</span>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-4 p-3 bg-white rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Bottom line:</strong> Smart strategy can save you years of payments and thousands in interest,
            even with the same monthly budget.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DebtOptimizationDisplay;
