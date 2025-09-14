export default function FloatingParticles({ count = 8 }: { count?: number }) {
  // Create static particles with staggered delays for fluid animation
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 5 + (i * 12) % 90, // Better spread across screen
    size: 6 + Math.random() * 3, // 6-9px diameter
    duration: 15 + Math.random() * 10, // 15-25 seconds for smoother movement
    delay: i * 3, // 3 second staggered delays
    // Alternate between peach and light blue
    color: i % 2 === 0 
      ? 'linear-gradient(135deg, #fbbf24, #f97316)' // Peach gradient (amber to orange)
      : 'linear-gradient(135deg, #60a5fa, #3b82f6)', // Light blue gradient
  }))

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full animate-float-up"
          style={{
            left: `${particle.x}%`,
            bottom: '-10px',
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: particle.color,
            opacity: 0.4,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
          }}
        />
      ))}
    </div>
  )
}
