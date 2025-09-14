import { useEffect, useState, useRef } from 'react'

interface PageTransitionProps {
  children: React.ReactNode
  /**
   * Unique key that triggers the transition when changed
   * This should change whenever you want to trigger a new page transition
   */
  transitionKey: string | number
  /**
   * Duration of the transition in milliseconds
   * @default 400
   */
  duration?: number
  /**
   * Additional CSS classes to apply to the wrapper
   */
  className?: string
  /**
   * Animation easing function
   * @default 'ease-out'
   */
  easing?: 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear'
}

/**
 * PageTransition - A smooth page transition wrapper component
 * 
 * Features:
 * - Fade in/out effect (opacity 0 to 1)
 * - Subtle scale animation (0.98 to 1.0)
 * - Configurable duration (default 400ms)
 * - Smooth transitions with proper timing
 * - Hardware accelerated animations
 * - Automatic trigger on key change
 * 
 * Usage:
 * ```tsx
 * <PageTransition transitionKey={currentPage}>
 *   <YourPageContent />
 * </PageTransition>
 * ```
 */
function PageTransition({ 
  children, 
  transitionKey, 
  duration = 400,
  className = '',
  easing = 'ease-out'
}: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [displayChildren, setDisplayChildren] = useState(children)
  const previousKey = useRef(transitionKey)
  const isFirstMount = useRef(true)

  useEffect(() => {
    // Skip transition on first mount
    if (isFirstMount.current) {
      isFirstMount.current = false
      setDisplayChildren(children)
      return
    }

    // Only transition if the key actually changed
    if (previousKey.current === transitionKey) {
      setDisplayChildren(children)
      return
    }

    previousKey.current = transitionKey

    // Start fade out
    setIsVisible(false)
    
    // After fade out completes, update children and fade in
    const timer = setTimeout(() => {
      setDisplayChildren(children)
      // Small delay to ensure DOM update before fade in
      requestAnimationFrame(() => {
        setIsVisible(true)
      })
    }, duration / 2)

    return () => clearTimeout(timer)
  }, [transitionKey, children, duration])

  const transitionStyle = {
    transitionDuration: `${duration}ms`,
    transitionTimingFunction: easing,
    transitionProperty: 'opacity, transform',
    opacity: isVisible ? 1 : 0,
    transform: `scale(${isVisible ? 1 : 0.98}) translateZ(0)`, // translateZ for hardware acceleration
    willChange: 'opacity, transform', // Optimize for animations
  }

  return (
    <div 
      className={`w-full ${className}`}
      style={transitionStyle}
    >
      {displayChildren}
    </div>
  )
}

export default PageTransition
