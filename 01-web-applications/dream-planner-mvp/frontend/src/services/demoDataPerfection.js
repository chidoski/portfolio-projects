/**
 * Demo Data Perfection Service
 * Ensures all demo numbers tell a compelling, memorable story perfect for CEO presentations
 * 
 * Key principles:
 * - All daily savings amounts are clean numbers ($25, $15, $10)
 * - Timeline improvements are round numbers (5 years faster, 10 years earlier)
 * - Milestones celebrate at psychologically satisfying points (25%, 50%, 75%)
 * - All calculations produce memorable, presentation-friendly numbers
 */

import { format, addDays, subDays, addYears, differenceInDays } from 'date-fns';

// Perfect numbers that resonate with audiences
const PERFECT_DAILY_AMOUNTS = [10, 15, 20, 25, 30, 35, 40, 50, 75, 100];
const PERFECT_WEEKLY_AMOUNTS = [75, 100, 150, 175, 200, 250, 300, 350, 500, 700];
const PERFECT_MONTHLY_AMOUNTS = [300, 500, 750, 1000, 1250, 1500, 2000, 2500, 3000];

/**
 * Round any ugly number to the nearest perfect presentation number
 * @param {number} amount - Original calculated amount
 * @param {string} period - 'daily', 'weekly', or 'monthly'
 * @returns {number} Perfectly rounded amount for presentations
 */
export function perfectNumberForDemo(amount, period = 'daily') {
  const perfectNumbers = {
    daily: PERFECT_DAILY_AMOUNTS,
    weekly: PERFECT_WEEKLY_AMOUNTS,
    monthly: PERFECT_MONTHLY_AMOUNTS
  };

  const candidates = perfectNumbers[period] || PERFECT_DAILY_AMOUNTS;
  
  // Find the closest perfect number
  return candidates.reduce((prev, curr) => 
    Math.abs(curr - amount) < Math.abs(prev - amount) ? curr : prev
  );
}

/**
 * Create Marcus Chen - the perfect CEO demo persona
 * Age chosen to be relatable to typical startup CEO (35-45)
 */
export function createMarcusChenPersona() {
  const today = new Date();
  const birthYear = today.getFullYear() - 38; // 38 years old - prime CEO age
  
  return {
    id: 'demo-marcus-chen',
    name: 'Marcus Chen',
    age: 38,
    profession: 'Product Manager at Tech Startup',
    location: 'San Francisco, CA',
    monthlyIncome: 12000, // $144k/year - realistic for SF tech
    monthlyExpenses: 8500, // High SF cost of living
    monthlyDisposableIncome: 3500, // Clean $3.5k disposable
    currentSavings: 25000, // Modest but not too high
    joinDate: format(subDays(today, 365), 'yyyy-MM-dd'), // Exactly 1 year ago
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    backstory: 'Ambitious product manager who realized traditional retirement planning wasn\'t enough. Wants to achieve financial freedom while still young enough to enjoy it.',
    motivation: 'Building wealth to support family dreams and create optionality in career choices.'
  };
}

/**
 * Generate Marcus's three perfectly crafted dreams with memorable numbers
 */
