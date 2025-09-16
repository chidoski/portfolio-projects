/**
 * Psychological Profile Utilities
 * Provides text variants and configuration based on user's psychological profile
 */

// Get user's psychological profile from localStorage
export const getUserPsychProfile = () => {
  const profile = localStorage.getItem('userPsychProfile');
  return ['dreamer', 'validator', 'beginner'].includes(profile) ? profile : null;
};

// Set user's psychological profile in localStorage
export const setUserPsychProfile = (profile) => {
  if (['dreamer', 'validator', 'beginner'].includes(profile)) {
    localStorage.setItem('userPsychProfile', profile);
    return true;
  }
  return false;
};

// Clear user's psychological profile
export const clearUserPsychProfile = () => {
  localStorage.removeItem('userPsychProfile');
};

// Text variants for different psychological profiles
export const getTextVariants = (textType, fallbackText = '') => {
  const profile = getUserPsychProfile();
  
  const textVariants = {
    // Hero Headlines
    heroTitle: {
      dreamer: 'Transform Dreams Into Reality',
      validator: 'Secure Your Financial Future', 
      beginner: 'Start Your Financial Journey'
    },
    
    // Hero Subtitles
    heroSubtitle: {
      dreamer: 'Your incredible future is closer than you think. Let\'s bring those beautiful dreams to life.',
      validator: 'Get clear, proven strategies to confidently build the retirement you deserve.',
      beginner: 'Simple, step-by-step guidance to help you build wealth and achieve your goals.'
    },
    
    // Primary CTA Buttons
    primaryCTA: {
      dreamer: 'Make My Dreams Happen',
      validator: 'Build My Secure Plan', 
      beginner: 'Learn How to Begin'
    },
    
    // Secondary CTA Buttons
    secondaryCTA: {
      dreamer: 'Explore the Magic',
      validator: 'See the Methodology',
      beginner: 'Understand the Basics'
    },
    
    // Dashboard Headlines
    dashboardTitle: {
      dreamer: 'Your Dreams Dashboard',
      validator: 'Your Progress Dashboard',
      beginner: 'Your Learning Dashboard'
    },
    
    dashboardSubtitle: {
      dreamer: 'Watch your beautiful dreams come to life through daily actions',
      validator: 'Track your proven strategy and validate your progress',
      beginner: 'Build confidence as you learn and grow your wealth step by step'
    },
    
    // Empty State Messages
    emptyStateTitle: {
      dreamer: 'Start Your Dream Journey',
      validator: 'Build Your Security Plan',
      beginner: 'Take Your First Step'
    },
    
    emptyStateSubtitle: {
      dreamer: 'Create your first dream and discover how small daily actions can turn into life-changing magic.',
      validator: 'Set up your first goal and see how systematic planning creates unshakeable confidence.',
      beginner: 'Start with a simple goal and learn the fundamentals of building wealth step by step.'
    },
    
    emptyStateCTA: {
      dreamer: 'Create Your First Dream',
      validator: 'Build Your First Goal',
      beginner: 'Start Learning & Planning'
    },
    
    // Learn More Links
    learnMore: {
      dreamer: 'Discover the magic behind the process',
      validator: 'See the proven methodology',
      beginner: 'Understand the basics first'
    },
    
    // Quick Start Page
    quickStartTitle: {
      dreamer: 'Quick Start Your Dream',
      validator: 'Quick Start Your Plan',
      beginner: 'Quick Start Your Learning'
    },
    
    quickStartSubtitle: {
      dreamer: 'Choose from our inspiring dream templates to get started instantly.',
      validator: 'Choose from our proven goal templates with realistic timeframes.',
      beginner: 'Choose from our educational templates to learn as you plan.'
    },
    
    // Custom option text
    customOptionTitle: {
      dreamer: 'Don\'t see your dream here?',
      validator: 'Need a custom strategy?',
      beginner: 'Ready to try something custom?'
    },
    
    customOptionSubtitle: {
      dreamer: 'Create a magical custom dream with your own vision and timeline.',
      validator: 'Build a personalized plan with your specific goals and requirements.',
      beginner: 'Try creating your own simple goal with guided assistance.'
    },
    
    customOptionCTA: {
      dreamer: 'Build Custom Dream Life',
      validator: 'Build Custom Security Plan',
      beginner: 'Try Custom Goal (Guided)'
    },
    
    // Welcome/Detailed page
    welcomeTitle: {
      dreamer: 'Design Your Someday Life Dream',
      validator: 'Design Your Someday Life Dream',
      beginner: 'Design Your Someday Life Dream'
    },
    
    welcomeSubtitle: {
      dreamer: 'See how your dreams become achievable through inspired daily actions.',
      validator: 'See how your concerns become confidence through proven daily strategies.',
      beginner: 'See how your questions become answers through simple daily learning.'
    },
    
    welcomePrimaryCTA: {
      dreamer: 'Start Designing My Dream',
      validator: 'Start Designing My Dream',
      beginner: 'Start Designing My Dream'
    },
    
    // Add dream button variants
    addDreamButton: {
      dreamer: 'Add New Dream',
      validator: 'Add New Goal',
      beginner: 'Add Learning Goal'
    }
  };
  
  if (!profile) {
    return fallbackText;
  }
  
  return textVariants[textType]?.[profile] || fallbackText;
};

