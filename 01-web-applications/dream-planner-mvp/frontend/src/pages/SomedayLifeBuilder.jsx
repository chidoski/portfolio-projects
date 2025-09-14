import React, { useState, useEffect } from 'react';
import { FinancialProfile, UserProfile, NorthStarDream } from '../models/FinancialProfile.js';

const SomedayLifeBuilder = ({ onComplete, onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [financialProfile, setFinancialProfile] = useState(null);
  const [formData, setFormData] = useState({
    // Step 1: Dream Description
    dreamDescription: '',
    inspirationImages: [],
    selectedLocation: '',
    selectedHousingType: '',
    
    // Step 2: Lifestyle Selection
    selectedLifestyle: null,
    
    // Step 3: Basic Financial Info
    currentAge: '',
    incomeRange: '',
    selectedState: ''
  });
  const [yearsToSomeday, setYearsToSomeday] = useState(null);

  // Lifestyle examples with realistic cost data
  const lifestyleExamples = [
    {
      id: 'coastal-cottage',
      title: 'Maine Coastal Cottage',
      description: 'Charming seaside home with ocean views, local seafood, and peaceful mornings',
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
      propertyCost: { min: 350000, max: 500000 },
      annualExpenses: { min: 35000, max: 45000 },
      location: 'Maine Coast',
      housingType: 'cottage',
      highlights: ['Ocean views', 'Seafood markets', 'Art galleries', 'Hiking trails']
    },
    {
      id: 'mountain-cabin',
      title: 'Mountain Retreat Cabin',
      description: 'Rustic cabin surrounded by nature, hiking trails, and starlit skies',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
      propertyCost: { min: 250000, max: 400000 },
      annualExpenses: { min: 25000, max: 35000 },
      location: 'Mountain Region',
      housingType: 'cabin',
      highlights: ['Mountain views', 'Hiking trails', 'Wildlife', 'Stargazing']
    },
    {
      id: 'desert-modern',
      title: 'Desert Modern Home',
      description: 'Contemporary design in the Southwest with stunning sunsets and art scene',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      propertyCost: { min: 300000, max: 450000 },
      annualExpenses: { min: 30000, max: 40000 },
      location: 'Southwest Desert',
      housingType: 'modern',
      highlights: ['Desert views', 'Art scene', 'Outdoor living', 'Wellness culture']
    },
    {
      id: 'small-town-charm',
      title: 'Small Town Victorian',
      description: 'Historic home in a walkable community with local cafes and farmers markets',
      image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
      propertyCost: { min: 200000, max: 350000 },
      annualExpenses: { min: 28000, max: 38000 },
      location: 'Small Town',
      housingType: 'victorian',
      highlights: ['Walkable downtown', 'Community events', 'Local cafes', 'Farmers markets']
    },
    {
      id: 'lakefront-retreat',
      title: 'Lakefront Retreat',
      description: 'Peaceful lakeside living with water activities and natural beauty',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      propertyCost: { min: 280000, max: 420000 },
      annualExpenses: { min: 32000, max: 42000 },
      location: 'Lakefront',
      housingType: 'lakehouse',
      highlights: ['Water activities', 'Fishing', 'Peaceful mornings', 'Nature walks']
    },
    {
      id: 'urban-loft',
      title: 'Urban Creative Loft',
      description: 'City living with cultural attractions, walkability, and vibrant community',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      propertyCost: { min: 400000, max: 600000 },
      annualExpenses: { min: 45000, max: 60000 },
      location: 'Urban Center',
      housingType: 'loft',
      highlights: ['Cultural scene', 'Walkability', 'Restaurants', 'Public transit']
    }
  ];

  // Income ranges for comfortable selection
  const incomeRanges = [
    { value: '25000', label: 'Under $25K', midpoint: 20000 },
    { value: '50000', label: '$25K - $50K', midpoint: 37500 },
    { value: '75000', label: '$50K - $75K', midpoint: 62500 },
    { value: '100000', label: '$75K - $100K', midpoint: 87500 },
    { value: '125000', label: '$100K - $125K', midpoint: 112500 },
    { value: '150000', label: '$125K - $150K', midpoint: 137500 },
    { value: '200000', label: '$150K - $200K', midpoint: 175000 },
    { value: '250000', label: '$200K - $250K', midpoint: 225000 },
    { value: '300000', label: '$250K+', midpoint: 300000 }
  ];

  // US States for tax calculations
  const states = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
    'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
    'Wisconsin', 'Wyoming'
  ];

  // Load existing data from localStorage on component mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('financialProfile');
    if (savedProfile) {
      try {
        const profileData = JSON.parse(savedProfile);
        const profile = FinancialProfile.fromJSON(profileData);
        setFinancialProfile(profile);
        
        // Populate form data from saved profile
        if (profile.northStarDream) {
          setFormData(prev => ({
            ...prev,
            dreamDescription: profile.northStarDream.description || '',
            inspirationImages: profile.northStarDream.inspirationImages || [],
            selectedLocation: profile.northStarDream.location || '',
            selectedHousingType: profile.northStarDream.housingType || ''
          }));
        }
        
        if (profile.userProfile) {
          setFormData(prev => ({
            ...prev,
            currentAge: profile.userProfile.age || '',
            incomeRange: profile.userProfile.income?.gross?.annual || '',
            selectedState: profile.userProfile.location?.state || ''
          }));
        }
      } catch (error) {
        console.error('Error loading saved profile:', error);
      }
    }
  }, []);

  // Save to localStorage whenever financialProfile changes
  useEffect(() => {
    if (financialProfile) {
      localStorage.setItem('financialProfile', JSON.stringify(financialProfile.toJSON()));
    }
  }, [financialProfile]);

  // Calculate initial capacity based on basic inputs
  const calculateInitialCapacity = () => {
    if (!formData.currentAge || !formData.incomeRange || !formData.selectedState || !formData.selectedLifestyle) {
      return null;
    }

    const selectedIncomeRange = incomeRanges.find(range => range.value === formData.incomeRange);
    if (!selectedIncomeRange) return null;

    // Create a basic financial profile for calculation
    const userProfile = new UserProfile({
      age: parseInt(formData.currentAge),
      income: {
        gross: { annual: selectedIncomeRange.midpoint },
        net: { annual: selectedIncomeRange.midpoint * 0.78 }, // Rough after-tax estimate
        taxRate: getStateTaxRate(formData.selectedState)
      },
      location: { state: formData.selectedState }
    });

    const northStarDream = new NorthStarDream({
      description: formData.dreamDescription,
      targetAge: Math.max(parseInt(formData.currentAge) + 10, 65), // Default to at least 10 years or age 65
      propertyCost: (formData.selectedLifestyle.propertyCost.min + formData.selectedLifestyle.propertyCost.max) / 2,
      monthlyLivingExpenses: (formData.selectedLifestyle.annualExpenses.min + formData.selectedLifestyle.annualExpenses.max) / 2 / 12,
      location: formData.selectedLifestyle.location,
      housingType: formData.selectedLifestyle.housingType
    });

    // Create basic profile with conservative expense estimates
    const profile = new FinancialProfile({
      userProfile,
      northStarDream,
      fixedExpenses: {
        housing: { total: userProfile.getMonthlyNetIncome() * 0.3 }, // 30% of income
        transportation: { total: userProfile.getMonthlyNetIncome() * 0.15 }, // 15% of income
        insurance: { total: userProfile.getMonthlyNetIncome() * 0.05 }, // 5% of income
        other: { total: userProfile.getMonthlyNetIncome() * 0.1 } // 10% of income
      },
      variableExpenses: {
        food: userProfile.getMonthlyNetIncome() * 0.12,
        entertainment: userProfile.getMonthlyNetIncome() * 0.05,
        healthcare: userProfile.getMonthlyNetIncome() * 0.08,
        miscellaneous: userProfile.getMonthlyNetIncome() * 0.05
      }
    });

    const disposableIncome = profile.calculateDisposableIncome();
    const requiredNetWorth = northStarDream.calculateRequiredNetWorth();
    const monthlySavingsNeeded = northStarDream.calculateMonthlySavingsNeeded(0); // Assuming starting from 0

    // Calculate years to goal
    let yearsToGoal = 0;
    if (disposableIncome > 0 && monthlySavingsNeeded > 0) {
      if (disposableIncome >= monthlySavingsNeeded) {
        yearsToGoal = northStarDream.yearsToGoal;
      } else {
        // If current disposable income isn't enough, estimate longer timeline
        const savingsRatio = disposableIncome / monthlySavingsNeeded;
        yearsToGoal = Math.ceil(northStarDream.yearsToGoal / savingsRatio);
      }
    } else {
      yearsToGoal = 25; // Default conservative estimate
    }

    setFinancialProfile(profile);
    return yearsToGoal;
  };

  // Get estimated state tax rate (simplified)
  const getStateTaxRate = (state) => {
    const highTaxStates = ['California', 'New York', 'New Jersey', 'Connecticut', 'Hawaii'];
    const noTaxStates = ['Alaska', 'Florida', 'Nevada', 'New Hampshire', 'South Dakota', 'Tennessee', 'Texas', 'Washington', 'Wyoming'];
    
    if (noTaxStates.includes(state)) return 0.22; // Federal only
    if (highTaxStates.includes(state)) return 0.35; // Federal + high state
    return 0.28; // Federal + moderate state
  };

  // Handle form updates
  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle image upload (mock implementation)
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    // In a real app, you'd upload to a service and get URLs
    // For now, we'll create mock URLs
    const newImages = files.map((file, index) => 
      `https://images.unsplash.com/photo-${Date.now()}-${index}?w=400`
    );
    
    setFormData(prev => ({
      ...prev,
      inspirationImages: [...prev.inspirationImages, ...newImages]
    }));
  };

  // Remove inspiration image
  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      inspirationImages: prev.inspirationImages.filter((_, i) => i !== index)
    }));
  };

  // Handle lifestyle selection
  const selectLifestyle = (lifestyle) => {
    setFormData(prev => ({ ...prev, selectedLifestyle: lifestyle }));
  };

  // Navigation functions
  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle step 3 completion
  const completeStep3 = () => {
    const years = calculateInitialCapacity();
    setYearsToSomeday(years);
  };

  // Progress indicator component
  const ProgressIndicator = () => (
    <div className="mb-8">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Building Your Someday Life</h2>
        <p className="text-gray-600">Step {currentStep} of 3</p>
      </div>
      
      <div className="flex justify-center items-center space-x-4">
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center font-semibold
              transition-all duration-300 ${
                step === currentStep 
                  ? 'bg-blue-500 text-white scale-110' 
                  : step < currentStep 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
              }
            `}>
              {step < currentStep ? '✓' : step}
            </div>
            {step < 3 && (
              <div className={`
                w-16 h-1 transition-all duration-300 ${
                  step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                }
              `} />
            )}
          </React.Fragment>
        ))}
      </div>
      
      <div className="flex justify-center mt-2 text-sm text-gray-600">
        <div className="flex space-x-16">
          <span className={currentStep === 1 ? 'font-semibold text-blue-600' : ''}>Dream</span>
          <span className={currentStep === 2 ? 'font-semibold text-blue-600' : ''}>Explore</span>
          <span className={currentStep === 3 ? 'font-semibold text-blue-600' : ''}>Reality</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <ProgressIndicator />
        
        {/* Step 1: Dream Capture */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">Envision Your Someday Life</h3>
              <p className="text-lg text-gray-600">
                Let's start by capturing your vision of the perfect life when work becomes optional.
              </p>
            </div>

            {/* Dream Description */}
            <div className="mb-8">
              <label className="block text-xl font-semibold text-gray-700 mb-4">
                Describe your ideal everyday life when work becomes optional
              </label>
              <textarea
                value={formData.dreamDescription}
                onChange={(e) => updateFormData('dreamDescription', e.target.value)}
                placeholder="Imagine waking up without an alarm... What does your perfect day look like? Where are you? What are you doing? Who are you with? Paint us a picture of your someday life..."
                className="w-full h-40 p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none text-gray-700 leading-relaxed"
              />
              <p className="text-sm text-gray-500 mt-2">
                {formData.dreamDescription.length}/500 characters
              </p>
            </div>

            {/* Image Gallery */}
            <div className="mb-8">
              <label className="block text-xl font-semibold text-gray-700 mb-4">
                Add inspiration images
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="text-gray-500">
                    <svg className="mx-auto h-12 w-12 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="text-lg">Click to upload inspiration images</p>
                    <p className="text-sm">or drag and drop</p>
                  </div>
                </label>
              </div>

              {/* Display uploaded images */}
              {formData.inspirationImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.inspirationImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Inspiration ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Location and Housing Selectors */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-xl font-semibold text-gray-700 mb-4">
                  Preferred location type
                </label>
                <select
                  value={formData.selectedLocation}
                  onChange={(e) => updateFormData('selectedLocation', e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select location type...</option>
                  <option value="coastal">Coastal/Beach</option>
                  <option value="mountain">Mountain/Forest</option>
                  <option value="desert">Desert/Southwest</option>
                  <option value="small-town">Small Town</option>
                  <option value="lakefront">Lakefront</option>
                  <option value="urban">Urban/City</option>
                  <option value="rural">Rural/Countryside</option>
                  <option value="suburb">Suburban</option>
                </select>
              </div>

              <div>
                <label className="block text-xl font-semibold text-gray-700 mb-4">
                  Housing style preference
                </label>
                <select
                  value={formData.selectedHousingType}
                  onChange={(e) => updateFormData('selectedHousingType', e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select housing style...</option>
                  <option value="cottage">Cottage/Cozy</option>
                  <option value="cabin">Cabin/Rustic</option>
                  <option value="modern">Modern/Contemporary</option>
                  <option value="victorian">Victorian/Historic</option>
                  <option value="ranch">Ranch/Single Story</option>
                  <option value="loft">Loft/Industrial</option>
                  <option value="farmhouse">Farmhouse/Country</option>
                  <option value="condo">Condo/Low Maintenance</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={nextStep}
                disabled={!formData.dreamDescription.trim()}
                className="px-8 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Continue to Examples →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Lifestyle Examples */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">Explore Similar Lifestyles</h3>
              <p className="text-lg text-gray-600">
                Here are some real examples of lifestyles similar to your vision, with actual costs.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {lifestyleExamples.map((lifestyle) => (
                <div
                  key={lifestyle.id}
                  onClick={() => selectLifestyle(lifestyle)}
                  className={`
                    cursor-pointer rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105
                    ${formData.selectedLifestyle?.id === lifestyle.id 
                      ? 'ring-4 ring-blue-500 shadow-xl' 
                      : 'shadow-lg hover:shadow-xl'
                    }
                  `}
                >
                  <div className="relative">
                    <img
                      src={lifestyle.image}
                      alt={lifestyle.title}
                      className="w-full h-48 object-cover"
                    />
                    {formData.selectedLifestyle?.id === lifestyle.id && (
                      <div className="absolute top-4 right-4 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                        ✓
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h4 className="text-xl font-bold text-gray-800 mb-2">{lifestyle.title}</h4>
                    <p className="text-gray-600 mb-4 text-sm">{lifestyle.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Property Cost:</span>
                        <span className="text-sm font-bold text-green-600">
                          ${lifestyle.propertyCost.min.toLocaleString()} - ${lifestyle.propertyCost.max.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Annual Living:</span>
                        <span className="text-sm font-bold text-blue-600">
                          ${lifestyle.annualExpenses.min.toLocaleString()} - ${lifestyle.annualExpenses.max.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {lifestyle.highlights.map((highlight, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {formData.selectedLifestyle && (
              <div className="bg-blue-50 rounded-xl p-6 mb-6">
                <h4 className="text-lg font-semibold text-blue-800 mb-2">
                  Selected: {formData.selectedLifestyle.title}
                </h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-blue-700">Estimated Property Cost:</span>
                    <div className="text-blue-600">
                      ${((formData.selectedLifestyle.propertyCost.min + formData.selectedLifestyle.propertyCost.max) / 2).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Monthly Living Expenses:</span>
                    <div className="text-blue-600">
                      ${Math.round(((formData.selectedLifestyle.annualExpenses.min + formData.selectedLifestyle.annualExpenses.max) / 2) / 12).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                ← Back to Dream
              </button>
              <button
                onClick={nextStep}
                disabled={!formData.selectedLifestyle}
                className="px-8 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Continue to Reality Check →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Financial Reality */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">Let's Get Real (Gently)</h3>
              <p className="text-lg text-gray-600">
                Just three quick numbers to see where you stand. We'll find ways to optimize together!
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Current Age */}
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  Your current age
                </label>
                <input
                  type="number"
                  value={formData.currentAge}
                  onChange={(e) => updateFormData('currentAge', e.target.value)}
                  placeholder="35"
                  min="18"
                  max="80"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-center text-lg"
                />
              </div>

              {/* Income Range */}
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  Approximate income range
                </label>
                <select
                  value={formData.incomeRange}
                  onChange={(e) => updateFormData('incomeRange', e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select range...</option>
                  {incomeRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* State */}
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  Your state
                </label>
                <select
                  value={formData.selectedState}
                  onChange={(e) => updateFormData('selectedState', e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select state...</option>
                  {states.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Calculate Button */}
            <div className="text-center mb-8">
              <button
                onClick={completeStep3}
                disabled={!formData.currentAge || !formData.incomeRange || !formData.selectedState}
                className="px-12 py-4 bg-green-500 text-white rounded-xl font-semibold text-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Calculate My Someday Timeline
              </button>
            </div>

            {/* Results */}
            {yearsToSomeday !== null && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8 text-center">
                <h4 className="text-2xl font-bold text-gray-800 mb-4">
                  Your Preliminary Timeline
                </h4>
                
                <div className="text-6xl font-bold text-blue-600 mb-4">
                  {yearsToSomeday}
                </div>
                <div className="text-xl text-gray-700 mb-6">
                  Years to Your Someday Life
                </div>
                
                <div className="bg-white rounded-lg p-6 mb-6">
                  <div className="grid md:grid-cols-2 gap-4 text-left">
                    <div>
                      <span className="font-medium text-gray-700">Target Age:</span>
                      <div className="text-lg text-blue-600">
                        {parseInt(formData.currentAge) + yearsToSomeday} years old
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Estimated Target Date:</span>
                      <div className="text-lg text-blue-600">
                        {new Date(new Date().getFullYear() + yearsToSomeday, new Date().getMonth()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 font-medium">
                    💡 This is just a starting point - we'll find ways to optimize this together.
                  </p>
                  <p className="text-yellow-700 text-sm mt-2">
                    There are many strategies to accelerate your timeline, reduce costs, and make your someday life more achievable than you think!
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              <button
                onClick={prevStep}
                className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                ← Back to Examples
              </button>
              
              {yearsToSomeday !== null && (
                <button
                  onClick={() => {
                    if (onComplete) {
                      onComplete();
                    }
                  }}
                  className="px-8 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-colors"
                >
                  Let's Optimize This! →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SomedayLifeBuilder;
