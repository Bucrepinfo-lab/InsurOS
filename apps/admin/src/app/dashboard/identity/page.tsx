import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  type DataTableColumn
} from '@insuros/ui';

type UserRow = {
  name: string;
  email: string;
  role: string;
  status: string;
};

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

export default function IdentityPage() {
  return (
    <DomainModulePage
      title='Identity & Access Management'
      description='Manage users, roles, permissions, memberships, and secure access across InsurOS tenants.'
      actions={<Button>Invite User</Button>}
    >
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
