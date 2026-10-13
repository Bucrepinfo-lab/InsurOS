# InsurOS Persistence

**Decision (2026-07-06):** PostgreSQL on DigitalOcean Managed Databases, accessed via Drizzle ORM. Until the database is provisioned, an in-memory adapter over the mock datasets is the default backend — behaviour is identical, nothing persists across restarts.

## Architecture

Services depend on persistence **ports**, never on a concrete backend:

```text
Service → getPersistence() → PersistenceAdapter (ports.ts)
                               ├── memory-adapter.ts   (default; wraps @insuros/mocks)
                               └── postgres adapter    (Drizzle; lands with provisioning)
```

`getPersistence()` in `packages/services/src/persistence/` selects the backend: `DATABASE_URL` unset → memory; set → PostgreSQL (once the Drizzle adapter is wired). `AdminHierarchyService` is the reference migration — every other service should be moved off direct mock imports the same way.

## Schema

`packages/services/src/persistence/schema.sql` holds the full DDL: regions, appointments, jurisdiction assignments, tax jurisdictions/rules/remittances, sales agents/assignments, commission schedules/accruals, terms documents/acceptances — with FK integrity, status CHECKs, and hot-path indexes. Drizzle table definitions will be derived from this DDL.

## Provisioning steps (when ready)

1. Create a DO Managed PostgreSQL cluster; note the connection string.
2. Apply `schema.sql`; seed from `@insuros/mocks` via a one-off script.
3. `pnpm add drizzle-orm pg` in `packages/services`; implement `postgres-adapter.ts` against the ports.
4. Set `DATABASE_URL` in the deployment environment (never commit it).
5. Migrate remaining services from mock imports to `getPersistence()`.
