import {
  Badge,
  DomainEntityList,
  DomainModulePage,
  type DataTableColumn
} from '@insuros/ui';
import { requirePageAccess } from "@/lib/auth/page-access";

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

export default async function TenantsPage() {
  await requirePageAccess("/dashboard/tenants");
  return (
    <DomainModulePage
      title='Tenant Management'
      description='Manage insurers, brokerages, partners, employers, government programs, and internal platform organizations.'
    >
      <DomainEntityList
        title='Organizations'
        description='Tenant organizations currently configured in the platform.'
        searchPlaceholder='Search tenants...'
        columns={columns}
        data={tenants}
        emptyTitle='No tenants yet'
        emptyDescription='Create the first tenant organization to begin operating the InsurOS platform.'
      />
    </DomainModulePage>
  );
}
