import React, { useState, useEffect } from 'react';
import { Sparkles, Target, CheckCircle, BookOpen, Heart, BarChart3, Compass } from 'lucide-react';

/**
 * MinimalLanding Component
 * A clean, focused landing page with just the essential elements:
 * - Hero headline
 * - Brief subtitle 
 * - Primary CTA button
 * - Subtle "learn more" link
 * Designed for maximum impact with minimal distraction
 */
const MinimalLanding = ({ onStartPlanning, onLearnMore }) => {
  const [dailySavings, setDailySavings] = useState(25);
  const [dreamAmount, setDreamAmount] = useState(50000);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [selectedDream, setSelectedDream] = useState(null);
  const [sliderInteractions, setSliderInteractions] = useState(0);
  const [selectedPath, setSelectedPath] = useState(null);
  const [userPsychProfile, setUserPsychProfile] = useState(null);

  // Parse URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const dreamParam = urlParams.get('dream');
    
    if (dreamParam && ['beach-house', 'mountain-cabin', 'city-apartment'].includes(dreamParam)) {
      setSelectedDream(dreamParam);
    }
  }, []);

  // Load psychological profile from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('userPsychProfile');
    if (savedProfile && ['dreamer', 'validator', 'beginner'].includes(savedProfile)) {
      setUserPsychProfile(savedProfile);
    }
  }, []);


  // Calculate dream amount based on daily savings (simplified 5-year compound growth)
  useEffect(() => {
    const calculateDreamAmount = (daily) => {
      const monthlyContribution = daily * 30;
      const monthlyInterestRate = 0.07 / 12; // 7% annual return
      const totalMonths = 5 * 12; // 5 years
      
      let futureValue = 0;
      for (let month = 1; month <= totalMonths; month++) {
        futureValue = (futureValue + monthlyContribution) * (1 + monthlyInterestRate);
      }
      
      return Math.round(futureValue);
    };
    
    setDreamAmount(calculateDreamAmount(dailySavings));
  }, [dailySavings]);


  // Analytics tracking function
  const trackEvent = (eventName, properties = {}) => {
    // In a real application, you would send this to your analytics service
    // For now, we'll log to console and localStorage for demo purposes
    const event = {
      event: eventName,
      timestamp: new Date().toISOString(),
      properties: {
        dailySavings,
        dreamAmount,
        hasInteracted,
        sliderInteractions,
        selectedDream,
        ...properties
      }
    };
    
    console.log('Analytics Event:', event);
    
    // Store in localStorage for demo purposes (in production, send to analytics service)
    const existingEvents = JSON.parse(localStorage.getItem('analyticsEvents') || '[]');
    existingEvents.push(event);
    localStorage.setItem('analyticsEvents', JSON.stringify(existingEvents));
    
    // In production, you would send to services like:
    // - Google Analytics: gtag('event', eventName, properties)
    // - Mixpanel: mixpanel.track(eventName, properties)
    // - Amplitude: amplitude.getInstance().logEvent(eventName, properties)
    // - Custom analytics endpoint: fetch('/api/analytics', { method: 'POST', body: JSON.stringify(event) })
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Psychological profile configurations
  const psychProfileConfigs = {
    dreamer: {
      heroTitle: 'Transform Dreams Into Reality',
      heroSubtitle: 'Your incredible future is closer than you think. Let\'s bring those beautiful dreams to life.',
      buttonText: 'Make My Dreams Happen',
      learnMoreText: 'Discover the magic behind the process'
    },
    validator: {
      heroTitle: 'Secure Your Financial Future',
      heroSubtitle: 'Get clear, proven strategies to confidently build the retirement you deserve.',
      buttonText: 'Build My Secure Plan',
      learnMoreText: 'See the proven methodology'
    },
    beginner: {
      heroTitle: 'Start Your Financial Journey',
      heroSubtitle: 'Simple, step-by-step guidance to help you build wealth and achieve your goals.',
      buttonText: 'Learn How to Begin',
      learnMoreText: 'Understand the basics first'
    }
  };

  // Path selector configurations
  const pathConfigs = {
    dreamer: {
      title: 'Planning My Someday',
      description: 'For visionaries who love to imagine their perfect future life',
      icon: Heart,
      gradient: 'from-pink-50 to-rose-50',
      borderColor: 'border-pink-200',
      iconColor: 'text-pink-600',
      bgColor: 'bg-pink-100',
      hoverGradient: 'hover:from-pink-100 hover:to-rose-100'
    },
    validator: {
      title: 'Checking My Progress',
      description: 'For careful planners who want to validate their current strategy',
      icon: BarChart3,
      gradient: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
      hoverGradient: 'hover:from-blue-100 hover:to-indigo-100'
    },
    beginner: {
      title: 'Just Getting Started',
      description: 'For newcomers who want to learn the fundamentals step-by-step',
      icon: Compass,
      gradient: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100',
      hoverGradient: 'hover:from-green-100 hover:to-emerald-100'
    }
  };

  // Function to handle path selection
  const handlePathSelection = (pathType) => {
    // Store in localStorage first
    localStorage.setItem('userPsychProfile', pathType);
    
    // Track the selection
    trackEvent('psychological_path_selected', {
      pathType,
      landingPageVersion: 'path_selector'
    });
    
    // Set local state for immediate visual feedback
    setSelectedPath(pathType);
    
    // Small delay for visual feedback, then continue to planning
    setTimeout(() => {
      onStartPlanning();
    }, 400);
  };

  // Dream-specific configurations
  const dreamConfigs = {
    'beach-house': {
      title: 'Transform Retirement Planning Into Beach House Dreams',
      subtitle: 'See how daily savings become your oceanfront paradise.',
      gradient: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200',
      iconGradient: 'from-blue-200 to-cyan-300',
      textColor: 'text-blue-600',
      examples: {
        15: '≈ One beachside coffee less',
        30: '≈ Skip one seaside lunch weekly',
        50: '≈ One coastal weekend trip less'
      }
    },
    'mountain-cabin': {
      title: 'Transform Retirement Planning Into Mountain Retreat Dreams',
      subtitle: 'See how daily savings become your peaceful mountain sanctuary.',
      gradient: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      iconGradient: 'from-green-200 to-emerald-300',
      textColor: 'text-green-600',
      examples: {
        15: '≈ One mountain coffee less',
        30: '≈ Skip one trail lunch weekly',
        50: '≈ One hiking trip less'
      }
    },
    'city-apartment': {
      title: 'Transform Retirement Planning Into Urban Lifestyle Dreams',
      subtitle: 'See how daily savings become your downtown apartment.',
      gradient: 'from-purple-50 to-indigo-50',
      borderColor: 'border-purple-200',
      iconGradient: 'from-purple-200 to-indigo-300',
      textColor: 'text-purple-600',
      examples: {
        15: '≈ One city coffee less',
        30: '≈ Skip one downtown lunch weekly',
        50: '≈ One cultural event less'
      }
    }
  };

  // Get current configuration
  const currentConfig = selectedDream ? dreamConfigs[selectedDream] : null;

  return (
    <>
      {/* Custom CSS for slider styling */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 28px;
          width: 28px;
          border-radius: 50%;
          background: #0B7A75;
          cursor: pointer;
          border: 4px solid white;
          box-shadow: 0 4px 12px rgba(11, 122, 117, 0.3);
          transition: all 0.2s ease;
        }
        
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(11, 122, 117, 0.4);
        }
        
        .slider::-moz-range-thumb {
          height: 28px;
          width: 28px;
          border-radius: 50%;
          background: #0B7A75;
          cursor: pointer;
          border: 4px solid white;
          box-shadow: 0 4px 12px rgba(11, 122, 117, 0.3);
          border: none;
        }
        
        .slider:focus {
          outline: none;
        }
        
        .slider:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px rgba(11, 122, 117, 0.2);
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-in-out;
        }
      `}</style>
      
      <div className="min-h-screen flex items-center justify-center p-8 bg-green-50">
        <div className="max-w-4xl mx-auto text-center">
        {/* Debug info - remove in production */}
        <div className="fixed top-4 left-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs z-50">
          Profile: {userPsychProfile || 'none'} | Selected: {selectedPath || 'none'}
        </div>
        
        {/* Conditional rendering based on psychological profile selection */}
        {!userPsychProfile ? (
          /* Path Selector - Show when no profile is selected */
          <>
            {/* Introduction */}
            <div className="text-center mb-12">
              <div className="flex justify-center mb-8">
                <div className="p-4 rounded-full hover-glow" style={{ backgroundColor: 'var(--primary-color)' }}>
                  <Sparkles className="w-16 h-16 text-white" />
                </div>
              </div>
              
              <h1 className="text-6xl font-bold mb-6 text-balance leading-tight" style={{ fontWeight: 700, color: '#2D3748' }}>
                Choose Your
                <span style={{ color: '#0B7A75' }}> Planning Path</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto text-balance">
                Tell us what resonates with you, and we'll personalize your entire experience.
              </p>
            </div>

            {/* Path Selector Cards */}
            <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-5xl mx-auto">
              {Object.entries(pathConfigs).map(([pathType, config]) => {
                const IconComponent = config.icon;
                return (
                  <div
                    key={pathType}
                    onClick={() => handlePathSelection(pathType)}
                    className={`
                      relative cursor-pointer p-8 rounded-2xl border-2 transition-all duration-300 
                      transform hover:scale-105 hover:shadow-xl bg-gradient-to-br 
                      ${config.gradient} ${config.borderColor} ${config.hoverGradient}
                      ${selectedPath === pathType ? 'ring-4 ring-offset-2 scale-105' : ''}
                    `}
                    style={{
                      ringColor: selectedPath === pathType ? '#0B7A75' : 'transparent'
                    }}
                  >
                    {/* Selection indicator */}
                    {selectedPath === pathType && (
                      <div className="absolute top-4 right-4">
                        <CheckCircle className="w-6 h-6 text-teal-600" />
                      </div>
                    )}
                    
                    {/* Icon */}
                    <div className={`flex justify-center mb-6`}>
                      <div className={`p-4 rounded-full ${config.bgColor}`}>
                        <IconComponent className={`w-12 h-12 ${config.iconColor}`} />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        {config.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {config.description}
                      </p>
                    </div>
                    
                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-5 bg-black transition-opacity duration-300"></div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Personalized Hero - Show when profile is selected */
          <>
            {/* Icon */}
            <div className="flex justify-center mb-8">
              <div className="p-4 rounded-full hover-glow" style={{ backgroundColor: 'var(--primary-color)' }}>
                <Sparkles className="w-16 h-16 text-white" />
              </div>
            </div>
            
            {/* Personalized Hero Headline */}
            <h1 className="text-7xl font-bold mb-8 text-balance leading-tight" style={{ fontWeight: 700, color: '#2D3748' }}>
              {currentConfig ? (
                currentConfig.title
              ) : userPsychProfile ? (
                psychProfileConfigs[userPsychProfile].heroTitle
              ) : (
                <>
                  Transform Retirement Planning Into
                  <span style={{ color: '#0B7A75' }}> Life Planning</span>
                </>
              )}
            </h1>
            
            {/* Personalized Subtitle */}
            <p className="text-2xl text-gray-600 mb-12 max-w-2xl mx-auto text-balance">
              {currentConfig 
                ? currentConfig.subtitle 
                : userPsychProfile 
                  ? psychProfileConfigs[userPsychProfile].heroSubtitle 
                  : 'See how your dreams become achievable through daily actions.'}
            </p>
            
            {/* Personalized CTA Button */}
            <div className="mb-12">
              <button
                onClick={() => {
                  trackEvent('start_planning_clicked', {
                    landingPageVersion: 'personalized_hero',
                    dreamContext: selectedDream,
                    psychProfile: userPsychProfile
                  });
                  onStartPlanning();
                }}
                className="px-16 py-6 text-2xl text-white font-bold rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-105 transform"
                style={{ 
                  backgroundColor: '#0B7A75',
                  boxShadow: '0 10px 25px rgba(11, 122, 117, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#096963';
                  e.target.style.boxShadow = '0 15px 35px rgba(11, 122, 117, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#0B7A75';
                  e.target.style.boxShadow = '0 10px 25px rgba(11, 122, 117, 0.3)';
                }}
              >
                {userPsychProfile ? psychProfileConfigs[userPsychProfile].buttonText : 'Start Planning Your Future'}
              </button>
            </div>
            
            {/* Profile change option */}
            <div className="mb-8">
              <button
                onClick={() => {
                  setUserPsychProfile(null);
                  setSelectedPath(null);
                  localStorage.removeItem('userPsychProfile');
                  trackEvent('path_change_requested', {
                    previousProfile: userPsychProfile
                  });
                }}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors underline"
              >
                Choose a different path
              </button>
            </div>
          </>
        )}
        
        {/* Learn More Link - Always present */}
        <div>
          <button
            onClick={() => {
              trackEvent('learn_more_clicked', {
                landingPageVersion: userPsychProfile ? 'personalized_hero' : 'path_selector',
                psychProfile: userPsychProfile
              });
              onLearnMore();
            }}
            className="text-gray-500 hover:text-gray-700 transition-all duration-300 underline underline-offset-4 decoration-gray-400 hover:decoration-gray-600 inline-flex items-center gap-2 group text-lg"
          >
            {userPsychProfile ? psychProfileConfigs[userPsychProfile].learnMoreText : 'Learn how it works'}
            <svg 
              className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
        </div>
      </div>
    </>
  );
};

export default MinimalLanding;
