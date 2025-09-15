import React, { useState } from 'react';

const AutomationSetup = () => {
  // Sample data - in real app this would come from user's financial profile
  const [transferData] = useState({
    foundation: { amount: 423, purpose: 'retirement' },
    dream: { amount: 634, purpose: 'cottage' },
    life: { amount: 200, purpose: 'everything else' }
  });

  const [isPrintMode, setIsPrintMode] = useState(false);

  const handlePrint = () => {
    setIsPrintMode(true);
    setTimeout(() => {
      window.print();
      setIsPrintMode(false);
    }, 100);
  };

  const totalTransfers = transferData.foundation.amount + transferData.dream.amount + transferData.life.amount;

  return (
    <div className={`min-h-screen ${isPrintMode ? 'print-mode' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100'}`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🏦 Bank Automation Setup
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Follow these personalized instructions to set up automatic transfers that will 
            make your financial dreams happen on autopilot.
          </p>
        </div>

        {/* Quick Summary Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Your Monthly Automation</h2>
            <div className="text-3xl font-bold text-indigo-600">${totalTransfers}</div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-xl">
              <div className="text-sm opacity-90">Foundation</div>
              <div className="text-2xl font-bold">${transferData.foundation.amount}</div>
              <div className="text-sm opacity-90">{transferData.foundation.purpose}</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl">
              <div className="text-sm opacity-90">Dream</div>
              <div className="text-2xl font-bold">${transferData.dream.amount}</div>
              <div className="text-sm opacity-90">{transferData.dream.purpose}</div>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-xl">
              <div className="text-sm opacity-90">Life</div>
              <div className="text-2xl font-bold">${transferData.life.amount}</div>
              <div className="text-sm opacity-90">{transferData.life.purpose}</div>
            </div>
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
            <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
            Step-by-Step Bank Instructions
          </h2>

          <div className="space-y-6">
            <div className="border-l-4 border-indigo-500 pl-6">
              <h3 className="font-semibold text-lg mb-2">Contact Your Bank</h3>
              <p className="text-gray-600 mb-3">
                Call your bank or visit a branch to set up automatic transfers. Most banks offer this service for free.
              </p>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="text-sm text-indigo-700">
                  <strong>What to say:</strong> "I'd like to set up three recurring automatic transfers from my checking account to three different savings accounts on the 1st of each month."
                </p>
              </div>
            </div>

            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="font-semibold text-lg mb-2">Set Up Your Accounts</h3>
              <p className="text-gray-600 mb-3">
                You'll need three separate savings accounts (or sub-accounts) for your buckets:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  <strong>Foundation Account:</strong> For retirement/emergency funds
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  <strong>Dream Account:</strong> For your cottage fund
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  <strong>Life Account:</strong> For everyday goals and flexibility
                </li>
              </ul>
            </div>

            <div className="border-l-4 border-amber-500 pl-6">
              <h3 className="font-semibold text-lg mb-2">Configure the Transfers</h3>
              <p className="text-gray-600 mb-3">
                Provide your bank with these exact transfer details:
              </p>
              <div className="bg-amber-50 p-4 rounded-lg space-y-2">
                <div className="text-sm">
                  <strong>Transfer 1:</strong> $423 to Foundation Account on the 1st of each month
                </div>
                <div className="text-sm">
                  <strong>Transfer 2:</strong> $634 to Dream Account on the 1st of each month
                </div>
                <div className="text-sm">
                  <strong>Transfer 3:</strong> $200 to Life Account on the 1st of each month
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Printable Cards Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
              <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
              Printable Bank Cards
            </h2>
            <button
              onClick={handlePrint}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              🖨️ Print Cards
            </button>
          </div>

          <p className="text-gray-600 mb-6">
            Print these cards and take them to your bank. They contain all the information your banker needs.
          </p>

          {/* Printable Cards */}
          <div className="grid gap-6 print:gap-4">
            {/* Card 1: Summary Card */}
            <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg print:break-inside-avoid print:border-solid print:border-gray-400">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">🏦 Automatic Transfer Setup Request</h3>
                <p className="text-sm text-gray-600">Present this card to your banker</p>
              </div>
              
              <div className="space-y-3">
                <div className="border-b pb-2">
                  <strong>Customer Request:</strong> Set up 3 recurring automatic transfers
                </div>
                <div className="border-b pb-2">
                  <strong>Transfer Date:</strong> 1st of each month
                </div>
                <div className="border-b pb-2">
                  <strong>Source Account:</strong> Primary Checking Account
                </div>
                <div>
                  <strong>Total Monthly Transfer:</strong> ${totalTransfers}
                </div>
              </div>
            </div>

            {/* Card 2: Transfer Details */}
            <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg print:break-inside-avoid print:border-solid print:border-gray-400">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">📋 Transfer Details</h3>
              
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded border print:bg-gray-50">
                  <div className="font-semibold text-green-700 print:text-gray-800">Transfer #1: Foundation</div>
                  <div className="text-sm space-y-1">
                    <div><strong>Amount:</strong> ${transferData.foundation.amount}</div>
                    <div><strong>Purpose:</strong> {transferData.foundation.purpose}</div>
                    <div><strong>Account Name:</strong> Foundation Savings</div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded border print:bg-gray-50">
                  <div className="font-semibold text-purple-700 print:text-gray-800">Transfer #2: Dream</div>
                  <div className="text-sm space-y-1">
                    <div><strong>Amount:</strong> ${transferData.dream.amount}</div>
                    <div><strong>Purpose:</strong> {transferData.dream.purpose}</div>
                    <div><strong>Account Name:</strong> Dream Savings</div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded border print:bg-gray-50">
                  <div className="font-semibold text-blue-700 print:text-gray-800">Transfer #3: Life</div>
                  <div className="text-sm space-y-1">
                    <div><strong>Amount:</strong> ${transferData.life.amount}</div>
                    <div><strong>Purpose:</strong> {transferData.life.purpose}</div>
                    <div><strong>Account Name:</strong> Life Savings</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Questions to Ask */}
            <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg print:break-inside-avoid print:border-solid print:border-gray-400">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">❓ Questions to Ask Your Banker</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  <span>Are there any fees for automatic transfers?</span>
                </div>
                <div className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  <span>Can I easily modify or cancel these transfers online?</span>
                </div>
                <div className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  <span>What happens if there are insufficient funds?</span>
                </div>
                <div className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  <span>Can you set up email notifications for each transfer?</span>
                </div>
                <div className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  <span>What's the best way to track these transfers?</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alternative Options */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
            <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
            Alternative Options
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-3 text-gray-800">📱 Mobile Banking App</h3>
              <p className="text-gray-600 text-sm mb-4">
                Most banks allow you to set up automatic transfers through their mobile app or website.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Look for "Transfers" or "Automatic Transfers"</li>
                <li>• Set up recurring monthly transfers</li>
                <li>• Use the same amounts and dates</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-3 text-gray-800">💳 Different Banks</h3>
              <p className="text-gray-600 text-sm mb-4">
                Consider opening high-yield savings accounts at online banks for better interest rates.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Set up external transfers</li>
                <li>• Higher interest rates for your savings</li>
                <li>• May take 2-3 business days</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Success Tips */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
          <h2 className="text-2xl font-semibold text-green-800 mb-4 flex items-center">
            ✨ Success Tips
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-green-700">
            <div>
              <h3 className="font-semibold mb-2">🎯 Start Simple</h3>
              <p className="text-sm">
                Begin with these amounts and adjust after a few months based on your experience.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">📅 Pick the Right Date</h3>
              <p className="text-sm">
                The 1st works well if you get paid monthly. Adjust to a few days after your payday.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">🔔 Set Reminders</h3>
              <p className="text-sm">
                Ask for email notifications so you can track when transfers happen.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">🎉 Celebrate Automation</h3>
              <p className="text-sm">
                Once set up, your dreams will fund themselves automatically!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .print-mode {
            background: white !important;
          }
          
          @page {
            margin: 0.5in;
            size: letter;
          }
          
          .print\\:break-inside-avoid {
            break-inside: avoid;
          }
          
          .print\\:border-solid {
            border-style: solid !important;
          }
          
          .print\\:border-gray-400 {
            border-color: #9ca3af !important;
          }
          
          .print\\:bg-gray-50 {
            background-color: #f9fafb !important;
          }
          
          .print\\:text-gray-800 {
            color: #1f2937 !important;
          }
          
          body {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};

export default AutomationSetup;
