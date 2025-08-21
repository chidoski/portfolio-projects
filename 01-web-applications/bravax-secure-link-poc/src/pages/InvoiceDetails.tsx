import { useParams, Link } from "react-router-dom";
import { useSession } from "../state/SessionContext";
import { messagesById } from "../mocks/data";
import InvoicePreview from "../components/InvoicePreview";

export default function InvoiceDetails() {
  const { messageId = "" } = useParams();
  const msg = messagesById[messageId];
  const { session } = useSession();
  const restricted = !!session?.restrictedView;

  if (!msg) return <div>Invoice not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Invoice Details</h1>
        <div className="flex gap-2 text-sm">
          <Link className="text-indigo-600 hover:underline" to={`/invoice/${messageId}/audit`}>View Full Audit</Link>
          <Link className="text-gray-600 hover:underline" to={`/portal/${messageId}`}>Back to Portal</Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-lg shadow p-4">
          <InvoicePreview invoice={msg.invoice} restricted={restricted} />
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-medium mb-3">Message Metadata</h2>
          <dl className="text-sm grid grid-cols-2 gap-x-4 gap-y-2">
            <dt className="text-gray-500">Subject</dt><dd>{msg.subject}</dd>
            <dt className="text-gray-500">Sender</dt><dd>{msg.sender}</dd>
            <dt className="text-gray-500">Recipients</dt><dd className="break-all">{msg.recipients.join(", ")}</dd>
            <dt className="text-gray-500">Risk</dt><dd>{msg.risk}</dd>
            <dt className="text-gray-500">Sent</dt><dd>{new Date(msg.invoice.sentAtISO).toLocaleString()}</dd>
          </dl>
          {restricted && (
            <p className="mt-3 text-xs text-gray-500">
              Restricted preview (Temporary Access Link). Sensitive fields may be masked.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
