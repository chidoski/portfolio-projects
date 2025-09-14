/**
 * Demo Someday Life Profile
 * Sarah's Journey to Maine Cottage Life
 * Demonstrates complete three-bucket system with realistic timeline and milestones
 */

import { FinancialProfile, UserProfile, NorthStarDream, FinancialObligations, FixedExpenses, CurrentAssets } from '../models/FinancialProfile.js';

/**
 * Sarah's Complete Financial Profile
 * 32-year-old marketing manager dreaming of Maine cottage life
 */
export const sarahProfile = {
  // Basic Information
  userProfile: new UserProfile({
    id: 'sarah-demo-2024',
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah.chen@example.com',
    dateOfBirth: '1992-03-15',
    age: 32,
    location: {
      city: 'Boston',
      state: 'Massachusetts',
      country: 'US',
      zipCode: '02101',
      costOfLivingIndex: 125 // 25% above national average
    },
    income: {
      gross: {
        annual: 85000,
        monthly: 7083,
        biweekly: 3269,
        weekly: 1635,
        hourly: 41
      },
      net: {
        annual: 62900, // After taxes and deductions
        monthly: 5242,
        biweekly: 2419,
        weekly: 1210
      },
      sources: [
        { type: 'salary', amount: 85000, employer: 'Creative Marketing Solutions' },
        { type: 'freelance', amount: 8000, description: 'Design consulting' }
      ],
      taxRate: 0.26, // MA state + federal
      lastUpdated: new Date().toISOString()
    },
    employment: {
      status: 'employed',
      employer: 'Creative Marketing Solutions',
      position: 'Senior Marketing Manager',
      startDate: '2019-06-01',
      industry: 'Marketing & Advertising',
      jobSecurity: 'stable'
    },
    dependents: {
      count: 0,
      children: [],
      elderCare: false
    }
  }),

  // Current Financial Obligations
  financialObligations: new FinancialObligations({
    debts: [
      {
        id: 'student-loan-1',
        name: 'Graduate School Loan',
        type: 'student_loan',
        creditor: 'Federal Student Aid',
        originalAmount: 45000,
        currentBalance: 28500,
        interestRate: 4.5,
        monthlyPayment: 320,
        minimumPayment: 285,
        paymentDueDate: 15,
        termMonths: 120,
        remainingMonths: 89,
        priority: 'medium',
        status: 'active',
        notes: 'On track for forgiveness program'
      },
      {
        id: 'credit-card-1',
        name: 'Chase Sapphire',
        type: 'credit_card',
        creditor: 'Chase Bank',
        originalAmount: 8000,
        currentBalance: 3200,
        interestRate: 18.99,
        monthlyPayment: 180,
        minimumPayment: 85,
        paymentDueDate: 22,
        priority: 'high',
        status: 'active',
        notes: 'Paying above minimum to eliminate quickly'
      },
      {
        id: 'car-loan-1',
        name: '2021 Honda Civic',
        type: 'auto_loan',
        creditor: 'Honda Financial',
        originalAmount: 22000,
        currentBalance: 14800,
        interestRate: 3.2,
        monthlyPayment: 385,
        minimumPayment: 385,
        paymentDueDate: 8,
        termMonths: 60,
        remainingMonths: 38,
        isSecured: true,
        collateral: '2021 Honda Civic',
        priority: 'medium',
        status: 'active',
        notes: 'Reliable transportation for work'
      }
    ]
  }),

  // Fixed Monthly Expenses
  fixedExpenses: new FixedExpenses({
    housing: {
      rent: 1850, // Boston apartment
      propertyTax: 0,
      homeInsurance: 0,
      hoaFees: 0,
      utilities: {
        electricity: 85,
        gas: 45,
        water: 35,
        internet: 75,
        cable: 0, // Streaming only
        phone: 65,
        trash: 25
      },
      maintenance: 50, // Renter's maintenance fund
      total: 2230
    },
    insurance: {
      health: 180, // Employer contribution
      dental: 25,
      vision: 15,
      life: 35,
      disability: 45,
      auto: 125,
      renters: 18,
      umbrella: 0,
      total: 443
    },
    transportation: {
      carPayment: 385, // Included in debt above
      gasoline: 120,
      maintenance: 85,
      registration: 8,
      parking: 150, // Boston parking
      publicTransit: 90, // MBTA pass
      rideshare: 45,
      total: 883
    },
    subscriptions: {
      streaming: 35, // Netflix, Spotify
      music: 0, // Included above
      software: 25, // Adobe Creative Suite
      gym: 89,
      magazines: 12,
      other: 15, // Various apps
      total: 176
    },
    childcare: {
      daycare: 0,
      babysitting: 0,
      afterSchool: 0,
      activities: 0,
      total: 0
    },
    other: {
      alimony: 0,
      childSupport: 0,
      elderCare: 0,
      petCare: 0,
      total: 0
    }
  }),

  // Current Assets
  currentAssets: new CurrentAssets({
    liquid: {
      checking: 4500,
      savings: 18500,
      moneyMarket: 8000,
      cashOnHand: 500,
      total: 31500
    },
    investments: {
      retirement401k: 42000, // 5 years of contributions
      retirementIRA: 15000,
      retirementRoth: 8500,
      brokerage: 12000,
      stocks: 0, // Included in brokerage
      bonds: 0, // Included in brokerage
      mutualFunds: 0, // Included in brokerage
      etfs: 0, // Included in brokerage
      crypto: 2500,
      commodities: 0,
      total: 80000
    },
    realEstate: {
      primaryHome: {
        currentValue: 0,
        mortgageBalance: 0,
        equity: 0
      },
      rentalProperties: [],
      land: 0,
      total: 0
    },
    personal: {
      vehicles: [
        { name: '2021 Honda Civic', value: 18000, loan: 14800, equity: 3200 }
      ],
      jewelry: 2500,
      art: 1500, // Sarah's own artwork
      collectibles: 0,
      electronics: 3500,
      furniture: 8000,
      other: 1000,
      total: 16500
    },
    business: {
      businessValue: 0,
      businessAssets: 3000, // Art supplies and equipment
      total: 3000
    }
  }),

  // Someday Life Dream: Maine Cottage
  northStarDream: new NorthStarDream({
    id: 'maine-cottage-dream',
    title: 'Maine Cottage Art Studio Life',
    description: 'A charming cottage overlooking Casco Bay where I can paint every morning, teach art workshops to visitors, and live simply surrounded by natural beauty. My studio faces east to catch the morning light, and I have a small gallery space to showcase local artists. Evenings are spent reading by the fireplace or walking the rocky shore.',
    type: 'lifestyle_change',
    targetAge: 52,
    currentAge: 32,
    yearsToGoal: 20,
    
    // Financial targets
    targetNetWorth: 1200000, // Includes property + retirement fund
    targetAnnualIncome: 40000, // From workshops + art sales
    targetMonthlyIncome: 3333,
    
    // Lifestyle costs
    monthlyLivingExpenses: 3333, // $40K annually
    annualLivingExpenses: 40000,
    healthcareCosts: 8000, // Higher as self-employed
    travelBudget: 3000, // Modest travel
    hobbiesBudget: 2000, // Art supplies
    
    // Property goals
    primaryResidence: {
      targetValue: 450000,
      downPaymentNeeded: 90000, // 20% down
      location: 'Freeport, Maine',
      type: 'cottage',
      desiredFeatures: [
        'Ocean view',
        'Art studio space',
        'Workshop area for classes',
        'Garden for inspiration',
        'Walking distance to town',
        'Guest room for visitors'
      ]
    },
    
    // Investment strategy
    investmentStrategy: {
      riskTolerance: 'moderate',
      expectedReturn: 0.07,
      inflationRate: 0.03,
      withdrawalRate: 0.04,
      assetAllocation: {
        stocks: 65, // Slightly conservative for shorter timeline
        bonds: 25,
        realEstate: 5,
        cash: 5
      }
    },
    
    // Milestones (defined separately below)
    milestones: [],
    currentProgress: 15, // 15% toward goal
    
    priority: 'high',
    status: 'active',
    notes: 'Researching Maine coastal towns and art communities. Visited Freeport last summer and fell in love with the area.'
  })
};

