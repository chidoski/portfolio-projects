/**
 * Centralized Dream Management Service
 * Provides standardized methods for dream CRUD operations
 * All components should use these methods instead of directly accessing localStorage
 * 
 * CRITICAL: Implements data hierarchy protection to prevent accidental deletion of core goals
 * 
 * Data Hierarchy:
 * - 'primarySomedayLife': The one and only foundational retirement vision (PROTECTED)
 * - 'lifeMilestones': Life events and journey milestones (editable)
 * - 'secondaryDreams': Additional aspirational goals (editable)
 * 
 * Legacy Goal Types (for backward compatibility):
 * - 'someday_life': Major life change goals with property cost and annual expenses
 * - 'milestone': Single purchase or achievement goals
 * - 'investment': Financial investment or savings goals
 */

// Migration flag to ensure migration runs only once
const MIGRATION_KEY = 'dreams_migration_v2_completed'
const DATA_PROTECTION_ENABLED = true

// Import recovery service
import { DataRecoveryService } from './dataRecoveryService.js'

export const DreamService = {
  /**
   * Get all dreams from localStorage (with migration)
   * @returns {Array} Array of dream objects
   */
  getAllDreams: () => {
    try {
      // Run migration if not completed
      DreamService.runMigrationIfNeeded()
      return JSON.parse(localStorage.getItem('dreams') || '[]')
    } catch (error) {
      console.error('Error parsing dreams from localStorage:', error)
      return []
    }
  },

  /**
   * Save a new dream to localStorage with data protection
   * @param {Object} dream - Dream object to save
   * @returns {Array} Updated dreams array
   */
  saveDream: (dream) => {
    try {
      // Create backup before saving
      if (DATA_PROTECTION_ENABLED) {
        DataRecoveryService.createBackup()
      }
      
      const dreams = DreamService.getAllDreams()
      
      // Validate Someday Life constraint
      if (dream.type === 'someday_life') {
        const existingSomedayLife = dreams.find(d => d.type === 'someday_life')
        if (existingSomedayLife) {
          // Instead of throwing error, offer replacement
          const replace = confirm(`You already have a Someday Life goal: "${existingSomedayLife.title}"\n\nWould you like to replace it with: "${dream.title}"?`)
          if (replace) {
            return DreamService.replaceSomedayLifeGoal(dream)
          } else {
            throw new Error('SOMEDAY_LIFE_EXISTS')
          }
        }
      }
      
      // Ensure unique ID
      const newDream = {
        ...dream,
        id: dream.id || DreamService.generateUniqueId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        progress: 0,
        type: dream.type || DreamService.inferDreamType(dream)
      }
      
      dreams.push(newDream)
      localStorage.setItem('dreams', JSON.stringify(dreams))
      
      console.log(`💾 Saved new dream: ${newDream.title} (${newDream.type})`)
      return dreams
    } catch (error) {
      console.error('Error saving dream:', error)
      throw error
    }
  },

  /**
   * Delete a dream by ID with data protection
   * @param {string|number} id - Dream ID to delete
   * @returns {Array} Updated dreams array
   */
  deleteDream: (id) => {
    try {
      // Create backup before any deletion
      if (DATA_PROTECTION_ENABLED) {
        DataRecoveryService.createBackup()
      }
      
      const dreams = DreamService.getAllDreams()
      const dreamToDelete = dreams.find(d => d.id === id)
      
      if (!dreamToDelete) {
        console.warn('Dream not found for deletion:', id)
        return dreams
      }
      
      // CRITICAL PROTECTION: Prevent deletion of primary Someday Life
      if (dreamToDelete.type === 'someday_life') {
        const confirmMessage = `🚨 CRITICAL WARNING 🚨

You are about to delete your core Someday Life vision: "${dreamToDelete.title}"

This is your foundational retirement plan that everything else builds upon.

To change your Someday Life vision, please use the Someday Life Builder instead.

Are you absolutely sure you want to DELETE this permanently?`
        
        if (!confirm(confirmMessage)) {
          console.log('🛡️ Someday Life deletion cancelled by user')
          return dreams
        }
        
        // If user really wants to delete, show second confirmation
        const finalConfirm = confirm('This will remove your entire financial foundation.\n\nType "DELETE" in the next prompt to confirm.')
        if (!finalConfirm) {
          console.log('🛡️ Someday Life deletion cancelled on second confirmation')
          return dreams
        }
        
        const deleteConfirmation = prompt('Type "DELETE" to permanently remove your Someday Life:')
        if (deleteConfirmation !== 'DELETE') {
          console.log('🛡️ Someday Life deletion cancelled - incorrect confirmation')
          return dreams
        }
        
        console.log('⚠️ User confirmed Someday Life deletion with triple confirmation')
      }
      
      // Perform deletion
      const updatedDreams = dreams.filter(d => d.id !== id)
      localStorage.setItem('dreams', JSON.stringify(updatedDreams))
      
      console.log(`🗑️ Deleted dream: ${dreamToDelete.title} (${dreamToDelete.type})`)
      return updatedDreams
      
    } catch (error) {
      console.error('Error deleting dream:', error)
      throw error
    }
  },

  /**
   * Update an existing dream
   * @param {string|number} id - Dream ID to update
   * @param {Object} updates - Properties to update
   * @returns {Array} Updated dreams array
   */
  updateDream: (id, updates) => {
    try {
      const dreams = DreamService.getAllDreams()
      const index = dreams.findIndex(d => d.id === id)
      if (index !== -1) {
        dreams[index] = {
          ...dreams[index],
          ...updates,
          updatedAt: new Date().toISOString()
        }
        localStorage.setItem('dreams', JSON.stringify(dreams))
      }
      return dreams
    } catch (error) {
      console.error('Error updating dream:', error)
      throw error
    }
  },

  /**
   * Get a single dream by ID
   * @param {string|number} id - Dream ID to find
   * @returns {Object|null} Dream object or null if not found
   */
  getDreamById: (id) => {
    try {
      const dreams = DreamService.getAllDreams()
      return dreams.find(d => d.id === id) || null
    } catch (error) {
      console.error('Error getting dream by ID:', error)
      return null
    }
  },

  /**
   * Get dreams with deduplication based on title and target_amount
   * @returns {Array} Array of unique dream objects
   */
  getUniqueDreams: () => {
    try {
      const dreams = DreamService.getAllDreams()
      return dreams.filter((dream, index, self) => 
        index === self.findIndex(d => d.title === dream.title && d.target_amount === dream.target_amount)
      )
    } catch (error) {
      console.error('Error getting unique dreams:', error)
      return []
    }
  },

  /**
   * Clear all dreams from localStorage
   * @returns {Array} Empty array
   */
  clearAllDreams: () => {
    try {
      localStorage.removeItem('dreams')
      localStorage.removeItem(MIGRATION_KEY)
      return []
    } catch (error) {
      console.error('Error clearing dreams:', error)
      throw error
    }
  },

  /**
   * Generate a unique ID for dreams
   * @returns {string} Unique identifier
   */
  generateUniqueId: () => {
    return `dream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },

  /**
   * Infer dream type from dream properties
   * @param {Object} dream - Dream object
   * @returns {string} Dream type
   */
  inferDreamType: (dream) => {
    // Check for Someday Life indicators
    if (dream.title && dream.title.toLowerCase().includes('someday life')) {
      return 'someday_life'
    }
    if (dream.property_cost || dream.annual_expenses || dream.living_expenses_per_year) {
      return 'someday_life'
    }
    if (dream.title && (dream.title.toLowerCase().includes('retirement') || dream.title.toLowerCase().includes('financial independence'))) {
      return 'someday_life'
    }
    
    // Check for investment indicators
    if (dream.category === 'investment' || dream.title?.toLowerCase().includes('investment')) {
      return 'investment'
    }
    
    // Default to milestone for single purchase goals
    return 'milestone'
  },

  /**
   * Get dreams by type
   * @param {string} type - Dream type to filter by
   * @returns {Array} Array of dreams of specified type
   */
  getDreamsByType: (type) => {
    try {
      const dreams = DreamService.getAllDreams()
      return dreams.filter(dream => dream.type === type)
    } catch (error) {
      console.error('Error getting dreams by type:', error)
      return []
    }
  },

  /**
   * Get the current Someday Life goal (should only be one)
   * @returns {Object|null} Someday Life goal or null
   */
  getSomedayLifeGoal: () => {
    try {
      const somedayLifeGoals = DreamService.getDreamsByType('someday_life')
      // Return the most recent if multiple exist (shouldn't happen after migration)
      return somedayLifeGoals.length > 0 ? somedayLifeGoals[somedayLifeGoals.length - 1] : null
    } catch (error) {
      console.error('Error getting Someday Life goal:', error)
      return null
    }
  },

  /**
   * Replace existing Someday Life goal
   * @param {Object} newSomedayLife - New Someday Life goal
   * @returns {Array} Updated dreams array
   */
  replaceSomedayLifeGoal: (newSomedayLife) => {
    try {
      let dreams = DreamService.getAllDreams()
      // Remove existing Someday Life goals
      dreams = dreams.filter(dream => dream.type !== 'someday_life')
      
      // Add the new one
      const newDream = {
        ...newSomedayLife,
        id: newSomedayLife.id || DreamService.generateUniqueId(),
        type: 'someday_life',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        progress: 0
      }
      
      dreams.push(newDream)
      localStorage.setItem('dreams', JSON.stringify(dreams))
      return dreams
    } catch (error) {
      console.error('Error replacing Someday Life goal:', error)
      throw error
    }
  },

  /**
   * Check if user wants to replace existing Someday Life goal
   * @param {Object} newSomedayLife - New Someday Life goal
   * @returns {Promise<boolean>} User's choice
   */
  confirmSomedayLifeReplacement: async (newSomedayLife) => {
    const existing = DreamService.getSomedayLifeGoal()
    if (!existing) return true
    
    return new Promise((resolve) => {
      const message = `You already have a Someday Life goal: "${existing.title}"\n\nWould you like to replace it with: "${newSomedayLife.title}"?`
      const replace = confirm(message)
      resolve(replace)
    })
  },

  /**
   * Emergency data recovery - attempt to recover lost Someday Life
   * @returns {Object|null} Recovered dream or null
   */
  emergencyRecovery: () => {
    console.log('🎆 EMERGENCY RECOVERY INITIATED')
    
    try {
      const diagnosis = DataRecoveryService.diagnoseDataState()
      const recovered = DataRecoveryService.recoverSomedayLifeData()
      
      if (recovered) {
        // Save the recovered dream
        const dreams = DreamService.getAllDreams()
        dreams.push(recovered)
        localStorage.setItem('dreams', JSON.stringify(dreams))
        
        console.log('✅ RECOVERY SUCCESSFUL:', recovered.title)
        return recovered
      }
      
      console.log('❌ No recoverable data found')
      return null
      
    } catch (error) {
      console.error('Emergency recovery failed:', error)
      return null
    }
  },

  /**
   * Check if emergency recovery is available
   * @returns {boolean} True if recovery data exists
   */
  canRecover: () => {
    try {
      const diagnosis = DataRecoveryService.diagnoseDataState()
      return diagnosis.recommendations.some(rec => rec.includes('RECOVERY_NEEDED') || rec.includes('LEGACY_SOMEDAY_FOUND'))
    } catch (error) {
      return false
    }
  },

  /**
   * Get data diagnosis for debugging
   * @returns {Object} Diagnosis object
   */
  getDiagnosis: () => {
    return DataRecoveryService.diagnoseDataState()
  },

  /**
   * Run migration to categorize existing dreams (runs once)
   */
  runMigrationIfNeeded: () => {
    try {
      // Check if migration already completed
      if (localStorage.getItem(MIGRATION_KEY)) {
        return
      }
      
      console.log('🔄 Running dreams migration v2 to categorize goal types and add data protection...')
      
      // Check for emergency recovery needs first
      const currentDreams = JSON.parse(localStorage.getItem('dreams') || '[]')
      const hasSomedayLife = currentDreams.some(d => d.type === 'someday_life')
      
      if (!hasSomedayLife) {
        console.log('🔎 No Someday Life found in dreams, checking for recovery...')
        const diagnosis = DataRecoveryService.diagnoseDataState()
        if (diagnosis.recommendations.some(rec => rec.includes('RECOVERY'))) {
          console.log('🎆 Recovery data detected, marking for emergency recovery')
          localStorage.setItem('needsEmergencyRecovery', 'true')
        }
      }
      
      let dreams = JSON.parse(localStorage.getItem('dreams') || '[]')
      let migrationChanges = 0
      let duplicatesRemoved = 0
      
      // Check for legacy SomedayLifeBuilder data
      const legacySomedayDream = localStorage.getItem('somedayDream')
      if (legacySomedayDream) {
        try {
          const somedayData = JSON.parse(legacySomedayDream)
          const legacyGoal = {
            id: DreamService.generateUniqueId(),
            title: somedayData.title || 'Someday Life - Financial Independence',
            description: somedayData.description || '',
            type: 'someday_life',
            target_amount: somedayData.requiredNetWorth || somedayData.estimatedCost || 0,
            property_cost: somedayData.estimatedCost || 0,
            annual_expenses: somedayData.totalAnnualCost || 0,
            target_date: new Date(new Date().getFullYear() + (somedayData.timeline || 25), 11, 31).toISOString(),
            category: 'freedom',
            location: somedayData.location || '',
            housing_type: somedayData.housingType || '',
            required_portfolio: somedayData.requiredPortfolio || 0,
            target_age: somedayData.targetAge || 65,
            current_age: somedayData.currentAge || 30,
            is_lifestyle_transformation: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'active',
            progress: 0
          }
          
          // Check if we already have this goal
          const alreadyExists = dreams.find(d => 
            d.title?.includes('Someday Life') || 
            d.title?.includes('Financial Independence') ||
            d.type === 'someday_life'
          )
          
          if (!alreadyExists) {
            dreams.push(legacyGoal)
            migrationChanges++
            console.log('📦 Migrated legacy Someday Life goal from somedayDream')
          }
        } catch (error) {
          console.error('Error migrating legacy Someday Life data:', error)
        }
      }
      
      // Clean up test data and duplicates first
      const originalCount = dreams.length
      dreams = DreamService.cleanupTestData(dreams)
      dreams = DreamService.removeDuplicates(dreams)
      duplicatesRemoved = originalCount - dreams.length
      
      // Categorize dreams and ensure unique IDs
      dreams = dreams.map(dream => {
        const updates = {}
        
        // Ensure unique ID
        if (!dream.id || typeof dream.id !== 'string' || !dream.id.startsWith('dream_')) {
          updates.id = DreamService.generateUniqueId()
        }
        
        // Add type if missing
        if (!dream.type) {
          updates.type = DreamService.inferDreamType(dream)
          migrationChanges++
        }
        
        // Add timestamps if missing
        if (!dream.createdAt) {
          updates.createdAt = new Date().toISOString()
        }
        if (!dream.updatedAt) {
          updates.updatedAt = new Date().toISOString()
        }
        
        return Object.keys(updates).length > 0 ? { ...dream, ...updates } : dream
      })
      
      // Handle multiple Someday Life goals
      const somedayLifeGoals = dreams.filter(dream => dream.type === 'someday_life')
      if (somedayLifeGoals.length > 1) {
        console.log(`⚠️ Found ${somedayLifeGoals.length} Someday Life goals, keeping the most recent`)
        // Keep only the most recent Someday Life goal
        const mostRecent = somedayLifeGoals.reduce((latest, current) => 
          new Date(current.createdAt || current.updatedAt || 0) > new Date(latest.createdAt || latest.updatedAt || 0) 
            ? current : latest
        )
        
        // Remove other Someday Life goals
        dreams = dreams.filter(dream => 
          dream.type !== 'someday_life' || dream.id === mostRecent.id
        )
      }
      
      // Save migrated dreams
      localStorage.setItem('dreams', JSON.stringify(dreams))
      localStorage.setItem(MIGRATION_KEY, 'true')
      
      const finalStats = {
        totalDreams: dreams.length,
        categorized: migrationChanges,
        duplicatesRemoved,
        somedayLifeGoals: dreams.filter(d => d.type === 'someday_life').length,
        milestones: dreams.filter(d => d.type === 'milestone').length,
        investments: dreams.filter(d => d.type === 'investment').length,
        dataProtectionEnabled: DATA_PROTECTION_ENABLED
      }
      
      console.log(`✅ Migration v2 completed:`, finalStats)
      
      // If no Someday Life goals after migration, mark for recovery
      if (finalStats.somedayLifeGoals === 0) {
        localStorage.setItem('needsEmergencyRecovery', 'true')
        console.log('🚨 No Someday Life goals found after migration - emergency recovery flagged')
      }
      
    } catch (error) {
      console.error('Error during migration:', error)
    }
  },

  /**
   * Clean up test data and problematic entries
   * @param {Array} dreams - Array of dreams
   * @returns {Array} Cleaned dreams array
   */
  cleanupTestData: (dreams) => {
    const testPatterns = [
      /french.?chateau/i,
      /test.?data/i,
      /sample.?dream/i,
      /demo.?goal/i
    ]
    
    return dreams.filter(dream => {
      const titleMatch = testPatterns.some(pattern => pattern.test(dream.title || ''))
      const descMatch = testPatterns.some(pattern => pattern.test(dream.description || ''))
      
      if (titleMatch || descMatch) {
        console.log('🗑️ Removing test data:', dream.title)
        return false
      }
      return true
    })
  },

  /**
   * Remove duplicate dreams based on title and target amount
   * @param {Array} dreams - Array of dreams
   * @returns {Array} Deduplicated dreams array
   */
  removeDuplicates: (dreams) => {
    const seen = new Set()
    return dreams.filter(dream => {
      const key = `${dream.title?.toLowerCase()}_${dream.target_amount}`
      if (seen.has(key)) {
        console.log('🗑️ Removing duplicate:', dream.title)
        return false
      }
      seen.add(key)
      return true
    })
  }
}

export default DreamService