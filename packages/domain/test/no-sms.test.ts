import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Owner 20/11/26: InsurOS sends no SMS. Sign-in is phone + the person's own
 * PIN; 26/11/26: no codes either — the first time, choose the PIN at sign-in;
 * a forgotten or locked PIN is cleared by an administrator; alerts go through
 * the app's own messaging. Replaces the older
 * SMS recipient / Send-SMS hook checks, which this rule is stricter than.
 */
const root = join(__dirname, "../../..");
const admin = join(root, "apps/admin/src");

function files(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next") continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) files(p, out);
    else if (/\.(ts|tsx)$/.test(name) && !/\.test\./.test(name)) out.push(p);
  }
  return out;
}

describe("no SMS in InsurOS (owner 20/11/26)", () => {
  it("has no SMS sender, Send-SMS hook or OTP client", () => {
    for (const f of ["lib/africastalking/sms.ts", "app/api/auth/send-sms/route.ts", "lib/supabase/otp.ts"]) {
      expect(existsSync(join(admin, f)), f).toBe(false);
    }
  });

  it("never calls an SMS gateway or Supabase phone codes", () => {
    for (const f of files(admin)) {
      const src = readFileSync(f, "utf8");
      expect(src, f).not.toMatch(/africastalking\.com\/version1\/messaging/);
      expect(src, f).not.toMatch(/\bsendSms\(/);
      expect(src, f).not.toMatch(/signInWithOtp|verifyOtp\(/);
    }
  });

  it("no codes for staff (owner 26/11/26): PINs are cleared only with Identity:Create, inside the giver's regions", () => {
    const actions = readFileSync(join(admin, "app/dashboard/actions.ts"), "utf8");
    expect(actions).not.toMatch(/issueJoinCode\(/);
    const clear = actions.slice(actions.indexOf("export async function clearStaffPin"));
    expect(clear).toMatch(/authorizeAction\('Identity', 'Create'\)/);
    expect(clear).toMatch(/accessibleRegionIds\.includes\(appointment\.regionId\)/);
    const signIn = readFileSync(join(admin, "lib/auth/sign-in-actions.ts"), "utf8");
    expect(signIn).toMatch(/verifyPin\(/);
    expect(signIn).toMatch(/chooseFirstPin\(/);
    // Staff joining codes are gone; only the owner's own recovery secret remains.
    expect(signIn).not.toMatch(/redeemJoinCode\(/);
    const screen = readFileSync(join(admin, "components/phone-auth.tsx"), "utf8");
    expect(screen).not.toMatch(/Use a joining code/);
  });
});
