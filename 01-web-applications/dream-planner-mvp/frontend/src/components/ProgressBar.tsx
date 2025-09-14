import { useEffect, useState } from 'react'

interface ProgressBarProps {
  percentage: number
  label?: string
  showPercentage?: boolean
  className?: string
  animationDuration?: number
  height?: 'sm' | 'md' | 'lg'
}

export default function ProgressBar({ 
  percentage, 
  label, 
  showPercentage = true, 
  className = '',
  animationDuration = 1000,
  height = 'md'
}: ProgressBarProps) {
  const [animatedPercentage, setAnimatedPercentage] = useState(percentage)
  const [displayPercentage, setDisplayPercentage] = useState(Math.round(percentage))
  const [isInitialRender, setIsInitialRender] = useState(true)

  // Height mapping
  const heightClass = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3'
  }[height]

  useEffect(() => {
    const targetValue = Math.min(Math.max(percentage, 0), 100)
    
    // Skip animation on initial render - just set the value immediately
    if (isInitialRender) {
      setAnimatedPercentage(targetValue)
      setDisplayPercentage(Math.round(targetValue))
      setIsInitialRender(false)
      return
    }
    
    // Reset animation when percentage changes
    const startTime = Date.now()
    const startValue = animatedPercentage
    
    if (startValue === targetValue) return

    const animate = () => {
      const now = Date.now()
      const elapsed = now - startTime

      if (elapsed >= animationDuration) {
        setAnimatedPercentage(targetValue)
        setDisplayPercentage(targetValue)
        return
      }

      // Smooth easing function (ease-out cubic)
      const progress = elapsed / animationDuration
      const easeOutProgress = 1 - Math.pow(1 - progress, 3)
      
      const currentValue = startValue + (targetValue - startValue) * easeOutProgress
      setAnimatedPercentage(currentValue)
      setDisplayPercentage(Math.round(currentValue))
      
      requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }, [percentage, animationDuration, animatedPercentage, isInitialRender])

  // Determine text color based on completion
  const getTextColor = () => {
    if (displayPercentage >= 100) {
      return 'text-purple-600 font-bold'
    }
    return 'text-gray-600'
  }

  return (
    <div className={className}>
      {/* Header with label and percentage */}
      <div className="flex justify-between text-sm mb-2">
        {label && <span className="text-gray-600">{label}</span>}
        {showPercentage && (
          <span className={`transition-colors duration-300 ${getTextColor()}`}>
            {displayPercentage}% {displayPercentage >= 100 ? '🎉' : ''}
          </span>
        )}
      </div>
      
      {/* Progress bar */}
      <div className={`progress-bar ${heightClass}`}>
        <div 
          className="progress-fill" 
          style={{ 
            width: `${animatedPercentage}%`,
            transition: `width ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`
          }}
        />
      </div>
    </div>
  )
}
