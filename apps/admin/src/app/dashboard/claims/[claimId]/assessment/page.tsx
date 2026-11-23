import { Badge, DomainModulePage, Tabs } from '@insuros/ui';
import { Fact, NotYet, RecordLink, Section } from '@/components/record-view';
import { loadClaim, shortDateTime } from '@/lib/records';

export const metadata = { title: 'Assessment' };

export default async function ClaimAssessmentPage({ params }: { params: Promise<{ claimId: string }> }) {
  const { claimId } = await params;
  const { claim, story, tabs } = await loadClaim(claimId);

  if (!story) {
    return (
      <DomainModulePage title={`Assessment · ${claim.claimNumber}`} description='Cover checks, fraud signals and the recommended amount.'>
        <Tabs items={tabs} activeId='assessment'>
          <Section title='Not assessed yet'>
            <NotYet>
              No assessment has been recorded for this claim. An adjuster checks the cover and recommends an amount; a
              person records the decision in the{' '}
              <RecordLink href='/dashboard/claims/workflows'>claim workflow</RecordLink>.
            </NotYet>
          </Section>
        </Tabs>
      </DomainModulePage>
    );
  }

  const passed = story.checks.filter((check) => check.pass).length;
  const assessed = story.steps.find((step) => step.stage === 'Assessment');
  const risk = story.fraudScore < 40 ? 'Low risk' : story.fraudScore < 70 ? 'Review' : 'High risk';

  return (
    <DomainModulePage
      title={`Assessment · ${claim.claimNumber}`}
      description='Cover checks, fraud signals and the amount the adjuster recommended. A person makes the decision.'
    >
      <Tabs items={tabs} activeId='assessment'>
        <div className='grid gap-4 sm:grid-cols-3'>
          <Fact label='Fraud score'>
            {story.fraudScore}
            <span className='text-dim'> / 100</span>{' '}
            <Badge tone={story.fraudScore < 40 ? 'success' : story.fraudScore < 70 ? 'warning' : 'danger'}>{risk}</Badge>
          </Fact>
          <Fact label='Cover checks'>
            {passed} of {story.checks.length} passed
          </Fact>
          <Fact label='Assessed'>{assessed ? `${shortDateTime(assessed.at)} · ${assessed.by}` : '—'}</Fact>
        </div>
        <div className='mt-6 grid gap-4 lg:grid-cols-2'>
          <Section title='Cover checks'>
            <ul className='space-y-2'>
              {story.checks.map((check) => (
                <li key={check.label} className='flex items-center justify-between gap-3 border-b border-line pb-2 text-sm last:border-0'>
                  <span className='text-ink'>{check.label}</span>
                  <Badge tone={check.pass ? 'success' : 'danger'}>{check.pass ? 'Pass' : 'Fail'}</Badge>
                </li>
              ))}
            </ul>
          </Section>
          <Section title="Adjuster's recommendation">
            <p className='text-sm text-ink'>{story.assessorNote}</p>
            {story.settlement.notCoveredReason ? (
              <p className='mt-3 text-sm text-dim'>Not covered: {story.settlement.notCoveredReason}.</p>
            ) : null}
          </Section>
        </div>
      </Tabs>
    </DomainModulePage>
  );
}
