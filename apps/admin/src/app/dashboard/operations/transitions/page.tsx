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

export default async function WorkflowTransitionsPage() {
  const transitions = await workflowService.getTransitions();

  type TransitionRow = (typeof transitions)[number];

  const columns: DataTableColumn<TransitionRow>[] = [
    { key: 'workflowId', header: 'Workflow' },
    { key: 'fromStatus', header: 'From' },
    { key: 'toStatus', header: 'To' },
    { key: 'action', header: 'Action' },
    { key: 'actor', header: 'Actor' },
    { key: 'occurredAt', header: 'Occurred At' },
    {
      key: 'action',
      header: 'Event',
      render: (row) => (
        <Badge
          tone={
            row.action === 'Approve'
              ? 'success'
              : row.action === 'Reject' || row.action === 'Escalate'
                ? 'danger'
                : 'neutral'
          }
        >
          {row.action}
        </Badge>
      )
    }
  ];

  return (
    <DomainModulePage
      title='Workflow Transitions'
      description='Review workflow state changes, approvals, escalations, reopen events, and closure history.'
      actions={<Button>Export History</Button>}
    >
      <div className='mb-6 grid gap-4 md:grid-cols-3'>
        <KPICard title='Transitions' value={String(transitions.length)} change='Workflow events' />
        <KPICard title='Escalations' value={String(transitions.filter((item) => item.action === 'Escalate').length)} change='SLA-sensitive' />
        <KPICard title='Submissions' value={String(transitions.filter((item) => item.action === 'Submit').length)} change='New workflow movement' />
      </div>

      <DomainEntityList
        title='Transition History'
        description='State transition history across operational workflows.'
        searchPlaceholder='Search transitions...'
        columns={columns}
        data={transitions}
        emptyTitle='No transitions'
        emptyDescription='No workflow transitions have been recorded yet.'
        emptyAction={<Button>Export History</Button>}
        actions={<Button variant='secondary'>Export</Button>}
      />
    </DomainModulePage>
  );
}
