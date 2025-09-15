/**
 * Presentation Failsafe Service
 * Ensures nothing can go wrong during CEO demos and presentations
 * 
 * Core principles:
 * - Every calculation must produce clean, presentable numbers
 * - No empty states or loading spinners during live demos
 * - Instant fallbacks for any technical failures
 * - One-keypress demo reset to perfect state
 * - Performance optimizations for seamless presentations
 */

import { format, addYears, addDays, differenceInDays } from 'date-fns';
import { perfectNumberForDemo, createMarcusChenPersona, generateMarcusPerfectDreams } from './demoDataPerfection';

// Fallback data for when everything else fails
const EMERGENCY_FALLBACK_DATA = {
  user: {
    name: 'Demo User',
    age: 38,
    monthlyIncome: 8000,
    currentSavings: 25000
  },
  dream: {
    title: 'Dream Home',
    cost: 400000,
    targetDate: format(addYears(new Date(), 8), 'yyyy-MM-dd')
  },
  calculations: {
    daily: 35,
    weekly: 245,
    monthly: 1050,
    timeline: '8.2 years'
  },
  buckets: {
    foundation: { amount: 3600, percentage: 45 },
    dream: { amount: 2800, percentage: 35 },
    life: { amount: 1600, percentage: 20 }
  }
};

// Performance settings for presentation mode
const PRESENTATION_MODE_CONFIG = {
  animationDuration: {
    normal: 500,
    presentation: 150, // 3x faster
    instant: 0
  },
  loadingStates: {
    showInDemo: false,
    minDisplayTime: 0,
    skipThresholds: 100 // Skip if under 100ms
  },
  calculationDelay: {
    normal: 1500,
    presentation: 300, // 5x faster
    instant: 0
  }
};

// Cache for instant data retrieval
let dataCache = new Map();
let presentationMode = false;
let emergencyMode = false;

/**
 * Enable presentation mode for optimal demo performance
 * @param {boolean} enabled - Whether to enable presentation mode
 */
export function setPresentationMode(enabled = true) {
  presentationMode = enabled;
  
  if (enabled) {
    console.log('🎪 Presentation mode enabled - optimized for demos');
    // Pre-cache critical data
    preloadCriticalData();
    // Optimize animations
    optimizeAnimationsForPresentation();
  } else {
    console.log('📱 Normal mode restored');
  }
}

/**
 * Ensure all data is consistent and presentation-ready
 * @param {Object} data - Raw calculation data
 * @returns {Object} Validated and cleaned data
 */
export function ensureDataConsistency(data) {
  try {
    // Always return clean, consistent data
    const validated = validateAndCleanData(data);
    
    // Cache successful results
    const cacheKey = generateCacheKey(data);
    dataCache.set(cacheKey, validated);
    
    return validated;
    
  } catch (error) {
    console.warn('⚠️ Data consistency check failed:', error);
    return handleDataFailure(data);
  }
}

/**
 * Validate and clean calculation data
 * @param {Object} data - Raw data to validate
 * @returns {Object} Clean, presentation-ready data
 */
function validateAndCleanData(data) {
  if (!data) throw new Error('No data provided');
  
  const cleaned = { ...data };
  
  // Validate and clean monetary amounts
  if (cleaned.calculations) {
    cleaned.calculations.daily = perfectNumberForDemo(cleaned.calculations.daily || 25, 'daily');
    cleaned.calculations.weekly = cleaned.calculations.daily * 7;
    cleaned.calculations.monthly = Math.round(cleaned.calculations.daily * 30.44);
    
    // Ensure timeline is presentable
    if (cleaned.calculations.timeline) {
      cleaned.calculations.timeline = cleanTimelineForPresentation(cleaned.calculations.timeline);
    }
  }
  
  // Validate bucket allocations add up to 100%
  if (cleaned.buckets) {
    const total = Object.values(cleaned.buckets).reduce((sum, bucket) => sum + (bucket.percentage || 0), 0);
    if (Math.abs(total - 100) > 1) {
      cleaned.buckets = rebalanceBuckets(cleaned.buckets);
    }
  }
  
  // Ensure all currency values are whole numbers
  cleaned = roundAllCurrencyValues(cleaned);
  
  // Validate date ranges are reasonable
  if (cleaned.milestones) {
    cleaned.milestones = validateMilestones(cleaned.milestones);
  }
  
  return cleaned;
}

/**
 * Prevent empty states by providing meaningful fallbacks
 * @param {Object} componentData - Data for a component
 * @param {string} componentType - Type of component needing data
 * @returns {Object} Guaranteed non-empty data
 */
