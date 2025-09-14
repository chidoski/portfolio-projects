import { useState, useEffect } from 'react'
import { Plus, Target, TrendingUp, Calendar, DollarSign } from 'lucide-react'
import { dreamApi, Dream } from '../services/api'
import { format, differenceInDays } from 'date-fns'
import ProgressBar from './ProgressBar'

interface DreamDashboardProps {
  onAddDream: () => void
}

export default function DreamDashboard({ onAddDream }: DreamDashboardProps) {
  const [dreams, setDreams] = useState<Dream[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDreams()
  }, [])

  const loadDreams = async () => {
    try {
      const fetchedDreams = await dreamApi.getDreams()
      setDreams(fetchedDreams)
    } catch (err) {
      setError('Failed to load dreams')
      console.error('Dreams loading error:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatCurrencyDetailed = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const totalTargetAmount = dreams.reduce((sum, dream) => sum + dream.target_amount, 0)
  const totalSaved = dreams.reduce((sum, dream) => sum + dream.current_saved, 0)
  const totalDailySavings = dreams.reduce((sum, dream) => sum + dream.daily_amount, 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dreams...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Your Dreams</h1>
            <p className="text-gray-600 mt-2">Track your progress and stay motivated</p>
          </div>
          <button
            onClick={onAddDream}
            className="btn-primary px-6 py-3 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Dream
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {dreams.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <div className="bg-gray-100 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <Target className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Dreams Yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start by creating your first dream. Turn that big goal into small daily habits!
            </p>
            <button
              onClick={onAddDream}
              className="btn-primary px-8 py-3 text-lg"
            >
              Create Your First Dream
            </button>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid md:grid-cols-5 gap-6 mb-8">
              <div className="card p-6">
                <div className="flex items-center">
                  <Target className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Total Dreams</p>
                    <p className="text-2xl font-bold text-gray-900">{dreams.length}</p>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center">
                  <DollarSign className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalTargetAmount)}</p>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center">
                  <DollarSign className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Total Saved</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSaved)}</p>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Daily Savings</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrencyDetailed(totalDailySavings)}</p>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center">
                  <Calendar className="w-8 h-8 text-orange-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Progress</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dreams.length > 0 ? Math.round(dreams.reduce((sum, dream) => sum + dream.progress_percentage, 0) / dreams.length) : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dreams Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dreams.map((dream) => (
                <DreamCard key={dream.id} dream={dream} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

interface DreamCardProps {
  dream: Dream
}

function DreamCard({ dream }: DreamCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatCurrencyDetailed = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const daysRemaining = differenceInDays(new Date(dream.target_date), new Date())
  const progressWidth = Math.min(100, dream.progress_percentage)

  const getCategoryColor = (category: string) => {
    const colors = {
      travel: 'blue',
      home: 'green',
      education: 'purple',
      family: 'red',
      freedom: 'yellow',
      lifestyle: 'indigo',
      health: 'pink'
    }
    return colors[category as keyof typeof colors] || 'gray'
  }

  const categoryColor = getCategoryColor(dream.category)

  return (
    <div className="dream-card">
      {/* Dream Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{dream.title}</h3>
          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full bg-${categoryColor}-100 text-${categoryColor}-700`}>
            {dream.category.charAt(0).toUpperCase() + dream.category.slice(1)}
          </span>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Target</p>
          <p className="font-bold text-gray-900">{formatCurrency(dream.target_amount)}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <ProgressBar 
          percentage={progressWidth}
          label="Progress"
          showPercentage={true}
          animationDuration={1200}
        />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-lg font-bold text-blue-600">{formatCurrencyDetailed(dream.daily_amount)}</p>
          <p className="text-xs text-blue-700">per day</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-lg font-bold text-green-600">{daysRemaining}</p>
          <p className="text-xs text-green-700">days left</p>
        </div>
      </div>

      {/* Comparison */}
      <div className="bg-gray-50 p-3 rounded-lg mb-4">
        <p className="text-sm text-gray-600">
          That's just <span className="font-semibold">{dream.comparisons.coffees.toFixed(1)} coffees</span> per day!
        </p>
      </div>

      {/* Target Date */}
      <div className="text-sm text-gray-500">
        <p>Target: {format(new Date(dream.target_date), 'MMM dd, yyyy')}</p>
      </div>

      {/* Achievement Status */}
      {dream.is_achievable ? (
        <div className="mt-3 flex items-center text-green-600 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          Totally achievable!
        </div>
      ) : (
        <div className="mt-3 flex items-center text-orange-600 text-sm">
          <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
          Ambitious goal
        </div>
      )}
    </div>
  )
}
