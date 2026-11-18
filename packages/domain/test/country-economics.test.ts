import { describe, expect, it } from "vitest";
import {
  COUNTRY_PROFILES,
  KENYA,
  MIN_AGENT_NEW_SHARE,
  POLICY_LINES,
  STANDARD_SPLIT,
  breakEvenPremium,
  canSell,
  checkSplit,
  cleanReferralCode,
  profileFor,
  referralCodeFor,
  splitCommission,
  tokensFor,
  withLevies,
  type ReferralRecord
} from "../src";

describe("country profiles", () => {
  it("keeps every country separate, with its own currency, and no duplicates", () => {
    const codes = COUNTRY_PROFILES.map((profile) => profile.countryCode);
    expect(new Set(codes).size).toBe(codes.length);
    for (const profile of COUNTRY_PROFILES) {
      expect(profile.currency).toMatch(/^[A-Z]{3}$/);
      expect(checkSplit(profile.split)).toEqual({ ok: true });
    }
    expect(profileFor("ke")).toBe(KENYA);
    expect(profileFor("ZZ")).toBeUndefined();
  });

  it("carries Kenya's legal caps exactly as the Eleventh Schedule sets them", () => {
    const cap = (line: keyof typeof KENYA.caps) => KENYA.caps[line]?.firstYear;
    expect(cap("motor-private")).toBe(10);
    expect(cap("motor-commercial")).toBe(10);
    expect(cap("medical")).toBe(10);
    expect(cap("home")).toBe(20);
    expect(cap("business-property")).toBe(25);
    expect(cap("work-injury")).toBe(20);
    expect(cap("marine-cargo")).toBe(17.5);
    expect(cap("savings-life")).toBe(50);
    expect(cap("group-life")).toBe(8);
    // Every line insurance usually covers has a Kenyan rule.
    for (const line of POLICY_LINES) expect(KENYA.caps[line.id], line.id).toBeTruthy();
    // No cap anywhere above 50% (the long-term first-year maximum).
    for (const profile of COUNTRY_PROFILES) {
      for (const cap of Object.values(profile.caps)) expect(cap!.firstYear).toBeLessThanOrEqual(50);
    }
  });

  it("sells nowhere until the law is verified, a person has approved and the licence is on file", () => {
    // Kenya's figures are approved, but the company has no IRA licence yet.
    expect(KENYA.approvedBy).toBeTruthy();
    expect(KENYA.goldThresholdPerQuarter).toBe(1_500_000);
    expect(canSell(KENYA)).toMatchObject({ ok: false, reason: expect.stringContaining("licence") });
    expect(canSell({ ...KENYA, approvedBy: undefined, intermediaryLicence: "IRA/01/2027" })).toMatchObject({ ok: false });
    const approved = { ...KENYA, approvedBy: "Owner", approvedAt: "2026-11-18", intermediaryLicence: "IRA/01/2027" };
    expect(canSell(approved)).toEqual({ ok: true });
    expect(canSell(approved, "motor-private")).toEqual({ ok: true });
    expect(canSell({ ...approved, caps: {} }, "motor-private")).toMatchObject({ ok: false });
    for (const profile of COUNTRY_PROFILES.filter((candidate) => candidate.status !== "verified")) {
      expect(canSell({ ...profile, approvedBy: "Owner", approvedAt: "2026-11-18", intermediaryLicence: "X" })).toMatchObject({ ok: false });
      expect(profile.referralToken).toBeUndefined();
    }
  });
});

