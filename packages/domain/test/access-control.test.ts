import { describe, expect, it } from "vitest";
import {
  ALL_PERMISSION_KEYS,
  PERMISSION_SCOPES,
  STAFF_ROLES,
  findStaffRole,
  hasPermission,
  parsePhoneAllowlist,
  rolePermissionKeys,
  toE164
} from "../src";

describe("v1 access-control catalog", () => {
  it("platform admin holds every key; nobody else holds Platform or Identity", () => {
    const admin = findStaffRole("role-platform-admin")!;
    expect(new Set(rolePermissionKeys(admin))).toEqual(new Set(ALL_PERMISSION_KEYS));
    for (const role of STAFF_ROLES.filter((item) => item.id !== "role-platform-admin")) {
      const keys = rolePermissionKeys(role);
      expect(keys.some((key) => key.startsWith("Platform:"))).toBe(false);
      expect(keys.some((key) => key.startsWith("Identity:"))).toBe(false);
    }
  });

  it("every granted scope implies View (page access keys off View)", () => {
    for (const role of STAFF_ROLES) {
      const keys = rolePermissionKeys(role);
      for (const scope of PERMISSION_SCOPES) {
        if (keys.some((key) => key.startsWith(`${scope}:`))) {
          expect(keys).toContain(`${scope}:View`);
        }
      }
    }
  });

  it("claims officer cannot approve; agent cannot touch finance", () => {
    const officer = rolePermissionKeys(findStaffRole("role-claims-officer")!);
    expect(hasPermission(officer, "Claims", "Create")).toBe(true);
    expect(hasPermission(officer, "Claims", "Approve")).toBe(false);
    const agent = rolePermissionKeys(findStaffRole("role-agent")!);
    expect(hasPermission(agent, "Finance", "View")).toBe(false);
  });

  it("parses the owner phone allowlist to unique E.164", () => {
    expect(parsePhoneAllowlist(" 0712345678, +254712345678;254700000001 ", (v) => toE164(v))).toEqual([
      "+254712345678",
      "+254700000001"
    ]);
    expect(parsePhoneAllowlist(undefined, (v) => toE164(v))).toEqual([]);
    expect(parsePhoneAllowlist("not-a-phone", (v) => toE164(v))).toEqual([]);
  });
});
