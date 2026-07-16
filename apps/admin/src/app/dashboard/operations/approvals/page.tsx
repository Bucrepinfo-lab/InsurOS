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

export const metadata = { title: 'Approvals' };

const workflowService = new WorkflowService();

export default async function ApprovalQueuePage() {
  const tasks = await workflowService.getTasks();
  const approvals = tasks.filter((task) =>
    task.title.toLowerCase().includes('approve')
  );

  type ApprovalRow = (typeof approvals)[number];

  const columns: DataTableColumn<ApprovalRow>[] = [
    { key: 'title', header: 'Approval' },
    { key: 'module', header: 'Module' },
    { key: 'assignee', header: 'Owner' },
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
      render: (row) => <Badge tone='warning'>{row.status}</Badge>
    }
  ];

  return (
    <DomainModulePage
      title='Approval Queue'
      description='Review workflow items awaiting approval across policies, claims, finance, and marketplace operations.'
      actions={<ActionButton label='Configure Approvals' action={queueDemoRequest.bind(null, 'Configure Approvals')} />}
    >
      <div className='mb-6 grid gap-4 md:grid-cols-3'>
        <KPICard title='Pending Approvals' value={String(approvals.length)} change='Awaiting decision' />
        <KPICard title='High Priority' value={String(approvals.filter((item) => item.priority === 'High').length)} change='Requires review' />
        <KPICard title='Critical' value={String(approvals.filter((item) => item.priority === 'Critical').length)} change='Escalate now' />
      </div>

      <DomainEntityList
        title='Approvals'
        description='Operational approvals currently waiting for review.'
        searchPlaceholder='Search approvals...'
        columns={columns}
        data={approvals}
        emptyTitle='No approvals'
        emptyDescription='No workflow approvals are currently pending.'
        emptyAction={<Button>Configure Approvals</Button>}
        actions={<Button variant='secondary'>Export</Button>}
      />
    </DomainModulePage>
  );
}