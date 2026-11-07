import { isValidPaymentAmount, mapAtPaymentStatus, type PaymentStatus } from "@insuros/domain";
import { PaymentLedgerService, type PaymentTxnView } from "@insuros/services";
import { mobileCheckout } from "@/lib/africastalking/payments";
import { paymentsEnabled } from "@/lib/payments-gate";

/**
 * Premium payment service — M-Pesa via Africa's Talking, recorded in the
 * APPEND-ONLY payment ledger (Postgres when DATABASE_URL is set; memory in dev).
 * MONEY-BLOCK: only this session-authorised path moves money, and only when
 * PAYMENTS_ENABLED=true (off in v1).
 */
export type PaymentTxn = Omit<PaymentTxnView, "entries"> & { status: PaymentStatus };

const ledger = new PaymentLedgerService();

export async function findByProviderTxnId(providerTxnId: string): Promise<PaymentTxn | undefined> {
  return ledger.findByProviderTxnId(providerTxnId);
}

export type CheckoutResult =
  | { ok: true; txnId: string; providerTxnId: string | null }
  | { ok: false; reason: "invalid_amount" | "provider_error" | "payments_disabled"; txnId?: string };

/** STK push to the signed-in user's own phone (premium collection). */
export async function requestPremiumCheckout(input: {
  phone: string;
  amount: number;
  policyReference?: string;
}): Promise<CheckoutResult> {
  // Defence in depth: the route checks too, but no caller can bypass the gate.
  if (!paymentsEnabled()) {
    return { ok: false, reason: "payments_disabled" };
  }
  if (!isValidPaymentAmount(input.amount)) {
    return { ok: false, reason: "invalid_amount" };
  }

  const txnId = `pay-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  await ledger.open({
    txnId,
    phone: input.phone,
    amount: input.amount,
    currency: "KES",
    policyReference: input.policyReference
  });

  const result = await mobileCheckout({
    phoneNumber: input.phone,
    amount: input.amount,
    metadata: { ledgerId: txnId, ...(input.policyReference ? { policyReference: input.policyReference } : {}) }
  });

  await ledger.transition(txnId, result.ok ? "PENDING" : "FAILED", {
    providerTxnId: result.transactionId ?? undefined,
    raw: result.raw
  });

  return result.ok
    ? { ok: true, txnId, providerTxnId: result.transactionId }
    : { ok: false, reason: "provider_error", txnId };
}

/** Reconcile from the AT async result. Records only — never initiates. Idempotent. */
export async function reconcile(providerTxnId: string, status: string, raw: unknown): Promise<boolean> {
  const txn = await ledger.findByProviderTxnId(providerTxnId);
  if (!txn) return false;
  return ledger.transition(txn.id, mapAtPaymentStatus(status), { raw });
}

/**
 * Account deletion: de-identify a payer's ledger rows. Rows are RETAINED
 * (append-only financial record, never deleted); phone and raw payload removed.
 */
export async function deidentifyPayer(phone: string): Promise<number> {
  return ledger.deidentifyPayer(phone);
}
