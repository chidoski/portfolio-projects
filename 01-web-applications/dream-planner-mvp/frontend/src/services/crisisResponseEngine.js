/**
 * Crisis Response Engine
 * Generates specific strategies for common life disruptions
 * Frames setbacks as temporary detours, not failures
 */

import { formatCurrency } from './dreamCalculations.js';

/**
 * Base crisis response structure
 */
const createCrisisResponse = ({
  title,
  perspective,
  immediateActions,
  longTermAdjustments,
  bucketStrategy,
  timeline,
  encouragement,
  resources,
  recoveryMilestones
}) => ({
  title,
  perspective,
  immediateActions,
  longTermAdjustments,
  bucketStrategy,
  timeline,
  encouragement,
  resources,
  recoveryMilestones,
  generatedAt: new Date().toISOString()
});

/**
 * Calculate new bucket allocation based on income change
 */
const calculateAdjustedBuckets = (originalIncome, newIncome, originalAllocation = { foundation: 60, dream: 25, life: 15 }) => {
  const incomeRatio = newIncome / originalIncome;
  
  // Protect Foundation bucket more during crises
  const foundationProtection = Math.max(0.7, incomeRatio); // Foundation gets at least 70% protection
  
  return {
    foundation: Math.round(originalAllocation.foundation * foundationProtection),
    dream: Math.round(originalAllocation.dream * incomeRatio * 0.6), // Dream takes biggest hit
    life: Math.round(originalAllocation.life * incomeRatio * 0.8), // Life moderately protected
    
    // Calculate dollar amounts if monthly savings provided
    monthlyAmounts: (monthlySavings) => {
      const totalPercentage = Math.round(originalAllocation.foundation * foundationProtection) +
                            Math.round(originalAllocation.dream * incomeRatio * 0.6) +
                            Math.round(originalAllocation.life * incomeRatio * 0.8);
      
      const adjustedSavings = monthlySavings * incomeRatio;
      
      return {
        foundation: (adjustedSavings * Math.round(originalAllocation.foundation * foundationProtection)) / totalPercentage,
        dream: (adjustedSavings * Math.round(originalAllocation.dream * incomeRatio * 0.6)) / totalPercentage,
        life: (adjustedSavings * Math.round(originalAllocation.life * incomeRatio * 0.8)) / totalPercentage,
        total: adjustedSavings
      };
    }
  };
};

/**
 * Job Loss Crisis Response
 * Handles unemployment with strategies to maintain some savings capacity
 */
