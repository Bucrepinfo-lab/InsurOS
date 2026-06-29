import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  type DataTableColumn
} from '@insuros/ui';
import { mockFinanceTransactions } from '@insuros/mocks';

const transactions = mockFinanceTransactions;

type FinanceTransactionRow = (typeof transactions)[number];

const columns: DataTableColumn<FinanceTransactionRow>[] = [
  { key: 'reference', header: 'Reference' },
  { key: 'type', header: 'Type' },
  { key: 'party', header: 'Party' },
  { key: 'amount', header: 'Amount' },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <Badge tone={row.status === 'Paid' || row.status === 'Matched' ? 'success' : 'warning'}>
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
