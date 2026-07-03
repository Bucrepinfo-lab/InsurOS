import {
  Badge,
  Button,
  Card,
  CardContent,
  DomainEntityList,
  DomainModulePage,
  KPICard,
  type DataTableColumn
} from '@insuros/ui';
import { FinanceService } from '@insuros/services';

const financeService = new FinanceService();

export default async function FinancePage() {
  const transactions = await financeService.getFinanceTransactions();
  const workflows = await financeService.getFinanceWorkflows();

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

  return (
    <DomainModulePage
      title='Finance & Billing'
      description='Manage invoices, payments, claim payouts, refunds, commissions, balances, reconciliation, and finance workflows.'
      actions={<Button>Create Invoice</Button>}
    >
      <div className='mb-6 grid gap-4 md:grid-cols-3'>
        <KPICard title='Finance Workflows' value={String(workflows.length)} change='Tracked finance items' />
        <KPICard title='In Review' value={String(workflows.filter((item) => item.workflowStatus === 'In Review').length)} change='Needs attention' />
        <KPICard title='Approved' value={String(workflows.filter((item) => item.workflowStatus === 'Approved').length)} change='Ready for action' />
      </div>

      <div className='mb-6 grid gap-4 lg:grid-cols-3'>
        {workflows.map((workflow) => (
          <Card key={workflow.financeId}>
            <CardContent>
              <p className='text-sm text-slate-500'>Finance Item</p>
              <p className='mt-2 font-medium'>{workflow.financeId}</p>

              <p className='mt-4 text-sm text-slate-500'>Stage</p>
              <p className='mt-2 font-medium'>{workflow.stage}</p>

              <div className='mt-4'>
                <Badge tone={workflow.workflowStatus === 'Approved' ? 'success' : 'warning'}>
                  {workflow.workflowStatus}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
