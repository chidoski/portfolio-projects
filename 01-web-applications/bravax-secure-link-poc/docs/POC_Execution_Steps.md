# POC Execution Steps

## Implementation Steps

### Step 1: Project Setup & Foundation
**Purpose:** Initialize React app with TypeScript, Tailwind CSS, and basic routing structure  
**Acceptance Checks:**
- [ ] Vite + React + TypeScript project runs successfully
- [ ] Tailwind CSS configured and functional
- [ ] Basic routing structure in place
- [ ] Mock data types defined

### Step 2: Magic Link & Temporary Access Authentication
**Purpose:** Implement dual authentication flows for enrolled users and guests  
**Acceptance Checks:**
- [ ] Magic Link flow redirects enrolled users directly to portal
- [ ] Temporary Access Link requires OTP verification for guests
- [ ] Role-based access control implemented
- [ ] Token validation and expiry handling

### Step 3: Secure Link Portal UI
**Purpose:** Build the main portal interface with invoice preview and approval controls  
**Acceptance Checks:**
- [ ] Left panel displays invoice preview
- [ ] Right panel shows risk badge, signer stepper, trust flags
- [ ] Responsive design works on different screen sizes
- [ ] Navigation and layout components complete

### Step 4: Risk-Based Approval Workflows
**Purpose:** Implement tiered approval system based on risk levels  
**Acceptance Checks:**
- [ ] Low risk: Single-click approve for authorized users
- [ ] Medium risk: Requires specific approver roles
- [ ] High risk: Sequential multi-signer chain (AP → Controller → CFO)
- [ ] Risk classification and routing logic

### Step 5: Audit Trail & Compliance
**Purpose:** Track all user actions and generate completion certificates  
**Acceptance Checks:**
- [ ] All portal views, decisions, and approvals recorded
- [ ] Audit trail displays chronologically
- [ ] Completion certificates generated for approved/rejected items
- [ ] Export functionality for audit logs

### Step 6: Guest View Restrictions & Final Testing
**Purpose:** Implement masked content for unauthorized users and comprehensive testing  
**Acceptance Checks:**
- [ ] Guest users see masked bank details and restricted information
- [ ] Download restrictions enforced for guests
- [ ] All approval flows tested end-to-end
- [ ] Error handling and edge cases covered

## Working Code Index

| File | Purpose | Last Touched Step |
|------|---------|-------------------|
| `src/state/SessionContext.tsx` | React context for user session management with roles and enrollment status | Step 1A |
| `src/pages/InterceptedEmail.tsx` | Main landing page with secure link generation buttons connected to LinkService | Step 2A |
| `src/pages/SecureLinkPortal.tsx` | DocuSign-style portal with invoice preview, risk assessment, and approval workflow | Step 3A |
| `src/pages/ErrorPage.tsx` | Error display page with configurable error codes | Step 1A |
| `src/pages/Mailbox.tsx` | Email outbox display showing sent secure links with Open Link functionality | Step 2A |
| `src/pages/MagicLinkGate.tsx` | Magic link token processor that sets enrolled user session and redirects to portal | Step 2A |
| `src/pages/TempLinkGate.tsx` | Temporary link gate with OTP verification for guest users | Step 2A |
| `src/components/GateVerify.tsx` | 6-digit OTP input component accepting demo code "123456" | Step 2A |
| `src/components/RiskBadge.tsx` | Risk level display component with color-coded badges | Step 3A |
| `src/components/SignerStepper.tsx` | Approval workflow stepper showing AP Manager → Controller → CFO progression | Step 3A |
| `src/components/TrustSignalList.tsx` | Trust signal display with severity-based icons and details | Step 3A |
| `src/components/InvoicePreview.tsx` | Invoice details component with restricted view masking for sensitive fields | Step 3A |
| `src/services/LinkService.ts` | Core link generation service with localStorage outbox management | Step 2A |
| `src/mocks/tokens.ts` | Mock token data mapping tokens to message IDs, roles, and enrollment status | Step 2A |
| `src/mocks/data.ts` | Mock message and invoice data with realistic trust signals and risk levels | Step 3A |
| `src/types.ts` | Core TypeScript type definitions for RiskLevel, Invoice, Message, TrustSignal, and Role | Step 3A |
| `src/routes.tsx` | React Router configuration expanded with mailbox and link gate routes | Step 2A |
| `src/App.tsx` | Main app component with SessionProvider and top navigation | Step 1A |
| `src/main.tsx` | Standard Vite entry point that mounts the App component | Step 1A |

*Table will be updated as files are created and modified throughout the POC development process.*
