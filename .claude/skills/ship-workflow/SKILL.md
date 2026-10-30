---
name: ship-workflow
description: Use when committing, reviewing, or shipping InsurOS changes once code exists — the gate commands, one-PR-at-a-time delivery loop, and keeping the core domain tests green. Triggers — "ship this", "open a PR", "is this ready to commit", "run the gates", "what's the delivery loop".
---

# ship-workflow

**Purpose:** Deliver InsurOS changes safely and reviewably — gates pass, the core
domain stays green, and work lands one coherent PR at a time.

## When to use
- Preparing a commit or PR for any code change.
- Verifying a change is ready to ship.
- Setting up or running the CI gate.

> Greenfield note: until `architecture-scaffold` has run there is nothing to
> ship. Scaffold first, then use this loop for every slice.

## Gate commands (run from repo root)
Run and pass **all** before committing:
- `pnpm turbo typecheck` — the hard gate; never commit red.
- `pnpm turbo test` — core domain + app tests.
- `pnpm turbo lint`.
- `pnpm turbo build` — before a release PR.

## Delivery loop
1. **Scope** one vertical slice (one module or one coherent change). Keep PRs
   small enough to review in one sitting.
2. **Build** against the matching skill (product / underwriting / policy /
   claims / billing / compliance), routing all data access through the
   tenant-scoped client (`tenancy-guard`).
3. **Test**: add/extend `packages/domain` tests for new domain logic. Core logic
   is pure and must have tests; keep them green.
4. **Verify**: run every gate command; fix until all pass.
5. **Document**: update `README.md`, the backlog, and the dated decision log in
   the *same* change.
6. **Commit**: small, coherent, well-described message explaining the why.
7. **PR**: open **one PR at a time**; request review. Security-sensitive changes
   (auth, payments, RLS, PII, claims settlement) get an explicit review pass.
8. **Merge** only with gates green and review done; then start the next slice.

## Intended paths
`.github/workflows/ci.yml` (run the gate commands on PR), `turbo.json`
(pipeline definitions), `package.json` scripts.

## Guardrails
- **Never commit with a failing typecheck or red core tests.**
- **One PR at a time**; no sprawling multi-module PRs.
- Changes must preserve the non-negotiables: tenant isolation + RLS, integer
  cents, no autonomous money movement, no autonomous claim payout, and cited
  regulatory claims. Treat them as acceptance criteria in review.
- No secrets in commits — env var names only; verify no `.env` or key is staged.
- Keep commits free of line-ending-only churn.
- Owner standing rules (`docs/STANDING_RULES.md`) apply to every change: live stays live; fix once, fix everywhere; escalate, don't fix, in protected areas or after three failed attempts (`health-audit-guard` checks `fix/health-audit-*` PRs); never weaken a test; merge only green at the exact head SHA, confirm the health endpoint, and name the screens to retest (incl. 375 px).
