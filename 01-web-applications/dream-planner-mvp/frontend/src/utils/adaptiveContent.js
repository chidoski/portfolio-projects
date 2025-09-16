/**
 * Adaptive Content Utility
 * Provides psychological profile-based messaging for all major screens
 * Adapts language and tone while keeping functionality unchanged
 */

// Get user's psychological profile from localStorage
export const getUserPsychProfile = () => {
  const profile = localStorage.getItem('userPsychProfile');
  return ['dreamer', 'validator', 'beginner'].includes(profile) ? profile : null;
};

// Main adaptive content function
export const getAdaptiveContent = (contentType, section = 'default', fallback = '') => {
  const profile = getUserPsychProfile();
  
  const contentMap = {
    // ==================== SOMEDAY LIFE BUILDER ====================
    somedayBuilder: {
      pageTitle: {
        dreamer: 'Design Your Ideal Retirement',
        validator: 'Verify Your Retirement Readiness',
        beginner: 'Plan Your Retirement Step-by-Step'
      },
      pageSubtitle: {
        dreamer: 'Paint a vivid picture of your perfect future life and watch it come alive',
        validator: 'Build a comprehensive retirement strategy with proven methodologies',
        beginner: 'Learn to create a solid retirement plan with guided assistance'
      },
      stepIntro: {
        dreamer: 'Let your imagination soar as we craft your dream retirement',
        validator: 'Let\'s systematically plan your secure retirement future',
        beginner: 'Let\'s learn together how to build your retirement plan'
      },
      lifeVisionPrompt: {
        dreamer: 'Describe your magical someday life in vivid detail',
        validator: 'Define your realistic retirement lifestyle and requirements',
        beginner: 'Think about what you\'d like your retirement to look like'
      },
      locationSection: {
        dreamer: 'Where will your dream life unfold?',
        validator: 'Where do you plan to establish your retirement base?',
        beginner: 'Where would you like to live in retirement?'
      },
      activitiesSection: {
        dreamer: 'What brings your soul alive?',
        validator: 'What activities will you prioritize in retirement?',
        beginner: 'What would you like to do with your time?'
      },
      continueButton: {
        dreamer: 'Bring My Dreams to Life',
        validator: 'Proceed with My Plan',
        beginner: 'Continue Learning & Planning'
      }
    },

    // ==================== FINANCIAL REALITY WIZARD ====================
    financialReality: {
      pageTitle: {
        dreamer: 'Transform Dreams into Financial Reality',
        validator: 'Validate Your Financial Position',
        beginner: 'Understand Your Financial Starting Point'
      },
      pageSubtitle: {
        dreamer: 'Let\'s turn your beautiful vision into an achievable financial plan',
        validator: 'Let\'s assess your current position and validate your strategy',
        beginner: 'Let\'s learn about your finances and create a simple plan'
      },
      currentIncomeSection: {
        dreamer: 'What fuels your dream-building today?',
        validator: 'What is your current verified income?',
        beginner: 'How much do you earn right now?'
      },
      expensesSection: {
        dreamer: 'What keeps your current life flowing?',
        validator: 'What are your documented monthly expenses?',
        beginner: 'How much do you spend each month?'
      },
      savingsSection: {
        dreamer: 'How much magic can you save each month?',
        validator: 'What is your proven monthly savings capacity?',
        beginner: 'How much can you try to save each month?'
      },
      timeframeSection: {
        dreamer: 'When do you want your dreams to bloom?',
        validator: 'What is your target retirement timeline?',
        beginner: 'When would you like to retire?'
      },
      resultsIntro: {
        dreamer: 'Here\'s how your dreams can become reality',
        validator: 'Here\'s your validated financial assessment',
        beginner: 'Here\'s what we learned about your finances'
      },
      continueButton: {
        dreamer: 'Make It Happen',
        validator: 'Proceed with Confidence',
        beginner: 'Keep Learning'
      }
    },

    // ==================== DASHBOARD ====================
    dashboard: {
      welcomeBack: {
        dreamer: 'Welcome back, Dreamer!',
        validator: 'Welcome back, Planner!',
        beginner: 'Welcome back, Learner!'
      },
      mainTitle: {
        dreamer: 'Your Dreams in Motion',
        validator: 'Your Progress Dashboard',
        beginner: 'Your Learning Journey'
      },
      subtitle: {
        dreamer: 'Watch your beautiful dreams transform into reality',
        validator: 'Track your validated progress and maintain confidence',
        beginner: 'See how you\'re learning and growing your wealth'
      },
      addButton: {
        dreamer: 'Add New Dream',
        validator: 'Add New Goal',
        beginner: 'Add Learning Goal'
      },
      emptyStateTitle: {
        dreamer: 'Begin Your Dream Journey',
        validator: 'Start Your Strategic Plan',
        beginner: 'Take Your First Learning Step'
      },
      emptyStateMessage: {
        dreamer: 'Create your first magical dream and watch small actions become life-changing transformations',
        validator: 'Set up your first strategic goal and see how systematic planning builds unshakeable confidence',
        beginner: 'Start with a simple learning goal and discover how to build wealth step by step'
      },
      progressSection: {
        dreamer: 'Dream Progress Magic',
        validator: 'Strategic Progress Analysis',
        beginner: 'Learning Progress Tracker'
      }
    },

    // ==================== QUICK START ====================
    quickStart: {
      pageTitle: {
        dreamer: 'Quick Start Your Dream',
        validator: 'Quick Start Your Plan',
        beginner: 'Quick Start Your Learning'
      },
      pageSubtitle: {
        dreamer: 'Choose from our inspiring dream templates to spark your imagination',
        validator: 'Choose from our proven goal templates with validated timeframes',
        beginner: 'Choose from our educational templates to learn while you plan'
      },
      templateAction: {
        dreamer: 'Start This Dream',
        validator: 'Implement This Goal',
        beginner: 'Learn This Approach'
      },
      customOptionTitle: {
        dreamer: 'Don\'t see your dream here?',
        validator: 'Need a custom strategy?',
        beginner: 'Ready to try something custom?'
      },
      customOptionMessage: {
        dreamer: 'Create a magical custom dream with your unique vision and timeline',
        validator: 'Build a personalized plan with your specific requirements and validation',
        beginner: 'Try creating your own simple goal with guided learning assistance'
      },
      customButton: {
        dreamer: 'Build Custom Dream Life',
        validator: 'Build Custom Strategic Plan',
        beginner: 'Try Custom Goal (Guided)'
      }
    },

    // ==================== PROGRESS & MOTIVATION ====================
    motivation: {
      encouragement: {
        dreamer: [
          'Your dreams are becoming reality! ✨',
          'Every step adds magic to your future! 🌟',
          'You\'re creating something beautiful! 💫',
          'Trust the journey - miracles are unfolding! 🦋'
        ],
        validator: [
          'Your strategy is working perfectly! 📈',
          'Your systematic approach is proven effective! ✅',
          'Your progress validates your planning! 🛡️',
          'Your discipline today ensures tomorrow\'s security! 🎯'
        ],
        beginner: [
          'You\'re learning and growing so well! 📚',
          'Every lesson builds your expertise! 🌱',
          'Small steps create big understanding! 👣',
          'You\'re building excellent financial habits! 🏗️'
        ]
      },
      milestoneReached: {
        dreamer: 'Dream milestone achieved! You\'re making magic happen! 🎉',
        validator: 'Strategic milestone confirmed! Your plan is working! 🏆',
        beginner: 'Learning milestone reached! You\'re building great skills! 🎓'
      },
      nextSteps: {
        dreamer: 'What\'s the next piece of magic to create?',
        validator: 'What\'s the next strategic action to take?',
        beginner: 'What\'s the next skill to learn and practice?'
      }
    },

    // ==================== FORMS & INPUTS ====================
    forms: {
      saveButton: {
        dreamer: 'Save My Dreams',
        validator: 'Save My Plan',
        beginner: 'Save My Progress'
      },
      cancelButton: {
        dreamer: 'Keep Dreaming',
        validator: 'Review Strategy',
        beginner: 'Keep Learning'
      },
      submitButton: {
        dreamer: 'Make It Happen',
        validator: 'Execute Plan',
        beginner: 'Apply Learning'
      },
      backButton: {
        dreamer: 'Refine My Dream',
        validator: 'Adjust Strategy',
        beginner: 'Review Lesson'
      }
    },

    // ==================== CALCULATIONS & RESULTS ====================
    calculations: {
      resultsTitle: {
        dreamer: 'Your Dream Blueprint',
        validator: 'Your Strategic Analysis',
        beginner: 'Your Learning Results'
      },
      timelineTitle: {
        dreamer: 'Your Dream Timeline',
        validator: 'Your Strategic Timeline',
        beginner: 'Your Learning Path'
      },
      recommendationsTitle: {
        dreamer: 'Magic-Making Recommendations',
        validator: 'Strategic Recommendations',
        beginner: 'Learning Recommendations'
      },
      dailyActionTitle: {
        dreamer: 'Daily Dream Actions',
        validator: 'Daily Strategic Actions',
        beginner: 'Daily Learning Actions'
      }
    },

    // ==================== SETTINGS & PROFILE ====================
    settings: {
      profileTitle: {
        dreamer: 'Your Dream Profile',
        validator: 'Your Strategic Profile',
        beginner: 'Your Learning Profile'
      },
      preferencesTitle: {
        dreamer: 'Dream Preferences',
        validator: 'Strategic Preferences',
        beginner: 'Learning Preferences'
      },
      pathChangeOption: {
        dreamer: 'Switch to a different dreaming style?',
        validator: 'Switch to a different planning approach?',
        beginner: 'Switch to a different learning style?'
      }
    }
  };

  // Navigate through the nested structure
  const content = contentMap[contentType]?.[section];
  
  if (!content) {
    return fallback;
  }

  if (!profile) {
    return fallback;
  }

  // Handle arrays (like encouragement messages)
  if (Array.isArray(content[profile])) {
    return content[profile][Math.floor(Math.random() * content[profile].length)];
  }

  return content[profile] || fallback;
};

