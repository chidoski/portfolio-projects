import React, { useState, useEffect } from 'react';

const AccountabilityPartner = ({ userProfile = {}, isPartnerView = false, shareId = null }) => {
  const [activeTab, setActiveTab] = useState('setup');
  const [shareLink, setShareLink] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [isLinkGenerated, setIsLinkGenerated] = useState(false);
  const [encouragementMessage, setEncouragementMessage] = useState('');
  const [recentMessages, setRecentMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sample user data - would come from props/context in real app
  const [userData] = useState({
    name: userProfile.name || 'Alex',
    dreamTitle: userProfile.dreamTitle || 'Cottage by the Lake',
    somedayLifeVision: userProfile.somedayLifeVision || [
      'Morning coffee on the deck overlooking the water',
      'Weekend retreats with friends and family',
      'Peaceful environment for reading and writing',
      'Garden with fresh herbs and vegetables',
      'Fire pit for evening conversations under the stars'
    ],
    buckets: {
      foundation: {
        name: 'Foundation',
        progress: 0.34,
        color: 'from-green-500 to-emerald-500',
        description: 'Security & Retirement'
      },
      dream: {
        name: 'Dream',
        progress: 0.67,
        color: 'from-purple-500 to-pink-500',
        description: 'Cottage Fund'
      },
      life: {
        name: 'Life',
        progress: 0.89,
        color: 'from-blue-500 to-cyan-500',
        description: 'Adventures & Flexibility'
      }
    },
    currentStreak: 47,
    projectedArrival: 'September 2027',
    lastUpdated: new Date().toISOString(),
    totalProgress: 0.63 // Overall progress toward Someday Life
  });

  // Sample encouragement messages
  const sampleMessages = [
    {
      id: 1,
      sender: 'Mom',
      message: "So proud of your discipline! That streak is amazing 🌟",
      timestamp: '2024-01-10T10:30:00Z',
      type: 'encouragement'
    },
    {
      id: 2,
      sender: 'Mom',
      message: "I can already picture us having coffee on that deck! ☕",
      timestamp: '2024-01-08T15:45:00Z',
      type: 'vision'
    },
    {
      id: 3,
      sender: 'Mom',
      message: "Remember when you thought this was impossible? Look at you now! 💪",
      timestamp: '2024-01-05T09:15:00Z',
      type: 'milestone'
    }
  ];

  useEffect(() => {
    if (isPartnerView) {
      setActiveTab('dashboard');
      setRecentMessages(sampleMessages);
    }
  }, [isPartnerView]);

  const generateShareLink = () => {
    setIsLoading(true);
    
    // Simulate API call to generate unique share link
    setTimeout(() => {
      const uniqueId = Math.random().toString(36).substring(2, 15);
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/accountability/${uniqueId}`;
      setShareLink(link);
      setIsLinkGenerated(true);
      setIsLoading(false);
    }, 1000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    // Would show a toast notification in real app
    alert('Link copied to clipboard!');
  };

  const sendEncouragement = () => {
    if (!encouragementMessage.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      sender: partnerName || 'Accountability Partner',
      message: encouragementMessage,
      timestamp: new Date().toISOString(),
      type: 'encouragement'
    };
    
    setRecentMessages(prev => [newMessage, ...prev]);
    setEncouragementMessage('');
    
    // Would send to backend/user in real app
    alert('Encouragement sent! 💜');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProgressColor = (progress) => {
    if (progress >= 0.8) return 'text-green-600';
    if (progress >= 0.5) return 'text-yellow-600';
    return 'text-blue-600';
  };

  // Partner View Dashboard
  if (isPartnerView) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              🎯 {userData.name}'s Dream Journey
            </h1>
            <p className="text-lg text-gray-600">
              Supporting their path to: <span className="font-semibold text-purple-600">{userData.dreamTitle}</span>
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Vision Board */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                ✨ Someday Life Vision
              </h2>
              
              <div className="space-y-4 mb-6">
                {userData.somedayLifeVision.map((vision, index) => (
                  <div key={index} className="flex items-start">
                    <span className="text-purple-500 mr-3 mt-1">•</span>
                    <p className="text-gray-700 leading-relaxed">{vision}</p>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-purple-800">Overall Progress</h3>
                  <span className="text-2xl font-bold text-purple-600">
                    {Math.round(userData.totalProgress * 100)}%
                  </span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${userData.totalProgress * 100}%` }}
                  ></div>
                </div>
                <div className="mt-3 text-sm text-purple-700">
                  Projected arrival: <strong>{userData.projectedArrival}</strong>
                </div>
              </div>
            </div>

            {/* Progress Summary */}
            <div className="space-y-6">
              {/* Current Streak */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  🔥 Current Streak
                </h3>
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-500 mb-2">
                    {userData.currentStreak}
                  </div>
                  <div className="text-gray-600 text-sm">days strong!</div>
                </div>
                <div className="mt-4 bg-orange-50 rounded-lg p-3">
                  <p className="text-orange-700 text-sm text-center">
                    Consistency is everything! 🌟
                  </p>
                </div>
              </div>

              {/* Send Encouragement */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  💜 Send Encouragement
                </h3>
                <textarea
                  value={encouragementMessage}
                  onChange={(e) => setEncouragementMessage(e.target.value)}
                  placeholder="Write a motivational message..."
                  className="w-full p-3 border border-gray-200 rounded-lg resize-none h-20 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  onClick={sendEncouragement}
                  disabled={!encouragementMessage.trim()}
                  className="w-full mt-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Send Support 🚀
                </button>
              </div>
            </div>
          </div>

          {/* Three Buckets Progress */}
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              🪣 Three Bucket Progress
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {Object.entries(userData.buckets).map(([key, bucket]) => (
                <div key={key} className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800">{bucket.name}</h3>
                    <span className={`text-xl font-bold ${getProgressColor(bucket.progress)}`}>
                      {Math.round(bucket.progress * 100)}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                    <div 
                      className={`bg-gradient-to-r ${bucket.color} h-3 rounded-full transition-all duration-300`}
                      style={{ width: `${bucket.progress * 100}%` }}
                    ></div>
                  </div>
                  
                  <p className="text-sm text-gray-600">{bucket.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Messages */}
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              💬 Recent Encouragement
            </h2>
            
            <div className="space-y-4">
              {recentMessages.map((message) => (
                <div key={message.id} className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-gray-800 mb-2">{message.message}</p>
                      <div className="text-sm text-purple-600">
                        From {message.sender} • {formatDate(message.timestamp)}
                      </div>
                    </div>
                    <div className="ml-4">
                      {message.type === 'encouragement' && '💜'}
                      {message.type === 'vision' && '✨'}
                      {message.type === 'milestone' && '🎉'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            🔒 You're viewing a privacy-protected dashboard. No financial details are shared.
          </div>
        </div>
      </div>
    );
  }

  // User Setup View
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🤝 Accountability Partner
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Share your progress with someone you trust. They'll see your journey 
            without any financial details - just progress and encouragement.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="flex space-x-1">
              {[
                { key: 'setup', label: 'Share Setup', icon: '🔗' },
                { key: 'preview', label: 'Partner Preview', icon: '👀' },
                { key: 'manage', label: 'Manage Access', icon: '⚙️' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-white hover:shadow-sm'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-8">
            {activeTab === 'setup' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Create Your Share Link
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Generate a unique link to share with one trusted person. They'll see your 
                    progress and can send encouragement messages.
                  </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                  <h3 className="font-semibold text-purple-800 mb-3">What Your Partner Will See:</h3>
                  <ul className="space-y-2 text-purple-700">
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Your Someday Life vision board
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Progress percentages for all three buckets
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Current savings streak
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Projected arrival date
                    </li>
                  </ul>
                </div>

                <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                  <h3 className="font-semibold text-red-800 mb-3">What They WON'T See:</h3>
                  <ul className="space-y-2 text-red-700">
                    <li className="flex items-center">
                      <span className="text-red-500 mr-2">✗</span>
                      Actual dollar amounts
                    </li>
                    <li className="flex items-center">
                      <span className="text-red-500 mr-2">✗</span>
                      Income or expense details
                    </li>
                    <li className="flex items-center">
                      <span className="text-red-500 mr-2">✗</span>
                      Bank account information
                    </li>
                    <li className="flex items-center">
                      <span className="text-red-500 mr-2">✗</span>
                      Specific financial strategies
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Partner's Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder="e.g., Mom, Jamie, Best Friend"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {!isLinkGenerated ? (
                    <button
                      onClick={generateShareLink}
                      disabled={isLoading}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Generating Link...
                        </>
                      ) : (
                        <>
                          <span className="mr-2">🔗</span>
                          Generate Share Link
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <h3 className="font-semibold text-green-800 mb-2">Your Share Link:</h3>
                        <div className="bg-white rounded border border-green-300 p-3 break-all text-sm">
                          {shareLink}
                        </div>
                        <button
                          onClick={copyToClipboard}
                          className="mt-3 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded font-medium transition-colors"
                        >
                          📋 Copy Link
                        </button>
                      </div>

                      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                        <p className="text-yellow-800 text-sm">
                          <strong>Important:</strong> This link provides ongoing access to your progress. 
                          Only share it with someone you completely trust.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'preview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Partner View Preview
                  </h2>
                  <p className="text-gray-600 mb-6">
                    This is exactly what your accountability partner will see.
                  </p>
                </div>

                {/* Mini Partner Dashboard Preview */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                  <div className="text-center mb-4">
                    <div className="inline-block bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-2">
                      PREVIEW MODE
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      🎯 {userData.name}'s Dream Journey
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3">✨ Vision</h4>
                        <div className="space-y-2">
                          {userData.somedayLifeVision.slice(0, 3).map((vision, index) => (
                            <div key={index} className="text-sm text-gray-600 flex items-start">
                              <span className="text-purple-500 mr-2 mt-1">•</span>
                              <span>{vision}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3">📊 Progress</h4>
                        <div className="space-y-3">
                          {Object.entries(userData.buckets).map(([key, bucket]) => (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{bucket.name}</span>
                              <span className="font-semibold text-purple-600">
                                {Math.round(bucket.progress * 100)}%
                              </span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold">Streak:</span>
                            <span className="text-orange-500 font-bold">{userData.currentStreak} days</span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-semibold">Target:</span>
                            <span className="text-purple-600">{userData.projectedArrival}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-blue-800 text-sm">
                    💡 <strong>Tip:</strong> Your partner can send encouragement messages that will 
                    appear as notifications in your app.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'manage' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Manage Access
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Control who has access to your progress and manage sharing settings.
                  </p>
                </div>

                {isLinkGenerated ? (
                  <div className="space-y-6">
                    <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                      <h3 className="font-semibold text-green-800 mb-3">Active Share Link</h3>
                      <p className="text-green-700 text-sm mb-4">
                        Your progress is currently being shared with: <strong>{partnerName || 'Unnamed Partner'}</strong>
                      </p>
                      
                      <div className="flex space-x-3">
                        <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded font-medium transition-colors">
                          📧 Send Reminder
                        </button>
                        <button className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded font-medium transition-colors">
                          🔄 Generate New Link
                        </button>
                        <button className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-medium transition-colors">
                          🚫 Revoke Access
                        </button>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="font-semibold text-gray-800 mb-4">Privacy Controls</h3>
                      
                      <div className="space-y-4">
                        <label className="flex items-center">
                          <input type="checkbox" defaultChecked className="mr-3" />
                          <span className="text-gray-700">Allow encouragement messages</span>
                        </label>
                        
                        <label className="flex items-center">
                          <input type="checkbox" defaultChecked className="mr-3" />
                          <span className="text-gray-700">Show current streak</span>
                        </label>
                        
                        <label className="flex items-center">
                          <input type="checkbox" defaultChecked className="mr-3" />
                          <span className="text-gray-700">Show projected arrival date</span>
                        </label>
                        
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-3" />
                          <span className="text-gray-700">Send weekly progress updates via email</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔗</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Active Share Link</h3>
                    <p className="text-gray-600 mb-6">
                      Generate a share link in the "Share Setup" tab to start managing access.
                    </p>
                    <button
                      onClick={() => setActiveTab('setup')}
                      className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-lg font-medium transition-colors"
                    >
                      Create Share Link
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountabilityPartner;
