export type ClaimStatus = 'Open' | 'In Review' | 'Approved' | 'Settled' | 'Closed';

/** One step taken on a claim, oldest first. */
export interface ClaimStep {
  /** ISO date-time. */
  at: string;
  stage: 'Reported' | 'Review' | 'Documents' | 'Assessment' | 'Approval' | 'Declined' | 'Discharge' | 'Payment' | 'Certificate';
  label: string;
  /** Name (and role) of the person who took the step. */
  by: string;
  byUserId?: string;
}

/**
 * What was approved and paid on a claim, as recorded by people. A record only:
 * InsurOS never sends money. Amounts are whole shillings.
 */
export interface ClaimSettlementRecord {
  claimed: number;
  excess: number;
  notCovered: number;
  notCoveredReason?: string;
  approved: number;
  reserve?: number;
  approvedBy?: string;
  approvedByUserId?: string;
  /** yyyy-mm-dd */
  approvedOn?: string;
  dischargeSignedOn?: string;
  paidTo?: string;
  method?: string;
  paidOn?: string;
  paymentReference?: string;
  paymentRecordedBy?: string;
  paymentRecordedByUserId?: string;
  certificateNumber?: string;
  certificateApprovedBy?: string;
  certificateApprovedByUserId?: string;
  certificateApprovedOn?: string;
}

export interface Claim {
  id: string;
  claimNumber: string;
  policyNumber: string;
  customer: string;
  amount: string;
  status: ClaimStatus;
  /** Steps taken so far (added 23/11/26; older claims have none). */
  steps?: ClaimStep[];
  /** Approval, payment and certificate of settlement, once recorded. */
  settlement?: ClaimSettlementRecord;
  /** Why the claim was declined, in the customer's words. */
  declinedReason?: string;
}
