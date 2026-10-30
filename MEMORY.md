# InsurOS — session memory

Dated log of shipped changes and decisions (newest first). Update it in the same
change as the work (docs/STANDING_RULES.md §5).

## 2026-10-25 — Owner standing rules adopted
- Owner standing rules from Telpen Edu (24/10/26) now apply here: `docs/STANDING_RULES.md` (live stays live, fix once / fix everywhere, escalate-don't-fix in protected areas or after 3 failed attempts, never weaken a test, merge only green at the exact head SHA, no autonomous money movement or claim payout).
- `.github/workflows/health-audit-guard.yml` fails any `fix/health-audit-*` PR that touches premiums/payments/commissions, claims settlement, tax, auth/roles/tenancy, approvals, persistence, deploy config or secrets, or weakens a test.
- New root `CLAUDE.md` points agents at the rules and the gate.
- Open: the repo has no automated tests yet, and no deploy workflow (Fly deploys are manual); `validate.yml` is the only CI gate.
