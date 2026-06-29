export type CustomerStatus = 'Active' | 'Pending' | 'Suspended' | 'Archived';

export interface Customer {
  id: string;
  name: string;
  type: 'Individual' | 'Business';
  email: string;
  status: CustomerStatus;
}