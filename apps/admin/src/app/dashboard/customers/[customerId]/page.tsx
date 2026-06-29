import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  type DataTableColumn
} from '@insuros/ui';

type CustomerPolicyRow = {
  policyNumber: string;
  product: string;
  status: string;
  premium: string;
};

const policies: CustomerPolicyRow[] = [
  {
    policyNumber: 'POL-2026-0001',
    product: 'Motor Comprehensive',
    status: 'Active',
    premium: 'KES 42,000'
  }
];

const columns: DataTableColumn<CustomerPolicyRow>[] = [
  { key: 'policyNumber', header: 'Policy No.' },
  { key: 'product', header: 'Product' },
  { key: 'premium', header: 'Premium' },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <Badge tone='success'>{row.status}</Badge>
  }
];

export default function CustomerPoliciesPage() {
  return (
    <DomainModulePage
      title='Customer Policies'
      description='View all policies associated with this customer across product lines and lifecycle states.'
      actions={<Button>Issue Policy</Button>}
    >
      <DomainEntityList
        title='Policies'
        description='Insurance policies owned by this customer.'
        searchPlaceholder='Search customer policies...'
        columns={columns}
        data={policies}
        emptyTitle='No policies'
        emptyDescription='Issue the first policy for this customer.'
        emptyAction={<Button>Issue Policy</Button>}
        actions={<Button variant='secondary'>Export</Button>}
      />
    </DomainModulePage>
  );
}