/**
 * Strategy Explainer Service
 * Generates personalized explanations for financial concepts using the user's actual dream and numbers
 * Makes abstract financial concepts concrete and relatable
 */

/**
 * Utility function to format currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${Math.round(amount / 1000)}k`;
  } else {
    return `$${Math.round(amount).toLocaleString()}`;
  }
}

/**
 * Utility function to calculate compound growth
 * @param {number} monthlyPayment - Monthly contribution
 * @param {number} annualRate - Annual return rate (decimal)
 * @param {number} years - Number of years
 * @returns {number} Final amount after compound growth
 */
function calculateCompoundGrowth(monthlyPayment, annualRate, years) {
  const monthlyRate = annualRate / 12;
  const totalMonths = years * 12;
  
  // Future value of ordinary annuity formula
  if (monthlyRate === 0) {
    return monthlyPayment * totalMonths;
  }
  
  return monthlyPayment * (Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate;
}

/**
 * Explain compound interest using user's specific Foundation bucket and dream
 * @param {Object} userProfile - User's financial profile
 * @returns {Object} Personalized compound interest explanation
 */
export function explainCompoundInterest(userProfile) {
  const {
    monthlyFoundation = 423,
    currentAge = 28,
    retirementAge = 65,
    dreamName = 'cottage',
    dreamAmount = 400000,
    name = 'you'
  } = userProfile;

  const yearsToRetirement = retirementAge - currentAge;
  const assumedReturn = 0.07; // 7% annual return
  
  // Calculate compound growth
  const finalAmount = calculateCompoundGrowth(monthlyFoundation, assumedReturn, yearsToRetirement);
  const totalContributions = monthlyFoundation * 12 * yearsToRetirement;
  const growthFromCompounding = finalAmount - totalContributions;
  
  // Calculate key milestones
  const year10Amount = calculateCompoundGrowth(monthlyFoundation, assumedReturn, 10);
  const year20Amount = calculateCompoundGrowth(monthlyFoundation, assumedReturn, 20);
  
  // Calculate how many "cottages" this represents
  const cottageEquivalents = Math.floor(finalAmount / dreamAmount);
  
  // Calculate the "friends" each dollar makes
  const friendsPerDollar = (finalAmount / totalContributions) - 1;

  return {
    mainExplanation: `Your ${formatCurrency(monthlyFoundation)} monthly Foundation payment will grow to ${formatCurrency(finalAmount)} by ${retirementAge} because each dollar earns friends. That's how your ${dreamName} savings also become your security.`,
    
    details: {
      totalContributions: formatCurrency(totalContributions),
      finalAmount: formatCurrency(finalAmount),
      growthFromCompounding: formatCurrency(growthFromCompounding),
      friendsPerDollar: friendsPerDollar.toFixed(1),
      cottageEquivalents: cottageEquivalents
    },
    
    storyExplanation: `Think of each dollar you invest as a worker. Your ${formatCurrency(monthlyFoundation)} monthly payment sends ${monthlyFoundation} workers into the market. These workers earn money (returns), and then those earnings become new workers who also earn money. After ${yearsToRetirement} years, your original ${formatCurrency(totalContributions)} in workers has recruited ${formatCurrency(growthFromCompounding)} worth of friends. That's enough for ${cottageEquivalents} ${dreamName}s, not just one!`,
    
    milestones: [
      {
        year: 10,
        amount: formatCurrency(year10Amount),
        story: `After 10 years, your ${formatCurrency(monthlyFoundation * 12 * 10)} in contributions becomes ${formatCurrency(year10Amount)}. You're ${Math.round((year10Amount / dreamAmount) * 100)}% of the way to your ${dreamName}!`
      },
      {
        year: 20,
        amount: formatCurrency(year20Amount),
        story: `At 20 years, you've got ${formatCurrency(year20Amount)} - that's ${(year20Amount / dreamAmount).toFixed(1)} ${dreamName}s worth of value from compound growth!`
      },
      {
        year: yearsToRetirement,
        amount: formatCurrency(finalAmount),
        story: `By retirement, your Foundation bucket alone could buy ${cottageEquivalents} ${dreamName}s. That's the magic of starting early and letting time work for you.`
      }
    ],
    
    visualAnalogy: `Imagine planting ${monthlyFoundation} apple trees every month. Each tree grows and produces fruit (returns). That fruit becomes new trees, which grow and produce more fruit. After ${yearsToRetirement} years, you don't just have the trees you planted - you have an entire orchard worth ${formatCurrency(finalAmount)}.`,
    
    actionMessage: `Every month you delay costs you about ${formatCurrency((finalAmount - calculateCompoundGrowth(monthlyFoundation, assumedReturn, yearsToRetirement - 1)) / 12)} in retirement money. Your future ${dreamName}-owning self will thank you for starting today.`
  };
}

/**
 * Explain dollar cost averaging using user's investment schedule
 * @param {Object} userProfile - User's financial profile
 * @returns {Object} Personalized dollar cost averaging explanation
 */
export function explainDollarCostAveraging(userProfile) {
  const {
    monthlyFoundation = 423,
    dreamName = 'cottage',
    dreamAmount = 400000,
    name = 'you'
  } = userProfile;

  // Simulate market volatility scenarios
  const marketScenarios = [
    { month: 'January', price: 100, shares: monthlyFoundation / 100 },
    { month: 'February', price: 80, shares: monthlyFoundation / 80 },  // Market crash
    { month: 'March', price: 90, shares: monthlyFoundation / 90 },     // Recovery
    { month: 'April', price: 110, shares: monthlyFoundation / 110 },   // Bull market
    { month: 'May', price: 85, shares: monthlyFoundation / 85 },       // Volatility
    { month: 'June', price: 105, shares: monthlyFoundation / 105 }     // Growth
  ];

  const totalInvested = monthlyFoundation * marketScenarios.length;
  const totalShares = marketScenarios.reduce((sum, scenario) => sum + scenario.shares, 0);
  const averageCostPerShare = totalInvested / totalShares;
  const finalSharePrice = 105; // June price
  const portfolioValue = totalShares * finalSharePrice;
  const gainFromDCA = portfolioValue - totalInvested;

  // Calculate what would happen with lump sum at different times
  const lumpSumAtHigh = (totalInvested / 110) * finalSharePrice;
  const lumpSumAtLow = (totalInvested / 80) * finalSharePrice;

  return {
    mainExplanation: `Your ${formatCurrency(monthlyFoundation)} monthly investment buys more shares when markets crash and fewer when they boom. Over time, this "dollar cost averaging" means you never buy at the worst price, helping your ${dreamName} fund grow steadily regardless of market drama.`,
    
    details: {
      monthlyAmount: formatCurrency(monthlyFoundation),
      totalInvested: formatCurrency(totalInvested),
      totalShares: totalShares.toFixed(2),
      averageCost: averageCostPerShare.toFixed(2),
      portfolioValue: formatCurrency(portfolioValue),
      gain: formatCurrency(gainFromDCA)
    },
    
    storyExplanation: `Imagine you're buying ${dreamName} supplies every month, but prices fluctuate wildly. Sometimes lumber costs $100, sometimes $80. By buying the same dollar amount each month, you automatically buy more when prices are low and less when they're high. Your ${formatCurrency(monthlyFoundation)} monthly budget gets you the best average price over time.`,
    
    marketScenarios: marketScenarios.map(scenario => ({
      month: scenario.month,
      price: `$${scenario.price}`,
      investment: formatCurrency(monthlyFoundation),
      shares: scenario.shares.toFixed(2),
      story: scenario.price < 90 ? 'Market panic - you bought extra cheap!' : 
             scenario.price > 100 ? 'Market euphoria - you bought less at high prices' : 
             'Steady as she goes'
    })),
    
    comparisonAnalysis: {
      dcaResult: formatCurrency(portfolioValue),
      lumpSumAtHigh: formatCurrency(lumpSumAtHigh),
      lumpSumAtLow: formatCurrency(lumpSumAtLow),
      explanation: `If you had invested all ${formatCurrency(totalInvested)} at once, you'd have ${formatCurrency(lumpSumAtHigh)} (if you bought at the peak) or ${formatCurrency(lumpSumAtLow)} (if you timed the bottom perfectly). Dollar cost averaging gave you ${formatCurrency(portfolioValue)} - pretty good without needing to predict the future!`
    },
    
    visualAnalogy: `Think of it like buying gas for your car. Sometimes gas is $3/gallon, sometimes $4. If you always put in $50, you get more gallons when prices are low. Your ${dreamName} investment works the same way - consistent investing gets you more "shares" when markets are scared.`,
    
    actionMessage: `Market timing is impossible, but dollar cost averaging is automatic. Your ${formatCurrency(monthlyFoundation)}/month removes emotion and gets you closer to that ${dreamName} regardless of market headlines.`
  };
}

/**
 * Explain inflation impact on user's specific dream
 * @param {Object} userProfile - User's financial profile
 * @returns {Object} Personalized inflation explanation
 */
export function explainInflationImpact(userProfile) {
  const {
    dreamAmount = 400000,
    dreamTimeline = 7,
    dreamName = 'cottage',
    monthlyDream = 634,
    name = 'you'
  } = userProfile;

  const inflationRate = 0.03; // 3% annual inflation
  const futureAmountWithInflation = dreamAmount * Math.pow(1 + inflationRate, dreamTimeline);
  const inflationCost = futureAmountWithInflation - dreamAmount;
  
  // Calculate what happens if money just sits in savings
  const savingsRate = 0.02; // 2% savings account
  const savingsGrowth = dreamAmount * Math.pow(1 + savingsRate, dreamTimeline);
  const buyingPowerLoss = futureAmountWithInflation - savingsGrowth;
  
  // Calculate needed investment return to beat inflation
  const neededReturn = Math.pow(futureAmountWithInflation / dreamAmount, 1/dreamTimeline) - 1;
  const recommendedReturn = 0.07; // 7% investment return
  const investmentGrowth = dreamAmount * Math.pow(1 + recommendedReturn, dreamTimeline);
  
  // Calculate monthly contribution scenarios
  const monthlyToSavings = futureAmountWithInflation / (dreamTimeline * 12);
  const monthlyToInvestments = futureAmountWithInflation / calculateCompoundGrowth(1, recommendedReturn, dreamTimeline) * 12;

  return {
    mainExplanation: `Your ${formatCurrency(dreamAmount)} ${dreamName} will cost ${formatCurrency(futureAmountWithInflation)} in ${dreamTimeline} years due to inflation. That's like the ${dreamName} getting ${formatCurrency(inflationCost)} more expensive just for waiting. Your ${formatCurrency(monthlyDream)} monthly Dream bucket needs to grow, not just sit in savings, to keep up.`,
    
    details: {
      currentCost: formatCurrency(dreamAmount),
      futureCost: formatCurrency(futureAmountWithInflation),
      inflationCost: formatCurrency(inflationCost),
      timeline: dreamTimeline,
      monthlyContribution: formatCurrency(monthlyDream)
    },
    
    storyExplanation: `Imagine your dream ${dreamName} is like a hot air balloon slowly floating away from you. Every year, inflation pushes it ${formatCurrency(dreamAmount * inflationRate)} higher. If your money just sits in a savings account earning 2%, it's like you're walking toward the balloon - but not fast enough. You need investments that can "run" at 7%+ to catch up to your floating ${dreamName}.`,
    
    savingsVsInvestment: {
      savingsScenario: {
        finalAmount: formatCurrency(savingsGrowth),
        shortfall: formatCurrency(buyingPowerLoss),
        explanation: `If your ${dreamName} money sits in a 2% savings account, you'll have ${formatCurrency(savingsGrowth)} in ${dreamTimeline} years, but need ${formatCurrency(futureAmountWithInflation)}. You're ${formatCurrency(buyingPowerLoss)} short because inflation outran your money.`
      },
      investmentScenario: {
        finalAmount: formatCurrency(investmentGrowth),
        surplus: formatCurrency(investmentGrowth - futureAmountWithInflation),
        explanation: `If your ${dreamName} money grows at 7% through investing, you'll have ${formatCurrency(investmentGrowth)} - enough for your inflated ${dreamName} plus ${formatCurrency(investmentGrowth - futureAmountWithInflation)} extra!`
      }
    },
    
    monthlyImpact: {
      savingsRequired: formatCurrency(monthlyToSavings),
      investmentRequired: formatCurrency(monthlyToInvestments),
      explanation: `To buy your ${dreamName} with just savings, you'd need ${formatCurrency(monthlyToSavings)}/month. But with 7% investments, you only need ${formatCurrency(monthlyToInvestments)}/month - that's ${formatCurrency(monthlyToSavings - monthlyToInvestments)}/month you could spend on other dreams!`
    },
    
    visualAnalogy: `Think of inflation like a treadmill that speeds up every year. Your ${dreamName} is standing on this treadmill, moving away from you. A savings account is like walking on flat ground - you might keep up for a while, but eventually the treadmill wins. Investing is like getting on your own treadmill that moves faster than inflation's treadmill.`,
    
    realWorldExamples: [
      {
        item: 'Coffee',
        pastPrice: '$1.50',
        currentPrice: '$4.50',
        years: '20 years ago',
        multiplier: '3x more expensive'
      },
      {
        item: 'Movie ticket',
        pastPrice: '$7.50',
        currentPrice: '$15.00',
        years: '15 years ago',
        multiplier: '2x more expensive'
      },
      {
        item: `Your ${dreamName}`,
        pastPrice: formatCurrency(dreamAmount),
        currentPrice: formatCurrency(futureAmountWithInflation),
        years: `${dreamTimeline} years from now`,
        multiplier: `${(futureAmountWithInflation / dreamAmount).toFixed(1)}x more expensive`
      }
    ],
    
    actionMessage: `Inflation never sleeps, so your ${dreamName} money shouldn't either. Every dollar that earns less than ${Math.round(neededReturn * 100)}% annually is losing a race against time. Your ${formatCurrency(monthlyDream)} monthly Dream bucket can win this race with smart investing.`
  };
}

/**
 * Explain why starting now matters using user's specific timeline
 * @param {Object} userProfile - User's financial profile
 * @returns {Object} Personalized explanation of time value
 */
export function explainWhyStartingNowMatters(userProfile) {
  const {
    monthlyFoundation = 423,
    currentAge = 28,
    retirementAge = 65,
    dreamAmount = 400000,
    dreamName = 'cottage',
    name = 'you'
  } = userProfile;

  const yearsToRetirement = retirementAge - currentAge;
  const assumedReturn = 0.07;
  
  // Calculate scenarios for different start times
  const startNow = calculateCompoundGrowth(monthlyFoundation, assumedReturn, yearsToRetirement);
  const startIn5Years = calculateCompoundGrowth(monthlyFoundation, assumedReturn, yearsToRetirement - 5);
  const startIn10Years = calculateCompoundGrowth(monthlyFoundation, assumedReturn, yearsToRetirement - 10);
  
  // Calculate the cost of waiting
  const costOfWaiting5Years = startNow - startIn5Years;
  const costOfWaiting10Years = startNow - startIn10Years;
  
  // Calculate how many dreams they could buy with the difference
  const dreamsCostOf5Years = Math.floor(costOfWaiting5Years / dreamAmount);
  const dreamsCostOf10Years = Math.floor(costOfWaiting10Years / dreamAmount);
  
  // Calculate what they'd need to save monthly if they wait
  const monthlyNeededIn5Years = calculateMonthlyForTarget(startNow, assumedReturn, yearsToRetirement - 5);
  const monthlyNeededIn10Years = calculateMonthlyForTarget(startNow, assumedReturn, yearsToRetirement - 10);

  return {
    mainExplanation: `Starting your ${formatCurrency(monthlyFoundation)} Foundation payments at ${currentAge} gets you ${formatCurrency(startNow)} by retirement. Wait just 5 years and you lose ${formatCurrency(costOfWaiting5Years)} - that's ${dreamsCostOf5Years} ${dreamName}s worth of wealth that time could have created for you.`,
    
    details: {
      startNow: formatCurrency(startNow),
      startIn5Years: formatCurrency(startIn5Years),
      startIn10Years: formatCurrency(startIn10Years),
      costOfWaiting5: formatCurrency(costOfWaiting5Years),
      costOfWaiting10: formatCurrency(costOfWaiting10Years),
      currentAge: currentAge,
      monthlyAmount: formatCurrency(monthlyFoundation)
    },
    
    storyExplanation: `Imagine your money as seeds planted in a magical garden where each seed grows into a tree, and each tree drops more seeds. Plant at ${currentAge}, and by ${retirementAge} you have a forest worth ${formatCurrency(startNow)}. Wait until ${currentAge + 5}, and you only get a grove worth ${formatCurrency(startIn5Years)}. The missing ${formatCurrency(costOfWaiting5Years)} represents all the baby trees that were never born because you waited.`,
    
    timelineComparison: [
      {
        startAge: currentAge,
        finalAmount: formatCurrency(startNow),
        monthlyPayment: formatCurrency(monthlyFoundation),
        story: `Start now: Your ${formatCurrency(monthlyFoundation)}/month grows to ${formatCurrency(startNow)}. This is your baseline scenario.`,
        advantage: 'Best case scenario'
      },
      {
        startAge: currentAge + 5,
        finalAmount: formatCurrency(startIn5Years),
        monthlyPayment: formatCurrency(monthlyNeededIn5Years),
        story: `Wait 5 years: To get the same ${formatCurrency(startNow)}, you'd need ${formatCurrency(monthlyNeededIn5Years)}/month - that's ${formatCurrency(monthlyNeededIn5Years - monthlyFoundation)} more monthly!`,
        advantage: `Costs ${formatCurrency(costOfWaiting5Years)} in lost growth`
      },
      {
        startAge: currentAge + 10,
        finalAmount: formatCurrency(startIn10Years),
        monthlyPayment: formatCurrency(monthlyNeededIn10Years),
        story: `Wait 10 years: To get the same ${formatCurrency(startNow)}, you'd need ${formatCurrency(monthlyNeededIn10Years)}/month - nearly impossible!`,
        advantage: `Costs ${formatCurrency(costOfWaiting10Years)} in lost growth`
      }
    ],
    
    dreamEquivalents: {
      fiveYearCost: {
        amount: formatCurrency(costOfWaiting5Years),
        dreamCount: dreamsCostOf5Years,
        explanation: `Waiting 5 years costs you ${dreamsCostOf5Years} ${dreamName}s worth of retirement wealth. That's ${dreamsCostOf5Years} entire dreams that compound interest could have funded.`
      },
      tenYearCost: {
        amount: formatCurrency(costOfWaiting10Years),
        dreamCount: dreamsCostOf10Years,
        explanation: `Waiting 10 years costs you ${dreamsCostOf10Years} ${dreamName}s worth of retirement wealth. Procrastination is the most expensive hobby you'll never enjoy.`
      }
    },
    
    visualAnalogy: `Time in investing is like a high-speed train. At ${currentAge}, you hop on and ride for ${yearsToRetirement} years to Retirement City, arriving with ${formatCurrency(startNow)}. Wait 5 years to board, and you miss ${formatCurrency(costOfWaiting5Years)} worth of scenery - scenery you can never see again. The train doesn't slow down for anyone.`,
    
    psychologicalReframe: `Most people think "I'll start investing when I have more money." But that's like saying "I'll start exercising when I'm in better shape." Your ${dreamName} fund and your Foundation bucket don't need you to be perfect - they need you to start. Even ${formatCurrency(monthlyFoundation)} today beats ${formatCurrency(monthlyNeededIn5Years)} in 5 years.`,
    
    actionMessage: `Every day you wait costs you about ${formatCurrency(costOfWaiting5Years / (5 * 365))} in future wealth. Your ${currentAge}-year-old self has a superpower your ${currentAge + 5}-year-old self will never have: more time. Use it wisely.`
  };
}

/**
 * Helper function to calculate monthly payment needed to reach a target
 * @param {number} targetAmount - Target amount to reach
 * @param {number} annualRate - Annual return rate
 * @param {number} years - Years available
 * @returns {number} Monthly payment needed
 */
function calculateMonthlyForTarget(targetAmount, annualRate, years) {
  const monthlyRate = annualRate / 12;
  const totalMonths = years * 12;
  
  if (monthlyRate === 0) {
    return targetAmount / totalMonths;
  }
  
  return targetAmount * monthlyRate / (Math.pow(1 + monthlyRate, totalMonths) - 1);
}

/**
 * Generate a comprehensive strategy explanation combining all concepts
 * @param {Object} userProfile - User's financial profile
 * @param {string} focus - Which concept to emphasize ('compound', 'dca', 'inflation', 'timing')
 * @returns {Object} Combined explanation tailored to user's situation
 */
export function generateComprehensiveExplanation(userProfile, focus = 'compound') {
  const compound = explainCompoundInterest(userProfile);
  const dca = explainDollarCostAveraging(userProfile);
  const inflation = explainInflationImpact(userProfile);
  const timing = explainWhyStartingNowMatters(userProfile);

  const explanations = {
    compound: compound,
    dca: dca,
    inflation: inflation,
    timing: timing
  };

  const primary = explanations[focus];
  const supporting = Object.entries(explanations)
    .filter(([key]) => key !== focus)
    .map(([key, explanation]) => ({
      concept: key,
      summary: explanation.mainExplanation,
      keyInsight: explanation.actionMessage
    }));

  return {
    primary: primary,
    supporting: supporting,
    overallMessage: `Your financial strategy isn't just about numbers - it's about making your ${userProfile.dreamName || 'dreams'} inevitable. Time, consistency, and smart growth work together to turn your ${formatCurrency(userProfile.monthlyFoundation || 423)} monthly Foundation into lasting wealth.`,
    nextSteps: [
      'Set up automatic monthly transfers',
      `Start with your ${formatCurrency(userProfile.monthlyFoundation || 423)} Foundation bucket`,
      'Choose low-cost index funds for growth',
      'Review and adjust every 6 months',
      'Stay consistent through market ups and downs'
    ]
  };
}

export default {
  explainCompoundInterest,
  explainDollarCostAveraging,
  explainInflationImpact,
  explainWhyStartingNowMatters,
  generateComprehensiveExplanation,
  formatCurrency,
  calculateCompoundGrowth
};
