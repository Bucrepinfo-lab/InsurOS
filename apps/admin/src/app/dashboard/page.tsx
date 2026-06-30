import { Badge, Card, CardContent, KPICard, WorkspaceHeader } from '@insuros/ui';

export default function AdminDashboardPage() {
  return (
    <>
      <WorkspaceHeader
        title='Enterprise Control Plane'
        description='Operate tenants, marketplace, customers, policies, claims, finance and platform services.'
      />

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <KPICard title='Active Tenants' value='1' change='Platform foundation' />
        <KPICard title='Marketplace Products' value='1' change='Service layer' />
        <KPICard title='Customers' value='1' change='Customer 360' />
        <KPICard title='Policies' value='1' change='Lifecycle module' />
      </div>

      <div className='mt-6 grid gap-4 lg:grid-cols-2'>
        <Card>
          <CardContent>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-lg font-semibold'>Platform Status</h2>
                <p className='mt-2 text-sm text-slate-500'>
                  Enterprise foundation, domain models, mocks, services, and admin control plane are operational.
                </p>
              </div>
              <Badge tone='success'>Healthy</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className='text-lg font-semibold'>Current Architecture</h2>
            <p className='mt-2 text-sm text-slate-500'>
              UI now connects through shared services backed by domain models and mock data.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
