/** Structured result returned by every dashboard server action. */
export interface ActionResult {
  ok: boolean;
  message: string;
}

export function ok(message: string): ActionResult {
  return { ok: true, message };
}

export function fail(message: string): ActionResult {
  return { ok: false, message };
}
