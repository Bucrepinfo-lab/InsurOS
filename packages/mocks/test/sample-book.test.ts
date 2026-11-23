import { describe, expect, it } from "vitest";
import { POLICY_LINES } from "@insuros/domain";
import {
  SAMPLE_LINE_IDS,
  mockClaims,
  mockCustomers,
  mockPolicies,
  mockProducts,
  sampleClaimStories,
  sampleClaimStory,
  sampleClaims,
  samplePolicies
} from "../src";

describe("sample book", () => {
  it("has three worked examples for every kind of cover the app lists", () => {
    expect([...SAMPLE_LINE_IDS].sort()).toEqual(POLICY_LINES.map((line) => line.id).sort());
    for (const lineId of SAMPLE_LINE_IDS) {
      expect(sampleClaimStories.filter((story) => story.lineId === lineId)).toHaveLength(3);
    }
  });

  it("links every claim to a sold policy, its customer and its product", () => {
    const productNames = new Set(mockProducts.map((product) => product.name));
    for (const story of sampleClaimStories) {
      const claim = mockClaims.find((row) => row.id === story.claimId);
      const policy = mockPolicies.find((row) => row.id === story.policyId);
      expect(claim?.policyNumber).toBe(policy?.policyNumber);
      expect(policy?.status).toBe("Active");
      expect(productNames.has(policy!.product)).toBe(true);
      expect(mockCustomers.some((customer) => customer.id === policy!.customerId && customer.name === policy!.customer)).toBe(true);
      expect(claim?.customer).toBe(policy?.customer);
    }
  });

  it("keeps ids unique", () => {
    const ids = (rows: { id: string }[]) => new Set(rows.map((row) => row.id)).size === rows.length;
    expect(ids(mockPolicies)).toBe(true);
    expect(ids(mockClaims)).toBe(true);
    expect(ids(mockCustomers)).toBe(true);
    expect(ids(mockProducts)).toBe(true);
  });

  it("puts every incident inside the cover period", () => {
    for (const story of sampleClaimStories) {
      const policy = samplePolicies.find((row) => row.id === story.policyId)!;
      expect(story.incidentDate >= policy.startDate!).toBe(true);
      expect(story.incidentDate <= policy.expiryDate!).toBe(true);
    }
  });

  it("takes every claim through all steps, in order, to an approved certificate of settlement", () => {
    const order = ["Reported", "Documents", "Assessment", "Approval", "Discharge", "Payment", "Certificate"];
    for (const story of sampleClaimStories) {
      expect(story.steps.map((step) => step.stage)).toEqual(order);
      const times = story.steps.map((step) => step.at);
      expect([...times].sort()).toEqual(times);
      expect(story.steps[0].at.slice(0, 10) >= story.incidentDate).toBe(true);
      expect(sampleClaims.find((claim) => claim.id === story.claimId)?.status).toBe("Settled");
      expect(story.settlement.certificateNumber).toMatch(/^CS-2026-\d{4}$/);
      expect(story.settlement.certificateApprovedOn >= story.settlement.paidOn).toBe(true);
      expect(story.settlement.dischargeSignedOn <= story.settlement.paidOn).toBe(true);
    }
  });

  it("pays exactly the claim less the excess and anything not covered", () => {
    for (const story of sampleClaimStories) {
      const { claimed, excess, notCovered, approved, reserve, notCoveredReason } = story.settlement;
      expect(approved).toBe(claimed - excess - notCovered);
      expect(approved).toBeGreaterThan(0);
      expect(reserve).toBeGreaterThanOrEqual(claimed);
      if (notCovered > 0) expect(notCoveredReason).toBeTruthy();
    }
  });

  it("finds a story by claim id and nothing for other claims", () => {
    expect(sampleClaimStory(sampleClaimStories[0].claimId)?.policyId).toBe(sampleClaimStories[0].policyId);
    expect(sampleClaimStory("CLM-2026-0001")).toBeUndefined();
  });
});
