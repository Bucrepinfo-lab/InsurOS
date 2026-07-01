
import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  KPICard,
  type DataTableColumn
} from '@insuros/ui';
import { WorkflowService } from '@insuros/services';

const workflowService = new WorkflowService();

export default async function OperationsTaskQueuePage() {
  const tasks = await workflowService.getTasks();
  const blocked = await workflowService.getBlockedTasks();

  type WorkflowTaskRow = (typeof tasks)[number];

  const columns: DataTableColumn<WorkflowTaskRow>[] = [
    { key: 'title', header: 'Task' },
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
        <Badge tone={row.status === 'Blocked' ? 'danger' : row.status === 'Completed' ? 'success' : 'warning'}>
          {row.status}
        </Badge>
      )
    }
  ];

  return (
    <DomainModulePage
      title='Task Queue'
      description='Manage workflow tasks, assignments, blocked work, and operational follow-up.'
      actions={<Button>Create Task</Button>}
    >
      <div className='mb-6 grid gap-4 md:grid-cols-3'>
        <KPICard title='Open Tasks' value={String(tasks.length)} change='Across workflows' />
        <KPICard title='Blocked Tasks' value={String(blocked.length)} change='Needs intervention' />
        <KPICard title='SLA Watch' value='2' change='Due soon' />
      </div>

      <DomainEntityList
        title='Workflow Tasks'
        description='Operational tasks assigned across Claims, Policies, Finance, Marketplace, and Customers.'
        searchPlaceholder='Search tasks...'
        columns={columns}
        data={tasks}
        emptyTitle='No workflow tasks'
        emptyDescription='No workflow tasks are currently active.'
        emptyAction={<Button>Create Task</Button>}
        actions={<Button variant='secondary'>Export</Button>}
      />
    </DomainModulePage>
  );
}