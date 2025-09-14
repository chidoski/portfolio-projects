/**
 * Local Storage Service
 * Provides functions for managing dream drafts and saved dreams in localStorage
 * Includes error handling for storage quota and data corruption issues
 */

// Storage keys
const STORAGE_KEYS = {
  DREAM_DRAFT: 'dreamDraft',
  DREAMS: 'dreams',
  LAST_SAVE: 'lastSave'
}

/**
 * Check if localStorage is available and functional
 * @returns {boolean} True if localStorage is available
 */
function isLocalStorageAvailable() {
  try {
    const test = '__localStorage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch (e) {
    return false
  }
}

/**
 * Generate a unique ID for dreams
 * @returns {string} Unique identifier
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

/**
 * Safely parse JSON with error handling
 * @param {string} jsonString - JSON string to parse
 * @param {*} fallback - Fallback value if parsing fails
 * @returns {*} Parsed object or fallback
 */
function safeJsonParse(jsonString, fallback = null) {
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    console.warn('Failed to parse JSON from localStorage:', error)
    return fallback
  }
}

/**
 * Safely stringify object with error handling
 * @param {*} data - Data to stringify
 * @returns {string|null} JSON string or null if failed
 */
function safeJsonStringify(data) {
  try {
    return JSON.stringify(data)
  } catch (error) {
    console.error('Failed to stringify data:', error)
    return null
  }
}

/**
 * Get available storage space (approximate)
 * @returns {number} Available space in bytes (approximate)
 */
function getStorageSpace() {
  if (!isLocalStorageAvailable()) return 0
  
  try {
    // Test with increasingly large strings to estimate available space
    let testSize = 1024 * 1024 // Start with 1MB
    const testKey = '__storage_test__'
    
    while (testSize > 0) {
      try {
        const testData = 'x'.repeat(testSize)
        localStorage.setItem(testKey, testData)
        localStorage.removeItem(testKey)
        return testSize
      } catch (e) {
        testSize = Math.floor(testSize * 0.8) // Reduce by 20%
      }
    }
    return 0
  } catch (error) {
    return 0
  }
}

/**
 * Save dream draft to localStorage
 * @param {Object} dreamData - Dream form data to save
 * @returns {Object} Result object with success status and message
 */
export function saveDreamDraft(dreamData) {
  if (!isLocalStorageAvailable()) {
    return {
      success: false,
      error: 'localStorage is not available in this browser',
      code: 'STORAGE_UNAVAILABLE'
    }
  }

  try {
    // Validate input
    if (!dreamData || typeof dreamData !== 'object') {
      return {
        success: false,
        error: 'Invalid dream data provided',
        code: 'INVALID_DATA'
      }
    }

    // Add metadata
    const draftData = {
      ...dreamData,
      savedAt: new Date().toISOString(),
      version: '1.0'
    }

    const jsonString = safeJsonStringify(draftData)
    if (!jsonString) {
      return {
        success: false,
        error: 'Failed to serialize dream data',
        code: 'SERIALIZATION_ERROR'
      }
    }

    // Check if we have enough space (rough estimate)
    const estimatedSize = jsonString.length * 2 // UTF-16 encoding
    const availableSpace = getStorageSpace()
    
    if (availableSpace > 0 && estimatedSize > availableSpace) {
      return {
        success: false,
        error: 'Not enough storage space available',
        code: 'QUOTA_EXCEEDED',
        details: {
          required: estimatedSize,
          available: availableSpace
        }
      }
    }

    localStorage.setItem(STORAGE_KEYS.DREAM_DRAFT, jsonString)
    localStorage.setItem(STORAGE_KEYS.LAST_SAVE, new Date().toISOString())

    return {
      success: true,
      message: 'Dream draft saved successfully',
      savedAt: draftData.savedAt
    }

  } catch (error) {
    // Handle quota exceeded error
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      return {
        success: false,
        error: 'Storage quota exceeded. Please clear some browser data and try again.',
        code: 'QUOTA_EXCEEDED',
        originalError: error.message
      }
    }

    // Handle other storage errors
    return {
      success: false,
      error: 'Failed to save dream draft',
      code: 'STORAGE_ERROR',
      originalError: error.message
    }
  }
}

/**
 * Load dream draft from localStorage
 * @returns {Object|null} Dream draft data or null if not found
 */
