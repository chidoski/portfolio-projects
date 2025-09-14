/**
 * Behavioral Nudges Service
 * Generates contextual, personalized encouragement messages based on user's specific dreams and progress
 * 
 * All messages reference the user's NorthStarDream and current situation - no generic finance platitudes
 */

// Common spending categories and their typical costs for contextual messaging
const SPENDING_CONTEXTS = {
  coffee: { daily: 5.50, weekly: 38.50, monthly: 165, description: "daily latte" },
  lunch: { daily: 12, weekly: 84, monthly: 360, description: "lunch out" },
  streaming: { monthly: 15, yearly: 180, description: "streaming subscription" },
  rideshare: { trip: 18, weekly: 72, monthly: 288, description: "rideshare trip" },
  cocktail: { drink: 14, evening: 56, monthly: 224, description: "evening cocktails" },
  gym: { monthly: 45, yearly: 540, description: "gym membership" },
  magazine: { monthly: 12, yearly: 144, description: "magazine subscription" },
  parking: { daily: 8, weekly: 56, monthly: 240, description: "downtown parking" },
  snacks: { daily: 3.50, weekly: 24.50, monthly: 105, description: "afternoon snacks" },
  gas: { fillup: 45, weekly: 90, monthly: 360, description: "gas fill-up" }
}

// Dream-specific activities and experiences for contextual messaging
const DREAM_ACTIVITIES = {
  travel: {
    europe: ["exploring Parisian cafés", "walking through Tuscan vineyards", "watching sunsets in Santorini", "discovering hidden gems in Prague"],
    asia: ["temple hopping in Kyoto", "street food adventures in Bangkok", "sunrise over Angkor Wat", "cherry blossoms in Tokyo"],
    adventure: ["hiking mountain trails", "scuba diving in crystal waters", "safari adventures", "northern lights viewing"],
    general: ["creating unforgettable memories", "experiencing new cultures", "capturing perfect moments", "living your travel dreams"]
  },
  home: {
    renovation: ["cooking in your dream kitchen", "relaxing in your spa bathroom", "hosting friends in style", "enjoying your perfect space"],
    purchase: ["keys to your dream home", "morning coffee on your porch", "family gatherings in your space", "building equity and memories"],
    garden: ["growing your own vegetables", "weekend mornings in the garden", "outdoor dinner parties", "your personal oasis"]
  },
  retirement: {
    early: ["freedom to choose your days", "pursuing passion projects", "traveling without time limits", "financial independence"],
    traditional: ["worry-free golden years", "time with grandchildren", "hobbies you've always wanted", "comfortable retirement lifestyle"],
    location: ["your dream retirement location", "peaceful mornings without alarms", "pursuing lifelong interests", "stress-free living"]
  },
  business: {
    startup: ["being your own boss", "building something meaningful", "financial independence", "following your passion"],
    expansion: ["growing your dream business", "creating more opportunities", "building your legacy", "achieving business goals"]
  },
  education: {
    degree: ["advancing your career", "personal growth and learning", "new opportunities opening up", "achieving your educational goals"],
    skills: ["mastering new abilities", "career advancement", "personal development", "expanding your horizons"]
  },
  family: {
    children: ["providing for your family's future", "creating lasting memories", "giving them the best opportunities", "family adventures"],
    wedding: ["your perfect wedding day", "celebrating your love story", "memories that last forever", "starting your new chapter"]
  }
}

// Time-based contextual phrases
const TIME_CONTEXTS = {
  morning: ["Starting your day strong", "This morning's choice", "Your day begins with"],
  afternoon: ["This afternoon's decision", "Your midday moment", "Right now you can"],
  evening: ["Tonight's choice", "This evening's opportunity", "Before bed, consider"],
  weekend: ["This weekend's decision", "Your Saturday choice", "Sunday's opportunity"],
  monday: ["Starting the week right", "Monday motivation", "This week begins with"],
  friday: ["Ending the week strong", "Friday's final push", "Weekend prep"]
}

/**
 * Extract key details from NorthStarDream for personalized messaging
 * @param {Object} northStarDream - The user's North Star Dream object
 * @returns {Object} Extracted details for messaging
 */
