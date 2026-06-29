import { Badge, Button, Card, CardContent, DomainModulePage } from '@insuros/ui';

export default function ClaimFnolPage() {
  return (
    <DomainModulePage
      title='First Notice of Loss'
      description='Capture and review the initial claim report, incident details, reporting channel, and loss description.'
      actions={<Button>Edit FNOL</Button>}
    >
      <div className='grid gap-4 lg:grid-cols-2'>
        <Card>
          <CardContent>
            <h2 className='text-lg font-semibold text-slate-950'>Incident Details</h2>

            <dl className='mt-4 grid gap-3 text-sm'>
              <div className='flex justify-between gap-4'>
                <dt className='text-slate-500'>Loss Date</dt>
                <dd className='font-medium text-slate-950'>2026-06-28</dd>
              </div>

              <div className='flex justify-between gap-4'>
                <dt className='text-slate-500'>Reporting Channel</dt>
                <dd className='font-medium text-slate-950'>Admin Portal</dd>
              </div>

              <div className='flex justify-between gap-4'>
                <dt className='text-slate-500'>Location</dt>
                <dd className='font-medium text-slate-950'>Nairobi, Kenya</dd>
              </div>

              <div className='flex justify-between gap-4'>
                <dt className='text-slate-500'>FNOL Status</dt>
                <dd>
                  <Badge tone='success'>Captured</Badge>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className='text-lg font-semibold text-slate-950'>Loss Description</h2>
            <p className='mt-3 text-sm text-slate-500'>
              Customer reported accidental vehicle damage requiring assessment and repair review.
            </p>
          </CardContent>
        </Card>
      </div>
    </DomainModulePage>
  );
}