export function generateMarcusPerfectDreams() {
  const today = new Date();
  const persona = createMarcusChenPersona();
  
  // Dream 1: Tech Entrepreneur Sabbatical (Active, 40% complete)
  const sabbaticalDream = {
    id: 'marcus-sabbatical',
    title: 'Tech Entrepreneur Sabbatical',
    description: 'Take 18 months off to build my own SaaS startup, travel Asia for inspiration, and write a book about product management.',
    category: 'entrepreneurship',
    target_amount: 150000, // Clean $150k - memorable
    current_amount: 60000, // Exactly 40% progress
    target_date: format(addYears(today, 3), 'yyyy-MM-dd'), // Exactly 3 years
    
    // Perfect numbers for demo
    daily_amount: 25, // Exactly $25/day - memorable!
    weekly_amount: 175, // $25 × 7 = $175
    monthly_amount: 750, // Clean $750/month
    
    // Perfect strategy selection
    selectedStrategy: 'balanced',
    
    // Perfect progress metrics
    progress: 40, // Clean 40%
    streak: 125, // 125 days = ~4 months of consistency
    longestStreak: 125,
    
    // Timeline that tells a story
    createdDate: format(subDays(today, 125), 'yyyy-MM-dd'),
    timelineImprovement: '2 years faster than traditional planning',
    
    // Perfect milestones
    milestones: [
      { percentage: 25, amount: 37500, completed: true, completedDate: format(subDays(today, 65), 'yyyy-MM-dd'), message: '25% milestone! Building momentum! 🚀' },
      { percentage: 50, amount: 75000, completed: false, expectedDate: format(addDays(today, 60), 'yyyy-MM-dd'), message: 'Halfway to freedom! 🎯' },
      { percentage: 75, amount: 112500, completed: false, expectedDate: format(addDays(today, 210), 'yyyy-MM-dd'), message: 'Almost ready to take the leap! 💪' }
    ],
    
    tags: ['entrepreneurship', 'freedom', 'startup', 'sabbatical'],
    emotionalPayoff: 'Freedom to pursue my passion project without financial stress',
    
    // Perfect life equivalents
    lifeEquivalents: [
      'Skip one restaurant dinner per day ($25)',
      'Cancel 3 unused subscriptions per month',
      'Bring lunch to work instead of buying',
      'One less Uber ride per day'
    ],
    
    progressHistory: generatePerfectProgressHistory(125, 25, 40),
    notes: 'Building my runway to entrepreneurial freedom. Every dollar saved is a day closer to launching my own company!'
  };

  // Dream 2: San Francisco Dream Home (Active, 15% complete)
  const dreamHomeDream = {
    id: 'marcus-dream-home',
    title: 'San Francisco Dream Home',
    description: 'Purchase a 3-bedroom house in Noe Valley with a home office, garden, and stunning city views for my growing family.',
    category: 'home',
    target_amount: 500000, // Clean $500k down payment
    current_amount: 75000, // Exactly 15% progress
    target_date: format(addYears(today, 5), 'yyyy-MM-dd'), // Exactly 5 years
    
    // Perfect numbers
    daily_amount: 35, // Clean $35/day
    weekly_amount: 245, // $35 × 7 
    monthly_amount: 1050, // Clean monthly amount
    
    selectedStrategy: 'aggressive',
    
    progress: 15, // Clean 15%
    streak: 90, // 3 months consistency
    longestStreak: 95,
    
    createdDate: format(subDays(today, 90), 'yyyy-MM-dd'),
    timelineImprovement: '5 years faster than traditional saving',
    
    milestones: [
      { percentage: 25, amount: 125000, completed: false, expectedDate: format(addDays(today, 180), 'yyyy-MM-dd'), message: '25% saved! Foundation is building! 🏠' },
      { percentage: 50, amount: 250000, completed: false, expectedDate: format(addDays(today, 720), 'yyyy-MM-dd'), message: 'Halfway to homeownership! 🔑' },
      { percentage: 75, amount: 375000, completed: false, expectedDate: format(addDays(today, 1260), 'yyyy-MM-dd'), message: 'Almost ready to buy! 🎉' }
    ],
    
    tags: ['home', 'family', 'investment', 'sf'],
    emotionalPayoff: 'Stability and space for my family to grow in the city we love',
    
    lifeEquivalents: [
      'Skip premium coffee and lunch out ($35/day)',
      'One fewer date night per week',
      'Cancel gym membership, use home workouts',
      'Carpool to work instead of solo driving'
    ],
    
    progressHistory: generatePerfectProgressHistory(90, 35, 15),
    notes: 'Building equity instead of paying rent. Every month brings us closer to owning our piece of San Francisco!'
  };

  // Dream 3: Family Adventure Fund (New, 5% complete)  
  const familyAdventureDream = {
    id: 'marcus-family-adventures',
    title: 'Family Adventure Fund',
    description: 'Create amazing memories with annual family trips: African safari, European castles, Japanese culture, Australian outback.',
    category: 'travel',
    target_amount: 80000, // Clean $80k for multiple trips
    current_amount: 4000, // Exactly 5% progress
    target_date: format(addYears(today, 4), 'yyyy-MM-dd'), // 4 years
    
    // Perfect numbers
    daily_amount: 15, // Clean $15/day
    weekly_amount: 105, // $15 × 7
    monthly_amount: 450, // Clean monthly amount
    
    selectedStrategy: 'relaxed',
    
    progress: 5, // Just started
    streak: 30, // 1 month in
    longestStreak: 30,
    
    createdDate: format(subDays(today, 30), 'yyyy-MM-dd'),
    timelineImprovement: '3 years earlier than traditional planning',
    
    milestones: [
      { percentage: 25, amount: 20000, completed: false, expectedDate: format(addDays(today, 360), 'yyyy-MM-dd'), message: '25% saved! First adventure booked! ✈️' },
      { percentage: 50, amount: 40000, completed: false, expectedDate: format(addDays(today, 720), 'yyyy-MM-dd'), message: 'Halfway to family adventure goals! 🗺️' },
      { percentage: 75, amount: 60000, completed: false, expectedDate: format(addDays(today, 1080), 'yyyy-MM-dd'), message: 'Almost ready for epic adventures! 🌍' }
    ],
    
    tags: ['family', 'travel', 'memories', 'education'],
    emotionalPayoff: 'Irreplaceable memories and cultural education for the kids',
    
    lifeEquivalents: [
      'Skip one coffee shop visit per day ($15)',
      'Pack lunch twice per week',
      'Movie night at home instead of theater',
      'Cook dinner instead of takeout once per week'
    ],
    
    progressHistory: generatePerfectProgressHistory(30, 15, 5),
    notes: 'Investing in experiences over things. Want my kids to see the world and understand different cultures!'
  };

  return [sabbaticalDream, dreamHomeDream, familyAdventureDream];
}

