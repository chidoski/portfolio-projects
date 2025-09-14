/**
 * Financial Profile Model
 * Defines the complete data structure for a user's financial life
 * Includes interfaces for user profile, obligations, expenses, assets, and dreams
 */

/**
 * User Profile Interface
 * Basic demographic and personal information
 */
export class UserProfile {
  constructor({
    id = null,
    firstName = '',
    lastName = '',
    email = '',
    dateOfBirth = null,
    age = null,
    location = {
      city: '',
      state: '',
      country: 'US',
      zipCode: '',
      costOfLivingIndex: 100 // Base 100, higher = more expensive
    },
    income = {
      gross: {
        annual: 0,
        monthly: 0,
        biweekly: 0,
        weekly: 0,
        hourly: 0
      },
      net: {
        annual: 0,
        monthly: 0,
        biweekly: 0,
        weekly: 0
      },
      sources: [], // Array of income sources
      taxRate: 0.22, // Estimated effective tax rate
      lastUpdated: new Date().toISOString()
    },
    employment = {
      status: 'employed', // employed, self-employed, unemployed, retired, student
      employer: '',
      position: '',
      startDate: null,
      industry: '',
      jobSecurity: 'stable' // stable, uncertain, high-risk
    },
    dependents = {
      count: 0,
      children: [],
      elderCare: false
    },
    createdAt = new Date().toISOString(),
    lastUpdated = new Date().toISOString()
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.dateOfBirth = dateOfBirth;
    this.age = age || this.calculateAge(dateOfBirth);
    this.location = location;
    this.income = income;
    this.employment = employment;
    this.dependents = dependents;
    this.createdAt = createdAt;
    this.lastUpdated = lastUpdated;
  }

  calculateAge(dateOfBirth) {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  getFullName() {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  getMonthlyGrossIncome() {
    return this.income.gross.monthly || (this.income.gross.annual / 12);
  }

  getMonthlyNetIncome() {
    return this.income.net.monthly || (this.getMonthlyGrossIncome() * (1 - this.income.taxRate));
  }
}

/**
 * Financial Obligations Interface
 * Debts, loans, and other financial commitments
 */
export class FinancialObligations {
  constructor({
    debts = [],
    totalDebtAmount = 0,
    totalMonthlyPayments = 0,
    debtToIncomeRatio = 0,
    lastUpdated = new Date().toISOString()
  } = {}) {
    this.debts = debts.map(debt => new Debt(debt));
    this.totalDebtAmount = totalDebtAmount || this.calculateTotalDebt();
    this.totalMonthlyPayments = totalMonthlyPayments || this.calculateTotalMonthlyPayments();
    this.debtToIncomeRatio = debtToIncomeRatio;
    this.lastUpdated = lastUpdated;
  }

  calculateTotalDebt() {
    return this.debts.reduce((total, debt) => total + debt.currentBalance, 0);
  }

  calculateTotalMonthlyPayments() {
    return this.debts.reduce((total, debt) => total + debt.monthlyPayment, 0);
  }

  addDebt(debtData) {
    const debt = new Debt(debtData);
    this.debts.push(debt);
    this.updateTotals();
    return debt;
  }

  removeDebt(debtId) {
    this.debts = this.debts.filter(debt => debt.id !== debtId);
    this.updateTotals();
  }

  updateTotals() {
    this.totalDebtAmount = this.calculateTotalDebt();
    this.totalMonthlyPayments = this.calculateTotalMonthlyPayments();
    this.lastUpdated = new Date().toISOString();
  }

  getHighestInterestDebts() {
    return [...this.debts].sort((a, b) => b.interestRate - a.interestRate);
  }

  getSmallestBalanceDebts() {
    return [...this.debts].sort((a, b) => a.currentBalance - b.currentBalance);
  }
}

/**
 * Individual Debt Class
 */
export class Debt {
  constructor({
    id = null,
    name = '',
    type = 'credit_card', // credit_card, student_loan, auto_loan, mortgage, personal_loan, other
    creditor = '',
    originalAmount = 0,
    currentBalance = 0,
    interestRate = 0, // Annual percentage rate
    monthlyPayment = 0,
    minimumPayment = 0,
    paymentDueDate = null, // Day of month (1-31)
    termMonths = null, // Original loan term in months
    remainingMonths = null,
    isSecured = false,
    collateral = '', // For secured debts
    priority = 'medium', // high, medium, low
    status = 'active', // active, paid_off, delinquent, in_collections
    notes = '',
    createdAt = new Date().toISOString(),
    lastUpdated = new Date().toISOString()
  } = {}) {
    this.id = id || this.generateId();
    this.name = name;
    this.type = type;
    this.creditor = creditor;
    this.originalAmount = originalAmount;
    this.currentBalance = currentBalance;
    this.interestRate = interestRate;
    this.monthlyPayment = monthlyPayment;
    this.minimumPayment = minimumPayment;
    this.paymentDueDate = paymentDueDate;
    this.termMonths = termMonths;
    this.remainingMonths = remainingMonths || this.calculateRemainingMonths();
    this.isSecured = isSecured;
    this.collateral = collateral;
    this.priority = priority;
    this.status = status;
    this.notes = notes;
    this.createdAt = createdAt;
    this.lastUpdated = lastUpdated;
  }

  generateId() {
    return `debt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  calculateRemainingMonths() {
    if (this.monthlyPayment <= 0 || this.currentBalance <= 0) return 0;
    
    const monthlyInterestRate = this.interestRate / 100 / 12;
    if (monthlyInterestRate === 0) {
      return Math.ceil(this.currentBalance / this.monthlyPayment);
    }
    
    // Calculate using amortization formula
    const numerator = Math.log(1 + (this.currentBalance * monthlyInterestRate) / this.monthlyPayment);
    const denominator = Math.log(1 + monthlyInterestRate);
    return Math.ceil(numerator / denominator);
  }

  calculatePayoffDate() {
    const remainingMonths = this.calculateRemainingMonths();
    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + remainingMonths);
    return payoffDate.toISOString().split('T')[0];
  }

  calculateTotalInterest() {
    const remainingMonths = this.calculateRemainingMonths();
    return Math.max(0, (this.monthlyPayment * remainingMonths) - this.currentBalance);
  }

  getDebtUtilizationRatio(creditLimit = null) {
    if (!creditLimit || this.type !== 'credit_card') return null;
    return (this.currentBalance / creditLimit) * 100;
  }
}

/**
 * Fixed Expenses Interface
 * Regular monthly expenses that don't change much
 */
export class FixedExpenses {
  constructor({
    housing = {
      rent: 0,
      mortgage: 0,
      propertyTax: 0,
      homeInsurance: 0,
      hoaFees: 0,
      utilities: {
        electricity: 0,
        gas: 0,
        water: 0,
        internet: 0,
        cable: 0,
        phone: 0,
        trash: 0
      },
      maintenance: 0,
      total: 0
    },
    insurance = {
      health: 0,
      dental: 0,
      vision: 0,
      life: 0,
      disability: 0,
      auto: 0,
      renters: 0,
      umbrella: 0,
      total: 0
    },
    transportation = {
      carPayment: 0,
      gasoline: 0,
      maintenance: 0,
      registration: 0,
      parking: 0,
      publicTransit: 0,
      rideshare: 0,
      total: 0
    },
    subscriptions = {
      streaming: 0,
      music: 0,
      software: 0,
      gym: 0,
      magazines: 0,
      other: 0,
      total: 0
    },
    childcare = {
      daycare: 0,
      babysitting: 0,
      afterSchool: 0,
      activities: 0,
      total: 0
    },
    other = {
      alimony: 0,
      childSupport: 0,
      elderCare: 0,
      petCare: 0,
      total: 0
    },
    totalFixedExpenses = 0,
    lastUpdated = new Date().toISOString()
  } = {}) {
    this.housing = housing;
    this.insurance = insurance;
    this.transportation = transportation;
    this.subscriptions = subscriptions;
    this.childcare = childcare;
    this.other = other;
    this.totalFixedExpenses = totalFixedExpenses || this.calculateTotalExpenses();
    this.lastUpdated = lastUpdated;
  }

  calculateTotalExpenses() {
    const categories = [this.housing, this.insurance, this.transportation, 
                      this.subscriptions, this.childcare, this.other];
    
    // Calculate totals for each category
    categories.forEach(category => {
      if (category.total === undefined || category.total === 0) {
        category.total = Object.entries(category)
          .filter(([key]) => key !== 'total')
          .reduce((sum, [, value]) => {
            if (typeof value === 'object') {
              return sum + Object.values(value).reduce((subSum, subValue) => 
                subSum + (typeof subValue === 'number' ? subValue : 0), 0);
            }
            return sum + (typeof value === 'number' ? value : 0);
          }, 0);
      }
    });

    return categories.reduce((total, category) => total + category.total, 0);
  }

  getHousingRatio(monthlyIncome) {
    return monthlyIncome > 0 ? (this.housing.total / monthlyIncome) * 100 : 0;
  }

  getExpensesByCategory() {
    return {
      housing: this.housing.total,
      insurance: this.insurance.total,
      transportation: this.transportation.total,
      subscriptions: this.subscriptions.total,
      childcare: this.childcare.total,
      other: this.other.total
    };
  }
}

/**
 * Current Assets Interface
 * Savings, investments, and property owned
 */
export class CurrentAssets {
  constructor({
    liquid = {
      checking: 0,
      savings: 0,
      moneyMarket: 0,
      cashOnHand: 0,
      total: 0
    },
    investments = {
      retirement401k: 0,
      retirementIRA: 0,
      retirementRoth: 0,
      brokerage: 0,
      stocks: 0,
      bonds: 0,
      mutualFunds: 0,
      etfs: 0,
      crypto: 0,
      commodities: 0,
      total: 0
    },
    realEstate = {
      primaryHome: {
        currentValue: 0,
        mortgageBalance: 0,
        equity: 0
      },
      rentalProperties: [],
      land: 0,
      total: 0
    },
    personal = {
      vehicles: [],
      jewelry: 0,
      art: 0,
      collectibles: 0,
      electronics: 0,
      furniture: 0,
      other: 0,
      total: 0
    },
    business = {
      businessValue: 0,
      businessAssets: 0,
      total: 0
    },
    totalAssets = 0,
    netWorth = 0,
    lastUpdated = new Date().toISOString()
  } = {}) {
    this.liquid = liquid;
    this.investments = investments;
    this.realEstate = realEstate;
    this.personal = personal;
    this.business = business;
    this.totalAssets = totalAssets || this.calculateTotalAssets();
    this.netWorth = netWorth;
    this.lastUpdated = lastUpdated;
  }

  calculateTotalAssets() {
    const categories = [this.liquid, this.investments, this.realEstate, 
                      this.personal, this.business];
    
    // Calculate totals for each category
    categories.forEach(category => {
      if (category.total === undefined || category.total === 0) {
        category.total = Object.entries(category)
          .filter(([key]) => key !== 'total')
          .reduce((sum, [, value]) => {
            if (typeof value === 'object' && !Array.isArray(value)) {
              return sum + Object.values(value).reduce((subSum, subValue) => 
                subSum + (typeof subValue === 'number' ? subValue : 0), 0);
            } else if (Array.isArray(value)) {
              return sum + value.reduce((subSum, item) => 
                subSum + (typeof item.value === 'number' ? item.value : 0), 0);
            }
            return sum + (typeof value === 'number' ? value : 0);
          }, 0);
      }
    });

    return categories.reduce((total, category) => total + category.total, 0);
  }

  calculateNetWorth(totalDebt = 0) {
    this.netWorth = this.totalAssets - totalDebt;
    return this.netWorth;
  }

  getEmergencyFundMonths(monthlyExpenses) {
    return monthlyExpenses > 0 ? this.liquid.total / monthlyExpenses : 0;
  }

  getAssetAllocation() {
    const total = this.totalAssets;
    if (total === 0) return {};
    
    return {
      liquid: (this.liquid.total / total) * 100,
      investments: (this.investments.total / total) * 100,
      realEstate: (this.realEstate.total / total) * 100,
      personal: (this.personal.total / total) * 100,
      business: (this.business.total / total) * 100
    };
  }
}

/**
 * North Star Dream Interface
 * Ultimate financial goal and retirement planning
 */
export class NorthStarDream {
  constructor({
    id = null,
    title = 'Financial Independence',
    description = '',
    type = 'retirement', // retirement, early_retirement, financial_independence, lifestyle_change
    targetAge = 65,
    currentAge = 30,
    yearsToGoal = null,
    
    // Financial targets
    targetNetWorth = 0,
    targetAnnualIncome = 0,
    targetMonthlyIncome = 0,
    
    // Lifestyle costs
    monthlyLivingExpenses = 0,
    annualLivingExpenses = 0,
    healthcareCosts = 0,
    travelBudget = 0,
    hobbiesBudget = 0,
    
    // Property goals
    primaryResidence = {
      targetValue: 0,
      downPaymentNeeded: 0,
      location: '',
      type: 'house', // house, condo, townhouse, other
      desiredFeatures: []
    },
    
    // Investment strategy
    investmentStrategy = {
      riskTolerance: 'moderate', // conservative, moderate, aggressive
      expectedReturn: 0.07, // 7% annual return
      inflationRate: 0.03, // 3% inflation
      withdrawalRate: 0.04, // 4% safe withdrawal rate
      assetAllocation: {
        stocks: 70,
        bonds: 20,
        realEstate: 5,
        cash: 5
      }
    },
    
    // Milestones and progress
    milestones = [],
    currentProgress = 0, // Percentage (0-100)
    
    // Metadata
    priority = 'high',
    status = 'planning', // planning, active, on_track, behind, achieved
    notes = '',
    createdAt = new Date().toISOString(),
    lastUpdated = new Date().toISOString()
  } = {}) {
    this.id = id || this.generateId();
    this.title = title;
    this.description = description;
    this.type = type;
    this.targetAge = targetAge;
    this.currentAge = currentAge;
    this.yearsToGoal = yearsToGoal || (targetAge - currentAge);
    this.targetNetWorth = targetNetWorth;
    this.targetAnnualIncome = targetAnnualIncome;
    this.targetMonthlyIncome = targetMonthlyIncome || (targetAnnualIncome / 12);
    this.monthlyLivingExpenses = monthlyLivingExpenses;
    this.annualLivingExpenses = annualLivingExpenses || (monthlyLivingExpenses * 12);
    this.healthcareCosts = healthcareCosts;
    this.travelBudget = travelBudget;
    this.hobbiesBudget = hobbiesBudget;
    this.primaryResidence = primaryResidence;
    this.investmentStrategy = investmentStrategy;
    this.milestones = milestones;
    this.currentProgress = currentProgress;
    this.priority = priority;
    this.status = status;
    this.notes = notes;
    this.createdAt = createdAt;
    this.lastUpdated = lastUpdated;
  }

  generateId() {
    return `northstar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  calculateRequiredNetWorth() {
    if (this.annualLivingExpenses > 0) {
      // Use 25x annual expenses rule (4% withdrawal rate)
      return this.annualLivingExpenses / this.investmentStrategy.withdrawalRate;
    }
    return this.targetNetWorth;
  }

  calculateMonthlySavingsNeeded(currentNetWorth = 0) {
    const requiredNetWorth = this.calculateRequiredNetWorth();
    const gap = requiredNetWorth - currentNetWorth;
    
    if (gap <= 0 || this.yearsToGoal <= 0) return 0;
    
    // Future value of annuity formula to account for investment growth
    const monthlyRate = this.investmentStrategy.expectedReturn / 12;
    const months = this.yearsToGoal * 12;
    
    if (monthlyRate === 0) {
      return gap / months;
    }
    
    // PMT = FV * r / ((1 + r)^n - 1)
    const denominator = Math.pow(1 + monthlyRate, months) - 1;
    return gap * monthlyRate / denominator;
  }

  calculateProjectedNetWorth(currentNetWorth, monthlySavings) {
    const monthlyRate = this.investmentStrategy.expectedReturn / 12;
    const months = this.yearsToGoal * 12;
    
    // Future value of current assets
    const futureValueCurrent = currentNetWorth * Math.pow(1 + monthlyRate, months);
    
    // Future value of monthly savings (annuity)
    let futureValueSavings = 0;
    if (monthlyRate > 0) {
      futureValueSavings = monthlySavings * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    } else {
      futureValueSavings = monthlySavings * months;
    }
    
    return futureValueCurrent + futureValueSavings;
  }

  getTimelineToGoal() {
    return {
      years: this.yearsToGoal,
      months: this.yearsToGoal * 12,
      targetDate: new Date(new Date().getFullYear() + this.yearsToGoal, new Date().getMonth(), new Date().getDate()).toISOString().split('T')[0]
    };
  }
}

/**
 * Complete Financial Profile Class
 * Combines all financial components into a single profile
 */
export class FinancialProfile {
  constructor({
    userProfile = new UserProfile(),
    financialObligations = new FinancialObligations(),
    fixedExpenses = new FixedExpenses(),
    currentAssets = new CurrentAssets(),
    northStarDream = new NorthStarDream(),
    variableExpenses = {
      food: 0,
      entertainment: 0,
      shopping: 0,
      healthcare: 0,
      travel: 0,
      education: 0,
      gifts: 0,
      miscellaneous: 0,
      total: 0
    },
    lastUpdated = new Date().toISOString()
  } = {}) {
    this.userProfile = userProfile instanceof UserProfile ? userProfile : new UserProfile(userProfile);
    this.financialObligations = financialObligations instanceof FinancialObligations ? 
      financialObligations : new FinancialObligations(financialObligations);
    this.fixedExpenses = fixedExpenses instanceof FixedExpenses ? 
      fixedExpenses : new FixedExpenses(fixedExpenses);
    this.currentAssets = currentAssets instanceof CurrentAssets ? 
      currentAssets : new CurrentAssets(currentAssets);
    this.northStarDream = northStarDream instanceof NorthStarDream ? 
      northStarDream : new NorthStarDream(northStarDream);
    this.variableExpenses = variableExpenses;
    this.lastUpdated = lastUpdated;
    
    // Calculate derived values
    this.updateCalculatedFields();
  }

  updateCalculatedFields() {
    // Update variable expenses total
    this.variableExpenses.total = Object.entries(this.variableExpenses)
      .filter(([key]) => key !== 'total')
      .reduce((sum, [, value]) => sum + (typeof value === 'number' ? value : 0), 0);
    
    // Update asset and obligation totals
    this.currentAssets.calculateTotalAssets();
    this.financialObligations.updateTotals();
    this.fixedExpenses.calculateTotalExpenses();
    
    // Calculate net worth
    this.currentAssets.calculateNetWorth(this.financialObligations.totalDebtAmount);
    
    // Update debt-to-income ratio
    const monthlyIncome = this.userProfile.getMonthlyNetIncome();
    if (monthlyIncome > 0) {
      this.financialObligations.debtToIncomeRatio = 
        (this.financialObligations.totalMonthlyPayments / monthlyIncome) * 100;
    }
    
    this.lastUpdated = new Date().toISOString();
  }

  /**
   * Calculate monthly disposable income
   * @returns {number} Amount available after all fixed expenses and debt payments
   */
  calculateDisposableIncome() {
    const monthlyIncome = this.userProfile.getMonthlyNetIncome();
    const fixedExpenses = this.fixedExpenses.totalFixedExpenses;
    const debtPayments = this.financialObligations.totalMonthlyPayments;
    const variableExpenses = this.variableExpenses.total;
    
    return monthlyIncome - fixedExpenses - debtPayments - variableExpenses;
  }

  /**
   * Calculate debt payoff timeline using different strategies
   * @param {string} strategy - 'avalanche' (highest interest first) or 'snowball' (smallest balance first)
   * @param {number} extraPayment - Additional monthly payment to apply
   * @returns {Object} Payoff timeline and total interest saved
   */
  calculateDebtPayoffTimeline(strategy = 'avalanche', extraPayment = 0) {
    const debts = [...this.financialObligations.debts].filter(debt => debt.status === 'active');
    
    if (debts.length === 0) {
      return {
        strategy,
        totalMonths: 0,
        totalInterest: 0,
        payoffOrder: [],
        monthlyPayments: [],
        payoffDate: new Date().toISOString().split('T')[0]
      };
    }

    // Sort debts based on strategy
    const sortedDebts = strategy === 'avalanche' 
      ? debts.sort((a, b) => b.interestRate - a.interestRate)
      : debts.sort((a, b) => a.currentBalance - b.currentBalance);

    const payoffSchedule = [];
    let totalInterestPaid = 0;
    let currentMonth = 0;
    let remainingExtraPayment = extraPayment;

    // Create working copies of debts
    const workingDebts = sortedDebts.map(debt => ({
      ...debt,
      remainingBalance: debt.currentBalance
    }));

    while (workingDebts.some(debt => debt.remainingBalance > 0)) {
      currentMonth++;
      let monthlyInterest = 0;
      
      // Apply minimum payments to all debts
      workingDebts.forEach(debt => {
        if (debt.remainingBalance > 0) {
          const monthlyInterestRate = debt.interestRate / 100 / 12;
          const interestPayment = debt.remainingBalance * monthlyInterestRate;
          const principalPayment = Math.min(
            debt.monthlyPayment - interestPayment,
            debt.remainingBalance
          );
          
          debt.remainingBalance -= principalPayment;
          monthlyInterest += interestPayment;
          
          if (debt.remainingBalance < 0) debt.remainingBalance = 0;
        }
      });

      // Apply extra payment to the first debt with balance (based on strategy)
      if (remainingExtraPayment > 0) {
        const targetDebt = workingDebts.find(debt => debt.remainingBalance > 0);
        if (targetDebt) {
          const extraApplied = Math.min(remainingExtraPayment, targetDebt.remainingBalance);
          targetDebt.remainingBalance -= extraApplied;
        }
      }

      totalInterestPaid += monthlyInterest;

      // Record any debts paid off this month
      workingDebts.forEach(debt => {
        if (debt.remainingBalance === 0 && !debt.paidOffMonth) {
          debt.paidOffMonth = currentMonth;
          payoffSchedule.push({
            debtName: debt.name,
            month: currentMonth,
            originalBalance: debt.currentBalance,
            totalInterestPaid: debt.calculateTotalInterest()
          });
        }
      });

      // Safety check to prevent infinite loops
      if (currentMonth > 600) break; // 50 years max
    }

    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + currentMonth);

    return {
      strategy,
      totalMonths: currentMonth,
      totalInterest: Math.round(totalInterestPaid * 100) / 100,
      payoffOrder: payoffSchedule,
      payoffDate: payoffDate.toISOString().split('T')[0],
      interestSaved: extraPayment > 0 ? this.calculateInterestSaved(extraPayment) : 0
    };
  }

  calculateInterestSaved(extraPayment) {
    const normalPayoff = this.calculateDebtPayoffTimeline('avalanche', 0);
    const acceleratedPayoff = this.calculateDebtPayoffTimeline('avalanche', extraPayment);
    return normalPayoff.totalInterest - acceleratedPayoff.totalInterest;
  }

  /**
   * Get financial health score (0-100)
   * @returns {Object} Score and breakdown by category
   */
  getFinancialHealthScore() {
    const scores = {};
    
    // Emergency Fund Score (0-25 points)
    const emergencyMonths = this.currentAssets.getEmergencyFundMonths(
      this.fixedExpenses.totalFixedExpenses + this.variableExpenses.total
    );
    scores.emergencyFund = Math.min(25, emergencyMonths * 4.17); // 6 months = 25 points

    // Debt-to-Income Score (0-25 points)
    const dtiRatio = this.financialObligations.debtToIncomeRatio;
    scores.debtToIncome = Math.max(0, 25 - (dtiRatio * 0.625)); // 40% DTI = 0 points

    // Savings Rate Score (0-25 points)
    const disposableIncome = this.calculateDisposableIncome();
    const monthlyIncome = this.userProfile.getMonthlyNetIncome();
    const savingsRate = monthlyIncome > 0 ? (disposableIncome / monthlyIncome) * 100 : 0;
    scores.savingsRate = Math.min(25, savingsRate * 1.25); // 20% savings rate = 25 points

    // Net Worth Growth Score (0-25 points)
    const netWorthToIncome = monthlyIncome > 0 ? 
      this.currentAssets.netWorth / (monthlyIncome * 12) : 0;
    scores.netWorthGrowth = Math.min(25, netWorthToIncome * 2.5); // 10x annual income = 25 points

    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

    return {
      totalScore: Math.round(totalScore),
      breakdown: scores,
      grade: this.getGradeFromScore(totalScore),
      recommendations: this.getRecommendations(scores)
    };
  }

  getGradeFromScore(score) {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'B-';
    if (score >= 60) return 'C+';
    if (score >= 55) return 'C';
    if (score >= 50) return 'C-';
    if (score >= 45) return 'D+';
    if (score >= 40) return 'D';
    return 'F';
  }

  getRecommendations(scores) {
    const recommendations = [];

    if (scores.emergencyFund < 15) {
      recommendations.push({
        category: 'Emergency Fund',
        priority: 'high',
        message: 'Build your emergency fund to cover 3-6 months of expenses'
      });
    }

    if (scores.debtToIncome < 15) {
      recommendations.push({
        category: 'Debt Management',
        priority: 'high',
        message: 'Focus on reducing debt payments to below 36% of income'
      });
    }

    if (scores.savingsRate < 15) {
      recommendations.push({
        category: 'Savings Rate',
        priority: 'medium',
        message: 'Increase your savings rate to at least 15% of income'
      });
    }

    if (scores.netWorthGrowth < 10) {
      recommendations.push({
        category: 'Wealth Building',
        priority: 'medium',
        message: 'Focus on building assets and increasing net worth'
      });
    }

    return recommendations;
  }

  /**
   * Export profile data for storage or API calls
   * @returns {Object} Serializable profile data
   */
  toJSON() {
    return {
      userProfile: this.userProfile,
      financialObligations: this.financialObligations,
      fixedExpenses: this.fixedExpenses,
      currentAssets: this.currentAssets,
      northStarDream: this.northStarDream,
      variableExpenses: this.variableExpenses,
      lastUpdated: this.lastUpdated
    };
  }

  /**
   * Create profile from JSON data
   * @param {Object} data - Profile data
   * @returns {FinancialProfile} New profile instance
   */
  static fromJSON(data) {
    return new FinancialProfile(data);
  }
}

// Validation functions
export const ValidationHelpers = {
  /**
   * Validate user profile data
   * @param {Object} profile - User profile data
   * @returns {Object} Validation result with errors array
   */
  validateUserProfile(profile) {
    const errors = [];
    
    if (!profile.firstName || profile.firstName.trim().length === 0) {
      errors.push('First name is required');
    }
    
    if (!profile.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      errors.push('Valid email address is required');
    }
    
    if (profile.age && (profile.age < 16 || profile.age > 120)) {
      errors.push('Age must be between 16 and 120');
    }
    
    if (profile.income.gross.annual < 0) {
      errors.push('Income cannot be negative');
    }
    
    return { isValid: errors.length === 0, errors };
  },

  /**
   * Validate debt data
   * @param {Object} debt - Debt data
   * @returns {Object} Validation result with errors array
   */
  validateDebt(debt) {
    const errors = [];
    
    if (!debt.name || debt.name.trim().length === 0) {
      errors.push('Debt name is required');
    }
    
    if (debt.currentBalance < 0) {
      errors.push('Current balance cannot be negative');
    }
    
    if (debt.interestRate < 0 || debt.interestRate > 100) {
      errors.push('Interest rate must be between 0 and 100');
    }
    
    if (debt.monthlyPayment < 0) {
      errors.push('Monthly payment cannot be negative');
    }
    
    return { isValid: errors.length === 0, errors };
  },

  /**
   * Validate financial profile completeness
   * @param {FinancialProfile} profile - Complete financial profile
   * @returns {Object} Validation result with completeness score
   */
  validateProfileCompleteness(profile) {
    const checks = {
      hasUserInfo: !!(profile.userProfile.firstName && profile.userProfile.email),
      hasIncome: profile.userProfile.getMonthlyNetIncome() > 0,
      hasExpenses: profile.fixedExpenses.totalFixedExpenses > 0,
      hasAssets: profile.currentAssets.totalAssets > 0,
      hasGoals: !!(profile.northStarDream.title && profile.northStarDream.targetAge)
    };
    
    const completedChecks = Object.values(checks).filter(Boolean).length;
    const completenessScore = (completedChecks / Object.keys(checks).length) * 100;
    
    return {
      completenessScore: Math.round(completenessScore),
      checks,
      isComplete: completenessScore === 100
    };
  }
};

// Utility functions for financial calculations
export const FinancialCalculators = {
  /**
   * Calculate compound interest
   * @param {number} principal - Initial amount
   * @param {number} rate - Annual interest rate (decimal)
   * @param {number} time - Time in years
   * @param {number} compoundingFrequency - Times compounded per year
   * @returns {number} Final amount
   */
  compoundInterest(principal, rate, time, compoundingFrequency = 12) {
    return principal * Math.pow(1 + rate / compoundingFrequency, compoundingFrequency * time);
  },

  /**
   * Calculate future value of regular payments (annuity)
   * @param {number} payment - Regular payment amount
   * @param {number} rate - Annual interest rate (decimal)
   * @param {number} periods - Number of payment periods
   * @returns {number} Future value
   */
  futureValueAnnuity(payment, rate, periods) {
    if (rate === 0) return payment * periods;
    return payment * ((Math.pow(1 + rate, periods) - 1) / rate);
  },

  /**
   * Calculate present value of future amount
   * @param {number} futureValue - Future amount
   * @param {number} rate - Discount rate (decimal)
   * @param {number} periods - Number of periods
   * @returns {number} Present value
   */
  presentValue(futureValue, rate, periods) {
    return futureValue / Math.pow(1 + rate, periods);
  },

  /**
   * Calculate loan payment amount
   * @param {number} principal - Loan amount
   * @param {number} rate - Monthly interest rate (decimal)
   * @param {number} periods - Number of payments
   * @returns {number} Monthly payment
   */
  loanPayment(principal, rate, periods) {
    if (rate === 0) return principal / periods;
    return principal * (rate * Math.pow(1 + rate, periods)) / (Math.pow(1 + rate, periods) - 1);
  }
};

// Export all classes and utilities
export default FinancialProfile;
