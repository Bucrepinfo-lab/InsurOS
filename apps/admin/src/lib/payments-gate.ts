import { isPaymentsEnabled } from "@insuros/domain";

/**
 * Server-side money gate (v1: OFF). Premium checkout (STK push) and any
 * automatic claim approval/payout run only when PAYMENTS_ENABLED=true.
 * The code stays in place for re-enabling after production and IRA review.
 */
export function paymentsEnabled(): boolean {
  return isPaymentsEnabled(process.env.PAYMENTS_ENABLED);
}