function extractDreamContext(northStarDream) {
  if (!northStarDream) {
    return {
      title: "your financial goals",
      type: "general",
      location: null,
      activities: DREAM_ACTIVITIES.general,
      timeframe: "the future",
      isLocationSpecific: false
    }
  }

  const title = northStarDream.title || "your dream"
  const description = northStarDream.description || ""
  const type = northStarDream.type || "general"
  const targetAge = northStarDream.targetAge || 65
  const yearsToGoal = northStarDream.yearsToGoal || 10
  const location = northStarDream.primaryResidence?.location || null

  // Extract location from title or description
  const locationMatch = (title + " " + description).match(/\b(Maine|California|Florida|Hawaii|Paris|Italy|Japan|Europe|Asia|Colorado|Vermont|Montana|Oregon|Washington|Alaska|Texas|New York|London|Tokyo|Bali|Tuscany|Provence|Scotland|Ireland|New Zealand|Australia|Costa Rica|Mexico|Canada)\b/i)
  const extractedLocation = locationMatch ? locationMatch[1] : location

  // Determine activity type based on title and description
  let activityType = "general"
  const content = (title + " " + description).toLowerCase()
  
  if (content.includes("travel") || content.includes("trip") || content.includes("vacation") || content.includes("europe") || content.includes("asia")) {
    activityType = "travel"
  } else if (content.includes("home") || content.includes("house") || content.includes("renovation") || content.includes("kitchen") || content.includes("garden")) {
    activityType = "home"
  } else if (content.includes("retirement") || content.includes("retire") || type === "retirement") {
    activityType = "retirement"
  } else if (content.includes("business") || content.includes("startup") || content.includes("entrepreneur")) {
    activityType = "business"
  } else if (content.includes("education") || content.includes("degree") || content.includes("learn") || content.includes("course")) {
    activityType = "education"
  } else if (content.includes("wedding") || content.includes("family") || content.includes("children")) {
    activityType = "family"
  }

  return {
    title: title.toLowerCase(),
    type: activityType,
    location: extractedLocation,
    activities: DREAM_ACTIVITIES[activityType] || DREAM_ACTIVITIES.general,
    timeframe: yearsToGoal <= 2 ? "soon" : yearsToGoal <= 5 ? "in a few years" : "in the future",
    yearsToGoal,
    targetAge,
    isLocationSpecific: !!extractedLocation,
    progress: northStarDream.currentProgress || 0
  }
}

/**
 * Get current time context for messaging
 * @returns {Object} Time-based context
 */
function getTimeContext() {
  const now = new Date()
  const hour = now.getHours()
  const day = now.getDay()
  const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][day]
  
  let timeOfDay = 'morning'
  if (hour >= 12 && hour < 17) timeOfDay = 'afternoon'
  else if (hour >= 17) timeOfDay = 'evening'
  
  const isWeekend = day === 0 || day === 6
  const isMonday = day === 1
  const isFriday = day === 5

  return {
    timeOfDay,
    dayName,
    isWeekend,
    isMonday,
    isFriday,
    hour
  }
}

/**
 * Calculate how a small saving translates to dream progress
 * @param {number} amount - Amount saved
 * @param {Object} dreamContext - Dream context object
 * @param {Object} progress - Current progress object
 * @returns {Object} Impact calculation
 */
function calculateDreamImpact(amount, dreamContext, progress) {
  const totalNeeded = progress.totalTarget || 100000 // Default if not provided
  const currentSaved = progress.currentAmount || 0
  const remaining = totalNeeded - currentSaved
  
  const percentageImpact = (amount / totalNeeded) * 100
  const daysCloser = dreamContext.yearsToGoal ? (amount / (remaining / (dreamContext.yearsToGoal * 365))) : 1
  const monthsCloser = daysCloser / 30

  return {
    percentageImpact: Math.max(0.01, percentageImpact), // Minimum 0.01% for motivation
    daysCloser: Math.max(0.1, daysCloser),
    monthsCloser: Math.max(0.01, monthsCloser),
    dollarsCloser: amount
  }
}

/**
 * Generate personalized daily encouragement message
 * @param {Object} profile - Complete financial profile
 * @param {Object} progress - Current progress data
 * @param {Object} options - Additional options for message generation
 * @returns {string} Personalized daily message
 */
