# InsurOS — Product Requirements Document

**Version:** 3.0 · **Updated:** 2026-07-16 · **Owner:** Jacob (Super Admin)

## Vision

InsurOS is a multi-continental insurance SaaS. One platform runs insurance operations (marketplace, policies, claims, customers, finance) under a five-level administrative hierarchy with per-country statutory tax compliance and a mirrored sales chain of command.

## Market Gaps & Competitive Niche (v3.0)

Deep research into why insurance businesses fail to thrive (see `docs/MARKET_GAPS.md` for the full study and sources) identified twelve setbacks across public trust, economics, governance, industry structure, administration, workflows, reporting, and claims. Every setback is digitalized into an InsurOS module — that reconciliation into one platform is the commanding niche. The four v3.0 flagship modules:

**Claims Automation (STP + fraud scoring)** — FNOL from web/mobile/USSD/agent, explainable fraud signals scored at intake, rules-based auto-approval with payout SLAs, and a reasons-first decision ledger. Denials are never automated. Benchmark chased: Lemonade's 55% end-to-end automation. UI: `/dashboard/claims/automation`.

**Pricing Engine (competitive-friendly premiums)** — technical premium from granular risk factors (telematics discounts included), lean digital loadings, automatic competitor-median undercut capped at 5%, affordability bands with hard floors, never below expected risk cost. UI: `/dashboard/marketplace/pricing-engine`.

**Microinsurance + Mobile Money** — daily/weekly micro-premiums on M-PESA-class rails, USSD/agent/embedded activation, mobile number as identity and payment instrument, forgiving grace/lapse logic, and parametric index products (e.g. drought cover) that pay automatically with no claim filing. Attacks the penetration gap (Kenya ~2.1% vs ~7% global). UI: `/dashboard/marketplace/micro`.

**Executive Analytics** — loss/expense/combined ratios, STP rate, claim cycle, retention per country and period. The combined ratio below 100% is the scoreboard proving digitalization converts expense savings into competitive prices and underwriting profit. UI: `/dashboard/finance/analytics`.

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

Subnational layer: `SubnationalTaxRule` adds per-state/per-county rules (percentage or flat) on top of national components — US state premium taxes (CA 2.35%, NY 2.0%, TX 1.6%, FL 1.75%, IL 0.5%), Australian insurance duties (NSW 9%, VIC 10%, QLD 9%, ACT abolished), and Kenyan county business permits (flat, indicative). `RegionalTaxService.computeRegional` merges national + regional lines into one total. UI: `/dashboard/finance/tax/regional`.

## Terms & Conditions

Versioned, audience-scoped terms documents with click-wrap acceptance records (user, version, timestamp, IP, method). Legal text lives in `docs/TERMS_AND_CONDITIONS.md`; registry and acceptance log at `/dashboard/legal`. New versions supersede with 30 days' notice.

## Sales Hierarchy Portal

Sales ranks mirror the admin hierarchy: Global Sales Head → Continental Director → National Manager → County Manager → Constituency Agent. A superior names agents and issues target assignments only to strictly lower ranks within their own reporting line. UI: `/dashboard/sales` and `/dashboard/sales/assignments`.

## Clerk Production Integration

The dashboard layout resolves each signed-in Clerk user (by email) to a `SessionPrincipal` — jurisdiction assignments, effective permission keys, and accessible territory — replacing hardcoded permissions. `CLERK_ORG_ROLE_BY_LEVEL` maps admin levels to Clerk org roles (`org:super_admin` … `org:constituency_admin`), and the Clerk Sync plan (`/dashboard/identity/clerk-sync`) deterministically translates every assignment into Clerk organization-membership API calls. Executing the plan needs `CLERK_SECRET_KEY` (production config still deferred). Unmapped users keep dev access; production should route them to an access request.

## Jurisdiction-Scoped RBAC

Roles are granted per jurisdiction (`JurisdictionAssignment`: user × role × region). The authorization engine allows an action only when an active assignment's role carries the permission AND the target region is the grant region or a descendant — so a County admin cannot touch another county, and suspended grants deny everything. `getAccessibleRegions` resolves a user's full territory. This model maps 1:1 onto Clerk organization roles for production. UI: `/dashboard/governance/access` with a live authorization-decision preview.

## Commission Engine

Rate cards per rank (direct + override percentages), automatic accrual on written premium up the supervisor chain, clawbacks for lapsed/fraudulent business, and per-agent period statements (direct + override − clawbacks = net payable). Every accrual names the writing agent, making override chains auditable. Kenya VAT (16%) applies to commissions per the tax module. UI: `/dashboard/sales/commissions`.

## Architecture

Monorepo (pnpm): `apps/admin` (Next.js) + `packages/{domain,mocks,services,ui}`. Every capability follows Domain → Mocks → Services → Admin UI. UI consumes services only. Auth: Clerk (production config deferred). Deployment target: DigitalOcean (deferred until persistence lands).

Persistence: services depend on repository ports (`getPersistence()`), backed by an in-memory adapter today and PostgreSQL on DigitalOcean via Drizzle once provisioned. Full DDL in `packages/services/src/persistence/schema.sql`; plan in `docs/PERSISTENCE.md`. `AdminHierarchyService` is the reference port-based service.

## Status

Done: platform capabilities (activity, notifications, comments, attachments, audit, workflow engine), business workspaces, RBAC foundation, governance hierarchy, tax remittance (national + regional), legal/terms, sales portal, commission engine, jurisdiction-scoped RBAC, Clerk integration layer, persistence ports + PostgreSQL schema, CI validation pipeline, and the v3.0 gap-closing modules: claims automation (STP + fraud), pricing engine, microinsurance + mobile money (incl. parametric), executive analytics.

All governance/tax/legal/sales services now consume persistence ports (`getPersistence()`); roles stay mock-backed until a roles port lands with Clerk sync.

Next: provision DO PostgreSQL + wire Drizzle adapter, Clerk secret-key provisioning + sync execution, live payment-portal integrations, DigitalOcean deployment.
