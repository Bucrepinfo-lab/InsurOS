import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { toSmsRecipient } from "../src";

const root = join(__dirname, "..", "..", "..");

describe("toSmsRecipient (Africa's Talking needs +E.164)", () => {
  it("adds the plus to Supabase's bare international digits", () => {
    expect(toSmsRecipient("254712345678")).toBe("+254712345678");
    expect(toSmsRecipient("447700900123")).toBe("+447700900123");
    expect(toSmsRecipient("256772123456")).toBe("+256772123456");
  });

  it("keeps an existing +E.164 number", () => {
    expect(toSmsRecipient("+254712345678")).toBe("+254712345678");
    expect(toSmsRecipient(" +254 712 345 678 ")).toBe("+254712345678");
    expect(toSmsRecipient("00254712345678")).toBe("+254712345678");
  });

  it("still reads Kenyan local forms with the default country code", () => {
    expect(toSmsRecipient("0712345678")).toBe("+254712345678");
    expect(toSmsRecipient("712345678")).toBe("+254712345678");
  });

  it("refuses what is not a phone number", () => {
    expect(toSmsRecipient("")).toBeNull();
    expect(toSmsRecipient("abc")).toBeNull();
    expect(toSmsRecipient("+0123")).toBeNull();
  });

  it("is used by the SMS sender and the Supabase Send-SMS hook", () => {
    const sender = readFileSync(join(root, "apps/admin/src/lib/africastalking/sms.ts"), "utf8");
    expect(sender).toContain("toSmsRecipient(to)");
    expect(sender).toContain("to: recipient");
    const hook = readFileSync(join(root, "apps/admin/src/app/api/auth/send-sms/route.ts"), "utf8");
    expect(hook).toContain("toSmsRecipient(phone)");
    expect(hook).toContain("sendSms(e164,");
  });
});