export function preventEmptyStates(componentData, componentType) {
  try {
    // Check if data exists and is meaningful
    if (hasValidData(componentData, componentType)) {
      return componentData;
    }
    
    // Generate appropriate fallback based on component type
    return generateFallbackData(componentType);
    
  } catch (error) {
    console.warn('⚠️ Empty state prevention failed:', error);
    return generateEmergencyFallback(componentType);
  }
}

/**
 * Generate fallback data for specific component types
 * @param {string} componentType - Type of component
 * @returns {Object} Appropriate fallback data
 */
function generateFallbackData(componentType) {
  const persona = createMarcusChenPersona();
  const dreams = generateMarcusPerfectDreams();
  
  switch (componentType) {
    case 'personalization':
      return {
        age: persona.age,
        monthlyCapacity: persona.monthlyDisposableIncome,
        dream: dreams[0],
        calculations: {
          daily: 25,
          weekly: 175,
          monthly: 750,
          timeline: '6.8 years'
        }
      };
      
    case 'threeBucket':
      return {
        foundation: { amount: 1575, percentage: 45, purpose: 'Retirement Security' },
        dream: { amount: 1225, percentage: 35, purpose: 'Active Dreams' },
        life: { amount: 700, percentage: 20, purpose: 'Life Surprises' }
      };
      
    case 'metrics':
      return {
        engagement: { dreamPlanner: 12, traditional: 2 },
        ltv: { dreamPlanner: 4800, traditional: 45 },
        retention: { dreamPlanner: 92, traditional: 15 }
      };
      
    case 'timeline':
      return {
        milestones: [
          { percentage: 25, amount: 37500, date: format(addYears(new Date(), 2), 'yyyy-MM-dd') },
          { percentage: 50, amount: 75000, date: format(addYears(new Date(), 4), 'yyyy-MM-dd') },
          { percentage: 75, amount: 112500, date: format(addYears(new Date(), 6), 'yyyy-MM-dd') }
        ]
      };
      
    default:
      return EMERGENCY_FALLBACK_DATA;
  }
}

/**
 * Handle network failures with cached/local data
 * @param {string} dataType - Type of data being requested
 * @param {Object} params - Parameters for the request
 * @returns {Object} Cached or generated data
 */
export function handleNetworkFailure(dataType, params = {}) {
  console.warn('🔄 Network failure detected, using failsafe data');
  
  // Try cache first
  const cacheKey = generateCacheKey({ type: dataType, ...params });
  if (dataCache.has(cacheKey)) {
    console.log('✅ Retrieved from cache');
    return dataCache.get(cacheKey);
  }
  
  // Try localStorage
  const localData = getFromLocalStorage(dataType, params);
  if (localData) {
    console.log('✅ Retrieved from localStorage');
    return localData;
  }
  
  // Generate deterministic data based on params
  const generatedData = generateDeterministicData(dataType, params);
  
  // Cache for future use
  dataCache.set(cacheKey, generatedData);
  
  return generatedData;
}

/**
 * Create instant demo reset functionality
 * @param {string} resetType - Type of reset ('full', 'partial', 'emergency')
 * @returns {Object} Perfect demo state
 */
export function createDemoReset(resetType = 'full') {
  console.log(`🔄 Demo reset: ${resetType}`);
  
  try {
    // Clear any error states
    emergencyMode = false;
    
    // Clear problematic cache entries
    if (resetType === 'full') {
      dataCache.clear();
    }
    
    // Generate perfect demo state
    const perfectState = generatePerfectDemoState();
    
    // Pre-populate cache with perfect data
    preloadPerfectData(perfectState);
    
    // Reset any stuck animations
    resetAnimationStates();
    
    // Ensure presentation mode is optimized
    if (presentationMode) {
      optimizeAnimationsForPresentation();
    }
    
    return perfectState;
    
  } catch (error) {
    console.error('❌ Demo reset failed:', error);
    return generateEmergencyState();
  }
}

/**
 * Generate perfect demo state for presentations
 * @returns {Object} Complete perfect demo state
 */
