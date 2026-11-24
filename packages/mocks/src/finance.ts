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
  },
  {
    id: 'INV-2026-0002',
    reference: 'INV-2026-0002',
    type: 'Premium Invoice',
    party: 'Amina Hassan',
    amount: 'KES 58,000',
    status: 'Pending'
  },
  {
    id: 'RCPT-2026-0001',
    reference: 'RCPT-2026-0001',
    type: 'Premium Receipt',
    party: 'Rongai Shuttle Sacco',
    amount: 'KES 160,000',
    status: 'Matched'
  }
];
