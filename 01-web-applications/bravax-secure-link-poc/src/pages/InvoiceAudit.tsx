import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useAudit } from "../hooks/useAudit";

function toCSV(rows: Array<{ ts:string; user:string; role:string; event:string }>) {
  const header = "timestamp,user,role,event";
  const body = rows.map(r =>
    [r.ts, r.user, r.role, r.event.replaceAll(",", ";")].join(",")
  ).join("\n");
  return [header, body].join("\n");
}

export default function InvoiceAudit() {
  const { messageId = "" } = useParams();
  const { readFromStorage } = useAudit();
  const rows = readFromStorage(messageId);

  const csv = useMemo(() => toCSV(rows.map(r => ({
    ts: r.ts, user: r.user, role: r.role, event: r.event
  }))), [rows]);

  const download = () => {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bravax_audit_${messageId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Full Audit Log</h1>
        <div className="flex gap-2 text-sm">
          <button onClick={download} className="px-3 py-1.5 rounded-md bg-gray-800 text-white">Export CSV</button>
          <Link className="text-indigo-600 hover:underline" to={`/portal/${messageId}`}>Back to Portal</Link>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="text-gray-500">No audit entries yet for this invoice.</div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-3">Timestamp</th>
                <th className="text-left p-3">User</th>
                <th className="text-left p-3">Role</th>
                <th className="text-left p-3">Event</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="p-3">{new Date(r.ts).toLocaleString()}</td>
                  <td className="p-3 break-all">{r.user}</td>
                  <td className="p-3">{r.role}</td>
                  <td className="p-3">{r.event}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
