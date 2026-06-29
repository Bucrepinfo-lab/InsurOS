import { Badge, Button, Card, CardContent, DomainModulePage } from '@insuros/ui';

export default function ClaimAssessmentPage() {
  return (
    <DomainModulePage
      title='Claim Assessment'
      description='Review damage assessment, liability position, reserve estimates, and adjuster recommendations.'
      actions={<Button>Update Assessment</Button>}
    >
      <div className='grid gap-4 lg:grid-cols-3'>
        <Card>
          <CardContent>
            <p className='text-sm text-slate-500'>Assessment Status</p>
            <div className='mt-2'>
              <Badge tone='warning'>In Review</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className='text-sm text-slate-500'>Reserve Estimate</p>
            <p className='mt-2 font-medium text-slate-950'>KES 100,000</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className='text-sm text-slate-500'>Liability</p>
            <p className='mt-2 font-medium text-slate-950'>Pending Review</p>
          </CardContent>
        </Card>
      </div>

      <div className='mt-6 grid gap-4 lg:grid-cols-2'>
        <Card>
          <CardContent>
            <h2 className='text-lg font-semibold text-slate-950'>Adjuster Notes</h2>
            <p className='mt-3 text-sm text-slate-500'>
              Initial review indicates repairable vehicle damage. Awaiting garage estimate and supporting documents.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className='text-lg font-semibold text-slate-950'>Recommendation</h2>
            <p className='mt-3 text-sm text-slate-500'>
              Continue assessment before settlement approval.
            </p>
          </CardContent>
        </Card>
      </div>
    </DomainModulePage>
  );
}