export const jobLoss = ({
  currentIncome = 5242, // Monthly net income
  monthlySavings = 2000,
  unemploymentBenefit = 0.4, // 40% of previous income
  hasEmergencyFund = true,
  emergencyFundMonths = 6,
  skillsForGigWork = ['marketing', 'design'],
  location = 'Boston, MA'
} = {}) => {
  
  // Calculate potential income streams
  const unemploymentMonthly = currentIncome * unemploymentBenefit;
  const estimatedGigIncome = currentIncome * 0.3; // Conservative gig work estimate
  const totalCrisisIncome = unemploymentMonthly + estimatedGigIncome;
  const incomeReductionPercentage = Math.round((1 - (totalCrisisIncome / currentIncome)) * 100);
  
  // Calculate adjusted savings capacity
  const crisisSavingsCapacity = Math.max(0, monthlySavings * 0.4); // Aim to maintain 40% of savings
  const adjustedBuckets = calculateAdjustedBuckets(currentIncome, totalCrisisIncome);
  const monthlyAmounts = adjustedBuckets.monthlyAmounts(crisisSavingsCapacity);

  return createCrisisResponse({
    title: 'Job Loss Recovery Strategy',
    
    perspective: {
      mainMessage: 'This is a 6-month pause on a 20-year journey.',
      context: `You're not behind – you're navigating. ${incomeReductionPercentage}% income reduction is manageable with the right strategy.`,
      timeframe: 'Most people find new employment within 3-6 months',
      impact: 'Your Maine cottage dream may shift by 6-12 months, but it\'s still yours to claim.'
    },

    immediateActions: [
      {
        priority: 'urgent',
        action: 'File for unemployment benefits immediately',
        details: `Estimated benefit: ${formatCurrency(unemploymentMonthly)}/month`,
        timeline: 'Apply within 1 week',
        why: 'This replaces 40% of your income automatically'
      },
      {
        priority: 'urgent',
        action: 'Activate emergency fund strategically',
        details: hasEmergencyFund 
          ? `Use ${emergencyFundMonths} months of expenses to bridge income gap`
          : 'Consider temporary family support or credit line',
        timeline: 'Immediate',
        why: 'Protects your Foundation bucket from being touched'
      },
      {
        priority: 'high',
        action: 'Launch gig work immediately',
        details: `Target ${formatCurrency(estimatedGigIncome)}/month through ${skillsForGigWork.join(', ')} freelancing`,
        timeline: 'Start within 2 weeks',
        why: 'Maintains dignity and income while job searching'
      },
      {
        priority: 'medium',
        action: 'Pause non-essential subscriptions',
        details: 'Cancel gym, streaming services, premium apps temporarily',
        timeline: 'This week',
        why: 'Free up $100-200/month for essentials'
      },
      {
        priority: 'medium',
        action: 'Communicate with creditors',
        details: 'Inform credit card companies and loan servicers about temporary hardship',
        timeline: 'Within 2 weeks',
        why: 'Many offer deferment programs to prevent damage to credit'
      }
    ],

    longTermAdjustments: [
      {
        category: 'Career Strategy',
        adjustment: 'Treat job search as full-time work',
        details: 'Dedicate 40 hours/week to applications, networking, and skill development',
        timeline: '3-6 months',
        impact: 'Accelerates return to full income'
      },
      {
        category: 'Income Diversification',
        adjustment: 'Build freelance client base',
        details: 'Even after new job, maintain 1-2 clients for extra income security',
        timeline: 'Ongoing',
        impact: 'Adds 10-15% income buffer for future savings acceleration'
      },
      {
        category: 'Expense Optimization',
        adjustment: 'Negotiate fixed expenses',
        details: 'Call internet, insurance, phone providers for reduced rates',
        timeline: 'Month 2-3',
        impact: 'Permanent $50-150/month savings'
      },
      {
        category: 'Bucket Strategy',
        adjustment: 'Gradual savings restoration',
        details: 'Return to normal allocation over 6 months after reemployment',
        timeline: '6-12 months post-employment',
        impact: 'Protects long-term goals while managing crisis'
      }
    ],

    bucketStrategy: {
      crisisAllocation: {
        foundation: `${adjustedBuckets.foundation}% (${formatCurrency(monthlyAmounts.foundation)}/month)`,
        dream: `${adjustedBuckets.dream}% (${formatCurrency(monthlyAmounts.dream)}/month)`,
        life: `${adjustedBuckets.life}% (${formatCurrency(monthlyAmounts.life)}/month)`
      },
      reasoning: {
        foundation: 'Reduced but protected – retirement security maintained',
        dream: 'Significantly reduced but not eliminated – keeps Maine cottage alive',
        life: 'Moderately reduced – covers essential milestones only'
      },
      totalMonthlySavings: formatCurrency(crisisSavingsCapacity),
      comparedToPrevious: `${Math.round((crisisSavingsCapacity / monthlySavings) * 100)}% of previous savings rate`
    },

    timeline: {
      immediate: 'Weeks 1-2: File unemployment, activate emergency strategies',
      shortTerm: 'Months 1-3: Job search + gig work, reduced but consistent savings',
      mediumTerm: 'Months 3-6: Likely reemployment, gradual savings restoration',
      recovery: 'Months 6-12: Back to full savings capacity, potential catch-up phase'
    },

    encouragement: {
      perspective: 'This is a detour, not a destination. Your Maine cottage is still waiting.',
      strengths: [
        'You have an emergency fund (smart planning)',
        'Your skills translate to gig work',
        'You understand bucket strategy (protects Foundation)',
        'You\'re proactive about seeking help'
      ],
      progress: 'Even 40% savings keeps you moving toward Maine – just at a gentler pace.',
      community: 'Join local job search groups and freelancer networks for support and opportunities.'
    },

    resources: [
      {
        type: 'unemployment',
        name: 'State Unemployment Office',
        description: 'File benefits, understand extensions',
        urgency: 'immediate'
      },
      {
        type: 'gig-work',
        name: 'Upwork, Fiverr, 99designs',
        description: `Platforms for ${skillsForGigWork.join(', ')} freelancing`,
        urgency: 'immediate'
      },
      {
        type: 'job-search',
        name: 'Local job search meetups',
        description: `Check Meetup.com for ${location} job networking groups`,
        urgency: 'week-1'
      },
      {
        type: 'financial',
        name: 'Credit counseling services',
        description: 'Free advice on managing payments during unemployment',
        urgency: 'if-needed'
      }
    ],

    recoveryMilestones: [
      {
        timeframe: '2 weeks',
        milestone: 'Unemployment filed, gig work launched',
        celebration: 'You\'ve activated your safety nets!'
      },
      {
        timeframe: '1 month',
        milestone: 'First gig payment received',
        celebration: 'Income diversification in action!'
      },
      {
        timeframe: '3 months',
        milestone: 'Maintained some savings despite crisis',
        celebration: 'Your Maine cottage fund survived the storm!'
      },
      {
        timeframe: '6 months',
        milestone: 'New job secured or gig work stabilized',
        celebration: 'Back on track – stronger and more resilient!'
      }
    ]
  });
};

