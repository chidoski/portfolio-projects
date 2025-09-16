import React, { useState, useEffect, useMemo } from 'react';
import { FinancialProfile, UserProfile, NorthStarDream } from '../models/FinancialProfile.js';
import { dreamTemplates } from '../data/dreamTemplates.js';
import { DreamService } from '../services/dreamService';
import { X, Tag, DollarSign, Clock, Sparkles, Calculator, TrendingUp } from 'lucide-react';
import { getSomedayBuilderContent } from '../utils/adaptiveContent';
import { findCareerProfile, calculateIncomeProjection, suggestCareerStage } from '../data/careerProfiles.js';
import AIInsight, { AIConfidenceBadge, AIDataBadge } from '../components/AIInsight';

console.log('SomedayLifeBuilder loaded successfully');

const SomedayLifeBuilder = ({ onComplete, onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [financialProfile, setFinancialProfile] = useState(null);
  const [formData, setFormData] = useState({
    // Step 1: Dream Description
    dreamDescription: '',
    inspirationImages: [],
    selectedLocation: '',
    selectedHousingType: '',
    
    // Step 2: Lifestyle Selection (now includes annual spending)
    selectedLifestyle: null,
    annualSpending: {
      basicLiving: '',      // Core living expenses (housing, utilities, groceries, insurance)
      hobbiesInterests: '', // Recreation, entertainment, personal interests
      travelExperiences: '', // Travel, dining out, special experiences
      healthWellness: '',   // Healthcare, fitness, wellness activities
      familyGiving: '',     // Family support, charitable giving, gifts
      emergencyBuffer: ''   // Unexpected expenses, inflation protection
    },
    
    // Step 3: Financial Reality & Career Info
    currentAge: '',
    incomeRange: '',
    selectedState: '',
    
    // Career trajectory for income acceleration
    occupation: '',
    jobTitle: '',
    yearsInRole: '',
    yearsInField: '', // New field for total years in field
    careerStage: '', // New field for career stage
    industry: '',
    careerGrowthExpectation: '',
    
    // Assets and their Someday Life role
    currentAssets: [],
    
    // Debts and payoff timeline
    currentDebts: []
  });
  const [yearsToSomeday, setYearsToSomeday] = useState(null);
  const [calculationError, setCalculationError] = useState(null);
  const [templateData, setTemplateData] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredTemplate, setHoveredTemplate] = useState(null);
  const [showNearTermGoalMessage, setShowNearTermGoalMessage] = useState(false);
  const [selectedNearTermTemplate, setSelectedNearTermTemplate] = useState(null);
  const [useIncomeRange, setUseIncomeRange] = useState(false);
  const [preliminaryInsight, setPreliminaryInsight] = useState(null);
  const [calculationStage, setCalculationStage] = useState('ready'); // 'ready', 'analyzing', 'comparing', 'optimizing', 'complete'
  const [seasonalView, setSeasonalView] = useState({}); // Track season view for each lifestyle
  const [selectedForComparison, setSelectedForComparison] = useState([]); // Track items selected for comparison
  const [showComparison, setShowComparison] = useState(false);
  const [expandedLifestyle, setExpandedLifestyle] = useState(null); // Track which lifestyle is expanded for details

  // Lifestyle examples with specific locations and realistic cost data
  const lifestyleExamples = [
    {
      id: 'coastal-cottage',
      title: 'Camden Coastal Cottage',
      description: 'Charming seaside home with weathered shingles, ocean views, and peaceful mornings',
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80&auto=format&fit=crop', // Authentic Maine coastal cottage
      propertyCost: { min: 350000, max: 500000 },
      annualExpenses: { min: 35000, max: 45000 },
      location: 'coastal',
      specificLocation: 'Camden, Maine',
      drivingDistance: '2 hours from Boston, 3.5 hours from NYC',
      housingType: 'cottage',
      highlights: ['Ocean views', 'Seafood markets', 'Art galleries', 'Hiking trails'],
      locationDetails: 'Picturesque harbor town with working lobster boats and mountain backdrop',
      climateInfo: {
        winter: 'Cold winters (20-40°F), snow common, cozy fireplace season',
        summer: 'Pleasant summers (60-75°F), perfect for outdoor activities'
      },
      seasonalImages: {
        summer: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80&auto=format&fit=crop',
        winter: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80&auto=format&fit=crop'
      },
      practicalDetails: {
        hospital: 'MaineGeneral Medical Center - 15 min',
        airport: 'Portland International - 45 min',
        grocery: 'Village Market - 5 min walk',
        culture: 'Summer art festivals, year-round galleries'
      },
      dayInLife: 'Your typical Tuesday: Morning coffee on the deck watching lobster boats return with their catch, leisurely walk to the village bakery for fresh blueberry muffins, afternoon painting in your studio with ocean views, evening reading by the fireplace while listening to waves crash against the rocks.',
      successRate: {
        low: { rate: 45, factors: ['Consistent saving', 'Modest cottage choice', 'Seasonal income planning'] },
        medium: { rate: 73, factors: ['Consistent saving', 'Downsizing before moving', 'Modest cottage choice'] },
        high: { rate: 89, factors: ['Strategic planning', 'Multiple income streams', 'Premium location flexibility'] }
      }
    },
    {
      id: 'mountain-cabin',
      title: 'Asheville Mountain Cabin',
      description: 'Rustic cabin nestled in the Blue Ridge Mountains with hiking trails and starlit skies',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80&auto=format&fit=crop', // Authentic mountain cabin with mountain views
      propertyCost: { min: 250000, max: 400000 },
      annualExpenses: { min: 25000, max: 35000 },
      location: 'mountain',
      specificLocation: 'Asheville, North Carolina',
      drivingDistance: '4 hours from Atlanta, 5 hours from Washington DC',
      housingType: 'cabin',
      highlights: ['Mountain views', 'Hiking trails', 'Wildlife', 'Stargazing'],
      locationDetails: 'Arts hub surrounded by Blue Ridge Mountains and craft breweries',
      climateInfo: {
        winter: 'Mild winters (30-50°F), occasional snow, perfect for cozy cabin life',
        summer: 'Warm summers (65-80°F), ideal hiking weather'
      },
      seasonalImages: {
        summer: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80&auto=format&fit=crop',
        winter: 'https://images.unsplash.com/photo-1548777123-8c5b61ccde8b?w=800&q=80&auto=format&fit=crop'
      },
      practicalDetails: {
        hospital: 'Mission Hospital - 20 min',
        airport: 'Asheville Regional - 25 min',
        grocery: 'Ingles Market - 10 min drive',
        culture: 'Live music venues, year-round festivals'
      },
      dayInLife: 'Your typical Tuesday: Dawn hiking on the Blue Ridge Parkway as mist rises from the valleys, breakfast on your cabin porch listening to songbirds, afternoon exploring local craft breweries and galleries in downtown Asheville, evening stargazing from your deck with mountain silence surrounding you.',
      successRate: {
        low: { rate: 62, factors: ['Consistent saving', 'Simple cabin choice', 'Mountain climate preparation'] },
        medium: { rate: 81, factors: ['Steady savings plan', 'Downsizing preparation', 'Local area research'] },
        high: { rate: 94, factors: ['Multi-year planning', 'Mountain lifestyle preparation', 'Flexible location within region'] }
      }
    },
    {
      id: 'desert-modern',
      title: 'Sedona Modern Home',
      description: 'Contemporary design among red rocks with stunning sunsets and vibrant art scene',
      image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80&auto=format&fit=crop', // Authentic Sedona modern home with red rocks
      propertyCost: { min: 300000, max: 450000 },
      annualExpenses: { min: 30000, max: 40000 },
      location: 'desert',
      specificLocation: 'Sedona, Arizona',
      drivingDistance: '2 hours from Phoenix, 4.5 hours from Las Vegas',
      housingType: 'modern',
      highlights: ['Red rock views', 'Art scene', 'Outdoor living', 'Wellness culture'],
      locationDetails: 'Mystical red rock formations with world-class spas and galleries',
      climateInfo: {
        winter: 'Perfect winters (45-65°F), ideal for hiking and outdoor activities',
        summer: 'Hot summers (75-95°F), pool and early morning activities'
      },
      seasonalImages: {
        summer: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80&auto=format&fit=crop',
        winter: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80&auto=format&fit=crop'
      },
      practicalDetails: {
        hospital: 'Verde Valley Medical Center - 12 min',
        airport: 'Flagstaff Pulliam - 1 hour',
        grocery: 'Whole Foods Market - 8 min drive',
        culture: 'Art galleries, spiritual retreats, music festivals'
      },
      dayInLife: 'Your typical Tuesday: Sunrise meditation on your terrace overlooking red rocks, morning swim in your pool as the desert awakens, afternoon browsing world-class art galleries in Tlaquepaque, evening dining al fresco while watching the rocks glow golden in the sunset.',
      successRate: {
        low: { rate: 38, factors: ['Desert climate adaptation', 'Consistent saving', 'Simple home choice'] },
        medium: { rate: 67, factors: ['Multi-year planning', 'Climate preparation', 'Healthcare considerations'] },
        high: { rate: 87, factors: ['Comprehensive planning', 'Desert lifestyle research', 'Premium location flexibility'] }
      }
    },
    {
      id: 'small-town-charm',
      title: 'Woodstock Victorian',
      description: 'Historic home in a walkable community with local cafes and farmers markets',
      image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80&auto=format&fit=crop', // Authentic Victorian house
      propertyCost: { min: 200000, max: 350000 },
      annualExpenses: { min: 28000, max: 38000 },
      location: 'rural',
      specificLocation: 'Woodstock, Vermont',
      drivingDistance: '2.5 hours from Boston, 4 hours from NYC',
      housingType: 'victorian',
      highlights: ['Walkable downtown', 'Community events', 'Local cafes', 'Farmers markets'],
      locationDetails: 'Quintessential New England town with covered bridges and mountain views',
      climateInfo: {
        winter: 'Snowy winters (10-30°F), perfect for cozy Victorian charm',
        summer: 'Pleasant summers (55-75°F), ideal for outdoor festivals'
      },
      seasonalImages: {
        summer: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80&auto=format&fit=crop',
        winter: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80&auto=format&fit=crop'
      },
      practicalDetails: {
        hospital: 'Mt. Ascutney Hospital - 18 min',
        airport: 'Lebanon Municipal - 45 min',
        grocery: 'Woodstock Farmers Market - 3 min walk',
        culture: 'Year-round festivals, local theater, artisan shops'
      },
      dayInLife: 'Your typical Tuesday: Morning stroll through the village green past the covered bridge, coffee and conversation at the local café with neighbors, afternoon browsing antique shops and galleries, evening concert at the town bandstand while fireflies dance in your Victorian garden.',
      successRate: {
        low: { rate: 58, factors: ['Winter preparation', 'Consistent saving', 'Small town lifestyle research'] },
        medium: { rate: 79, factors: ['New England climate planning', 'Community integration preparation', 'Historic home maintenance budget'] },
        high: { rate: 92, factors: ['Comprehensive lifestyle planning', 'Victorian home expertise', 'Community involvement preparation'] }
      }
    },
    {
      id: 'lakefront-retreat',
      title: 'Lake Champlain Retreat',
      description: 'Peaceful lakeside living with water activities and natural beauty',
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80&auto=format&fit=crop', // Authentic lakefront retreat
      propertyCost: { min: 280000, max: 420000 },
      annualExpenses: { min: 32000, max: 42000 },
      location: 'rural',
      specificLocation: 'Burlington, Vermont',
      drivingDistance: '5 hours from Boston, 6 hours from NYC',
      housingType: 'lakehouse',
      highlights: ['Water activities', 'Fishing', 'Peaceful mornings', 'Nature walks'],
      locationDetails: 'Crystal clear lake between Vermont Green Mountains and Adirondacks',
      climateInfo: {
        winter: 'Cold winters (15-35°F), lake may freeze for ice activities',
        summer: 'Warm summers (60-80°F), perfect for water activities'
      },
      seasonalImages: {
        summer: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80&auto=format&fit=crop',
        winter: 'https://images.unsplash.com/photo-1548777123-8c5b61ccde8b?w=800&q=80&auto=format&fit=crop'
      },
      practicalDetails: {
        hospital: 'UVM Medical Center - 25 min',
        airport: 'Burlington International - 30 min',
        grocery: 'City Market - 15 min drive',
        culture: 'Lakeside concerts, Burlington arts scene nearby'
      },
      dayInLife: 'Your typical Tuesday: Early morning kayaking as mist rises from the lake, breakfast on your dock watching loons dive for fish, afternoon reading in your lakeside hammock, evening barbecue on the deck while watching the sunset paint the mountains across the water.',
      successRate: {
        low: { rate: 52, factors: ['Lake lifestyle preparation', 'Seasonal planning', 'Consistent saving'] },
        medium: { rate: 76, factors: ['Waterfront property research', 'Four-season preparation', 'Lake community integration'] },
        high: { rate: 91, factors: ['Comprehensive lakefront planning', 'Multi-season lifestyle design', 'Premium location flexibility'] }
      }
    },
    {
      id: 'urban-loft',
      title: 'Portland Creative Loft',
      description: 'City living with cultural attractions, walkability, and vibrant food scene',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80&auto=format&fit=crop', // Authentic urban loft
      propertyCost: { min: 400000, max: 600000 },
      annualExpenses: { min: 45000, max: 60000 },
      location: 'urban',
      specificLocation: 'Portland, Oregon',
      drivingDistance: '1.5 hours from Seattle, 10 hours from San Francisco',
      housingType: 'loft',
      highlights: ['Cultural scene', 'Walkability', 'Food trucks', 'Public transit'],
      locationDetails: 'Quirky city known for craft beer, food scene, and outdoor access',
      climateInfo: {
        winter: 'Mild, rainy winters (35-50°F), perfect for cozy indoor culture',
        summer: 'Dry, warm summers (65-80°F), ideal for outdoor markets and festivals'
      },
      seasonalImages: {
        summer: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80&auto=format&fit=crop',
        winter: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80&auto=format&fit=crop'
      },
      practicalDetails: {
        hospital: 'OHSU Hospital - 15 min',
        airport: 'Portland International - 25 min',
        grocery: 'New Seasons Market - 2 blocks',
        culture: 'Food trucks, craft breweries, live music venues'
      },
      dayInLife: 'Your typical Tuesday: Morning yoga on your rooftop with city views, walk to the neighborhood coffee roaster for your daily cup, afternoon exploring the latest food truck pod, evening at a local brewery listening to live music while planning weekend adventures to the coast or mountains.',
      successRate: {
        low: { rate: 41, factors: ['Urban cost planning', 'Consistent saving', 'Neighborhood research'] },
        medium: { rate: 69, factors: ['Portland market research', 'Urban lifestyle planning', 'Transportation considerations'] },
        high: { rate: 86, factors: ['Comprehensive urban planning', 'Premium neighborhood flexibility', 'Multi-income strategy'] }
      }
    }
  ];

  // Income ranges for comfortable selection
  const incomeRanges = [
    { value: '50000', label: '$0-50k', midpoint: 25000 },
    { value: '75000', label: '$50-75k', midpoint: 62500 },
    { value: '100000', label: '$75-100k', midpoint: 87500 },
    { value: '125000', label: '$100-125k', midpoint: 112500 },
    { value: '150000', label: '$125-150k', midpoint: 137500 },
    { value: '200000', label: '$150-200k', midpoint: 175000 },
    { value: '250000', label: '$200k+', midpoint: 250000 }
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

  // Industries for salary benchmarking and career projections
  const industries = [
    'Technology',
    'Healthcare',
    'Finance & Banking',
    'Education',
    'Government',
    'Manufacturing',
    'Retail',
    'Real Estate',
    'Legal',
    'Marketing & Advertising',
    'Construction',
    'Transportation',
    'Hospitality & Tourism',
    'Non-profit',
    'Media & Entertainment',
    'Consulting',
    'Energy & Utilities',
    'Agriculture',
    'Other'
  ];

  // Career growth expectations for income acceleration planning
  const careerGrowthOptions = [
    { value: 'steady_growth', label: 'Steady Growth', description: '3-5% annual increases, gradual advancement' },
    { value: 'major_promotion', label: 'Major Promotion Expected', description: 'Significant role change within 2-3 years' },
    { value: 'career_change', label: 'Career Change Planned', description: 'Switching fields or starting business' },
    { value: 'nearing_retirement', label: 'Nearing Retirement', description: 'Winding down, limited growth expected' },
    { value: 'peak_earnings', label: 'Peak Earnings Phase', description: 'At or near career income ceiling' },
    { value: 'early_career', label: 'Early Career', description: 'Rapid growth potential ahead' }
  ];

  // Lifestyle Cost Estimator - Intelligent defaults based on lifestyle and location
  const getLifestyleCostEstimates = (lifestyle, userState = '') => {
    if (!lifestyle) return null;
    
    const baseEstimates = {
      'coastal-cottage': {
        name: 'Maine Coastal Cottage Life',
        basicLiving: 30000,  // Utilities, food, insurance, property taxes
        healthWellness: 12000, // Healthcare (pre-Medicare), fitness
        hobbiesInterests: 5000, // Art supplies, classes, creative pursuits
        travelExperiences: 8000, // Travel to see family, experiences
        familyGiving: 3000,     // Gifts, support
        emergencyBuffer: 4000,  // Unexpected expenses, inflation protection
        total: 62000,
        details: {
          basicLiving: 'Higher utilities (heating oil), groceries, homeowners insurance, property taxes',
          healthWellness: 'Healthcare without employer coverage, Maine rural access considerations',
          hobbiesInterests: 'Art supplies, photography equipment, local classes and workshops',
          travelExperiences: 'Visits to family, local dining, seasonal activities',
          familyGiving: 'Gifts for grandchildren, charitable giving',
          emergencyBuffer: 'Home maintenance, weather-related repairs, inflation protection'
        }
      },
      'mountain-cabin': {
        name: 'Asheville Mountain Cabin Life',
        basicLiving: 25000,
        healthWellness: 10000,
        hobbiesInterests: 4000,
        travelExperiences: 7000,
        familyGiving: 3000,
        emergencyBuffer: 3500,
        total: 52500,
        details: {
          basicLiving: 'Lower cost of living, seasonal heating, mountain property maintenance',
          healthWellness: 'Good healthcare access in Asheville, outdoor fitness opportunities',
          hobbiesInterests: 'Hiking gear, crafts, local music and arts scene',
          travelExperiences: 'Mountain activities, regional travel, brewery tours',
          familyGiving: 'Family visits, community involvement',
          emergencyBuffer: 'Weather events, mountain property challenges'
        }
      },
      'desert-modern': {
        name: 'Sedona Desert Modern Life',
        basicLiving: 28000,
        healthWellness: 11000,
        hobbiesInterests: 6000,
        travelExperiences: 9000,
        familyGiving: 3500,
        emergencyBuffer: 4000,
        total: 61500,
        details: {
          basicLiving: 'Higher cooling costs, desert landscaping, HOA fees',
          healthWellness: 'Excellent healthcare access, wellness retreats, spa treatments',
          hobbiesInterests: 'Photography, spiritual pursuits, art galleries, workshops',
          travelExperiences: 'Desert adventures, fine dining, cultural events',
          familyGiving: 'Hosting family visits, spiritual giving',
          emergencyBuffer: 'Pool maintenance, desert home upkeep, extreme weather'
        }
      },
      'small-town-charm': {
        name: 'Vermont Small Town Life',
        basicLiving: 26000,
        healthWellness: 9000,
        hobbiesInterests: 3500,
        travelExperiences: 6000,
        familyGiving: 2500,
        emergencyBuffer: 3000,
        total: 50000,
        details: {
          basicLiving: 'Lower cost of living, efficient small home, community resources',
          healthWellness: 'Rural healthcare access, community wellness programs',
          hobbiesInterests: 'Community activities, gardening, local crafts',
          travelExperiences: 'Regional travel, local festivals, simple pleasures',
          familyGiving: 'Community involvement, family support',
          emergencyBuffer: 'Victorian home maintenance, winter preparation'
        }
      },
      'lakefront-retreat': {
        name: 'Lake Champlain Retreat Life',
        basicLiving: 28000,
        healthWellness: 10000,
        hobbiesInterests: 4500,
        travelExperiences: 7500,
        familyGiving: 3000,
        emergencyBuffer: 4000,
        total: 57000,
        details: {
          basicLiving: 'Lakefront property taxes, utilities, boat maintenance',
          healthWellness: 'Excellent healthcare in Burlington, water activities',
          hobbiesInterests: 'Boating, fishing, water sports, nature photography',
          travelExperiences: 'Lake region exploration, seasonal activities',
          familyGiving: 'Hosting family at lake house, community support',
          emergencyBuffer: 'Dock maintenance, seasonal property care, weather events'
        }
      },
      'urban-loft': {
        name: 'Portland Creative Loft Life',
        basicLiving: 35000,
        healthWellness: 11000,
        hobbiesInterests: 6000,
        travelExperiences: 10000,
        familyGiving: 4000,
        emergencyBuffer: 4000,
        total: 70000,
        details: {
          basicLiving: 'Urban costs, HOA fees, higher utilities, food scene',
          healthWellness: 'Excellent urban healthcare, fitness facilities, alternative wellness',
          hobbiesInterests: 'Arts scene, classes, creative supplies, cultural activities',
          travelExperiences: 'Urban dining, entertainment, regional adventures',
          familyGiving: 'Urban gift costs, cultural giving, family visits',
          emergencyBuffer: 'Urban living unexpected costs, building maintenance'
        }
      }
    };
    
    return baseEstimates[lifestyle.id] || null;
  };

  // Function to apply state-based cost adjustments
  const applyStateCostAdjustments = (estimates, state) => {
    if (!estimates || !state) return estimates;
    
    // Cost of living adjustments by state (multiplier)
    const stateCostMultipliers = {
      'California': 1.3,
      'New York': 1.25,
      'Massachusetts': 1.2,
      'Connecticut': 1.18,
      'New Jersey': 1.15,
      'Maryland': 1.1,
      'Washington': 1.08,
      'Colorado': 1.05,
      'Vermont': 1.02,
      'Maine': 1.0,
      'North Carolina': 0.95,
      'Arizona': 0.98,
      'Oregon': 1.03,
      'Georgia': 0.92,
      'Texas': 0.95,
      'Florida': 0.96,
      'Tennessee': 0.90,
      'Ohio': 0.88,
      'Michigan': 0.87,
      'Indiana': 0.85
    };
    
    const multiplier = stateCostMultipliers[state] || 1.0;
    
    if (multiplier === 1.0) return estimates;
    
    const adjusted = { ...estimates };
    adjusted.basicLiving = Math.round(estimates.basicLiving * multiplier);
    adjusted.healthWellness = Math.round(estimates.healthWellness * multiplier);
    adjusted.hobbiesInterests = Math.round(estimates.hobbiesInterests * multiplier);
    adjusted.travelExperiences = Math.round(estimates.travelExperiences * multiplier);
    adjusted.familyGiving = Math.round(estimates.familyGiving * multiplier);
    adjusted.emergencyBuffer = Math.round(estimates.emergencyBuffer * multiplier);
    adjusted.total = adjusted.basicLiving + adjusted.healthWellness + adjusted.hobbiesInterests + 
                    adjusted.travelExperiences + adjusted.familyGiving + adjusted.emergencyBuffer;
    
    return adjusted;
  };

  // Validation function for age calculations
  const validateAgeCalculations = () => {
    const testCases = [
      { currentAge: 35, timelineYears: 15, expected: 50 },
      { currentAge: 45, timelineYears: 10, expected: 55 },
      { currentAge: 25, timelineYears: 20, expected: 45 }
    ];
    
    testCases.forEach(test => {
      const result = parseInt(test.currentAge) + Math.ceil(test.timelineYears);
      if (result !== test.expected) {
        console.error('Age calculation failed:', test, 'Got:', result);
      } else {
        console.log('Age calculation test passed:', test);
      }
    });
  };

  // Clear all form data and previous session data when component mounts
  useEffect(() => {
    console.log('🏠 Initializing Someday Life Builder (Retirement Lifestyle Planning)');
    console.log('📊 This tool is separate from regular savings goals and focuses on complete financial independence');
    
    // Run validation tests during development
    validateAgeCalculations();
    
    // Clear localStorage items related to dreams, preferences, and session data
    const keysToRemove = [
      'somedayDream',
      'dreamCosts',
      'somedayCalculationResults',
      'financialProfile',
      'dreamPreferences',
      'sessionData',
      'userPreferences',
      'dreamDescription',
      'inspirationImages',
      'selectedLocation',
      'selectedHousingType',
      'selectedLifestyle',
      'currentAge',
      'incomeRange',
      'selectedState',
      'preferredLocation',
      'housingStyle'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Reset form data to initial clean state
    setFormData({
      dreamDescription: '',
      inspirationImages: [],
      selectedLocation: '',
      selectedHousingType: '',
      selectedLifestyle: null,
      annualSpending: {
        basicLiving: '',
        hobbiesInterests: '',
        travelExperiences: '',
        healthWellness: '',
        familyGiving: '',
        emergencyBuffer: ''
      },
      currentAge: '',
      incomeRange: '',
      selectedState: '',
      occupation: '',
      jobTitle: '',
      yearsInRole: '',
      industry: '',
      careerGrowthExpectation: '',
      currentAssets: [],
      currentDebts: []
    });
    
    // Reset other state variables
    setYearsToSomeday(null);
    setCalculationError(null);
    setTemplateData(null);
    setFinancialProfile(null);
    setUseIncomeRange(false);
    
  }, []); // Empty dependency array ensures this runs only on mount

  // Handle URL parameters and template data on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const templateParam = urlParams.get('template');
    const stepParam = urlParams.get('step');
    const dreamParam = urlParams.get('dream');
    
    if (templateParam) {
      try {
        const template = JSON.parse(decodeURIComponent(templateParam));
        setTemplateData(template);
        
        // Pre-populate form data with template information
        setFormData(prev => ({
          ...prev,
          dreamDescription: template.description || '',
          selectedLocation: getCategoryLocation(template.category),
          selectedHousingType: getCategoryHousingType(template.category)
        }));
        
        console.log('Template data loaded:', template);
      } catch (error) {
        console.error('Error parsing template data:', error);
      }
    }
    
    // Handle dream context from minimal landing page
    if (dreamParam) {
      const dreamContexts = {
        'beach-house': {
          description: 'A beautiful oceanfront house with stunning views',
          location: 'Coastal area',
          housingType: 'Single-family home'
        },
        'mountain-cabin': {
          description: 'A peaceful mountain retreat surrounded by nature',
          location: 'Mountain region',
          housingType: 'Cabin'
        },
        'city-apartment': {
          description: 'A modern urban apartment in the heart of the city',
          location: 'Urban area',
          housingType: 'Apartment/Condo'
        }
      };

      const dreamContext = dreamContexts[dreamParam];
      if (dreamContext) {
        setFormData(prev => ({
          ...prev,
          dreamDescription: dreamContext.description,
          selectedLocation: dreamContext.location,
          selectedHousingType: dreamContext.housingType
        }));
      }
    }

    // Handle step parameter
    if (stepParam && parseInt(stepParam) >= 1 && parseInt(stepParam) <= 4) {
      setCurrentStep(parseInt(stepParam));
    }
  }, []);

  // Load saved financial profile
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('financialProfile');
      const profileData = savedProfile ? JSON.parse(savedProfile) : null;
      
      // Add defensive data handling before creating FinancialProfile
      let profile;
      if (profileData) {
        // Ensure fixedExpenses exists and is properly structured
        if (!profileData.fixedExpenses) {
          profileData.fixedExpenses = {};
        }
        // Ensure other required properties exist
        if (!profileData.financialObligations) {
          profileData.financialObligations = { debts: [] };
        }
        if (!profileData.currentAssets) {
          profileData.currentAssets = {};
        }
        
        profile = FinancialProfile.createSafe(profileData);
      } else {
        profile = FinancialProfile.createSafe();
      }
      
      setFinancialProfile(profile);
      
      // Populate form data from saved profile (only if no template data)
      if (!templateData && profile.northStarDream) {
        setFormData(prev => ({
          ...prev,
          dreamDescription: profile.northStarDream.description || '',
          inspirationImages: profile.northStarDream.inspirationImages || [],
          selectedLocation: profile.northStarDream.location || '',
          selectedHousingType: profile.northStarDream.housingType || ''
        }));
      }

      if (!templateData && profile.userProfile) {
        setFormData(prev => ({
          ...prev,
          currentAge: profile.userProfile.age || '',
          incomeRange: profile.userProfile.income?.gross?.annual?.toString() || '',
          selectedState: profile.userProfile.location?.state || ''
        }));
      }
    } catch (error) {
      console.error('Error loading saved profile:', error);
      // If there's an error loading, create a minimal valid profile as fallback
      try {
        const fallbackProfile = FinancialProfile.createSafe({
          fixedExpenses: {},
          financialObligations: { debts: [] },
          currentAssets: {}
        });
        setFinancialProfile(fallbackProfile);
      } catch (fallbackError) {
        console.error('Even fallback profile creation failed:', fallbackError);
        // Last resort - create empty profile with absolute minimal data
        setFinancialProfile({
          userProfile: { income: { gross: { annual: 0 } } },
          fixedExpenses: { totalFixedExpenses: 0 },
          financialObligations: { debts: [], totalDebtAmount: 0 },
          currentAssets: { totalAssets: 0 },
          northStarDream: { title: 'My Dream' }
        });
      }
    }
  }, [templateData]);

  const getCategoryLocation = (category) => {
    const locationMap = {
      'Travel': 'coastal',
      'Financial Security': 'suburban',
      'Life Events': 'urban',
      'Transportation': 'suburban',
      'Home Improvement': 'suburban',
      'Business': 'urban'
    };
    return locationMap[category] || 'suburban';
  };

  const getCategoryHousingType = (category) => {
    const housingMap = {
      'Travel': 'modern',
      'Financial Security': 'ranch',
      'Life Events': 'modern',
      'Transportation': 'ranch',
      'Home Improvement': 'farmhouse',
      'Business': 'loft'
    };
    return housingMap[category] || 'modern';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatIncomeInput = (value) => {
    // Remove all non-digits
    const numericValue = value.replace(/\D/g, '');
    // Add commas
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Dedicated function to calculate achievement age and timeline
  const calculateAchievementAge = (currentAge, dreamAmount, annualIncome) => {
    const age = parseInt(currentAge);
    const income = parseFloat(annualIncome.toString().replace(/,/g, ''));
    
    if (!age || !income || age <= 0 || income <= 0) {
      return { yearsNeeded: 0, achievementAge: 0, monthlyRequired: 0, isValid: false };
    }
    
    const netIncome = income * 0.78; // After taxes
    const savingsRate = 0.15; // 15% savings rate
    const annualSavings = netIncome * savingsRate;
    const yearsNeeded = Math.ceil(dreamAmount / annualSavings);
    const achievementAge = age + yearsNeeded;
    const monthlyRequired = annualSavings / 12;
    
    // Validation - ensure achievement age is greater than current age
    const isValid = achievementAge > age;
    
    // Only log if this is a significantly different calculation (reduce spam)
    const shouldLog = !calculateAchievementAge.lastLog || 
      Math.abs(calculateAchievementAge.lastLog.age - age) > 0 ||
      Math.abs(calculateAchievementAge.lastLog.dreamAmount - dreamAmount) > 1000 ||
      Math.abs(calculateAchievementAge.lastLog.income - income) > 5000;
    
    if (shouldLog) {
      console.log('calculateAchievementAge:', {
        currentAge: age,
        dreamAmount,
        annualIncome: income,
        yearsNeeded,
        achievementAge,
        monthlyRequired: Math.round(monthlyRequired),
        isValid
      });
      
      // Store last logged values
      calculateAchievementAge.lastLog = { age, dreamAmount, income };
    }
    
    return {
      yearsNeeded,
      achievementAge,
      monthlyRequired: Math.round(monthlyRequired),
      isValid
    };
  };

  // Memoized calculation for the main form to prevent spam
  const memoizedMainCalculation = useMemo(() => {
    if (!formData.selectedLifestyle || !formData.currentAge) {
      return { yearsNeeded: 0, achievementAge: 0, monthlyRequired: 0, isValid: false };
    }

    const income = useIncomeRange 
      ? (incomeRanges.find(range => range.value === formData.incomeRange)?.midpoint || 0)
      : parseFloat(formData.incomeRange.toString().replace(/,/g, '')) || 0;
    const averageCost = (formData.selectedLifestyle.propertyCost.min + formData.selectedLifestyle.propertyCost.max) / 2;
    
    return calculateAchievementAge(formData.currentAge, averageCost, income);
  }, [formData.currentAge, formData.selectedLifestyle, formData.incomeRange, useIncomeRange]);

  // Handle income input change with formatting
  const handleIncomeChange = (e) => {
    const value = e.target.value;
    const formattedValue = formatIncomeInput(value);
    const numericValue = value.replace(/\D/g, '');
    
    // Store the numeric value for calculations
    updateFormData('incomeRange', numericValue);
    
    // Update the display value
    e.target.value = formattedValue;
    
    // Generate preliminary insight after state update
    setTimeout(() => {
      if (numericValue && formData.currentAge && formData.selectedLifestyle) {
        generatePreliminaryInsightWithValues(numericValue, formData.currentAge, formData.selectedLifestyle);
      }
    }, 100);
  };

  const handleSwitchToRangeMode = () => {
    setUseIncomeRange(true);
    // Clear the exact income field when switching to range mode
    updateFormData('incomeRange', '');
  };

  const handleSwitchToExactMode = () => {
    setUseIncomeRange(false);
    // Clear the range selection when switching to exact mode
    updateFormData('incomeRange', '');
  };

  const updateFormData = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Lifestyle matching algorithm
  const calculateLifestyleMatch = (lifestyle, userPreferences) => {
    let score = 0;
    
    // Location match (50 points)
    if (userPreferences.selectedLocation) {
      const locationMap = {
        'coastal': ['coastal'],
        'mountain': ['mountain'],
        'rural': ['rural'],
        'suburban': ['rural'], // Suburban maps to rural options
        'urban': ['urban'],
        'desert': ['desert']
      };
      
      const matchingLocations = locationMap[userPreferences.selectedLocation] || [];
      if (matchingLocations.includes(lifestyle.location)) {
        score += 50;
      }
    }
    
    // Housing style match (30 points)
    if (userPreferences.selectedHousingType && lifestyle.housingType === userPreferences.selectedHousingType) {
      score += 30;
    }
    
    // Price range compatibility (20 points) - based on estimated income
    if (userPreferences.incomeRange) {
      const income = useIncomeRange 
        ? (incomeRanges.find(range => range.value === userPreferences.incomeRange)?.midpoint || 0)
        : parseFloat(userPreferences.incomeRange.toString().replace(/,/g, '')) || 0;
      
      if (income > 0) {
        // Calculate affordability - assume 25% of net income can go to property/housing
        const netIncome = income * 0.78; // After taxes
        const maxAffordablePropertyCost = netIncome * 0.25 * 10; // 10x annual housing budget for property
        
        const lifestyleMaxCost = lifestyle.propertyCost.max;
        if (lifestyleMaxCost <= maxAffordablePropertyCost) {
          score += 20;
        } else if (lifestyleMaxCost <= maxAffordablePropertyCost * 1.2) {
          // Slight stretch but possible
          score += 10;
        }
      }
    }
    
    return score;
  };
  
  // Location intelligence - compare user's current state to lifestyle location
  const getLocationContext = (lifestyle, userState) => {
    if (!userState) return null;
    
    const stateClimateMap = {
      'Georgia': { climate: 'hot humid summers, mild winters', region: 'Southeast' },
      'Texas': { climate: 'hot summers, mild winters', region: 'South' },
      'Florida': { climate: 'hot humid year-round', region: 'Southeast' },
      'California': { climate: 'mediterranean, dry summers', region: 'West' },
      'New York': { climate: 'cold winters, warm summers', region: 'Northeast' },
      'Maine': { climate: 'cold winters, cool summers', region: 'Northeast' },
      'Colorado': { climate: 'dry, cold winters, mild summers', region: 'Mountain West' },
      'Arizona': { climate: 'hot dry summers, mild winters', region: 'Southwest' },
      'Vermont': { climate: 'cold snowy winters, pleasant summers', region: 'Northeast' },
      'Oregon': { climate: 'rainy winters, dry summers', region: 'Pacific Northwest' },
      'North Carolina': { climate: 'humid summers, mild winters', region: 'Southeast' }
    };
    
    const currentClimate = stateClimateMap[userState];
    if (!currentClimate) return null;
    
    const contextMap = {
      'Camden, Maine': {
        'Georgia': 'Significant climate change - much cooler summers (20°F difference), snowy winters vs. mild Georgia winters',
        'Texas': 'Major climate shift - cool summers vs. hot Texas heat, prepare for real winter with snow',
        'Florida': 'Complete climate transformation - from year-round warmth to cold snowy winters, but beautiful cool summers',
        'California': 'Different climate pattern - more seasonal variation, colder winters, similar pleasant summers',
        'Arizona': 'Opposite climate - from desert heat to coastal cool, prepare for humidity and winter snow'
      },
      'Asheville, North Carolina': {
        'Georgia': 'Similar to North Georgia mountains but with more dramatic elevation and cooler temperatures',
        'Texas': 'Much cooler and more humid than most of Texas, with actual seasonal changes',
        'Florida': 'Significant improvement in summer comfort - cooler, less humid, with beautiful fall colors',
        'California': 'More humidity and precipitation than most of California, but similar pleasant temperatures',
        'Arizona': 'Complete opposite - from dry desert to lush mountains with regular rainfall'
      },
      'Sedona, Arizona': {
        'Georgia': 'Much drier climate - no humidity, hot summers but low moisture, mild winters',
        'Texas': 'Similar heat but much drier - no humidity, different landscape with red rocks',
        'Florida': 'Complete opposite - from humid to bone dry, prepare for desert lifestyle',
        'California': 'Similar to Southern California desert - dry heat, beautiful winters',
        'Maine': 'Dramatic change - from cold snowy winters to mild desert winters, hot dry summers'
      },
      'Woodstock, Vermont': {
        'Georgia': 'Much colder winters with significant snow, but similar pleasant summers',
        'Texas': 'Major climate change - real winter with snow and cold, much cooler summers',
        'Florida': 'Complete seasonal shift - from no winter to snowy New England winters',
        'California': 'More seasonal variation, colder winters, similar summer temperatures'
      },
      'Burlington, Vermont': {
        'Georgia': 'Colder climate overall - snowy winters, cool summers, but beautiful lake setting',
        'Texas': 'Significant change - prepare for long cold winters and mild summers',
        'Florida': 'Major adjustment - from subtropical to northern climate with frozen lakes in winter'
      },
      'Portland, Oregon': {
        'Georgia': 'Less humid summers, rainy winters instead of snow, similar temperatures but different patterns',
        'Texas': 'Cooler and much wetter - prepare for rainy season instead of hot dry periods',
        'Florida': 'Cooler year-round, dry summers vs. humid, rainy winters vs. dry winters',
        'California': 'Similar to Northern California - rainy winters, dry summers, but cooler overall'
      }
    };
    
    return contextMap[lifestyle.specificLocation]?.[userState] || null;
  };
  
  // Get success rate based on income level
  const getSuccessRate = (lifestyle, income) => {
    if (!income) return lifestyle.successRate.medium;
    
    if (income < 60000) return lifestyle.successRate.low;
    if (income < 120000) return lifestyle.successRate.medium;
    return lifestyle.successRate.high;
  };

  // Get ranked lifestyle options
  const getRankedLifestyleOptions = () => {
    if (!formData.selectedLocation && !formData.selectedHousingType && !formData.incomeRange) {
      // If no preferences set, return original order
      return lifestyleExamples.map((lifestyle, index) => ({ 
        ...lifestyle, 
        matchScore: 0,
        rank: 'other',
        originalIndex: index
      }));
    }
    
    const scoredOptions = lifestyleExamples.map((lifestyle, index) => ({
      ...lifestyle,
      matchScore: calculateLifestyleMatch(lifestyle, formData),
      originalIndex: index
    }));
    
    // Sort by score (highest first), then by original index for stability
    const sorted = scoredOptions.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return a.originalIndex - b.originalIndex;
    });
    
    // Assign ranks
    return sorted.map((lifestyle, index) => ({
      ...lifestyle,
      rank: index === 0 ? 'best' : index <= 2 ? 'great' : 'other'
    }));
  };

  const generatePreliminaryInsight = () => {
    // Basic insight generation without partner complexity
    if (!formData.currentAge || !formData.incomeRange || !formData.selectedLifestyle) {
      setPreliminaryInsight(null);
      return;
    }

    // Use memoized calculation instead of direct call
    const calculation = memoizedMainCalculation;
    
    if (calculation.isValid && calculation.achievementAge > parseInt(formData.currentAge)) {
      setPreliminaryInsight({
        yearsToTarget: calculation.yearsNeeded,
        targetAge: calculation.achievementAge,
        totalIncome: income.toLocaleString(),
        dreamName: formData.selectedLifestyle.title,
        monthlyRequired: calculation.monthlyRequired
      });
    } else {
      console.error('Invalid age calculation:', { 
        currentAge: formData.currentAge, 
        achievementAge: calculation.achievementAge,
        income 
      });
      // Show fallback message for impossible ages
      setPreliminaryInsight({
        yearsToTarget: 0,
        targetAge: 0,
        totalIncome: income.toLocaleString(),
        dreamName: formData.selectedLifestyle.title,
        isCalculating: true
      });
    }
  };

  const generatePreliminaryInsightWithValues = (incomeValue, ageValue, lifestyle) => {
    // Direct insight generation with specific values
    const averageCost = (lifestyle.propertyCost.min + lifestyle.propertyCost.max) / 2;
    
    // Call the function directly but reduce logging spam by adding a debounce-like check
    const calculation = calculateAchievementAge(ageValue, averageCost, incomeValue);
    
    if (calculation.isValid && calculation.achievementAge > parseInt(ageValue)) {
      setPreliminaryInsight({
        yearsToTarget: calculation.yearsNeeded,
        targetAge: calculation.achievementAge,
        totalIncome: parseFloat(incomeValue.toString().replace(/,/g, '')).toLocaleString(),
        dreamName: lifestyle.title,
        monthlyRequired: calculation.monthlyRequired
      });
    } else {
      console.error('Invalid age calculation:', { 
        currentAge: ageValue, 
        achievementAge: calculation.achievementAge,
        income: incomeValue 
      });
      // Show fallback message for impossible ages
      setPreliminaryInsight({
        yearsToTarget: 0,
        targetAge: 0,
        totalIncome: parseFloat(incomeValue.toString().replace(/,/g, '')).toLocaleString(),
        dreamName: lifestyle.title,
        isCalculating: true
      });
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const handleLifestyleSelect = (lifestyle) => {
    updateFormData('selectedLifestyle', lifestyle);
    // Use the direct values approach to ensure immediate update
    setTimeout(() => {
      if (formData.incomeRange && formData.currentAge) {
        const income = useIncomeRange 
          ? (incomeRanges.find(range => range.value === formData.incomeRange)?.midpoint || 0)
          : parseFloat(formData.incomeRange.toString().replace(/,/g, '')) || 0;
        generatePreliminaryInsightWithValues(income, formData.currentAge, lifestyle);
      }
    }, 100);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file, index) => 
      `https://images.unsplash.com/photo-${Date.now()}-${index}?w=400`
    );
    
    setFormData(prev => ({
      ...prev,
      inspirationImages: [...prev.inspirationImages, ...newImages]
    }));
  };

  const removeImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      inspirationImages: prev.inspirationImages.filter((_, index) => index !== indexToRemove)
    }));
  };

  const calculateFinalResults = async () => {
    console.log('📊 Starting financial calculations...');
    
    try {
      // Validate required data
      if (!formData.dreamDescription?.trim()) {
        setCalculationError({
          type: 'missing_dream_data',
          message: 'We need your dream details first. Let\'s go back to complete them.',
          actionText: 'Go to Step 1',
          action: () => setCurrentStep(1)
        });
        return;
      }

      if (!formData.selectedLifestyle) {
        setCalculationError({
          type: 'missing_dream_data',
          message: 'We need your dream details first. Let\'s go back to complete them.',
          actionText: 'Go to Step 1',
          action: () => setCurrentStep(1)
        });
        return;
      }

      const dreamDescription = formData.dreamDescription.trim();
      
      // Parse income
      const primaryIncome = useIncomeRange 
        ? (incomeRanges.find(range => range.value === formData.incomeRange)?.midpoint || 0)
        : parseFloat(formData.incomeRange.toString().replace(/,/g, '')) || 0;

      console.log('💰 Using income:', primaryIncome);
      
      const totalIncome = primaryIncome; // No partner income in simplified version
      const currentAge = parseInt(formData.currentAge) || 30;
      const retirementAge = 65; // Default retirement age
      
      // Calculate costs - now using user-defined annual spending instead of preset ranges
      const estimatedPropertyCost = (formData.selectedLifestyle.propertyCost.min + formData.selectedLifestyle.propertyCost.max) / 2;
      
      // Calculate total annual spending from user inputs
      const totalAnnualSpending = Object.values(formData.annualSpending)
        .filter(val => val && !isNaN(parseFloat(val)))
        .reduce((sum, val) => sum + parseFloat(val), 0);
      
      // If no annual spending defined, fall back to lifestyle estimates
      const annualLivingCosts = totalAnnualSpending > 0 
        ? totalAnnualSpending 
        : (formData.selectedLifestyle.annualExpenses.min + formData.selectedLifestyle.annualExpenses.max) / 2;
      
      // Calculate required portfolio using 4% rule (25x annual expenses)
      const requiredPortfolio = annualLivingCosts * 25;
      
      // Total Someday Life target = Property + Portfolio for financial independence
      const requiredNetWorth = estimatedPropertyCost + requiredPortfolio;
      
      // Calculate disposable income (after taxes and living expenses)
      const netAnnualIncome = totalIncome * 0.78; // After taxes
      const currentLivingExpenses = Math.min(netAnnualIncome * 0.7, 50000); // Estimate current expenses
      const disposableIncome = Math.max(0, netAnnualIncome - currentLivingExpenses);
      
      // Calculate monthly savings needed
      const workingYears = retirementAge - currentAge;
      const monthlySavingsNeeded = workingYears > 0 ? requiredNetWorth / (workingYears * 12) : 0;

      console.log('💰 Financial calculations:', {
        disposableIncome,
        requiredNetWorth,
        monthlySavingsNeeded
      });

      // Create comprehensive profile with career context
      const userProfile = new UserProfile({
        age: currentAge,
        location: { state: formData.selectedState },
        income: {
          gross: { annual: totalIncome },
          net: { annual: netAnnualIncome }
        },
        employment: {
          status: 'employed',
          position: formData.occupation,
          industry: formData.industry,
          yearsInRole: formData.yearsInRole,
          careerGrowthExpectation: formData.careerGrowthExpectation,
          jobSecurity: 'stable' // Default, could be enhanced later
        },
        expenses: {
          monthly: {
            total: currentLivingExpenses / 12,
            housing: (currentLivingExpenses / 12) * 0.3,
            transportation: (currentLivingExpenses / 12) * 0.15,
            food: (currentLivingExpenses / 12) * 0.12,
            utilities: (currentLivingExpenses / 12) * 0.08,
            insurance: (currentLivingExpenses / 12) * 0.1,
            other: (currentLivingExpenses / 12) * 0.25
          }
        }
      });

      const northStarDream = new NorthStarDream({
        title: 'Someday Life - Financial Independence',
        description: dreamDescription,
        type: 'retirement_lifestyle', // Explicitly mark as retirement lifestyle transformation
        location: formData.selectedLocation,
        housingType: formData.selectedHousingType,
        inspirationImages: formData.inspirationImages,
        estimatedCost: estimatedPropertyCost, // Property cost only
        annualSpending: formData.annualSpending, // Detailed annual spending breakdown
        totalAnnualCost: annualLivingCosts, // Total annual living costs
        requiredPortfolio: requiredPortfolio, // Portfolio needed for 4% rule
        timeline: workingYears,
        requiredNetWorth: requiredNetWorth, // Total target (property + portfolio)
        targetAge: 65, // Default retirement age
        currentAge: currentAge,
        isLifestyleTransformation: true // Flag to distinguish from other dreams
      });

      // Create profile with defensive error handling
      let profile;
      try {
        const profileData = {
          userProfile,
          northStarDream,
          currentAssets: formData.currentAssets || [],
          currentDebts: formData.currentDebts || [],
          fixedExpenses: {
            housing: (currentLivingExpenses / 12) * 0.3,
            transportation: (currentLivingExpenses / 12) * 0.15,
            food: (currentLivingExpenses / 12) * 0.12,
            utilities: (currentLivingExpenses / 12) * 0.08,
            insurance: (currentLivingExpenses / 12) * 0.1
          },
          goals: {
            retirementAge: retirementAge,
            targetNetWorth: requiredNetWorth,
            monthlySavingsTarget: monthlySavingsNeeded
          }
        };

        // Ensure all required properties exist
        if (!profileData.fixedExpenses) {
          profileData.fixedExpenses = {};
        }
        if (!profileData.financialObligations) {
          profileData.financialObligations = { debts: [] };
        }
        if (!profileData.currentAssets) {
          profileData.currentAssets = {};
        }

        profile = FinancialProfile.createSafe(profileData);
      } catch (error) {
        console.error('Failed to create FinancialProfile:', error);
        // Create a minimal valid profile as fallback
        profile = FinancialProfile.createSafe({
          fixedExpenses: {},
          financialObligations: { debts: [] },
          currentAssets: {}
        });
      }

          // Save to localStorage with clear distinction from other dreams
      // Check if Someday Life goal already exists
      const existingSomedayLife = DreamService.getSomedayLifeGoal()
      
      if (existingSomedayLife) {
        const shouldReplace = await DreamService.confirmSomedayLifeReplacement({
          title: northStarDream.title,
          description: northStarDream.description
        })
        
        if (!shouldReplace) {
          console.log('User chose not to replace existing Someday Life goal')
          return
        }
      }
      
      // Convert NorthStarDream to DreamService format
      const dreamServiceGoal = {
        title: northStarDream.title,
        description: northStarDream.description,
        type: 'someday_life',
        target_amount: northStarDream.requiredNetWorth,
        property_cost: northStarDream.estimatedCost,
        annual_expenses: northStarDream.totalAnnualCost,
        target_date: new Date(new Date().getFullYear() + northStarDream.timeline, 11, 31).toISOString(),
        category: 'freedom',
        location: northStarDream.location,
        housing_type: northStarDream.housingType,
        required_portfolio: northStarDream.requiredPortfolio,
        target_age: northStarDream.targetAge,
        current_age: northStarDream.currentAge,
        is_lifestyle_transformation: true
      }
      
      // Save using DreamService
      if (existingSomedayLife) {
        DreamService.replaceSomedayLifeGoal(dreamServiceGoal)
      } else {
        DreamService.saveDream(dreamServiceGoal)
      }
      
      localStorage.setItem('financialProfile', JSON.stringify(profile));
      localStorage.setItem('somedayDream', JSON.stringify(northStarDream));
      localStorage.setItem('somedayLifeType', 'retirement_lifestyle'); // Mark as retirement planning
      
      // Save comprehensive financial context for timeline optimization
      localStorage.setItem('userIncome', JSON.stringify({ 
        annual: totalIncome, 
        monthly: totalIncome / 12 
      }));
      localStorage.setItem('careerContext', JSON.stringify({
        occupation: formData.occupation,
        industry: formData.industry,
        yearsInRole: formData.yearsInRole,
        growthExpectation: formData.careerGrowthExpectation
      }));
      localStorage.setItem('assetDebtContext', JSON.stringify({
        assets: formData.currentAssets,
        debts: formData.currentDebts
      }));
      
      // Clear any confusion with regular dreams
      console.log('✅ Someday Life (retirement lifestyle) plan created with full financial context');
      console.log('📊 Career trajectory and asset/debt context stored for income acceleration suggestions');
      
      // Set the profile and trigger completion
      setFinancialProfile(profile);
      setYearsToSomeday(workingYears);
      
      // Clear any previous errors
      setCalculationError(null);
      
      // Navigate to next step
      setTimeout(() => {
        onComplete();
      }, 1000);

    } catch (error) {
      console.error('❌ Calculation error:', error);
      setCalculationError({
        type: 'calculation_failed',
        message: 'Let\'s try that again',
        actionText: 'Retry Calculation',
        action: () => calculateFinalResults()
      });
    }
  };

  const ProgressIndicator = () => (
    <div className="mb-8">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">{getSomedayBuilderContent('pageTitle', 'Building Your Someday Life')}</h2>
        <p className="text-gray-600">Step {currentStep} of 3</p>
        <p className="text-sm text-gray-500 mt-1">
          {getSomedayBuilderContent('pageSubtitle', 'Design and plan your perfect retirement lifestyle')}
        </p>
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
                w-12 h-1 transition-all duration-300 ${
                  step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                }
              `} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        
        input[type="range"]::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>

      <div className="max-w-4xl mx-auto px-4">
        <ProgressIndicator />

        {/* Step 1: Dream Capture */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">{getSomedayBuilderContent('stepIntro', 'Envision Your Someday Life')}</h3>
              <p className="text-lg text-gray-600 mb-4">
                This is different from other savings goals - we're designing your complete lifestyle transformation for when work becomes optional.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-2xl mx-auto">
                <p className="text-sm text-blue-800">
                  💡 <strong>Key Insight:</strong> Instead of just saving for retirement, we're calculating both the assets you'll need (like property) 
                  AND the portfolio required to sustain your ideal annual spending forever using the 4% rule.
                </p>
              </div>
            </div>

            {/* Dream Starting Points */}
            <div className="mb-8">
              <h4 className="text-xl font-semibold text-gray-700 mb-4 text-center">Popular dream starting points</h4>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {/* Beach House */}
                <button
                  onClick={() => {
                    updateFormData('dreamDescription', 'A beautiful oceanfront house with stunning views where I can wake up to the sound of waves and enjoy peaceful mornings by the sea.');
                    updateFormData('selectedLocation', 'coastal');
                    updateFormData('selectedHousingType', 'cottage');
                  }}
                  className="group bg-white rounded-xl p-4 border-2 border-gray-200 transition-all duration-300 hover:shadow-lg hover:border-teal-300"
                >
                  <div className="w-full h-24 bg-gradient-to-br from-blue-200 to-cyan-300 rounded-xl flex items-center justify-center mb-3">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7l-10-5zM7 18v-7h10v7H7z"/>
                      <path d="M8 11h8v2H8z"/>
                    </svg>
                  </div>
                  <h5 className="text-lg font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                    Beach House
                  </h5>
                  <p className="text-gray-600 text-sm mt-1">
                    Ocean views and peaceful mornings
                  </p>
                </button>

                {/* Mountain Cabin */}
                <button
                  onClick={() => {
                    updateFormData('dreamDescription', 'A peaceful mountain retreat surrounded by nature where I can enjoy hiking trails, starlit skies, and the tranquility of mountain living.');
                    updateFormData('selectedLocation', 'mountain');
                    updateFormData('selectedHousingType', 'cabin');
                  }}
                  className="group bg-white rounded-xl p-4 border-2 border-gray-200 transition-all duration-300 hover:shadow-lg hover:border-teal-300"
                >
                  <div className="w-full h-24 bg-gradient-to-br from-green-200 to-emerald-300 rounded-xl flex items-center justify-center mb-3">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/>
                      <path d="M7 14h2v2H7z"/>
                      <path d="M11 14h2v2h-2z"/>
                      <path d="M15 14h2v2h-2z"/>
                    </svg>
                  </div>
                  <h5 className="text-lg font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                    Mountain Cabin
                  </h5>
                  <p className="text-gray-600 text-sm mt-1">
                    Nature retreat and tranquility
                  </p>
                </button>

                {/* City Apartment */}
                <button
                  onClick={() => {
                    updateFormData('dreamDescription', 'A modern urban apartment in the heart of the city with access to cultural attractions, great restaurants, and a vibrant community lifestyle.');
                    updateFormData('selectedLocation', 'urban');
                    updateFormData('selectedHousingType', 'loft');
                  }}
                  className="group bg-white rounded-xl p-4 border-2 border-gray-200 transition-all duration-300 hover:shadow-lg hover:border-teal-300"
                >
                  <div className="w-full h-24 bg-gradient-to-br from-purple-200 to-indigo-300 rounded-xl flex items-center justify-center mb-3">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <h5 className="text-lg font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                    City Apartment
                  </h5>
                  <p className="text-gray-600 text-sm mt-1">
                    Urban culture and convenience
                  </p>
                </button>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Or describe your own unique vision below</p>
              </div>
            </div>

            {/* Dream Description */}
            <div className="mb-8">
              <label className="block text-xl font-semibold text-gray-700 mb-4">
                {getSomedayBuilderContent('lifeVisionPrompt', 'Describe your someday life')}
              </label>
              <textarea
                value={formData.dreamDescription}
                onChange={(e) => updateFormData('dreamDescription', e.target.value)}
                rows={5}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                placeholder="Imagine waking up without an alarm... What does your perfect day look like? Where are you? What are you doing? Who are you with? Paint us a picture of your someday life..."
              />
            </div>

            {/* Image Gallery */}
            <div className="mb-8">
              <label className="block text-xl font-semibold text-gray-700 mb-4">
                Add inspiration images (optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Sparkles className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg text-gray-600 mb-2">Upload images that inspire your someday life</p>
                  <p className="text-sm text-gray-500">PNG, JPG up to 10MB each</p>
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
                        className="w-full h-24 object-cover rounded-lg shadow-md"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
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
                  Location preference
                </label>
                <select
                  value={formData.selectedLocation}
                  onChange={(e) => updateFormData('selectedLocation', e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Choose location type...</option>
                  <option value="coastal">Coastal area</option>
                  <option value="mountain">Mountain region</option>
                  <option value="rural">Rural countryside</option>
                  <option value="suburban">Suburban area</option>
                  <option value="urban">Urban center</option>
                  <option value="desert">Desert region</option>
                </select>
              </div>

              <div>
                <label className="block text-xl font-semibold text-gray-700 mb-4">
                  Housing style
                </label>
                <select
                  value={formData.selectedHousingType}
                  onChange={(e) => updateFormData('selectedHousingType', e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Choose housing style...</option>
                  <option value="cottage">Cottage</option>
                  <option value="modern">Modern</option>
                  <option value="farmhouse">Farmhouse</option>
                  <option value="cabin">Cabin</option>
                  <option value="victorian">Victorian</option>
                  <option value="ranch">Ranch</option>
                  <option value="loft">Loft</option>
                  <option value="lakehouse">Lakehouse</option>
                </select>
              </div>
            </div>

            {/* Validation message */}
            {(!formData.dreamDescription.trim() || !formData.selectedLocation || !formData.selectedHousingType) && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-amber-800 text-sm">
                  Please complete all fields to continue to the next step.
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={handleBack}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!formData.dreamDescription.trim() || !formData.selectedLocation || !formData.selectedHousingType}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Next: Choose Lifestyle
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Lifestyle Examples with Annual Spending */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">Design Your Someday Life</h3>
              <p className="text-lg text-gray-600 mb-6">
                Choose your ideal lifestyle and define your annual spending for complete financial independence.
              </p>
              
              {/* Ranking explanation */}
              <div className="bg-gray-50 rounded-xl p-4 max-w-2xl mx-auto">
                <div className="flex flex-wrap justify-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      Best Match
                    </div>
                    <span className="text-gray-600">Perfect for your preferences</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      Great Option
                    </div>
                    <span className="text-gray-600">Highly compatible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs">Other Possibilities</span>
                    <span className="text-gray-600">Worth considering</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lifestyle Options - Ranked by preferences */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {getRankedLifestyleOptions().map((lifestyle) => (
                <div
                  key={lifestyle.id}
                  onClick={() => handleLifestyleSelect(lifestyle)}
                  className={`
                    relative cursor-pointer rounded-xl border-2 transition-all duration-300 overflow-hidden
                    ${formData.selectedLifestyle?.id === lifestyle.id 
                      ? 'ring-4 ring-blue-500 shadow-xl' 
                      : lifestyle.rank === 'best'
                        ? 'border-green-400 hover:border-green-500 shadow-lg'
                        : lifestyle.rank === 'great'
                          ? 'border-blue-300 hover:border-blue-400 shadow-md'
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-lg'
                    }
                  `}
                >
                  <div className="aspect-video relative">
                    <img
                      src={seasonalView[lifestyle.id] === 'winter' ? lifestyle.seasonalImages.winter : lifestyle.seasonalImages.summer}
                      alt={`${lifestyle.title} - ${seasonalView[lifestyle.id] || 'summer'}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Seasonal toggle */}
                    <div className="absolute bottom-3 left-3 flex bg-black bg-opacity-50 rounded-lg overflow-hidden">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSeasonalView(prev => ({ ...prev, [lifestyle.id]: 'summer' }));
                        }}
                        className={`px-2 py-1 text-xs font-medium transition-colors ${
                          (seasonalView[lifestyle.id] || 'summer') === 'summer' 
                            ? 'bg-white text-gray-800' 
                            : 'text-white hover:bg-white hover:bg-opacity-20'
                        }`}
                      >
                        Summer
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSeasonalView(prev => ({ ...prev, [lifestyle.id]: 'winter' }));
                        }}
                        className={`px-2 py-1 text-xs font-medium transition-colors ${
                          seasonalView[lifestyle.id] === 'winter' 
                            ? 'bg-white text-gray-800' 
                            : 'text-white hover:bg-white hover:bg-opacity-20'
                        }`}
                      >
                        Winter
                      </button>
                    </div>
                    
                    {/* Match ranking badge */}
                    {lifestyle.rank === 'best' && (
                      <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Best Match
                      </div>
                    )}
                    {lifestyle.rank === 'great' && (
                      <div className="absolute top-3 left-3 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Great Option
                      </div>
                    )}
                    
                    {/* Comparison checkbox */}
                    <div className="absolute top-3 right-3">
                      <label className="flex items-center gap-1 bg-white bg-opacity-90 rounded px-2 py-1 text-xs font-medium">
                        <input
                          type="checkbox"
                          checked={selectedForComparison.includes(lifestyle.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            if (e.target.checked) {
                              if (selectedForComparison.length < 3) {
                                setSelectedForComparison(prev => [...prev, lifestyle.id]);
                              }
                            } else {
                              setSelectedForComparison(prev => prev.filter(id => id !== lifestyle.id));
                            }
                          }}
                          className="w-3 h-3"
                        />
                        Compare
                      </label>
                    </div>
                    
                    {/* Selection indicator */}
                    {formData.selectedLifestyle?.id === lifestyle.id && (
                      <div className="absolute bottom-3 right-3 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                        ✓
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h4 className="text-lg font-bold text-gray-800 mb-1">{lifestyle.title}</h4>
                    <div className="mb-2">
                      <p className="text-sm font-medium text-blue-600">{lifestyle.specificLocation}</p>
                      <p className="text-xs text-gray-500">{lifestyle.drivingDistance}</p>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{lifestyle.description}</p>
                    <p className="text-gray-500 text-xs mb-3 italic">{lifestyle.locationDetails}</p>
                    
                    {/* Location-aware climate context */}
                    {(() => {
                      const income = useIncomeRange 
                        ? (incomeRanges.find(range => range.value === formData.incomeRange)?.midpoint || 0)
                        : parseFloat(formData.incomeRange?.toString().replace(/,/g, '') || '0') || 0;
                      const locationContext = getLocationContext(lifestyle, formData.selectedState);
                      const successRate = getSuccessRate(lifestyle, income);
                      
                      return (
                        <>
                          {locationContext && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                              <p className="text-xs text-amber-800">
                                <strong>Climate Change from {formData.selectedState}:</strong> {locationContext}
                              </p>
                            </div>
                          )}
                          
                          {/* Reality Check */}
                          {income > 0 && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                              <p className="text-xs text-green-800">
                                <strong>Success Rate:</strong> {successRate.rate}% of people with similar income achieve this lifestyle.
                              </p>
                              <p className="text-xs text-green-700 mt-1">
                                <strong>Key factors:</strong> {successRate.factors.join(', ')}
                              </p>
                            </div>
                          )}
                        </>
                      );
                    })()}
                    
                    {/* Seasonal climate info */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-xs text-gray-700">
                        <strong>{seasonalView[lifestyle.id] === 'winter' ? 'Winter' : 'Summer'}:</strong> {
                          seasonalView[lifestyle.id] === 'winter' 
                            ? lifestyle.climateInfo.winter 
                            : lifestyle.climateInfo.summer
                        }
                      </p>
                    </div>
                    
                    {/* Practical details with icons */}
                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      <div className="flex items-center gap-1 text-gray-600">
                        <span>🏥</span> {lifestyle.practicalDetails.hospital}
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <span>✈️</span> {lifestyle.practicalDetails.airport}
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <span>🛒</span> {lifestyle.practicalDetails.grocery}
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <span>🎭</span> {lifestyle.practicalDetails.culture}
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      {/* Property Cost */}
                      <div className="bg-green-50 rounded-lg p-2 border border-green-200">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-green-800">Property Cost</span>
                          <span className="text-xs font-bold text-green-900">
                            {formatCurrency(lifestyle.propertyCost.min)} - {formatCurrency(lifestyle.propertyCost.max)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Annual Living Costs */}
                      <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-blue-800">Annual Living</span>
                          <span className="text-xs font-bold text-blue-900">
                            {formatCurrency(lifestyle.annualExpenses.min)} - {formatCurrency(lifestyle.annualExpenses.max)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {lifestyle.highlights.map((highlight, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {highlight}
                        </span>
                      ))}
                    </div>
                    
                    {/* Day in the Life preview */}
                    {expandedLifestyle === lifestyle.id && (
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-3">
                        <h6 className="text-xs font-semibold text-indigo-800 mb-2">A Day in Your Life:</h6>
                        <p className="text-xs text-indigo-700 leading-relaxed">
                          {lifestyle.dayInLife}
                        </p>
                      </div>
                    )}
                    
                    {/* Learn More / Day in Life toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedLifestyle(expandedLifestyle === lifestyle.id ? null : lifestyle.id);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 underline mb-2"
                    >
                      {expandedLifestyle === lifestyle.id ? 'Hide Details' : 'See Day in the Life'}
                    </button>
                    
                    {/* Show match score for debugging (can remove in production) */}
                    {lifestyle.matchScore > 0 && (
                      <div className="text-xs text-gray-400 mt-2">
                        Match Score: {lifestyle.matchScore}/100
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Annual Spending Categories */}
            {formData.selectedLifestyle && (
              <div className="mb-8">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                  <div className="text-center mb-6">
                    <h4 className="text-2xl font-bold text-gray-800 mb-2">Define Your Annual Spending</h4>
                    <p className="text-gray-600 mb-4">
                      How much will you need annually for your {formData.selectedLifestyle.title} lifestyle?
                    </p>
                    
                    {/* Lifestyle Cost Estimator */}
                    {(() => {
                      const estimates = getLifestyleCostEstimates(formData.selectedLifestyle);
                      const adjustedEstimates = applyStateCostAdjustments(estimates, formData.selectedState);
                      
                      return adjustedEstimates ? (
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 mb-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="text-lg font-semibold text-blue-900">{adjustedEstimates.name}</h5>
                                <AIDataBadge dataPoints="15,000+" source="retirees" size="small" />
                              </div>
                              <p className="text-sm text-blue-700">Costs validated against federal retirement data</p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-900">{formatCurrency(adjustedEstimates.total)}</div>
                              <div className="text-sm text-blue-600">per year</div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4 text-xs">
                            <div className="bg-white bg-opacity-60 rounded p-2">
                              <div className="font-semibold text-gray-800">Basic Living</div>
                              <div className="text-blue-800">{formatCurrency(adjustedEstimates.basicLiving)}</div>
                            </div>
                            <div className="bg-white bg-opacity-60 rounded p-2">
                              <div className="font-semibold text-gray-800">Health & Wellness</div>
                              <div className="text-blue-800">{formatCurrency(adjustedEstimates.healthWellness)}</div>
                            </div>
                            <div className="bg-white bg-opacity-60 rounded p-2">
                              <div className="font-semibold text-gray-800">Hobbies & Interests</div>
                              <div className="text-blue-800">{formatCurrency(adjustedEstimates.hobbiesInterests)}</div>
                            </div>
                            <div className="bg-white bg-opacity-60 rounded p-2">
                              <div className="font-semibold text-gray-800">Travel & Experiences</div>
                              <div className="text-blue-800">{formatCurrency(adjustedEstimates.travelExperiences)}</div>
                            </div>
                            <div className="bg-white bg-opacity-60 rounded p-2">
                              <div className="font-semibold text-gray-800">Family & Giving</div>
                              <div className="text-blue-800">{formatCurrency(adjustedEstimates.familyGiving)}</div>
                            </div>
                            <div className="bg-white bg-opacity-60 rounded p-2">
                              <div className="font-semibold text-gray-800">Emergency Buffer</div>
                              <div className="text-blue-800">{formatCurrency(adjustedEstimates.emergencyBuffer)}</div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-3">
                            <button
                              onClick={() => {
                                updateFormData('annualSpending', {
                                  basicLiving: adjustedEstimates.basicLiving.toString(),
                                  healthWellness: adjustedEstimates.healthWellness.toString(),
                                  hobbiesInterests: adjustedEstimates.hobbiesInterests.toString(),
                                  travelExperiences: adjustedEstimates.travelExperiences.toString(),
                                  familyGiving: adjustedEstimates.familyGiving.toString(),
                                  emergencyBuffer: adjustedEstimates.emergencyBuffer.toString()
                                });
                              }}
                              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                              📊 Use These Estimates
                            </button>
                            <details className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                              <summary className="font-medium">View Detailed Breakdown</summary>
                              <div className="mt-3 p-3 bg-white rounded-lg text-left text-sm">
                                <div className="space-y-2">
                                  <div><strong>Basic Living ({formatCurrency(adjustedEstimates.basicLiving)}):</strong> {adjustedEstimates.details.basicLiving}</div>
                                  <div><strong>Health & Wellness ({formatCurrency(adjustedEstimates.healthWellness)}):</strong> {adjustedEstimates.details.healthWellness}</div>
                                  <div><strong>Hobbies & Interests ({formatCurrency(adjustedEstimates.hobbiesInterests)}):</strong> {adjustedEstimates.details.hobbiesInterests}</div>
                                  <div><strong>Travel & Experiences ({formatCurrency(adjustedEstimates.travelExperiences)}):</strong> {adjustedEstimates.details.travelExperiences}</div>
                                  <div><strong>Family & Giving ({formatCurrency(adjustedEstimates.familyGiving)}):</strong> {adjustedEstimates.details.familyGiving}</div>
                                  <div><strong>Emergency Buffer ({formatCurrency(adjustedEstimates.emergencyBuffer)}):</strong> {adjustedEstimates.details.emergencyBuffer}</div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <p className="text-xs text-gray-600">
                                    💡 These estimates reflect the true cost of living your chosen lifestyle, not just buying the property. 
                                    The portfolio calculation ensures you can afford this lifestyle indefinitely.
                                  </p>
                                </div>
                              </div>
                            </details>
                          </div>
                          
                          {formData.selectedState && formData.selectedState !== 'Maine' && (
                            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                              <p className="text-xs text-yellow-800">
                                💡 Costs adjusted for {formData.selectedState} cost of living vs. base location
                              </p>
                            </div>
                          )}
                        </div>
                      ) : null;
                    })()}
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                      <p className="text-sm text-green-800">
                        <strong>🎯 This is NOT a regular savings goal</strong><br/>
                        Unlike saving for a vacation or car, we're calculating your complete financial independence package:
                      </p>
                      <ul className="text-xs text-green-700 mt-2 space-y-1">
                        <li>• Property cost (one-time purchase)</li>
                        <li>• Portfolio needed to generate annual income forever (4% rule)</li>
                        <li>• Complete retirement lifestyle transformation</li>
                      </ul>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Basic Living */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <label className="block text-lg font-semibold text-gray-800 mb-2">
                        🏠 Basic Living
                      </label>
                      {(() => {
                        const estimates = getLifestyleCostEstimates(formData.selectedLifestyle);
                        const adjustedEstimates = applyStateCostAdjustments(estimates, formData.selectedState);
                        
                        return adjustedEstimates ? (
                          <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-1">
                              Housing, utilities, groceries, insurance, taxes
                            </p>
                            <p className="text-xs text-blue-600">
                              💡 Suggested for {adjustedEstimates.name}: ${adjustedEstimates.basicLiving.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {adjustedEstimates.details.basicLiving}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600 mb-3">
                            Housing, utilities, groceries, insurance, taxes
                          </p>
                        );
                      })()}
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          value={formData.annualSpending.basicLiving}
                          onChange={(e) => updateFormData('annualSpending', {
                            ...formData.annualSpending,
                            basicLiving: e.target.value
                          })}
                          placeholder="45000"
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">/year</span>
                      </div>
                    </div>

                    {/* Hobbies & Interests */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <label className="block text-lg font-semibold text-gray-800 mb-2">
                        🎨 Hobbies & Interests
                      </label>
                      <p className="text-sm text-gray-600 mb-3">
                        Recreation, entertainment, learning, personal projects
                      </p>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          value={formData.annualSpending.hobbiesInterests}
                          onChange={(e) => updateFormData('annualSpending', {
                            ...formData.annualSpending,
                            hobbiesInterests: e.target.value
                          })}
                          placeholder="8000"
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">/year</span>
                      </div>
                    </div>

                    {/* Travel & Experiences */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <label className="block text-lg font-semibold text-gray-800 mb-2">
                        ✈️ Travel & Experiences
                      </label>
                      <p className="text-sm text-gray-600 mb-3">
                        Vacations, dining out, special experiences, adventures
                      </p>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          value={formData.annualSpending.travelExperiences}
                          onChange={(e) => updateFormData('annualSpending', {
                            ...formData.annualSpending,
                            travelExperiences: e.target.value
                          })}
                          placeholder="12000"
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">/year</span>
                      </div>
                    </div>

                    {/* Health & Wellness */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <label className="block text-lg font-semibold text-gray-800 mb-2">
                        💪 Health & Wellness
                      </label>
                      {(() => {
                        const estimates = getLifestyleCostEstimates(formData.selectedLifestyle);
                        const adjustedEstimates = applyStateCostAdjustments(estimates, formData.selectedState);
                        
                        return adjustedEstimates ? (
                          <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-1">
                              Healthcare, fitness, wellness activities, supplements
                            </p>
                            <p className="text-xs text-blue-600">
                              💡 Suggested: ${adjustedEstimates.healthWellness.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {adjustedEstimates.details.healthWellness}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600 mb-3">
                            Healthcare, fitness, wellness activities, supplements
                          </p>
                        );
                      })()}
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          value={formData.annualSpending.healthWellness}
                          onChange={(e) => updateFormData('annualSpending', {
                            ...formData.annualSpending,
                            healthWellness: e.target.value
                          })}
                          placeholder="6000"
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">/year</span>
                      </div>
                    </div>

                    {/* Family & Giving */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <label className="block text-lg font-semibold text-gray-800 mb-2">
                        ❤️ Family & Giving
                      </label>
                      <p className="text-sm text-gray-600 mb-3">
                        Family support, gifts, charitable giving, legacy
                      </p>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          value={formData.annualSpending.familyGiving}
                          onChange={(e) => updateFormData('annualSpending', {
                            ...formData.annualSpending,
                            familyGiving: e.target.value
                          })}
                          placeholder="4000"
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">/year</span>
                      </div>
                    </div>

                    {/* Emergency Buffer */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <label className="block text-lg font-semibold text-gray-800 mb-2">
                        🛡️ Emergency Buffer
                      </label>
                      <p className="text-sm text-gray-600 mb-3">
                        Unexpected expenses, inflation protection
                      </p>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          value={formData.annualSpending.emergencyBuffer || ''}
                          onChange={(e) => updateFormData('annualSpending', {
                            ...formData.annualSpending,
                            emergencyBuffer: e.target.value
                          })}
                          placeholder="5000"
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">/year</span>
                      </div>
                    </div>
                  </div>

                  {/* Total Annual Spending Display */}
                  {(() => {
                    const totalAnnual = Object.values(formData.annualSpending)
                      .filter(val => val && !isNaN(parseFloat(val)))
                      .reduce((sum, val) => sum + parseFloat(val), 0);
                    
                    const propertyCost = formData.selectedLifestyle ? 
                      (formData.selectedLifestyle.propertyCost.min + formData.selectedLifestyle.propertyCost.max) / 2 : 0;
                    
                    const portfolioNeeded = totalAnnual * 25; // 4% rule
                    const totalSomedayLifeCost = propertyCost + portfolioNeeded;
                    
                    return totalAnnual > 0 ? (
                      <div className="mt-6 bg-blue-600 text-white rounded-xl p-6">
                        <div className="text-center">
                          <h5 className="text-xl font-bold mb-4">Your Complete Someday Life Financial Target</h5>
                          
                          <div className="grid md:grid-cols-3 gap-4 mb-4">
                            <div className="bg-blue-700 rounded-lg p-4">
                              <div className="text-lg font-semibold">Annual Spending</div>
                              <div className="text-2xl font-bold">{formatCurrency(totalAnnual)}</div>
                              <div className="text-sm opacity-90">Your lifestyle costs</div>
                            </div>
                            
                            <div className="bg-blue-700 rounded-lg p-4">
                              <div className="text-lg font-semibold">Property Cost</div>
                              <div className="text-2xl font-bold">{formatCurrency(propertyCost)}</div>
                              <div className="text-sm opacity-90">One-time purchase</div>
                            </div>
                            
                            <div className="bg-blue-700 rounded-lg p-4">
                              <div className="text-lg font-semibold">Portfolio Needed</div>
                              <div className="text-2xl font-bold">{formatCurrency(portfolioNeeded)}</div>
                              <div className="text-sm opacity-90">For annual income (4% rule)</div>
                            </div>
                          </div>
                          
                          <div className="border-t border-blue-500 pt-4">
                            <div className="text-lg font-semibold">Total Someday Life Target</div>
                            <div className="text-4xl font-bold">{formatCurrency(totalSomedayLifeCost)}</div>
                            <div className="text-sm opacity-90 mt-2">
                              Property + Portfolio for financial independence
                            </div>
                          </div>
                          
                          <div className="mt-4 space-y-3">
                            <div className="p-3 bg-blue-500 bg-opacity-50 rounded-lg">
                              <p className="text-sm">
                                💡 <strong>Portfolio Calculation:</strong> ${totalAnnual.toLocaleString()} × 25 = ${portfolioNeeded.toLocaleString()}
                              </p>
                              <p className="text-xs mt-1 opacity-90">
                                Using the 4% rule: Your portfolio will generate ${totalAnnual.toLocaleString()} annually to sustain this lifestyle forever
                              </p>
                            </div>
                            <div className="p-3 bg-green-500 bg-opacity-30 rounded-lg">
                              <p className="text-sm">
                                🎯 <strong>Complete Picture:</strong> Property to live in + Portfolio to pay for living = True Financial Independence
                              </p>
                              <p className="text-xs mt-1 opacity-90">
                                This separates retirement lifestyle transformation from other savings goals
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
            )}

            {/* Comparison Feature */}
            {selectedForComparison.length >= 2 && (
              <div className="mb-8">
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xl font-bold text-indigo-800">
                      Compare Lifestyles ({selectedForComparison.length} selected)
                    </h4>
                    <button
                      onClick={() => setShowComparison(!showComparison)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      {showComparison ? 'Hide Comparison' : 'Show Comparison'}
                    </button>
                  </div>
                  
                  {showComparison && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-indigo-200">
                            <th className="text-left py-2 px-3 font-semibold text-indigo-800">Aspect</th>
                            {selectedForComparison.map(lifestyleId => {
                              const lifestyle = lifestyleExamples.find(l => l.id === lifestyleId);
                              return (
                                <th key={lifestyleId} className="text-left py-2 px-3 font-semibold text-indigo-800">
                                  {lifestyle?.title}
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody className="text-gray-700">
                          <tr className="border-b border-indigo-100">
                            <td className="py-2 px-3 font-medium">Location</td>
                            {selectedForComparison.map(lifestyleId => {
                              const lifestyle = lifestyleExamples.find(l => l.id === lifestyleId);
                              return <td key={lifestyleId} className="py-2 px-3">{lifestyle?.specificLocation}</td>;
                            })}
                          </tr>
                          <tr className="border-b border-indigo-100">
                            <td className="py-2 px-3 font-medium">Property Cost</td>
                            {selectedForComparison.map(lifestyleId => {
                              const lifestyle = lifestyleExamples.find(l => l.id === lifestyleId);
                              return (
                                <td key={lifestyleId} className="py-2 px-3">
                                  {formatCurrency(lifestyle?.propertyCost.min)} - {formatCurrency(lifestyle?.propertyCost.max)}
                                </td>
                              );
                            })}
                          </tr>
                          <tr className="border-b border-indigo-100">
                            <td className="py-2 px-3 font-medium">Annual Living</td>
                            {selectedForComparison.map(lifestyleId => {
                              const lifestyle = lifestyleExamples.find(l => l.id === lifestyleId);
                              return (
                                <td key={lifestyleId} className="py-2 px-3">
                                  {formatCurrency(lifestyle?.annualExpenses.min)} - {formatCurrency(lifestyle?.annualExpenses.max)}
                                </td>
                              );
                            })}
                          </tr>
                          <tr className="border-b border-indigo-100">
                            <td className="py-2 px-3 font-medium">Climate (Summer)</td>
                            {selectedForComparison.map(lifestyleId => {
                              const lifestyle = lifestyleExamples.find(l => l.id === lifestyleId);
                              return <td key={lifestyleId} className="py-2 px-3">{lifestyle?.climateInfo.summer}</td>;
                            })}
                          </tr>
                          <tr className="border-b border-indigo-100">
                            <td className="py-2 px-3 font-medium">Climate (Winter)</td>
                            {selectedForComparison.map(lifestyleId => {
                              const lifestyle = lifestyleExamples.find(l => l.id === lifestyleId);
                              return <td key={lifestyleId} className="py-2 px-3">{lifestyle?.climateInfo.winter}</td>;
                            })}
                          </tr>
                          <tr className="border-b border-indigo-100">
                            <td className="py-2 px-3 font-medium">Healthcare</td>
                            {selectedForComparison.map(lifestyleId => {
                              const lifestyle = lifestyleExamples.find(l => l.id === lifestyleId);
                              return <td key={lifestyleId} className="py-2 px-3">{lifestyle?.practicalDetails.hospital}</td>;
                            })}
                          </tr>
                          <tr className="border-b border-indigo-100">
                            <td className="py-2 px-3 font-medium">Airport Access</td>
                            {selectedForComparison.map(lifestyleId => {
                              const lifestyle = lifestyleExamples.find(l => l.id === lifestyleId);
                              return <td key={lifestyleId} className="py-2 px-3">{lifestyle?.practicalDetails.airport}</td>;
                            })}
                          </tr>
                          <tr className="border-b border-indigo-100">
                            <td className="py-2 px-3 font-medium">Culture & Activities</td>
                            {selectedForComparison.map(lifestyleId => {
                              const lifestyle = lifestyleExamples.find(l => l.id === lifestyleId);
                              return <td key={lifestyleId} className="py-2 px-3">{lifestyle?.practicalDetails.culture}</td>;
                            })}
                          </tr>
                          {formData.selectedState && (
                            <tr className="border-b border-indigo-100">
                              <td className="py-2 px-3 font-medium">Climate Change from {formData.selectedState}</td>
                              {selectedForComparison.map(lifestyleId => {
                                const lifestyle = lifestyleExamples.find(l => l.id === lifestyleId);
                                const context = getLocationContext(lifestyle, formData.selectedState);
                                return <td key={lifestyleId} className="py-2 px-3">{context || 'No significant change'}</td>;
                              })}
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AI Insight after lifestyle selection */}
            {formData.selectedLifestyle && (
              <div className="mb-6">
                <AIInsight
                  type="lifestyle-validation"
                  data={{
                    location: formData.selectedState || 'your area',
                    selectedLifestyle: formData.selectedLifestyle,
                    userAge: formData.currentAge
                  }}
                  confidence="92"
                />
              </div>
            )}

            {/* Validation message for Step 2 */}
            {(!formData.selectedLifestyle || Object.values(formData.annualSpending).filter(val => val && !isNaN(parseFloat(val))).length === 0) && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-amber-800 text-sm">
                  Please choose a lifestyle and add at least one annual spending category to continue.
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={handleBack}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!formData.selectedLifestyle || Object.values(formData.annualSpending).filter(val => val && !isNaN(parseFloat(val))).length === 0}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Next: Financial Details
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Financial Reality & Career Context */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">Let's Get to Know You</h3>
              <p className="text-lg text-gray-600 mb-4">
                A few questions to create an accurate, personalized roadmap to your Someday Life.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-2xl mx-auto">
                <p className="text-sm text-blue-800">
                  💬 Think of this as a conversation, not an interrogation. We'll use this to power realistic income projections and timeline optimizations.
                </p>
              </div>
            </div>

            {/* Basic Info Section */}
            <div className="mb-8">
              <h4 className="text-xl font-semibold text-gray-800 mb-4">First, the basics</h4>
              <div className="grid md:grid-cols-3 gap-6">
              {/* Current Age */}
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  Your current age
                </label>
                <input
                  type="number"
                  value={formData.currentAge}
                  onChange={(e) => {
                    updateFormData('currentAge', e.target.value);
                    setTimeout(generatePreliminaryInsight, 100);
                  }}
                  placeholder="30"
                  min="18"
                  max="100"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Annual Income Input */}
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  Annual income
                </label>
                
                {!useIncomeRange ? (
                  <>
                    {/* Exact Income Input */}
                    <input
                      type="text"
                      value={formData.incomeRange ? formatIncomeInput(formData.incomeRange.toString()) : ''}
                      onChange={handleIncomeChange}
                      placeholder="$75,000"
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    />
                    
                    {/* Fallback Link */}
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={handleSwitchToRangeMode}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        Not comfortable sharing exact income?
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Income Range Dropdown */}
                    <select
                      value={formData.incomeRange}
                      onChange={(e) => {
                        updateFormData('incomeRange', e.target.value);
                        setTimeout(generatePreliminaryInsight, 100);
                      }}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Select range...</option>
                      {incomeRanges.map((range) => (
                        <option key={range.value} value={range.value}>
                          {range.label}
                        </option>
                      ))}
                    </select>
                    
                    {/* Accuracy Warning */}
                    <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-start">
                        <svg className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="text-xs text-amber-800">Range estimates are less precise but still helpful for planning</p>
                      </div>
                    </div>
                    
                    {/* Switch Back Link */}
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={handleSwitchToExactMode}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        Switch to exact income for better accuracy
                      </button>
                    </div>
                  </>
                )}

                <p className="text-sm text-gray-600 mt-2">
                  Your {useIncomeRange ? 'approximate income range' : 'exact income'} helps us create a {useIncomeRange ? 'general' : 'precise'} timeline. This information never leaves your device.
                </p>
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
            </div>

            {/* Career Context Section */}
            <div className="mb-8">
              <h4 className="text-xl font-semibold text-gray-800 mb-4">Your Career Context</h4>
              <p className="text-gray-600 mb-2">
                This helps us project your income growth accurately based on typical career progressions.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-blue-800">
                  💡 <strong>Why this matters:</strong> A 35-year-old teacher making $65,000 has different growth patterns than a software engineer at the same income level. We use occupation-specific data to make your projections credible, not generic.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                {/* What do you do? */}
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-3">
                    What do you do?
                  </label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => updateFormData('occupation', e.target.value)}
                    placeholder="Teacher, Software Engineer, Nurse..."
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Years in this field */}
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-3">
                    Years in this field
                  </label>
                  <input
                    type="number"
                    value={formData.yearsInField}
                    onChange={(e) => updateFormData('yearsInField', e.target.value)}
                    placeholder="5"
                    min="0"
                    max="50"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Career stage */}
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-3">
                    Career stage
                  </label>
                  <select
                    value={formData.careerStage}
                    onChange={(e) => updateFormData('careerStage', e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select stage...</option>
                    <option value="early-career">Early Career</option>
                    <option value="mid-career">Mid-Career</option>
                    <option value="peak-earning">Peak Earning Years</option>
                    <option value="pre-retirement">Pre-Retirement</option>
                  </select>
                  
                  {/* Career Stage Suggestion */}
                  {formData.currentAge && formData.yearsInField && !formData.careerStage && (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          const suggested = suggestCareerStage(formData.currentAge, formData.yearsInField);
                          updateFormData('careerStage', suggested);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        Suggest based on age ({formData.currentAge}) and experience ({formData.yearsInField} years)
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Career Intelligence Display */}
              {formData.occupation && formData.careerStage && formData.currentAge && formData.incomeRange && (
                <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-semibold text-green-800">Career-Based Income Projection</h5>
                        <AIConfidenceBadge confidence="87%" source="historical data" variant="subtle" />
                      </div>
                      <p className="text-sm text-green-700">
                        Based on typical {findCareerProfile(formData.occupation).name.toLowerCase()} career progression
                      </p>
                    </div>
                  </div>
                  
                  {(() => {
                    const currentIncome = useIncomeRange 
                      ? (incomeRanges.find(range => range.value === formData.incomeRange)?.midpoint || 0)
                      : parseFloat(formData.incomeRange.toString().replace(/,/g, '')) || 0;
                    
                    if (currentIncome > 0) {
                      const retirementAge = 65; // Default retirement age
                      const projection = calculateIncomeProjection(
                        currentIncome,
                        parseInt(formData.currentAge),
                        retirementAge,
                        formData.occupation,
                        formData.careerStage,
                        formData.yearsInField
                      );
                      
                      return (
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <p className="text-sm text-green-600 mb-1">Current Income</p>
                            <p className="text-lg font-bold text-green-800">
                              ${currentIncome.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-green-600 mb-1">Projected at {retirementAge}</p>
                            <p className="text-lg font-bold text-green-800">
                              ${projection.projectedIncome.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-green-600 mb-1">Annual Growth</p>
                            <p className="text-lg font-bold text-green-800">
                              {(projection.annualGrowthRate * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  
                  <div className="mt-4 text-xs text-green-700">
                    💡 This projection uses industry-specific data for {findCareerProfile(formData.occupation).name.toLowerCase()}s in the {formData.careerStage.replace('-', ' ')} stage. 
                    Actual results may vary based on performance, market conditions, and career changes.
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Industry */}
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-3">
                    Industry
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) => updateFormData('industry', e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select industry...</option>
                    {industries.map((industry) => (
                      <option key={industry} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-600 mt-2">
                    Helps us benchmark your salary and growth potential
                  </p>
                </div>

                {/* Career growth expectations */}
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-3">
                    Career growth expectations
                  </label>
                  <select
                    value={formData.careerGrowthExpectation}
                    onChange={(e) => updateFormData('careerGrowthExpectation', e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select your situation...</option>
                    {careerGrowthOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  
                  {/* Show description for selected option */}
                  {formData.careerGrowthExpectation && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        💡 <strong>{careerGrowthOptions.find(opt => opt.value === formData.careerGrowthExpectation)?.label}:</strong>{' '}
                        {careerGrowthOptions.find(opt => opt.value === formData.careerGrowthExpectation)?.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Assets & Debts Context Section */}
            <div className="mb-8">
              <h4 className="text-xl font-semibold text-gray-800 mb-4">Your current assets & debts</h4>
              <p className="text-gray-600 mb-6">
                Help us understand how your current financial position fits into your Someday Life plan.
              </p>

              {/* Assets Section */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h5 className="text-lg font-semibold text-gray-800">Current Assets</h5>
                  <button
                    onClick={() => {
                      const newAsset = {
                        id: Date.now(),
                        type: '',
                        name: '',
                        value: '',
                        somedayLifeRole: ''
                      };
                      updateFormData('currentAssets', [...formData.currentAssets, newAsset]);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    + Add Asset
                  </button>
                </div>

                {formData.currentAssets.length === 0 ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <p className="text-gray-600">
                      Do you own a home, have savings, investments, or other assets? Click "Add Asset" to include them.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      💡 We'll help you understand how each asset fits into your retirement planning
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.currentAssets.map((asset, index) => (
                      <div key={asset.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="grid md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Asset Type</label>
                            <select
                              value={asset.type}
                              onChange={(e) => {
                                const updatedAssets = [...formData.currentAssets];
                                updatedAssets[index].type = e.target.value;
                                updateFormData('currentAssets', updatedAssets);
                              }}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                            >
                              <option value="">Select...</option>
                              <option value="primary_home">Primary Home</option>
                              <option value="investment_property">Investment Property</option>
                              <option value="savings_account">Savings Account</option>
                              <option value="checking_account">Checking Account</option>
                              <option value="401k_403b">401(k)/403(b)</option>
                              <option value="ira_roth">IRA/Roth IRA</option>
                              <option value="brokerage_account">Brokerage Account</option>
                              <option value="vehicle">Vehicle</option>
                              <option value="other">Other</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                            <input
                              type="text"
                              value={asset.name}
                              onChange={(e) => {
                                const updatedAssets = [...formData.currentAssets];
                                updatedAssets[index].name = e.target.value;
                                updateFormData('currentAssets', updatedAssets);
                              }}
                              placeholder="e.g., Family home, Emergency fund..."
                              className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Current Value</label>
                            <input
                              type="number"
                              value={asset.value}
                              onChange={(e) => {
                                const updatedAssets = [...formData.currentAssets];
                                updatedAssets[index].value = e.target.value;
                                updateFormData('currentAssets', updatedAssets);
                              }}
                              placeholder="250000"
                              className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                            />
                          </div>

                          <div className="flex items-end">
                            <button
                              onClick={() => {
                                const updatedAssets = formData.currentAssets.filter((_, i) => i !== index);
                                updateFormData('currentAssets', updatedAssets);
                              }}
                              className="w-full p-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        {/* Someday Life Role Question */}
                        <div className="border-t border-gray-300 pt-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Will this be part of your Someday Life?
                          </label>
                          <select
                            value={asset.somedayLifeRole}
                            onChange={(e) => {
                              const updatedAssets = [...formData.currentAssets];
                              updatedAssets[index].somedayLifeRole = e.target.value;
                              updateFormData('currentAssets', updatedAssets);
                            }}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                          >
                            <option value="">Choose...</option>
                            <option value="keep_it">Keep it - Part of my retirement life</option>
                            <option value="sell_to_fund">Sell to fund Someday Life</option>
                            <option value="convert_to_rental">Convert to rental income</option>
                            <option value="grows_with_me">Grows with me (investments)</option>
                            <option value="not_relevant">Not relevant to retirement</option>
                          </select>
                          
                          {asset.somedayLifeRole && (
                            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                              <p className="text-xs text-blue-800">
                                {asset.somedayLifeRole === 'keep_it' && "✅ We'll factor this into your Someday Life asset base"}
                                {asset.somedayLifeRole === 'sell_to_fund' && "💰 We'll include this sale value in your retirement funding"}
                                {asset.somedayLifeRole === 'convert_to_rental' && "🏠 We'll calculate potential rental income for your retirement"}
                                {asset.somedayLifeRole === 'grows_with_me' && "📈 We'll project growth and include in your portfolio"}
                                {asset.somedayLifeRole === 'not_relevant' && "⚪ We'll exclude this from retirement calculations"}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Debts Section */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h5 className="text-lg font-semibold text-gray-800">Current Debts</h5>
                  <button
                    onClick={() => {
                      const newDebt = {
                        id: Date.now(),
                        type: '',
                        name: '',
                        balance: '',
                        monthlyPayment: '',
                        payoffDate: ''
                      };
                      updateFormData('currentDebts', [...formData.currentDebts, newDebt]);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    + Add Debt
                  </button>
                </div>

                {formData.currentDebts.length === 0 ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <p className="text-gray-600">
                      Do you have a mortgage, student loans, credit cards, or other debts? Click "Add Debt" to include them.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      💡 We'll calculate when they'll be paid off and how that affects your retirement timeline
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.currentDebts.map((debt, index) => (
                      <div key={debt.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="grid md:grid-cols-5 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Debt Type</label>
                            <select
                              value={debt.type}
                              onChange={(e) => {
                                const updatedDebts = [...formData.currentDebts];
                                updatedDebts[index].type = e.target.value;
                                updateFormData('currentDebts', updatedDebts);
                              }}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                            >
                              <option value="">Select...</option>
                              <option value="mortgage">Mortgage</option>
                              <option value="student_loan">Student Loan</option>
                              <option value="credit_card">Credit Card</option>
                              <option value="car_loan">Car Loan</option>
                              <option value="personal_loan">Personal Loan</option>
                              <option value="heloc">HELOC</option>
                              <option value="other">Other</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                            <input
                              type="text"
                              value={debt.name}
                              onChange={(e) => {
                                const updatedDebts = [...formData.currentDebts];
                                updatedDebts[index].name = e.target.value;
                                updateFormData('currentDebts', updatedDebts);
                              }}
                              placeholder="e.g., Home mortgage, MBA loan..."
                              className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Balance</label>
                            <input
                              type="number"
                              value={debt.balance}
                              onChange={(e) => {
                                const updatedDebts = [...formData.currentDebts];
                                updatedDebts[index].balance = e.target.value;
                                updateFormData('currentDebts', updatedDebts);
                              }}
                              placeholder="150000"
                              className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Monthly Payment</label>
                            <input
                              type="number"
                              value={debt.monthlyPayment}
                              onChange={(e) => {
                                const updatedDebts = [...formData.currentDebts];
                                updatedDebts[index].monthlyPayment = e.target.value;
                                updateFormData('currentDebts', updatedDebts);
                              }}
                              placeholder="1200"
                              className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                            />
                          </div>

                          <div className="flex items-end">
                            <button
                              onClick={() => {
                                const updatedDebts = formData.currentDebts.filter((_, i) => i !== index);
                                updateFormData('currentDebts', updatedDebts);
                              }}
                              className="w-full p-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        {/* Payoff Timeline Question */}
                        <div className="border-t border-red-300 pt-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            When will this be paid off?
                          </label>
                          <input
                            type="date"
                            value={debt.payoffDate}
                            onChange={(e) => {
                              const updatedDebts = [...formData.currentDebts];
                              updatedDebts[index].payoffDate = e.target.value;
                              updateFormData('currentDebts', updatedDebts);
                            }}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                          />
                          
                          {debt.payoffDate && formData.currentAge && (
                            (() => {
                              const payoffYear = new Date(debt.payoffDate).getFullYear();
                              const currentYear = new Date().getFullYear();
                              const retirementAge = 65; // Default retirement age
                              const retirementYear = currentYear + (retirementAge - parseInt(formData.currentAge));
                              const paidOffBeforeRetirement = payoffYear <= retirementYear;
                              
                              return (
                                <div className={`mt-2 p-2 rounded ${paidOffBeforeRetirement ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                                  <p className={`text-xs ${paidOffBeforeRetirement ? 'text-green-800' : 'text-yellow-800'}`}>
                                    {paidOffBeforeRetirement 
                                      ? "✅ This will be paid off before your Someday Life begins - great!"
                                      : "⚠️ This debt may still exist during retirement - we'll factor this into your planning"
                                    }
                                  </p>
                                </div>
                              );
                            })()
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Preliminary Insight */}
            {preliminaryInsight && (
              <div className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center mb-2">
                    <div className="bg-green-500 rounded-full w-2 h-2 mr-2 animate-pulse"></div>
                    <span className="text-sm font-medium text-green-800">
                      Early insight with your income of ${preliminaryInsight.totalIncome}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-800">
                    {preliminaryInsight.isCalculating 
                      ? 'Calculating your timeline...'
                      : `Your ${preliminaryInsight.dreamName} in ${preliminaryInsight.yearsToTarget} years (by age ${preliminaryInsight.targetAge})`
                    }
                  </h4>
                  <p className="text-gray-600">
                    {preliminaryInsight.isCalculating 
                      ? 'Please ensure all fields are filled out correctly'
                      : `Timeline: ${preliminaryInsight.yearsToTarget} years to achievement`
                    }
                    {preliminaryInsight.monthlyRequired && !preliminaryInsight.isCalculating && (
                      <span className="block text-sm text-blue-600 mt-1">
                        Monthly savings needed: ${preliminaryInsight.monthlyRequired.toLocaleString()}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* AI Insight after financial data entry */}
            {formData.currentAge && formData.incomeRange && formData.occupation && (
              <div className="mb-6">
                <AIInsight
                  type="financial-percentile"
                  data={{
                    income: useIncomeRange 
                      ? (incomeRanges.find(range => range.value === formData.incomeRange)?.midpoint || 0)
                      : parseFloat(formData.incomeRange.toString().replace(/,/g, '')) || 0,
                    age: formData.currentAge,
                    savings: formData.currentAssets.reduce((total, asset) => total + (parseFloat(asset.value) || 0), 0),
                    percentile: (() => {
                      const income = useIncomeRange 
                        ? (incomeRanges.find(range => range.value === formData.incomeRange)?.midpoint || 0)
                        : parseFloat(formData.incomeRange.toString().replace(/,/g, '')) || 0;
                      const age = parseInt(formData.currentAge);
                      
                      // Simple percentile calculation based on age and income
                      if (age < 35) {
                        return income > 80000 ? 75 : income > 60000 ? 60 : income > 45000 ? 45 : 30;
                      } else if (age < 50) {
                        return income > 120000 ? 80 : income > 90000 ? 65 : income > 70000 ? 50 : 35;
                      } else {
                        return income > 150000 ? 85 : income > 100000 ? 70 : income > 80000 ? 55 : 40;
                      }
                    })()
                  }}
                  confidence="89"
                />
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={handleBack}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={calculateFinalResults}
                disabled={!formData.currentAge || !formData.incomeRange || !formData.selectedState || !formData.occupation || !formData.industry}
                className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Create My Plan
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {calculationError && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-lg font-semibold text-red-800 mb-1">Oops!</h4>
                <p className="text-red-700 mb-3">{calculationError.message}</p>
                <button
                  onClick={calculationError.action}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  {calculationError.actionText}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SomedayLifeBuilder;
