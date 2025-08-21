import type { Role, RiskLevel } from "../types";

export type Actions = {
  canApprove: boolean;
  canEscalate: boolean;
  canReject: boolean;
  reason?: string;
};

export function getActions(params: {
  role: Role;
  restricted: boolean;
  risk: RiskLevel;
}): Actions {
  const { role, restricted, risk } = params;

  // Guest (restricted) - no Approve; can request escalation
  if (restricted) {
    return { canApprove: false, canEscalate: true, canReject: false, reason: "Guest restricted" };
  }

  let canApprove = false;
  let canEscalate = false;

  if (risk === "low") {
    // AP_Manager, Controller, CFO can approve
    canApprove = role === "AP_Manager" || role === "Controller" || role === "CFO";
  } else if (risk === "medium") {
    // Only AP_Manager approves; Controller/CFO can escalate
    if (role === "AP_Manager") canApprove = true;
    else canEscalate = role === "Controller" || role === "CFO";
  } else {
    // High: only CFO approves; AP_Manager/Controller escalate
    if (role === "CFO") canApprove = true;
    else canEscalate = role === "AP_Manager" || role === "Controller";
  }

  const canReject = (canApprove || canEscalate) && !restricted;
  return { canApprove, canEscalate, canReject };
}
