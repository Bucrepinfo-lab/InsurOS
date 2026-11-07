"use server";

import { isSmsCode, maskPhone, toE164 } from "@insuros/domain";
import { getAuthMode } from "./config";
import {
  clearSessionCookie,
  clientIp,
  deviceLabel,
  getDeviceAuth,
  readAuthCookies,
  setDeviceCookie,
  setSessionCookie
} from "./device-auth";
import { getSessionIdentity } from "./session-user";
import { PLAY_REVIEW_USER_ID, isPlayReviewPhone, matchesPlayReview } from "../play-review";
import { createSupabaseOtpClient } from "../supabase/otp";

/**
 * Sign-in server actions (owner rule 07/11/26):
 * phone → 6-digit SMS code (first sign-in on a device, new device, forgotten or
 * locked PIN) → trusted device + 4-digit PIN for later sign-ins.
 * Everything is decided on the server; responses never reveal whether a phone
 * number has an account.
 */
export type SignInResult =
  | { ok: true; next: string }
  | { ok: false; error: string; lockedOut?: boolean };

const GENERIC_SEND_ERROR = "We could not send a code right now. Wait a few minutes and try again.";
const RATE_LIMITED = "Too many attempts. Wait a few minutes and try again.";

function safeNext(next: string | undefined): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export async function requestSmsCode(phoneInput: string): Promise<{ ok: boolean; phone?: string; error?: string }> {
  if (getAuthMode() !== "supabase") return { ok: false, error: "Sign-in is not available on this server." };
  const phone = toE164(phoneInput);
  if (!phone) return { ok: false, error: "Enter a valid phone number, e.g. 0712 345 678." };

  const auth = getDeviceAuth();
  const ip = await clientIp();
  if (!(await auth.consume("sms_send_ip", ip)) || !(await auth.consume("sms_send_phone", phone))) {
    return { ok: false, error: RATE_LIMITED };
  }

  // Store reviewer: no SMS — the configured code is used instead.
  if (!isPlayReviewPhone(phone)) {
    const { error } = await createSupabaseOtpClient().auth.signInWithOtp({
      phone,
      options: { shouldCreateUser: true }
    });
    if (error) return { ok: false, error: GENERIC_SEND_ERROR };
  }

  await auth.markCodeSent(phone);
  return { ok: true, phone };
}

export async function verifySmsCode(
  phoneInput: string,
  codeInput: string,
  options: { resetPin?: boolean; next?: string } = {}
): Promise<SignInResult> {
  if (getAuthMode() !== "supabase") return { ok: false, error: "Sign-in is not available on this server." };
  const phone = toE164(phoneInput);
  const code = codeInput.trim();
  if (!phone || !isSmsCode(code)) return { ok: false, error: "Enter the 6-digit code." };

  const auth = getDeviceAuth();
  const ip = await clientIp();
  if (!(await auth.consume("sms_verify_ip", ip)) || !(await auth.consume("sms_verify_phone", phone))) {
    return { ok: false, error: RATE_LIMITED };
  }
  // Codes live at most 5 minutes and work once (also enforced by Supabase).
  if (!(await auth.isCodeFresh(phone)) || !(await auth.isCodeUnused(phone))) {
    return { ok: false, error: "That code has expired. Request a new one." };
  }

  let userId: string;
  if (isPlayReviewPhone(phone)) {
    if (!matchesPlayReview(phone, code)) return { ok: false, error: "That code is not right." };
    userId = PLAY_REVIEW_USER_ID;
  } else {
    const { data, error } = await createSupabaseOtpClient().auth.verifyOtp({ phone, token: code, type: "sms" });
    if (error || !data.user) return { ok: false, error: "That code is not right, or it has expired." };
    userId = data.user.id;
  }
  await auth.markCodeUsed(phone);

  const { needsPin } = await auth.afterSmsVerified(userId, Boolean(options.resetPin));

  // Reuse this browser's trusted device if it belongs to the same user.
  const cookiesNow = await readAuthCookies();
  let device = await auth.validateDevice(cookiesNow.device);
  if (!device || device.userId !== userId) {
    const registered = await auth.registerDevice(userId, phone, await deviceLabel());
    device = registered.device;
    await setDeviceCookie(registered.token);
  } else {
    await auth.touchDevice(device.id);
  }

  const { token } = auth.issueSession({ uid: userId, phone, did: device.id, via: "sms" });
  await setSessionCookie(token);

  // No PIN yet (first sign-in, or cleared after lockout / "forgot PIN"):
  // choose one now. The store reviewer may skip it.
  return {
    ok: true,
    next: needsPin ? `/set-pin?next=${encodeURIComponent(safeNext(options.next))}` : safeNext(options.next)
  };
}

/** Later sign-in on a trusted device: 4-digit PIN. 5 wrong → SMS code required. */
export async function unlockWithPin(pin: string, next?: string): Promise<SignInResult> {
  if (getAuthMode() !== "supabase") return { ok: false, error: "Sign-in is not available on this server." };
  const auth = getDeviceAuth();
  if (!(await auth.consume("pin_ip", await clientIp()))) return { ok: false, error: RATE_LIMITED };

  const device = await auth.validateDevice((await readAuthCookies()).device);
  if (!device) return { ok: false, error: "This device is no longer trusted. Sign in with an SMS code.", lockedOut: true };

  const check = await auth.verifyPin(device.userId, pin);
  if (check.outcome === "ok") {
    await auth.touchDevice(device.id);
    const { token } = auth.issueSession({ uid: device.userId, phone: device.phone, did: device.id, via: "pin" });
    await setSessionCookie(token);
    return { ok: true, next: safeNext(next) };
  }
  if (check.outcome === "wrong") {
    return { ok: false, error: `Wrong PIN. ${check.remaining} ${check.remaining === 1 ? "try" : "tries"} left.` };
  }
  return {
    ok: false,
    lockedOut: true,
    error: check.outcome === "locked" ? "Too many wrong PINs. Verify with an SMS code to continue." : "Sign in with an SMS code."
  };
}

/** Choose (or replace) the 4-digit PIN — needs a session verified on this device. */
export async function choosePin(pin: string, confirm: string, next?: string): Promise<SignInResult> {
  const identity = await getSessionIdentity();
  if (!identity) return { ok: false, error: "Your session has ended. Sign in again." };
  if (pin !== confirm) return { ok: false, error: "The two PINs do not match." };
  const result = await getDeviceAuth().setPin(identity.userId, identity.phone, pin);
  return result.ok ? { ok: true, next: safeNext(next) } : { ok: false, error: result.error ?? "Choose a different PIN." };
}

/** Sign out on this device. The device stays trusted, so next time = PIN. */
export async function signOut(): Promise<void> {
  await clearSessionCookie();
}

/** What the sign-in screen should show for this browser. */
export async function signInMode(): Promise<{ mode: "pin"; phoneHint: string } | { mode: "sms" }> {
  if (getAuthMode() !== "supabase") return { mode: "sms" };
  const auth = getDeviceAuth();
  const device = await auth.validateDevice((await readAuthCookies()).device);
  if (device && (await auth.hasPin(device.userId))) return { mode: "pin", phoneHint: maskPhone(device.phone) };
  return { mode: "sms" };
}
