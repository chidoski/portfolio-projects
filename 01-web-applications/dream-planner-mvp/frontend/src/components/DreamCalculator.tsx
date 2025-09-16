import { useState, useEffect } from 'react'
import { ArrowLeft, Calculator, Coffee, Popcorn, Wifi, UtensilsCrossed } from 'lucide-react'
import { dreamApi, CalculationResponse } from '../services/api'
import { format, addDays } from 'date-fns'

interface DreamCalculatorProps {
  onBack: () => void
  isModal?: boolean
}

export default function DreamCalculator({ onBack, isModal = false }: DreamCalculatorProps) {
  const [targetAmount, setTargetAmount] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [currentSaved, setCurrentSaved] = useState('')
  const [result, setResult] = useState<CalculationResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Set default date to 1 year from now
  useEffect(() => {
    const oneYearFromNow = addDays(new Date(), 365)
    setTargetDate(format(oneYearFromNow, 'yyyy-MM-dd'))
  }, [])

  const handleCalculate = async () => {
    if (!targetAmount || !targetDate) {
      setError('Please fill in target amount and date')
      return
    }

    setLoading(true)
    setError('')

    try {
      const calculation = await dreamApi.calculateDream({
        target_amount: parseFloat(targetAmount),
        target_date: new Date(targetDate).toISOString(),
        current_saved: currentSaved ? parseFloat(currentSaved) : 0
      })
      setResult(calculation)
    } catch (err) {
      setError('Failed to calculate. Please check your inputs.')
      console.error('Calculation error:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  return (
    <div className={isModal ? "" : "min-h-screen p-4"}>
      <div className={isModal ? "" : "max-w-4xl mx-auto"}>
        {/* Header */}
        {!isModal && (
          <div className="flex items-center mb-8">
            <button
              onClick={onBack}
              className="btn-secondary p-2 mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dream Calculator</h1>
              <p className="text-gray-600">See how achievable your dreams really are</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="card p-6">
            <div className="flex items-center mb-6">
              <Calculator className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold">Calculate Your Dream</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label mb-2 block">
                  What's your dream worth?
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="50000"
                    className="input pl-8"
                    min="1"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="label mb-2 block">
                  When do you want to achieve it?
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="input"
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>

              <div>
                <label className="label mb-2 block">
                  How much have you saved already? (optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={currentSaved}
                    onChange={(e) => setCurrentSaved(e.target.value)}
                    placeholder="0"
                    className="input pl-8"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleCalculate}
                disabled={loading}
                className="btn-primary w-full py-3 text-lg disabled:opacity-50"
              >
                {loading ? 'Calculating...' : 'Calculate My Dream'}
              </button>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-6">Your Dream Breakdown</h2>
              
              {/* Motivation Message */}
              <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-4 rounded-lg mb-6">
                <p className="text-lg font-medium">{result.motivation}</p>
              </div>

              {/* Amount Breakdown */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(result.daily_amount)}
                  </div>
                  <div className="text-sm text-blue-700">per day</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(result.weekly_amount)}
                  </div>
                  <div className="text-sm text-purple-700">per week</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(result.monthly_amount)}
                  </div>
                  <div className="text-sm text-green-700">per month</div>
                </div>
              </div>

              {/* Comparisons */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">That's equivalent to:</h3>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Coffee className="w-5 h-5 text-orange-600 mr-2" />
                    <span>Coffees per day</span>
                  </div>
                  <span className="font-semibold">{result.comparisons.coffees_per_day}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <UtensilsCrossed className="w-5 h-5 text-green-600 mr-2" />
                    <span>Lunches per week</span>
                  </div>
                  <span className="font-semibold">{result.comparisons.lunches_per_week}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Popcorn className="w-5 h-5 text-red-600 mr-2" />
                    <span>Movie tickets</span>
                  </div>
                  <span className="font-semibold">{result.comparisons.movie_tickets} per day</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Wifi className="w-5 h-5 text-blue-600 mr-2" />
                    <span>Streaming services</span>
                  </div>
                  <span className="font-semibold">{result.comparisons.streaming_services} per month</span>
                </div>
              </div>

              {/* Timeline Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">
                  <p><strong>{result.days_remaining}</strong> days to reach your goal</p>
                  <p><strong>{formatCurrency(result.amount_remaining)}</strong> left to save</p>
                  {result.is_achievable ? (
                    <p className="text-green-600 font-medium mt-2">✓ This goal is definitely achievable!</p>
                  ) : (
                    <p className="text-orange-600 font-medium mt-2">⚠ This is ambitious - consider adjusting your timeline</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
