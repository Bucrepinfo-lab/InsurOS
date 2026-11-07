import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import {
  APP_SESSION_TTL_MS,
  AUTH_RATE_LIMITS,
  applyPinAttempt,
  isCodeFresh,
  isDeviceActive,
  isValidPin,
  type PinCheck,
  type RateLimitRule,
  type TrustedDevice
} from "@insuros/domain";
import type { AuthStore } from "./store";

/**
 * Phone + SMS code + PIN on trusted devices (owner rule 07/11/26).
 *
 * - Identity comes ONLY from a signed app-session token, issued after a
 *   verified SMS code (first sign-in / new device / forgotten or locked PIN) or
 *   a correct PIN on a trusted device. A typed phone number alone gets nothing.
 * - Trusted device = random secret in an httpOnly cookie; only its SHA-256 is
 *   stored; bound to the user; revocable (by the user or an owner).
 * - PIN = 4 digits, peppered with the server secret then bcrypt-hashed; 5 wrong
 *   tries lock it until a new SMS code is verified.
 */
export interface AppSession {
  /** Auth user id (Supabase id, or "play-review" for the store reviewer). */
  uid: string;
  phone: string;
  /** Trusted device the session was issued on. */
  did: string;
  /** How it was unlocked. */
  via: "sms" | "pin";
  iat: number;
  exp: number;
}

export interface DeviceAuthOptions {
  /** Server secret (AUTH_SECRET): signs sessions and peppers PINs. */
  secret: string;
  now?: () => Date;
  bcryptCost?: number;
}

/** How long rate-limit / code events (phone or IP + time) are kept. */
export const AUTH_EVENT_RETENTION_MS = 7 * 24 * 60 * 60_000;

const b64url = (input: Buffer | string) => Buffer.from(input).toString("base64url");

export class DeviceAuthService {
  private readonly now: () => Date;
  private readonly cost: number;

  constructor(
    private readonly store: AuthStore,
    private readonly options: DeviceAuthOptions
  ) {
    if (!options.secret || options.secret.length < 32) {
      throw new Error("AUTH_SECRET must be at least 32 characters");
    }
    this.now = options.now ?? (() => new Date());
    this.cost = options.bcryptCost ?? 11;
  }

  /* ── rate limits ─────────────────────────────────────────────── */

  /** True when allowed; records the attempt when allowed. Fails closed on limit. */
  async consume(kind: RateLimitRule["kind"], key: string): Promise<boolean> {
    if (!key) return false;
    const now = this.now();
    for (const rule of AUTH_RATE_LIMITS[kind]) {
      const since = new Date(now.getTime() - rule.windowMs).toISOString();
      if ((await this.store.countEvents(kind, key, since)) >= rule.limit) return false;
    }
    await this.store.recordEvent(kind, key, now.toISOString());
    return true;
  }

  /* ── SMS code freshness (≤ 5 minutes) ────────────────────────── */

  async markCodeSent(phone: string): Promise<void> {
    const now = this.now();
    await this.store.recordEvent("sms_sent", phone, now.toISOString());
    // Retention: sign-in security events (phone/IP + time) are kept 7 days.
    await this.store.pruneEvents(new Date(now.getTime() - AUTH_EVENT_RETENTION_MS).toISOString());
  }

  async isCodeFresh(phone: string): Promise<boolean> {
    return isCodeFresh(await this.store.lastEventAt("sms_sent", phone), this.now());
  }

  /** Make the last code unusable on our side (single use). */
  async markCodeUsed(phone: string): Promise<void> {
    // A "used" marker newer than the send means the freshness window is closed.
    await this.store.recordEvent("sms_used", phone, this.now().toISOString());
  }

  async isCodeUnused(phone: string): Promise<boolean> {
    const sent = await this.store.lastEventAt("sms_sent", phone);
    const used = await this.store.lastEventAt("sms_used", phone);
    if (!sent) return false;
    return !used || new Date(used).getTime() < new Date(sent).getTime();
  }

  /* ── trusted devices ─────────────────────────────────────────── */

  async registerDevice(userId: string, phone: string, label: string): Promise<{ device: TrustedDevice; token: string }> {
    const now = this.now().toISOString();
    const id = `dev_${randomBytes(12).toString("hex")}`;
    const secret = randomBytes(32).toString("base64url");
    const device: TrustedDevice = {
      id,
      userId,
      phone,
      secretHash: createHash("sha256").update(secret).digest("hex"),
      label: label.slice(0, 120),
      createdAt: now,
      lastUsedAt: now,
      revokedAt: null
    };
    await this.store.createDevice(device);
    return { device, token: `${id}.${secret}` };
  }

