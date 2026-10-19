import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  KPICard,
  type DataTableColumn
} from '@insuros/ui';
import { WorkflowService } from '@insuros/services';
import { ActionButton } from '@/components/ActionButton';
import { queueDemoRequest } from '@/app/dashboard/actions';

export const metadata = { title: 'Escalations' };

const workflowService = new WorkflowService();

export default async function EscalationsQueuePage() {
  const workflows = await workflowService.getEscalatedWorkflows();
  const blockedTasks = await workflowService.getBlockedTasks();

  type EscalationRow = (typeof workflows)[number];

  const columns: DataTableColumn<EscalationRow>[] = [
    { key: 'reference', header: 'Reference' },
    { key: 'name', header: 'Workflow' },
    { key: 'module', header: 'Module' },
    { key: 'assignee', header: 'Owner' },
    { key: 'dueAt', header: 'Due' },
    {
      key: 'priority',
      header: 'Priority',
      render: (row) => <Badge tone='danger'>{row.priority}</Badge>
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge tone='danger'>{row.status}</Badge>
    }
  ];

  return (
    <DomainModulePage
      title='Escalations'
      description='Track blocked, critical, overdue, and escalated operational work.'
      actions={<ActionButton label='Escalation Rules' action={queueDemoRequest.bind(null, 'Escalation Rules')} />}
    >
      <div className='mb-6 grid gap-4 md:grid-cols-3'>
        <KPICard title='Escalated Workflows' value={String(workflows.length)} change='Requires management review' />
        <KPICard title='Blocked Tasks' value={String(blockedTasks.length)} change='Needs intervention' />
        <KPICard title='Critical Priority' value={String(workflows.filter((item) => item.priority === 'Critical').length)} change='Escalate now' />
      </div>

      <DomainEntityList
        title='Escalated Workflows'
        description='Workflow items currently escalated for operational review.'
        searchPlaceholder='Search escalations...'
        columns={columns}
        data={workflows}
        emptyTitle='No escalations'
        emptyDescription='No escalated workflow items are currently active.'
        emptyAction={<Button>Escalation Rules</Button>}
      />
    </DomainModulePage>
  );
}