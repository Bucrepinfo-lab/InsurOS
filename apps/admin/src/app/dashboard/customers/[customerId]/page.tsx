import Link from 'next/link';
import {
  Badge,
  Button,
  Card,
  CardContent,
  DomainModulePage,
  Tabs
} from '@insuros/ui';

const policyId = 'POL-2026-0001';

const tabs = [
  {
    id: 'overview',
    label: 'Overview',
    href: `/dashboard/policies/${policyId}`
  },
  {
    id: 'holder',
    label: 'Policy Holder',
    href: `/dashboard/policies/${policyId}/holder`
  },
  {
    id: 'coverages',
    label: 'Coverages',
    href: `/dashboard/policies/${policyId}/coverages`
  },
  {
    id: 'premium',
    label: 'Premium',
    href: `/dashboard/policies/${policyId}/premium`
  },
  {
    id: 'documents',
    label: 'Documents',
    href: `/dashboard/policies/${policyId}/documents`
  },
  {
    id: 'timeline',
    label: 'Timeline',
    href: `/dashboard/policies/${policyId}/timeline`
  }
];

export default function PolicyDetailPage() {
  return (
    <DomainModulePage
      title="Policy POL-2026-0001"
      description="Complete policy workspace covering issuance, servicing, endorsements, renewals, claims, and audit history."
      actions={<Button>Endorse Policy</Button>}
    >
      <div className="mb-6 flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            className="rounded-md border bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <Tabs items={tabs} activeId="overview">
        <div className="grid gap-4 lg:grid-cols-4">

          <Card>
            <CardContent>
              <p className="text-sm text-slate-500">Status</p>
              <div className="mt-2">
                <Badge tone="success">Active</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-sm text-slate-500">Product</p>
              <p className="mt-2 font-medium">
                Motor Comprehensive
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-sm text-slate-500">Premium</p>
              <p className="mt-2 font-medium">
                KES 42,000
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-sm text-slate-500">Expiry</p>
              <p className="mt-2 font-medium">
                28 Jun 2027
              </p>
            </CardContent>
          </Card>

        </div>
      </Tabs>
    </DomainModulePage>
  );
}