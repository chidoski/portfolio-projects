import React, { useState } from 'react';
import { TrendingUp, User, Calendar, Briefcase } from 'lucide-react';
import { findCareerProfile, calculateIncomeProjection, suggestCareerStage } from '../data/careerProfiles.js';

/**
 * CareerProjectionDemo Component
 * Demonstrates and tests the career-based income projection system
 */
const CareerProjectionDemo = () => {
  const [testCase, setTestCase] = useState('teacher');

  // Test cases based on the prompt requirements
  const testCases = {
    teacher: {
      name: '35-year-old Teacher',
      occupation: 'Teacher',
      currentAge: 35,
      currentIncome: 65000,
      yearsInField: 8,
      careerStage: 'mid-career',
      expectedAt50: 87000, // Expected from prompt
      description: 'Public school teacher with 8 years experience'
    },
    softwareEarly: {
      name: '28-year-old Software Engineer (Early Career)',
      occupation: 'Software Engineer',
      currentAge: 28,
      currentIncome: 95000,
      yearsInField: 4,
      careerStage: 'early-career',
      expectedAt40: 154000, // Approximate based on 8% growth
      description: 'Software engineer in early career with high growth potential'
    },
    softwareMid: {
      name: '38-year-old Software Engineer (Mid Career)',
      occupation: 'Software Engineer',
      currentAge: 38,
      currentIncome: 140000,
      yearsInField: 12,
      careerStage: 'mid-career',
      expectedAt50: 219000, // Approximate based on 5% growth
      description: 'Experienced software engineer in mid-career phase'
    },
    nurse: {
      name: '32-year-old Nurse',
      occupation: 'Nurse',
      currentAge: 32,
      currentIncome: 75000,
      yearsInField: 6,
      careerStage: 'mid-career',
      expectedAt50: 151000, // Approximate based on 5% consistent growth
      description: 'Registered nurse with solid experience'
    },
    businessOwner: {
      name: '42-year-old Small Business Owner',
      occupation: 'Small Business Owner',
      currentAge: 42,
      currentIncome: 120000,
      yearsInField: 15,
      careerStage: 'peak-earning',
      expectedAt55: 157000, // Variable growth, conservative estimate
      description: 'Established small business owner with variable income'
    },
    financialAdvisor: {
      name: '45-year-old Financial Advisor',
      occupation: 'Financial Advisor',
      currentAge: 45,
      currentIncome: 180000,
      yearsInField: 18,
      careerStage: 'peak-earning',
      expectedAt60: 237000, // 4% growth in peak earning years
      description: 'Successful financial advisor with established client base'
    }
  };

  const currentTest = testCases[testCase];

  // Calculate projections for different target ages
  const calculateMultipleProjections = (testData) => {
    const projections = [];
    const targetAges = [40, 50, 60, 65];
    
    targetAges.forEach(targetAge => {
      if (targetAge > testData.currentAge) {
        const projection = calculateIncomeProjection(
          testData.currentIncome,
          testData.currentAge,
          targetAge,
          testData.occupation,
          testData.careerStage,
          testData.yearsInField
        );
        projections.push({
          targetAge,
          ...projection
        });
      }
    });
    
    return projections;
  };

  const projections = calculateMultipleProjections(currentTest);
  const profile = findCareerProfile(currentTest.occupation);

  return (
    <div className="max-w-6xl mx-auto p-8 bg-gray-50 min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Career-Based Income Projection System
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Testing occupation-specific growth patterns for credible income projections
        </p>

        {/* Test Case Selector */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {Object.entries(testCases).map(([key, test]) => (
            <button
              key={key}
              onClick={() => setTestCase(key)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all duration-200
                ${testCase === key 
                  ? 'bg-blue-500 text-white shadow-lg scale-105' 
                  : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                }
              `}
            >
              {test.name}
            </button>
          ))}
        </div>
      </div>

      {/* Current Test Case Details */}
      <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-blue-100 p-3 rounded-lg">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentTest.name}</h2>
            <p className="text-gray-600 mb-4">{currentTest.description}</p>
            
            <div className="grid md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm">
                  <strong>Age:</strong> {currentTest.currentAge}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-500" />
                <span className="text-sm">
                  <strong>Experience:</strong> {currentTest.yearsInField} years
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <span className="text-sm">
                  <strong>Stage:</strong> {currentTest.careerStage.replace('-', ' ')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  <strong>Current Income:</strong> ${currentTest.currentIncome.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Career Profile Information */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Career Profile: {profile.name}
          </h3>
          <p className="text-gray-600 mb-4">{profile.description}</p>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-700">Job Stability:</span>
              <p className="text-sm text-gray-600">{profile.stability}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Pension Benefits:</span>
              <p className="text-sm text-gray-600">{profile.pensionBenefit ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Growth Rate ({currentTest.careerStage}):</span>
              <p className="text-sm text-gray-600">
                {(profile.growthPattern[currentTest.careerStage].annualGrowth * 100).toFixed(1)}% per year
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Stage Description:</strong> {profile.growthPattern[currentTest.careerStage].description}
            </p>
          </div>
        </div>

        {/* Income Projections */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {projections.map((projection, index) => (
            <div key={projection.targetAge} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <div className="text-center">
                <h4 className="text-sm font-medium text-green-600 mb-2">
                  Income at Age {projection.targetAge}
                </h4>
                <p className="text-2xl font-bold text-green-800 mb-2">
                  ${projection.projectedIncome.toLocaleString()}
                </p>
                <p className="text-xs text-green-600">
                  +{projection.totalGrowth.toFixed(1)}% from current
                </p>
                <p className="text-xs text-green-600 mt-1">
                  ({projection.targetAge - currentTest.currentAge} years @ {(projection.annualGrowthRate * 100).toFixed(1)}%)
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Validation Against Expected Results */}
        {currentTest.expectedAt50 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-yellow-800 mb-3">
              Validation Check (Age 50 Projection)
            </h4>
            
            {(() => {
              const age50Projection = projections.find(p => p.targetAge === 50);
              if (age50Projection) {
                const difference = age50Projection.projectedIncome - currentTest.expectedAt50;
                const percentDiff = (difference / currentTest.expectedAt50) * 100;
                const isClose = Math.abs(percentDiff) < 15; // Within 15% is considered reasonable
                
                return (
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-yellow-700 mb-1">Expected (Prompt):</p>
                      <p className="text-lg font-bold text-yellow-800">
                        ${currentTest.expectedAt50.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-yellow-700 mb-1">Calculated:</p>
                      <p className="text-lg font-bold text-yellow-800">
                        ${age50Projection.projectedIncome.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-yellow-700 mb-1">Difference:</p>
                      <p className={`text-lg font-bold ${isClose ? 'text-green-700' : 'text-red-700'}`}>
                        {difference > 0 ? '+' : ''}${difference.toLocaleString()} ({percentDiff > 0 ? '+' : ''}{percentDiff.toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                );
              }
              return <p className="text-yellow-700">No projection available for age 50</p>;
            })()}
          </div>
        )}

        {/* Additional Notes */}
        {profile.notes && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Career Notes:</strong> {profile.notes}
            </p>
          </div>
        )}
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">How the System Works</h3>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Career Profile Matching</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Fuzzy matching finds the best career profile for user input</li>
              <li>• Each profile has stage-specific growth rates</li>
              <li>• Includes stability ratings and benefit information</li>
              <li>• Falls back to generic professional profile if no match</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Growth Calculation</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Uses compound annual growth rate by career stage</li>
              <li>• Accounts for typical career progression patterns</li>
              <li>• Provides realistic projections based on industry data</li>
              <li>• Adjusts for different life stages and earning potential</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Example Validation:</strong> The 35-year-old teacher earning $65,000 projects to approximately $87,000 by age 50 
            using 2% mid-career growth, which reflects the more conservative salary progression typical in education with step increases and tenure-based advancement.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CareerProjectionDemo;
