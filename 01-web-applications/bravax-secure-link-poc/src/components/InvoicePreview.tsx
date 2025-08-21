import type { Invoice } from "../types";

interface InvoicePreviewProps {
  invoice: Invoice;
  restricted: boolean;
}

export default function InvoicePreview({ invoice, restricted }: InvoicePreviewProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const maskValue = (value: string) => "••••";

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Invoice Details</h2>
        {restricted && (
          <p className="mt-1 text-sm text-amber-600">
            ⚠️ Restricted view — sensitive fields masked
          </p>
        )}
      </div>
      <div className="px-6 py-4">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Invoice Number</dt>
            <dd className="mt-1 text-sm text-gray-900 font-mono">{invoice.number}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vendor</dt>
            <dd className="mt-1 text-sm text-gray-900">{invoice.vendorName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Amount</dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900">
              {formatCurrency(invoice.amount, invoice.currency)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-sm text-gray-900">{invoice.currency}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Sent Date</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatDate(invoice.sentAtISO)}</dd>
          </div>
          {invoice.bankAccountLast4 && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Bank Account</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">
                {restricted ? maskValue(invoice.bankAccountLast4) : `****${invoice.bankAccountLast4}`}
              </dd>
            </div>
          )}
          {invoice.authoredBy && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Authored By</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {restricted ? maskValue(invoice.authoredBy) : invoice.authoredBy}
              </dd>
            </div>
          )}
          {invoice.fileUrl && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Attachment</dt>
              <dd className="mt-1">
                <a
                  href={invoice.fileUrl}
                  className="text-sm text-indigo-600 hover:text-indigo-500 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Invoice Document
                </a>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
