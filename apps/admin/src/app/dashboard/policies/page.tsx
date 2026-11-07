import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  KPICard,
  filterRows,
  readParam,
  type DataTableColumn
} from '@insuros/ui';
import type { OwnedPolicy, PolicyStatus } from '@insuros/domain';
import { PolicyService } from '@insuros/services';
import { ActionButton } from '@/components/ActionButton';
import { StatusFilter, applyStatusFilter } from '@/components/list-filters';
import { issueDemoPolicy } from '@/app/dashboard/actions';
import { currentReach } from '@/lib/record-scope';

export const metadata = { title: 'Policies' };

const policyService = new PolicyService();

const POLICY_STATUSES: readonly PolicyStatus[] = ['Active', 'Pending', 'Expired', 'Cancelled'];

const columns: DataTableColumn<OwnedPolicy>[] = [
  { key: 'policyNumber', header: 'Policy No.' },
  { key: 'customer', header: 'Customer' },
  { key: 'product', header: 'Product' },
  { key: 'premium', header: 'Premium' },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <Badge tone={row.status === 'Active' ? 'success' : 'warning'}>{row.status}</Badge>
  }
];

export default async function PoliciesPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = readParam(params, 'q');
  const status = readParam(params, 'status');

  // Server-side: own-records roles (Agent) get only their own policies.
  const reach = await currentReach('Policies');
  const visible = await policyService.getPoliciesFor(reach);
  // One filter, used by the table, the summary cards and the CSV export.
  const filtered = filterRows(applyStatusFilter(visible, POLICY_STATUSES, status), columns, query);
  const count = (s: PolicyStatus) => filtered.filter((row) => row.status === s).length;

  return (
    <DomainModulePage
      title='Policy Lifecycle'
      description='Manage policy issuance, servicing, endorsements, renewals, cancellations, and lifecycle operations.'
      actions={<ActionButton label='Issue policy' action={issueDemoPolicy} />}
    >
      <div className='mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <KPICard title='Policies' value={String(filtered.length)} change={reach.kind === 'own' ? 'Your book' : 'Matching filters'} />
        <KPICard title='In force' value={String(count('Active'))} />
        <KPICard title='Pending' value={String(count('Pending'))} />
        <KPICard title='Expired / cancelled' value={String(count('Expired') + count('Cancelled'))} />
      </div>
      <DomainEntityList
        title='Policies'
        description={reach.kind === 'own' ? 'Policies you captured.' : 'All insurance policies managed by the platform.'}
        searchPlaceholder='Search policies...'
        searchParam='q'
        query={query}
        filters={<StatusFilter statuses={POLICY_STATUSES} value={status} />}
        columns={columns}
        data={filtered}
        emptyTitle='No policies'
        emptyDescription='Issue the first insurance policy.'
        emptyAction={<Button>Issue Policy</Button>}
      />
    </DomainModulePage>
  );
}
