import { Badge, DomainModulePage, Tabs } from '@insuros/ui';
import { Fact, RecordLink, Section } from '@/components/record-view';
import { loadPolicy } from '@/lib/records';

export const metadata = { title: 'Policy holder' };

export default async function PolicyHolderPage({ params }: { params: Promise<{ policyId: string }> }) {
  const { policyId } = await params;
  const { policy, customer, tabs } = await loadPolicy(policyId);

  return (
    <DomainModulePage title={`Policy holder · ${policy.policyNumber}`} description='Who this policy covers and how to reach them.'>
      <Tabs items={tabs} activeId='holder'>
        <div className='grid gap-4 sm:grid-cols-3'>
          <Fact label='Name'>{policy.customer}</Fact>
          <Fact label='Email'>{customer?.email ?? '—'}</Fact>
          <Fact label='Customer status'>
            {customer ? <Badge tone={customer.status === 'Active' ? 'success' : 'warning'}>{customer.status}</Badge> : '—'}
          </Fact>
        </div>
        {customer ? (
          <div className='mt-6'>
            <Section title='More about this customer'>
              <RecordLink href={`/dashboard/customers/${encodeURIComponent(customer.id)}`}>
                Open {customer.name}: every policy and claim
              </RecordLink>
            </Section>
          </div>
        ) : null}
      </Tabs>
    </DomainModulePage>
  );
}
