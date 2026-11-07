# InsurOS Persistence

**Decision (07/11/26):** PostgreSQL via **postgres.js** (lightest path; no ORM),
behind the existing persistence ports. Supersedes the earlier DigitalOcean +
Drizzle plan (DigitalOcean is retired for this portfolio).

## Architecture

```text
Service → getPersistence() → tenant-routing adapter
                               ├── memory   (DATABASE_URL unset; dev/tests only)
                               └── postgres (DATABASE_URL set; REQUIRED in production)
```

- Every call resolves the request's tenant through `setTenantResolver` (the app
  reads it from the **server session**, never from client input) and delegates
  to that tenant's store. No resolver → tenant `default`.
- Production without `DATABASE_URL` fails closed (503, `/api/health` unhealthy).

## Tables (`persistence/migrations.ts`, additive only)

| Table | Purpose |
|---|---|
| `insuros_documents` | Every repository (tenants, regions, appointments = users, jurisdiction assignments = role mappings, policies, claims, customers, …) as a JSONB collection keyed by `(tenant_id, collection, id)`. `FORCE ROW LEVEL SECURITY` on `app.current_tenant_id`; queries also filter `tenant_id`. |
| `payment_ledger_entries` | Append-only payment ledger: one row per status change. A trigger rejects DELETE/TRUNCATE and any UPDATE other than payer de-identification (phone → `redacted`, raw → null). Tenant RLS as above. |
| `insuros_schema_migrations` | Applied migration versions. |
| `insuros_tenant_seeds` | Which datasets were seeded per tenant (platform metadata). |

Migrations run automatically on first use, in one transaction under an advisory
lock. Never edit an applied migration — append a new one (new tables / nullable
columns only).

## Seeding

- **Reference** datasets (regions, tax tables, adjudication rules, product
  catalogue, subscription plans, terms) → every tenant, once.
- **Sample** datasets (people, policies, claims, …) → only the demo tenant
  `play-review` (store reviewers). A production tenant starts empty.

## Durable vs not (as of 07/11/26)

Durable with `DATABASE_URL`: everything reached through `getPersistence()` —
tenants, staff appointments and role grants, policies, claims, customers, the
payment ledger, FNOL/adjudication, tax remittances, commissions, subscriptions,
micro-insurance, KPI snapshots, scene photos, OCR extractions, marketing content.

Still mock-only (read from `@insuros/mocks` directly, lost on restart if
mutated): workflows (policy/claim/customer/finance/marketplace), marketplace
products, comments, attachments, audit events, notifications, platform settings,
feature flags, roles catalogue (code-defined, by design). Move each to
`getPersistence()` by adding a dataset in `persistence/datasets.ts`.

## Tests

`packages/services/test/persistence-contract.ts` is the backend contract (CRUD,
erasure, tenant isolation, seeding, append-only ledger). It runs on memory
always and on PostgreSQL when `DATABASE_URL` is set (CI uses a throwaway
`postgres:16` service; the suite also checks RLS with a non-superuser role and
the ledger trigger).
