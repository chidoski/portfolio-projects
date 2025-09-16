import { useState } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'

/**
 * Demo component showcasing the animated mesh gradient backgrounds
 * This demonstrates the different gradient styles and animation controls
 */
function MeshGradientDemo() {
  const [currentGradient, setCurrentGradient] = useState<'subtle' | 'vibrant'>('subtle')
  const [isAnimationPaused, setIsAnimationPaused] = useState(false)

  const gradientOptions = [
    {
      id: 'subtle',
      name: 'Subtle Mesh (Current)',
      description: 'Soft purple-blue gradient with 20s animation cycle',
      className: 'mesh-gradient-subtle'
    },
    {
      id: 'vibrant',
      name: 'Vibrant Mesh',
      description: 'More pronounced colors with dynamic movement',
      className: 'mesh-gradient-bg'
    }
  ]

  return (
    <div className={`min-h-screen ${currentGradient === 'subtle' ? 'mesh-gradient-subtle' : 'mesh-gradient-bg'} relative overflow-hidden`}>
      {/* Overlay for content readability */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]"></div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="card p-8 backdrop-blur-sm bg-white/90 border border-white/20 shadow-2xl">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Animated Mesh Gradient Background
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Subtle purple-blue hues shifting over 20 seconds in an infinite loop
            </p>

            {/* Gradient Controls */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Gradient Options</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gradientOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setCurrentGradient(option.id as 'subtle' | 'vibrant')}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      currentGradient === option.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900">{option.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Animation Controls */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Animation Controls</h2>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setIsAnimationPaused(!isAnimationPaused)}
                  className="btn-primary px-6 py-3 flex items-center gap-2"
                >
                  {isAnimationPaused ? (
                    <>
                      <Play className="w-4 h-4" />
                      Resume Animation
                    </>
                  ) : (
                    <>
                      <Pause className="w-4 h-4" />
                      Pause Animation
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => {
                    // Force restart animation by toggling classes
                    const element = document.querySelector('.mesh-gradient-subtle, .mesh-gradient-bg')
                    if (element instanceof HTMLElement) {
                      element.style.animation = 'none'
                      element.offsetHeight // Trigger reflow
                      element.style.animation = 'meshGradient 20s ease-in-out infinite'
                    }
                  }}
                  className="btn-secondary px-6 py-3 flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restart Animation
                </button>
              </div>
            </div>

            {/* Technical Details */}
            <div className="card p-6 bg-gray-50 border border-gray-200">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Technical Implementation</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Animation Properties</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>Duration:</strong> 20 seconds</li>
                    <li>• <strong>Timing:</strong> ease-in-out</li>
                    <li>• <strong>Loop:</strong> Infinite</li>
                    <li>• <strong>Background Size:</strong> 300% × 300%</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Performance Optimizations</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>Hardware Acceleration:</strong> translateZ(0)</li>
                    <li>• <strong>Will-change:</strong> background-position</li>
                    <li>• <strong>Backface Visibility:</strong> hidden</li>
                    <li>• <strong>Opacity:</strong> 0.8 for subtlety</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Color Palette */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Color Palette</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { color: 'var(--primary-color)', name: 'Professional Teal' },
                  { color: 'var(--secondary-color)', name: 'Light Background' },
                  { color: 'var(--accent-color)', name: 'Coral Accent' },
                  { color: 'var(--success-green)', name: 'Success Green' },
                  { color: 'var(--text-primary)', name: 'Primary Text' },
                  { color: 'var(--text-secondary)', name: 'Secondary Text' }
                ].map(({ color, name }) => (
                  <div key={color} className="text-center">
                    <div 
                      className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
                      style={{ backgroundColor: color.startsWith('#') ? color : undefined, background: color.startsWith('var') ? color : undefined }}
                    ></div>
                    <p className="text-xs text-gray-600 mt-1">{name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Notice */}
          <div className="mt-6 card p-4 bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This mesh gradient animation uses CSS transforms and opacity changes 
              for optimal performance. The 20-second duration provides a subtle, non-distracting background effect.
            </p>
          </div>
        </div>
      </div>

      {/* Apply animation pause globally */}
      <style>{`
        ${isAnimationPaused ? '.mesh-gradient-subtle, .mesh-gradient-bg { animation-play-state: paused !important; }' : ''}
      `}</style>
    </div>
  )
}

export default MeshGradientDemo
