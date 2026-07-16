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

export const metadata = { title: 'Tasks' };

const workflowService = new WorkflowService();

export default async function OperationsPage() {
  const workflows = await workflowService.getWorkflows();
  const escalated = await workflowService.getEscalatedWorkflows();

  type WorkflowRow = (typeof workflows)[number];

  const columns: DataTableColumn<WorkflowRow>[] = [
    { key: 'reference', header: 'Reference' },
    { key: 'name', header: 'Workflow' },
    { key: 'module', header: 'Module' },
    { key: 'assignee', header: 'Assignee' },
    { key: 'dueAt', header: 'Due' },
    {
      key: 'priority',
      header: 'Priority',
      render: (row) => (
        <Badge tone={row.priority === 'Critical' ? 'danger' : row.priority === 'High' ? 'warning' : 'neutral'}>
          {row.priority}
        </Badge>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge tone={row.status === 'Escalated' ? 'danger' : row.status === 'Approved' ? 'success' : 'warning'}>
          {row.status}
        </Badge>
      )
    }
  ];

  return (
    <DomainModulePage
      title='Workflow & Operations'
      description='Track operational work, approvals, assignments, escalations, and SLA-sensitive workflows.'
      actions={<ActionButton label='Create Workflow' action={queueDemoRequest.bind(null, 'Create Workflow')} />}
    >
      <div className='mb-6 grid gap-4 md:grid-cols-3'>
        <KPICard title='Active Workflows' value={String(workflows.length)} change='Across modules' />
        <KPICard title='Escalations' value={String(escalated.length)} change='Requires attention' />
        <KPICard title='SLA Watch' value='3' change='Due soon' />
      </div>

      <DomainEntityList
        title='Operational Workflows'
        description='Current workflows requiring operational tracking or action.'
        searchPlaceholder='Search workflows...'
        columns={columns}
        data={workflows}
        emptyTitle='No workflows'
        emptyDescription='No operational workflows are currently active.'
        emptyAction={<Button>Create Workflow</Button>}
        actions={<Button variant='secondary'>Export</Button>}
      />
    </DomainModulePage>
  );
}