  /** Validate a device cookie value; returns the active device or undefined. */
  async validateDevice(token: string | undefined): Promise<TrustedDevice | undefined> {
    if (!token) return undefined;
    const [id, secret] = token.split(".");
    if (!id || !secret) return undefined;
    const device = await this.store.getDevice(id);
    if (!isDeviceActive(device, this.now())) return undefined;
    const given = Buffer.from(createHash("sha256").update(secret).digest("hex"));
    const stored = Buffer.from(device.secretHash);
    if (given.length !== stored.length || !timingSafeEqual(given, stored)) return undefined;
    return device;
  }

  async touchDevice(id: string): Promise<void> {
    await this.store.touchDevice(id, this.now().toISOString());
  }

  async revokeDevice(id: string): Promise<void> {
    await this.store.revokeDevice(id, this.now().toISOString());
  }

  async listDevices(userId: string): Promise<TrustedDevice[]> {
    return this.store.listDevicesForUser(userId);
  }

  /** Revoke every device of a user (account deletion, "sign out everywhere"). */
  async revokeAllForUser(userId: string): Promise<number> {
    const devices = (await this.store.listDevicesForUser(userId)).filter((d) => !d.revokedAt);
    for (const device of devices) await this.revokeDevice(device.id);
    return devices.length;
  }

  /** Owner action: revoke every device signed in with a staff phone. */
  async revokeAllForPhone(phone: string): Promise<number> {
    const devices = (await this.store.listDevicesForPhone(phone)).filter((d) => !d.revokedAt);
    for (const device of devices) await this.revokeDevice(device.id);
    return devices.length;
  }

  /* ── PIN ─────────────────────────────────────────────────────── */

  private pepper(userId: string, pin: string): string {
    return createHmac("sha256", this.options.secret).update(`pin|${userId}|${pin}`).digest("hex");
  }

  async hasPin(userId: string): Promise<boolean> {
    const record = await this.store.getPin(userId);
    return Boolean(record?.pinHash && !record.lockedAt);
  }

  async setPin(userId: string, phone: string, pin: string): Promise<{ ok: boolean; error?: string }> {
    if (!isValidPin(pin)) return { ok: false, error: "Choose 4 digits that are not all the same." };
    const pinHash = await bcrypt.hash(this.pepper(userId, pin), this.cost);
    await this.store.putPin({
      userId,
      phone,
      pinHash,
      failedAttempts: 0,
      lockedAt: null,
      updatedAt: this.now().toISOString()
    });
    return { ok: true };
  }

  async verifyPin(userId: string, pin: string): Promise<PinCheck> {
    const record = await this.store.getPin(userId);
    const matched =
      Boolean(record?.pinHash) && !record?.lockedAt && /^\d{4}$/.test(pin)
        ? await bcrypt.compare(this.pepper(userId, pin), record!.pinHash!)
        : false;
    const { check, next } = applyPinAttempt(record, matched, this.now());
    if (next) await this.store.putPin(next);
    return check;
  }

  /**
   * After a verified SMS code: a locked PIN, or a user who asked to reset it,
   * loses the old PIN and must choose a new one.
   */
  async afterSmsVerified(userId: string, resetPin: boolean): Promise<{ needsPin: boolean }> {
    const record = await this.store.getPin(userId);
    if (record && (record.lockedAt || resetPin)) {
      await this.store.deletePin(userId);
      return { needsPin: true };
    }
    return { needsPin: !record?.pinHash };
  }

  async forgetUser(userId: string): Promise<void> {
    await this.store.deletePin(userId);
    await this.revokeAllForUser(userId);
  }

  /* ── signed app session ──────────────────────────────────────── */

  issueSession(input: Pick<AppSession, "uid" | "phone" | "did" | "via">): { token: string; session: AppSession } {
    const iat = this.now().getTime();
    const session: AppSession = { ...input, iat, exp: iat + APP_SESSION_TTL_MS };
    const body = b64url(JSON.stringify(session));
    const sig = createHmac("sha256", this.options.secret).update(`session.${body}`).digest("base64url");
    return { token: `${body}.${sig}`, session };
  }

  /** Signature + expiry check only (no DB). Use validateSession for requests. */
  readSession(token: string | undefined): AppSession | undefined {
    if (!token) return undefined;
    const [body, sig] = token.split(".");
    if (!body || !sig) return undefined;
    const expected = createHmac("sha256", this.options.secret).update(`session.${body}`).digest("base64url");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return undefined;
    try {
      const session = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as AppSession;
      if (typeof session.uid !== "string" || typeof session.did !== "string") return undefined;
      if (session.exp <= this.now().getTime()) return undefined;
      return session;
    } catch {
      return undefined;
    }
  }

  /**
   * Full request check: valid signature, not expired, AND issued on a device
   * that is still trusted, bound to the same user, and matches this browser's
   * device cookie. Revoking the device ends the session immediately.
   */
  async validateSession(sessionToken: string | undefined, deviceToken: string | undefined): Promise<AppSession | undefined> {
    const session = this.readSession(sessionToken);
    if (!session) return undefined;
    const device = await this.validateDevice(deviceToken);
    if (!device || device.id !== session.did || device.userId !== session.uid) return undefined;
    return session;
  }
}
