import { useState, useEffect } from 'react'
import { Plane, Home, GraduationCap, Heart, Banknote, Car, Activity, Sparkles } from 'lucide-react'
import { format, addDays } from 'date-fns'
import ProgressBar from '../components/ProgressBar'
import SavingsBreakdown from '../components/SavingsBreakdown'
import { calculateSavingsStrategies, convertToLifeEquivalents, calculateMilestones } from '../services/dreamCalculations'
import { saveDreamDraft, loadDreamDraft, clearDreamDraft, saveDream } from '../services/localStorage'

const CATEGORIES = [
  { value: 'travel', label: 'Travel & Adventures', icon: Plane, color: 'blue', description: 'Vacations, trips, experiences' },
  { value: 'home', label: 'Home & Property', icon: Home, color: 'green', description: 'Down payment, renovations' },
  { value: 'education', label: 'Learning & Growth', icon: GraduationCap, color: 'purple', description: 'Courses, degrees, skills' },
  { value: 'family', label: 'Family & Relationships', icon: Heart, color: 'red', description: 'Kids, family activities' },
  { value: 'freedom', label: 'Financial Freedom', icon: Banknote, color: 'yellow', description: 'Emergency fund, retirement' },
  { value: 'lifestyle', label: 'Lifestyle & Hobbies', icon: Car, color: 'indigo', description: 'Car, hobbies, gadgets' },
  { value: 'health', label: 'Health & Wellness', icon: Activity, color: 'pink', description: 'Medical, fitness, wellness' },
]

