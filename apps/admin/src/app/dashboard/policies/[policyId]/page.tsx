import Link from 'next/link';
import { Badge, DomainModulePage, Tabs } from '@insuros/ui';
import { premiumInvoiceFor } from '@insuros/domain';
import { PaymentLedgerService } from '@insuros/services';
import { Fact, NotYet, RecordLink, Rows, Section } from '@/components/record-view';
import { claimTone, loadPolicy, money, policyTone, shortDate } from '@/lib/records';

export const metadata = { title: 'Policy' };

export default async function PolicyDetailPage({ params }: { params: Promise<{ policyId: string }> }) {
  const { policyId } = await params;
  const { policy, customer, claims, tabs } = await loadPolicy(policyId);
  // Premium payments recorded for this policy (customer M-Pesa payments), newest first.
  const payments = (await new PaymentLedgerService().findByReferencePrefixes([`PREM:${policy.id}:`])).reverse();
  const invoice = premiumInvoiceFor(policy);

  return (
    <DomainModulePage
      title={`Policy ${policy.policyNumber}`}
      description={`${policy.product} · ${policy.customer}`}
      actions={
        policy.status === 'Active' ? (
          <Link
            href='/dashboard/claims/new'
            className='inline-flex items-center rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-seal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal'
          >
            Register a claim
          </Link>
        ) : null
      }
    >
      <Tabs items={tabs} activeId='overview'>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <Fact label='Status'>
            <Badge tone={policyTone(policy.status)}>{policy.status === 'Active' ? 'In force' : policy.status}</Badge>
          </Fact>
          <Fact label='Product'>{policy.product}</Fact>
          <Fact label='Premium'>{policy.premium}</Fact>
          <Fact label='Cover ends'>{shortDate(policy.expiryDate)}</Fact>
        </div>

        <div className='mt-6 grid gap-4 lg:grid-cols-2'>
          <Section title='What is covered'>
            <Rows
              rows={[
                ['What is insured', policy.insuredItem ?? '—'],
                ['Sum insured', policy.sumInsured ? money(policy.sumInsured) : '—'],
                ...(policy.registration ? ([['Registration', policy.registration]] as [string, string][]) : []),
                ...(policy.yearOfManufacture ? ([['Year of manufacture', String(policy.yearOfManufacture)]] as [string, string][]) : []),
                ['Cover starts', shortDate(policy.startDate)],
                ['Cover ends', shortDate(policy.expiryDate)]
              ]}
            />
          </Section>
          <Section title='Policy holder'>
            <Rows rows={[['Name', policy.customer], ['Type', customer?.type ?? '—'], ['Email', customer?.email ?? '—']]} />
            {customer ? (
              <p className='mt-3 text-sm'>
                <RecordLink href={`/dashboard/customers/${encodeURIComponent(customer.id)}`}>Open the customer</RecordLink>
              </p>
            ) : null}
          </Section>
        </div>

        <div className='mt-6'>
          <Section
            title='Premium payments'
            note={invoice ? `Invoice ${invoice.invoiceNumber} (${invoice.kind.toLowerCase()}) for ${money(invoice.amount)} is open; the customer pays it from their cover page.` : undefined}
          >
            {payments.length === 0 ? (
              <NotYet>No premium paid through InsurOS on this policy yet.</NotYet>
            ) : (
              <ul className='divide-y divide-line text-sm'>
                {payments.map((payment) => (
                  <li key={payment.id} className='flex flex-wrap items-center justify-between gap-2 py-2'>
                    <span className='font-mono text-ink'>{payment.policyReference?.split(':').pop()}</span>
                    <span className='text-ink'>{money(payment.amount, payment.currency)}</span>
                    <span className='text-dim'>{shortDate(payment.updatedAt)}</span>
                    <Badge tone={payment.status === 'SUCCESS' ? 'success' : payment.status === 'FAILED' ? 'danger' : 'warning'}>
                      {payment.status === 'SUCCESS' ? 'Paid' : payment.status === 'FAILED' ? 'Not completed' : 'Waiting for PIN'}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>

        <div className='mt-6'>
          <Section title={`Claims on this policy (${claims.length})`}>
            {claims.length === 0 ? (
              <NotYet>No claims on this policy.</NotYet>
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
      </Tabs>
    </DomainModulePage>
  );
}