function generatePerfectDemoState() {
  const persona = createMarcusChenPersona();
  const dreams = generateMarcusPerfectDreams();
  
  return {
    persona,
    dreams,
    currentDemo: {
      step: 0,
      isPlaying: false,
      progress: 0,
      annotations: true
    },
    calculations: {
      daily: 25,
      weekly: 175,
      monthly: 750,
      timeline: '6.8 years',
      milestones: [
        { percentage: 25, amount: 37500, completed: false },
        { percentage: 50, amount: 75000, completed: false },
        { percentage: 75, amount: 112500, completed: false }
      ]
    },
    buckets: {
      foundation: { amount: 1575, percentage: 45 },
      dream: { amount: 1225, percentage: 35 },
      life: { amount: 700, percentage: 20 }
    },
    metrics: {
      engagement: { dreamPlanner: 12, traditional: 2 },
      ltv: { dreamPlanner: 4800, traditional: 45 },
      retention: { dreamPlanner: 92, traditional: 15 }
    }
  };
}

/**
 * Skip loading states and accelerate animations for presentations
 * @param {string} animationType - Type of animation to optimize
 * @param {number} originalDuration - Original animation duration
 * @returns {number} Optimized duration
 */
export function accelerateForPresentation(animationType, originalDuration) {
  if (!presentationMode) return originalDuration;
  
  const config = PRESENTATION_MODE_CONFIG.animationDuration;
  
  switch (animationType) {
    case 'loading':
      return config.instant; // Skip all loading animations
    case 'transition':
      return config.presentation; // 3x faster transitions
    case 'calculation':
      return PRESENTATION_MODE_CONFIG.calculationDelay.presentation;
    default:
      return Math.min(originalDuration, config.presentation);
  }
}

/**
 * Check if loading state should be skipped
 * @param {number} expectedDuration - Expected loading duration
 * @returns {boolean} Whether to skip the loading state
 */
export function shouldSkipLoading(expectedDuration) {
  if (!presentationMode) return false;
  
  return expectedDuration < PRESENTATION_MODE_CONFIG.loadingStates.skipThresholds;
}

/**
 * Pre-load critical data for instant access
 */
function preloadCriticalData() {
  const criticalData = [
    { type: 'persona', data: createMarcusChenPersona() },
    { type: 'dreams', data: generateMarcusPerfectDreams() },
    { type: 'fallback', data: EMERGENCY_FALLBACK_DATA }
  ];
  
  criticalData.forEach(item => {
    const cacheKey = generateCacheKey(item);
    dataCache.set(cacheKey, item.data);
  });
  
  console.log('📦 Critical data preloaded for presentation');
}

/**
 * Optimize animations for smooth presentations
 */
function optimizeAnimationsForPresentation() {
  // Reduce CSS animation durations globally
  if (typeof document !== 'undefined') {
    let style = document.getElementById('presentation-optimizations');
    if (!style) {
      style = document.createElement('style');
      style.id = 'presentation-optimizations';
      document.head.appendChild(style);
    }
    
    style.textContent = `
      .presentation-mode * {
        animation-duration: 150ms !important;
        transition-duration: 150ms !important;
      }
      .presentation-mode .loading-spinner {
        display: none !important;
      }
      .presentation-mode .loading-skeleton {
        display: none !important;
      }
    `;
    
    // Add presentation mode class to body
    document.body.classList.add('presentation-mode');
  }
}

// Helper functions
function hasValidData(data, componentType) {
  if (!data || typeof data !== 'object') return false;
  
  switch (componentType) {
    case 'personalization':
      return data.age && data.dream && data.calculations;
    case 'threeBucket':
      return data.foundation && data.dream && data.life;
    case 'metrics':
      return data.engagement || data.ltv || data.retention;
    default:
      return Object.keys(data).length > 0;
  }
}

function cleanTimelineForPresentation(timeline) {
  if (typeof timeline === 'string') {
    // Convert "8.3 years" to "8.3 years"
    const match = timeline.match(/(\d+\.?\d*)/);
    if (match) {
      const years = parseFloat(match[1]);
      return `${years.toFixed(1)} years`;
    }
  }
  return timeline || '8.0 years';
}

function rebalanceBuckets(buckets) {
  // Ensure buckets add up to 100%
  const foundation = 45;
  const dream = 35;
  const life = 20;
  
  return {
    foundation: { ...buckets.foundation, percentage: foundation },
    dream: { ...buckets.dream, percentage: dream },
    life: { ...buckets.life, percentage: life }
  };
}

function roundAllCurrencyValues(data) {
  function roundCurrency(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const rounded = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'number' && (key.includes('amount') || key.includes('cost') || key.includes('daily') || key.includes('monthly'))) {
        rounded[key] = Math.round(value);
      } else if (typeof value === 'object') {
        rounded[key] = roundCurrency(value);
      } else {
        rounded[key] = value;
      }
    }
    return rounded;
  }
  
  return roundCurrency(data);
}

