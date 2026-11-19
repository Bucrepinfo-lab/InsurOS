import { DEFAULT_COUNTRY, PLUS_PADDLE_PRICES, subscriptionRail, type SubscriptionRail, applyPlusPayment, clockFor, listPriceFor, paddleConfig, parsePlusReference, plusPaymentReference, plusStatus, type Customer, type PlusPlan, type PlusStatus } from '@insuros/domain';
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

/**
 * Paddle card checkout for My Cover Plus (owner decision 19/11/26: Paddle is
 * the merchant of record for cards and handles the tax). Only behind the money
 * gate, only for Plus, never premiums. The reference names the customer, the
 * first month and the plan; it travels in Paddle's custom data.
 */
/**
 * How a customer pays for Plus (owner rule 19/11/26): Paddle first wherever it
 * sells (Kenya included; it remits the tax), else M-Pesa in Kenya, else none.
 */
export function plusRail(): SubscriptionRail {
  return subscriptionRail({ country: DEFAULT_COUNTRY, paddleOn: paddleConfig(process.env, PLUS_PADDLE_PRICES) !== null });
}

export function plusCardCheckout(customer: Customer, status: PlusStatus): {
  environment: 'sandbox' | 'production';
  clientToken: string;
  priceIds: Record<PlusPlan, string>;
  references: Record<PlusPlan, string>;
} | null {
  if (!paymentsEnabled() || plusRail() !== 'PADDLE') return null;
  const cfg = paddleConfig(process.env, PLUS_PADDLE_PRICES);
  if (!cfg) return null;
  return {
    environment: cfg.environment,
    clientToken: cfg.clientToken,
    priceIds: { MONTH: cfg.prices.MONTH, YEAR: cfg.prices.YEAR },
    references: {
      MONTH: plusPaymentReference(customer.id, status.month, 'MONTH'),
      YEAR: plusPaymentReference(customer.id, status.month, 'YEAR')
    }
  };
}

/**
 * A card payment confirmed by Paddle unlocks the months its reference names.
 * The plan must match the price bought (our price id, so its price was paid,
 * in Paddle's currency). Idempotent: unlocking the same months twice keeps one entry.
 */
export async function recordPlusCardPayment(reference: string, boughtPlan: PlusPlan, now = new Date()): Promise<boolean> {
  const plus = parsePlusReference(reference);
  if (!plus || plus.plan !== boughtPlan) return false;
  const customers = getPersistence().customers;
  const customer = await customers.findById(plus.customerId);
  if (!customer) return false;
  // The amount check in applyPlusPayment is for M-Pesa shillings; a Paddle
  // price id already proves the plan's price was paid.
  const applied = applyPlusPayment(customer, { month: plus.month, plan: plus.plan, amount: Number.MAX_SAFE_INTEGER, list: listPriceFor(DEFAULT_COUNTRY), now, foundingUntil: plusFoundingUntil() });
  if (!applied.ok) return false;
  await customers.update(customer.id, applied.update);
  return true;
}
