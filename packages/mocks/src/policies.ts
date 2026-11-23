import type { Policy } from '@insuros/domain';
import { samplePolicies } from './sample-book';

export const mockPolicies: Policy[] = [
  {
    id: 'POL-2026-0001',
    policyNumber: 'POL-2026-0001',
    customer: 'Demo Customer',
    product: 'Motor Comprehensive',
    premium: 'KES 42,000',
    status: 'Active'
  },
  // Worked examples for every kind of cover (sample-book.ts).
  ...samplePolicies
];