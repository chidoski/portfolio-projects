import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import ThreeBucketDisplay from '../components/ThreeBucketDisplay';
import ProgressBar from '../components/ProgressBar';

// Story data for Sarah's journey
const storyData = {
  character: {
    name: 'Sarah',
    age: 32,
    profession: 'Marketing Manager',
    monthlyIncome: 4200,
    monthlyExpenses: 3200,
    currentSavings: 5000
  },
  dreamGoal: {
    title: 'Maine Cottage Retreat',
    description: 'A cozy cottage by the lake in Maine where I can write and unwind',
    targetAmount: 180000,
    category: 'lifestyle',
    icon: '🏡'
  },
  lifeMilestone: {
    title: 'Car Replacement',
    description: 'Unexpected need to replace aging vehicle',
    cost: 25000,
    age: 38
  }
};

// Story scenes with voiceover text and timing
const storyScenes = [
  {
    id: 'introduction',
    title: 'Meet Sarah',
    duration: 6000,
    voiceover: [
      { text: "Meet Sarah, a 32-year-old marketing manager.", delay: 0 },
      { text: "Like many of us, she feels overwhelmed about retirement planning.", delay: 2000 },
      { text: "She's been putting off her financial future for too long.", delay: 4000 }
    ],
    component: 'CharacterIntro'
  },
  {
    id: 'despair',
    title: 'The Wake-Up Call',
    duration: 8000,
    voiceover: [
      { text: "Sarah just got her retirement projection from HR.", delay: 0 },
      { text: "The numbers are shocking - she's nowhere near on track.", delay: 2500 },
      { text: "At this rate, she'll need to work until she's 75.", delay: 5000 },
      { text: "There has to be a better way...", delay: 7000 }
    ],
    component: 'DesperateNumbers'
  },
  {
    id: 'discovery',
    title: 'Finding Her Dream',
    duration: 7000,
    voiceover: [
      { text: "But then Sarah discovers something important.", delay: 0 },
      { text: "She doesn't just want to retire - she has a specific dream.", delay: 2000 },
      { text: "A cozy cottage in Maine where she can write and find peace.", delay: 4500 }
    ],
    component: 'DreamDiscovery'
  },
  {
    id: 'solution',
    title: 'The Three-Bucket System',
    duration: 10000,
    voiceover: [
      { text: "Sarah learns about the three-bucket savings strategy.", delay: 0 },
      { text: "Foundation bucket for retirement security.", delay: 2500 },
      { text: "Dream bucket for her Maine cottage goal.", delay: 4500 },
      { text: "Life bucket for unexpected milestones along the way.", delay: 6500 },
      { text: "Suddenly, her financial future becomes achievable.", delay: 8500 }
    ],
    component: 'ThreeBucketExplanation'
  },
  {
    id: 'revelation',
    title: 'The Magic of Small Steps',
    duration: 8000,
    voiceover: [
      { text: "With $1,000 monthly disposable income...", delay: 0 },
      { text: "Sarah can reach her dream cottage by age 52.", delay: 2500 },
      { text: "That's just $450 per month - less than her coffee budget!", delay: 5000 },
      { text: "Her retirement is secured too.", delay: 7000 }
    ],
    component: 'MagicNumbers'
  },
  {
    id: 'disruption',
    title: 'Life Happens',
    duration: 9000,
    voiceover: [
      { text: "At 38, life throws Sarah a curveball.", delay: 0 },
      { text: "Her car breaks down and needs replacement.", delay: 2500 },
      { text: "$25,000 - a major unexpected expense.", delay: 5000 },
      { text: "But the three-bucket system is ready for this.", delay: 7000 }
    ],
    component: 'LifeDisruption'
  },
  {
    id: 'adaptation',
    title: 'The System Adapts',
    duration: 8000,
    voiceover: [
      { text: "Sarah's Life bucket has been quietly building funds.", delay: 0 },
      { text: "The car expense delays her cottage dream by just 2 years.", delay: 3000 },
      { text: "Her retirement security remains intact.", delay: 5500 },
      { text: "The system flexes but doesn't break.", delay: 7000 }
    ],
    component: 'SystemAdaptation'
  },
  {
    id: 'success',
    title: 'Someday Achieved',
    duration: 10000,
    voiceover: [
      { text: "Fast-forward to Sarah at 54...", delay: 0 },
      { text: "She's sitting on the porch of her Maine cottage.", delay: 2500 },
      { text: "Her retirement accounts are fully funded.", delay: 5000 },
      { text: "She handled life's surprises without derailing her dreams.", delay: 7000 },
      { text: "This is what someday looks like.", delay: 9000 }
    ],
    component: 'SuccessStory'
  }
];

