import type { Claim } from '@insuros/domain';

export const mockClaims: Claim[] = [
  {
    id: 'CLM-2026-0001',
    claimNumber: 'CLM-2026-0001',
    policyNumber: 'POL-2026-0001',
    customer: 'Demo Customer',
    amount: 'KES 120,000',
    status: 'Open'
  }
];