/**
 * Sarah's Life Milestones Timeline
 * Major life events between now (32) and someday life (52)
 */
export const sarahMilestones = [
  {
    id: 'wedding-2026',
    name: 'Wedding Celebration',
    age: 34,
    targetDate: '2026-09-15',
    cost: 25000,
    description: 'Intimate wedding celebration with family and friends in a beautiful New England setting',
    category: 'family',
    icon: '💒',
    color: 'bg-pink-500',
    priority: 'high',
    flexibility: 'moderate',
    
    // Detailed breakdown
    costBreakdown: {
      venue: 8000,
      catering: 7500,
      photography: 3000,
      flowers: 1500,
      dress: 1200,
      rings: 2500,
      music: 1000,
      miscellaneous: 300
    },
    
    // Funding strategy
    fundingPlan: {
      currentSaved: 2500,
      monthlyTarget: 469, // $25K - $2.5K saved / 48 months
      bucketSource: 'life',
      onTrack: true
    },
    
    notes: 'Planning a fall wedding in Vermont. Keeping it intimate but memorable.',
    
    // Impact on other goals
    impact: {
      somedayDelay: 0, // No delay if funded from Life bucket
      incomeChange: 0.15, // Dual income benefit after marriage
      expenseChange: 0.10, // Modest increase in living expenses
      newMilestones: ['honeymoon-2026'] // Triggers honeymoon milestone
    }
  },

  {
    id: 'honeymoon-2026',
    name: 'European Honeymoon',
    age: 34,
    targetDate: '2026-10-01',
    cost: 8000,
    description: 'Two-week art and culture tour through Italy and France',
    category: 'travel',
    icon: '✈️',
    color: 'bg-blue-500',
    priority: 'medium',
    flexibility: 'high',
    
    costBreakdown: {
      flights: 2400,
      accommodations: 2800,
      food: 1500,
      activities: 800,
      transportation: 300,
      shopping: 200
    },
    
    fundingPlan: {
      currentSaved: 0,
      monthlyTarget: 167, // Combined with wedding savings
      bucketSource: 'life',
      onTrack: true
    },
    
    notes: 'Visiting art museums and taking painting classes in Tuscany',
    
    impact: {
      somedayDelay: 0,
      inspiration: 'High - will inform Maine cottage art studio design'
    }
  },

  {
    id: 'home-purchase-2028',
    name: 'First Home Purchase',
    age: 36,
    targetDate: '2028-06-01',
    cost: 75000, // Down payment + closing costs
    description: 'Purchase first home in Boston suburbs for stability before Maine move',
    category: 'housing',
    icon: '🏠',
    color: 'bg-green-500',
    priority: 'high',
    flexibility: 'low',
    
    costBreakdown: {
      downPayment: 60000, // 20% on $300K home
      closingCosts: 9000,
      inspection: 800,
      moving: 1200,
      immediate_repairs: 4000
    },
    
    fundingPlan: {
      currentSaved: 8000, // In money market
      monthlyTarget: 1396, // Over 4 years
      bucketSource: 'dream', // Temporary reallocation
      onTrack: true
    },
    
    notes: 'Building equity before Maine move. Will rent out when moving to Maine.',
    
    impact: {
      somedayDelay: 0, // Actually helps by building equity
      monthlyExpenseChange: -200, // Mortgage vs rent savings
      assetGrowth: 'Builds equity for Maine cottage down payment'
    }
  },

  {
    id: 'college-fund-start-2032',
    name: 'Kids College Fund Launch',
    age: 40,
    targetDate: '2032-01-01',
    cost: 200000, // Total needed by age 55
    description: 'Begin serious college savings for future children (2 kids assumed)',
    category: 'family',
    icon: '🎓',
    color: 'bg-purple-500',
    priority: 'high',
    flexibility: 'low',
    
    // This is a long-term goal starting at age 40
    fundingPlan: {
      totalNeeded: 200000,
      yearsToSave: 15, // Ages 40-55
      monthlyTarget: 889, // $200K over 15 years with 6% growth
      bucketSource: 'life',
      startAge: 40,
      endAge: 55
    },
    
    assumptions: {
      childrenCount: 2,
      costPerChild: 100000, // 2032 dollars
      inflationRate: 0.04, // Higher education inflation
      investmentReturn: 0.06 // Conservative 529 plan returns
    },
    
    notes: 'Starting college savings when first child is born. 529 plan with age-based portfolio.',
    
    impact: {
      somedayDelay: 0, // Planned into Life bucket
      bucketReallocation: 'Increases Life bucket allocation from 15% to 25%'
    }
  },

  {
    id: 'parents-care-support-2037',
    name: 'Parents Care Support',
    age: 45,
    targetDate: '2037-01-01',
    cost: 30000,
    description: 'Financial support for parents\' healthcare and assisted living needs',
    category: 'family',
    icon: '👥',
    color: 'bg-orange-500',
    priority: 'high',
    flexibility: 'low',
    
    costBreakdown: {
      assistedLiving: 18000, // Annual contribution
      healthcare: 8000, // Medical expenses not covered
      homeModifications: 4000 // One-time accessibility improvements
    },
    
    fundingPlan: {
      currentSaved: 0,
      monthlyTarget: 500, // Ongoing support
      bucketSource: 'life',
      duration: 'ongoing', // Until parents no longer need support
      onTrack: true
    },
    
    notes: 'Parents are currently healthy but planning ahead for their care needs.',
    
    impact: {
      somedayDelay: 0, // Planned expense
      emotionalValue: 'High - ensuring parents are well cared for',
      bucketImpact: 'Requires maintaining higher Life bucket allocation'
    }
  },

  {
    id: 'art-studio-equipment-2040',
    name: 'Professional Art Studio Setup',
    age: 48,
    targetDate: '2040-01-01',
    cost: 15000,
    description: 'Professional-grade art equipment and studio setup for Maine cottage',
    category: 'business',
    icon: '🎨',
    color: 'bg-indigo-500',
    priority: 'medium',
    flexibility: 'moderate',
    
    costBreakdown: {
      easels: 2000,
      lighting: 3000,
      storage: 2500,
      tools: 3000,
      kiln: 2500, // For pottery classes
      furniture: 2000
    },
    
    fundingPlan: {
      currentSaved: 1500, // Current art supplies
      monthlyTarget: 141, // Over 8 years
      bucketSource: 'dream',
      businessDeduction: true // Tax deductible as business expense
    },
    
    notes: 'Professional setup for teaching workshops and creating art for sale.',
    
    impact: {
      incomeGeneration: 5000, // Annual income from workshops
      somedayAcceleration: 'Helps transition to Maine life'
    }
  },

  {
    id: 'maine-cottage-purchase-2044',
    name: 'Maine Cottage Purchase',
    age: 52,
    targetDate: '2044-06-01',
    cost: 450000,
    description: 'Purchase dream cottage in Freeport, Maine with ocean view and studio space',
    category: 'housing',
    icon: '🏡',
    color: 'bg-blue-600',
    priority: 'high',
    flexibility: 'low',
    
    costBreakdown: {
      purchasePrice: 450000,
      downPayment: 90000, // 20%
      closingCosts: 13500,
      immediateRenovations: 25000, // Studio setup
      moving: 3000,
      overlap: 6000 // Mortgage overlap period
    },
    
    fundingPlan: {
      totalNeeded: 450000,
      downPaymentSource: 'dream', // $90K from Dream bucket
      mortgageAmount: 360000,
      monthlyPayment: 1800, // 15-year mortgage
      bucketSource: 'dream'
    },
    
    notes: 'The culmination of 20 years of planning. Ocean view cottage with studio space.',
    
    impact: {
      somedayAchieved: true,
      newLifestyle: 'Artist and workshop teacher in Maine',
      monthlyExpenses: 3333, // As planned in someday budget
      incomeNeeded: 40000 // From art sales and workshops
    }
  }
];

