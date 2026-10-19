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

export const metadata = { title: 'Rules' };

const workflowService = new WorkflowService();

export default async function WorkflowRulesPage() {
  const rules = await workflowService.getTransitionRules();

  type RuleRow = (typeof rules)[number];

  const columns: DataTableColumn<RuleRow>[] = [
    { key: 'workflowType', header: 'Workflow Type' },
    { key: 'fromStatus', header: 'From' },
    { key: 'action', header: 'Action' },
    { key: 'toStatus', header: 'To' },
    {
      key: 'requiresReason',
      header: 'Reason',
      render: (row) => (
        <Badge tone={row.requiresReason ? 'warning' : 'neutral'}>
          {row.requiresReason ? 'Required' : 'Optional'}
        </Badge>
      )
    },
    {
      key: 'requiresApproval',
      header: 'Approval',
      render: (row) => (
        <Badge tone={row.requiresApproval ? 'success' : 'neutral'}>
          {row.requiresApproval ? 'Required' : 'Not required'}
        </Badge>
      )
    }
  ];

  return (
    <DomainModulePage
      title='Workflow Rules'
      description='Define allowed workflow transitions, approval requirements, and reason requirements.'
      actions={<ActionButton label='Create Rule' action={queueDemoRequest.bind(null, 'Create Rule')} />}
    >
      <div className='mb-6 grid gap-4 md:grid-cols-3'>
        <KPICard title='Rules' value={String(rules.length)} change='Configured transitions' />
        <KPICard title='Approval Required' value={String(rules.filter((rule) => rule.requiresApproval).length)} change='Governed transitions' />
        <KPICard title='Reason Required' value={String(rules.filter((rule) => rule.requiresReason).length)} change='Audit-sensitive transitions' />
      </div>

      <DomainEntityList
        title='Transition Rules'
        description='Rules controlling which workflow transitions are allowed.'
        searchPlaceholder='Search rules...'
        columns={columns}
        data={rules}
        emptyTitle='No workflow rules'
        emptyDescription='No workflow transition rules have been configured yet.'
        emptyAction={<Button>Create Rule</Button>}
      />
    </DomainModulePage>
  );
}