/**
 * Medical Emergency Crisis Response
 * Shows how to use Life bucket while protecting Foundation
 */
export const medicalEmergency = ({
  emergencyCost = 15000,
  currentLifeBucket = 300, // Monthly Life bucket amount
  lifeBucketBalance = 5000, // Current Life bucket balance
  hasHealthInsurance = true,
  maxOutOfPocket = 8000,
  recoveryTimeMonths = 3,
  incomeImpact = 0.2 // 20% income reduction during recovery
} = {}) => {
  
  // Calculate funding strategy
  const insuranceCoveredAmount = hasHealthInsurance ? emergencyCost - maxOutOfPocket : 0;
  const outOfPocketCost = emergencyCost - insuranceCoveredAmount;
  const lifeBucketCanCover = Math.min(outOfPocketCost, lifeBucketBalance);
  const remainingNeed = Math.max(0, outOfPocketCost - lifeBucketCanCover);
  
  // Calculate income impact during recovery
  const originalIncome = 5242; // Default monthly income
  const recoveryIncome = originalIncome * (1 - incomeImpact);
  const adjustedBuckets = calculateAdjustedBuckets(originalIncome, recoveryIncome);

  return createCrisisResponse({
    title: 'Medical Emergency Response Plan',
    
    perspective: {
      mainMessage: 'Health comes first. Your Life bucket was built for exactly this moment.',
      context: `${formatCurrency(outOfPocketCost)} medical cost is significant but manageable with your three-bucket system.`,
      timeframe: `${recoveryTimeMonths}-month recovery period with strategic bucket usage`,
      impact: 'Your Foundation stays protected, Maine cottage timeline barely affected.'
    },

    immediateActions: [
      {
        priority: 'urgent',
        action: 'Use Life bucket for medical costs',
        details: `Deploy ${formatCurrency(lifeBucketCanCover)} from Life bucket (${Math.round((lifeBucketCanCover/lifeBucketBalance)*100)}% of balance)`,
        timeline: 'Immediate',
        why: 'This is exactly what Life bucket is designed for – protecting other buckets during emergencies'
      },
      {
        priority: 'urgent',
        action: 'Maximize insurance benefits',
        details: hasHealthInsurance 
          ? `Insurance covers ${formatCurrency(insuranceCoveredAmount)}, your max out-of-pocket: ${formatCurrency(maxOutOfPocket)}`
          : 'Apply for hospital financial assistance programs immediately',
        timeline: 'Within 48 hours',
        why: 'Reduces actual cost significantly'
      },
      {
        priority: 'high',
        action: remainingNeed > 0 ? 'Address remaining funding gap' : 'Focus on recovery',
        details: remainingNeed > 0 
          ? `Need additional ${formatCurrency(remainingNeed)} - consider payment plan with provider`
          : 'Life bucket covers everything – focus entirely on healing',
        timeline: 'Week 1',
        why: remainingNeed > 0 ? 'Prevents Foundation bucket raid' : 'Stress-free recovery'
      },
      {
        priority: 'medium',
        action: 'Temporarily reduce Dream bucket',
        details: 'Redirect Dream contributions to rebuild Life bucket during recovery',
        timeline: 'Next 3 months',
        why: 'Maintains emergency protection while preserving Foundation'
      },
      {
        priority: 'low',
        action: 'Document all medical expenses',
        details: 'Track everything for tax deductions and HSA reimbursements',
        timeline: 'Ongoing',
        why: 'Potential tax savings and HSA benefits'
      }
    ],

    longTermAdjustments: [
      {
        category: 'Health Strategy',
        adjustment: 'Prioritize preventive care',
        details: 'Increase HSA contributions, focus on preventive health measures',
        timeline: 'Post-recovery',
        impact: 'Reduces future medical crisis risk'
      },
      {
        category: 'Emergency Preparedness',
        adjustment: 'Rebuild Life bucket faster',
        details: `Increase Life bucket by ${formatCurrency(50)}/month until restored`,
        timeline: '6-12 months',
        impact: 'Stronger protection for future emergencies'
      },
      {
        category: 'Income Recovery',
        adjustment: 'Gradual return to full earning capacity',
        details: 'Phase back to full work schedule as health permits',
        timeline: `${recoveryTimeMonths} months`,
        impact: 'Returns all buckets to normal allocation'
      },
      {
        category: 'Insurance Review',
        adjustment: 'Evaluate coverage gaps',
        details: 'Consider supplemental insurance, review deductibles',
        timeline: 'Next open enrollment',
        impact: 'Better protection for future medical needs'
      }
    ],

    bucketStrategy: {
      emergencyUsage: {
        lifeBucket: `Used ${formatCurrency(lifeBucketCanCover)} (${Math.round((lifeBucketCanCover/lifeBucketBalance)*100)}% of balance)`,
        foundationBucket: 'PROTECTED – no withdrawal needed',
        dreamBucket: 'Temporarily redirected to rebuild Life bucket'
      },
      recoveryAllocation: {
        foundation: `${adjustedBuckets.foundation}% (slightly reduced during recovery)`,
        dream: `${adjustedBuckets.dream}% (redirected to Life bucket rebuild)`,
        life: `${adjustedBuckets.life + 15}% (accelerated rebuild mode)`
      },
      reasoning: {
        foundation: 'Untouched – your retirement security intact',
        dream: 'Maine cottage delayed by 2-3 months max',
        life: 'Fulfilling its purpose – this is why it exists'
      }
    },

    timeline: {
      immediate: 'Week 1: Use Life bucket, maximize insurance, focus on treatment',
      shortTerm: 'Months 1-3: Recovery period with reduced earnings, bucket rebuilding',
      mediumTerm: 'Months 3-6: Return to full capacity, Life bucket restoration',
      longTerm: 'Months 6+: Normal bucket allocation resumed, stronger emergency preparedness'
    },

    encouragement: {
      perspective: 'This is exactly why you built the three-bucket system. It\'s working perfectly.',
      strengths: [
        'Your Life bucket absorbed the shock (as designed)',
        'Foundation bucket stays protected',
        'You have health insurance working for you',
        'Your planning anticipated this exact scenario'
      ],
      progress: 'Your Maine cottage is barely affected – maybe 2-3 months later, but still yours.',
      reminder: 'Health emergencies are temporary. Your long-term dreams remain permanent.'
    },

    resources: [
      {
        type: 'insurance',
        name: 'Insurance Navigator',
        description: 'Help maximizing health insurance benefits',
        urgency: 'immediate'
      },
      {
        type: 'financial',
        name: 'Hospital Financial Counselor',
        description: 'Payment plans and financial assistance programs',
        urgency: 'immediate'
      },
      {
        type: 'tax',
        name: 'HSA Administrator',
        description: 'Reimbursements and tax-advantaged medical spending',
        urgency: 'week-1'
      },
      {
        type: 'support',
        name: 'Patient Advocate',
        description: 'Navigate medical system and insurance claims',
        urgency: 'if-needed'
      }
    ],

    recoveryMilestones: [
      {
        timeframe: '1 week',
        milestone: 'Medical costs covered without touching Foundation',
        celebration: 'Your bucket system protected your future!'
      },
      {
        timeframe: '1 month',
        milestone: 'Treatment progressing, Life bucket rebuilding started',
        celebration: 'Health improving, finances stable!'
      },
      {
        timeframe: '3 months',
        milestone: 'Recovery complete, normal earnings resumed',
        celebration: 'Back to full strength – physically and financially!'
      },
      {
        timeframe: '6 months',
        milestone: 'Life bucket fully restored, Maine cottage back on track',
        celebration: 'Stronger than before, with proven crisis resilience!'
      }
    ]
  });
};

