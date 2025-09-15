import { useState, useEffect } from 'react'
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
import PageTransition from './components/PageTransition'
import FloatingParticles from './components/FloatingParticles'
import { useIntersectionObserver } from './utils/useIntersectionObserver'
import { useCountUp } from './utils/useCountUp'
// @ts-ignore - demoData.js doesn't have TypeScript declarations
import { getDemoUser } from './services/demoData'

type View = 'welcome' | 'builder' | 'calculator' | 'dashboard' | 'quickstart' | 'dreamcreator' | 'financialwizard' | 'somedaybuilder' | 'zerobasedplanner' | 'spendingdemo' | 'incomeaccelerator' | 'errortest'

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
        />
      case 'quickstart':
        return <QuickStart 
          onSelectTemplate={(template: TemplateData | null) => {
            setSelectedTemplate(template)
            navigateTo('dreamcreator')
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
      case 'errortest':
        return process.env.NODE_ENV === 'development' ? <ErrorBoundaryTest /> : null
      default:
        return <WelcomeScreen 
          onGetStarted={() => navigateTo('builder')} 
          onTryCalculator={() => navigateTo('calculator')}
          onQuickStart={() => navigateTo('quickstart')}
          onSomedayBuilder={() => navigateTo('somedaybuilder')}
          onSpendingDemo={() => navigateTo('spendingdemo')}
          onIncomeAccelerator={() => navigateTo('incomeaccelerator')}
        />
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen mesh-gradient-subtle">
        {/* Demo Mode Indicator */}
        {isDemoMode && (
          <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 animate-pulse">
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">Demo Mode</span>
            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
          </div>
        )}
        
        <PageTransition transitionKey={currentView}>
          {renderView()}
        </PageTransition>
      </div>
    </ErrorBoundary>
  )
}

interface WelcomeScreenProps {
  onGetStarted: () => void
  onTryCalculator: () => void
  onQuickStart: () => void
  onSomedayBuilder: () => void
  onSpendingDemo: () => void
  onIncomeAccelerator: () => void
}

function WelcomeScreen({ onGetStarted, onTryCalculator, onQuickStart, onSomedayBuilder, onSpendingDemo, onIncomeAccelerator }: WelcomeScreenProps) {
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
      {/* Floating particles background */}
      <FloatingParticles count={8} />
      
      <div className="max-w-4xl mx-auto text-center relative z-20">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-pink-500 to-purple-400 p-4 rounded-full hover-glow">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-4 text-balance">
            Turn Your Dreams Into
            <span className="bg-gradient-to-r from-pink-500 to-purple-400 bg-clip-text text-transparent"> Daily Habits</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto text-balance">
            <span className="transition-opacity duration-500">
              {dreamEquivalents[currentEquivalent]}
            </span>
            <br />
            Discover how small daily actions compound into life-changing dreams.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
            <div className="bg-orange-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Dream Timeline</h3>
            <p className="text-gray-600 text-sm">
              Build your dreams across 1, 5, and 15-year horizons
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
            <div className="bg-pink-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 group-hover:bg-pink-200 transition-colors">
              <Calculator className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Smart Breakdown</h3>
            <p className="text-gray-600 text-sm">
              See exactly what to save daily, weekly, monthly
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
            <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
              <Sparkles className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Progress Celebration</h3>
            <p className="text-gray-600 text-sm">
              Track wins and stay motivated every step
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center sm:flex-wrap">
          <button
            onClick={onSomedayBuilder}
            className="btn-primary px-8 py-3 text-lg w-full sm:w-auto"
          >
            Build Your Someday Life
          </button>
          
          <button
            onClick={onQuickStart}
            className="btn-secondary px-8 py-3 text-lg w-full sm:w-auto"
          >
            Quick Start with Templates
          </button>
          
          <button
            onClick={onGetStarted}
            className="btn-secondary px-8 py-3 text-lg w-full sm:w-auto"
          >
            Create Custom Dream
          </button>
          
          <button
            onClick={onTryCalculator}
            className="btn-secondary px-8 py-3 text-lg w-full sm:w-auto"
          >
            Try the Calculator
          </button>
          
          <button
            onClick={onSpendingDemo}
            className="btn-secondary px-8 py-3 text-lg w-full sm:w-auto"
          >
            Spending Decision Demo
          </button>
          
          <button
            onClick={onIncomeAccelerator}
            className="btn-secondary px-8 py-3 text-lg w-full sm:w-auto"
          >
            💰 Income Accelerator
          </button>
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