export function loadDreamDraft() {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage is not available')
    return null
  }

  try {
    const draftString = localStorage.getItem(STORAGE_KEYS.DREAM_DRAFT)
    
    if (!draftString) {
      return null
    }

    const draftData = safeJsonParse(draftString)
    
    if (!draftData) {
      console.warn('Failed to parse dream draft from localStorage')
      // Clear corrupted data
      clearDreamDraft()
      return null
    }

    // Validate draft structure
    if (typeof draftData !== 'object' || !draftData.savedAt) {
      console.warn('Invalid dream draft structure')
      clearDreamDraft()
      return null
    }

    // Check if draft is too old (older than 30 days)
    const savedDate = new Date(draftData.savedAt)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    
    if (savedDate < thirtyDaysAgo) {
      console.info('Dream draft is older than 30 days, clearing it')
      clearDreamDraft()
      return null
    }

    return draftData

  } catch (error) {
    console.error('Error loading dream draft:', error)
    // Clear potentially corrupted data
    clearDreamDraft()
    return null
  }
}

/**
 * Clear dream draft from localStorage
 * @returns {Object} Result object with success status
 */
export function clearDreamDraft() {
  if (!isLocalStorageAvailable()) {
    return {
      success: false,
      error: 'localStorage is not available',
      code: 'STORAGE_UNAVAILABLE'
    }
  }

  try {
    localStorage.removeItem(STORAGE_KEYS.DREAM_DRAFT)
    return {
      success: true,
      message: 'Dream draft cleared successfully'
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to clear dream draft',
      code: 'STORAGE_ERROR',
      originalError: error.message
    }
  }
}

/**
 * Save a completed dream to the dreams array in localStorage
 * @param {Object} dreamData - Complete dream data
 * @returns {Object} Result object with success status and dream ID
 */
export function saveDream(dreamData) {
  if (!isLocalStorageAvailable()) {
    return {
      success: false,
      error: 'localStorage is not available in this browser',
      code: 'STORAGE_UNAVAILABLE'
    }
  }

  try {
    // Validate input
    if (!dreamData || typeof dreamData !== 'object') {
      return {
        success: false,
        error: 'Invalid dream data provided',
        code: 'INVALID_DATA'
      }
    }

    // Load existing dreams
    const existingDreams = loadDreams()

    // Create new dream with metadata
    const newDream = {
      ...dreamData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      progress: 0,
      version: '1.0'
    }

    // Add to dreams array
    const updatedDreams = [...existingDreams, newDream]

    const jsonString = safeJsonStringify(updatedDreams)
    if (!jsonString) {
      return {
        success: false,
        error: 'Failed to serialize dreams data',
        code: 'SERIALIZATION_ERROR'
      }
    }

    // Check storage space
    const estimatedSize = jsonString.length * 2
    const availableSpace = getStorageSpace()
    
    if (availableSpace > 0 && estimatedSize > availableSpace) {
      return {
        success: false,
        error: 'Not enough storage space available',
        code: 'QUOTA_EXCEEDED',
        details: {
          required: estimatedSize,
          available: availableSpace
        }
      }
    }

    localStorage.setItem(STORAGE_KEYS.DREAMS, jsonString)

    return {
      success: true,
      message: 'Dream saved successfully',
      dreamId: newDream.id,
      dream: newDream
    }

  } catch (error) {
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      return {
        success: false,
        error: 'Storage quota exceeded. Please clear some browser data and try again.',
        code: 'QUOTA_EXCEEDED',
        originalError: error.message
      }
    }

    return {
      success: false,
      error: 'Failed to save dream',
      code: 'STORAGE_ERROR',
      originalError: error.message
    }
  }
}

/**
 * Load all dreams from localStorage
 * @returns {Array} Array of dreams or empty array if none found
 */
export function loadDreams() {
  if (!isLocalStorageAvailable()) {
    return []
  }

  try {
    const dreamsString = localStorage.getItem(STORAGE_KEYS.DREAMS)
    
    if (!dreamsString) {
      return []
    }

    const dreams = safeJsonParse(dreamsString, [])
    
    // Validate that it's an array
    if (!Array.isArray(dreams)) {
      console.warn('Dreams data is not an array, resetting')
      localStorage.removeItem(STORAGE_KEYS.DREAMS)
      return []
    }

    return dreams

  } catch (error) {
    console.error('Error loading dreams:', error)
    return []
  }
}