export function getDailyMessage(profile, progress, options = {}) {
  try {
    const dreamContext = extractDreamContext(profile?.northStarDream)
    const timeContext = getTimeContext()
    const userName = profile?.userProfile?.firstName || "there"
    
    // Select a spending context based on time of day and user profile
    const spendingOptions = Object.keys(SPENDING_CONTEXTS)
    let selectedSpending = 'coffee' // Default
    
    if (timeContext.timeOfDay === 'morning') {
      selectedSpending = Math.random() < 0.7 ? 'coffee' : 'parking'
    } else if (timeContext.timeOfDay === 'afternoon') {
      selectedSpending = ['lunch', 'snacks', 'rideshare'][Math.floor(Math.random() * 3)]
    } else {
      selectedSpending = ['cocktail', 'rideshare', 'streaming'][Math.floor(Math.random() * 3)]
    }
    
    const spending = SPENDING_CONTEXTS[selectedSpending]
    const impact = calculateDreamImpact(spending.daily, dreamContext, progress)
    
    // Select activity based on dream type
    let activities = dreamContext.activities
    if (Array.isArray(activities)) {
      activities = activities[Math.floor(Math.random() * activities.length)]
    } else if (typeof activities === 'object') {
      const activityKeys = Object.keys(activities)
      const selectedKey = activityKeys[Math.floor(Math.random() * activityKeys.length)]
      const activityArray = activities[selectedKey]
      activities = activityArray[Math.floor(Math.random() * activityArray.length)]
    }

    // Generate message variations
    const messageTemplates = [
      // Direct spending trade-off messages
      `Skip today's ${spending.description} and add ${impact.daysCloser.toFixed(1)} more days of ${activities}${dreamContext.isLocationSpecific ? ` in ${dreamContext.location}` : ''}`,
      
      `That ${spending.description} costs $${spending.daily} - enough for ${impact.percentageImpact.toFixed(2)}% more progress toward ${dreamContext.title}${dreamContext.isLocationSpecific ? ` in ${dreamContext.location}` : ''}`,
      
      `${timeContext.timeOfDay === 'morning' ? 'Start your day' : timeContext.timeOfDay === 'afternoon' ? 'Power through your afternoon' : 'End your day'} by choosing ${dreamContext.title} over that ${spending.description} - ${impact.daysCloser.toFixed(1)} days closer to ${activities}`,
      
      // Progress-focused messages
      `Every $${spending.daily} saved brings ${dreamContext.title} ${impact.daysCloser.toFixed(1)} days closer${dreamContext.isLocationSpecific ? ` - imagine ${activities} in ${dreamContext.location}` : ''}`,
      
      `${userName}, skipping today's ${spending.description} means ${impact.monthsCloser.toFixed(2)} months less waiting for ${activities}${dreamContext.isLocationSpecific ? ` in ${dreamContext.location}` : ''}`,
      
      // Time-specific contextual messages
      `${timeContext.isMonday ? 'Start this week strong' : timeContext.isFriday ? 'Finish the week right' : timeContext.isWeekend ? 'Weekend wisdom' : 'Today\'s choice'}: Choose ${dreamContext.title} over that ${spending.description} - each $${spending.daily} is ${impact.percentageImpact.toFixed(2)}% closer to ${activities}`,
      
      // Location-specific messages (when applicable)
      ...(dreamContext.isLocationSpecific ? [
        `Picture yourself ${activities} in ${dreamContext.location} - that's what today's ${spending.description} money could fund instead`,
        `${dreamContext.location} is calling! Skip the ${spending.description} and get ${impact.daysCloser.toFixed(1)} days closer to ${activities}`,
        `Every ${spending.description} you skip brings ${dreamContext.location} and ${activities} into clearer focus`
      ] : []),
      
      // Progress percentage messages
      `You're ${dreamContext.progress}% there! Today's ${spending.description} choice could add another ${impact.percentageImpact.toFixed(2)}% to ${dreamContext.title}`,
      
      `${dreamContext.progress < 25 ? 'Building momentum' : dreamContext.progress < 50 ? 'Halfway heroes make smart choices' : dreamContext.progress < 75 ? 'You\'re in the home stretch' : 'So close you can taste it'}: Skip that ${spending.description} for ${impact.daysCloser.toFixed(1)} more days of ${activities}`,
      
      // Urgency-based messages
      ...(dreamContext.yearsToGoal <= 2 ? [
        `With ${dreamContext.title} just ${dreamContext.yearsToGoal} years away, every ${spending.description} you skip matters - that's ${impact.daysCloser.toFixed(1)} days closer to ${activities}`,
        `${dreamContext.title} is almost within reach! Today's ${spending.description} = ${impact.percentageImpact.toFixed(2)}% more progress toward ${activities}`
      ] : [])
    ]
    
    // Filter out any undefined templates and select one
    const validTemplates = messageTemplates.filter(template => template && template.length > 0)
    const selectedTemplate = validTemplates[Math.floor(Math.random() * validTemplates.length)]
    
    return selectedTemplate || `Every small choice brings you closer to ${dreamContext.title} - make today count!`
    
  } catch (error) {
    console.error('Error generating daily message:', error)
    return "Every dollar saved is a step closer to your dreams - make today count!"
  }
}

