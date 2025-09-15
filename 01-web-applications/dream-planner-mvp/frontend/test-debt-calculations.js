/**
 * Test script for debt calculations
 * Run this to verify federal loan calculation accuracy
 * 
 * To run: node test-debt-calculations.js
 */

// Mock the Debt class for testing
class MockDebt {
  constructor({ currentBalance, monthlyPayment, interestRate }) {
    this.currentBalance = currentBalance;
    this.monthlyPayment = monthlyPayment;
    this.interestRate = interestRate;
  }

  calculateRemainingMonths() {
    if (this.monthlyPayment <= 0 || this.currentBalance <= 0) return 0;
    
    const monthlyInterestRate = this.interestRate / 100 / 12;
    if (monthlyInterestRate === 0) {
      return Math.ceil(this.currentBalance / this.monthlyPayment);
    }
    
    // Corrected implementation using proper amortization formula
    const ratio = (this.currentBalance * monthlyInterestRate) / this.monthlyPayment;
    if (ratio >= 1) {
      console.warn('Payment does not cover interest!');
      return 999;
    }
    const numerator = -Math.log(1 - ratio);
    const denominator = Math.log(1 + monthlyInterestRate);
    return Math.ceil(numerator / denominator);
  }

  calculateTotalInterest() {
    const remainingMonths = this.calculateRemainingMonths();
    return Math.max(0, (this.monthlyPayment * remainingMonths) - this.currentBalance);
  }
}

// Federal loan calculation validator
function validateFederalLoan(principal, payment, rate) {
  console.log('\n=== FEDERAL LOAN CALCULATION TEST ===');
  console.log(`Principal: $${principal.toLocaleString()}`);
  console.log(`Monthly Payment: $${payment}`);
  console.log(`Interest Rate: ${rate}%`);
  
  const monthlyRate = rate / 100 / 12;
  console.log(`Monthly Rate: ${(monthlyRate * 100).toFixed(4)}%`);
  
  // Check if payment covers interest
  const monthlyInterest = principal * monthlyRate;
  console.log(`Monthly Interest: $${monthlyInterest.toFixed(2)}`);
  
  if (payment <= monthlyInterest) {
    console.log('❌ ERROR: Payment does not cover monthly interest!');
    console.log(`Minimum payment needed: $${(monthlyInterest + 1).toFixed(2)}`);
    return false;
  }
  
  // Calculate using proper amortization formula
  const months = Math.log(1 + (principal * monthlyRate) / payment) / Math.log(1 + monthlyRate);
  const years = months / 12;
  const totalPayments = payment * Math.ceil(months);
  const totalInterest = totalPayments - principal;
  
  console.log(`\nCalculated Timeline:`);
  console.log(`Months: ${Math.ceil(months)} (${years.toFixed(1)} years)`);
  console.log(`Total Interest: $${totalInterest.toFixed(2)}`);
  console.log(`Total Payments: $${totalPayments.toFixed(2)}`);
  
  // Test against current Debt class
  const mockDebt = new MockDebt({
    currentBalance: principal,
    monthlyPayment: payment,
    interestRate: rate
  });
  
  const debtClassMonths = mockDebt.calculateRemainingMonths();
  const debtClassInterest = mockDebt.calculateTotalInterest();
  
  console.log(`\nDebt Class Results:`);
  console.log(`Months: ${debtClassMonths}`);
  console.log(`Total Interest: $${debtClassInterest}`);
  
  // Compare results
  const monthsDiff = Math.abs(Math.ceil(months) - debtClassMonths);
  const interestDiff = Math.abs(totalInterest - debtClassInterest);
  
  console.log(`\nComparison:`);
  console.log(`Months difference: ${monthsDiff}`);
  console.log(`Interest difference: $${interestDiff.toFixed(2)}`);
  
  const isAccurate = monthsDiff <= 1 && interestDiff <= 100; // Allow small rounding differences
  console.log(`Accurate: ${isAccurate ? '✅ YES' : '❌ NO'}`);
  
  return isAccurate;
}

// Simulate month-by-month payments for verification
function simulatePayments(principal, payment, rate) {
  console.log('\n=== MONTH-BY-MONTH SIMULATION ===');
  
  let balance = principal;
  let totalInterest = 0;
  let month = 0;
  const monthlyRate = rate / 100 / 12;
  
  console.log('Month | Balance    | Interest  | Principal | New Balance');
  console.log('------|------------|-----------|-----------|------------');
  
  while (balance > 0.01 && month < 300) { // Max 25 years
    month++;
    
    const interestPayment = balance * monthlyRate;
    let principalPayment = payment - interestPayment;
    
    // Don't overpay
    if (principalPayment > balance) {
      principalPayment = balance;
    }
    
    balance -= principalPayment;
    totalInterest += interestPayment;
    
    // Show first 12 months and last few months
    if (month <= 12 || balance <= payment || month % 12 === 0) {
      console.log(
        `${month.toString().padStart(5)} | ` +
        `$${(balance + principalPayment).toFixed(0).padStart(9)} | ` +
        `$${interestPayment.toFixed(2).padStart(8)} | ` +
        `$${principalPayment.toFixed(2).padStart(8)} | ` +
        `$${balance.toFixed(0).padStart(10)}`
      );
    }
    
    if (balance <= 0.01) break;
  }
  
  console.log(`\nFinal Results:`);
  console.log(`Total Months: ${month}`);
  console.log(`Total Interest: $${totalInterest.toFixed(2)}`);
  console.log(`Total Payments: $${(totalInterest + principal).toFixed(2)}`);
  
  return { months: month, totalInterest };
}

// Run tests
console.log('DEBT CALCULATION ACCURACY TEST');
console.log('===============================');

// Test 1: $70k federal loan at 6% with $800 payment
console.log('\nTEST 1: Federal Student Loan Benchmark');
const test1Accurate = validateFederalLoan(70000, 800, 6.0);
simulatePayments(70000, 800, 6.0);

// Test 2: Different scenario
console.log('\n\nTEST 2: Smaller Federal Loan');
const test2Accurate = validateFederalLoan(25000, 300, 5.5);

// Test 3: Credit card scenario
console.log('\n\nTEST 3: Credit Card Debt');
const test3Accurate = validateFederalLoan(5000, 200, 18.0);

// Summary
console.log('\n\n=== TEST SUMMARY ===');
console.log(`Test 1 (Federal Loan): ${test1Accurate ? 'PASS' : 'FAIL'}`);
console.log(`Test 2 (Small Loan): ${test2Accurate ? 'PASS' : 'FAIL'}`);
console.log(`Test 3 (Credit Card): ${test3Accurate ? 'PASS' : 'FAIL'}`);

const allTestsPass = test1Accurate && test2Accurate && test3Accurate;
console.log(`\nOVERALL: ${allTestsPass ? '✅ ALL TESTS PASS' : '❌ SOME TESTS FAILED'}`);

if (!allTestsPass) {
  console.log('\n🔧 RECOMMENDED ACTIONS:');
  console.log('1. Check the amortization formula in calculateRemainingMonths()');
  console.log('2. Verify that monthly interest rate calculation is correct');
  console.log('3. Ensure total interest calculation accounts for final partial payment');
  console.log('4. Consider implementing federal loan specific calculation methods');
}
