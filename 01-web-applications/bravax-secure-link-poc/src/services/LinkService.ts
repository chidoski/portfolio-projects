export type OutboxEmail = {
  toEmail: string;
  subject: string;
  url: string;
  createdAtISO: string;
};

const OUTBOX_KEY = "bravax_outbox";

function readOutbox(): OutboxEmail[] {
  try {
    const raw = localStorage.getItem(OUTBOX_KEY);
    const arr = raw ? (JSON.parse(raw) as OutboxEmail[]) : [];
    // newest first
    return arr.sort((a, b) => (a.createdAtISO < b.createdAtISO ? 1 : -1));
  } catch {
    return [];
  }
}

function appendOutbox(entry: OutboxEmail) {
  const arr = readOutbox();
  arr.unshift(entry);
  localStorage.setItem(OUTBOX_KEY, JSON.stringify(arr));
}

export function issueMagicLink(
  messageId: string,
  role: "AP_Manager" | "Controller" | "CFO",
  toEmail: string
) {
  // Map messageId to our demo tokens
  const token =
    messageId === "msg-high"
      ? (role === "CFO" ? "magicHighCFO" : "magicHigh")
      : "magicLow";
  const url = `/link/magic/${token}`;
  appendOutbox({
    toEmail,
    subject: "Bravax Secure Link",
    url,
    createdAtISO: new Date().toISOString(),
  });
  return { token, url };
}

export function issueTempLink(messageId: string, toEmail: string) {
  const token = messageId === "msg-high" ? "tempHigh" : "tempMed";
  const url = `/link/temp/${token}`;
  appendOutbox({
    toEmail,
    subject: "Bravax Secure Link",
    url,
    createdAtISO: new Date().toISOString(),
  });
  return { token, url };
}

export { readOutbox };