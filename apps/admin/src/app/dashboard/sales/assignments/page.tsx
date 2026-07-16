import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  KPICard,
  type DataTableColumn
} from '@insuros/ui';
import { ActionButton } from '@/components/ActionButton';
import { createDemoAssignment } from '@/app/dashboard/actions';
import { AdminHierarchyService, SalesHierarchyService } from '@insuros/services';

const salesService = new SalesHierarchyService();
const adminHierarchyService = new AdminHierarchyService();

export default async function SalesAssignmentsPage() {
  const assignments = await salesService.getAssignments();
  const agents = await salesService.getAgents();
  const regions = await adminHierarchyService.getRegions();

  type AssignmentRow = (typeof assignments)[number];

  const agentName = (id: string) =>
    agents.find((agent) => agent.id === id)?.name ?? id;

  const columns: DataTableColumn<AssignmentRow>[] = [
    {
      key: 'agentId',
      header: 'Agent',
      render: (row) => agentName(row.agentId)
    },
    {
      key: 'assignedBy',
      header: 'Assigned By',
      render: (row) => agentName(row.assignedBy)
    },
    {
      key: 'regionId',
      header: 'Territory',
      render: (row) =>
        regions.find((region) => region.id === row.regionId)?.name ?? row.regionId
    },
    { key: 'period', header: 'Period' },
    {
      key: 'targetPremium',
      header: 'Target Premium',
      render: (row) => `${row.currency} ${row.targetPremium.toLocaleString()}`
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge
          tone={
            row.status === 'Completed'
              ? 'success'
              : row.status === 'Revoked'
                ? 'danger'
                : row.status === 'Accepted'
                  ? 'success'
                  : 'warning'
          }
        >
          {row.status}
        </Badge>
      )
    },
    { key: 'assignedAt', header: 'Assigned At' }
  ];

  return (
    <DomainModulePage
      title='Sales Assignments'
      description='Target assignments flowing down the sales chain of command.'
      actions={<ActionButton label='Assign target' action={createDemoAssignment} />}
    >
      <div className='mb-6 grid gap-4 md:grid-cols-3'>
        <KPICard
          title='Assignments'
          value={String(assignments.length)}
          change='All periods'
        />
        <KPICard
          title='Accepted'
          value={String(assignments.filter((item) => item.status === 'Accepted').length)}
          change='In execution'
        />
        <KPICard
          title='Pending'
          value={String(assignments.filter((item) => item.status === 'Assigned').length)}
          change='Awaiting acceptance'
        />
      </div>

      <DomainEntityList
        title='Assignment Register'
        description='Every target names its assigner — the chain of command is auditable end to end.'
        searchPlaceholder='Search assignments...'
        columns={columns}
        data={assignments}
        emptyTitle='No assignments'
        emptyDescription='No sales assignments have been created.'
        emptyAction={<Button>Create Assignment</Button>}
      />
    </DomainModulePage>
  );
}
