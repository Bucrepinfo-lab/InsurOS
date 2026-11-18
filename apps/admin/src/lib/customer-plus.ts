import { DEFAULT_COUNTRY, PLUS_UNITS_PER_MONTH, clockFor, parsePlusReference, plusStatus, profileFor, withPaidMonth, type Customer, type PlusStatus } from '@insuros/domain';
import { getPersistence } from '@insuros/services';
import { paymentsEnabled } from '@/lib/payments-gate';

/**
 * My Cover Plus for a customer, on their country's clock and currency. The
 * free month starts the first time they open their page. Payments stay off
 * until the money gate is opened, and while they are off Plus is open to all.
 */
export async function plusFor(customer: Customer, now = new Date()): Promise<PlusStatus> {
  let account = customer;
  if (!customer.plusStartedAt) {
    account = (await getPersistence().customers.update(customer.id, { plusStartedAt: now.toISOString() })) ?? { ...customer, plusStartedAt: now.toISOString() };
  }
  return plusStatus(account, {
    now,
    timeZone: clockFor(DEFAULT_COUNTRY).timeZone,
    currency: profileFor(DEFAULT_COUNTRY)?.currency ?? 'KES',
    paymentsOn: paymentsEnabled()
  });
}

/**
 * After the M-Pesa result comes back: a successful Plus payment unlocks its
 * month for that customer. Records only; runs again harmlessly.
 */
export async function recordPlusPayment(txn: { status: string; amount: number; policyReference?: string } | undefined): Promise<boolean> {
  const plus = parsePlusReference(txn?.policyReference);
  if (!txn || !plus || txn.status !== 'SUCCESS' || txn.amount < PLUS_UNITS_PER_MONTH) return false;
  const customers = getPersistence().customers;
  const customer = await customers.findById(plus.customerId);
  if (!customer) return false;
  await customers.update(customer.id, withPaidMonth(customer, plus.month));
  return true;
}
