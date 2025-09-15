import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Eye, EyeOff, Presentation, ArrowRight, User } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import DemoAnnotations, { useAnnotationSequence } from '../components/DemoAnnotations';
import presentationFailsafe, { createDemoReset, setPresentationMode, accelerateForPresentation } from '../services/presentationFailsafe';
import DemoStoryMode from './DemoStoryMode';
import CEOInsightView from './CEOInsightView';
import SuccessScreen from './SuccessScreen';
import InstantPersonalization from './InstantPersonalization';
import ThreeBucketDisplay from '../components/ThreeBucketDisplay';

// Demo flow configuration with presenter talking points
const demoFlow = [
  {
    id: 'welcome',
    title: 'Welcome: Dream Planner Vision',
    duration: 30000, // 30 seconds
    component: 'Welcome',
    presenterNotes: [
      'Welcome to Dream Planner - the future of financial planning',
      'EMPHASIZE: This is not another budgeting app',
      'We connect money to meaning and transform how people think about their financial future',
      'The key differentiator: we start with dreams, not spreadsheets'
    ]
  },
  {
    id: 'problem',
    title: 'The Problem: Traditional Finance Apps Fail',
    duration: 45000, // 45 seconds
    component: 'Problem',
    presenterNotes: [
      'PAUSE: Let this sink in - 73% of people abandon finance apps within 3 months',
      'Traditional apps focus on restrictions and guilt about spending',
      'They ask "What did you spend?" instead of "What do you dream of?"',
      'EMPHASIZE: This fundamental approach difference changes everything'
    ]
  },
  {
    id: 'solution',
    title: 'Our Solution: The Three-Bucket System',
    duration: 60000, // 1 minute
    component: 'Solution',
    presenterNotes: [
      'Here\'s our breakthrough: The Three-Bucket System',
      'Foundation bucket ensures security, Dream bucket enables aspiration',
      'Life bucket handles surprises without derailing dreams',
      'PAUSE: This isn\'t just better allocation - it\'s better psychology'
    ]
  },
  {
    id: 'sarah_story',
    title: 'Customer Journey: Sarah\'s Transformation',
    duration: 300000, // 5 minutes - full story
    component: 'SarahStory',
    presenterNotes: [
      'Let me show you Sarah\'s journey - this is a real customer composite',
      'Watch how the system handles life\'s curveballs',
      'EMPHASIZE: The resilience of the three-bucket approach',
      'Notice how Sarah stays motivated because her goal has meaning'
    ]
  },
  {
    id: 'business_metrics',
    title: 'Business Impact: The Numbers',
    duration: 120000, // 2 minutes
    component: 'BusinessMetrics',
    presenterNotes: [
      'Now the business case - these metrics tell the story',
      'PAUSE on engagement time: 12 minutes vs 2 minutes',
      'This engagement translates directly to lifetime value',
      'EMPHASIZE: 40-year customer relationships vs 3-month churn'
    ]
  },
  {
    id: 'market_opportunity',
    title: 'Market Opportunity: $180B Addressable Market',
    duration: 90000, // 1.5 minutes
    component: 'MarketOpportunity',
    presenterNotes: [
      'The market opportunity is massive and underserved',
      'Every life stage represents upsell opportunities',
      'EMPHASIZE: We grow with our customers from age 25 to 65',
      'This creates natural expansion revenue without acquisition costs'
    ]
  },
  {
    id: 'success_demo',
    title: 'User Experience: Dream Achievement',
    duration: 60000, // 1 minute
    component: 'SuccessDemo',
    presenterNotes: [
      'This is what success looks like for our users',
      'Notice the emotional connection - this isn\'t just about money',
      'PAUSE: Let the celebration moment resonate',
      'This emotional payoff drives organic sharing and viral growth'
    ]
  },
  {
    id: 'competitive_advantage',
    title: 'Why We Win: Sustainable Moats',
    duration: 75000, // 1.25 minutes
    component: 'CompetitiveAdvantage',
    presenterNotes: [
      'Our competitive advantages compound over time',
      'Data moat: 40 years of customer financial behavior',
      'Network effects: Accountability partners and family planning',
      'EMPHASIZE: Once users achieve their first dream, they\'re customers for life'
    ]
  },
  {
    id: 'financial_projections',
    title: 'Financial Projections: Path to Profitability',
    duration: 90000, // 1.5 minutes
    component: 'FinancialProjections',
    presenterNotes: [
      'Here\'s our path to profitability and scale',
      'Unit economics are exceptional due to high LTV',
      'PAUSE on CAC payback: 6 months vs industry average of 18 months',
      'Freemium model reduces acquisition costs significantly'
    ]
  },
  {
    id: 'instant_personalization',
    title: 'Try It Yourself: Instant Personalization',
    duration: 300000, // 5 minutes for hands-on experience
    component: 'InstantPersonalization',
    presenterNotes: [
      'Now it\'s your turn - experience the product firsthand',
      'Enter your real age and a dream you\'d like to achieve',
      'Watch how quickly we create a personalized roadmap',
      'This transforms you from observer to user in under 60 seconds'
    ]
  }
];

