import { useEffect } from 'react';

interface EscalationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentRole: string;
  nextRole: string;
}

export function EscalationModal({ 
  open, 
  onClose, 
  onConfirm, 
  currentRole, 
  nextRole 
}: EscalationModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal Panel */}
      <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Escalate for Approval
        </h2>
        
        {/* Body */}
        <p className="text-gray-700 mb-6">
          Route from {currentRole} to {nextRole} for approval?
        </p>
        
        {/* Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
