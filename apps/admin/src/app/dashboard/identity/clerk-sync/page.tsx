import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  KPICard,
  type DataTableColumn
} from '@insuros/ui';
import { ActionButton } from '@/components/ActionButton';
import { refreshClerkPlan } from '@/app/dashboard/actions';
import { PrincipalService } from '@insuros/services';

export const metadata = { title: 'Clerk sync' };

const principalService = new PrincipalService();

export default async function ClerkSyncPage() {
  const plan = await principalService.getClerkSyncPlan();

  type PlanRow = (typeof plan)[number];

  const columns: DataTableColumn<PlanRow>[] = [
    { key: 'userName', header: 'User' },
    { key: 'email', header: 'Email' },
    {
      key: 'clerkOrgRole',
      header: 'Clerk Org Role',
      render: (row) => <code>{row.clerkOrgRole}</code>
    },
    {
      key: 'regionName',
      header: 'Jurisdiction',
      render: (row) => `${row.regionName} (${row.regionCode})`
    },
    {
      key: 'operation',
      header: 'Sync Operation',
      render: (row) => (
        <Badge tone={row.operation === 'CreateMembership' ? 'success' : 'warning'}>
          {row.operation}
        </Badge>
      )
    }
  ];

  return (
    <DomainModulePage
      title='Clerk Sync'
      description='Production role mapping: each jurisdiction assignment becomes a Clerk organization membership with a level-specific role. Executing the plan requires CLERK_SECRET_KEY.'
      actions={<ActionButton label='Refresh plan' action={refreshClerkPlan} />}
    >
      <div className='mb-6 grid gap-4 md:grid-cols-3'>
        <KPICard
          title='Sync Actions'
          value={String(plan.length)}
          change='Pending plan entries'
        />
        <KPICard
          title='Memberships to Create'
          value={String(plan.filter((item) => item.operation === 'CreateMembership').length)}
          change='Active grants'
        />
        <KPICard
          title='Memberships to Suspend'
          value={String(plan.filter((item) => item.operation === 'SuspendMembership').length)}
          change='Suspended grants'
        />
      </div>

      <DomainEntityList
        title='Sync Plan'
        description='Deterministic translation of jurisdiction assignments into Clerk organization API calls.'
        searchPlaceholder='Search plan...'
        columns={columns}
        data={plan}
        emptyTitle='Nothing to sync'
        emptyDescription='No jurisdiction assignments require Clerk changes.'
        emptyAction={<Button>Refresh Plan</Button>}
      />
    </DomainModulePage>
  );
}
