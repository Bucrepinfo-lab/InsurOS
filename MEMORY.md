# InsurOS — session memory

Dated log of shipped changes and decisions (newest first). Update it in the same
change as the work (docs/STANDING_RULES.md §5).

## 2026-11-07 — Escalation follow-ups approved by the owner (07/11/26)
- Record-scope rules (`TENANT_WIDE_ROLES`, `packages/domain/src/record-scope.ts`) confirmed as they are; recorded as owner-approved in docs/PRD.md.
- Jurisdiction grants: `PrincipalService.grantStaffAccess` refuses a region that is not Active (`isGrantableRegion` in `admin-hierarchy.ts`); the form shows "Access not granted — <region> is suspended — choose an active region"; the picker lists Active regions only. Owner approved this one check in the roles/tenancy area.
- Finance → Tax and Regional tax descriptions now read 06/07/26 (copy only; no tax logic changed).
- Backlog (docs/PRD.md): policy start/end/renewal dates with in-force derived from dates + status (protected); "assign claim to officer" action with audit trail.

## 2026-11-07 — Own-records pickers/lists, day-first dates, filters in the URL (ported from Telpen Edu fixes of 07/11/26)
- Record-level least privilege on top of the #8 roles (role definitions unchanged): `packages/domain/src/record-scope.ts` (`recordReach`, `canSee*`, `claimablePolicyOptions`, `uniqueBy`). Agent -> own customers/policies (`ownerUserId`) + claims they registered or on their own policies; Claims Officer -> claims assigned to / registered by them; desk roles see their desk; owner/Platform Admin see all. Fails closed (no View, no active grant, no staff id -> nothing). Store reviewer keeps the demo tenant's full view (`apps/admin/src/lib/record-scope.ts`).
- Server enforcement: `PolicyService/CustomerService/ClaimService.get*For(reach)`; `RecordGate` layouts on `claims/[claimId]`, `customers/[customerId]`, `policies/[policyId]`, `customers/[customerId]/policies/[policyId]` (404 when not yours); `ClaimService.registerClaim` re-checks the picked policy (exists, visible, in force). Demo policy/customer/claim actions stamp the creator's staff id.
- Dates: one formatter `packages/ui/src/utils/date-format.ts` (dd/mm/yy, 24 h, Africa/Nairobi, never the device locale); `DataTable` and CSV exports format ISO values through it; toast time uses it. No native date inputs exist yet — any new one must show a dd/mm label or a day-first control.
- Lists: search kept in the URL (`?q=` / per-list param); CSV exports exactly the rows the search shows (formatted cells). Policies, Claims, Customers: search + status filter applied on the server, same filtered set feeds table, summary cards and export. Customers page now reads the store (was a hard-coded list).
- Escalated items (resolved 07/11/26, see entry above): region Active check on grants; finance/tax copy dates; Policy has no term dates (start/end/renewal), so "in force" is status-only; `Claim` type (protected `claim.ts`) carries ownership fields only via `OwnedClaim`. Detail pages still render hard-coded sample ids.

## 2026-11-07 — Sign-in: phone + SMS code + PIN on trusted devices (owner standing rule, all apps)
- Phone → 6-digit SMS code (≤5 min, single use; server rate limits per number + per IP, plus per-number limit in the Send-SMS hook) on first sign-in on a device; then 4-digit PIN on that trusted device. New device / forgotten PIN / 5 wrong PINs → SMS again (lock clears the PIN; user chooses a new one). No email.
- Supabase only sends/verifies the code (no Supabase browser session). Identity = InsurOS signed app session (12 h, httpOnly) valid only with its trusted-device cookie (180 days sliding, SHA-256 of secret stored, revocable). Owners revoke a staff member's devices at Governance -> Jurisdiction Access; revoking access also revokes devices; account deletion revokes all devices and deletes the PIN.
- Migration v2: `auth_rate_events` (7-day retention), `auth_user_pins` (peppered bcrypt), `auth_trusted_devices` — platform-level identity tables (no tenant_id by design).
- Existing users: first sign-in after this change verifies by SMS, then must set a PIN (`needs-pin` state blocks every page/action until set).
- Reviewer: PLAY_REVIEW_PHONE + 6-digit PLAY_REVIEW_CODE typed as the SMS code; demo tenant only; PIN set or skip. No Supabase account is created for the reviewer.
- New required env: `AUTH_SECRET`.

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
