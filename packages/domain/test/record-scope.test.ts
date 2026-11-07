import { describe, expect, it } from "vitest";
import {
  ALL_PERMISSION_KEYS,
  canSeeClaim,
  canSeeCustomer,
  canSeePolicy,
  claimablePolicyOptions,
  findStaffRole,
  ownPolicyNumbers,
  recordReach,
  rolePermissionKeys,
  uniqueBy,
  type OwnedClaim,
  type OwnedPolicy,
  type SessionPrincipal
} from "../src";

function staff(userId: string, roleId: string, status: "Active" | "Revoked" = "Active"): SessionPrincipal {
  return {
    email: `${userId}@phone.insuros`,
    name: userId,
    assignments: [
      { id: `g-${userId}`, userId, userName: userId, roleId, regionId: "region-ke", assignedBy: "owner", assignedAt: "2026-11-07T00:00:00Z", status }
    ],
    permissions: status === "Active" ? rolePermissionKeys(findStaffRole(roleId)!) : [],
    accessibleRegionIds: [],
    isUnmapped: false
  };
}

const owner: SessionPrincipal = {
  email: "owner@insuros",
  name: "Owner",
  assignments: [],
  permissions: [...ALL_PERMISSION_KEYS],
  accessibleRegionIds: [],
  isUnmapped: false,
  isPlatformOwner: true
};

const agentA = staff("staff-a", "role-agent");
const agentB = staff("staff-b", "role-agent");
const officer = staff("staff-o", "role-claims-officer");

const policy = (id: string, ownerUserId: string | undefined, status: OwnedPolicy["status"] = "Active", customer = "Amos"): OwnedPolicy => ({
  id,
  policyNumber: id,
  customer,
  product: "Motor",
  premium: "KES 1",
  status,
  ownerUserId
});

const claim = (id: string, policyNumber: string, extra: Partial<OwnedClaim> = {}): OwnedClaim => ({
  id,
  claimNumber: id,
  policyNumber,
  customer: "Amos",
  amount: "KES 1",
  status: "Open",
  ...extra
});

describe("record-level least privilege", () => {
  it("owner and Platform Admin keep the overall view; desk roles see their desk", () => {
    for (const area of ["Policies", "Customers", "Claims"] as const) {
      expect(recordReach(owner, area)).toEqual({ kind: "all" });
      expect(recordReach(staff("staff-x", "role-platform-admin"), area)).toEqual({ kind: "all" });
    }
    expect(recordReach(staff("m", "role-claims-manager"), "Claims")).toEqual({ kind: "all" });
    expect(recordReach(staff("u", "role-underwriter"), "Policies")).toEqual({ kind: "all" });
  });

  it("an Agent reaches only their own records; a Claims Officer only their own claims", () => {
    expect(recordReach(agentA, "Policies")).toEqual({ kind: "own", userIds: ["staff-a"] });
    expect(recordReach(agentA, "Customers")).toEqual({ kind: "own", userIds: ["staff-a"] });
    expect(recordReach(agentA, "Claims")).toEqual({ kind: "own", userIds: ["staff-a"] });
    expect(recordReach(officer, "Claims")).toEqual({ kind: "own", userIds: ["staff-o"] });
  });

  it("fails closed: no View permission, revoked grant, or unmapped user reaches nothing", () => {
    expect(recordReach(staff("f", "role-finance-manager"), "Claims")).toEqual({ kind: "none" });
    expect(recordReach(staff("r", "role-agent", "Revoked"), "Policies")).toEqual({ kind: "none" });
    expect(recordReach({ ...agentA, isUnmapped: true }, "Policies")).toEqual({ kind: "none" });
    expect(recordReach({ ...agentA, assignments: [] }, "Policies")).toEqual({ kind: "none" });
  });

  it("an Agent cannot see another agent's customer or policy, nor unowned records", () => {
    const reach = recordReach(agentA, "Policies");
    expect(canSeePolicy(reach, policy("P-A", "staff-a"))).toBe(true);
    expect(canSeePolicy(reach, policy("P-B", "staff-b"))).toBe(false);
    expect(canSeePolicy(reach, policy("P-X", undefined))).toBe(false);
    const customers = recordReach(agentA, "Customers");
    expect(canSeeCustomer(customers, { id: "c", name: "c", type: "Individual", email: "", status: "Active", ownerUserId: "staff-b" })).toBe(false);
  });

  it("a Claims Officer sees only claims assigned to (or registered by) them", () => {
    const reach = recordReach(officer, "Claims");
    expect(canSeeClaim(reach, claim("C-1", "P-A", { assignedToUserId: "staff-o" }))).toBe(true);
    expect(canSeeClaim(reach, claim("C-2", "P-A", { registeredByUserId: "staff-o" }))).toBe(true);
    expect(canSeeClaim(reach, claim("C-3", "P-A", { assignedToUserId: "staff-other" }))).toBe(false);
    expect(canSeeClaim(reach, claim("C-4", "P-A"))).toBe(false);
  });

  it("an Agent sees claims on their own policies, not on another agent's", () => {
    const policies = [policy("P-A", "staff-a"), policy("P-B", "staff-b")];
    const reach = recordReach(agentA, "Claims");
    const own = ownPolicyNumbers(reach, policies);
    expect(canSeeClaim(reach, claim("C-1", "P-A"), own)).toBe(true);
    expect(canSeeClaim(reach, claim("C-2", "P-B"), own)).toBe(false);
    expect(ownPolicyNumbers(recordReach(owner, "Claims"), policies).size).toBe(0);
  });

  it("claim/endorsement policy picker: own, in force, one customer, no duplicates", () => {
    const policies = [
      policy("P-2", "staff-a"),
      policy("P-1", "staff-a"),
      policy("P-1", "staff-a"), // duplicate row for the same policy number
      policy("P-3", "staff-a", "Cancelled"),
      policy("P-4", "staff-a", "Expired"),
      policy("P-5", "staff-a", "Pending"),
      policy("P-6", "staff-b"),
      policy("P-7", "staff-a", "Active", "Beatrice")
    ];
    const reach = recordReach(agentA, "Policies");
    expect(claimablePolicyOptions(policies, reach).map((o) => o.policyNumber)).toEqual(["P-1", "P-2", "P-7"]);
    expect(claimablePolicyOptions(policies, reach, { customer: "amos" }).map((o) => o.policyNumber)).toEqual(["P-1", "P-2"]);
    expect(claimablePolicyOptions(policies, recordReach(owner, "Policies")).map((o) => o.policyNumber)).toEqual(["P-1", "P-2", "P-6", "P-7"]);
    expect(claimablePolicyOptions(policies, { kind: "none" })).toEqual([]);
  });

  it("uniqueBy keeps the first of each key, in order", () => {
    expect(uniqueBy(["b", "a", "b", "c", "a"], (x) => x)).toEqual(["b", "a", "c"]);
  });
});
