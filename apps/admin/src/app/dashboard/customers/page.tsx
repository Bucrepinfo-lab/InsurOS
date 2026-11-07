import {
  Badge,
  DomainEntityList,
  DomainModulePage,
  KPICard,
  filterRows,
  readParam,
  type DataTableColumn
} from '@insuros/ui';
import type { CustomerStatus, OwnedCustomer } from '@insuros/domain';
import { CustomerService } from '@insuros/services';
import { ActionButton } from '@/components/ActionButton';
import { StatusFilter, applyStatusFilter } from '@/components/list-filters';
import { addDemoCustomer } from '@/app/dashboard/actions';
import { currentReach } from '@/lib/record-scope';

export const metadata = { title: 'Customers' };

const CUSTOMER_STATUSES: readonly CustomerStatus[] = ['Active', 'Pending', 'Suspended', 'Archived'];

const columns: DataTableColumn<OwnedCustomer>[] = [
  { key: 'name', header: 'Name' },
  { key: 'type', header: 'Type' },
  { key: 'email', header: 'Email' },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <Badge tone={row.status === 'Active' ? 'success' : 'warning'}>{row.status}</Badge>
  }
];

export default async function CustomersPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = readParam(params, 'q');
  const status = readParam(params, 'status');

  // Server-side: an Agent gets only the customers they captured.
  const reach = await currentReach('Customers');
  const visible = await new CustomerService().getCustomersFor(reach);
  // One filter, used by the table, the summary cards and the CSV export.
  const filtered = filterRows(applyStatusFilter(visible, CUSTOMER_STATUSES, status), columns, query);

  return (
    <DomainModulePage
      title='Customers'
      description='Everyone covered by your organisation.'
      actions={<ActionButton label='Add customer' action={addDemoCustomer} />}
    >
      <div className='mb-6 grid gap-4 sm:grid-cols-3'>
        <KPICard title='Customers' value={String(filtered.length)} change={reach.kind === 'own' ? 'Your customers' : 'Matching filters'} />
        <KPICard title='Active' value={String(filtered.filter((row) => row.status === 'Active').length)} />
        <KPICard title='Pending KYC' value={String(filtered.filter((row) => row.status === 'Pending').length)} />
      </div>
      <DomainEntityList
        title='Customers'
        description={reach.kind === 'own' ? 'Customers you captured.' : 'All customers in your organisation.'}
        searchPlaceholder='Search customers...'
        searchParam='q'
        query={query}
        filters={<StatusFilter statuses={CUSTOMER_STATUSES} value={status} />}
        columns={columns}
        data={filtered}
        emptyTitle='No customers'
        emptyDescription='Add the first customer.'
      />
    </DomainModulePage>
  );
}
