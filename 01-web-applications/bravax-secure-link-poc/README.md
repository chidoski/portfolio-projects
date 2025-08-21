# Bravax — Secure Link POC (DocuSign-style approvals)

> **Portfolio Project**: A comprehensive secure link approval system demonstrating modern web development practices, security patterns, and user experience design.

## 🎯 Project Overview

This proof-of-concept demonstrates a secure link approval system for payment-intent emails, similar to DocuSign's approval workflow. Instead of delivering raw payment instructions directly to Accounts Payable teams, all payment-related communications are routed through a secure portal that enforces policy-based approval chains before any action can be taken.

**🔗 Part of**: [Personal Projects Portfolio](../../README.md)

## ✨ Key Features & Technical Demonstrations

### 🔐 Security & Access Control
- **Email interception and routing**: All payment-intent emails are redirected to a Secure Link portal instead of raw delivery
- **Dual access patterns**: 
  - Magic Link for enrolled users (direct portal access with role-aware permissions)
  - Temporary Access Link for guests (OTP verification + restricted view with masked details)
- **Policy enforcement**: Prevents unauthorized access to payment instructions until proper approvals are obtained

### 📊 Risk Management & Workflows
- **Risk-based friction controls**: Low risk → quick approve; Medium risk → approver gate; High risk → multi-signer chain (AP → Controller → CFO)
- **Dynamic risk assessment**: Real-time risk scoring with visual indicators
- **Escalation workflows**: Automated routing based on risk levels and user roles

### 📝 Audit & Compliance
- **Complete audit trail**: Records all views, decisions, and approval actions with completion certificates
- **CSV export functionality**: Full audit log export for compliance reporting
- **Real-time activity tracking**: Live updates of user interactions and approval status

## 🚀 Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS for responsive design
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: React Router for SPA navigation
- **State Management**: React Context API with custom hooks
- **Icons**: Lucide React for consistent iconography
- **Development**: ESLint + TypeScript for code quality

## 🏃‍♂️ Quick Start

1. **Prerequisites**: Node.js 16+ and npm

2. **Installation & Setup**:
   ```bash
   cd 01-web-applications/bravax-secure-link-poc
   npm install
   npm run dev
   ```

3. **Access the application**: Open [http://localhost:5173](http://localhost:5173)

## 🎮 Demo Flow

1. **Start at Intercepted Email**: Begin the journey from a simulated intercepted email
2. **Choose Access Method**: Magic Link (enrolled users) or Temporary Link (guests)
3. **Experience Role-Based Access**: Different permissions for AP Manager, Controller, CFO
4. **Navigate New Features**: 
   - View detailed invoice information
   - Export full audit logs as CSV
   - Experience responsive design across devices

## What this POC is NOT

This is a demonstration of the approval workflow and user experience. It does **not** include:

- Real email integration or SMTP processing
- Production authentication or SSO
- Backend services or persistent databases
- Real OTP/SMS delivery
- ERP system integrations
- Production-grade security implementations

All authentication, tokens, and OTP codes are simulated using localStorage and mock data.

## Repo Map

```
bravax-secure-link-poc/
├── docs/                           # Documentation and specifications
│   ├── PRD_Bravax_Secure_Link.md  # Product Requirements Document
│   ├── POC_Execution_Steps.md     # Implementation steps and progress tracking
│   └── CURSOR_RULES.md            # Development guidelines
├── src/                           # Application source code
│   ├── components/                # React components
│   ├── types/                     # TypeScript type definitions
│   ├── utils/                     # Utility functions and helpers
│   └── App.tsx                    # Main application component
└── public/                        # Static assets
```

## License

[License placeholder - to be determined]