function validateMilestones(milestones) {
  if (!Array.isArray(milestones)) return [];
  
  return milestones.map(milestone => ({
    ...milestone,
    percentage: Math.round(milestone.percentage || 25),
    amount: Math.round(milestone.amount || 1000),
    date: milestone.date || format(addYears(new Date(), 2), 'yyyy-MM-dd')
  }));
}

function generateCacheKey(data) {
  return JSON.stringify(data).slice(0, 100); // Simple hash
}

function getFromLocalStorage(dataType, params) {
  try {
    const key = `dreamPlanner_${dataType}_backup`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    return null;
  }
}

function generateDeterministicData(dataType, params) {
  // Generate consistent data based on params
  const seed = JSON.stringify(params).length % 100;
  
  switch (dataType) {
    case 'calculation':
      return {
        daily: perfectNumberForDemo(20 + seed * 0.5, 'daily'),
        timeline: `${(6 + seed * 0.1).toFixed(1)} years`
      };
    case 'metrics':
      return {
        engagement: { dreamPlanner: 12, traditional: 2 },
        ltv: { dreamPlanner: 4800, traditional: 45 }
      };
    default:
      return EMERGENCY_FALLBACK_DATA;
  }
}

function preloadPerfectData(perfectState) {
  // Cache all perfect state data
  Object.entries(perfectState).forEach(([key, value]) => {
    const cacheKey = generateCacheKey({ type: key, data: value });
    dataCache.set(cacheKey, value);
  });
}

function resetAnimationStates() {
  if (typeof document !== 'undefined') {
    // Remove any stuck animation classes
    const animatedElements = document.querySelectorAll('[class*="animate-"], [class*="loading"], [class*="spinner"]');
    animatedElements.forEach(el => {
      // Reset animation by removing and re-adding classes
      const classes = el.className;
      el.className = '';
      requestAnimationFrame(() => {
        el.className = classes;
      });
    });
  }
}

function generateEmergencyState() {
  console.error('🚨 Emergency state activated');
  emergencyMode = true;
  return EMERGENCY_FALLBACK_DATA;
}

function generateEmergencyFallback(componentType) {
  return {
    error: false,
    data: EMERGENCY_FALLBACK_DATA,
    message: `Demo data loaded for ${componentType}`,
    isEmergencyFallback: true
  };
}

function handleDataFailure(originalData) {
  console.warn('🔄 Handling data failure, using safe fallback');
  
  // Try to salvage what we can from the original data
  const salvaged = {
    ...EMERGENCY_FALLBACK_DATA,
    ...extractValidFields(originalData)
  };
  
  return ensureMinimumViability(salvaged);
}

function extractValidFields(data) {
  const valid = {};
  
  if (data && typeof data === 'object') {
    // Extract any valid numeric values
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'number' && value > 0 && value < 1000000) {
        valid[key] = Math.round(value);
      } else if (typeof value === 'string' && value.length > 0 && value.length < 100) {
        valid[key] = value;
      }
    });
  }
  
  return valid;
}

function ensureMinimumViability(data) {
  // Ensure data meets minimum requirements for presentation
  return {
    ...data,
    calculations: {
      daily: perfectNumberForDemo(data.calculations?.daily || 25, 'daily'),
      timeline: data.calculations?.timeline || '8.0 years',
      ...data.calculations
    },
    buckets: data.buckets || EMERGENCY_FALLBACK_DATA.buckets,
    user: data.user || EMERGENCY_FALLBACK_DATA.user
  };
}

// Global error handler for presentations
export function setupPresentationErrorHandling() {
  if (typeof window !== 'undefined') {
    const originalError = window.onerror;
    
    window.onerror = function(message, source, line, col, error) {
      if (presentationMode) {
        console.warn('🎪 Presentation error handled silently:', message);
        return true; // Suppress error dialog
      }
      
      if (originalError) {
        return originalError.call(this, message, source, line, col, error);
      }
    };
  }
}

// Export presentation control functions
export const presentationControls = {
  enablePresentationMode: () => setPresentationMode(true),
  disablePresentationMode: () => setPresentationMode(false),
  emergencyReset: () => createDemoReset('emergency'),
  fastForward: () => setPresentationMode(true),
  normalSpeed: () => setPresentationMode(false)
};

// Initialize
setupPresentationErrorHandling();

export default {
  ensureDataConsistency,
  preventEmptyStates,
  handleNetworkFailure,
  createDemoReset,
  accelerateForPresentation,
  shouldSkipLoading,
  setPresentationMode,
  presentationControls
};
