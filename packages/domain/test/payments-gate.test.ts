import { describe, expect, it } from "vitest";
import { adjudicate, assessFraud, isPaymentsEnabled, type AdjudicationRule, type FnolSubmission } from "../src";

describe("v1 money gate", () => {
  it("is off unless exactly true", () => {
    expect(isPaymentsEnabled(undefined)).toBe(false);
    expect(isPaymentsEnabled("")).toBe(false);
    expect(isPaymentsEnabled("1")).toBe(false);
    expect(isPaymentsEnabled("yes")).toBe(false);
    expect(isPaymentsEnabled("true")).toBe(true);
    expect(isPaymentsEnabled(" TRUE ")).toBe(true);
  });
});

describe("adjudication without auto-approval (no automatic payout)", () => {
  const fnol: FnolSubmission = {
    id: "fnol-test",
    claimReference: "CLM-TEST-1",
    policyReference: "POL-TEST-1",
    insuranceLine: "Motor",
    channel: "Mobile",
    description: "Minor scratch",
    incidentAt: new Date(Date.now() - 4 * 3_600_000).toISOString(),
    reportedAt: new Date().toISOString(),
    amountClaimed: 5_000,
    currency: "KES",
    documentsComplete: true,
    policyAgeDays: 400,
    priorClaimsCount: 0,
    status: "Received"
  } as FnolSubmission;

  const rule = {
    id: "rule-test",
    name: "Small motor",
    insuranceLine: "All",
    maxAutoApproveAmount: 50_000,
    maxFraudScore: 100,
    requiresCompleteDocuments: false,
    payoutSlaHours: 24,
    active: true
  } as AdjudicationRule;

  it("auto-approves only when explicitly allowed", () => {
    const assessment = assessFraud(fnol);
    expect(adjudicate(fnol, assessment, [rule], { allowAutoApprove: true }).outcome).toBe("AutoApproved");
    const manual = adjudicate(fnol, assessment, [rule], { allowAutoApprove: false });
    expect(manual.outcome).toBe("ManualReview");
    expect(manual.slaHours).toBeUndefined();
    expect(manual.reasons.join(" ")).toMatch(/adjuster/);
  });
});
