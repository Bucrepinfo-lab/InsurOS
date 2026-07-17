# ADR-006: Architecture Pattern Verdict — Locked

**Status:** Accepted and locked (2026-07-17, owner decision)

## Context

After building 20+ modules across governance, tax, legal, sales, claims automation, microinsurance, subscriptions, and engagement, the owner requested a merits/demerits assessment of the standing pattern (Domain → Mocks → Services → UI, custom UI kit, docs/ADRs) and locked the resulting verdict.

## Decision (the locked verdict)

For what InsurOS is — one owner, one AI collaborator, many similar modules, credibility-critical domain, pre-infrastructure stage — the merits dominate heavily, and the demerits are mostly deferred costs with scheduled answers: the persistence ports absorb the mock-to-database risk, and the design system doc disciplines the UI kit.

## Re-examination triggers

The moment to re-examine is after real load arrives:

1. If a module's service layer stays a pure pass-through for months, collapse it.
2. If a screen fights the page template, let it break the pattern deliberately.

Patterns should serve the product, never the reverse.

## Standing observation mandate

A scheduled weekly observation run (Mondays 07:00, task `insuros-weekly-observation`) reviews the repo, CI, and workflows with timelines, builds needful improvements under this locked verdict, validates green, and commits locally. The owner's sole role is approving pushes and deployments. Autonomous runs never touch secrets and defer anything requiring owner credentials to the activation checklist in PRD §Lock state.
