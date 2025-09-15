/**
 * Debt Calculation Service
 * Specialized calculations for different types of debt, including federal loans
 * Ensures accurate amortization and payoff calculations
 */

import { Debt } from '../models/FinancialProfile.js';

/**
 * Validate and test debt calculations for accuracy
 * @param {Object} debtData - Debt information
 * @returns {Object} Validation results and corrected calculations
 */
export function validateDebtCalculations(debtData) {
  const { currentBalance, monthlyPayment, interestRate, type } = debtData;
  
  console.log('=== DEBT CALCULATION VALIDATION ===');
  console.log('Input:', { currentBalance, monthlyPayment, interestRate, type });
  
  // Federal loan specific validation
  if (type === 'student_loan' || type === 'federal_loan') {
    return validateFederalLoanCalculation(debtData);
  }
  
  return validateStandardDebtCalculation(debtData);
}

/**
 * Validate federal student loan calculations
 * Federal loans have specific characteristics:
 * - Standard 10-year repayment plan
 * - Daily interest accrual (not monthly compounding)
 * - Interest capitalization rules
 */
function validateFederalLoanCalculation(debtData) {
  const { currentBalance, monthlyPayment, interestRate } = debtData;
  
  console.log('Validating Federal Loan Calculation...');
  
  // Federal loan calculation using proper amortization formula
  const monthlyRate = interestRate / 100 / 12;
  const principal = currentBalance;
  const payment = monthlyPayment;
  
  console.log('Monthly interest rate:', monthlyRate);
  console.log('Principal balance:', principal);
  console.log('Monthly payment:', payment);
  
  // Check if payment covers interest
  const monthlyInterestAmount = principal * monthlyRate;
  console.log('Monthly interest amount:', monthlyInterestAmount);
  
  if (payment <= monthlyInterestAmount) {
    return {
      isValid: false,
      error: 'Payment does not cover monthly interest - loan will never be paid off',
      monthlyInterestAmount,
      minimumPaymentNeeded: monthlyInterestAmount + 1
    };
  }
  
  // Calculate using standard amortization formula: n = -log(1 - (P*r)/M) / log(1 + r)
  const numerator = Math.log(1 + (principal * monthlyRate) / payment);
  const denominator = Math.log(1 + monthlyRate);
  const calculatedMonths = numerator / denominator;
  
  console.log('Calculated months (raw):', calculatedMonths);
  console.log('Calculated months (rounded):', Math.ceil(calculatedMonths));
  
  // Total interest calculation
  const totalPayments = payment * Math.ceil(calculatedMonths);
  const totalInterest = totalPayments - principal;
  
  console.log('Total payments:', totalPayments);
  console.log('Total interest:', totalInterest);
  
  // Validate against expected federal loan ranges
  const expectedYears = principal / (payment * 12);
  const isReasonableTimeline = calculatedMonths >= 12 && calculatedMonths <= 360; // 1-30 years
  
  console.log('Expected years (simple):', expectedYears);
  console.log('Is reasonable timeline:', isReasonableTimeline);
  
  // Federal loan specific tests for $70k at 6% with $800 payment
  if (Math.abs(principal - 70000) < 1000 && Math.abs(interestRate - 6) < 1 && Math.abs(payment - 800) < 50) {
    console.log('*** FEDERAL LOAN BENCHMARK TEST ***');
    console.log('Testing $70k @ 6% with $800/month payment');
    
    // Expected: approximately 9-10 years (108-120 months)
    const expectedMonthsMin = 108;
    const expectedMonthsMax = 120;
    const isWithinExpectedRange = calculatedMonths >= expectedMonthsMin && calculatedMonths <= expectedMonthsMax;
    
    console.log(`Expected range: ${expectedMonthsMin}-${expectedMonthsMax} months`);
    console.log(`Calculated: ${Math.ceil(calculatedMonths)} months`);
    console.log('Within expected range:', isWithinExpectedRange);
    
    if (!isWithinExpectedRange) {
      console.warn('*** CALCULATION ERROR DETECTED ***');
      console.warn('Federal loan calculation is outside expected range');
      console.warn('This indicates a potential error in the amortization formula');
    }
  }
  
  // Create detailed simulation for verification
  const simulation = simulateMonthlyPayments(principal, payment, monthlyRate);
  
  return {
    isValid: isReasonableTimeline,
    calculatedMonths: Math.ceil(calculatedMonths),
    totalInterest: Math.round(totalInterest),
    totalPayments: Math.round(totalPayments),
    monthlyInterestAmount,
    simulation: simulation.summary,
    detailedSimulation: simulation.monthly.slice(0, 12), // First 12 months
    warnings: simulation.warnings
  };
}

