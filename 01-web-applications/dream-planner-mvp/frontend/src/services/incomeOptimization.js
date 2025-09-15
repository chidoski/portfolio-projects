/**
 * Income Optimization Service
 * Provides personalized income increase suggestions based on user profile
 * Includes real salary data, career progression paths, and effort/impact analysis
 */

/**
 * Industry salary data with geographic adjustments
 * Data sources: Bureau of Labor Statistics, Glassdoor, PayScale (2024)
 */
const SALARY_DATA = {
  'Marketing & Advertising': {
    positions: {
      'Marketing Coordinator': { 
        base: 45000, 
        range: [38000, 55000],
        experience: 'entry',
        nextRole: 'Marketing Specialist'
      },
      'Marketing Specialist': { 
        base: 55000, 
        range: [48000, 65000],
        experience: '1-3 years',
        nextRole: 'Senior Marketing Specialist'
      },
      'Senior Marketing Specialist': { 
        base: 68000, 
        range: [58000, 78000],
        experience: '3-5 years',
        nextRole: 'Marketing Manager'
      },
      'Marketing Manager': { 
        base: 85000, 
        range: [72000, 98000],
        experience: '5-7 years',
        nextRole: 'Senior Marketing Manager'
      },
      'Senior Marketing Manager': { 
        base: 110000, 
        range: [95000, 125000],
        experience: '7-10 years',
        nextRole: 'Marketing Director'
      },
      'Marketing Director': { 
        base: 140000, 
        range: [120000, 165000],
        experience: '10-15 years',
        nextRole: 'VP Marketing'
      },
      'VP Marketing': { 
        base: 185000, 
        range: [155000, 220000],
        experience: '15+ years',
        nextRole: 'CMO'
      },
      'CMO': { 
        base: 250000, 
        range: [200000, 350000],
        experience: '20+ years',
        nextRole: null
      }
    },
    freelanceRates: {
      'Marketing Strategy': { hourly: [75, 150], project: [3000, 15000] },
      'Content Marketing': { hourly: [50, 120], project: [2000, 8000] },
      'Social Media Management': { hourly: [35, 85], monthly: [1500, 5000] },
      'Email Marketing': { hourly: [45, 100], project: [1500, 6000] },
      'SEO/SEM': { hourly: [60, 140], monthly: [2000, 8000] },
      'Brand Consulting': { hourly: [100, 200], project: [5000, 25000] }
    },
    sideGigs: {
      'Social Media Consulting': { monthly: [800, 2500], effort: 'low' },
      'Content Creation': { monthly: [600, 2000], effort: 'medium' },
      'Marketing Course Creation': { monthly: [1000, 4000], effort: 'high' },
      'Brand Strategy Workshops': { monthly: [1200, 3500], effort: 'medium' }
    }
  },

  'Technology': {
    positions: {
      'Junior Developer': { 
        base: 65000, 
        range: [55000, 75000],
        experience: 'entry',
        nextRole: 'Software Developer'
      },
      'Software Developer': { 
        base: 85000, 
        range: [75000, 95000],
        experience: '2-4 years',
        nextRole: 'Senior Developer'
      },
      'Senior Developer': { 
        base: 115000, 
        range: [100000, 130000],
        experience: '5-8 years',
        nextRole: 'Lead Developer'
      },
      'Lead Developer': { 
        base: 140000, 
        range: [125000, 155000],
        experience: '8-12 years',
        nextRole: 'Engineering Manager'
      },
      'Engineering Manager': { 
        base: 165000, 
        range: [145000, 185000],
        experience: '10+ years',
        nextRole: 'Director of Engineering'
      }
    },
    freelanceRates: {
      'Web Development': { hourly: [75, 200], project: [5000, 50000] },
      'Mobile App Development': { hourly: [80, 180], project: [8000, 75000] },
      'DevOps Consulting': { hourly: [100, 250], project: [10000, 100000] },
      'Technical Writing': { hourly: [50, 120], project: [2000, 15000] }
    }
  },

  'Finance': {
    positions: {
      'Financial Analyst': { 
        base: 70000, 
        range: [60000, 80000],
        experience: 'entry',
        nextRole: 'Senior Financial Analyst'
      },
      'Senior Financial Analyst': { 
        base: 95000, 
        range: [85000, 105000],
        experience: '3-5 years',
        nextRole: 'Finance Manager'
      },
      'Finance Manager': { 
        base: 120000, 
        range: [105000, 135000],
        experience: '5-8 years',
        nextRole: 'Finance Director'
      },
      'Finance Director': { 
        base: 155000, 
        range: [135000, 175000],
        experience: '8+ years',
        nextRole: 'CFO'
      }
    },
    freelanceRates: {
      'Financial Planning': { hourly: [75, 150], project: [3000, 20000] },
      'Tax Preparation': { hourly: [50, 100], seasonal: [5000, 25000] },
      'Bookkeeping': { hourly: [35, 75], monthly: [800, 3000] }
    }
  },

  'Sales': {
    positions: {
      'Sales Representative': { 
        base: 55000, 
        range: [45000, 75000],
        commission: [15000, 50000],
        experience: 'entry',
        nextRole: 'Senior Sales Representative'
      },
      'Senior Sales Representative': { 
        base: 70000, 
        range: [60000, 85000],
        commission: [25000, 75000],
        experience: '2-5 years',
        nextRole: 'Sales Manager'
      },
      'Sales Manager': { 
        base: 95000, 
        range: [80000, 110000],
        commission: [30000, 100000],
        experience: '5-8 years',
        nextRole: 'Sales Director'
      }
    }
  },

  'Healthcare': {
    positions: {
      'Registered Nurse': { 
        base: 75000, 
        range: [65000, 85000],
        experience: 'entry',
        nextRole: 'Charge Nurse'
      },
      'Nurse Practitioner': { 
        base: 110000, 
        range: [95000, 125000],
        experience: '5+ years',
        nextRole: 'Clinical Director'
      }
    }
  },

  'Education': {
    positions: {
      'Teacher': { 
        base: 50000, 
        range: [40000, 65000],
        experience: 'entry',
        nextRole: 'Lead Teacher'
      },
      'Principal': { 
        base: 95000, 
        range: [80000, 120000],
        experience: '10+ years',
        nextRole: 'Superintendent'
      }
    }
  }
};

