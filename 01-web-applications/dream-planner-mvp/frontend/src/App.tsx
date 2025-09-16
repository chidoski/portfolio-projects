import { useState, useEffect } from 'react'
import './utils/debugUtils.js' // Load debug utilities for console
import { Sparkles, Calculator, Target, Eye } from 'lucide-react'
import DreamBuilder from './components/DreamBuilder'
import DreamCalculator from './components/DreamCalculator'
// @ts-ignore - Dashboard.jsx doesn't have TypeScript declarations
import Dashboard from './pages/Dashboard'
// @ts-ignore - QuickStart.jsx doesn't have TypeScript declarations
import QuickStart from './pages/QuickStart'
// @ts-ignore - DreamCreator.jsx doesn't have TypeScript declarations
import DreamCreator from './pages/DreamCreator'
// @ts-ignore - FinancialRealityWizard.jsx doesn't have TypeScript declarations
import FinancialRealityWizard from './pages/FinancialRealityWizard'
// @ts-ignore - SomedayLifeBuilder.jsx doesn't have TypeScript declarations
import SomedayLifeBuilder from './pages/SomedayLifeBuilder'
// @ts-ignore - ZeroBasedPlanner.jsx doesn't have TypeScript declarations
import ZeroBasedPlanner from './pages/ZeroBasedPlanner'
// @ts-ignore - SpendingDecisionDemo.jsx doesn't have TypeScript declarations
import SpendingDecisionDemo from './components/SpendingDecisionDemo'
// @ts-ignore - IncomeAccelerator.jsx doesn't have TypeScript declarations
import IncomeAccelerator from './pages/IncomeAccelerator'
// @ts-ignore - ErrorBoundary.jsx doesn't have TypeScript declarations
import ErrorBoundary from './components/ErrorBoundary'
// @ts-ignore - ErrorBoundaryTest.jsx doesn't have TypeScript declarations
import ErrorBoundaryTest from './components/ErrorBoundaryTest'
// @ts-ignore - ToolsDrawer.jsx doesn't have TypeScript declarations
import ToolsDrawer from './components/ToolsDrawer'
import PageTransition from './components/PageTransition'
import FloatingParticles from './components/FloatingParticles'
// @ts-ignore - TrustBuilder.jsx doesn't have TypeScript declarations
import TrustBuilder from './components/TrustBuilder'
// @ts-ignore - MinimalLanding.jsx doesn't have TypeScript declarations
import MinimalLanding from './pages/MinimalLanding'
import { useIntersectionObserver } from './utils/useIntersectionObserver'
import { useCountUp } from './utils/useCountUp'
// @ts-ignore - demoData.js doesn't have TypeScript declarations
import { getDemoUser } from './services/demoData'
// @ts-ignore - psychProfileUtils.js doesn't have TypeScript declarations
import { getTextVariants, getUserPsychProfile } from './utils/psychProfileUtils'

type View = 'welcome' | 'detailed' | 'builder' | 'calculator' | 'dashboard' | 'quickstart' | 'dreamcreator' | 'financialwizard' | 'somedaybuilder' | 'zerobasedplanner' | 'spendingdemo' | 'incomeaccelerator' | 'errortest'

interface TemplateData {
  title: string
  description: string
  amount: number
  suggestedTimeframe: number
  category: string
  imageUrl: string
}

