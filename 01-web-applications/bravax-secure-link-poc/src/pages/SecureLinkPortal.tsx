import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSession } from '../state/SessionContext';
import { messagesById } from '../mocks/data';
import InvoicePreview from '../components/InvoicePreview';
import RiskBadge from '../components/RiskBadge';
import SignerStepper from '../components/SignerStepper';
import TrustSignalList from '../components/TrustSignalList';
import ActionBar from '../components/ActionBar';
import { AuditLog } from '../components/AuditLog';
import { EscalationModal } from '../components/EscalationModal';
import AccessStatus from '../components/AccessStatus';
import NextApproverHint from '../components/NextApproverHint';
import { useAudit } from '../hooks/useAudit';

export default function SecureLinkPortal() {
  const { messageId } = useParams<{ messageId: string }>();
  const navigate = useNavigate();
  const { session } = useSession();
  const { entries, push, readFromStorage } = useAudit();

  // State management
  const steps = ["AP Manager", "Controller", "CFO"];
  const [currentStep, setCurrentStep] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const hasLoggedView = useRef(false);

  // Derive session data
  const userEmail = session?.userEmail ?? "unknown@user";
  const userRole = session?.role ?? "Viewer";
  const restricted = !!session?.restrictedView;

  // Helper function to get next role
  const nextRole = (): string => {
    if (currentStep === 0) return "Controller";
    if (currentStep === 1) return "CFO";
    return "CFO";
  };

  // Load message
  const message = messageId ? messagesById[messageId] : null;

  // Effects
  useEffect(() => {
    if (messageId && !hasLoggedView.current) {
      // Push view event on mount (only once)
      push({ 
        user: userEmail, 
        role: userRole, 
        messageId, 
        event: "Viewed Secure Link" 
      });
      hasLoggedView.current = true;

      // Optionally preload existing audit entries
      readFromStorage(messageId);
      // Note: The hook already manages entries state, so we don't need to manually set them
    }
  }, [messageId, userEmail, userRole, push, readFromStorage]);

  // Render error states
  if (!messageId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Invalid Access</h1>
          <p className="text-gray-600 mt-2">No message ID provided</p>
        </div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Message not found.</h1>
        </div>
      </div>
    );
  }

  // Create stepper statuses
  const stepperStatuses = steps.map((label, idx) => ({
    label,
    status: idx < currentStep ? "approved" as const : 
            idx === currentStep ? "pending" as const : 
            "locked" as const
  }));

  // Action handlers
  const handleEscalate = (): void => {
    setModalOpen(true);
  };

  const confirmEscalate = (): void => {
    push({ 
      user: userEmail, 
      role: userRole, 
      messageId, 
      event: `Escalated to ${nextRole()}` 
    });
    setCurrentStep(s => Math.min(2, s + 1));
    setModalOpen(false);
  };

  const handleApprove = (): void => {
    push({ 
      user: userEmail, 
      role: userRole, 
      messageId, 
      event: "Approved" 
    });
    navigate(`/result?status=approved`, { state: { messageId } });
  };

  const handleReject = (): void => {
    push({ 
      user: userEmail, 
      role: userRole, 
      messageId, 
      event: "Rejected" 
    });
    navigate(`/result?status=rejected`, { state: { messageId } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{message.subject}</h1>
          <p className="mt-1 text-sm text-gray-600">
            From: {message.sender} • To: {message.recipients.join(', ')}
          </p>
          {session && (
            <p className="mt-1 text-xs text-gray-500">
              Logged in as: {session.userEmail} ({session.role})
              {session.restrictedView && " • Restricted View"}
            </p>
          )}
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Invoice Preview (2/3 width) */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-900">Invoice Preview</h3>
                <Link 
                  to={`/invoice/${messageId}`}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  View Details
                </Link>
              </div>
              <div className="p-4">
                <InvoicePreview 
                  invoice={message.invoice} 
                  restricted={restricted} 
                />
              </div>
            </div>
          </div>

          {/* Right column - Risk, Stepper, Trust Signals, Actions, Audit (1/3 width) */}
          <div className="space-y-6">
            {/* Access Status */}
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Access Status</h3>
              <AccessStatus isGuest={restricted} role={userRole} />
            </div>

            {/* Risk Badge */}
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Risk Assessment</h3>
              <RiskBadge level={message.risk} />
            </div>

            {/* Signer Stepper */}
            <div className="bg-white shadow rounded-lg p-4">
              <SignerStepper 
                currentStep={currentStep}
                steps={stepperStatuses}
              />
              <NextApproverHint currentStep={currentStep} steps={steps} />
            </div>

            {/* Trust Signals */}
            <div className="bg-white shadow rounded-lg p-4">
              <TrustSignalList signals={message.trustSignals} />
            </div>

            {/* Action Bar */}
            <ActionBar
              role={userRole}
              restricted={restricted}
              risk={message.risk}
              onApprove={handleApprove}
              onEscalate={handleEscalate}
              onReject={handleReject}
            />

            {/* Audit Log */}
            <div className="bg-white shadow rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-gray-900">Audit Log</h3>
                <Link 
                  to={`/invoice/${messageId}/audit`}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  View Full Audit
                </Link>
              </div>
              <AuditLog rows={entries} />
            </div>
          </div>

        {/* Escalation Modal */}
        <EscalationModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={confirmEscalate}
          currentRole={steps[currentStep]}
          nextRole={nextRole()}
        />
        </div>
      </div>
    </div>
  );
}