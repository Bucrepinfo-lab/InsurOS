import { describe, expect, it } from "vitest";
import {
  approveCertificate,
  approveClaim,
  claimedAmount,
  declineClaim,
  nextClaimStep,
  recordPayment,
  startReview,
  type Claim,
  type ClaimProgressResult
} from "../src";

const officer = { userId: "u-officer", name: "Grace, Claims Officer" };
const manager = { userId: "u-manager", name: "Mary, Claims Manager" };
const finance = { userId: "u-finance", name: "James, Finance" };
const now = new Date("2026-11-23T10:00:00Z");

const open: Claim = {
  id: "CLM-2026-000777",
  claimNumber: "CLM-2026-000777",
  policyNumber: "POL-1",
  customer: "Amina",
  amount: "KES 186,000",
  status: "Open"
};

function apply(claim: Claim, result: ClaimProgressResult): Claim {
  if (!result.ok) throw new Error(result.error);
  return { ...claim, ...result.patch };
}

const payment = { paidTo: "Westlands Auto Body", method: "Bank transfer", reference: "TRX-1", paidOn: "2026-11-23", dischargeSignedOn: "2026-11-22" };

describe("claim progress", () => {
  it("reads the claimed amount", () => {
    expect(claimedAmount(open)).toBe(186000);
  });

  it("takes a claim from open to settled, one person per money step", () => {
    expect(nextClaimStep(open)).toBe("start-review");
    const reviewed = apply(open, startReview(open, officer, now));
    expect(reviewed.status).toBe("In Review");
    expect(nextClaimStep(reviewed)).toBe("decide");

    const approved = apply(reviewed, approveClaim(reviewed, manager, { excess: 15000, notCovered: 0 }, now));
    expect(approved.status).toBe("Approved");
    expect(approved.settlement?.approved).toBe(171000);
    expect(nextClaimStep(approved)).toBe("record-payment");

    const paid = apply(approved, recordPayment(approved, finance, payment, now));
    expect(paid.status).toBe("Approved");
    expect(nextClaimStep(paid)).toBe("approve-certificate");

    const settled = apply(paid, approveCertificate(paid, manager, now));
    expect(settled.status).toBe("Settled");
    expect(settled.settlement?.certificateNumber).toBe("CS-2026-000777");
    expect(nextClaimStep(settled)).toBe("none");
    expect(settled.steps?.map((s) => s.stage)).toEqual(["Review", "Approval", "Discharge", "Payment", "Certificate"]);
  });

  it("keeps four eyes on the money", () => {
    const reviewed = apply(open, startReview(open, officer, now));
    const approved = apply(reviewed, approveClaim(reviewed, manager, { excess: 0, notCovered: 0 }, now));
    expect(recordPayment(approved, manager, payment, now)).toMatchObject({ ok: false });
    const paid = apply(approved, recordPayment(approved, finance, payment, now));
    expect(approveCertificate(paid, finance, now)).toMatchObject({ ok: false });
  });

  it("refuses steps out of order and bad figures", () => {
    expect(approveClaim(open, manager, { excess: 0, notCovered: 0 }, now)).toMatchObject({ ok: false });
    expect(approveCertificate(open, manager, now)).toMatchObject({ ok: false });
    const reviewed = apply(open, startReview(open, officer, now));
    expect(startReview(reviewed, officer, now)).toMatchObject({ ok: false });
    expect(approveClaim(reviewed, manager, { excess: -1, notCovered: 0 }, now)).toMatchObject({ ok: false });
    expect(approveClaim(reviewed, manager, { excess: 0, notCovered: 5000 }, now)).toMatchObject({ ok: false });
    expect(approveClaim(reviewed, manager, { excess: 186000, notCovered: 0 }, now)).toMatchObject({ ok: false });
    const approved = apply(reviewed, approveClaim(reviewed, manager, { excess: 0, notCovered: 6000, notCoveredReason: "Tyres are not covered" }, now));
    expect(approved.settlement?.approved).toBe(180000);
    expect(recordPayment(approved, finance, { ...payment, paidOn: "2026-12-01" }, now)).toMatchObject({ ok: false });
    expect(recordPayment(approved, finance, { ...payment, dischargeSignedOn: "2026-11-24", paidOn: "2026-11-23" }, now)).toMatchObject({ ok: false });
    expect(recordPayment(approved, finance, { ...payment, reference: " " }, now)).toMatchObject({ ok: false });
    expect(recordPayment(approved, finance, { ...payment, paidOn: "2026-11-01", dischargeSignedOn: "2026-11-01" }, now)).toMatchObject({ ok: false });
  });

  it("declines a claim in review with a reason and closes it", () => {
    const reviewed = apply(open, startReview(open, officer, now));
    expect(declineClaim(reviewed, manager, "no", now)).toMatchObject({ ok: false });
    const declined = apply(reviewed, declineClaim(reviewed, manager, "The car was used for hire, which the policy excludes.", now));
    expect(declined.status).toBe("Closed");
    expect(declined.declinedReason).toContain("hire");
    expect(nextClaimStep(declined)).toBe("none");
  });
});
