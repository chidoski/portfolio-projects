import React, { useState, useEffect } from 'react';
import { FinancialProfile, FinancialObligations, Debt } from '../models/FinancialProfile.js';
import { Heart, DollarSign, Car, CreditCard, GraduationCap, Calculator, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, Home, Zap, Shield, ShoppingCart, Fuel, TrendingUp } from 'lucide-react';
import DebtOptimizationDisplay from '../components/DebtOptimizationDisplay.jsx';
import { getFinancialRealityContent } from '../utils/adaptiveContent';
import { AIConfidenceBadge } from '../components/AIInsight';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  // Fixed expenses state
  const [expenses, setExpenses] = useState({
    housing: '',
    // Quick mode field
    allOtherEssentials: '',
    // Detailed breakdown
    utilities: '',
    insurance: '',
    groceries: '',
    transportation: '',
    subscriptions: '',
    other: ''
  });
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [showDetailedExpenses, setShowDetailedExpenses] = useState(false);
  const [freedomRatio, setFreedomRatio] = useState(null);
  const [expenseWarnings, setExpenseWarnings] = useState({});
  const [smartDefaults, setSmartDefaults] = useState({});
  const [quickMode, setQuickMode] = useState(() => {
    // Load saved preference from localStorage
    const savedMode = localStorage.getItem('expenseInputMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

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
      
      // Enhanced validation for income data before creating profile
      let profile;
      if (profileData) {
        // Ensure userProfile exists and has valid income data
        if (!profileData.userProfile) {
          profileData.userProfile = {};
        }
        if (!profileData.userProfile.income) {
          profileData.userProfile.income = { gross: { annual: 0 }, net: { annual: 0 }, taxRate: 0.22 };
        }
        if (!profileData.userProfile.income.gross) {
          profileData.userProfile.income.gross = { annual: 0 };
        }
        
        // Add validation: ensure income values are numbers
        let annualIncome = parseFloat(profileData.userProfile.income.gross.annual) || 0;
        
        // If no income found in profile, try to retrieve from separate storage
        if (annualIncome === 0) {
          try {
            const savedIncome = JSON.parse(localStorage.getItem('userIncome') || '{}');
            annualIncome = parseFloat(savedIncome.annual) || 0;
            console.log('Retrieved income from userIncome storage:', annualIncome);
          } catch (error) {
            console.warn('Could not retrieve income from userIncome storage:', error);
          }
        }
        
        if (annualIncome === 0) {
          console.warn('No valid income found in any storage. Income:', profileData.userProfile.income.gross.annual);
        }
        
        // Ensure the annual income is properly set as a number
        profileData.userProfile.income.gross.annual = annualIncome;
        
        profile = new FinancialProfile(profileData);
      } else {
        profile = new FinancialProfile();
      }
      
      setFinancialProfile(profile);
      
      // Load existing debts if any
      if (profile.financialObligations && profile.financialObligations.debts.length > 0) {
        setDebts(profile.financialObligations.debts);
      }
      
      // Load existing expenses if any
      if (profile.fixedExpenses) {
        const loadedExpenses = {
          housing: profile.fixedExpenses.housing?.total || '',
          utilities: profile.fixedExpenses.utilities?.total || '',
          insurance: profile.fixedExpenses.insurance?.total || '',
          groceries: profile.fixedExpenses.groceries?.total || '',
          transportation: profile.fixedExpenses.transportation?.total || '',
          subscriptions: profile.fixedExpenses.subscriptions?.total || '',
          other: profile.fixedExpenses.other?.total || ''
        };
        
        // Check if we have any detailed expenses to determine if we should show detailed view
        const hasDetailedExpenses = ['utilities', 'insurance', 'groceries', 'transportation', 'subscriptions', 'other']
          .some(key => parseFloat(loadedExpenses[key]) > 0);
        
        if (hasDetailedExpenses) {
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

  // Save to localStorage whenever debts change (with infinite loop prevention)
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
        
        // Use a ref to prevent infinite loops when updating the profile
        // Only update if the profile has actually changed (check by comparing serialized data)
        const currentProfileString = JSON.stringify(financialProfile.toJSON ? financialProfile.toJSON() : financialProfile);
        const newProfileString = JSON.stringify(properProfile.toJSON());
        
        if (currentProfileString !== newProfileString) {
          setFinancialProfile(properProfile);
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        setProfileError('There was an issue updating your financial profile. Your debts have been saved, but some calculations may not be current.');
        // Don't block the user - they can still continue with their workflow
      }
    }
  }, [debts]);

  // Calculate smart defaults based on income and location
  const calculateSmartDefaults = () => {
    let monthlyIncome = 0;
    let state = '';
    
    try {
      if (financialProfile?.userProfile) {
        monthlyIncome = financialProfile.userProfile.getMonthlyNetIncome();
        state = financialProfile.userProfile.location?.state || '';
      }
      // Fallback to saved income
      if (monthlyIncome <= 0) {
        const savedIncome = JSON.parse(localStorage.getItem('userIncome') || '{}');
        monthlyIncome = parseFloat(savedIncome.monthly) || 0;
      }
    } catch (error) {
      console.warn('Could not get income for smart defaults:', error);
    }

    if (monthlyIncome <= 0) {
      return {};
    }

    // Base percentages of net monthly income for different categories
    const basePercentages = {
      groceries: 0.10,    // 10% for food
      utilities: 0.03,    // 3% for utilities
      transportation: 0.08, // 8% for transportation
      insurance: 0.04,    // 4% for insurance
      subscriptions: 0.01 // 1% for subscriptions
    };

    // Adjust for high-cost locations
    const highCostStates = ['California', 'New York', 'Hawaii', 'Massachusetts', 'Connecticut'];
    const mediumCostStates = ['Washington', 'Colorado', 'Illinois', 'Virginia', 'Maryland'];
    
    let multiplier = 1.0;
    if (highCostStates.includes(state)) {
      multiplier = 1.3; // 30% higher in high-cost areas
    } else if (mediumCostStates.includes(state)) {
      multiplier = 1.15; // 15% higher in medium-cost areas
    }

    const defaults = {};
    Object.entries(basePercentages).forEach(([category, percentage]) => {
      const amount = Math.round(monthlyIncome * percentage * multiplier);
      defaults[category] = amount;
    });

    return defaults;
  };

  // Calculate smart defaults when financial profile is available
  useEffect(() => {
    if (financialProfile) {
      const defaults = calculateSmartDefaults();
      setSmartDefaults(defaults);
    }
  }, [financialProfile]);

  // Handle quick mode toggle
  const handleQuickModeToggle = (enabled) => {
    setQuickMode(enabled);
    localStorage.setItem('expenseInputMode', JSON.stringify(enabled));
    
    // If switching to quick mode and we have detailed expenses, consolidate them
    if (enabled && (expenses.groceries || expenses.utilities || expenses.transportation || expenses.insurance || expenses.subscriptions || expenses.other)) {
      const detailedTotal = (parseFloat(expenses.groceries) || 0) + 
                           (parseFloat(expenses.utilities) || 0) + 
                           (parseFloat(expenses.transportation) || 0) + 
                           (parseFloat(expenses.insurance) || 0) + 
                           (parseFloat(expenses.subscriptions) || 0) + 
                           (parseFloat(expenses.other) || 0);
      
      if (detailedTotal > 0) {
        setExpenses(prev => ({
          ...prev,
          allOtherEssentials: detailedTotal.toString(),
          groceries: '',
          utilities: '',
          transportation: '',
          insurance: '',
          subscriptions: '',
          other: ''
        }));
      }
    }
  };

  // Calculate total expenses automatically
  useEffect(() => {
    let total = parseFloat(expenses.housing) || 0;
    
    if (quickMode) {
      // In quick mode, use the consolidated field
      total += parseFloat(expenses.allOtherEssentials) || 0;
    } else {
      // In detailed mode, sum all individual fields
      total += (parseFloat(expenses.groceries) || 0) + 
               (parseFloat(expenses.utilities) || 0) + 
               (parseFloat(expenses.transportation) || 0) + 
               (parseFloat(expenses.insurance) || 0) + 
               (parseFloat(expenses.subscriptions) || 0) + 
               (parseFloat(expenses.other) || 0);
    }
    
    setTotalExpenses(total);
  }, [quickMode, expenses.housing, expenses.allOtherEssentials, expenses.groceries, expenses.utilities, expenses.transportation, expenses.insurance, expenses.subscriptions, expenses.other]);

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
      
      // Validate expense value
      validateExpenseValue(field, value);
      
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
      // Validate the final value
      validateExpenseValue(field, formatted.toString());
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

  // Validate expense values against monthly income
  const validateExpenseValue = (field, value) => {
    if (!value || value === '') {
      // Clear any existing warning for this field
      setExpenseWarnings(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
      return;
    }

    const expenseAmount = parseFloat(value);
    if (isNaN(expenseAmount) || expenseAmount <= 0) {
      return;
    }

    // Get monthly income
    let monthlyIncome = 0;
    try {
      if (financialProfile?.userProfile) {
        monthlyIncome = financialProfile.userProfile.getMonthlyNetIncome();
      }
      // Fallback to saved income
      if (monthlyIncome <= 0) {
        const savedIncome = JSON.parse(localStorage.getItem('userIncome') || '{}');
        monthlyIncome = parseFloat(savedIncome.monthly) || 0;
      }
    } catch (error) {
      console.warn('Could not get monthly income for validation:', error);
    }

    if (monthlyIncome <= 0) {
      return; // Can't validate without income
    }

    // Check if expense is more than 25% of monthly income
    const percentageOfIncome = (expenseAmount / monthlyIncome) * 100;
    
    if (percentageOfIncome > 25) {
      let warningMessage = '';
      if (field === 'groceries') {
        warningMessage = 'This seems high - did you mean to enter an annual amount?';
      } else if (field === 'housing') {
        warningMessage = 'This is quite high for housing. Most financial experts recommend 30% or less of income for housing.';
      } else {
        warningMessage = `This seems high for ${field} - over 25% of your monthly income.`;
      }

      setExpenseWarnings(prev => ({
        ...prev,
        [field]: {
          message: warningMessage,
          percentage: Math.round(percentageOfIncome),
          monthlyIncome: Math.round(monthlyIncome)
        }
      }));
    } else {
      // Clear warning if amount is reasonable
      setExpenseWarnings(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  // Calculate Freedom Ratio
  const calculateFreedomRatio = (currentExpenses = expenses) => {
    try {
      if (!financialProfile || !financialProfile.userProfile) return;
      
      // Safely get monthly income with fallback
      let monthlyIncome = 0;
      try {
        monthlyIncome = financialProfile.userProfile.getMonthlyNetIncome();
        
        // Add detailed logging before the calculation
        console.log('Income value:', monthlyIncome, 'Type:', typeof monthlyIncome);
        console.log('Financial profile:', financialProfile);
        console.log('User profile:', financialProfile.userProfile);
        
      } catch (incomeError) {
        console.error('Error calculating monthly income:', incomeError);
        return;
      }
      
      // Add validation: ensure income is a valid number
      const numericIncome = parseFloat(monthlyIncome) || 0;
      if (numericIncome === 0) {
        console.error('No income value found! Income:', monthlyIncome);
        return;
      }
      
      if (numericIncome <= 0) return;
      
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
      
      let calculatedExpenses = 0;
      try {
        // Sum expense fields based on mode
        calculatedExpenses = parseFloat(currentExpenses.housing) || 0;
        
        if (quickMode) {
          calculatedExpenses += parseFloat(currentExpenses.allOtherEssentials) || 0;
        } else {
          calculatedExpenses += (parseFloat(currentExpenses.groceries) || 0) + 
                               (parseFloat(currentExpenses.utilities) || 0) + 
                               (parseFloat(currentExpenses.transportation) || 0) + 
                               (parseFloat(currentExpenses.insurance) || 0) + 
                               (parseFloat(currentExpenses.subscriptions) || 0) + 
                               (parseFloat(currentExpenses.other) || 0);
        }
        
        // Add detailed logging for expenses
        console.log('Total expenses:', calculatedExpenses, 'Type:', typeof calculatedExpenses);
        console.log('Current expenses object:', currentExpenses);
        console.log('Show detailed expenses:', showDetailedExpenses);
        
      } catch (expensesError) {
        console.error('Error calculating total expenses:', expensesError);
        calculatedExpenses = 0;
      }
      
      const totalObligations = totalDebts + calculatedExpenses;
      const freedomAmount = numericIncome - totalObligations;
      const ratio = (freedomAmount / numericIncome) * 100;
      
      // Defensive programming to prevent NaN from appearing in the UI
      const safeRatio = isNaN(ratio) ? 0 : Math.max(0, Math.round(ratio));
      const safeFreedomAmount = isNaN(freedomAmount) ? 0 : Math.max(0, freedomAmount);
      const safeMonthlyIncome = isNaN(numericIncome) ? 0 : numericIncome;
      const safeTotalObligations = isNaN(totalObligations) ? 0 : totalObligations;
      
      setFreedomRatio({
        percentage: safeRatio,
        freedomAmount: safeFreedomAmount,
        monthlyIncome: safeMonthlyIncome,
        totalObligations: safeTotalObligations,
        isHealthy: safeRatio >= 20
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

  // Navigation functions - Modified to handle heavy calculation with loading state
  const nextStep = async () => {
    if (isProcessing) return; // Prevent multiple clicks
    
    // Check if we're moving from fixed-expenses to review-and-calculate (the "See My Complete Picture" transition)
    if (currentStep === 3 && steps[currentStep] === 'fixed-expenses') {
      setIsProcessing(true);
      setLoadingMessage('Creating your financial profile...');
      
      // Use setTimeout to defer execution to next tick
      setTimeout(() => {
        try {
          // Create the complete financial profile with all collected data
          const profileData = {
            userProfile: financialProfile?.userProfile || {},
            financialObligations: financialProfile?.financialObligations || { debts: [] },
            fixedExpenses: financialProfile?.fixedExpenses || {},
            currentAssets: financialProfile?.currentAssets || {},
            northStarDream: financialProfile?.northStarDream || {},
            variableExpenses: financialProfile?.variableExpenses || {},
            lastUpdated: new Date().toISOString()
          };
          
          const completeProfile = new FinancialProfile(profileData);
          
          // Save and navigate
          localStorage.setItem('completeProfile', JSON.stringify(completeProfile.toJSON()));
          
          // Move to next step
          if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
          }
        } catch (error) {
          console.error('Failed to create complete profile:', error);
          setProfileError('There was an issue creating your complete financial profile. Please try again.');
        } finally {
          setIsProcessing(false);
          setLoadingMessage('');
        }
      }, 100);
    } else {
      // Normal step advancement for other steps
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
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
        {getFinancialRealityContent('pageTitle', 'Let\'s understand what you\'re working with today')}
      </h1>
      
      <p className="text-xl text-gray-600 mb-8 leading-relaxed">
        <span className="font-semibold text-blue-600">No judgment, just math.</span>
        <br />
        {getFinancialRealityContent('pageSubtitle', 'Understanding your current obligations helps us create a realistic path to your dreams. Every successful journey starts with knowing where you are.')}
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
        {/* Quick Mode Toggle */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Input Mode</h4>
              <p className="text-sm text-gray-600">
                Choose your preferred level of detail
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  checked={quickMode}
                  onChange={() => handleQuickModeToggle(true)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Quick Mode</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  checked={!quickMode}
                  onChange={() => handleQuickModeToggle(false)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Detailed Mode</span>
              </label>
            </div>
          </div>
          {quickMode && (
            <div className="mt-2 text-xs text-blue-600">
              ⚡ Simplified inputs - just housing and one "everything else" field
            </div>
          )}
          {!quickMode && (
            <div className="mt-2 text-xs text-green-600">
              🔍 Detailed breakdown - individual categories for better insights
            </div>
          )}
        </div>

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
                className={`w-full pl-8 pr-4 py-4 border-2 rounded-xl focus:outline-none text-lg ${
                  expenseWarnings.housing 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-200 focus:border-blue-500'
                }`}
              />
            </div>
            {expenseWarnings.housing && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="text-yellow-800 font-medium">
                      {expenseWarnings.housing.message}
                    </div>
                    <div className="text-yellow-700 mt-1">
                      This is {expenseWarnings.housing.percentage}% of your monthly income 
                      (${expenseWarnings.housing.monthlyIncome.toLocaleString()}).
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Mode: All Other Essentials */}
          {quickMode && (
            <div>
              <label className="block text-xl font-semibold text-gray-700 mb-3">
                <ShoppingCart className="w-6 h-6 inline mr-2 text-green-600" />
                All other monthly essentials
              </label>
              <p className="text-gray-600 mb-4">
                Food, utilities, insurance, transportation, subscriptions - all the other must-haves combined
              </p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={expenses.allOtherEssentials}
                  onChange={(e) => handleExpenseChange('allOtherEssentials', e.target.value)}
                  onBlur={(e) => handleExpenseBlur('allOtherEssentials', e.target.value)}
                  placeholder="0.00"
                  className={`w-full pl-8 pr-4 py-4 border-2 rounded-xl focus:outline-none text-lg ${
                    expenseWarnings.allOtherEssentials 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-200 focus:border-blue-500'
                  }`}
                />
              </div>
              {expenseWarnings.allOtherEssentials && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="text-yellow-800 font-medium">
                        {expenseWarnings.allOtherEssentials.message}
                      </div>
                      <div className="text-yellow-700 mt-1">
                        This is {expenseWarnings.allOtherEssentials.percentage}% of your monthly income 
                        (${expenseWarnings.allOtherEssentials.monthlyIncome.toLocaleString()}).
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Detailed Breakdown - Only in Detailed Mode */}
          {!quickMode && (
            <div className="border-t pt-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Monthly Essentials Breakdown
              </h3>
              <p className="text-gray-600 text-sm">
                Let's get specific about your monthly expenses for better insights
              </p>
              {Object.keys(smartDefaults).length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-blue-800 text-sm font-medium mb-1">
                    💡 Smart Suggestions
                  </div>
                  <div className="text-blue-700 text-xs">
                    We've suggested typical amounts based on your income and location - adjust to match your situation
                  </div>
                </div>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-6 mt-6">
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
                      placeholder={smartDefaults.groceries ? `${smartDefaults.groceries} (suggested)` : "0.00"}
                      className={`w-full pl-7 pr-3 py-3 border-2 rounded-lg focus:outline-none ${
                        expenseWarnings.groceries 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-blue-500'
                      }`}
                    />
                  </div>
                  {expenseWarnings.groceries && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start">
                        <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="text-sm">
                          <div className="text-yellow-800 font-medium">
                            {expenseWarnings.groceries.message}
                          </div>
                          <div className="text-yellow-700 mt-1">
                            This is {expenseWarnings.groceries.percentage}% of your monthly income 
                            (${expenseWarnings.groceries.monthlyIncome.toLocaleString()}).
                          </div>
                          <div className="text-yellow-600 text-xs mt-1">
                            For a ${Math.round(expenseWarnings.groceries.monthlyIncome * 12 / 1000)}k income, 
                            monthly groceries over ${Math.round(expenseWarnings.groceries.monthlyIncome * 0.25).toLocaleString()} 
                            should be double-checked.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
                      placeholder={smartDefaults.utilities ? `${smartDefaults.utilities} (suggested)` : "0.00"}
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
                      placeholder={smartDefaults.transportation ? `${smartDefaults.transportation} (suggested)` : "0.00"}
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
                      placeholder={smartDefaults.insurance ? `${smartDefaults.insurance} (suggested)` : "0.00"}
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
                      placeholder={smartDefaults.subscriptions ? `${smartDefaults.subscriptions} (suggested)` : "0.00"}
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

              {/* Running Total Display */}
              <div className="col-span-full mt-6 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Total monthly essentials:</div>
                  <div className="text-2xl font-bold text-blue-600">
                    ${totalExpenses.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Updates automatically as you fill in each field
                  </div>
                </div>
              </div>

              {/* Clean Numbers Button */}
              <div className="col-span-full text-center mt-4">
                <button
                  onClick={cleanExpenseValues}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  🔧 Clean up decimal places
                </button>
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

            {freedomRatio.error || freedomRatio.monthlyIncome === 0 ? (
              <div className="text-center p-6">
                <div className="text-gray-500 mb-2">⚙️ Calculating...</div>
                <p className="text-sm text-gray-600">
                  We're still gathering your income information from the previous step.
                </p>
              </div>
            ) : (
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
                        {isNaN(freedomRatio.percentage) ? '0' : Math.round(freedomRatio.percentage)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!(freedomRatio.error || freedomRatio.monthlyIncome === 0) && (
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="text-center">
                  <div className="font-medium text-gray-700">Monthly Income</div>
                  <div className="text-lg font-bold text-blue-600">
                    {formatCurrency(isNaN(freedomRatio.monthlyIncome) ? 0 : freedomRatio.monthlyIncome)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-700">Freedom Amount</div>
                  <div className={`text-lg font-bold ${freedomRatio.isHealthy ? 'text-green-600' : 'text-yellow-600'}`}>
                    {formatCurrency(isNaN(freedomRatio.freedomAmount) ? 0 : freedomRatio.freedomAmount)}
                  </div>
                </div>
              </div>
            )}

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
            disabled={totalExpenses <= 0 || isProcessing}
            className="bg-blue-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white inline mr-2"></div>
                {loadingMessage || 'Processing...'}
              </>
            ) : (
              <>
                See My Complete Picture
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </>
            )}
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
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">{debt.name}</div>
                          <div className="text-sm text-gray-600">{category.title}</div>
                          {(() => {
                            const monthsToPayoff = debt.currentBalance > 0 && debt.monthlyPayment > 0 ? 
                              Math.ceil(debt.currentBalance / debt.monthlyPayment) : 0;
                            const yearsToPayoff = monthsToPayoff > 0 ? Math.round(monthsToPayoff / 12 * 10) / 10 : 0;
                            
                            if (yearsToPayoff > 0) {
                              return (
                                <div className="text-xs text-green-600 font-medium mt-1">
                                  ⏰ Disappears in ~{yearsToPayoff} years
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-bold text-lg text-gray-800">
                          {formatCurrency(debt.currentBalance)}
                        </div>
                        <div className="text-sm text-blue-600 font-medium">
                          -{formatCurrency(debt.monthlyPayment)}/month
                        </div>
                        <div className="text-xs text-gray-500">
                          (shrinking every month)
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Encouraging Totals with Reframing */}
            <div className="border-t pt-4">
              {(() => {
                const totalDebt = debts.reduce((sum, debt) => sum + debt.currentBalance, 0);
                const totalPayments = debts.reduce((sum, debt) => sum + debt.monthlyPayment, 0);
                
                // Calculate estimated payoff time for encouraging messaging
                const estimatedMonths = totalDebt > 0 && totalPayments > 0 ? 
                  Math.ceil(totalDebt / totalPayments) : 0;
                const estimatedYears = Math.round(estimatedMonths / 12 * 10) / 10;
                
                return (
                  <>
                    <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
                      <div className="text-center">
                        <h4 className="font-bold text-blue-800 mb-2">💪 This Isn't a Life Sentence</h4>
                        <p className="text-blue-700 text-sm leading-relaxed">
                          What you're looking at isn't permanent debt—it's a <strong>temporary obligation</strong> with a clear end date. 
                          Every month you pay brings you closer to complete financial freedom.
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-lg">
                        <span className="font-semibold text-gray-700">Temporary obligation:</span>
                        <div className="text-right">
                          <span className="font-bold text-gray-800">{formatCurrency(totalDebt)}</span>
                          {estimatedYears > 0 && (
                            <div className="text-sm text-green-600 font-medium">
                              (gone in ~{estimatedYears} years)
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center text-lg">
                        <span className="font-semibold text-blue-700">Monthly progress toward freedom:</span>
                        <span className="font-bold text-blue-600">{formatCurrency(totalPayments)}</span>
                      </div>
                      
                      {estimatedYears > 0 && (
                        <div className="bg-green-50 rounded-lg p-3 border border-green-200 mt-4">
                          <div className="flex items-center text-green-800">
                            <span className="text-lg mr-2">🎯</span>
                            <div>
                              <div className="font-semibold">This is a solved problem!</div>
                              <div className="text-sm text-green-700">
                                You're approximately {estimatedYears} years away from complete debt freedom. 
                                That's not "forever"—that's a specific, achievable timeline.
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {totalPayments > 0 && (
                        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200 mt-3">
                          <div className="text-center">
                            <div className="font-semibold text-purple-800 mb-1">
                              🚀 Freedom Preview
                            </div>
                            <div className="text-sm text-purple-700">
                              When this temporary obligation ends, you'll have <strong>{formatCurrency(totalPayments)} extra every month</strong> to 
                              invest in your dreams. That's <strong>{formatCurrency(totalPayments * 12)} per year</strong> toward your Someday Life!
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
          



          {/* Debt Optimization Display */}
          {debts.length > 0 && (
            <DebtOptimizationDisplay 
              debts={debts}
              dreamGoal={financialProfile?.northStarDream || {
                title: 'Your Someday Life',
                estimatedCost: 150000 // Default dream cost estimate
              }}
              userAge={financialProfile?.userProfile?.age || 30}
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 relative">
      {/* Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-sm mx-4 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-800">{loadingMessage}</p>
            <p className="text-sm text-gray-600 mt-2">This may take a moment...</p>
          </div>
        </div>
      )}
      
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