/**
 * Generate celebration message for milestone achievements
 * @param {Object} milestone - Milestone object with details
 * @param {Object} profile - Complete financial profile
 * @param {Object} progress - Current progress data
 * @returns {string} Personalized celebration message
 */
export function getCelebrationMessage(milestone, profile, progress) {
  try {
    const dreamContext = extractDreamContext(profile?.northStarDream)
    const userName = profile?.userProfile?.firstName || "Champion"
    const milestoneAmount = milestone?.amount || 0
    const milestonePercentage = milestone?.percentage || 0
    const totalProgress = progress?.progressPercentage || dreamContext.progress || 0
    
    // Calculate remaining progress
    const remaining = 100 - totalProgress
    const remainingAmount = progress?.remainingAmount || 0
    
    // Select celebration activity
    let activities = dreamContext.activities
    if (Array.isArray(activities)) {
      activities = activities[Math.floor(Math.random() * activities.length)]
    } else if (typeof activities === 'object') {
      const activityKeys = Object.keys(activities)
      const selectedKey = activityKeys[Math.floor(Math.random() * activityKeys.length)]
      const activityArray = activities[selectedKey]
      activities = activityArray[Math.floor(Math.random() * activityArray.length)]
    }

    const celebrationTemplates = [
      // Major milestone celebrations
      `🎉 ${userName}, you just hit ${milestonePercentage}% toward ${dreamContext.title}! ${activities}${dreamContext.isLocationSpecific ? ` in ${dreamContext.location}` : ''} is getting so much closer!`,
      
      `🌟 Milestone unlocked! $${milestoneAmount.toLocaleString()} saved means ${activities}${dreamContext.isLocationSpecific ? ` in ${dreamContext.location}` : ''} is no longer just a dream - it's a plan in motion!`,
      
      `🚀 ${userName}, you're absolutely crushing it! ${milestonePercentage}% complete means ${dreamContext.title} is ${remaining}% away from reality!`,
      
      // Progress-specific celebrations
      `🏆 Look what consistency gets you - ${milestonePercentage}% toward ${activities}${dreamContext.isLocationSpecific ? ` in ${dreamContext.location}` : ''}! Every coffee skipped, every smart choice led to this moment.`,
      
      `✨ ${userName}, remember when ${dreamContext.title} felt impossible? You're now ${milestonePercentage}% there! ${activities} awaits!`,
      
      // Location-specific celebrations
      ...(dreamContext.isLocationSpecific ? [
        `🗺️ ${dreamContext.location} is calling your name! ${milestonePercentage}% saved means ${activities} in ${dreamContext.location} is getting closer every day!`,
        `🎯 Destination: ${dreamContext.location}. Progress: ${milestonePercentage}%. Status: Absolutely amazing! ${activities} here you come!`
      ] : []),
      
      // Time-based celebrations
      ...(dreamContext.yearsToGoal <= 2 ? [
        `⏰ With ${dreamContext.title} just ${dreamContext.yearsToGoal} years away and ${milestonePercentage}% saved, ${activities} is practically around the corner!`,
        `🎊 ${milestonePercentage}% in the bank and ${dreamContext.yearsToGoal} years to go - ${dreamContext.title} is about to become your reality!`
      ] : []),
      
      // Achievement-focused celebrations
      `💪 ${userName}, you turned dreams into discipline and discipline into ${milestonePercentage}% progress! ${activities}${dreamContext.isLocationSpecific ? ` in ${dreamContext.location}` : ''} is your reward!`,
      
      `🎈 Pop the champagne (or save that money too)! ${milestonePercentage}% toward ${dreamContext.title} means ${activities} is transitioning from wishful thinking to weekend planning!`,
      
      // Motivational forward-looking celebrations
      `🌈 ${userName}, ${milestonePercentage}% complete! Can you picture it? ${activities}${dreamContext.isLocationSpecific ? ` in ${dreamContext.location}` : ''} - and you're making it happen one smart choice at a time!`,
      
      `⭐ Milestone achieved: ${milestonePercentage}%! ${dreamContext.title} isn't just a someday dream anymore - it's a ${dreamContext.timeframe} reality you're actively creating!`
    ]
    
    // Add special messages for major milestones
    if (milestonePercentage >= 25 && milestonePercentage < 50) {
      celebrationTemplates.push(`🎯 Quarter of the way there! ${dreamContext.title} is no longer a distant dream - ${activities}${dreamContext.isLocationSpecific ? ` in ${dreamContext.location}` : ''} is becoming inevitable!`)
    } else if (milestonePercentage >= 50 && milestonePercentage < 75) {
      celebrationTemplates.push(`🏁 Halfway hero! ${dreamContext.title} is more than half funded - ${activities}${dreamContext.isLocationSpecific ? ` in ${dreamContext.location}` : ''} is closer than it's ever been!`)
    } else if (milestonePercentage >= 75 && milestonePercentage < 90) {
      celebrationTemplates.push(`🎊 Three-quarters there! ${dreamContext.title} is almost fully funded - start planning for ${activities}${dreamContext.isLocationSpecific ? ` in ${dreamContext.location}` : ''}!`)
    } else if (milestonePercentage >= 90) {
      celebrationTemplates.push(`🏆 SO CLOSE! ${milestonePercentage}% means ${dreamContext.title} is practically funded - ${activities}${dreamContext.isLocationSpecific ? ` in ${dreamContext.location}` : ''} is about to become your reality!`)
    }
    
    const selectedTemplate = celebrationTemplates[Math.floor(Math.random() * celebrationTemplates.length)]
    return selectedTemplate || `🎉 Milestone achieved! You're ${milestonePercentage}% closer to ${dreamContext.title}!`
    
  } catch (error) {
    console.error('Error generating celebration message:', error)
    return "🎉 Milestone achieved! You're making incredible progress toward your dreams!"
  }
}

