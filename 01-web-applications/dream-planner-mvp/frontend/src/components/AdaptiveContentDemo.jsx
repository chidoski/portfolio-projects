import React, { useState } from 'react';
import { Heart, BarChart3, Compass } from 'lucide-react';
import { 
  getAdaptiveContent, 
  getSomedayBuilderContent, 
  getFinancialRealityContent, 
  getDashboardContent 
} from '../utils/adaptiveContent';

/**
 * AdaptiveContentDemo Component
 * Demonstrates how the adaptive content system works across different psychological profiles
 * This is a test/demo component to showcase the functionality
 */
const AdaptiveContentDemo = () => {
  const [testProfile, setTestProfile] = useState('dreamer');

  // Temporarily set profile for testing
  const setTestProfileAndStore = (profile) => {
    setTestProfile(profile);
    localStorage.setItem('userPsychProfile', profile);
  };

  const profiles = [
    { id: 'dreamer', name: 'Dreamer', icon: Heart, color: 'pink' },
    { id: 'validator', name: 'Validator', icon: BarChart3, color: 'blue' },
    { id: 'beginner', name: 'Beginner', icon: Compass, color: 'green' }
  ];

  return (
    <div className="max-w-6xl mx-auto p-8 bg-gray-50 min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Adaptive Content System Demo
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          See how the same functionality adapts its language based on psychological profile
        </p>

        {/* Profile Selector */}
        <div className="flex justify-center gap-4 mb-8">
          {profiles.map((profile) => {
            const IconComponent = profile.icon;
            const isSelected = testProfile === profile.id;
            
            return (
              <button
                key={profile.id}
                onClick={() => setTestProfileAndStore(profile.id)}
                className={`
                  flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-200
                  ${isSelected 
                    ? `bg-${profile.color}-500 text-white shadow-lg scale-105` 
                    : `bg-white text-${profile.color}-600 hover:bg-${profile.color}-50 border border-${profile.color}-200`
                  }
                `}
              >
                <IconComponent className="w-5 h-5" />
                {profile.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Examples */}
      <div className="space-y-12">
        
        {/* Someday Life Builder */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <span className="bg-blue-100 p-2 rounded-lg">🏗️</span>
            Someday Life Builder
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Page Title:</h3>
              <p className="text-xl font-bold text-blue-600">
                {getSomedayBuilderContent('pageTitle', 'Default: Building Your Someday Life')}
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Page Subtitle:</h3>
              <p className="text-gray-600">
                {getSomedayBuilderContent('pageSubtitle', 'Default: Design and plan your perfect retirement lifestyle')}
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Vision Prompt:</h3>
              <p className="text-gray-600">
                {getSomedayBuilderContent('lifeVisionPrompt', 'Default: Describe your someday life')}
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Continue Button:</h3>
              <button className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold">
                {getSomedayBuilderContent('continueButton', 'Continue Planning')}
              </button>
            </div>
          </div>
        </div>

        {/* Financial Reality Wizard */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <span className="bg-green-100 p-2 rounded-lg">💰</span>
            Financial Reality Wizard
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Page Title:</h3>
              <p className="text-xl font-bold text-green-600">
                {getFinancialRealityContent('pageTitle', 'Default: Financial Assessment')}
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Income Section:</h3>
              <p className="text-gray-600">
                {getFinancialRealityContent('currentIncomeSection', 'Default: What is your current income?')}
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Timeframe Question:</h3>
              <p className="text-gray-600">
                {getFinancialRealityContent('timeframeSection', 'Default: When do you want to retire?')}
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Continue Button:</h3>
              <button className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold">
                {getFinancialRealityContent('continueButton', 'Continue Assessment')}
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <span className="bg-purple-100 p-2 rounded-lg">📊</span>
            Dashboard
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Main Title:</h3>
              <p className="text-xl font-bold text-purple-600">
                {getDashboardContent('mainTitle', 'Default: Your Dashboard')}
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Subtitle:</h3>
              <p className="text-gray-600">
                {getDashboardContent('subtitle', 'Default: Track your progress')}
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Empty State Title:</h3>
              <p className="text-gray-600">
                {getDashboardContent('emptyStateTitle', 'Default: Get Started')}
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Add Button:</h3>
              <button className="bg-purple-500 text-white px-6 py-2 rounded-lg font-semibold">
                {getDashboardContent('addButton', 'Add New Item')}
              </button>
            </div>
          </div>
        </div>

        {/* Motivation Messages */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <span className="bg-yellow-100 p-2 rounded-lg">✨</span>
            Motivation & Encouragement
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Random Encouragement:</h3>
              <p className="text-lg text-yellow-600 font-medium">
                {getAdaptiveContent('motivation', 'encouragement', 'Keep going!')}
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Milestone Message:</h3>
              <p className="text-lg text-yellow-600 font-medium">
                {getAdaptiveContent('motivation', 'milestoneReached', 'Milestone achieved!')}
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Next Steps:</h3>
              <p className="text-gray-600">
                {getAdaptiveContent('motivation', 'nextSteps', 'What\'s next?')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-12 text-center bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          How to Test
        </h3>
        <p className="text-blue-700">
          Click between the different profile buttons above to see how the same content 
          adapts its language and tone based on the user's psychological profile.
        </p>
      </div>
    </div>
  );
};

export default AdaptiveContentDemo;