/**
 * Generate perfect progress history with no ugly numbers
 * @param {number} days - Number of days of history
 * @param {number} targetDaily - Target daily amount (already perfected)
 * @param {number} currentProgress - Current progress percentage
 * @returns {Array} Perfect progress history
 */
function generatePerfectProgressHistory(days, targetDaily, currentProgress) {
  const history = [];
  const today = new Date();
  let cumulativeAmount = 0;
  
  // Calculate target cumulative based on clean progress percentage
  const targetCumulative = (currentProgress / 100) * (targetDaily * days * 2.5);
  
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    let savedAmount = targetDaily;
    
    // Add realistic but clean variations
    const dayOfWeek = date.getDay();
    const randomFactor = Math.random();
    
    if (randomFactor < 0.08) {
      // 8% chance of missing completely (weekend or sick day)
      savedAmount = 0;
    } else if (randomFactor < 0.15) {
      // 7% chance of saving half (busy day)
      savedAmount = Math.round(targetDaily / 2);
    } else if (randomFactor > 0.9) {
      // 10% chance of bonus day (found money, freelance, etc.)
      savedAmount = targetDaily * 2;
    } else if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Weekends: 80% chance of hitting target (more time to think about it)
      savedAmount = Math.random() > 0.2 ? targetDaily : Math.round(targetDaily / 2);
    }
    
    // Always round to clean numbers
    savedAmount = Math.round(savedAmount);
    cumulativeAmount += savedAmount;
    
    history.push({
      date: format(date, 'yyyy-MM-dd'),
      savedAmount: savedAmount,
      cumulativeAmount: Math.round(cumulativeAmount),
      notes: generatePerfectNote(savedAmount, targetDaily, date),
      streak: days - i,
      dayOfWeek: format(date, 'EEEE'),
      isWeekend: [0, 6].includes(dayOfWeek),
      isBonus: savedAmount > targetDaily,
      isMissed: savedAmount === 0
    });
  }
  
  // Adjust final amounts to hit exact target progress
  const actualFinal = history[history.length - 1].cumulativeAmount;
  const adjustment = targetCumulative / actualFinal;
  
  let runningTotal = 0;
  history.forEach(entry => {
    runningTotal += entry.savedAmount;
    entry.cumulativeAmount = Math.round(runningTotal * adjustment);
  });
  
  return history;
}

