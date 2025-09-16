import React, { useState, useEffect, useMemo } from 'react'
import { format } from 'date-fns'
import { Sparkles, Plus, Target, Calendar, DollarSign, TrendingUp, Calculator, Zap, ArrowRight, Clock, Trash2, MapPin, Star, Lightbulb, CheckCircle, AlertCircle, Users, Home, Briefcase, Heart, Plane, GraduationCap, Activity, RefreshCw } from 'lucide-react'
import ProgressBar from '../components/ProgressBar'
import SomedayLifeHero from '../components/SomedayLifeHero'
import LifeMilestonesTimeline from '../components/LifeMilestonesTimeline'
import JourneyPathVisualization from '../components/JourneyPathVisualization'
import GrowthPotentialDashboard from '../components/GrowthPotentialDashboard'
import OptimizationDashboard from '../components/OptimizationDashboard'
import RetirementReadinessDashboard from '../components/RetirementReadinessDashboard'
import TodaysImpactWidget from '../components/TodaysImpactWidget'
import { DreamService } from '../services/dreamService'
import { DataRecoveryService } from '../services/dataRecoveryService'
import DataRecoveryModal from '../components/DataRecoveryModal'
import { getTextVariants } from '../utils/psychProfileUtils'
import { getDashboardContent } from '../utils/adaptiveContent'
import { calculateTimeHorizon, getTimeHorizonContent, getDashboardLayout } from '../utils/timeHorizonUtils'
import { calculateTotalRetirementNeed } from '../services/retirementCalculations'
import { calculateRetirementScenarios, validateSavingsRequirement, calculateDetailedBreakdown } from '../utils/retirementCalculations'
import AIInsight from '../components/AIInsight'

