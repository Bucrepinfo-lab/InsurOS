---
name: architecture-scaffold
description: Use when standing up the InsurOS monorepo from scratch, or adding a missing structural piece (a new app, package, or the tenancy/RLS/auth/payments foundation). Triggers — "scaffold the repo", "set up the monorepo", "there's no code yet", "add packages/domain", "wire Supabase OTP", "add the M-Pesa provider abstraction".
---

> **Current layout (19/10/26):** `apps/admin` (Next.js), `packages/domain` (pure types and rules), `packages/services` (use cases; persistence in `src/persistence`: `schema.sql`, `ports.ts`, `memory-adapter.ts`), `packages/ui`, `packages/mocks`. No Prisma and no mobile app yet; the tree below is the target, not what exists.

# architecture-scaffold

**Purpose:** Establish InsurOS in the owner's portfolio shape — a Turborepo +
pnpm monorepo with a pure domain core, a Prisma/Postgres data layer, Next.js 15
web, Expo mobile, multi-tenant isolation with RLS, Supabase phone-OTP auth, an
M-Pesa provider abstraction, and the subscription model. This is the first build
task of a greenfield repo.

## When to use
- The repo has only `README.md` and the `.claude/` guidance; no app code exists.
- A structural foundation (package, app, tenancy, RLS, auth, payments) is missing.

## Intended initial layout
```
apps/
  web/            # Next.js 15, React 19, TypeScript, PWA
  mobile/         # Expo
packages/
  core/           # pure domain logic — NO framework imports
    src/product.ts underwriting.ts policy.ts claims.ts
        billing.ts compliance.ts tenancy.ts money.ts index.ts
  db/             # Prisma schema, migrations, seed, RLS policies
    prisma/schema.prisma
    src/client.ts         # tenant-scoped Prisma client factory
turbo.json
pnpm-workspace.yaml
package.json            # root, private, workspaces via pnpm
tsconfig.base.json
.env.example            # env VAR NAMES only — never real values
```

## Steps
1. **Root workspace.** Create `pnpm-workspace.yaml` (`apps/*`, `packages/*`),
   root `package.json` (private, packageManager pnpm), `turbo.json` with
   `build`, `typecheck`, `test`, `lint` pipelines, and `tsconfig.base.json`.
2. **`packages/domain`.** Pure TypeScript, zero framework/db imports. Add
   `money.ts` first: a `Cents` integer type and helpers — money is **integer
   cents**, never a float. Stub one exported function per domain module so
   typecheck passes.
3. **`packages/services/src/persistence`.** Postgres via `schema.sql`, behind the ports in `ports.ts` (an in-memory adapter exists for dev). Model the geo hierarchy
   (`Continent → Country → County → Tenant`) and give every tenant-owned table a
   non-null `tenantId`. Add a tenant-scoped client factory that always sets the
   RLS session variable (see `tenancy-guard`).
4. **`apps/admin`.** Next.js 15 / React 19 / TS, PWA-ready; imports domain only
   from `packages/domain`, data only through `packages/services/src/persistence`.
5. **`apps/mobile`** (not built yet). Expo app sharing `packages/domain`.
6. **Auth.** Supabase phone-OTP. Reference `SUPABASE_URL`,
   `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` as env var **names** only.
7. **Payments.** Define a `PaymentProvider` interface in `packages/domain` with a
   manual/dev adapter as default and an M-Pesa (Daraja / Africa's Talking)
   adapter selected by `PAYMENT_PROVIDER`. No gateway is a hard dependency.
8. **Subscription.** Model first-month-free then ~10 local-currency-units/month
   per tenant as data, priced in integer cents.
9. **Gate commands.** Ensure `pnpm turbo typecheck`, `pnpm turbo test`,
   `pnpm turbo lint`, `pnpm turbo build` all run from root and pass on the empty
   scaffold.

## Intended paths
`packages/domain/src/*`, `packages/services/src/persistence/schema.sql`,
`packages/services/src/persistence/ports.ts`, `apps/admin`, `apps/mobile`, `turbo.json`,
`pnpm-workspace.yaml`, `.env.example`.

## Guardrails
- Domain core stays pure — no Next/Expo/database imports in `packages/domain`.
- **Money is integer cents** from the first commit; never floating point.
- Every tenant-owned table carries `tenantId` and an RLS policy from day one.
- Secrets are env var **names** only; never commit real values.
- Scaffold must leave `pnpm turbo typecheck` green before handing off.
