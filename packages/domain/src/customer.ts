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
  /** SHA-256 of the customer's private home-page link. The link itself is never stored. */
  homeAccessHash?: string;
  /** First time the customer opened their page: their free month of My Cover Plus starts here. */
  plusStartedAt?: string;
  /** Calendar months of My Cover Plus paid ("2026-12"), written only by a confirmed payment. */
  plusPaidMonths?: string[];
}