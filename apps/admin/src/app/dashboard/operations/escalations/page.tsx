import Link from 'next/link';
import { Badge, DomainEntityList, DomainModulePage, KPICard, formatDateTime, type DataTableColumn } from '@insuros/ui';
import { findStaffRole, flowFor } from '@insuros/domain';
import { FollowUpService } from '@insuros/services';
import { requirePageAccess } from "@/lib/auth/page-access";

export const metadata = { title: 'Escalations' };
export const dynamic = 'force-dynamic';

const roleName = (roleId: string) => findStaffRole(roleId)?.name ?? roleId;

/**
 * Every step, in any area, that its owner did not answer in time. An overview
 * for operations: the step itself is confirmed from Follow-ups by its owner
 * or the supervisor it has gone to.
 */
export default async function EscalationsQueuePage() {
  await requirePageAccess("/dashboard/operations/escalations");
  const lines = await new FollowUpService().escalated();
  const rows = lines.map((line) => {
    const flow = flowFor(line.item.area);
    return {
      id: line.item.id,
      reference: line.item.reference,
      subject: line.item.subject,
      flow: flow.title,
      step: `${line.stepNumber} of ${line.stepTotal}: ${line.stepLabel}`,
      owner: line.item.ownerName,
      due: formatDateTime(line.due),
      level: line.level,
      with: flow.ladder[line.level === 2 ? 1 : 0].map(roleName).join(' or ')
    };
  });
  type Row = (typeof rows)[number];

  const columns: DataTableColumn<Row>[] = [
    { key: 'reference', header: 'Record' },
    { key: 'subject', header: 'About' },
    { key: 'flow', header: 'Flow' },
    { key: 'step', header: 'Step owed' },
    { key: 'owner', header: 'Owner' },
    { key: 'due', header: 'Was due' },
    {
      key: 'with',
      header: 'Now with',
      render: (row) => <Badge tone={row.level === 2 ? 'danger' : 'warning'}>{row.with}</Badge>
    }
  ];

  return (
    <DomainModulePage
      title='Escalations'
      description='Steps nobody answered in time, and who they have gone to. Confirm a step from Follow-ups.'
      actions={
        <Link
          href='/dashboard/follow-ups'
          className='inline-flex items-center justify-center rounded-lg border border-ink/15 bg-sheet/60 px-4 py-2 text-sm font-medium text-ink transition hover:border-seal/50 hover:text-seal'
        >
          Open follow-ups
        </Link>
      }
    >
      <div className='mb-6 grid gap-4 md:grid-cols-3'>
        <KPICard title='Escalated steps' value={String(rows.length)} change='Not answered in time' />
        <KPICard title='With a supervisor' value={String(rows.filter((row) => row.level === 1).length)} change='First level' />
        <KPICard title='With the administrator' value={String(rows.filter((row) => row.level === 2).length)} change='Second level' />
      </div>

      <DomainEntityList
        title='Escalated steps'
        description='Oldest first within each level.'
        searchPlaceholder='Search escalations...'
        columns={columns}
        data={rows}
        emptyTitle='Nothing has escalated'
        emptyDescription='Every open step is still inside its time to respond.'
      />
    </DomainModulePage>
  );
}
