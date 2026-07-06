# InsurOS — Product Requirements Document

**Version:** 2.0 · **Updated:** 2026-07-06 · **Owner:** Jacob (Super Admin)

## Vision

InsurOS is a multi-continental insurance SaaS. One platform runs insurance operations (marketplace, policies, claims, customers, finance) under a five-level administrative hierarchy with per-country statutory tax compliance and a mirrored sales chain of command.

## Administrative Hierarchy

Authority flows Super Admin → Continental → National → County → Constituency. Rules: an admin may appoint, suspend, or reassign only at strictly lower levels; every appointment is audit-logged; jurisdiction chains resolve upward (constituency → global). Implemented in `packages/domain/src/admin-hierarchy.ts`, surfaced at `/dashboard/governance` and `/dashboard/governance/appointments`.

## Tax Remittance

Each operating country is a `TaxJurisdiction` carrying its statutory components (rate, base, applicable insurance lines), the responsible authority, filing frequency, and a direct link to the official payment portal. `computeTaxLines` produces a per-component remittance ledger. Seeded jurisdictions (rates verified 2026-07-06):

| Country | Key components | Portal |
|---|---|---|
| Kenya | ITL 0.2%, PCF 0.25%, stamp duty 0.05%; VAT 16% on commissions | KRA iTax |
| Nigeria | VAT 7.5% (non-life), NAICOM levy 1%, Development Levy 4% of profits (2026) | TaxPro-Max |
| UK | IPT 12% standard / 20% higher | HMRC |
| USA | State premium tax ~2.25% (configure per state), FET for foreign insurers | EFTPS |
| India | GST 0% individual life/health (since 22 Sep 2025), 18% general/motor/group | GST Portal |
| Brazil | IOF 0.38% life / 7.38% P&C (ends 2027) | e-CAC |
| Australia | GST 10%, state stamp duty ~10% (ACT abolished) | ATO |

Computed figures are informational; filers must re-verify rates with the authority. UI: `/dashboard/finance/tax`.

## Terms & Conditions

Versioned, audience-scoped terms documents with click-wrap acceptance records (user, version, timestamp, IP, method). Legal text lives in `docs/TERMS_AND_CONDITIONS.md`; registry and acceptance log at `/dashboard/legal`. New versions supersede with 30 days' notice.

## Sales Hierarchy Portal

Sales ranks mirror the admin hierarchy: Global Sales Head → Continental Director → National Manager → County Manager → Constituency Agent. A superior names agents and issues target assignments only to strictly lower ranks within their own reporting line. UI: `/dashboard/sales` and `/dashboard/sales/assignments`.

## Commission Engine

Rate cards per rank (direct + override percentages), automatic accrual on written premium up the supervisor chain, clawbacks for lapsed/fraudulent business, and per-agent period statements (direct + override − clawbacks = net payable). Every accrual names the writing agent, making override chains auditable. Kenya VAT (16%) applies to commissions per the tax module. UI: `/dashboard/sales/commissions`.

## Architecture

Monorepo (pnpm): `apps/admin` (Next.js) + `packages/{domain,mocks,services,ui}`. Every capability follows Domain → Mocks → Services → Admin UI. UI consumes services only. Auth: Clerk (production config deferred). Deployment target: DigitalOcean (deferred until persist