/**
 * Relationship Change Crisis Response
 * Recalculating for single income and reduced expenses
 */
export const relationshipChange = ({
  wasMarried = true,
  sharedIncome = 145000, // Combined household income
  yourIncome = 85000, // Your individual income
  sharedExpenses = 4500, // Monthly shared expenses
  yourNewExpenses = 2800, // Your estimated solo expenses
  sharedAssets = 120000, // Assets to divide
  yourShare = 0.5, // Your share of assets (50%)
  hasChildren = false,
  childSupportAmount = 0,
  timeToStabilize = 6 // Months to emotional/financial stability
} = {}) => {
  
  // Calculate financial impact
  const incomeReduction = sharedIncome - yourIncome;
  const expenseReduction = sharedExpenses - yourNewExpenses;
  const netIncomeChange = -incomeReduction + expenseReduction; // Negative = worse off
  const assetGain = sharedAssets * yourShare;
  
  // Calculate new disposable income
  const oldDisposableIncome = sharedIncome - sharedExpenses;
  const newDisposableIncome = yourIncome - yourNewExpenses - childSupportAmount;
  const disposableIncomeRatio = newDisposableIncome / oldDisposableIncome;
  
  // Adjust buckets for new reality
  const adjustedBuckets = calculateAdjustedBuckets(oldDisposableIncome, newDisposableIncome);
  const monthlyAmounts = adjustedBuckets.monthlyAmounts(newDisposableIncome * 0.6); // 60% savings rate

  return createCrisisResponse({
    title: 'Relationship Change Financial Reset',
    
    perspective: {
      mainMessage: 'This is a 6-month reset on a 20-year journey. You\'re redesigning, not starting over.',
      context: `${netIncomeChange >= 0 ? 'Financially' : 'Income is lower but'} you have ${formatCurrency(assetGain)} in assets and reduced expenses to work with.`,
      timeframe: `${timeToStabilize} months to establish new financial rhythm`,
      impact: 'Maine cottage timeline adjusts, but your independence makes it even more meaningful.'
    },

    immediateActions: [
      {
        priority: 'urgent',
        action: 'Establish separate financial accounts',
        details: 'Open individual checking, savings, and investment accounts',
        timeline: 'Within 1 week',
        why: 'Financial independence and clear asset separation'
      },
      {
        priority: 'urgent',
        action: 'Asset division strategy',
        details: `Your share: ${formatCurrency(assetGain)} - prioritize liquid assets for Life bucket boost`,
        timeline: 'Within 30 days',
        why: 'Strengthen your individual emergency protection'
      },
      {
        priority: 'high',
        action: 'Housing optimization',
        details: wasMarried 
          ? 'Evaluate keeping vs. selling shared home, or find appropriately-sized rental'
          : 'Secure housing that fits your solo budget',
        timeline: 'Month 1-2',
        why: 'Housing is biggest expense factor in new budget'
      },
      {
        priority: 'high',
        action: 'Update all financial accounts',
        details: 'Remove ex-partner from accounts, update beneficiaries, insurance',
        timeline: 'Month 1',
        why: 'Legal protection and clean financial slate'
      },
      {
        priority: 'medium',
        action: hasChildren ? 'Establish child support/custody financials' : 'Focus on personal goals',
        details: hasChildren 
          ? `Factor ${formatCurrency(childSupportAmount)}/month into budget planning`
          : 'Channel emotional energy into personal financial growth',
        timeline: 'Month 1-2',
        why: hasChildren ? 'Legal clarity and budget accuracy' : 'Positive focus during transition'
      }
    ],

    longTermAdjustments: [
      {
        category: 'Income Strategy',
        adjustment: 'Optimize your earning potential',
        details: 'Focus entirely on your career growth without compromise',
        timeline: '6-12 months',
        impact: 'Potential for income increases without household negotiation'
      },
      {
        category: 'Expense Optimization',
        adjustment: 'Right-size your lifestyle',
        details: `Target monthly expenses of ${formatCurrency(yourNewExpenses)} with room for personal priorities`,
        timeline: '3-6 months',
        impact: 'Higher savings rate possible with intentional spending'
      },
      {
        category: 'Goal Refinement',
        adjustment: 'Personalize your Someday Life',
        details: 'Maine cottage is now YOUR dream – design it exactly as you want',
        timeline: 'Ongoing',
        impact: 'Stronger emotional connection to goals'
      },
      {
        category: 'Emergency Preparedness',
        adjustment: 'Build robust individual safety net',
        details: 'Larger emergency fund needed as sole income earner',
        timeline: '12 months',
        impact: 'Greater financial security and confidence'
      }
    ],

    bucketStrategy: {
      assetIntegration: {
        lifeBucket: `Boost with ${formatCurrency(assetGain * 0.3)} from asset division`,
        dreamBucket: `Add ${formatCurrency(assetGain * 0.4)} to accelerate Maine cottage`,
        foundationBucket: `Strengthen with ${formatCurrency(assetGain * 0.3)} for solo security`
      },
      newAllocation: {
        foundation: `${adjustedBuckets.foundation}% (${formatCurrency(monthlyAmounts.foundation)}/month)`,
        dream: `${adjustedBuckets.dream}% (${formatCurrency(monthlyAmounts.dream)}/month)`,
        life: `${adjustedBuckets.life}% (${formatCurrency(monthlyAmounts.life)}/month)`
      },
      reasoning: {
        foundation: 'Higher priority as sole earner – need robust retirement security',
        dream: 'Slower but steady – Maine cottage becomes symbol of independence',
        life: 'Maintained for dating, travel, and personal growth'
      }
    },

    timeline: {
      immediate: 'Months 1-2: Legal/financial separation, housing decisions, asset division',
      shortTerm: 'Months 3-6: Establish new financial rhythm, optimize expenses',
      mediumTerm: 'Months 6-12: Income optimization, relationship with money stabilizes',
      longTerm: 'Year 2+: Accelerated progress toward personalized goals'
    },

    encouragement: {
      perspective: 'Your Maine cottage will be 100% yours – earned through your strength and planning.',
      strengths: [
        'You have your own income and career',
        'Asset division provides foundation boost',
        'Lower expenses create opportunities',
        'Complete control over financial decisions'
      ],
      progress: 'Independence often accelerates goal achievement – no compromising on your dreams.',
      empowerment: 'This transition builds financial confidence that lasts a lifetime.'
    },

    resources: [
      {
        type: 'legal',
        name: 'Family Law Attorney',
        description: 'Asset division and legal separation guidance',
        urgency: 'immediate'
      },
      {
        type: 'financial',
        name: 'Fee-Only Financial Planner',
        description: 'Objective advice for your new financial situation',
        urgency: 'month-1'
      },
      {
        type: 'emotional',
        name: 'Therapist or Support Group',
        description: 'Emotional support during transition',
        urgency: 'as-needed'
      },
      {
        type: 'practical',
        name: 'Solo Living Communities',
        description: 'Meetups and groups for single professionals',
        urgency: 'month-2'
      }
    ],

    recoveryMilestones: [
      {
        timeframe: '1 month',
        milestone: 'Separate finances established, asset division initiated',
        celebration: 'Financial independence activated!'
      },
      {
        timeframe: '3 months',
        milestone: 'New living situation stabilized, budget optimized',
        celebration: 'Your new life rhythm is working!'
      },
      {
        timeframe: '6 months',
        milestone: 'Savings rate restored or improved',
        celebration: 'Maine cottage fund growing strong again!'
      },
      {
        timeframe: '12 months',
        milestone: 'Emotionally and financially stable, goals clarified',
        celebration: 'Stronger, more focused, and unstoppable!'
      }
    ]
  });
};

