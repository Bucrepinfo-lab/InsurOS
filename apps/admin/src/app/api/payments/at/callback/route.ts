import { NextResponse } from "next/server";
import { reconcile } from "@/lib/payments";

/**
 * Africa's Talking Payments async callback. Set this URL as the AT payment
 * callback, appending `?token=<AT_PAYMENTS_CALLBACK_SECRET>`. Token-verified;
 * reconciles the premium ledger by AT transactionId. Records only.
 */
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const expected = process.env.AT_PAYMENTS_CALLBACK_SECRET;
  const token =
    new URL(req.url).searchParams.get("token") ?? req.headers.get("x-at-callback-secret");
  if (!expected || token !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { transactionId?: string; status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad payload" }, { status: 400 });
  }

  if (!body.transactionId) {
    return NextResponse.json({ error: "missing transactionId" }, { status: 400 });
  }

  reconcile(body.transactionId, body.status ?? "", body);
  return NextResponse.json({ status: "Success" });
}
