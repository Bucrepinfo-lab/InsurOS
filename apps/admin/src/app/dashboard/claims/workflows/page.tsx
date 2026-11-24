import { Badge, DomainEntityList, DomainModulePage, KPICard, type DataTableColumn } from '@insuros/ui';
import { ClaimService } from '@insuros/services';
import { RecordLink } from '@/components/record-view';
import { currentReach } from '@/lib/record-scope';
import { claimStage } from '@/lib/records';
import { requirePageAccess } from "@/lib/auth/page-access";

export const metadata = { title: 'Claim workflow' };

type Row = { id: string; claimNumber: string; customer: string; stage: string; state: string };

const tone = (state: string) =>
  state === 'Settled' || state === 'Closed' ? 'success' : state === 'Declined' ? 'danger' : state === 'Approved' ? 'neutral' : 'warning';

const columns: DataTableColumn<Row>[] = [
  {
    key: 'claimNumber',
    header: 'Claim',
    render: (row) => <RecordLink href={`/dashboard/claims/${encodeURIComponent(row.id)}`}>{row.claimNumber}</RecordLink>
  },
  { key: 'customer', header: 'Customer' },
  { key: 'stage', header: 'Stage' },
  { key: 'state', header: 'Status', render: (row) => <Badge tone={tone(row.state)}>{row.state}</Badge> }
];

export default async function ClaimWorkflowsPage() {
  await requirePageAccess("/dashboard/claims/workflows");
  // Built from this tenant's claims that this person may see, so a step taken
  // on a claim shows here at once and no other tenant's claims appear.
  const claims = await new ClaimService().getClaimsFor(await currentReach('Claims'));
  const rows: Row[] = claims.map((claim) => ({ id: claim.id, claimNumber: claim.claimNumber, customer: claim.customer, ...claimStage(claim) }));
  const count = (state: string) => rows.filter((row) => row.state === state).length;

  return (
    <DomainModulePage
      title='Claim workflow'
      description='Where each claim stands: first notice, assessment, settlement and closure. Open a claim to take its next step.'
    >
      <div className='mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <KPICard title='New' value={String(count('Submitted'))} change='Waiting for review' />
        <KPICard title='In review' value={String(count('In Review'))} change='Waiting for a decision' />
        <KPICard title='Approved' value={String(count('Approved'))} change='Payment or certificate due' />
        <KPICard title='Settled' value={String(count('Settled'))} change='Certificate approved' />
      </div>
      <DomainEntityList
        title='Claims by stage'
        description='Every claim you can see, with the step it is waiting for.'
        searchPlaceholder='Search claims...'
        columns={columns}
        data={rows}
        emptyTitle='No claims yet'
        emptyDescription='A claim appears here once it is registered.'
      />
    </DomainModulePage>
  );
}
