---
name: insurance-compliance
description: Use when building or reviewing anything touching Kenya insurance regulation (IRA), the Data Protection Act 2019, statutory returns, audit trails, or regulatory reporting in InsurOS. Every regulatory claim must cite its source and be flagged "verify against current regulation".
---

# insurance-compliance

**Purpose:** Keep InsurOS and its tenants on the right side of Kenyan insurance
regulation and data-protection law — product/intermediary eligibility, statutory
returns, audit trails, and privacy controls — with every regulatory statement
sourced and flagged for verification.

## When to use
- Checking whether a product or intermediary may transact (IRA eligibility).
- Building statutory returns, premium-levy reporting, or audit exports.
- Data Protection Act questions: lawful basis, retention, data-subject rights,
  cross-border transfer, ODPC obligations.
- Any feature that makes a regulatory or legal claim to a user.

## MANDATORY source rule
Every legal/regulatory assertion MUST:
1. **Cite its source** (named Act, regulation, IRA guideline/circular, or
   official page) — never state a rule from memory alone.
2. **Carry the flag:** `⚠ verify against current regulation` — regulation and
   rates change; the current text governs, and a licensed compliance
   officer/counsel confirms before production reliance.
Do **not** invent statute sections, circular numbers, rates, or deadlines. If
unverified, say so and route to the Research and Legal agents.

## Scope (intended)
In `packages/core/src/compliance.ts`:
- **Eligibility gates** — a product is sellable and an intermediary may transact
  only when its regulatory status is confirmed; otherwise the sale/issue path is
  blocked (fail closed).
- **Statutory returns & reporting** — IRA premium/returns and premium-levy data,
  generated from the ledger and policy records.
- **Audit trail** — immutable, reconstructable history of products, underwriting
  decisions, policies, claims, and money, available for a regulator or dispute.
- **Data Protection Act controls** — lawful basis per processing purpose,
  retention schedules, data-subject-rights handling, and transfer rules.

## Steps
1. **Identify** the regulatory question and jurisdiction (Kenya first).
2. **Research & cite** the governing rule; attach the verify-against-current flag.
3. **Gate**: hand the Operation Agent the eligibility/retention/blocked-state
   requirements; confirm issue/settle/pay paths enforce them.
4. **Report**: build the return/audit export from source records, not re-keyed
   figures.
5. **Record** the decision, source, and effective date in the decision log.

## Intended paths
`packages/core/src/compliance.ts`, `packages/db/prisma/schema.prisma`
(AuditRecord, RetentionPolicy, RegulatoryReturn, EligibilityStatus).

## Guardrails
- **Cite-your-source + verify-against-current-regulation is mandatory** on every
  regulatory claim — no exceptions.
- InsurOS is software; the tenant is the regulated entity and carries its own
  duties — never advise around licensing.
- **DPA**: minimise personal data, enforce retention, honour data-subject rights.
- **Fail closed**: unconfirmed eligibility or a broken audit path blocks the
  regulated action.
- Provide regulatory **information, not legal advice**; counsel/compliance
  officer decides.
