/**
 * Demo test for DemoAnnotations component
 * Quick verification that annotations appear with proper timing and content
 */

import React, { useState, useEffect } from 'react';
import DemoAnnotations from './DemoAnnotations';

const DemoAnnotationsTest = () => {
  const [currentDemo, setCurrentDemo] = useState('problem');
  const [ceoPersona, setCeoPersona] = useState('fintech');
  const [showAnnotations, setShowAnnotations] = useState(true);

  // Simulate demo progression
  useEffect(() => {
    const sequence = ['problem', 'solution', 'business_metrics', 'market_opportunity', 'success_demo'];
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % sequence.length;
      setCurrentDemo(sequence[currentIndex]);
    }, 8000); // Change demo every 8 seconds

    return () => clearInterval(interval);
  }, []);

  const demoStepAnnotations = {
    'problem': ['traditional-apps-fail'],
    'solution': ['three-bucket-innovation'],
    'business_metrics': ['engagement-multiplier', 'ltv-dominance'],
    'market_opportunity': ['market-expansion'],
    'success_demo': ['emotional-payoff']
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-8">
      {/* Test Controls */}
      <div className="fixed top-4 left-4 bg-white rounded-lg shadow-lg p-4 z-40">
        <h3 className="font-bold mb-3">Demo Annotations Test</h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">CEO Persona:</label>
            <select 
              value={ceoPersona} 
              onChange={(e) => setCeoPersona(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="fintech">FinTech CEO</option>
              <option value="b2c">B2C Startup CEO</option>
              <option value="enterprise">Enterprise CEO</option>
              <option value="generic">Generic CEO</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Demo Step:</label>
            <select 
              value={currentDemo} 
              onChange={(e) => setCurrentDemo(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="problem">Problem</option>
              <option value="solution">Solution</option>
              <option value="business_metrics">Business Metrics</option>
              <option value="market_opportunity">Market Opportunity</option>
              <option value="success_demo">Success Demo</option>
            </select>
          </div>
          
          <button
            onClick={() => setShowAnnotations(!showAnnotations)}
            className={`px-3 py-1 rounded text-sm ${
              showAnnotations 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {showAnnotations ? 'Hide' : 'Show'} Annotations
          </button>
        </div>
      </div>

      {/* Demo Content Simulation */}
      <div className="max-w-4xl mx-auto pt-32">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">
            {currentDemo === 'problem' && 'Traditional Finance Apps Fail'}
            {currentDemo === 'solution' && 'The Three-Bucket Solution'}
            {currentDemo === 'business_metrics' && 'Business Impact Metrics'}
            {currentDemo === 'market_opportunity' && 'Market Opportunity'}
            {currentDemo === 'success_demo' && 'User Success Story'}
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Key Innovation</h3>
              <p className="text-gray-600">
                {currentDemo === 'problem' && 'Notice: Traditional apps stop at expense tracking - we continue for 40 years'}
                {currentDemo === 'solution' && 'Not retirement at 65, but dreams in 5-15 years - this changes everything'}
                {currentDemo === 'business_metrics' && '12 minutes vs 2 minutes - users plan life, not just track expenses'}
                {currentDemo === 'market_opportunity' && '$180B+ market across ALL life stages - this isn\'t niche, it\'s universal'}
                {currentDemo === 'success_demo' && 'This celebration moment drives viral sharing - users become advocates'}
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Current Persona</h3>
              <p className="text-blue-600 font-medium">
                {ceoPersona === 'fintech' && 'FinTech CEO - Focus on engagement & retention'}
                {ceoPersona === 'b2c' && 'B2C Startup CEO - Focus on user experience & viral growth'}
                {ceoPersona === 'enterprise' && 'Enterprise CEO - Focus on market size & scalability'}
                {ceoPersona === 'generic' && 'Generic CEO - Focus on innovation & market opportunity'}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Annotations are contextually adapted for this persona type.
              </p>
            </div>
          </div>
        </div>

        {/* Sample metrics display */}
        {currentDemo === 'business_metrics' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 text-center shadow-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">12 min</div>
              <div className="text-gray-600">Engagement Time</div>
              <div className="text-sm text-green-600 mt-1">vs 2 min traditional</div>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">$4,800</div>
              <div className="text-gray-600">Lifetime Value</div>
              <div className="text-sm text-green-600 mt-1">vs $45 traditional</div>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">92%</div>
              <div className="text-gray-600">1-Year Retention</div>
              <div className="text-sm text-green-600 mt-1">vs 15% traditional</div>
            </div>
          </div>
        )}
      </div>

      {/* Demo Annotations */}
      <DemoAnnotations
        activeAnnotations={demoStepAnnotations[currentDemo] || []}
        ceoPersona={ceoPersona}
        demoMode={showAnnotations}
        autoAdvance={true}
        onAnnotationDismiss={(annotationId) => {
          console.log('✅ Annotation dismissed:', annotationId);
        }}
      />

      {/* Test Info */}
      <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 text-sm">
        <div className="font-medium">Current State:</div>
        <div>Demo: {currentDemo}</div>
        <div>Persona: {ceoPersona}</div>
        <div>Annotations: {showAnnotations ? 'ON' : 'OFF'}</div>
        <div className="text-xs text-gray-500 mt-2">
          Annotations auto-cycle every 8 seconds
        </div>
      </div>
    </div>
  );
};

export default DemoAnnotationsTest;
