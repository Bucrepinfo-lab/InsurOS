# InsurOS

Multi-continental insurance SaaS: marketplace, policies, claims, customers, and finance operated under a five-level administrative hierarchy (Super Admin → Continental → National → County → Constituency), with per-country statutory tax remittance, versioned terms & conditions, and a mirrored sales chain of command.

## Repository

```text
apps/admin        Next.js admin control plane
packages/domain   Business entities and contracts (source of truth)
packages/mocks    Development and demo data
packages/services Business-facing service layer (persistence ports)
packages/ui       Reusable UI primitives, layouts, navigation
docs/             PRD, standards, ADRs, persistence and legal docs
```

## Getting started

```bash
pnpm install
pnpm --filter @insuros/admin dev   # run the admin app
pnpm validate                      # typecheck all packages + build admin
```

Copy `.env.example` to `apps/admin/.env.local` and fill in the Supabase keys. Without `DATABASE_URL`, persistence runs on the in-memory adapter over mock data.

## Access control (v1)

- Sign-in is Supabase phone OTP. Production **fails closed** without `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (503, `/api/health` unhealthy). Open dev mode exists only when `NODE_ENV` is not `production`.
- The first platform owner is bootstrapped from `PLATFORM_OWNER_PHONES` (comma-separated E.164). Everyone else lands on **Access pending** until an owner grants a role at *Governance → Jurisdiction Access*.
- Roles are least-privilege (`packages/domain/src/access-control.ts`): Platform Admin, Claims Manager, Claims Officer, Underwriter, Agent, Finance Manager, Operations. Each dashboard section layout, server action and API route checks the permission **on the server**; menus only mirror it.

## Key documents

Product requirements: `docs/PRD.md` · Engineering standards: `docs/ENGINEERING_STANDARDS.md` · Persistence plan: `docs/PERSISTENCE.md` · Terms & conditions: `docs/TERMS_AND_CONDITIONS.md` · ADRs: `docs/architecture/`.

## Delivery

Every push runs CI (`.github/workflows/validate.yml`): full typecheck plus the Next.js production build. One focused commit per capability; see the delivery loop in `docs/ENGINEERING_STANDARDS.md`.
