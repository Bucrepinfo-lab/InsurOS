import { isValidPaymentAmount, mapAtPaymentStatus, type PaymentStatus } from "@insuros/domain";
import { mobileCheckout } from "@/lib/africastalking/payments";

/**
 * Premium payment service — M-Pesa via Africa's Talking. Records every request to
 * an in-memory ledger (the mock-persistence ethos of this app) and reconciles it
 * from the AT callback. MONEY-BLOCK: only this session-authorised path moves money.
 * When PostgreSQL lands, swap the Map for a real table with no call-site changes.
 */
export interface PaymentTxn {
  id: string;
  status: PaymentStatus;
  providerTxnId?: string;
  phone: string;
  amount: number;
  currency: string;
  policyReference?: string;
  rawCallback?: unknown;
  createdAt: string;
  updatedAt: string;
}

const ledger = new Map<string, PaymentTxn>();

export function findByProviderTxnId(providerTxnId: string): PaymentTxn | undefined {
  for (const txn of ledger.values()) {
    if (txn.providerTxnId === providerTxnId) return txn;
  }
  return undefined;
}

export type CheckoutResult =
  | { ok: true; txnId: string; providerTxnId: string | null }
  | { ok: false; reason: "invalid_amount" | "provider_error"; txnId?: string };

/** STK push to the signed-in policyholder's own phone (premium collection). */
export async function requestPremiumCheckout(input: {
  phone: string;
  amount: number;
  policyReference?: string;
}): Promise<CheckoutResult> {
  if (!isValidPaymentAmount(input.amount)) {
    return { ok: false, reason: "invalid_amount" };
  }

  const now = new Date().toISOString();
  const txn: PaymentTxn = {
    id: `pay-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    status: "REQUESTED",
    phone: input.phone,
    amount: input.amount,
    currency: "KES",
    policyReference: input.policyReference,
    createdAt: now,
    updatedAt: now
  };
  ledger.set(txn.id, txn);

  const result = await mobileCheckout({
    phoneNumber: input.phone,
    amount: input.amount,
    metadata: { ledgerId: txn.id, ...(input.policyReference ? { policyReference: input.policyReference } : {}) }
  });

  txn.status = result.ok ? "PENDING" : "FAILED";
  txn.providerTxnId = result.transactionId ?? undefined;
  txn.rawCallback = result.raw;
  txn.updatedAt = new Date().toISOString();
  ledger.set(txn.id, txn);

  return result.ok
    ? { ok: true, txnId: txn.id, providerTxnId: result.transactionId }
    : { ok: false, reason: "provider_error", txnId: txn.id };
}

/** Reconcile a ledger row from the AT async result. Records only — never initiates. */
export function reconcile(providerTxnId: string, status: string, raw: unknown): boolean {
  const txn = findByProviderTxnId(providerTxnId);
  if (!txn) return false;
  txn.status = mapAtPaymentStatus(status);
  txn.rawCallback = raw;
  txn.updatedAt = new Date().toISOString();
  ledger.set(txn.id, txn);
  return true;
}
