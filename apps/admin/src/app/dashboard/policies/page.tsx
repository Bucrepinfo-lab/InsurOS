import Link from 'next/link';
import {
  Badge,
  DomainEntityList,
  DomainModulePage,
  KPICard,
  filterRows,
  readParam,
  type DataTableColumn
} from '@insuros/ui';
import type { OwnedPolicy, PolicyStatus } from '@insuros/domain';
import { PolicyService } from '@insuros/services';
import { StatusFilter, applyStatusFilter } from '@/components/list-filters';
import { currentReach } from '@/lib/record-scope';
import { RecordLink } from '@/components/record-view';
import { policyTone } from '@/lib/records';

export const metadata = { title: 'Policies' };

const policyService = new PolicyService();

const POLICY_STATUSES: readonly PolicyStatus[] = ['Active', 'Pending', 'Expired', 'Cancelled'];

const columns: DataTableColumn<OwnedPolicy>[] = [
  {
    key: 'policyNumber',
    header: 'Policy No.',
    render: (row) => <RecordLink href={`/dashboard/policies/${encodeURIComponent(row.id)}`}>{row.policyNumber}</RecordLink>
  },
  { key: 'customer', header: 'Customer' },
  { key: 'product', header: 'Product' },
  { key: 'premium', header: 'Premium' },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <Badge tone={policyTone(row.status)}>{row.status}</Badge>
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
      title='Policies'
      description='Every policy sold, with its cover and claims. Open a policy to see what it covers and register a claim.'
      actions={
        <Link href='/dashboard/policies/new' className='inline-flex items-center justify-center gap-2 rounded-lg bg-[linear-gradient(180deg,#22344f_0%,#1b2a41_100%)] px-4 py-2 text-sm font-medium text-paper shadow-[0_1px_2px_rgba(18,28,49,0.3),0_8px_20px_-10px_rgba(18,28,49,0.5)] transition-all duration-200 hover:-translate-y-px hover:bg-[linear-gradient(180deg,#128a6b_0%,#0f6e56_100%)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal'>
          Record policy
        </Link>
      }
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
        emptyDescription='Record the first policy.'
      />
    </DomainModulePage>
  );
}
