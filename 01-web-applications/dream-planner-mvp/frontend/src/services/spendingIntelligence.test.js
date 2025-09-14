/**
 * Test file demonstrating the Spending Intelligence Service
 * Run this in the browser console to see the AI insights in action
 */

import { predictMonthlyNeeds, detectAnomalies, suggestOptimizations, getSpendingInsights } from './spendingIntelligence.js'

// Sample spending history data
const sampleSpendingHistory = [
  // Recent 3 months - groceries
  { date: '2024-01-15', amount: 85.50, category: 'groceries', description: 'Weekly grocery shopping' },
  { date: '2024-01-08', amount: 92.30, category: 'groceries', description: 'Weekly grocery shopping' },
  { date: '2024-01-22', amount: 78.90, category: 'groceries', description: 'Weekly grocery shopping' },
  { date: '2024-02-05', amount: 88.75, category: 'groceries', description: 'Weekly grocery shopping' },
  { date: '2024-02-12', amount: 95.20, category: 'groceries', description: 'Weekly grocery shopping' },
  { date: '2024-02-19', amount: 82.40, category: 'groceries', description: 'Weekly grocery shopping' },
  { date: '2024-03-05', amount: 91.60, category: 'groceries', description: 'Weekly grocery shopping' },
  { date: '2024-03-12', amount: 87.30, category: 'groceries', description: 'Weekly grocery shopping' },
  
  // Dining out - more variable
  { date: '2024-01-10', amount: 45.00, category: 'dining', description: 'Restaurant dinner' },
  { date: '2024-01-18', amount: 28.50, category: 'dining', description: 'Lunch out' },
  { date: '2024-01-25', amount: 65.00, category: 'dining', description: 'Date night' },
  { date: '2024-02-02', amount: 32.75, category: 'dining', description: 'Lunch meeting' },
  { date: '2024-02-14', amount: 120.00, category: 'dining', description: 'Valentine\'s dinner' },
  { date: '2024-02-20', amount: 38.90, category: 'dining', description: 'Weekend brunch' },
  { date: '2024-03-08', amount: 42.50, category: 'dining', description: 'Dinner with friends' },
  { date: '2024-03-15', amount: 29.80, category: 'dining', description: 'Quick lunch' },
  
  // Coffee - very consistent
  { date: '2024-01-03', amount: 4.50, category: 'coffee', description: 'Morning coffee' },
  { date: '2024-01-04', amount: 4.50, category: 'coffee', description: 'Morning coffee' },
  { date: '2024-01-05', amount: 4.50, category: 'coffee', description: 'Morning coffee' },
  { date: '2024-01-08', amount: 4.50, category: 'coffee', description: 'Morning coffee' },
  { date: '2024-01-09', amount: 4.50, category: 'coffee', description: 'Morning coffee' },
  // ... (assume similar pattern for 3 months = ~60 coffee purchases)
  
  // Entertainment - seasonal variation
  { date: '2024-01-12', amount: 15.00, category: 'entertainment', description: 'Movie ticket' },
  { date: '2024-01-20', amount: 25.00, category: 'entertainment', description: 'Concert ticket' },
  { date: '2024-02-03', amount: 12.99, category: 'entertainment', description: 'Streaming service' },
  { date: '2024-02-10', amount: 35.00, category: 'entertainment', description: 'Theater show' },
  { date: '2024-03-02', amount: 18.50, category: 'entertainment', description: 'Museum visit' },
  { date: '2024-03-16', amount: 22.00, category: 'entertainment', description: 'Mini golf' }
]

// Sample dream for optimization suggestions
const sampleDream = {
  id: 'cottage-dream',
  title: 'Maine Cottage',
  target_amount: 75000,
  current_amount: 15000,
  monthly_amount: 800,
  status: 'active'
}

// Test functions
console.log('🧠 Spending Intelligence Service Demo\n')

// Test 1: Predict monthly needs
console.log('📊 PREDICTION TESTS')
console.log('==================')

const groceryPrediction = predictMonthlyNeeds('groceries', sampleSpendingHistory)
console.log('Grocery Prediction:', groceryPrediction)

const diningPrediction = predictMonthlyNeeds('dining', sampleSpendingHistory)
console.log('Dining Prediction:', diningPrediction)

const coffeePrediction = predictMonthlyNeeds('coffee', sampleSpendingHistory)
console.log('Coffee Prediction:', coffeePrediction)

// Test 2: Detect anomalies
console.log('\n🚨 ANOMALY DETECTION TESTS')
console.log('==========================')

// Normal spending
const normalAnomaly = detectAnomalies(350, 340, { category: 'groceries', sensitivity: 'medium' })
console.log('Normal Grocery Spending:', normalAnomaly)

// High spending anomaly
const highAnomaly = detectAnomalies(500, 340, { category: 'groceries', sensitivity: 'medium' })
console.log('High Grocery Spending Anomaly:', highAnomaly)

// Low spending (good anomaly)
const lowAnomaly = detectAnomalies(200, 340, { category: 'groceries', sensitivity: 'medium' })
console.log('Low Grocery Spending (Good!):', lowAnomaly)

// Test 3: Suggest optimizations
console.log('\n💡 OPTIMIZATION SUGGESTIONS')
console.log('============================')

const optimizations = suggestOptimizations(sampleSpendingHistory, sampleDream)
console.log('Optimization Suggestions:', optimizations)

// Test 4: Complete insights summary
console.log('\n📈 COMPLETE INSIGHTS SUMMARY')
console.log('=============================')

const insights = getSpendingInsights(sampleSpendingHistory, [sampleDream])
console.log('Complete Insights:', insights)

// Example usage scenarios
console.log('\n🎯 EXAMPLE USAGE SCENARIOS')
console.log('===========================')

console.log('\n1. Budget Planning Scenario:')
console.log('User is setting up their monthly budget and wants to know how much to allocate for groceries.')
const budgetSuggestion = predictMonthlyNeeds('groceries', sampleSpendingHistory)
console.log(`Suggestion: Allocate $${budgetSuggestion.predictedAmount} for groceries (${budgetSuggestion.confidence} confidence)`)
console.log(`Insight: ${budgetSuggestion.insight}`)

console.log('\n2. Spending Review Scenario:')
console.log('User spent $450 on dining this month, compared to their usual $200.')
const spendingReview = detectAnomalies(450, 200, { category: 'dining', sensitivity: 'medium' })
console.log(`Alert: ${spendingReview.message}`)
console.log(`Recommendation: ${spendingReview.recommendation}`)

console.log('\n3. Dream Acceleration Scenario:')
console.log('User wants to reach their Maine cottage dream faster.')
const dreamAcceleration = suggestOptimizations(sampleSpendingHistory, sampleDream, { maxSuggestions: 2 })
dreamAcceleration.forEach((suggestion, index) => {
  console.log(`\nSuggestion ${index + 1}:`)
  console.log(`Category: ${suggestion.category}`)
  console.log(`Message: ${suggestion.message}`)
  console.log(`Impact: ${suggestion.timelineImpactText} faster`)
  console.log(`Actions: ${suggestion.actionSuggestions.join(', ')}`)
})

export { sampleSpendingHistory, sampleDream }