function App() {
  const [currentView, setCurrentView] = useState<View>('welcome')
  const [urlParams, setUrlParams] = useState<{ [key: string]: string }>({})
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [originalLocalStorageData, setOriginalLocalStorageData] = useState<string | null>(null)
  const [showToolsDrawer, setShowToolsDrawer] = useState(false)
  const [showStickyHeader, setShowStickyHeader] = useState(false)

  // Parse URL on mount and when URL changes
  useEffect(() => {
    const parseUrl = () => {
      const path = window.location.pathname
      const searchParams = new URLSearchParams(window.location.search)
      const params: { [key: string]: string } = {}
      
      // Convert URLSearchParams to object
      searchParams.forEach((value, key) => {
        params[key] = value
      })
      
      setUrlParams(params)
      
      // Set view based on path
      if (path === '/dashboard') {
        setCurrentView('dashboard')
      } else if (path === '/builder') {
        setCurrentView('builder')
      } else if (path === '/calculator') {
        setCurrentView('calculator')
      } else if (path === '/quick-start') {
        setCurrentView('quickstart')
      } else if (path === '/dream-creator') {
        setCurrentView('dreamcreator')
      } else if (path === '/financial-wizard') {
        setCurrentView('financialwizard')
      } else if (path === '/someday-builder') {
        setCurrentView('somedaybuilder')
      } else if (path === '/zero-based-planner') {
        setCurrentView('zerobasedplanner')
      } else if (path === '/spending-demo') {
        setCurrentView('spendingdemo')
      } else if (path === '/income-accelerator') {
        setCurrentView('incomeaccelerator')
      } else if (path === '/how-it-works' || path === '/learn-more') {
        setCurrentView('detailed')
      } else if (path === '/error-test' && process.env.NODE_ENV === 'development') {
        setCurrentView('errortest')
      } else {
        setCurrentView('welcome')
      }
    }

    parseUrl()
    
    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', parseUrl)
    return () => window.removeEventListener('popstate', parseUrl)
  }, [])

  // Demo mode keyboard listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl+Shift+D
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault()
        toggleDemoMode()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDemoMode])

  // Sticky header scroll listener (only for detailed landing page)
  useEffect(() => {
    if (currentView !== 'detailed') {
      setShowStickyHeader(false)
      return
    }

    const handleScroll = () => {
      const scrollY = window.scrollY
      setShowStickyHeader(scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [currentView])

  // Demo mode toggle function
  const toggleDemoMode = () => {
    if (!isDemoMode) {
      // Entering demo mode - backup current localStorage
      try {
        const currentData = {
          dreams: localStorage.getItem('dreams'),
          dreamDraft: localStorage.getItem('dreamDraft'),
          userPreferences: localStorage.getItem('userPreferences')
        }
        setOriginalLocalStorageData(JSON.stringify(currentData))
        
        // Load demo data
        const demoUser = getDemoUser()
        localStorage.setItem('dreams', JSON.stringify(demoUser.dreams))
        localStorage.setItem('userPreferences', JSON.stringify(demoUser.preferences))
        
        // Clear any existing draft
        localStorage.removeItem('dreamDraft')
        
        setIsDemoMode(true)
        
        // Navigate to dashboard to show demo data
        navigateTo('dashboard')
        
        console.log('Demo mode activated - showing demo data')
      } catch (error) {
        console.error('Failed to activate demo mode:', error)
      }
    } else {
      // Exiting demo mode - restore original localStorage
      try {
        if (originalLocalStorageData) {
          const originalData = JSON.parse(originalLocalStorageData)
          
          // Restore original data
          if (originalData.dreams) {
            localStorage.setItem('dreams', originalData.dreams)
          } else {
            localStorage.removeItem('dreams')
          }
          
          if (originalData.dreamDraft) {
            localStorage.setItem('dreamDraft', originalData.dreamDraft)
          } else {
            localStorage.removeItem('dreamDraft')
          }
          
          if (originalData.userPreferences) {
            localStorage.setItem('userPreferences', originalData.userPreferences)
          } else {
            localStorage.removeItem('userPreferences')
          }
        } else {
          // No original data to restore, clear everything
          localStorage.removeItem('dreams')
          localStorage.removeItem('dreamDraft')
          localStorage.removeItem('userPreferences')
        }
        
        setIsDemoMode(false)
        setOriginalLocalStorageData(null)
        
        console.log('Demo mode deactivated - restored original data')
      } catch (error) {
        console.error('Failed to deactivate demo mode:', error)
      }
    }
  }

  // Navigation helper function
  const navigateTo = (view: View, params?: { [key: string]: string }) => {
    let path = '/'
    switch (view) {
      case 'dashboard':
        path = '/dashboard'
        break
      case 'builder':
        path = '/builder'
        break
      case 'calculator':
        path = '/calculator'
        break
      case 'quickstart':
        path = '/quick-start'
        break
      case 'dreamcreator':
        path = '/dream-creator'
        break
      case 'financialwizard':
        path = '/financial-wizard'
        break
      case 'somedaybuilder':
        path = '/someday-builder'
        break
      case 'zerobasedplanner':
        path = '/zero-based-planner'
        break
      case 'spendingdemo':
        path = '/spending-demo'
        break
      case 'incomeaccelerator':
        path = '/income-accelerator'
        break
      case 'detailed':
        path = '/how-it-works'
        break
      default:
        path = '/'
    }
    
    // Add query parameters if provided
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams(params)
      path += '?' + searchParams.toString()
    }
    
    window.history.pushState({}, '', path)
    setCurrentView(view)
    setUrlParams(params || {})
  }

  // Tools drawer navigation handler
  const handleToolsNavigation = (view: View) => {
    setShowToolsDrawer(false) // Close drawer
    navigateTo(view) // Navigate to the tool
  }

  const renderView = () => {
    switch (currentView) {
      case 'builder':
        return <DreamBuilder 
          selectedTemplate={selectedTemplate}
          onComplete={(dreamId?: string) => {
            setSelectedTemplate(null) // Clear template after completion
            if (dreamId) {
              navigateTo('dashboard', { dreamId })
            } else {
              navigateTo('dashboard')
            }
          }} 
        />
      case 'calculator':
        return <DreamCalculator onBack={() => navigateTo('welcome')} />
      case 'dashboard':
        return <Dashboard 
          onAddDream={() => navigateTo('builder')} 
          highlightedDreamId={urlParams.dreamId}
          onNavigateToZeroBasedPlanner={() => navigateTo('zerobasedplanner')}
          onNavigateToIncomeAccelerator={() => navigateTo('incomeaccelerator')}
          onNavigateToSomedayLifeBuilder={() => navigateTo('somedaybuilder')}
        />
      case 'quickstart':
        return <QuickStart 
          onSelectTemplate={(template: TemplateData | null) => {
            setSelectedTemplate(template)
            if (template) {
              // Navigate to SomedayLifeBuilder Step 2 with template data
              navigateTo('somedaybuilder', { 
                step: '2',
                template: JSON.stringify(template)
              })
            } else {
              // Navigate to SomedayLifeBuilder Step 1 for custom creation
              navigateTo('somedaybuilder')
            }
          }}
          onBack={() => navigateTo('welcome')}
        />
      case 'dreamcreator':
        return <DreamCreator 
          onComplete={(dreamId?: string) => {
            if (dreamId) {
              navigateTo('dashboard', { dreamId })
            } else {
              navigateTo('dashboard')
            }
          }}
          onBack={() => navigateTo('quickstart')}
        />
      case 'financialwizard':
        return <FinancialRealityWizard 
          onComplete={() => navigateTo('dashboard')}
          onBack={() => navigateTo('somedaybuilder')}
        />
      case 'somedaybuilder':
        return <SomedayLifeBuilder 
          onComplete={() => navigateTo('financialwizard')}
          onBack={() => navigateTo('welcome')}
        />
      case 'zerobasedplanner':
        return <ZeroBasedPlanner 
          onBack={() => navigateTo('dashboard')}
        />
      case 'spendingdemo':
        return <SpendingDecisionDemo />
      case 'incomeaccelerator':
        return <IncomeAccelerator />
      case 'detailed':
        return <WelcomeScreen 
          onQuickStart={() => navigateTo('quickstart')}
          onSomedayBuilder={() => navigateTo('somedaybuilder')}
          onShowTools={() => setShowToolsDrawer(true)}
          onNavigateToSomedayBuilder={() => navigateTo('somedaybuilder')}
          onBackToMinimal={() => navigateTo('welcome')}
        />
      case 'errortest':
        return process.env.NODE_ENV === 'development' ? <ErrorBoundaryTest /> : null
      default:
        return <MinimalLanding 
          onStartPlanning={(dreamContext?: string) => {
            if (dreamContext) {
              navigateTo('somedaybuilder', { dream: dreamContext });
            } else {
              navigateTo('somedaybuilder');
            }
          }}
          onLearnMore={() => navigateTo('detailed')}
        />
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-green-50 relative">
        {/* Subtle Geometric Background Pattern */}
        <div className="fixed inset-0 pointer-events-none" style={{ opacity: 0.3, zIndex: 1 }}>
          <svg 
            className="w-full h-full" 
            viewBox="0 0 800 600" 
            preserveAspectRatio="xMidYMid slice"
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Geometric Pattern */}
            <defs>
              <pattern id="geometric-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="2" fill="#E6F7F7" />
                <circle cx="80" cy="80" r="1.5" fill="#E6F7F7" />
                <polygon points="50,10 60,30 40,30" fill="#E6F7F7" opacity="0.6" />
                <rect x="70" y="15" width="8" height="8" fill="#E6F7F7" opacity="0.4" transform="rotate(45 74 19)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#geometric-pattern)" />
            
            {/* Large Abstract Shapes */}
            <circle cx="700" cy="100" r="150" fill="#E6F7F7" opacity="0.2" />
            <ellipse cx="150" cy="500" rx="200" ry="100" fill="#E6F7F7" opacity="0.15" />
            <polygon points="600,400 750,350 700,550 550,500" fill="#E6F7F7" opacity="0.1" />
            
            {/* Floating geometric elements */}
            <circle cx="100" cy="150" r="8" fill="#E6F7F7" opacity="0.5" />
            <circle cx="650" cy="250" r="12" fill="#E6F7F7" opacity="0.3" />
            <circle cx="300" cy="80" r="6" fill="#E6F7F7" opacity="0.4" />
            <circle cx="500" cy="480" r="10" fill="#E6F7F7" opacity="0.35" />
            
            {/* Subtle lines and connections */}
            <line x1="100" y1="150" x2="300" y2="80" stroke="#E6F7F7" strokeWidth="1" opacity="0.2" />
            <line x1="650" y1="250" x2="500" y2="480" stroke="#E6F7F7" strokeWidth="1" opacity="0.2" />
          </svg>
        </div>
        {/* Demo Mode Indicator */}
        {isDemoMode && (
          <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 animate-pulse">
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">Demo Mode</span>
            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
          </div>
        )}

        {/* Sticky Header CTA */}
        {showStickyHeader && currentView === 'detailed' && (
          <div className="fixed top-0 left-0 right-0 z-40 bg-white bg-opacity-98 backdrop-blur-sm border-b border-gray-200 shadow-sm transition-all duration-300">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
              <p className="text-sm text-gray-700 font-medium">
                Ready to transform your retirement planning?
              </p>
              <button
                onClick={() => navigateTo('somedaybuilder')}
                className="px-4 py-2 text-sm text-white font-semibold rounded-md transition-all duration-200 hover:shadow-md hover:scale-105"
                style={{ 
                  backgroundColor: '#0B7A75',
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#096963';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#0B7A75';
                }}
              >
                Get Started
              </button>
            </div>
          </div>
        )}
        
        <div className="relative z-10">
          <PageTransition 
            transitionKey={currentView}
            duration={(currentView === 'welcome' || currentView === 'detailed') ? 600 : 400}
            easing="ease-in-out"
          >
            {renderView()}
          </PageTransition>
        </div>

        {/* Tools Drawer */}
        <ToolsDrawer 
          isOpen={showToolsDrawer}
          onClose={() => setShowToolsDrawer(false)}
          onNavigate={handleToolsNavigation}
        />
      </div>
    </ErrorBoundary>
  )
}

interface WelcomeScreenProps {
  onQuickStart: () => void
  onSomedayBuilder: () => void
  onShowTools: () => void
  onNavigateToSomedayBuilder: () => void
  onBackToMinimal?: () => void
}

function WelcomeScreen({ onQuickStart, onSomedayBuilder, onShowTools, onNavigateToSomedayBuilder, onBackToMinimal }: WelcomeScreenProps) {
  const userProfile = getUserPsychProfile()
  
  const dreamEquivalents = [
    '$50,000 vacation = Skip one coffee daily',
    '$30,000 car = One less streaming service', 
    '$100,000 home = Price of lunch twice a week'
  ]
  
  const [currentEquivalent, setCurrentEquivalent] = useState(0)
  const { ref: statsRef, isIntersecting: statsVisible } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.2,
    triggerOnce: true
  })
  
  // Count up animations for statistics
  const { count: savedCount, trigger: triggerSaved } = useCountUp({
    end: 2.3,
    duration: 2000,
    delay: 0,
    startOnTrigger: true
  })
  
  const { count: dreamsCount, trigger: triggerDreams } = useCountUp({
    end: 15,
    duration: 2000,
    delay: 200,
    startOnTrigger: true
  })
  
  const { count: achievedCount, trigger: triggerAchieved } = useCountUp({
    end: 890,
    duration: 2000,
    delay: 400,
    startOnTrigger: true
  })
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEquivalent((prev) => (prev + 1) % dreamEquivalents.length)
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])
  
  // Trigger count animations when stats become visible
  useEffect(() => {
    if (statsVisible) {
      triggerSaved()
      triggerDreams()
      triggerAchieved()
    }
  }, [statsVisible, triggerSaved, triggerDreams, triggerAchieved])
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Back to Minimal Navigation */}
      {onBackToMinimal && (
        <div className="fixed top-6 left-6 z-30">
          <button
            onClick={onBackToMinimal}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Back to overview</span>
          </button>
        </div>
      )}
      
      {/* Floating particles background */}
      <FloatingParticles count={8} />
      
      <div className="max-w-4xl mx-auto text-center relative z-20">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full hover-glow" style={{ backgroundColor: 'var(--primary-color)' }}>
              <Sparkles className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-6xl font-bold mb-4 text-balance" style={{ fontWeight: 700, color: '#2D3748' }}>
            {getTextVariants('welcomeTitle', 'Transform Retirement Planning Into')}
            <span style={{ color: '#0B7A75' }}> {userProfile ? (userProfile === 'dreamer' ? 'Life Planning' : userProfile === 'validator' ? 'Security Planning' : 'Clear Planning') : 'Life Planning'}</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto text-balance">
            {getTextVariants('welcomeSubtitle', 'See how your dreams become achievable through daily actions.')}
            <br />
            <span className="transition-opacity duration-500 text-lg text-gray-500 mt-2 block">
              {dreamEquivalents[currentEquivalent]}
            </span>
          </p>
          
          {/* Hero CTA Section */}
          <div className="mb-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onSomedayBuilder}
              className="px-8 py-4 text-lg text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
              style={{ 
                backgroundColor: '#0B7A75',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#096963'; // 10% darker
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#0B7A75';
              }}
            >
              {getTextVariants('welcomePrimaryCTA', 'Start Planning Your Future')}
            </button>
            
            <button
              onClick={() => {
                const howItWorksSection = document.getElementById('how-it-works');
                if (howItWorksSection) {
                  howItWorksSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                  });
                }
              }}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200 underline underline-offset-4 decoration-gray-300 hover:decoration-gray-500"
            >
              Learn more first
            </button>
          </div>
        </div>

        {/* Approach Explanation */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 text-center transition-all duration-300 hover:scale-105" 
               style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderTop: '3px solid #0B7A75' }}>
            <div className="p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 transition-colors" style={{ backgroundColor: 'var(--secondary-color)' }}>
              <Target className="w-6 h-6" style={{ color: 'var(--primary-color)' }} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Envision Your Future</h3>
            <p className="text-gray-600 text-sm">
              Start with your ideal life when work becomes optional, not just a retirement number
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 text-center transition-all duration-300 hover:scale-105" 
               style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderTop: '3px solid #0B7A75' }}>
            <div className="p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 transition-colors" style={{ backgroundColor: 'var(--secondary-color)' }}>
              <Calculator className="w-6 h-6" style={{ color: 'var(--accent-color)' }} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Break It Down</h3>
            <p className="text-gray-600 text-sm">
              See exactly what small daily actions will get you there
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 text-center transition-all duration-300 hover:scale-105" 
               style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderTop: '3px solid #0B7A75' }}>
            <div className="p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 transition-colors" style={{ backgroundColor: 'var(--secondary-color)' }}>
              <Sparkles className="w-6 h-6" style={{ color: 'var(--success-green)' }} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Make Progress</h3>
            <p className="text-gray-600 text-sm">
              Turn overwhelming financial goals into manageable daily wins
            </p>
          </div>
        </div>

        {/* How It Works Section */}
        <div id="how-it-works" className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-12 relative">
          {/* Innovation Indicator */}
          <div className="absolute top-4 right-4">
            <div 
              className="px-3 py-1 text-xs font-medium border rounded-full"
              style={{ 
                borderColor: '#E2E8F0',
                color: '#64748B',
                backgroundColor: '#F8FAFC'
              }}
            >
              New Approach
            </div>
          </div>
          
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A simple 3-step process to transform your financial future
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 items-start">
              {/* Step 1 */}
              <div className="text-center relative">
                <div className="text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-xl font-bold shadow-lg" 
                     style={{ backgroundColor: '#0B7A75', opacity: 0.6 }}>
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Define Your Someday Life
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Describe your ideal life when work becomes optional. What does your perfect day look like? Where do you live? What brings you joy?
                </p>
                
                {/* Connector Arrow */}
                <div className="hidden md:block absolute top-8 -right-4 transform">
                  <svg className="w-8 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 8">
                    <path d="M15.293 0.293a1 1 0 0 1 1.414 0l3 3a1 1 0 0 1 0 1.414l-3 3a1 1 0 0 1-1.414-1.414L17.586 4H1a1 1 0 1 1 0-2h16.586l-2.293-2.293a1 1 0 0 1 0-1.414z"/>
                  </svg>
                </div>
              </div>

              {/* Step 2 */}
              <div className="text-center relative">
                <div className="text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-xl font-bold shadow-lg" 
                     style={{ backgroundColor: '#0B7A75', opacity: 0.8 }}>
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Understand Your Financial Reality
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Get a gentle but honest assessment of where you stand today and what it will take to reach your someday life.
                </p>
                
                {/* Connector Arrow */}
                <div className="hidden md:block absolute top-8 -right-4 transform">
                  <svg className="w-8 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 8">
                    <path d="M15.293 0.293a1 1 0 0 1 1.414 0l3 3a1 1 0 0 1 0 1.414l-3 3a1 1 0 0 1-1.414-1.414L17.586 4H1a1 1 0 1 1 0-2h16.586l-2.293-2.293a1 1 0 0 1 0-1.414z"/>
                  </svg>
                </div>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-xl font-bold shadow-lg" 
                     style={{ backgroundColor: '#0B7A75', opacity: 1.0 }}>
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Follow Your Personalized Path
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Receive a clear roadmap with optimization strategies to accelerate your timeline and turn dreams into daily actions.
                </p>
              </div>
            </div>

            {/* Process Benefits */}
            <div className="mt-10 pt-8 border-t border-gray-100">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  <span className="font-medium text-gray-700">The result:</span> Clear daily actions that compound into life-changing progress
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm">
                  <span className="px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--secondary-color)', color: 'var(--primary-color)' }}>No overwhelming spreadsheets</span>
                  <span className="px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--secondary-color)', color: 'var(--accent-color)' }}>No complex financial jargon</span>
                  <span className="px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--secondary-color)', color: 'var(--success-green)' }}>Just clear, actionable steps</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mid-Page CTA - Peak Understanding Moment */}
        <div className="text-center mb-12">
          <div className="max-w-2xl mx-auto bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-8 border border-teal-100 shadow-lg">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4" style={{ backgroundColor: '#0B7A75' }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Understood the concept?
              </h3>
              <p className="text-lg text-gray-700 mb-6">
                Let's make it real for you.
              </p>
            </div>
            
            <button
              onClick={onSomedayBuilder}
              className="px-8 py-4 text-lg text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-xl hover:scale-105 inline-flex items-center gap-2"
              style={{ 
                backgroundColor: '#0B7A75',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#096963';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#0B7A75';
              }}
            >
{getTextVariants('primaryCTA', 'Start My Plan')}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
            
            <p className="text-sm text-gray-500 mt-4">
              Takes 3-5 minutes • No signup required to start
            </p>
          </div>
        </div>

        {/* Trust Builder - Compound Growth Chart */}
        <TrustBuilder />

        {/* Chart Interactive CTA */}
        <div className="text-center mb-12">
          <div className="max-w-xl mx-auto bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-teal-100 to-cyan-100 rounded-full p-3 mr-3">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Calculate your own growth potential
              </h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Ready to see what's possible with your specific situation? Let's create your personalized plan.
            </p>
            
            <button
              onClick={onNavigateToSomedayBuilder}
              className="px-6 py-3 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105 inline-flex items-center gap-2"
              style={{ 
                backgroundColor: '#0B7A75',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#096963';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#0B7A75';
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Start Your Calculation
            </button>
          </div>
        </div>

        {/* Clear Call to Action */}
        <div className="text-center">
          <div className="rounded-2xl p-8 border" style={{ backgroundColor: 'var(--secondary-color)', borderColor: 'var(--primary-color)' }}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Plan Your Someday Life?
            </h2>
            <p className="text-gray-600 mb-6 max-w-lg mx-auto">
              Transform abstract retirement goals into concrete, achievable dreams with daily action steps.
            </p>
            
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center sm:items-center">
              <button
                onClick={onSomedayBuilder}
                className="px-8 py-4 text-lg w-full sm:w-auto text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg"
                style={{ 
                  backgroundColor: '#0B7A75',
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#096963'; // 10% darker
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#0B7A75';
                }}
              >
{getTextVariants('welcomePrimaryCTA', 'Start Planning Your Future')}
              </button>
              
              <button
                onClick={onQuickStart}
                className="text-sm transition-colors duration-200"
                style={{ color: '#718096' }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.color = '#0B7A75';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.color = '#718096';
                }}
              >
                Browse examples first
              </button>
            </div>
          </div>
          
          {/* Tools link - subtle and separate */}
          <div className="mt-8">
            <button
              onClick={onShowTools}
              className="text-gray-400 hover:text-gray-600 text-sm transition-colors flex items-center justify-center mx-auto"
            >
              <span className="mr-1">🛠️</span>
              Explore Tools
            </button>
          </div>
        </div>

        {/* Social Proof */}
        <div ref={statsRef} className="mt-12 text-center">
          <p className={`text-sm text-gray-500 mb-4 transition-all duration-800 ${
            statsVisible ? 'parallax-visible' : 'parallax-hidden'
          }`}>
            Join thousands turning dreams into reality
          </p>
          <div className="flex justify-center space-x-8 text-2xl font-bold text-gray-400">
            <span className={`transition-all duration-800 ${
              statsVisible ? 'parallax-visible' : 'parallax-hidden'
            } parallax-stagger-1`}>
              💰 ${savedCount.toFixed(1)}M+ saved
            </span>
            <span className={`transition-all duration-800 ${
              statsVisible ? 'parallax-visible' : 'parallax-hidden'
            } parallax-stagger-2`}>
              🎯 {dreamsCount}K+ dreams
            </span>
            <span className={`transition-all duration-800 ${
              statsVisible ? 'parallax-visible' : 'parallax-hidden'
            } parallax-stagger-3`}>
              🎉 {achievedCount}+ achieved
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
