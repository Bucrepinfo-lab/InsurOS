import { Badge, DomainModulePage, Tabs } from '@insuros/ui';
import { ClaimService } from '@insuros/services';
import { Fact, RecordLink, Rows, Section } from '@/components/record-view';
import { claimTone, loadClaim, money, shortDate } from '@/lib/records';

export const metadata = { title: 'Claim' };

/** What happens next, in plain words, for each claim status. */
const NEXT_STEP: Record<string, string> = {
  Open: 'Collect the documents and assign the claim to an officer.',
  'In Review': 'The adjuster assesses the loss and recommends an amount.',
  Approved: 'The claimant signs the discharge voucher; finance records the payment.',
  Settled: 'Paid. The certificate of settlement is on the Settlement tab.',
  Closed: 'Closed. Nothing more to do.'
};

export default async function ClaimDetailPage({ params }: { params: Promise<{ claimId: string }> }) {
  const { claimId } = await params;
  const { claim, policy, story, tabs } = await loadClaim(claimId);
  const workflow = await new ClaimService().getClaimWorkflow(claim.id);

  return (
    <DomainModulePage
      title={`Claim ${claim.claimNumber}`}
      description={`${claim.customer} · ${policy?.product ?? 'Policy ' + claim.policyNumber}`}
    >
      <Tabs items={tabs} activeId='overview'>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <Fact label='Status'>
            <Badge tone={claimTone(claim.status)}>{claim.status}</Badge>
          </Fact>
          <Fact label='Policy'>
            {policy ? (
              <RecordLink href={`/dashboard/policies/${encodeURIComponent(policy.id)}`}>{claim.policyNumber}</RecordLink>
            ) : (
              claim.policyNumber
            )}
          </Fact>
          <Fact label='Amount claimed'>{claim.amount}</Fact>
          <Fact label='Amount paid'>{story ? money(story.settlement.approved) : claim.status === 'Settled' ? 'See Settlement' : 'Not paid yet'}</Fact>
        </div>

        <div className='mt-6 grid gap-4 lg:grid-cols-2'>
          <Section title='The claim'>
            <Rows
              rows={[
                ['Customer', claim.customer],
                ['What is insured', policy?.insuredItem ?? '—'],
                ['Date of the incident', shortDate(story?.incidentDate)],
                ['Reported by', story?.reportedVia ?? '—'],
                ['Stage', workflow?.stage === 'FNOL' ? 'First notice' : (workflow?.stage ?? 'Not started')]
              ]}
            />
            {story ? <p className='mt-3 text-sm text-ink'>{story.description}</p> : null}
          </Section>
          <Section title='Next step'>
            <p className='text-sm text-ink'>{NEXT_STEP[claim.status] ?? '—'}</p>
            <p className='mt-3 text-sm text-dim'>
              A person makes every decision on a claim. InsurOS keeps the record; it never sends money.
            </p>
          </Section>
        </div>
      </Tabs>
    </DomainModulePage>
  );
}
