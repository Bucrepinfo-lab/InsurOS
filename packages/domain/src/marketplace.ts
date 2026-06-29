export type ProductStatus = 'Draft' | 'In Review' | 'Published' | 'Archived';

export interface InsuranceProduct {
  id: string;
  name: string;
  code: string;
  category: string;
  carrier: string;
  status: ProductStatus;
}