/**
 * Generate perfect notes that tell a compelling story
 */
function generatePerfectNote(savedAmount, targetAmount, date) {
  const dayOfWeek = date.getDay();
  const dayName = format(date, 'EEEE');
  
  if (savedAmount === 0) {
    const missedReasons = [
      "Family emergency - priorities first! 👨‍👩‍👧‍👦",
      "Sick day - health comes first 🤒",
      "Date night with spouse - relationship investment 💕",
      "Unexpected expense, will catch up tomorrow 💪"
    ];
    return missedReasons[Math.floor(Math.random() * missedReasons.length)];
  }
  
  if (savedAmount > targetAmount) {
    const bonusDays = [
      "Freelance project payment! 💻💰",
      "Sold old tech gear - decluttering pays! 📱",
      "Got cashback from credit card rewards 💳",
      "Found $20 in old jacket pocket! 🧥",
      "Birthday money from parents 🎂",
      "Returned unused purchases for cash 📦",
      "Side hustle payment came through! 🚀"
    ];
    return bonusDays[Math.floor(Math.random() * bonusDays.length)];
  }
  
  if (savedAmount < targetAmount) {
    return "Tough day but something > nothing! 💪";
  }
  
  // Regular successful days
  const weekdayNotes = [
    "Packed lunch instead of buying 🥪",
    "Walked to meeting, saved on Uber 🚶‍♂️",
    "Made coffee at home ☕",
    "Used coupon at grocery store 🎫",
    "Cooked dinner instead of ordering 🍳",
    "Biked to work, saved on gas ⛽",
    "Brought water bottle, skipped buying drinks 💧",
    "Happy hour at home instead of bar 🍻",
    "Library book instead of buying 📚",
    "Generic brand saved $5 at store 🛒"
  ];
  
  const weekendNotes = [
    "Picnic in park instead of restaurant 🧺",
    "Movie night at home vs theater 🍿",
    "Cooked brunch instead of going out 🥞",
    "Free museum day with family 🏛️",
    "Hiking adventure (free fun!) 🥾",
    "Board game night with friends 🎲",
    "Farmers market finds for home cooking 🥕",
    "Beach day - free entertainment! 🏖️"
  ];
  
  const notes = (dayOfWeek === 0 || dayOfWeek === 6) ? weekendNotes : weekdayNotes;
  return notes[Math.floor(Math.random() * notes.length)];
}

/**
 * Calculate perfect three-bucket allocation for Marcus
 * All numbers rounded to be presentation-perfect
 */
export function calculateMarcusPerfectBuckets() {
  const persona = createMarcusChenPersona();
  const monthlyDisposable = persona.monthlyDisposableIncome; // $3,500
  
  // Perfect allocation percentages (add up to 100%)
  const foundationPercent = 45; // $1,575 - retirement security
  const dreamPercent = 35;      // $1,225 - active dreams  
  const lifePercent = 20;       // $700 - life surprises
  
  return {
    monthlyDisposableIncome: monthlyDisposable,
    
    foundation: {
      monthlyAmount: Math.round(monthlyDisposable * foundationPercent / 100),
      percentage: foundationPercent,
      purpose: 'Retirement Security & Long-term Wealth',
      projectedValue: '2.8M by age 65', // Clean projection
      description: 'Index funds, 401k, Roth IRA for foundation security'
    },
    
    dream: {
      monthlyAmount: Math.round(monthlyDisposable * dreamPercent / 100),
      percentage: dreamPercent,
      purpose: 'Active Dreams & Life Goals',
      projectedValue: '3 major dreams achieved by 45',
      description: 'Sabbatical fund, house down payment, family adventures'
    },
    
    life: {
      monthlyAmount: Math.round(monthlyDisposable * lifePercent / 100),
      percentage: lifePercent,
      purpose: 'Life Surprises & Opportunities',
      projectedValue: '25k emergency buffer in 3 years',
      description: 'Emergency fund, career pivots, unexpected opportunities'
    },
    
    // Perfect summary stats
    totalAllocated: monthlyDisposable,
    timeToFirstDream: '36 months', // Clean 3 years
    retirementProjection: '$2.8M by 65',
    flexibilityScore: '95% - handles major life changes'
  };
}