/**
 * Generate recovery message for when users fall off track
 * @param {number} daysOff - Number of days since last contribution
 * @param {Object} profile - Complete financial profile
 * @param {Object} progress - Current progress data
 * @returns {string} Personalized recovery message
 */
export function getRecoveryMessage(daysOff, profile, progress) {
  try {
    const dreamContext = extractDreamContext(profile?.northStarDream)
    const userName = profile?.userProfile?.firstName || "friend"
    const timeContext = getTimeContext()
    
    // Calculate impact of the break
    const dailyTarget = progress?.dailyTarget || 25 // Default daily target
    const missedAmount = daysOff * dailyTarget
    const impact = calculateDreamImpact(missedAmount, dreamContext, progress)
    
    // Select activity based on dream type
    let activities = dreamContext.activities
    if (Array.isArray(activities)) {
      activities = activities[Math.floor(Math.random() * activities.length)]
    } else if (typeof activities === 'object') {
      const activityKeys = Object.keys(activities)
      const selectedKey = activityKeys[Math.floor(Math.random() * activityKeys.length)]
      const activityArray = activities[selectedKey]
      activities = activityArray[Math.floor(Math.random() * activityArray.length)]
    }

    // Different message tones based on days off
    let messageTemplates = []
    
    if (daysOff <= 3) {
      // Gentle encouragement for short breaks
      messageTemplates = [
        `Hey ${userName}, ${dreamContext.title} missed you! ${daysOff} days off means ${activities}${dreamContext.isLocationSpecific ? ` in ${dreamContext.location}` : ''} is ${impact.daysCloser.toFixed(1)} days further away - but you can close that gap today!`,
        
        `${userName}, life happens! Those ${daysOff} days off just delayed ${dreamContext.title} by ${impact.daysCloser.toFixed(1)} days - totally manageable. ${activities}${dreamContext.isLocationSpecific ? ` in ${dreamContext.location}` : ''} is still waiting for you!`,
        
        `Welcome back, ${userName}! ${dreamContext.title} is exactly where you left it, just ${impact.daysCloser.toFixed(1)} days further out. Ready to get back to ${activities}${dreamContext.isLocationSpecific ? ` in ${dreamContext.location}` : ''}?`
      ]
    } else if (daysOff <= 7) {
      // Motivational reset for week-long breaks
      messageTemplates = [
        `${userName}, a week away from ${dreamContext.title} means ${activities}${dreamContext.isLocationSpecific ? ` in ${dreamContext.location}` : ''} moved ${impact.daysCloser.toFixed(1)} days further out. But here's the thing - you can still make this happen!`,
        
        `Life got busy, ${userName}? That week off pushed ${dreamContext.title} back ${impact.daysCloser.toFixed(1)} days, but ${activities}${dreamContext.isLocationSpecific ? ` in ${dreamContext.location}` : ''} is still absolutely achievable. Let's get back on track!`,
        
        `${userName}, ${dreamContext.title} has been patiently waiting! ${daysOff} days off = ${impact.daysCloser.toFixed(1)} days added to your timeline, but ${activities}${dreamContext.isLocationSpecific ? ` in ${dreamContext.location}` : ''} is still calling your name!`
      ]
    } else if (daysOff <= 30) {
      // Stronger motivation for longer breaks
      messageTemplates = [
        `${userName}, ${dreamContext.title} hasn't gone anywhere! ${daysOff} days off means ${activities}${dreamContext.isLocationSpecific ? ` in ${dreamContext.location}` : ''} is ${impact.monthsCloser.toFixed(1)} months further away, but every dream deserves a comeback story!`,
        
        `Hey ${userName}, ${dreamContext.title} is still your dream, right? That ${daysOff}-day break pushed ${activities}${dreamContext.isLocationSpecific ? ` in ${dreamContext.location}` : ''} back ${impact.monthsCloser.toFixed(1)} months, but you can still make this happen!`,
        
        `${userName}, ${dreamContext.title} missed you! ${daysOff} days away means ${impact.monthsCloser.toFixed(1)} months added to your timeline, but ${activities}${dreamContext.isLocationSpecific ? ` in ${dreamContext.location}` : ''} is worth the wait and the restart!`
      ]
    } else {
      // Gentle restart for very long breaks
      messageTemplates = [
        `${userName}, ${dreamContext.title} is still possible! ${daysOff} days is a long break, but ${activities}${dreamContext.isLocationSpecific ? ` in ${dreamContext.location}` : ''} is still worth pursuing. Every expert was once a beginner, and every funded dream started with day one.`,
        
        `Welcome back, ${userName}! ${dreamContext.title} has been waiting patiently. Yes, ${daysOff} days off means ${activities}${dreamContext.isLocationSpecific ? ` in ${dreamContext.location}` : ''} is further away, but the best time to restart was yesterday - the second best time is right now!`,
        
        `${userName}, dreams don't have expiration dates! ${dreamContext.title} is still your goal, and ${activities}${dreamContext.isLocationSpecific ? ` in ${dreamContext.location}` : ''} is still possible. That ${daysOff}-day break is just a chapter, not the whole story!`
      ]
    }
    
    // Add time-specific encouragement
    if (timeContext.isMonday) {
      messageTemplates.push(`${userName}, new week, fresh start! ${dreamContext.title} is ready for your comeback. Those ${daysOff} days off just make ${activities}${dreamContext.isLocationSpecific ? ` in ${dreamContext.location}` : ''} even sweeter when you get there!`)
    }
    
    // Add progress-specific encouragement
    if (dreamContext.progress > 0) {
      messageTemplates.push(`${userName}, you've already proven you can do this - you're ${dreamContext.progress}% toward ${dreamContext.title}! ${daysOff} days off doesn't erase that progress. ${activities}${dreamContext.isLocationSpecific ? ` in ${dreamContext.location}` : ''} is still your destination!`)
    }
    
    const selectedTemplate = messageTemplates[Math.floor(Math.random() * messageTemplates.length)]
    return selectedTemplate || `${userName}, ${dreamContext.title} is still worth pursuing - let's get back on track!`
    
  } catch (error) {
    console.error('Error generating recovery message:', error)
    return "Every day is a new chance to move closer to your dreams - welcome back!"
  }
}

