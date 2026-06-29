import { Badge, Button, Card, CardContent, DomainModulePage } from '@insuros/ui';

export default function PolicyHolderPage() {
  return (
    <DomainModulePage
      title='Policy Holder'
      description='View the customer, insured party, and ownership relationship attached to this policy.'
      actions={<Button>Change Holder</Button>}
    >
      <div className='grid gap-4 lg:grid-cols-2'>
        <Card>
          <CardContent>
            <h2 className='text-lg font-semibold text-slate-950'>Primary Policy Holder</h2>

            <dl className='mt-4 grid gap-3 text-sm'>
              <div className='flex justify-between gap-4'>
                <dt className='text-slate-500'>Name</dt>
                <dd className='font-medium text-slate-950'>Demo Customer</dd>
              </div>

              <div className='flex justify-between gap-4'>
                <dt className='text-slate-500'>Customer Type</dt>
                <dd className='font-medium text-slate-950'>Individual</dd>
              </div>

              <div className='flex justify-between gap-4'>
                <dt className='text-slate-500'>Email</dt>
                <dd className='font-medium text-slate-950'>customer@insuros.local</dd>
              </div>

              <div className='flex justify-between gap-4'>
                <dt className='text-slate-500'>KYC Status</dt>
                <dd>
                  <Badge tone='warning'>Pending</Badge>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className='text-lg font-semibold text-slate-950'>Insured Interest</h2>

            <p className='mt-2 text-sm text-slate-500'>
              This section will describe what is insured under the policy, including assets,
              beneficiaries, dependents, or risk objects.
            </p>

            <div className='mt-4 rounded-lg border p-4'>
              <p className='text-sm font-medium text-slate-950'>Motor Vehicle</p>
              <p className='mt-1 text-sm text-slate-500'>Registration: KDA 001A</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DomainModulePage>
  );
}