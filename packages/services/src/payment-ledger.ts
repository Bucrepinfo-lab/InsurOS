import {
  canTransitionPayment,
  type PaymentLedgerEntry,
  type PaymentStatus
} from "@insuros/domain";
import { getPersistence } from "./persistence";

/** Current view of one payment transaction, folded from its ledger entries. */
export interface PaymentTxnView {
  id: string;
  status: PaymentStatus;
  providerTxnId?: string;
  phone: string;
  amount: number;
  currency: string;
  policyReference?: string;
  createdAt: string;
  updatedAt: string;
  entries: PaymentLedgerEntry[];
}

export function foldPaymentTxn(entries: PaymentLedgerEntry[]): PaymentTxnView | undefined {
  if (entries.length === 0) return undefined;
  const first = entries[0];
  const last = entries[entries.length - 1];
  const providerTxnId = [...entries].reverse().find((entry) => entry.providerTxnId)?.providerTxnId;
  return {
    id: first.txnId,
    status: last.status,
    ...(providerTxnId ? { providerTxnId } : {}),
    phone: last.phone,
    amount: first.amount,
    currency: first.currency,
    ...(first.policyReference ? { policyReference: first.policyReference } : {}),
    createdAt: first.recordedAt,
    updatedAt: last.recordedAt,
    entries
  };
}

/**
 * Payment ledger service — RECORDS ONLY. It never initiates a charge or payout;
 * callers (behind PAYMENTS_ENABLED + a human-authorised session) do that.
 * Every status change appends an entry; nothing is updated or deleted.
 */
export class PaymentLedgerService {
  private get ledger() {
    return getPersistence().paymentLedger;
  }

  async open(input: {
    txnId: string;
    phone: string;
    amount: number;
    currency: string;
    policyReference?: string;
  }): Promise<PaymentTxnView> {
    await this.ledger.append({ ...input, status: "REQUESTED" });
    return (await this.get(input.txnId))!;
  }

  async get(txnId: string): Promise<PaymentTxnView | undefined> {
    return foldPaymentTxn(await this.ledger.history(txnId));
  }

  /**
   * Append a status change if the FSM allows it. Idempotent: a repeated or
   * illegal transition appends nothing and returns false.
   */
  async transition(
    txnId: string,
    status: PaymentStatus,
    detail: { providerTxnId?: string; raw?: unknown } = {}
  ): Promise<boolean> {
    const current = await this.get(txnId);
    if (!current || !canTransitionPayment(current.status, status)) return false;
    await this.ledger.append({
      txnId,
      status,
      providerTxnId: detail.providerTxnId ?? current.providerTxnId,
      phone: current.phone,
      amount: current.amount,
      currency: current.currency,
      policyReference: current.policyReference,
      raw: detail.raw
    });
    return true;
  }

  async findByProviderTxnId(providerTxnId: string): Promise<PaymentTxnView | undefined> {
    const latest = await this.ledger.latestByProviderTxnId(providerTxnId);
    return latest ? this.get(latest.txnId) : undefined;
  }

  /** Account deletion: keep the rows, remove the payer's phone and raw payloads. */
  async deidentifyPayer(phone: string): Promise<number> {
    return this.ledger.deidentifyPhone(phone);
  }
}
