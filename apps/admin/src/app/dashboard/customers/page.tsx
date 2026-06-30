import Link from 'next/link';
import { Badge, Button, Card, CardContent, DomainModulePage, Tabs } from '@insuros/ui';
import { CustomerService } from '@insuros/services';

const customerId = 'demo-customer';
const customerService = new CustomerService();
const tabs = [
  { id: 'overview', label: 'Overview', href: `/dashboard/customers/${customerId}` },
  { id: 'profile', label: 'Profile', href: `/dashboard/customers/${customerId}/profile` },
  { id: 'contacts', label: 'Contacts', href: `/dashboard/customers/${customerId}/contacts` },
  { id: 'policies', label: 'Policies', href: `/dashboard/customers/${customerId}/policies` },
  { id: 'claims', label: 'Claims', href: `/dashboard/customers/${customerId}/claims` },
  { id: 'payments', label: 'Payments', href: `/dashboard/customers/${customerId}/payments` },
  { id: 'timeline', label: 'Timeline', href: `/dashboard/customers/${customerId}/timeline` }
];

export default async function CustomersPage() {
  return (
    <DomainModulePage
      title='Demo Customer'
      description='Customer 360 profile, policies, claims, payments, KYC, contacts, and lifecycle history.'
      actions={<Button>Edit Customer</Button>}
    >
      <div className='mb-6 flex flex-wrap gap-3'>
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            className='rounded-md border bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50'
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <Tabs items={tabs} activeId='overview'>
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
      </Tabs>
    </DomainModulePage>
  );
}