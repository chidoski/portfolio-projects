export type RiskLevel = "low" | "medium" | "high";

export interface TrustSignal {
  id: string;
  label: string;
  severity: "info" | "warn" | "critical";
  detail?: string;
}

export interface Invoice {
  id: string;
  number: string;
  vendorName: string;
  amount: number;
  currency: string;
  bankAccountLast4?: string;
  authoredBy?: string;
  sentAtISO: string;
  fileUrl?: string;
}

export interface Message {
  id: string;
  subject: string;
  sender: string;
  recipients: string[];
  risk: RiskLevel;
  trustSignals: TrustSignal[];
  invoice: Invoice;
}

export type Role = "Viewer" | "AP_Manager" | "Controller" | "CFO";
