/**
 * Career Projection Service
 * Models realistic career growth and its impact on dream achievement
 * Connects career ambition to life dreams through timeline calculations
 */

import { SALARY_DATA, LOCATION_MULTIPLIERS } from './incomeOptimization.js';

/**
 * Career progression data with realistic timelines and probability factors
 */
const CAREER_PROGRESSION_DATA = {
  'Marketing & Advertising': {
    typical: {
      'Marketing Coordinator': {
        nextRole: 'Marketing Specialist',
        timeToPromotion: { min: 1.5, typical: 2.5, max: 4 },
        salaryIncrease: 0.22, // 22% increase
        probability: 0.75
      },
      'Marketing Specialist': {
        nextRole: 'Senior Marketing Specialist',
        timeToPromotion: { min: 2, typical: 3, max: 5 },
        salaryIncrease: 0.24,
        probability: 0.70
      },
      'Senior Marketing Specialist': {
        nextRole: 'Marketing Manager',
        timeToPromotion: { min: 2, typical: 3.5, max: 6 },
        salaryIncrease: 0.25,
        probability: 0.60
      },
      'Marketing Manager': {
        nextRole: 'Senior Marketing Manager',
        timeToPromotion: { min: 2.5, typical: 4, max: 7 },
        salaryIncrease: 0.29,
        probability: 0.55
      },
      'Senior Marketing Manager': {
        nextRole: 'Marketing Director',
        timeToPromotion: { min: 3, typical: 5, max: 8 },
        salaryIncrease: 0.27,
        probability: 0.40
      },
      'Marketing Director': {
        nextRole: 'VP Marketing',
        timeToPromotion: { min: 4, typical: 6, max: 10 },
        salaryIncrease: 0.32,
        probability: 0.25
      },
      'VP Marketing': {
        nextRole: 'CMO',
        timeToPromotion: { min: 5, typical: 8, max: 12 },
        salaryIncrease: 0.35,
        probability: 0.15
      }
    },
    aggressive: {
      // Faster timeline for ambitious professionals
      'Marketing Manager': {
        nextRole: 'Marketing Director',
        timeToPromotion: { min: 1.5, typical: 2.5, max: 4 },
        salaryIncrease: 0.45, // Bigger jump when skipping levels
        probability: 0.25,
        requirements: ['MBA', 'Leadership experience', 'Strategic wins']
      },
      'Senior Marketing Manager': {
        nextRole: 'VP Marketing',
        timeToPromotion: { min: 2, typical: 3.5, max: 5 },
        salaryIncrease: 0.55,
        probability: 0.20,
        requirements: ['Executive presence', 'P&L responsibility', 'Team building']
      }
    }
  },

  'Technology': {
    typical: {
      'Junior Developer': {
        nextRole: 'Software Developer',
        timeToPromotion: { min: 1, typical: 2, max: 3 },
        salaryIncrease: 0.31,
        probability: 0.80
      },
      'Software Developer': {
        nextRole: 'Senior Developer',
        timeToPromotion: { min: 2, typical: 3.5, max: 5 },
        salaryIncrease: 0.35,
        probability: 0.70
      },
      'Senior Developer': {
        nextRole: 'Lead Developer',
        timeToPromotion: { min: 2.5, typical: 4, max: 6 },
        salaryIncrease: 0.22,
        probability: 0.50
      },
      'Lead Developer': {
        nextRole: 'Engineering Manager',
        timeToPromotion: { min: 2, typical: 4, max: 6 },
        salaryIncrease: 0.18,
        probability: 0.40
      }
    }
  },

  'Finance': {
    typical: {
      'Financial Analyst': {
        nextRole: 'Senior Financial Analyst',
        timeToPromotion: { min: 2, typical: 3, max: 4 },
        salaryIncrease: 0.36,
        probability: 0.70
      },
      'Senior Financial Analyst': {
        nextRole: 'Finance Manager',
        timeToPromotion: { min: 2.5, typical: 4, max: 6 },
        salaryIncrease: 0.26,
        probability: 0.55
      },
      'Finance Manager': {
        nextRole: 'Finance Director',
        timeToPromotion: { min: 3, typical: 5, max: 8 },
        salaryIncrease: 0.29,
        probability: 0.40
      }
    }
  },

  'Sales': {
    typical: {
      'Sales Representative': {
        nextRole: 'Senior Sales Representative',
        timeToPromotion: { min: 1, typical: 2.5, max: 4 },
        salaryIncrease: 0.27,
        probability: 0.75
      },
      'Senior Sales Representative': {
        nextRole: 'Sales Manager',
        timeToPromotion: { min: 2, typical: 4, max: 6 },
        salaryIncrease: 0.36,
        probability: 0.50
      }
    }
  }
};

