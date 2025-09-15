/**
 * Emotional Messaging Service
 * 
 * Transforms cold financial messages into warm, human, and encouraging communication
 * that keeps users connected to their dreams while acknowledging their humanity.
 */

// Message tone configurations
const messageTones = {
  gentle: {
    name: 'Gentle',
    description: 'Soft, understanding approach for sensitive situations'
  },
  encouraging: {
    name: 'Encouraging', 
    description: 'Positive, motivational tone for progress and achievements'
  },
  supportive: {
    name: 'Supportive',
    description: 'Empathetic, partnership-focused for challenges'
  },
  celebratory: {
    name: 'Celebratory',
    description: 'Joyful, excited tone for milestones and wins'
  },
  redirective: {
    name: 'Redirective',
    description: 'Gentle course correction without judgment'
  }
};

// Dream-focused message templates
const dreamFocusedMessages = {
  // Insufficient funds scenarios
  insufficientFunds: {
    tone: 'gentle',
    templates: [
      'This would use next month\'s {dreamType} funds - want to find another way?',
      'That would borrow from your {dreamTitle} savings. Let\'s explore other options?',
      'This purchase would delay your {dreamTitle} by about {delay}. Still feeling good about it?',
      'Your {dreamTitle} fund would cover this, but is it worth the setback?'
    ],
    context: 'When user attempts a purchase that would exceed available funds'
  },

  // Behind schedule scenarios
  behindSchedule: {
    tone: 'supportive',
    templates: [
      'Life happened this month. Your {dreamTitle} is patient - let\'s catch up together.',
      'You\'re {amount} behind this month, but your {dreamTitle} isn\'t going anywhere. Ready to refocus?',
      'No judgment here - we all have tough months. Your {dreamTitle} will wait while we get back on track.',
      'This month was challenging, but your {dreamTitle} knows you\'re committed. Small steps forward?',
      'Your {dreamTitle} understands life gets complicated. Let\'s find a gentle way back to your path.'
    ],
    context: 'When user falls behind their savings schedule'
  },

  // Budget exceeded scenarios
  budgetExceeded: {
    tone: 'redirective',
    templates: [
      'That puts you ${amount} over budget. Your {dreamTitle} is worth finding another way, right?',
      'This would push your {dreamTitle} timeline back by {delay}. Want to reconsider?',
      'I see you really want this, but your {dreamTitle} needs that ${amount} more. Alternatives?',
      'Your future self at the {dreamTitle} might thank you for skipping this one.',
      'This expense would trade ${amount} of {dreamTitle} progress. Fair trade?'
    ],
    context: 'When spending would exceed budget categories'
  },

  // Low savings scenarios
  lowSavings: {
    tone: 'encouraging',
    templates: [
      'Every dollar counts toward your {dreamTitle}. Even ${amount} this month keeps the dream alive.',
      'Your {dreamTitle} doesn\'t need perfection, just persistence. What can you save today?',
      'Small steps still lead to your {dreamTitle}. ${amount} is ${amount} closer than yesterday.',
      'Your {dreamTitle} celebrates every contribution, no matter the size. Keep going!',
      'Even ${amount} moves you closer to your {dreamTitle}. Progress over perfection!'
    ],
    context: 'When user can only save small amounts'
  },

  // Milestone achievements
  milestoneReached: {
    tone: 'celebratory',
    templates: [
      'You did it! ${amount} saved toward your {dreamTitle}. Can you picture yourself there?',
      'Incredible! Your {dreamTitle} just got ${amount} more real. How does that feel?',
      'Amazing progress! You\'re now {percentage}% closer to your {dreamTitle}.',
      'Your {dreamTitle} is no longer just a dream - it\'s happening! ${amount} and counting.',
      'This is what commitment looks like: ${amount} toward your {dreamTitle}. Proud of you!'
    ],
    context: 'When user reaches savings milestones'
  },

  // Goal adjustments
  goalAdjustment: {
    tone: 'supportive',
    templates: [
      'Dreams evolve, and that\'s beautiful. Your {dreamTitle} can adapt to fit your life.',
      'Life changed, so your {dreamTitle} can change too. What feels right now?',
      'Your {dreamTitle} is meant to serve your happiness. Let\'s adjust to match your reality.',
      'No dream is set in stone. How can we reshape your {dreamTitle} to fit better?',
      'You\'re not giving up - you\'re making your {dreamTitle} work for today\'s you.'
    ],
    context: 'When user needs to modify their dream goals'
  },

  // Emergency fund usage
  emergencyUsage: {
    tone: 'supportive',
    templates: [
      'This is exactly why you built that buffer. Your {dreamTitle} is safe while you handle this.',
      'Life threw a curveball, but you were prepared. Your {dreamTitle} will wait while you recover.',
      'Your emergency fund just protected your {dreamTitle}. That\'s smart planning in action.',
      'This unexpected expense won\'t derail your {dreamTitle} - you planned for this moment.',
      'Your {dreamTitle} fund stays intact because you were wise enough to prepare for surprises.'
    ],
    context: 'When user needs to use emergency funds'
  },

  // Income changes
  incomeIncrease: {
    tone: 'celebratory',
    templates: [
      'More income means your {dreamTitle} just got accelerated! How exciting is that?',
      'This extra ${amount} could bring your {dreamTitle} ${timeReduction} closer. Amazing!',
      'Your {dreamTitle} just got a boost! Want to put this windfall to work?',
      'Life upgrade unlocked! Your {dreamTitle} timeline just improved significantly.',
      'This income bump could transform your {dreamTitle} timeline. Ready to celebrate?'
    ],
    context: 'When user experiences income increases'
  },

  incomeDecrease: {
    tone: 'supportive',
    templates: [
      'Income dipped, but your {dreamTitle} is resilient. Let\'s find a sustainable pace.',
      'This changes the timeline, not the destination. Your {dreamTitle} will wait.',
      'Every dream weathers storms. Your {dreamTitle} is strong enough to handle this adjustment.',
      'Temporary setback, permanent dream. Your {dreamTitle} believes in your comeback.',
      'Your {dreamTitle} doesn\'t need speed, just direction. We\'ll find a way that works.'
    ],
    context: 'When user experiences income decreases'
  }
};

