import { DEFAULT_COUNTRY, applyPlusPayment, clockFor, listPriceFor, parsePlusReference, plusStatus, type Customer, type PlusStatus } from '@insuros/domain';
import { getPersistence } from '@insuros/services';
import { paymentsEnabled } from '@/lib/payments-gate';

/**
 * When the founding window closes: set PLUS_FOUNDING_UNTIL (ISO date) to 12
 * months after Plus payments go live. Unset means not launched yet, so anyone
 * who pays now still gets the founding price.
 */
export function plusFoundingUntil(): string | null {
  const raw = process.env.PLUS_FOUNDING_UNTIL?.trim();
  return raw && !Number.isNaN(Date.parse(raw)) ? raw : null;
}

/**
 * My Cover Plus for a customer, on their country's clock and price. The free
 * month starts the first time they open their page. Payments stay off until
 * the money gate is opened, and while they are off Plus is open to all.
 */
export async function plusFor(customer: Customer, now = new Date()): Promise<PlusStatus> {
  let account = customer;
  if (!customer.plusStartedAt) {
    account = (await getPersistence().customers.update(customer.id, { plusStartedAt: now.toISOString() })) ?? { ...customer, plusStartedAt: now.toISOString() };
  }
  return plusStatus(account, {
    now,
    timeZone: clockFor(DEFAULT_COUNTRY).timeZone,
    list: listPriceFor(DEFAULT_COUNTRY),
    paymentsOn: paymentsEnabled()
  });
}

/**
 * After the M-Pesa result comes back: a successful Plus payment unlocks its
 * month (or its 12 months for a yearly plan) and, on a first payment inside
 * the founding window, locks the founding price. Records only; runs again
 * harmlessly; an amount below the plan's price unlocks nothing.
 */
export async function recordPlusPayment(txn: { status: string; amount: number; policyReference?: string } | undefined, now = new Date()): Promise<boolean> {
  const plus = parsePlusReference(txn?.policyReference);
  if (!txn || !plus || txn.status !== 'SUCCESS') return false;
  const customers = getPersistence().customers;
  const customer = await customers.findById(plus.customerId);
  if (!customer) return false;
  const applied = applyPlusPayment(customer, { month: plus.month, plan: plus.plan, amount: txn.amount, list: listPriceFor(DEFAULT_COUNTRY), now, foundingUntil: plusFoundingUntil() });
  if (!applied.ok) {
    console.error('[plus] payment below the plan price, not applied', applied.reason);
    return false;
  }
  await customers.update(customer.id, applied.update);
  return true;
}
