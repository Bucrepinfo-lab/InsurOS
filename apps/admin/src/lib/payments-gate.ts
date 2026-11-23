import { isPaymentsEnabled } from "@insuros/domain";

/**
 * Server-side money gate (v1: OFF). Premium checkout (STK push) and any
 * automatic claim approval/payout run only when PAYMENTS_ENABLED=true.
 * The code stays in place for re-enabling after production and IRA review.
 */
export function paymentsEnabled(): boolean {
  return isPaymentsEnabled(process.env.PAYMENTS_ENABLED);
}

/**
 * Customers paying their premiums from their cover page (owner, 23/11/26).
 * A second switch on top of PAYMENTS_ENABLED, off until the owner confirms
 * whose M-Pesa account receives premiums (the insurer's or the licensed
 * agency's, never Telpen Systems') and turns PREMIUM_PAYMENTS_ENABLED=true.
 */
export function premiumPaymentsEnabled(): boolean {
  return paymentsEnabled() && process.env.PREMIUM_PAYMENTS_ENABLED === "true";
}