/**
 * Industry-specific factors that affect career progression
 */
const INDUSTRY_FACTORS = {
  'Marketing & Advertising': {
    growthRate: 0.06, // 6% annual industry growth
    volatility: 'medium',
    skillDemand: ['Digital Marketing', 'Data Analytics', 'Marketing Automation'],
    economicSensitivity: 'high'
  },
  'Technology': {
    growthRate: 0.11,
    volatility: 'high',
    skillDemand: ['Cloud Computing', 'AI/ML', 'Cybersecurity'],
    economicSensitivity: 'medium'
  },
  'Finance': {
    growthRate: 0.05,
    volatility: 'low',
    skillDemand: ['Fintech', 'Risk Management', 'Data Analysis'],
    economicSensitivity: 'high'
  },
  'Sales': {
    growthRate: 0.04,
    volatility: 'medium',
    skillDemand: ['CRM Systems', 'Social Selling', 'Analytics'],
    economicSensitivity: 'high'
  }
};

/**
 * Calculate realistic career trajectory over time
 * @param {string} currentRole - Current job title
 * @param {number} age - Current age
 * @param {string} industry - Industry sector
 * @param {number} currentSalary - Current annual salary
 * @param {string} location - Location for salary adjustments
 * @param {Object} dreamGoals - User's financial dreams
 * @returns {Object} Career projection with timeline impacts
 */
export function calculateCareerTrajectory(currentRole, age, industry, currentSalary, location, dreamGoals) {
  const locationMultiplier = LOCATION_MULTIPLIERS[location] || 1.0;
  const industryData = CAREER_PROGRESSION_DATA[industry];
  const industryFactor = INDUSTRY_FACTORS[industry];

  if (!industryData || !industryFactor) {
    return generateGenericTrajectory(currentRole, age, currentSalary, dreamGoals);
  }

  // Generate typical career path
  const typicalPath = projectCareerPath(
    currentRole, 
    age, 
    currentSalary, 
    industryData.typical, 
    locationMultiplier,
    industryFactor,
    'typical'
  );

  // Generate optimistic path
  const optimisticPath = projectCareerPath(
    currentRole, 
    age, 
    currentSalary, 
    industryData.typical, 
    locationMultiplier,
    industryFactor,
    'optimistic'
  );

  // Calculate dream timeline impacts
  const dreamImpacts = calculateDreamTimelineImpacts(typicalPath, optimisticPath, dreamGoals);

  return {
    currentPosition: {
      role: currentRole,
      age,
      salary: currentSalary,
      industry
    },
    projections: {
      typical: typicalPath,
      optimistic: optimisticPath
    },
    dreamImpacts,
    industryInsights: {
      ...industryFactor,
      marketOutlook: getMarketOutlook(industryFactor.growthRate),
      careerAdvice: getCareerAdvice(currentRole, industry, age)
    },
    recommendations: generateCareerRecommendations(typicalPath, dreamGoals, industry),
    calculatedAt: new Date().toISOString()
  };
}

/**
 * Generate what-if scenarios for aggressive career moves
 * @param {string} currentRole - Current position
 * @param {number} age - Current age
 * @param {string} industry - Industry sector
 * @param {number} currentSalary - Current salary
 * @param {string} location - Location
 * @param {Object} dreamGoals - Financial dreams
 * @returns {Object} Aggressive scenario projections
 */
