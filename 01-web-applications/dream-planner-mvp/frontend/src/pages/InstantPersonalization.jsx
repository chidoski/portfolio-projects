import React, { useState, useEffect, useRef } from 'react';
import { Calculator, Mail, Check, ArrowRight, DollarSign, Calendar, Target, Zap, Download, Sparkles } from 'lucide-react';
import { calculateSavingsStrategies, calculateMilestones, convertToLifeEquivalents } from '../services/dreamCalculations';
import { perfectNumberForDemo, perfectDemoCalculation } from '../services/demoDataPerfection';
import ThreeBucketDisplay from '../components/ThreeBucketDisplay';
import ProgressBar from '../components/ProgressBar';
import { format, addYears, addMonths } from 'date-fns';

/**
 * InstantPersonalization Component
 * Transforms CEOs from passive viewers to active participants
 * A hands-on experience where they see their own financial future mapped out instantly
 */

// Pre-defined dream suggestions for quick selection
const DREAM_SUGGESTIONS = [
  { title: 'Mediterranean Yacht Purchase', cost: 500000, icon: '🛥️', category: 'lifestyle' },
  { title: 'Silicon Valley Investment Property', cost: 800000, icon: '🏠', category: 'investment' },
  { title: 'Early Retirement at 50', cost: 1200000, icon: '🏖️', category: 'freedom' },
  { title: 'Children\'s Ivy League Education', cost: 300000, icon: '🎓', category: 'family' },
  { title: 'Tech Startup Investment Fund', cost: 2000000, icon: '🚀', category: 'business' },
  { title: 'European Vineyard Acquisition', cost: 750000, icon: '🍷', category: 'lifestyle' },
  { title: 'Family Foundation Endowment', cost: 1000000, icon: '❤️', category: 'legacy' },
  { title: 'Private Jet Ownership', cost: 600000, icon: '✈️', category: 'convenience' }
];

// Age-appropriate default monthly savings suggestions
const SAVINGS_SUGGESTIONS = {
  30: [3000, 5000, 8000, 12000],
  35: [4000, 7000, 10000, 15000],
  40: [5000, 8000, 12000, 18000],
  45: [6000, 10000, 15000, 25000],
  50: [8000, 12000, 20000, 30000],
  55: [10000, 15000, 25000, 40000]
};

