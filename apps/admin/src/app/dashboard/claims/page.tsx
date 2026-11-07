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
import type { ClaimStatus, OwnedClaim } from '@insuros/domain';
import { ClaimService } from '@insuros/services';
import { ActionButton } from '@/components/ActionButton';
import { StatusFilter, applyStatusFilter } from '@/components/list-filters';
import { registerDemoClaim } from '@/app/dashboard/actions';
import { currentReach } from '@/lib/record-scope';

const CLAIM_STATUSES: readonly ClaimStatus[] = ['Open', 'In Review', 'Approved', 'Settled', 'Closed'];

const columns: DataTableColumn<OwnedClaim>[] = [
  { key: 'claimNumber', header: 'Claim No.' },
  { key: 'policyNumber', header: 'Policy No.' },
  { key: 'customer', header: 'Customer' },
  { key: 'amount', header: 'Claimed Amount' },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <Badge tone='warning'>{row.status}</Badge>
  }
];

export default async function ClaimsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = readParam(params, 'q');
  const status = readParam(params, 'status');

  // Server-side: a Claims Officer gets only claims assigned to them; an Agent
  // only claims they registered or on their own policies.
  const reach = await currentReach('Claims');
  const visible = await new ClaimService().getClaimsFor(reach);
  // One filter, used by the table, the summary cards and the CSV export.
  const filtered = filterRows(applyStatusFilter(visible, CLAIM_STATUSES, status), columns, query);
  const count = (s: ClaimStatus) => filtered.filter((row) => row.status === s).length;

  return (
    <DomainModulePage
      title='Claims Management'
      description='Manage FNOL, claim assessment, reserves, approvals, settlement, recovery, and closure.'
      actions={<ActionButton label='Register claim' action={registerDemoClaim} />}
    >
      <div className='mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <KPICard title='Claims' value={String(filtered.length)} change={reach.kind === 'own' ? 'Your claims' : 'Matching filters'} />
        <KPICard title='Open / in review' value={String(count('Open') + count('In Review'))} />
        <KPICard title='Approved' value={String(count('Approved'))} />
        <KPICard title='Settled / closed' value={String(count('Settled') + count('Closed'))} />
      </div>
      <DomainEntityList
        title='Claims'
        description={reach.kind === 'own' ? 'Claims assigned to you or that you registered.' : 'Claims currently managed by the platform.'}
        searchPlaceholder='Search claims...'
        searchParam='q'
        query={query}
        filters={<StatusFilter statuses={CLAIM_STATUSES} value={status} />}
        columns={columns}
        data={filtered}
        emptyTitle='No claims'
        emptyDescription='Register the first claim.'
        emptyAction={<Button>Register Claim</Button>}
      />
    </DomainModulePage>
  );
}