export function whatIfScenarios(currentRole, age, industry, currentSalary, location, dreamGoals) {
  const locationMultiplier = LOCATION_MULTIPLIERS[location] || 1.0;
  const industryData = CAREER_PROGRESSION_DATA[industry];

  const scenarios = [];

  // Scenario 1: Aggressive promotion timeline
  const aggressivePromotion = projectCareerPath(
    currentRole,
    age,
    currentSalary,
    industryData?.typical || {},
    locationMultiplier,
    INDUSTRY_FACTORS[industry],
    'aggressive'
  );

  const aggressiveDreamImpact = calculateSingleDreamImpact(aggressivePromotion, dreamGoals);

  scenarios.push({
    type: 'aggressive_promotion',
    title: 'Fast-Track Promotion Path',
    description: `Pursue rapid advancement through exceptional performance and strategic positioning`,
    timeline: aggressivePromotion,
    dreamImpact: aggressiveDreamImpact,
    requirements: [
      'Exceed performance targets by 20%+',
      'Lead high-visibility projects',
      'Build executive relationships',
      'Develop direct reports',
      'Obtain relevant certifications'
    ],
    effort: 'very high',
    probability: 0.25,
    timeframe: '2-4 years'
  });

  // Scenario 2: Industry switch to higher-paying sector
  const techSwitch = calculateIndustrySwitchScenario(currentRole, age, currentSalary, 'Technology', dreamGoals);
  if (techSwitch) {
    scenarios.push(techSwitch);
  }

  // Scenario 3: Entrepreneurial path
  const entrepreneurialPath = calculateEntrepreneurialScenario(currentRole, age, currentSalary, industry, dreamGoals);
  scenarios.push(entrepreneurialPath);

  // Scenario 4: Consulting/freelance path
  const consultingPath = calculateConsultingScenario(currentRole, age, currentSalary, industry, dreamGoals);
  scenarios.push(consultingPath);

  // Sort by dream impact (years saved)
  scenarios.sort((a, b) => (b.dreamImpact?.yearsSaved || 0) - (a.dreamImpact?.yearsSaved || 0));

  return {
    scenarios,
    bestOption: scenarios[0],
    summary: generateScenarioSummary(scenarios, dreamGoals),
    riskAssessment: assessScenarioRisks(scenarios)
  };
}

/**
 * Project career path over time
 */
function projectCareerPath(currentRole, startAge, startSalary, progressionData, locationMultiplier, industryFactor, scenario = 'typical') {
  const path = [];
  let currentPosition = currentRole;
  let currentSal = startSalary;
  let currentAgeTracker = startAge;

  // Add current position
  path.push({
    age: currentAgeTracker,
    role: currentPosition,
    salary: currentSal,
    year: 0
  });

  const maxYears = 30; // Project 30 years into future
  let year = 0;

  while (year < maxYears && currentAgeTracker < 65) {
    const progression = progressionData[currentPosition];
    
    if (!progression) {
      // No more promotions available, apply annual raises
      year++;
      currentAgeTracker++;
      currentSal *= (1 + (industryFactor?.growthRate || 0.03)); // Industry growth rate or 3% default
      
      path.push({
        age: currentAgeTracker,
        role: currentPosition,
        salary: Math.round(currentSal),
        year
      });
      continue;
    }

    // Determine time to promotion based on scenario
    let timeToPromotion;
    switch (scenario) {
      case 'optimistic':
        timeToPromotion = progression.timeToPromotion.min + 0.5;
        break;
      case 'aggressive':
        timeToPromotion = progression.timeToPromotion.min;
        break;
      default: // typical
        timeToPromotion = progression.timeToPromotion.typical;
    }

    // Apply annual raises until promotion
    const promotionYear = Math.ceil(timeToPromotion);
    for (let i = 1; i <= promotionYear && year + i <= maxYears; i++) {
      const ageAtYear = currentAgeTracker + i;
      if (ageAtYear >= 65) break;

      let salaryAtYear = currentSal * Math.pow(1 + (industryFactor?.growthRate || 0.03), i);
      
      // Apply promotion salary bump in the promotion year
      if (i === promotionYear) {
        salaryAtYear *= (1 + progression.salaryIncrease);
        currentPosition = progression.nextRole;
      }

      path.push({
        age: ageAtYear,
        role: i === promotionYear ? progression.nextRole : currentPosition,
        salary: Math.round(salaryAtYear),
        year: year + i,
        isPromotion: i === promotionYear
      });
    }

    year += promotionYear;
    currentAgeTracker += promotionYear;
    currentSal = path[path.length - 1].salary;
  }

  return path;
}

