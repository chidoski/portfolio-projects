import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAudit } from '../hooks/useAudit';

type Status = 'approved' | 'escalated' | 'rejected';

interface AuditEntry {
  ts: string;
  user: string;
  role: string;
  messageId: string;
  event: string;
}

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { readFromStorage } = useAudit();
  
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  
  // Get status from query params
  const status = searchParams.get('status') as Status;
  
  // Get messageId from state or query params
  const messageId = location.state?.messageId || searchParams.get('messageId');
  
  useEffect(() => {
    if (messageId) {
      const entries = readFromStorage(messageId);
      setAuditEntries(entries.slice(0, 10)); // Show max 10 entries
    }
  }, [messageId, readFromStorage]);
  
  const getBannerConfig = (status: Status) => {
    switch (status) {
      case 'approved':
        return {
          bg: 'bg-green-100',
          border: 'border-green-200',
          text: 'text-green-800',
          title: 'Document Approved',
          icon: '✓'
        };
      case 'escalated':
        return {
          bg: 'bg-amber-100',
          border: 'border-amber-200',
          text: 'text-amber-800',
          title: 'Document Escalated',
          icon: '↗'
        };
      case 'rejected':
        return {
          bg: 'bg-red-100',
          border: 'border-red-200',
          text: 'text-red-800',
          title: 'Document Rejected',
          icon: '✕'
        };
      default:
        return {
          bg: 'bg-gray-100',
          border: 'border-gray-200',
          text: 'text-gray-800',
          title: 'Unknown Status',
          icon: '?'
        };
    }
  };
  
  const bannerConfig = getBannerConfig(status);
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Status Banner */}
        <div className={`${bannerConfig.bg} ${bannerConfig.border} ${bannerConfig.text} border rounded-lg p-6 mb-8`}>
          <div className="flex items-center justify-center">
            <span className="text-3xl mr-3">{bannerConfig.icon}</span>
            <h1 className="text-2xl font-bold">{bannerConfig.title}</h1>
          </div>
        </div>
        
        {/* Audit Recap */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Audit Recap</h2>
          
          {auditEntries.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No audit entries found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-700">Event</th>
                    <th className="text-left py-2 font-medium text-gray-700">User</th>
                    <th className="text-left py-2 font-medium text-gray-700">Role</th>
                    <th className="text-left py-2 font-medium text-gray-700">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {auditEntries.map((entry, index) => (
                    <tr key={index} className="border-b border-gray-100 last:border-b-0">
                      <td className="py-2 font-medium text-gray-900">{entry.event}</td>
                      <td className="py-2 text-gray-700">{entry.user}</td>
                      <td className="py-2 text-gray-600">{entry.role}</td>
                      <td className="py-2 text-gray-500">
                        {new Date(entry.ts).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Home
          </button>
          <button
            onClick={() => navigate('/mailbox')}
            className="px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View Mailbox
          </button>
        </div>
      </div>
    </div>
  );
}
