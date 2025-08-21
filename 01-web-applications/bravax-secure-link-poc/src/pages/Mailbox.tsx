import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { readOutbox, type OutboxEmail } from "../services/LinkService";

export default function Mailbox() {
  const nav = useNavigate();
  const [items, setItems] = useState<OutboxEmail[]>([]);

  useEffect(() => {
    setItems(readOutbox());
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Email Outbox</h1>
              <p className="text-gray-600 mt-2">
                Simulated outbox showing sent secure links (newest first)
              </p>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📧</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No emails sent yet</h3>
                <p className="text-gray-500">
                  Generate some secure links from the Intercepted Email page to see them here.
                </p>
                <button
                  onClick={() => nav('/intercepted')}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Go to Intercepted Email
                </button>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {items.map((m, i) => (
                    <li key={i} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-indigo-600 font-medium text-sm">
                                  {m.toEmail.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                To: {m.toEmail}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                Subject: {m.subject}
                              </p>
                              <p className="text-xs text-gray-400">
                                Sent: {new Date(m.createdAtISO).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-sm text-gray-500">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Sent
                            </span>
                          </div>
                          <button
                            onClick={() => nav(m.url)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Open Link
                          </button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-400 font-mono break-all">
                          Link: {m.url}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => nav('/intercepted')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                ← Back to Intercepted Email
              </button>
              <button
                onClick={() => setItems(readOutbox())}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}