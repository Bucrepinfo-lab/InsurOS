export type PolicyStatus = 'Active' | 'Pending' | 'Expired' | 'Cancelled';

export interface Policy {
  id: string;
  policyNumber: string;
  customer: string;
  product: string;
  premium: string;
  status: PolicyStatus;
  /** The customer record it belongs to (older rows match by name). */
  customerId?: string;
  /** What is insured, in the customer's words: "Toyota Axio", "House in Ruiru". */
  insuredItem?: string;
  /** Value insured, whole units of the currency. */
  sumInsured?: number;
  /** Vehicle registration, for motor policies. */
  registration?: string;
  /** Year the vehicle was made, for the value estimate. */
  yearOfManufacture?: number;
  /** Cover period, yyyy-mm-dd. */
  startDate?: string;
  expiryDate?: string;
}