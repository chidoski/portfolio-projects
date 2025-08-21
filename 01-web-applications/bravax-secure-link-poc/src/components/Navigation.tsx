import { Link, useLocation } from 'react-router-dom';

export default function Navigation() {
  const location = useLocation();
  
  // Don't show navigation on the home page
  if (location.pathname === '/' || location.pathname === '/intercepted') {
    return null;
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 py-2">
        <div className="flex items-center justify-between">
          <Link 
            to="/"
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
          >
            ← Back to Home
          </Link>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <Link 
              to="/mailbox"
              className="hover:text-gray-700 transition-colors"
            >
              Mailbox
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
