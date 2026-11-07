# InsurOS — session memory

Dated log of shipped changes and decisions (newest first). Update it in the same
change as the work (docs/STANDING_RULES.md §5).

## 2026-11-07 — Play-readiness blocks (owner goal: closed testing ~05/01/27, production ~30/01/27)
- #8 Auth: no admin fallback; unmapped users -> /access-pending; least-privilege staff roles (`packages/domain/src/access-control.ts`) enforced server-side in section layouts (ScopeGate), every server action and route handlers; first owner via `PLATFORM_OWNER_PHONES`; staff grant/revoke by phone at Governance -> Jurisdiction Access; production fails closed without Supabase (503 + unhealthy `/api/health`); Dockerfile/fly.toml use Supabase build args.
- #9 Money gate: `PAYMENTS_ENABLED` (default off) -> checkout + AT callback 403; claims auto-approval/payout off (adjuster decides). v1 = staff/agency tool, no public selling (owner-approved scope cut).
- #10 Account deletion: Supabase admin delete (`SUPABASE_SERVICE_ROLE_KEY`) + staff profile erasure + ledger de-identification (rows kept); public `/delete-account`.
- #11 Public `/privacy` (KDPA 2019), `/terms` (from docs/TERMS_AND_CONDITIONS.md v1.1), landing `/`.
- PWA: manifest (start `/?source=twa`), icons from `scripts/generate-icons.py`, `sw.js` (never caches pages/API), `/offline.html`, `/.well-known/assetlinks.json` from `ANDROID_CERT_FINGERPRINTS`; package `com.telpen.insuros`.
- CI: Validate = frozen install -> typecheck -> vitest (`packages/*/test`) -> lint (admin) -> build. `Lockfile sync` workflow refreshes pnpm-lock.yaml on non-main branches when a package.json changes. `Deploy (Fly)` runs after green Validate on main only when the `FLY_API_TOKEN` secret exists, then checks `/api/health`.
- Persistence: PostgreSQL adapter (postgres.js) behind the same ports. `DATABASE_URL` set -> durable; unset -> memory (dev only; production fails closed). Tables: `insuros_documents` (every repository as a JSONB collection, tenant_id + FORCE RLS on `app.current_tenant_id`), `payment_ledger_entries` (append-only; trigger blocks DELETE/TRUNCATE and any UPDATE except payer de-identification), `insuros_schema_migrations`, `insuros_tenant_seeds`. Migrations in `persistence/migrations.ts`, run automatically on first use under an advisory lock. Reference data seeded into every tenant; sample data only into the demo tenant `play-review`. Contract tests run on memory always and on a throwaway Postgres in CI.
- Play reviewer: when BOTH `PLAY_REVIEW_PHONE` and `PLAY_REVIEW_CODE` are set, that phone signs in with the code (no SMS; server-derived Supabase password via the service-role key) and is routed by the tenant resolver to the isolated demo tenant `play-review` (sample data) with a read-mostly reviewer role. The send-SMS hook skips that phone.
- Play listing inputs and Data safety answers: `docs/PLAY-LISTING.md`.
- Process note: #10 was merged a few seconds before its CI finished (CI then passed green on that SHA); all later merges wait for green at the exact head SHA.

## 2026-10-25 — Owner standing rules adopted
- Owner standing rules from Telpen Edu (24/10/26) now apply here: `docs/STANDING_RULES.md` (live stays live, fix once / fix everywhere, escalate-don't-fix in protected areas or after 3 failed attempts, never weaken a test, merge only green at the exact head SHA, no autonomous money movement or claim payout).
- `.github/workflows/health-audit-guard.yml` fails any `fix/health-audit-*` PR that touches premiums/payments/commissions, claims settlement, tax, auth/roles/tenancy, approvals, persistence, deploy config or secrets, or weakens a test.
- New root `CLAUDE.md` points agents at the rules and the gate.
- Open: the repo has no automated tests yet, and no deploy workflow (Fly deploys are manual); `validate.yml` is the only CI gate.