/**
 * Validate standard debt calculations (credit cards, personal loans, etc.)
 */
function validateStandardDebtCalculation(debtData) {
  const { currentBalance, monthlyPayment, interestRate } = debtData;
  
  console.log('Validating Standard Debt Calculation...');
  
  const monthlyRate = interestRate / 100 / 12;
  
  if (monthlyPayment <= 0 || currentBalance <= 0) {
    return {
      isValid: false,
      error: 'Payment and balance must be greater than zero'
    };
  }
  
  if (monthlyRate === 0) {
    // No interest - simple division
    const months = Math.ceil(currentBalance / monthlyPayment);
    return {
      isValid: true,
      calculatedMonths: months,
      totalInterest: 0,
      totalPayments: monthlyPayment * months
    };
  }
  
  // Standard amortization calculation
  const numerator = Math.log(1 + (currentBalance * monthlyRate) / monthlyPayment);
  const denominator = Math.log(1 + monthlyRate);
  const calculatedMonths = Math.ceil(numerator / denominator);
  
  const totalPayments = monthlyPayment * calculatedMonths;
  const totalInterest = totalPayments - currentBalance;
  
  return {
    isValid: true,
    calculatedMonths,
    totalInterest: Math.round(totalInterest),
    totalPayments: Math.round(totalPayments)
  };
}

/**
 * Simulate monthly payments to verify calculations
 */
function simulateMonthlyPayments(principal, monthlyPayment, monthlyRate) {
  let balance = principal;
  let totalInterestPaid = 0;
  let month = 0;
  const monthlyDetails = [];
  const warnings = [];
  
  const maxMonths = 600; // 50 year maximum
  
  while (balance > 0.01 && month < maxMonths) {
    month++;
    
    const interestPayment = balance * monthlyRate;
    let principalPayment = monthlyPayment - interestPayment;
    
    // Ensure we don't overpay
    if (principalPayment > balance) {
      principalPayment = balance;
      const actualPayment = principalPayment + interestPayment;
      monthlyDetails.push({
        month,
        balance: balance.toFixed(2),
        interestPayment: interestPayment.toFixed(2),
        principalPayment: principalPayment.toFixed(2),
        actualPayment: actualPayment.toFixed(2),
        remainingBalance: 0
      });
      balance = 0;
    } else {
      balance -= principalPayment;
      totalInterestPaid += interestPayment;
      
      monthlyDetails.push({
        month,
        balance: (balance + principalPayment).toFixed(2),
        interestPayment: interestPayment.toFixed(2),
        principalPayment: principalPayment.toFixed(2),
        actualPayment: monthlyPayment.toFixed(2),
        remainingBalance: balance.toFixed(2)
      });
    }
    
    // Warning if payment barely covers interest
    if (principalPayment < interestPayment * 0.1) {
      warnings.push(`Month ${month}: Payment barely covers interest (${principalPayment.toFixed(2)} principal vs ${interestPayment.toFixed(2)} interest)`);
    }
  }
  
  if (month >= maxMonths) {
    warnings.push('Simulation stopped at maximum months - loan may never be paid off with current payment');
  }
  
  return {
    summary: {
      totalMonths: month,
      totalInterestPaid: Math.round(totalInterestPaid),
      totalPayments: Math.round((month - 1) * monthlyPayment + (monthlyDetails[month - 1]?.actualPayment || 0))
    },
    monthly: monthlyDetails,
    warnings
  };
}

