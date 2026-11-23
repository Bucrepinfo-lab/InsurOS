import { Badge, DomainModulePage } from '@insuros/ui';
import { Fact, NotYet, RecordLink, Section } from '@/components/record-view';
import { claimTone, loadCustomer, policyTone, shortDate } from '@/lib/records';

export const metadata = { title: 'Customer' };

export default async function CustomerDetailPage({ params }: { params: Promise<{ customerId: string }> }) {
  const { customerId } = await params;
  const { customer, policies, claims } = await loadCustomer(customerId);
  const inForce = policies.filter((policy) => policy.status === 'Active').length;

  return (
    <DomainModulePage title={customer.name} description={`${customer.type} customer · ${customer.email}`}>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Fact label='Status'>
          <Badge tone={customer.status === 'Active' ? 'success' : 'warning'}>{customer.status}</Badge>
        </Fact>
        <Fact label='Policies'>{policies.length}</Fact>
        <Fact label='In force'>{inForce}</Fact>
        <Fact label='Claims'>{claims.length}</Fact>
      </div>

      <div className='mt-6 grid gap-4 lg:grid-cols-2'>
        <Section title='Policies'>
          {policies.length === 0 ? (
            <NotYet>
              No policies yet. <RecordLink href='/dashboard/policies/new'>Record a policy</RecordLink>
            </NotYet>
          ) : (
            <ul className='divide-y divide-line text-sm'>
              {policies.map((policy) => (
                <li key={policy.id} className='flex flex-wrap items-center justify-between gap-2 py-2'>
                  <span>
                    <RecordLink href={`/dashboard/policies/${encodeURIComponent(policy.id)}`}>{policy.policyNumber}</RecordLink>
                    <span className='ml-2 text-dim'>{policy.product}</span>
                  </span>
                  <span className='text-dim'>to {shortDate(policy.expiryDate)}</span>
                  <Badge tone={policyTone(policy.status)}>{policy.status === 'Active' ? 'In force' : policy.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Section>
        <Section title='Claims'>
          {claims.length === 0 ? (
            <NotYet>No claims.</NotYet>
          ) : (
            <ul className='divide-y divide-line text-sm'>
              {claims.map((claim) => (
                <li key={claim.id} className='flex flex-wrap items-center justify-between gap-2 py-2'>
                  <RecordLink href={`/dashboard/claims/${encodeURIComponent(claim.id)}`}>{claim.claimNumber}</RecordLink>
                  <span className='text-ink'>{claim.amount}</span>
                  <Badge tone={claimTone(claim.status)}>{claim.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </DomainModulePage>
  );
}
