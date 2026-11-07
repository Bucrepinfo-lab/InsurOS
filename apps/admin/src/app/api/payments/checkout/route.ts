import { NextResponse } from "next/server";
import { toE164 } from "@insuros/domain";
import { supabaseEnabled } from "@/lib/supabase-enabled";
import { requestPremiumCheckout } from "@/lib/payments";
import { paymentsEnabled } from "@/lib/payments-gate";
import { authorizeRequest } from "@/lib/auth/session";

/**
 * Start an M-Pesa STK-push premium payment for the signed-in user (their login
 * phone is the payer).
 *
 * v1: DISABLED. Returns 403 unless PAYMENTS_ENABLED=true — the Play app is a
 * staff/agency operations tool, not a public insurance shop. When re-enabled it
 * still requires an active staff session with Finance:Execute.
 */
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!paymentsEnabled()) {
    return NextResponse.json({ error: "payments_disabled" }, { status: 403 });
  }

  const auth = await authorizeRequest("Finance", "Execute");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!supabaseEnabled) {
    return NextResponse.json({ error: "auth_not_configured" }, { status: 401 });
  }

  // The payer is the verified session phone (never a phone from the request).
  const phone = auth.principal.phone ? toE164(auth.principal.phone) : null;
  if (!phone) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as
    | { amount?: number; policyReference?: string }
    | null;
  if (!body || typeof body.amount !== "number") {
    return NextResponse.json({ error: "amount (number) required" }, { status: 400 });
  }

  const result = await requestPremiumCheckout({
    phone,
    amount: body.amount,
    policyReference: body.policyReference
  });
  if (!result.ok) {
    const status = result.reason === "invalid_amount" ? 400 : result.reason === "payments_disabled" ? 403 : 502;
    return NextResponse.json({ error: result.reason, txnId: result.txnId }, { status });
  }
  return NextResponse.json({ ok: true, txnId: result.txnId, providerTxnId: result.providerTxnId });
}
