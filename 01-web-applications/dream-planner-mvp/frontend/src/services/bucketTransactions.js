/**
 * Bucket Transactions Service
 * Manages the actual movement of money between Foundation, Dream, and Life buckets
 * Provides audit trail and transaction history for complete transparency
 */

// Storage keys
const STORAGE_KEYS = {
  BUCKET_TRANSACTIONS: 'bucketTransactions',
  BUCKET_BALANCES: 'bucketBalances',
  BUCKET_ALLOCATIONS: 'bucketAllocations',
  REPAYMENT_SCHEDULES: 'repaymentSchedules'
}

// Transaction types
export const TRANSACTION_TYPES = {
  BORROW: 'borrow',
  REPAY: 'repay',
  REBALANCE: 'rebalance',
  CONTRIBUTION: 'contribution',
  WITHDRAWAL: 'withdrawal',
  TRANSFER: 'transfer',
  ADJUSTMENT: 'adjustment',
  EMERGENCY: 'emergency'
}

// Bucket names
export const BUCKET_NAMES = {
  FOUNDATION: 'foundation',
  DREAM: 'dream',
  LIFE: 'life'
}

// Reason categories for better organization
export const REASON_CATEGORIES = {
  EMERGENCY: 'emergency',
  OPPORTUNITY: 'opportunity',
  REBALANCING: 'rebalancing',
  MILESTONE: 'milestone',
  REPAIR: 'repair',
  MEDICAL: 'medical',
  EDUCATION: 'education',
  FAMILY: 'family',
  OTHER: 'other'
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
 * Generate a unique transaction ID
 * @returns {string} Unique transaction identifier
 */
function generateTransactionId() {
  return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get current bucket balances
 * @returns {Object} Current balances for all buckets
 */
export function getBucketBalances() {
  if (!isLocalStorageAvailable()) {
    return {
      foundation: 0,
      dream: 0,
      life: 0,
      lastUpdated: new Date().toISOString()
    }
  }

  try {
    const balancesString = localStorage.getItem(STORAGE_KEYS.BUCKET_BALANCES)
    if (!balancesString) {
      return {
        foundation: 0,
        dream: 0,
        life: 0,
        lastUpdated: new Date().toISOString()
      }
    }

    return safeJsonParse(balancesString, {
      foundation: 0,
      dream: 0,
      life: 0,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error loading bucket balances:', error)
    return {
      foundation: 0,
      dream: 0,
      life: 0,
      lastUpdated: new Date().toISOString()
    }
  }
}

/**
 * Update bucket balances
 * @param {Object} newBalances - New balance amounts
 * @returns {Object} Result object with success status
 */
function updateBucketBalances(newBalances) {
  if (!isLocalStorageAvailable()) {
    return {
      success: false,
      error: 'localStorage is not available',
      code: 'STORAGE_UNAVAILABLE'
    }
  }

  try {
    const balances = {
      ...newBalances,
      lastUpdated: new Date().toISOString()
    }

    const balancesString = safeJsonStringify(balances)
    if (!balancesString) {
      return {
        success: false,
        error: 'Failed to serialize balance data',
        code: 'SERIALIZATION_ERROR'
      }
    }

    localStorage.setItem(STORAGE_KEYS.BUCKET_BALANCES, balancesString)
    return { success: true }
  } catch (error) {
    console.error('Error updating bucket balances:', error)
    return {
      success: false,
      error: error.message,
      code: 'STORAGE_ERROR'
    }
  }
}

/**
 * Get all transactions from localStorage
 * @returns {Array} Array of all transactions
 */
function getAllTransactions() {
  if (!isLocalStorageAvailable()) {
    return []
  }

  try {
    const transactionsString = localStorage.getItem(STORAGE_KEYS.BUCKET_TRANSACTIONS)
    if (!transactionsString) {
      return []
    }

    const transactions = safeJsonParse(transactionsString, [])
    return Array.isArray(transactions) ? transactions : []
  } catch (error) {
    console.error('Error loading transactions:', error)
    return []
  }
}

/**
 * Save transaction to localStorage
 * @param {Object} transaction - Transaction object to save
 * @returns {Object} Result object with success status
 */
function saveTransaction(transaction) {
  if (!isLocalStorageAvailable()) {
    return {
      success: false,
      error: 'localStorage is not available',
      code: 'STORAGE_UNAVAILABLE'
    }
  }

  try {
    const transactions = getAllTransactions()
    transactions.push(transaction)

    // Keep only the last 1000 transactions to prevent storage bloat
    if (transactions.length > 1000) {
      transactions.splice(0, transactions.length - 1000)
    }

    const transactionsString = safeJsonStringify(transactions)
    if (!transactionsString) {
      return {
        success: false,
        error: 'Failed to serialize transaction data',
        code: 'SERIALIZATION_ERROR'
      }
    }

    localStorage.setItem(STORAGE_KEYS.BUCKET_TRANSACTIONS, transactionsString)
    return { success: true, transactionId: transaction.id }
  } catch (error) {
    console.error('Error saving transaction:', error)
    return {
      success: false,
      error: error.message,
      code: 'STORAGE_ERROR'
    }
  }
}

/**
 * Borrow money from one bucket to another
 * @param {number} amount - Amount to borrow
 * @param {string} fromBucket - Source bucket name
 * @param {string} toBucket - Destination bucket name
 * @param {string} reason - Explanation for the borrowing
 * @param {Object} options - Additional options
 * @returns {Object} Result object with transaction details
 */
export function borrowFromBucket(amount, fromBucket, toBucket, reason, options = {}) {
  // Validate inputs
  if (!amount || amount <= 0) {
    return {
      success: false,
      error: 'Amount must be greater than 0',
      code: 'INVALID_AMOUNT'
    }
  }

  if (!Object.values(BUCKET_NAMES).includes(fromBucket)) {
    return {
      success: false,
      error: 'Invalid source bucket name',
      code: 'INVALID_FROM_BUCKET'
    }
  }

  if (!Object.values(BUCKET_NAMES).includes(toBucket)) {
    return {
      success: false,
      error: 'Invalid destination bucket name',
      code: 'INVALID_TO_BUCKET'
    }
  }

  if (fromBucket === toBucket) {
    return {
      success: false,
      error: 'Cannot borrow from the same bucket',
      code: 'SAME_BUCKET_ERROR'
    }
  }

  if (!reason || reason.trim().length === 0) {
    return {
      success: false,
      error: 'Reason is required for borrowing',
      code: 'MISSING_REASON'
    }
  }

  try {
    // Get current balances
    const currentBalances = getBucketBalances()
    
    // Check if source bucket has sufficient funds
    if (currentBalances[fromBucket] < amount) {
      return {
        success: false,
        error: `Insufficient funds in ${fromBucket} bucket. Available: $${currentBalances[fromBucket].toFixed(2)}, Requested: $${amount.toFixed(2)}`,
        code: 'INSUFFICIENT_FUNDS',
        available: currentBalances[fromBucket],
        requested: amount
      }
    }

    // Create transaction record
    const transactionId = generateTransactionId()
    const transaction = {
      id: transactionId,
      type: TRANSACTION_TYPES.BORROW,
      amount: amount,
      fromBucket: fromBucket,
      toBucket: toBucket,
      reason: reason.trim(),
      category: options.category || REASON_CATEGORIES.OTHER,
      timestamp: new Date().toISOString(),
      balancesBefore: { ...currentBalances },
      balancesAfter: {
        ...currentBalances,
        [fromBucket]: currentBalances[fromBucket] - amount,
        [toBucket]: currentBalances[toBucket] + amount
      },
      repaymentPlan: options.repaymentPlan || null,
      metadata: {
        userInitiated: options.userInitiated !== false,
        automaticRepayment: options.automaticRepayment || false,
        priority: options.priority || 'normal',
        tags: options.tags || [],
        notes: options.notes || ''
      }
    }

    // Update balances
    const newBalances = {
      ...currentBalances,
      [fromBucket]: currentBalances[fromBucket] - amount,
      [toBucket]: currentBalances[toBucket] + amount
    }

    const balanceUpdateResult = updateBucketBalances(newBalances)
    if (!balanceUpdateResult.success) {
      return balanceUpdateResult
    }

    // Save transaction
    const saveResult = saveTransaction(transaction)
    if (!saveResult.success) {
      // Rollback balance changes
      updateBucketBalances(currentBalances)
      return saveResult
    }

    // Create repayment schedule if specified
    if (options.repaymentPlan) {
      const repaymentResult = createRepaymentSchedule(transactionId, options.repaymentPlan)
      if (!repaymentResult.success) {
        console.warn('Failed to create repayment schedule:', repaymentResult.error)
      }
    }

    // Generate human-readable explanation
    const explanation = generateBorrowExplanation(transaction)

    return {
      success: true,
      transactionId: transactionId,
      transaction: transaction,
      explanation: explanation,
      newBalances: newBalances,
      repaymentScheduleCreated: !!options.repaymentPlan
    }

  } catch (error) {
    console.error('Error in borrowFromBucket:', error)
    return {
      success: false,
      error: 'An unexpected error occurred during the borrowing process',
      code: 'UNEXPECTED_ERROR',
      details: error.message
    }
  }
}

/**
 * Rebalance buckets by adjusting future contributions without touching existing balances
 * @param {Object} newAllocation - New monthly allocation amounts
 * @param {string} reason - Reason for rebalancing
 * @param {Object} options - Additional options
 * @returns {Object} Result object with rebalancing details
 */
export function rebalanceBuckets(newAllocation, reason, options = {}) {
  // Validate inputs
  if (!newAllocation || typeof newAllocation !== 'object') {
    return {
      success: false,
      error: 'New allocation must be an object',
      code: 'INVALID_ALLOCATION'
    }
  }

  const requiredBuckets = [BUCKET_NAMES.FOUNDATION, BUCKET_NAMES.DREAM, BUCKET_NAMES.LIFE]
  for (const bucket of requiredBuckets) {
    if (typeof newAllocation[bucket] !== 'number' || newAllocation[bucket] < 0) {
      return {
        success: false,
        error: `Invalid allocation amount for ${bucket} bucket`,
        code: 'INVALID_BUCKET_ALLOCATION'
      }
    }
  }

  if (!reason || reason.trim().length === 0) {
    return {
      success: false,
      error: 'Reason is required for rebalancing',
      code: 'MISSING_REASON'
    }
  }

  try {
    // Get current allocation
    const currentAllocation = getCurrentAllocation()
    
    // Create transaction record
    const transactionId = generateTransactionId()
    const transaction = {
      id: transactionId,
      type: TRANSACTION_TYPES.REBALANCE,
      amount: 0, // No immediate money movement
      fromBucket: null,
      toBucket: null,
      reason: reason.trim(),
      category: options.category || REASON_CATEGORIES.REBALANCING,
      timestamp: new Date().toISOString(),
      allocationBefore: { ...currentAllocation },
      allocationAfter: { ...newAllocation },
      balancesBefore: getBucketBalances(), // Current balances remain unchanged
      balancesAfter: getBucketBalances(), // Current balances remain unchanged
      effectiveDate: options.effectiveDate || new Date().toISOString(),
      metadata: {
        userInitiated: options.userInitiated !== false,
        temporary: options.temporary || false,
        duration: options.duration || null,
        priority: options.priority || 'normal',
        tags: options.tags || [],
        notes: options.notes || ''
      }
    }

    // Update allocation
    const allocationUpdateResult = updateCurrentAllocation(newAllocation)
    if (!allocationUpdateResult.success) {
      return allocationUpdateResult
    }

    // Save transaction
    const saveResult = saveTransaction(transaction)
    if (!saveResult.success) {
      // Rollback allocation changes
      updateCurrentAllocation(currentAllocation)
      return saveResult
    }

    // Generate human-readable explanation
    const explanation = generateRebalanceExplanation(transaction)

    return {
      success: true,
      transactionId: transactionId,
      transaction: transaction,
      explanation: explanation,
      oldAllocation: currentAllocation,
      newAllocation: newAllocation,
      effectiveDate: transaction.effectiveDate
    }

  } catch (error) {
    console.error('Error in rebalanceBuckets:', error)
    return {
      success: false,
      error: 'An unexpected error occurred during rebalancing',
      code: 'UNEXPECTED_ERROR',
      details: error.message
    }
  }
}

/**
 * Get transaction history for a specific bucket
 * @param {string} bucketName - Name of the bucket
 * @param {Object} options - Filter and pagination options
 * @returns {Array} Array of transactions affecting the bucket
 */
export function getBucketHistory(bucketName, options = {}) {
  // Validate bucket name
  if (!Object.values(BUCKET_NAMES).includes(bucketName)) {
    return {
      success: false,
      error: 'Invalid bucket name',
      code: 'INVALID_BUCKET_NAME',
      transactions: []
    }
  }

  try {
    const allTransactions = getAllTransactions()
    
    // Filter transactions that affect the specified bucket
    let bucketTransactions = allTransactions.filter(transaction => {
      return transaction.fromBucket === bucketName || 
             transaction.toBucket === bucketName ||
             (transaction.type === TRANSACTION_TYPES.REBALANCE && 
              (transaction.allocationBefore[bucketName] !== transaction.allocationAfter[bucketName]))
    })

    // Apply filters
    if (options.type) {
      bucketTransactions = bucketTransactions.filter(t => t.type === options.type)
    }

    if (options.category) {
      bucketTransactions = bucketTransactions.filter(t => t.category === options.category)
    }

    if (options.startDate) {
      const startDate = new Date(options.startDate)
      bucketTransactions = bucketTransactions.filter(t => new Date(t.timestamp) >= startDate)
    }

    if (options.endDate) {
      const endDate = new Date(options.endDate)
      bucketTransactions = bucketTransactions.filter(t => new Date(t.timestamp) <= endDate)
    }

    if (options.minAmount) {
      bucketTransactions = bucketTransactions.filter(t => Math.abs(t.amount) >= options.minAmount)
    }

    // Sort by timestamp (newest first)
    bucketTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    // Apply pagination
    const limit = options.limit || 50
    const offset = options.offset || 0
    const paginatedTransactions = bucketTransactions.slice(offset, offset + limit)

    // Add human-readable explanations
    const transactionsWithExplanations = paginatedTransactions.map(transaction => ({
      ...transaction,
      explanation: generateTransactionExplanation(transaction, bucketName)
    }))

    return {
      success: true,
      bucketName: bucketName,
      transactions: transactionsWithExplanations,
      totalCount: bucketTransactions.length,
      hasMore: (offset + limit) < bucketTransactions.length,
      summary: generateBucketSummary(bucketName, bucketTransactions)
    }

  } catch (error) {
    console.error('Error in getBucketHistory:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while retrieving bucket history',
      code: 'UNEXPECTED_ERROR',
      details: error.message,
      transactions: []
    }
  }
}

/**
 * Get current allocation settings
 * @returns {Object} Current monthly allocation amounts
 */
function getCurrentAllocation() {
  if (!isLocalStorageAvailable()) {
    return {
      foundation: 0,
      dream: 0,
      life: 0,
      lastUpdated: new Date().toISOString()
    }
  }

  try {
    const allocationString = localStorage.getItem(STORAGE_KEYS.BUCKET_ALLOCATIONS)
    if (!allocationString) {
      return {
        foundation: 0,
        dream: 0,
        life: 0,
        lastUpdated: new Date().toISOString()
      }
    }

    return safeJsonParse(allocationString, {
      foundation: 0,
      dream: 0,
      life: 0,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error loading current allocation:', error)
    return {
      foundation: 0,
      dream: 0,
      life: 0,
      lastUpdated: new Date().toISOString()
    }
  }
}

/**
 * Update current allocation settings
 * @param {Object} newAllocation - New allocation amounts
 * @returns {Object} Result object with success status
 */
function updateCurrentAllocation(newAllocation) {
  if (!isLocalStorageAvailable()) {
    return {
      success: false,
      error: 'localStorage is not available',
      code: 'STORAGE_UNAVAILABLE'
    }
  }

  try {
    const allocation = {
      ...newAllocation,
      lastUpdated: new Date().toISOString()
    }

    const allocationString = safeJsonStringify(allocation)
    if (!allocationString) {
      return {
        success: false,
        error: 'Failed to serialize allocation data',
        code: 'SERIALIZATION_ERROR'
      }
    }

    localStorage.setItem(STORAGE_KEYS.BUCKET_ALLOCATIONS, allocationString)
    return { success: true }
  } catch (error) {
    console.error('Error updating allocation:', error)
    return {
      success: false,
      error: error.message,
      code: 'STORAGE_ERROR'
    }
  }
}

/**
 * Create a repayment schedule for borrowed funds
 * @param {string} transactionId - ID of the borrowing transaction
 * @param {Object} repaymentPlan - Repayment plan details
 * @returns {Object} Result object with schedule details
 */
function createRepaymentSchedule(transactionId, repaymentPlan) {
  if (!isLocalStorageAvailable()) {
    return {
      success: false,
      error: 'localStorage is not available',
      code: 'STORAGE_UNAVAILABLE'
    }
  }

  try {
    const schedules = getRepaymentSchedules()
    const schedule = {
      id: `schedule_${transactionId}`,
      transactionId: transactionId,
      totalAmount: repaymentPlan.totalAmount,
      monthlyAmount: repaymentPlan.monthlyAmount,
      numberOfPayments: repaymentPlan.numberOfPayments,
      startDate: repaymentPlan.startDate || new Date().toISOString(),
      endDate: repaymentPlan.endDate,
      fromBucket: repaymentPlan.fromBucket,
      toBucket: repaymentPlan.toBucket,
      status: 'active',
      paymentsCompleted: 0,
      amountRepaid: 0,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    }

    schedules.push(schedule)
    
    const schedulesString = safeJsonStringify(schedules)
    if (!schedulesString) {
      return {
        success: false,
        error: 'Failed to serialize schedule data',
        code: 'SERIALIZATION_ERROR'
      }
    }

    localStorage.setItem(STORAGE_KEYS.REPAYMENT_SCHEDULES, schedulesString)
    return { success: true, scheduleId: schedule.id }
  } catch (error) {
    console.error('Error creating repayment schedule:', error)
    return {
      success: false,
      error: error.message,
      code: 'STORAGE_ERROR'
    }
  }
}

/**
 * Get all repayment schedules
 * @returns {Array} Array of repayment schedules
 */
function getRepaymentSchedules() {
  if (!isLocalStorageAvailable()) {
    return []
  }

  try {
    const schedulesString = localStorage.getItem(STORAGE_KEYS.REPAYMENT_SCHEDULES)
    if (!schedulesString) {
      return []
    }

    const schedules = safeJsonParse(schedulesString, [])
    return Array.isArray(schedules) ? schedules : []
  } catch (error) {
    console.error('Error loading repayment schedules:', error)
    return []
  }
}

/**
 * Generate human-readable explanation for borrowing transaction
 * @param {Object} transaction - Transaction object
 * @returns {string} Human-readable explanation
 */
function generateBorrowExplanation(transaction) {
  const { amount, fromBucket, toBucket, reason, repaymentPlan } = transaction
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)

  let explanation = `Borrowed ${formattedAmount} from ${fromBucket.charAt(0).toUpperCase() + fromBucket.slice(1)} bucket for ${reason.toLowerCase()}`

  if (repaymentPlan) {
    const monthlyAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(repaymentPlan.monthlyAmount)

    explanation += `, will repay ${monthlyAmount}/month over ${repaymentPlan.numberOfPayments} months`
  }

  return explanation
}

/**
 * Generate human-readable explanation for rebalancing transaction
 * @param {Object} transaction - Transaction object
 * @returns {string} Human-readable explanation
 */
function generateRebalanceExplanation(transaction) {
  const { reason, allocationBefore, allocationAfter } = transaction
  
  let explanation = `Rebalanced bucket allocations: ${reason}. `
  
  const changes = []
  Object.keys(allocationAfter).forEach(bucket => {
    if (bucket !== 'lastUpdated') {
      const before = allocationBefore[bucket] || 0
      const after = allocationAfter[bucket] || 0
      const diff = after - before
      
      if (diff !== 0) {
        const formattedDiff = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(Math.abs(diff))
        
        const bucketName = bucket.charAt(0).toUpperCase() + bucket.slice(1)
        changes.push(`${bucketName} ${diff > 0 ? '+' : '-'}${formattedDiff}`)
      }
    }
  })
  
  if (changes.length > 0) {
    explanation += `Changes: ${changes.join(', ')}`
  }
  
  return explanation
}

/**
 * Generate human-readable explanation for any transaction
 * @param {Object} transaction - Transaction object
 * @param {string} bucketName - Name of the bucket for context
 * @returns {string} Human-readable explanation
 */
function generateTransactionExplanation(transaction, bucketName) {
  const { type, amount, fromBucket, toBucket, reason } = transaction
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Math.abs(amount))

  switch (type) {
    case TRANSACTION_TYPES.BORROW:
      if (fromBucket === bucketName) {
        return `Lent ${formattedAmount} to ${toBucket.charAt(0).toUpperCase() + toBucket.slice(1)} bucket for ${reason.toLowerCase()}`
      } else if (toBucket === bucketName) {
        return `Borrowed ${formattedAmount} from ${fromBucket.charAt(0).toUpperCase() + fromBucket.slice(1)} bucket for ${reason.toLowerCase()}`
      }
      break
    
    case TRANSACTION_TYPES.REBALANCE:
      return generateRebalanceExplanation(transaction)
    
    case TRANSACTION_TYPES.CONTRIBUTION:
      return `Added ${formattedAmount} - ${reason}`
    
    case TRANSACTION_TYPES.WITHDRAWAL:
      return `Withdrew ${formattedAmount} - ${reason}`
    
    default:
      return `${type.charAt(0).toUpperCase() + type.slice(1)} transaction: ${reason}`
  }

  return `Transaction: ${reason}`
}

/**
 * Generate summary statistics for a bucket
 * @param {string} bucketName - Name of the bucket
 * @param {Array} transactions - Array of transactions for the bucket
 * @returns {Object} Summary statistics
 */
function generateBucketSummary(bucketName, transactions) {
  const summary = {
    totalTransactions: transactions.length,
    totalBorrowed: 0,
    totalLent: 0,
    totalContributions: 0,
    totalWithdrawals: 0,
    rebalanceCount: 0,
    mostCommonReason: null,
    lastActivity: null
  }

  if (transactions.length === 0) {
    return summary
  }

  const reasonCounts = {}
  
  transactions.forEach(transaction => {
    // Update last activity
    if (!summary.lastActivity || new Date(transaction.timestamp) > new Date(summary.lastActivity)) {
      summary.lastActivity = transaction.timestamp
    }

    // Count reasons
    if (transaction.reason) {
      reasonCounts[transaction.reason] = (reasonCounts[transaction.reason] || 0) + 1
    }

    // Calculate totals based on transaction type and bucket involvement
    switch (transaction.type) {
      case TRANSACTION_TYPES.BORROW:
        if (transaction.fromBucket === bucketName) {
          summary.totalLent += transaction.amount
        } else if (transaction.toBucket === bucketName) {
          summary.totalBorrowed += transaction.amount
        }
        break
      
      case TRANSACTION_TYPES.CONTRIBUTION:
        if (transaction.toBucket === bucketName) {
          summary.totalContributions += transaction.amount
        }
        break
      
      case TRANSACTION_TYPES.WITHDRAWAL:
        if (transaction.fromBucket === bucketName) {
          summary.totalWithdrawals += transaction.amount
        }
        break
      
      case TRANSACTION_TYPES.REBALANCE:
        summary.rebalanceCount++
        break
    }
  })

  // Find most common reason
  if (Object.keys(reasonCounts).length > 0) {
    summary.mostCommonReason = Object.entries(reasonCounts)
      .sort(([,a], [,b]) => b - a)[0][0]
  }

  return summary
}

/**
 * Get comprehensive transaction statistics
 * @param {Object} options - Filter options
 * @returns {Object} Comprehensive statistics
 */
export function getTransactionStatistics(options = {}) {
  try {
    const allTransactions = getAllTransactions()
    const bucketBalances = getBucketBalances()
    
    let filteredTransactions = allTransactions
    
    // Apply filters
    if (options.startDate) {
      const startDate = new Date(options.startDate)
      filteredTransactions = filteredTransactions.filter(t => new Date(t.timestamp) >= startDate)
    }
    
    if (options.endDate) {
      const endDate = new Date(options.endDate)
      filteredTransactions = filteredTransactions.filter(t => new Date(t.timestamp) <= endDate)
    }

    const stats = {
      totalTransactions: filteredTransactions.length,
      currentBalances: bucketBalances,
      transactionsByType: {},
      transactionsByCategory: {},
      monthlyActivity: {},
      bucketActivity: {
        foundation: { borrowed: 0, lent: 0, rebalances: 0 },
        dream: { borrowed: 0, lent: 0, rebalances: 0 },
        life: { borrowed: 0, lent: 0, rebalances: 0 }
      }
    }

    filteredTransactions.forEach(transaction => {
      // Count by type
      stats.transactionsByType[transaction.type] = (stats.transactionsByType[transaction.type] || 0) + 1
      
      // Count by category
      if (transaction.category) {
        stats.transactionsByCategory[transaction.category] = (stats.transactionsByCategory[transaction.category] || 0) + 1
      }
      
      // Monthly activity
      const month = transaction.timestamp.substring(0, 7) // YYYY-MM
      stats.monthlyActivity[month] = (stats.monthlyActivity[month] || 0) + 1
      
      // Bucket activity
      if (transaction.type === TRANSACTION_TYPES.BORROW) {
        if (transaction.fromBucket && stats.bucketActivity[transaction.fromBucket]) {
          stats.bucketActivity[transaction.fromBucket].lent += transaction.amount
        }
        if (transaction.toBucket && stats.bucketActivity[transaction.toBucket]) {
          stats.bucketActivity[transaction.toBucket].borrowed += transaction.amount
        }
      } else if (transaction.type === TRANSACTION_TYPES.REBALANCE) {
        Object.keys(stats.bucketActivity).forEach(bucket => {
          if (transaction.allocationBefore[bucket] !== transaction.allocationAfter[bucket]) {
            stats.bucketActivity[bucket].rebalances++
          }
        })
      }
    })

    return {
      success: true,
      statistics: stats,
      generatedAt: new Date().toISOString()
    }

  } catch (error) {
    console.error('Error generating transaction statistics:', error)
    return {
      success: false,
      error: 'Failed to generate statistics',
      code: 'STATISTICS_ERROR',
      details: error.message
    }
  }
}

/**
 * Export all transaction data for backup or analysis
 * @returns {Object} Complete transaction data export
 */
export function exportTransactionData() {
  try {
    return {
      success: true,
      data: {
        transactions: getAllTransactions(),
        balances: getBucketBalances(),
        allocations: getCurrentAllocation(),
        repaymentSchedules: getRepaymentSchedules(),
        exportedAt: new Date().toISOString(),
        version: '1.0'
      }
    }
  } catch (error) {
    console.error('Error exporting transaction data:', error)
    return {
      success: false,
      error: 'Failed to export data',
      code: 'EXPORT_ERROR',
      details: error.message
    }
  }
}

/**
 * Import transaction data from backup
 * @param {Object} importData - Data to import
 * @param {Object} options - Import options
 * @returns {Object} Import result
 */
export function importTransactionData(importData, options = {}) {
  if (!importData || !importData.data) {
    return {
      success: false,
      error: 'Invalid import data format',
      code: 'INVALID_IMPORT_DATA'
    }
  }

  try {
    const { transactions, balances, allocations, repaymentSchedules } = importData.data
    
    if (options.clearExisting) {
      // Clear existing data
      if (isLocalStorageAvailable()) {
        localStorage.removeItem(STORAGE_KEYS.BUCKET_TRANSACTIONS)
        localStorage.removeItem(STORAGE_KEYS.BUCKET_BALANCES)
        localStorage.removeItem(STORAGE_KEYS.BUCKET_ALLOCATIONS)
        localStorage.removeItem(STORAGE_KEYS.REPAYMENT_SCHEDULES)
      }
    }

    // Import data
    if (transactions && Array.isArray(transactions)) {
      localStorage.setItem(STORAGE_KEYS.BUCKET_TRANSACTIONS, safeJsonStringify(transactions))
    }
    
    if (balances) {
      localStorage.setItem(STORAGE_KEYS.BUCKET_BALANCES, safeJsonStringify(balances))
    }
    
    if (allocations) {
      localStorage.setItem(STORAGE_KEYS.BUCKET_ALLOCATIONS, safeJsonStringify(allocations))
    }
    
    if (repaymentSchedules && Array.isArray(repaymentSchedules)) {
      localStorage.setItem(STORAGE_KEYS.REPAYMENT_SCHEDULES, safeJsonStringify(repaymentSchedules))
    }

    return {
      success: true,
      imported: {
        transactions: transactions?.length || 0,
        balances: balances ? 1 : 0,
        allocations: allocations ? 1 : 0,
        repaymentSchedules: repaymentSchedules?.length || 0
      },
      importedAt: new Date().toISOString()
    }

  } catch (error) {
    console.error('Error importing transaction data:', error)
    return {
      success: false,
      error: 'Failed to import data',
      code: 'IMPORT_ERROR',
      details: error.message
    }
  }
}

// Export all functions and constants
export default {
  borrowFromBucket,
  rebalanceBuckets,
  getBucketHistory,
  getBucketBalances,
  getTransactionStatistics,
  exportTransactionData,
  importTransactionData,
  TRANSACTION_TYPES,
  BUCKET_NAMES,
  REASON_CATEGORIES
}
