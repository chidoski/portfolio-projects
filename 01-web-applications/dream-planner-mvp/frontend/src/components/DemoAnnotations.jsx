import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronRight, Info, Lightbulb, TrendingUp, Users, Crown, Zap } from 'lucide-react';

/**
 * DemoAnnotations Component
 * Provides contextual, guided tour-style callouts during CEO presentations
 * Features:
 * - Subtle animations with auto-dismiss
 * - CEO-specific contextual messages
 * - Guided tour flow with sequence management
 * - Non-intrusive but attention-grabbing design
 */

// CEO personas and their known backgrounds/interests
const CEO_PERSONAS = {
  'fintech': {
    name: 'FinTech CEO',
    interests: ['engagement', 'retention', 'viral growth', 'unit economics'],
    background: 'You mentioned user engagement challenges in your TechCrunch interview',
    painPoints: ['user churn', 'engagement metrics', 'CAC payback']
  },
  'b2c': {
    name: 'B2C Startup CEO', 
    interests: ['user experience', 'viral coefficients', 'retention'],
    background: 'Your podcast about building sticky products',
    painPoints: ['user retention', 'product-market fit', 'scaling challenges']
  },
  'enterprise': {
    name: 'Enterprise CEO',
    interests: ['market size', 'scalability', 'competitive moats'],
    background: 'Your expertise in building platform businesses',
    painPoints: ['market penetration', 'competitive differentiation', 'revenue growth']
  },
  'generic': {
    name: 'Industry Leader',
    interests: ['innovation', 'market opportunity', 'user behavior'],
    background: 'Your experience in transformative technologies',
    painPoints: ['market disruption', 'customer acquisition', 'sustainable growth']
  }
};

// Demo annotation configurations for different screens/moments
const DEMO_ANNOTATIONS = {
  // Welcome/Problem screens
  'traditional-apps-fail': {
    id: 'traditional-fail',
    type: 'insight',
    title: 'Key Innovation',
    message: 'Notice: Traditional apps stop at expense tracking - we continue for 40 years',
    icon: <Lightbulb className="w-4 h-4" />,
    position: { top: '20%', right: '10%' },
    timing: { delay: 2000, duration: 8000 },
    ceoContext: {
      fintech: 'This solves the engagement problem you mentioned in your podcast',
      b2c: 'This is why we retain users 10x longer than traditional apps',
      enterprise: 'This creates the sustainable moats you look for in investments'
    }
  },

  // Three-bucket system
  'three-bucket-innovation': {
    id: 'bucket-system',
    type: 'breakthrough',
    title: 'Breakthrough Psychology',
    message: 'Not retirement at 65, but dreams in 5-15 years - this changes everything',
    icon: <Zap className="w-4 h-4" />,
    position: { top: '30%', left: '15%' },
    timing: { delay: 3000, duration: 10000 },
    ceoContext: {
      fintech: 'This addresses the "future motivation" gap other apps can\'t solve',
      b2c: 'Dreams create emotional attachment - the holy grail of product stickiness',
      enterprise: 'This psychological insight becomes our competitive moat'
    }
  },

  // Sarah's story / customer journey
  'life-resilience': {
    id: 'system-resilience',
    type: 'differentiation',
    title: 'Resilience Factor',
    message: 'Watch: Life throws curveballs, but dreams stay intact - this builds trust',
    icon: <TrendingUp className="w-4 h-4" />,
    position: { bottom: '25%', right: '20%' },
    timing: { delay: 1500, duration: 6000 },
    ceoContext: {
      fintech: 'This resilience drives the 92% retention rate vs 15% industry average',
      b2c: 'Users trust us with life changes - that\'s product-market fit',
      enterprise: 'This flexibility scales across all customer segments'
    }
  },

  // Business metrics
  'engagement-multiplier': {
    id: 'engagement-win',
    type: 'metrics',
    title: 'Engagement Breakthrough',
    message: '12 minutes vs 2 minutes - users plan life, not just track expenses',
    icon: <Users className="w-4 h-4" />,
    position: { top: '15%', left: '25%' },
    timing: { delay: 1000, duration: 7000 },
    ceoContext: {
      fintech: 'This engagement drives the unit economics you\'ve been seeking',
      b2c: 'This is the "time well spent" metric that creates real value',
      enterprise: 'This depth of engagement justifies premium pricing'
    }
  },

  // LTV comparison
  'ltv-dominance': {
    id: 'ltv-advantage',
    type: 'economics',
    title: 'LTV Advantage',
    message: '$4,800 vs $45 LTV - 40-year relationships vs 3-month churn',
    icon: <Crown className="w-4 h-4" />,
    position: { top: '40%', right: '15%' },
    timing: { delay: 2500, duration: 8000 },
    ceoContext: {
      fintech: 'This LTV multiple justifies any reasonable CAC investment',
      b2c: 'This is the "lifetime value of customer relationships" at scale',
      enterprise: 'This unit economics advantage compounds over time'
    }
  },

  // Market opportunity
  'market-expansion': {
    id: 'market-size',
    type: 'opportunity',
    title: 'Market Insight',
    message: '$180B+ market across ALL life stages - this isn\'t niche, it\'s universal',
    icon: <TrendingUp className="w-4 h-4" />,
    position: { bottom: '20%', left: '20%' },
    timing: { delay: 2000, duration: 9000 },
    ceoContext: {
      fintech: 'This addresses the "total addressable market" question for your board',
      b2c: 'This market grows with demographic trends - aging millennials',
      enterprise: 'This TAM supports unicorn-scale outcomes'
    }
  },

  // Success screen
  'emotional-payoff': {
    id: 'success-celebration',
    type: 'outcome',
    title: 'Emotional Payoff',
    message: 'This celebration moment drives viral sharing - users become advocates',
    icon: <Users className="w-4 h-4" />,
    position: { top: '25%', right: '25%' },
    timing: { delay: 1000, duration: 6000 },
    ceoContext: {
      fintech: 'This emotional connection drives the 2.3x viral coefficient',
      b2c: 'This is where users post success stories and refer friends',
      enterprise: 'This advocacy reduces our customer acquisition costs'
    }
  }
};