/**
 * Geographic cost of living and salary adjustments
 */
const LOCATION_MULTIPLIERS = {
  // High cost areas
  'California': 1.35,
  'New York': 1.25,
  'Massachusetts': 1.20,
  'Washington': 1.18,
  'Connecticut': 1.15,
  'Hawaii': 1.30,
  'New Jersey': 1.15,
  'Maryland': 1.12,

  // Medium cost areas
  'Colorado': 1.10,
  'Illinois': 1.05,
  'Virginia': 1.08,
  'Texas': 1.00,
  'Florida': 0.95,
  'Georgia': 0.90,
  'North Carolina': 0.85,
  'Arizona': 0.90,

  // Lower cost areas
  'Ohio': 0.80,
  'Indiana': 0.75,
  'Kentucky': 0.70,
  'Alabama': 0.70,
  'Mississippi': 0.65,
  'West Virginia': 0.65,
  'Oklahoma': 0.70,
  'Arkansas': 0.68
};

/**
 * Generate personalized income optimization suggestions
 * @param {Object} userProfile - User's employment and demographic info
 * @param {Object} financialProfile - User's complete financial profile
 * @param {Object} dreamGoals - User's dream goals and timelines
 * @returns {Object} Comprehensive income optimization plan
 */
export function generateIncomeOptimization(userProfile, financialProfile, dreamGoals) {
  const {
    employment: { industry, position, employer },
    location: { state },
    income: { gross: { annual: currentSalary } },
    age
  } = userProfile;

  const locationMultiplier = LOCATION_MULTIPLIERS[state] || 1.0;
  const industryData = SALARY_DATA[industry];

  if (!industryData) {
    return generateGenericOptimization(userProfile, financialProfile, dreamGoals);
  }

  const suggestions = [];

  // 1. Career Advancement Opportunities
  const careerSuggestions = generateCareerAdvancement(
    position, 
    currentSalary, 
    industryData, 
    locationMultiplier,
    dreamGoals
  );
  suggestions.push(...careerSuggestions);

  // 2. Freelance/Consulting Opportunities
  const freelanceSuggestions = generateFreelanceOpportunities(
    industryData,
    currentSalary,
    locationMultiplier,
    dreamGoals
  );
  suggestions.push(...freelanceSuggestions);

  // 3. Side Gig Opportunities
  const sideGigSuggestions = generateSideGigOpportunities(
    industryData,
    currentSalary,
    age,
    dreamGoals
  );
  suggestions.push(...sideGigSuggestions);

  // 4. Skill Development for Income Growth
  const skillSuggestions = generateSkillDevelopment(
    industry,
    position,
    currentSalary,
    dreamGoals
  );
  suggestions.push(...skillSuggestions);

  // 5. Negotiation Opportunities
  const negotiationSuggestions = generateNegotiationOpportunities(
    position,
    currentSalary,
    industryData,
    locationMultiplier,
    dreamGoals
  );
  suggestions.push(...negotiationSuggestions);

  // Sort by impact potential
  suggestions.sort((a, b) => b.annualImpact - a.annualImpact);

  return {
    totalSuggestions: suggestions.length,
    potentialAnnualIncrease: suggestions.reduce((sum, s) => sum + s.annualImpact, 0),
    suggestions,
    effortMatrix: categorizeByEffort(suggestions),
    timelineImpact: calculateTimelineImpact(suggestions, dreamGoals),
    industryInsights: getIndustryInsights(industry, position, currentSalary, locationMultiplier)
  };
}

