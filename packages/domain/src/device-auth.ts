/**
 * Sign-in policy (owner standing rule, 07/11/26) — PURE.
 *
 * Phone number is the identity. First sign-in on a device: 6-digit SMS code.
 * Later sign-ins on that trusted device: 4-digit PIN. A new device, a forgotten
 * PIN, or 5 wrong PINs (lockout) all require a fresh SMS code. No email.
 */
export const SMS_CODE_TTL_MS = 5 * 60_000;
export const PIN_MAX_ATTEMPTS = 5;
/** Unlocked app session (after SMS or PIN). */
export const APP_SESSION_TTL_MS = 12 * 60 * 60_000;
/** Trusted-device token lifetime (sliding on use). */
export const TRUSTED_DEVICE_TTL_MS = 180 * 24 * 60 * 60_000;

export interface RateLimitRule {
  kind: "sms_send_phone" | "sms_send_ip" | "sms_verify_phone" | "sms_verify_ip" | "pin_ip" | "sms_hook_phone";
  limit: number;
  windowMs: number;
}

/** Server-side rate limits (per phone number and per IP). */
export const AUTH_RATE_LIMITS: Record<RateLimitRule["kind"], RateLimitRule[]> = {
  sms_send_phone: [
    { kind: "sms_send_phone", limit: 3, windowMs: 10 * 60_000 },
    { kind: "sms_send_phone", limit: 10, windowMs: 24 * 60 * 60_000 }
  ],
  sms_send_ip: [
    { kind: "sms_send_ip", limit: 10, windowMs: 10 * 60_000 },
    { kind: "sms_send_ip", limit: 50, windowMs: 24 * 60 * 60_000 }
  ],
  sms_verify_phone: [{ kind: "sms_verify_phone", limit: 5, windowMs: 10 * 60_000 }],
  sms_verify_ip: [{ kind: "sms_verify_ip", limit: 20, windowMs: 10 * 60_000 }],
  pin_ip: [{ kind: "pin_ip", limit: 20, windowMs: 10 * 60_000 }],
  // The Supabase Send-SMS hook: last line of defence for ANY path that asks
  // Supabase for a code (including direct API calls with the public key).
  sms_hook_phone: [
    { kind: "sms_hook_phone", limit: 3, windowMs: 10 * 60_000 },
    { kind: "sms_hook_phone", limit: 10, windowMs: 24 * 60 * 60_000 }
  ]
};

export function isSmsCode(code: string): boolean {
  return /^\d{6}$/.test(code.trim());
}

/** 4 digits; not all the same digit (e.g. 0000, 1111). */
export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin) && !/^(\d)\1{3}$/.test(pin);
}

/** A code sent at `sentAt` may be used until SMS_CODE_TTL_MS later. */
export function isCodeFresh(sentAt: string | undefined, now: Date): boolean {
  if (!sentAt) return false;
  const age = now.getTime() - new Date(sentAt).getTime();
  return age >= 0 && age <= SMS_CODE_TTL_MS;
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
