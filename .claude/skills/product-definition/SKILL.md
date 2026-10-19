---
name: product-definition
description: Use when modelling or extending an insurance product in InsurOS — coverages, limits, deductibles, perils, and rating factors as configurable data (not hardcoded). Triggers — "add a motor product", "model coverages and limits", "make deductibles configurable", "define rating factors", "set up the product catalog".
---

# product-definition

**Purpose:** Model insurance products as configurable entities so a tenant can
define and version its own products without code changes. Coverages, limits,
deductibles, perils, and rating factors are data, not hardcoded branches.

## When to use
- Introducing a new product line (motor, health, property, life, agriculture).
- Adding or versioning coverages, limits, deductibles, or rating factors.
- Making an existing product's pricing inputs configurable.

## Core entities (intended)
Model in `packages/domain/src/pricing.ts`, persist in `packages/services/src/persistence`:
- **Product** — a tenant-owned, versioned insurance product (line of business,
  currency, status: draft → active → retired).
- **Coverage** — an insured peril/benefit within a product (e.g. third-party
  liability, theft, hospitalization).
- **Limit** — per-coverage maximum payable (per-occurrence, aggregate,
  sub-limits), **in integer cents**.
- **Deductible / Excess** — fixed-cents or percentage, per coverage.
- **RatingFactor** — a configurable input to pricing (age band, vehicle value
  band, location/county, sum insured, claims history) with allowed values and
  effect; consumed by `underwriting-rules`.
- **ProductVersion** — immutable snapshot so in-force policies keep their
  original terms while new business uses the latest.

## Steps
1. **Confirm** the line of business, geography, and currency with Research/owner.
2. **Define** the product shell (line, currency, status) scoped to one tenant.
3. **Add coverages**, each with limits (cents), deductibles, and exclusions.
4. **Declare rating factors** as data — name, type, allowed values/bands — not
   conditionals in code. Underwriting reads these.
5. **Version** on any material change; never mutate a version an in-force policy
   points to.
6. **Validate**: currency consistency, non-negative cents, factor completeness.

## Intended paths
`packages/domain/src/pricing.ts`, `packages/services/src/persistence/schema.sql`
(Product, Coverage, Limit, Deductible, RatingFactor, ProductVersion).

## Guardrails
- **Configurable, not hardcoded** — coverages, limits, deductibles, and factors
  are tenant data. Avoid per-product code branches.
- **Money in integer cents**; percentages stored explicitly as basis points or a
  typed percentage, never ambiguous floats.
- **Tenant-locked**: a product belongs to exactly one tenant; no shared globals.
- **Immutable versions**: in-force policies reference the version they were sold
  on. New terms create a new version.
- A product does not go sellable until Legal confirms wording/eligibility.