/**
 * Generate career advancement suggestions
 */
function generateCareerAdvancement(position, currentSalary, industryData, locationMultiplier, dreamGoals) {
  const suggestions = [];
  const positions = industryData.positions;
  const currentRole = positions[position];

  if (!currentRole) {
    return suggestions;
  }

  const nextRole = currentRole.nextRole;
  if (nextRole && positions[nextRole]) {
    const nextRoleData = positions[nextRole];
    const adjustedSalary = nextRoleData.base * locationMultiplier;
    const salaryIncrease = adjustedSalary - currentSalary;
    const timelineImpact = calculateDreamTimelineImpact(salaryIncrease, dreamGoals);

    suggestions.push({
      type: 'career_advancement',
      title: `Advance to ${nextRole}`,
      description: `Moving to ${nextRole} typically adds $${salaryIncrease.toLocaleString()}/year`,
      annualImpact: salaryIncrease,
      monthlyImpact: salaryIncrease / 12,
      effort: getCareerAdvancementEffort(currentRole.experience, nextRoleData.experience),
      timeframe: getCareerAdvancementTimeframe(currentRole.experience, nextRoleData.experience),
      probability: 0.7,
      requirements: getAdvancementRequirements(position, nextRole),
      timelineImpact,
      actionSteps: [
        'Document your current achievements and quantify impact',
        'Identify skill gaps for the next role',
        'Seek additional responsibilities in current position',
        'Build relationships with decision makers',
        'Create a promotion timeline with your manager'
      ]
    });
  }

  // Internal promotion opportunity
  const raiseAmount = currentSalary * 0.08; // 8% raise
  const raiseTimelineImpact = calculateDreamTimelineImpact(raiseAmount, dreamGoals);
  
  suggestions.push({
    type: 'salary_raise',
    title: 'Request Salary Increase',
    description: `Ask for a raise - market rate suggests potential $${raiseAmount.toLocaleString()}/year increase`,
    annualImpact: raiseAmount,
    monthlyImpact: raiseAmount / 12,
    effort: 'low',
    timeframe: '1-3 months',
    probability: 0.6,
    requirements: ['Performance documentation', 'Market research', 'Meeting preparation'],
    timelineImpact: raiseTimelineImpact,
    actionSteps: [
      'Research market salaries for your role',
      'Document your achievements and value added',
      'Schedule meeting with your manager',
      'Present compelling case with data',
      'Be prepared to negotiate'
    ]
  });

  return suggestions;
}

/**
 * Generate freelance opportunities
 */
function generateFreelanceOpportunities(industryData, currentSalary, locationMultiplier, dreamGoals) {
  const suggestions = [];
  
  if (!industryData.freelanceRates) {
    return suggestions;
  }

  Object.entries(industryData.freelanceRates).forEach(([service, rates]) => {
    const monthlyEarnings = calculateFreelanceEarnings(rates, 'part-time');
    const annualEarnings = monthlyEarnings * 12;
    const timelineImpact = calculateDreamTimelineImpact(annualEarnings, dreamGoals);

    suggestions.push({
      type: 'freelance',
      title: `Freelance ${service}`,
      description: `${service} consulting could add $${monthlyEarnings.toLocaleString()}/month - ${timelineImpact.description}`,
      annualImpact: annualEarnings,
      monthlyImpact: monthlyEarnings,
      effort: 'medium',
      timeframe: '2-6 months',
      probability: 0.5,
      requirements: ['Portfolio development', 'Client acquisition', 'Time management'],
      timelineImpact,
      actionSteps: [
        'Build portfolio showcasing relevant work',
        'Create professional profiles on freelance platforms',
        'Network with potential clients',
        'Start with small projects to build reputation',
        'Gradually increase rates as experience grows'
      ]
    });
  });

  return suggestions;
}

