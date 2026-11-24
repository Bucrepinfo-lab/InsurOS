import {
  Badge,
  DomainEntityList,
  DomainModulePage,
  type DataTableColumn
} from '@insuros/ui';
import { requirePageAccess } from "@/lib/auth/page-access";

export const metadata = { title: 'Pricing' };

type PricingRuleRow = {
  name: string;
  type: string;
  basis: string;
  status: string;
};

const pricingRules: PricingRuleRow[] = [
  {
    name: 'Base Premium',
    type: 'Base',
    basis: 'Vehicle value',
    status: 'Active'
  },
  {
    name: 'Risk Loading',
    type: 'Loading',
    basis: 'Driver risk score',
    status: 'Draft'
  }
];

const columns: DataTableColumn<PricingRuleRow>[] = [
  { key: 'name', header: 'Rule' },
  { key: 'type', header: 'Type' },
  { key: 'basis', header: 'Basis' },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <Badge tone={row.status === 'Active' ? 'success' : 'warning'}>
        {row.status}
      </Badge>
    )
  }
];

export default async function ProductPricingPage() {
  await requirePageAccess("/dashboard/marketplace/[productId]/pricing");
  return (
    <DomainModulePage
      title='Pricing Rules'
      description='Configure premiums, rating inputs, loadings, discounts, taxes, fees, and pricing formulas.'
    >
      <DomainEntityList
        title='Pricing Rules'
        description='Pricing logic attached to this product version.'
        searchPlaceholder='Search pricing rules...'
        columns={columns}
        data={pricingRules}
        emptyTitle='No pricing rules'
        emptyDescription='Add the first pricing rule for this product.'
      />
    </DomainModulePage>
  );
}