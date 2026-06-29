export type FinanceStatus = 'Paid' | 'Pending' | 'Failed' | 'Matched';

export interface FinanceTransaction {
  id: string;
  reference: string;
  type: string;
  party: string;
  amount: string;
  status: FinanceStatus;
}