/**
 * Generate side gig opportunities
 */
function generateSideGigOpportunities(industryData, currentSalary, age, dreamGoals) {
  const suggestions = [];

  if (!industryData.sideGigs) {
    return suggestions;
  }

  Object.entries(industryData.sideGigs).forEach(([gig, data]) => {
    const monthlyEarnings = (data.monthly[0] + data.monthly[1]) / 2;
    const annualEarnings = monthlyEarnings * 12;
    const timelineImpact = calculateDreamTimelineImpact(annualEarnings, dreamGoals);

    suggestions.push({
      type: 'side_gig',
      title: gig,
      description: `${gig} could generate $${monthlyEarnings.toLocaleString()}/month additional income`,
      annualImpact: annualEarnings,
      monthlyImpact: monthlyEarnings,
      effort: data.effort,
      timeframe: '1-4 months',
      probability: 0.6,
      requirements: getGigRequirements(gig),
      timelineImpact,
      actionSteps: getGigActionSteps(gig)
    });
  });

  return suggestions;
}

/**
 * Generate skill development suggestions
 */
function generateSkillDevelopment(industry, position, currentSalary, dreamGoals) {
  const skillMap = {
    'Marketing & Advertising': [
      { skill: 'Google Analytics Certification', impact: 5000, effort: 'low' },
      { skill: 'Advanced Excel/Data Analysis', impact: 8000, effort: 'medium' },
      { skill: 'Marketing Automation (HubSpot)', impact: 12000, effort: 'medium' },
      { skill: 'Digital Marketing Strategy', impact: 15000, effort: 'high' },
      { skill: 'Project Management (PMP)', impact: 10000, effort: 'high' }
    ],
    'Technology': [
      { skill: 'Cloud Certifications (AWS/Azure)', impact: 15000, effort: 'medium' },
      { skill: 'Machine Learning/AI', impact: 25000, effort: 'high' },
      { skill: 'DevOps/Kubernetes', impact: 20000, effort: 'high' },
      { skill: 'Data Science/Python', impact: 18000, effort: 'medium' }
    ],
    'Finance': [
      { skill: 'CFA Certification', impact: 20000, effort: 'high' },
      { skill: 'Financial Modeling', impact: 12000, effort: 'medium' },
      { skill: 'Data Analytics/SQL', impact: 15000, effort: 'medium' }
    ]
  };

  const skills = skillMap[industry] || [];
  
  return skills.slice(0, 3).map(skillData => {
    const timelineImpact = calculateDreamTimelineImpact(skillData.impact, dreamGoals);
    
    return {
      type: 'skill_development',
      title: `Learn ${skillData.skill}`,
      description: `${skillData.skill} certification typically increases salary by $${skillData.impact.toLocaleString()}/year`,
      annualImpact: skillData.impact,
      monthlyImpact: skillData.impact / 12,
      effort: skillData.effort,
      timeframe: skillData.effort === 'low' ? '1-3 months' : skillData.effort === 'medium' ? '3-6 months' : '6-12 months',
      probability: 0.8,
      requirements: ['Time investment', 'Study materials', 'Certification exam'],
      timelineImpact,
      actionSteps: [
        'Research certification requirements',
        'Create study schedule',
        'Enroll in training program or self-study',
        'Take practice exams',
        'Schedule and pass certification exam',
        'Update resume and LinkedIn profile'
      ]
    };
  });
}

/**
 * Generate negotiation opportunities
 */
function generateNegotiationOpportunities(position, currentSalary, industryData, locationMultiplier, dreamGoals) {
  const suggestions = [];
  const marketRate = getMarketRate(position, industryData, locationMultiplier);
  
  if (marketRate > currentSalary) {
    const gap = marketRate - currentSalary;
    const timelineImpact = calculateDreamTimelineImpact(gap, dreamGoals);
    
    suggestions.push({
      type: 'market_adjustment',
      title: 'Market Rate Adjustment',
      description: `Your salary is below market rate - potential $${gap.toLocaleString()}/year adjustment`,
      annualImpact: gap,
      monthlyImpact: gap / 12,
      effort: 'low',
      timeframe: '1-2 months',
      probability: 0.7,
      requirements: ['Market research', 'Performance documentation'],
      timelineImpact,
      actionSteps: [
        'Gather salary data from multiple sources',
        'Document your performance and contributions',
        'Prepare negotiation strategy',
        'Schedule formal discussion with manager',
        'Present data-driven case for adjustment'
      ]
    });
  }

  return suggestions;
}

