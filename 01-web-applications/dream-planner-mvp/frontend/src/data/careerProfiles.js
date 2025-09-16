/**
 * Career Profiles Data
 * Contains typical growth patterns for common occupations
 * Used to provide credible, occupation-specific income projections
 */

export const careerProfiles = {
  // ==================== EDUCATION ====================
  'teacher': {
    name: 'Teacher',
    category: 'Education',
    description: 'Public and private school teachers',
    growthPattern: {
      'early-career': { annualGrowth: 0.035, description: '3.5% - Building experience and tenure' },
      'mid-career': { annualGrowth: 0.02, description: '2% - Steady progression, step increases' },
      'peak-earning': { annualGrowth: 0.015, description: '1.5% - Senior positions, department head' },
      'pre-retirement': { annualGrowth: 0.01, description: '1% - Focus on stability over growth' }
    },
    stability: 'high', // Job security level
    pensionBenefit: true, // Often has pension benefits
    typicalSalaryRange: { min: 40000, max: 80000 },
    peakSalaryRange: { min: 60000, max: 100000 },
    notes: 'Growth often tied to years of service and additional certifications. Summer breaks may allow for supplemental income.'
  },

  'professor': {
    name: 'Professor/Academic',
    category: 'Education',
    description: 'College and university faculty',
    growthPattern: {
      'early-career': { annualGrowth: 0.05, description: '5% - Assistant professor, building research' },
      'mid-career': { annualGrowth: 0.04, description: '4% - Associate professor, tenure track' },
      'peak-earning': { annualGrowth: 0.03, description: '3% - Full professor, research grants' },
      'pre-retirement': { annualGrowth: 0.02, description: '2% - Senior positions, emeritus prep' }
    },
    stability: 'high',
    pensionBenefit: true,
    typicalSalaryRange: { min: 55000, max: 120000 },
    peakSalaryRange: { min: 80000, max: 180000 },
    notes: 'Tenure provides job security. Income may include research grants and consulting.'
  },

  // ==================== TECHNOLOGY ====================
  'software engineer': {
    name: 'Software Engineer',
    category: 'Technology',
    description: 'Software developers and engineers',
    growthPattern: {
      'early-career': { annualGrowth: 0.08, description: '8% - Rapid skill acquisition and level progression' },
      'mid-career': { annualGrowth: 0.05, description: '5% - Senior engineer, tech lead roles' },
      'peak-earning': { annualGrowth: 0.03, description: '3% - Principal engineer, architect roles' },
      'pre-retirement': { annualGrowth: 0.02, description: '2% - Consulting or reduced hours' }
    },
    stability: 'medium-high',
    pensionBenefit: false,
    typicalSalaryRange: { min: 70000, max: 180000 },
    peakSalaryRange: { min: 120000, max: 400000 },
    notes: 'High growth potential, especially at major tech companies. Equity compensation can significantly boost total comp.'
  },

  'data scientist': {
    name: 'Data Scientist',
    category: 'Technology',
    description: 'Data analysis and machine learning specialists',
    growthPattern: {
      'early-career': { annualGrowth: 0.07, description: '7% - High demand field, rapid advancement' },
      'mid-career': { annualGrowth: 0.05, description: '5% - Senior data scientist, team lead' },
      'peak-earning': { annualGrowth: 0.03, description: '3% - Principal scientist, research director' },
      'pre-retirement': { annualGrowth: 0.02, description: '2% - Consulting or advisory roles' }
    },
    stability: 'high',
    pensionBenefit: false,
    typicalSalaryRange: { min: 80000, max: 200000 },
    peakSalaryRange: { min: 130000, max: 350000 },
    notes: 'Hot field with strong growth. Advanced degrees can significantly boost earnings.'
  },

  'it manager': {
    name: 'IT Manager',
    category: 'Technology',
    description: 'Information technology management',
    growthPattern: {
      'early-career': { annualGrowth: 0.06, description: '6% - Team lead, project management' },
      'mid-career': { annualGrowth: 0.04, description: '4% - Department manager, strategic roles' },
      'peak-earning': { annualGrowth: 0.03, description: '3% - Director, VP of Technology' },
      'pre-retirement': { annualGrowth: 0.025, description: '2.5% - Senior leadership, consulting' }
    },
    stability: 'high',
    pensionBenefit: false,
    typicalSalaryRange: { min: 85000, max: 160000 },
    peakSalaryRange: { min: 120000, max: 250000 },
    notes: 'Management track provides steady growth. Strategic business skills increasingly important.'
  },

  // ==================== HEALTHCARE ====================
  'nurse': {
    name: 'Registered Nurse',
    category: 'Healthcare',
    description: 'Registered nurses in various specialties',
    growthPattern: {
      'early-career': { annualGrowth: 0.05, description: '5% - Building experience, specialization' },
      'mid-career': { annualGrowth: 0.05, description: '5% - Specialized roles, charge nurse' },
      'peak-earning': { annualGrowth: 0.04, description: '4% - Nurse manager, advanced practice' },
      'pre-retirement': { annualGrowth: 0.03, description: '3% - Senior roles, mentoring' }
    },
    stability: 'very-high',
    pensionBenefit: true,
    typicalSalaryRange: { min: 60000, max: 90000 },
    peakSalaryRange: { min: 80000, max: 120000 },
    notes: 'Very stable career with consistent demand. Overtime and shift differentials can boost income significantly.'
  },

  'doctor': {
    name: 'Physician',
    category: 'Healthcare',
    description: 'Medical doctors in various specialties',
    growthPattern: {
      'early-career': { annualGrowth: 0.06, description: '6% - Residency to attending, building practice' },
      'mid-career': { annualGrowth: 0.04, description: '4% - Established practice, partnership track' },
      'peak-earning': { annualGrowth: 0.03, description: '3% - Partner, department head' },
      'pre-retirement': { annualGrowth: 0.02, description: '2% - Reduced hours, consulting' }
    },
    stability: 'very-high',
    pensionBenefit: false,
    typicalSalaryRange: { min: 200000, max: 350000 },
    peakSalaryRange: { min: 300000, max: 800000 },
    notes: 'High earning potential varies significantly by specialty. Malpractice insurance and education debt considerations.'
  },

  'healthcare professional': {
    name: 'Healthcare Professional',
    category: 'Healthcare',
    description: 'Physical therapists, pharmacists, medical technicians',
    growthPattern: {
      'early-career': { annualGrowth: 0.05, description: '5% - License building, specialization' },
      'mid-career': { annualGrowth: 0.05, description: '5% - Senior practitioner, team lead' },
      'peak-earning': { annualGrowth: 0.04, description: '4% - Department head, private practice' },
      'pre-retirement': { annualGrowth: 0.03, description: '3% - Consulting, part-time practice' }
    },
    stability: 'high',
    pensionBenefit: true,
    typicalSalaryRange: { min: 65000, max: 120000 },
    peakSalaryRange: { min: 90000, max: 150000 },
    notes: 'Stable healthcare sector with aging population driving demand. Licensing requirements provide job security.'
  },

  // ==================== BUSINESS & FINANCE ====================
  'accountant': {
    name: 'Accountant',
    category: 'Business & Finance',
    description: 'Public and corporate accountants',
    growthPattern: {
      'early-career': { annualGrowth: 0.05, description: '5% - CPA track, building experience' },
      'mid-career': { annualGrowth: 0.04, description: '4% - Senior accountant, manager roles' },
      'peak-earning': { annualGrowth: 0.03, description: '3% - Controller, partner track' },
      'pre-retirement': { annualGrowth: 0.025, description: '2.5% - CFO, consulting practice' }
    },
    stability: 'high',
    pensionBenefit: false,
    typicalSalaryRange: { min: 50000, max: 90000 },
    peakSalaryRange: { min: 80000, max: 180000 },
    notes: 'CPA certification significantly boosts earning potential. Tax season can provide additional income.'
  },

  'financial advisor': {
    name: 'Financial Advisor',
    category: 'Business & Finance',
    description: 'Financial planning and investment advisors',
    growthPattern: {
      'early-career': { annualGrowth: 0.08, description: '8% - Building client base, commission-heavy' },
      'mid-career': { annualGrowth: 0.06, description: '6% - Established book, recurring revenue' },
      'peak-earning': { annualGrowth: 0.04, description: '4% - Large book, team management' },
      'pre-retirement': { annualGrowth: 0.02, description: '2% - Book transition, reduced new business' }
    },
    stability: 'medium',
    pensionBenefit: false,
    typicalSalaryRange: { min: 60000, max: 150000 },
    peakSalaryRange: { min: 120000, max: 500000 },
    notes: 'Highly variable income based on assets under management and commission structure. Top performers earn significantly more.'
  },

  'sales manager': {
    name: 'Sales Manager',
    category: 'Business & Finance',
    description: 'Sales team leaders and business development',
    growthPattern: {
      'early-career': { annualGrowth: 0.07, description: '7% - Team building, quota achievement' },
      'mid-career': { annualGrowth: 0.05, description: '5% - Regional manager, larger territories' },
      'peak-earning': { annualGrowth: 0.04, description: '4% - VP Sales, strategic accounts' },
      'pre-retirement': { annualGrowth: 0.03, description: '3% - Senior leadership, consulting' }
    },
    stability: 'medium',
    pensionBenefit: false,
    typicalSalaryRange: { min: 70000, max: 140000 },
    peakSalaryRange: { min: 120000, max: 300000 },
    notes: 'Commission and bonus structure can create significant income variability. Performance-dependent career progression.'
  },

  'marketing manager': {
    name: 'Marketing Manager',
    category: 'Business & Finance',
    description: 'Marketing and brand management professionals',
    growthPattern: {
      'early-career': { annualGrowth: 0.06, description: '6% - Campaign management, brand building' },
      'mid-career': { annualGrowth: 0.04, description: '4% - Marketing director, strategic planning' },
      'peak-earning': { annualGrowth: 0.03, description: '3% - CMO, VP Marketing' },
      'pre-retirement': { annualGrowth: 0.025, description: '2.5% - Consulting, advisory roles' }
    },
    stability: 'medium-high',
    pensionBenefit: false,
    typicalSalaryRange: { min: 60000, max: 120000 },
    peakSalaryRange: { min: 100000, max: 200000 },
    notes: 'Digital marketing skills increasingly valuable. Agency vs. corporate paths offer different growth patterns.'
  },

  // ==================== ENTREPRENEURIAL ====================
  'small business owner': {
    name: 'Small Business Owner',
    category: 'Entrepreneurial',
    description: 'Independent business operators',
    growthPattern: {
      'early-career': { annualGrowth: 0.10, description: '10% - High growth potential, high risk' },
      'mid-career': { annualGrowth: 0.05, description: '5% - Established business, steady growth' },
      'peak-earning': { annualGrowth: 0.03, description: '3% - Mature business, optimization focus' },
      'pre-retirement': { annualGrowth: 0.02, description: '2% - Succession planning, exit strategy' }
    },
    stability: 'low',
    pensionBenefit: false,
    typicalSalaryRange: { min: 30000, max: 200000 },
    peakSalaryRange: { min: 50000, max: 1000000 },
    notes: 'Highly variable income with significant upside potential. Success depends on industry, market conditions, and execution.',
    volatility: 'high'
  },

  'freelancer': {
    name: 'Freelancer/Consultant',
    category: 'Entrepreneurial',
    description: 'Independent contractors and consultants',
    growthPattern: {
      'early-career': { annualGrowth: 0.08, description: '8% - Building reputation and client base' },
      'mid-career': { annualGrowth: 0.04, description: '4% - Premium pricing, repeat clients' },
      'peak-earning': { annualGrowth: 0.02, description: '2% - Selective projects, thought leadership' },
      'pre-retirement': { annualGrowth: 0.01, description: '1% - Reduced workload, legacy projects' }
    },
    stability: 'low',
    pensionBenefit: false,
    typicalSalaryRange: { min: 40000, max: 150000 },
    peakSalaryRange: { min: 80000, max: 400000 },
    notes: 'Income highly dependent on skills, network, and market demand. Requires strong business development skills.',
    volatility: 'high'
  },

  // ==================== PUBLIC SERVICE ====================
  'government employee': {
    name: 'Government Employee',
    category: 'Public Service',
    description: 'Federal, state, and local government workers',
    growthPattern: {
      'early-career': { annualGrowth: 0.03, description: '3% - Grade progression, step increases' },
      'mid-career': { annualGrowth: 0.03, description: '3% - Supervisory roles, specialized positions' },
      'peak-earning': { annualGrowth: 0.025, description: '2.5% - Senior executive service, department head' },
      'pre-retirement': { annualGrowth: 0.02, description: '2% - Focus on pension maximization' }
    },
    stability: 'very-high',
    pensionBenefit: true,
    typicalSalaryRange: { min: 45000, max: 100000 },
    peakSalaryRange: { min: 80000, max: 180000 },
    notes: 'Excellent job security and benefits. Pension system provides significant retirement value.'
  },

  'police officer': {
    name: 'Police Officer',
    category: 'Public Service',
    description: 'Law enforcement professionals',
    growthPattern: {
      'early-career': { annualGrowth: 0.04, description: '4% - Rank progression, specialized training' },
      'mid-career': { annualGrowth: 0.03, description: '3% - Detective, sergeant roles' },
      'peak-earning': { annualGrowth: 0.025, description: '2.5% - Lieutenant, captain positions' },
      'pre-retirement': { annualGrowth: 0.02, description: '2% - Senior command, early retirement option' }
    },
    stability: 'high',
    pensionBenefit: true,
    typicalSalaryRange: { min: 50000, max: 85000 },
    peakSalaryRange: { min: 70000, max: 130000 },
    notes: 'Overtime opportunities can significantly boost income. Early retirement options (20-25 years) with pension.'
  },

  // ==================== DEFAULT/OTHER ====================
  'other': {
    name: 'Other/General Professional',
    category: 'General',
    description: 'General professional roles',
    growthPattern: {
      'early-career': { annualGrowth: 0.05, description: '5% - Standard professional growth' },
      'mid-career': { annualGrowth: 0.03, description: '3% - Steady career progression' },
      'peak-earning': { annualGrowth: 0.025, description: '2.5% - Senior professional roles' },
      'pre-retirement': { annualGrowth: 0.02, description: '2% - Focus on stability' }
    },
    stability: 'medium',
    pensionBenefit: false,
    typicalSalaryRange: { min: 50000, max: 100000 },
    peakSalaryRange: { min: 75000, max: 150000 },
    notes: 'Generic professional growth pattern used when specific occupation is not recognized.'
  }
};

