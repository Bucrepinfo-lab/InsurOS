import type { InsuranceProduct } from '@insuros/domain';
import { sampleProducts } from './sample-book';

export const mockProducts: InsuranceProduct[] = [
  {
    id: 'motor-comprehensive',
    name: 'Motor Comprehensive',
    code: 'MOTOR-COMP',
    category: 'Motor',
    carrier: 'InsurOS Demo',
    status: 'Draft'
  },
  // Worked examples for every kind of cover (sample-book.ts).
  ...sampleProducts
];