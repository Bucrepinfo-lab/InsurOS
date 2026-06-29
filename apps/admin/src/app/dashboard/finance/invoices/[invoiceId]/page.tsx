import { Badge, Button, Card, CardContent, DomainModulePage } from '@insuros/ui';

export default function InvoiceDetailPage() {
  return (
    <DomainModulePage
      title='Invoice INV-2026-0001'
      description='Invoice detail, payment status, policy linkage, customer balance, and reconciliation readiness.'
      actions={<Button>Record Payment</Button>}
    >
      <div className='grid gap-4 lg:grid-cols-4'>
        <Card>
          <CardContent>
            <p className='text-sm text-slate-500'>Status</p>
            <div className='mt-2'>
              <Badge tone='success'>Paid</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className='text-sm text-slate-500'>Customer</p>
            <p className='mt-2 font-medium text-slate-950'>Demo Customer</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className='text-sm text-slate-500'>Policy</p>
            <p className='mt-2 font-medium text-slate-950'>POL-2026-0001</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className='text-sm text-slate-500'>Amount</p>
            <p className='mt-2 font-medium text-slate-950'>KES 42,000</p>
          </CardContent>
        </Card>
      </div>

      <div className='mt-6 grid gap-4 lg:grid-cols-2'>
        <Card>
          <CardContent>
            <h2 className='text-lg font-semibold text-slate-950'>Payment Summary</h2>
            <p className='mt-2 text-sm text-slate-500'>
              Payment was received and matched against this invoice.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className='text-lg font-semibold text-slate-950'>Reconciliation</h2>
            <p className='mt-2 text-sm text-slate-500'>
              Ledger and bank reconciliation workflow will be connected here.
            </p>
          </CardContent>
        </Card>
      </div>
    </DomainModulePage>
  );
}