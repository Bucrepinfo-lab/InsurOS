import { WorkspaceHeader, KPICard, Card, CardContent, Badge } from '@insuros/ui';
import page from '../page';

export default function AdminDashboardPage() {
  return (
    <>
      <WorkspaceHeader
        title='Enterprise Control Plane'
        description='Operate tenants, products, workflows, AI governance, events, and platform health from one place.'
      />

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <KPICard title='Active Tenants' value='0' change='Identity foundation ready' />
        <KPICard title='Products' value='0' change='Marketplace pending' />
        <KPICard title='Open Claims' value='0' change='Claims pending' />
        <KPICard title='Events Today' value='0' change='Event Mesh ready' />
      </div>

      <div className='mt-6 grid gap-4 lg:grid-cols-2'>
        <Card>
          <CardContent>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-lg font-semibold text-slate-950'>Platform Status</h2>
                <p className='mt-1 text-sm text-slate-500'>
                  Core platform foundations are being assembled.
                </p>
              </div>
              <Badge tone='success'>Operational</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className='text-lg font-semibold text-slate-950'>Next Build Target</h2>
            <p className='mt-1 text-sm text-slate-500'>
              Tenant management and identity administration.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

