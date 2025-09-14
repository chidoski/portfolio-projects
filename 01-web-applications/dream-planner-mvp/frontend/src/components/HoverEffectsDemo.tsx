import { useState } from 'react'
import { Sparkles, Heart, Star, Zap, Target, Rocket } from 'lucide-react'

/**
 * Demo component showcasing all available hover effects
 * This demonstrates the various interactive hover animations
 */
function HoverEffectsDemo() {
  const [selectedEffect, setSelectedEffect] = useState<string>('')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Interactive Hover Effects
          </h1>
          <p className="text-xl text-gray-600">
            Experience smooth 200ms transitions with 1.02x scale effects
          </p>
        </div>

        {/* Buttons Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Buttons</h2>
          <p className="text-sm text-gray-600 mb-4">
            Click and hold to see the pressed state animation (scale to 0.98 + 10% brightness reduction)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="btn-primary px-6 py-3">
              Primary Button
            </button>
            <button className="btn-secondary px-6 py-3">
              Secondary Button
            </button>
            <button className="btn-primary px-6 py-3" disabled>
              Disabled Button
            </button>
          </div>
        </section>

        {/* Cards Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Interactive Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
              className="card-interactive p-6 text-center"
              onClick={() => setSelectedEffect('basic-card')}
            >
              <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 hover-glow">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Basic Card</h3>
              <p className="text-gray-600 text-sm">
                Standard interactive card with hover scale
              </p>
            </div>

            <div 
              className="dream-card text-center"
              onClick={() => setSelectedEffect('dream-card')}
            >
              <div className="bg-purple-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Dream Card</h3>
              <p className="text-gray-600 text-sm">
                Enhanced card with gradient background
              </p>
            </div>

            <div 
              className="card p-6 text-center hover-lift"
              onClick={() => setSelectedEffect('lift-card')}
            >
              <div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Lift Card</h3>
              <p className="text-gray-600 text-sm">
                Card with lift animation and enhanced shadow
              </p>
            </div>
          </div>
        </section>

        {/* Input Elements */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Form Elements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Hover-Enhanced Inputs</h3>
              <div className="space-y-4">
                <div>
                  <label className="label block mb-2">Email</label>
                  <input 
                    className="input w-full" 
                    type="email" 
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="label block mb-2">Message</label>
                  <textarea 
                    className="input w-full h-24" 
                    placeholder="Type your message..."
                  ></textarea>
                </div>
                <button className="btn-primary w-full py-3">
                  Submit Form
                </button>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Utility Classes</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg hover-scale">
                  <code>.hover-scale</code> - Basic scale effect
                </div>
                <div className="p-4 bg-gray-50 rounded-lg hover-lift">
                  <code>.hover-lift</code> - Lift with shadow
                </div>
                <div className="p-4 bg-gray-50 rounded-lg hover-glow">
                  <code>.hover-glow</code> - Scale with glow effect
                </div>
                <div className="p-4 bg-gray-50 rounded-lg interactive-hover">
                  <code>.interactive-hover</code> - Base interactive class
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Icon Gallery */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Interactive Icons</h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[
              { icon: Heart, color: 'text-red-500', bg: 'bg-red-100' },
              { icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-100' },
              { icon: Zap, color: 'text-blue-500', bg: 'bg-blue-100' },
              { icon: Target, color: 'text-green-500', bg: 'bg-green-100' },
              { icon: Rocket, color: 'text-purple-500', bg: 'bg-purple-100' },
              { icon: Sparkles, color: 'text-pink-500', bg: 'bg-pink-100' },
            ].map(({ icon: Icon, color, bg }, index) => (
              <div 
                key={index}
                className={`${bg} p-4 rounded-xl flex items-center justify-center hover-glow`}
                onClick={() => setSelectedEffect(`icon-${index}`)}
              >
                <Icon className={`w-8 h-8 ${color}`} />
              </div>
            ))}
          </div>
        </section>

        {/* Status Display */}
        {selectedEffect && (
          <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border">
            <p className="text-sm text-gray-600">
              Last clicked: <span className="font-semibold">{selectedEffect}</span>
            </p>
          </div>
        )}

        {/* Documentation */}
        <section className="card p-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Implementation Notes</h2>
          <div className="prose prose-gray max-w-none">
            <ul className="space-y-2 text-gray-600">
              <li><strong>Duration:</strong> All hover effects use 200ms transitions</li>
              <li><strong>Hover Scale:</strong> Interactive elements scale to 1.02 on hover</li>
              <li><strong>Pressed State:</strong> Elements scale to 0.98 + 10% brightness reduction when clicked</li>
              <li><strong>Shadow Updates:</strong> Dynamic shadow changes based on interaction state</li>
              <li><strong>Easing:</strong> Uses ease-out timing for smooth animations</li>
              <li><strong>Hardware Acceleration:</strong> Utilizes transform properties for optimal performance</li>
              <li><strong>Accessibility:</strong> All interactive elements have proper cursor pointer states</li>
              <li><strong>Button Types:</strong> Primary, secondary, and disabled states all have unique pressed animations</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}

export default HoverEffectsDemo
