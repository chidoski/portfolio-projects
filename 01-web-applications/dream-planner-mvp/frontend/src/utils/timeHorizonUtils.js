/**
 * Time Horizon Utilities
 * Functions to calculate time horizons and determine appropriate dashboard layouts
 * based on years until retirement
 */

/**
 * Calculate years until retirement and determine time horizon type
 * @param {number} currentAge - User's current age
 * @param {number} retirementAge - Target retirement age (default 65)
 * @returns {Object} Time horizon information
 */
export const calculateTimeHorizon = (currentAge, retirementAge = 65) => {
  const yearsUntilRetirement = retirementAge - currentAge
  
  let horizonType, phase, characteristics
  
  if (yearsUntilRetirement > 20) {
    horizonType = 'growth'
    phase = 'Accumulation Phase'
    characteristics = {
      focus: 'Growth and Possibility',
      priority: 'Building wealth through time and compound interest',
      messaging: 'motivational',
      riskTolerance: 'high',
      investmentFocus: 'growth-oriented',
      planningApproach: 'aggressive'
    }
  } else if (yearsUntilRetirement >= 10) {
    horizonType = 'optimization'
    phase = 'Acceleration Phase'
    characteristics = {
      focus: 'Optimization and Acceleration',
      priority: 'Maximizing efficiency and catching up opportunities',
      messaging: 'strategic',
      riskTolerance: 'moderate',
      investmentFocus: 'balanced',
      planningApproach: 'strategic'
    }
  } else {
    horizonType = 'validation'
    phase = 'Preparation Phase'
    characteristics = {
      focus: 'Validation and Fine-tuning',
      priority: 'Ensuring readiness and reducing risk',
      messaging: 'reassuring',
      riskTolerance: 'low',
      investmentFocus: 'conservative',
      planningApproach: 'preservation'
    }
  }
  
  return {
    yearsUntilRetirement,
    horizonType,
    phase,
    characteristics,
    isRetirementReady: yearsUntilRetirement <= 5
  }
}

/**
 * Get time horizon specific content and messaging
 * @param {string} horizonType - 'growth', 'optimization', or 'validation'
 * @param {number} yearsUntilRetirement - Years until retirement
 * @returns {Object} Content configuration
 */
export const getTimeHorizonContent = (horizonType, yearsUntilRetirement) => {
  const content = {
    growth: {
      heroTitle: "Your Future is Bright",
      heroSubtitle: `With ${yearsUntilRetirement} years ahead, you have the ultimate advantage: time. Every dollar saved today becomes a fortune tomorrow.`,
      dashboardTitle: "Building Your Empire",
      focusMessage: "Time is your superpower. Focus on consistent growth and let compound interest work its magic.",
      ctaMessage: "Start now and watch small steps become giant leaps",
      emphasisColor: "green",
      layout: "expanded-timeline",
      showLongTermProjections: true,
      showCompoundingExamples: true,
      prioritizeGrowthMetrics: true
    },
    optimization: {
      heroTitle: "Acceleration Mode",
      heroSubtitle: `${yearsUntilRetirement} years to optimize your strategy. Time to maximize every opportunity and accelerate your progress.`,
      dashboardTitle: "Optimizing Your Strategy",
      focusMessage: "Strategic optimization phase. Every efficiency gain and smart move compounds your progress.",
      ctaMessage: "Optimize, accelerate, and maximize your runway",
      emphasisColor: "blue",
      layout: "balanced-focus",
      showOptimizationOpportunities: true,
      showEfficiencyMetrics: true,
      prioritizeStrategicMoves: true
    },
    validation: {
      heroTitle: "Almost There",
      heroSubtitle: `Just ${yearsUntilRetirement} years left. Time to validate your plan and ensure you're truly ready for this next chapter.`,
      dashboardTitle: "Retirement Readiness Check",
      focusMessage: "Validation phase. Confirm your strategy, reduce risk, and ensure sustainable success.",
      ctaMessage: "Validate your readiness and fine-tune for success",
      emphasisColor: "orange",
      layout: "readiness-focused",
      showReadinessIndicators: true,
      showRiskAssessment: true,
      prioritizeStabilityMetrics: true
    }
  }
  
  return content[horizonType] || content.growth
}

/**
 * Determine dashboard layout configuration based on time horizon
 * @param {string} horizonType - 'growth', 'optimization', or 'validation'
 * @returns {Object} Layout configuration
 */
