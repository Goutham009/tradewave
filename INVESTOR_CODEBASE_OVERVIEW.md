# Tradewave Investor Codebase Overview

_Last updated: 2026-02-23_

## 1) What Tradewave Is

Tradewave is a **B2B sourcing, negotiation, and transaction orchestration platform** for international trade.

It combines:
- A unified buyer/supplier experience,
- Internal account-management and procurement workflows,
- Admin governance and operational control,
- Escrow-enabled transaction lifecycle support,
- Blockchain-backed auditability for high-trust records.

---

## 2) Product Value Proposition

### Core Business Outcome
Tradewave reduces friction and risk in cross-border B2B procurement by centralizing requirement intake, supplier matching, quotation review, negotiation, and transaction governance.

### Key Differentiators
1. **Human + workflow governance:** AM, procurement, and admin control points are embedded into lifecycle transitions.
2. **Compliance-led transaction controls:** KYB and standing checks gate sensitive actions.
3. **Escrow and milestone orientation:** payment/production/shipment/delivery checkpoints are represented in platform flow.
4. **Auditability architecture:** blockchain integrations are used for transparency and verifiable records (not crypto payments).

---

## 3) Technology Stack

### Frontend
- **Next.js (App Router)**
- **React + TypeScript**
- **Tailwind CSS + shadcn/ui + Radix UI**

### Backend
- **Next.js API routes** (server endpoints)
- **Prisma ORM** with **PostgreSQL**
- **NextAuth** for authentication/session management

### Platform Integrations
- **Stripe** for payment workflows
- **Sentry** for error monitoring
- **Hardhat + Solidity contracts** for blockchain record/audit support

### Testing / Quality Tooling
- **Jest + React Testing Library**
- **Hardhat test runner**
- **ESLint**

---

## 4) Codebase Architecture at a Glance

## Route Groups
- `src/app/(dashboard)` → unified user workspace (buyers/suppliers)
- `src/app/(internal)` → AM + procurement operations panel
- `src/app/(admin)` → governance, oversight, system operations
- `src/app/api/**` → business logic, state transitions, integrations

## Major Domains Implemented
- Lead capture and conversion
- Requirement creation and review pipeline
- Supplier matching and quotation handling
- Negotiation threads
- Admin-mediated transaction creation
- KYB and verification management
- Payments and shipment/delivery progression
- Reviews, disputes, notifications, and analytics surfaces

---

## 5) Data Model Depth

The Prisma schema is extensive and production-oriented, including:
- Users, suppliers, requirements, quotations, transactions
- KYB and compliance records
- Escrow-related entities and release conditions
- Procurement tasks and supplier requirement cards
- Reviews/votes and trust metrics
- Notifications, logs, and audit-linked models

This indicates a platform designed for controlled scale and operational governance, not a thin prototype.

---

## 6) Security and Governance Posture

### Current Controls in Code
- Session-based authentication via NextAuth
- Role-aware routing and panel segmentation
- Backend enforcement for key workflow gates (e.g., KYB checks)
- Admin control points for sensitive lifecycle transitions

### Recent Hardening in Pre-Launch Audit
- Critical mutation APIs were hardened to derive actor identity from authenticated session instead of trusting request-body IDs.
- High-risk routes now explicitly enforce role and ownership checks.

---

## 7) Development Maturity Signals

### Positive Indicators
- Modular route-grouped architecture with clear panel separation
- Type-safe codebase with shared UI primitives
- Database-backed domain modeling and relationships
- Build and unit-test baseline is operational

### Finalization Work Before Public Launch
- Resolve current lint-blocking JSX text issues
- Expand integration and contract test depth
- Complete operational notification TODOs in critical flows
- Final production environment readiness checklist

---

## 8) Commercial Framing for Investors

Tradewave is best positioned as:
- A **B2B transaction operations platform** with compliance-aware orchestration,
- Focused on trust-heavy procurement workflows,
- Architected to support layered monetization (transaction fees, premium sourcing services, enterprise compliance tooling, analytics),
- Built with an extensible technical foundation suitable for staged scaling.

---

## 9) Suggested Investor Narrative (Short Form)

Tradewave modernizes B2B trade execution by combining marketplace coordination with governed operational workflows. Unlike lightweight quote boards, the platform embeds account management, procurement controls, compliance checks, and transaction lifecycle orchestration in one system. The codebase reflects this strategy through role-segmented interfaces, deep workflow APIs, and an audit-oriented data model designed for scale and trust.
