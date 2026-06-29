import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  type DataTableColumn
} from '@insuros/ui';

type CustomerPaymentRow = {
  reference: string;
  type: string;
  amount: string;
  status: string;
};

const payments: CustomerPaymentRow[] = [
  {
    reference: 'PAY-2026-0001',
    type: 'Premium Payment',
    amount: 'KES 42,000',
    status: 'Paid'
  }
];

const columns: DataTableColumn<CustomerPaymentRow>[] = [
  { key: 'reference', header: 'Reference' },
  { key: 'type', header: 'Type' },
  { key: 'amount', header: 'Amount' },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <Badge tone='success'>{row.status}</Badge>
  }
];

export default function CustomerPaymentsPage() {
  return (
    <DomainModulePage
      title='Customer Payments'
      description='View premium payments, invoices, receipts, balances, refunds, and failed payment attempts.'
      actions={<Button>Record Payment</Button>}
    >
      <DomainEntityList
        title='Payments'
        description='Financial transactions associated with this customer.'
        searchPlaceholder='Search customer payments...'
        columns={columns}
        data={payments}
        emptyTitle='No payments'
        emptyDescription='Record the first payment for this customer.'
        emptyAction={<Button>Record Payment</Button>}
        actions={<Button variant='secondary'>Export</Button>}
      />
    </DomainModulePage>
  );
}