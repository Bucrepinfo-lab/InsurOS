import { describe, expect, it } from "vitest";
import { PLUS_PRICES, addMonths, applyPlusPayment, listPriceFor, lockHolds, monthKey, plusStatus, priceFor, shareMessage, withPaidMonth, withPaidPlan } from "../src";

const KE = PLUS_PRICES.KE!;
const base = { list: KE, timeZone: "Africa/Nairobi" };

describe("My Cover Plus", () => {
  it("is open to everyone while payments are switched off", () => {
    expect(plusStatus({}, { ...base, now: new Date("2027-03-01T08:00:00Z"), paymentsOn: false })).toMatchObject({ state: "open", unlocked: true });
  });

  it("gives the first 30 days free from the first visit", () => {
    const started = "2026-11-18T07:00:00Z";
    const day10 = plusStatus({ plusStartedAt: started }, { ...base, now: new Date("2026-11-28T07:00:00Z"), paymentsOn: true });
    expect(day10).toMatchObject({ state: "trial", unlocked: true, daysLeft: 20, trialEndsOn: "2026-12-18" });
    expect(day10.price).toEqual({ monthly: 49, yearly: 490, currency: "KES", locked: false });
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

describe("Plus payment reference", () => {
  it("round-trips and refuses anything else", async () => {
    const { parsePlusReference, plusPaymentReference } = await import("../src");
    expect(parsePlusReference(plusPaymentReference("cust-1", "2026-12"))).toEqual({ customerId: "cust-1", month: "2026-12", plan: "MONTH" });
    expect(parsePlusReference(plusPaymentReference("cust-1", "2026-12", "YEAR"))).toEqual({ customerId: "cust-1", month: "2026-12", plan: "YEAR" });
    expect(parsePlusReference("POL-KE-2026-00412")).toBeNull();
    expect(parsePlusReference("PLUS:cust-1:December")).toBeNull();
    expect(parsePlusReference(undefined)).toBeNull();
  });
});

describe("Plus price and the founding lock (owner 18/11/26)", () => {
  it("lists KES 49 a month or KES 490 a year in Kenya; the African prices are approved (20/11/26), the rest indicative", () => {
    expect(listPriceFor("ke")).toEqual({ currency: "KES", monthly: 49, yearly: 490, approved: true });
    expect(listPriceFor("ZZ")).toBe(KE);
    const approved = ["KE", "UG", "TZ", "RW", "NG", "GH", "ZA"];
    for (const [code, price] of Object.entries(PLUS_PRICES)) {
      expect(price.yearly, code).toBeCloseTo(price.monthly * 10, 5);
      expect(price.approved, code).toBe(approved.includes(code));
    }
    expect(listPriceFor("UG")).toEqual({ currency: "UGX", monthly: 1_500, yearly: 15_000, approved: true });
  });

  it("covers twelve calendar months with a yearly plan, across the year end", () => {
    expect(addMonths("2026-11", 2)).toBe("2027-01");
    const paid = withPaidPlan({}, "2026-11", "YEAR").plusPaidMonths;
    expect(paid).toHaveLength(12);
    expect(paid[0]).toBe("2026-11");
    expect(paid[11]).toBe("2027-10");
  });

  it("locks the founding price on the first payment inside the window, and refuses short payments", () => {
    const now = new Date("2027-01-10T08:00:00Z");
    const first = applyPlusPayment({}, { month: "2027-01", plan: "MONTH", amount: 49, list: KE, now, foundingUntil: "2027-06-01" });
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(first.update.plusPriceLock).toMatchObject({ monthly: 49, yearly: 490, currency: "KES" });
    expect(applyPlusPayment({}, { month: "2027-01", plan: "YEAR", amount: 49, list: KE, now })).toMatchObject({ ok: false });
    // After the window closes, no new lock is given.
    const late = applyPlusPayment({}, { month: "2027-07", plan: "MONTH", amount: 49, list: KE, now: new Date("2027-07-02T08:00:00Z"), foundingUntil: "2027-06-01" });
    expect(late.ok && late.update.plusPriceLock).toBeFalsy();
  });

  it("keeps the locked price after a list price rise, while payments run without a long gap", () => {
    const account = {
      plusPaidMonths: ["2027-01", "2027-02"],
      plusPriceLock: { monthly: 49, yearly: 490, currency: "KES", lockedAt: "2027-01-10T08:00:00Z" }
    };
    const raised = { ...KE, monthly: 99, yearly: 990 };
    expect(priceFor(account, raised, "2027-03")).toEqual({ monthly: 49, yearly: 490, currency: "KES", locked: true });
    expect(lockHolds(account, "2027-03")).toBe(true);
    // Two months or more without paying ends the lock.
    expect(priceFor(account, raised, "2027-04")).toMatchObject({ monthly: 99, locked: false });
    // A customer still on the founding price pays that price, not the raised one.
    expect(applyPlusPayment(account, { month: "2027-03", plan: "MONTH", amount: 49, list: raised, now: new Date("2027-03-02T08:00:00Z") }).ok).toBe(true);
  });
});