/**
 * Generate perfect business metrics for CEO presentations
 * All numbers are memorable and presentation-ready
 */
export function generatePerfectBusinessMetrics() {
  return {
    // Engagement metrics (all round numbers)
    engagementTime: {
      dreamPlanner: 12, // minutes per session
      traditional: 2,   // minutes per session
      improvement: '6x higher engagement'
    },
    
    // Lifetime value (clean, memorable numbers)
    lifetimeValue: {
      dreamPlanner: 4800, // $4,800 LTV
      traditional: 45,    // $45 LTV
      improvement: '107x higher LTV'
    },
    
    // Viral coefficient (clean decimals)
    viralCoefficient: {
      dreamPlanner: 2.3,  // Clean 2.3x viral
      traditional: 0.1,   // 0.1x viral
      improvement: '23x more viral'
    },
    
    // Retention (percentage that tells a story)
    yearOneRetention: {
      dreamPlanner: 92,   // 92% retention
      traditional: 15,    // 15% retention
      improvement: '6x better retention'
    },
    
    // Perfect market size
    addressableMarket: {
      youngProfessionals: { size: '45M people', value: '$2.1B' },
      midCareer: { size: '52M people', value: '$3.8B' },
      preRetirement: { size: '38M people', value: '$2.9B' },
      total: '$180B total addressable market'
    },
    
    // Perfect unit economics
    customerAcquisitionCost: 45,    // $45 CAC
    paybackPeriod: 6,              // 6 months
    grossMargin: 85,               // 85% gross margin
    netMargin: 35,                 // 35% net margin by year 5
    
    // 5-year projections (all round numbers)
    fiveYearProjection: {
      users: '2M active users',
      revenue: '$180M annual revenue',
      valuation: '$2B valuation',
      marketShare: '15% market share'
    }
  };
}

/**
 * Generate perfect competitive comparisons
 * Shows clear differentiation with memorable numbers
 */
export function generatePerfectCompetitiveAnalysis() {
  return {
    traditional: {
      name: 'Traditional Finance Apps',
      engagement: '2 minutes/session',
      retention: '15% after 1 year',
      ltv: '$45',
      approach: 'Expense tracking & restrictions',
      timeHorizon: '3 months before churn'
    },
    
    dreamPlanner: {
      name: 'Dream Planner',
      engagement: '12 minutes/session',
      retention: '92% after 1 year', 
      ltv: '$4,800',
      approach: 'Dream-based future planning',
      timeHorizon: '40-year customer relationships'
    },
    
    keyDifferentiators: [
      {
        factor: 'Psychological Approach',
        traditional: 'Restriction & guilt',
        dreamPlanner: 'Aspiration & motivation',
        impact: '6x engagement increase'
      },
      {
        factor: 'Time Horizon',
        traditional: '3-month usage cycle',
        dreamPlanner: '40-year life planning',
        impact: '107x lifetime value'
      },
      {
        factor: 'Sharing Behavior',
        traditional: 'Private shame about spending',
        dreamPlanner: 'Public pride in dreams',
        impact: '23x viral coefficient'
      },
      {
        factor: 'Life Integration',
        traditional: 'Separate budgeting tool',
        dreamPlanner: 'Central life planning hub',
        impact: '6x retention rate'
      }
    ]
  };
}

/**
 * Get complete perfect demo package for presentations
 * Everything designed to create memorable, compelling moments
 */
