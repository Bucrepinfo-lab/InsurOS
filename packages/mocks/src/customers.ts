import type { Customer } from '@insuros/domain';
import { sampleCustomers } from './sample-book';

export const mockCustomers: Customer[] = [
  {
    id: 'demo-customer',
    name: 'Demo Customer',
    type: 'Individual',
    email: 'customer@insuros.local',
    status: 'Active'
  },
  // Worked examples for every kind of cover (sample-book.ts).
  ...sampleCustomers
];