// Emotional message categories
const messageCategories = {
  financial: 'Financial decisions and transactions',
  progress: 'Savings progress and milestone tracking', 
  setbacks: 'Challenges and obstacles',
  planning: 'Goal setting and timeline adjustments',
  motivation: 'Encouragement and inspiration',
  celebration: 'Achievements and successes'
};

// Helper functions for message personalization
const getRandomTemplate = (templates) => {
  return templates[Math.floor(Math.random() * templates.length)];
};

const getDreamTypeFromCategory = (category) => {
  const dreamTypes = {
    home: 'home',
    travel: 'adventure',
    education: 'learning',
    business: 'venture',
    family: 'family dream',
    lifestyle: 'lifestyle',
    freedom: 'freedom'
  };
  return dreamTypes[category] || 'dream';
};

const formatTimeDelay = (months) => {
  if (months < 12) {
    return `${months} month${months > 1 ? 's' : ''}`;
  }
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  let result = `${years} year${years > 1 ? 's' : ''}`;
  if (remainingMonths > 0) {
    result += ` and ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
  }
  return result;
};

// Main transformation functions
export const transformInsufficientFunds = (userProfile, amount, dreamImpact = {}) => {
  const { dreamTitle, dreamCategory } = userProfile;
  const dreamType = getDreamTypeFromCategory(dreamCategory);
  const template = getRandomTemplate(dreamFocusedMessages.insufficientFunds.templates);
  
  return template
    .replace('{dreamTitle}', dreamTitle)
    .replace('{dreamType}', dreamType)
    .replace('{delay}', formatTimeDelay(dreamImpact.delayMonths || 0));
};

export const transformBehindSchedule = (userProfile, amount) => {
  const { dreamTitle } = userProfile;
  const template = getRandomTemplate(dreamFocusedMessages.behindSchedule.templates);
  
  return template
    .replace('{dreamTitle}', dreamTitle)
    .replace('{amount}', `$${Math.abs(amount).toLocaleString()}`);
};

export const transformBudgetExceeded = (userProfile, amount, dreamImpact = {}) => {
  const { dreamTitle } = userProfile;
  const template = getRandomTemplate(dreamFocusedMessages.budgetExceeded.templates);
  
  return template
    .replace('{dreamTitle}', dreamTitle)
    .replace('{amount}', Math.abs(amount).toLocaleString())
    .replace('{delay}', formatTimeDelay(dreamImpact.delayMonths || 0));
};

export const transformLowSavings = (userProfile, amount) => {
  const { dreamTitle } = userProfile;
  const template = getRandomTemplate(dreamFocusedMessages.lowSavings.templates);
  
  return template
    .replace('{dreamTitle}', dreamTitle)
    .replace('{amount}', amount.toLocaleString());
};

export const transformMilestoneReached = (userProfile, amount, percentage) => {
  const { dreamTitle } = userProfile;
  const template = getRandomTemplate(dreamFocusedMessages.milestoneReached.templates);
  
  return template
    .replace('{dreamTitle}', dreamTitle)
    .replace('{amount}', amount.toLocaleString())
    .replace('{percentage}', Math.round(percentage));
};

export const transformGoalAdjustment = (userProfile) => {
  const { dreamTitle } = userProfile;
  const template = getRandomTemplate(dreamFocusedMessages.goalAdjustment.templates);
  
  return template.replace('{dreamTitle}', dreamTitle);
};

export const transformEmergencyUsage = (userProfile, amount) => {
  const { dreamTitle } = userProfile;
  const template = getRandomTemplate(dreamFocusedMessages.emergencyUsage.templates);
  
  return template
    .replace('{dreamTitle}', dreamTitle)
    .replace('{amount}', amount.toLocaleString());
};

export const transformIncomeChange = (userProfile, amount, isIncrease, timeImpact = {}) => {
  const { dreamTitle } = userProfile;
  const messageType = isIncrease ? 'incomeIncrease' : 'incomeDecrease';
  const template = getRandomTemplate(dreamFocusedMessages[messageType].templates);
  
  return template
    .replace('{dreamTitle}', dreamTitle)
    .replace('{amount}', Math.abs(amount).toLocaleString())
    .replace('{timeReduction}', formatTimeDelay(timeImpact.monthsReduced || 0));
};

// Generic message transformer for any system message
export const transformSystemMessage = (originalMessage, userProfile, context = {}) => {
  const { dreamTitle } = userProfile;
  
  // Common transformations for generic messages
  const transformations = {
    // Error messages
    'Transaction failed': `Something went wrong, but your ${dreamTitle} savings are safe. Want to try again?`,
    'Invalid amount': `That amount doesn't look right. Your ${dreamTitle} deserves accurate numbers.`,
    'Account locked': `Your account is temporarily secure. Your ${dreamTitle} funds remain protected.`,
    
    // Success messages  
    'Transaction completed': `Great! Your ${dreamTitle} just got a little more real with this progress.`,
    'Goal updated': `Your ${dreamTitle} has been updated to match your evolving vision.`,
    'Payment processed': `Payment complete! Every transaction is a step toward your ${dreamTitle}.`,
    
    // Informational messages
    'Data updated': `Your information has been updated to better serve your ${dreamTitle} journey.`,
    'Backup completed': `Your ${dreamTitle} progress is safely backed up and secure.`,
    'Settings saved': `Settings updated to better support your path to ${dreamTitle}.`
  };

  // Return transformed message if we have one, otherwise return original with dream context
  return transformations[originalMessage] || 
         `${originalMessage} Your ${dreamTitle} journey continues!`;
};

