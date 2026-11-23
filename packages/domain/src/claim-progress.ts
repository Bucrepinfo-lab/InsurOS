import type { Claim, ClaimSettlementRecord, ClaimStep } from "./claim";

/*
  Moving a claim through its stages, one step at a time, each taken by a named
  person (owner approval 23/11/26). These are records only: InsurOS never sends
  money. Finance pays outside the app and records the payment here.

  Open --start review--> In Review --approve--> Approved --record payment--> (Approved, paid)
       --approve certificate--> Settled.     In Review --decline--> Closed.

  Four eyes on the money: the person who records the payment is not the person
  who approved the amount, and the person who approves the certificate of
  settlement is not the person who recorded the payment.
*/

export interface ClaimActor {
  userId: string;
  name: string;
}

export type ClaimNextStep = "start-review" | "decide" | "record-payment" | "approve-certificate" | "none";

export type ClaimProgressResult = { ok: true; patch: Partial<Claim> } | { ok: false; error: string };

const fail = (error: string): ClaimProgressResult => ({ ok: false, error });

/** "KES 120,000" → 120000; anything unreadable → NaN. */
export function claimedAmount(claim: Pick<Claim, "amount">): number {
  const digits = claim.amount.replace(/[^0-9.]/g, "");
  return digits ? Math.round(Number(digits)) : Number.NaN;
}

