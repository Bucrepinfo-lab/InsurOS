import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  type DataTableColumn
} from '@insuros/ui';

type FinanceTransactionRow = {
  reference: string;
  type: string;
  party: string;
  amount: string;
  status: string;
};

const transactions: FinanceTransactionRow[] = [
  {
    reference: 'INV-2026-0001',
    type: 'Premium Invoice',
    party: 'Demo Customer',
    amount: 'KES 42,000',
    status: 'Paid'
  },
  {
    reference: 'CLM-PAY-2026-0001',
    type: 'Claim Payout',
    party: 'Demo Customer',
    amount: 'KES 100,000',
    status: 'Pending'
  }
];

const columns: DataTableColumn<FinanceTransactionRow>[] = [
  { key: 'reference', header: 'Reference' },
  { key: 'type', header: 'Type' },
  { key: 'party', header: 'Party' },
  { key: 'amount', header: 'Amount' },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <Badge tone={row.status === 'Paid' ? 'success' : 'warning'}>
        {row.status}
      </Badge>
    )
  }
];

export default function FinancePage() {
  return (
    <DomainModulePage
      title='Finance & Billing'
      description='Manage invoices, payments, claim payouts, refunds, commissions, balances, and reconciliation.'
      actions={<Button>Create Invoice</Button>}
    >
      <DomainEntityList
        title='Financial Transactions'
        description='Billing and payment records across the insurance lifecycle.'
        searchPlaceholder='Search transactions...'
        columns={columns}
        data={transactions}
        emptyTitle='No transactions'
        emptyDescription='Create the first invoice or payment record.'
        emptyAction={<Button>Create Invoice</Button>}
        actions={<Button variant='secondary'>Export</Button>}
      />
    </DomainModulePage>
  );
}