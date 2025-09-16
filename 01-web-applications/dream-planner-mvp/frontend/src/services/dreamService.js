/**
 * Centralized Dream Management Service
 * Provides standardized methods for dream CRUD operations
 * All components should use these methods instead of directly accessing localStorage
 */

export const DreamService = {
  /**
   * Get all dreams from localStorage
   * @returns {Array} Array of dream objects
   */
  getAllDreams: () => {
    try {
      return JSON.parse(localStorage.getItem('dreams') || '[]')
    } catch (error) {
      console.error('Error parsing dreams from localStorage:', error)
      return []
    }
  },

  /**
   * Save a new dream to localStorage
   * @param {Object} dream - Dream object to save
   * @returns {Array} Updated dreams array
   */
  saveDream: (dream) => {
    try {
      const dreams = DreamService.getAllDreams()
      const newDream = {
        ...dream,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        progress: 0
      }
      dreams.push(newDream)
      localStorage.setItem('dreams', JSON.stringify(dreams))
      return dreams
    } catch (error) {
      console.error('Error saving dream:', error)
      throw error
    }
  },

  /**
   * Delete a dream by ID
   * @param {string|number} id - Dream ID to delete
   * @returns {Array} Updated dreams array
   */
  deleteDream: (id) => {
    try {
      const dreams = DreamService.getAllDreams().filter(d => d.id !== id)
      localStorage.setItem('dreams', JSON.stringify(dreams))
      return dreams
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
      return []
    } catch (error) {
      console.error('Error clearing dreams:', error)
      throw error
    }
  }
}

export default DreamService