/**
 * Find career profile by occupation string
 * Uses fuzzy matching to find the best match
 */
export const findCareerProfile = (occupation) => {
  if (!occupation || typeof occupation !== 'string') {
    return careerProfiles.other;
  }

  const searchTerm = occupation.toLowerCase().trim();
  
  // Direct keyword matches
  const keywordMappings = {
    'teacher': 'teacher',
    'professor': 'professor',
    'educator': 'teacher',
    'instructor': 'teacher',
    'software': 'software engineer',
    'developer': 'software engineer',
    'programmer': 'software engineer',
    'engineer': 'software engineer',
    'data scientist': 'data scientist',
    'analyst': 'data scientist',
    'it': 'it manager',
    'technology': 'it manager',
    'nurse': 'nurse',
    'nursing': 'nurse',
    'doctor': 'doctor',
    'physician': 'doctor',
    'md': 'doctor',
    'healthcare': 'healthcare professional',
    'medical': 'healthcare professional',
    'therapist': 'healthcare professional',
    'pharmacist': 'healthcare professional',
    'accountant': 'accountant',
    'accounting': 'accountant',
    'cpa': 'accountant',
    'financial': 'financial advisor',
    'advisor': 'financial advisor',
    'sales': 'sales manager',
    'marketing': 'marketing manager',
    'business owner': 'small business owner',
    'entrepreneur': 'small business owner',
    'freelance': 'freelancer',
    'consultant': 'freelancer',
    'government': 'government employee',
    'federal': 'government employee',
    'state': 'government employee',
    'police': 'police officer',
    'officer': 'police officer',
    'law enforcement': 'police officer'
  };

  // Check for keyword matches
  for (const [keyword, profileKey] of Object.entries(keywordMappings)) {
    if (searchTerm.includes(keyword)) {
      return careerProfiles[profileKey] || careerProfiles.other;
    }
  }

  // If no match found, return generic profile
  return careerProfiles.other;
};

