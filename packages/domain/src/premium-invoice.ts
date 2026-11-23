import type { Policy } from "./policy";
import type { PdfDocument } from "./pdf";

/*
  Paying a premium in one tap (owner, 23/11/26): the invoice is worked out from
  the policy on the server, so the customer only confirms. The amount is the
  premium on the policy, never a figure from the page. A record only: the
  money moves when the customer enters their own M-Pesa PIN (or card details on
  the card provider's page).
*/

export type InvoiceKind = "New cover" | "Renewal";

export interface PremiumInvoice {
  invoiceNumber: string;
  /** Carried through the payment and the ledger: PREM:<policyId>:<periodStart>. */
  reference: string;
  kind: InvoiceKind;
  policyId: string;
  policyNumber: string;
  product: string;
  insuredItem?: string;
  customer: string;
  amount: number;
  currency: string;
  /** yyyy-mm-dd */
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  issuedOn: string;
}

/** A renewal invoice is offered this many days before cover ends. */
export const RENEWAL_WINDOW_DAYS = 30;

const DAY = 86_400_000;
const iso = (date: Date) => date.toISOString().slice(0, 10);
const addDays = (value: string, days: number) => iso(new Date(Date.parse(`${value}T00:00:00Z`) + days * DAY));
/** One year of cover: the same date next year, less a day (05/01/26 to 04/01/27). */
export const yearFrom = (start: string): string => {
  const d = new Date(`${start}T00:00:00Z`);
  d.setUTCFullYear(d.getUTCFullYear() + 1);
  return iso(new Date(d.getTime() - DAY));
};

/** "KES 58,000" → 58000; unreadable → NaN. */
export function premiumAmount(policy: Pick<Policy, "premium">): number {
  const digits = policy.premium.replace(/[^0-9.]/g, "");
  return digits ? Math.round(Number(digits)) : Number.NaN;
}

export function premiumReference(policyId: string, periodStart: string): string {
  return `PREM:${policyId}:${periodStart}`;
}

export function parsePremiumReference(reference: string | undefined): { policyId: string; periodStart: string } | null {
  const match = /^PREM:(.+):(\d{4}-\d{2}-\d{2})$/.exec(reference ?? "");
  return match ? { policyId: match[1]!, periodStart: match[2]! } : null;
}

/**
 * The invoice a customer can pay today for this policy, or null when nothing
 * is due: a pending policy (new cover) or one whose cover ends within
 * RENEWAL_WINDOW_DAYS or has ended (renewal). Cancelled policies get none.
 */