/**
 * Sarah's Three-Bucket Allocation Strategy
 * Demonstrates how the system handles all milestones while achieving someday life by 52
 */
export const sarahBucketStrategy = {
  // Current allocation (age 32)
  currentAllocation: {
    foundation: 60, // $1,200/month - Retirement security
    dream: 25,      // $500/month - Maine cottage fund
    life: 15        // $300/month - Near-term milestones
  },

  // Monthly savings capacity
  monthlySavingsCapacity: 2000, // After all expenses and debt payments

  // Allocation evolution over time
  allocationTimeline: [
    {
      ageRange: '32-34',
      allocation: { foundation: 60, dream: 25, life: 15 },
      focus: 'Wedding savings and debt payoff',
      monthlyAmounts: { foundation: 1200, dream: 500, life: 300 },
      notes: 'Building emergency fund while saving for wedding'
    },
    {
      ageRange: '34-36',
      allocation: { foundation: 55, dream: 30, life: 15 },
      focus: 'Home purchase preparation',
      monthlyAmounts: { foundation: 1100, dream: 600, life: 300 },
      notes: 'Increased Dream allocation for home down payment'
    },
    {
      ageRange: '36-40',
      allocation: { foundation: 50, dream: 35, life: 15 },
      focus: 'Building equity and Maine cottage fund',
      monthlyAmounts: { foundation: 1250, dream: 875, life: 375 },
      notes: 'Higher savings capacity after debt payoff and dual income'
    },
    {
      ageRange: '40-45',
      allocation: { foundation: 45, dream: 30, life: 25 },
      focus: 'College fund launch and parent care',
      monthlyAmounts: { foundation: 1350, dream: 900, life: 750 },
      notes: 'Increased Life allocation for college savings and parent support'
    },
    {
      ageRange: '45-50',
      allocation: { foundation: 40, dream: 40, life: 20 },
      focus: 'Final push for Maine cottage',
      monthlyAmounts: { foundation: 1200, dream: 1200, life: 600 },
      notes: 'Peak earning years, aggressive Maine cottage savings'
    },
    {
      ageRange: '50-52',
      allocation: { foundation: 35, dream: 45, life: 20 },
      focus: 'Cottage purchase and transition',
      monthlyAmounts: { foundation: 1050, dream: 1350, life: 600 },
      notes: 'Final two years before Maine move'
    }
  ],

  // Projected outcomes by age 52
  projectedOutcomes: {
    foundationBucket: {
      totalContributions: 288000, // 20 years × average $1,200/month
      investmentGrowth: 312000, // 7% average return
      finalValue: 600000, // Retirement security achieved
      monthlyWithdrawal: 2000 // 4% rule at age 52
    },
    
    dreamBucket: {
      totalContributions: 216000, // 20 years × average $900/month
      investmentGrowth: 184000, // Conservative 6% for shorter timeline
      finalValue: 400000, // Covers cottage down payment + renovations
      cottageEquity: 450000, // Full cottage value
      totalDreamAssets: 850000 // Cottage + remaining investments
    },
    
    lifeBucket: {
      totalContributions: 96000, // 20 years × average $400/month
      milestonesHandled: [
        { milestone: 'Wedding', cost: 25000, funded: true },
        { milestone: 'Honeymoon', cost: 8000, funded: true },
        { milestone: 'Home Purchase', cost: 75000, funded: true },
        { milestone: 'College Fund', cost: 200000, funded: true },
        { milestone: 'Parent Care', cost: 30000, funded: true },
        { milestone: 'Studio Equipment', cost: 15000, funded: true }
      ],
      totalMilestonesCost: 353000,
      surplusForEmergencies: 15000
    },

    // Total financial picture at age 52
    totalNetWorth: 1200000,
    somedayLifeAchieved: true,
    timelineMetrics: {
      originalTarget: 52,
      actualAchievement: 52,
      yearsAhead: 0,
      confidenceLevel: 85 // High confidence based on Monte Carlo
    }
  }
};

