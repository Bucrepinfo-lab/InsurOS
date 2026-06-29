export type PolicyStatus = 'Active' | 'Pending' | 'Expired' | 'Cancelled';

export interface Policy {
  id: string;
  policyNumber: string;
  customer: string;
  product: string;
  premium: string;
  status: PolicyStatus;
}