import React, { useState } from 'react';
import { Bug, Zap } from 'lucide-react';

/**
 * Test component to trigger various types of errors for testing the ErrorBoundary
 * This component is only meant for development/testing purposes
 */
const ErrorBoundaryTest = () => {
  const [shouldError, setShouldError] = useState(false);
  
  // This will trigger a render error
  if (shouldError) {
    throw new Error('Test error: This is a simulated component crash for testing the ErrorBoundary');
  }

  const triggerAsyncError = () => {
    // Async errors won't be caught by ErrorBoundary, but we can log them
    setTimeout(() => {
      throw new Error('Test async error: This simulates an async operation failure');
    }, 100);
  };

  const triggerTypeError = () => {
    // This will trigger an error during render
    const obj = null;
    // This will cause a TypeError when the component re-renders
    setShouldError(true);
    console.log(obj.nonExistentProperty); // This line won't execute due to the error above
  };

  const triggerLocalStorageError = () => {
    try {
      // Try to access localStorage in a way that might fail
      const largeData = 'x'.repeat(10000000); // 10MB string
      localStorage.setItem('test-large-data', largeData);
    } catch (error) {
      console.error('LocalStorage error:', error);
      throw new Error('LocalStorage quota exceeded or access denied');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center mb-4">
        <Bug className="w-6 h-6 text-red-500 mr-2" />
        <h2 className="text-xl font-bold text-gray-800">ErrorBoundary Test</h2>
      </div>
      
      <p className="text-gray-600 mb-6 text-sm">
        This component is for testing the ErrorBoundary. Click any button to trigger different types of errors.
      </p>

      <div className="space-y-3">
        <button
          onClick={triggerTypeError}
          className="w-full flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <Zap className="w-4 h-4 mr-2" />
          Trigger Render Error
        </button>

        <button
          onClick={triggerAsyncError}
          className="w-full flex items-center justify-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Zap className="w-4 h-4 mr-2" />
          Trigger Async Error (Console Only)
        </button>

        <button
          onClick={triggerLocalStorageError}
          className="w-full flex items-center justify-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          <Zap className="w-4 h-4 mr-2" />
          Trigger LocalStorage Error
        </button>
      </div>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-xs text-yellow-800">
          <strong>Note:</strong> These are intentional errors for testing. The ErrorBoundary should catch render errors and display a recovery screen.
        </p>
      </div>
    </div>
  );
};

export default ErrorBoundaryTest;
