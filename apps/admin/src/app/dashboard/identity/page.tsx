import {
  Badge,
  Button,
  DataTable,
  EmptyState,
  FilterBar,
  SearchInput,
  TableToolbar,
  WorkspaceHeader,
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
    <>
      <WorkspaceHeader
        title='Identity & Access Management'
        description='Manage users, roles, permissions, memberships, and secure access across InsurOS tenants.'
        actions={<Button>Invite User</Button>}
      />

      <TableToolbar
        title='Users'
        description='People with access to this tenant and their assigned roles.'
      />

      <FilterBar
        search={<SearchInput placeholder='Search users...' />}
        actions={<Button variant='secondary'>Export</Button>}
      />

      <DataTable
        columns={columns}
        data={users}
        empty={
          <EmptyState
            title='No users yet'
            description='Invite the first administrator or operator to begin managing this tenant.'
            action={<Button>Invite User</Button>}
          />
        }
      />
    </>
  );
}
