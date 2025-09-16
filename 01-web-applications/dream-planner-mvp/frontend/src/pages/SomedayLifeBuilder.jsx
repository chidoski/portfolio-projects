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
    selectedArchetype: '', // New field for lifestyle archetype
    
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
  const [useIncomeRange, setUseIncomeRange] = useState(false); // Default to exact input mode
  const [preliminaryInsight, setPreliminaryInsight] = useState(null);
  const [calculationStage, setCalculationStage] = useState('ready'); // 'ready', 'analyzing', 'comparing', 'optimizing', 'complete'
  const [seasonalView, setSeasonalView] = useState({}); // Track season view for each lifestyle
  const [selectedForComparison, setSelectedForComparison] = useState([]); // Track items selected for comparison
  const [showComparison, setShowComparison] = useState(false);
  const [expandedLifestyle, setExpandedLifestyle] = useState(null); // Track which lifestyle is expanded for details
  const [dreamAnalysis, setDreamAnalysis] = useState(null); // Store AI dream interpretation
  const [showAnalysisModal, setShowAnalysisModal] = useState(false); // Control analysis modal display
  const [analysisLoading, setAnalysisLoading] = useState(false); // Track analysis loading state
  const [detectedThemes, setDetectedThemes] = useState([]); // Store detected themes from dream analysis
  const [isNavigating, setIsNavigating] = useState(false); // Track navigation loading state

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

  // New archetype-based cost calculation function
  const calculateLifestyleCosts = (archetype, preferences, userState = '') => {
    console.log('🏛️ Calculating lifestyle costs for archetype:', archetype);
    
    const baseCosts = {
      propertyCost: 0,
      annualCosts: 0,
      costStructure: 'unknown'
    };

    switch (archetype) {
      case 'rooted-living':
        return calculateRootedLivingCosts(preferences, userState);
      
      case 'nomadic-freedom':
        return calculateNomadicCosts(preferences, userState);
      
      case 'purpose-driven':
        return calculatePurposeDrivenCosts(preferences, userState);
      
      case 'multi-base':
        return calculateMultiBaseCosts(preferences, userState);
      
      case 'community-centered':
        return calculateCommunityCenteredCosts(preferences, userState);
      
      default:
        return baseCosts;
    }
  };

  // Rooted Living: Traditional property + annual living costs
  const calculateRootedLivingCosts = (preferences, userState) => {
    const locationPricing = {
      'small-town': { property: [180000, 320000], annual: 45000 },
      'suburban': { property: [250000, 450000], annual: 55000 },
      'rural': { property: [150000, 280000], annual: 40000 },
      'coastal': { property: [350000, 600000], annual: 65000 },
      'mountain': { property: [220000, 400000], annual: 50000 },
      'city-neighborhood': { property: [300000, 550000], annual: 70000 }
    };

    const housingPricing = {
      'single-family': 1.0,
      'cottage': 0.8,
      'farmhouse': 1.2,
      'historic': 1.3,
      'custom-built': 1.5,
      'condo-community': 0.7
    };

    const location = preferences.rootedLocation || 'suburban';
    const housing = preferences.rootedHousing || 'single-family';
    
    const baseProperty = locationPricing[location] || locationPricing['suburban'];
    const housingMultiplier = housingPricing[housing] || 1.0;
    
    const propertyCost = [
      Math.round(baseProperty.property[0] * housingMultiplier),
      Math.round(baseProperty.property[1] * housingMultiplier)
    ];
    
    // Apply state cost adjustments
    const stateCostMultiplier = getStateCostMultiplier(userState);
    
    return {
      propertyCost: {
        min: Math.round(propertyCost[0] * stateCostMultiplier),
        max: Math.round(propertyCost[1] * stateCostMultiplier)
      },
      annualCosts: Math.round(baseProperty.annual * housingMultiplier * stateCostMultiplier),
      costStructure: 'property-plus-annual',
      description: `${housing} in ${location} area`
    };
  };

  // Nomadic Freedom: Annual travel budget, no property costs
  const calculateNomadicCosts = (preferences, userState) => {
    const travelBudgets = {
      '30000': { annual: 35000, description: 'Budget-conscious nomad lifestyle' },
      '60000': { annual: 65000, description: 'Comfortable explorer lifestyle' },
      '100000': { annual: 105000, description: 'Luxury traveler lifestyle' },
      '150000': { annual: 160000, description: 'Premium experiences lifestyle' }
    };

    const regionMultipliers = {
      'domestic-us': 0.8,
      'north-america': 0.9,
      'europe': 1.2,
      'asia-pacific': 1.0,
      'latin-america': 0.7,
      'worldwide': 1.4,
      'warm-climates': 0.9,
      'cultural-centers': 1.1
    };

    const paceMultipliers = {
      'slow-travel': 0.8,
      'medium-travel': 1.0,
      'constant-movement': 1.3,
      'seasonal-bases': 0.9,
      'flexible-spontaneous': 1.1,
      'structured-itinerary': 1.0
    };

    const budget = preferences.travelBudget || '60000';
    const regions = preferences.preferredRegions || 'domestic-us';
    const pace = preferences.travelPace || 'medium-travel';
    
    const baseBudget = travelBudgets[budget] || travelBudgets['60000'];
    const regionMultiplier = regionMultipliers[regions] || 1.0;
    const paceMultiplier = paceMultipliers[pace] || 1.0;
    
    const finalCost = Math.round(baseBudget.annual * regionMultiplier * paceMultiplier);
    
    return {
      propertyCost: { min: 0, max: 0 }, // No property needed
      annualCosts: finalCost,
      costStructure: 'annual-only',
      description: `${pace.replace('-', ' ')} in ${regions.replace('-', ' ')} regions`,
      specialNote: 'No property purchase required - funding your experiences directly'
    };
  };

  // Purpose-Driven: Mission costs + basic living
  const calculatePurposeDrivenCosts = (preferences, userState) => {
    const missionCosts = {
      'education': { setup: 25000, annual: 15000 },
      'environmental': { setup: 30000, annual: 20000 },
      'social-justice': { setup: 15000, annual: 12000 },
      'health-wellness': { setup: 40000, annual: 25000 },
      'arts-culture': { setup: 20000, annual: 18000 },
      'community-development': { setup: 35000, annual: 22000 },
      'entrepreneurship': { setup: 50000, annual: 30000 },
      'spiritual': { setup: 10000, annual: 8000 },
      'youth-development': { setup: 20000, annual: 16000 },
      'senior-care': { setup: 35000, annual: 24000 },
      'poverty-relief': { setup: 25000, annual: 18000 },
      'disaster-relief': { setup: 45000, annual: 28000 }
    };

    const commitmentMultipliers = {
      'full-time': 1.0,
      'part-time-high': 0.8,
      'part-time-moderate': 0.6,
      'project-based': 0.7,
      'seasonal': 0.5,
      'volunteer-regular': 0.4,
      'volunteer-flexible': 0.3,
      'advisory-board': 0.2
    };

    const impact = preferences.areaOfImpact || preferences.purposeMission || 'community-development';
    const commitment = preferences.timeCommitment || 'part-time-moderate';
    
    const missionData = missionCosts[impact] || missionCosts['community-development'];
    const commitmentMultiplier = commitmentMultipliers[commitment] || 0.6;
    
    const baseLivingCosts = 45000; // Modest living to focus on mission
    const stateCostMultiplier = getStateCostMultiplier(userState);
    
    const adjustedSetup = Math.round(missionData.setup * commitmentMultiplier);
    const adjustedAnnual = Math.round(missionData.annual * commitmentMultiplier);
    
    return {
      propertyCost: { 
        min: Math.round(adjustedSetup * 0.8 * stateCostMultiplier), 
        max: Math.round(adjustedSetup * 1.2 * stateCostMultiplier) 
      },
      annualCosts: Math.round((baseLivingCosts + adjustedAnnual) * stateCostMultiplier),
      costStructure: 'mission-plus-living',
      description: `${commitment.replace('-', ' ')} ${impact.replace('-', ' ')} mission`,
      specialNote: 'Includes startup costs for your mission and ongoing operational expenses'
    };
  };

  // Multi-Base: Multiple properties or seasonal rentals
  const calculateMultiBaseCosts = (preferences, userState) => {
    const baseCount = parseInt(preferences.multiBaseCount) || 2;
    const reason = preferences.multiBaseReason || 'climate';
    const locationType = preferences.multiBaseLocations || 'warm-cold';
    
    const strategyPricing = {
      'climate': { propertyMultiplier: 0.7, rentalAnnual: 35000 },
      'family': { propertyMultiplier: 0.8, rentalAnnual: 25000 },
      'activities': { propertyMultiplier: 0.9, rentalAnnual: 40000 },
      'investment': { propertyMultiplier: 1.2, rentalAnnual: 20000 },
      'work': { propertyMultiplier: 1.0, rentalAnnual: 45000 },
      'adventure': { propertyMultiplier: 0.6, rentalAnnual: 50000 }
    };

    const locationMultipliers = {
      'warm-cold': 1.0,
      'urban-rural': 1.1,
      'coast-mountains': 1.2,
      'domestic-international': 1.4,
      'family-adventure': 0.9,
      'different-regions': 1.0,
      'investment-lifestyle': 1.3
    };

    const strategy = strategyPricing[reason] || strategyPricing['climate'];
    const locationMultiplier = locationMultipliers[locationType] || 1.0;
    const basePropertyCost = 280000;
    const stateCostMultiplier = getStateCostMultiplier(userState);
    
    // Strategy: Mix of owned and rented based on count
    const ownedProperties = Math.min(baseCount, 2);
    const rentalBases = Math.max(0, baseCount - 2);
    
    const totalPropertyCost = ownedProperties * basePropertyCost * strategy.propertyMultiplier * locationMultiplier;
    const annualRentalCosts = rentalBases * strategy.rentalAnnual * locationMultiplier;
    const baseLivingCosts = 40000;
    
    return {
      propertyCost: {
        min: Math.round(totalPropertyCost * 0.8 * stateCostMultiplier),
        max: Math.round(totalPropertyCost * 1.2 * stateCostMultiplier)
      },
      annualCosts: Math.round((baseLivingCosts + annualRentalCosts) * stateCostMultiplier),
      costStructure: 'multi-base',
      description: `${baseCount} ${locationType.replace('-', ' ')} bases for ${reason}`,
      specialNote: `Includes ${ownedProperties} owned properties and ${rentalBases} seasonal arrangements`
    };
  };

  // Community-Centered: Community-specific costs
  const calculateCommunityCenteredCosts = (preferences, userState) => {
    const communityPricing = {
      'family-proximity': { property: [220000, 380000], annual: 50000 },
      'senior-community': { property: [180000, 320000], annual: 60000 },
      'shared-interests': { property: [200000, 350000], annual: 45000 },
      'multi-generational': { property: [300000, 500000], annual: 55000 },
      'co-housing': { property: [160000, 280000], annual: 40000 },
      'cultural': { property: [240000, 400000], annual: 52000 }
    };

    const communityType = preferences.communityType || 'senior-community';
    const pricing = communityPricing[communityType] || communityPricing['senior-community'];
    const stateCostMultiplier = getStateCostMultiplier(userState);
    
    return {
      propertyCost: {
        min: Math.round(pricing.property[0] * stateCostMultiplier),
        max: Math.round(pricing.property[1] * stateCostMultiplier)
      },
      annualCosts: Math.round(pricing.annual * stateCostMultiplier),
      costStructure: 'community-based',
      description: `${communityType} community living`,
      specialNote: 'Includes community fees and shared amenities'
    };
  };

  // Helper function to get state cost multiplier
  const getStateCostMultiplier = (state) => {
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
    
    return stateCostMultipliers[state] || 1.0;
  };

  // Dynamic Form Field Renderer Component
  const DynamicFormField = ({ question, value, onChange, hasError = false }) => {
    const commonClasses = `w-full p-3 border rounded-lg focus:outline-none transition-all duration-200 ${
      hasError 
        ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
        : 'border-gray-300 focus:border-blue-500'
    }`;
    
    return (
      <div className="space-y-2 animate-fade-in">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <span className="text-lg">{question.icon}</span>
          {question.label}
        </label>
        
        {question.type === 'select' && (
          <select
            value={value || ''}
            onChange={(e) => onChange(question.id, e.target.value)}
            className={commonClasses}
          >
            <option value="">{question.placeholder}</option>
            {question.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
        
        {question.type === 'textarea' && (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(question.id, e.target.value)}
            rows={question.rows || 3}
            className={`${commonClasses} resize-none`}
            placeholder={question.placeholder}
          />
        )}
        
        {question.type === 'text' && (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(question.id, e.target.value)}
            className={commonClasses}
            placeholder={question.placeholder}
          />
        )}
      </div>
    );
  };

  // Dynamic Form Fields Generator
  const getArchetypeQuestions = (archetype) => {
    if (!archetype) return [];

    const questionConfigs = {
      'rooted-living': [
        {
          id: 'rootedLocation',
          type: 'select',
          label: 'What type of location appeals to you most?',
          placeholder: 'Choose a location type...',
          options: [
            { value: 'small-town', label: 'Small town with character' },
            { value: 'suburban', label: 'Established suburban neighborhood' },
            { value: 'rural', label: 'Rural area with land' },
            { value: 'coastal', label: 'Coastal community' },
            { value: 'mountain', label: 'Mountain town' },
            { value: 'city-neighborhood', label: 'Urban neighborhood with community feel' }
          ],
          icon: '🏡'
        },
        {
          id: 'rootedHousing',
          type: 'select',
          label: 'What type of home would make you feel most rooted?',
          placeholder: 'Choose a housing type...',
          options: [
            { value: 'single-family', label: 'Single-family home with yard' },
            { value: 'cottage', label: 'Charming cottage or bungalow' },
            { value: 'farmhouse', label: 'Farmhouse with acreage' },
            { value: 'historic', label: 'Historic home with character' },
            { value: 'custom-built', label: 'Custom-built dream home' },
            { value: 'condo-community', label: 'Condo in established community' }
          ],
          icon: '🏠'
        }
      ],

      'nomadic-freedom': [
        {
          id: 'travelStyle',
          type: 'select',
          label: 'What\'s your preferred travel style?',
          placeholder: 'Choose your travel style...',
          options: [
            { value: 'luxury', label: 'Luxury - Premium accommodations and experiences' },
            { value: 'comfortable', label: 'Comfortable - Quality accommodations, good amenities' },
            { value: 'budget', label: 'Budget-conscious - Affordable options, local experiences' },
            { value: 'mixed', label: 'Mixed - Splurge sometimes, save others' }
          ],
          icon: '✈️'
        },
        {
          id: 'baseNeeds',
          type: 'select',
          label: 'What base infrastructure do you need?',
          placeholder: 'Choose your base needs...',
          options: [
            { value: 'family-home', label: 'Family home - Keep a primary residence for family' },
            { value: 'storage-only', label: 'Storage only - Just need space for belongings' },
            { value: 'fully-nomadic', label: 'Fully nomadic - Travel with everything I need' },
            { value: 'seasonal-base', label: 'Seasonal base - One home for off-season returns' }
          ],
          icon: '🎒'
        },
        {
          id: 'travelPace',
          type: 'select',
          label: 'What\'s your ideal travel pace?',
          placeholder: 'Choose your travel pace...',
          options: [
            { value: 'slow-travel', label: 'Slow travel (1-6 months per location)' },
            { value: 'medium-travel', label: 'Medium pace (2-8 weeks per location)' },
            { value: 'constant-movement', label: 'Constant movement (1-4 weeks per location)' },
            { value: 'seasonal-bases', label: 'Seasonal bases (3-6 months per location)' }
          ],
          icon: '🌍'
        }
      ],

      'purpose-driven': [
        {
          id: 'areaOfImpact',
          type: 'select',
          label: 'What area of impact calls to you most?',
          placeholder: 'Choose your area of impact...',
          options: [
            { value: 'education', label: 'Education and literacy' },
            { value: 'environmental', label: 'Environmental conservation' },
            { value: 'social-justice', label: 'Social justice and human rights' },
            { value: 'health-wellness', label: 'Health and wellness' },
            { value: 'arts-culture', label: 'Arts, culture, and creative expression' },
            { value: 'community-development', label: 'Community development' },
            { value: 'entrepreneurship', label: 'Social entrepreneurship' },
            { value: 'youth-development', label: 'Youth development and mentoring' }
          ],
          icon: '🌟'
        },
        {
          id: 'geographicFlexibility',
          type: 'select',
          label: 'How flexible are you with location?',
          placeholder: 'Choose your geographic flexibility...',
          options: [
            { value: 'one-location', label: 'One location - Deep roots in one community' },
            { value: 'regional', label: 'Regional - Within a specific area or state' },
            { value: 'national', label: 'National - Anywhere in the country' },
            { value: 'global', label: 'Global - International impact opportunities' }
          ],
          icon: '🗺️'
        },
        {
          id: 'timeCommitment',
          type: 'select',
          label: 'What\'s your ideal time commitment level?',
          placeholder: 'Choose your commitment level...',
          options: [
            { value: 'full-time', label: 'Full-time dedication (40+ hours/week)' },
            { value: 'part-time-high', label: 'High part-time (20-35 hours/week)' },
            { value: 'part-time-moderate', label: 'Moderate part-time (10-20 hours/week)' },
            { value: 'project-based', label: 'Project-based involvement' },
            { value: 'volunteer-regular', label: 'Regular volunteer schedule (5-15 hours/week)' }
          ],
          icon: '⏰'
        }
      ],

      'multi-base': [
        {
          id: 'multiBaseCount',
          type: 'select',
          label: 'How many base locations would you ideally have?',
          placeholder: 'Choose number of bases...',
          options: [
            { value: '2', label: 'Two bases (e.g., summer/winter homes)' },
            { value: '3', label: 'Three bases (seasonal rotation)' },
            { value: 'flexible', label: 'Flexible arrangements as needed' }
          ],
          icon: '🏘️'
        },
        {
          id: 'multiBaseReason',
          type: 'select',
          label: 'What drives your desire for multiple bases?',
          placeholder: 'Choose your motivation...',
          options: [
            { value: 'climate', label: 'Climate - Follow ideal weather year-round' },
            { value: 'family', label: 'Family - Be close to different family members' },
            { value: 'activities', label: 'Activities - Different locations for different interests' },
            { value: 'cost', label: 'Cost - Optimize expenses across locations' },
            { value: 'variety', label: 'Variety - Enjoy different environments and cultures' }
          ],
          icon: '🌤️'
        },
        {
          id: 'baseTypes',
          type: 'select',
          label: 'What types of bases appeal to you?',
          placeholder: 'Choose your base types...',
          options: [
            { value: 'owned-properties', label: 'Owned properties - Multiple homes you own' },
            { value: 'mixed-owned-rental', label: 'Mixed - Some owned, some long-term rentals' },
            { value: 'rental-arrangements', label: 'Rental arrangements - Seasonal leases' },
            { value: 'community-memberships', label: 'Community memberships - Resort/club access' }
          ],
          icon: '🏠'
        }
      ],

      'community-centered': [
        {
          id: 'proximityPriorities',
          type: 'select',
          label: 'What\'s your top proximity priority?',
          placeholder: 'Choose your priority...',
          options: [
            { value: 'near-family', label: 'Near family - Close to children, grandchildren, siblings' },
            { value: 'senior-community', label: 'Senior community - Active adult or 55+ community' },
            { value: 'care-facilities', label: 'Care facilities - Access to healthcare and support services' },
            { value: 'faith-community', label: 'Faith community - Near church, temple, or spiritual center' },
            { value: 'lifelong-friends', label: 'Lifelong friends - Near established friend networks' },
            { value: 'cultural-community', label: 'Cultural community - Shared interests and values' }
          ],
          icon: '❤️'
        },
        {
          id: 'communityType',
          type: 'select',
          label: 'What type of community setting appeals to you?',
          placeholder: 'Choose your community type...',
          options: [
            { value: 'age-in-place', label: 'Age in place - Stay in current community' },
            { value: 'active-adult', label: 'Active adult community - 55+ with amenities' },
            { value: 'continuing-care', label: 'Continuing care community - Healthcare on-site' },
            { value: 'intentional-community', label: 'Intentional community - Shared values/lifestyle' },
            { value: 'multigenerational', label: 'Multigenerational - Mixed ages and families' }
          ],
          icon: '🏘️'
        },
        {
          id: 'supportLevel',
          type: 'select',
          label: 'What level of community support do you want?',
          placeholder: 'Choose your support level...',
          options: [
            { value: 'independent', label: 'Independent - Minimal services, maximum autonomy' },
            { value: 'some-services', label: 'Some services - Maintenance, activities, dining options' },
            { value: 'comprehensive', label: 'Comprehensive - Full services and care options' },
            { value: 'flexible', label: 'Flexible - Start independent, add services as needed' }
          ],
          icon: '🤝'
        }
      ]
    };

    return questionConfigs[archetype] || [];
  };

  // Enhanced Theme Detection Function
  const detectDreamThemes = (text) => {
    const lowercaseText = text.toLowerCase();
    const detectedThemes = [];

    // Define theme categories with their keywords and confidence scoring
    const themePatterns = {
      'Travel & Exploration': {
        keywords: ['travel', 'explore', 'adventure', 'journey', 'countries', 'cultures', 'places', 'destinations', 'world', 'wanderlust', 'discover', 'experience'],
        phrases: ['see the world', 'different countries', 'new places', 'explore different', 'travel around'],
        icon: '🌍',
        color: 'blue'
      },
      'Education & Teaching': {
        keywords: ['teach', 'education', 'learn', 'mentor', 'coach', 'instruct', 'training', 'knowledge', 'wisdom', 'school', 'students', 'children'],
        phrases: ['teach children', 'share knowledge', 'help others learn', 'educational programs'],
        icon: '📚',
        color: 'green'
      },
      'Creativity & Arts': {
        keywords: ['art', 'creative', 'paint', 'draw', 'write', 'music', 'craft', 'design', 'photography', 'pottery', 'sculpt', 'artistic'],
        phrases: ['creative pursuits', 'artistic expression', 'make art', 'creative projects'],
        icon: '🎨',
        color: 'purple'
      },
      'Community & Relationships': {
        keywords: ['family', 'friends', 'community', 'relationships', 'together', 'social', 'connect', 'gather', 'neighbors', 'grandchildren'],
        phrases: ['close to family', 'time with friends', 'community involvement', 'social connections'],
        icon: '❤️',
        color: 'pink'
      },
      'Nature & Outdoors': {
        keywords: ['garden', 'nature', 'outdoors', 'hiking', 'beach', 'mountains', 'forest', 'wildlife', 'landscape', 'ocean', 'countryside'],
        phrases: ['in nature', 'outdoor activities', 'natural environment', 'peaceful surroundings'],
        icon: '🌿',
        color: 'emerald'
      },
      'Purpose & Impact': {
        keywords: ['volunteer', 'help', 'serve', 'impact', 'mission', 'purpose', 'meaningful', 'contribute', 'difference', 'charity', 'nonprofit'],
        phrases: ['make a difference', 'help others', 'give back', 'meaningful work', 'positive impact'],
        icon: '🌟',
        color: 'yellow'
      },
      'Peace & Tranquility': {
        keywords: ['peaceful', 'quiet', 'serene', 'calm', 'tranquil', 'meditation', 'mindful', 'relax', 'sanctuary', 'retreat'],
        phrases: ['peaceful life', 'quiet moments', 'calm environment', 'stress-free'],
        icon: '🕊️',
        color: 'indigo'
      },
      'Adventure & Freedom': {
        keywords: ['freedom', 'independent', 'adventure', 'flexible', 'spontaneous', 'exciting', 'dynamic', 'change', 'variety'],
        phrases: ['complete freedom', 'flexible lifestyle', 'spontaneous adventures', 'no restrictions'],
        icon: '🦅',
        color: 'orange'
      }
    };

    // Score each theme
    Object.entries(themePatterns).forEach(([themeName, pattern]) => {
      let score = 0;
      let matchedElements = [];

      // Check keywords
      pattern.keywords.forEach(keyword => {
        if (lowercaseText.includes(keyword)) {
          score += 1;
          matchedElements.push(keyword);
        }
      });

      // Check phrases (higher weight)
      pattern.phrases.forEach(phrase => {
        if (lowercaseText.includes(phrase)) {
          score += 3;
          matchedElements.push(phrase);
        }
      });

      // If we found matches, add the theme
      if (score > 0) {
        detectedThemes.push({
          name: themeName,
          score: score,
          matchedElements: matchedElements.slice(0, 3), // Keep top 3 matches
          icon: pattern.icon,
          color: pattern.color,
          confidence: Math.min(Math.round((score / 5) * 100), 95) // Scale confidence
        });
      }
    });

    // Sort by score and return top themes
    return detectedThemes
      .sort((a, b) => b.score - a.score)
      .slice(0, 4); // Return top 4 themes
  };

  // AI-Powered Dream Analysis Function
  const analyzeDreamDescription = (text) => {
    if (!text || text.trim().length < 20) {
      return null;
    }

    const lowercaseText = text.toLowerCase();
    const words = lowercaseText.split(/\s+/);
    
    // Define keyword patterns for each archetype with weights
    const archetypePatterns = {
      'nomadic-freedom': {
        keywords: [
          'travel', 'explore', 'adventure', 'journey', 'nomad', 'wander', 'roam',
          'different countries', 'around the world', 'backpack', 'van life', 'rv',
          'digital nomad', 'location independent', 'road trip', 'cruise', 'sail',
          'experience', 'cultures', 'places', 'destinations', 'freedom', 'mobility',
          'flexible', 'move', 'relocate', 'temporary', 'seasonal'
        ],
        phrases: [
          'see the world', 'travel the world', 'explore different', 'live anywhere',
          'work remotely', 'location independence', 'no permanent address',
          'different cities', 'travel full time', 'house sitting'
        ],
        weight: 0,
        description: 'a life of travel and exploration',
        focus: 'funding your adventures and experiences rather than buying property'
      },
      
      'purpose-driven': {
        keywords: [
          'volunteer', 'teach', 'help', 'serve', 'give back', 'impact', 'mission',
          'nonprofit', 'charity', 'mentor', 'education', 'social', 'community service',
          'meaningful', 'purpose', 'calling', 'contribution', 'difference', 'change',
          'advocacy', 'justice', 'environment', 'conservation', 'healing', 'ministry'
        ],
        phrases: [
          'help others', 'make a difference', 'give back', 'meaningful work',
          'serve others', 'social impact', 'change the world', 'help people',
          'teach children', 'volunteer work', 'mission work', 'start a nonprofit'
        ],
        weight: 0,
        description: 'a life centered around meaningful contribution and service',
        focus: 'supporting your mission with the resources and funding you need to make an impact'
      },
      
      'rooted-living': {
        keywords: [
          'cottage', 'garden', 'settle', 'home', 'roots', 'community', 'neighborhood',
          'property', 'house', 'land', 'farm', 'homestead', 'peaceful', 'quiet',
          'stability', 'permanent', 'established', 'traditional', 'cozy', 'sanctuary',
          'retreat', 'privacy', 'solitude', 'small town', 'rural', 'countryside'
        ],
        phrases: [
          'settle down', 'put down roots', 'own a home', 'build a house',
          'permanent home', 'quiet life', 'peaceful place', 'my sanctuary',
          'grow old', 'retirement home', 'dream home', 'forever home'
        ],
        weight: 0,
        description: 'a permanently rooted lifestyle with deep community connections',
        focus: 'building wealth to purchase your ideal property and sustain your desired lifestyle'
      },
      
      'multi-base': {
        keywords: [
          'seasonal', 'winter home', 'summer house', 'second home', 'multiple',
          'split time', 'divide time', 'alternate', 'flexible', 'two homes',
          'seasonal migration', 'snowbird', 'different seasons', 'variety',
          'options', 'choice', 'flexibility', 'several places', 'climate'
        ],
        phrases: [
          'multiple homes', 'seasonal homes', 'split my time', 'winter and summer',
          'different places', 'variety of locations', 'flexible living',
          'follow the weather', 'seasonal travel', 'multiple bases'
        ],
        weight: 0,
        description: 'a flexible lifestyle with multiple home bases for different seasons or purposes',
        focus: 'managing multiple properties or flexible arrangements across different locations'
      },
      
      'community-centered': {
        keywords: [
          'family', 'grandchildren', 'children', 'parents', 'relatives', 'friends',
          'social', 'community', 'together', 'nearby', 'close', 'support',
          'senior community', 'retirement community', 'assisted living', 'care',
          'companionship', 'relationships', 'church', 'faith community', 'cultural'
        ],
        phrases: [
          'close to family', 'near my children', 'senior community', 'with friends',
          'retirement community', 'faith community', 'cultural community',
          'active adult', 'social activities', 'like-minded people'
        ],
        weight: 0,
        description: 'a lifestyle that prioritizes relationships and community connections',
        focus: 'choosing locations and arrangements that keep you close to the people who matter most'
      }
    };

    // Calculate keyword matches
    Object.keys(archetypePatterns).forEach(archetype => {
      const pattern = archetypePatterns[archetype];
      
      // Check individual keywords
      pattern.keywords.forEach(keyword => {
        if (lowercaseText.includes(keyword)) {
          pattern.weight += keyword.split(' ').length; // Multi-word keywords get more weight
        }
      });
      
      // Check phrases (higher weight)
      pattern.phrases.forEach(phrase => {
        if (lowercaseText.includes(phrase)) {
          pattern.weight += phrase.split(' ').length * 2; // Phrases get double weight
        }
      });
    });

    // Find the archetype with the highest weight
    const maxWeight = Math.max(...Object.values(archetypePatterns).map(p => p.weight));
    
    if (maxWeight === 0) {
      return {
        suggested: null,
        confidence: 0,
        explanation: "We couldn't identify a clear pattern in your description. Please choose an archetype that feels right to you, or provide more details about your ideal lifestyle."
      };
    }

    const suggestedArchetype = Object.keys(archetypePatterns).find(
      archetype => archetypePatterns[archetype].weight === maxWeight
    );

    const confidence = Math.min(Math.round((maxWeight / words.length) * 100), 95);
    const pattern = archetypePatterns[suggestedArchetype];

    return {
      suggested: suggestedArchetype,
      confidence: confidence,
      description: pattern.description,
      focus: pattern.focus,
      explanation: `Based on your description, we think you're envisioning ${pattern.description}. This means we'll focus on ${pattern.focus}.`,
      alternativesSuggested: Object.keys(archetypePatterns)
        .filter(arch => arch !== suggestedArchetype && archetypePatterns[arch].weight > 0)
        .sort((a, b) => archetypePatterns[b].weight - archetypePatterns[a].weight)
        .slice(0, 2)
    };
  };

  // Handle dream analysis with enhanced UX
  const handleAnalyzeDream = async () => {
    if (!formData.dreamDescription || formData.dreamDescription.trim().length < 50) {
      alert('Please write a more detailed description of your retirement vision (at least 50 characters) so we can analyze it.');
      return;
    }

    setAnalysisLoading(true);
    
    // Simulate AI processing time for realistic feel
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Detect themes first
    const themes = detectDreamThemes(formData.dreamDescription);
    setDetectedThemes(themes);
    
    // Then analyze for archetype matching
    const analysis = analyzeDreamDescription(formData.dreamDescription);
    
    // Enhanced analysis with theme integration
    const enhancedAnalysis = {
      ...analysis,
      themes: themes,
      processingTime: '2.3 seconds',
      wordCount: formData.dreamDescription.trim().split(/\s+/).length,
      complexity: themes.length > 3 ? 'Complex vision with multiple interests' : 'Focused vision with clear priorities'
    };
    
    setDreamAnalysis(enhancedAnalysis);
    setAnalysisLoading(false);
    setShowAnalysisModal(true);
  };

  // Enhanced archetype data with visual elements, taglines, and examples
  const getArchetypeCards = () => [
    {
      id: 'rooted-living',
      name: 'Rooted Living',
      icon: '🏡',
      tagline: 'One perfect place',
      subtitle: 'Create your permanent sanctuary',
      color: 'from-emerald-400 to-green-500',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      hoverBorderColor: 'hover:border-emerald-400',
      example: 'Like couples who buy vineyard properties in Tuscany or restore historic homes in charming New England towns',
      questionsPreview: [
        'What type of location appeals to you most?',
        'What type of home would make you feel most rooted?',
        'How important is having your own land or garden space?'
      ]
    },
    {
      id: 'nomadic-freedom',
      name: 'Nomadic Freedom',
      icon: '🧭',
      tagline: 'The world is your home',
      subtitle: 'Adventure without boundaries',
      color: 'from-blue-400 to-cyan-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      hoverBorderColor: 'hover:border-blue-400',
      example: 'Like teachers who spend each semester in a different country or retirees who RV across America following perfect weather',
      questionsPreview: [
        'What\'s your preferred travel style?',
        'Do you need a small home base for storage?',
        'What\'s your ideal travel pace?'
      ]
    },
    {
      id: 'purpose-driven',
      name: 'Purpose-Driven',
      icon: '💡',
      tagline: 'Make your mark',
      subtitle: 'Leave a meaningful legacy',
      color: 'from-purple-400 to-indigo-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      hoverBorderColor: 'hover:border-purple-400',
      example: 'Like executives who start nonprofit organizations or skilled professionals who teach in underserved communities',
      questionsPreview: [
        'What area of impact calls to you most?',
        'How do you prefer to contribute?',
        'What\'s your ideal time commitment level?'
      ]
    },
    {
      id: 'multi-base',
      name: 'Multi-Base',
      icon: '🗺️',
      tagline: 'Best of many worlds',
      subtitle: 'Flexibility and variety',
      color: 'from-orange-400 to-amber-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      hoverBorderColor: 'hover:border-orange-400',
      example: 'Like families with a ski condo in Colorado and beach house in Florida, or professionals who split time between city and countryside',
      questionsPreview: [
        'How many base locations would you ideally have?',
        'What\'s your main reason for multiple bases?',
        'What types of bases appeal to you?'
      ]
    },
    {
      id: 'community-centered',
      name: 'Community-Centered',
      icon: '🤝',
      tagline: 'Surrounded by what matters',
      subtitle: 'People come first',
      color: 'from-pink-400 to-rose-500',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      hoverBorderColor: 'hover:border-pink-400',
      example: 'Like grandparents who choose homes near their children or couples who join active adult communities with shared interests',
      questionsPreview: [
        'What\'s your top proximity priority?',
        'What type of community appeals to you?',
        'How involved do you want to be in community life?'
      ]
    }
  ];

  // Enhanced Archetype Card Component with hover preview
  const ArchetypeCard = ({ archetype, isRecommended, onClick }) => {
    const [showPreview, setShowPreview] = useState(false);

    return (
      <div 
        className="relative"
        onMouseEnter={() => setShowPreview(true)}
        onMouseLeave={() => setShowPreview(false)}
      >
        <button
          onClick={onClick}
          className={`w-full p-6 text-left rounded-2xl transition-all duration-300 border-2 ${
            isRecommended 
              ? `border-purple-400 ${archetype.bgColor} transform scale-105 shadow-lg` 
              : `${archetype.borderColor} ${archetype.hoverBorderColor} bg-white hover:bg-gray-50 hover:shadow-md transform hover:scale-105`
          }`}
        >
          {/* Large Icon */}
          <div className="flex justify-center mb-4">
            <div className="text-6xl">{archetype.icon}</div>
          </div>
          
          {/* Title and Tagline */}
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-gray-800 mb-1">{archetype.name}</h3>
            <p className="text-lg font-medium text-gray-600 italic">"{archetype.tagline}"</p>
          </div>
          
          {/* Gradient Line */}
          <div className={`h-1 bg-gradient-to-r ${archetype.color} rounded-full mb-4`}></div>
          
          {/* Example */}
          <div className="mb-4">
            <p className="text-sm text-gray-700 leading-relaxed">{archetype.example}</p>
          </div>
          
          {/* Recommended Badge */}
          {isRecommended && (
            <div className="flex justify-center">
              <span className="bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                ✨ Recommended for you
              </span>
            </div>
          )}
        </button>

        {/* Hover Preview */}
        {showPreview && (
          <div className="absolute z-50 top-full left-1/2 transform -translate-x-1/2 mt-2 w-80 bg-white rounded-xl shadow-xl border-2 border-gray-200 p-4">
            <div className="text-center mb-3">
              <h4 className="font-semibold text-gray-800">Questions you'll be asked:</h4>
            </div>
            <ul className="space-y-2">
              {archetype.questionsPreview.map((question, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-gray-400 text-xs mt-1">•</span>
                  <span className="text-sm text-gray-600">{question}</span>
                </li>
              ))}
            </ul>
            <div className="text-center mt-3">
              <span className="text-xs text-gray-500">Click to choose this path</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Check if current archetype has all required fields completed
  const isArchetypeComplete = () => {
    if (!formData.selectedArchetype) return false;
    
    const requiredFields = getArchetypeQuestions(formData.selectedArchetype);
    return requiredFields.every(question => {
      const value = formData[question.id];
      return value && value.trim() !== '';
    });
  };

  // Check if Zone 1 (dream description) is complete
  const isZone1Complete = () => {
    return formData.dreamDescription && formData.dreamDescription.trim().length >= 50;
  };

  // Check if Zone 2 (archetype selection) is complete
  const isZone2Complete = () => {
    return formData.selectedArchetype && formData.selectedArchetype.trim() !== '';
  };

  // Check if Zone 3 (archetype-specific questions) is complete
  const isZone3Complete = () => {
    return isZone2Complete() && isArchetypeComplete();
  };

  // Check if all zones are complete
  const areAllZonesComplete = () => {
    return isZone1Complete() && isZone2Complete() && isZone3Complete();
  };

  // Get validation errors for incomplete zones
  const getValidationErrors = () => {
    const errors = [];
    
    if (!isZone1Complete()) {
      errors.push({
        zone: 1,
        message: 'Please describe your retirement vision above to continue',
        action: 'Add more details to your dream description (at least 50 characters)'
      });
    }
    
    if (!isZone2Complete()) {
      errors.push({
        zone: 2,
        message: 'Choose your retirement path to proceed',
        action: 'Select one of the lifestyle archetypes'
      });
    }
    
    if (isZone2Complete() && !isZone3Complete()) {
      const incompleteFields = getArchetypeQuestions(formData.selectedArchetype)
        .filter(question => !formData[question.id] || formData[question.id].trim() === '')
        .map(question => question.label);
      
      errors.push({
        zone: 3,
        message: 'Please complete all fields for your chosen path',
        action: `Complete these fields: ${incompleteFields.join(', ')}`,
        incompleteFields
      });
    }
    
    return errors;
  };

  // Navigate to next step with loading state
  const goToNextStep = async () => {
    if (!areAllZonesComplete()) return;
    
    setIsNavigating(true);
    
    // Simulate brief processing time for visual feedback
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setCurrentStep(2);
    setIsNavigating(false);
  };

  // Handle accepting the suggested archetype
  const handleAcceptSuggestion = (archetype) => {
    updateFormData('selectedArchetype', archetype);
    
    // Set the dream description based on the archetype if not custom
    if (archetype !== 'custom') {
      const archetypeDescriptions = {
        'rooted-living': 'A permanent home base where I can establish deep roots in a community, create a sanctuary that reflects my values, and build lasting relationships with neighbors and local institutions.',
        'nomadic-freedom': 'A life of travel and adventure where I can explore different places, experience diverse cultures, and have the freedom to move wherever my curiosity leads me.',
        'purpose-driven': 'A life centered around meaningful work and contribution, whether through volunteering, teaching, starting social ventures, or pursuing a mission that makes a positive impact on the world.',
        'multi-base': 'A flexible lifestyle with multiple home bases - perhaps a primary residence and seasonal homes, or the ability to split time between different locations that serve different needs and seasons of life.',
        'community-centered': 'A life that prioritizes relationships and community, whether that means being close to family, choosing a senior-friendly community, or living in an intentional community that shares my values and interests.'
      };
      
      if (!formData.dreamDescription.includes(archetypeDescriptions[archetype])) {
        updateFormData('dreamDescription', 
          formData.dreamDescription + '\n\n' + archetypeDescriptions[archetype]
        );
      }
    }
    
    setShowAnalysisModal(false);
    setDreamAnalysis(null);
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
    
    // Handle both old structure (object with propertyCost) and new structure (string ID)
    let averageCost = 0;
    if (typeof formData.selectedLifestyle === 'string') {
      // New structure - lifestyle is just an ID, need to calculate based on annual spending
      const totalAnnualSpending = Object.values(formData.annualSpending || {})
        .reduce((sum, value) => sum + (parseInt(value) || 0), 0);
      averageCost = totalAnnualSpending * 25; // Using 4% rule (25x annual expenses)
    } else if (formData.selectedLifestyle?.propertyCost) {
      // Old structure - lifestyle object with property cost
      averageCost = (formData.selectedLifestyle.propertyCost.min + formData.selectedLifestyle.propertyCost.max) / 2;
    }
    
    return calculateAchievementAge(formData.currentAge, averageCost, income);
  }, [formData.currentAge, formData.selectedLifestyle, formData.incomeRange, formData.annualSpending, useIncomeRange]);

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

      if (!formData.selectedLifestyle && !formData.selectedArchetype) {
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
      const currentAge = Math.max(18, Math.min(80, parseInt(formData.currentAge) || 30)); // Clamp age between 18-80
      const retirementAge = Math.max(currentAge + 1, 65); // Ensure retirement age is at least 1 year after current age
      
      console.log('📅 Age calculations:', {
        formDataCurrentAge: formData.currentAge,
        parsedCurrentAge: parseInt(formData.currentAge),
        clampedCurrentAge: currentAge,
        retirementAge
      });
      
      // Use archetype-based cost calculation
      let lifecycleCosts;
      let estimatedPropertyCost = 0;
      let annualLivingCosts = 0;
      
      if (formData.selectedArchetype) {
        // Use new archetype-based calculation
        lifecycleCosts = calculateLifestyleCosts(formData.selectedArchetype, formData, formData.selectedState);
        console.log('🏛️ Archetype-based costs:', lifecycleCosts);
        
        estimatedPropertyCost = lifecycleCosts.propertyCost ? 
          (lifecycleCosts.propertyCost.min + lifecycleCosts.propertyCost.max) / 2 : 0;
        
        // Calculate total annual spending from user inputs first
        const totalAnnualSpending = Object.values(formData.annualSpending)
          .filter(val => val && !isNaN(parseFloat(val)))
          .reduce((sum, val) => sum + parseFloat(val), 0);
        
        // Use user input if available, otherwise use archetype calculation
        annualLivingCosts = totalAnnualSpending > 0 ? 
          totalAnnualSpending : lifecycleCosts.annualCosts;
          
      } else if (formData.selectedLifestyle) {
        // Fallback to old lifestyle calculation for backward compatibility
        estimatedPropertyCost = (formData.selectedLifestyle.propertyCost.min + formData.selectedLifestyle.propertyCost.max) / 2;
        
        const totalAnnualSpending = Object.values(formData.annualSpending)
          .filter(val => val && !isNaN(parseFloat(val)))
          .reduce((sum, val) => sum + parseFloat(val), 0);
        
        annualLivingCosts = totalAnnualSpending > 0 ? 
          totalAnnualSpending : (formData.selectedLifestyle.annualExpenses.min + formData.selectedLifestyle.annualExpenses.max) / 2;
      }
      
      // Calculate required portfolio using 4% rule (25x annual expenses)
      const requiredPortfolio = annualLivingCosts * 25;
      
      // Total Someday Life target calculation depends on archetype
      let requiredNetWorth;
      if (lifecycleCosts?.costStructure === 'annual-only') {
        // For nomadic lifestyle - no property, just portfolio for annual expenses
        requiredNetWorth = requiredPortfolio;
      } else {
        // Traditional: Property + Portfolio for financial independence
        requiredNetWorth = estimatedPropertyCost + requiredPortfolio;
      }
      
      // Calculate disposable income (after taxes and living expenses)
      const netAnnualIncome = totalIncome * 0.78; // After taxes
      const currentLivingExpenses = Math.min(netAnnualIncome * 0.7, 50000); // Estimate current expenses
      const disposableIncome = Math.max(0, netAnnualIncome - currentLivingExpenses);
      
      // Calculate monthly savings needed with validation
      const workingYears = Math.max(1, retirementAge - currentAge); // Ensure at least 1 year
      const monthlySavingsNeeded = workingYears > 0 ? requiredNetWorth / (workingYears * 12) : 0;

      console.log('💰 Financial calculations:', {
        disposableIncome,
        requiredNetWorth,
        monthlySavingsNeeded
      });

      // Create comprehensive profile with career context and archetype
      const userProfile = new UserProfile({
        age: currentAge,
        lifestyleArchetype: formData.selectedArchetype, // Store archetype in profile
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
      // Check if Someday Life goal already exists - handle smoothly without modal
      const existingSomedayLife = DreamService.getSomedayLifeGoal()
      
      if (existingSomedayLife) {
        console.log('Updating existing Someday Life goal:', existingSomedayLife.title, '→', northStarDream.title)
        // Silently replace - this is expected behavior in the flow
        DreamService.deleteDream(existingSomedayLife.id)
      }
      
      // Convert NorthStarDream to DreamService format
      const dreamServiceGoal = {
        title: northStarDream.title,
        description: northStarDream.description,
        type: 'someday_life',
        target_amount: northStarDream.requiredNetWorth,
        property_cost: northStarDream.estimatedCost,
        annual_expenses: northStarDream.totalAnnualCost,
        target_date: (() => {
          try {
            // Validate timeline value before creating date
            const timeline = northStarDream.timeline || 1; // Default to 1 year if invalid
            const currentYear = new Date().getFullYear();
            const targetYear = currentYear + Math.max(1, Math.min(50, timeline)); // Clamp between 1-50 years
            const targetDate = new Date(targetYear, 11, 31); // December 31st of target year
            
            // Validate the created date
            if (isNaN(targetDate.getTime())) {
              console.warn('Invalid target date created, using fallback');
              return new Date(currentYear + 10, 11, 31).toISOString(); // 10 years from now as fallback
            }
            
            return targetDate.toISOString();
          } catch (error) {
            console.error('Error creating target date:', error);
            // Fallback to 10 years from now
            return new Date(new Date().getFullYear() + 10, 11, 31).toISOString();
          }
        })(),
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
        
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        
        .zone-unlock {
          animation: zoneUnlock 1.2s ease-out forwards;
        }
        
        .attention-pulse {
          animation: attentionPulse 2s ease-in-out infinite;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes zoneUnlock {
          0% {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
            border-color: #e5e7eb;
          }
          50% {
            transform: translateY(-10px) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes attentionPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4);
          }
          50% {
            box-shadow: 0 0 0 20px rgba(139, 92, 246, 0);
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto px-4">
        <ProgressIndicator />

        {/* Step 1: Dream Capture - Three Zone Layout */}
        {currentStep === 1 && (
          <div className="space-y-12">
            {/* Header Section */}
            <div className="text-center mb-12">
              <h3 className="text-4xl font-bold text-gray-900 mb-6">{getSomedayBuilderContent('stepIntro', 'Envision Your Someday Life')}</h3>
              <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
                This is different from other savings goals - we're designing your complete lifestyle transformation for when work becomes optional.
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6 max-w-3xl mx-auto">
                <p className="text-blue-800 text-lg">
                  💡 <strong>Key Insight:</strong> Instead of just saving for retirement, we're calculating both the assets you'll need (like property) 
                  AND the portfolio required to sustain your ideal annual spending forever using the 4% rule.
                </p>
              </div>
            </div>

            {/* ZONE 1: Dream Articulation (40% of screen) */}
            <div className={`relative transition-all duration-700 ${
              formData.dreamDescription && formData.dreamDescription.trim().length >= 50 
                ? 'bg-green-50 border-green-200' 
                : 'bg-white border-gray-200 attention-pulse'
            } border-2 rounded-3xl p-8 shadow-lg hover:shadow-xl`}>
              {/* Zone Indicator */}
              <div className="absolute -top-4 left-8 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                <span className="text-sm font-semibold text-gray-600">Zone 1</span>
              </div>
              
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl">✨</span>
                  </div>
                  <h4 className="text-3xl font-bold text-gray-900">Start with Your Dream</h4>
                </div>
                <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
                  Close your eyes and imagine your perfect retirement day. What do you see yourself doing? 
                  Where are you? Who's with you? What brings you joy?
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="relative">
                  <textarea
                    value={formData.dreamDescription}
                    onChange={(e) => updateFormData('dreamDescription', e.target.value)}
                    rows={12}
                    className={`w-full p-8 text-xl leading-relaxed resize-none rounded-2xl transition-all duration-300 ${
                      formData.dreamDescription && formData.dreamDescription.trim().length >= 50
                        ? 'border-2 border-green-400 bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100'
                        : 'border-2 border-gray-300 bg-gray-50 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 focus:bg-white'
                    } focus:outline-none`}
placeholder={getSomedayBuilderContent('dreamPlaceholder', 'Describe your ideal retirement lifestyle...')}
                  />
                  
                  {/* Character count indicator */}
                  <div className="absolute bottom-4 right-4 flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      formData.dreamDescription && formData.dreamDescription.trim().length >= 50 
                        ? 'bg-green-500' 
                        : 'bg-gray-300'
                    }`}></div>
                    <span className={`text-sm font-medium ${
                      formData.dreamDescription && formData.dreamDescription.trim().length >= 50 
                        ? 'text-green-600' 
                        : 'text-gray-400'
                    }`}>
                      {formData.dreamDescription ? formData.dreamDescription.trim().length : 0}/50
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {formData.dreamDescription && formData.dreamDescription.trim().length >= 50 ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">✓</span>
                        </div>
                        <span className="font-semibold">Ready to analyze your vision!</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-500">
                        <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                        <span>Share your dream to unlock AI analysis</span>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={handleAnalyzeDream}
                    disabled={!formData.dreamDescription || formData.dreamDescription.trim().length < 50 || analysisLoading}
                    className={`flex items-center gap-3 px-10 py-5 rounded-2xl font-bold text-lg transition-all transform ${
                      formData.dreamDescription && formData.dreamDescription.trim().length >= 50 && !analysisLoading
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 hover:scale-105 shadow-xl hover:shadow-2xl'
                        : analysisLoading
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white cursor-wait scale-105'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {analysisLoading ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Understanding your vision...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-6 h-6" />
                        Analyze My Dream with AI
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* ZONE 2: Archetype Selection (Progressive Disclosure) */}
            {formData.dreamDescription && formData.dreamDescription.trim().length >= 50 && (
              <div className={`relative transition-all duration-1000 zone-unlock ${
                formData.selectedArchetype 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-gray-50 border-gray-200 attention-pulse'
              } border-2 rounded-3xl p-8 shadow-lg hover:shadow-xl`}>
                {/* Zone Indicator */}
                <div className="absolute -top-4 left-8 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                  <span className="text-sm font-semibold text-gray-600">Zone 2</span>
                </div>
                
                {/* Zone unlock animation */}
                <div className="absolute -top-6 right-8 animate-bounce">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">🔓</span>
                  </div>
                </div>
                
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <h4 className="text-3xl font-bold text-gray-900">Choose Your Path</h4>
                  </div>
                  <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
                    Based on what you've shared, here are lifestyle paths that might resonate with your vision. 
                    Choose the one that feels most aligned with your dreams.
                  </p>
                </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {/* Rooted Living */}
                <button
                  onClick={() => {
                    updateFormData('selectedArchetype', 'rooted-living');
                    updateFormData('dreamDescription', 'A permanent home base where I can establish deep roots in a community, create a sanctuary that reflects my values, and build lasting relationships with neighbors and local institutions.');
                  }}
                  className={`group bg-white rounded-xl p-4 border-2 transition-all duration-300 hover:shadow-lg ${
                    formData.selectedArchetype === 'rooted-living' 
                      ? 'border-emerald-400 bg-emerald-50' 
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="w-full h-24 bg-gradient-to-br from-emerald-200 to-green-300 rounded-xl flex items-center justify-center mb-3">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7l-10-5zM7 18v-7h10v7H7z"/>
                      <path d="M8 11h8v2H8z"/>
                    </svg>
                  </div>
                  <h5 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                    Rooted Living
                  </h5>
                  <p className="text-emerald-700 text-sm font-medium mt-1">
                    Create your permanent sanctuary
                  </p>
                  <p className="text-gray-600 text-xs mt-1">
                    Deep roots, lasting connections, and a home that reflects your values
                  </p>
                </button>

                {/* Nomadic Freedom */}
                <button
                  onClick={() => {
                    updateFormData('selectedArchetype', 'nomadic-freedom');
                    updateFormData('dreamDescription', 'A life of travel and adventure where I can explore different places, experience diverse cultures, and have the freedom to move wherever my curiosity leads me.');
                  }}
                  className={`group bg-white rounded-xl p-4 border-2 transition-all duration-300 hover:shadow-lg ${
                    formData.selectedArchetype === 'nomadic-freedom' 
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="w-full h-24 bg-gradient-to-br from-blue-200 to-cyan-300 rounded-xl flex items-center justify-center mb-3">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                      <path d="M9 12l2 2 4-4"/>
                    </svg>
                  </div>
                  <h5 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    Nomadic Freedom
                  </h5>
                  <p className="text-blue-700 text-sm font-medium mt-1">
                    Adventure without boundaries
                  </p>
                  <p className="text-gray-600 text-xs mt-1">
                    Explore the world, experience cultures, live wherever curiosity leads
                  </p>
                </button>

                {/* Purpose-Driven */}
                <button
                  onClick={() => {
                    updateFormData('selectedArchetype', 'purpose-driven');
                    updateFormData('dreamDescription', 'A life centered around meaningful work and contribution, whether through volunteering, teaching, starting social ventures, or pursuing a mission that makes a positive impact on the world.');
                  }}
                  className={`group bg-white rounded-xl p-4 border-2 transition-all duration-300 hover:shadow-lg ${
                    formData.selectedArchetype === 'purpose-driven' 
                      ? 'border-purple-400 bg-purple-50' 
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="w-full h-24 bg-gradient-to-br from-purple-200 to-indigo-300 rounded-xl flex items-center justify-center mb-3">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <h5 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                    Purpose-Driven
                  </h5>
                  <p className="text-purple-700 text-sm font-medium mt-1">
                    Make your mark on the world
                  </p>
                  <p className="text-gray-600 text-xs mt-1">
                    Dedicate your time to causes that matter and create lasting impact
                  </p>
                </button>

                {/* Multi-Base */}
                <button
                  onClick={() => {
                    updateFormData('selectedArchetype', 'multi-base');
                    updateFormData('dreamDescription', 'A flexible lifestyle with multiple home bases - perhaps a primary residence and seasonal homes, or the ability to split time between different locations that serve different needs and seasons of life.');
                  }}
                  className={`group bg-white rounded-xl p-4 border-2 transition-all duration-300 hover:shadow-lg ${
                    formData.selectedArchetype === 'multi-base' 
                      ? 'border-orange-400 bg-orange-50' 
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className="w-full h-24 bg-gradient-to-br from-orange-200 to-amber-300 rounded-xl flex items-center justify-center mb-3">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/>
                      <path d="M7 14h2v2H7z M15 14h2v2h-2z"/>
                    </svg>
                  </div>
                  <h5 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                    Multi-Base
                  </h5>
                  <p className="text-orange-700 text-sm font-medium mt-1">
                    Flexibility and variety
                  </p>
                  <p className="text-gray-600 text-xs mt-1">
                    Why choose one place? Enjoy seasonal homes and location freedom
                  </p>
                </button>

                {/* Community-Centered */}
                <button
                  onClick={() => {
                    updateFormData('selectedArchetype', 'community-centered');
                    updateFormData('dreamDescription', 'A life that prioritizes relationships and community, whether that means being close to family, choosing a senior-friendly community, or living in an intentional community that shares my values and interests.');
                  }}
                  className={`group bg-white rounded-xl p-4 border-2 transition-all duration-300 hover:shadow-lg ${
                    formData.selectedArchetype === 'community-centered' 
                      ? 'border-pink-400 bg-pink-50' 
                      : 'border-gray-200 hover:border-pink-300'
                  }`}
                >
                  <div className="w-full h-24 bg-gradient-to-br from-pink-200 to-rose-300 rounded-xl flex items-center justify-center mb-3">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 7c0-2.21-1.79-4-4-4S8 4.79 8 7s1.79 4 4 4 4-1.79 4-4zM12 14c-3.31 0-6 2.69-6 6h12c0-3.31-2.69-6-6-6z"/>
                      <circle cx="18.5" cy="8.5" r="2.5"/>
                      <path d="M21 16c0-1.66-1.34-3-3-3s-3 1.34-3 3"/>
                    </svg>
                  </div>
                  <h5 className="text-lg font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
                    Community-Centered
                  </h5>
                  <p className="text-pink-700 text-sm font-medium mt-1">
                    Surrounded by what matters most
                  </p>
                  <p className="text-gray-600 text-xs mt-1">
                    Place relationships at the center of your retirement lifestyle
                  </p>
                </button>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-500">Choose an archetype above, or continue customizing your vision below</p>
              </div>
              </div>
            )}

            {/* ZONE 3: Specific Details (Only after archetype selection) */}
            {formData.selectedArchetype && (
              <div className="relative transition-all duration-1000 zone-unlock bg-purple-50 border-2 border-purple-200 rounded-3xl p-8 shadow-lg hover:shadow-xl">
                {/* Zone Indicator */}
                <div className="absolute -top-4 left-8 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                  <span className="text-sm font-semibold text-gray-600">Zone 3</span>
                </div>
                
                {/* Zone unlock animation */}
                <div className="absolute -top-6 right-8 animate-bounce">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✨</span>
                  </div>
                </div>
                
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🔍</span>
                    </div>
                    <h4 className="text-3xl font-bold text-gray-900">
                      Perfect Your {formData.selectedArchetype.replace('-', ' ')} Vision
                    </h4>
                  </div>
                  <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
                    Now let's get specific about your {formData.selectedArchetype.replace('-', ' ')} path. 
                    These details will help us create a precise financial plan for your retirement lifestyle.
                  </p>
                </div>
                
                <div className="bg-white rounded-2xl p-8 border border-purple-200">
                  <div className="space-y-8">
                    {getArchetypeQuestions(formData.selectedArchetype).map((question, index) => (
                      <div 
                        key={question.id}
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 150}ms` }}
                      >
                      <DynamicFormField
                        question={question}
                        value={formData[question.id]}
                        onChange={updateFormData}
                        hasError={!formData[question.id] || formData[question.id].trim() === ''}
                      />
                      </div>
                    ))}
                  </div>
                  
                </div>
              </div>
            )}

            {/* Smart Navigation Section */}
            <div className="mt-8">
              {/* Validation Errors Display */}
              {!areAllZonesComplete() && (
                <div className="mb-6 space-y-4">
                  {getValidationErrors().map((error, index) => (
                    <div key={index} className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-yellow-600 text-sm font-semibold">{error.zone}</span>
                        </div>
                        <div>
                          <p className="text-yellow-800 font-medium mb-1">{error.message}</p>
                          <p className="text-yellow-700 text-sm">{error.action}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Contextual Transition Message */}
              {areAllZonesComplete() && (
                <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <h4 className="text-xl font-bold text-green-800 mb-2">Perfect! Your Vision is Complete</h4>
                    <p className="text-green-700 leading-relaxed">
                      You've painted a clear picture of your <strong>{formData.selectedArchetype.replace('-', ' ')}</strong> retirement. 
                      Now let's understand your current financial position to map the journey from here to there.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Button */}
              {formData.selectedArchetype && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
                      <span className="text-blue-600 text-sm font-medium">Step 1 of 3 Complete</span>
                      <div className="w-6 h-2 bg-blue-200 rounded-full overflow-hidden">
                        <div className="w-2 h-full bg-blue-600 rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {areAllZonesComplete() ? (
                    <button
                      onClick={goToNextStep}
                      disabled={isNavigating}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg"
                    >
                      {isNavigating ? (
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Preparing your financial snapshot...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <span>Continue to Financial Reality Check</span>
                          <span className="text-xl">→</span>
                        </div>
                      )}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-gray-300 text-gray-500 py-4 px-8 rounded-xl font-semibold text-lg cursor-not-allowed"
                    >
                      Complete all sections above to continue
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Lifestyle Examples with Annual Spending */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-4 mb-6">
                <p className="text-sm text-gray-700">
                  <strong>Step 2 of 3:</strong> First, let's paint a picture of your ideal retirement
                </p>
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-4">Design Your Someday Life</h3>
              <p className="text-lg text-gray-600 mb-6">
                Choose your ideal lifestyle and define your annual spending for complete financial independence.
              </p>
              
              {/* Step 2: Annual Spending Definition */}
              <div className="space-y-8">
                
                {/* Annual Spending Categories */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                  <h4 className="text-xl font-bold text-gray-800 mb-4">Your Future Retirement Expenses</h4>
                  <p className="text-gray-600 mb-4">
                    Estimate what you'll spend annually once you're living your nomadic freedom lifestyle
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Important:</strong> These are NOT your current expenses - imagine you're already retired and living this life. 
                      What would you spend annually on housing, travel, experiences, and everything else?
                    </p>
                  </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          💰 Basic Living (Housing, Utilities, Groceries, Insurance)
                        </label>
                        <input
                          type="number"
                          value={formData.annualSpending?.basicLiving || ''}
                          onChange={(e) => updateFormData('annualSpending', {
                            ...formData.annualSpending,
                            basicLiving: e.target.value
                          })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                          placeholder="Annual amount"
                          min="0"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          🎨 Hobbies & Interests (Recreation, Entertainment, Personal)
                        </label>
                        <input
                          type="number"
                          value={formData.annualSpending?.hobbiesInterests || ''}
                          onChange={(e) => updateFormData('annualSpending', {
                            ...formData.annualSpending,
                            hobbiesInterests: e.target.value
                          })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                          placeholder="Annual amount"
                          min="0"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ✈️ Travel & Experiences (Travel, Dining, Special Events)
                        </label>
                        <input
                          type="number"
                          value={formData.annualSpending?.travelExperiences || ''}
                          onChange={(e) => updateFormData('annualSpending', {
                            ...formData.annualSpending,
                            travelExperiences: e.target.value
                          })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                          placeholder="Annual amount"
                          min="0"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          🏥 Health & Wellness (Healthcare, Fitness, Wellness)
                        </label>
                        <input
                          type="number"
                          value={formData.annualSpending?.healthWellness || ''}
                          onChange={(e) => updateFormData('annualSpending', {
                            ...formData.annualSpending,
                            healthWellness: e.target.value
                          })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                          placeholder="Annual amount"
                          min="0"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          👨‍👩‍👧‍👦 Family & Giving (Family Support, Charity, Gifts)
                        </label>
                        <input
                          type="number"
                          value={formData.annualSpending?.familyGiving || ''}
                          onChange={(e) => updateFormData('annualSpending', {
                            ...formData.annualSpending,
                            familyGiving: e.target.value
                          })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                          placeholder="Annual amount"
                          min="0"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          🛡️ Emergency Buffer (Unexpected Expenses, Inflation)
                        </label>
                        <input
                          type="number"
                          value={formData.annualSpending?.emergencyBuffer || ''}
                          onChange={(e) => updateFormData('annualSpending', {
                            ...formData.annualSpending,
                            emergencyBuffer: e.target.value
                          })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                          placeholder="Annual amount"
                          min="0"
                        />
                      </div>
                    </div>
                    
                    {/* Total Calculation */}
                    <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                      <h5 className="font-semibold text-gray-800 mb-2">Total Annual Spending Target:</h5>
                      <p className="text-2xl font-bold text-blue-600">
                        ${(
                          (parseInt(formData.annualSpending?.basicLiving) || 0) +
                          (parseInt(formData.annualSpending?.hobbiesInterests) || 0) +
                          (parseInt(formData.annualSpending?.travelExperiences) || 0) +
                          (parseInt(formData.annualSpending?.healthWellness) || 0) +
                          (parseInt(formData.annualSpending?.familyGiving) || 0) +
                          (parseInt(formData.annualSpending?.emergencyBuffer) || 0)
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>

                {/* Navigation */}
                <div className="flex justify-between pt-6">
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Back to Vision
                  </button>
                  <button
                    onClick={() => {
                      // Auto-determine lifestyle based on annual spending and archetype
                      const totalSpending = Object.values(formData.annualSpending || {})
                        .reduce((sum, value) => sum + (parseInt(value) || 0), 0);
                      
                      let lifestyleLevel = 'modest';
                      if (totalSpending > 100000) lifestyleLevel = 'luxurious';
                      else if (totalSpending > 60000) lifestyleLevel = 'comfortable';
                      
                      updateFormData('selectedLifestyle', lifestyleLevel);
                      handleNext();
                    }}
                    disabled={Object.values(formData.annualSpending || {}).every(value => !value || value === '')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Financial Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Financial Reality & Career Context */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {(() => {
              // Step 3 Data Validation
              const requiredFields = ['selectedArchetype'];
              const missingFields = requiredFields.filter(field => !formData[field]);
              
              // Check if annual spending has at least one field filled
              const hasAnySpending = Object.values(formData.annualSpending || {}).some(value => value && value !== '');
              if (!hasAnySpending) {
                missingFields.push('annualSpending');
              }
              
              if (missingFields.length > 0) {
                return (
                  <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">⚠️</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Missing Required Information</h3>
                    <p className="text-gray-600 mb-6">
                      Please complete the previous steps to continue. Missing: {missingFields.join(', ')}
                    </p>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Go Back to Step 2
                    </button>
                  </div>
                );
              }
              
              return null;
            })()}
            
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-4 mb-6">
                <p className="text-sm text-gray-700">
                  <strong>Step 3 of 3:</strong> Now let's understand where you're starting from today
                </p>
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-4">Let's Get to Know You</h3>
              <p className="text-lg text-gray-600 mb-4">
                Your current situation helps us create a realistic plan for achieving your retirement goals.
              </p>
            </div>
            
            {/* Step 3 Content */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What's your current age?
                </label>
                <input
                  type="number"
                  value={formData.currentAge}
                  onChange={(e) => updateFormData('currentAge', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Enter your age"
                  min="18"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What's your current annual income?
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
                  <input
                    type="text"
                    value={formData.incomeRange ? formatIncomeInput(formData.incomeRange.toString()) : ''}
                    onChange={handleIncomeChange}
                    className="w-full p-3 pl-8 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="75,000"
                  />
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Median income for your age group: $65,000
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What state do you live in?
                </label>
                <select
                  value={formData.selectedState}
                  onChange={(e) => updateFormData('selectedState', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select your state...</option>
                  <option value="CA">California</option>
                  <option value="NY">New York</option>
                  <option value="TX">Texas</option>
                  <option value="FL">Florida</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={handleBack}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={calculateFinalResults}
                disabled={!formData.currentAge || !formData.incomeRange || !formData.selectedState}
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
      
      {/* Dream Analysis Modal */}
    {showAnalysisModal && dreamAnalysis && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">AI Dream Analysis Complete</h3>
                <p className="text-gray-600">
                  {dreamAnalysis.wordCount && dreamAnalysis.processingTime && dreamAnalysis.complexity
                    ? `Analyzed ${dreamAnalysis.wordCount} words in ${dreamAnalysis.processingTime} • ${dreamAnalysis.complexity}`
                    : 'Understanding your retirement vision'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAnalysisModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Detected Themes Section */}
          {dreamAnalysis.themes && dreamAnalysis.themes.length > 0 && (
            <div className="mb-8">
              <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">🧠</span>
                We noticed these themes in your vision:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dreamAnalysis.themes.map((theme, index) => (
                  <div key={index} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{theme.icon}</span>
                      <div>
                        <h5 className="font-semibold text-gray-800">{theme.name}</h5>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full bg-${theme.color}-500`}></div>
                          <span className="text-sm text-gray-600">{theme.confidence}% confidence</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Detected: </span>
                      {theme.matchedElements.slice(0, 3).join(', ')}
                      {theme.matchedElements.length > 3 && '...'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {dreamAnalysis.suggested ? (
            <>
              {/* Main Recommendation */}
              <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border-2 border-purple-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">AI</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">Recommended Path</h4>
                    <p className="text-gray-600">Based on your themes, we suggest exploring:</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-purple-200 mb-4">
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${
                      dreamAnalysis.suggested === 'rooted-living' ? 'from-emerald-400 to-green-500' :
                      dreamAnalysis.suggested === 'nomadic-freedom' ? 'from-blue-400 to-cyan-500' :
                      dreamAnalysis.suggested === 'purpose-driven' ? 'from-purple-400 to-indigo-500' :
                      dreamAnalysis.suggested === 'multi-base' ? 'from-orange-400 to-amber-500' :
                      'from-pink-400 to-rose-500'
                    }`} />
                    <h5 className="text-2xl font-bold text-gray-900">
                      {dreamAnalysis.suggested.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')} Path
                    </h5>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      dreamAnalysis.confidence >= 80 ? 'bg-green-100 text-green-700' :
                      dreamAnalysis.confidence >= 60 ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {dreamAnalysis.confidence}% match
                    </span>
                  </div>
                  <p className="text-gray-700 text-lg leading-relaxed mb-4">{dreamAnalysis.explanation}</p>
                  
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleAcceptSuggestion(dreamAnalysis.suggested)}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all font-semibold text-lg transform hover:scale-105"
                    >
                      🚀 Yes! Let's explore this path
                    </button>
                    <button
                      onClick={() => setShowAnalysisModal(false)}
                      className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                    >
                      Let me refine my dream first
                    </button>
                  </div>
                </div>
              </div>

              {/* Alternative Paths */}
              {dreamAnalysis.alternativesSuggested && dreamAnalysis.alternativesSuggested.length > 0 && (
                <div className="mb-8">
                  <h5 className="text-lg font-semibold text-gray-800 mb-6">{getSomedayBuilderContent('alternativePaths', 'Other paths that might resonate:')}</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {dreamAnalysis.alternativesSuggested.map(archetypeId => {
                      const archetypeData = getArchetypeCards().find(a => a.id === archetypeId);
                      return archetypeData ? (
                        <ArchetypeCard
                          key={archetypeId}
                          archetype={archetypeData}
                          isRecommended={false}
                          onClick={() => handleAcceptSuggestion(archetypeId)}
                        />
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* No Clear Match - Enhanced */
            <div className="mb-8 p-6 bg-yellow-50 rounded-2xl border-2 border-yellow-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 text-2xl">🤔</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">We need more details to guide you</h4>
                  <p className="text-gray-600">Your vision shows promise, but we'd love to understand it better</p>
                </div>
              </div>
              <p className="text-gray-700 text-lg mb-6">{dreamAnalysis.explanation}</p>
              <button
                onClick={() => setShowAnalysisModal(false)}
                className="bg-yellow-500 text-white px-6 py-3 rounded-xl hover:bg-yellow-600 transition-colors font-semibold"
              >
                I'll add more details to my dream
              </button>
            </div>
          )}

          {/* All Paths Available */}
          <div className="border-t border-gray-200 pt-6">
            <h5 className="text-lg font-semibold text-gray-800 mb-6">{getSomedayBuilderContent('explorePaths', 'Or explore any path that interests you:')}</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getArchetypeCards().map(archetype => (
                <ArchetypeCard
                  key={archetype.id}
                  archetype={archetype}
                  isRecommended={dreamAnalysis.suggested === archetype.id}
                  onClick={() => handleAcceptSuggestion(archetype.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};

export default SomedayLifeBuilder;
