import React, { useState, useEffect } from 'react';
import { generateIncomeOptimization } from '../services/incomeOptimization.js';
import { calculateCareerTrajectory, whatIfScenarios, CareerProjectionUtils } from '../services/careerProjection.js';
import { FinancialProfile } from '../models/FinancialProfile.js';
import PassiveIncomeBuilder from '../components/PassiveIncomeBuilder.jsx';

/**
 * IncomeAccelerator Component
 * Provides personalized income optimization suggestions based on user profile
 * Features effort/impact matrix and timeline calculations for dream goals
 */
const IncomeAccelerator = () => {
  const [financialProfile, setFinancialProfile] = useState(null);
  const [optimization, setOptimization] = useState(null);
  const [careerProjection, setCareerProjection] = useState(null);
  const [whatIfData, setWhatIfData] = useState(null);
  const [selectedEffortLevel, setSelectedEffortLevel] = useState('all');
  const [selectedView, setSelectedView] = useState('optimization'); // 'optimization', 'career', or 'passive'
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = () => {
    try {
      const savedProfile = localStorage.getItem('financialProfile');
      const profileData = savedProfile ? JSON.parse(savedProfile) : null;
      const profile = profileData ? new FinancialProfile(profileData) : new FinancialProfile();
      setFinancialProfile(profile);
      
      // Generate optimization suggestions
      const dreamGoals = {
        name: profile.northStarDream?.title || 'cottage',
        targetAmount: profile.northStarDream?.targetNetWorth || 500000,
        currentSaved: profile.currentAssets?.totalAssets || 0,
        monthlySavings: 2000,
        currentAge: profile.userProfile?.age || 32,
        targetAge: profile.northStarDream?.targetAge || 52
      };

      const optimizationResults = generateIncomeOptimization(
        profile.userProfile,
        profile,
        dreamGoals
      );
      
      setOptimization(optimizationResults);

      // Generate career projection
      const careerResults = calculateCareerTrajectory(
        profile.userProfile.employment?.position || 'Professional',
        profile.userProfile.age || 32,
        profile.userProfile.employment?.industry || 'Marketing & Advertising',
        profile.userProfile.income?.gross?.annual || 85000,
        profile.userProfile.location?.state || 'Massachusetts',
        dreamGoals
      );
      
      setCareerProjection(careerResults);

      // Generate what-if scenarios
      const whatIfResults = whatIfScenarios(
        profile.userProfile.employment?.position || 'Professional',
        profile.userProfile.age || 32,
        profile.userProfile.employment?.industry || 'Marketing & Advertising',
        profile.userProfile.income?.gross?.annual || 85000,
        profile.userProfile.location?.state || 'Massachusetts',
        dreamGoals
      );
      
      setWhatIfData(whatIfResults);
    } catch (error) {
      console.error('Error loading profile:', error);
      // If there's an error loading, create a new profile as fallback
      setFinancialProfile(new FinancialProfile());
    } finally {
      setIsLoading(false);
    }
  };

  const getEffortColor = (effort) => {
    switch (effort) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEffortIcon = (effort) => {
    switch (effort) {
      case 'low': return '🟢';
      case 'medium': return '🟡';
      case 'high': return '🔴';
      default: return '⚪';
    }
  };

  const getProbabilityBar = (probability) => {
    const percentage = Math.round(probability * 100);
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const filteredSuggestions = selectedEffortLevel === 'all' 
    ? optimization?.suggestions || []
    : optimization?.suggestions?.filter(s => s.effort === selectedEffortLevel) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your income optimization opportunities...</p>
        </div>
      </div>
    );
  }

  if (!financialProfile || !optimization) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg max-w-md text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">No Profile Found</h2>
          <p className="text-gray-600 mb-6">Please complete your financial profile first to get personalized income optimization suggestions.</p>
          <button
            onClick={() => window.location.href = '/someday-life-builder'}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Build Your Profile
          </button>
        </div>
      </div>
    );
  }

  const userProfile = financialProfile.userProfile;
  const currentSalary = userProfile.income?.gross?.annual || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            💰 Income Accelerator
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Personalized strategies to increase your earnings and accelerate your dreams
          </p>
        </div>

        {/* Current Profile Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Current Income</h3>
              <p className="text-3xl font-bold text-indigo-600">{formatCurrency(currentSalary)}</p>
              <p className="text-sm text-gray-500">{userProfile.employment?.position || 'Professional'}</p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Potential Increase</h3>
              <p className="text-3xl font-bold text-green-600">
                +{formatCurrency(optimization.potentialAnnualIncrease)}
              </p>
              <p className="text-sm text-gray-500">Annual opportunity</p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Dream Impact</h3>
              <p className="text-3xl font-bold text-purple-600">
                -{Math.round(optimization.timelineImpact.yearsReduced)} years
              </p>
              <p className="text-sm text-gray-500">Faster achievement</p>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setSelectedView('optimization')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedView === 'optimization' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              💡 Income Optimization
            </button>
            <button
              onClick={() => setSelectedView('career')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedView === 'career' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📈 Career Trajectory
            </button>
            <button
              onClick={() => setSelectedView('passive')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedView === 'passive' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              💰 Passive Income
            </button>
          </div>
        </div>

        {selectedView === 'optimization' && (
          <>
            {/* Effort Filter */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Effort/Impact Matrix</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {['all', 'low', 'medium', 'high'].map(effort => (
              <button
                key={effort}
                onClick={() => setSelectedEffortLevel(effort)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  selectedEffortLevel === effort 
                    ? 'bg-indigo-600 text-white border-indigo-600' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {effort === 'all' ? 'All Opportunities' : `${effort.charAt(0).toUpperCase() + effort.slice(1)} Effort`}
              </button>
            ))}
          </div>

          {/* Quick Stats */}
          {optimization.effortMatrix && (
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-green-800 font-medium">🟢 Low Effort</span>
                  <span className="text-green-600 font-bold">{optimization.effortMatrix.low?.length || 0}</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  Quick wins: {formatCurrency(optimization.effortMatrix.low?.reduce((sum, s) => sum + s.annualImpact, 0) || 0)}
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                  <span className="text-yellow-800 font-medium">🟡 Medium Effort</span>
                  <span className="text-yellow-600 font-bold">{optimization.effortMatrix.medium?.length || 0}</span>
                </div>
                <p className="text-sm text-yellow-600 mt-1">
                  Growth ops: {formatCurrency(optimization.effortMatrix.medium?.reduce((sum, s) => sum + s.annualImpact, 0) || 0)}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center justify-between">
                  <span className="text-red-800 font-medium">🔴 High Effort</span>
                  <span className="text-red-600 font-bold">{optimization.effortMatrix.high?.length || 0}</span>
                </div>
                <p className="text-sm text-red-600 mt-1">
                  Transformative: {formatCurrency(optimization.effortMatrix.high?.reduce((sum, s) => sum + s.annualImpact, 0) || 0)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions List */}
        <div className="space-y-6">
          {filteredSuggestions.map((suggestion, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getEffortIcon(suggestion.effort)}</span>
                    <h3 className="text-xl font-bold text-gray-800">{suggestion.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getEffortColor(suggestion.effort)}`}>
                      {suggestion.effort} effort
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{suggestion.description}</p>
                  
                  {suggestion.timelineImpact && (
                    <p className="text-purple-600 font-medium mb-3">
                      🎯 {suggestion.timelineImpact.description}
                    </p>
                  )}
                </div>
                
                <div className="text-right ml-4">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    +{formatCurrency(suggestion.annualImpact)}
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    {formatCurrency(suggestion.monthlyImpact)}/month
                  </div>
                  <div className="text-xs text-gray-400">
                    {suggestion.timeframe}
                  </div>
                </div>
              </div>

              {/* Success Probability */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Success Probability</span>
                  <span className="text-gray-800 font-medium">{Math.round(suggestion.probability * 100)}%</span>
                </div>
                {getProbabilityBar(suggestion.probability)}
              </div>

              {/* Requirements */}
              {suggestion.requirements && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Requirements:</h4>
                  <div className="flex flex-wrap gap-2">
                    {suggestion.requirements.map((req, i) => (
                      <span key={i} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Steps */}
              {suggestion.actionSteps && (
                <details className="group">
                  <summary className="cursor-pointer text-indigo-600 font-medium text-sm hover:text-indigo-700 mb-2">
                    📋 Action Steps
                  </summary>
                  <div className="ml-4 space-y-1">
                    {suggestion.actionSteps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-indigo-500 font-bold">{i + 1}.</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>

        {/* Industry Insights */}
        {optimization.industryInsights && (
          <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📈 Industry Insights</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Market Trends</h3>
                <ul className="space-y-2">
                  {optimization.industryInsights.marketTrends?.map((trend, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-600">
                      <span className="text-blue-500">•</span>
                      {trend}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">High-Value Skills</h3>
                <ul className="space-y-2">
                  {optimization.industryInsights.topSkills?.map((skill, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-600">
                      <span className="text-green-500">✓</span>
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-600">📊</span>
                <span className="font-medium text-blue-800">Industry Growth Rate</span>
              </div>
              <p className="text-blue-700">
                Your industry is growing at {(optimization.industryInsights.industryGrowth * 100).toFixed(1)}% annually, 
                {optimization.industryInsights.industryGrowth > 0.06 ? ' above average' : ' at market rate'}.
              </p>
            </div>
          </div>
        )}
        </>
        )}

        {selectedView === 'career' && careerProjection && (
          <>
            {/* Career Progression Overview */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">📈 Your Career Trajectory</h2>
              
              {/* Current vs Future Impact */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">🎯 Typical Career Path</h3>
                  <p className="text-blue-700 mb-4">
                    {careerProjection.dreamImpacts?.typical?.message}
                  </p>
                  <div className="text-2xl font-bold text-blue-600">
                    Age {careerProjection.dreamImpacts?.typical?.newTargetAge || '52'}
                  </div>
                  <div className="text-sm text-blue-600">Dream achievement</div>
                </div>
                
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-3">🚀 Optimistic Path</h3>
                  <p className="text-green-700 mb-4">
                    {careerProjection.dreamImpacts?.optimistic?.message}
                  </p>
                  <div className="text-2xl font-bold text-green-600">
                    Age {careerProjection.dreamImpacts?.optimistic?.newTargetAge || '49'}
                  </div>
                  <div className="text-sm text-green-600">
                    {Math.round(careerProjection.dreamImpacts?.optimistic?.yearsSaved || 0)} years earlier
                  </div>
                </div>
              </div>

              {/* Career Timeline */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Career Progression Timeline</h3>
                <div className="space-y-3">
                  {careerProjection.projections?.typical?.slice(0, 8).map((position, index) => (
                    <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                      position.isPromotion ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
                    }`}>
                      <div>
                        <span className="font-medium text-gray-800">{position.role}</span>
                        {position.isPromotion && <span className="ml-2 text-yellow-600 text-sm">🎉 Promotion!</span>}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          {CareerProjectionUtils.formatSalary(position.salary)}
                        </div>
                        <div className="text-sm text-gray-500">Age {position.age}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* What-If Scenarios */}
            {whatIfData && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">🎯 What-If Scenarios</h2>
                
                <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-800 mb-2">Best Option:</h3>
                  <p className="text-purple-700">{whatIfData.summary?.recommendation}</p>
                </div>

                <div className="space-y-6">
                  {whatIfData.scenarios?.map((scenario, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 mb-2">{scenario.title}</h3>
                          <p className="text-gray-600 mb-3">{scenario.description}</p>
                          
                          {scenario.dreamImpact && (
                            <div className="bg-purple-50 p-3 rounded-lg mb-4">
                              <p className="text-purple-700 font-medium">
                                🎯 Could achieve your goal {Math.round(scenario.dreamImpact.yearsSaved || 0)} years earlier
                              </p>
                              <p className="text-sm text-purple-600">
                                Target age: {Math.round(scenario.dreamImpact.newTargetAge || 52)}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-green-600 mb-1">
                            +{CareerProjectionUtils.formatSalary(scenario.salaryIncrease || 0)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {scenario.timeframe}
                          </div>
                        </div>
                      </div>

                      {/* Effort and Probability */}
                      <div className="flex items-center gap-4 mb-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          scenario.effort === 'very high' ? 'bg-red-100 text-red-800' :
                          scenario.effort === 'high' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {scenario.effort} effort
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Success probability:</span>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(scenario.probability || 0) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{Math.round((scenario.probability || 0) * 100)}%</span>
                        </div>
                      </div>

                      {/* Requirements */}
                      {scenario.requirements && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Requirements:</h4>
                          <div className="flex flex-wrap gap-2">
                            {scenario.requirements.map((req, i) => (
                              <span key={i} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                {req}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Risks */}
                      {scenario.risks && (
                        <div>
                          <h4 className="text-sm font-medium text-red-700 mb-2">Risks to Consider:</h4>
                          <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                            {scenario.risks.map((risk, i) => (
                              <li key={i}>{risk}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Industry Insights for Career */}
            {careerProjection.industryInsights && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">🏢 Industry Career Insights</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Growth Outlook</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        careerProjection.industryInsights.marketOutlook === 'excellent' ? 'bg-green-100 text-green-800' :
                        careerProjection.industryInsights.marketOutlook === 'good' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {careerProjection.industryInsights.marketOutlook}
                      </span>
                      <span className="text-sm text-gray-600">
                        {(careerProjection.industryInsights.growthRate * 100).toFixed(1)}% annual growth
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Career Advice</h3>
                    <ul className="space-y-1">
                      {careerProjection.industryInsights.careerAdvice?.slice(0, 2).map((advice, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="text-blue-500">•</span>
                          {advice}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {selectedView === 'passive' && (
          <PassiveIncomeBuilder 
            dreamGoals={{
              name: financialProfile?.northStarDream?.title || 'cottage',
              targetAmount: financialProfile?.northStarDream?.targetNetWorth || 500000,
              currentSaved: financialProfile?.currentAssets?.totalAssets || 0,
              monthlySavings: 2000,
              currentAge: financialProfile?.userProfile?.age || 32,
              targetAge: financialProfile?.northStarDream?.targetAge || 52
            }}
            currentProfile={financialProfile}
            onIncomeChange={(streams) => {
              // Handle passive income stream changes
              console.log('Passive income streams updated:', streams);
            }}
          />
        )}

        {/* Call to Action */}
        {selectedView !== 'passive' && (
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-8 mt-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">🚀 Ready to Accelerate Your Income?</h2>
            <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
              {selectedView === 'optimization' 
                ? 'Start with the low-effort opportunities to build momentum, then tackle the bigger changes.'
                : 'Connect your career ambition to your life dreams. Every promotion brings your goals closer.'
              } Every income increase brings your dreams closer to reality.
            </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              📝 Create Action Plan
            </button>
            <button className="bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-400 transition-colors">
              📊 Track Progress
            </button>
          </div>
          </div>
        )}

        {/* Sample Profile Notice */}
        {userProfile.firstName === 'Sarah' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
            <p className="text-yellow-800 text-sm">
              <strong>Demo Mode:</strong> This shows sample data for Sarah, a marketing manager in Boston. 
              Complete your own profile to get personalized recommendations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomeAccelerator;