// Convenience functions for specific content types
export const getSomedayBuilderContent = (section, fallback = '') => 
  getAdaptiveContent('somedayBuilder', section, fallback);

export const getFinancialRealityContent = (section, fallback = '') => 
  getAdaptiveContent('financialReality', section, fallback);

export const getDashboardContent = (section, fallback = '') => 
  getAdaptiveContent('dashboard', section, fallback);

export const getQuickStartContent = (section, fallback = '') => 
  getAdaptiveContent('quickStart', section, fallback);

export const getMotivationContent = (section, fallback = '') => 
  getAdaptiveContent('motivation', section, fallback);

export const getFormsContent = (section, fallback = '') => 
  getAdaptiveContent('forms', section, fallback);

export const getCalculationsContent = (section, fallback = '') => 
  getAdaptiveContent('calculations', section, fallback);

export const getSettingsContent = (section, fallback = '') => 
  getAdaptiveContent('settings', section, fallback);

// Profile-based styling and themes
export const getProfileTheme = () => {
  const profile = getUserPsychProfile();
  
  const themes = {
    dreamer: {
      primary: '#E91E63',
      secondary: '#FCE4EC',
      accent: '#FF6B9D',
      gradient: 'from-pink-50 to-rose-50',
      textGradient: 'from-pink-600 to-rose-600'
    },
    validator: {
      primary: '#1976D2',
      secondary: '#E3F2FD',
      accent: '#42A5F5',
      gradient: 'from-blue-50 to-indigo-50',
      textGradient: 'from-blue-600 to-indigo-600'
    },
    beginner: {
      primary: '#388E3C',
      secondary: '#E8F5E8',
      accent: '#66BB6A',
      gradient: 'from-green-50 to-emerald-50',
      textGradient: 'from-green-600 to-emerald-600'
    }
  };
  
  return themes[profile] || {
    primary: '#0B7A75',
    secondary: '#E6F7F7',
    accent: '#14B8A6',
    gradient: 'from-teal-50 to-cyan-50',
    textGradient: 'from-teal-600 to-cyan-600'
  };
};

// Export default object for convenience
export default {
  getUserPsychProfile,
  getAdaptiveContent,
  getSomedayBuilderContent,
  getFinancialRealityContent,
  getDashboardContent,
  getQuickStartContent,
  getMotivationContent,
  getFormsContent,
  getCalculationsContent,
  getSettingsContent,
  getProfileTheme
};
