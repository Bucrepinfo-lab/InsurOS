import { Badge, Button, Card, CardContent, DomainModulePage } from '@insuros/ui';

export default function CustomerProfilePage() {
  return (
    <DomainModulePage
      title='Customer Profile'
      description='View and manage customer identity, demographics, KYC, and lifecycle attributes.'
      actions={<Button>Edit Profile</Button>}
    >
      <div className='grid gap-4 lg:grid-cols-2'>
        <Card>
          <CardContent>
            <h2 className='text-lg font-semibold text-slate-950'>Personal Information</h2>

            <dl className='mt-4 grid gap-3 text-sm'>
              <div className='flex justify-between gap-4'>
                <dt className='text-slate-500'>Full Name</dt>
                <dd className='font-medium text-slate-950'>Demo Customer</dd>
              </div>

              <div className='flex justify-between gap-4'>
                <dt className='text-slate-500'>Customer Type</dt>
                <dd className='font-medium text-slate-950'>Individual</dd>
              </div>

              <div className='flex justify-between gap-4'>
                <dt className='text-slate-500'>Nationality</dt>
                <dd className='font-medium text-slate-950'>Kenyan</dd>
              </div>

              <div className='flex justify-between gap-4'>
                <dt className='text-slate-500'>Date of Birth</dt>
                <dd className='font-medium text-slate-950'>Not provided</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className='text-lg font-semibold text-slate-950'>KYC Status</h2>

            <div className='mt-4 flex items-center justify-between rounded-lg border p-4'>
              <div>
                <p className='font-medium text-slate-950'>Identity Verification</p>
                <p className='mt-1 text-sm text-slate-500'>
                  KYC verification workflow has not yet been completed.
                </p>
              </div>

              <Badge tone='warning'>Pending</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </DomainModulePage>
  );
}