export function premiumInvoiceFor(policy: Policy, now = new Date()): PremiumInvoice | null {
  const amount = premiumAmount(policy);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const today = iso(now);
  let kind: InvoiceKind;
  let periodStart: string;
  if (policy.status === "Pending") {
    kind = "New cover";
    periodStart = policy.startDate && policy.startDate > today ? policy.startDate : today;
  } else if (policy.status === "Active" || policy.status === "Expired") {
    if (!policy.expiryDate) return null;
    const daysLeft = Math.round((Date.parse(`${policy.expiryDate}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / DAY);
    if (daysLeft > RENEWAL_WINDOW_DAYS) return null;
    kind = "Renewal";
    // Renewal follows on from the old cover; after a gap, it starts today.
    periodStart = daysLeft >= 0 ? addDays(policy.expiryDate, 1) : today;
  } else {
    return null;
  }
  const periodEnd = kind === "New cover" && policy.expiryDate && policy.expiryDate > periodStart ? policy.expiryDate : yearFrom(periodStart);
  const dueDate = kind === "Renewal" && periodStart > today ? policy.expiryDate! : today;
  return {
    invoiceNumber: `INV-${policy.policyNumber}-${periodStart.replace(/-/g, "")}`,
    reference: premiumReference(policy.id, periodStart),
    kind,
    policyId: policy.id,
    policyNumber: policy.policyNumber,
    product: policy.product,
    insuredItem: policy.insuredItem,
    customer: policy.customer,
    amount,
    currency: policy.premium.match(/[A-Z]{3}/)?.[0] ?? "KES",
    periodStart,
    periodEnd,
    dueDate,
    issuedOn: today
  };
}

/** Everything printed on a premium receipt. */
export interface PremiumReceipt {
  receiptNumber: string;
  paidAt: string;
  invoiceNumber: string;
  kind: InvoiceKind;
  receivedFrom: string;
  insurer: string;
  issuedBy: string;
  policyNumber: string;
  product: string;
  insuredItem?: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
  currency: string;
  method: string;
  /** M-Pesa confirmation code or card authorisation, when the provider sent one. */
  providerReference?: string;
  /** Payer phone, masked (0712 *** 678). */
  payer?: string;
  sample?: boolean;
}

/** 2026-01-05T09:12:00Z → RCT-20260105-<last 6 digits of the payment id>. */
export function receiptNumberFor(txnId: string, paidAt: string): string {
  const digits = txnId.replace(/\D/g, "");
  const tail = digits ? digits.slice(-6).padStart(6, "0") : txnId.replace(/[^0-9A-Za-z]/g, "").slice(-6).toUpperCase();
  return `RCT-${paidAt.slice(0, 10).replace(/-/g, "")}-${tail}`;
}

/** +254712345678 → 0712 *** 678. */
export function maskPayerPhone(phone: string | undefined): string | undefined {
  if (!phone || !/^\+?\d{9,15}$/.test(phone)) return undefined;
  const local = phone.startsWith("+254") ? `0${phone.slice(4)}` : phone;
  return `${local.slice(0, 4)} *** ${local.slice(-3)}`;
}

/** M-Pesa code from an Africa's Talking result, when it carries one. */
export function providerReferenceFrom(raw: unknown): string | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const value = (raw as Record<string, unknown>).providerRefId;
  return typeof value === "string" && /^[A-Z0-9]{6,20}$/.test(value) ? value : undefined;
}

const ddmmyy = (value: string) => `${value.slice(8, 10)}/${value.slice(5, 7)}/${value.slice(2, 4)}`;
const money = (amount: number, currency: string) => `${currency} ${Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

/** The receipt as a PDF document (A4) for download. */
export function premiumReceiptPdf(receipt: PremiumReceipt): PdfDocument {
  return {
    title: "Official premium receipt",
    subtitle: `${receipt.receiptNumber}${receipt.sample ? " (sample)" : ""}`,
    blocks: [
      { kind: "heading", text: `${money(receipt.amount, receipt.currency)} received` },
      { kind: "text", text: `Paid on ${ddmmyy(receipt.paidAt)} at ${receipt.paidAt.slice(11, 16)} by ${receipt.method}.`, muted: true },
      { kind: "space", height: 8 },
      {
        kind: "pairs",
        rows: [
          ["Receipt number", receipt.receiptNumber],
          ["Invoice number", receipt.invoiceNumber],
          ["Received from", receipt.receivedFrom],
          ["Insurer", receipt.insurer],
          ["Issued by", receipt.issuedBy]
        ]
      },
      { kind: "space", height: 8 },
      { kind: "heading", text: "Policy" },
      {
        kind: "pairs",
        rows: [
          ["Policy number", receipt.policyNumber],
          ["Type of cover", receipt.product],
          ...(receipt.insuredItem ? ([["What is insured", receipt.insuredItem]] as [string, string][]) : []),
          ["Payment for", receipt.kind === "Renewal" ? "Renewal of cover" : "New cover"],
          ["Cover period", `${ddmmyy(receipt.periodStart)} to ${ddmmyy(receipt.periodEnd)}`]
        ]
      },
      { kind: "space", height: 8 },
      { kind: "heading", text: "Payment" },
      {
        kind: "table",
        headers: ["Description", "Amount"],
        rows: [
          [`Premium, ${receipt.product}, ${receipt.policyNumber}`, money(receipt.amount, receipt.currency)],
          ["Total paid", money(receipt.amount, receipt.currency)]
        ],
        widths: [0.7, 0.3]
      },
      {
        kind: "pairs",
        rows: [
          ["Method", receipt.method],
          ...(receipt.providerReference ? ([["Confirmation code", receipt.providerReference]] as [string, string][]) : []),
          ...(receipt.payer ? ([["Paid from", receipt.payer]] as [string, string][]) : []),
          ["Status", "Paid in full"]
        ]
      },
      { kind: "space", height: 10 },
      {
        kind: "text",
        text: "Keep this receipt. Cover runs for the period above once the insurer confirms the policy. Questions: reply through your cover page or call your agent.",
        size: 9,
        muted: true
      }
    ],
    footer: `${receipt.issuedBy} · Receipt ${receipt.receiptNumber}${receipt.sample ? " · SAMPLE, not a real payment" : ""}`
  };
}