const DemoStoryMode = () => {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVoiceover, setCurrentVoiceover] = useState(0);
  const [progress, setProgress] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(true);
  
  const sceneTimeoutRef = useRef(null);
  const voiceoverTimeoutRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const startTimeRef = useRef(null);

  // Current scene data
  const scene = storyScenes[currentScene];

  // Start story
  const startStory = () => {
    setIsPlaying(true);
    startTimeRef.current = Date.now();
    playCurrentScene();
  };

  // Pause story
  const pauseStory = () => {
    setIsPlaying(false);
    clearTimeouts();
  };

  // Play current scene
  const playCurrentScene = () => {
    if (!scene) return;

    clearTimeouts();
    setCurrentVoiceover(0);
    setProgress(0);

    // Start voiceover sequence
    scene.voiceover.forEach((voice, index) => {
      voiceoverTimeoutRef.current = setTimeout(() => {
        setCurrentVoiceover(index);
      }, voice.delay);
    });

    // Start progress tracking
    startTimeRef.current = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min(100, (elapsed / scene.duration) * 100);
      setProgress(newProgress);
    }, 50);

    // Auto-advance to next scene
    if (autoAdvance) {
      sceneTimeoutRef.current = setTimeout(() => {
        nextScene();
      }, scene.duration);
    }
  };

  // Clear all timeouts
  const clearTimeouts = () => {
    if (sceneTimeoutRef.current) clearTimeout(sceneTimeoutRef.current);
    if (voiceoverTimeoutRef.current) clearTimeout(voiceoverTimeoutRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  };

  // Next scene
  const nextScene = () => {
    if (currentScene < storyScenes.length - 1) {
      setCurrentScene(prev => prev + 1);
    } else {
      // Story finished
      setIsPlaying(false);
      setProgress(100);
    }
  };

  // Previous scene
  const previousScene = () => {
    if (currentScene > 0) {
      setCurrentScene(prev => prev - 1);
    }
  };

  // Reset story
  const resetStory = () => {
    setCurrentScene(0);
    setIsPlaying(false);
    setCurrentVoiceover(0);
    setProgress(0);
    clearTimeouts();
  };

  // Handle scene changes
  useEffect(() => {
    if (isPlaying) {
      playCurrentScene();
    }
  }, [currentScene]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimeouts();
  }, []);

  // Scene Components
  const CharacterIntro = () => (
    <div className="text-center space-y-6">
      <div className="w-32 h-32 mx-auto bg-gradient-to-br from-pink-200 to-purple-200 rounded-full flex items-center justify-center">
        <span className="text-6xl">👩‍💼</span>
      </div>
      <div>
        <h2 className="text-4xl font-bold text-gray-800 mb-2">Sarah Chen</h2>
        <p className="text-xl text-gray-600">Marketing Manager, Age 32</p>
        <p className="text-lg text-gray-500 mt-4">Monthly Income: $4,200</p>
        <p className="text-lg text-gray-500">Current Savings: $5,000</p>
      </div>
    </div>
  );

  const DesperateNumbers = () => (
    <div className="text-center space-y-8">
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8">
        <h3 className="text-2xl font-bold text-red-700 mb-4">Retirement Reality Check</h3>
        <div className="space-y-4">
          <div className="flex justify-between text-lg">
            <span>Current Savings Rate:</span>
            <span className="font-bold text-red-600">$200/month</span>
          </div>
          <div className="flex justify-between text-lg">
            <span>Retirement by 65:</span>
            <span className="font-bold text-red-600">$180,000</span>
          </div>
          <div className="flex justify-between text-lg">
            <span>Needed for comfort:</span>
            <span className="font-bold text-red-600">$1,200,000</span>
          </div>
        </div>
        <div className="mt-6 p-4 bg-red-100 rounded-lg">
          <p className="text-red-800 font-bold">Shortfall: $1,020,000</p>
          <p className="text-red-700">Must work until age 75+</p>
        </div>
      </div>
    </div>
  );

  const DreamDiscovery = () => (
    <div className="text-center space-y-6">
      <div className="relative">
        <div className="w-48 h-48 mx-auto bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 rounded-2xl flex items-center justify-center transform rotate-3 shadow-xl">
          <span className="text-8xl">🏡</span>
        </div>
        <div className="absolute -top-4 -right-4 bg-yellow-300 rounded-full p-3 animate-bounce">
          <span className="text-2xl">✨</span>
        </div>
      </div>
      <div>
        <h3 className="text-3xl font-bold text-gray-800 mb-2">Maine Cottage Dream</h3>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          A peaceful retreat by the lake where Sarah can write her novel and escape the city hustle
        </p>
        <div className="mt-6 bg-blue-50 rounded-lg p-4 inline-block">
          <p className="text-2xl font-bold text-blue-600">$180,000</p>
          <p className="text-blue-700">Her someday dream</p>
        </div>
      </div>
    </div>
  );

  const ThreeBucketExplanation = () => (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold text-gray-800 text-center mb-8">The Three-Bucket Strategy</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Foundation Bucket */}
        <div className="bg-blue-50 rounded-xl p-6 text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl">🏛️</span>
          </div>
          <h4 className="text-xl font-bold text-blue-700 mb-2">Foundation</h4>
          <p className="text-blue-600 mb-4">Retirement Security</p>
          <div className="bg-white rounded-lg p-4">
            <p className="text-2xl font-bold text-blue-700">$500</p>
            <p className="text-sm text-blue-600">per month</p>
          </div>
        </div>

        {/* Dream Bucket */}
        <div className="bg-purple-50 rounded-xl p-6 text-center">
          <div className="w-16 h-16 bg-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl">✨</span>
          </div>
          <h4 className="text-xl font-bold text-purple-700 mb-2">Dream</h4>
          <p className="text-purple-600 mb-4">Maine Cottage</p>
          <div className="bg-white rounded-lg p-4">
            <p className="text-2xl font-bold text-purple-700">$350</p>
            <p className="text-sm text-purple-600">per month</p>
          </div>
        </div>

        {/* Life Bucket */}
        <div className="bg-green-50 rounded-xl p-6 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl">🎯</span>
          </div>
          <h4 className="text-xl font-bold text-green-700 mb-2">Life</h4>
          <p className="text-green-600 mb-4">Surprises Buffer</p>
          <div className="bg-white rounded-lg p-4">
            <p className="text-2xl font-bold text-green-700">$150</p>
            <p className="text-sm text-green-600">per month</p>
          </div>
        </div>
      </div>
    </div>
  );

  const MagicNumbers = () => (
    <div className="text-center space-y-8">
      <h3 className="text-3xl font-bold text-gray-800 mb-8">The Magic of Compound Growth</h3>
      
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-xl font-bold text-purple-700">Dream Timeline</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Monthly saving:</span>
                <span className="font-bold">$350</span>
              </div>
              <div className="flex justify-between">
                <span>Time to goal:</span>
                <span className="font-bold">20 years</span>
              </div>
              <div className="flex justify-between">
                <span>Sarah's age:</span>
                <span className="font-bold text-purple-600">52 years old</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-xl font-bold text-blue-700">Retirement Security</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Monthly saving:</span>
                <span className="font-bold">$500</span>
              </div>
              <div className="flex justify-between">
                <span>Growth by 65:</span>
                <span className="font-bold">$1.2M</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-bold text-green-600">Secured ✓</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 p-6 bg-white rounded-xl border-2 border-yellow-300">
          <p className="text-lg font-bold text-gray-800">
            That's less than her current coffee + lunch budget!
          </p>
          <p className="text-gray-600 mt-2">Small changes, life-changing results</p>
        </div>
      </div>
    </div>
  );

  const LifeDisruption = () => (
    <div className="text-center space-y-8">
      <div className="relative">
        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-300 to-gray-500 rounded-lg flex items-center justify-center transform -rotate-12">
          <span className="text-6xl">🚗</span>
        </div>
        <div className="absolute -top-2 -right-2 bg-red-500 rounded-full p-2">
          <span className="text-white text-2xl">💥</span>
        </div>
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Age 38: Life Happens</h3>
        <p className="text-lg text-gray-600 mb-6">Sarah's 12-year-old car finally gives up</p>
        
        <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6 max-w-md mx-auto">
          <h4 className="text-xl font-bold text-orange-700 mb-4">Unexpected Expense</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Car replacement:</span>
              <span className="font-bold text-orange-600">$25,000</span>
            </div>
            <div className="flex justify-between">
              <span>Available in Life bucket:</span>
              <span className="font-bold text-green-600">$10,800</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span>Additional needed:</span>
              <span className="font-bold text-red-600">$14,200</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const SystemAdaptation = () => (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold text-gray-800 text-center mb-8">The System Adapts</h3>
      
      <ThreeBucketDisplay
        monthlyDisposableIncome={1000}
        currentAge={38}
        retirementAge={65}
        annualExpenses={50000}
        dreamGoalAmount={155000} // Reduced by $25k for car
        dreamTimeframe={14} // Extended timeline
        lifeGoalAmount={25000}
        lifeTimeframe={3}
        className="pointer-events-none"
      />
      
      <div className="bg-blue-50 rounded-xl p-6 text-center">
        <h4 className="text-xl font-bold text-blue-700 mb-4">Impact Assessment</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">Dream Timeline</p>
            <p className="text-xl font-bold text-blue-600">+2 years</p>
            <p className="text-xs text-gray-500">Now age 54</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">Retirement</p>
            <p className="text-xl font-bold text-green-600">On Track</p>
            <p className="text-xs text-gray-500">No impact</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">Life Buffer</p>
            <p className="text-xl font-bold text-purple-600">Rebuilding</p>
            <p className="text-xs text-gray-500">$150/month</p>
          </div>
        </div>
      </div>
    </div>
  );

  const SuccessStory = () => (
    <div className="text-center space-y-8">
      <div className="relative">
        <div className="w-48 h-48 mx-auto bg-gradient-to-br from-green-200 via-blue-200 to-purple-200 rounded-2xl flex items-center justify-center shadow-2xl">
          <span className="text-8xl">🏡</span>
        </div>
        <div className="absolute -top-4 -left-4 bg-yellow-300 rounded-full p-3 animate-pulse">
          <span className="text-2xl">✨</span>
        </div>
        <div className="absolute -bottom-4 -right-4 bg-green-300 rounded-full p-3 animate-bounce">
          <span className="text-2xl">🎉</span>
        </div>
      </div>
      
      <div>
        <h3 className="text-3xl font-bold text-gray-800 mb-4">Sarah at 54</h3>
        <p className="text-xl text-gray-600 mb-8">Living her someday life in Maine</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="bg-green-50 rounded-xl p-6">
            <h4 className="text-lg font-bold text-green-700 mb-3">Dreams Achieved</h4>
            <ul className="space-y-2 text-green-600">
              <li>✓ Maine cottage purchased</li>
              <li>✓ Novel in progress</li>
              <li>✓ Peace and fulfillment</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-6">
            <h4 className="text-lg font-bold text-blue-700 mb-3">Financial Security</h4>
            <ul className="space-y-2 text-blue-600">
              <li>✓ $980K retirement saved</li>
              <li>✓ On track for $1.2M by 65</li>
              <li>✓ Emergency fund rebuilt</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 p-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl">
          <p className="text-xl font-bold text-gray-800 mb-2">
            "The three-bucket system didn't just help me save money..."
          </p>
          <p className="text-lg text-gray-700">
            "It helped me live my values and handle life's surprises with confidence."
          </p>
          <p className="text-sm text-gray-600 mt-4 italic">- Sarah Chen, Living Her Someday Life</p>
        </div>
      </div>
    </div>
  );

  // Component renderer
  const renderSceneComponent = () => {
    switch (scene.component) {
      case 'CharacterIntro': return <CharacterIntro />;
      case 'DesperateNumbers': return <DesperateNumbers />;
      case 'DreamDiscovery': return <DreamDiscovery />;
      case 'ThreeBucketExplanation': return <ThreeBucketExplanation />;
      case 'MagicNumbers': return <MagicNumbers />;
      case 'LifeDisruption': return <LifeDisruption />;
      case 'SystemAdaptation': return <SystemAdaptation />;
      case 'SuccessStory': return <SuccessStory />;
      default: return <div>Scene not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Sarah's Journey</h1>
            <div className="text-sm text-gray-600">
              Scene {currentScene + 1} of {storyScenes.length}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold text-gray-700">{scene.title}</h2>
            <div className="text-sm text-gray-500">
              {Math.round(progress)}%
            </div>
          </div>
          <ProgressBar 
            percentage={progress} 
            showPercentage={false}
            animationDuration={100}
          />
        </div>

        {/* Scene Content */}
        <PageTransition transitionKey={currentScene}>
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-full max-w-4xl">
              {renderSceneComponent()}
            </div>
          </div>
        </PageTransition>

        {/* Voiceover Text */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6 min-h-[100px] flex items-center justify-center">
          {scene.voiceover[currentVoiceover] && (
            <p className="text-lg text-gray-700 text-center leading-relaxed animate-fade-in">
              {scene.voiceover[currentVoiceover].text}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="mt-8 flex items-center justify-center space-x-4">
          <button
            onClick={resetStory}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            title="Reset Story"
          >
            <RotateCcw className="w-5 h-5 text-gray-600" />
          </button>
          
          <button
            onClick={previousScene}
            disabled={currentScene === 0}
            className="px-6 py-3 bg-blue-100 hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 text-blue-600 rounded-lg transition-colors"
          >
            Previous
          </button>
          
          <button
            onClick={isPlaying ? pauseStory : startStory}
            className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
          
          <button
            onClick={nextScene}
            disabled={currentScene === storyScenes.length - 1}
            className="px-6 py-3 bg-blue-100 hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 text-blue-600 rounded-lg transition-colors"
          >
            Next
          </button>
          
          <button
            onClick={nextScene}
            disabled={currentScene === storyScenes.length - 1}
            className="p-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300 rounded-full transition-colors"
            title="Skip Scene"
          >
            <SkipForward className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Scene Navigation */}
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-2">
            {storyScenes.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentScene(index);
                  if (isPlaying) {
                    playCurrentScene();
                  }
                }}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentScene 
                    ? 'bg-blue-500' 
                    : index < currentScene 
                      ? 'bg-green-500' 
                      : 'bg-gray-300'
                }`}
                title={storyScenes[index].title}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Custom styles for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DemoStoryMode;
