# Tradewave Final Pre-Launch Checklist (Env + Operational Readiness)

_Last updated: 2026-02-23_

## 1) Runtime and Authentication Readiness

- ✅ Login route health check passes (`GET /api/auth/signin` returns `302` redirect, not `500`).
- ✅ The missing `vendor-chunks/@opentelemetry.js` login error is mitigated by clearing stale `.next` artifacts and restarting `next dev`.
- ⚠️ Operational note: avoid running `next dev` and `next build` concurrently against the same `.next` directory to prevent cache/runtime mismatches.

## 2) Quality Gates (Current Status)

- ✅ `npm run lint -- --quiet` → pass
- ✅ `npm run build` → pass
- ✅ `npm run test -- --runInBand` → pass (27 tests)
- ✅ `npm run test:integration -- --runInBand` → pass (7 launch smoke tests)
- ✅ `npx tsc --noEmit` → pass
- ⚠️ `npm run contracts:test` → command passes but has `0 passing` assertions

## 3) Core Environment Variables (Checked for set/missing without exposing values)

### Core (launch-critical)
- ✅ `DATABASE_URL` = set
- ✅ `NEXTAUTH_SECRET` = set
- ✅ `NEXTAUTH_URL` = set
- ❌ `STRIPE_SECRET_KEY` = missing
- ❌ `NEXT_PUBLIC_APP_URL` = missing
- ❌ `NEXT_PUBLIC_RPC_URL_SEPOLIA` = missing
- ❌ `DEPLOYER_PRIVATE_KEY` = missing
- ❌ `NEXT_PUBLIC_SENTRY_DSN` = missing
- ❌ `SENTRY_ORG` = missing
- ❌ `SENTRY_PROJECT` = missing

### Ops/Integrations (currently missing in local env)
- ❌ `RESEND_API_KEY`
- ❌ `EMAIL_FROM`
- ❌ `SUPPORT_EMAIL`
- ❌ `ADMIN_EMAIL`
- ❌ `REDIS_URL`
- ❌ `DHL_API_KEY`, `FEDEX_ACCESS_TOKEN`, `MAERSK_API_KEY`, `UPS_ACCESS_TOKEN`
- ❌ `UNSUBSCRIBE_SECRET`, `CRON_SECRET`, `CSRF_SECRET`
- ❌ `INFURA_API_KEY`, `ETHERSCAN_API_KEY`
- ❌ `RESEND_WEBHOOK_SECRET`, `STRIPE_WEBHOOK_SECRET`

## 4) Operational Readiness Gaps Found in API Flows

Notification/email TODOs remain in core workflows. Examples include:

- Quote accepted flow notifications (`buyer/quotations/[id]/accept`)
- Transaction creation/review notifications (`admin/transactions/create`, `admin/transactions/[id]/review`)
- Payment/review/shipment notifications (`buyer/transactions/[id]/payment`, `buyer/transactions/[id]/review`, supplier shipment/production routes)
- Procurement supplier match notifications (`procurement/requirements/[id]/match-suppliers`)

These are operationally important for launch support, SLA handling, and user trust.

## 5) Launch Recommendation (Current)

## Recommendation: **Conditional No-Go (env/ops blockers remain)**

Move to Go after:
1. Filling all core missing env vars (Stripe, app URL, blockchain deployer/RPC, Sentry project/org/dsn),
2. Adding at least minimal contract assertions (`contracts:test` should have >0 passing),
3. Completing or formally deferring notification TODOs with an explicit manual operations runbook.

Once these are complete, the codebase is in strong shape for production launch.