const kes = (amount: number) => `KES ${Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

const isDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));

export function isPaymentRecorded(claim: Claim): boolean {
  return Boolean(claim.settlement?.paymentReference);
}

/** The one step this claim is waiting for. */
export function nextClaimStep(claim: Claim): ClaimNextStep {
  if (claim.status === "Open") return "start-review";
  if (claim.status === "In Review") return "decide";
  if (claim.status === "Approved") return isPaymentRecorded(claim) ? "approve-certificate" : "record-payment";
  return "none";
}

function step(now: Date, stage: ClaimStep["stage"], label: string, actor: ClaimActor): ClaimStep {
  return { at: now.toISOString(), stage, label, by: actor.name, byUserId: actor.userId };
}

const withStep = (claim: Claim, added: ClaimStep): ClaimStep[] => [...(claim.steps ?? []), added];

export function startReview(claim: Claim, actor: ClaimActor, now = new Date()): ClaimProgressResult {
  if (claim.status !== "Open") return fail(`This claim is ${claim.status.toLowerCase()}; only an open claim can go into review.`);
  return {
    ok: true,
    patch: {
      status: "In Review",
      steps: withStep(claim, step(now, "Review", `Review started by ${actor.name}`, actor))
    }
  };
}

export interface ApproveInput {
  excess: number;
  notCovered: number;
  notCoveredReason?: string;
  note?: string;
}

export function approveClaim(claim: Claim, actor: ClaimActor, input: ApproveInput, now = new Date()): ClaimProgressResult {
  if (claim.status !== "In Review") return fail("Only a claim in review can be approved.");
  const claimed = claimedAmount(claim);
  if (!Number.isFinite(claimed) || claimed <= 0) return fail("The amount claimed on this claim cannot be read.");
  const { excess, notCovered } = input;
  if (![excess, notCovered].every((n) => Number.isInteger(n) && n >= 0)) {
    return fail("The excess and the amount not covered must be whole shillings, zero or more.");
  }
  const reason = (input.notCoveredReason ?? "").trim();
  if (notCovered > 0 && reason.length < 3) return fail("Say why part of the claim is not covered.");
  const approved = claimed - excess - notCovered;
  if (approved <= 0) return fail("Nothing would be paid. To refuse the claim, decline it with a reason instead.");
  const settlement: ClaimSettlementRecord = {
    claimed,
    excess,
    notCovered,
    notCoveredReason: notCovered > 0 ? reason : undefined,
    approved,
    reserve: claim.settlement?.reserve,
    approvedBy: actor.name,
    approvedByUserId: actor.userId,
    approvedOn: now.toISOString().slice(0, 10)
  };
  return {
    ok: true,
    patch: {
      status: "Approved",
      settlement,
      steps: withStep(claim, step(now, "Approval", `Approved for ${kes(approved)}`, actor))
    }
  };
}

export function declineClaim(claim: Claim, actor: ClaimActor, reason: string, now = new Date()): ClaimProgressResult {
  if (claim.status !== "In Review") return fail("Only a claim in review can be declined.");
  const why = reason.trim();
  if (why.length < 5) return fail("Give the reason for declining, in words the customer will understand.");
  return {
    ok: true,
    patch: {
      status: "Closed",
      declinedReason: why,
      steps: withStep(claim, step(now, "Declined", `Declined: ${why}`, actor))
    }
  };
}

export interface PaymentInput {
  paidTo: string;
  method: string;
  reference: string;
  paidOn: string;
  dischargeSignedOn: string;
}

export function recordPayment(claim: Claim, actor: ClaimActor, input: PaymentInput, now = new Date()): ClaimProgressResult {
  if (claim.status !== "Approved" || !claim.settlement) return fail("Only an approved claim can have its payment recorded.");
  if (isPaymentRecorded(claim)) return fail("The payment for this claim is already recorded.");
  if (claim.settlement.approvedByUserId && claim.settlement.approvedByUserId === actor.userId) {
    return fail("You approved this amount, so someone else records the payment.");
  }
  const paidTo = input.paidTo.trim();
  const method = input.method.trim();
  const reference = input.reference.trim();
  if (!paidTo || !method || !reference) return fail("Fill in who was paid, how, and the payment reference.");
  if (!isDate(input.paidOn) || !isDate(input.dischargeSignedOn)) return fail("Give the dates as day, month and year.");
  const today = now.toISOString().slice(0, 10);
  if (input.paidOn > today) return fail("The payment date cannot be in the future.");
  if (input.dischargeSignedOn > input.paidOn) return fail("The discharge voucher is signed before the payment is made.");
  if (claim.settlement.approvedOn && input.paidOn < claim.settlement.approvedOn) {
    return fail("The payment date is before the claim was approved.");
  }
  const settlement: ClaimSettlementRecord = {
    ...claim.settlement,
    paidTo,
    method,
    paymentReference: reference,
    paidOn: input.paidOn,
    dischargeSignedOn: input.dischargeSignedOn,
    paymentRecordedBy: actor.name,
    paymentRecordedByUserId: actor.userId
  };
  return {
    ok: true,
    patch: {
      settlement,
      steps: [
        ...(claim.steps ?? []),
        step(new Date(`${input.dischargeSignedOn}T00:00:00Z`), "Discharge", "Discharge voucher signed", { userId: "", name: paidTo }),
        step(now, "Payment", `Payment of ${kes(claim.settlement.approved)} recorded (${method}, ref ${reference})`, actor)
      ]
    }
  };
}

/** CS-<year>-<claim number digits>, stable for a claim. */
export function certificateNumberFor(claim: Claim, now = new Date()): string {
  const digits = claim.claimNumber.replace(/[^0-9]/g, "").slice(-6) || claim.id.replace(/[^0-9]/g, "").slice(-6);
  return `CS-${now.getUTCFullYear()}-${digits}`;
}

export function approveCertificate(claim: Claim, actor: ClaimActor, now = new Date()): ClaimProgressResult {
  if (claim.status !== "Approved" || !claim.settlement || !isPaymentRecorded(claim)) {
    return fail("The certificate is approved after the payment is recorded.");
  }
  if (claim.settlement.paymentRecordedByUserId && claim.settlement.paymentRecordedByUserId === actor.userId) {
    return fail("You recorded the payment, so someone else approves the certificate of settlement.");
  }
  const certificateNumber = certificateNumberFor(claim, now);
  return {
    ok: true,
    patch: {
      status: "Settled",
      settlement: {
        ...claim.settlement,
        certificateNumber,
        certificateApprovedBy: actor.name,
        certificateApprovedByUserId: actor.userId,
        certificateApprovedOn: now.toISOString().slice(0, 10)
      },
      steps: withStep(claim, step(now, "Certificate", `Certificate of settlement ${certificateNumber} approved; claim settled`, actor))
    }
  };
}