// Get motivational encouragement based on profile
export const getEncouragement = () => {
  const profile = getUserPsychProfile();
  
  const encouragements = {
    dreamer: [
      "Your dreams are valid and achievable! ✨",
      "Every small step brings magic closer! 🌟",
      "You're building something beautiful! 💫",
      "Trust the process - dreams do come true! 🦋"
    ],
    validator: [
      "You're on the right track! 📈",
      "Your systematic approach is paying off! ✅",
      "Steady progress builds lasting security! 🛡️",
      "Your diligence today creates tomorrow's confidence! 🎯"
    ],
    beginner: [
      "You're learning and growing! 📚",
      "Every expert was once a beginner! 🌱",
      "Small steps lead to big achievements! 👣",
      "You're building a strong foundation! 🏗️"
    ]
  };
  
  if (!profile) return "You're making great progress!";
  
  const profileEncouragements = encouragements[profile];
  return profileEncouragements[Math.floor(Math.random() * profileEncouragements.length)];
};

// Get color scheme based on profile
export const getProfileColors = () => {
  const profile = getUserPsychProfile();
  
  const colorSchemes = {
    dreamer: {
      primary: '#E91E63', // Pink
      secondary: '#FCE4EC',
      accent: '#FF6B9D',
      gradient: 'from-pink-50 to-rose-50'
    },
    validator: {
      primary: '#1976D2', // Blue
      secondary: '#E3F2FD',
      accent: '#42A5F5',
      gradient: 'from-blue-50 to-indigo-50'
    },
    beginner: {
      primary: '#388E3C', // Green
      secondary: '#E8F5E8',
      accent: '#66BB6A',
      gradient: 'from-green-50 to-emerald-50'
    }
  };
  
  return colorSchemes[profile] || {
    primary: '#0B7A75', // Default teal
    secondary: '#E6F7F7',
    accent: '#14B8A6',
    gradient: 'from-teal-50 to-cyan-50'
  };
};

// Get appropriate icons based on profile
export const getProfileIcon = (iconType) => {
  const profile = getUserPsychProfile();
  
  const iconMappings = {
    primary: {
      dreamer: 'Heart',
      validator: 'Shield', 
      beginner: 'BookOpen'
    },
    dashboard: {
      dreamer: 'Sparkles',
      validator: 'BarChart3',
      beginner: 'GraduationCap'
    },
    cta: {
      dreamer: 'Wand2',
      validator: 'Target',
      beginner: 'ArrowRight'
    }
  };
  
  return iconMappings[iconType]?.[profile] || 'Sparkles';
};

export default {
  getUserPsychProfile,
  setUserPsychProfile,
  clearUserPsychProfile,
  getTextVariants,
  getEncouragement,
  getProfileColors,
  getProfileIcon
};
