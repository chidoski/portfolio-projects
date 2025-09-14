import { useState } from 'react'
import PageTransition from './PageTransition'

/**
 * Demo component to showcase the PageTransition component
 * This demonstrates how smooth page transitions work with different content
 */
function TransitionDemo() {
  const [currentPage, setCurrentPage] = useState<'home' | 'about' | 'contact'>('home')

  const pages = {
    home: (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome Home</h1>
          <p className="text-xl text-gray-600 mb-8">Experience smooth page transitions</p>
          <div className="space-x-4">
            <button
              onClick={() => setCurrentPage('about')}
              className="btn-primary px-6 py-3"
            >
              About Us
            </button>
            <button
              onClick={() => setCurrentPage('contact')}
              className="btn-secondary px-6 py-3"
            >
              Contact
            </button>
          </div>
        </div>
      </div>
    ),
    about: (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100">
        <div className="text-center max-w-2xl mx-auto p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Us</h1>
          <p className="text-xl text-gray-600 mb-8">
            We create beautiful, smooth transitions that enhance user experience.
            Notice how this page fades in with a subtle scale animation.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => setCurrentPage('home')}
              className="btn-secondary px-6 py-3"
            >
              Home
            </button>
            <button
              onClick={() => setCurrentPage('contact')}
              className="btn-primary px-6 py-3"
            >
              Contact
            </button>
          </div>
        </div>
      </div>
    ),
    contact: (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600 mb-8">Get in touch with our team</p>
          <div className="card-interactive max-w-md mx-auto p-6">
            <form className="space-y-4">
              <div>
                <label className="label block mb-2">Name</label>
                <input className="input w-full" placeholder="Your name" />
              </div>
              <div>
                <label className="label block mb-2">Email</label>
                <input className="input w-full" type="email" placeholder="your@email.com" />
              </div>
              <div>
                <label className="label block mb-2">Message</label>
                <textarea className="input w-full h-24" placeholder="Your message..."></textarea>
              </div>
              <button type="submit" className="btn-primary w-full py-3">
                Send Message
              </button>
            </form>
          </div>
          <div className="mt-8 space-x-4">
            <button
              onClick={() => setCurrentPage('home')}
              className="btn-secondary px-6 py-3"
            >
              Home
            </button>
            <button
              onClick={() => setCurrentPage('about')}
              className="btn-secondary px-6 py-3"
            >
              About
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <PageTransition transitionKey={currentPage} duration={400}>
      {pages[currentPage]}
    </PageTransition>
  )
}

export default TransitionDemo
