---
name: billing-and-payments
description: Use when building premium billing, installments, commissions, M-Pesa collection, or reconciliation in InsurOS. Triggers — "bill this premium", "set up installments", "compute broker commission", "collect via M-Pesa", "reconcile settlement", "handle the subscription charge". All money is integer cents; no autonomous money movement.
---

# billing-and-payments

**Purpose:** Turn premium and commission obligations into billed, collected, and
reconciled money — in integer cents, through a provider abstraction (M-Pesa
first) — while never moving money autonomously.

## When to use
- Billing a premium (full or installment) or a mid-term adjustment.
- Computing or paying broker/agent commissions.
- Collecting via M-Pesa or reconciling a settlement file.
- The InsurOS subscription charge (first month free → ~10 local units/month).

## Core model (intended)
In `packages/core/src/billing.ts`:
- **Invoice / Installment schedule** — premium split into dated installments;
  amounts in **integer cents**; proration from endorsements.
- **Payment** — a collection attempt through the `PaymentProvider` abstraction;
  manual/dev adapter default, M-Pesa (Daraja / Africa's Talking) selected by
  `PAYMENT_PROVIDER`. STK push for collection.
- **Commission** — broker/agent schedule, accrual, and statement.
- **Receipt** — immutable proof of a settled payment.
- **Reconciliation** — match provider/bank settlement to expected receipts;
  raise a variance alert on mismatch.
- **LedgerEntry** — every priced movement writes a ledger entry.

## Steps
1. **Generate** the invoice/installment schedule from the policy premium
   (integer cents, deterministic rounding).
2. **Collect**: initiate payment via the provider adapter (STK for M-Pesa);
   record attempt and result. Handle callbacks idempotently.
3. **Receipt**: on confirmed settlement, write an immutable receipt + ledger
   entry.
4. **Commissions**: accrue per schedule; prepare a commission statement.
5. **Reconcile**: match settlement to expected; flag variances for Finance.
6. **Subscription**: first month free, then ~10 local-currency units/month per
   tenant, priced in cents.

## Intended paths
`packages/core/src/billing.ts`,
`packages/core/src/payment-provider.ts` (the abstraction),
`packages/db/prisma/schema.prisma` (Invoice, Installment, Payment, Commission,
Receipt, Reconciliation, LedgerEntry).

## Guardrails
- **Money is integer cents** everywhere; never floating-point currency.
- **No autonomous money movement.** Payouts, refunds, commission disbursement,
  and remittances are *prepared* as an approval packet; a human authorizes.
- **Provider-neutral**: never hard-depend on one gateway; default to the
  manual/dev adapter. Config by env var **names** only — no secrets in code.
- **Idempotent collection**: provider callbacks must not double-charge or
  double-receipt.
- **Tenant-locked**: keep insurer premium/float separate from InsurOS
  subscription revenue; no cross-tenant co-mingling.
- Every settled payment produces a receipt + ledger entry; reconciliation
  variances fail closed (block dependent actions until resolved).
