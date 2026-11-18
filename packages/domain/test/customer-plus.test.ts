import { describe, expect, it } from "vitest";
import { monthKey, plusStatus, shareMessage, withPaidMonth } from "../src";

const base = { currency: "KES", timeZone: "Africa/Nairobi" };

describe("My Cover Plus", () => {
  it("is open to everyone while payments are switched off", () => {
    expect(plusStatus({}, { ...base, now: new Date("2027-03-01T08:00:00Z"), paymentsOn: false })).toMatchObject({ state: "open", unlocked: true });
  });

  it("gives the first 30 days free from the first visit", () => {
    const started = "2026-11-18T07:00:00Z";
    const day10 = plusStatus({ plusStartedAt: started }, { ...base, now: new Date("2026-11-28T07:00:00Z"), paymentsOn: true });
    expect(day10).toMatchObject({ state: "trial", unlocked: true, daysLeft: 20, trialEndsOn: "2026-12-18" });
    expect(day10.price).toEqual({ amount: 10, currency: "KES" });
    const after = plusStatus({ plusStartedAt: started }, { ...base, now: new Date("2026-12-19T07:00:00Z"), paymentsOn: true });
    expect(after).toMatchObject({ state: "paused", unlocked: false });
  });

  it("unlocks only the months paid, and never charges a month not taken", () => {
    const account = { plusStartedAt: "2026-01-01T00:00:00Z", plusPaidMonths: ["2026-12"] };
    expect(plusStatus(account, { ...base, now: new Date("2026-12-31T20:00:00Z"), paymentsOn: true }).state).toBe("paid");
    // 31/12 23:30 in Nairobi is already January there.
    expect(plusStatus(account, { ...base, now: new Date("2026-12-31T21:30:00Z"), paymentsOn: true }).state).toBe("paused");
    expect(plusStatus(account, { ...base, now: new Date("2027-02-10T08:00:00Z"), paymentsOn: true }).state).toBe("paused");
  });

  it("counts months on the country's clock and records a paid month once", () => {
    expect(monthKey(new Date("2026-11-30T22:00:00Z"))).toBe("2026-12");
    expect(monthKey(new Date("2026-11-30T22:00:00Z"), "Africa/Lagos")).toBe("2026-11");
    expect(withPaidMonth({ plusPaidMonths: ["2026-12"] }, "2026-12").plusPaidMonths).toEqual(["2026-12"]);
    expect(() => withPaidMonth({}, "December")).toThrow();
  });

  it("shares nothing private", () => {
    const text = shareMessage({ firstName: "Wanjiru", items: 2, agency: "Telpen Insurance Agency", link: "https://getinsuros.com/join/KE-ABC123", lang: "en" });
    expect(text).toContain("2 things insured");
    expect(text).not.toMatch(/KES|POL-|CLM-|Wanjiru/);
    expect(shareMessage({ firstName: "W", items: 1, agency: "A", link: "L", lang: "sw" })).toContain("kitu 1");
  });
});
