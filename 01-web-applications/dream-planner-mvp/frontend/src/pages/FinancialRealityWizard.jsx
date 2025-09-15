import React, { useState, useEffect } from 'react';
import { FinancialProfile, FinancialObligations, Debt } from '../models/FinancialProfile.js';
import { Heart, DollarSign, Car, CreditCard, GraduationCap, Calculator, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, Home, Zap, Shield, ShoppingCart, Fuel, TrendingUp } from 'lucide-react';
import DebtOptimizationDisplay from '../components/DebtOptimizationDisplay.jsx';

const FinancialRealityWizard = ({ onComplete, onBack }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [financialProfile, setFinancialProfile] = useState(null);
  const [debts, setDebts] = useState([]);
  const [currentDebt, setCurrentDebt] = useState({
    name: '',
    type: '',
    currentBalance: '',
    minimumPayment: '',
    interestRate: ''
  });
  const [showResults, setShowResults] = useState(false);
  const [payoffTimelines, setPayoffTimelines] = useState(null);
  const [selectedOptimizationScenario, setSelectedOptimizationScenario] = useState(null);
  const [profileError, setProfileError] = useState(null);
  
  // Fixed expenses state
  const [expenses, setExpenses] = useState({
    housing: '',
    everythingElse: '',
    // Detailed breakdown (initially hidden)
    utilities: '',
    insurance: '',
    groceries: '',
    transportation: '',
    subscriptions: '',
    other: ''
  });
  const [showDetailedExpenses, setShowDetailedExpenses] = useState(false);
  const [freedomRatio, setFreedomRatio] = useState(null);

  // Friendly debt categories with encouraging descriptions
  const debtCategories = [
    {
      id: 'student_loan',
      title: 'Student Loans',
      subtitle: 'From your education journey',
      description: 'Investments in your future that are paying off',
      icon: GraduationCap,
      color: 'blue',
      examples: ['Federal student loans', 'Private student loans', 'Parent PLUS loans']
    },
    {
      id: 'auto_loan',
      title: 'Car Loans',
      subtitle: 'Getting you to work',
      description: 'The wheels that keep your life moving forward',
      icon: Car,
      color: 'green',
      examples: ['Auto loans', 'Motorcycle loans', 'RV loans']
    },
    {
      id: 'credit_card',
      title: 'Credit Cards',
      subtitle: 'From life happening',
      description: 'Sometimes life throws curveballs - we get it',
      icon: CreditCard,
      color: 'purple',
      examples: ['Credit cards', 'Store cards', 'Personal lines of credit']
    },
    {
      id: 'personal_loan',
      title: 'Personal Loans',
      subtitle: 'For important moments',
      description: 'Funding life\'s big moments and improvements',
      icon: Heart,
      color: 'pink',
      examples: ['Personal loans', 'Home improvement loans', 'Debt consolidation']
    },
    {
      id: 'other',
      title: 'Other Debts',
      subtitle: 'Everything else',
      description: 'Any other financial obligations',
      icon: DollarSign,
      color: 'gray',
      examples: ['Medical debt', 'Family loans', 'Business loans']
    }
  ];

  // Conversation steps
  const steps = [
    'welcome',
    'debt-categories',
    'debt-details',
    'fixed-expenses',
    'review-and-calculate'
  ];

  // Load existing financial profile on mount
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('financialProfile');
      const profileData = savedProfile ? JSON.parse(savedProfile) : null;
      const profile = profileData ? new FinancialProfile(profileData) : new FinancialProfile();
      setFinancialProfile(profile);
      
      // Load existing debts if any
      if (profile.financialObligations && profile.financialObligations.debts.length > 0) {
        setDebts(profile.financialObligations.debts);
      }
      
      // Load existing expenses if any
      if (profile.fixedExpenses) {
        const loadedExpenses = {
          housing: profile.fixedExpenses.housing?.total || '',
          everythingElse: '',
          utilities: profile.fixedExpenses.utilities?.total || '',
          insurance: profile.fixedExpenses.insurance?.total || '',
          groceries: '',
          transportation: profile.fixedExpenses.transportation?.total || '',
          subscriptions: profile.fixedExpenses.subscriptions?.total || '',
          other: profile.fixedExpenses.other?.total || ''
        };
        
        // Calculate "everything else" from detailed expenses
        const detailedTotal = ['utilities', 'insurance', 'transportation', 'subscriptions', 'other']
          .reduce((sum, key) => sum + (parseFloat(loadedExpenses[key]) || 0), 0);
        
        if (detailedTotal > 0) {
          loadedExpenses.everythingElse = detailedTotal.toString();
          setShowDetailedExpenses(true);
        }
        
        setExpenses(loadedExpenses);
      }
    } catch (error) {
      console.error('Error loading financial profile:', error);
      // If there's an error loading, create a new profile as fallback
      setFinancialProfile(new FinancialProfile());
    }
  }, []);

  // Save to localStorage whenever debts change
  useEffect(() => {
    if (financialProfile && debts.length > 0) {
      try {
        // Clear any previous errors
        setProfileError(null);
        
        const updatedProfile = { ...financialProfile };
        updatedProfile.financialObligations = new FinancialObligations({ debts });
        console.log('Profile type:', typeof updatedProfile, 'Profile contents:', updatedProfile);
        
        // Create a proper FinancialProfile instance instead of using spread operator
        const properProfile = new FinancialProfile({
          userProfile: updatedProfile.userProfile,
          financialObligations: updatedProfile.financialObligations,
          fixedExpenses: updatedProfile.fixedExpenses,
          currentAssets: updatedProfile.currentAssets,
          northStarDream: updatedProfile.northStarDream,
          variableExpenses: updatedProfile.variableExpenses,
          lastUpdated: updatedProfile.lastUpdated
        });
        
        // Try to update calculated fields
        if (typeof properProfile.updateCalculatedFields === 'function') {
          properProfile.updateCalculatedFields();
        } else {
          console.warn('updateCalculatedFields method not available, skipping calculation update');
        }
        
        // Try to save to localStorage
        try {
          localStorage.setItem('financialProfile', JSON.stringify(properProfile.toJSON()));
        } catch (storageError) {
          console.error('Error saving to localStorage:', storageError);
          // Continue without localStorage - don't block the user
        }
        
        setFinancialProfile(properProfile);
      } catch (error) {
        console.error('Error updating profile:', error);
        setProfileError('There was an issue updating your financial profile. Your debts have been saved, but some calculations may not be current.');
        // Don't block the user - they can still continue with their workflow
      }
    }
  }, [debts]);

  // Calculate freedom ratio when debts or financial profile changes
  useEffect(() => {
    if (financialProfile) {
      calculateFreedomRatio();
    }
  }, [debts, financialProfile]);

  // Clean up infinite decimals when component loads or expenses change
  useEffect(() => {
    const timer = setTimeout(() => {
      cleanExpenseValues();
    }, 100); // Small delay to avoid conflicts with other updates
    
    return () => clearTimeout(timer);
  }, [showDetailedExpenses]);

  // Handle debt form input changes
  const handleDebtInputChange = (field, value) => {
    setCurrentDebt(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Format numeric input to proper currency format
  const formatNumericInput = (value) => {
    if (!value || value === '') return '';
    const num = parseFloat(value);
    if (isNaN(num)) return '';
    // Round to 2 decimal places and ensure no infinite decimals
    return Math.round(num * 100) / 100;
  };

  // Handle expense input changes
  const handleExpenseChange = (field, value) => {
    setExpenses(prev => {
      const updated = { ...prev, [field]: value };
      
      // Calculate freedom ratio when expenses change
      calculateFreedomRatio(updated);
      
      return updated;
    });
  };

  // Handle expense input blur (when user finishes typing)
  const handleExpenseBlur = (field, value) => {
    if (value && value !== '') {
      const formatted = formatNumericInput(value);
      // Only update if the formatted value is different to avoid unnecessary re-renders
      if (formatted.toString() !== value) {
        setExpenses(prev => ({ ...prev, [field]: formatted.toString() }));
      }
    }
  };

  // Clean all expense values to remove infinite decimals
  const cleanExpenseValues = () => {
    setExpenses(prev => {
      const cleaned = {};
      Object.keys(prev).forEach(key => {
        if (prev[key] && prev[key] !== '') {
          const num = parseFloat(prev[key]);
          if (!isNaN(num)) {
            cleaned[key] = (Math.round(num * 100) / 100).toString();
          } else {
            cleaned[key] = prev[key];
          }
        } else {
          cleaned[key] = prev[key];
        }
      });
      return cleaned;
    });
  };

  // Calculate Freedom Ratio
  const calculateFreedomRatio = (currentExpenses = expenses) => {
    try {
      if (!financialProfile || !financialProfile.userProfile) return;
      
      // Safely get monthly income with fallback
      let monthlyIncome = 0;
      try {
        monthlyIncome = financialProfile.userProfile.getMonthlyNetIncome();
      } catch (incomeError) {
        console.error('Error calculating monthly income:', incomeError);
        return;
      }
      
      if (monthlyIncome <= 0) return;
      
      // Calculate total monthly obligations with error handling
      let totalDebts = 0;
      try {
        totalDebts = debts.reduce((sum, debt) => {
          const payment = parseFloat(debt.monthlyPayment) || 0;
          return sum + payment;
        }, 0);
      } catch (debtError) {
        console.error('Error calculating total debts:', debtError);
        totalDebts = 0;
      }
      
      let totalExpenses = 0;
      try {
        if (showDetailedExpenses) {
          // Use detailed breakdown
          totalExpenses = Object.entries(currentExpenses)
            .filter(([key]) => key !== 'housing' && key !== 'everythingElse')
            .reduce((sum, [, value]) => sum + (parseFloat(value) || 0), 0);
        } else {
          // Use simple breakdown
          totalExpenses = (parseFloat(currentExpenses.housing) || 0) + (parseFloat(currentExpenses.everythingElse) || 0);
        }
      } catch (expensesError) {
        console.error('Error calculating total expenses:', expensesError);
        totalExpenses = 0;
      }
      
      const totalObligations = totalDebts + totalExpenses;
      const freedomAmount = monthlyIncome - totalObligations;
      const ratio = (freedomAmount / monthlyIncome) * 100;
      
      setFreedomRatio({
        percentage: Math.max(0, ratio),
        freedomAmount: Math.max(0, freedomAmount),
        monthlyIncome,
        totalObligations,
        isHealthy: ratio >= 20
      });
    } catch (error) {
      console.error('Error calculating freedom ratio:', error);
      // Set a fallback state so the UI doesn't break
      setFreedomRatio({
        percentage: 0,
        freedomAmount: 0,
        monthlyIncome: 0,
        totalObligations: 0,
        isHealthy: false,
        error: true
      });
    }
  };

  // Add debt to the list
  const addDebt = () => {
    if (!currentDebt.name || !currentDebt.currentBalance || !currentDebt.minimumPayment) {
      return;
    }

    try {
      // Clear any previous errors
      setProfileError(null);
      
      // Validate numeric inputs
      const currentBalance = parseFloat(currentDebt.currentBalance);
      const minimumPayment = parseFloat(currentDebt.minimumPayment);
      const interestRate = parseFloat(currentDebt.interestRate) || 0;
      
      if (isNaN(currentBalance) || currentBalance <= 0) {
        setProfileError('Please enter a valid current balance greater than 0.');
        return;
      }
      
      if (isNaN(minimumPayment) || minimumPayment <= 0) {
        setProfileError('Please enter a valid minimum payment greater than 0.');
        return;
      }
      
      if (isNaN(interestRate) || interestRate < 0) {
        setProfileError('Please enter a valid interest rate (0 or greater).');
        return;
      }

      const newDebt = new Debt({
        name: currentDebt.name,
        type: currentDebt.type,
        currentBalance: currentBalance,
        minimumPayment: minimumPayment,
        monthlyPayment: minimumPayment, // Start with minimum
        interestRate: interestRate
      });

      setDebts(prev => [...prev, newDebt]);
      setCurrentDebt({
        name: '',
        type: '',
        currentBalance: '',
        minimumPayment: '',
        interestRate: ''
      });
    } catch (error) {
      console.error('Error adding debt:', error);
      setProfileError('There was an issue adding your debt. Please check your inputs and try again.');
    }
  };

  // Remove debt from the list
  const removeDebt = (debtId) => {
    try {
      // Clear any previous errors
      setProfileError(null);
      
      setDebts(prev => prev.filter(debt => debt.id !== debtId));
    } catch (error) {
      console.error('Error removing debt:', error);
      setProfileError('There was an issue removing the debt. Please try again.');
    }
  };

  // Calculate payoff timelines
  const calculatePayoffTimelines = () => {
    if (!financialProfile || debts.length === 0) return;

    try {
      // Clear any previous errors
      setProfileError(null);

      // Create a proper FinancialProfile instance instead of using spread operator
      const updatedProfile = new FinancialProfile({
        userProfile: financialProfile.userProfile,
        financialObligations: new FinancialObligations({ debts }),
        fixedExpenses: financialProfile.fixedExpenses,
        currentAssets: financialProfile.currentAssets,
        northStarDream: financialProfile.northStarDream,
        variableExpenses: financialProfile.variableExpenses,
        lastUpdated: financialProfile.lastUpdated
      });
      
      // Calculate individual debt payoff timelines
      const individualTimelines = debts.map(debt => {
        try {
          const remainingMonths = debt.calculateRemainingMonths();
          const payoffDate = debt.calculatePayoffDate();
          const totalInterest = debt.calculateTotalInterest();
          
          return {
            debt,
            remainingMonths,
            payoffDate,
            totalInterest,
            monthsDisplay: remainingMonths > 12 
              ? `${Math.floor(remainingMonths / 12)} years, ${remainingMonths % 12} months`
              : `${remainingMonths} months`
          };
        } catch (debtError) {
          console.error('Error calculating timeline for debt:', debt.name, debtError);
          // Return a fallback timeline for this debt
          return {
            debt,
            remainingMonths: 0,
            payoffDate: new Date().toISOString().split('T')[0],
            totalInterest: 0,
            monthsDisplay: 'Unable to calculate',
            error: true
          };
        }
      });

      // Calculate debt payoff strategies with fallbacks
      let avalancheStrategy = null;
      let snowballStrategy = null;
      
      try {
        if (typeof updatedProfile.calculateDebtPayoffTimeline === 'function') {
          avalancheStrategy = updatedProfile.calculateDebtPayoffTimeline('avalanche', 0);
        } else {
          console.warn('calculateDebtPayoffTimeline method not available');
        }
      } catch (avalancheError) {
        console.error('Error calculating avalanche strategy:', avalancheError);
      }
      
      try {
        if (typeof updatedProfile.calculateDebtPayoffTimeline === 'function') {
          snowballStrategy = updatedProfile.calculateDebtPayoffTimeline('snowball', 0);
        } else {
          console.warn('calculateDebtPayoffTimeline method not available');
        }
      } catch (snowballError) {
        console.error('Error calculating snowball strategy:', snowballError);
      }

      setPayoffTimelines({
        individual: individualTimelines,
        avalanche: avalancheStrategy || { strategy: 'avalanche', totalMonths: 0, totalInterest: 0, payoffOrder: [], error: true },
        snowball: snowballStrategy || { strategy: 'snowball', totalMonths: 0, totalInterest: 0, payoffOrder: [], error: true }
      });

      setShowResults(true);
    } catch (error) {
      console.error('Error calculating payoff timelines:', error);
      setProfileError('There was an issue calculating your debt payoff timelines. The data has been saved, but some calculations may not be available.');
      // Still show results with what we have
      setShowResults(true);
    }
  };

  // Navigation functions
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Get category info by type
  const getCategoryInfo = (type) => {
    return debtCategories.find(cat => cat.id === type) || debtCategories[4]; // Default to 'other'
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

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  // Render welcome step
  const renderWelcomeStep = () => (
    <div className="max-w-2xl mx-auto text-center">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-full w-24 h-24 mx-auto mb-8 flex items-center justify-center">
        <Heart className="w-12 h-12 text-white" />
      </div>
      
      <h1 className="text-4xl font-bold text-gray-800 mb-6">
        Let's understand what you're working with today
      </h1>
      
      <p className="text-xl text-gray-600 mb-8 leading-relaxed">
        <span className="font-semibold text-blue-600">No judgment, just math.</span>
        <br />
        Understanding your current obligations helps us create a realistic path to your dreams.
        Every successful journey starts with knowing where you are.
      </p>
      
      <div className="bg-blue-50 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-center mb-4">
          <CheckCircle className="w-6 h-6 text-blue-600 mr-2" />
          <span className="font-semibold text-blue-800">What we'll cover together:</span>
        </div>
        <ul className="text-left text-blue-700 space-y-2 max-w-md mx-auto">
          <li>• Your current debts and obligations</li>
          <li>• How long until each is paid off</li>
          <li>• Strategies to optimize your timeline</li>
          <li>• Ways to free up money for your dreams</li>
        </ul>
      </div>
      
      <button
        onClick={nextStep}
        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
      >
        Let's start with the good stuff
        <ArrowRight className="w-5 h-5 ml-2 inline" />
      </button>
    </div>
  );

  // Render debt categories step
  const renderDebtCategoriesStep = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Which of these sound familiar?
        </h2>
        <p className="text-lg text-gray-600">
          Click on any that apply to you. We'll handle them one at a time.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {debtCategories.map((category) => {
          const Icon = category.icon;
          const hasDebtsOfType = debts.some(debt => debt.type === category.id);
          
          return (
            <div
              key={category.id}
              onClick={() => {
                setCurrentDebt(prev => ({ ...prev, type: category.id }));
                setCurrentStep(2); // Go to debt details
              }}
              className={`
                cursor-pointer bg-white rounded-xl p-6 border-2 transition-all duration-300 hover:scale-105
                ${hasDebtsOfType 
                  ? `border-${category.color}-500 bg-${category.color}-50` 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className={`bg-${category.color}-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center`}>
                <Icon className={`w-8 h-8 text-${category.color}-600`} />
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">{category.title}</h3>
              <p className={`text-${category.color}-600 font-medium mb-2`}>{category.subtitle}</p>
              <p className="text-gray-600 text-sm mb-4">{category.description}</p>
              
              {hasDebtsOfType && (
                <div className="flex items-center justify-center text-green-600 font-medium">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Added
                </div>
              )}
              
              <div className="text-xs text-gray-500 mt-2">
                {category.examples.join(' • ')}
              </div>
            </div>
          );
        })}
      </div>
      
      {debts.length > 0 && (
        <div className="text-center">
          <button
            onClick={() => setCurrentStep(3)}
            className="bg-green-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors"
          >
            Continue to Expenses
            <ArrowRight className="w-5 h-5 ml-2 inline" />
          </button>
        </div>
      )}
      
      <div className="flex justify-between mt-8">
        <button
          onClick={prevStep}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>
        
        {debts.length === 0 && (
          <button
            onClick={() => setCurrentStep(3)}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            Skip - I don't have any debts →
          </button>
        )}
      </div>
    </div>
  );

  // Render debt details step
  const renderDebtDetailsStep = () => {
    const category = getCategoryInfo(currentDebt.type);
    const Icon = category.icon;
    
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className={`bg-${category.color}-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center`}>
            <Icon className={`w-8 h-8 text-${category.color}-600`} />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {category.title}
          </h2>
          <p className="text-lg text-gray-600">{category.description}</p>
        </div>
        
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <div className="space-y-6">
            {/* Debt Name */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                What should we call this debt?
              </label>
              <input
                type="text"
                value={currentDebt.name}
                onChange={(e) => handleDebtInputChange('name', e.target.value)}
                placeholder={`e.g., ${category.examples[0]}`}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
              />
            </div>
            
            {/* Current Balance */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                Current balance
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
                <input
                  type="number"
                  value={currentDebt.currentBalance}
                  onChange={(e) => handleDebtInputChange('currentBalance', e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                />
              </div>
            </div>
            
            {/* Minimum Payment */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                Minimum monthly payment
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
                <input
                  type="number"
                  value={currentDebt.minimumPayment}
                  onChange={(e) => handleDebtInputChange('minimumPayment', e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                />
              </div>
            </div>
            
            {/* Interest Rate */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                Interest rate (optional but helpful)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={currentDebt.interestRate}
                  onChange={(e) => handleDebtInputChange('interestRate', e.target.value)}
                  placeholder="0.00"
                  className="w-full pr-8 pl-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">%</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                This helps us calculate more accurate payoff timelines
              </p>
            </div>
          </div>
          
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to categories
            </button>
            
            <button
              onClick={addDebt}
              disabled={!currentDebt.name || !currentDebt.currentBalance || !currentDebt.minimumPayment}
              className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Add this debt
            </button>
          </div>
        </div>
        
        {/* Error Message Display */}
        {profileError && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-red-800 font-semibold mb-1">Notice</h4>
                <p className="text-red-700">{profileError}</p>
                <button
                  onClick={() => setProfileError(null)}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Show added debts */}
        {debts.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Added debts:</h3>
            <div className="space-y-3">
              {debts.map((debt) => {
                const debtCategory = getCategoryInfo(debt.type);
                return (
                  <div key={debt.id} className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-800">{debt.name}</div>
                      <div className="text-sm text-gray-600">
                        {formatCurrency(debt.currentBalance)} • {formatCurrency(debt.monthlyPayment)}/month
                      </div>
                    </div>
                    <button
                      onClick={() => removeDebt(debt.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
            
            <div className="text-center mt-6">
              <button
                onClick={() => setCurrentStep(3)}
                className="bg-green-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors"
              >
                Continue to Expenses
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render fixed expenses step
  const renderFixedExpensesStep = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-green-500 to-blue-600 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <Home className="w-12 h-12 text-white" />
        </div>
        
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Now let's talk about your essentials
        </h2>
        <p className="text-lg text-gray-600">
          The things you need to keep your life running smoothly. We'll keep this simple.
        </p>
      </div>

      <div className="bg-white rounded-xl p-8 shadow-lg">
        <div className="space-y-8">
          {/* Housing Payment */}
          <div>
            <label className="block text-xl font-semibold text-gray-700 mb-3">
              <Home className="w-6 h-6 inline mr-2 text-blue-600" />
              Housing payment (rent/mortgage)
            </label>
            <p className="text-gray-600 mb-4">
              Your biggest essential - the roof over your head
            </p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
              <input
                type="number"
                step="0.01"
                value={expenses.housing}
                onChange={(e) => handleExpenseChange('housing', e.target.value)}
                onBlur={(e) => handleExpenseBlur('housing', e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
              />
            </div>
          </div>

          {/* Everything Else Essential */}
          <div>
            <label className="block text-xl font-semibold text-gray-700 mb-3">
              <ShoppingCart className="w-6 h-6 inline mr-2 text-green-600" />
              Everything else essential
            </label>
            <p className="text-gray-600 mb-4">
              Food, utilities, insurance, transportation - all the other must-haves
            </p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
              <input
                type="number"
                step="0.01"
                value={expenses.everythingElse}
                onChange={(e) => handleExpenseChange('everythingElse', e.target.value)}
                onBlur={(e) => handleExpenseBlur('everythingElse', e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
              />
            </div>
          </div>

          {/* Progressive Disclosure Button */}
          {!showDetailedExpenses && (expenses.housing || expenses.everythingElse) && (
            <div className="text-center space-y-3">
              <button
                onClick={() => {
                  setShowDetailedExpenses(true);
                  // Transfer "everything else" to detailed categories for easier editing
                  if (expenses.everythingElse && !expenses.groceries) {
                    const everythingElseAmount = parseFloat(expenses.everythingElse) || 0;
                    // Use proper rounding to avoid floating point errors
                    const estimatedBreakdown = {
                      groceries: (Math.round(everythingElseAmount * 0.3 * 100) / 100).toString(),
                      utilities: (Math.round(everythingElseAmount * 0.2 * 100) / 100).toString(),
                      transportation: (Math.round(everythingElseAmount * 0.25 * 100) / 100).toString(),
                      insurance: (Math.round(everythingElseAmount * 0.15 * 100) / 100).toString(),
                      subscriptions: (Math.round(everythingElseAmount * 0.05 * 100) / 100).toString(),
                      other: (Math.round(everythingElseAmount * 0.05 * 100) / 100).toString()
                    };
                    setExpenses(prev => ({ ...prev, ...estimatedBreakdown }));
                  }
                }}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors flex items-center mx-auto"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Want to break this down for better accuracy?
              </button>
              
              {/* Clean Numbers Button */}
              <button
                onClick={cleanExpenseValues}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                🔧 Clean up decimal places
              </button>
            </div>
          )}

          {/* Detailed Breakdown */}
          {showDetailedExpenses && (
            <div className="space-y-6 border-t pt-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Let's get more specific
                </h3>
                <p className="text-gray-600 text-sm">
                  This helps us give you better insights about your financial flexibility
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Groceries */}
                <div>
                  <label className="block font-medium text-gray-700 mb-2">
                    <ShoppingCart className="w-5 h-5 inline mr-2 text-green-600" />
                    Groceries & Food
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={expenses.groceries}
                      onChange={(e) => handleExpenseChange('groceries', e.target.value)}
                      onBlur={(e) => handleExpenseBlur('groceries', e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-7 pr-3 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Utilities */}
                <div>
                  <label className="block font-medium text-gray-700 mb-2">
                    <Zap className="w-5 h-5 inline mr-2 text-yellow-600" />
                    Utilities
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={expenses.utilities}
                      onChange={(e) => handleExpenseChange('utilities', e.target.value)}
                      onBlur={(e) => handleExpenseBlur('utilities', e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-7 pr-3 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Transportation */}
                <div>
                  <label className="block font-medium text-gray-700 mb-2">
                    <Fuel className="w-5 h-5 inline mr-2 text-blue-600" />
                    Transportation
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={expenses.transportation}
                      onChange={(e) => handleExpenseChange('transportation', e.target.value)}
                      onBlur={(e) => handleExpenseBlur('transportation', e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-7 pr-3 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Insurance */}
                <div>
                  <label className="block font-medium text-gray-700 mb-2">
                    <Shield className="w-5 h-5 inline mr-2 text-purple-600" />
                    Insurance
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={expenses.insurance}
                      onChange={(e) => handleExpenseChange('insurance', e.target.value)}
                      onBlur={(e) => handleExpenseBlur('insurance', e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-7 pr-3 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Subscriptions */}
                <div>
                  <label className="block font-medium text-gray-700 mb-2">
                    <Calculator className="w-5 h-5 inline mr-2 text-pink-600" />
                    Subscriptions
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={expenses.subscriptions}
                      onChange={(e) => handleExpenseChange('subscriptions', e.target.value)}
                      onBlur={(e) => handleExpenseBlur('subscriptions', e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-7 pr-3 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Other */}
                <div>
                  <label className="block font-medium text-gray-700 mb-2">
                    <DollarSign className="w-5 h-5 inline mr-2 text-gray-600" />
                    Other Essentials
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={expenses.other}
                      onChange={(e) => handleExpenseChange('other', e.target.value)}
                      onBlur={(e) => handleExpenseBlur('other', e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-7 pr-3 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="text-center space-y-2">
                <button
                  onClick={() => {
                    setShowDetailedExpenses(false);
                    // Consolidate detailed expenses back to "everything else"
                    const detailedTotal = ['utilities', 'insurance', 'groceries', 'transportation', 'subscriptions', 'other']
                      .reduce((sum, key) => sum + (parseFloat(expenses[key]) || 0), 0);
                    // Use proper rounding to avoid floating point errors
                    const roundedTotal = Math.round(detailedTotal * 100) / 100;
                    setExpenses(prev => ({ 
                      ...prev, 
                      everythingElse: roundedTotal.toString(),
                      utilities: '', insurance: '', groceries: '', transportation: '', subscriptions: '', other: ''
                    }));
                  }}
                  className="text-gray-600 hover:text-gray-800 text-sm transition-colors"
                >
                  ← Back to simple view
                </button>
                
                {/* Clean Numbers Button for detailed view */}
                <div>
                  <button
                    onClick={cleanExpenseValues}
                    className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    🔧 Clean up decimal places
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Freedom Ratio Display */}
        {freedomRatio && (
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Your Freedom Ratio
              </h3>
              <p className="text-gray-600">
                The percentage of your income not locked into obligations
              </p>
            </div>

            <div className="flex items-center justify-center mb-6">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke={freedomRatio.isHealthy ? "#10b981" : freedomRatio.percentage > 10 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(freedomRatio.percentage / 100) * 314} 314`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${freedomRatio.isHealthy ? 'text-green-600' : freedomRatio.percentage > 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {Math.round(freedomRatio.percentage)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-gray-700">Monthly Income</div>
                <div className="text-lg font-bold text-blue-600">
                  {formatCurrency(freedomRatio.monthlyIncome)}
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-700">Freedom Amount</div>
                <div className={`text-lg font-bold ${freedomRatio.isHealthy ? 'text-green-600' : 'text-yellow-600'}`}>
                  {formatCurrency(freedomRatio.freedomAmount)}
                </div>
              </div>
            </div>

            {/* Encouraging Messages */}
            {freedomRatio.isHealthy ? (
              <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                <div className="flex items-center text-green-800">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">Excellent financial flexibility!</span>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  You have great room to save for your dreams and handle unexpected expenses.
                </p>
              </div>
            ) : freedomRatio.percentage > 10 ? (
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
                <div className="flex items-center text-yellow-800">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">You're doing okay, with room to optimize</span>
                </div>
                <p className="text-yellow-700 text-sm mt-1">
                  Small changes to your expenses could significantly boost your freedom ratio.
                </p>
              </div>
            ) : (
              <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
                <div className="flex items-center text-blue-800">
                  <Heart className="w-5 h-5 mr-2" />
                  <span className="font-medium">Every small change makes a big difference</span>
                </div>
                <p className="text-blue-700 text-sm mt-1">
                  You're not alone - many people start here. Even saving $50/month can transform your future.
                  Let's find ways to create more breathing room together.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to debts
          </button>
          
          <button
            onClick={nextStep}
            disabled={!expenses.housing && !expenses.everythingElse && !showDetailedExpenses}
            className="bg-blue-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            See My Complete Picture
            <ArrowRight className="w-5 h-5 ml-2 inline" />
          </button>
        </div>
      </div>
    </div>
  );

  // Render review and calculate step
  const renderReviewStep = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Your Financial Reality Check
        </h2>
        <p className="text-lg text-gray-600">
          Here's what we're working with - and how to optimize it
        </p>
      </div>
      
      {debts.length === 0 ? (
        <div className="bg-green-50 rounded-xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-green-800 mb-2">Debt-Free! 🎉</h3>
          <p className="text-green-700 text-lg">
            You're in an amazing position with no debt obligations. 
            This means more of your income can go directly toward your dreams!
          </p>
        </div>
      ) : (
        <>
          {/* Debt Summary */}
          <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Your Current Debts</h3>
            
            <div className="space-y-4 mb-6">
              {debts.map((debt) => {
                const category = getCategoryInfo(debt.type);
                const Icon = category.icon;
                
                return (
                  <div key={debt.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`bg-${category.color}-100 p-2 rounded-lg mr-4`}>
                          <Icon className={`w-5 h-5 text-${category.color}-600`} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{debt.name}</div>
                          <div className="text-sm text-gray-600">{category.title}</div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-bold text-lg text-gray-800">
                          {formatCurrency(debt.currentBalance)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatCurrency(debt.monthlyPayment)}/month
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Totals */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Debt:</span>
                <span>{formatCurrency(debts.reduce((sum, debt) => sum + debt.currentBalance, 0))}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold text-blue-600">
                <span>Total Monthly Payments:</span>
                <span>{formatCurrency(debts.reduce((sum, debt) => sum + debt.monthlyPayment, 0))}</span>
              </div>
            </div>
          </div>
          
          {/* Impact on Your Someday Life Section */}
          {debts.length > 0 && (() => {
            // Get Someday Life data from localStorage
            const getSomedayLifeData = () => {
              try {
                const storedData = localStorage.getItem('somedayLifeData') || localStorage.getItem('financialProfile');
                if (storedData) {
                  const data = JSON.parse(storedData);
                  return data.northStarDream || data.somedayLife || null;
                }
              } catch (error) {
                console.error('Error loading Someday Life data:', error);
              }
              return null;
            };

            const somedayLifeData = getSomedayLifeData();
            const userAge = financialProfile?.userProfile?.age || 30;
            
            // Calculate age-based timeline for each scenario
            const calculateAgeImpact = (scenario) => {
              if (scenario.error) return { ageAtFreedom: 'Unknown', ageAtDream: 'Unknown' };
              
              const monthsToFreedom = scenario.totalMonths;
              const yearsToFreedom = monthsToFreedom / 12;
              const ageAtFreedom = Math.round(userAge + yearsToFreedom);
              
              // Estimate additional time to save for dream (assuming dream costs $150k and they save $800/month)
              const dreamCost = somedayLifeData?.estimatedCost || 150000;
              const monthlySavings = scenario.monthlyPayment || 800;
              const monthsToSaveDream = Math.ceil(dreamCost / monthlySavings);
              const yearsToSaveDream = monthsToSaveDream / 12;
              const ageAtDream = Math.round(ageAtFreedom + yearsToSaveDream);
              
              return { ageAtFreedom, ageAtDream, yearsToFreedom, yearsToSaveDream };
            };

            return (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-8 mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                  🎯 Impact on Your Someday Life
                </h3>
                
                <p className="text-center text-gray-700 mb-8">
                  Your debt strategy doesn't just affect your payments—it determines when you can start living the life you're dreaming of. Here's the timeline for reaching your{' '}
                  <span className="font-semibold text-purple-600">
                    {somedayLifeData?.title || somedayLifeData?.location || 'Someday Life'}
                  </span>:
                </p>

                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Current Path Impact */}
                  {!selectedOptimizationScenario?.current?.error && (() => {
                    const impact = calculateAgeImpact(selectedOptimizationScenario?.current || { totalMonths: 116, monthlyPayment: 800 });
                    return (
                      <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <div className="text-center">
                          <div className="bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <span className="text-2xl">📅</span>
                          </div>
                          <h4 className="font-bold text-gray-800 mb-2">Current Path</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-600">Debt free at age:</span>
                              <div className="text-xl font-bold text-gray-800">{impact.ageAtFreedom}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Reach your dream at age:</span>
                              <div className="text-xl font-bold text-gray-800">{impact.ageAtDream}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Optimized Path Impact */}
                  {!selectedOptimizationScenario?.optimized?.error && (() => {
                    const impact = calculateAgeImpact(selectedOptimizationScenario?.optimized || { totalMonths: 100, monthlyPayment: 800 });
                    const currentImpact = calculateAgeImpact(selectedOptimizationScenario?.current || { totalMonths: 116, monthlyPayment: 800 });
                    const yearsSaved = currentImpact.ageAtDream - impact.ageAtDream;
                    
                    return (
                      <div className="bg-white rounded-lg p-6 border-2 border-blue-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                          OPTIMIZED
                        </div>
                        <div className="text-center">
                          <div className="bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <span className="text-2xl">🎯</span>
                          </div>
                          <h4 className="font-bold text-blue-800 mb-2">Optimized Path</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-600">Debt free at age:</span>
                              <div className="text-xl font-bold text-blue-600">{impact.ageAtFreedom}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Reach your dream at age:</span>
                              <div className="text-xl font-bold text-blue-600">{impact.ageAtDream}</div>
                            </div>
                            {yearsSaved > 0 && (
                              <div className="bg-blue-50 rounded-lg p-2 mt-3">
                                <div className="text-blue-700 font-semibold">
                                  {yearsSaved} year{yearsSaved > 1 ? 's' : ''} sooner!
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Accelerated Path Impact */}
                  {!selectedOptimizationScenario?.accelerated?.error && (() => {
                    const impact = calculateAgeImpact(selectedOptimizationScenario?.accelerated || { totalMonths: 85, monthlyPayment: 900 });
                    const currentImpact = calculateAgeImpact(selectedOptimizationScenario?.current || { totalMonths: 116, monthlyPayment: 800 });
                    const yearsSaved = currentImpact.ageAtDream - impact.ageAtDream;
                    
                    return (
                      <div className="bg-white rounded-lg p-6 border-2 border-green-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                          ACCELERATED
                        </div>
                        <div className="text-center">
                          <div className="bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <span className="text-2xl">🚀</span>
                          </div>
                          <h4 className="font-bold text-green-800 mb-2">Accelerated Path</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-600">Debt free at age:</span>
                              <div className="text-xl font-bold text-green-600">{impact.ageAtFreedom}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Reach your dream at age:</span>
                              <div className="text-xl font-bold text-green-600">{impact.ageAtDream}</div>
                            </div>
                            {yearsSaved > 0 && (
                              <div className="bg-green-50 rounded-lg p-2 mt-3">
                                <div className="text-green-700 font-semibold">
                                  {yearsSaved} year{yearsSaved > 1 ? 's' : ''} sooner!
                                </div>
                                <div className="text-xs text-green-600">
                                  Just $100 extra/month
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="text-center mt-8 p-6 bg-white rounded-lg border border-purple-200">
                  <h5 className="font-bold text-purple-800 mb-3">💫 The Power of Strategic Thinking</h5>
                  <p className="text-gray-700 leading-relaxed">
                    The difference between your current path and an optimized strategy isn't just money—it's <strong>years of your life</strong>. 
                    Every month you shave off your debt timeline is a month sooner you can stop working for others and start living for yourself.
                  </p>
                  {somedayLifeData?.location && (
                    <p className="text-purple-600 font-medium mt-2">
                      Your {somedayLifeData.location} is waiting. The question is: how soon do you want to get there?
                    </p>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Debt Optimization Display */}
          {debts.length > 0 && (
            <DebtOptimizationDisplay 
              debts={debts}
              dreamGoal={financialProfile?.northStarDream || {
                title: 'Your Someday Life',
                estimatedCost: 150000 // Default dream cost estimate
              }}
              onScenarioSelect={(scenario) => {
                setSelectedOptimizationScenario(scenario);
                setShowResults(true);
              }}
            />
          )}
        </>
      )}
      
      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={prevStep}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>
        
        {(debts.length === 0 || selectedOptimizationScenario) && (
          <button
            onClick={() => {
              // Save final data and proceed
              if (onComplete) {
                onComplete();
              }
            }}
            className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-blue-700 transition-all duration-300"
          >
            Continue to Next Step
            <ArrowRight className="w-5 h-5 ml-2 inline" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-center items-center space-x-4">
            {steps.map((step, index) => (
              <React.Fragment key={step}>
                <div className={`
                  w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentStep 
                      ? 'bg-blue-500 scale-150' 
                      : index < currentStep 
                        ? 'bg-green-500' 
                        : 'bg-gray-300'
                  }
                `} />
                {index < steps.length - 1 && (
                  <div className={`
                    w-8 h-0.5 transition-all duration-300 ${
                      index < currentStep ? 'bg-green-500' : 'bg-gray-300'
                    }
                  `} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="transition-all duration-500 ease-in-out">
          {currentStep === 0 && renderWelcomeStep()}
          {currentStep === 1 && renderDebtCategoriesStep()}
          {currentStep === 2 && renderDebtDetailsStep()}
          {currentStep === 3 && renderFixedExpensesStep()}
          {currentStep === 4 && renderReviewStep()}
        </div>
      </div>
    </div>
  );
};

export default FinancialRealityWizard;