describe("commission", () => {
  it("rejects a split that gives away more than the commission or short-changes the agent", () => {
    expect(checkSplit({ ...STANDARD_SPLIT, goldAgentNew: 95 })).toMatchObject({ ok: false });
    expect(checkSplit({ ...STANDARD_SPLIT, agentNew: MIN_AGENT_NEW_SHARE - 1 })).toMatchObject({ ok: false });
    expect(checkSplit({ ...STANDARD_SPLIT, goldAgentNew: 65 })).toMatchObject({ ok: false });
  });

  it("splits the KES 60,000 car policy as the plan shows", () => {
    expect(splitCommission(KENYA, "motor-private", 60000)).toEqual({
      capPercent: 10, commission: 6000, agent: 4200, teamLeader: 600, agency: 1200, agentShare: 70, agencyShare: 20
    });
    expect(splitCommission(KENYA, "motor-private", 60000, { renewal: true })).toMatchObject({ agent: 3600, teamLeader: 600, agency: 1800 });
    expect(splitCommission(KENYA, "motor-private", 60000, { gold: true })).toMatchObject({ agent: 4500, agency: 900 });
    // First year of an education policy: 50% cap, agent 35% of the premium.
    expect(splitCommission(KENYA, "savings-life", 10000)?.agent).toBe(3500);
  });

  it("never pays above the legal cap", () => {
    expect(splitCommission(KENYA, "motor-private", 60000, { insurerRate: 12 })).toBeNull();
    expect(splitCommission(KENYA, "motor-private", 60000, { insurerRate: 8 })?.commission).toBe(4800);
    expect(splitCommission(KENYA, "motor-private", 0)).toBeNull();
    expect(splitCommission({ ...KENYA, caps: {} }, "motor-private", 60000)).toBeNull();
  });
});

describe("break-even price", () => {
  it("matches the plan's worked example", () => {
    const expectedClaims = 60000 * 0.7036;
    expect(breakEvenPremium({ expectedClaims, commissionRate: 10, runningCostRate: 12, margin: 3 })).toBe(56288);
    expect(breakEvenPremium({ expectedClaims, commissionRate: 10, runningCostRate: 12, margin: 0 })).toBe(54123);
  });

  it("refuses rates that leave nothing for claims", () => {
    expect(breakEvenPremium({ expectedClaims: 1000, commissionRate: 50, runningCostRate: 40, margin: 5 })).toBeNull();
    expect(breakEvenPremium({ expectedClaims: 0, commissionRate: 10, runningCostRate: 10, margin: 0 })).toBeNull();
  });

  it("adds the country's levies on top", () => {
    expect(withLevies(KENYA, 60000)).toEqual({ levies: 310, total: 60310 });
  });
});

describe("referral", () => {
  it("gives each person a stable, readable code and accepts it back typed loosely", () => {
    const code = referralCodeFor("KE", "staff-123");
    expect(code).toMatch(/^KE-[2-9A-HJKMNP-Z]{6}$/);
    expect(referralCodeFor("KE", "staff-123")).toBe(code);
    expect(referralCodeFor("KE", "staff-124")).not.toBe(code);
    expect(cleanReferralCode(` ${code.toLowerCase()} `)).toBe(code);
    expect(cleanReferralCode("KE-12345O")).toBeNull();
    expect(cleanReferralCode(42)).toBeNull();
  });

  it("pays a token per verified sign-up, capped per month, never for self-referral or a repeated phone", () => {
    const me = referralCodeFor("KE", "agent-1");
    const rec = (personId: string, extra: Partial<ReferralRecord> = {}): ReferralRecord => ({
      personId,
      referredBy: me,
      verifiedAt: "2026-11-05T10:00:00Z",
      ...extra
    });
    const records = [
      rec("c1", { phone: "+254700000001" }),
      rec("c2", { phone: "+254700000001" }), // same phone again
      rec("c3", { verifiedAt: undefined }), // not verified
      rec("agent-1"), // self
      rec("c4", { verifiedAt: "2026-10-30T10:00:00Z" }), // other month
      rec("c5", { referredBy: referralCodeFor("KE", "agent-2") }), // someone else's
      ...Array.from({ length: 25 }, (_, i) => rec(`bulk-${i}`))
    ];
    const statement = tokensFor(KENYA, me, "agent-1", records, "2026-11");
    expect(statement).toEqual({ verified: 26, counted: 20, overLimit: 6, amount: 2000, currency: "KES" });
    expect(tokensFor(profileFor("UG")!, me, "agent-1", records, "2026-11").amount).toBe(0);
  });
});
