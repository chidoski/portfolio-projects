interface AuditLogProps {
  rows: Array<{
    ts: string;
    user: string;
    role: string;
    event: string;
  }>;
}

export function AuditLog({ rows }: AuditLogProps) {
  if (rows.length === 0) {
    return (
      <div className="text-gray-500 text-sm italic">
        No audit entries yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((entry, index) => (
        <div key={index} className="border-b border-gray-200 pb-2 last:border-b-0">
          <div className="font-bold text-gray-900">
            {entry.event}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {entry.role} • {new Date(entry.ts).toLocaleString()} • {entry.user}
          </div>
        </div>
      ))}
    </div>
  );
}
