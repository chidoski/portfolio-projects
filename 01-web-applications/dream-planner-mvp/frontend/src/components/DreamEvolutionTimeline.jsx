import React, { useState, useRef, useEffect } from 'react';
import { Plus, Edit3, Calendar, TrendingUp, MapPin, DollarSign, Clock, Sparkles } from 'lucide-react';

const DreamEvolutionTimeline = ({ 
  currentAge = 32, 
  currentDream = null,
  onPhaseUpdate = () => {},
  className = ""
}) => {
  // Initial dream phases with Sarah's example evolution
  const [dreamPhases, setDreamPhases] = useState([
    {
      id: 'current-dream',
      title: 'Maine Cottage Retreat',
      description: 'Cozy lakeside cottage for writing and peace',
      age: 52,
      cost: 180000,
      status: 'active', // active, future, possibility
      category: 'primary-residence',
      icon: '🏡',
      color: 'blue',
      details: {
        location: 'Lake Moosehead, Maine',
        timeline: '20 years',
        confidence: 95,
        dependencies: []
      }
    },
    {
      id: 'income-property',
      title: 'Small Rental Property',
      description: 'Duplex for passive income and financial security',
      age: 57,
      cost: 220000,
      status: 'future',
      category: 'investment',
      icon: '🏠',
      color: 'green',
      details: {
        location: 'Near cottage or city',
        timeline: '25 years',
        confidence: 75,
        dependencies: ['current-dream']
      }
    },
    {
      id: 'art-studio',
      title: 'Teaching Art Workshops',
      description: 'Studio space for pottery and painting classes',
      age: 60,
      cost: 50000,
      status: 'possibility',
      category: 'passion-business',
      icon: '🎨',
      color: 'purple',
      details: {
        location: 'Cottage property or nearby',
        timeline: '28 years',
        confidence: 60,
        dependencies: ['current-dream']
      }
    },
    {
      id: 'travel-adventure',
      title: 'European Art Tour',
      description: 'Three-month artistic pilgrimage through Europe',
      age: 63,
      cost: 35000,
      status: 'possibility',
      category: 'experience',
      icon: '✈️',
      color: 'orange',
      details: {
        location: 'Italy, France, Spain',
        timeline: '31 years',
        confidence: 70,
        dependencies: ['art-studio']
      }
    }
  ]);

  const [showAddPhase, setShowAddPhase] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [timelineWidth, setTimelineWidth] = useState(800);
  const timelineRef = useRef(null);

  // Timeline configuration
  const startAge = currentAge;
  const endAge = 70;
  const totalYears = endAge - startAge;

  // Update timeline width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (timelineRef.current) {
        setTimelineWidth(timelineRef.current.offsetWidth - 100); // Account for margins
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Convert age to position on timeline
  const ageToPosition = (age) => {
    const yearFromStart = age - startAge;
    return (yearFromStart / totalYears) * timelineWidth;
  };

  // Dream phase categories
  const phaseCategories = {
    'primary-residence': { name: 'Home', color: 'blue' },
    'investment': { name: 'Investment', color: 'green' },
    'passion-business': { name: 'Passion Project', color: 'purple' },
    'experience': { name: 'Experience', color: 'orange' },
    'family': { name: 'Family', color: 'pink' },
    'health': { name: 'Health & Wellness', color: 'teal' }
  };

  // Status configurations
  const statusConfig = {
    active: {
      label: 'Current Goal',
      opacity: 'opacity-100',
      border: 'border-2',
      shadow: 'shadow-lg',
      confidence: 'High Confidence'
    },
    future: {
      label: 'Planned Phase',
      opacity: 'opacity-90',
      border: 'border-2 border-dashed',
      shadow: 'shadow-md',
      confidence: 'Medium Confidence'
    },
    possibility: {
      label: 'Future Possibility',
      opacity: 'opacity-70',
      border: 'border border-dashed',
      shadow: 'shadow-sm',
      confidence: 'Exploring Options'
    }
  };

  // Add new dream phase
  const addDreamPhase = (newPhase) => {
    const phase = {
      id: `phase-${Date.now()}`,
      status: 'possibility',
      details: {
        confidence: 50,
        dependencies: [],
        timeline: `${newPhase.age - currentAge} years`
      },
      ...newPhase
    };

    setDreamPhases(prev => [...prev, phase].sort((a, b) => a.age - b.age));
    setShowAddPhase(false);
    onPhaseUpdate([...dreamPhases, phase]);
  };

  // Update dream phase
  const updateDreamPhase = (phaseId, updates) => {
    setDreamPhases(prev => 
      prev.map(phase => 
        phase.id === phaseId 
          ? { ...phase, ...updates }
          : phase
      ).sort((a, b) => a.age - b.age)
    );
    setSelectedPhase(null);
  };

  // Remove dream phase
  const removeDreamPhase = (phaseId) => {
    setDreamPhases(prev => prev.filter(phase => phase.id !== phaseId));
    setSelectedPhase(null);
  };

  // Get phase visual style
  const getPhaseStyle = (phase) => {
    const config = statusConfig[phase.status];
    const category = phaseCategories[phase.category];
    
    return {
      opacity: config.opacity,
      border: `${config.border} border-${category.color}-300`,
      shadow: config.shadow,
      background: `bg-${category.color}-50`,
      text: `text-${category.color}-700`,
      accent: `bg-${category.color}-500`
    };
  };

  // Timeline marker component
  const TimelineMarker = ({ age, label, isHighlight = false }) => (
    <div
      className="absolute transform -translate-x-1/2"
      style={{ left: `${50 + ageToPosition(age)}px` }}
    >
      <div className={`w-3 h-3 rounded-full mb-2 ${
        isHighlight ? 'bg-blue-500' : 'bg-gray-300'
      }`}></div>
      <div className={`text-xs text-center ${
        isHighlight ? 'font-bold text-blue-600' : 'text-gray-500'
      }`}>
        {label}<br/>({age})
      </div>
    </div>
  );

  // Dream phase card
  const DreamPhaseCard = ({ phase }) => {
    const style = getPhaseStyle(phase);
    const category = phaseCategories[phase.category];
    const config = statusConfig[phase.status];

    return (
      <div
        className="absolute transform -translate-x-1/2 cursor-pointer group"
        style={{ left: `${50 + ageToPosition(phase.age)}px`, top: '60px' }}
        onClick={() => setSelectedPhase(phase)}
      >
        {/* Connection line to timeline */}
        <div className={`w-0.5 h-8 ${style.accent} mx-auto mb-2`}></div>
        
        {/* Phase card */}
        <div className={`
          ${style.background} ${style.border} ${style.shadow} ${style.opacity}
          rounded-lg p-4 w-64 transition-all duration-300
          group-hover:scale-105 group-hover:shadow-xl
        `}>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{phase.icon}</span>
              <div>
                <h4 className={`font-semibold ${style.text} text-sm`}>
                  {phase.title}
                </h4>
                <p className="text-xs text-gray-500">{config.label}</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-sm font-bold ${style.text}`}>Age {phase.age}</div>
              <div className="text-xs text-gray-500">{phase.details.timeline}</div>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-gray-600 mb-3">{phase.description}</p>

          {/* Key details */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Investment:</span>
              <span className={`font-semibold ${style.text}`}>
                ${phase.cost.toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Confidence:</span>
              <div className="flex items-center space-x-1">
                <div className="w-16 bg-gray-200 rounded-full h-1">
                  <div 
                    className={`h-1 ${style.accent} rounded-full transition-all duration-500`}
                    style={{ width: `${phase.details.confidence}%` }}
                  ></div>
                </div>
                <span className={`text-xs ${style.text}`}>
                  {phase.details.confidence}%
                </span>
              </div>
            </div>

            {phase.details.location && (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />
                <span>{phase.details.location}</span>
              </div>
            )}
          </div>

          {/* Dependencies */}
          {phase.details.dependencies.length > 0 && (
            <div className="mt-3 pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Builds upon:</div>
              <div className="flex flex-wrap gap-1">
                {phase.details.dependencies.map(depId => {
                  const depPhase = dreamPhases.find(p => p.id === depId);
                  return depPhase ? (
                    <span 
                      key={depId}
                      className="text-xs bg-white px-2 py-1 rounded-full border"
                    >
                      {depPhase.icon} {depPhase.title}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Status indicator */}
          <div className="mt-3 pt-2 border-t border-gray-200">
            <div className={`text-xs ${style.text} font-medium`}>
              {config.confidence}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // New phase form
  const NewPhaseForm = () => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      age: currentAge + 10,
      cost: 50000,
      category: 'experience',
      icon: '✨'
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      addDreamPhase(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Add Future Dream Phase</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dream Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Mountain Cabin, Art Studio"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows="3"
                placeholder="Describe this dream phase..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Age
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min={currentAge + 1}
                  max={75}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Cost
                </label>
                <input
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, cost: parseInt(e.target.value) }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="1000"
                  step="5000"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {Object.entries(phaseCategories).map(([key, category]) => (
                  <option key={key} value={key}>{category.name}</option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Add Dream Phase
              </button>
              <button
                type="button"
                onClick={() => setShowAddPhase(false)}
                className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl p-8 ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Sparkles className="w-8 h-8 text-purple-500" />
          <h2 className="text-2xl font-bold text-gray-800">Your Dream Evolution</h2>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Dreams naturally evolve and build upon each other. See how your someday life might unfold, 
          with each phase opening new possibilities for the next chapter.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-6 mb-8 p-4 bg-gray-50 rounded-lg">
        {Object.entries(statusConfig).map(([status, config]) => (
          <div key={status} className="flex items-center space-x-2">
            <div className={`w-3 h-3 bg-blue-500 rounded-full ${config.opacity} ${
              status === 'active' ? '' : 'border border-dashed border-blue-300'
            }`}></div>
            <span className="text-sm text-gray-600">{config.label}</span>
          </div>
        ))}
      </div>

      {/* Timeline Container */}
      <div className="relative mb-8" ref={timelineRef}>
        {/* Timeline line */}
        <div className="relative h-32 mb-8">
          <div className="absolute top-8 left-12 right-12 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full"></div>
          
          {/* Age markers */}
          <TimelineMarker age={currentAge} label="Today" isHighlight={true} />
          {Array.from({ length: Math.floor(totalYears / 5) }, (_, i) => {
            const age = startAge + (i + 1) * 5;
            if (age < endAge && age !== currentAge) {
              return <TimelineMarker key={age} age={age} label={`Age ${age}`} />;
            }
            return null;
          })}
          <TimelineMarker age={endAge} label="Future" isHighlight={true} />
          
          {/* Dream phase cards */}
          {dreamPhases.map(phase => (
            <DreamPhaseCard key={phase.id} phase={phase} />
          ))}
        </div>
      </div>

      {/* Add Phase Button */}
      <div className="text-center mb-8">
        <button
          onClick={() => setShowAddPhase(true)}
          className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2 mx-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Add Future Dream Phase</span>
        </button>
      </div>

      {/* Evolution Insights */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-purple-500" />
          <span>How Dreams Build Upon Each Other</span>
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl mb-2">🏡</div>
            <h5 className="font-semibold text-gray-800 mb-2">Foundation Phase</h5>
            <p className="text-sm text-gray-600">
              Your primary dream creates the foundation and financial stability for future phases.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl mb-2">🔗</div>
            <h5 className="font-semibold text-gray-800 mb-2">Connected Growth</h5>
            <p className="text-sm text-gray-600">
              Each phase naturally enables the next, creating compound opportunities over time.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl mb-2">✨</div>
            <h5 className="font-semibold text-gray-800 mb-2">Flexible Evolution</h5>
            <p className="text-sm text-gray-600">
              Dreams can adapt and change - what matters is having a vision that grows with you.
            </p>
          </div>
        </div>
      </div>

      {/* Phase Details Modal */}
      {selectedPhase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Dream Phase Details</h3>
              <button
                onClick={() => setSelectedPhase(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{selectedPhase.icon}</span>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">{selectedPhase.title}</h4>
                  <p className="text-sm text-gray-600">{selectedPhase.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-500">Target Age</div>
                  <div className="text-lg font-bold text-gray-800">{selectedPhase.age}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-500">Investment</div>
                  <div className="text-lg font-bold text-gray-800">
                    ${selectedPhase.cost.toLocaleString()}
                  </div>
                </div>
              </div>

              {selectedPhase.details.location && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-500 mb-1">Location</div>
                  <div className="text-gray-800">{selectedPhase.details.location}</div>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-500 mb-2">Confidence Level</div>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 bg-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${selectedPhase.details.confidence}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {selectedPhase.details.confidence}%
                  </span>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setSelectedPhase(null)}
                  className="flex-1 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Close
                </button>
                {selectedPhase.status !== 'active' && (
                  <button
                    onClick={() => removeDreamPhase(selectedPhase.id)}
                    className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Phase Form Modal */}
      {showAddPhase && <NewPhaseForm />}
    </div>
  );
};

export default DreamEvolutionTimeline;