// Message builder for complex scenarios
export const buildEmotionalMessage = (scenario, userProfile, data = {}) => {
  const { dreamTitle, dreamCategory, userName = 'there' } = userProfile;
  
  const scenarios = {
    spendingAlert: () => {
      const alternatives = [
        `Hey ${userName}, this purchase would borrow from your ${dreamTitle} fund. Worth it?`,
        `This would delay your ${dreamTitle} by ${formatTimeDelay(data.delay || 0)}. Still want it?`,
        `Your ${dreamTitle} needs that money to become real. Maybe there's another way?`
      ];
      return getRandomTemplate(alternatives);
    },
    
    progressEncouragement: () => {
      const encouragements = [
        `You're ${data.percentage || 0}% closer to your ${dreamTitle}, ${userName}! Feel that momentum?`,
        `Every dollar saved is a step closer to your ${dreamTitle}. You're doing amazing!`,
        `Your ${dreamTitle} is getting more real every day thanks to your commitment.`
      ];
      return getRandomTemplate(encouragements);
    },
    
    setbackSupport: () => {
      const supports = [
        `Life happens, ${userName}. Your ${dreamTitle} will wait while you handle this.`,
        `This setback doesn't define your journey to ${dreamTitle}. You've got this.`,
        `Your ${dreamTitle} understands - some months are harder than others.`
      ];
      return getRandomTemplate(supports);
    },
    
    dreamReminder: () => {
      const reminders = [
        `Remember why you started: your ${dreamTitle} is worth every sacrifice.`,
        `Picture yourself at your ${dreamTitle}. That feeling is what we're building toward.`,
        `Your ${dreamTitle} represents freedom, peace, and achievement. Keep that vision alive.`
      ];
      return getRandomTemplate(reminders);
    }
  };

  return scenarios[scenario] ? scenarios[scenario]() : 
         `Your ${dreamTitle} journey continues, ${userName}!`;
};

