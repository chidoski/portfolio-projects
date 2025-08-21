import React from 'react';
import { useNavigate } from 'react-router-dom';
import { issueMagicLink, issueTempLink } from '../services/LinkService';

export default function InterceptedEmail() {
  const navigate = useNavigate();

  const handleMagicLowClick = () => {
    issueMagicLink("msg-low", "AP_Manager", "user@buyer.com");
    navigate("/mailbox");
  };

  const handleTempMediumClick = () => {
    issueTempLink("msg-med", "ap@buyer.com");
    navigate("/mailbox");
  };

  const handleMagicHighClick = () => {
    issueMagicLink("msg-high", "Controller", "controller@buyer.com");
    navigate("/mailbox");
  };

  const handleMagicHighCFOClick = () => {
    issueMagicLink("msg-high", "CFO", "cfo@buyer.com");
    navigate("/mailbox");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
          Bravax Intercepted Email (POC)
        </h1>
        
        <div className="space-y-4">
          <button 
            onClick={handleMagicLowClick}
            className="w-full rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Send Secure Link (Magic Low)
          </button>
          
          <button 
            onClick={handleTempMediumClick}
            className="w-full rounded-md bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            Send Secure Link (Temp Medium)
          </button>
          
          <button 
            onClick={handleMagicHighClick}
            className="w-full rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Send Secure Link (Magic High)
          </button>
          
          <button 
            onClick={handleMagicHighCFOClick}
            className="w-full rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            Send Secure Link (Magic High — CFO)
          </button>
        </div>

        <div className="mt-6 text-center">
          <a 
            href="/mailbox" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Go to Mailbox
          </a>
        </div>
      </div>
    </div>
  );
}