/**
 * Calculate timeline impact for dreams
 */
function calculateDreamTimelineImpact(annualIncrease, dreamGoals) {
  if (!dreamGoals || !dreamGoals.targetAmount || !dreamGoals.currentSaved) {
    return { yearsReduced: 0, description: 'Impact on dream timeline' };
  }

  const remaining = dreamGoals.targetAmount - dreamGoals.currentSaved;
  const currentMonthlySavings = dreamGoals.monthlySavings || 1000;
  const newMonthlySavings = currentMonthlySavings + (annualIncrease * 0.7) / 12; // After taxes

  const currentYears = remaining / (currentMonthlySavings * 12);
  const newYears = remaining / (newMonthlySavings * 12);
  const yearsReduced = Math.max(0, currentYears - newYears);

  const dreamName = dreamGoals.name || 'goal';
  const currentAge = dreamGoals.currentAge || 35;
  const newTargetAge = Math.max(currentAge, (dreamGoals.targetAge || currentAge + currentYears) - yearsReduced);

  return {
    yearsReduced: Math.round(yearsReduced * 10) / 10,
    description: yearsReduced > 0.5 
      ? `that's ${Math.round(yearsReduced)} years off your ${dreamName} timeline`
      : `accelerates your ${dreamName} achievement`,
    newTargetAge: Math.round(newTargetAge),
    originalTargetAge: dreamGoals.targetAge || currentAge + currentYears
  };
}

/**
 * Categorize suggestions by effort level
 */
function categorizeByEffort(suggestions) {
  return {
    low: suggestions.filter(s => s.effort === 'low'),
    medium: suggestions.filter(s => s.effort === 'medium'),
    high: suggestions.filter(s => s.effort === 'high')
  };
}

/**
 * Calculate total timeline impact
 */
function calculateTimelineImpact(suggestions, dreamGoals) {
  const totalAnnualIncrease = suggestions.reduce((sum, s) => sum + s.annualImpact, 0);
  return calculateDreamTimelineImpact(totalAnnualIncrease, dreamGoals);
}

/**
 * Helper functions
 */
function getMarketRate(position, industryData, locationMultiplier) {
  const positionData = industryData.positions[position];
  return positionData ? positionData.base * locationMultiplier : 0;
}

function calculateFreelanceEarnings(rates, commitment) {
  if (rates.monthly) {
    return commitment === 'part-time' ? rates.monthly[0] : rates.monthly[1];
  }
  if (rates.hourly) {
    const hoursPerMonth = commitment === 'part-time' ? 20 : 40;
    return rates.hourly[0] * hoursPerMonth;
  }
  return 1000; // Default estimate
}

function getCareerAdvancementEffort(currentExp, nextExp) {
  const experienceLevels = ['entry', '1-3 years', '3-5 years', '5-7 years', '7-10 years', '10-15 years', '15+ years'];
  const currentIndex = experienceLevels.indexOf(currentExp);
  const nextIndex = experienceLevels.indexOf(nextExp);
  
  if (nextIndex - currentIndex <= 1) return 'medium';
  if (nextIndex - currentIndex <= 2) return 'high';
  return 'high';
}

function getCareerAdvancementTimeframe(currentExp, nextExp) {
  const gap = getExperienceGap(currentExp, nextExp);
  if (gap <= 1) return '6 months - 2 years';
  if (gap <= 2) return '1-3 years';
  return '2-5 years';
}

function getExperienceGap(currentExp, nextExp) {
  const experienceLevels = ['entry', '1-3 years', '3-5 years', '5-7 years', '7-10 years', '10-15 years', '15+ years'];
  const currentIndex = experienceLevels.indexOf(currentExp);
  const nextIndex = experienceLevels.indexOf(nextExp);
  return Math.max(0, nextIndex - currentIndex);
}

function getAdvancementRequirements(currentRole, nextRole) {
  return [
    'Demonstrated leadership skills',
    'Strong performance in current role',
    'Additional certifications or training',
    'Expanded scope of responsibilities',
    'Stakeholder management experience'
  ];
}

