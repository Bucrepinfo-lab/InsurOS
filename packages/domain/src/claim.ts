export type ClaimStatus = 'Open' | 'In Review' | 'Approved' | 'Settled' | 'Closed';

export interface Claim {
  id: string;
  claimNumber: string;
  policyNumber: string;
  customer: string;
  amount: string;
  status: ClaimStatus;
}