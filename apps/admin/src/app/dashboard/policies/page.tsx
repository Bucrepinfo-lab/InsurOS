import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  type DataTableColumn
} from '@insuros/ui';
import { PolicyService } from '@insuros/services';
import { ActionButton } from '@/components/ActionButton';
import { issueDemoPolicy } from '@/app/dashboard/actions';

export const metadata = { title: 'Policies' };

const policyService = new PolicyService();

export default async function PoliciesPage() {
  const policies = await policyService.getPolicies();

  type PolicyRow = (typeof policies)[number];

  const columns: DataTableColumn<PolicyRow>[] = [
    { key: 'policyNumber', header: 'Policy No.' },
    { key: 'customer', header: 'Customer' },
    { key: 'product', header: 'Product' },
    { key: 'premium', header: 'Premium' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge tone='success'>{row.status}</Badge>
    }
  ];

  return (
    <DomainModulePage
      title='Policy Lifecycle'
      description='Manage policy issuance, servicing, endorsements, renewals, cancellations, and lifecycle operations.'
      actions={<ActionButton label='Issue policy' action={issueDemoPolicy} />}
    >
      <DomainEntityList
        title='Policies'
        description='All insurance policies managed by the platform.'
        searchPlaceholder='Search policies...'
        columns={columns}
        data={policies}
        emptyTitle='No policies'
        emptyDescription='Issue the first insurance policy.'
        emptyAction={<Button>Issue Policy</Button>}
      />
    </DomainModulePage>
  );
}