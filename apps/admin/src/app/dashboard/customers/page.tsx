import Link from 'next/link';
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
import { StatusFilter, applyStatusFilter } from '@/components/list-filters';
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
      actions={
        <Link href='/dashboard/customers/new' className='inline-flex items-center justify-center gap-2 rounded-lg bg-[linear-gradient(180deg,#22344f_0%,#1b2a41_100%)] px-4 py-2 text-sm font-medium text-paper shadow-[0_1px_2px_rgba(18,28,49,0.3),0_8px_20px_-10px_rgba(18,28,49,0.5)] transition-all duration-200 hover:-translate-y-px hover:bg-[linear-gradient(180deg,#128a6b_0%,#0f6e56_100%)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal'>
          Add customer
        </Link>
      }
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
