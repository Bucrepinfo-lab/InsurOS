import { describe, expect, it } from "vitest";
import {
  approveCertificate,
  approveClaim,
  recordPayment,
  startReview,
  type OwnedClaim,
  type OwnedPolicy,
  type RecordReach
} from "@insuros/domain";
import { ClaimService, getPersistence } from "../src";

const all: RecordReach = { kind: "all" };
const agent: RecordReach = { kind: "own", userIds: ["cp-agent"] };
const officer = { userId: "cp-officer", name: "Officer" };
const manager = { userId: "cp-manager", name: "Manager" };
const finance = { userId: "cp-finance", name: "Finance" };
const service = new ClaimService();

async function seed(): Promise<OwnedClaim> {
  const db = getPersistence();
  const policy: OwnedPolicy = { id: "CP-POL", policyNumber: "CP-POL", customer: "Holder", product: "Motor", premium: "KES 1", status: "Active", ownerUserId: "cp-other" };
  if (!(await db.policies.findById(policy.id))) await db.policies.insert(policy);
  const claim: OwnedClaim = { id: "CP-CLM-1", claimNumber: "CP-CLM-1", policyNumber: "CP-POL", customer: "Holder", amount: "KES 50,000", status: "Open" };
  if (!(await db.claims.findById(claim.id))) await db.claims.insert(claim);
  return claim;
}

describe("ClaimService.progressClaim", () => {
  it("saves each step and settles the claim", async () => {
    await seed();
    const step = async (take: Parameters<ClaimService["progressClaim"]>[2]) => {
      const result = await service.progressClaim(all, "CP-CLM-1", take);
      if (!result.ok) throw new Error(result.error);
      return result.claim;
    };
    await step((claim) => startReview(claim, officer));
    await step((claim) => approveClaim(claim, manager, { excess: 5000, notCovered: 0 }));
    await step((claim) => recordPayment(claim, finance, { paidTo: "Garage", method: "Bank transfer", reference: "T1", paidOn: new Date().toISOString().slice(0, 10), dischargeSignedOn: new Date().toISOString().slice(0, 10) }));
    const settled = await step((claim) => approveCertificate(claim, manager));
    expect(settled.status).toBe("Settled");
    const stored = (await getPersistence().claims.findById("CP-CLM-1")) as OwnedClaim;
    expect(stored.settlement?.approved).toBe(45000);
    expect(stored.settlement?.certificateNumber).toBeTruthy();
    expect(stored.steps?.map((s) => s.stage)).toEqual(["Review", "Approval", "Discharge", "Payment", "Certificate"]);
  });

  it("refuses a claim the person may not see, and a step out of order", async () => {
    await seed();
    expect(await service.progressClaim(agent, "CP-CLM-1", (claim) => startReview(claim, officer))).toMatchObject({ ok: false });
    expect(await service.progressClaim(all, "CP-CLM-1", (claim) => startReview(claim, officer))).toMatchObject({ ok: false });
  });
});