/**
 * Update an existing dream
 * @param {string} dreamId - ID of dream to update
 * @param {Object} updates - Updates to apply
 * @returns {Object} Result object with success status
 */
export function updateDream(dreamId, updates) {
  if (!isLocalStorageAvailable()) {
    return {
      success: false,
      error: 'localStorage is not available',
      code: 'STORAGE_UNAVAILABLE'
    }
  }

  try {
    const dreams = loadDreams()
    const dreamIndex = dreams.findIndex(dream => dream.id === dreamId)

    if (dreamIndex === -1) {
      return {
        success: false,
        error: 'Dream not found',
        code: 'DREAM_NOT_FOUND'
      }
    }

    // Update dream
    dreams[dreamIndex] = {
      ...dreams[dreamIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    const jsonString = safeJsonStringify(dreams)
    if (!jsonString) {
      return {
        success: false,
        error: 'Failed to serialize dreams data',
        code: 'SERIALIZATION_ERROR'
      }
    }

    localStorage.setItem(STORAGE_KEYS.DREAMS, jsonString)

    return {
      success: true,
      message: 'Dream updated successfully',
      dream: dreams[dreamIndex]
    }

  } catch (error) {
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      return {
        success: false,
        error: 'Storage quota exceeded',
        code: 'QUOTA_EXCEEDED'
      }
    }

    return {
      success: false,
      error: 'Failed to update dream',
      code: 'STORAGE_ERROR',
      originalError: error.message
    }
  }
}

/**
 * Delete a dream
 * @param {string} dreamId - ID of dream to delete
 * @returns {Object} Result object with success status
 */
export function deleteDream(dreamId) {
  if (!isLocalStorageAvailable()) {
    return {
      success: false,
      error: 'localStorage is not available',
      code: 'STORAGE_UNAVAILABLE'
    }
  }

  try {
    const dreams = loadDreams()
    const filteredDreams = dreams.filter(dream => dream.id !== dreamId)

    if (dreams.length === filteredDreams.length) {
      return {
        success: false,
        error: 'Dream not found',
        code: 'DREAM_NOT_FOUND'
      }
    }

    const jsonString = safeJsonStringify(filteredDreams)
    if (!jsonString) {
      return {
        success: false,
        error: 'Failed to serialize dreams data',
        code: 'SERIALIZATION_ERROR'
      }
    }

    localStorage.setItem(STORAGE_KEYS.DREAMS, jsonString)

    return {
      success: true,
      message: 'Dream deleted successfully'
    }

  } catch (error) {
    return {
      success: false,
      error: 'Failed to delete dream',
      code: 'STORAGE_ERROR',
      originalError: error.message
    }
  }
}

/**
 * Get storage usage statistics
 * @returns {Object} Storage usage information
 */
export function getStorageStats() {
  if (!isLocalStorageAvailable()) {
    return {
      available: false,
      error: 'localStorage not available'
    }
  }

  try {
    let totalSize = 0
    let itemCount = 0
    const items = {}

    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const value = localStorage.getItem(key)
        const size = value ? value.length * 2 : 0 // UTF-16 encoding
        items[key] = size
        totalSize += size
        itemCount++
      }
    }

    return {
      available: true,
      totalSize: totalSize,
      itemCount: itemCount,
      items: items,
      availableSpace: getStorageSpace(),
      dreamDraftExists: !!localStorage.getItem(STORAGE_KEYS.DREAM_DRAFT),
      dreamsCount: loadDreams().length
    }

  } catch (error) {
    return {
      available: true,
      error: error.message
    }
  }
}

/**
 * Clear all dream-related data from localStorage
 * @returns {Object} Result object with success status
 */
export function clearAllDreamData() {
  if (!isLocalStorageAvailable()) {
    return {
      success: false,
      error: 'localStorage is not available',
      code: 'STORAGE_UNAVAILABLE'
    }
  }

  try {
    localStorage.removeItem(STORAGE_KEYS.DREAM_DRAFT)
    localStorage.removeItem(STORAGE_KEYS.DREAMS)
    localStorage.removeItem(STORAGE_KEYS.LAST_SAVE)

    return {
      success: true,
      message: 'All dream data cleared successfully'
    }

  } catch (error) {
    return {
      success: false,
      error: 'Failed to clear dream data',
      code: 'STORAGE_ERROR',
      originalError: error.message
    }
  }
}