const InstantPersonalization = ({ onComplete, onBack }) => {
  // Form state
  const [step, setStep] = useState(1); // 1: Input, 2: Results, 3: Email
  const [formData, setFormData] = useState({
    age: '',
    dreamTitle: '',
    dreamCost: '',
    monthlySavings: '',
    email: '',
    name: ''
  });
  
  // Calculation state
  const [calculations, setCalculations] = useState(null);
  const [bucketAllocation, setBucketAllocation] = useState(null);
  const [milestones, setMilestones] = useState(null);
  const [lifeEquivalents, setLifeEquivalents] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Animation state
  const [animationProgress, setAnimationProgress] = useState(0);
  const resultsRef = useRef(null);

  // Validate form step 1
  const isStep1Valid = formData.age && formData.dreamTitle && formData.dreamCost && formData.monthlySavings;

  // Get age-appropriate savings suggestions
  const getSavingsSuggestions = (age) => {
    const ageGroup = Math.floor(parseInt(age) / 5) * 5;
    const nearestAge = Math.min(Math.max(ageGroup, 30), 55);
    return SAVINGS_SUGGESTIONS[nearestAge] || SAVINGS_SUGGESTIONS[45];
  };

  // Handle dream suggestion selection
  const selectDreamSuggestion = (dream) => {
    setFormData(prev => ({
      ...prev,
      dreamTitle: dream.title,
      dreamCost: dream.cost.toString()
    }));
  };

  // Handle savings suggestion selection
  const selectSavingsSuggestion = (amount) => {
    setFormData(prev => ({
      ...prev,
      monthlySavings: amount.toString()
    }));
  };

  // Calculate personalized plan
  const calculatePersonalizedPlan = async () => {
    if (!isStep1Valid) return;

    setIsCalculating(true);
    setAnimationProgress(0);

    // Simulate calculation time for dramatic effect
    const progressInterval = setInterval(() => {
      setAnimationProgress(prev => Math.min(prev + 10, 90));
    }, 100);

    try {
      // Perfect the numbers for presentation
      const dreamAmount = parseInt(formData.dreamCost);
      const monthlyCapacity = parseInt(formData.monthlySavings);
      const currentAge = parseInt(formData.age);
      
      // Calculate target timeline (aim for 5-15 year range)
      const idealTimeframe = Math.max(5, Math.min(15, Math.ceil(dreamAmount / (monthlyCapacity * 12))));
      const targetDate = addYears(new Date(), idealTimeframe);
      
      // Use perfect demo calculation for clean numbers
      const perfectCalc = perfectDemoCalculation(dreamAmount, targetDate, 'balanced');
      
      // Calculate three-bucket allocation
      const foundationPercent = 45; // Retirement security
      const dreamPercent = Math.round((perfectCalc.monthly / monthlyCapacity) * 100);
      const lifePercent = 100 - foundationPercent - dreamPercent;
      
      const buckets = {
        monthlyCapacity: monthlyCapacity,
        foundation: {
          monthlyAmount: Math.round(monthlyCapacity * foundationPercent / 100),
          percentage: foundationPercent,
          purpose: 'Retirement Security & Long-term Wealth',
          projectedValue: `$${((monthlyCapacity * foundationPercent / 100) * 12 * (65 - currentAge) * 1.5 / 1000000).toFixed(1)}M by retirement`
        },
        dream: {
          monthlyAmount: perfectCalc.monthly,
          percentage: dreamPercent,
          purpose: 'Your Dream Goal',
          projectedValue: `${formData.dreamTitle} achieved in ${idealTimeframe} years`
        },
        life: {
          monthlyAmount: monthlyCapacity - Math.round(monthlyCapacity * foundationPercent / 100) - perfectCalc.monthly,
          percentage: lifePercent,
          purpose: 'Life Surprises & Opportunities',
          projectedValue: `$${(monthlyCapacity * lifePercent / 100 * 12 * 3 / 1000).toFixed(0)}k emergency buffer in 3 years`
        }
      };

      // Calculate milestones for the dream
      const dreamMilestones = calculateMilestones(dreamAmount, new Date(), targetDate);
      
      // Calculate life equivalents for daily amount
      const dailyAmount = perfectCalc.daily;
      const equivalents = convertToLifeEquivalents(dailyAmount).slice(0, 3);

      setTimeout(() => {
        clearInterval(progressInterval);
        setAnimationProgress(100);
        
        setCalculations(perfectCalc);
        setBucketAllocation(buckets);
        setMilestones(dreamMilestones);
        setLifeEquivalents(equivalents);
        
        setTimeout(() => {
          setIsCalculating(false);
          setShowResults(true);
          setStep(2);
        }, 500);
      }, 1500); // Total 2.5 seconds for dramatic effect

    } catch (error) {
      console.error('Calculation error:', error);
      setIsCalculating(false);
    }
  };

  // Handle email plan
  const handleEmailPlan = () => {
    if (!formData.email || !formData.name) return;

    // Save to localStorage for demo purposes
    const planData = {
      personalInfo: {
        name: formData.name,
        email: formData.email,
        age: formData.age
      },
      dream: {
        title: formData.dreamTitle,
        cost: formData.dreamCost
      },
      monthlyCapacity: formData.monthlySavings,
      calculations,
      buckets: bucketAllocation,
      milestones,
      lifeEquivalents,
      generatedAt: new Date().toISOString(),
      planType: 'CEO Instant Personalization'
    };

    localStorage.setItem('dreamPlannerCEOPlan', JSON.stringify(planData));
    localStorage.setItem('dreamPlannerCEOEmail', formData.email);
    
    setEmailSent(true);
    setStep(3);
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

  // Render Step 1: Input Form
  const renderInputForm = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calculator className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Try Dream Planner Yourself
        </h1>
        <p className="text-xl text-gray-600">
          See your personalized financial roadmap in under 60 seconds
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
        {/* Age Input */}
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-3">
            Your Age
          </label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
            className="w-full text-2xl font-bold text-center border-2 border-gray-300 rounded-xl p-4 focus:border-blue-500 focus:outline-none transition-colors"
            placeholder="45"
            min="25"
            max="65"
          />
        </div>

        {/* Dream Selection */}
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-3">
            One Specific Dream
          </label>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {DREAM_SUGGESTIONS.slice(0, 6).map((dream, index) => (
              <button
                key={index}
                onClick={() => selectDreamSuggestion(dream)}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  formData.dreamTitle === dream.title
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{dream.icon}</span>
                  <div>
                    <div className="font-medium text-sm">{dream.title}</div>
                    <div className="text-xs text-gray-500">{formatCurrency(dream.cost)}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              value={formData.dreamTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, dreamTitle: e.target.value }))}
              className="border-2 border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:outline-none"
              placeholder="Or enter your own dream"
            />
            <input
              type="number"
              value={formData.dreamCost}
              onChange={(e) => setFormData(prev => ({ ...prev, dreamCost: e.target.value }))}
              className="border-2 border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:outline-none"
              placeholder="Rough cost ($)"
            />
          </div>
        </div>

        {/* Monthly Savings Capacity */}
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-3">
            Monthly Savings Capacity
          </label>
          {formData.age && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {getSavingsSuggestions(formData.age).map((amount, index) => (
                <button
                  key={index}
                  onClick={() => selectSavingsSuggestion(amount)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.monthlySavings === amount.toString()
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-bold text-green-600">{formatCurrency(amount)}</div>
                  <div className="text-xs text-gray-500">per month</div>
                </button>
              ))}
            </div>
          )}
          
          <input
            type="number"
            value={formData.monthlySavings}
            onChange={(e) => setFormData(prev => ({ ...prev, monthlySavings: e.target.value }))}
            className="w-full text-xl font-bold text-center border-2 border-gray-300 rounded-xl p-4 focus:border-green-500 focus:outline-none transition-colors"
            placeholder="Enter monthly amount"
          />
        </div>

        {/* Continue Button */}
        <button
          onClick={calculatePersonalizedPlan}
          disabled={!isStep1Valid || isCalculating}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
            isStep1Valid && !isCalculating
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transform hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isCalculating ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Calculating your perfect plan...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Show Me My Plan</span>
            </div>
          )}
        </button>
      </div>

      {/* Calculation Progress */}
      {isCalculating && (
        <div className="mt-6 bg-white rounded-xl p-6 shadow-lg">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Creating Your Personalized Plan
            </h3>
          </div>
          <ProgressBar percentage={animationProgress} showPercentage={true} />
          <div className="mt-4 text-sm text-gray-600 text-center">
            {animationProgress < 30 && "Analyzing your financial profile..."}
            {animationProgress >= 30 && animationProgress < 60 && "Optimizing three-bucket allocation..."}
            {animationProgress >= 60 && animationProgress < 90 && "Calculating milestone timeline..."}
            {animationProgress >= 90 && "Finalizing your dream roadmap..."}
          </div>
        </div>
      )}
    </div>
  );

  // Render Step 2: Results
  const renderResults = () => (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Sparkles className="w-8 h-8 text-purple-500" />
          <h1 className="text-4xl font-bold text-gray-800">Your Personalized Plan</h1>
          <Sparkles className="w-8 h-8 text-purple-500" />
        </div>
        <p className="text-xl text-gray-600">
          Here's how to achieve <strong>{formData.dreamTitle}</strong> while securing your financial future
        </p>
      </div>

      {/* Key Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
          <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-3" />
          <div className="text-3xl font-bold text-green-600 mb-2">
            {formatCurrency(calculations.daily)}
          </div>
          <div className="text-gray-600">per day to achieve your dream</div>
          <div className="text-sm text-gray-500 mt-2">
            {calculations.timeline} timeline
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
          <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-3" />
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {format(new Date(calculations.adjustedTargetDate), 'MMM yyyy')}
          </div>
          <div className="text-gray-600">dream achievement date</div>
          <div className="text-sm text-gray-500 mt-2">
            You'll be {parseInt(formData.age) + parseInt(calculations.timeline.split(' ')[0])} years old
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
          <Target className="w-8 h-8 text-purple-500 mx-auto mb-3" />
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {bucketAllocation.foundation.projectedValue}
          </div>
          <div className="text-gray-600">retirement security</div>
          <div className="text-sm text-gray-500 mt-2">
            While achieving your dream
          </div>
        </div>
      </div>

      {/* Three-Bucket Visualization */}
      <div className="bg-white rounded-2xl p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Your Three-Bucket Allocation
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Foundation Bucket */}
          <div className="bg-blue-50 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-2xl">🏛️</span>
            </div>
            <h3 className="text-xl font-bold text-blue-700 mb-2">Foundation</h3>
            <p className="text-blue-600 mb-4">{bucketAllocation.foundation.purpose}</p>
            <div className="bg-white rounded-lg p-4">
              <p className="text-2xl font-bold text-blue-700">
                {formatCurrency(bucketAllocation.foundation.monthlyAmount)}
              </p>
              <p className="text-sm text-blue-600">per month ({bucketAllocation.foundation.percentage}%)</p>
              <p className="text-xs text-gray-500 mt-2">{bucketAllocation.foundation.projectedValue}</p>
            </div>
          </div>

          {/* Dream Bucket */}
          <div className="bg-purple-50 rounded-xl p-6 text-center border-2 border-purple-200">
            <div className="w-16 h-16 bg-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-2xl">✨</span>
            </div>
            <h3 className="text-xl font-bold text-purple-700 mb-2">Dream</h3>
            <p className="text-purple-600 mb-4">{bucketAllocation.dream.purpose}</p>
            <div className="bg-white rounded-lg p-4">
              <p className="text-2xl font-bold text-purple-700">
                {formatCurrency(bucketAllocation.dream.monthlyAmount)}
              </p>
              <p className="text-sm text-purple-600">per month ({bucketAllocation.dream.percentage}%)</p>
              <p className="text-xs text-gray-500 mt-2">{bucketAllocation.dream.projectedValue}</p>
            </div>
          </div>

          {/* Life Bucket */}
          <div className="bg-green-50 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-2xl">🎯</span>
            </div>
            <h3 className="text-xl font-bold text-green-700 mb-2">Life</h3>
            <p className="text-green-600 mb-4">{bucketAllocation.life.purpose}</p>
            <div className="bg-white rounded-lg p-4">
              <p className="text-2xl font-bold text-green-700">
                {formatCurrency(bucketAllocation.life.monthlyAmount)}
              </p>
              <p className="text-sm text-green-600">per month ({bucketAllocation.life.percentage}%)</p>
              <p className="text-xs text-gray-500 mt-2">{bucketAllocation.life.projectedValue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Life Equivalents */}
      <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          What {formatCurrency(calculations.daily)} per day looks like
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {lifeEquivalents.map((equivalent, index) => (
            <div key={index} className="bg-white rounded-xl p-6 text-center shadow-md">
              <div className="text-4xl mb-3">
                {equivalent.type === 'daily' && '☕'}
                {equivalent.type === 'weekly' && '🍽️'}
                {equivalent.type === 'monthly' && '🎬'}
                {equivalent.type === 'multiple' && '🛒'}
                {equivalent.type === 'combination' && '🎯'}
              </div>
              <p className="text-gray-700 font-medium">{equivalent.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Milestones Timeline */}
      <div className="bg-white rounded-2xl p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Your Milestone Celebrations
        </h2>
        <div className="space-y-4">
          {milestones.milestones.slice(0, 4).map((milestone, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {milestone.percentage}%
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800">
                  {formatCurrency(milestone.amount)} milestone
                </div>
                <div className="text-sm text-gray-600">
                  Expected: {format(new Date(milestone.expectedDate), 'MMMM yyyy')}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-purple-600">
                  {milestone.celebrationMessage}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center space-y-4">
        <button
          onClick={() => setStep(3)}
          className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-xl"
        >
          <div className="flex items-center space-x-2">
            <Mail className="w-5 h-5" />
            <span>Email Me This Plan</span>
          </div>
        </button>
        
        <p className="text-sm text-gray-500">
          Get your personalized roadmap sent to your inbox
        </p>
      </div>
    </div>
  );

  // Render Step 3: Email Capture
  const renderEmailCapture = () => (
    <div className="max-w-2xl mx-auto">
      {!emailSent ? (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Get Your Personalized Plan
            </h2>
            <p className="text-gray-600">
              We'll send your complete financial roadmap to your email
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:outline-none"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:outline-none"
                placeholder="your@email.com"
              />
            </div>

            <button
              onClick={handleEmailPlan}
              disabled={!formData.email || !formData.name}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                formData.email && formData.name
                  ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Download className="w-5 h-5" />
                <span>Send My Plan</span>
              </div>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Plan Saved Successfully!
          </h2>
          
          <p className="text-gray-600 mb-6">
            Your personalized financial roadmap has been saved. In a real app, this would be emailed to <strong>{formData.email}</strong>.
          </p>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-700">
              <strong>Demo Note:</strong> Your plan has been saved to localStorage and would normally trigger an email with your complete roadmap, milestone reminders, and next steps.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => {
                // Reset form for another demo
                setFormData({
                  age: '',
                  dreamTitle: '',
                  dreamCost: '',
                  monthlySavings: '',
                  email: '',
                  name: ''
                });
                setStep(1);
                setEmailSent(false);
                setShowResults(false);
                setCalculations(null);
              }}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors mr-4"
            >
              Try Another Plan
            </button>
            
            {onComplete && (
              <button
                onClick={onComplete}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Continue Demo
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8 px-4">
      {/* Progress Indicator */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= stepNum 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-400'
              }`}>
                {stepNum}
              </div>
              {stepNum < 3 && (
                <div className={`w-16 h-1 ${
                  step > stepNum ? 'bg-blue-500' : 'bg-gray-200'
                }`}></div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center space-x-20 mt-2 text-sm text-gray-600">
          <span>Input</span>
          <span>Results</span>
          <span>Email</span>
        </div>
      </div>

      {/* Content */}
      <div className="transition-all duration-500">
        {step === 1 && renderInputForm()}
        {step === 2 && renderResults()}
        {step === 3 && renderEmailCapture()}
      </div>

      {/* Back Button */}
      {onBack && step === 1 && (
        <div className="fixed bottom-8 left-8">
          <button
            onClick={onBack}
            className="bg-white text-gray-600 px-6 py-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
          >
            ← Back to Demo
          </button>
        </div>
      )}
    </div>
  );
};

export default InstantPersonalization;
