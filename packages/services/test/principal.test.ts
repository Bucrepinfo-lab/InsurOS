import { describe, expect, it } from "vitest";
import { ALL_PERMISSION_KEYS } from "@insuros/domain";
import { PrincipalService, getPersistence } from "../src";

const service = new PrincipalService();
const OWNER = "+254700000999";

describe("PrincipalService.resolveForSession (least privilege)", () => {
  it("an unknown phone is unmapped with NO permissions (no admin fallback)", async () => {
    const principal = await service.resolveForSession({ userId: "u-1", phone: "0711000001" }, [OWNER]);
    expect(principal.isUnmapped).toBe(true);
    expect(principal.permissions).toEqual([]);
    expect(principal.isPlatformOwner).toBeFalsy();
  });

  it("an allowlisted phone is the platform owner", async () => {
    const principal = await service.resolveForSession({ userId: "u-2", phone: "0700000999" }, [OWNER]);
    expect(principal.isPlatformOwner).toBe(true);
    expect(new Set(principal.permissions)).toEqual(new Set(ALL_PERMISSION_KEYS));
  });

  it("a granted phone gets exactly its role, and loses it on revoke", async () => {
    const phone = "0711000002";
    const grant = await service.grantStaffAccess({
      phone,
      name: "Test Officer",
      roleId: "role-claims-officer",
      regionId: "region-ke-047",
      grantedBy: OWNER
    });
    expect(grant.ok).toBe(true);

    const principal = await service.resolveForSession({ userId: "u-3", phone }, [OWNER]);
    expect(principal.isUnmapped).toBe(false);
    expect(principal.permissions).toContain("Claims:Create");
    expect(principal.permissions).not.toContain("Claims:Approve");
    expect(principal.permissions.some((key) => key.startsWith("Finance:"))).toBe(false);

    expect(await service.revokeStaffAccess(phone)).toBeGreaterThan(0);
    const after = await service.resolveForSession({ userId: "u-3", phone }, [OWNER]);
    expect(after.isUnmapped).toBe(true);
    expect(after.permissions).toEqual([]);
  });

  it("rejects bad grant input", async () => {
    const base = { phone: "0711000003", name: "X Y", roleId: "role-agent", regionId: "region-ke-047", grantedBy: OWNER };
    expect((await service.grantStaffAccess({ ...base, phone: "abc" })).ok).toBe(false);
    expect((await service.grantStaffAccess({ ...base, roleId: "role-nope" })).ok).toBe(false);
    expect((await service.grantStaffAccess({ ...base, regionId: "region-nope" })).ok).toBe(false);
  });

  it("refuses a grant in a region that is not Active (server-side)", async () => {
    await getPersistence().regions.insert({
      id: "region-test-suspended",
      name: "Suspended County",
      code: "KE-T99",
      level: "County",
      parentRegionId: "region-ke",
      countryCode: "KE",
      continentCode: "AF",
      status: "Suspended"
    });
    const phone = "0711000005";
    const result = await service.grantStaffAccess({
      phone, name: "Blocked Grant", roleId: "role-agent", regionId: "region-test-suspended", grantedBy: OWNER
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("choose an active region");
    const after = await service.resolveForSession({ userId: "u-5", phone }, [OWNER]);
    expect(after.isUnmapped).toBe(true);
    expect(after.permissions).toEqual([]);
  });

  it("account deletion erases the staff profile and access", async () => {
    const phone = "0711000004";
    await service.grantStaffAccess({ phone, name: "To Delete", roleId: "role-agent", regionId: "region-ke-047", grantedBy: OWNER });
    expect(await service.erasePersonalData({ phone })).toBeGreaterThan(0);
    const after = await service.resolveForSession({ userId: "u-4", phone }, [OWNER]);
    expect(after.isUnmapped).toBe(true);
  });
});
