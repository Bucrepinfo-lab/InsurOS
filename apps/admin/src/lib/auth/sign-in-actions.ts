"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { DEMO_VISITOR_PHONE, DEMO_VISITOR_USER_ID, demoVisitsEnabled, isJoinCode, maskPhone, toE164 } from "@insuros/domain";
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
 * Sign-in server actions — owner 20/11/26: no SMS; 26/11/26: no codes.
 * Phone number (only a staff phone, a platform owner or the store reviewer),
 * then the person's own 4-digit PIN — on any device. The first time: choose
 * the PIN right here. A forgotten PIN or 5 wrong PINs: someone who manages
 * staff access clears it, then the person chooses a new one here. Nothing is
 * sent and no code is typed. (Only the platform owner keeps a hidden
 * emergency recovery code, a Fly secret.) Everything is decided on the server.
 */
export type SignInResult =
  | { ok: true; next: string }
  | { ok: false; error: string; lockedOut?: boolean; needsPin?: boolean };

const RATE_LIMITED = "Too many attempts. Wait a few minutes and try again.";
const NO_MATCH = "That phone number and PIN do not match.";
const ASK_ADMIN = "Ask the person who manages your access to clear your PIN, then choose a new one here.";
const CANNOT_SET = "We could not set a PIN for that number. If you already have one, sign in with it. If you are new, ask your administrator to add you first.";

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
  // No PIN yet: choose one. Locked: ask an administrator to clear it.
  return check.outcome === "locked"
    ? { ok: false, lockedOut: true, error: `Too many wrong PINs. ${ASK_ADMIN}` }
    : // Owner 27/11/26: "do not match" confused people who simply had no PIN yet.
      // The sign-in screen opens the choose-PIN step with the number kept.
      { ok: false, needsPin: true, error: "This number has no PIN yet. Choose your 4-digit PIN now." };
}

/** First sign-in, or after an administrator cleared the PIN: phone + a new PIN, no code. */
export async function chooseFirstPin(phoneInput: string, pin: string, confirm: string, next?: string): Promise<SignInResult> {
  if (getAuthMode() !== "supabase") return { ok: false, error: "Sign-in is not available on this server." };
  const phone = toE164(phoneInput);
  if (!phone) return { ok: false, error: "Enter a valid phone number, e.g. 0712 345 678." };
  if (!/^\d{4}$/.test(pin)) return { ok: false, error: "Choose 4 digits." };
  if (pin !== confirm) return { ok: false, error: "The two PINs do not match." };
  const auth = getDeviceAuth();
  if (!(await auth.consume("pin_ip", await clientIp())) || !(await auth.consume("pin_phone", phone))) {
    return { ok: false, error: RATE_LIMITED };
  }
  const userId = isPlayReviewPhone(phone) ? null : await accountFor(phone);
  // Same answer for an unknown number and one that already has a PIN.
  if (!userId) return { ok: false, error: CANNOT_SET };
  const chosen = await auth.chooseFirstPin(userId, phone, pin);
  if (!chosen.ok) {
    return { ok: false, error: chosen.reason === "invalid" ? "Choose 4 digits that are not all the same." : CANNOT_SET };
  }
  await openSession(userId, phone, "pin");
  return { ok: true, next: safeNext(next) };
}

/**
 * "Look around the demo" (owner 26/11/26): a view-only visit to the isolated
 * demo tenant with sample data — no account, phone, PIN or code. Rate-limited
 * per IP. Off with DEMO_VISITS=off.
 */
export async function startDemoVisit(): Promise<SignInResult> {
  if (getAuthMode() !== "supabase" || !demoVisitsEnabled()) return { ok: false, error: "The demo is not available right now." };
  const auth = getDeviceAuth();
  if (!(await auth.consume("pin_ip", await clientIp()))) return { ok: false, error: RATE_LIMITED };
  await openSession(DEMO_VISITOR_USER_ID, DEMO_VISITOR_PHONE, "pin");
  return { ok: true, next: "/dashboard" };
}

/** Owner bootstrap: a fixed code for platform-owner phones only (Fly secret), e.g. when the only owner is locked out. */
function matchesOwnerBootstrap(phone: string, code: string): boolean {
  const configured = (process.env.PLATFORM_OWNER_BOOTSTRAP_CODE ?? "").trim();
  if (!/^\d{6}$/.test(configured) || !platformOwnerPhones().includes(phone)) return false;
  const a = createHash("sha256").update(code).digest();
  const b = createHash("sha256").update(configured).digest();
  return timingSafeEqual(a, b);
}

/**
 * Platform owner's emergency recovery only (no staff joining codes are given
 * any more): phone + the PLATFORM_OWNER_BOOTSTRAP_CODE Fly secret, from the
 * unlinked /sign-in?reset=1. Then choose a new PIN.
 */
export async function redeemJoiningCode(phoneInput: string, codeInput: string, next?: string): Promise<SignInResult> {
  if (getAuthMode() !== "supabase") return { ok: false, error: "Sign-in is not available on this server." };
  const phone = toE164(phoneInput);
  const code = codeInput.replace(/\s/g, "");
  if (!phone) return { ok: false, error: "Enter a valid phone number, e.g. 0712 345 678." };
  if (!isJoinCode(code)) return { ok: false, error: "Enter the 6-digit recovery code." };
  const auth = getDeviceAuth();
  if (!(await auth.consume("code_verify_ip", await clientIp())) || !(await auth.consume("code_verify_phone", phone))) {
    return { ok: false, error: RATE_LIMITED };
  }

  const userId = await accountFor(phone);
  const redeemed = userId && !isPlayReviewPhone(phone) && matchesOwnerBootstrap(phone, code)
    ? ({ ok: true } as const)
    : ({ ok: false, reason: "wrong" } as const);
  if (!redeemed.ok || !userId) {
    return { ok: false, error: "That recovery code is not right." };
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
