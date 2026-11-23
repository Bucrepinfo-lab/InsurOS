import {
  maskPayerPhone,
  parsePremiumReference,
  policiesOfCustomer,
  premiumInvoiceFor,
  providerReferenceFrom,
  receiptNumberFor,
  type Customer,
  type Policy,
  type PremiumInvoice,
  type PremiumReceipt,
  yearFrom
} from '@insuros/domain';
import { MarketplaceService, PaymentLedgerService, getPersistence, type PaymentTxnView } from '@insuros/services';
import { samplePremiumPayments } from '@insuros/mocks';
import { premiumPaymentsEnabled } from '@/lib/payments-gate';
import '@/lib/tenant-context';

/*
  Everything the customer page needs to pay a premium in one tap and to show
  receipts. The invoice is always worked out here, on the server, from the
  policy; the page never sends an amount.
*/

export type InvoiceState = 'due' | 'waiting' | 'paid';

export interface PayablePolicy {
  policy: Policy;
  invoice: PremiumInvoice;
  state: InvoiceState;
  /** The payment waiting for the customer's PIN, or the one that paid it. */
  txnId?: string;
}

const ledger = new PaymentLedgerService();
const prefix = (policyId: string) => `PREM:${policyId}:`;

/** A payment younger than this and not finished blocks a second prompt (no double charge). */
const WAITING_MS = 3 * 60_000;

function stateFor(invoice: PremiumInvoice, payments: PaymentTxnView[], now: Date): { state: InvoiceState; txnId?: string } {
  const mine = payments.filter((payment) => payment.policyReference === invoice.reference);
  const paid = mine.find((payment) => payment.status === 'SUCCESS');
  if (paid) return { state: 'paid', txnId: paid.id };
  const waiting = mine.find(
    (payment) => (payment.status === 'REQUESTED' || payment.status === 'PENDING') && now.getTime() - Date.parse(payment.createdAt) < WAITING_MS
  );
  return waiting ? { state: 'waiting', txnId: waiting.id } : { state: 'due' };
}

export async function customerPolicies(customer: Customer): Promise<Policy[]> {
  return policiesOfCustomer(await getPersistence().policies.findAll(), customer);
}

/** Invoices this customer can pay now, each with its state. */
export async function payablePolicies(customer: Customer, now = new Date()): Promise<PayablePolicy[]> {
  const policies = await customerPolicies(customer);
  const withInvoice = policies
    .map((policy) => ({ policy, invoice: premiumInvoiceFor(policy, now) }))
    .filter((row): row is { policy: Policy; invoice: PremiumInvoice } => row.invoice !== null);
  if (withInvoice.length === 0) return [];
  const payments = await ledger.findByReferencePrefixes(withInvoice.map((row) => prefix(row.policy.id)));
  return withInvoice.map((row) => ({ ...row, ...stateFor(row.invoice, payments, now) }));
}

/** The invoice for one of this customer's policies, checked on the server. */
export async function invoiceForCustomer(customer: Customer, policyId: string, now = new Date()): Promise<PayablePolicy | null> {
  return (await payablePolicies(customer, now)).find((row) => row.policy.id === policyId) ?? null;
}

async function insurerFor(policy: Policy): Promise<string> {
  const product = (await new MarketplaceService().getProducts()).find((candidate) => candidate.name === policy.product);
  return product?.carrier ?? 'Your insurer';
}

async function agencyName(): Promise<string> {
  const tenants = await getPersistence().tenants.findAll();
  return tenants[0]?.name ?? 'InsurOS';
}

function receiptFrom(
  policy: Policy,
  periodStart: string,
  payment: { id: string; paidAt: string; amount: number; currency: string; method: string; providerReference?: string; phone?: string; sample?: boolean },
  insurer: string,
  issuedBy: string
): PremiumReceipt {
  const isNew = !policy.startDate || periodStart <= policy.startDate;
  return {
    receiptNumber: receiptNumberFor(payment.id, payment.paidAt),
    paidAt: payment.paidAt,
    invoiceNumber: `INV-${policy.policyNumber}-${periodStart.replace(/-/g, '')}`,
    kind: isNew ? 'New cover' : 'Renewal',
    receivedFrom: policy.customer,
    insurer,
    issuedBy,
    policyNumber: policy.policyNumber,
    product: policy.product,
    insuredItem: policy.insuredItem,
    periodStart,
    periodEnd: isNew && policy.expiryDate ? policy.expiryDate : yearFrom(periodStart),
    amount: payment.amount,
    currency: payment.currency,
    method: payment.method,
    providerReference: payment.providerReference,
    payer: maskPayerPhone(payment.phone),
    sample: payment.sample
  };
}

export interface ReceiptLine {
  txnId: string;
  receipt: PremiumReceipt;
}

/** Every paid premium of this customer, newest first: real payments, then demo samples for sample policies. */
export async function customerReceipts(customer: Customer): Promise<ReceiptLine[]> {
  const policies = await customerPolicies(customer);
  if (policies.length === 0) return [];
  const byId = new Map(policies.map((policy) => [policy.id, policy]));
  const issuedBy = await agencyName();
  const lines: ReceiptLine[] = [];

  const payments = await ledger.findByReferencePrefixes(policies.map((policy) => prefix(policy.id)));
  for (const payment of payments) {
    if (payment.status !== 'SUCCESS') continue;
    const ref = parsePremiumReference(payment.policyReference);
    const policy = ref ? byId.get(ref.policyId) : undefined;
    if (!ref || !policy) continue;
    const success = [...payment.entries].reverse().find((entry) => entry.status === 'SUCCESS');
    lines.push({
      txnId: payment.id,
      receipt: receiptFrom(
        policy,
        ref.periodStart,
        {
          id: payment.id,
          paidAt: success?.recordedAt ?? payment.updatedAt,
          amount: payment.amount,
          currency: payment.currency,
          method: 'M-Pesa',
          providerReference: providerReferenceFrom(success?.raw),
          phone: payment.phone
        },
        await insurerFor(policy),
        issuedBy
      )
    });
  }

  for (const sample of samplePremiumPayments) {
    const policy = byId.get(sample.policyId);
    const ref = parsePremiumReference(sample.reference);
    if (!policy || !ref) continue;
    lines.push({
      txnId: sample.txnId,
      receipt: receiptFrom(policy, ref.periodStart, { id: sample.txnId, paidAt: sample.paidAt, amount: sample.amount, currency: sample.currency, method: sample.method, providerReference: sample.providerReference, phone: sample.phone, sample: true }, await insurerFor(policy), issuedBy)
    });
  }

  return lines.sort((a, b) => b.receipt.paidAt.localeCompare(a.receipt.paidAt));
}

export async function customerReceipt(customer: Customer, txnId: string): Promise<ReceiptLine | undefined> {
  return (await customerReceipts(customer)).find((line) => line.txnId === txnId);
}

export { premiumPaymentsEnabled };
