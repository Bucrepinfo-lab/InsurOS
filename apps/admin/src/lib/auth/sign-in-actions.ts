"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { isJoinCode, maskPhone, toE164 } from "@insuros/domain";
import { PrincipalService } from "@insuros/services";
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
import { platformOwnerPhones } from "./session";

/**
 * Sign-in server actions — owner 20/11/26: no SMS.
 * Step 1 the phone number (only a staff phone, a platform owner or the store
 * reviewer), step 2 the person's own 4-digit PIN — on any device. The first
 * time, a forgotten PIN or 5 wrong PINs: a one-time joining code from someone
 * who manages staff access, then a new PIN. Everything is decided on the
 * server; responses never reveal whether a phone number has an account.
 */
export type SignInResult =
  | { ok: true; next: string }
  | { ok: false; error: string; lockedOut?: boolean };

const RATE_LIMITED = "Too many attempts. Wait a few minutes and try again.";
const NO_MATCH = "That phone number and PIN do not match.";
const ASK_ADMIN = "Ask the person who manages your access for a joining code.";

const principals = new PrincipalService();

function safeNext(next: string | undefined): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

/** The account id for a phone that may sign in, or null. Accounts from before 20/11/26 keep their id. */
async function accountFor(phone: string): Promise<string | null> {
  if (isPlayReviewPhone(phone)) return PLAY_REVIEW_USER_ID;
  const owner = platformOwnerPhones().includes(phone);
  const appointment = owner ? null : await principals.staffAppointmentForPhone(phone);
  if (!owner && !appointment) return null;
  return getDeviceAuth().userIdForPhone(phone, appointment?.userId ?? `owner-${phone.replace(/\D/g, "")}`);
}

/** Open the session on this browser's device (reused when it is the same person's). */
async function openSession(userId: string, phone: string, via: "pin" | "code"): Promise<void> {
  const auth = getDeviceAuth();
  let device = await auth.validateDevice((await readAuthCookies()).device);
  if (!device || device.userId !== userId) {
    const registered = await auth.registerDevice(userId, phone, await deviceLabel());
    device = registered.device;
    await setDeviceCookie(registered.token);
  } else {
    await auth.touchDevice(device.id);
  }
  const { token } = auth.issueSession({ uid: userId, phone, did: device.id, via });
  await setSessionCookie(token);
}

/** Step 2: phone + 4-digit PIN, on any device. */
export async function signInWithPin(phoneInput: string, pin: string, next?: string): Promise<SignInResult> {
  if (getAuthMode() !== "supabase") return { ok: false, error: "Sign-in is not available on this server." };
  const phone = toE164(phoneInput);
  if (!phone || !/^\d{4}$/.test(pin)) return { ok: false, error: "Enter your phone number and 4-digit PIN." };
  const auth = getDeviceAuth();
  if (!(await auth.consume("pin_ip", await clientIp())) || !(await auth.consume("pin_phone", phone))) {
    return { ok: false, error: RATE_LIMITED };
  }

  if (isPlayReviewPhone(phone)) {
    if (!matchesPlayReview(phone, pin)) return { ok: false, error: NO_MATCH };
    await openSession(PLAY_REVIEW_USER_ID, phone, "pin");
    return { ok: true, next: safeNext(next) };
  }

  const userId = await accountFor(phone);
  if (!userId) return { ok: false, error: NO_MATCH };
  const check = await auth.verifyPin(userId, pin);
  if (check.outcome === "ok") {
    await openSession(userId, phone, "pin");
    return { ok: true, next: safeNext(next) };
  }
  if (check.outcome === "wrong") {
    return { ok: false, error: `${NO_MATCH} ${check.remaining} ${check.remaining === 1 ? "try" : "tries"} left.` };
  }
  // No PIN yet, or locked: same answer whether or not the number is known.
  return { ok: false, lockedOut: true, error: check.outcome === "locked" ? `Too many wrong PINs. ${ASK_ADMIN}` : `${NO_MATCH} First time? ${ASK_ADMIN}` };
}

/** Owner bootstrap: a fixed code for platform-owner phones only (Fly secret), e.g. when the only owner is locked out. */
function matchesOwnerBootstrap(phone: string, code: string): boolean {
  const configured = (process.env.PLATFORM_OWNER_BOOTSTRAP_CODE ?? "").trim();
  if (!/^\d{6}$/.test(configured) || !platformOwnerPhones().includes(phone)) return false;
  const a = createHash("sha256").update(code).digest();
  const b = createHash("sha256").update(configured).digest();
  return timingSafeEqual(a, b);
}

/** First time, forgotten or locked PIN: phone + joining code → choose a new PIN. */
export async function redeemJoiningCode(phoneInput: string, codeInput: string, next?: string): Promise<SignInResult> {
  if (getAuthMode() !== "supabase") return { ok: false, error: "Sign-in is not available on this server." };
  const phone = toE164(phoneInput);
  const code = codeInput.replace(/\s/g, "");
  if (!phone) return { ok: false, error: "Enter a valid phone number, e.g. 0712 345 678." };
  if (!isJoinCode(code)) return { ok: false, error: "Enter the 6-digit joining code." };
  const auth = getDeviceAuth();
  if (!(await auth.consume("code_verify_ip", await clientIp())) || !(await auth.consume("code_verify_phone", phone))) {
    return { ok: false, error: RATE_LIMITED };
  }

  const userId = await accountFor(phone);
  const redeemed = userId && !isPlayReviewPhone(phone)
    ? matchesOwnerBootstrap(phone, code) ? ({ ok: true } as const) : await auth.redeemJoinCode(phone, code)
    : ({ ok: false, reason: "none" } as const);
  if (!redeemed.ok || !userId) {
    const why =
      redeemed.ok === false && redeemed.reason === "burned"
        ? "That code has been tried too many times. Ask for a new one."
        : redeemed.ok === false && redeemed.reason === "wrong"
          ? "That joining code is not right. Check it and try again."
          : "There is no open joining code for this number. Ask for a new one.";
    return { ok: false, error: why };
  }

  await auth.afterCodeRedeemed(userId, phone);
  await openSession(userId, phone, "code");
  return { ok: true, next: `/set-pin?next=${encodeURIComponent(safeNext(next))}` };
}

/** Choose (or replace) the 4-digit PIN — needs a session on this device. */
export async function choosePin(pin: string, confirm: string, next?: string): Promise<SignInResult> {
  const identity = await getSessionIdentity();
  if (!identity) return { ok: false, error: "Your session has ended. Sign in again." };
  if (pin !== confirm) return { ok: false, error: "The two PINs do not match." };
  const result = await getDeviceAuth().setPin(identity.userId, identity.phone, pin);
  return result.ok ? { ok: true, next: safeNext(next) } : { ok: false, error: result.error ?? "Choose a different PIN." };
}

/** Sign out on this device. Next time: phone + PIN. */
export async function signOut(): Promise<void> {
  await clearSessionCookie();
}

/** The masked number this browser last signed in with, if any (never the full number). */
export async function signInHint(): Promise<{ phoneHint?: string }> {
  if (getAuthMode() !== "supabase") return {};
  const device = await getDeviceAuth().validateDevice((await readAuthCookies()).device);
  return device ? { phoneHint: maskPhone(device.phone) } : {};
}
