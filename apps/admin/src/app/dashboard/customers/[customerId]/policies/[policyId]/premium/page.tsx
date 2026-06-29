import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  type DataTableColumn
} from '@insuros/ui';

type PremiumRow = {
  invoice: string;
  dueDate: string;
  amount: string;
  status: string;
};

const premiums: PremiumRow[] = [
  {
    invoice: 'INV-2026-0001',
    dueDate: '2026-06-28',
    amount: 'KES 42,000',
    status: 'Paid'
  }
];

const columns: DataTableColumn<PremiumRow>[] = [
  { key: 'invoice', header: 'Invoice' },
  { key: 'dueDate', header: 'Due Date' },
  { key: 'amount', header: 'Amount' },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <Badge tone='success'>{row.status}</Badge>
  }
];

export default function PolicyPremiumPage() {
  return (
    <DomainModulePage
      title='Premium Schedule'
      description='View invoices, installment schedules, payment status, balances, and premium collection history.'
      actions={<Button>Record Payment</Button>}
    >
      <DomainEntityList
        title='Premiums'
        description='Premium schedule and billing records for this policy.'
        searchPlaceholder='Search premiums...'
        columns={columns}
        data={premiums}
        emptyTitle='No premium schedule'
        emptyDescription='Create the first premium schedule for this policy.'
        emptyAction={<Button>Create Schedule</Button>}
        actions={<Button variant='secondary'>Export</Button>}
      />
    </DomainModulePage>
  );
}