import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { SessionProvider } from './state/SessionContext';
import { router } from './routes';

function App() {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Top bar */}
        <header className="bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Bravax Secure Link
            </h1>
          </div>
        </header>
        
        {/* Router content */}
        <RouterProvider router={router} />
      </div>
    </SessionProvider>
  );
}

export default App;