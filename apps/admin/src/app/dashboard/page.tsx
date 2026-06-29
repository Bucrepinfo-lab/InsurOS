import { Badge, Card, CardContent, KPICard, WorkspaceHeader } from '@insuros/ui';
import { mockPolicies } from '@insuros/mocks';

const policies = mockPolicies;
export default function AdminDashboardPage() {
  return (
    <>
      <WorkspaceHeader
        title="Enterprise Control Plane"
        description="Operate tenants, marketplace, customers, policies, claims, finance and platform services."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPICard title="Active Tenants" value="1" change="Platform foundation" />
        <KPICard title="Marketplace Products" value="1" change="Sprint 1" />
        <KPICard title="Customers" value="1" change="Customer module" />
        <KPICard title="Policies" value="1" change="Policy module" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Platform Status</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Enterprise foundation operational.
                </p>
              </div>
              <Badge tone="success">Healthy</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold">Current Sprint</h2>
            <p className="mt-2 text-sm text-slate-500">
              Marketplace Administration Module
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
