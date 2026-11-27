import { describe, expect, it } from "vitest";
import { checkLegalName, checkProfileChange, checkWorkEmail, hasOpenRequest, type ProfileChangeRequest } from "../src";

describe("My record: what a person may change", () => {
  it("accepts a work email, lower-cases it, and lets an empty box remove it", () => {
    expect(checkWorkEmail(" Wanjiru@Agency.co.ke ")).toEqual({ ok: true, value: "wanjiru@agency.co.ke" });
    expect(checkWorkEmail("")).toEqual({ ok: true, value: null });
    expect(checkWorkEmail("not-an-email").ok).toBe(false);
    expect(checkWorkEmail("+254712345678@phone.insuros").ok).toBe(false);
  });

  it("takes a name as on an ID, in any language, and refuses digits or symbols", () => {
    expect(checkLegalName("  Wanjiru   Kamau-Njoroge ")).toEqual({ ok: true, value: "Wanjiru Kamau-Njoroge" });
    expect(checkLegalName("Zoë O'Neil").ok).toBe(true);
    expect(checkLegalName("A").ok).toBe(false);
    expect(checkLegalName("Agent 007").ok).toBe(false);
  });

  it("needs a reason and a real change before a request is recorded", () => {
    expect(checkProfileChange("name", "Wanjiru Kamau", "Wanjiru Njoroge", "Married, new ID issued")).toEqual({
      ok: true,
      value: { to: "Wanjiru Njoroge", reason: "Married, new ID issued" }
    });
    expect(checkProfileChange("name", "Wanjiru Kamau", "wanjiru kamau", "spelling").ok).toBe(false);
    expect(checkProfileChange("name", "Wanjiru Kamau", "Wanjiru Njoroge", "x").ok).toBe(false);
    expect(checkProfileChange("phone", "+254712345678", "0712 345 678", "new line").ok).toBe(false);
    expect(checkProfileChange("phone", "+254712345678", "0722 111 222", "Old line lost")).toEqual({
      ok: true,
      value: { to: "+254722111222", reason: "Old line lost" }
    });
    expect(checkProfileChange("phone", "+254712345678", "12", "Old line lost").ok).toBe(false);
  });

  it("allows one open request per person and field", () => {
    const open: ProfileChangeRequest = {
      id: "r1", userId: "u1", userName: "A B", phone: "+254712345678", regionId: "ke", field: "phone",
      from: "+254712345678", to: "+254722111222", reason: "lost line", status: "Pending", requestedAt: "2026-11-27T10:00:00Z"
    };
    expect(hasOpenRequest([open], "u1", "phone")).toBe(true);
    expect(hasOpenRequest([open], "u1", "name")).toBe(false);
    expect(hasOpenRequest([{ ...open, status: "Declined" }], "u1", "phone")).toBe(false);
  });
});