// Context-aware message enhancement
export const enhanceWithContext = (message, userProfile, context = {}) => {
  const { timeOfDay, dayOfWeek, monthOfYear, recentActivity } = context;
  const { dreamTitle, dreamCategory } = userProfile;
  
  // Add time-sensitive context
  let enhancedMessage = message;
  
  if (timeOfDay === 'morning') {
    enhancedMessage = `Good morning! ${message}`;
  } else if (timeOfDay === 'evening') {
    enhancedMessage = `${message} Sleep well knowing your ${dreamTitle} is one day closer.`;
  }
  
  // Add weekly context
  if (dayOfWeek === 'Monday') {
    enhancedMessage += ` Fresh week, fresh progress toward your ${dreamTitle}!`;
  } else if (dayOfWeek === 'Friday') {
    enhancedMessage += ` Celebrate this week's ${dreamTitle} progress!`;
  }
  
  return enhancedMessage;
};

// Validation and fallback
export const validateMessage = (message, userProfile) => {
  // Ensure message has dream context
  if (!message.includes(userProfile.dreamTitle) && !message.includes('dream')) {
    return `${message} Your ${userProfile.dreamTitle} journey continues!`;
  }
  
  // Ensure encouraging tone
  const discouragingWords = ['failed', 'error', 'insufficient', 'declined', 'invalid'];
  const hasDiscouragingTone = discouragingWords.some(word => 
    message.toLowerCase().includes(word)
  );
  
  if (hasDiscouragingTone && !message.includes('but') && !message.includes('however')) {
    return `${message} But your ${userProfile.dreamTitle} believes in you!`;
  }
  
  return message;
};

// Export all transformation functions
export const emotionalMessaging = {
  transform: {
    insufficientFunds: transformInsufficientFunds,
    behindSchedule: transformBehindSchedule,
    budgetExceeded: transformBudgetExceeded,
    lowSavings: transformLowSavings,
    milestoneReached: transformMilestoneReached,
    goalAdjustment: transformGoalAdjustment,
    emergencyUsage: transformEmergencyUsage,
    incomeChange: transformIncomeChange,
    systemMessage: transformSystemMessage
  },
  build: buildEmotionalMessage,
  enhance: enhanceWithContext,
  validate: validateMessage,
  templates: dreamFocusedMessages,
  tones: messageTones,
  categories: messageCategories
};

export default emotionalMessaging;
