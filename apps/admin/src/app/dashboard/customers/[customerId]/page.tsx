import { Badge, Button, Card, CardContent, DomainModulePage } from '@insuros/ui';

export default function CustomerDetailPage() {
  return (
    <DomainModulePage
      title='Demo Customer'
      description='Customer 360 profile, policies, claims, payments, KYC, contacts, and lifecycle history.'
      actions={<Button>Edit Customer</Button>}
    >
      <div className='grid gap-4 lg:grid-cols-3'>
        <Card>
          <CardContent>
            <p className='text-sm text-slate-500'>Status</p>
            <div className='mt-2'>
              <Badge tone='success'>Active</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className='text-sm text-slate-500'>Customer Type</p>
            <p className='mt-2 font-medium text-slate-950'>Individual</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className='text-sm text-slate-500'>Primary Email</p>
            <p className='mt-2 font-medium text-slate-950'>customer@insuros.local</p>
          </CardContent>
        </Card>
      </div>

      <div className='mt-6 grid gap-4 lg:grid-cols-2'>
        <Card>
          <CardContent>
            <h2 className='text-lg font-semibold text-slate-950'>Policies</h2>
            <p className='mt-2 text-sm text-slate-500'>
              View active, expired, renewed, and cancelled policies for this customer.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className='text-lg font-semibold text-slate-950'>Customer Timeline</h2>
            <p className='mt-2 text-sm text-slate-500'>
              Track customer events, changes, notes, documents, and service activity.
            </p>
          </CardContent>
        </Card>
      </div>
    </DomainModulePage>
  );
}