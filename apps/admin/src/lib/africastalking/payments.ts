/**
 * Africa's Talking Payments (M-Pesa). The login phone IS the payment phone:
 * `mobileCheckout` fires an STK push so a policyholder pays a premium; `mobileB2C`
 * pays a claim/refund out. Money-block: only explicit, session-authorised flows
 * call these. Env: AT_USERNAME, AT_API_KEY, AT_PAYMENTS_PRODUCT_NAME.
 */
const isSandbox = () => process.env.AT_USERNAME === "sandbox";
const payBase = () =>
  isSandbox()
    ? "https://payments.sandbox.africastalking.com"
    : "https://payments.africastalking.com";

function headers() {
  return {
    apiKey: process.env.AT_API_KEY ?? "",
    "Content-Type": "application/json",
    Accept: "application/json"
  };
}

export interface CheckoutInput {
  phoneNumber: string;
  amount: number;
  currencyCode?: string;
  metadata?: Record<string, string>;
}

export interface CheckoutResult {
  ok: boolean;
  transactionId: string | null;
  raw: unknown;
}

export async function mobileCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  if (!process.env.AT_API_KEY || !process.env.AT_USERNAME) {
    return { ok: false, transactionId: null, raw: { error: "africastalking_not_configured" } };
  }
  const res = await fetch(`${payBase()}/mobile/checkout/request`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      username: process.env.AT_USERNAME,
      productName: process.env.AT_PAYMENTS_PRODUCT_NAME,
      phoneNumber: input.phoneNumber,
      currencyCode: input.currencyCode ?? "KES",
      amount: input.amount,
      metadata: input.metadata ?? {}
    })
  });
  const raw: unknown = await res.json().catch(() => ({}));
  const parsed = raw as { status?: string; transactionId?: string };
  return {
    ok: res.ok && parsed.status === "PendingConfirmation",
    transactionId: parsed.transactionId ?? null,
    raw
  };
}
