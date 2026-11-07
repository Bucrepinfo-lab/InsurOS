import { describe, expect, it } from "vitest";
import type { OwnedClaim, OwnedCustomer, OwnedPolicy, RecordReach } from "@insuros/domain";
import { ClaimService, CustomerService, PolicyService, getPersistence } from "../src";

const agentA: RecordReach = { kind: "own", userIds: ["staff-ta"] };
const agentB: RecordReach = { kind: "own", userIds: ["staff-tb"] };
const officer: RecordReach = { kind: "own", userIds: ["staff-to"] };
const all: RecordReach = { kind: "all" };

const policies = new PolicyService();
const claims = new ClaimService();
const customers = new CustomerService();

async function seed() {
  const db = getPersistence();
  const p = (id: string, ownerUserId: string, status: OwnedPolicy["status"] = "Active"): OwnedPolicy => ({
    id, policyNumber: id, customer: "Test Holder", product: "Motor", premium: "KES 1", status, ownerUserId
  });
  for (const row of [p("RS-POL-A", "staff-ta"), p("RS-POL-B", "staff-tb"), p("RS-POL-A-X", "staff-ta", "Cancelled")]) {
    if (!(await db.policies.findById(row.id))) await db.policies.insert(row);
  }
  const c = (id: string, extra: Partial<OwnedClaim>): OwnedClaim => ({
    id, claimNumber: id, policyNumber: "RS-POL-B", customer: "Test Holder", amount: "KES 1", status: "Open", ...extra
  });
  for (const row of [
    c("RS-CLM-1", { policyNumber: "RS-POL-A" }),
    c("RS-CLM-2", { assignedToUserId: "staff-to" }),
    c("RS-CLM-3", { assignedToUserId: "staff-other" })
  ]) {
    if (!(await db.claims.findById(row.id))) await db.claims.insert(row);
  }
  const cust: OwnedCustomer = { id: "RS-CUS-B", name: "B", type: "Individual", email: "", status: "Active", ownerUserId: "staff-tb" };
  if (!(await db.customers.findById(cust.id))) await db.customers.insert(cust);
}

describe("services apply record-level scope on the server", () => {
  it("lists only the user's own records", async () => {
    await seed();
    const ids = (await policies.getPoliciesFor(agentA)).map((row) => row.id);
    expect(ids).toContain("RS-POL-A");
    expect(ids).not.toContain("RS-POL-B");
    expect((await customers.getCustomersFor(agentA)).map((row) => row.id)).not.toContain("RS-CUS-B");
    expect((await customers.getCustomersFor(agentB)).map((row) => row.id)).toContain("RS-CUS-B");

    const officerClaims = (await claims.getClaimsFor(officer)).map((row) => row.id);
    expect(officerClaims).toContain("RS-CLM-2");
    expect(officerClaims).not.toContain("RS-CLM-1");
    expect(officerClaims).not.toContain("RS-CLM-3");

    const agentClaims = (await claims.getClaimsFor(agentA)).map((row) => row.id);
    expect(agentClaims).toEqual(["RS-CLM-1"]);
    expect((await claims.getClaimsFor({ kind: "none" }))).toEqual([]);
    expect((await claims.getClaimsFor(all)).length).toBeGreaterThanOrEqual(3);
  });

  it("rejects a direct read of a record the user does not own", async () => {
    await seed();
    expect(await policies.getPolicyFor(agentA, "RS-POL-B")).toBeUndefined();
    expect(await policies.getPolicyFor(agentA, "RS-POL-A")).toBeDefined();
    expect(await claims.getClaimFor(officer, "RS-CLM-3")).toBeUndefined();
    expect(await claims.getClaimFor(officer, "RS-CLM-2")).toBeDefined();
    expect(await customers.getCustomerFor(agentA, "RS-CUS-B")).toBeUndefined();
  });

  it("the policy picker offers only own, in-force policies, once each", async () => {
    await seed();
    const options = (await policies.getClaimablePolicyOptions(agentA)).map((option) => option.policyNumber);
    expect(options).toContain("RS-POL-A");
    expect(options).not.toContain("RS-POL-B");
    expect(options).not.toContain("RS-POL-A-X");
    expect(new Set(options).size).toBe(options.length);
  });

  it("registerClaim rejects another agent's policy and a cancelled policy, accepts own in-force", async () => {
    await seed();
    const template = (await claims.getClaim("RS-CLM-1"))!;
    const base = { claimsReach: agentA, policiesReach: agentA, registeredByUserId: "staff-ta", template };

    const foreign = await claims.registerClaim({ ...base, policyId: "RS-POL-B" });
    expect(foreign.ok).toBe(false);
    const missing = await claims.registerClaim({ ...base, policyId: "RS-NOPE" });
    expect(missing.ok).toBe(false);
    const cancelled = await claims.registerClaim({ ...base, policyId: "RS-POL-A-X" });
    expect(cancelled).toMatchObject({ ok: false });
    const noRole = await claims.registerClaim({ ...base, claimsReach: { kind: "none" }, policyId: "RS-POL-A" });
    expect(noRole.ok).toBe(false);

    const good = await claims.registerClaim({ ...base, policyId: "RS-POL-A" });
    expect(good.ok).toBe(true);
    if (good.ok) {
      expect(good.claim.policyNumber).toBe("RS-POL-A");
      expect(good.claim.registeredByUserId).toBe("staff-ta");
      expect(good.claim.status).toBe("Open");
      // The new claim is visible to its registrant and not to another agent.
      expect(await claims.getClaimFor(agentA, good.claim.id)).toBeDefined();
      expect(await claims.getClaimFor(agentB, good.claim.id)).toBeUndefined();
    }
  });
});
