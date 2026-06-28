import {
  Badge,
  Button,
  DataTable,
  EmptyState,
  FilterBar,
  Pagination,
  SearchInput,
  TableToolbar,
  WorkspaceHeader,
  type DataTableColumn
} from '@insuros/ui';

type CustomerRow = {
  name: string;
  type: string;
  email: string;
  status: string;
};

const customers: CustomerRow[] = [
  {
    name: 'Demo Customer',
    type: 'Individual',
    email: 'customer@insuros.local',
    status: 'Active'
  }
];

const columns: DataTableColumn<CustomerRow>[] = [
  { key: 'name', header: 'Customer' },
  { key: 'type', header: 'Type' },
  { key: 'email', header: 'Email' },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <Badge tone='success'>{row.status}</Badge>
  }
];

export default function CustomersPage() {
  return (
    <>
      <WorkspaceHeader
        title='Customer Administration'
        description='Manage customers, profiles, contact data, KYC status, preferences, and customer lifecycle.'
        actions={<Button>Add Customer</Button>}
      />

      <TableToolbar
        title='Customers'
        description='Customer profiles currently registered in the platform.'
      />

      <FilterBar
        search={<SearchInput placeholder='Search customers...' />}
        actions={<Button variant='secondary'>Export</Button>}
      />

      <DataTable
        columns={columns}
        data={customers}
        empty={
          <EmptyState
            title='No customers'
            description='Create the first customer profile to begin quoting and policy operations.'
            action={<Button>Add Customer</Button>}
          />
        }
        footer={<Pagination page={1} totalPages={1} totalItems={customers.length} />}
      />
    </>
  );
}
