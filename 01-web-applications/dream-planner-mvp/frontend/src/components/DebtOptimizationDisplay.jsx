import React, { useState, useEffect } from 'react';
import { FinancialProfile, FinancialObligations } from '../models/FinancialProfile.js';
import { TrendingUp, DollarSign, Calendar, Zap, Target, Award, ArrowRight } from 'lucide-react';

const DebtOptimizationDisplay = ({ debts, onScenarioSelect, dreamGoal = null }) => {
  const [scenarios, setScenarios] = useState(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState(null);

  // Calculate all three scenarios
  useEffect(() => {
    if (!debts || debts.length === 0) return;

    const calculateScenarios = () => {
      try {
        console.log('=== DEBT OPTIMIZATION CALCULATION START ===');
        console.log('Input debts array:', debts);
        console.log('Number of debts:', debts.length);
        
        // Log each debt's structure
        debts.forEach((debt, index) => {
          console.log(`Debt ${index + 1}:`, {
            id: debt.id,
            name: debt.name,
            type: debt.type,
            currentBalance: debt.currentBalance,
            monthlyPayment: debt.monthlyPayment,
            minimumPayment: debt.minimumPayment,
            interestRate: debt.interestRate,
            fullObject: debt
          });
        });

        // Create a temporary financial profile for calculations
        console.log('Creating FinancialObligations...');
        const financialObligations = new FinancialObligations({ debts });
        console.log('FinancialObligations created:', financialObligations);
        
        console.log('Creating FinancialProfile...');
        const tempProfile = new FinancialProfile({ financialObligations });
        console.log('FinancialProfile created:', tempProfile);

        // Calculate total minimum payments
        console.log('Calculating total minimum payments...');
        const totalMinimumPayments = debts.reduce((sum, debt) => {
          const payment = debt.monthlyPayment || debt.minimumPayment || 0;
          console.log(`Adding ${debt.name}: ${payment}`);
          return sum + payment;
        }, 0);
        console.log('Total minimum payments:', totalMinimumPayments);

        // Check if we have the minimum required data
        const hasRequiredData = debts.every(debt => 
          debt.currentBalance > 0 && debt.monthlyPayment > 0
        );
        
        if (!hasRequiredData) {
          console.warn('Missing required debt data for optimization calculations');
          return {
            current: {
              title: 'Current Path',
              subtitle: 'Minimum payments only',
              icon: Calendar,
              color: 'gray',
              monthlyPayment: totalMinimumPayments,
              totalMonths: 0,
              totalInterest: 0,
              payoffDate: new Date().toISOString().split('T')[0],
              error: true,
              errorMessage: 'We need the current balance and monthly payment for each debt to calculate your timeline.'
            },
            optimized: {
              title: 'Optimized Path',
              subtitle: 'Calculating optimization...',
              icon: Target,
              color: 'gray',
              monthlyPayment: 0,
              totalMonths: 0,
              totalInterest: 0,
              payoffDate: new Date().toISOString().split('T')[0],
              error: true,
              errorMessage: 'Complete your debt information to see optimization strategies.'
            },
            accelerated: {
              title: 'Accelerated Freedom',
              subtitle: 'Calculating acceleration...',
              icon: Zap,
              color: 'gray',
              monthlyPayment: 0,
              totalMonths: 0,
              totalInterest: 0,
              payoffDate: new Date().toISOString().split('T')[0],
              error: true,
              errorMessage: 'Complete your debt information to see acceleration benefits.'
            }
          };
        }

        // Scenario 1: Current Path (minimum payments only)
        let currentPath;
        try {
          console.log('Calculating Current Path scenario...');
          currentPath = tempProfile.calculateDebtPayoffTimeline('avalanche', 0);
          console.log('Current Path result:', currentPath);
        } catch (currentError) {
          console.error('Error calculating Current Path:', currentError);
          currentPath = {
            strategy: 'avalanche',
            totalMonths: 0,
            totalInterest: 0,
            payoffOrder: [],
            payoffDate: new Date().toISOString().split('T')[0],
            error: true,
            errorMessage: 'Unable to calculate current payment timeline. Please check your debt information.'
          };
        }
      
        // Scenario 2: Optimized Path (avalanche method with same total payment)
        let optimizedPath;
        try {
          console.log('Calculating Optimized Path scenario...');
          
          // Check if we have interest rates for optimization
          const hasInterestRates = debts.some(debt => debt.interestRate > 0);
          
          if (!hasInterestRates) {
            console.warn('No interest rates provided - optimization will be limited');
            optimizedPath = {
              ...currentPath,
              error: true,
              errorMessage: 'We need interest rates to show you the best optimization strategy. Add interest rates to see potential savings.'
            };
          } else {
            optimizedPath = tempProfile.calculateDebtPayoffTimeline('avalanche', 0);
            console.log('Optimized Path result:', optimizedPath);
          }
        } catch (optimizedError) {
          console.error('Error calculating Optimized Path:', optimizedError);
          optimizedPath = {
            strategy: 'avalanche',
            totalMonths: 0,
            totalInterest: 0,
            payoffOrder: [],
            payoffDate: new Date().toISOString().split('T')[0],
            error: true,
            errorMessage: 'Unable to calculate optimization strategy. This usually means we need complete debt information including interest rates.'
          };
        }
      
        // Scenario 3: Accelerated Freedom (add $100/month)
        let acceleratedPath;
        try {
          console.log('Calculating Accelerated Freedom scenario...');
          acceleratedPath = tempProfile.calculateDebtPayoffTimeline('avalanche', 100);
          console.log('Accelerated Freedom result:', acceleratedPath);
        } catch (acceleratedError) {
          console.error('Error calculating Accelerated Freedom:', acceleratedError);
          acceleratedPath = {
            strategy: 'avalanche',
            totalMonths: 0,
            totalInterest: 0,
            payoffOrder: [],
            payoffDate: new Date().toISOString().split('T')[0],
            error: true,
            errorMessage: 'Unable to calculate accelerated timeline. Please verify your debt information is complete.'
          };
        }

      // Calculate individual debt timelines for current path
      console.log('Calculating individual debt timelines...');
      const individualTimelines = debts.map((debt, index) => {
        try {
          console.log(`Processing debt ${index + 1} (${debt.name})...`);
          console.log('Available methods on debt:', Object.getOwnPropertyNames(debt.__proto__));
          
          const remainingMonths = debt.calculateRemainingMonths();
          console.log(`${debt.name} remaining months:`, remainingMonths);
          
          const payoffDate = debt.calculatePayoffDate();
          console.log(`${debt.name} payoff date:`, payoffDate);
          
          const totalInterest = debt.calculateTotalInterest();
          console.log(`${debt.name} total interest:`, totalInterest);
          
          return {
            debt,
            remainingMonths,
            payoffDate,
            totalInterest
          };
        } catch (debtError) {
          console.error(`Error calculating timeline for debt ${debt.name}:`, debtError);
          return {
            debt,
            remainingMonths: 0,
            payoffDate: new Date().toISOString().split('T')[0],
            totalInterest: 0,
            error: true
          };
        }
      });

      console.log('Building final scenarios object...');
      
      // Helper function to safely calculate savings
      const calculateSavings = (baseline, comparison) => {
        if (baseline.error || comparison.error) return { interestSaved: 0, monthsSaved: 0 };
        return {
          interestSaved: Math.max(0, baseline.totalInterest - comparison.totalInterest),
          monthsSaved: Math.max(0, baseline.totalMonths - comparison.totalMonths)
        };
      };
      
      const optimizedSavings = calculateSavings(currentPath, optimizedPath);
      const acceleratedSavings = calculateSavings(currentPath, acceleratedPath);
      
      const scenarios = {
        current: {
          ...currentPath,
          title: 'Current Path',
          subtitle: currentPath.error ? currentPath.errorMessage : 'Minimum payments only',
          icon: Calendar,
          color: currentPath.error ? 'gray' : 'gray',
          monthlyPayment: totalMinimumPayments,
          individualTimelines: currentPath.error ? [] : individualTimelines
        },
        optimized: {
          ...optimizedPath,
          title: optimizedPath.error ? 'Optimized Path' : 'Optimized Path',
          subtitle: optimizedPath.error ? optimizedPath.errorMessage : 
            optimizedSavings.monthsSaved > 0 ? 
              `Avalanche method - saves ${optimizedSavings.monthsSaved} months!` : 
              'Avalanche method (same payment)',
          icon: Target,
          color: optimizedPath.error ? 'gray' : 'blue',
          monthlyPayment: totalMinimumPayments,
          interestSaved: optimizedSavings.interestSaved,
          monthsSaved: optimizedSavings.monthsSaved
        },
        accelerated: {
          ...acceleratedPath,
          title: acceleratedPath.error ? 'Accelerated Freedom' : 'Accelerated Freedom',
          subtitle: acceleratedPath.error ? acceleratedPath.errorMessage : 
            acceleratedSavings.monthsSaved > 0 ?
              `Add $100/month - saves ${acceleratedSavings.monthsSaved} months!` :
              'Add just $100/month',
          icon: Zap,
          color: acceleratedPath.error ? 'gray' : 'green',
          monthlyPayment: totalMinimumPayments + 100,
          interestSaved: acceleratedSavings.interestSaved,
          monthsSaved: acceleratedSavings.monthsSaved,
          extraPayment: 100
        }
      };
      
      console.log('Final scenarios object:', scenarios);
      console.log('=== DEBT OPTIMIZATION CALCULATION COMPLETE ===');
      return scenarios;
      } catch (error) {
        console.error('=== CRITICAL ERROR IN DEBT OPTIMIZATION CALCULATION ===');
        console.error('Error details:', error);
        console.error('Error stack:', error.stack);
        console.error('Input debts that caused error:', debts);
        
        // Determine the most likely cause of the error
        let errorMessage = 'We\'re having trouble calculating your debt scenarios.';
        
        if (error.message && error.message.includes('calculateDebtPayoffTimeline')) {
          errorMessage = 'There was an issue with the debt calculation method. Please refresh and try again.';
        } else if (error.message && error.message.includes('FinancialProfile')) {
          errorMessage = 'Unable to create your financial profile. Please check that all debt information is valid.';
        } else if (debts.some(debt => !debt.currentBalance || !debt.monthlyPayment)) {
          errorMessage = 'Some debt information is missing. Please ensure all debts have a current balance and monthly payment.';
        } else if (debts.some(debt => debt.monthlyPayment <= 0)) {
          errorMessage = 'Monthly payments must be greater than zero for all debts.';
        }
        
        // Return helpful fallback scenarios
        const fallbackMonthlyPayment = debts.reduce((sum, debt) => {
          return sum + (parseFloat(debt.monthlyPayment) || parseFloat(debt.minimumPayment) || 0);
        }, 0);
        
        // Format currency helper for fallback
        const formatFallbackCurrency = (amount) => {
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(amount);
        };
        
        return {
          current: {
            title: 'Current Path',
            subtitle: fallbackMonthlyPayment > 0 ? 
              `${formatFallbackCurrency(fallbackMonthlyPayment)}/month in payments` : 
              'Enter your payment amounts to see timeline',
            totalMonths: 0,
            totalInterest: 0,
            monthlyPayment: fallbackMonthlyPayment,
            payoffDate: new Date().toISOString().split('T')[0],
            icon: Calendar,
            color: 'gray',
            error: true,
            errorMessage: errorMessage
          },
          optimized: {
            title: 'Optimized Path',
            subtitle: 'Complete your debt info to see optimization',
            totalMonths: 0,
            totalInterest: 0,
            monthlyPayment: 0,
            payoffDate: new Date().toISOString().split('T')[0],
            icon: Target,
            color: 'gray',
            error: true,
            errorMessage: 'Add interest rates to see how much you could save with an optimized payment strategy.'
          },
          accelerated: {
            title: 'Accelerated Freedom',
            subtitle: 'See what $100 extra could do',
            totalMonths: 0,
            totalInterest: 0,
            monthlyPayment: 0,
            payoffDate: new Date().toISOString().split('T')[0],
            icon: Zap,
            color: 'gray',
            error: true,
            errorMessage: 'Complete your debt information to see how extra payments could accelerate your freedom.'
          }
        };
      }
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

  // Calculate dream timeline impact
  const calculateDreamImpact = (scenario) => {
    if (!dreamGoal || scenario.error) return null;

    const debtFreeDate = new Date(scenario.payoffDate);
    const currentDate = new Date();
    const monthsToDebtFree = scenario.totalMonths;
    
    // Calculate when they could start saving for dreams
    const dreamSavingStartDate = new Date(debtFreeDate);
    
    // Estimate monthly savings available after debt is paid off
    const monthlySavingsAfterDebt = scenario.monthlyPayment; // What they were paying towards debt
    
    // If we have dream cost information, calculate timeline
    if (dreamGoal.estimatedCost) {
      const monthsToSaveDream = Math.ceil(dreamGoal.estimatedCost / monthlySavingsAfterDebt);
      const dreamAchievementDate = new Date(dreamSavingStartDate);
      dreamAchievementDate.setMonth(dreamAchievementDate.getMonth() + monthsToSaveDream);
      
      const totalMonthsToDream = monthsToDebtFree + monthsToSaveDream;
      const yearsToDream = totalMonthsToDream / 12;
      
      return {
        debtFreeDate: debtFreeDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        dreamAchievementDate: dreamAchievementDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        totalMonthsToDream,
        yearsToDream: Math.round(yearsToDream * 10) / 10,
        monthlySavingsAfterDebt,
        dreamSavingMonths: monthsToSaveDream
      };
    }
    
    // If no dream cost, just show when debt freedom enables dream saving
    return {
      debtFreeDate: debtFreeDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      monthlySavingsAfterDebt,
      canStartSaving: true
    };
  };

  // Get dream timeline comparison between scenarios
  const getDreamTimelineComparison = (currentScenario, optimizedScenario) => {
    if (!dreamGoal || currentScenario.error || optimizedScenario.error) return null;
    
    const currentImpact = calculateDreamImpact(currentScenario);
    const optimizedImpact = calculateDreamImpact(optimizedScenario);
    
    if (!currentImpact || !optimizedImpact) return null;
    
    const monthsSaved = (currentImpact.totalMonthsToDream || 0) - (optimizedImpact.totalMonthsToDream || 0);
    const yearsSaved = monthsSaved / 12;
    
    return {
      monthsSaved,
      yearsSaved: Math.round(yearsSaved * 10) / 10,
      dreamEarlier: optimizedImpact.dreamAchievementDate,
      savingsAvailable: optimizedImpact.monthlySavingsAfterDebt
    };
  };

  // Calculate dream-specific equivalents for savings
  const getDreamEquivalents = (savedAmount) => {
    if (!dreamGoal || savedAmount <= 0) return [];
    
    const dreamTitle = dreamGoal.title || 'Your Dream';
    const equivalents = [];
    
    // Base equivalents that work for most dreams
    if (savedAmount >= 1000) {
      const months = Math.floor(savedAmount / 3000); // Assuming $3k/month living expenses
      if (months > 0) {
        equivalents.push(`${months} month${months > 1 ? 's' : ''} of living expenses for your dream life`);
      }
    }
    
    // Dream-specific equivalents based on keywords
    const dreamLower = dreamTitle.toLowerCase();
    
    if (dreamLower.includes('cottage') || dreamLower.includes('cabin') || dreamLower.includes('house') || dreamLower.includes('home')) {
      if (savedAmount >= 5000) equivalents.push('A complete kitchen renovation for your cottage');
      if (savedAmount >= 10000) equivalents.push('Professional landscaping and outdoor deck');
      if (savedAmount >= 15000) equivalents.push('Solar panels and energy independence');
      if (savedAmount >= 20000) equivalents.push('A guest house addition for family visits');
    }
    
    if (dreamLower.includes('travel') || dreamLower.includes('explore') || dreamLower.includes('adventure')) {
      if (savedAmount >= 3000) equivalents.push('A luxury European tour for two weeks');
      if (savedAmount >= 8000) equivalents.push('Six months of world travel');
      if (savedAmount >= 15000) equivalents.push('A year-long adventure across three continents');
    }
    
    if (dreamLower.includes('art') || dreamLower.includes('studio') || dreamLower.includes('creative')) {
      if (savedAmount >= 2000) equivalents.push('A professional art studio setup');
      if (savedAmount >= 5000) equivalents.push('High-end pottery kiln and equipment');
      if (savedAmount >= 10000) equivalents.push('A year of art supplies and workshop fees');
    }
    
    if (dreamLower.includes('business') || dreamLower.includes('entrepreneur') || dreamLower.includes('startup')) {
      if (savedAmount >= 5000) equivalents.push('Complete business setup and initial inventory');
      if (savedAmount >= 15000) equivalents.push('Six months of business operating expenses');
      if (savedAmount >= 25000) equivalents.push('Professional marketing and brand development');
    }
    
    if (dreamLower.includes('retire') || dreamLower.includes('financial independence') || dreamLower.includes('freedom')) {
      if (savedAmount >= 10000) equivalents.push('Two years closer to financial independence');
      if (savedAmount >= 20000) equivalents.push('A substantial emergency fund for peace of mind');
      if (savedAmount >= 30000) equivalents.push('A significant boost to your retirement portfolio');
    }
    
    // Generic meaningful equivalents if no specific dream matches
    if (equivalents.length === 0) {
      if (savedAmount >= 2000) equivalents.push('Premium equipment for your passion');
      if (savedAmount >= 5000) equivalents.push('A meaningful upgrade to your dream setup');
      if (savedAmount >= 10000) equivalents.push('Substantial progress toward your goal');
      if (savedAmount >= 20000) equivalents.push('A major milestone in your dream journey');
    }
    
    // Add time-based equivalents
    const dailyCost = 100; // Assumed daily cost for dream life
    const days = Math.floor(savedAmount / dailyCost);
    if (days >= 30) {
      equivalents.push(`${days} days of your dream life fully funded`);
    }
    
    return equivalents.slice(0, 3); // Return top 3 most relevant
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
                <div className={`bg-${scenario.color}-100 p-3 rounded-full mr-4 ${scenario.error ? 'opacity-50' : ''}`}>
                  <Icon className={`w-6 h-6 text-${scenario.color}-600`} />
                </div>
                <div className="flex-1">
                  <h4 className={`text-lg font-bold ${scenario.error ? 'text-gray-600' : 'text-gray-800'}`}>
                    {scenario.title}
                  </h4>
                  <p className={`text-sm font-medium ${scenario.error ? 'text-gray-500' : `text-${scenario.color}-600`}`}>
                    {scenario.subtitle}
                  </p>
                  {scenario.error && scenario.errorMessage && (
                    <p className="text-xs text-orange-600 mt-1 leading-tight">
                      💡 {scenario.errorMessage}
                    </p>
                  )}
                </div>
              </div>

              {/* Enhanced Timeline Bar with Dramatic Visual Differences */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Debt Freedom Timeline</span>
                  <span className={`text-sm font-bold ${scenario.error ? 'text-gray-500' : 'text-gray-800'}`}>
                    {scenario.error ? 'Calculating...' : formatDuration(scenario.totalMonths)}
                  </span>
                </div>
                
                {/* Current vs This Strategy Comparison */}
                {!scenario.error && key !== 'current' && scenarios.current && !scenarios.current.error && (
                  <div className="mb-3 space-y-2">
                    {/* Current Path Reference Bar */}
                    <div className="relative">
                      <div className="text-xs text-gray-500 mb-1">Current Path: {formatDuration(scenarios.current.totalMonths)}</div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div className="bg-gray-400 h-2 rounded-full w-full opacity-60"></div>
                      </div>
                    </div>
                    
                    {/* This Strategy Bar */}
                    <div className="relative">
                      <div className="text-xs font-semibold mb-1 flex justify-between items-center">
                        <span className={`text-${scenario.color}-700`}>{scenario.title}:</span>
                        <span className={`text-${scenario.color}-600 font-bold`}>
                          {scenarios.current.totalMonths - scenario.totalMonths > 0 ? 
                            `${formatDuration(scenarios.current.totalMonths - scenario.totalMonths)} faster!` :
                            'Same timeline'
                          }
                        </span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-3 relative overflow-hidden">
                        <div
                          className={`
                            h-3 rounded-full transition-all duration-2000 ease-out bg-gradient-to-r
                            ${scenario.color === 'blue'
                              ? 'from-blue-400 to-blue-600'
                              : scenario.color === 'green'
                              ? 'from-green-400 to-green-600'
                              : 'from-gray-400 to-gray-500'
                            }
                          `}
                          style={{
                            width: `${(animationProgress / 100) * ((scenario.totalMonths / scenarios.current.totalMonths) * 100)}%`
                          }}
                        />
                        {/* Savings Badge */}
                        {scenarios.current.totalMonths - scenario.totalMonths > 0 && (
                          <div className="absolute right-2 top-0 bottom-0 flex items-center">
                            <div className={`bg-${scenario.color}-600 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-lg`}>
                              -{formatDuration(scenarios.current.totalMonths - scenario.totalMonths)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Original Timeline Bar for Current Path or when no comparison */}
                {(scenario.error || key === 'current' || !scenarios.current) && (
                  <div className="relative bg-gray-200 rounded-full h-4 overflow-hidden">
                    {scenario.error ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
                          <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                          <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                        </div>
                      </div>
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>
                )}

                {/* Money Saved Display */}
                {!scenario.error && key !== 'current' && scenario.interestSaved > 0 && (
                  <div className="mt-2 flex justify-between text-xs">
                    <span className="text-gray-600">Money Saved:</span>
                    <span className={`font-bold text-${scenario.color}-600`}>
                      {formatCurrency(scenario.interestSaved)}
                    </span>
                  </div>
                )}
              </div>

              {/* Key Metrics */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Monthly Payment:</span>
                  <span className={`font-bold ${scenario.error ? 'text-gray-500' : 'text-gray-800'}`}>
                    {scenario.error ? '---' : formatCurrency(scenario.monthlyPayment)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Interest:</span>
                  <span className={`font-bold ${scenario.error ? 'text-gray-500' : 'text-gray-800'}`}>
                    {scenario.error ? '---' : formatCurrency(scenario.totalInterest)}
                  </span>
                </div>

                {/* Savings (for optimized and accelerated) */}
                {!scenario.error && scenario.interestSaved > 0 && (
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
                
                {/* Error state help */}
                {scenario.error && (
                  <div className="border-t pt-3">
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <div className="flex items-start">
                        <div className="text-blue-600 mr-2">ℹ️</div>
                        <div className="text-sm text-blue-700">
                          <p className="font-medium mb-1">What you can do:</p>
                          <ul className="text-xs space-y-1">
                            <li>• Make sure all debts have current balance and monthly payment amounts</li>
                            <li>• Add interest rates to see optimization strategies</li>
                            <li>• Double-check that all amounts are greater than zero</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Dream Timeline Impact */}
              {(() => {
                const dreamImpact = calculateDreamImpact(scenario);
                if (!dreamImpact || scenario.error) return null;
                
                return (
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-purple-800">
                      <div className="flex items-center mb-2">
                        <Target className="w-4 h-4 mr-2" />
                        <span className="text-sm font-semibold">
                          {dreamGoal?.title || 'Your Dream'} Timeline
                        </span>
                      </div>
                      
                      <div className="text-xs space-y-1">
                        <div>
                          <span className="font-medium">Debt free:</span> {dreamImpact.debtFreeDate}
                        </div>
                        {dreamImpact.dreamAchievementDate && (
                          <div>
                            <span className="font-medium">Dream achieved:</span> {dreamImpact.dreamAchievementDate}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Available for dreams:</span> {formatCurrency(dreamImpact.monthlySavingsAfterDebt)}/month
                        </div>
                        {dreamImpact.yearsToDream && (
                          <div className="text-purple-600 font-medium">
                            Total timeline: {dreamImpact.yearsToDream} years
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Special callouts */}
              {key === 'accelerated' && !scenario.error && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center text-green-800">
                    <Award className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">
                      Just $100/month = {formatDuration(scenario.monthsSaved)} faster freedom!
                    </span>
                  </div>
                </div>
              )}

              {key === 'optimized' && scenario.monthsSaved > 0 && !scenario.error && (
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

      {/* Strategy Comparison: Dream Equivalents */}
      {(() => {
        const maxSavings = Math.max(
          scenarios.optimized?.interestSaved || 0,
          scenarios.accelerated?.interestSaved || 0
        );
        
        if (!dreamGoal || maxSavings <= 1000) return null;
        
        const bestStrategy = scenarios.accelerated?.interestSaved > scenarios.optimized?.interestSaved ? 
          scenarios.accelerated : scenarios.optimized;
        
        const equivalents = getDreamEquivalents(bestStrategy.interestSaved);
        
        if (equivalents.length === 0) return null;
        
        return (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-8">
            <h4 className="text-xl font-bold text-gray-800 mb-4 text-center">
              💰 What Your Savings Could Buy
            </h4>
            <p className="text-center text-gray-700 mb-6">
              The <span className="font-bold text-purple-600">{formatCurrency(bestStrategy.interestSaved)}</span> you save with the <span className="font-semibold">{bestStrategy.title}</span> is more than just money—it's your dreams, made tangible:
            </p>
            
            <div className="grid md:grid-cols-3 gap-4">
              {equivalents.map((equivalent, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-purple-200 shadow-sm">
                  <div className="flex items-start">
                    <div className="bg-purple-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-purple-600 font-bold text-sm">{index + 1}</span>
                    </div>
                    <div className="text-sm text-gray-700 leading-relaxed">
                      {equivalent}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-6 p-4 bg-white rounded-lg border border-purple-200">
              <p className="text-sm text-purple-700">
                <strong>Remember:</strong> Every dollar you save in interest is a dollar that goes directly toward building the life you actually want to live.
              </p>
            </div>
          </div>
        );
      })()}

      {/* Summary Comparison */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        {!scenarios.optimized.error && !scenarios.accelerated.error && (scenarios.optimized.interestSaved > 0 || scenarios.accelerated.monthsSaved > 0) ? (
          <>
            <h4 className="text-lg font-bold text-gray-800 mb-4 text-center">
              💡 The Power of Strategy
            </h4>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {formatCurrency(scenarios.optimized.interestSaved || 0)}
                </div>
                <div className="text-sm text-gray-700">
                  Saved with Optimized Path<br />
                  <span className="text-xs text-gray-500">(same monthly payment)</span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {formatDuration(scenarios.accelerated.monthsSaved || 0)}
                </div>
                <div className="text-sm text-gray-700">
                  Faster with $100 extra<br />
                  <span className="text-xs text-gray-500">({formatCurrency(scenarios.accelerated.interestSaved || 0)} saved)</span>
                </div>
              </div>
            </div>
            
            {/* Dream Timeline Impact Summary */}
            {dreamGoal && (() => {
              const dreamComparison = getDreamTimelineComparison(scenarios.current, scenarios.accelerated);
              if (dreamComparison && dreamComparison.monthsSaved > 0) {
                return (
                  <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border border-purple-200">
                    <div className="text-center">
                      <h5 className="font-bold text-purple-800 mb-2">
                        🎯 Impact on Your {dreamGoal.title || 'Dream'}
                      </h5>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-2xl font-bold text-purple-600">
                            {dreamComparison.yearsSaved} years
                          </div>
                          <div className="text-sm text-purple-700">
                            Sooner dream achievement
                          </div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-purple-600">
                            {formatCurrency(dreamComparison.savingsAvailable)}
                          </div>
                          <div className="text-sm text-purple-700">
                            Monthly for dreams
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-purple-600 mt-2">
                        Optimized debt strategy brings your dream {dreamComparison.yearsSaved} years closer!
                      </p>
                    </div>
                  </div>
                );
              }
              return null;
            })()}
            
            <div className="text-center mt-4 p-3 bg-white rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Bottom line:</strong> Smart strategy can save you years of payments and thousands in interest,
                {dreamGoal ? ' bringing your dreams years closer to reality.' : ' even with the same monthly budget.'}
              </p>
            </div>
          </>
        ) : (
          <div className="text-center">
            <h4 className="text-lg font-bold text-gray-800 mb-4">
              🚀 Ready to See Your Potential?
            </h4>
            <p className="text-gray-700 mb-4">
              Complete your debt information to unlock powerful optimization insights that could save you thousands of dollars and years of payments.
            </p>
            {dreamGoal && (
              <div className="bg-purple-50 rounded-lg p-4 mb-4 border border-purple-200">
                <p className="text-sm text-purple-700">
                  <strong>Dream Impact Preview:</strong> See how debt optimization could bring your {dreamGoal.title || 'dream'} years closer by freeing up monthly payments for savings.
                </p>
              </div>
            )}
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600">
                <strong>What you'll discover:</strong> How the avalanche method could reduce your total interest • 
                How extra payments accelerate your freedom • Your exact payoff timeline and dream achievement dates
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebtOptimizationDisplay;