/**
 * Calculate dream timeline impacts from career progression
 */
function calculateDreamTimelineImpacts(typicalPath, optimisticPath, dreamGoals) {
  if (!dreamGoals || !dreamGoals.targetAmount) {
    return {
      typical: { message: 'Complete your dream profile to see timeline impacts' },
      optimistic: { message: 'Complete your dream profile to see timeline impacts' }
    };
  }

  const typicalImpact = calculateSingleDreamImpact(typicalPath, dreamGoals);
  const optimisticImpact = calculateSingleDreamImpact(optimisticPath, dreamGoals);

  const dreamName = dreamGoals.name || 'cottage';
  const originalTargetAge = dreamGoals.targetAge || 52;

  return {
    typical: {
      ...typicalImpact,
      message: `With typical promotions, your ${dreamName} moves from age ${originalTargetAge} to ${typicalImpact.newTargetAge} without saving another penny.`
    },
    optimistic: {
      ...optimisticImpact,
      message: `With aggressive career moves, your ${dreamName} happens at age ${optimisticImpact.newTargetAge}.`,
      yearsSaved: originalTargetAge - optimisticImpact.newTargetAge
    }
  };
}

/**
 * Calculate single dream timeline impact
 */
function calculateSingleDreamImpact(careerPath, dreamGoals) {
  if (!dreamGoals || !careerPath) {
    return { newTargetAge: 52, yearsSaved: 0 };
  }

  const targetAmount = dreamGoals.targetAmount || 500000;
  const currentSaved = dreamGoals.currentSaved || 0;
  const currentAge = dreamGoals.currentAge || 32;
  const remainingAmount = targetAmount - currentSaved;
  
  // Calculate cumulative savings with career progression
  let cumulativeSavings = 0;
  const savingsRate = 0.15; // Assume 15% savings rate
  const taxRate = 0.28; // Approximate combined tax rate

  for (const position of careerPath) {
    const netSalary = position.salary * (1 - taxRate);
    const annualSavings = netSalary * savingsRate;
    cumulativeSavings += annualSavings;

    if (cumulativeSavings >= remainingAmount) {
      return {
        newTargetAge: position.age,
        yearsSaved: (dreamGoals.targetAge || 52) - position.age,
        achievementYear: position.year,
        requiredSavings: remainingAmount,
        projectedSavings: cumulativeSavings
      };
    }
  }

  // If not achieved within projection period
  const finalPosition = careerPath[careerPath.length - 1];
  return {
    newTargetAge: finalPosition?.age || 65,
    yearsSaved: Math.max(0, (dreamGoals.targetAge || 52) - (finalPosition?.age || 65)),
    achievementYear: finalPosition?.year || 30,
    requiredSavings: remainingAmount,
    projectedSavings: cumulativeSavings
  };
}

/**
 * Generate industry switch scenario
 */
function calculateIndustrySwitchScenario(currentRole, age, currentSalary, targetIndustry, dreamGoals) {
  // Simplified industry switch logic
  const salaryMultipliers = {
    'Technology': 1.25,
    'Finance': 1.15,
    'Marketing & Advertising': 1.0,
    'Sales': 1.10
  };

  const switchMultiplier = salaryMultipliers[targetIndustry] || 1.0;
  const newSalary = currentSalary * switchMultiplier;
  const dreamImpact = calculateDreamImpactFromSalaryChange(currentSalary, newSalary, dreamGoals);

  if (switchMultiplier <= 1.05) return null; // Not worth switching

  return {
    type: 'industry_switch',
    title: `Switch to ${targetIndustry}`,
    description: `Transition to ${targetIndustry} for higher earning potential`,
    salaryIncrease: newSalary - currentSalary,
    dreamImpact,
    requirements: [
      'Transferable skills assessment',
      'Industry knowledge acquisition',
      'Network building in target industry',
      'Relevant certifications',
      'Portfolio/experience translation'
    ],
    effort: 'high',
    probability: 0.40,
    timeframe: '6-18 months transition'
  };
}

/**
 * Calculate entrepreneurial scenario
 */
