---
name: tenancy-guard
description: Use when adding or changing any database table, query, or API route in InsurOS, to enforce multi-tenant isolation over the continent → country → county → tenant hierarchy with query-layer scoping plus Postgres Row-Level Security. Triggers — "add a new table", "write a query", "new API route", "is this tenant-safe", "set up RLS", "model the geo hierarchy".
---

# tenancy-guard

**Purpose:** Guarantee that one tenant can never read or write another tenant's
data. Isolation is enforced twice — at the query layer (every access scoped to a
tenant) and at the database (Postgres Row-Level Security) — so a single missed
`where` cannot leak data.

## When to use
- Creating or altering any table, Prisma model, query, or API route.
- Reviewing whether a change is tenant-safe.
- Setting up or extending the geo hierarchy or RLS policies.

## Geo hierarchy (intended)
```
Continent ─▶ Country ─▶ County ─▶ Tenant ─▶ (all tenant-owned data)
```
A tenant belongs to a county, which rolls up to country and continent. Reporting
and data-residency rules key off this chain; isolation keys off `tenantId`.

## Conventions for every new table
1. **`tenantId` column** — non-null, foreign key to `Tenant`, on every
   tenant-owned table. No tenant-owned row exists without it.
2. **Index** `tenantId` (and composite indexes lead with it).
3. **RLS policy** — enable `ROW LEVEL SECURITY` and add a policy restricting
   rows to the current tenant, e.g. keyed on a session setting
   `app.current_tenant_id` set per request.
4. **Tenant-scoped client** — all access goes through the factory in
   `packages/db/src/client.ts`, which sets the RLS session variable and applies a
   default `tenantId` filter. No raw unscoped client in app code.
5. **No cross-tenant joins** except through explicitly reviewed
   platform/admin paths that set no tenant context deliberately.

## Steps
1. **Classify** the data: tenant-owned (needs `tenantId` + RLS) vs platform
   reference (geo hierarchy, product templates) vs auth.
2. **Add** `tenantId`, the index, and the RLS policy in the same migration as the
   table.
3. **Route** all reads/writes through the tenant-scoped client; the resolved
   tenant comes from the authenticated session, never from client input.
4. **Test** isolation: a query under tenant A must return zero of tenant B's
   rows even if B's id is supplied.

## Intended paths
`packages/db/prisma/schema.prisma` (Continent, Country, County, Tenant +
`tenantId` on owned tables), `packages/db/src/client.ts` (scoped factory),
`packages/db/prisma/migrations/*` (RLS policies).

## Guardrails
- **Two-layer isolation is mandatory**: query-layer scoping AND Postgres RLS.
  Never rely on application `where` clauses alone.
- **Tenant id comes from the session/token**, never from a request body/param.
- A table without `tenantId` + RLS does not ship (unless it is explicitly
  platform-reference data, reviewed as such).
- **Fail closed**: no tenant context set → no tenant-owned rows returned.
- Cross-tenant access exists only on reviewed admin paths, never by default.
