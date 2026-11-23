import { Badge, DomainModulePage, Tabs } from '@insuros/ui';
import { nextClaimStep } from '@insuros/domain';
import { ClaimSteps } from '@/components/claim-steps';
import { getAuthState, principalCan } from '@/lib/auth/session';
import { Fact, RecordLink, Rows, Section } from '@/components/record-view';
import { claimStage, claimTone, loadClaim, money, shortDate } from '@/lib/records';

export const metadata = { title: 'Claim' };

/** What happens next, in plain words, for each claim status. */
const NEXT_STEP: Record<string, string> = {
  Open: 'Start the review once the claim form and the main documents are in.',
  'In Review': 'The adjuster assesses the loss and recommends an amount.',
  Approved: 'The claimant signs the discharge voucher, finance pays, the payment is recorded, then the certificate of settlement is approved.',
  Settled: 'Paid. The certificate of settlement is on the Settlement tab.',
  Closed: 'Closed. Nothing more to do on this claim.'
};

export default async function ClaimDetailPage({ params }: { params: Promise<{ claimId: string }> }) {
  const { claimId } = await params;
  const { claim, policy, story, settlement, tabs } = await loadClaim(claimId);
  const auth = await getAuthState();
  const principal = auth.status === 'active' ? auth.principal : null;
  const can = {
    update: Boolean(principal && principalCan(principal, 'Claims', 'Update')),
    approve: Boolean(principal && principalCan(principal, 'Claims', 'Approve')),
    reject: Boolean(principal && principalCan(principal, 'Claims', 'Reject'))
  };
  const next = nextClaimStep(claim);

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
          <Fact label='Amount approved'>{settlement ? money(settlement.approved) : 'Not decided yet'}</Fact>
        </div>

        <div className='mt-6 grid gap-4 lg:grid-cols-2'>
          <Section title='The claim'>
            <Rows
              rows={[
                ['Customer', claim.customer],
                ['What is insured', policy?.insuredItem ?? '—'],
                ['Date of the incident', shortDate(story?.incidentDate)],
                ['Reported by', story?.reportedVia ?? '—'],
                ['Stage', claimStage(claim).stage]
              ]}
            />
            {story ? <p className='mt-3 text-sm text-ink'>{story.description}</p> : null}
          </Section>
          <Section title='Next step'>
            <p className='text-sm text-ink'>{NEXT_STEP[claim.status] ?? '—'}</p>
            {claim.declinedReason ? <p className='mt-2 text-sm text-ink'>Declined: {claim.declinedReason}</p> : null}
            <div className='mt-4'>
              <ClaimSteps
                claimId={claim.id}
                next={next}
                claimedLabel={claim.amount}
                approvedLabel={settlement ? money(settlement.approved) : undefined}
                can={can}
                today={new Date().toISOString().slice(0, 10)}
              />
            </div>
            <p className='mt-4 text-sm text-dim'>
              A person takes every step on a claim. InsurOS keeps the record; it never sends money.
            </p>
          </Section>
        </div>
      </Tabs>
    </DomainModulePage>
  );
}
