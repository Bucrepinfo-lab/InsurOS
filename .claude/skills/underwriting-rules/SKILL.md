---
name: underwriting-rules
description: Use when building or changing risk assessment, premium rating, or the underwriting rule engine in InsurOS — accept/refer/decline decisions, rate tables, loadings/discounts, and the audit trail behind every decision. Triggers — "price this risk", "add an underwriting rule", "when do we refer vs decline", "build the rating engine", "make underwriting auditable".
---

# underwriting-rules

**Purpose:** Assess risk, compute premium from configurable rating factors, and
run a deterministic, auditable rule engine that yields accept / refer / decline —
so every decision can be explained and reproduced.

## When to use
- Pricing a quote from a product's rating factors.
- Adding/changing underwriting rules (eligibility, loadings, discounts, referral
  and decline triggers).
- Making an underwriting decision reproducible and auditable.

## Core model (intended)
In `packages/domain/src/pricing.ts (underwriting rules; add `underwriting.ts` there if they outgrow it)`:
- **RateTable** — maps a product's rating factors (from `product-definition`) to
  base rates and relativities; versioned. Output premium in **integer cents**.
- **UnderwritingRule** — a declarative rule: condition over risk attributes →
  outcome (`ACCEPT` / `REFER` / `DECLINE`) with a reason code. Rules are data,
  evaluated in a defined order; the engine is a pure function.
- **RiskInput** — the normalized facts about the proposed risk.
- **RatingResult** — premium (cents), applied loadings/discounts, the decision,
  the triggered rule(s), and a full factor-by-factor breakdown.
- **UnderwritingAuditRecord** — immutable: inputs, rate-table version, rules
  fired, decision, actor, timestamp.

## Steps
1. **Gather** `RiskInput` and resolve the product + rate-table version.
2. **Rate**: apply base rate and relativities factor by factor; keep the
   breakdown. All arithmetic in integer cents.
3. **Evaluate rules** in order: eligibility first, then loadings/discounts, then
   accept/refer/decline triggers. Produce reason codes.
4. **Decide**: ACCEPT (bindable quote), REFER (human underwriter required), or
   DECLINE (with reason). Never silently drop a risk.
5. **Record** an immutable `UnderwritingAuditRecord` for every decision.
6. **Hand off** an accepted quote to `policy-administration` for bind.

## Intended paths
`packages/domain/src/pricing.ts (underwriting rules; add `underwriting.ts` there if they outgrow it)`,
`packages/services/src/persistence/schema.sql` (RateTable, UnderwritingRule,
UnderwritingAuditRecord).

## Guardrails
- **Deterministic & pure**: same inputs + same versions → same result. The
  engine is a pure function in `packages/domain`; no side effects.
- **Auditable**: every decision stores inputs, versions, rules fired, and reason
  — reproducible for a regulator or dispute.
- **REFER is a human gate**: referrals require a licensed underwriter's
  decision; the engine never auto-binds a referred risk.
- **Money in integer cents**; relativities as explicit typed factors.
- **Tenant-locked**: rules and rate tables belong to one tenant.
- Rating assumptions that affect solvency/pricing adequacy are flagged for a
  licensed actuary — the engine computes, it does not certify adequacy.