// Milestone moments for quick navigation (1-9 keys)
const milestoneMap = {
  1: 'welcome',
  2: 'problem', 
  3: 'solution',
  4: 'sarah_story',
  5: 'business_metrics',
  6: 'market_opportunity',
  7: 'success_demo',
  8: 'competitive_advantage',
  9: 'instant_personalization'
};

const CEODemoController = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [presenterMode, setPresenterMode] = useState(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [annotationsEnabled, setAnnotationsEnabled] = useState(true);
  const [ceoPersona, setCeoPersona] = useState('generic');
  const [presentationModeEnabled, setPresentationModeEnabled] = useState(false);
  
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const progressIntervalRef = useRef(null);

  const currentDemo = demoFlow[currentStep];
  const { activeAnnotations } = useAnnotationSequence(currentDemo.id, ceoPersona);

  // Keyboard shortcuts handler
  const handleKeyPress = useCallback((event) => {
    // Don't handle if user is typing in an input
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }

    const key = event.key.toLowerCase();
    
    switch (key) {
      case 'd':
        // Next demo step
        nextStep();
        break;
      case 'r':
        // Reset to beginning
        resetDemo();
        break;
      case 's':
        // Skip to success state
        jumpToStep(6); // success_demo index
        break;
      case 'p':
        // Toggle presenter mode
        setPresenterMode(prev => !prev);
        break;
      case 'a':
        // Toggle annotations
        setAnnotationsEnabled(prev => !prev);
        break;
      case 't':
        // Jump to "Try It" (Instant Personalization)
        const personalizeIndex = demoFlow.findIndex(step => step.id === 'instant_personalization');
        if (personalizeIndex !== -1) {
          jumpToStep(personalizeIndex);
        }
        break;
      case 'f':
        // Toggle presentation failsafe mode
        togglePresentationMode();
        break;
      case 'escape':
        // Emergency demo reset
        handleEmergencyReset();
        break;
      case ' ':
        // Spacebar: Play/Pause
        event.preventDefault();
        togglePlayPause();
        break;
      default:
        // Check for number keys 1-9
        const num = parseInt(key);
        if (num >= 1 && num <= 9 && milestoneMap[num]) {
          const stepIndex = demoFlow.findIndex(step => step.id === milestoneMap[num]);
          if (stepIndex !== -1) {
            jumpToStep(stepIndex);
          }
        }
        break;
    }
  }, [currentStep]);

  // Add keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // Auto-advance logic
  useEffect(() => {
    if (isPlaying && currentDemo) {
      startTimeRef.current = Date.now();
      
      // Progress tracking
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const newProgress = Math.min(100, (elapsed / currentDemo.duration) * 100);
        setProgress(newProgress);
      }, 100);

      // Auto-advance timer
      timerRef.current = setTimeout(() => {
        nextStep();
      }, currentDemo.duration);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPlaying, currentStep]);

  // Demo control functions
  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  const nextStep = () => {
    if (currentStep < demoFlow.length - 1) {
      setCurrentStep(prev => prev + 1);
      setProgress(0);
      setCurrentNoteIndex(0);
    } else {
      // End of demo
      setIsPlaying(false);
      setProgress(100);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setProgress(0);
      setCurrentNoteIndex(0);
    }
  };

  const jumpToStep = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex < demoFlow.length) {
      setCurrentStep(stepIndex);
      setProgress(0);
      setCurrentNoteIndex(0);
    }
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    setProgress(0);
    setCurrentNoteIndex(0);
  };

  // Toggle presentation mode for optimal demo performance
  const togglePresentationMode = () => {
    const newMode = !presentationModeEnabled;
    setPresentationModeEnabled(newMode);
    setPresentationMode(newMode);
    
    console.log(newMode ? '🎪 Presentation mode: ON (optimized for demos)' : '📱 Presentation mode: OFF (normal speed)');
  };

  // Handle emergency reset with failsafe
  const handleEmergencyReset = () => {
    console.log('🚨 Emergency reset triggered');
    const perfectState = createDemoReset('emergency');
    
    // Reset all component state to perfect demo state
    setCurrentStep(0);
    setIsPlaying(false);
    setProgress(0);
    setCurrentNoteIndex(0);
    setAnnotationsEnabled(true);
    
    // Enable presentation mode for smooth demo
    setPresentationModeEnabled(true);
    setPresentationMode(true);
  };

  const jumpToSuccess = () => {
    const successIndex = demoFlow.findIndex(step => step.id === 'success_demo');
    if (successIndex !== -1) {
      jumpToStep(successIndex);
    }
  };

  // Component renderers for each demo step
  const renderDemoComponent = () => {
    switch (currentDemo.component) {
      case 'Welcome':
        return <WelcomeComponent />;
      case 'Problem':
        return <ProblemComponent />;
      case 'Solution':
        return <SolutionComponent />;
      case 'SarahStory':
        return <DemoStoryMode />;
      case 'BusinessMetrics':
        return <CEOInsightView />;
      case 'MarketOpportunity':
        return <MarketOpportunityComponent />;
      case 'SuccessDemo':
        return <SuccessDemoComponent />;
      case 'CompetitiveAdvantage':
        return <CompetitiveAdvantageComponent />;
      case 'FinancialProjections':
        return <FinancialProjectionsComponent />;
      case 'InstantPersonalization':
        return <InstantPersonalization 
          onComplete={() => {
            // Auto-advance after personalization
            console.log('Personalization completed');
          }}
          onBack={() => previousStep()}
        />;
      default:
        return <div className="text-center text-gray-500">Component not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative">
      {/* Demo Progress Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-800">CEO Demo Controller</h1>
              <div className="text-sm text-gray-600">
                Step {currentStep + 1} of {demoFlow.length}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* CEO Persona Selector */}
              <select
                value={ceoPersona}
                onChange={(e) => setCeoPersona(e.target.value)}
                className="text-sm bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Select CEO Persona for Contextual Annotations"
              >
                <option value="generic">Generic CEO</option>
                <option value="fintech">FinTech CEO</option>
                <option value="b2c">B2C Startup CEO</option>
                <option value="enterprise">Enterprise CEO</option>
              </select>

              {/* Annotations Toggle */}
              <button
                onClick={() => setAnnotationsEnabled(!annotationsEnabled)}
                className={`p-2 rounded-lg transition-colors ${
                  annotationsEnabled 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Toggle Demo Annotations (A)"
              >
                <User className="w-5 h-5" />
              </button>

              {/* Presentation Mode Toggle */}
              <button
                onClick={togglePresentationMode}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  presentationModeEnabled 
                    ? 'bg-green-100 text-green-700 border border-green-300' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Toggle Presentation Mode (F) - Optimizes for live demos"
              >
                {presentationModeEnabled ? '🎪 LIVE' : '📱 DEV'}
              </button>

              {/* Presenter Mode Toggle */}
              <button
                onClick={() => setPresenterMode(!presenterMode)}
                className={`p-2 rounded-lg transition-colors ${
                  presenterMode 
                    ? 'bg-purple-100 text-purple-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Toggle Presenter Mode (P)"
              >
                {presenterMode ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>

              {/* Demo Controls */}
              <button
                onClick={resetDemo}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Reset Demo (R)"
              >
                <RotateCcw className="w-5 h-5 text-gray-600" />
              </button>
              
              <button
                onClick={previousStep}
                disabled={currentStep === 0}
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 text-blue-600 rounded-lg transition-colors"
              >
                Previous
              </button>
              
              <button
                onClick={togglePlayPause}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
              
              <button
                onClick={nextStep}
                disabled={currentStep === demoFlow.length - 1}
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 text-blue-600 rounded-lg transition-colors"
                title="Next Step (D)"
              >
                Next
              </button>

              <button
                onClick={jumpToSuccess}
                className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-colors"
                title="Jump to Success (S)"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-700">{currentDemo.title}</h2>
              <div className="text-sm text-gray-500">
                {Math.round(progress)}%
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Demo Content */}
      <PageTransition transitionKey={currentStep}>
        <div className="relative">
          {renderDemoComponent()}
        </div>
      </PageTransition>

      {/* Demo Annotations Overlay */}
      <DemoAnnotations
        activeAnnotations={activeAnnotations}
        ceoPersona={ceoPersona}
        demoMode={annotationsEnabled}
        autoAdvance={isPlaying}
        onAnnotationDismiss={(annotationId) => {
          console.log('Annotation dismissed:', annotationId);
        }}
      />

      {/* Presenter Notes Panel */}
      {presenterMode && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-6 shadow-2xl z-50 border-t-4 border-purple-500">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Presentation className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-semibold text-purple-400">Presenter Notes</h3>
              </div>
              <button
                onClick={() => setPresenterMode(false)}
                className="text-gray-400 hover:text-white"
              >
                <EyeOff className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              {currentDemo.presenterNotes.map((note, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg transition-colors ${
                    index === currentNoteIndex 
                      ? 'bg-purple-800 border-l-4 border-purple-400' 
                      : 'bg-gray-800'
                  }`}
                >
                  <p className="text-sm leading-relaxed">
                    {note}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-xs text-gray-400">
              Press 'P' to hide presenter mode • Use arrow keys or click to navigate notes
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="fixed top-1/2 right-4 transform -translate-y-1/2 bg-white rounded-lg shadow-lg p-4 text-xs text-gray-600 border">
        <h4 className="font-semibold mb-2">Shortcuts</h4>
        <div className="space-y-1">
          <div><kbd className="px-1 bg-gray-100 rounded">D</kbd> Next</div>
          <div><kbd className="px-1 bg-gray-100 rounded">R</kbd> Reset</div>
          <div><kbd className="px-1 bg-gray-100 rounded">S</kbd> Success</div>
          <div><kbd className="px-1 bg-gray-100 rounded">P</kbd> Presenter</div>
          <div><kbd className="px-1 bg-gray-100 rounded">A</kbd> Annotations</div>
          <div><kbd className="px-1 bg-gray-100 rounded">T</kbd> Try It</div>
          <div><kbd className="px-1 bg-gray-100 rounded">F</kbd> Fast Mode</div>
          <div><kbd className="px-1 bg-gray-100 rounded">ESC</kbd> Emergency Reset</div>
          <div><kbd className="px-1 bg-gray-100 rounded">1-9</kbd> Jump</div>
          <div><kbd className="px-1 bg-gray-100 rounded">Space</kbd> Play/Pause</div>
        </div>
      </div>

      {/* Step Navigation Dots */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg px-4 py-2">
        <div className="flex space-x-2">
          {demoFlow.map((_, index) => (
            <button
              key={index}
              onClick={() => jumpToStep(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentStep 
                  ? 'bg-blue-500' 
                  : index < currentStep 
                    ? 'bg-green-500' 
                    : 'bg-gray-300'
              }`}
              title={demoFlow[index].title}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Individual Demo Components

const WelcomeComponent = () => (
  <div className="min-h-screen flex items-center justify-center p-8">
    <div className="text-center max-w-4xl">
      <div className="mb-8">
        <div className="text-8xl mb-6">✨</div>
        <h1 className="text-6xl font-bold text-gray-800 mb-6">
          Dream Planner
        </h1>
        <p className="text-2xl text-gray-600 mb-8">
          Connecting Money to Meaning
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold mb-2">Dream-First Planning</h3>
          <p className="text-gray-600">Start with what matters to you</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="text-4xl mb-4">🏛️</div>
          <h3 className="text-xl font-semibold mb-2">Three-Bucket System</h3>
          <p className="text-gray-600">Balance security, dreams, and life</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="text-4xl mb-4">📈</div>
          <h3 className="text-xl font-semibold mb-2">40-Year Relationships</h3>
          <p className="text-gray-600">Grow with you from 25 to 65</p>
        </div>
      </div>
    </div>
  </div>
);

const ProblemComponent = () => (
  <div className="min-h-screen flex items-center justify-center p-8">
    <div className="max-w-6xl w-full">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-800 mb-6">
          Traditional Finance Apps Fail
        </h1>
        <p className="text-xl text-gray-600">
          73% of users abandon finance apps within 3 months
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-red-700 mb-6">Traditional Approach</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Focus on restrictions and guilt</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Complex spreadsheets and budgets</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Backwards-looking expense tracking</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Generic "retirement" planning</span>
            </div>
          </div>
          <div className="mt-8 bg-red-100 rounded-lg p-4">
            <p className="text-red-800 font-bold">Result: 73% churn in 3 months</p>
          </div>
        </div>

        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-green-700 mb-6">Dream Planner Approach</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Focus on dreams and aspirations</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Simple three-bucket allocation</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Forward-looking goal planning</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Personal "someday life" visualization</span>
            </div>
          </div>
          <div className="mt-8 bg-green-100 rounded-lg p-4">
            <p className="text-green-800 font-bold">Result: 92% retention after 1 year</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SolutionComponent = () => (
  <div className="min-h-screen flex items-center justify-center p-8">
    <div className="max-w-6xl w-full">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-800 mb-6">
          The Three-Bucket Solution
        </h1>
        <p className="text-xl text-gray-600">
          Revolutionary approach to financial planning
        </p>
      </div>
      
      <ThreeBucketDisplay
        monthlyDisposableIncome={1000}
        currentAge={32}
        retirementAge={65}
        annualExpenses={50000}
        dreamGoalAmount={180000}
        dreamTimeframe={20}
        lifeGoalAmount={25000}
        lifeTimeframe={5}
        showDetailedBreakdown={true}
      />
      
      <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Why This Changes Everything
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl mb-4">🧠</div>
            <h4 className="font-bold mb-2">Better Psychology</h4>
            <p className="text-gray-600">Dreams motivate better than restrictions</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🛡️</div>
            <h4 className="font-bold mb-2">Built-in Resilience</h4>
            <p className="text-gray-600">Life bucket handles surprises gracefully</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <h4 className="font-bold mb-2">Simple Yet Complete</h4>
            <p className="text-gray-600">Covers security, aspiration, and flexibility</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const MarketOpportunityComponent = () => (
  <div className="min-h-screen flex items-center justify-center p-8">
    <div className="max-w-6xl w-full">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-800 mb-6">
          $180B Market Opportunity
        </h1>
        <p className="text-xl text-gray-600">
          Massive underserved market across all life stages
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-blue-600 mb-4">Young Professionals</h3>
          <div className="text-4xl font-bold text-blue-700 mb-2">45M</div>
          <p className="text-blue-600 mb-4">Ages 25-35</p>
          <div className="bg-white rounded-lg p-4">
            <div className="text-xl font-bold text-green-600">$2.1B</div>
            <div className="text-sm text-gray-500">Market Size</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-purple-600 mb-4">Mid-Career</h3>
          <div className="text-4xl font-bold text-purple-700 mb-2">52M</div>
          <p className="text-purple-600 mb-4">Ages 35-50</p>
          <div className="bg-white rounded-lg p-4">
            <div className="text-xl font-bold text-green-600">$3.8B</div>
            <div className="text-sm text-gray-500">Market Size</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-green-600 mb-4">Pre-Retirement</h3>
          <div className="text-4xl font-bold text-green-700 mb-2">38M</div>
          <p className="text-green-600 mb-4">Ages 50-65</p>
          <div className="bg-white rounded-lg p-4">
            <div className="text-xl font-bold text-green-600">$2.9B</div>
            <div className="text-sm text-gray-500">Market Size</div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Natural Expansion Revenue
        </h3>
        <div className="flex justify-center">
          <div className="flex items-center space-x-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 mb-2">
                <span className="text-2xl">👤</span>
              </div>
              <div className="text-sm text-gray-600">Age 25</div>
              <div className="font-bold">Basic Plan</div>
            </div>
            <ArrowRight className="text-gray-400" />
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 mb-2">
                <span className="text-2xl">🏠</span>
              </div>
              <div className="text-sm text-gray-600">Age 30</div>
              <div className="font-bold">Premium Plan</div>
            </div>
            <ArrowRight className="text-gray-400" />
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 mb-2">
                <span className="text-2xl">👨‍👩‍👧‍👦</span>
              </div>
              <div className="text-sm text-gray-600">Age 40</div>
              <div className="font-bold">Family Plan</div>
            </div>
            <ArrowRight className="text-gray-400" />
            <div className="text-center">
              <div className="bg-yellow-100 rounded-full p-4 mb-2">
                <span className="text-2xl">💼</span>
              </div>
              <div className="text-sm text-gray-600">Age 55</div>
              <div className="font-bold">Wealth Management</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SuccessDemoComponent = () => {
  const demoSuccessData = {
    title: "Maine Cottage Retreat",
    target_amount: 180000,
    target_date: "2044-06-15"
  };

  const demoStrategy = {
    name: "Balanced",
    description: "Steady progress with flexibility",
    dailyAmount: 12.33,
    weeklyAmount: 86.31,
    monthlyAmount: 375
  };

  return (
    <SuccessScreen 
      dream={demoSuccessData}
      selectedStrategy="balanced"
      savingsCalculations={{
        balanced: demoStrategy
      }}
      onViewDashboard={() => {}}
      onCreateAnother={() => {}}
    />
  );
};

const CompetitiveAdvantageComponent = () => (
  <div className="min-h-screen flex items-center justify-center p-8">
    <div className="max-w-6xl w-full">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-800 mb-6">
          Sustainable Competitive Moats
        </h1>
        <p className="text-xl text-gray-600">
          Advantages that compound over time
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-blue-600 mb-6">Data Moat</h3>
          <ul className="space-y-3">
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>40 years of customer financial behavior</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Dream achievement patterns</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Life milestone correlations</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Personalized optimization algorithms</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-purple-600 mb-6">Network Effects</h3>
          <ul className="space-y-3">
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Accountability partner connections</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Family financial planning</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Success story sharing</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Couples goal synchronization</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-green-600 mb-6">Switching Costs</h3>
          <ul className="space-y-3">
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Years of financial history</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Established saving habits</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Integrated life planning</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Emotional attachment to dreams</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-orange-600 mb-6">Brand Moat</h3>
          <ul className="space-y-3">
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>First-mover in dream-based planning</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Category-defining brand position</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Life transformation stories</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Trusted financial partner reputation</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

const FinancialProjectionsComponent = () => (
  <div className="min-h-screen flex items-center justify-center p-8">
    <div className="max-w-6xl w-full">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-800 mb-6">
          Path to Profitability
        </h1>
        <p className="text-xl text-gray-600">
          Exceptional unit economics drive sustainable growth
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">$4,800</div>
          <div className="text-gray-600">Lifetime Value</div>
          <div className="text-sm text-green-600 mt-2">107x higher than traditional</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">$45</div>
          <div className="text-gray-600">Customer Acquisition Cost</div>
          <div className="text-sm text-green-600 mt-2">Freemium + viral growth</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">6 months</div>
          <div className="text-gray-600">CAC Payback Period</div>
          <div className="text-sm text-green-600 mt-2">3x faster than industry</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">92%</div>
          <div className="text-gray-600">1-Year Retention</div>
          <div className="text-sm text-green-600 mt-2">6x industry average</div>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-8 text-white">
        <h3 className="text-2xl font-bold text-center mb-8">5-Year Projection</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">2M</div>
            <div className="opacity-90">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">$180M</div>
            <div className="opacity-90">Annual Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">35%</div>
            <div className="opacity-90">Net Margin</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default CEODemoController;
