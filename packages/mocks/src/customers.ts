import type { Customer } from '@insuros/domain';

export const mockCustomers: Customer[] = [
  {
    id: 'demo-customer',
    name: 'Demo Customer',
    type: 'Individual',
    email: 'customer@insuros.local',
    status: 'Active'
  }
];