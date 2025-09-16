/**
 * Data Recovery and Diagnosis Service
 * Handles data recovery, backup, and integrity checks
 */

export const DataRecoveryService = {
  /**
   * Diagnose current data state in localStorage
   * @returns {Object} Complete diagnosis of stored data
   */
  diagnoseDataState: () => {
    console.log('🔍 Running comprehensive data diagnosis...');
    
    const diagnosis = {
      timestamp: new Date().toISOString(),
      foundKeys: [],
      missingKeys: [],
      somedayLifeData: null,
      backupData: null,
      legacyData: {},
      recommendations: []
    };

    // Check all localStorage keys
    Object.keys(localStorage).forEach(key => {
      diagnosis.foundKeys.push({
        key,
        size: localStorage.getItem(key)?.length || 0,
        preview: localStorage.getItem(key)?.substring(0, 100) + '...'
      });
      console.log(`📝 Found: ${key}`, localStorage.getItem(key));
    });

    // Look for Someday Life data in various locations
    const potentialSomedayKeys = [
      'somedayLife',
      'somedayDream', 
      'somedayLifeData',
      'currentSomedayLife',
      'somedayLifeStep1',
      'somedayLifeStep2', 
      'somedayLifeStep3',
      'financialProfile',
      'userIncome',
      'careerContext',
      'assetDebtContext'
    ];

    potentialSomedayKeys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          diagnosis.legacyData[key] = JSON.parse(data);
          if (key.includes('someday') || key.includes('financial')) {
            diagnosis.somedayLifeData = { key, data: JSON.parse(data) };
          }
        } catch (e) {
          diagnosis.legacyData[key] = data;
        }
      } else {
        diagnosis.missingKeys.push(key);
      }
    });

    // Check for backup data
    const backupKey = localStorage.getItem('lastBackup');
    if (backupKey) {
      try {
        diagnosis.backupData = JSON.parse(backupKey);
      } catch (e) {
        console.error('Backup data corrupted');
      }
    }

    // Check dreams array
    const dreams = localStorage.getItem('dreams');
    if (dreams) {
      try {
        const dreamsArray = JSON.parse(dreams);
        diagnosis.dreams = {
          total: dreamsArray.length,
          byType: dreamsArray.reduce((acc, dream) => {
            const type = dream.type || 'unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {}),
          somedayLifeGoals: dreamsArray.filter(d => d.type === 'someday_life'),
          recentlyCreated: dreamsArray.filter(d => {
            const created = new Date(d.createdAt || 0);
            const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
            return created > hourAgo;
          })
        };
      } catch (e) {
        diagnosis.dreams = { error: 'Dreams data corrupted' };
      }
    }

    // Generate recommendations
    if (!diagnosis.somedayLifeData && diagnosis.legacyData.somedayDream) {
      diagnosis.recommendations.push('LEGACY_SOMEDAY_FOUND: Legacy Someday Life data found, can be recovered');
    }
    
    if (!diagnosis.somedayLifeData && diagnosis.legacyData.financialProfile) {
      diagnosis.recommendations.push('FINANCIAL_PROFILE_FOUND: Financial profile data found, partial recovery possible');
    }

    if (diagnosis.dreams?.somedayLifeGoals?.length === 0 && diagnosis.legacyData.somedayDream) {
      diagnosis.recommendations.push('RECOVERY_NEEDED: No Someday Life goal in dreams but legacy data exists');
    }

    if (diagnosis.dreams?.recentlyCreated?.length > 0) {
      diagnosis.recommendations.push('RECENT_ACTIVITY: Recently created dreams found, may indicate fresh session');
    }

    console.log('📊 Data Diagnosis Complete:', diagnosis);
    return diagnosis;
  },

  /**
   * Attempt to recover Someday Life data from various sources
   * @returns {Object|null} Recovered Someday Life data or null
   */
  recoverSomedayLifeData: () => {
    console.log('🔧 Attempting Someday Life data recovery...');
    
    const diagnosis = DataRecoveryService.diagnoseDataState();
    
    // Priority 1: Direct someday life data
    if (diagnosis.legacyData.somedayDream) {
      const somedayData = diagnosis.legacyData.somedayDream;
      const recovered = {
        id: `recovered_${Date.now()}`,
        title: somedayData.title || 'Recovered Someday Life',
        description: somedayData.description || 'Your recovered Someday Life vision',
        type: 'someday_life',
        target_amount: somedayData.requiredNetWorth || somedayData.estimatedCost || 0,
        property_cost: somedayData.estimatedCost || 0,
        annual_expenses: somedayData.totalAnnualCost || 0,
        target_date: new Date(new Date().getFullYear() + (somedayData.timeline || 25), 11, 31).toISOString(),
        category: 'freedom',
        location: somedayData.location || '',
        housing_type: somedayData.housingType || '',
        lifestyle_archetype: somedayData.selectedArchetype || '',
        target_age: somedayData.targetAge || 65,
        current_age: somedayData.currentAge || 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        progress: 0,
        recovered: true,
        recoverySource: 'somedayDream'
      };
      
      console.log('✅ Recovered from somedayDream:', recovered);
      return recovered;
    }

    // Priority 2: Financial profile data
    if (diagnosis.legacyData.financialProfile) {
      const profile = diagnosis.legacyData.financialProfile;
      const recovered = {
        id: `recovered_${Date.now()}`,
        title: 'Recovered Financial Independence Plan',
        description: 'Your recovered financial independence vision',
        type: 'someday_life',
        target_amount: profile.targetNetWorth || 2000000,
        annual_expenses: profile.annualExpenses || 80000,
        target_date: new Date(new Date().getFullYear() + 25, 11, 31).toISOString(),
        category: 'freedom',
        target_age: profile.targetAge || 65,
        current_age: profile.currentAge || 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        progress: 0,
        recovered: true,
        recoverySource: 'financialProfile'
      };
      
      console.log('✅ Recovered from financialProfile:', recovered);
      return recovered;
    }

    // Priority 3: Check for recent someday life steps
    const stepKeys = ['somedayLifeStep1', 'somedayLifeStep2', 'somedayLifeStep3'];
    for (const stepKey of stepKeys) {
      if (diagnosis.legacyData[stepKey]) {
        const stepData = diagnosis.legacyData[stepKey];
        const recovered = {
          id: `recovered_${Date.now()}`,
          title: stepData.dreamDescription || stepData.selectedLifestyle?.title || 'Recovered Someday Life',
          description: stepData.dreamDescription || 'Your recovered Someday Life vision',
          type: 'someday_life',
          target_amount: stepData.calculatedAmount || 2000000,
          annual_expenses: stepData.totalAnnualSpending || 80000,
          location: stepData.selectedLocation || '',
          lifestyle_archetype: stepData.selectedArchetype || '',
          target_date: new Date(new Date().getFullYear() + 25, 11, 31).toISOString(),
          category: 'freedom',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'active',
          progress: 0,
          recovered: true,
          recoverySource: stepKey
        };
        
        console.log(`✅ Recovered from ${stepKey}:`, recovered);
        return recovered;
      }
    }

    console.log('❌ No recoverable Someday Life data found');
    return null;
  },

  /**
   * Create a backup of all current data
   * @returns {Object} Backup data object
   */
  createBackup: () => {
    const backup = {
      timestamp: new Date().toISOString(),
      data: {}
    };

    // Backup all localStorage
    Object.keys(localStorage).forEach(key => {
      backup.data[key] = localStorage.getItem(key);
    });

    localStorage.setItem('lastBackup', JSON.stringify(backup));
    console.log('💾 Backup created:', backup);
    return backup;
  },

  /**
   * Restore from backup
   * @param {Object} backup - Backup object to restore from
   */
  restoreFromBackup: (backup) => {
    if (!backup || !backup.data) {
      console.error('Invalid backup data');
      return false;
    }

    try {
      // Clear current data
      localStorage.clear();
      
      // Restore from backup
      Object.entries(backup.data).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });

      console.log('✅ Restored from backup:', backup.timestamp);
      return true;
    } catch (error) {
      console.error('Error restoring from backup:', error);
      return false;
    }
  }
};

export default DataRecoveryService;
