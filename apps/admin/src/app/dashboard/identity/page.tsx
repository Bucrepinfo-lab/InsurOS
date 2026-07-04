import {
  Badge,
  Button,
  Card,
  CardContent,
  DomainEntityList,
  DomainModulePage,
  KPICard,
  type DataTableColumn
} from '@insuros/ui';
import { IdentityService } from '@insuros/services';

type UserRow = {
  name: string;
  email: string;
  role: string;
  status: string;
};

const identityService = new IdentityService();

const users: UserRow[] = [
  {
    name: 'Platform Admin',
    email: 'admin@insuros.local',
    role: 'Super Admin',
    status: 'Active'
  }
];

const columns: DataTableColumn<UserRow>[] = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'role', header: 'Role' },
  {
    key: 'status',
    header: 'Status',
    render: (user) => <Badge tone='success'>{user.status}</Badge>
  }
];

export default async function IdentityPage() {
  const workflows = await identityService.getIdentityWorkflows();

  return (
    <DomainModulePage
      title='Identity & Access Management'
      description='Manage users, roles, permissions, memberships, verification workflows, and secure access across InsurOS tenants.'
      actions={<Button>Invite User</Button>}
    >
      <div className='mb-6 grid gap-4 md:grid-cols-3'>
        <KPICard title='Identity Workflows' value={String(workflows.length)} change='Tracked identities' />
        <KPICard title='In Review' value={String(workflows.filter((item) => item.workflowStatus === 'In Review').length)} change='Needs verification' />
        <KPICard title='Approved' value={String(workflows.filter((item) => item.workflowStatus === 'Approved').length)} change='Verified identities' />
      </div>

      <div className='mb-6 grid gap-4 lg:grid-cols-3'>
        {workflows.map((workflow) => (
          <Card key={workflow.identityId}>
            <CardContent>
              <p className='text-sm text-slate-500'>Identity</p>
              <p className='mt-2 font-medium'>{workflow.identityId}</p>

              <p className='mt-4 text-sm text-slate-500'>Stage</p>
              <p className='mt-2 font-medium'>{workflow.stage}</p>

              <div className='mt-4'>
                <Badge tone={workflow.workflowStatus === 'Approved' ? 'success' : 'warning'}>
                  {workflow.workflowStatus}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <DomainEntityList
        title='Users'
        description='People with access to this tenant and their assigned roles.'
        searchPlaceholder='Search users...'
        columns={columns}
        data={users}
        emptyTitle='No users yet'
        emptyDescription='Invite the first administrator or operator to begin managing this tenant.'
        emptyAction={<Button>Invite User</Button>}
        actions={<Button variant='secondary'>Export</Button>}
      />
    </DomainModulePage>
  );
}
