import { useState, useEffect } from 'react'

interface UseCountUpOptions {
  end: number
  duration?: number
  delay?: number
  startOnTrigger?: boolean
}

export function useCountUp({ 
  end, 
  duration = 2000, 
  delay = 0,
  startOnTrigger = false 
}: UseCountUpOptions) {
  const [count, setCount] = useState(0)
  const [isTriggered, setIsTriggered] = useState(!startOnTrigger)

  const trigger = () => {
    if (startOnTrigger && !isTriggered) {
      setIsTriggered(true)
    }
  }

  useEffect(() => {
    if (!isTriggered) return

    const startTime = Date.now() + delay
    const startValue = 0

    const animate = () => {
      const now = Date.now()
      const elapsed = now - startTime

      if (elapsed < 0) {
        requestAnimationFrame(animate)
        return
      }

      if (elapsed >= duration) {
        setCount(end)
        return
      }

      // Easing function for smooth animation (ease-out)
      const progress = elapsed / duration
      const easeOutProgress = 1 - Math.pow(1 - progress, 3)
      const currentValue = Math.floor(startValue + (end - startValue) * easeOutProgress)
      
      setCount(currentValue)
      requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }, [end, duration, delay, isTriggered])

  return { count, trigger }
}