/**
 * Calculate projected income based on career profile and current situation
 */
export const calculateIncomeProjection = (currentIncome, currentAge, targetAge, occupation, careerStage, yearsInField) => {
  const profile = findCareerProfile(occupation);
  const stageData = profile.growthPattern[careerStage] || profile.growthPattern['mid-career'];
  
  const yearsToProject = targetAge - currentAge;
  const annualGrowthRate = stageData.annualGrowth;
  
  // Apply compound growth
  const projectedIncome = currentIncome * Math.pow(1 + annualGrowthRate, yearsToProject);
  
  return {
    projectedIncome: Math.round(projectedIncome),
    annualGrowthRate,
    profile,
    stageData,
    totalGrowth: ((projectedIncome - currentIncome) / currentIncome) * 100
  };
};

/**
 * Get career stage suggestions based on age and years in field
 */
export const suggestCareerStage = (age, yearsInField) => {
  const numAge = parseInt(age);
  const numYears = parseInt(yearsInField);

  if (numAge < 30 || numYears < 5) {
    return 'early-career';
  } else if (numAge < 45 || numYears < 15) {
    return 'mid-career';
  } else if (numAge < 60) {
    return 'peak-earning';
  } else {
    return 'pre-retirement';
  }
};

export default careerProfiles;
