import type { FinanceTransaction } from '@insuros/domain';

export const mockFinanceTransactions: FinanceTransaction[] = [
  {
    id: 'INV-2026-0001',
    reference: 'INV-2026-0001',
    type: 'Premium Invoice',
    party: 'Demo Customer',
    amount: 'KES 42,000',
    status: 'Paid'
  },
  {
    id: 'CLM-PAY-2026-0001',
    reference: 'CLM-PAY-2026-0001',
    type: 'Claim Payout',
    party: 'Demo Customer',
    amount: 'KES 100,000',
    status: 'Pending'
  }
];