/**
 * Generate contextual nudge based on current situation
 * @param {Object} context - Current context (time, location, activity, etc.)
 * @param {Object} profile - Complete financial profile
 * @param {Object} progress - Current progress data
 * @returns {string} Contextual nudge message
 */
export function getContextualNudge(context, profile, progress) {
  try {
    const dreamContext = extractDreamContext(profile?.northStarDream)
    const userName = profile?.userProfile?.firstName || "there"
    
    // Context-specific nudges
    if (context.situation === 'about_to_spend') {
      const amount = context.amount || 20
      const item = context.item || "that purchase"
      const impact = calculateDreamImpact(amount, dreamContext, progress)
      
      return `${userName}, before you buy ${item} for $${amount}, consider: that's ${impact.daysCloser.toFixed(1)} days closer to ${dreamContext.title}${dreamContext.isLocationSpecific ? ` in ${dreamContext.location}` : ''}. Still worth it?`
    }
    
    if (context.situation === 'payday') {
      const activities = Array.isArray(dreamContext.activities) ? 
        dreamContext.activities[Math.floor(Math.random() * dreamContext.activities.length)] :
        "your dreams"
      
      return `Payday, ${userName}! Before the money disappears into daily life, remember: every dollar toward ${dreamContext.title} is a dollar toward ${activities}${dreamContext.isLocationSpecific ? ` in ${dreamContext.location}` : ''}!`
    }
    
    if (context.situation === 'weekend') {
      return `Weekend planning, ${userName}? While you're thinking about fun, remember that ${dreamContext.title} is the ultimate weekend plan${dreamContext.isLocationSpecific ? ` in ${dreamContext.location}` : ''}. Every dollar saved now is a dollar toward that perfect getaway!`
    }
    
    // Default contextual nudge
    return getDailyMessage(profile, progress)
    
  } catch (error) {
    console.error('Error generating contextual nudge:', error)
    return "Every choice is a chance to move closer to your dreams!"
  }
}