/**
 * Sarah's Income Progression
 * Realistic career advancement in marketing
 */
export const sarahIncomeProgression = {
  careerTimeline: [
    {
      age: 32,
      position: 'Senior Marketing Manager',
      salary: 85000,
      freelance: 8000,
      totalIncome: 93000,
      company: 'Creative Marketing Solutions'
    },
    {
      age: 35,
      position: 'Marketing Director',
      salary: 105000,
      freelance: 12000,
      totalIncome: 117000,
      company: 'Creative Marketing Solutions'
    },
    {
      age: 38,
      position: 'VP Marketing',
      salary: 130000,
      freelance: 15000,
      totalIncome: 145000,
      company: 'Tech Startup (equity upside)'
    },
    {
      age: 42,
      position: 'Marketing Consultant',
      salary: 0,
      consulting: 120000,
      freelance: 25000,
      totalIncome: 145000,
      company: 'Self-employed (remote work)'
    },
    {
      age: 48,
      position: 'Marketing Consultant + Art Teacher',
      consulting: 80000,
      artIncome: 25000,
      workshops: 15000,
      totalIncome: 120000,
      company: 'Transition to art focus'
    },
    {
      age: 52,
      position: 'Artist + Workshop Teacher',
      artSales: 25000,
      workshops: 15000,
      consulting: 20000, // Minimal remote work
      totalIncome: 60000,
      company: 'Maine cottage life achieved'
    }
  ],

  // Key income growth factors
  growthFactors: {
    skillDevelopment: 'Digital marketing expertise, leadership skills',
    networkBuilding: 'Industry connections, mentorship',
    marketTrends: 'Growing demand for digital marketing expertise',
    entrepreneurship: 'Freelance and consulting opportunities',
    artTransition: 'Gradual shift to art-focused income'
  }
};

