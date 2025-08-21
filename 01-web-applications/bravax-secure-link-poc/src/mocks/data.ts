import type { Message } from "../types";

export const messagesById: Record<string, Message> = {
  "msg-low": {
    id: "msg-low",
    subject: "Invoice #INV-2024-0001 - Office Supplies",
    sender: "vendor@officepro.com",
    recipients: ["ap@buyer.com", "manager@buyer.com"],
    risk: "low",
    trustSignals: [
      {
        id: "ts1",
        label: "Verified vendor",
        severity: "info",
        detail: "Vendor has been in our system for 2+ years"
      },
      {
        id: "ts2",
        label: "Normal amount range",
        severity: "info",
        detail: "Invoice amount is within typical range for this vendor"
      }
    ],
    invoice: {
      id: "inv-low",
      number: "INV-2024-0001",
      vendorName: "Office Pro Supplies",
      amount: 1250.00,
      currency: "USD",
      bankAccountLast4: "4829",
      authoredBy: "Sarah Chen",
      sentAtISO: "2024-01-15T10:30:00Z",
      fileUrl: "/documents/INV-2024-0001.pdf"
    }
  },
  "msg-med": {
    id: "msg-med",
    subject: "Invoice #INV-2024-0089 - IT Services",
    sender: "billing@techsolv.co",
    recipients: ["ap@buyer.com"],
    risk: "medium",
    trustSignals: [
      {
        id: "ts3",
        label: "Finance approver dropped",
        severity: "warn",
        detail: "Original approver was removed from recipient list"
      },
      {
        id: "ts4",
        label: "Unusual subdomain",
        severity: "warn",
        detail: "Sender uses subdomain not previously seen from this vendor"
      }
    ],
    invoice: {
      id: "inv-med",
      number: "INV-2024-0089",
      vendorName: "TechSolv Solutions",
      amount: 8500.00,
      currency: "USD",
      bankAccountLast4: "7392",
      authoredBy: "Mike Rodriguez",
      sentAtISO: "2024-01-18T14:45:00Z",
      fileUrl: "/documents/INV-2024-0089.pdf"
    }
  },
  "msg-high": {
    id: "msg-high",
    subject: "URGENT: Invoice #INV-2024-0156 - Maintenance Contract",
    sender: "finance@globaltech-services.net",
    recipients: ["controller@buyer.com", "cfo@buyer.com"],
    risk: "high",
    trustSignals: [
      {
        id: "ts5",
        label: "Bank account changed",
        severity: "critical",
        detail: "Payment details differ from previous invoices"
      },
      {
        id: "ts6",
        label: "Unknown document author",
        severity: "critical",
        detail: "Document created by user not in our vendor contact database"
      },
      {
        id: "ts7",
        label: "Urgent language detected",
        severity: "warn",
        detail: "Subject line contains urgency indicators often used in fraud"
      }
    ],
    invoice: {
      id: "inv-high",
      number: "INV-2024-0156",
      vendorName: "Global Tech Services",
      amount: 45000.00,
      currency: "USD",
      bankAccountLast4: "1847",
      authoredBy: "Alex Thompson",
      sentAtISO: "2024-01-20T09:15:00Z",
      fileUrl: "/documents/INV-2024-0156.pdf"
    }
  }
};
