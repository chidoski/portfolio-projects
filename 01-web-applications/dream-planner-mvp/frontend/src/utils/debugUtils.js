/**
 * Debug Utilities for Data Diagnosis
 * Run these functions in the browser console to diagnose data issues
 */

import { DreamService } from '../services/dreamService.js';
import { DataRecoveryService } from '../services/dataRecoveryService.js';

// Make debug utilities available globally
window.DreamPlannerDebug = {
  
  /**
   * Complete data diagnosis - run this first
   */
  diagnose: () => {
    console.log('🔍 DREAM PLANNER DATA DIAGNOSIS');
    console.log('=====================================');
    
    // Show all localStorage keys and their content
    console.log('📝 All localStorage keys:');
    Object.keys(localStorage).forEach(key => {
      const value = localStorage.getItem(key);
      console.log(`  ${key}:`, value?.length > 100 ? value.substring(0, 100) + '...' : value);
    });
    
    // Get comprehensive diagnosis
    const diagnosis = DataRecoveryService.diagnoseDataState();
    console.log('📊 Detailed diagnosis:', diagnosis);
    
    // Dreams analysis
    try {
      const dreams = DreamService.getAllDreams();
      console.log('🎯 Dreams analysis:', {
        total: dreams.length,
        byType: dreams.reduce((acc, dream) => {
          const type = dream.type || 'unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {}),
        dreams: dreams.map(d => ({
          id: d.id,
          title: d.title,
          type: d.type,
          target_amount: d.target_amount
        }))
      });
      
      const somedayLife = DreamService.getSomedayLifeGoal();
      console.log('🏠 Someday Life goal:', somedayLife);
      
    } catch (error) {
      console.error('Error analyzing dreams:', error);
    }
    
    return diagnosis;
  },
  
  /**
   * Show recovery options
   */
  checkRecovery: () => {
    console.log('🔧 RECOVERY OPTIONS');
    console.log('=====================================');
    
    const canRecover = DreamService.canRecover();
    console.log('Can recover:', canRecover);
    
    if (canRecover) {
      const recoverable = DataRecoveryService.recoverSomedayLifeData();
      console.log('Recoverable data:', recoverable);
    }
    
    return canRecover;
  },
  
  /**
   * Perform emergency recovery
   */
  emergencyRecover: () => {
    console.log('🚨 PERFORMING EMERGENCY RECOVERY');
    console.log('=====================================');
    
    try {
      const recovered = DreamService.emergencyRecovery();
      if (recovered) {
        console.log('✅ Recovery successful:', recovered);
        console.log('Refresh the page to see recovered data');
        return recovered;
      } else {
        console.log('❌ No data could be recovered');
        return null;
      }
    } catch (error) {
      console.error('Recovery failed:', error);
      return null;
    }
  },
  
  /**
   * Clear all data (use with caution)
   */
  clearAll: () => {
    const confirm1 = confirm('⚠️ This will delete ALL dream data. Are you sure?');
    if (!confirm1) return false;
    
    const confirm2 = confirm('🚨 FINAL WARNING: This action cannot be undone. Proceed?');
    if (!confirm2) return false;
    
    DreamService.clearAllDreams();
    localStorage.clear();
    console.log('🗑️ All data cleared');
    return true;
  },
  
  /**
   * Create test Someday Life goal
   */
  createTestSomedayLife: () => {
    const testGoal = {
      title: 'Test Someday Life - Coastal Freedom',
      description: 'Test someday life goal created for debugging',
      type: 'someday_life',
      target_amount: 2000000,
      property_cost: 500000,
      annual_expenses: 80000,
      target_date: new Date(new Date().getFullYear() + 25, 11, 31).toISOString(),
      category: 'freedom',
      location: 'Coastal Maine',
      housing_type: 'cottage',
      target_age: 65,
      current_age: 30
    };
    
    try {
      const dreams = DreamService.saveDream(testGoal);
      console.log('✅ Test Someday Life created:', testGoal);
      return testGoal;
    } catch (error) {
      console.error('Failed to create test goal:', error);
      return null;
    }
  },
  
  /**
   * Show current data state summary
   */
  summary: () => {
    console.log('📋 QUICK SUMMARY');
    console.log('=====================================');
    
    const dreams = DreamService.getAllDreams();
    const somedayLife = DreamService.getSomedayLifeGoal();
    const needsRecovery = localStorage.getItem('needsEmergencyRecovery') === 'true';
    const canRecover = DreamService.canRecover();
    
    console.log(`Dreams total: ${dreams.length}`);
    console.log(`Someday Life: ${somedayLife ? '✅ Found' : '❌ Missing'}`);
    console.log(`Needs recovery: ${needsRecovery ? '⚠️ Yes' : '✅ No'}`);
    console.log(`Can recover: ${canRecover ? '🔧 Yes' : '❌ No'}`);
    
    if (somedayLife) {
      console.log(`Someday Life title: "${somedayLife.title}"`);
      console.log(`Target amount: $${somedayLife.target_amount?.toLocaleString()}`);
    }
    
    return {
      totalDreams: dreams.length,
      hasSomedayLife: !!somedayLife,
      needsRecovery,
      canRecover,
      somedayLifeTitle: somedayLife?.title
    };
  },
  
  /**
   * Force migration
   */
  forceMigration: () => {
    console.log('🔄 FORCING MIGRATION');
    localStorage.removeItem('dreams_migration_v2_completed');
    DreamService.runMigrationIfNeeded();
    console.log('✅ Migration complete');
  }
};

console.log(`
🎯 Dream Planner Debug Utils Loaded!

Available commands:
- DreamPlannerDebug.diagnose()      - Complete data diagnosis
- DreamPlannerDebug.summary()       - Quick status summary  
- DreamPlannerDebug.checkRecovery() - Check recovery options
- DreamPlannerDebug.emergencyRecover() - Perform recovery
- DreamPlannerDebug.createTestSomedayLife() - Create test goal
- DreamPlannerDebug.clearAll()      - Clear all data (⚠️ careful!)
- DreamPlannerDebug.forceMigration() - Force re-migration

Start with: DreamPlannerDebug.diagnose()
`);

export default window.DreamPlannerDebug;
