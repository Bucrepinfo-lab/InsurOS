import { describe, expect, it } from "vitest";
import { ClaimsAutomationService } from "../src";

describe("ClaimsAutomationService (v1: no automatic approval or payout)", () => {
  it("routes even a clean small claim to an adjuster by default", async () => {
    const result = await new ClaimsAutomationService().submitFnol({
      claimReference: "CLM-TEST-STP",
      policyReference: "POL-TEST-STP",
      insuranceLine: "Motor",
      channel: "Mobile",
      description: "Minor scratch",
      incidentAt: new Date(Date.now() - 4 * 3_600_000).toISOString(),
      amountClaimed: 1_000,
      currency: "KES",
      documentsComplete: true,
      policyAgeDays: 400,
      priorClaimsCount: 0
    });
    expect(result.decision.outcome).toBe("ManualReview");
  });
});
