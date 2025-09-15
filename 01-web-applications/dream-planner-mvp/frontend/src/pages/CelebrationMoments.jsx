import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Share2, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Heart,
  Trophy,
  Star,
  Gift,
  Camera,
  MessageCircle,
  Download,
  RefreshCw
} from 'lucide-react';

const CelebrationMoments = ({ 
  userProfile = null,
  currentMilestone = null,
  onShare = () => {},
  onJournal = () => {},
  className = ""
}) => {
  const [celebrationActive, setCelebrationActive] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [journalEntry, setJournalEntry] = useState('');
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [confettiActive, setConfettiActive] = useState(false);
  const confettiRef = useRef(null);

  // Sample user profile for demo
  const demoProfile = {
    name: 'Sarah',
    dreamTitle: 'Maine Cottage Retreat',
    dreamAge: 52,
    currentAge: 32,
    totalSaved: 15000,
    monthlyContribution: 850,
    debtFree: false,
    yearsToRetirement: 33
  };

  const profile = userProfile || demoProfile;

  // Milestone definitions with personalized messaging
  const milestoneTypes = {
    firstThousand: {
      id: 'first-1k',
      threshold: 1000,
      icon: '💰',
      color: 'green',
      title: 'First $1,000 Milestone!',
      getMessage: (profile) => `Amazing work, ${profile.name}! Your first $1,000 is the hardest to save. You've proven you can do this!`,
      getSubMessage: () => 'This is where your journey to financial freedom truly begins.',
      stats: ['First $1K is 80% psychological', 'You\'re in the top 40% of savers']
    },
    
    firstFiveK: {
      id: 'first-5k',
      threshold: 5000,
      icon: '🚀',
      color: 'blue',
      title: 'Emergency Fund Secured!',
      getMessage: (profile) => `Incredible progress, ${profile.name}! You now have a solid emergency foundation.`,
      getSubMessage: () => 'Financial stress is about to become a thing of the past.',
      stats: ['Small emergencies can\'t derail you', 'You\'re building true resilience']
    },

    firstTenK: {
      id: 'first-10k',
      threshold: 10000,
      icon: '👑',
      color: 'purple',
      title: 'Officially Wealthier Than Most!',
      getMessage: (profile) => `${profile.name}, you're now wealthier than 60% of Americans! This is no small feat.`,
      getSubMessage: (profile) => `Every dollar from here builds toward your ${profile.dreamTitle}.`,
      stats: ['Top 40% wealth bracket', 'Compound growth accelerating']
    },

    debtFreedom: {
      id: 'debt-free',
      threshold: 0, // Special milestone
      icon: '🗽',
      color: 'emerald',
      title: 'DEBT FREE!',
      getMessage: (profile) => `${profile.name}, you did it! Every dollar you earn now builds YOUR dreams!`,
      getSubMessage: (profile) => `No more paying for yesterday's decisions. Hello, ${profile.dreamTitle}!`,
      stats: ['100% of savings toward dreams', 'Financial independence unlocked']
    },

    quarterProgress: {
      id: 'quarter-progress',
      threshold: 25, // 25% of dream goal
      icon: '📈',
      color: 'orange',
      title: '25% to Your Dream!',
      getMessage: (profile) => `You're 1/4 of the way to your ${profile.dreamTitle}, ${profile.name}!`,
      getSubMessage: (profile) => `At this pace, you'll be relaxing in Maine at ${profile.dreamAge}. Can you picture it?`,
      stats: ['Momentum building', 'Dreams becoming reality']
    },

    halfwayPoint: {
      id: 'halfway-point',
      threshold: 50, // 50% of dream goal
      icon: '🎯',
      color: 'red',
      title: 'HALFWAY TO YOUR DREAM!',
      getMessage: (profile) => `${profile.name}, you're officially halfway to your ${profile.dreamTitle}!`,
      getSubMessage: () => 'Time to update that vision board - this is really happening!',
      stats: ['Downhill from here', 'Vision becoming reality']
    },

    oneYearProgress: {
      id: 'one-year',
      threshold: 365, // Days of consistent saving
      icon: '🎂',
      color: 'pink',
      title: 'One Year Stronger!',
      getMessage: (profile) => `Happy savings anniversary, ${profile.name}! One year closer to your ${profile.dreamTitle}.`,
      getSubMessage: () => 'Your future self is so grateful for your consistency.',
      stats: ['365 days of progress', 'Habits becoming lifestyle']
    },

    retirementOnTrack: {
      id: 'retirement-track',
      threshold: 100000, // First 100K in retirement
      icon: '🏛️',
      color: 'indigo',
      title: 'Retirement Velocity Achieved!',
      getMessage: (profile) => `${profile.name}, your first $100K in retirement savings! The hardest part is behind you.`,
      getSubMessage: () => 'Compound interest is now your co-pilot to financial freedom.',
      stats: ['First $100K took longest', 'Next $100K comes faster']
    }
  };

  // Current milestone for demo (can be passed as prop)
  const activeMilestone = selectedMilestone || currentMilestone || milestoneTypes.firstTenK;

  // Trigger celebration
  const triggerCelebration = (milestone) => {
    setSelectedMilestone(milestone);
    setCelebrationActive(true);
    setConfettiActive(true);
    
    // Stop confetti after animation
    setTimeout(() => setConfettiActive(false), 3000);
  };

  // Share functionality
  const handleShare = (platform) => {
    const milestone = selectedMilestone || activeMilestone;
    const message = `🎉 ${milestone.title} ${milestone.getMessage(profile)} #DreamPlanner #FinancialFreedom`;
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(message)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodeURIComponent(message)}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }

    onShare({ platform, milestone, message });
    setShowShareModal(false);
  };

  // Journal functionality
  const handleJournalSave = () => {
    const entry = {
      milestone: selectedMilestone || activeMilestone,
      date: new Date().toISOString(),
      reflection: journalEntry,
      profile: profile
    };

    onJournal(entry);
    setJournalEntry('');
    setShowJournalModal(false);
  };

  // Milestone selector for demo
  const MilestoneSelector = () => (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
        <Star className="w-5 h-5 text-yellow-500" />
        <span>Trigger a Celebration (Demo)</span>
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.values(milestoneTypes).map(milestone => (
          <button
            key={milestone.id}
            onClick={() => triggerCelebration(milestone)}
            className={`p-3 rounded-lg border-2 transition-all hover:scale-105 bg-${milestone.color}-50 border-${milestone.color}-200 hover:border-${milestone.color}-300`}
          >
            <div className="text-2xl mb-1">{milestone.icon}</div>
            <div className="text-xs font-medium text-gray-700">{milestone.title}</div>
          </button>
        ))}
      </div>
    </div>
  );

  // Confetti animation
  const ConfettiEffect = () => (
    <div className={`fixed inset-0 pointer-events-none z-50 ${confettiActive ? 'animate-confetti' : 'opacity-0'}`}>
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`
          }}
        />
      ))}
    </div>
  );

  // Main celebration modal
  const CelebrationModal = () => {
    const milestone = selectedMilestone || activeMilestone;
    
    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 transition-all duration-500 ${
        celebrationActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div className={`bg-white rounded-3xl p-8 max-w-lg w-full mx-4 transform transition-all duration-500 ${
          celebrationActive ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}>
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className={`text-6xl mb-4 animate-bounce`}>
              {milestone.icon}
            </div>
            <h2 className={`text-2xl font-bold text-${milestone.color}-600 mb-3`}>
              {milestone.title}
            </h2>
            <p className="text-lg text-gray-700 mb-2">
              {milestone.getMessage(profile)}
            </p>
            <p className="text-gray-600">
              {milestone.getSubMessage(profile)}
            </p>
          </div>

          {/* Stats */}
          <div className={`bg-${milestone.color}-50 rounded-2xl p-4 mb-6`}>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 text-center">
              Why This Matters
            </h4>
            <div className="space-y-2">
              {milestone.stats.map((stat, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className={`w-2 h-2 bg-${milestone.color}-400 rounded-full`}></div>
                  <span className="text-sm text-gray-600">{stat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Progress visualization */}
          {milestone.id === 'quarter-progress' || milestone.id === 'halfway-point' ? (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress to {profile.dreamTitle}</span>
                <span>{milestone.threshold}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`bg-gradient-to-r from-${milestone.color}-400 to-${milestone.color}-600 h-3 rounded-full transition-all duration-1000`}
                  style={{ width: `${milestone.threshold}%` }}
                ></div>
              </div>
            </div>
          ) : null}

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <button
              onClick={() => setShowShareModal(true)}
              className={`p-3 bg-${milestone.color}-100 text-${milestone.color}-700 rounded-lg hover:bg-${milestone.color}-200 transition-colors flex flex-col items-center space-y-1`}
            >
              <Share2 className="w-5 h-5" />
              <span className="text-xs font-medium">Share</span>
            </button>
            
            <button
              onClick={() => setShowJournalModal(true)}
              className={`p-3 bg-${milestone.color}-100 text-${milestone.color}-700 rounded-lg hover:bg-${milestone.color}-200 transition-colors flex flex-col items-center space-y-1`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-xs font-medium">Journal</span>
            </button>
            
            <button
              onClick={() => {/* Take screenshot */}}
              className={`p-3 bg-${milestone.color}-100 text-${milestone.color}-700 rounded-lg hover:bg-${milestone.color}-200 transition-colors flex flex-col items-center space-y-1`}
            >
              <Camera className="w-5 h-5" />
              <span className="text-xs font-medium">Save</span>
            </button>
          </div>

          {/* Close button */}
          <button
            onClick={() => setCelebrationActive(false)}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Continue Building Your Dreams
          </button>
        </div>
      </div>
    );
  };

  // Share modal
  const ShareModal = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
      showShareModal ? '' : 'hidden'
    }`}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <Share2 className="w-5 h-5" />
          <span>Share Your Success</span>
        </h3>
        
        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleShare('twitter')}
            className="w-full p-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-3"
          >
            <span className="text-xl">🐦</span>
            <span>Share on Twitter</span>
          </button>
          
          <button
            onClick={() => handleShare('facebook')}
            className="w-full p-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-3"
          >
            <span className="text-xl">📘</span>
            <span>Share on Facebook</span>
          </button>
          
          <button
            onClick={() => handleShare('linkedin')}
            className="w-full p-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-3"
          >
            <span className="text-xl">💼</span>
            <span>Share on LinkedIn</span>
          </button>
        </div>
        
        <button
          onClick={() => setShowShareModal(false)}
          className="w-full py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  // Journal modal
  const JournalModal = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
      showJournalModal ? '' : 'hidden'
    }`}>
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <BookOpen className="w-5 h-5" />
          <span>Capture This Moment</span>
        </h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How are you feeling about this milestone?
          </label>
          <textarea
            value={journalEntry}
            onChange={(e) => setJournalEntry(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows="4"
            placeholder="This moment feels amazing because..."
          />
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleJournalSave}
            className="flex-1 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
          >
            Save Reflection
          </button>
          <button
            onClick={() => setShowJournalModal(false)}
            className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8 ${className}`}>
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-gray-800">Celebration Moments</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Every step toward your dreams deserves recognition. These aren't just numbers—
            they're life-changing moments that deserve to be celebrated and remembered.
          </p>
        </div>

        {/* Demo Controls */}
        <MilestoneSelector />

        {/* Recent Celebrations */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            <span>Recent Celebrations</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.values(milestoneTypes).slice(0, 4).map(milestone => (
              <div 
                key={milestone.id}
                className={`bg-${milestone.color}-50 border border-${milestone.color}-200 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all`}
                onClick={() => triggerCelebration(milestone)}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="text-3xl">{milestone.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{milestone.title}</h3>
                    <p className="text-sm text-gray-600">Click to celebrate again</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-3">
                  {milestone.getMessage(profile)}
                </p>
                
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>2 days ago</span>
                  <span>💫 Shared & journaled</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Milestones */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-blue-500" />
            <span>Upcoming Celebrations</span>
          </h2>

          <div className="space-y-4">
            {[
              { title: 'Halfway to Dream Goal', progress: 42, target: 50, eta: '3 months' },
              { title: 'Two Years of Consistency', progress: 85, target: 100, eta: '2 months' },
              { title: '$50K Net Worth', progress: 78, target: 100, eta: '4 months' }
            ].map((upcoming, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-800">{upcoming.title}</h4>
                  <span className="text-sm text-gray-500">~{upcoming.eta}</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-gradient-to-r from-purple-400 to-blue-400 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${upcoming.progress}%` }}
                  ></div>
                </div>
                
                <div className="text-xs text-gray-600">
                  {upcoming.progress}% complete - keep up the amazing work!
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Celebration Philosophy */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl shadow-xl p-8 mt-8 text-white">
          <div className="text-center">
            <Heart className="w-12 h-12 mx-auto mb-4 opacity-90" />
            <h2 className="text-2xl font-bold mb-4">Why We Celebrate</h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto mb-6">
              Financial progress isn't just about numbers—it's about the life you're building, 
              the security you're creating, and the dreams you're making possible. Every milestone 
              deserves recognition because you're not just saving money, you're building your future.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                <h4 className="font-semibold mb-2">Progress Recognition</h4>
                <p className="text-sm opacity-90">Acknowledge every step forward</p>
              </div>
              
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <Gift className="w-8 h-8 mx-auto mb-2" />
                <h4 className="font-semibold mb-2">Motivation Fuel</h4>
                <p className="text-sm opacity-90">Celebrations energize the journey</p>
              </div>
              
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <MessageCircle className="w-8 h-8 mx-auto mb-2" />
                <h4 className="font-semibold mb-2">Story Building</h4>
                <p className="text-sm opacity-90">Create memories worth sharing</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Celebration Modal */}
      <CelebrationModal />
      
      {/* Share Modal */}
      <ShareModal />
      
      {/* Journal Modal */}
      <JournalModal />
      
      {/* Confetti Effect */}
      <ConfettiEffect />

      {/* Custom styles */}
      <style jsx>{`
        @keyframes confetti {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        
        .animate-confetti {
          animation: confetti 3s ease-out infinite;
        }
      `}</style>
    </div>
  );
};

export default CelebrationMoments;
