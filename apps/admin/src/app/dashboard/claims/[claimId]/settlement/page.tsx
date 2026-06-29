import { Badge, Button, Card, CardContent, DomainModulePage } from '@insuros/ui';

export default function ClaimSettlementPage() {
  return (
    <DomainModulePage
      title='Claim Settlement'
      description='Manage settlement approval, payable amounts, payout method, recovery, and closure readiness.'
      actions={<Button>Approve Settlement</Button>}
    >
      <div className='grid gap-4 lg:grid-cols-4'>
        <Card>
          <CardContent>
            <p className='text-sm text-slate-500'>Claimed Amount</p>
            <p className='mt-2 font-medium text-slate-950'>KES 120,000</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className='text-sm text-slate-500'>Recommended Settlement</p>
            <p className='mt-2 font-medium text-slate-950'>KES 100,000</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className='text-sm text-slate-500'>Settlement Status</p>
            <div className='mt-2'>
              <Badge tone='warning'>Pending Approval</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className='text-sm text-slate-500'>Payout Method</p>
            <p className='mt-2 font-medium text-slate-950'>Bank Transfer</p>
          </CardContent>
        </Card>
      </div>

      <div className='mt-6 grid gap-4 lg:grid-cols-2'>
        <Card>
          <CardContent>
            <h2 className='text-lg font-semibold text-slate-950'>Approval Notes</h2>
            <p className='mt-3 text-sm text-slate-500'>
              Settlement pending final review by claims manager before finance payout.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className='text-lg font-semibold text-slate-950'>Finance Handoff</h2>
            <p className='mt-3 text-sm text-slate-500'>
              Once approved, this claim will be handed off to Finance for payout processing.
            </p>
          </CardContent>
        </Card>
      </div>
    </DomainModulePage>
  );
}