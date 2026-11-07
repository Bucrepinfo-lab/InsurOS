import { describe, expect, it } from "vitest";
import { PIN_MAX_ATTEMPTS, SMS_CODE_TTL_MS } from "@insuros/domain";
import { DeviceAuthService, PrincipalService, type AuthStore } from "../src";

const SECRET = "test-secret-test-secret-test-secret-0123";

/** Sign-in contract (owner rule 07/11/26), run against each AuthStore backend. */
export function deviceAuthContract(name: string, makeStore: () => AuthStore) {
  const unique = () => `${Date.now()}${Math.floor(Math.random() * 1e6)}`;
  const phoneFor = () => `+2547${String(Math.floor(Math.random() * 1e8)).padStart(8, "0")}`;

  function service(store: AuthStore, clock?: { now: Date }) {
    return new DeviceAuthService(store, { secret: SECRET, bcryptCost: 4, now: clock ? () => clock.now : undefined });
  }

  describe(`device sign-in: ${name}`, () => {
    it("a typed phone number alone gets nothing", async () => {
      const auth = service(makeStore());
      expect(await auth.validateSession(undefined, undefined)).toBeUndefined();
      // A hand-made "session" naming a phone, with no valid signature or device:
      const forged = Buffer.from(JSON.stringify({ uid: "u", phone: "+254700000000", did: "d", via: "sms", iat: 0, exp: 9e15 })).toString("base64url");
      expect(await auth.validateSession(`${forged}.not-a-signature`, "dev_x.secret")).toBeUndefined();
      // A real signature from a different secret is rejected too.
      const other = new DeviceAuthService(makeStore(), { secret: "x".repeat(40) });
      const { token } = other.issueSession({ uid: "u", phone: "+254700000000", did: "d", via: "sms" });
      expect(await auth.validateSession(token, undefined)).toBeUndefined();
      // A code was never requested for this phone, so nothing can be verified.
      expect(await auth.isCodeFresh(phoneFor())).toBe(false);
    });

    it("a session is valid only with its own trusted device, and dies when the device is revoked", async () => {
      const auth = service(makeStore());
      const uid = `u-${unique()}`;
      const phone = phoneFor();
      const { device, token: deviceToken } = await auth.registerDevice(uid, phone, "test");
      const { token } = auth.issueSession({ uid, phone, did: device.id, via: "sms" });
      expect((await auth.validateSession(token, deviceToken))?.uid).toBe(uid);

      const second = await auth.registerDevice(uid, phone, "other");
      expect(await auth.validateSession(token, second.token)).toBeUndefined();
      expect(await auth.validateDevice(`${device.id}.wrong-secret`)).toBeUndefined();

      await auth.revokeDevice(device.id);
      expect(await auth.validateDevice(deviceToken)).toBeUndefined();
      expect(await auth.validateSession(token, deviceToken)).toBeUndefined();
    });

    it("owner revocation by phone signs out every device of that staff member", async () => {
      const auth = service(makeStore());
      const uid = `u-${unique()}`;
      const phone = phoneFor();
      const a = await auth.registerDevice(uid, phone, "a");
      const b = await auth.registerDevice(uid, phone, "b");
      expect(await auth.revokeAllForPhone(phone)).toBe(2);
      expect(await auth.validateDevice(a.token)).toBeUndefined();
      expect(await auth.validateDevice(b.token)).toBeUndefined();
    });

    it("sessions expire", async () => {
      const clock = { now: new Date("2026-11-07T08:00:00Z") };
      const auth = service(makeStore(), clock);
      const uid = `u-${unique()}`;
      const { device, token: deviceToken } = await auth.registerDevice(uid, phoneFor(), "t");
      const { token } = auth.issueSession({ uid, phone: device.phone, did: device.id, via: "pin" });
      clock.now = new Date(clock.now.getTime() + 13 * 60 * 60_000);
      expect(await auth.validateSession(token, deviceToken)).toBeUndefined();
    });

    it("SMS codes expire after 5 minutes and work once", async () => {
      const clock = { now: new Date("2026-11-07T08:00:00Z") };
      const auth = service(makeStore(), clock);
      const phone = phoneFor();
      await auth.markCodeSent(phone);
      clock.now = new Date(clock.now.getTime() + SMS_CODE_TTL_MS - 1000);
      expect(await auth.isCodeFresh(phone)).toBe(true);
      expect(await auth.isCodeUnused(phone)).toBe(true);
      clock.now = new Date(clock.now.getTime() + 2000);
      expect(await auth.isCodeFresh(phone)).toBe(false);

      await auth.markCodeSent(phone);
      clock.now = new Date(clock.now.getTime() + 1000);
      await auth.markCodeUsed(phone);
      expect(await auth.isCodeUnused(phone)).toBe(false);
    });

    it("rate-limits per phone and per IP on the server", async () => {
      const auth = service(makeStore());
      const phone = phoneFor();
      const results = [];
      for (let i = 0; i < 4; i += 1) results.push(await auth.consume("sms_send_phone", phone));
      expect(results).toEqual([true, true, true, false]);
      const ip = `10.0.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;
      let allowed = 0;
      for (let i = 0; i < 12; i += 1) if (await auth.consume("sms_send_ip", ip)) allowed += 1;
      expect(allowed).toBe(10);
      expect(await auth.consume("sms_send_ip", "")).toBe(false);
    });

    it("PIN: set, verify, lock after 5 wrong tries; SMS clears the lock and requires a new PIN", async () => {
      const auth = service(makeStore());
      const uid = `u-${unique()}`;
      const phone = phoneFor();
      expect((await auth.verifyPin(uid, "1357")).outcome).toBe("no_pin");
      expect((await auth.setPin(uid, phone, "1111")).ok).toBe(false);
      expect((await auth.setPin(uid, phone, "12a4")).ok).toBe(false);
      expect((await auth.setPin(uid, phone, "1357")).ok).toBe(true);
      expect(await auth.hasPin(uid)).toBe(true);
      expect((await auth.verifyPin(uid, "1357")).outcome).toBe("ok");

      for (let i = 1; i < PIN_MAX_ATTEMPTS; i += 1) {
        const check = await auth.verifyPin(uid, "2468");
        expect(check).toEqual({ outcome: "wrong", remaining: PIN_MAX_ATTEMPTS - i });
      }
      expect((await auth.verifyPin(uid, "2468")).outcome).toBe("locked");
      // Even the right PIN is refused once locked.
      expect((await auth.verifyPin(uid, "1357")).outcome).toBe("locked");
      expect(await auth.hasPin(uid)).toBe(false);

      expect(await auth.afterSmsVerified(uid, false)).toEqual({ needsPin: true });
      expect((await auth.verifyPin(uid, "1357")).outcome).toBe("no_pin");
      expect((await auth.setPin(uid, phone, "8024")).ok).toBe(true);
      expect((await auth.verifyPin(uid, "8024")).outcome).toBe("ok");
    });

    it("forgot PIN: a verified SMS with reset clears the PIN; a correct PIN resets the counter", async () => {
      const auth = service(makeStore());
      const uid = `u-${unique()}`;
      const phone = phoneFor();
      await auth.setPin(uid, phone, "4826");
      await auth.verifyPin(uid, "0000");
      expect((await auth.verifyPin(uid, "4826")).outcome).toBe("ok");
      expect(await auth.verifyPin(uid, "0001")).toEqual({ outcome: "wrong", remaining: PIN_MAX_ATTEMPTS - 1 });
      expect(await auth.afterSmsVerified(uid, false)).toEqual({ needsPin: false });
      expect(await auth.afterSmsVerified(uid, true)).toEqual({ needsPin: true });
      expect(await auth.hasPin(uid)).toBe(false);
    });

    it("stores no PIN or device secret in clear", async () => {
      const store = makeStore();
      const auth = service(store);
      const uid = `u-${unique()}`;
      await auth.setPin(uid, phoneFor(), "5791");
      const pin = await store.getPin(uid);
      expect(pin?.pinHash).toBeTruthy();
      expect(pin?.pinHash).not.toContain("5791");
      const { device, token } = await auth.registerDevice(uid, phoneFor(), "t");
      expect((await store.getDevice(device.id))?.secretHash).not.toContain(token.split(".")[1]);
    });

    it("role checks are unaffected: a verified session still has only its granted role", async () => {
      const principal = await new PrincipalService().resolveForSession({ userId: `u-${unique()}`, phone: phoneFor() }, []);
      expect(principal.isUnmapped).toBe(true);
      expect(principal.permissions).toEqual([]);
    });
  });
}
