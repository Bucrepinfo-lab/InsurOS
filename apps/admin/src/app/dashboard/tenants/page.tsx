import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  type DataTableColumn
} from '@insuros/ui';
import { ActionButton } from '@/components/ActionButton';
import { queueDemoRequest } from '@/app/dashboard/actions';

export const metadata = { title: 'Tenants' };

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
    <DomainModulePage
      title='Tenant Management'
      description='Manage insurers, brokerages, partners, employers, government programs, and internal platform organizations.'
      actions={<ActionButton label='Add Tenant' action={queueDemoRequest.bind(null, 'Add Tenant')} />}
    >
      <DomainEntityList
        title='Organizations'
        description='Tenant organizations currently configured in the platform.'
        searchPlaceholder='Search tenants...'
        columns={columns}
        data={tenants}
        emptyTitle='No tenants yet'
        emptyDescription='Create the first tenant organization to begin operating the InsurOS platform.'
        emptyAction={<Button>Add Tenant</Button>}
        actions={<Button variant='secondary'>Export</Button>}
      />
    </DomainModulePage>
  );
}
