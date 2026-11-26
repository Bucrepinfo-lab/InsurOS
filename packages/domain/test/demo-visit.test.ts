import { describe, expect, it } from "vitest";
import { DEMO_VISITOR_PERMISSIONS, DEMO_VISITOR_PHONE, demoVisitsEnabled, isDemoVisitor, toE164 } from "../src";

/** Owner 26/11/26: "Look around the demo" — view-only, demo tenant, no account. */
describe("demo visit", () => {
  it("is view-only: no create, update, delete, approve or pay", () => {
    expect(DEMO_VISITOR_PERMISSIONS.length).toBeGreaterThan(0);
    for (const permission of DEMO_VISITOR_PERMISSIONS) expect(permission).toMatch(/:View$/);
    expect(DEMO_VISITOR_PERMISSIONS.some((p) => p.startsWith("Identity:") || p.startsWith("Platform:"))).toBe(false);
  });

  it("uses a sentinel no real phone number can match", () => {
    expect(toE164(DEMO_VISITOR_PHONE)).toBeFalsy();
    expect(isDemoVisitor("+254712345678", {})).toBe(false);
    expect(isDemoVisitor(DEMO_VISITOR_PHONE, {})).toBe(true);
  });

  it("can be switched off", () => {
    expect(demoVisitsEnabled({ DEMO_VISITS: "off" })).toBe(false);
    expect(isDemoVisitor(DEMO_VISITOR_PHONE, { DEMO_VISITS: "OFF" })).toBe(false);
    expect(demoVisitsEnabled({})).toBe(true);
  });
});