function calculateEntrepreneurialScenario(currentRole, age, currentSalary, industry, dreamGoals) {
  // Conservative entrepreneurial projections
  const scenarios = [
    { year: 1, multiplier: 0.6, probability: 0.7 }, // Often lower first year
    { year: 2, multiplier: 1.2, probability: 0.5 },
    { year: 3, multiplier: 1.8, probability: 0.3 },
    { year: 5, multiplier: 2.5, probability: 0.2 }
  ];

  const successScenario = scenarios[2]; // Year 3 success
  const newSalary = currentSalary * successScenario.multiplier;
  const dreamImpact = calculateDreamImpactFromSalaryChange(currentSalary, newSalary, dreamGoals);

  return {
    type: 'entrepreneurial',
    title: 'Start Your Own Business',
    description: 'Launch a business in your area of expertise',
    salaryIncrease: newSalary - currentSalary,
    dreamImpact,
    requirements: [
      'Business plan development',
      '6-12 months emergency fund',
      'Market validation',
      'Initial customer acquisition',
      'Legal/financial setup'
    ],
    effort: 'very high',
    probability: successScenario.probability,
    timeframe: '2-5 years to profitability',
    risks: ['Income volatility', 'No guaranteed salary', 'Higher stress']
  };
}

/**
 * Calculate consulting scenario
 */
function calculateConsultingScenario(currentRole, age, currentSalary, industry, dreamGoals) {
  const consultingMultiplier = 1.4; // 40% increase typical for consulting
  const newSalary = currentSalary * consultingMultiplier;
  const dreamImpact = calculateDreamImpactFromSalaryChange(currentSalary, newSalary, dreamGoals);

  return {
    type: 'consulting',
    title: 'Transition to Consulting',
    description: 'Leverage expertise as an independent consultant',
    salaryIncrease: newSalary - currentSalary,
    dreamImpact,
    requirements: [
      'Strong professional network',
      'Proven track record',
      'Business development skills',
      'Client management experience',
      'Financial cushion for variability'
    ],
    effort: 'high',
    probability: 0.6,
    timeframe: '6-12 months to establish'
  };
}

/**
 * Calculate dream impact from salary change
 */
function calculateDreamImpactFromSalaryChange(oldSalary, newSalary, dreamGoals) {
  if (!dreamGoals) return { yearsSaved: 0 };

  const salaryIncrease = newSalary - oldSalary;
  const annualSavingsIncrease = salaryIncrease * 0.7 * 0.15; // After tax, 15% savings rate
  const remainingAmount = (dreamGoals.targetAmount || 500000) - (dreamGoals.currentSaved || 0);
  const currentMonthlySavings = (dreamGoals.monthlySavings || 2000) * 12;
  
  const oldYearsToGoal = remainingAmount / currentMonthlySavings;
  const newYearsToGoal = remainingAmount / (currentMonthlySavings + annualSavingsIncrease);
  const yearsSaved = oldYearsToGoal - newYearsToGoal;

  return {
    yearsSaved: Math.max(0, yearsSaved),
    newTargetAge: (dreamGoals.currentAge || 32) + newYearsToGoal,
    additionalAnnualSavings: annualSavingsIncrease
  };
}

/**
 * Generate career recommendations
 */
function generateCareerRecommendations(careerPath, dreamGoals, industry) {
  const recommendations = [];

  // Skill development recommendations
  const skillDemand = INDUSTRY_FACTORS[industry]?.skillDemand || [];
  if (skillDemand.length > 0) {
    recommendations.push({
      type: 'skill_development',
      title: 'Develop High-Demand Skills',
      description: `Focus on ${skillDemand.slice(0, 2).join(' and ')} to accelerate promotions`,
      impact: 'Faster promotion timeline',
      effort: 'medium',
      timeframe: '3-6 months'
    });
  }

  // Network building
  recommendations.push({
    type: 'networking',
    title: 'Strategic Relationship Building',
    description: 'Build relationships with decision makers and industry leaders',
    impact: 'Access to hidden opportunities',
    effort: 'low',
    timeframe: 'ongoing'
  });

  // Performance optimization
  recommendations.push({
    type: 'performance',
    title: 'Exceed Performance Expectations',
    description: 'Consistently deliver 20% above expectations to accelerate promotions',
    impact: 'Faster promotion timeline',
    effort: 'medium',
    timeframe: '6-12 months'
  });

  return recommendations;
}