export const getDashboardLayout = (horizonType) => {
  const layouts = {
    growth: {
      // 20+ years: Emphasize growth and possibility
      layout: 'expanded-timeline',
      components: {
        timelineSize: 'large',
        showProjections: true,
        showCompounding: true,
        priorityOrder: ['timeline', 'growth-projections', 'dreams', 'optimization-tips'],
        metricsEmphasis: ['compound-growth', 'time-advantage', 'potential-wealth']
      },
      visualTreatment: {
        colors: ['green', 'emerald', 'teal'],
        gradients: 'growth-optimistic',
        animations: 'expansive',
        messaging: 'inspirational'
      }
    },
    optimization: {
      // 10-20 years: Focus on optimization and acceleration
      layout: 'balanced-focus',
      components: {
        timelineSize: 'medium',
        showOptimizations: true,
        showEfficiencyGains: true,
        priorityOrder: ['optimization-opportunities', 'timeline', 'dreams', 'acceleration-tools'],
        metricsEmphasis: ['efficiency-ratio', 'catch-up-potential', 'optimization-gains']
      },
      visualTreatment: {
        colors: ['blue', 'indigo', 'purple'],
        gradients: 'strategic-focused',
        animations: 'purposeful',
        messaging: 'strategic'
      }
    },
    validation: {
      // <10 years: Prioritize validation and fine-tuning
      layout: 'readiness-focused',
      components: {
        timelineSize: 'compact',
        showReadinessChecks: true,
        showRiskMetrics: true,
        priorityOrder: ['readiness-dashboard', 'validation-metrics', 'timeline', 'final-optimizations'],
        metricsEmphasis: ['readiness-score', 'safety-margins', 'stability-metrics']
      },
      visualTreatment: {
        colors: ['orange', 'amber', 'yellow'],
        gradients: 'confidence-building',
        animations: 'reassuring',
        messaging: 'validating'
      }
    }
  }
  
  return layouts[horizonType] || layouts.growth
}

/**
 * Get age-appropriate financial advice and tips
 * @param {number} currentAge - User's current age
 * @param {string} horizonType - Time horizon type
 * @returns {Array} Array of relevant tips
 */
export const getAgeAppropriateAdvice = (currentAge, horizonType) => {
  const adviceByHorizon = {
    growth: [
      "Maximize your 401(k) employer match - it's free money that compounds for decades",
      "Consider aggressive growth investments - you have time to ride out market volatility",
      "Start investing in index funds - low fees mean more money working for you",
      "Increase your savings rate by 1% each year - you won't feel it but your future self will thank you",
      "Focus on building income - your earning years are your wealth-building years"
    ],
    optimization: [
      "Review and optimize your investment allocation - ensure it matches your timeline",
      "Consider catch-up contributions if you're behind on retirement savings",
      "Evaluate tax-advantaged strategies like Roth conversions",
      "Optimize your debt-to-investment ratio - high-interest debt should be eliminated",
      "Review your insurance coverage - protect what you've built so far"
    ],
    validation: [
      "Calculate your exact retirement needs - be specific about your lifestyle costs",
      "Stress-test your portfolio against market downturns",
      "Consider shifting to more conservative investments to preserve capital",
      "Plan your withdrawal strategy - how will you access your money in retirement?",
      "Review your estate planning - ensure your legacy is protected"
    ]
  }
  
  return adviceByHorizon[horizonType] || []
}

/**
 * Calculate retirement readiness score
 * @param {number} currentAge - User's current age
 * @param {number} retirementAge - Target retirement age
 * @param {number} currentSavings - Current retirement savings
 * @param {number} monthlyContribution - Monthly savings amount
 * @param {number} desiredRetirementIncome - Desired annual retirement income
 * @returns {Object} Readiness score and details
 */
export const calculateRetirementReadiness = (
  currentAge, 
  retirementAge, 
  currentSavings, 
  monthlyContribution, 
  desiredRetirementIncome
) => {
  const yearsToRetirement = retirementAge - currentAge
  const annualContribution = monthlyContribution * 12
  
  // Simple compound growth calculation (7% average return)
  const projectedSavings = currentSavings * Math.pow(1.07, yearsToRetirement) + 
    annualContribution * ((Math.pow(1.07, yearsToRetirement) - 1) / 0.07)
  
  // 4% withdrawal rule
  const projectedAnnualIncome = projectedSavings * 0.04
  
  const readinessRatio = projectedAnnualIncome / desiredRetirementIncome
  
  let score, status, message
  
  if (readinessRatio >= 1.0) {
    score = Math.min(100, Math.round(readinessRatio * 100))
    status = 'on-track'
    message = "You're on track for your retirement goals!"
  } else if (readinessRatio >= 0.8) {
    score = Math.round(readinessRatio * 100)
    status = 'close'
    message = "Close to your goal - small adjustments can get you there"
  } else {
    score = Math.round(readinessRatio * 100)
    status = 'needs-attention'
    message = "Consider increasing savings or adjusting timeline"
  }
  
  return {
    score,
    status,
    message,
    projectedSavings,
    projectedAnnualIncome,
    shortfall: Math.max(0, desiredRetirementIncome - projectedAnnualIncome),
    readinessRatio
  }
}
