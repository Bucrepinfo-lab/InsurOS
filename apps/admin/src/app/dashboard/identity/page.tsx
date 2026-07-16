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
import {
  AuthorizationService,
  IdentityService,
  PermissionService,
  RoleAssignmentService,
  RoleService
} from '@insuros/services';
import { ActionButton } from '@/components/ActionButton';
import { appointDemoAdmin } from '@/app/dashboard/actions';

export const metadata = { title: 'Identity' };

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

const identityService = new IdentityService();
const permissionService = new PermissionService();
const roleService = new RoleService();
const roleAssignmentService = new RoleAssignmentService();
const authorizationService = new AuthorizationService();

const users: UserRow[] = [
  {
    id: 'user-platform-admin',
    name: 'Platform Admin',
    email: 'admin@insuros.local',
    role: 'Platform Admin',
    status: 'Active'
  }
];

const userColumns: DataTableColumn<UserRow>[] = [
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
  const permissions = await permissionService.getPermissions();
  const roles = await roleService.getRoles();
  const assignments = await roleAssignmentService.getRoleAssignments();

  const authorizationPreview = await authorizationService.authorize(
    'role-platform-admin',
    'Platform',
    'Export'
  );

  type PermissionRow = (typeof permissions)[number];
  type RoleRow = (typeof roles)[number];
  type RoleAssignmentRow = (typeof assignments)[number];

  const permissionColumns: DataTableColumn<PermissionRow>[] = [
    { key: 'scope', header: 'Scope' },
    { key: 'action', header: 'Action' },
    { key: 'description', header: 'Description' }
  ];

  const roleColumns: DataTableColumn<RoleRow>[] = [
    { key: 'name', header: 'Role' },
    { key: 'description', header: 'Description' },
    {
      key: 'permissions',
      header: 'Permissions',
      render: (role) => String(role.permissions.length)
    }
  ];

  const assignmentColumns: DataTableColumn<RoleAssignmentRow>[] = [
    { key: 'userId', header: 'User' },
    { key: 'roleId', header: 'Role' },
    { key: 'assignedBy', header: 'Assigned By' },
    { key: 'assignedAt', header: 'Assigned At' }
  ];

  return (
    <DomainModulePage
      title='Identity & Access Management'
      description='Manage users, roles, permissions, memberships, role assignments, verification workflows, and secure access across InsurOS tenants.'
      actions={<ActionButton label='Appoint administrator' action={appointDemoAdmin} />}
    >
      <div className='mb-6 grid gap-4 md:grid-cols-4'>
        <KPICard title='Identity Workflows' value={String(workflows.length)} change='Tracked identities' />
        <KPICard title='Roles' value={String(roles.length)} change='Access groups' />
        <KPICard title='Permissions' value={String(permissions.length)} change='Access rules' />
        <KPICard title='Assignments' value={String(assignments.length)} change='User-role links' />
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

      <Card>
        <CardContent>
          <p className='text-sm text-slate-500'>Authorization Preview</p>
          <p className='mt-2 text-sm'>
            Role <span className='font-medium'>Platform Admin</span> requesting{' '}
            <span className='font-medium'>Platform / Export</span>
          </p>

          <div className='mt-3'>
            <Badge tone={authorizationPreview.allowed ? 'success' : 'danger'}>
              {authorizationPreview.allowed ? 'Allowed' : 'Denied'}
            </Badge>
          </div>

          {authorizationPreview.reason ? (
            <p className='mt-3 text-sm text-slate-500'>{authorizationPreview.reason}</p>
          ) : null}
        </CardContent>
      </Card>

      <div className='mt-6 space-y-6'>
        <DomainEntityList
          title='Role Assignments'
          description='Mappings between users and roles used by the authorization engine.'
          searchPlaceholder='Search role assignments...'
          columns={assignmentColumns}
          data={assignments}
          emptyTitle='No role assignments'
          emptyDescription='No role assignments are currently configured.'
          emptyAction={<Button>Assign Role</Button>}
          actions={<Button variant='secondary'>Export</Button>}
        />

        <DomainEntityList
          title='Roles'
          description='Role groups that bundle platform permissions for operators and administrators.'
          searchPlaceholder='Search roles...'
          columns={roleColumns}
          data={roles}
          emptyTitle='No roles'
          emptyDescription='No platform roles are currently configured.'
          emptyAction={<Button>Create Role</Button>}
          actions={<Button variant='secondary'>Export</Button>}
        />

        <DomainEntityList
          title='Permissions'
          description='Platform permissions used to govern access to workflows, modules, exports, and operational actions.'
          searchPlaceholder='Search permissions...'
          columns={permissionColumns}
          data={permissions}
          emptyTitle='No permissions'
          emptyDescription='No platform permissions are currently configured.'
          emptyAction={<Button>Create Permission</Button>}
          actions={<Button variant='secondary'>Export</Button>}
        />

        <DomainEntityList
          title='Users'
          description='People with access to this tenant and their assigned roles.'
          searchPlaceholder='Search users...'
          columns={userColumns}
          data={users}
          emptyTitle='No users yet'
          emptyDescription='Invite the first administrator or operator to begin managing this tenant.'
          emptyAction={<Button>Invite User</Button>}
          actions={<Button variant='secondary'>Export</Button>}
        />
      </div>
    </DomainModulePage>
  );
}
