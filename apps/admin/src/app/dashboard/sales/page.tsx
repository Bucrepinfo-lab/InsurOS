import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  KPICard,
  type DataTableColumn
} from '@insuros/ui';
import { ActionButton } from '@/components/ActionButton';
import { nameDemoAgent } from '@/app/dashboard/actions';
import { AdminHierarchyService, SalesHierarchyService } from '@insuros/services';

export const metadata = { title: 'Sales portal' };

const salesService = new SalesHierarchyService();
const adminHierarchyService = new AdminHierarchyService();

export default async function SalesPortalPage() {
  const agents = await salesService.getAgents();
  const assignments = await salesService.getAssignments();
  const regions = await adminHierarchyService.getRegions();

  type AgentRow = (typeof agents)[number];

  const columns: DataTableColumn<AgentRow>[] = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    {
      key: 'rank',
      header: 'Rank',
      render: (row) => <Badge tone='neutral'>{row.rank}</Badge>
    },
    {
      key: 'regionId',
      header: 'Territory',
      render: (row) =>
        regions.find((region) => region.id === row.regionId)?.name ?? row.regionId
    },
    {
      key: 'supervisorId',
      header: 'Reports To',
      render: (row) =>
        agents.find((agent) => agent.id === row.supervisorId)?.name ?? '—'
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge
          tone={
            row.status === 'Active'
              ? 'success'
              : row.status === 'Onboarding'
                ? 'warning'
                : 'danger'
          }
        >
          {row.status}
        </Badge>
      )
    }
  ];

  return (
    <DomainModulePage
      title='Sales Portal'
      description='Sales hierarchy mirroring the administrative structure. Superiors name and assign subordinates one rank below.'
      actions={<ActionButton label='Name new agent' action={nameDemoAgent} />}
    >
      <div className='mb-6 grid gap-4 md:grid-cols-4'>
        <KPICard
          title='Sales Force'
          value={String(agents.length)}
          change='All ranks'
        />
        <KPICard
          title='Active'
          value={String(agents.filter((agent) => agent.status === 'Active').length)}
          change='Serving agents'
        />
        <KPICard
          title='Onboarding'
          value={String(agents.filter((agent) => agent.status === 'Onboarding').length)}
          change='In induction'
        />
        <KPICard
          title='Open Assignments'
          value={String(assignments.filter((item) => item.status === 'Assigned').length)}
          change='Awaiting acceptance'
        />
      </div>

      <DomainEntityList
        title='Sales Hierarchy'
        description='Global Sales Head → Continental Director → National Manager → County Manager → Constituency Agent.'
        searchPlaceholder='Search sales force...'
        columns={columns}
        data={agents}
        emptyTitle='No agents'
        emptyDescription='No sales agents have been named.'
        emptyAction={<Button>Name New Agent</Button>}
      />
    </DomainModulePage>
  );
}
