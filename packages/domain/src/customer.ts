export type CustomerStatus = 'Active' | 'Pending' | 'Suspended' | 'Archived';

export interface Customer {
  id: string;
  name: string;
  type: 'Individual' | 'Business';
  email: string;
  status: CustomerStatus;
  /** Referral code of whoever referred this customer, entered once at sign-up. */
  referredBy?: string;
  /** When the customer's details were confirmed: the moment a referral counts. */
  verifiedAt?: string;
}