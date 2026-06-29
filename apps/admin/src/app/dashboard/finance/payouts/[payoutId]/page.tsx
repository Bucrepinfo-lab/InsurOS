import { Badge, Button, Card, CardContent, DomainModulePage } from '@insuros/ui';

export default function ClaimPayoutDetailPage() {
  return (
    <DomainModulePage
      title='Claim Payout CLM-PAY-2026-0001'
      description='Claim payout detail, approval status, beneficiary, payment method, and ledger handoff.'
      actions={<Button>Approve Payout</Button>}
    >
      <div className='grid gap-4 lg:grid-cols-4'>
        <Card>
          <CardContent>
            <p className='text-sm text-slate-500'>Status</p>
            <div className='mt-2'>
              <Badge tone='warning'>Pending</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className='text-sm text-slate-500'>Claim</p>
            <p className='mt-2 font-medium text-slate-950'>CLM-2026-0001</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className='text-sm text-slate-500'>Beneficiary</p>
            <p className='mt-2 font-medium text-slate-950'>Demo Customer</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className='text-sm text-slate-500'>Amount</p>
            <p className='mt-2 font-medium text-slate-950'>KES 100,000</p>
          </CardContent>
        </Card>
      </div>

      <div className='mt-6 grid gap-4 lg:grid-cols-2'>
        <Card>
          <CardContent>
            <h2 className='text-lg font-semibold text-slate-950'>Payment Method</h2>
            <p className='mt-2 text-sm text-slate-500'>
              Bank transfer to verified beneficiary account.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className='text-lg font-semibold text-slate-950'>Ledger Handoff</h2>
            <p className='mt-2 text-sm text-slate-500'>
              Once approved, this payout will be posted to the finance ledger and reconciliation workflow.
            </p>
          </CardContent>
        </Card>
      </div>
    </DomainModulePage>
  );
}