# InsurOS — session memory

Dated log of shipped changes and decisions (newest first). Update it in the same
change as the work (docs/STANDING_RULES.md §5).

## 2026-11-17 — Value story: a pain and its answer on every section (owner brief)
- Strategy and copy rules: `docs/VALUE_STRATEGY.md` (research with sources, the 12 earlier points checked against today's product and reconciled into 8 pillars, banned claims, audit findings).
- Copy source: `packages/domain/src/value-story.ts` (20 stories, `storyForPath`, `publicStories`, share helpers). Guards: `packages/domain/test/value-story.test.ts` (every nav link has a story, every link is a real page, every story reachable from home, banned claims, lengths) and `no-dead-buttons.test.ts`.
- Shell: `apps/admin/src/components/dashboard-shell.tsx` wraps `AdminWorkspaceShell` (grouped, collapsible sidebar with router links and active state; working section search; notifications link; no tenant "switcher" button). `ValueBanner` renders above every dashboard page; folded state per story in `localStorage` (`insuros.value.hidden`).
- Home `/dashboard`: real counts through `*For(reach)` and role-filtered next-step cards (the hard-coded sample KPIs are gone). Public `/why`: sourced facts, story cards with anchors, share (device share sheet, else WhatsApp / email / copy).
- Truth fixes: Documents page no longer says uploads are read (nothing is uploaded yet); micro page no longer says index covers pay automatically; sample CRM, engagement and newsletter copy rewritten (new tenants only: seeded reference rows in existing tenants are unchanged); `MarketingBanner` draws its call to action only when it has a link; `Tabs` draws only tabs that lead somewhere.
- Removed 58 empty-state buttons and 2 assessment buttons that did nothing.
- **Open (owner):** real upload + document reading (storage and reader choice); real data-entry forms in place of the sample-row actions; usage insight collection (persistence); refresh of seeded sample messages in existing tenants.

## 2026-11-17 — Production is live at https://getinsuros.com
- Fly app `insuros` (fra) deployed by `Deploy (Fly)` run #10 after PR #21; `/api/health` → `{"status":"ok","auth":"supabase","persistence":"postgres"}` on getinsuros.com, www and insuros.fly.dev.
- Domain decision (owner, 17/11/26): **getinsuros.com is the main address** (global .com, matches getstawi.com). **insuros.net** (bought 07/08/26) now 301-forwards to https://getinsuros.com at GoDaddy; its old Fly certificates can be removed once the forward's HTTPS is confirmed. All domains' registrant is Telpen Systems Ltd.
- Providers: Neon project `insuros` (Frankfurt, direct connection); Supabase project `insuros` (ref cjohkzyfzokjsnbecsea) in the Telpen Systems Ltd org — phone provider on, OTP 300 s, Send-SMS hook → `https://insuros.fly.dev/api/auth/send-sms`, Site URL https://getinsuros.com, redirects getinsuros.com/**, *.getinsuros.com/**, insuros.fly.dev/**; Africa's Talking team/app **InsurOS** (username `insuros`), separate from HarvestHub and Stawi.
- Fly secrets set (names only): AUTH_SECRET, AT_USERNAME, NEXT_PUBLIC_SUPABASE_URL, DATABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_SEND_SMS_HOOK_SECRET, PLATFORM_OWNER_PHONES. GitHub secrets: FLY_API_TOKEN, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY.
- **Open (owner):** `AT_API_KEY` (Africa's Talking locked key requests after a mistyped code; retry, then add as one Fly secret and redeploy) and a wallet top-up — until then the sign-in SMS cannot send. `CLERK_SECRET_KEY` is an unused leftover secret. Play Console app not created yet (owner creates it and accepts the declarations; listing pack in docs/PLAY-LISTING.md).

## 2026-11-17 — Sign-in SMS reaches Africa's Talking with the "+" (fix from Stawi, 17/11/26)
- Supabase's Send-SMS hook passes `user.phone` as bare digits ("2547..."); Africa's Talking needs "+E.164", so the code SMS failed (hook 502). New `toSmsRecipient` (packages/domain/src/phone.ts): bare 11-15 digits are already international (no second country code), local forms keep the Kenya default. `sendSms` normalises every recipient (refuses `invalid_phone`), the hook sends and rate-limits on the normalised number. Tests: `packages/domain/test/sms-recipient.test.ts`.
- Production provisioning for getinsuros.com started 17/11/26 (Fly certs + GoDaddy DNS); see the next entry when it is live.

## 2026-11-14 — SMS is transactional only (TELPEN sender)
- Owner 14/11/26: the "TELPEN" sender ID is for transactional SMS only. `sendSms(to, message, purpose)` (apps/admin/src/lib/africastalking/sms.ts) requires `"otp" | "transactional"` (typecheck enforces it at every caller) and refuses anything else; promotion goes through in-app messaging.

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
