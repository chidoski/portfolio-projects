import React from 'react';
import { AlertTriangle, RefreshCw, Home, Trash2 } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isClearing: false
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Optional: Log to external error reporting service
    // logErrorToService(error, errorInfo);
  }

  clearAppData = () => {
    this.setState({ isClearing: true });
    
    try {
      // Clear all localStorage data
      const keysToRemove = [
        'financialProfile',
        'dreamPlannerState',
        'userPreferences',
        'somedayLifeData'
      ];
      
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (storageError) {
          console.warn(`Could not remove ${key} from localStorage:`, storageError);
        }
      });

      // Clear session storage as well
      try {
        sessionStorage.clear();
      } catch (sessionError) {
        console.warn('Could not clear sessionStorage:', sessionError);
      }

      console.log('App data cleared successfully');
      
      // Reset error boundary state and reload the page
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
    } catch (error) {
      console.error('Error clearing app data:', error);
      // If clearing fails, just reload the page
      window.location.reload();
    }
  };

  restartApp = () => {
    // Reset the error boundary state without clearing data
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isClearing: false
    });
  };

  goToHome = () => {
    // Navigate to home page
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>

            {/* Main Error Message */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600 text-lg mb-4">
                We encountered an unexpected error while running the Dream Planner. 
                Don't worry - your data is safe and we can help you get back on track.
              </p>
              
              {/* Error details for development */}
              {isDevelopment && this.state.error && (
                <details className="mt-4 p-4 bg-gray-100 rounded-lg text-left">
                  <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
                    Technical Details (Development Mode)
                  </summary>
                  <div className="text-sm text-gray-600 font-mono">
                    <p className="mb-2">
                      <strong>Error:</strong> {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <pre className="whitespace-pre-wrap text-xs overflow-auto max-h-40">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              {/* Primary Recovery Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={this.restartApp}
                  disabled={this.state.isClearing}
                  className="flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Try Again
                </button>

                <button
                  onClick={this.goToHome}
                  disabled={this.state.isClearing}
                  className="flex items-center justify-center px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Go to Home
                </button>
              </div>

              {/* Advanced Recovery Option */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-3 text-center">
                  If the problem persists, you can reset the app:
                </p>
                <button
                  onClick={this.clearAppData}
                  disabled={this.state.isClearing}
                  className="w-full flex items-center justify-center px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {this.state.isClearing ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Clearing Data...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5 mr-2" />
                      Clear All Data & Reset App
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  This will remove all saved data and restart the app fresh
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500">
                If this error continues to occur, please{' '}
                <a 
                  href="mailto:support@dreamplanner.com" 
                  className="text-blue-500 hover:text-blue-700 underline"
                >
                  contact support
                </a>
                {' '}with details about what you were doing when the error occurred.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
