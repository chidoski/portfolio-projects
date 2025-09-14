import { useState } from 'react'
import { ArrowLeft, Clock, DollarSign, Tag, Sparkles } from 'lucide-react'
import { dreamTemplates } from '../data/dreamTemplates'

export default function QuickStart({ onSelectTemplate, onBack }) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [hoveredTemplate, setHoveredTemplate] = useState(null)

  // Get unique categories from templates
  const categories = ['all', ...new Set(dreamTemplates.map(template => template.category))]

  // Filter templates by selected category
  const filteredTemplates = selectedCategory === 'all' 
    ? dreamTemplates 
    : dreamTemplates.filter(template => template.category === selectedCategory)

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatTimeframe = (months) => {
    if (months < 12) {
      return `${months} month${months !== 1 ? 's' : ''}`
    } else {
      const years = Math.floor(months / 12)
      const remainingMonths = months % 12
      if (remainingMonths === 0) {
        return `${years} year${years !== 1 ? 's' : ''}`
      } else {
        return `${years}y ${remainingMonths}m`
      }
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      'Travel': 'blue',
      'Financial Security': 'green',
      'Life Events': 'pink',
      'Transportation': 'purple',
      'Home Improvement': 'orange',
      'Business': 'indigo'
    }
    return colors[category] || 'gray'
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </button>
          
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-pink-500 to-purple-400 p-4 rounded-full hover-glow">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Quick Start Your Dream
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose from our popular dream templates to get started instantly. 
              Each template comes pre-configured with realistic amounts and timeframes.
            </p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {category === 'all' ? 'All Categories' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredTemplates.map((template, index) => {
            const categoryColor = getCategoryColor(template.category)
            
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-105"
                onMouseEnter={() => setHoveredTemplate(index)}
                onMouseLeave={() => setHoveredTemplate(null)}
                onClick={() => {
                  // Navigate with URL parameters for template data
                  const templateParams = new URLSearchParams({
                    template: encodeURIComponent(JSON.stringify(template))
                  })
                  
                  // Also support individual parameters for easier URL manipulation
                  templateParams.set('title', encodeURIComponent(template.title))
                  templateParams.set('amount', template.amount.toString())
                  templateParams.set('timeframe', template.suggestedTimeframe.toString())
                  templateParams.set('category', template.category)
                  
                  if (template.description) {
                    templateParams.set('description', encodeURIComponent(template.description))
                  }
                  if (template.imageUrl) {
                    templateParams.set('imageUrl', encodeURIComponent(template.imageUrl))
                  }
                  
                  // Navigate to dream creator with template data
                  window.history.pushState(
                    { templateData: template }, 
                    '', 
                    `/dream-creator?${templateParams.toString()}`
                  )
                  
                  // Call the callback to handle the navigation
                  onSelectTemplate(template)
                }}
              >
                {/* Template Image */}
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                  <img
                    src={template.imageUrl}
                    alt={template.title}
                    className="w-full h-full object-cover transition-transform duration-300"
                    style={{
                      transform: hoveredTemplate === index ? 'scale(1.1)' : 'scale(1)'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                  {/* Fallback gradient */}
                  <div 
                    className={`absolute inset-0 bg-gradient-to-br from-${categoryColor}-400 to-${categoryColor}-600 flex items-center justify-center`}
                    style={{ display: 'none' }}
                  >
                    <Sparkles className="w-12 h-12 text-white opacity-50" />
                  </div>
                  
                  {/* Category Badge */}
                  <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium bg-${categoryColor}-500 text-white`}>
                    <Tag className="w-3 h-3 inline mr-1" />
                    {template.category}
                  </div>
                </div>

                {/* Template Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {template.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {template.description}
                  </p>

                  {/* Template Stats */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="w-4 h-4 mr-2" />
                        <span className="text-sm">Target Amount</span>
                      </div>
                      <span className="font-bold text-gray-900">
                        {formatCurrency(template.amount)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span className="text-sm">Timeframe</span>
                      </div>
                      <span className="font-bold text-gray-900">
                        {formatTimeframe(template.suggestedTimeframe)}
                      </span>
                    </div>

                    {/* Quick calculation preview */}
                    <div className="pt-3 border-t border-gray-100">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Save approximately</p>
                        <p className="text-lg font-bold text-blue-600">
                          ${Math.round(template.amount / (template.suggestedTimeframe * 30))} per day
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Hover Effect */}
                  <div className={`mt-4 transition-all duration-300 ${
                    hoveredTemplate === index ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-2'
                  }`}>
                    <button className="w-full btn-primary py-2 text-sm">
                      Start This Dream
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Sparkles className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No templates found
            </h3>
            <p className="text-gray-600">
              Try selecting a different category or go back to all templates.
            </p>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center py-8 border-t border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Don't see your dream here?
          </h3>
          <p className="text-gray-600 mb-4">
            Create a custom dream with your own goals and timeline.
          </p>
          <button
            onClick={() => {
              // Navigate to dream creator without template data
              window.history.pushState({}, '', '/dream-creator')
              onSelectTemplate(null)
            }}
            className="btn-secondary px-6 py-3"
          >
            Create Custom Dream
          </button>
        </div>
      </div>
    </div>
  )
}