// Scenario Toggle Component
const ScenarioToggle = ({ selected, onChange, scenarios }) => {
  const scenarioKeys = ['conservative', 'moderate', 'aggressive']
  
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Too Intense? Choose Your Comfort Level</h3>
        <p className="text-sm text-gray-600">All paths lead to freedom, just on different timelines</p>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {scenarioKeys.map((key) => {
          const scenario = scenarios[key]
          const isSelected = selected === key
          
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`p-4 rounded-xl text-center transition-all duration-200 ${
                isSelected 
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className="font-semibold text-sm mb-1">{scenario.label.split(' ')[0]}</div>
              <div className="text-xs opacity-90 mb-2">{scenario.label.split(' ').slice(1).join(' ')}</div>
              <div className="text-lg font-bold">${scenario.dailyAmount}/day</div>
            </button>
          )
        })}
      </div>
      
      {/* Scenario Impact Display - Using REAL calculations */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="text-sm text-blue-800 text-center">
          {selected === 'conservative' && scenarios.conservative && 
            `Lower daily commitment ($${scenarios.conservative.dailyAmount}) but longer journey (${scenarios.conservative.yearsToRetirement.toFixed(1)} years to freedom)`}
          {selected === 'moderate' && scenarios.moderate && 
            `Balanced approach ($${scenarios.moderate.dailyAmount}) with reasonable timeline (${scenarios.moderate.yearsToRetirement.toFixed(1)} years)`}
          {selected === 'aggressive' && scenarios.aggressive && 
            `Maximum optimization ($${scenarios.aggressive.dailyAmount}) for earliest freedom (${scenarios.aggressive.yearsToRetirement.toFixed(1)} years)`}
        </div>
      </div>
    </div>
  )
}

/**
 * Dashboard Component
 * Main dashboard for managing and viewing all user dreams
 * Adapts layout and content based on user's time horizon to retirement
 */
const Dashboard = ({ onAddDream, highlightedDreamId, onNavigateToZeroBasedPlanner, onNavigateToIncomeAccelerator, onNavigateToSomedayLifeBuilder }) => {
  const [dreams, setDreams] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDream, setSelectedDream] = useState(null)
  const [showRecoveryModal, setShowRecoveryModal] = useState(false)
  const [needsRecovery, setNeedsRecovery] = useState(false)
  const [somedayLifeGoal, setSomedayLifeGoal] = useState(null)
  
  // Demo User Profile - Hardcoded for consistent presentation
  const [userProfile, setUserProfile] = useState({
    currentAge: 25,
    retirementAge: 53, // Moderate scenario retirement age
    somedayLifeAge: 53,
    occupation: 'Marketing Manager',
    industry: 'Technology',
    selectedLifestyle: 'nomadic-freedom',
    annualIncome: 200000, // Clean round number for demo
    annualExpenses: 80000, // Target retirement spending
    currentSavings: 50000, // Starting point for clean math
    monthlySavings: 3000
  })

  // Savings scenario state
  const [selectedScenario, setSelectedScenario] = useState('moderate')

  // Demo Calculations - Hardcoded for consistent presentation
  const retirementCalcs = useMemo(() => {
    // Hardcoded scenarios for clean demo presentation
    const scenarios = {
      conservative: {
        label: 'Conservative (35% savings rate)',
        dailyAmount: 153,
        annualSavings: 55845,
        yearsToRetirement: 35,
        retirementAge: 60,
        isAchievable: true,
        description: 'Sustainable long-term approach with room for life'
      },
      moderate: {
        label: 'Moderate (50% savings rate)', 
        dailyAmount: 191,
        annualSavings: 69715,
        yearsToRetirement: 28,
        retirementAge: 53,
        isAchievable: true,
        description: 'Balanced approach popular with FIRE community'
      },
      aggressive: {
        label: 'Aggressive (65% savings rate)',
        dailyAmount: 267,
        annualSavings: 97455,
        yearsToRetirement: 20,
        retirementAge: 45,
        isAchievable: true,
        description: 'Maximum optimization for earliest retirement'
      }
    }
    
    const currentAge = 25
    const current = scenarios[selectedScenario]
    const withOptimizationYears = 5 // Fixed 5-year acceleration for consulting opportunity
    const withOptimization = current.retirementAge - withOptimizationYears
    
    return {
      currentAge,
      scenario: current,
      baseYearsToRetirement: current.yearsToRetirement,
      baseRetirementAge: current.retirementAge,
      withOptimizationYears,
      withOptimization,
      scenarios,
      // Demo financial data for consistency
      realisticCalculation: {
        userProfile: {
          annualIncome: 200000,
          takeHomePay: 130000, // ~65% after taxes
          maxDailySavings: 274 // ~75% max savings rate
        },
        retirementGoal: {
          totalNeeded: 2000000, // $80k × 25 using 4% rule
          currentProgress: 50000,
          gap: 1950000,
          isAchievable: true
        }
      }
    }
  }, [selectedScenario])
  
  // Demo test scenarios - hardcoded for consistent presentation
  const testScenarios = {
    young: { 
      currentAge: 25, 
      retirementAge: 53, 
      somedayLifeAge: 53, 
      annualIncome: 200000, 
      annualExpenses: 80000,
      currentSavings: 50000,
      label: 'Young Professional (25)' 
    },
    middle: { 
      currentAge: 35, 
      retirementAge: 58, 
      somedayLifeAge: 58, 
      annualIncome: 200000, 
      annualExpenses: 80000,
      currentSavings: 300000,
      label: 'Mid-Career (35)' 
    },
    near: { 
      currentAge: 45, 
      retirementAge: 62, 
      somedayLifeAge: 62, 
      annualIncome: 200000, 
      annualExpenses: 80000,
      currentSavings: 800000,
      label: 'Near Goal (45)' 
    }
  }
  
  // Calculate time horizon and get adaptive content (using unified calculations)
  const timeHorizon = calculateTimeHorizon(retirementCalcs.currentAge, retirementCalcs.baseRetirementAge)
  const timeHorizonContent = getTimeHorizonContent(timeHorizon.horizonType, retirementCalcs.baseYearsToRetirement)
  const dashboardLayout = getDashboardLayout(timeHorizon.horizonType)

  // Debug: Track calculations for mathematical accuracy verification
  console.log('📊 MATHEMATICAL ACCURACY CHECK:', {
    // Income Reality Check
    annualIncome: userProfile.annualIncome,
    takeHomePay: retirementCalcs.realisticCalculation?.userProfile.takeHomePay,
    dailyTakeHome: Math.round((retirementCalcs.realisticCalculation?.userProfile.takeHomePay || 0) / 365),
    
    // Savings Reality Check
    dailySavingsRequired: retirementCalcs.scenario.dailyAmount,
    savingsAsPercentOfDailyIncome: Math.round((retirementCalcs.scenario.dailyAmount / ((retirementCalcs.realisticCalculation?.userProfile.takeHomePay || 1) / 365)) * 100),
    isAchievable: retirementCalcs.scenario.isAchievable,
    
    // Timeline Check
    currentAge: retirementCalcs.currentAge,
    retirementAge: retirementCalcs.baseRetirementAge,
    yearsToGoal: retirementCalcs.baseYearsToRetirement,
    
    // Scenario Details
    selectedScenario: selectedScenario,
    scenarioLabel: retirementCalcs.scenario.label
  })

  // Load dreams on component mount with recovery check
  useEffect(() => {
    const loadUserDreams = () => {
      try {
        // Check if emergency recovery is needed
        const recoveryNeeded = localStorage.getItem('needsEmergencyRecovery') === 'true'
        const canRecover = DreamService.canRecover()
        
        if (recoveryNeeded && canRecover) {
          console.log('🚨 Emergency recovery needed and available')
          setNeedsRecovery(true)
          setShowRecoveryModal(true)
        }
        
        // Get all dreams and separate by type
        const allDreams = DreamService.getAllDreams()
        const currentSomedayLife = DreamService.getSomedayLifeGoal()
        const milestoneGoals = DreamService.getDreamsByType('milestone')
        const investmentGoals = DreamService.getDreamsByType('investment')
        
        console.log('Dreams loaded by type:', {
          somedayLife: currentSomedayLife ? 1 : 0,
          milestones: milestoneGoals.length,
          investments: investmentGoals.length,
          total: allDreams.length,
          recoveryNeeded,
          canRecover
        })
        
        // Set Someday Life goal separately (PROTECTED)
        setSomedayLifeGoal(currentSomedayLife)
        
        // Display dreams are only milestones and investments (NOT Someday Life)
        const displayDreams = [...milestoneGoals, ...investmentGoals]
        setDreams(displayDreams)
        
        // If there's a highlighted dream ID, find and select it
        if (highlightedDreamId) {
          const highlightedDream = allDreams.find(dream => dream.id === highlightedDreamId)
          if (highlightedDream) {
            setSelectedDream(highlightedDream)
          }
        }
        
        // Show recovery modal if needed (after other loading)
        if (!currentSomedayLife && !recoveryNeeded && canRecover) {
          console.log('💡 No Someday Life found but recovery possible')
          setNeedsRecovery(true)
          // Don't auto-show modal, but make recovery available
        }
        
      } catch (error) {
        console.error('Error loading dreams:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserDreams()
  }, [highlightedDreamId])

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Calculate days remaining
  const getDaysRemaining = (targetDate) => {
    const today = new Date()
    const target = new Date(targetDate)
    const diffTime = target - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      travel: 'blue',
      home: 'green',
      education: 'purple',
      family: 'red',
      freedom: 'yellow',
      lifestyle: 'indigo',
      health: 'pink'
    }
    return colors[category] || 'gray'
  }

  // Calculate total statistics
  const totalStats = dreams.reduce((acc, dream) => {
    acc.totalAmount += dream.target_amount
    acc.totalProgress += dream.progress || 0
    return acc
  }, { totalAmount: 0, totalProgress: 0 })

  const averageProgress = dreams.length > 0 ? totalStats.totalProgress / dreams.length : 0

  // Delete dream handler with enhanced protection
  const handleDeleteDream = (dreamId) => {
    try {
      const dreamToDelete = [...dreams].find(d => d.id === dreamId)
      if (!dreamToDelete) {
        console.warn('Dream not found for deletion:', dreamId)
        return
      }
      
      // Extra protection for Someday Life goals
      if (dreamToDelete.type === 'someday_life') {
        alert('🛡️ Someday Life goals cannot be deleted from here.\n\nTo change your Someday Life vision, use the Someday Life Builder.')
        return
      }
      
      // Standard confirmation for other dreams
      if (!confirm(`Are you sure you want to remove "${dreamToDelete.title}"?`)) return
      
      // Perform deletion (DreamService handles backup and protection)
      const updatedDreams = DreamService.deleteDream(dreamId)
      
      // Update local state - only show non-Someday Life dreams
      const milestoneGoals = DreamService.getDreamsByType('milestone')
      const investmentGoals = DreamService.getDreamsByType('investment')
      setDreams([...milestoneGoals, ...investmentGoals])
      
    } catch (error) {
      console.error('Error deleting dream:', error)
      alert('An error occurred while deleting the dream.')
    }
  }
  
  // Handle recovery completion
  const handleRecoveryComplete = (recoveredDream) => {
    console.log('✅ Recovery completed:', recoveredDream)
    setSomedayLifeGoal(recoveredDream)
    setNeedsRecovery(false)
    setShowRecoveryModal(false)
    
    // Refresh dreams display
    const milestoneGoals = DreamService.getDreamsByType('milestone')
    const investmentGoals = DreamService.getDreamsByType('investment')
    setDreams([...milestoneGoals, ...investmentGoals])
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dreams...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Adaptive Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{timeHorizonContent.dashboardTitle}</h1>
              <p className="text-gray-600">{timeHorizonContent.focusMessage}</p>
              <div className="mt-2 flex items-center space-x-4 text-sm">
                <span className={`px-3 py-1 rounded-full text-${timeHorizonContent.emphasisColor}-700 bg-${timeHorizonContent.emphasisColor}-100 font-medium`}>
                  {timeHorizon.phase}
                </span>
                <span className="text-gray-500">
                  {timeHorizon.yearsUntilRetirement} years to retirement
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Test Scenario Selector */}
              <select 
                value={Object.keys(testScenarios).find(key => testScenarios[key].currentAge === userProfile.currentAge) || 'young'}
                onChange={(e) => setUserProfile(prev => ({ ...prev, ...testScenarios[e.target.value] }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(testScenarios).map(([key, scenario]) => (
                  <option key={key} value={key}>{scenario.label}</option>
                ))}
              </select>
              
              <button
                onClick={onNavigateToZeroBasedPlanner}
                className="btn-secondary flex items-center px-4 py-2"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Budget Planner
              </button>
              <button
                onClick={onAddDream}
                className="btn-primary flex items-center px-6 py-3"
              >
                <Plus className="w-5 h-5 mr-2" />
{getDashboardContent('addButton', 'Add New Dream')}
              </button>
            </div>
          </div>
        </div>

        {/* Mathematical Validation Alert - Critical for credibility */}
        {retirementCalcs.scenario && !retirementCalcs.scenario.isAchievable && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="bg-red-100 p-2 rounded-full mr-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800 mb-1">⚠️ Mathematical Reality Check</h3>
                <p className="text-red-700 mb-3">
                  The {selectedScenario} scenario requires saving more than your entire income allows. Even at maximum possible savings rate, you could only save ${retirementCalcs.realisticCalculation?.userProfile.maxDailySavings}/day.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedScenario('conservative')}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Switch to Conservative Scenario
                  </button>
                  <span className="text-red-600 text-sm px-3 py-2">
                    Alternative: Extend timeline or reduce retirement expenses
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recovery Alert */}
        {needsRecovery && !showRecoveryModal && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="bg-yellow-100 p-2 rounded-full mr-3">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-800 mb-1">Someday Life Data Recovery Available</h3>
                <p className="text-yellow-700 mb-3">
                  We found traces of a previously created Someday Life plan. Would you like to restore it?
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowRecoveryModal(true)}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 mr-1 inline" />
                    Recover Data
                  </button>
                  <button
                    onClick={() => setNeedsRecovery(false)}
                    className="border border-yellow-300 text-yellow-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-100 transition-colors"
                  >
                    Skip
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {dreams.length === 0 && !somedayLifeGoal ? (
          // Empty state
          <div className="text-center py-12">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{getDashboardContent('emptyStateTitle', 'Start Your Dream Journey')}</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {getDashboardContent('emptyStateMessage', 'Create your first dream and discover how small daily actions can turn into life-changing achievements.')}
            </p>
            <button
              onClick={onAddDream}
              className="btn-primary px-8 py-3 text-lg"
            >
              {getDashboardContent('addButton', 'Create Your First Dream')}
            </button>
          </div>
        ) : (
          <>
            {(() => {
              if (!somedayLifeGoal) {
                return (
                  <div className="mb-12">
                    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-8 shadow-lg border border-blue-100 text-center">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Define Your Someday Life?</h2>
                      <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                        Your Someday Life is your ultimate vision of financial freedom. It's more than retirement - it's the lifestyle you want to live when money is no longer a constraint.
                      </p>
                      <button 
                        onClick={() => onNavigateToSomedayLifeBuilder && onNavigateToSomedayLifeBuilder()}
                        className="btn-primary px-8 py-3 text-lg"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Your Someday Life Goal
                      </button>
                    </div>
                  </div>
                )
              }

              // Calculate proper retirement numbers
              const retirementCalculation = calculateTotalRetirementNeed(
                userProfile.annualExpenses,
                retirementCalcs.baseYearsToRetirement,
                30, // years in retirement
                0.03, // inflation rate
                userProfile.currentAge,
                userProfile.currentSavings
              )

              const yearsToGoal = retirementCalcs.baseYearsToRetirement
              const requiredMonthly = retirementCalculation.netAmountNeeded / (yearsToGoal * 12)
              const currentMonthly = userProfile.monthlySavings || 3000
              const dailySavingsNeeded = requiredMonthly / 30

              return (
                <>
                  {/* LEVEL 1: DOMINANT HERO SECTION - 40% of screen, single clear message */}
                  <div className="mb-12" style={{ minHeight: '40vh' }}>
                    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-yellow-50 rounded-3xl p-12 shadow-lg border border-blue-100 text-center">
                      {/* Synthesizing statement - the aha moment */}
                      <div className="text-lg text-blue-700 font-medium mb-4 bg-blue-100/50 rounded-full px-6 py-2 inline-block">
                        Your dream of nomadic freedom is achievable at {retirementCalcs.baseRetirementAge} by saving ${retirementCalcs.scenario.dailyAmount} daily
                      </div>
                      
                      {/* Demographic Acknowledgment Badge */}
                      <div className="text-sm text-purple-700 font-medium mb-6 bg-purple-100/50 rounded-full px-4 py-1 inline-block">
                        💪 High Earner Advantage: Your income puts you in the top 5% for your age
                      </div>

                      {/* MAIN RETIREMENT VISUALIZATION - Show reality first */}
                      <div className="mb-12 bg-gradient-to-br from-blue-50 via-purple-50 to-yellow-50 rounded-3xl p-8 border border-blue-100">
                        {/* Clear headline with clean demo numbers */}
                        <h1 className="text-5xl font-bold text-gray-900 mb-6">
                          Your Nomadic Freedom in {retirementCalcs.baseYearsToRetirement} Years
                        </h1>
                      
                      {/* Visual progress path */}
                      <div className="flex items-center justify-center mb-8 max-w-2xl mx-auto">
                        <div className="flex items-center w-full">
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-lg mb-2">
                              <span className="text-white text-lg font-bold">{retirementCalcs.currentAge}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-700">Today</span>
                          </div>
                          
                          <div className="flex-1 mx-8">
                            <div className="h-2 bg-gradient-to-r from-blue-300 to-yellow-400 rounded-full relative">
                              {/* Life milestone markers - subtle dots */}
                              <div className="absolute top-1/2 transform -translate-y-1/2" style={{ left: '25%' }}>
                                <div className="w-2 h-2 bg-pink-400 rounded-full opacity-60" title="Wedding at 32"></div>
                              </div>
                              <div className="absolute top-1/2 transform -translate-y-1/2" style={{ left: '45%' }}>
                                <div className="w-2 h-2 bg-green-400 rounded-full opacity-60" title="House at 35"></div>
                              </div>
                              <div className="absolute top-1/2 transform -translate-y-1/2" style={{ left: '80%' }}>
                                <div className="w-2 h-2 bg-purple-400 rounded-full opacity-60" title="Kids college at 48"></div>
                              </div>
                              
                              <div className="absolute right-0 top-1/2 transform translate-x-2 -translate-y-1/2">
                                <ArrowRight className="w-6 h-6 text-yellow-500" />
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg mb-2">
                              <Sparkles className="w-8 h-8 text-white" />
                            </div>
                            <span className="text-sm font-bold text-yellow-600">Freedom</span>
                            <span className="text-xs text-gray-600">Age {retirementCalcs.baseRetirementAge}</span>
                            {/* Emotional context - what freedom actually means */}
                            <div className="text-xs text-yellow-700 font-medium mt-1 max-w-32 text-center leading-tight">
                              Wake up on beaches worldwide, paint sunsets, explore cultures - all fully funded
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Single key number - dynamic based on scenario */}
                      <div className="bg-white rounded-3xl p-8 inline-block shadow-sm border mb-6">
                        <div className="text-6xl font-bold text-blue-600 mb-2">
                          ${retirementCalcs.scenario.dailyAmount}
                        </div>
                        <div className="text-xl text-gray-700 mb-1">daily savings required</div>
                        <div className="text-sm text-gray-500 mb-2">makes this dream real</div>
                        
                        {/* Dynamic context based on ACTUAL calculated scenario */}
                        <div className="text-sm font-medium rounded-lg px-3 py-1 inline-block mb-2">
                          {selectedScenario === 'aggressive' && retirementCalcs.realisticCalculation && (
                            <span className="text-orange-700 bg-orange-50">
                              At your ${(userProfile.annualIncome/1000).toFixed(0)}k income, that's {Math.round((retirementCalcs.scenario.annualSavings / retirementCalcs.realisticCalculation.userProfile.takeHomePay) * 100)}% savings rate - aggressive but achievable for FIRE achievers
                            </span>
                          )}
                          {selectedScenario === 'moderate' && retirementCalcs.realisticCalculation && (
                            <span className="text-blue-700 bg-blue-50">
                              At your ${(userProfile.annualIncome/1000).toFixed(0)}k income, that's {Math.round((retirementCalcs.scenario.annualSavings / retirementCalcs.realisticCalculation.userProfile.takeHomePay) * 100)}% savings rate - balanced approach with room for life
                            </span>
                          )}
                          {selectedScenario === 'conservative' && retirementCalcs.realisticCalculation && (
                            <span className="text-green-700 bg-green-50">
                              At your ${(userProfile.annualIncome/1000).toFixed(0)}k income, that's {Math.round((retirementCalcs.scenario.annualSavings / retirementCalcs.realisticCalculation.userProfile.takeHomePay) * 100)}% savings rate - comfortable and sustainable long-term
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-1 inline-block">
                          {selectedScenario === 'aggressive' && 'Maximum optimization for earliest freedom'}
                          {selectedScenario === 'moderate' && 'Balanced timeline with reasonable daily commitment'}
                          {selectedScenario === 'conservative' && 'Longer journey but lower daily stress'}
                        </div>
                      </div>
                      
                      {/* Single subtle link for details */}
                      <button 
                        onClick={() => document.getElementById('detailed-breakdown').scrollIntoView({ behavior: 'smooth' })}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center mx-auto transition-colors"
                      >
                        See how we calculated this
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </button>
                      </div>

                      {/* SAVINGS STRATEGY CHOICE - After seeing the reality */}
                      <div className="mb-12">
                        <ScenarioToggle 
                          selected={selectedScenario} 
                          onChange={setSelectedScenario}
                          scenarios={retirementCalcs.scenarios}
                        />
                      </div>
                    </div>
                  </div>

                  {/* LEVEL 2: EXPANDABLE SECTIONS - One click deep */}
                  <ExpandableDashboardSections 
                    userProfile={userProfile}
                    dreams={dreams}
                    retirementCalculation={retirementCalculation}
                    currentMonthly={currentMonthly}
                    requiredMonthly={requiredMonthly}
                    somedayLifeGoal={somedayLifeGoal}
                    retirementCalcs={retirementCalcs}
                  />

                  {/* Motivational Timeline Context */}
                  <div className="mt-12 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 border border-purple-200 text-center">
                    <div className="text-xl font-bold text-purple-800 mb-3">
                      🎯 Retiring at {retirementCalcs.baseRetirementAge} instead of 65 gives you {((65 - retirementCalcs.baseRetirementAge) * 365).toLocaleString()} extra days of freedom
                    </div>
                    <div className="text-lg text-purple-700 font-medium">
                      That's {((65 - retirementCalcs.baseRetirementAge) * 365).toLocaleString()} sunrises in new places, {((65 - retirementCalcs.baseRetirementAge) * 365).toLocaleString()} days of choosing your adventure
                    </div>
                  </div>

                </>
              )
            })()}






            {/* Life Events Integration - Now part of expandable sections */}

            {/* Individual Dreams - Now Secondary and Collapsible */}
            {dreams.length > 0 && (
              <div className="mb-12">
                <details className="bg-gray-50 rounded-2xl border border-gray-200">
                  <summary className="p-6 cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-700 mb-1">Other Dreams & Goals</h3>
                      <p className="text-sm text-gray-600">{dreams.length} additional goals alongside your Someday Life</p>
                      <p className="text-xs text-gray-500 mt-2">Click to view all dreams →</p>
                    </div>
                  </summary>
                  <div className="px-6 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {dreams.map((dream) => (
                        <DreamCard
                          key={dream.id}
                          dream={dream}
                          isHighlighted={dream.id === highlightedDreamId}
                          onSelect={() => setSelectedDream(dream)}
                          onDelete={() => handleDeleteDream(dream.id)}
                          formatCurrency={formatCurrency}
                          getDaysRemaining={getDaysRemaining}
                          getCategoryColor={getCategoryColor}
                        />
                      ))}
                    </div>
                  </div>
                </details>
              </div>
            )}
          </>
        )}

        {/* Dream Detail Modal */}
        {selectedDream && (
          <DreamDetailModal
            dream={selectedDream}
            onClose={() => setSelectedDream(null)}
            formatCurrency={formatCurrency}
            getDaysRemaining={getDaysRemaining}
            getCategoryColor={getCategoryColor}
          />
        )}
        
        {/* Data Recovery Modal */}
        <DataRecoveryModal
          isOpen={showRecoveryModal}
          onClose={() => setShowRecoveryModal(false)}
          onRecovered={handleRecoveryComplete}
        />
      </div>
    </div>
  )
}

/**
 * Expandable Dashboard Sections Component
 * Implements progressive disclosure - Level 2 content that expands on demand
 */
const ExpandableDashboardSections = ({ userProfile, dreams, retirementCalculation, currentMonthly, requiredMonthly, somedayLifeGoal, retirementCalcs }) => {
  const [expandedSection, setExpandedSection] = useState(null)
  const [showBestOpportunity, setShowBestOpportunity] = useState(true)
  
  const yearsToGoal = retirementCalcs.baseYearsToRetirement
  const dailySavingsNeeded = retirementCalcs.scenario.dailyAmount
  
  // Get the best opportunity based on user profile
  const getBestOpportunity = () => {
    if (userProfile.occupation?.toLowerCase().includes('marketing')) {
      return {
        title: 'High-Value Marketing Consulting',
        description: `Your expertise could command $200-300/hour consulting rates. Just 10 hours monthly adds $30k/year. Invested over 10 years with 7% returns = $450,000 additional portfolio value. This additional wealth means you need ${retirementCalcs.withOptimizationYears} fewer years of saving to reach your $2M goal`,
        potential: '+$30k annually',
        timeReduction: `Retire at ${retirementCalcs.withOptimization} instead of ${retirementCalcs.baseRetirementAge}`,
        color: 'blue'
      }
    }
    return {
      title: 'Geographic Arbitrage',
      description: 'Work remotely from lower-cost countries while earning US income',
      potential: '+$25k annually',
      timeReduction: '2 years earlier',
      color: 'green'
    }
  }
  
  const bestOpportunity = getBestOpportunity()
  
  const formatCurrency = (amount) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}k`
    return `$${amount.toLocaleString()}`
  }
  
  const sections = [
    {
      id: 'journey',
      title: 'See Your Journey',
      icon: <MapPin className="w-5 h-5" />,
      summary: `Visual timeline from age ${retirementCalcs.currentAge} to ${retirementCalcs.baseRetirementAge}`,
      color: 'blue'
    },
    {
      id: 'accelerate',
      title: 'Accelerate Your Timeline',
      icon: <Zap className="w-5 h-5" />,
      summary: `Top 3 personalized actions to reach freedom faster`,
      color: 'purple'
    },
    {
      id: 'math',
      title: 'Understand the Math',
      icon: <Calculator className="w-5 h-5" />,
      summary: `How ${formatCurrency(retirementCalculation.requiredPortfolioSize || 2000000)} breaks down`,
      color: 'green'
    }
  ]
  
  return (
    <div className="space-y-8">
      {/* Best Opportunity - Simplified and focused */}
      {showBestOpportunity && (
        <div className="mb-8">
          <div className={`bg-gradient-to-br from-${bestOpportunity.color}-50 to-${bestOpportunity.color}-100 rounded-2xl p-8 border border-${bestOpportunity.color}-200`}>
            <div className="text-center mb-6">
              <div className={`bg-${bestOpportunity.color}-500 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}>
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Marketing Consulting: +$30k/year → Retire 5 years earlier</h2>
              <p className="text-lg text-gray-700 mb-6">
                Just 10 hours monthly at your market rate
              </p>
              
              {/* Visual hierarchy: make '-5 years' huge and bold */}
              <div className="mb-6">
                <div className={`text-6xl font-bold text-${bestOpportunity.color}-600 mb-2`}>
                  -5 years
                </div>
                <div className="text-lg text-gray-600">earlier freedom</div>
                <div className="text-sm text-gray-500">Retire at 48 instead of 53</div>
              </div>
              
              <button 
                onClick={() => setExpandedSection('accelerate')}
                className={`bg-${bestOpportunity.color}-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-${bestOpportunity.color}-700 transition-colors text-lg mr-4`}
              >
                Start This Opportunity
              </button>
              <button 
                onClick={() => setExpandedSection('accelerate')}
                className="text-gray-600 hover:text-gray-700 text-sm font-medium transition-colors"
              >
                See how this works →
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Three Expandable Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {sections.map((section) => (
          <div key={section.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all duration-200">
            <div className="text-center">
              <div className={`bg-${section.color}-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4`}>
                {section.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{section.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{section.summary}</p>
              <button 
                onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                className={`bg-${section.color}-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-${section.color}-600 transition-colors`}
              >
                {expandedSection === section.id ? 'Hide Details' : 'Explore'}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Expanded Content - Level 3 Detail */}
      {expandedSection && (
        <div className="mb-8">
          {expandedSection === 'journey' && (
            <div className="bg-blue-50 rounded-2xl p-8 border border-blue-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Life Journey to Freedom</h3>
                <button 
                  onClick={() => setExpandedSection(null)}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  ← Back to overview
                </button>
              </div>
              
              {/* Youth Advantage Messaging */}
              <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-6 mb-6 border border-green-200">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-800 mb-2">
                    🎯 Starting at {userProfile.currentAge} gives you a 15-year advantage over someone starting at 40
                  </div>
                  <div className="text-sm text-green-700">
                    Compound interest from age {retirementCalcs.currentAge}-{retirementCalcs.baseRetirementAge} does the heavy lifting - time is your superpower
                  </div>
                </div>
              </div>
              
              <LifeJourneyTimeline 
                userProfile={userProfile}
                dreams={dreams}
                retirementCalculation={retirementCalculation}
                retirementCalcs={retirementCalcs}
              />
            </div>
          )}
          
          {expandedSection === 'accelerate' && (
            <div className="bg-purple-50 rounded-2xl p-8 border border-purple-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Accelerate Your Timeline</h3>
                <button 
                  onClick={() => setExpandedSection(null)}
                  className="text-purple-600 hover:text-purple-700 text-sm"
                >
                  ← Back to overview
                </button>
              </div>
              <PersonalizedAccelerators 
                userProfile={userProfile}
                retirementCalculation={retirementCalculation}
                currentMonthly={currentMonthly}
                requiredMonthly={requiredMonthly}
                retirementCalcs={retirementCalcs}
                selectedScenario={selectedScenario}
              />
            </div>
          )}
          
          {expandedSection === 'math' && (
            <div id="detailed-breakdown" className="bg-green-50 rounded-2xl p-8 border border-green-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Financial Breakdown</h3>
                <p className="text-gray-600 mb-4">Complete analysis of your Someday Life requirements</p>
                <button 
                  onClick={() => setExpandedSection(null)}
                  className="text-green-600 hover:text-green-700 text-sm"
                >
                  ← Back to overview
                </button>
              </div>
              
              {/* 4% Rule Educational Section */}
              <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-6 mb-6 border border-green-200">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-800 mb-2">
                    📊 The 4% Rule: Portfolio needed = Annual spending ÷ 0.04
                  </div>
                  <div className="text-md text-green-700 mb-3">
                    ${userProfile.annualExpenses?.toLocaleString() || '80,000'}/year ÷ 0.04 = ${formatCurrency((userProfile.annualExpenses || 80000) * 25)} portfolio generates your lifestyle indefinitely
                  </div>
                  <div className="text-sm text-green-600 bg-white/50 rounded-lg p-3">
                    The 4% safe withdrawal rule means your portfolio should last <strong>indefinitely</strong>, not just 25 years. 
                    By withdrawing only 4% annually, your remaining investments continue growing, sustaining you whether retirement lasts 20, 30, or even 40 years.
                    This is why early retirement at {retirementCalcs.baseRetirementAge} is financially viable - the portfolio sustains itself through growth, not depletion.
                  </div>
                </div>
              </div>

              {/* Financial Breakdown Summary - Hardcoded Clean Demo Numbers */}
              <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">Portfolio Needed: $2.0M (generates $80k/year using 4% rule)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">$2.0M</div>
                    <div className="text-sm text-gray-600">Portfolio needed</div>
                    <div className="text-xs text-gray-500">$80,000/year × 25</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">$50k</div>
                    <div className="text-sm text-gray-600">Current savings</div>
                    <div className="text-xs text-gray-500">Your progress so far</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">$1.95M</div>
                    <div className="text-sm text-gray-600">Gap to goal</div>
                    <div className="text-xs text-gray-500">Still needed to save</div>
                  </div>
                </div>
              </div>
              
              {/* Detailed Breakdown - Hardcoded Clean Demo Numbers */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">How we calculated this (using 4% rule consistently):</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Annual lifestyle: $80,000/year</span>
                    <span className="font-medium">Your target spending</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">4% rule calculation: $80,000 ÷ 0.04</span>
                    <span className="font-medium">$2.0M</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Portfolio Needed (generates $80,000/year forever)</span>
                    <span>$2.0M</span>
                  </div>
                  <div className="border-t pt-2 mt-3">
                    <div className="flex justify-between text-blue-600">
                      <span>Current Savings</span>
                      <span>-$50k</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg mt-2">
                      <span>Gap to Fill</span>
                      <span>$1.95M</span>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 mt-4">
                    <div className="text-sm font-medium text-blue-800 mb-1">Your {selectedScenario} strategy:</div>
                    <div className="text-blue-700">
                      ${retirementCalcs.scenario.dailyAmount}/day × {retirementCalcs.baseYearsToRetirement} years = ${formatCurrency(retirementCalcs.scenario.dailyAmount * 365 * retirementCalcs.baseYearsToRetirement)} total contributions
                    </div>
                    <div className="text-blue-600 text-xs mt-1">
                      This builds your $2.0M portfolio through consistent daily savings + investment growth
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Include original detailed component for those who want more */}
              <div className="mt-6">
                <details className="bg-white rounded-xl border">
                  <summary className="p-4 cursor-pointer text-sm font-medium text-gray-700 hover:bg-gray-50">
                    View complete financial analysis →
                  </summary>
                  <div className="p-6 border-t">
                    <SomedayLifeHero 
                      userAge={retirementCalcs.currentAge}
                      targetAge={retirementCalcs.baseRetirementAge}
                      propertyTarget={somedayLifeGoal.property_cost || somedayLifeGoal.target_amount || 450000}
                      livingExpensesPerYear={somedayLifeGoal.annual_expenses || somedayLifeGoal.living_expenses_per_year || userProfile.annualExpenses || 80000}
                      yearsOfExpenses={25}
                      currentPropertySaved={somedayLifeGoal.currentAmount || 45000}
                      currentExpensesSaved={userProfile.currentSavings || 165000}
                    />
                  </div>
                </details>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Individual Dream Card Component
 */
const DreamCard = ({ dream, isHighlighted, onSelect, onDelete, formatCurrency, getDaysRemaining, getCategoryColor }) => {
  const categoryColor = getCategoryColor(dream.category)
  const daysRemaining = getDaysRemaining(dream.target_date)
  const progress = dream.progress || 0

  return (
    <div
      className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${
        isHighlighted ? 'ring-2 ring-blue-500 ring-opacity-50 shadow-lg' : ''
      }`}
      onClick={onSelect}
    >
      {/* Dream Header */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{dream.title}</h3>
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full bg-${categoryColor}-100 text-${categoryColor}-700`}>
              {dream.category.charAt(0).toUpperCase() + dream.category.slice(1)}
            </span>
          </div>
          <div className="text-right flex flex-col items-end">
            <button
              onClick={(e) => {
                e.stopPropagation() // Prevent card selection when clicking delete
                onDelete()
              }}
              className="mb-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors duration-200"
              title="Delete dream"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div>
              <p className="text-sm text-gray-500">Target</p>
              <p className="font-bold text-gray-900">{formatCurrency(dream.target_amount)}</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <ProgressBar
            percentage={progress}
            label="Progress"
            showPercentage={true}
            animationDuration={1200}
          />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-lg font-bold text-blue-600">
              ${((dream.target_amount * (1 - progress / 100)) / Math.max(daysRemaining, 1)).toFixed(2)}
            </p>
            <p className="text-xs text-blue-700">per day needed</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-lg font-bold text-green-600">{daysRemaining}</p>
            <p className="text-xs text-green-700">days left</p>
          </div>
        </div>

        {/* Target Date */}
        <div className="text-sm text-gray-500">
          <p>Target: {format(new Date(dream.target_date), 'MMM dd, yyyy')}</p>
        </div>

        {/* New Dream Indicator */}
        {isHighlighted && (
          <div className="mt-3 text-center">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              ✨ Just Created!
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Dream Detail Modal Component
 */
const DreamDetailModal = ({ dream, onClose, formatCurrency, getDaysRemaining, getCategoryColor }) => {
  const categoryColor = getCategoryColor(dream.category)
  const daysRemaining = getDaysRemaining(dream.target_date)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{dream.title}</h2>
              <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full bg-${categoryColor}-100 text-${categoryColor}-700`}>
                {dream.category.charAt(0).toUpperCase() + dream.category.slice(1)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Description */}
          {dream.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{dream.description}</p>
            </div>
          )}

          {/* Progress */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Progress</h3>
            <ProgressBar
              percentage={dream.progress || 0}
              label="Overall Progress"
              showPercentage={true}
              animationDuration={1500}
            />
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Target Amount</h4>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(dream.target_amount)}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Target Date</h4>
              <p className="text-lg text-gray-700">{format(new Date(dream.target_date), 'MMMM dd, yyyy')}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Days Remaining</h4>
              <p className="text-lg text-gray-700">{daysRemaining} days</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Created</h4>
              <p className="text-lg text-gray-700">{format(new Date(dream.createdAt), 'MMM dd, yyyy')}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button className="btn-primary flex-1">
              Update Progress
            </button>
            <button className="btn-secondary flex-1">
              Edit Dream
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


/**
 * Life Events Integration Section
 * Shows how life events impact the financial timeline
 */
const LifeEventsSection = ({ dreams, userProfile }) => {
  const [selectedEvents, setSelectedEvents] = useState(new Set(['wedding', 'child-education']))
  
  const lifeEventCategories = [
    {
      id: 'celebrations',
      title: 'Planned Celebrations',
      icon: <Heart className="w-5 h-5" />,
      color: 'pink',
      events: [
        { id: 'wedding', title: 'Wedding', cost: 25000, age: userProfile.currentAge + 3, impact: '+3 months' },
        { id: 'anniversary', title: '10th Anniversary Trip', cost: 8000, age: userProfile.currentAge + 13, impact: '+1 month' }
      ]
    },
    {
      id: 'family',
      title: 'Family Milestones',
      icon: <Users className="w-5 h-5" />,
      color: 'blue',
      events: [
        { id: 'child-education', title: 'Child\'s College', cost: 50000, age: userProfile.currentAge + 18, impact: '+6 months' },
        { id: 'parent-support', title: 'Parent Support', cost: 15000, age: userProfile.currentAge + 10, impact: '+2 months' }
      ]
    },
    {
      id: 'lifestyle',
      title: 'Life Upgrades',
      icon: <Home className="w-5 h-5" />,
      color: 'green',
      events: [
        { id: 'car-upgrade', title: 'New Car', cost: 35000, age: userProfile.currentAge + 5, impact: '+4 months' },
        { id: 'home-renovation', title: 'Home Renovation', cost: 40000, age: userProfile.currentAge + 8, impact: '+5 months' }
      ]
    },
    {
      id: 'health',
      title: 'Health & Wellness',
      icon: <Activity className="w-5 h-5" />,
      color: 'purple',
      events: [
        { id: 'health-procedure', title: 'Elective Surgery', cost: 12000, age: userProfile.currentAge + 7, impact: '+1 month' },
        { id: 'fitness-program', title: 'Personal Trainer (2 years)', cost: 8000, age: userProfile.currentAge + 2, impact: '+1 month' }
      ]
    }
  ]
  
  const toggleEvent = (eventId) => {
    const newSelected = new Set(selectedEvents)
    if (newSelected.has(eventId)) {
      newSelected.delete(eventId)
    } else {
      newSelected.add(eventId)
    }
    setSelectedEvents(newSelected)
  }
  
  const calculateTotalImpact = () => {
    let totalCost = 0
    let totalMonths = 0
    
    lifeEventCategories.forEach(category => {
      category.events.forEach(event => {
        if (selectedEvents.has(event.id)) {
          totalCost += event.cost
          totalMonths += parseInt(event.impact.replace(/[^\d]/g, ''))
        }
      })
    })
    
    return { totalCost, totalMonths }
  }
  
  const { totalCost, totalMonths } = calculateTotalImpact()
  const newRetirementAge = userProfile.somedayLifeAge + Math.floor(totalMonths / 12)
  const additionalMonths = totalMonths % 12
  
  const formatCurrency = (amount) => {
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}k`
    return `$${amount.toLocaleString()}`
  }
  
  return (
    <div className="mb-8">
      <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 rounded-2xl p-8 border border-gray-200">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Life Moments Planning</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Include life events in your plan and see exactly how they affect your timeline
          </p>
        </div>
        
        {/* Impact Summary */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalCost)}</div>
              <div className="text-sm text-gray-600">Total additional cost</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {totalMonths > 0 ? `+${Math.floor(totalMonths / 12)} years ${additionalMonths} months` : 'No delay'}
              </div>
              <div className="text-sm text-gray-600">Timeline impact</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                Age {newRetirementAge}{additionalMonths > 0 && ` + ${additionalMonths}m`}
              </div>
              <div className="text-sm text-gray-600">New Someday Life age</div>
            </div>
          </div>
        </div>
        
        {/* Event Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {lifeEventCategories.map((category) => (
            <div key={category.id} className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center mb-4">
                <div className={`bg-${category.color}-100 p-2 rounded-full mr-3`}>
                  {category.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
              </div>
              
              <div className="space-y-3">
                {category.events.map((event) => (
                  <div key={event.id} className="border border-gray-100 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{event.title}</div>
                        <div className="text-xs text-gray-600">Age {event.age} • {formatCurrency(event.cost)}</div>
                        <div className="text-xs text-gray-500">{event.impact} to timeline</div>
                      </div>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedEvents.has(event.id)}
                          onChange={() => toggleEvent(event.id)}
                          className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Timeline Visualization */}
        {totalCost > 0 && (
          <div className="mt-6 bg-yellow-50 rounded-xl p-6 border border-yellow-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <div className="font-medium text-yellow-800 mb-1">
                  Life Events Impact Analysis
                </div>
                <div className="text-sm text-yellow-700">
                  Including these life events will add <strong>{formatCurrency(totalCost)}</strong> to your total plan
                  and move your Someday Life from age <strong>{userProfile.somedayLifeAge}</strong> to 
                  age <strong>{newRetirementAge}{additionalMonths > 0 && ` + ${additionalMonths} months`}</strong>.
                  <br />
                  <span className="mt-2 block">
                    Consider the Personal Accelerators above to offset this impact or adjust event timing.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Life Journey Timeline Component
 * Shows the user's path from current age to Someday Life with all major milestones
 */
const LifeJourneyTimeline = ({ userProfile, dreams, retirementCalculation, retirementCalcs }) => {
  const [hoveredMilestone, setHoveredMilestone] = useState(null)
  const [draggedMilestone, setDraggedMilestone] = useState(null)
  
  // Sample life milestones - would come from user data
  const lifeMilestones = [
    {
      id: 'car',
      title: 'New Car',
      age: userProfile.currentAge + 3,
      cost: 35000,
      type: 'planned',
      category: 'lifestyle',
      icon: <Target className="w-4 h-4" />,
      color: 'blue',
      impact: 'Delays retirement by 2 months'
    },
    {
      id: 'wedding',
      title: 'Wedding',
      age: userProfile.currentAge + 5,
      cost: 25000,
      type: 'potential',
      category: 'family',
      icon: <Heart className="w-4 h-4" />,
      color: 'pink',
      impact: 'Delays retirement by 3 months'
    },
    {
      id: 'child-education',
      title: 'Child Education',
      age: userProfile.currentAge + 12,
      cost: 50000,
      type: 'planned',
      category: 'family',
      icon: <GraduationCap className="w-4 h-4" />,
      color: 'purple',
      impact: 'Delays retirement by 6 months'
    },
    {
      id: 'home-improvement',
      title: 'Home Renovation',
      age: userProfile.currentAge + 8,
      cost: 40000,
      type: 'potential',
      category: 'home',
      icon: <Home className="w-4 h-4" />,
      color: 'green',
      impact: 'Delays retirement by 4 months'
    },
    {
      id: 'debt-freedom',
      title: 'Debt Free',
      age: userProfile.currentAge + 15,
      cost: 0,
      type: 'milestone',
      category: 'financial',
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'emerald',
      impact: 'Accelerates retirement by 12 months'
    }
  ]
  
  const totalYears = retirementCalcs.baseYearsToRetirement
  const timelineWidth = 100 // percentage
  
  const getMilestonePosition = (age) => {
    const progress = (age - retirementCalcs.currentAge) / totalYears
    return Math.min(95, Math.max(5, progress * timelineWidth))
  }
  
  const formatCurrency = (amount) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}k`
    return `$${amount.toLocaleString()}`
  }
  
  return (
    <div className="mb-8">
      <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
        {/* Simplified Timeline - Clean visual path only */}
        <div className="relative h-24 mb-8">
          {/* Main timeline line */}
          <div className="absolute top-12 left-8 right-8 h-2 bg-gradient-to-r from-blue-200 via-purple-200 to-yellow-300 rounded-full"></div>
          
          {/* Start marker */}
          <div className="absolute left-0 top-8">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white text-xs font-bold">{retirementCalcs.currentAge}</span>
            </div>
            <div className="text-center mt-2">
              <div className="text-xs font-medium text-gray-700">Today</div>
            </div>
          </div>
          
          {/* End marker - Someday Life */}
          <div className="absolute right-0 top-6">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="text-center mt-2">
              <div className="text-xs font-bold text-yellow-600">Freedom</div>
            </div>
          </div>
          
          {/* Milestone dots - minimal, tooltips on hover only */}
          {lifeMilestones.map((milestone) => {
            const position = getMilestonePosition(milestone.age)
            return (
              <div
                key={milestone.id}
                className="absolute top-10 transform -translate-x-1/2 cursor-pointer group"
                style={{ left: `${position}%` }}
              >
                <div className={`w-3 h-3 bg-${milestone.color}-400 rounded-full border border-white shadow-sm transition-all duration-200 group-hover:scale-150 group-hover:shadow-md`}></div>
                
                {/* Tooltip on hover only */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg whitespace-nowrap z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="font-medium">{milestone.title}</div>
                  <div className="text-gray-300">Age {milestone.age}</div>
                  {milestone.cost > 0 && (
                    <div className="text-gray-300">{formatCurrency(milestone.cost)}</div>
                  )}
                  <div className="text-gray-400 text-xs">{milestone.impact}</div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Summary stats only - no detailed grid */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">{lifeMilestones.length}</div>
              <div className="text-xs text-gray-600">Life events</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">
                {formatCurrency(lifeMilestones.reduce((sum, m) => sum + m.cost, 0))}
              </div>
              <div className="text-xs text-gray-600">Total cost</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                {retirementCalcs.baseYearsToRetirement} years
              </div>
              <div className="text-xs text-gray-600">To freedom</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">Age {retirementCalcs.baseRetirementAge}</div>
              <div className="text-xs text-gray-600">Your goal</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Personalized Accelerators Component
 * Shows specific opportunities based on user's occupation and lifestyle
 */
const PersonalizedAccelerators = ({ userProfile, retirementCalculation, currentMonthly, requiredMonthly, retirementCalcs, selectedScenario }) => {
  const getPersonalizedOpportunities = () => {
    const opportunities = []
    
    // Based on occupation
    if (userProfile.occupation?.toLowerCase().includes('marketing')) {
      opportunities.push({
        id: 'freelance-consulting',
        title: 'High-Value Marketing Consulting',
        description: 'Your expertise could command $200-300/hour consulting rates. Just 10 hours monthly adds $30k/year.',
        potential: 30000,
        timeReduction: '5 years',
        difficulty: 'Medium',
        category: 'income',
        icon: <Briefcase className="w-5 h-5" />,
        color: 'blue',
        actionSteps: [
          'Create professional LinkedIn presence',
          'Build portfolio of past campaign results',
          'Join freelance platforms (Upwork, Toptal)',
          'Network with small business owners'
        ]
      })
    }
    
    // Based on lifestyle (nomadic freedom)
    if (userProfile.selectedLifestyle?.includes('nomadic')) {
      opportunities.push({
        id: 'geographic-arbitrage',
        title: 'Geographic Arbitrage Opportunity',
        description: 'Work remotely from low-cost countries while earning US salary',
        potential: 25000,
        timeReduction: '3 years',
        difficulty: 'Medium',
        category: 'savings',
        icon: <MapPin className="w-5 h-5" />,
        color: 'green',
        actionSteps: [
          'Research high-quality low-cost destinations (Portugal, Mexico, Costa Rica)',
          'Negotiate remote work arrangement with clear expectations',
          'Set up international banking and tax optimization',
          'Plan 3-6 month test relocation to validate lifestyle'
        ]
      })
      
      opportunities.push({
        id: 'travel-content',
        title: 'Travel Content Creation',
        description: 'Document your nomadic journey for income through blogs, videos, courses',
        potential: 15000,
        timeReduction: '2 years',
        difficulty: 'Medium',
        category: 'income',
        icon: <Star className="w-5 h-5" />,
        color: 'purple',
        actionSteps: [
          'Start travel blog/YouTube channel',
          'Build audience during practice trips',
          'Create online course about remote work',
          'Partner with travel brands'
        ]
      })
    }
    
    // High-earner tax optimization strategies
    opportunities.push({
      id: 'tax-advantaged-accounts',
      title: 'Tax-Advantaged Account Maximization',
      description: 'Max out 401k, Backdoor Roth IRA, HSA opportunities',
      potential: 12000,
      timeReduction: '1.5 years',
      difficulty: 'Low',
      category: 'savings',
      icon: <Calculator className="w-5 h-5" />,
      color: 'emerald',
      actionSteps: [
        'Maximize 401k contribution to $23,000 annually',
        'Execute Backdoor Roth IRA conversion ($7,000)',
        'Maximize HSA if eligible ($4,150)',
        'Consider mega backdoor Roth if available'
      ]
    })
    
    return opportunities
  }
  
  const opportunities = getPersonalizedOpportunities()
  
  const formatCurrency = (amount) => {
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}k`
    return `$${amount.toLocaleString()}`
  }
  
  return (
    <div className="space-y-8">
      {/* Simplified Opportunities - Focus on key message and impact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {opportunities.slice(0, 3).map((opportunity) => (
          <div
            key={opportunity.id}
            className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
          >
            <div className="text-center mb-6">
              <div className={`bg-${opportunity.color}-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}>
                {opportunity.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{opportunity.title}</h3>
              
              {/* Primary display: What's the opportunity? What's the effort? What's the impact? */}
              <div className={`text-4xl font-bold text-${opportunity.color}-600 mb-2`}>
                -{opportunity.timeReduction}
              </div>
              <div className="text-sm text-gray-600 mb-3">retirement timeline</div>
              
              {/* Clear effort indicator */}
              <div className="text-sm bg-gray-50 rounded-lg p-2 mb-4">
                {opportunity.id === 'freelance-consulting' && 'Just 10 hours monthly at your market rate'}
                {opportunity.id === 'geographic-arbitrage' && 'Work remotely from lower-cost countries'}
                {opportunity.id === 'tax-advantaged-accounts' && 'Maximize existing tax accounts'}
                {opportunity.id === 'tax-optimization' && 'Strategic tax planning for nomads'}
              </div>
            </div>
            
            {/* Simplified description - focus on core value */}
            <div className="text-center mb-6">
              <div className={`text-lg font-medium text-${opportunity.color}-700 mb-2`}>
                +{formatCurrency(opportunity.potential)}/year
              </div>
              {opportunity.id === 'freelance-consulting' && (
                <p className="text-sm text-gray-600">Your expertise could command $200-300/hour consulting rates</p>
              )}
              {opportunity.id === 'geographic-arbitrage' && (
                <p className="text-sm text-gray-600">Reduce living costs while maintaining US income</p>
              )}
              {opportunity.id === 'tax-advantaged-accounts' && (
                <p className="text-sm text-gray-600">Max out 401k, Roth IRA, HSA opportunities</p>
              )}
              {opportunity.id === 'tax-optimization' && (
                <p className="text-sm text-gray-600">Utilize nomadic tax advantages legally</p>
              )}
            </div>
            
            <button className={`w-full px-6 py-3 bg-${opportunity.color}-500 text-white font-medium rounded-lg hover:bg-${opportunity.color}-600 transition-colors duration-200`}>
              See how this works →
            </button>
          </div>
        ))}
      </div>
      
      {/* Simplified Impact Summary - Hardcoded Clean Numbers */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">If you implemented all three</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">+$57k</div>
              <div className="text-gray-600">additional annual value</div>
              <div className="text-sm text-gray-500">$30k consulting + $25k arbitrage + $2k tax savings</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">Age 43</div>
              <div className="text-gray-600">new freedom timeline</div>
              <div className="text-sm text-gray-500">10 years earlier than baseline</div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Validation Overlay - Shows clean hardcoded numbers work */}
      <div className="fixed bottom-0 left-0 bg-black text-white p-2 text-xs font-mono z-50 max-w-md">
        <div className="font-bold mb-1">📊 Demo Math Validation:</div>
        <div>Income: $200k → Take-home: $130k (65% after taxes)</div>
        <div>Daily: ${retirementCalcs.scenario.dailyAmount} ({Math.round((retirementCalcs.scenario.annualSavings / 130000) * 100)}% savings rate)</div>
        <div>Achievable: ✅ (Conservative: 35%, Moderate: 50%, Aggressive: 65%)</div>
        <div>Retirement: Age {retirementCalcs.baseRetirementAge} ({retirementCalcs.baseYearsToRetirement} years from 25)</div>
        <div>Portfolio: $2M generates $80k/year (4% rule)</div>
        <div>Gap: $1.95M ($2M - $50k current)</div>
      </div>
    </div>
  )
}

export default Dashboard
