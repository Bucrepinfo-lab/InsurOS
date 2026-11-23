import type { Claim } from '@insuros/domain';
import { sampleClaims } from './sample-book';

export const mockClaims: Claim[] = [
  {
    id: 'CLM-2026-0001',
    claimNumber: 'CLM-2026-0001',
    policyNumber: 'POL-2026-0001',
    customer: 'Demo Customer',
    amount: 'KES 120,000',
    status: 'Open'
  },
  // Worked examples for every kind of cover (sample-book.ts).
  ...sampleClaims
];