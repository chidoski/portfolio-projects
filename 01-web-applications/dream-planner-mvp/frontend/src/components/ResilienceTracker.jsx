import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Award, 
  Phoenix, 
  Shield, 
  Heart, 
  Target, 
  Calendar, 
  ChevronRight, 
  Flame,
  Anchor,
  Mountain,
  Star,
  CheckCircle
} from 'lucide-react';

/**
 * ResilienceTracker Component
 * Celebrates recovering from setbacks and builds a story of resilience
 * Shows visual timeline of journey with marked disruptions and recoveries
 */
const ResilienceTracker = ({ 
  userProfile, 
  crisisHistory = [], 
  savingsHistory = [],
  onViewDetails 
}) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [badges, setBadges] = useState([]);

  // Demo data for resilience journey
  const demoResilienceJourney = [
    {
      id: 'start-journey',
      type: 'milestone',
      date: '2022-01-01',
      title: 'Started Dream Journey',
      description: 'Began saving for Maine cottage dream',
      impact: 'positive',
      amount: 0,
      savingsRate: 15
    },
    {
      id: 'job-loss-2024',
      type: 'crisis',
      date: '2024-03-15',
      title: 'Job Loss',
      description: 'Marketing position eliminated during company restructuring',
      impact: 'negative',
      duration: 4, // months
      recoveryDate: '2024-07-15',
      savingsImpact: -60, // 60% reduction in savings
      bucketStrategy: 'Paused Dream bucket, protected Foundation',
      response: 'Activated unemployment benefits + freelance consulting'
    },
    {
      id: 'job-recovery-2024',
      type: 'recovery',
      date: '2024-07-15',
      title: 'Career Comeback',
      description: 'New marketing director role with 15% salary increase',
      impact: 'positive',
      previousCrisis: 'job-loss-2024',
      improvements: [
        'Higher salary than before',
        'Stronger emergency fund',
        'Diversified income sources'
      ]
    },
    {
      id: 'medical-emergency-2023',
      type: 'crisis',
      date: '2023-09-10',
      title: 'Medical Emergency',
      description: 'Unexpected surgery and 2-month recovery period',
      impact: 'negative',
      duration: 2,
      recoveryDate: '2023-11-10',
      savingsImpact: -30,
      bucketStrategy: 'Used Life bucket, Foundation protected',
      response: 'Strategic use of three-bucket system'
    },
    {
      id: 'health-recovery-2023',
      type: 'recovery',
      date: '2023-11-10',
      title: 'Health Restored',
      description: 'Full recovery with stronger health habits',
      impact: 'positive',
      previousCrisis: 'medical-emergency-2023',
      improvements: [
        'Better health insurance',
        'Emergency fund rebuilding',
        'Preventive care routine'
      ]
    },
    {
      id: 'savings-milestone-2024',
      type: 'milestone',
      date: '2024-12-01',
      title: 'Savings Milestone',
      description: 'Reached 25% of Maine cottage goal despite setbacks',
      impact: 'positive',
      amount: 112500, // 25% of 450k goal
      significance: 'First major milestone after multiple recoveries'
    }
  ];

  // Badge definitions
  const availableBadges = [
    {
      id: 'phoenix-rising',
      name: 'Phoenix Rising',
      description: 'Rebuilt after major setback',
      icon: Phoenix,
      color: 'from-orange-500 to-red-600',
      criteria: 'Recovered from crisis with improved position',
      rarity: 'legendary'
    },
    {
      id: 'steady-ship',
      name: 'Steady Ship',
      description: 'Maintained Foundation through crisis',
      icon: Anchor,
      color: 'from-blue-500 to-blue-700',
      criteria: 'Protected retirement savings during emergency',
      rarity: 'epic'
    },
    {
      id: 'comeback-streak',
      name: 'Comeback Streak',
      description: 'Consistent saving for 90+ days after crisis',
      icon: Flame,
      color: 'from-yellow-500 to-orange-500',
      criteria: 'Maintained savings streak post-recovery',
      rarity: 'rare'
    },
    {
      id: 'mountain-mover',
      name: 'Mountain Mover',
      description: 'Overcame multiple major challenges',
      icon: Mountain,
      color: 'from-purple-500 to-indigo-600',
      criteria: 'Successfully navigated 3+ life crises',
      rarity: 'legendary'
    },
    {
      id: 'wise-guardian',
      name: 'Wise Guardian',
      description: 'Used bucket system perfectly during crisis',
      icon: Shield,
      color: 'from-green-500 to-emerald-600',
      criteria: 'Strategic bucket usage during emergency',
      rarity: 'epic'
    },
    {
      id: 'resilient-heart',
      name: 'Resilient Heart',
      description: 'Maintained hope through dark times',
      icon: Heart,
      color: 'from-pink-500 to-rose-600',
      criteria: 'Continued pursuing dreams despite setbacks',
      rarity: 'rare'
    }
  ];

  // Calculate current comeback streak
  useEffect(() => {
    const calculateStreak = () => {
      const today = new Date();
      const sortedHistory = savingsHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      let streak = 0;
      let currentDate = new Date(today);
      
      // Count consecutive days of savings since last crisis recovery
      const lastRecovery = demoResilienceJourney
        .filter(event => event.type === 'recovery')
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      
      if (lastRecovery) {
        const recoveryDate = new Date(lastRecovery.date);
        const daysSinceRecovery = Math.floor((today - recoveryDate) / (1000 * 60 * 60 * 24));
        
        // Simulate consistent saving (in real app, this would come from actual data)
        streak = Math.max(0, daysSinceRecovery - 10); // Assume 10-day ramp-up period
      }
      
      setCurrentStreak(streak);
    };

    calculateStreak();
  }, [savingsHistory]);

  // Calculate earned badges
  useEffect(() => {
    const calculateBadges = () => {
      const earnedBadges = [];
      const crises = demoResilienceJourney.filter(event => event.type === 'crisis');
      const recoveries = demoResilienceJourney.filter(event => event.type === 'recovery');

      // Phoenix Rising: Recovered from major setback
      if (recoveries.some(recovery => recovery.improvements?.length > 0)) {
        earnedBadges.push({
          ...availableBadges.find(badge => badge.id === 'phoenix-rising'),
          earnedDate: recoveries[0]?.date,
          story: 'Rose from job loss stronger than before with higher salary'
        });
      }

      // Steady Ship: Maintained Foundation through crisis
      if (crises.some(crisis => crisis.bucketStrategy?.includes('Foundation protected'))) {
        earnedBadges.push({
          ...availableBadges.find(badge => badge.id === 'steady-ship'),
          earnedDate: crises.find(c => c.bucketStrategy?.includes('Foundation protected'))?.date,
          story: 'Kept retirement savings safe during medical emergency'
        });
      }

      // Comeback Streak: 90+ days of consistent saving
      if (currentStreak >= 90) {
        earnedBadges.push({
          ...availableBadges.find(badge => badge.id === 'comeback-streak'),
          earnedDate: new Date(Date.now() - (90 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
          story: `${currentStreak} days of consistent saving since recovery`
        });
      }

      // Mountain Mover: Multiple crises overcome
      if (crises.length >= 2) {
        earnedBadges.push({
          ...availableBadges.find(badge => badge.id === 'mountain-mover'),
          earnedDate: recoveries[recoveries.length - 1]?.date,
          story: `Overcame ${crises.length} major life challenges`
        });
      }

      // Wise Guardian: Strategic bucket usage
      if (crises.some(crisis => crisis.bucketStrategy?.includes('Life bucket'))) {
        earnedBadges.push({
          ...availableBadges.find(badge => badge.id === 'wise-guardian'),
          earnedDate: crises.find(c => c.bucketStrategy?.includes('Life bucket'))?.date,
          story: 'Used three-bucket system perfectly during medical crisis'
        });
      }

      // Resilient Heart: Continued pursuing dreams
      if (demoResilienceJourney.some(event => event.type === 'milestone' && new Date(event.date) > new Date('2024-01-01'))) {
        earnedBadges.push({
          ...availableBadges.find(badge => badge.id === 'resilient-heart'),
          earnedDate: demoResilienceJourney.find(event => event.type === 'milestone' && new Date(event.date) > new Date('2024-01-01'))?.date,
          story: 'Reached major savings milestone despite setbacks'
        });
      }

      setBadges(earnedBadges);
    };

    calculateBadges();
  }, [currentStreak]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-yellow-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <TrendingUp className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Resilience Journey</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Every setback is a setup for a comeback. Here's the story of your strength, 
          growth, and unstoppable progress toward your dreams.
        </p>
      </div>

      {/* Current Streak Counter */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">Current Comeback Streak</h3>
            <p className="text-green-700 text-sm">
              Days of consistent saving since your last recovery
            </p>
          </div>
          <div className="text-center">
            <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center border-4 border-green-300 mb-2">
              <span className="text-2xl font-bold text-green-600">{currentStreak}</span>
            </div>
            <p className="text-xs text-green-600 font-medium">Days Strong</p>
          </div>
        </div>
        
        {currentStreak >= 30 && (
          <div className="mt-4 p-3 bg-green-100 rounded-lg">
            <p className="text-sm text-green-800">
              🔥 <strong>You're on fire!</strong> {currentStreak} days of consistent progress shows incredible discipline.
            </p>
          </div>
        )}
      </div>

      {/* Resilience Badges */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Award className="w-6 h-6 text-yellow-500 mr-2" />
          Resilience Badges Earned
        </h3>
        
        {badges.length === 0 ? (
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Keep building resilience to earn your first badge!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge) => {
              const IconComponent = badge.icon;
              return (
                <div
                  key={badge.id}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`bg-gradient-to-r ${badge.color} p-3 rounded-full`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{badge.name}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${getRarityColor(badge.rarity)} text-white`}>
                          {badge.rarity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                      <p className="text-xs text-gray-500">{badge.story}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Earned: {formatDate(badge.earnedDate)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resilience Timeline */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Calendar className="w-6 h-6 text-blue-500 mr-2" />
          Your Resilience Timeline
        </h3>
        
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500"></div>
          
          <div className="space-y-6">
            {demoResilienceJourney.map((event, index) => {
              const isPositive = event.impact === 'positive';
              const isCrisis = event.type === 'crisis';
              const isRecovery = event.type === 'recovery';
              
              return (
                <div
                  key={event.id}
                  className={`relative flex items-start space-x-4 cursor-pointer hover:bg-gray-50 rounded-lg p-4 transition-all duration-200 ${
                    selectedEvent?.id === event.id ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
                  onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                >
                  {/* Timeline dot */}
                  <div className={`relative z-10 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isPositive ? 'bg-green-500 border-green-300' :
                    isCrisis ? 'bg-red-500 border-red-300' :
                    'bg-blue-500 border-blue-300'
                  }`}>
                    {isRecovery && <CheckCircle className="w-3 h-3 text-white" />}
                    {isCrisis && <span className="w-2 h-2 bg-white rounded-full" />}
                    {event.type === 'milestone' && <Star className="w-3 h-3 text-white" />}
                  </div>
                  
                  {/* Event content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-medium ${
                        isPositive ? 'text-green-800' :
                        isCrisis ? 'text-red-800' :
                        'text-blue-800'
                      }`}>
                        {event.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{formatDate(event.date)}</span>
                        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                          selectedEvent?.id === event.id ? 'rotate-90' : ''
                        }`} />
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mt-1">{event.description}</p>
                    
                    {/* Recovery info */}
                    {isCrisis && event.recoveryDate && (
                      <div className="mt-2 text-xs text-gray-500">
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                          Recovered by {formatDate(event.recoveryDate)} ({event.duration} months)
                        </span>
                      </div>
                    )}
                    
                    {/* Expanded details */}
                    {selectedEvent?.id === event.id && (
                      <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 space-y-3">
                        {event.bucketStrategy && (
                          <div>
                            <h5 className="font-medium text-gray-900 text-sm">Strategy Used:</h5>
                            <p className="text-sm text-gray-600">{event.bucketStrategy}</p>
                          </div>
                        )}
                        
                        {event.response && (
                          <div>
                            <h5 className="font-medium text-gray-900 text-sm">Response:</h5>
                            <p className="text-sm text-gray-600">{event.response}</p>
                          </div>
                        )}
                        
                        {event.improvements && (
                          <div>
                            <h5 className="font-medium text-gray-900 text-sm">Improvements Made:</h5>
                            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                              {event.improvements.map((improvement, idx) => (
                                <li key={idx}>{improvement}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {event.amount && (
                          <div>
                            <h5 className="font-medium text-gray-900 text-sm">Financial Impact:</h5>
                            <p className="text-sm text-gray-600">{formatCurrency(event.amount)} saved</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Resilience Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
        <h3 className="text-xl font-semibold text-purple-900 mb-4">Your Resilience Story</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 border-2 border-purple-300">
              <Target className="w-8 h-8 text-purple-600" />
            </div>
            <h4 className="font-semibold text-purple-900">
              {demoResilienceJourney.filter(e => e.type === 'crisis').length}
            </h4>
            <p className="text-sm text-purple-700">Challenges Overcome</p>
          </div>
          
          <div className="text-center">
            <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 border-2 border-green-300">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="font-semibold text-green-900">
              {demoResilienceJourney.filter(e => e.type === 'recovery').length}
            </h4>
            <p className="text-sm text-green-700">Successful Recoveries</p>
          </div>
          
          <div className="text-center">
            <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 border-2 border-yellow-300">
              <Award className="w-8 h-8 text-yellow-600" />
            </div>
            <h4 className="font-semibold text-yellow-900">{badges.length}</h4>
            <p className="text-sm text-yellow-700">Resilience Badges</p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-white rounded-lg">
          <p className="text-purple-800 text-center font-medium">
            "Every setback was a setup for a comeback. Your Maine cottage dream is not delayed – 
            it's being earned through strength, wisdom, and unshakeable determination."
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResilienceTracker;