function getGigRequirements(gig) {
  const requirements = {
    'Social Media Consulting': ['Portfolio of successful campaigns', 'Understanding of analytics', 'Content creation skills'],
    'Content Creation': ['Writing skills', 'SEO knowledge', 'Time management'],
    'Marketing Course Creation': ['Subject matter expertise', 'Teaching ability', 'Video production skills'],
    'Brand Strategy Workshops': ['Presentation skills', 'Strategic thinking', 'Client management']
  };
  
  return requirements[gig] || ['Relevant skills', 'Time availability', 'Client acquisition'];
}

function getGigActionSteps(gig) {
  const steps = {
    'Social Media Consulting': [
      'Create case studies from current work',
      'Build personal brand on social media',
      'Network with small business owners',
      'Offer free consultations to build portfolio'
    ],
    'Content Creation': [
      'Develop writing samples in your niche',
      'Create profiles on content platforms',
      'Study SEO best practices',
      'Connect with content agencies'
    ]
  };
  
  return steps[gig] || [
    'Identify target market',
    'Develop service offerings',
    'Create marketing materials',
    'Start networking and prospecting'
  ];
}

function getIndustryInsights(industry, position, currentSalary, locationMultiplier) {
  return {
    industryGrowth: getIndustryGrowthRate(industry),
    marketTrends: getIndustryTrends(industry),
    topSkills: getTopSkillsForIndustry(industry),
    salaryTrend: getSalaryTrend(industry),
    locationAdvantage: locationMultiplier > 1.1 ? 'high' : locationMultiplier < 0.9 ? 'low' : 'moderate'
  };
}

function getIndustryGrowthRate(industry) {
  const growthRates = {
    'Marketing & Advertising': 0.06,
    'Technology': 0.11,
    'Finance': 0.05,
    'Healthcare': 0.09,
    'Sales': 0.04
  };
  return growthRates[industry] || 0.05;
}

function getIndustryTrends(industry) {
  const trends = {
    'Marketing & Advertising': ['Digital transformation', 'AI and automation', 'Data-driven marketing', 'Privacy-first strategies'],
    'Technology': ['Cloud computing', 'AI/ML', 'Cybersecurity', 'Remote work tools'],
    'Finance': ['Fintech innovation', 'Digital banking', 'Regulatory compliance', 'ESG investing']
  };
  return trends[industry] || ['Industry digitization', 'Remote work adoption', 'Skill specialization'];
}

function getTopSkillsForIndustry(industry) {
  const skills = {
    'Marketing & Advertising': ['Data Analytics', 'Marketing Automation', 'Content Strategy', 'SEO/SEM'],
    'Technology': ['Cloud Platforms', 'Programming Languages', 'DevOps', 'Security'],
    'Finance': ['Financial Modeling', 'Data Analysis', 'Risk Management', 'Compliance']
  };
  return skills[industry] || ['Communication', 'Problem Solving', 'Technology Proficiency'];
}

function getSalaryTrend(industry) {
  return 'increasing'; // Simplified for demo
}

/**
 * Generate generic optimization for unknown industries
 */
function generateGenericOptimization(userProfile, financialProfile, dreamGoals) {
  const currentSalary = userProfile.income.gross.annual;
  
  return {
    totalSuggestions: 3,
    potentialAnnualIncrease: currentSalary * 0.25,
    suggestions: [
      {
        type: 'salary_raise',
        title: 'Request Salary Increase',
        description: 'Ask for a performance-based raise',
        annualImpact: currentSalary * 0.08,
        effort: 'low',
        timeframe: '1-3 months',
        probability: 0.6
      },
      {
        type: 'side_gig',
        title: 'Start Side Business',
        description: 'Leverage your skills for additional income',
        annualImpact: 12000,
        effort: 'medium',
        timeframe: '3-6 months',
        probability: 0.5
      },
      {
        type: 'skill_development',
        title: 'Develop High-Value Skills',
        description: 'Invest in skills that increase market value',
        annualImpact: currentSalary * 0.15,
        effort: 'high',
        timeframe: '6-12 months',
        probability: 0.7
      }
    ],
    effortMatrix: {},
    timelineImpact: { yearsReduced: 2, description: 'accelerates financial goals' },
    industryInsights: {
      industryGrowth: 0.05,
      marketTrends: ['Digital transformation', 'Remote work', 'Skill specialization'],
      topSkills: ['Communication', 'Technology', 'Leadership'],
      salaryTrend: 'stable'
    }
  };
}

export { SALARY_DATA, LOCATION_MULTIPLIERS };

export default {
  generateIncomeOptimization,
  SALARY_DATA,
  LOCATION_MULTIPLIERS
};
