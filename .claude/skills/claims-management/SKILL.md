---
name: claims-management
description: Use when building the claims lifecycle in InsurOS — intake → adjudication → reserving → settlement, fraud flagging, and the rule that no payout is ever executed without human authorization. Triggers — "register a claim", "adjudicate this claim", "set a reserve", "flag possible fraud", "settle a claim", "model the claims workflow".
---

# claims-management

**Purpose:** Handle claims from first notice through settlement as a guarded,
auditable workflow, with reserving and fraud flags — and an absolute rule that a
human authorizes every payout. The engine assesses and prepares; it never pays.

## When to use
- First notice of loss / claim registration.
- Adjudication (coverage check, liability, quantum), reserving, or settlement.
- Fraud/irregularity flagging and referral.

## Lifecycle (intended)
In `packages/core/src/claims.ts`:
```
REPORTED ─▶ UNDER_REVIEW ─▶ ADJUDICATED ─▶ APPROVED ─▶ SETTLED
                     │              │            └▶ (human authorizes payout)
                     └▶ DECLINED    └▶ REFERRED (fraud/complex → human)
```
- **Intake** — capture FNOL against an in-force policy and its covered perils.
- **Adjudication** — coverage verification (policy version in force at loss
  date), liability, and quantum; produce a reason-coded decision.
- **Reserving** — set/adjust a case reserve (integer cents) as the best estimate
  of ultimate cost; every change is versioned.
- **Fraud flags** — rule-based indicators (timing, frequency, inconsistency)
  raise a flag and force a human referral; a flag never auto-declines.
- **Settlement** — compute the payable amount, deductibles, and salvage;
  **prepare** a settlement — a human authorizes the actual payout.

## Core entities
- **Claim** (tenant-owned, policy ref, loss date, status, perils claimed).
- **Reserve** (versioned, cents, actor, timestamp).
- **Adjudication** (decision, reason codes, coverage basis).
- **FraudFlag** (indicator, severity, referral state).
- **SettlementAuthorization** (computed amount, approver, timestamp) — required
  before any disbursement.

## Steps
1. **Register** FNOL; resolve the policy version in force at the loss date.
2. **Adjudicate** coverage, liability, and quantum with reason codes.
3. **Reserve**: set/update the case reserve; version every change.
4. **Screen** for fraud; raise flags and refer — never auto-settle a flagged
   claim.
5. **Prepare settlement** (amount in cents, net of deductible/salvage) and route
   for **human authorization**.
6. **Record** every state change immutably.

## Intended paths
`packages/core/src/claims.ts`, `packages/db/prisma/schema.prisma`
(Claim, Reserve, Adjudication, FraudFlag, SettlementAuthorization).

## Guardrails
- **NO AUTONOMOUS PAYOUT.** The system computes and prepares a settlement; a
  human with authority approves before any money moves. This is non-negotiable.
- **Fraud flags refer, never auto-decline** a claim on their own.
- **Auditable**: decisions, reserves, flags, and authorizations are immutable and
  reproducible for a regulator or dispute.
- **Money in integer cents**; reserves and settlements never floats.
- **Tenant-locked**; claims reference only that tenant's policies.
- Coverage is judged against the policy version in force at the loss date.
