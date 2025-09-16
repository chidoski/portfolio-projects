import React, { useState, useEffect, useRef } from 'react';
import { useIntersectionObserver } from '../utils/useIntersectionObserver';

/**
 * TrustBuilder Component
 * Displays an animated compound growth chart showing how daily savings grow over time
 * Uses SVG animation to visualize the math behind compound growth
 */
const TrustBuilder = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const pathRef = useRef(null);
  const { ref: containerRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.3,
    triggerOnce: true
  });

  // Calculate compound growth data points
  const generateGrowthData = () => {
    const dailySaving = 25;
    const monthsInYear = 12;
    const years = 5;
    const monthlyInterestRate = 0.07 / 12; // 7% annual return
    const totalMonths = years * monthsInYear;
    
    const dataPoints = [];
    let currentValue = 0;
    
    for (let month = 0; month <= totalMonths; month++) {
      if (month === 0) {
        currentValue = 0;
      } else {
        // Add monthly contribution and apply interest
        const monthlyContribution = dailySaving * 30; // Approximate monthly contribution
        currentValue = (currentValue + monthlyContribution) * (1 + monthlyInterestRate);
      }
      
      dataPoints.push({
        month,
        value: currentValue,
        year: month / 12
      });
    }
    
    return dataPoints;
  };

  const data = generateGrowthData();
  const maxValue = Math.max(...data.map(d => d.value));
  const chartWidth = 600;
  const chartHeight = 300;
  const padding = 50;

  // Convert data to SVG coordinates
  const toSVGCoords = (month, value) => {
    const x = padding + (month / 60) * (chartWidth - 2 * padding);
    const y = chartHeight - padding - (value / maxValue) * (chartHeight - 2 * padding);
    return { x, y };
  };

  // Generate SVG path
  const generatePath = () => {
    if (data.length === 0) return '';
    
    const startPoint = toSVGCoords(0, 0);
    let path = `M ${startPoint.x} ${startPoint.y}`;
    
    data.slice(1).forEach(point => {
      const coords = toSVGCoords(point.month, point.value);
      path += ` L ${coords.x} ${coords.y}`;
    });
    
    return path;
  };

  // Start animation when component becomes visible
  useEffect(() => {
    if (isIntersecting && !isAnimating) {
      setIsAnimating(true);
    }
  }, [isIntersecting, isAnimating]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Key milestones for annotation
  const milestones = [
    { month: 12, label: 'Year 1', value: data[12]?.value || 0 },
    { month: 36, label: 'Year 3', value: data[36]?.value || 0 },
    { month: 60, label: 'Year 5', value: data[60]?.value || 0 }
  ];

  return (
    <div ref={containerRef} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          See the Math Behind the Magic
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Watch how saving just $25 daily transforms into substantial wealth through the power of compound growth
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Chart Container */}
        <div className="relative bg-gray-50 rounded-xl p-6 mb-6">
          <svg 
            width="100%" 
            height="350" 
            viewBox={`0 0 ${chartWidth} ${chartHeight + 50}`}
            className="overflow-visible"
          >
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="60" height="30" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 30" fill="none" stroke="#E5E7EB" strokeWidth="1" opacity="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Axes */}
            <line 
              x1={padding} 
              y1={chartHeight - padding} 
              x2={chartWidth - padding} 
              y2={chartHeight - padding} 
              stroke="#9CA3AF" 
              strokeWidth="2"
            />
            <line 
              x1={padding} 
              y1={padding} 
              x2={padding} 
              y2={chartHeight - padding} 
              stroke="#9CA3AF" 
              strokeWidth="2"
            />
            
            {/* Y-axis labels */}
            {[0, 10000, 20000, 30000, 40000, 50000].map((value) => {
              const y = chartHeight - padding - (value / maxValue) * (chartHeight - 2 * padding);
              return (
                <g key={value}>
                  <line 
                    x1={padding - 5} 
                    y1={y} 
                    x2={padding + 5} 
                    y2={y} 
                    stroke="#9CA3AF" 
                    strokeWidth="1"
                  />
                  <text 
                    x={padding - 15} 
                    y={y + 5} 
                    textAnchor="end" 
                    fontSize="12" 
                    fill="#6B7280"
                  >
                    {formatCurrency(value)}
                  </text>
                </g>
              );
            })}
            
            {/* X-axis labels */}
            {[0, 1, 2, 3, 4, 5].map((year) => {
              const x = padding + (year / 5) * (chartWidth - 2 * padding);
              return (
                <g key={year}>
                  <line 
                    x1={x} 
                    y1={chartHeight - padding - 5} 
                    x2={x} 
                    y2={chartHeight - padding + 5} 
                    stroke="#9CA3AF" 
                    strokeWidth="1"
                  />
                  <text 
                    x={x} 
                    y={chartHeight - padding + 20} 
                    textAnchor="middle" 
                    fontSize="12" 
                    fill="#6B7280"
                  >
                    Year {year}
                  </text>
                </g>
              );
            })}
            
            {/* Compound growth curve */}
            <path
              ref={pathRef}
              d={generatePath()}
              fill="none"
              stroke="#0B7A75"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: isAnimating ? 'none' : '2000',
                strokeDashoffset: isAnimating ? '0' : '2000',
                transition: isAnimating ? 'stroke-dashoffset 3s ease-in-out' : 'none'
              }}
            />
            
            {/* Area fill under curve */}
            <path
              d={`${generatePath()} L ${chartWidth - padding} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`}
              fill="url(#gradient)"
              style={{
                opacity: isAnimating ? 0.2 : 0,
                transition: 'opacity 3s ease-in-out 1s'
              }}
            />
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0B7A75" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#0B7A75" stopOpacity="0.05"/>
              </linearGradient>
            </defs>
            
            {/* Milestone markers */}
            {milestones.map((milestone, index) => {
              const coords = toSVGCoords(milestone.month, milestone.value);
              return (
                <g key={milestone.month}>
                  {/* Marker circle */}
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r="6"
                    fill="#0B7A75"
                    stroke="white"
                    strokeWidth="2"
                    style={{
                      opacity: isAnimating ? 1 : 0,
                      transition: `opacity 0.5s ease-in-out ${2 + index * 0.5}s`
                    }}
                  />
                  
                  {/* Value label */}
                  <text
                    x={coords.x}
                    y={coords.y - 15}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="bold"
                    fill="#0B7A75"
                    style={{
                      opacity: isAnimating ? 1 : 0,
                      transition: `opacity 0.5s ease-in-out ${2.5 + index * 0.5}s`
                    }}
                  >
                    {formatCurrency(milestone.value)}
                  </text>
                  
                  {/* Year label */}
                  <text
                    x={coords.x}
                    y={chartHeight + 40}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="medium"
                    fill="#6B7280"
                    style={{
                      opacity: isAnimating ? 1 : 0,
                      transition: `opacity 0.5s ease-in-out ${2.5 + index * 0.5}s`
                    }}
                  >
                    {milestone.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Key Statistics */}
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="text-3xl font-bold mb-2" style={{ color: '#0B7A75' }}>
              $25
            </div>
            <div className="text-sm text-gray-600">Daily Savings</div>
            <div className="text-xs text-gray-500 mt-1">Just one coffee less</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="text-3xl font-bold mb-2" style={{ color: '#0B7A75' }}>
              7%
            </div>
            <div className="text-sm text-gray-600">Annual Return</div>
            <div className="text-xs text-gray-500 mt-1">Conservative market average</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="text-3xl font-bold mb-2" style={{ color: '#0B7A75' }}>
              {formatCurrency(data[60]?.value || 50000)}
            </div>
            <div className="text-sm text-gray-600">After 5 Years</div>
            <div className="text-xs text-gray-500 mt-1">The power of compound growth</div>
          </div>
        </div>

        {/* Explanation */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 max-w-2xl mx-auto">
            This isn't about getting rich quick—it's about the reliable math of compound growth. 
            Small, consistent actions create extraordinary results over time. Your future self will thank you for starting today.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrustBuilder;
