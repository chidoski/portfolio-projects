import React from 'react';
import { useSearchParams } from 'react-router-dom';

export default function ErrorPage() {
  const [searchParams] = useSearchParams();
  const errorCode = searchParams.get('code') || 'Unknown';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <div className="mb-4 text-6xl text-red-500">⚠️</div>
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Error</h1>
          <p className="text-gray-600">
            Error Code: <span className="font-mono font-semibold">{errorCode}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
