import { NextResponse } from "next/server";
import { toE164 } from "@insuros/domain";
import { supabaseEnabled } from "@/lib/supabase-enabled";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requestPremiumCheckout } from "@/lib/payments";

/**
 * Start an M-Pesa STK-push premium payment for the signed-in policyholder (their
 * login phone is the payer). Requires an authenticated Supabase session.
 */
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!supabaseEnabled) {
    return NextResponse.json({ error: "auth_not_configured" }, { status: 401 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const phone = user?.phone ? toE164(user.phone) : null;
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
    const status = result.reason === "invalid_amount" ? 400 : 502;
    return NextResponse.json({ error: result.reason, txnId: result.txnId }, { status });
  }
  return NextResponse.json({ ok: true, txnId: result.txnId, providerTxnId: result.providerTxnId });
}