/**
 * Test the current Debt class calculations
 */
export function testDebtClassCalculations() {
  console.log('=== TESTING DEBT CLASS CALCULATIONS ===');
  
  // Test case 1: $70k federal loan at 6% with $800 payment
  const federalLoan = new Debt({
    name: 'Federal Student Loan',
    type: 'student_loan',
    currentBalance: 70000,
    monthlyPayment: 800,
    interestRate: 6.0
  });
  
  console.log('Federal Loan Test:');
  console.log('Remaining months:', federalLoan.calculateRemainingMonths());
  console.log('Total interest:', federalLoan.calculateTotalInterest());
  console.log('Payoff date:', federalLoan.calculatePayoffDate());
  
  // Validate against manual calculation
  const validation = validateFederalLoanCalculation({
    currentBalance: 70000,
    monthlyPayment: 800,
    interestRate: 6.0,
    type: 'student_loan'
  });
  
  console.log('Validation results:', validation);
  
  // Test case 2: Credit card debt
  const creditCard = new Debt({
    name: 'Credit Card',
    type: 'credit_card',
    currentBalance: 5000,
    monthlyPayment: 200,
    interestRate: 18.0
  });
  
  console.log('Credit Card Test:');
  console.log('Remaining months:', creditCard.calculateRemainingMonths());
  console.log('Total interest:', creditCard.calculateTotalInterest());
  
  return {
    federalLoan: {
      debtClass: {
        months: federalLoan.calculateRemainingMonths(),
        interest: federalLoan.calculateTotalInterest()
      },
      validation
    },
    creditCard: {
      months: creditCard.calculateRemainingMonths(),
      interest: creditCard.calculateTotalInterest()
    }
  };
}

/**
 * Create corrected debt calculation functions for federal loans
 */
export class FederalLoanCalculator {
  /**
   * Calculate federal loan payoff with proper amortization
   * @param {number} principal - Loan balance
   * @param {number} payment - Monthly payment
   * @param {number} annualRate - Annual interest rate (as percentage)
   * @returns {Object} Calculation results
   */
  static calculatePayoff(principal, payment, annualRate) {
    const monthlyRate = annualRate / 100 / 12;
    
    if (payment <= principal * monthlyRate) {
      return {
        error: 'Payment does not cover interest',
        minimumPayment: (principal * monthlyRate) + 1
      };
    }
    
    // Use the standard amortization formula
    const months = Math.log(1 + (principal * monthlyRate) / payment) / Math.log(1 + monthlyRate);
    const totalPayments = payment * Math.ceil(months);
    const totalInterest = totalPayments - principal;
    
    return {
      months: Math.ceil(months),
      years: Math.ceil(months) / 12,
      totalInterest: Math.round(totalInterest),
      totalPayments: Math.round(totalPayments),
      monthlyInterest: principal * monthlyRate
    };
  }
  
  /**
   * Calculate standard 10-year federal loan payment
   * @param {number} principal - Loan balance
   * @param {number} annualRate - Annual interest rate
   * @returns {number} Required monthly payment
   */
  static calculateStandardPayment(principal, annualRate) {
    const monthlyRate = annualRate / 100 / 12;
    const months = 120; // 10 years
    
    if (monthlyRate === 0) {
      return principal / months;
    }
    
    // PMT = P * [r(1+r)^n] / [(1+r)^n - 1]
    const factor = Math.pow(1 + monthlyRate, months);
    return principal * (monthlyRate * factor) / (factor - 1);
  }
}

export default {
  validateDebtCalculations,
  testDebtClassCalculations,
  FederalLoanCalculator
};
