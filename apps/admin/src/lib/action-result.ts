/**
 * Structured receipt returned by every dashboard server action. Each
 * acknowledgment is customized: a context headline, a traceable
 * reference, and the detail line.
 */
export interface ActionResult {
  ok: boolean;
  /** Context headline, e.g. "Claim auto-approved", "Enrolment confirmed". */
  title: string;
  /** Traceable reference, e.g. claim number, policy id, receipt code. */
  reference?: string;
  message: string;
}

export interface ReceiptExtras {
  reference?: string;
}

export function ok(title: string, message: string, extras?: ReceiptExtras): ActionResult {
  return { ok: true, title, message, ...extras };
}

export function fail(title: string, message: string, extras?: ReceiptExtras): ActionResult {
  return { ok: false, title, message, ...extras };
}
