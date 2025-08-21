export const tokens = {
  magicLow:  { messageId: "msg-low",  isEnrolled: true,  role: "AP_Manager" as const },
  tempMed:   { messageId: "msg-med",  isEnrolled: false, role: "Viewer"     as const },
  magicHigh: { messageId: "msg-high", isEnrolled: true,  role: "Controller" as const },
  magicHighCFO: { messageId: "msg-high", isEnrolled: true, role: "CFO" as const },
  tempHigh:  { messageId: "msg-high", isEnrolled: false, role: "Viewer"     as const },
} as const;

export type TokenKey = keyof typeof tokens;
export type TokenInfo = (typeof tokens)[TokenKey];