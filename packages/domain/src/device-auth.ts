/**
 * Sign-in policy — PURE. Owner 20/11/26: no SMS.
 *
 * Phone number is the identity; only a phone on a staff appointment (or the
 * platform-owner allowlist, or the store reviewer) can sign in. Step 2 is the
 * person's own 4-digit PIN, on any device. The first time, a forgotten PIN or
 * 5 wrong PINs (lockout) need a one-time joining code from someone who manages
 * staff access in that region. No email, no SMS.
 */
/** Joining codes live 48 hours, work once, and are burned after 5 wrong tries. */
export const JOIN_CODE_TTL_MS = 48 * 60 * 60_000;
export const JOIN_CODE_MAX_TRIES = 5;
export const PIN_MAX_ATTEMPTS = 5;
/** Unlocked app session (after SMS or PIN). */
export const APP_SESSION_TTL_MS = 12 * 60 * 60_000;
/** Trusted-device token lifetime (sliding on use). */
export const TRUSTED_DEVICE_TTL_MS = 180 * 24 * 60 * 60_000;

export interface RateLimitRule {
  kind: "code_verify_phone" | "code_verify_ip" | "pin_phone" | "pin_ip";
  limit: number;
  windowMs: number;
}

/** Server-side rate limits (per phone number and per IP). */
export const AUTH_RATE_LIMITS: Record<RateLimitRule["kind"], RateLimitRule[]> = {
  code_verify_phone: [{ kind: "code_verify_phone", limit: 5, windowMs: 10 * 60_000 }],
  code_verify_ip: [{ kind: "code_verify_ip", limit: 20, windowMs: 10 * 60_000 }],
  pin_phone: [{ kind: "pin_phone", limit: 10, windowMs: 10 * 60_000 }],
  pin_ip: [{ kind: "pin_ip", limit: 20, windowMs: 10 * 60_000 }]
};

/** Six digits (joining codes). */
export function isJoinCode(code: string): boolean {
  return /^\d{6}$/.test(code.replace(/\s/g, ""));
}

/** 4 digits; not all the same digit (e.g. 0000, 1111). */
export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin) && !/^(\d)\1{3}$/.test(pin);
}

export interface JoinCodeRecord {
  id: string;
  phone: string;
  /** HMAC of the code with the server secret (the code itself is never stored). */
  codeHash: string;
  issuedBy: string;
  createdAt: string;
  expiresAt: string;
  usedAt: string | null;
  tries: number;
}

/** Can this joining code still be used at `now`? */
export function isJoinCodeOpen(record: JoinCodeRecord | undefined, now: Date): record is JoinCodeRecord {
  if (!record || record.usedAt) return false;
  if (record.tries >= JOIN_CODE_MAX_TRIES) return false;
  return new Date(record.expiresAt).getTime() > now.getTime();
}

/** The message an admin hands over (in person or WhatsApp). No link to tap. */
export function joinCodeMessage(name: string, code: string, site: string): string {
  const first = name.trim().split(/\s+/)[0] || "there";
  return `Hello ${first}. Your InsurOS joining code is ${code}. Open ${site}, enter your phone number and this code, then choose your own 4-digit PIN. It works once within 48 hours. Never share it with anyone else.`;
}

export interface PinRecord {
  userId: string;
  phone: string;
  /** null = no PIN set (first sign-in, or cleared after lockout/forgotten PIN). */
  pinHash: string | null;
  failedAttempts: number;
  lockedAt: string | null;
  updatedAt: string;
}

export type PinCheck =
  | { outcome: "ok" }
  | { outcome: "wrong"; remaining: number }
  | { outcome: "locked" }
  | { outcome: "no_pin" };

/** Apply one PIN attempt to the record (pure). */
export function applyPinAttempt(
  record: PinRecord | undefined,
  matched: boolean,
  now: Date
): { check: PinCheck; next?: PinRecord } {
  if (!record || !record.pinHash) return { check: { outcome: "no_pin" } };
  if (record.lockedAt) return { check: { outcome: "locked" } };
  if (matched) {
    return {
      check: { outcome: "ok" },
      next: { ...record, failedAttempts: 0, updatedAt: now.toISOString() }
    };
  }
  const failedAttempts = record.failedAttempts + 1;
  if (failedAttempts >= PIN_MAX_ATTEMPTS) {
    return {
      check: { outcome: "locked" },
      next: { ...record, failedAttempts, lockedAt: now.toISOString(), updatedAt: now.toISOString() }
    };
  }
  return {
    check: { outcome: "wrong", remaining: PIN_MAX_ATTEMPTS - failedAttempts },
    next: { ...record, failedAttempts, updatedAt: now.toISOString() }
  };
}

export interface TrustedDevice {
  id: string;
  userId: string;
  phone: string;
  /** SHA-256 of the device secret (the secret itself lives only in the cookie). */
  secretHash: string;
  label: string;
  createdAt: string;
  lastUsedAt: string;
  revokedAt: string | null;
}

export function isDeviceActive(device: TrustedDevice | undefined, now: Date): device is TrustedDevice {
  if (!device || device.revokedAt) return false;
  return now.getTime() - new Date(device.lastUsedAt).getTime() <= TRUSTED_DEVICE_TTL_MS;
}

/** Mask a phone for display: +2547•••••678. */
export function maskPhone(phone: string): string {
  if (phone.length < 7) return phone;
  return `${phone.slice(0, 5)}${"•".repeat(Math.max(0, phone.length - 8))}${phone.slice(-3)}`;
}