/**
 * Utility function to get crisis response by type
 */
export const getCrisisResponse = (crisisType, parameters = {}) => {
  switch (crisisType) {
    case 'job-loss':
      return jobLoss(parameters);
    case 'medical-emergency':
      return medicalEmergency(parameters);
    case 'relationship-change':
      return relationshipChange(parameters);
    default:
      throw new Error(`Unknown crisis type: ${crisisType}`);
  }
};

/**
 * Get all available crisis response types
 */
export const getAvailableCrisisTypes = () => ([
  {
    id: 'job-loss',
    title: 'Job Loss',
    description: 'Unemployment with strategies to maintain savings through benefits and gig work',
    icon: 'briefcase',
    severity: 'high'
  },
  {
    id: 'medical-emergency',
    title: 'Medical Emergency',
    description: 'Health crisis management using Life bucket while protecting Foundation',
    icon: 'heart',
    severity: 'high'
  },
  {
    id: 'relationship-change',
    title: 'Relationship Change',
    description: 'Divorce or separation with financial recalculation for independence',
    icon: 'users',
    severity: 'medium'
  }
]);

/**
 * Format crisis response for UI display
 */
export const formatCrisisResponseForUI = (crisisResponse) => {
  return {
    ...crisisResponse,
    summary: {
      title: crisisResponse.title,
      mainMessage: crisisResponse.perspective.mainMessage,
      timeframe: crisisResponse.perspective.timeframe,
      urgentActions: crisisResponse.immediateActions.filter(action => action.priority === 'urgent').length,
      totalActions: crisisResponse.immediateActions.length,
      estimatedRecovery: crisisResponse.timeline.recovery
    }
  };
};

// Export all crisis response functions
export default {
  jobLoss,
  medicalEmergency,
  relationshipChange,
  getCrisisResponse,
  getAvailableCrisisTypes,
  formatCrisisResponseForUI
};
