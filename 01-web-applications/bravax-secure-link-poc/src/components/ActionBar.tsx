import { getActions } from "../lib/permissions";
import type { RiskLevel, Role } from "../types";

type Props = {
  role: Role;
  restricted: boolean;
  risk: RiskLevel;
  onApprove(): void;
  onEscalate(): void;
  onReject(): void;
};

export default function ActionBar({ role, restricted, risk, onApprove, onEscalate, onReject }: Props) {
  const acts = getActions({ role, restricted, risk });

  return (
    <div className="mt-6 flex items-center gap-3">
      {acts.canApprove && (
        <button className="px-4 py-2 rounded-md bg-emerald-600 text-white" onClick={onApprove}>
          Approve
        </button>
      )}
      {acts.canEscalate && (
        <button className="px-4 py-2 rounded-md bg-amber-600 text-white" onClick={onEscalate}>
          {restricted ? "Request Approval" : "Escalate"}
        </button>
      )}
      {acts.canReject && (
        <button className="px-4 py-2 rounded-md bg-red-600 text-white" onClick={onReject}>
          Reject
        </button>
      )}
      {restricted && <span className="text-sm text-gray-500">Restricted preview (Temporary Access Link). Sensitive fields are masked. Approvals require an enrolled approver.</span>}
    </div>
  );
}
