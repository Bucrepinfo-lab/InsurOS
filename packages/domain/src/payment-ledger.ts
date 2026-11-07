import type { PaymentStatus } from "./payments";

/**
 * Payment ledger — APPEND-ONLY. Every status change is a new entry; the current
 * state of a transaction is its latest entry. Entries are never deleted; on
 * account deletion the payer's phone and raw provider payload are removed
 * (de-identified) and the financial facts stay.
 */
export interface PaymentLedgerEntry {
  /** Monotonic sequence (assigned by the store). */
  seq: number;
  txnId: string;
  status: PaymentStatus;
  providerTxnId?: string;
  /** Payer phone (E.164) or "redacted" after account deletion. */
  phone: string;
  /** Whole currency units (KES has no cents in M-Pesa). */
  amount: number;
  currency: string;
  policyReference?: string;
  raw?: unknown;
  recordedAt: string;
}

export type NewPaymentLedgerEntry = Omit<PaymentLedgerEntry, "seq" | "recordedAt"> & {
  recordedAt?: string;
};

export const REDACTED_PHONE = "redacted";