/**
 * Sarah's Complete Demo Data Export
 * Everything needed to demonstrate the someday life planning system
 */
export const sarahCompleteDemo = {
  profile: sarahProfile,
  milestones: sarahMilestones,
  bucketStrategy: sarahBucketStrategy,
  incomeProgression: sarahIncomeProgression,
  
  // Narrative elements for storytelling
  story: {
    currentSituation: 'Sarah is a successful marketing manager in Boston who discovered her passion for art during the pandemic. She dreams of a simpler life by the ocean where she can create and teach.',
    
    challenges: [
      'High cost of living in Boston',
      'Student loan debt from graduate school',
      'Upcoming wedding and family planning',
      'Caring for aging parents',
      'Career transition from marketing to art'
    ],
    
    strengths: [
      'Strong income and career trajectory',
      'Disciplined saver with clear goals',
      'Diversified skills (marketing + art)',
      'Realistic timeline and expectations',
      'Strong support system (fiancé, family)'
    ],
    
    keyDecisions: [
      'Buying first home to build equity before Maine move',
      'Gradual career transition to maintain income',
      'Starting college fund early for compound growth',
      'Balancing current enjoyment with future goals'
    ]
  },

  // Success metrics
  successMetrics: {
    somedayLifeAchieved: true,
    targetAge: 52,
    confidenceLevel: 85,
    allMilestonesHandled: true,
    retirementSecured: true,
    totalNetWorth: 1200000,
    debtFree: true,
    incomeReplaced: true
  }
};

// Export individual components for flexible usage
export default sarahCompleteDemo;
