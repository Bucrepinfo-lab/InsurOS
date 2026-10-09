---
name: policy-administration
description: Use when building the policy lifecycle in InsurOS — the quote → bind → issue → endorse → renew → cancel state machine, its data schemas, documents, and transition guards. Triggers — "bind this quote", "issue a policy", "add an endorsement", "handle renewal", "cancel a policy", "model the policy state machine".
---

# policy-administration

**Purpose:** Administer the policy lifecycle as an explicit, guarded state
machine so a policy only ever moves through legal transitions, every change is
versioned, and premium impacts flow to billing.

## When to use
- Converting an accepted quote into an in-force policy.
- Any mid-term change (endorsement), renewal, or cancellation.
- Modelling the policy schema, documents, or transition rules.

## Lifecycle state machine (intended)
In `packages/core/src/policy.ts`:
```
QUOTE ──bind──▶ BOUND ──issue──▶ ISSUED (in force)
  ISSUED ──endorse──▶ ISSUED (new endorsement version)
  ISSUED ──renew──▶ RENEWED (new term) | LAPSED (not renewed)
  ISSUED ──cancel──▶ CANCELLED (with effective date + refund calc)
```
- **Quote** — priced, from `underwriting-rules`; expires if not bound.
- **Bind** — commitment to cover; locks product + rate-table version.
- **Issue** — policy in force; generates the schedule/certificate document.
- **Endorse** — mid-term change (risk, cover, insured); creates a new policy
  version and a premium adjustment (pro-rata, integer cents).
- **Renew** — new term from the current or latest product version.
- **Cancel** — effective-dated; computes return premium (pro-rata/short-rate).

## Core entities
- **Policy** (tenant-owned, status, term dates, insured, product version).
- **PolicyVersion / Endorsement** (immutable snapshots of terms).
- **PolicyDocument** (schedule, certificate, endorsement wording).
- **Transition** (from-state, to-state, actor, timestamp, reason) — the audit.

## Steps
1. **Load** the accepted quote and its locked product/rate-table versions.
2. **Transition** only via allowed edges; reject illegal transitions explicitly.
3. **Version** on every endorsement; never mutate an in-force version in place.
4. **Compute premium impact** (integer cents) and hand it to
   `billing-and-payments`.
5. **Generate documents** on issue/endorse/renew.
6. **Record** every transition immutably for audit.

## Intended paths
`packages/core/src/policy.ts`, `packages/db/prisma/schema.prisma`
(Policy, PolicyVersion, Endorsement, PolicyDocument, Transition).

## Guardrails
- **Guarded transitions**: the state machine is a pure function; illegal moves
  throw, never silently pass.
- **Immutable versions + full transition audit** — reconstruct any policy's
  history and terms at any date.
- **Money in integer cents**; proration and return premium rounded to cents
  deterministically.
- **Tenant-locked**; a policy and its documents belong to one tenant.
- Cancellation refunds are *computed here* but **not paid here** — settlement
  goes through Finance with human authorization (no autonomous money movement).
