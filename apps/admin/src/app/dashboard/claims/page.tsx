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
import type { ClaimStatus, OwnedClaim } from '@insuros/domain';
import { ClaimService } from '@insuros/services';
import { StatusFilter, applyStatusFilter } from '@/components/list-filters';
import { currentReach } from '@/lib/record-scope';
import { RecordLink } from '@/components/record-view';
import { claimTone } from '@/lib/records';
import { requirePageAccess } from "@/lib/auth/page-access";

const CLAIM_STATUSES: readonly ClaimStatus[] = ['Open', 'In Review', 'Approved', 'Settled', 'Closed'];

const columns: DataTableColumn<OwnedClaim>[] = [
  {
    key: 'claimNumber',
    header: 'Claim No.',
    render: (row) => <RecordLink href={`/dashboard/claims/${encodeURIComponent(row.id)}`}>{row.claimNumber}</RecordLink>
  },
  { key: 'policyNumber', header: 'Policy No.' },
  { key: 'customer', header: 'Customer' },
  { key: 'amount', header: 'Amount claimed' },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <Badge tone={claimTone(row.status)}>{row.status}</Badge>
  }
];

export default async function ClaimsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePageAccess("/dashboard/claims");
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
      title='Claims'
      description='Every claim from first notice to settlement. Open a claim to see its assessment, settlement and certificate.'
      actions={
        <Link href='/dashboard/claims/new' className='inline-flex items-center justify-center gap-2 rounded-lg bg-[linear-gradient(180deg,#22344f_0%,#1b2a41_100%)] px-4 py-2 text-sm font-medium text-paper shadow-[0_1px_2px_rgba(18,28,49,0.3),0_8px_20px_-10px_rgba(18,28,49,0.5)] transition-all duration-200 hover:-translate-y-px hover:bg-[linear-gradient(180deg,#128a6b_0%,#0f6e56_100%)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal'>
          Register claim
        </Link>
      }
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
      />
    </DomainModulePage>
  );
}
