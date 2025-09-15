import React, { useState, useEffect, useRef } from 'react';
import { useCountUp } from '../utils/useCountUp';
import { useIntersectionObserver } from '../utils/useIntersectionObserver';
import ProgressBar from '../components/ProgressBar';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  DollarSign, 
  Target, 
  Heart,
  Zap,
  Crown,
  ArrowRight,
  Star,
  Calendar,
  UserPlus,
  Briefcase
} from 'lucide-react';

const CEOInsightView = () => {
  const [activeMetric, setActiveMetric] = useState('engagement');
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);
  
  const isInView = useIntersectionObserver(containerRef, { threshold: 0.2 });

  useEffect(() => {
    if (isInView) {
      setIsVisible(true);
    }
  }, [isInView]);

  // Key business metrics with animated counters
  const engagementTime = useCountUp({ end: 12, duration: 2000, startOnTrigger: true });
  const traditionalEngagement = useCountUp({ end: 2, duration: 2000, startOnTrigger: true });
  const lifetimeValue = useCountUp({ end: 4800, duration: 2500, startOnTrigger: true });
  const traditionalLTV = useCountUp({ end: 45, duration: 2500, startOnTrigger: true });
  const viralCoefficient = useCountUp({ end: 2.3, duration: 2000, startOnTrigger: true });
  const traditionalViral = useCountUp({ end: 0.1, duration: 2000, startOnTrigger: true });
  const retentionYear1 = useCountUp({ end: 92, duration: 2000, startOnTrigger: true });
  const traditionalRetention = useCountUp({ end: 15, duration: 2000, startOnTrigger: true });
  const premiumConversion = useCountUp({ end: 35, duration: 2000, startOnTrigger: true });
  const marketSize = useCountUp({ end: 180, duration: 3000, startOnTrigger: true });

  // Trigger animations when visible
  useEffect(() => {
    if (isVisible) {
      engagementTime.trigger();
      traditionalEngagement.trigger();
      lifetimeValue.trigger();
      traditionalLTV.trigger();
      viralCoefficient.trigger();
      traditionalViral.trigger();
      retentionYear1.trigger();
      traditionalRetention.trigger();
      premiumConversion.trigger();
      marketSize.trigger();
    }
  }, [isVisible]);

  // Key metrics data
  const businessMetrics = {
    engagement: {
      title: "User Engagement",
      description: "Time spent per session building their future",
      icon: <Clock className="w-8 h-8" />,
      color: "blue",
      dreamPlanner: engagementTime.count,
      traditional: traditionalEngagement.count,
      unit: "minutes",
      insight: "Users spend 6x longer because they're designing their life, not just budgeting expenses"
    },
    ltv: {
      title: "Lifetime Value",
      description: "Revenue per user over their journey",
      icon: <DollarSign className="w-8 h-8" />,
      color: "green",
      dreamPlanner: lifetimeValue.count,
      traditional: traditionalLTV.count,
      unit: "$",
      insight: "Users stay for decades (age 25-65) vs 3 months for budgeting apps"
    },
    viral: {
      title: "Viral Coefficient",
      description: "New users each user brings",
      icon: <UserPlus className="w-8 h-8" />,
      color: "purple",
      dreamPlanner: viralCoefficient.count,
      traditional: traditionalViral.count,
      unit: "",
      insight: "Users naturally invite accountability partners and share their success stories"
    },
    retention: {
      title: "1-Year Retention",
      description: "Users still active after 12 months",
      icon: <Heart className="w-8 h-8" />,
      color: "red",
      dreamPlanner: retentionYear1.count,
      traditional: traditionalRetention.count,
      unit: "%",
      insight: "Long-term commitment driven by meaningful progress toward life dreams"
    }
  };

  const currentMetric = businessMetrics[activeMetric];

  // Revenue model tiers
  const revenueTiers = [
    {
      name: "Dream Starter",
      price: "Free",
      description: "Basic three-bucket planning",
      users: "70%",
      features: [
        "Basic dream calculator",
        "Simple three-bucket allocation",
        "Monthly progress tracking",
        "Community access"
      ],
      revenue: 0
    },
    {
      name: "Dream Builder",
      price: "$12/month",
      description: "Advanced optimization & insights",
      users: "25%",
      features: [
        "AI-powered optimization",
        "Life milestone planning",
        "Advanced projections",
        "Priority support",
        "Accountability tools"
      ],
      revenue: 144
    },
    {
      name: "Dream Achiever",
      price: "$25/month",
      description: "Full concierge experience",
      users: "5%",
      features: [
        "Personal financial coaching",
        "Custom investment strategies",
        "Tax optimization",
        "Estate planning",
        "White-glove service"
      ],
      revenue: 300
    }
  ];

  // Market opportunity
  const marketSegments = [
    {
      segment: "Young Professionals",
      ageRange: "25-35",
      size: "45M",
      potential: "$2.1B",
      description: "Starting careers, high engagement potential"
    },
    {
      segment: "Mid-Career",
      ageRange: "35-50",
      size: "52M",
      potential: "$3.8B",
      description: "Peak earning years, highest LTV"
    },
    {
      segment: "Pre-Retirement",
      ageRange: "50-65",
      size: "38M",
      potential: "$2.9B",
      description: "Premium features, wealth optimization"
    }
  ];

  const MetricCard = ({ metricKey }) => {
    const metric = businessMetrics[metricKey];
    const isActive = activeMetric === metricKey;
    
    return (
      <div 
        className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
          isActive 
            ? `bg-${metric.color}-50 border-2 border-${metric.color}-200 shadow-lg` 
            : 'bg-white border border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => setActiveMetric(metricKey)}
      >
        <div className={`text-${metric.color}-500 mb-4`}>
          {metric.icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{metric.title}</h3>
        <div className="space-y-4">
          {/* Dream Planner Metric */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Dream Planner</span>
              <span className={`text-2xl font-bold text-${metric.color}-600`}>
                {metric.unit === "$" ? "$" : ""}
                {metricKey === 'viral' ? metric.dreamPlanner.toFixed(1) : metric.dreamPlanner}
                {metric.unit !== "$" && metric.unit !== "" ? metric.unit : ""}
              </span>
            </div>
            <ProgressBar 
              percentage={100} 
              showPercentage={false}
              height="sm"
            />
          </div>
          
          {/* Traditional Comparison */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">Traditional Apps</span>
              <span className="text-lg text-gray-500">
                {metric.unit === "$" ? "$" : ""}
                {metricKey === 'viral' ? metric.traditional.toFixed(1) : metric.traditional}
                {metric.unit !== "$" && metric.unit !== "" ? metric.unit : ""}
              </span>
            </div>
            <ProgressBar 
              percentage={(metric.traditional / metric.dreamPlanner) * 100} 
              showPercentage={false}
              height="sm"
            />
          </div>
        </div>
        
        <div className={`mt-4 text-xs ${isActive ? `text-${metric.color}-700` : 'text-gray-500'}`}>
          {metric.description}
        </div>
      </div>
    );
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-12">
      <div className="max-w-7xl mx-auto px-4 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center space-x-3 bg-white rounded-full px-6 py-3 shadow-lg">
            <Briefcase className="w-6 h-6 text-purple-600" />
            <span className="text-purple-600 font-semibold">CEO Dashboard</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-800">
            The Business Case for<br />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Dream Planner
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlike traditional finance apps that users abandon after 3 months, Dream Planner creates 
            40-year customer relationships by connecting money to meaning.
          </p>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.keys(businessMetrics).map(metricKey => (
            <MetricCard key={metricKey} metricKey={metricKey} />
          ))}
        </div>

        {/* Detailed Metric View */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className={`text-${currentMetric.color}-500`}>
                {currentMetric.icon}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  {currentMetric.title}
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  {currentMetric.insight}
                </p>
              </div>
              
              {/* Comparison Stats */}
              <div className="grid grid-cols-2 gap-6">
                <div className={`bg-${currentMetric.color}-50 rounded-xl p-6 text-center`}>
                  <div className={`text-3xl font-bold text-${currentMetric.color}-600 mb-2`}>
                    {currentMetric.unit === "$" ? "$" : ""}
                    {activeMetric === 'viral' ? currentMetric.dreamPlanner.toFixed(1) : currentMetric.dreamPlanner}
                    {currentMetric.unit !== "$" && currentMetric.unit !== "" ? currentMetric.unit : ""}
                  </div>
                  <div className="text-sm font-medium text-gray-700">Dream Planner</div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-gray-500 mb-2">
                    {currentMetric.unit === "$" ? "$" : ""}
                    {activeMetric === 'viral' ? currentMetric.traditional.toFixed(1) : currentMetric.traditional}
                    {currentMetric.unit !== "$" && currentMetric.unit !== "" ? currentMetric.unit : ""}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Traditional Apps</div>
                </div>
              </div>
              
              <div className={`bg-${currentMetric.color}-50 rounded-xl p-4`}>
                <div className="flex items-center space-x-3">
                  <Zap className={`w-5 h-5 text-${currentMetric.color}-600`} />
                  <span className={`text-sm font-medium text-${currentMetric.color}-800`}>
                    {Math.round(currentMetric.dreamPlanner / currentMetric.traditional)}x better than competition
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Representation */}
            <div className="space-y-6">
              {activeMetric === 'engagement' && (
                <div className="bg-blue-50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Session Engagement</h4>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4">
                      <div className="text-2xl mb-2">👤</div>
                      <div className="text-sm text-gray-600 mb-2">Traditional Finance App</div>
                      <div className="text-xs text-gray-500">Check balance → Close app</div>
                      <div className="text-lg font-bold text-gray-700">2 minutes</div>
                    </div>
                    <ArrowRight className="w-6 h-6 text-gray-400 mx-auto" />
                    <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                      <div className="text-2xl mb-2">✨</div>
                      <div className="text-sm text-blue-600 mb-2">Dream Planner</div>
                      <div className="text-xs text-blue-500">Plan future → Visualize dreams → Optimize strategy</div>
                      <div className="text-lg font-bold text-blue-700">12 minutes</div>
                    </div>
                  </div>
                </div>
              )}

              {activeMetric === 'ltv' && (
                <div className="bg-green-50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Customer Lifecycle</h4>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-3 flex justify-between items-center">
                      <span className="text-sm">Age 25: First Job</span>
                      <span className="text-green-600 font-bold">Join</span>
                    </div>
                    <div className="bg-white rounded-lg p-3 flex justify-between items-center">
                      <span className="text-sm">Age 30: House Down Payment</span>
                      <span className="text-green-600 font-bold">Upgrade</span>
                    </div>
                    <div className="bg-white rounded-lg p-3 flex justify-between items-center">
                      <span className="text-sm">Age 40: Kids College</span>
                      <span className="text-green-600 font-bold">Premium</span>
                    </div>
                    <div className="bg-white rounded-lg p-3 flex justify-between items-center">
                      <span className="text-sm">Age 55: Dream Achieved</span>
                      <span className="text-green-600 font-bold">Advocate</span>
                    </div>
                    <div className="bg-white rounded-lg p-3 flex justify-between items-center">
                      <span className="text-sm">Age 65: Retirement</span>
                      <span className="text-green-600 font-bold">Legacy</span>
                    </div>
                  </div>
                </div>
              )}

              {activeMetric === 'viral' && (
                <div className="bg-purple-50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Viral Growth Drivers</h4>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-3 flex items-center space-x-3">
                      <Users className="w-5 h-5 text-purple-500" />
                      <span className="text-sm">Accountability Partners</span>
                    </div>
                    <div className="bg-white rounded-lg p-3 flex items-center space-x-3">
                      <Star className="w-5 h-5 text-purple-500" />
                      <span className="text-sm">Success Story Sharing</span>
                    </div>
                    <div className="bg-white rounded-lg p-3 flex items-center space-x-3">
                      <Heart className="w-5 h-5 text-purple-500" />
                      <span className="text-sm">Family Financial Planning</span>
                    </div>
                    <div className="bg-white rounded-lg p-3 flex items-center space-x-3">
                      <Target className="w-5 h-5 text-purple-500" />
                      <span className="text-sm">Couples Goal Setting</span>
                    </div>
                  </div>
                </div>
              )}

              {activeMetric === 'retention' && (
                <div className="bg-red-50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Retention by Quarter</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Q1</span>
                      <div className="flex space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2 flex items-center">
                          <div className="w-3/12 bg-gray-500 h-2 rounded-full"></div>
                        </div>
                        <span className="text-xs text-gray-500">25%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold">Dream Planner Q1</span>
                      <div className="flex space-x-2">
                        <div className="w-20 bg-red-200 rounded-full h-2 flex items-center">
                          <div className="w-11/12 bg-red-500 h-2 rounded-full"></div>
                        </div>
                        <span className="text-xs text-red-600 font-bold">92%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Revenue Model */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Freemium Revenue Model</h2>
            <p className="text-lg text-gray-600">
              Start free, upgrade naturally as life complexity increases
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {revenueTiers.map((tier, index) => (
              <div 
                key={tier.name}
                className={`rounded-2xl p-6 border-2 ${
                  index === 1 
                    ? 'border-purple-200 bg-purple-50 relative' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                {index === 1 && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-purple-500 text-white px-4 py-1 rounded-full text-xs font-bold">
                      MOST POPULAR
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{tier.name}</h3>
                  <div className="text-3xl font-bold text-purple-600 mb-2">{tier.price}</div>
                  <p className="text-sm text-gray-600 mb-4">{tier.description}</p>
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-2xl font-bold text-gray-800">{tier.users}</div>
                    <div className="text-xs text-gray-500">of users</div>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        index === 1 ? 'bg-purple-500' : 'bg-gray-400'
                      }`}></div>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {tier.revenue > 0 && (
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-green-600">
                      ${tier.revenue}/year
                    </div>
                    <div className="text-xs text-gray-500">avg revenue per user</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6">
            <div className="text-center">
              <h4 className="text-xl font-bold text-gray-800 mb-4">Revenue Projection</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    ${premiumConversion.count}%
                  </div>
                  <div className="text-sm text-gray-600">Premium Conversion Rate</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    ${(lifetimeValue.count * 0.7).toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-600">Average LTV</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    ${marketSize.count}B
                  </div>
                  <div className="text-sm text-gray-600">Addressable Market</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Market Opportunity */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Market Opportunity</h2>
            <p className="text-lg text-gray-600">
              ${marketSize.count}B+ addressable market across all life stages
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {marketSegments.map((segment, index) => (
              <div key={segment.segment} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{segment.segment}</h3>
                  <div className="text-sm text-gray-600 mb-4">{segment.ageRange} years old</div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-xl font-bold text-blue-600">{segment.size}</div>
                      <div className="text-xs text-gray-500">People</div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-xl font-bold text-purple-600">{segment.potential}</div>
                      <div className="text-xs text-gray-500">Market Size</div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600">{segment.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl shadow-2xl p-8 text-white">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Why Dream Planner Wins</h2>
            <p className="text-lg opacity-90">
              We're not just another finance app—we're building the future of life planning
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white bg-opacity-10 rounded-xl p-6 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-4" />
              <h3 className="font-bold mb-2">40-Year Relationships</h3>
              <p className="text-sm opacity-90">From first job to retirement</p>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-xl p-6 text-center">
              <Target className="w-8 h-8 mx-auto mb-4" />
              <h3 className="font-bold mb-2">Purpose-Driven</h3>
              <p className="text-sm opacity-90">Connect money to meaning</p>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-xl p-6 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-4" />
              <h3 className="font-bold mb-2">Compound Growth</h3>
              <p className="text-sm opacity-90">Viral coefficient 2.3x</p>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-xl p-6 text-center">
              <Crown className="w-8 h-8 mx-auto mb-4" />
              <h3 className="font-bold mb-2">Premium Value</h3>
              <p className="text-sm opacity-90">$4,800 lifetime value</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CEOInsightView;
