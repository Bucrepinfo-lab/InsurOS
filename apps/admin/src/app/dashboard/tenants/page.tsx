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

type TenantRow = {
  name: string;
  type: string;
  status: string;
  country: string;
};

const tenants: TenantRow[] = [
  {
    name: 'InsurOS Internal',
    type: 'Platform Operator',
    status: 'Active',
    country: 'KE'
  }
];

const columns: DataTableColumn<TenantRow>[] = [
  { key: 'name', header: 'Name' },
  { key: 'type', header: 'Type' },
  { key: 'country', header: 'Country' },
  {
    key: 'status',
    header: 'Status',
    render: (tenant) => <Badge tone='success'>{tenant.status}</Badge>
  }
];

export default function TenantsPage() {
  return (
    <>
      <WorkspaceHeader
        title='Tenant Management'
        description='Manage insurers, brokerages, partners, employers, government programs, and internal platform organizations.'
        actions={<Button>Add Tenant</Button>}
      />

      <TableToolbar
        title='Organizations'
        description='Tenant organizations currently configured in the platform.'
      />

      <FilterBar
        search={<SearchInput placeholder='Search tenants...' />}
        actions={<Button variant='secondary'>Export</Button>}
      />

      <DataTable
        columns={columns}
        data={tenants}
        empty={
          <EmptyState
            title='No tenants yet'
            description='Create the first tenant organization to begin operating the InsurOS platform.'
            action={<Button>Add Tenant</Button>}
          />
        }
        footer={<Pagination page={1} totalPages={1} totalItems={tenants.length} />}
      />
    </>
  );
}