export default function DreamCreator({ onComplete, onBack }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'lifestyle',
    target_amount: 0,
    target_date: format(addDays(new Date(), 365), 'yyyy-MM-dd'),
    image_url: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdDream, setCreatedDream] = useState(null)
  const [savingsCalculations, setSavingsCalculations] = useState(null)
  const [selectedStrategy, setSelectedStrategy] = useState('balanced')
  const [lifeEquivalents, setLifeEquivalents] = useState([])
  const [milestones, setMilestones] = useState(null)
  const [draftSaveStatus, setDraftSaveStatus] = useState('idle')
  const [draftLoaded, setDraftLoaded] = useState(false)
  const [templateLoaded, setTemplateLoaded] = useState(false)

  // Parse URL parameters and location state for template data
  // Supports multiple ways to pass template data:
  // 1. Individual URL parameters: ?title=My%20Dream&amount=15000&timeframe=18&category=Travel
  // 2. JSON template parameter: ?template=%7B%22title%22%3A%22My%20Dream%22%2C%22amount%22%3A15000%7D
  // 3. Location state: window.history.pushState({ templateData: {...} }, '', '/dream-creator')
  useEffect(() => {
    const parseTemplateData = () => {
      try {
        // Check URL parameters first
        const urlParams = new URLSearchParams(window.location.search)
        const templateData = {}
        
        // Parse individual URL parameters
        if (urlParams.get('title')) templateData.title = decodeURIComponent(urlParams.get('title'))
        if (urlParams.get('description')) templateData.description = decodeURIComponent(urlParams.get('description'))
        if (urlParams.get('amount')) templateData.amount = parseFloat(urlParams.get('amount'))
        if (urlParams.get('timeframe')) templateData.suggestedTimeframe = parseInt(urlParams.get('timeframe'))
        if (urlParams.get('category')) templateData.category = urlParams.get('category')
        if (urlParams.get('imageUrl')) templateData.imageUrl = decodeURIComponent(urlParams.get('imageUrl'))
        
        // Check for JSON template data in URL parameter
        const templateParam = urlParams.get('template')
        if (templateParam) {
          try {
            const parsedTemplate = JSON.parse(decodeURIComponent(templateParam))
            Object.assign(templateData, parsedTemplate)
          } catch (e) {
            console.warn('Failed to parse template parameter:', e)
          }
        }
        
        // Check location state (for programmatic navigation)
        const locationState = window.history.state
        if (locationState && locationState.templateData) {
          Object.assign(templateData, locationState.templateData)
        }
        
        // If we have template data, populate the form
        if (Object.keys(templateData).length > 0) {
          populateFormFromTemplate(templateData)
          setTemplateLoaded(true)
          return true
        }
        
        return false
      } catch (error) {
        console.error('Error parsing template data:', error)
        return false
      }
    }

    // Try to load template data first, then fall back to draft
    const templateLoaded = parseTemplateData()
    
    if (!templateLoaded) {
      // Load existing draft if no template data
      loadSavedDraft()
    }
  }, [])

  // Function to populate form from template data
  const populateFormFromTemplate = (templateData) => {
    // Map template category to our category values
    const categoryMapping = {
      'Travel': 'travel',
      'Financial Security': 'freedom',
      'Life Events': 'family',
      'Transportation': 'lifestyle',
      'Home Improvement': 'home',
      'Business': 'lifestyle'
    }
    
    // Calculate target date from suggested timeframe if provided
    let targetDate = formData.target_date
    if (templateData.suggestedTimeframe) {
      targetDate = format(addDays(new Date(), templateData.suggestedTimeframe * 30), 'yyyy-MM-dd')
    }
    
    setFormData({
      title: templateData.title || '',
      description: templateData.description || '',
      category: categoryMapping[templateData.category] || templateData.category || 'lifestyle',
      target_amount: templateData.amount || 0,
      target_date: targetDate,
      image_url: templateData.imageUrl || ''
    })
    
    setDraftLoaded(true)
    console.log('Template data loaded successfully:', templateData.title || 'Custom template')
  }

  // Function to load saved draft
  const loadSavedDraft = () => {
    try {
      const draft = loadDreamDraft()
      if (draft) {
        setFormData({
          title: draft.title || '',
          description: draft.description || '',
          category: draft.category || 'lifestyle',
          target_amount: draft.target_amount || 0,
          target_date: draft.target_date || format(addDays(new Date(), 365), 'yyyy-MM-dd'),
          image_url: draft.image_url || ''
        })
        
        if (draft.selectedStrategy) {
          setSelectedStrategy(draft.selectedStrategy)
        }
        
        if (draft.step && draft.step <= 4) {
          setStep(draft.step)
        }
        
        setDraftLoaded(true)
        console.log('Draft loaded successfully')
      }
    } catch (error) {
      console.error('Error loading draft:', error)
    }
  }

  // Calculate savings strategies in real-time when amount or date changes
  useEffect(() => {
    if (formData.target_amount > 0 && formData.target_date) {
      try {
        const calculations = calculateSavingsStrategies(formData.target_amount, formData.target_date)
        setSavingsCalculations(calculations)
        
        const equivalents = convertToLifeEquivalents(calculations.balanced.dailyAmount)
        setLifeEquivalents(equivalents)
        
        const milestonesData = calculateMilestones(formData.target_amount, new Date(), formData.target_date)
        setMilestones(milestonesData)
      } catch (error) {
        setSavingsCalculations(null)
        setLifeEquivalents([])
        setMilestones(null)
      }
    } else {
      setSavingsCalculations(null)
      setLifeEquivalents([])
      setMilestones(null)
    }
  }, [formData.target_amount, formData.target_date])

  // Update life equivalents when strategy changes
  useEffect(() => {
    if (savingsCalculations && selectedStrategy) {
      const equivalents = convertToLifeEquivalents(savingsCalculations[selectedStrategy].dailyAmount)
      setLifeEquivalents(equivalents)
    }
  }, [selectedStrategy, savingsCalculations])

  // Auto-save draft with debouncing
  useEffect(() => {
    if (!draftLoaded && (!formData.title && !formData.description && formData.target_amount === 0)) {
      return
    }

    if (createdDream) {
      return
    }

    const timeoutId = setTimeout(() => {
      const saveDraft = async () => {
        setDraftSaveStatus('saving')
        
        try {
          const draftData = {
            ...formData,
            selectedStrategy,
            step
          }
          
          const result = saveDreamDraft(draftData)
          
          if (result.success) {
            setDraftSaveStatus('saved')
            setTimeout(() => setDraftSaveStatus('idle'), 2000)
          } else {
            setDraftSaveStatus('error')
            console.error('Failed to save draft:', result.error)
            setTimeout(() => setDraftSaveStatus('idle'), 3000)
          }
        } catch (error) {
          setDraftSaveStatus('error')
          console.error('Error saving draft:', error)
          setTimeout(() => setDraftSaveStatus('idle'), 3000)
        }
      }

      saveDraft()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [formData, selectedStrategy, step, draftLoaded, createdDream])

  // Clear draft when dream is successfully created
  useEffect(() => {
    if (createdDream) {
      const clearSavedDraft = async () => {
        try {
          const result = clearDreamDraft()
          if (result.success) {
            console.log('Draft cleared after successful dream creation')
            setDraftSaveStatus('idle')
          } else {
            console.error('Failed to clear draft:', result.error)
          }
        } catch (error) {
          console.error('Error clearing draft:', error)
        }
      }

      clearSavedDraft()
    }
  }, [createdDream])

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.target_amount || !formData.target_date) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      const dreamData = {
        ...formData,
        target_date: new Date(formData.target_date).toISOString(),
        selectedStrategy: selectedStrategy
      }
      
      const result = saveDream(dreamData)
      
      if (result.success) {
        setCreatedDream(result.dream)
        setStep(5)
        
        setTimeout(() => {
          onComplete(result.dreamId)
        }, 2000)
      } else {
        setError(result.error || 'Failed to save dream. Please try again.')
        console.error('Dream save error:', result)
      }
    } catch (err) {
      setError('Failed to create dream. Please try again.')
      console.error('Dream creation error:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="mb-4 text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back
          </button>
        )}

        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar 
            percentage={(step / 4) * 100}
            label={`Step ${step} of 4`}
            showPercentage={true}
            animationDuration={800}
          />
        </div>

        {/* Draft Save Status Indicator */}
        {draftSaveStatus !== 'idle' && (
          <div className={`mb-4 p-3 rounded-lg text-sm flex items-center justify-center transition-all duration-300 ${
            draftSaveStatus === 'saving' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
            draftSaveStatus === 'saved' ? 'bg-green-50 text-green-700 border border-green-200' :
            draftSaveStatus === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : ''
          }`}>
            <div className="flex items-center">
              {draftSaveStatus === 'saving' && (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span>Saving draft...</span>
                </>
              )}
              {draftSaveStatus === 'saved' && (
                <>
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-2 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>Draft saved automatically</span>
                </>
              )}
              {draftSaveStatus === 'error' && (
                <>
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-2 flex items-center justify-center">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <span>Failed to save draft</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Template/Draft Loaded Indicator */}
        {draftLoaded && step === 1 && (
          <div className="mb-4 p-3 rounded-lg text-sm bg-purple-50 text-purple-700 border border-purple-200 text-center">
            <span>
              {templateLoaded 
                ? `✨ Template "${formData.title}" loaded - customize as needed!`
                : '✨ Previous draft restored - you can continue where you left off!'
              }
            </span>
          </div>
        )}

        {/* Step Content */}
        <div className="card p-8">
          {step === 1 && (
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">What's Your Dream?</h1>
              <p className="text-gray-600 mb-8">Give your dream a name that excites you</p>
              
              <div className="text-left">
                <label className="label mb-2 block">Dream Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Epic European Adventure, Dream Home Down Payment"
                  className="input w-full text-lg"
                  autoFocus
                />
                <p className="text-sm text-gray-500 mt-2">Make it specific and exciting!</p>
              </div>

              <div className="mt-8 text-left">
                <label className="label mb-2 block">Description (optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell us more about this dream..."
                  className="input w-full h-24 resize-none"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Choose a Category</h2>
              <p className="text-gray-600 mb-8 text-center">This helps us give you better insights</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {CATEGORIES.map((category) => {
                  const Icon = category.icon
                  const isSelected = formData.category === category.value
                  
                  return (
                    <button
                      key={category.value}
                      onClick={() => setFormData({ ...formData, category: category.value })}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        isSelected 
                          ? `border-${category.color}-500 bg-${category.color}-50` 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start">
                        <Icon className={`w-6 h-6 mr-3 mt-1 ${
                          isSelected ? `text-${category.color}-600` : 'text-gray-400'
                        }`} />
                        <div>
                          <h3 className="font-semibold text-gray-900">{category.label}</h3>
                          <p className="text-sm text-gray-500">{category.description}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Dream Details</h2>
              <p className="text-gray-600 mb-8 text-center">When and how much?</p>
              
              <div className="space-y-6">
                <div>
                  <label className="label mb-2 block">Target Amount *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
                    <input
                      type="number"
                      value={formData.target_amount || ''}
                      onChange={(e) => setFormData({ ...formData, target_amount: parseFloat(e.target.value) || 0 })}
                      placeholder="50000"
                      className="input pl-8 text-lg"
                      min="1"
                      step="0.01"
                    />
                  </div>
                  {formData.target_amount > 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      That's {formatCurrency(formData.target_amount)} - awesome goal!
                    </p>
                  )}
                </div>

                <div>
                  <label className="label mb-2 block">Target Date *</label>
                  <input
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                    className="input text-lg"
                    min={format(new Date(), 'yyyy-MM-dd')}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    When do you want to achieve this dream?
                  </p>
                </div>

                {/* Real-time savings calculation display */}
                {savingsCalculations && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Savings Plan</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Daily</p>
                        <p className="text-xl font-bold text-blue-600">
                          ${savingsCalculations.balanced.dailyAmount}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Weekly</p>
                        <p className="text-xl font-bold text-blue-600">
                          ${savingsCalculations.balanced.weeklyAmount}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Monthly</p>
                        <p className="text-xl font-bold text-blue-600">
                          ${savingsCalculations.balanced.monthlyAmount}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-3 text-center">
                      Save consistently to reach your goal by {format(new Date(formData.target_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                )}

                <div>
                  <label className="label mb-2 block">Dream Image URL (optional)</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://example.com/my-dream-image.jpg"
                    className="input"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Add an inspiring image to visualize your dream
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Review Your Dream</h2>
              <p className="text-gray-600 mb-8 text-center">Choose your savings strategy and review the details</p>
              
              {/* Dream Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{formData.title}</h3>
                {formData.description && (
                  <p className="text-gray-600 mb-4">{formData.description}</p>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Category:</span>
                    <span className="ml-2 font-medium">
                      {CATEGORIES.find(c => c.value === formData.category)?.label}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Amount:</span>
                    <span className="ml-2 font-medium">{formatCurrency(formData.target_amount)}</span>
                  </div>
                </div>
              </div>

              {savingsCalculations && (
                <div className="space-y-8">
                  {/* Strategies Section */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Choose Your Savings Strategy</h3>
                    
                    {/* Strategy Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {Object.entries(savingsCalculations).filter(([key]) => key !== 'metadata').map(([key, strategy]) => (
                        <div
                          key={key}
                          className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedStrategy === key
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedStrategy(key)}
                        >
                          <div className="flex items-center mb-3">
                            <input
                              type="radio"
                              name="strategy"
                              value={key}
                              checked={selectedStrategy === key}
                              onChange={() => setSelectedStrategy(key)}
                              className="mr-3"
                            />
                            <div>
                              <h4 className="font-semibold text-gray-900">{strategy.name}</h4>
                              <p className="text-sm text-gray-600">{strategy.description}</p>
                            </div>
                          </div>
                          
                          <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
                            strategy.intensity === 'high' ? 'bg-red-400' :
                            strategy.intensity === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                          }`} title={`${strategy.intensity} intensity`}></div>
                        </div>
                      ))}
                    </div>

                    {/* Selected Strategy Breakdown */}
                    <SavingsBreakdown
                      amount={formData.target_amount}
                      targetDate={formData.target_date}
                      strategy={savingsCalculations[selectedStrategy]}
                    />
                  </div>

                  {/* Life Equivalents Section */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">What This Means in Daily Life</h3>
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
                      <p className="text-lg font-medium text-gray-900 mb-4">
                        Saving ${savingsCalculations[selectedStrategy].dailyAmount} per day is like:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {lifeEquivalents.slice(0, 4).map((equivalent, index) => (
                          <div key={index} className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                            <span className="text-gray-700">{equivalent.description}</span>
                          </div>
                        ))}
                      </div>
                      {lifeEquivalents.length > 4 && (
                        <p className="text-sm text-gray-600 mt-3">
                          Plus {lifeEquivalents.length - 4} more ways to save...
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Milestones Preview */}
                  {milestones && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Journey Milestones</h3>
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
                        <p className="text-gray-700 mb-4">Celebrate your progress along the way:</p>
                        <div className="space-y-4">
                          {milestones.milestones.slice(0, 3).map((milestone, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                                  {milestone.percentage}%
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    ${milestone.amount} saved
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {format(new Date(milestone.expectedDate), 'MMM dd, yyyy')}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-purple-600 font-medium">
                                  {milestone.celebrationMessage.split('!')[0]}!
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-sm text-gray-600 mt-4 text-center">
                          {milestones.milestones.length - 3} more milestones to celebrate your journey!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}
            </div>
          )}

          {step === 5 && createdDream && (
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-400 to-blue-500 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Dream Created! 🎉</h2>
              <p className="text-gray-600 mb-8">Here's how achievable your dream really is:</p>
              
              <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-6 rounded-lg mb-6">
                <div className="text-3xl font-bold mb-2">
                  ${createdDream.daily_amount.toFixed(2)} per day
                </div>
                <p className="text-lg">That's just {createdDream.comparisons.coffees.toFixed(1)} coffees!</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    ${createdDream.weekly_amount.toFixed(0)}
                  </div>
                  <div className="text-sm text-blue-700">per week</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    ${createdDream.monthly_amount.toFixed(0)}
                  </div>
                  <div className="text-sm text-purple-700">per month</div>
                </div>
              </div>

              <button
                onClick={() => onComplete()}
                className="btn-primary px-8 py-3 text-lg"
              >
                View My Dreams Dashboard
              </button>
            </div>
          )}

          {/* Navigation */}
          {step < 5 && (
            <div className="flex justify-between mt-8">
              <button
                onClick={handleBack}
                disabled={step === 1}
                className="btn-secondary px-6 py-2 disabled:opacity-50"
              >
                Back
              </button>
              
              {step < 4 ? (
                <button
                  onClick={handleNext}
                  disabled={
                    (step === 1 && !formData.title) ||
                    (step === 3 && (!formData.target_amount || !formData.target_date))
                  }
                  className="btn-primary px-6 py-2 disabled:opacity-50"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-primary px-6 py-2 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Dream'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