/**
 * Generate scenario summary
 */
function generateScenarioSummary(scenarios, dreamGoals) {
  const bestScenario = scenarios[0];
  const dreamName = dreamGoals?.name || 'financial goal';
  
  return {
    bestOption: bestScenario?.title || 'Career optimization',
    maxYearsSaved: bestScenario?.dreamImpact?.yearsSaved || 0,
    totalScenarios: scenarios.length,
    recommendation: `The ${bestScenario?.title} path could achieve your ${dreamName} ${Math.round(bestScenario?.dreamImpact?.yearsSaved || 0)} years earlier.`
  };
}

/**
 * Assess scenario risks
 */
function assessScenarioRisks(scenarios) {
  return {
    highRisk: scenarios.filter(s => s.effort === 'very high' || s.probability < 0.3).length,
    mediumRisk: scenarios.filter(s => s.effort === 'high' && s.probability >= 0.3).length,
    lowRisk: scenarios.filter(s => s.effort === 'medium' || s.effort === 'low').length,
    advice: 'Consider mixing low-risk steady progression with selective high-impact moves'
  };
}

/**
 * Get market outlook
 */
function getMarketOutlook(growthRate) {
  if (growthRate > 0.08) return 'excellent';
  if (growthRate > 0.05) return 'good';
  if (growthRate > 0.02) return 'stable';
  return 'challenging';
}

/**
 * Get career advice
 */
function getCareerAdvice(currentRole, industry, age) {
  const advice = [];

  if (age < 30) {
    advice.push('Focus on skill building and finding your specialty');
    advice.push('Take on challenging projects to prove capabilities');
  } else if (age < 40) {
    advice.push('Seek leadership opportunities and expand your network');
    advice.push('Consider strategic moves for maximum career acceleration');
  } else if (age < 50) {
    advice.push('Leverage experience for senior roles or consulting opportunities');
    advice.push('Focus on high-impact contributions and mentoring others');
  } else {
    advice.push('Consider executive roles or transition to advisory positions');
    advice.push('Monetize your expertise through consulting or board positions');
  }

  return advice;
}

/**
 * Generate generic trajectory for unknown industries
 */
function generateGenericTrajectory(currentRole, age, currentSalary, dreamGoals) {
  const path = [];
  let salary = currentSalary;
  
  // Simple 3% annual growth projection
  for (let year = 0; year <= 30; year++) {
    path.push({
      age: age + year,
      role: year < 5 ? currentRole : `Senior ${currentRole}`,
      salary: Math.round(salary * Math.pow(1.03, year)),
      year
    });
  }

  return {
    currentPosition: { role: currentRole, age, salary: currentSalary },
    projections: { typical: path, optimistic: path },
    dreamImpacts: {
      typical: { message: 'Complete your profile for detailed projections' }
    },
    industryInsights: {
      growthRate: 0.03,
      marketOutlook: 'stable',
      careerAdvice: ['Focus on performance', 'Build valuable skills', 'Expand your network']
    },
    recommendations: []
  };
}

/**
 * Utility functions
 */
export const CareerProjectionUtils = {
  formatSalary: (amount) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount),

  formatYears: (years) => {
    if (years < 1) return `${Math.round(years * 12)} months`;
    return years === 1 ? '1 year' : `${Math.round(years)} years`;
  },

  getProgressionProbability: (role, industry) => {
    const data = CAREER_PROGRESSION_DATA[industry]?.typical?.[role];
    return data?.probability || 0.5;
  },

  validateCareerData: (role, age, salary, industry) => {
    const errors = [];
    
    if (!role || role.trim() === '') {
      errors.push('Job title is required');
    }
    
    if (!age || age < 18 || age > 65) {
      errors.push('Age must be between 18 and 65');
    }
    
    if (!salary || salary < 20000 || salary > 1000000) {
      errors.push('Salary must be between $20,000 and $1,000,000');
    }
    
    return { isValid: errors.length === 0, errors };
  }
};

export default {
  calculateCareerTrajectory,
  whatIfScenarios,
  CareerProjectionUtils,
  CAREER_PROGRESSION_DATA,
  INDUSTRY_FACTORS
};
