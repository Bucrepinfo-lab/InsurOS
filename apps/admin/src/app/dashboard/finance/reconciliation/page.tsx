import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  type DataTableColumn
} from '@insuros/ui';

type ReconciliationRow = {
  reference: string;
  source: string;
  amount: string;
  status: string;
};

const items: ReconciliationRow[] = [
  {
    reference: 'INV-2026-0001',
    source: 'Premium Payment',
    amount: 'KES 42,000',
    status: 'Matched'
  },
  {
    reference: 'CLM-PAY-2026-0001',
    source: 'Claim Payout',
    amount: 'KES 100,000',
    status: 'Pending'
  }
];

const columns: DataTableColumn<ReconciliationRow>[] = [
  { key: 'reference', header: 'Reference' },
  { key: 'source', header: 'Source' },
  { key: 'amount', header: 'Amount' },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <Badge tone={row.status === 'Matched' ? 'success' : 'warning'}>
        {row.status}
      </Badge>
    )
  }
];

export default function FinanceReconciliationPage() {
  return (
    <DomainModulePage
      title='Finance Reconciliation'
      description='Match invoices, payments, payouts, refunds, bank entries, and ledger records.'
      actions={<Button>Run Reconciliation</Button>}
    >
      <DomainEntityList
        title='Reconciliation Items'
        description='Finance items awaiting matching, review, or confirmation.'
        searchPlaceholder='Search reconciliation items...'
        columns={columns}
        data={items}
        emptyTitle='No reconciliation items'
        emptyDescription='No unmatched or pending finance items are currently available.'
        actions={<Button variant='secondary'>Export</Button>}
      />
    </DomainModulePage>
  );
}