// Animation variants for different annotation types
const ANIMATION_VARIANTS = {
  insight: 'animate-bounce-subtle animate-fade-in',
  breakthrough: 'animate-pulse-glow animate-fade-in', 
  differentiation: 'animate-slide-in-right animate-fade-in',
  metrics: 'animate-scale-in animate-fade-in',
  economics: 'animate-slide-in-left animate-fade-in',
  opportunity: 'animate-float-up-subtle animate-fade-in',
  outcome: 'animate-celebration animate-fade-in'
};

// Color schemes for different annotation types
const TYPE_STYLES = {
  insight: 'bg-blue-500 border-blue-300 text-white',
  breakthrough: 'bg-purple-500 border-purple-300 text-white',
  differentiation: 'bg-green-500 border-green-300 text-white',
  metrics: 'bg-orange-500 border-orange-300 text-white',
  economics: 'bg-pink-500 border-pink-300 text-white',
  opportunity: 'bg-indigo-500 border-indigo-300 text-white',
  outcome: 'bg-emerald-500 border-emerald-300 text-white'
};

const DemoAnnotations = ({ 
  activeAnnotations = [], 
  ceoPersona = 'generic',
  onAnnotationDismiss,
  demoMode = false,
  autoAdvance = true 
}) => {
  const [visibleAnnotations, setVisibleAnnotations] = useState([]);
  const [dismissedAnnotations, setDismissedAnnotations] = useState(new Set());
  const [currentSequence, setCurrentSequence] = useState(0);
  const timeoutsRef = useRef(new Map());
  const sequenceTimeoutRef = useRef(null);

  // Get CEO-specific context
  const ceoProfile = CEO_PERSONAS[ceoPersona] || CEO_PERSONAS.generic;

  // Show annotation with timing
  const showAnnotation = useCallback((annotationId, delay = 0) => {
    if (dismissedAnnotations.has(annotationId)) return;

    const timeout = setTimeout(() => {
      setVisibleAnnotations(prev => {
        if (!prev.find(a => a.id === annotationId)) {
          const annotation = DEMO_ANNOTATIONS[annotationId];
          return [...prev, { ...annotation, id: annotationId }];
        }
        return prev;
      });

      // Auto-dismiss after duration
      if (autoAdvance) {
        const annotation = DEMO_ANNOTATIONS[annotationId];
        const dismissTimeout = setTimeout(() => {
          dismissAnnotation(annotationId);
        }, annotation.timing.duration);
        
        timeoutsRef.current.set(`dismiss-${annotationId}`, dismissTimeout);
      }
    }, delay);

    timeoutsRef.current.set(annotationId, timeout);
  }, [dismissedAnnotations, autoAdvance]);

  // Dismiss annotation
  const dismissAnnotation = useCallback((annotationId) => {
    setVisibleAnnotations(prev => prev.filter(a => a.id !== annotationId));
    setDismissedAnnotations(prev => new Set([...prev, annotationId]));
    
    // Clear any related timeouts
    const timeout = timeoutsRef.current.get(annotationId);
    const dismissTimeout = timeoutsRef.current.get(`dismiss-${annotationId}`);
    if (timeout) clearTimeout(timeout);
    if (dismissTimeout) clearTimeout(dismissTimeout);
    
    // Notify parent component
    if (onAnnotationDismiss) {
      onAnnotationDismiss(annotationId);
    }
  }, [onAnnotationDismiss]);

  // Handle active annotations changes
  useEffect(() => {
    if (!demoMode) return;

    activeAnnotations.forEach(annotationId => {
      if (DEMO_ANNOTATIONS[annotationId] && !dismissedAnnotations.has(annotationId)) {
        const annotation = DEMO_ANNOTATIONS[annotationId];
        showAnnotation(annotationId, annotation.timing.delay);
      }
    });
  }, [activeAnnotations, demoMode, showAnnotation, dismissedAnnotations]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);
    };
  }, []);

  // Reset annotations when demo restarts
  const resetAnnotations = useCallback(() => {
    setVisibleAnnotations([]);
    setDismissedAnnotations(new Set());
    setCurrentSequence(0);
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current.clear();
  }, []);

  // Expose reset function for parent components
  useEffect(() => {
    window.demoAnnotations = { reset: resetAnnotations };
    return () => {
      delete window.demoAnnotations;
    };
  }, [resetAnnotations]);

  if (!demoMode || visibleAnnotations.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {visibleAnnotations.map((annotation) => {
        const typeStyle = TYPE_STYLES[annotation.type] || TYPE_STYLES.insight;
        const animationClass = ANIMATION_VARIANTS[annotation.type] || ANIMATION_VARIANTS.insight;
        
        // Get CEO-specific message if available
        const contextMessage = annotation.ceoContext?.[ceoPersona] || annotation.message;
        
        return (
          <div
            key={annotation.id}
            className={`absolute pointer-events-auto ${animationClass}`}
            style={{
              ...annotation.position,
              animationDelay: '0s',
              animationFillMode: 'both'
            }}
          >
            {/* Annotation Bubble */}
            <div className={`
              relative max-w-xs p-4 rounded-xl shadow-2xl border-2 backdrop-blur-sm
              ${typeStyle}
              transform transition-all duration-300 ease-out
              hover:scale-105 hover:shadow-3xl
            `}>
              {/* Close Button */}
              <button
                onClick={() => dismissAnnotation(annotation.id)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-white text-gray-600 rounded-full shadow-lg hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center"
                title="Dismiss"
              >
                <X className="w-3 h-3" />
              </button>

              {/* Annotation Header */}
              <div className="flex items-center space-x-2 mb-2">
                <div className="text-white opacity-90">
                  {annotation.icon}
                </div>
                <h4 className="text-sm font-bold text-white opacity-90">
                  {annotation.title}
                </h4>
              </div>

              {/* Annotation Message */}
              <p className="text-sm text-white leading-relaxed mb-3">
                {contextMessage}
              </p>

              {/* CEO Context Badge (if available) */}
              {annotation.ceoContext?.[ceoPersona] && (
                <div className="text-xs text-white opacity-75 bg-white bg-opacity-20 rounded-full px-3 py-1 mt-2">
                  <Info className="w-3 h-3 inline mr-1" />
                  Contextual for {ceoProfile.name}
                </div>
              )}

              {/* Pointer Arrow */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <div className={`w-4 h-4 rotate-45 ${typeStyle.split(' ')[0]} border-r-2 border-b-2 ${typeStyle.split(' ')[1]}`}></div>
              </div>
            </div>

            {/* Subtle Glow Effect */}
            <div className={`
              absolute inset-0 -z-10 rounded-xl blur-xl opacity-30
              ${typeStyle.split(' ')[0]}
            `}></div>
          </div>
        );
      })}
    </div>
  );
};

// Hook for managing annotation sequences in demo flows
export const useAnnotationSequence = (demoStep, ceoPersona = 'generic') => {
  const [activeAnnotations, setActiveAnnotations] = useState([]);

  // Define which annotations appear on which demo steps
  const STEP_ANNOTATIONS = {
    'problem': ['traditional-apps-fail'],
    'solution': ['three-bucket-innovation'],
    'sarah_story': ['life-resilience'],
    'business_metrics': ['engagement-multiplier', 'ltv-dominance'],
    'market_opportunity': ['market-expansion'],
    'success_demo': ['emotional-payoff']
  };

  useEffect(() => {
    const annotations = STEP_ANNOTATIONS[demoStep] || [];
    setActiveAnnotations(annotations);
  }, [demoStep]);

  return { activeAnnotations };
};

// Predefined annotation sequences for common demo flows
export const DEMO_SEQUENCES = {
  'ceo-pitch': [
    { step: 'problem', annotations: ['traditional-apps-fail'], duration: 8000 },
    { step: 'solution', annotations: ['three-bucket-innovation'], duration: 10000 },
    { step: 'metrics', annotations: ['engagement-multiplier', 'ltv-dominance'], duration: 12000 },
    { step: 'market', annotations: ['market-expansion'], duration: 9000 },
    { step: 'success', annotations: ['emotional-payoff'], duration: 6000 }
  ],
  'investor-demo': [
    { step: 'problem', annotations: ['traditional-apps-fail'], duration: 6000 },
    { step: 'solution', annotations: ['three-bucket-innovation'], duration: 8000 },
    { step: 'metrics', annotations: ['engagement-multiplier', 'ltv-dominance'], duration: 15000 },
    { step: 'market', annotations: ['market-expansion'], duration: 10000 }
  ],
  'customer-story': [
    { step: 'journey', annotations: ['life-resilience'], duration: 8000 },
    { step: 'success', annotations: ['emotional-payoff'], duration: 6000 }
  ]
};

// CSS animations to add to the main stylesheet
export const ANNOTATION_STYLES = `
  @keyframes bounce-subtle {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-8px); }
    60% { transform: translateY(-4px); }
  }

  @keyframes pulse-glow {
    0%, 100% { 
      transform: scale(1);
      box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
    }
    50% { 
      transform: scale(1.05);
      box-shadow: 0 0 30px rgba(168, 85, 247, 0.6);
    }
  }

  @keyframes slide-in-right {
    0% { 
      transform: translateX(50px);
      opacity: 0;
    }
    100% { 
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slide-in-left {
    0% { 
      transform: translateX(-50px);
      opacity: 0;
    }
    100% { 
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes scale-in {
    0% { 
      transform: scale(0.8);
      opacity: 0;
    }
    100% { 
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes float-up-subtle {
    0% { 
      transform: translateY(20px);
      opacity: 0;
    }
    100% { 
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes celebration {
    0%, 100% { 
      transform: scale(1) rotate(0deg);
    }
    25% { 
      transform: scale(1.1) rotate(5deg);
    }
    75% { 
      transform: scale(1.1) rotate(-5deg);
    }
  }

  .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out; }
  .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
  .animate-slide-in-right { animation: slide-in-right 0.6s ease-out; }
  .animate-slide-in-left { animation: slide-in-left 0.6s ease-out; }
  .animate-scale-in { animation: scale-in 0.5s ease-out; }
  .animate-float-up-subtle { animation: float-up-subtle 0.8s ease-out; }
  .animate-celebration { animation: celebration 1.5s ease-in-out; }
`;

export default DemoAnnotations;
