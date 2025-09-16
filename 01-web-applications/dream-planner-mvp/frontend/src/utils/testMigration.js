/**
 * Test Migration Utility
 * Used to test the dream categorization and migration functionality
 */

import { DreamService } from '../services/dreamService'

// Test data representing different types of goals that might exist in localStorage
const createTestData = () => {
  const testDreams = [
    // Test French Chateau entry (should be removed)
    {
      id: 1234567890,
      title: 'French Chateau in Provence',
      description: 'A beautiful chateau in the French countryside',
      target_amount: 800000,
      target_date: '2030-12-31',
      category: 'lifestyle',
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    
    // Test milestone goal
    {
      id: 1234567891,
      title: 'Dream Wedding',
      description: 'Perfect wedding celebration',
      target_amount: 50000,
      target_date: '2026-06-15',
      category: 'family',
      createdAt: '2024-01-02T00:00:00.000Z'
    },
    
    // Test investment goal
    {
      id: 1234567892,
      title: 'Emergency Fund',
      description: '6 months of expenses saved',
      target_amount: 30000,
      target_date: '2025-12-31',
      category: 'investment',
      createdAt: '2024-01-03T00:00:00.000Z'
    },
    
    // Test duplicate goal
    {
      id: 1234567893,
      title: 'Dream Wedding',
      description: 'Perfect wedding celebration',
      target_amount: 50000,
      target_date: '2026-06-15',
      category: 'family',
      createdAt: '2024-01-04T00:00:00.000Z'
    },
    
    // Test goal that should be categorized as Someday Life
    {
      id: 1234567894,
      title: 'Retirement in Maine',
      description: 'Peaceful cottage by the lake',
      target_amount: 1200000,
      property_cost: 450000,
      annual_expenses: 40000,
      target_date: '2052-12-31',
      category: 'freedom',
      createdAt: '2024-01-05T00:00:00.000Z'
    }
  ]
  
  // Test legacy SomedayLifeBuilder data
  const legacySomedayDream = {
    title: 'Someday Life - Financial Independence',
    description: 'Complete financial freedom in Maine',
    estimatedCost: 450000,
    totalAnnualCost: 40000,
    requiredNetWorth: 1450000,
    requiredPortfolio: 1000000,
    timeline: 24,
    targetAge: 52,
    currentAge: 28,
    location: 'Maine, USA',
    housingType: 'cottage'
  }
  
  return { testDreams, legacySomedayDream }
}

export const runMigrationTest = () => {
  console.log('🧪 Starting migration test...')
  
  try {
    // Clear existing data
    DreamService.clearAllDreams()
    localStorage.removeItem('somedayDream')
    
    // Set up test data
    const { testDreams, legacySomedayDream } = createTestData()
    
    // Store test dreams in localStorage (bypassing DreamService validation)
    localStorage.setItem('dreams', JSON.stringify(testDreams))
    localStorage.setItem('somedayDream', JSON.stringify(legacySomedayDream))
    
    console.log('📝 Test data created:', {
      dreams: testDreams.length,
      legacySomedayDream: true
    })
    
    // Trigger migration by calling getAllDreams
    console.log('🔄 Triggering migration...')
    const migratedDreams = DreamService.getAllDreams()
    
    // Test results
    const somedayLifeGoals = DreamService.getDreamsByType('someday_life')
    const milestoneGoals = DreamService.getDreamsByType('milestone')
    const investmentGoals = DreamService.getDreamsByType('investment')
    
    console.log('✅ Migration results:', {
      totalDreams: migratedDreams.length,
      somedayLife: somedayLifeGoals.length,
      milestones: milestoneGoals.length,
      investments: investmentGoals.length
    })
    
    // Validate results
    const testResults = {
      duplicatesRemoved: migratedDreams.filter(d => d.title === 'Dream Wedding').length === 1,
      frenchChateauRemoved: !migratedDreams.some(d => d.title.includes('French Chateau')),
      somedayLifeMigrated: somedayLifeGoals.length >= 1,
      goalsHaveTypes: migratedDreams.every(d => d.type),
      goalsHaveUniqueIds: migratedDreams.every(d => d.id && typeof d.id === 'string')
    }
    
    console.log('🧪 Test validation:', testResults)
    
    const allTestsPassed = Object.values(testResults).every(result => result === true)
    
    if (allTestsPassed) {
      console.log('🎉 All migration tests passed!')
    } else {
      console.error('❌ Some migration tests failed:', testResults)
    }
    
    return {
      success: allTestsPassed,
      results: testResults,
      data: {
        migratedDreams,
        somedayLifeGoals,
        milestoneGoals,
        investmentGoals
      }
    }
    
  } catch (error) {
    console.error('💥 Migration test failed:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

export const logCurrentDreams = () => {
  console.log('📊 Current Dreams State:')
  
  try {
    const allDreams = DreamService.getAllDreams()
    const somedayLife = DreamService.getSomedayLifeGoal()
    const milestones = DreamService.getDreamsByType('milestone')
    const investments = DreamService.getDreamsByType('investment')
    
    console.table({
      'All Dreams': allDreams.length,
      'Someday Life': somedayLife ? 1 : 0,
      'Milestones': milestones.length,
      'Investments': investments.length
    })
    
    if (somedayLife) {
      console.log('🌟 Someday Life Goal:', {
        title: somedayLife.title,
        target_amount: somedayLife.target_amount,
        type: somedayLife.type
      })
    }
    
    console.log('🎯 Other Goals:', milestones.concat(investments).map(d => ({
      title: d.title,
      type: d.type,
      target_amount: d.target_amount
    })))
    
  } catch (error) {
    console.error('Error logging current dreams:', error)
  }
}

export default { runMigrationTest, logCurrentDreams }
