import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { sendSms } from "@/lib/africastalking/sms";
import { toE164 } from "@insuros/domain";
import { getDeviceAuth } from "@/lib/auth/device-auth";
import { isPlayReviewPhone } from "@/lib/play-review";

/**
 * Supabase Send-SMS hook → Africa's Talking. Configure this URL as the Send-SMS
 * hook in Supabase with the same SUPABASE_SEND_SMS_HOOK_SECRET; we verify the
 * Standard-Webhooks HMAC, then deliver the OTP.
 */
export const dynamic = "force-dynamic";

function verify(rawBody: string, headers: Headers, secret: string): boolean {
  const id = headers.get("webhook-id") ?? "";
  const timestamp = headers.get("webhook-timestamp") ?? "";
  const sigHeader = headers.get("webhook-signature") ?? "";
  if (!id || !timestamp || !sigHeader) return false;

  const b64 = secret.replace(/^v1,/, "").replace(/^whsec_/, "");
  const key = Buffer.from(b64, "base64");
  const signed = `${id}.${timestamp}.${rawBody}`;
  const expected = crypto.createHmac("sha256", key).update(signed).digest("base64");

  return sigHeader.split(" ").some((part) => {
    const sig = part.split(",")[1] ?? part;
    try {
      return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
    } catch {
      return false;
    }
  });
}

export async function POST(req: Request) {
  const secret = process.env.SUPABASE_SEND_SMS_HOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "hook not configured" }, { status: 500 });
  }

  const rawBody = await req.text();
  if (!verify(rawBody, req.headers, secret)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let payload: { user?: { phone?: string }; sms?: { otp?: string } };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "bad payload" }, { status: 400 });
  }

  const phone = payload.user?.phone;
  const otp = payload.sms?.otp;
  if (!phone || !otp) {
    return NextResponse.json({ error: "missing phone or otp" }, { status: 400 });
  }

  // Store-review phone signs in with its configured code; no SMS is sent to it.
  if (isPlayReviewPhone(phone)) {
    return NextResponse.json({});
  }

  // Per-number limit on EVERY path that asks Supabase for a code (including
  // direct API calls with the public key). Supabase surfaces the refusal.
  const e164 = toE164(phone) ?? phone;
  if (!(await getDeviceAuth().consume("sms_hook_phone", e164))) {
    return NextResponse.json(
      { error: { http_code: 429, message: "Too many codes requested for this number. Try again later." } },
      { status: 429 }
    );
  }

  const result = await sendSms(phone, `${otp} is your InsurOS sign-in code. It expires in 5 minutes. Do not share it.`, "otp");
  if (!result.ok) {
    return NextResponse.json({ error: "sms_send_failed", detail: result.raw }, { status: 502 });
  }

  return NextResponse.json({});
}
