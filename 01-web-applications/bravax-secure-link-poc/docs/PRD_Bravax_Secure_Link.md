# Bravax — Secure Link POC (DocuSign-style Approvals)

## 1) Problem & Goal
**Problem.** Fraudulent invoice emails and payment instructions reach AP as if they're safe; traditional email security assumes trust once delivered.  
**Goal.** Replace raw delivery with a **DocuSign-style approval chain** (Secure Link portal) that enforces policy **before** AP action.

## 2) What this POC proves (Outcomes)
- All payment-intent emails are **rerouted** to a Secure Link portal (no raw attachments).
- **Two entry types:**  
  - **Magic Link** (enrolled user) → direct access (role-aware).  
  - **Temporary Access Link** (guest) → OTP + **restricted view** (masked details).
- **Risk tiers** drive friction: Low → quick approve; Medium → approver gate; High → multi-signer lock (AP → Controller → CFO).
- **Audit trail** records all views/decisions (completion "certificate" on result).
- **Vendor-owns pre-send**: Outbound "Send" is gated by approvals (DocuSign-like) before the buyer ever sees it.

## 3) Scope (MVP and next)
**In-scope (MVP).** Buyer-owns inbound flow, Magic/Temp gates, Secure Link portal, risk-based controls, multi-signer approvals, audit trail, simulated secure-link "send/receive/open."  
**Next.** Vendor-owns pre-send workflow.  
**Out-of-scope.** Real email/SMS, real auth/SSO, backend, persistence beyond localStorage, ERP plugins.

## 4) Personas
- **AP Manager (primary).** Reviews/approves; initiates escalations.  
- **Controller.** Co-approver for Medium/High risk.  
- **CFO.** Final approver for High risk; can override.  
- **Vendor Sender (guest).** Receives Secure Link but has read-only, masked view until approved/enrolled.  
- **Security/Compliance (observer).** Needs audit trails (POC shows on-screen).

## 5) Flows (high level)
### A. Buyer-owns (inbound)
1) Email intercepted → classified as payment-intent.  
2) Risk computed → route via Secure Link.  
3) Magic Link (enrolled) → portal; Temp Link (guest) → OTP then restricted portal.  
4) Approver actions: **Approve / Escalate / Reject**.  
5) High risk: **AP → Controller → CFO** (sequential).  
6) Result: release to AP (approved) or block (rejected); audit recorded.

### B. Vendor-owns (outbound pre-send)
1) Sender clicks "Send Securely".  
2) Risk shown; **Send** disabled until required approvals pass.  
3) After approvals, issue buyer Temp Link; buyer sees read-only portal.  
4) Audit recorded.

## 6) Link types & access
- **Magic Link (ML):** For enrolled users; acts as auth to the portal.  
- **Temporary Access Link (TAL):** For non-enrolled; OTP → restricted view.  
- **Secure Link:** Destination URL for all payment-intent content; the only access path to invoice/body/flags/actions.

## 7) Risk tiers & friction
- **Low:** Approve enabled (AP/Controller/CFO).  
- **Medium:** AP must approve; others Escalate.  
- **High:** Locked until CFO signs; non-approvers see redacted content.

## 8) UX requirements
- **Portal layout:** Left = invoice preview; Right = risk badge, signer stepper, trust flags, audit, actions.  
- **Redacted guest view:** Mask bank last4 and author metadata; no downloads.  
- **Signer stepper:** AP → Controller → CFO with statuses (Pending/Approved/Locked).  
-**Copy:** Always explain why the user is here (trust flags) and who must sign next.  
- **Result screen:** Big banner (Approved/Escalated/Rejected) + audit recap.

## 9) POC acceptance criteria
- Magic → low-risk: single-click approve path.  
- Temp → medium-risk: OTP then viewer can only request escalation.  
- High-risk chain requires AP→Controller→CFO; non-approvers cannot unlock.  
- Mailbox shows sent links; links open the correct gate; audit updates for each action.

## 10) KPIs (demo)
- Time to complete an approval (by risk tier).  
- # of clicks to approve vs escalate.  
- Comprehension check: can a user explain why they were gated?  
- Completion rate (did they finish the flow without help?).

## 11) Non-functional (POC)
- Loads quickly on localhost; layout responsive; basic keyboard/tab navigation.  
- Clear copy; no dead ends; meaningful errors (invalid/expired token).

## 12) Risks & mitigations (future for prod)
- **Forwarded links:** Use short-lived, single-use, signed tokens (TTL + jti).  
- **Mailbox compromise (ML):** Add device binding + step-up MFA for high risk.  
- **Approver fatigue:** Preserve a low-risk fast path; risk thresholds tuned; batch approvals (later).  
- **Data leakage:** Keep guest views masked until approved/enrolled.

## 13) Future (beyond POC)
- Backend issuing **signed, short-lived, single-use** links (JWT via `jose/jsonwebtoken`, TTL + jti).  
- OTP/MFA via email/SMS providers.  
- ERP/AP plugins (QuickBooks, NetSuite).  
- Exportable audit logs.

## 14) Glossary
- **Secure Link:** The portal URL where invoices are viewed/approved (single source of truth).  
- **Magic Link:** Enrolled-user link that lands in portal.  
- **Temporary Access Link:** Guest link requiring OTP, showing masked content.  
- **Risk tier:** Low/Medium/High; controls friction and required signers.


Acceptance: All four files exist with the specified content/sections.