/**
 * Get a random motivational quote specific to the user's dream
 * @param {Object} profile - Complete financial profile
 * @returns {string} Dream-specific motivational quote
 */
export function getDreamSpecificQuote(profile) {
  try {
    const dreamContext = extractDreamContext(profile?.northStarDream)
    
    const quotes = [
      `"${dreamContext.title} isn't just a dream when you have a plan to fund it."`,
      `"Every dollar saved is a vote for the life you want${dreamContext.isLocationSpecific ? ` in ${dreamContext.location}` : ''}."`,
      `"The future you will thank the present you for choosing ${dreamContext.title} over temporary pleasures."`,
      `"Dreams without funding are just wishes. You're turning ${dreamContext.title} into reality."`,
      `"${dreamContext.isLocationSpecific ? dreamContext.location : 'Your dreams'} ${dreamContext.isLocationSpecific ? 'is' : 'are'} calling - and you're answering with action, not just intention."`
    ]
    
    return quotes[Math.floor(Math.random() * quotes.length)]
    
  } catch (error) {
    console.error('Error generating dream-specific quote:', error)
    return '"Dreams don\'t work unless you do - and you\'re doing the work!"'
  }
}

// Export all functions
export default {
  getDailyMessage,
  getCelebrationMessage,
  getRecoveryMessage,
  getContextualNudge,
  getDreamSpecificQuote
}