export function getPerfectDemoPackage() {
  const persona = createMarcusChenPersona();
  const dreams = generateMarcusPerfectDreams();
  const buckets = calculateMarcusPerfectBuckets();
  const metrics = generatePerfectBusinessMetrics();
  const competitive = generatePerfectCompetitiveAnalysis();
  
  // Calculate perfect summary stats
  const totalSaved = dreams.reduce((sum, dream) => sum + dream.current_amount, 0);
  const totalTarget = dreams.reduce((sum, dream) => sum + dream.target_amount, 0);
  const averageProgress = Math.round(dreams.reduce((sum, dream) => sum + dream.progress, 0) / dreams.length);
  
  return {
    persona,
    dreams,
    buckets,
    metrics,
    competitive,
    
    // Perfect summary stats for the overview
    summary: {
      totalSaved: totalSaved,
      totalTarget: totalTarget,
      averageProgress: averageProgress,
      longestStreak: Math.max(...dreams.map(d => d.streak)),
      activeDreams: dreams.filter(d => d.progress < 100).length,
      timeToFirstDream: '36 months',
      lifetimeProjection: '$2.8M by retirement',
      
      // Key demo talking points
      talkingPoints: [
        'Marcus saves exactly $25/day for his sabbatical - less than one restaurant meal',
        'Three-bucket system handles his $3,500 monthly disposable income perfectly',
        'On track to achieve financial freedom 15 years earlier than traditional planning',
        'Every dream has clean milestones at 25%, 50%, and 75% completion',
        'His longest streak is 125 days - shows the system builds lasting habits'
      ]
    }
  };
}

/**
 * Perfect demo calculations that always produce clean numbers
 * Override any ugly calculation results with presentation-perfect alternatives
 */
export function perfectDemoCalculation(dreamAmount, targetDate, strategy = 'balanced') {
  const today = new Date();
  const target = new Date(targetDate);
  const totalDays = differenceInDays(target, today);
  
  // Calculate what it would normally be
  const normalDaily = dreamAmount / totalDays;
  
  // Round to perfect demo number
  const perfectDaily = perfectNumberForDemo(normalDaily, 'daily');
  
  // Recalculate everything from the perfect daily amount
  const perfectWeekly = perfectDaily * 7;
  const perfectMonthly = perfectDaily * 30.44; // More precise monthly calculation
  
  // Adjust timeline to accommodate perfect numbers
  const adjustedDays = Math.round(dreamAmount / perfectDaily);
  const adjustedTargetDate = addDays(today, adjustedDays);
  
  return {
    daily: perfectDaily,
    weekly: Math.round(perfectWeekly),
    monthly: Math.round(perfectMonthly),
    originalTargetDate: format(target, 'yyyy-MM-dd'),
    adjustedTargetDate: format(adjustedTargetDate, 'yyyy-MM-dd'),
    timeline: `${Math.round(adjustedDays / 365 * 10) / 10} years`,
    totalDays: adjustedDays,
    
    // Perfect strategy descriptions
    strategy: {
      aggressive: {
        name: 'Aggressive',
        description: 'Achieve your dream 25% faster',
        dailyAdjustment: Math.round(perfectDaily * 1.33)
      },
      balanced: {
        name: 'Balanced', 
        description: 'Steady progress with flexibility',
        dailyAdjustment: perfectDaily
      },
      relaxed: {
        name: 'Relaxed',
        description: 'Lower daily amount, more time',
        dailyAdjustment: Math.round(perfectDaily * 0.75)
      }
    }[strategy],
    
    // Perfect milestone celebrations
    milestones: [
      { 
        percentage: 25, 
        amount: Math.round(dreamAmount * 0.25),
        message: 'Quarter milestone! Momentum is building! 🚀',
        estimatedDate: format(addDays(today, Math.round(adjustedDays * 0.25)), 'yyyy-MM-dd')
      },
      { 
        percentage: 50, 
        amount: Math.round(dreamAmount * 0.50),
        message: 'Halfway point! You\'re crushing this goal! 🎯',
        estimatedDate: format(addDays(today, Math.round(adjustedDays * 0.50)), 'yyyy-MM-dd')
      },
      { 
        percentage: 75, 
        amount: Math.round(dreamAmount * 0.75),
        message: 'Three quarters complete! The finish line is in sight! 🏆',
        estimatedDate: format(addDays(today, Math.round(adjustedDays * 0.75)), 'yyyy-MM-dd')
      }
    ]
  };
}

export default {
  createMarcusChenPersona,
  generateMarcusPerfectDreams,
  calculateMarcusPerfectBuckets,
  generatePerfectBusinessMetrics,
  generatePerfectCompetitiveAnalysis,
  getPerfectDemoPackage,
  perfectDemoCalculation,
  perfectNumberForDemo
};
