import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import {
  APP_SESSION_TTL_MS,
  AUTH_RATE_LIMITS,
  JOIN_CODE_MAX_TRIES,
  JOIN_CODE_TTL_MS,
  applyPinAttempt,
  isDeviceActive,
  isJoinCode,
  isJoinCodeOpen,
  isValidPin,
  type PinCheck,
  type RateLimitRule,
  type TrustedDevice
} from "@insuros/domain";
import type { AuthStore } from "./store";

/**
 * Phone + PIN (owner 20/11/26: no SMS; 26/11/26: no codes for staff either —
 * a staff member with no PIN chooses one at sign-in, an administrator clears a
 * forgotten or locked PIN). Joining codes remain only for the platform owner's
 * own emergency recovery.
 *
 * - Identity comes ONLY from a signed app-session token, issued after the
 *   account's own PIN (phone + PIN on any device) or a joining code given by
 *   someone who manages staff access (first sign-in, forgotten or locked PIN).
 *   A typed phone number alone gets nothing.
 * - Trusted device = random secret in an httpOnly cookie; only its SHA-256 is
 *   stored; bound to the user; revocable (by the user or an owner). A session
 *   lives only with the device it was issued on.
 * - PIN = 4 digits, peppered with the server secret then bcrypt-hashed; 5 wrong
 *   tries lock it until a new joining code is redeemed.
 * - Joining code = 6 digits, one phone, once, 48 hours, 5 tries; only an HMAC
 *   with the server secret is stored.
 */
export interface AppSession {
  /** Auth user id (Supabase id, or "play-review" for the store reviewer). */
  uid: string;
  phone: string;
  /** Trusted device the session was issued on. */
  did: string;
  /** How it was unlocked. */
  via: "code" | "pin";
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

  /* ── joining codes (no SMS) ──────────────────────────────────── */

  private codeHash(phone: string, code: string): string {
    return createHmac("sha256", this.options.secret).update(`join|${phone}|${code}`).digest("hex");
  }

  /** A new 6-digit code for this phone; earlier unused codes stop working. */
  async issueJoinCode(phone: string, issuedBy: string): Promise<{ code: string; expiresAt: string }> {
    const now = this.now();
    let code = "";
    do {
      code = String(randomInt(0, 1_000_000)).padStart(6, "0");
    } while (code === "000000");
    await this.store.closeJoinCodes(phone, now.toISOString());
    const expiresAt = new Date(now.getTime() + JOIN_CODE_TTL_MS).toISOString();
    await this.store.createJoinCode({
      id: `jc_${randomBytes(12).toString("hex")}`,
      phone,
      codeHash: this.codeHash(phone, code),
      issuedBy,
      createdAt: now.toISOString(),
      expiresAt,
      usedAt: null,
      tries: 0
    });
    // Retention: sign-in security events (phone/IP + time) are kept 7 days.
    await this.store.pruneEvents(new Date(now.getTime() - AUTH_EVENT_RETENTION_MS).toISOString());
    return { code, expiresAt };
  }

  /** Check and use a joining code for this phone. */
  async redeemJoinCode(phone: string, typed: string): Promise<{ ok: true } | { ok: false; reason: "none" | "wrong" | "burned" }> {
    const now = this.now();
    const open = (await this.store.listOpenJoinCodes(phone)).filter((c) => isJoinCodeOpen(c, now));
    const newest = open[0];
    if (!newest) return { ok: false, reason: "none" };
    const code = typed.replace(/\s/g, "");
    if (isJoinCode(code)) {
      const given = Buffer.from(this.codeHash(phone, code));
      for (const record of open) {
        const stored = Buffer.from(record.codeHash);
        if (given.length === stored.length && timingSafeEqual(given, stored)) {
          await this.store.useJoinCode(record.id, now.toISOString());
          return { ok: true };
        }
      }
    }
    await this.store.addJoinCodeTry(newest.id);
    return { ok: false, reason: newest.tries + 1 >= JOIN_CODE_MAX_TRIES ? "burned" : "wrong" };
  }

  /**
   * The user id that signs in with this phone: the one its PIN record already
   * uses (accounts from before 20/11/26 keep their id), else the one given.
   */
  async userIdForPhone(phone: string, fallback: string): Promise<string> {
    return (await this.store.getPinByPhone(phone))?.userId ?? fallback;
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
   * A staff member with no PIN yet (new, or cleared by an administrator)
   * chooses it at sign-in, with no code (owner 26/11/26). Refused whenever a
   * PIN exists or the PIN is locked, so it can never replace a working PIN.
   */
  async chooseFirstPin(userId: string, phone: string, pin: string): Promise<{ ok: true } | { ok: false; reason: "has_pin" | "invalid" }> {
    const record = await this.store.getPin(userId);
    if (record && (record.pinHash || record.lockedAt)) return { ok: false, reason: "has_pin" };
    const saved = await this.setPin(userId, phone, pin);
    return saved.ok ? { ok: true } : { ok: false, reason: "invalid" };
  }

  /**
   * An administrator clears a forgotten or locked PIN after checking it is the
   * person (owner 26/11/26: no codes). The person then chooses a new one at
   * sign-in. Signed-in devices stay signed in.
   */
  async clearPin(userId: string, phone: string): Promise<void> {
    await this.store.putPin({
      userId,
      phone,
      pinHash: null,
      failedAttempts: 0,
      lockedAt: null,
      updatedAt: this.now().toISOString()
    });
  }

  /**
   * After a redeemed joining code: the old PIN (forgotten or locked) is gone
   * and a new one must be chosen; the phone stays on the record.
   */
  async afterCodeRedeemed(userId: string, phone: string): Promise<{ needsPin: true }> {
    await this.store.putPin({
      userId,
      phone,
      pinHash: null,
      failedAttempts: 0,
      lockedAt: null,
      updatedAt: this.now().toISOString()
    });
    return { needsPin: true };
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
