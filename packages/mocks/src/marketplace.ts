import type { InsuranceProduct } from '@insuros/domain';

export const mockProducts: InsuranceProduct[] = [
  {
    id: 'motor-comprehensive',
    name: 'Motor Comprehensive',
    code: 'MOTOR-COMP',
    category: 'Motor',
    carrier: 'InsurOS Demo',
    status: 'Draft'
  }
];