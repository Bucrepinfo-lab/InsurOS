import { Badge, DomainModulePage, Tabs } from '@insuros/ui';
import { NotYet, Section } from '@/components/record-view';
import { loadClaim, shortDateTime } from '@/lib/records';

export const metadata = { title: 'Claim timeline' };

export default async function ClaimTimelinePage({ params }: { params: Promise<{ claimId: string }> }) {
  const { claimId } = await params;
  const { claim, story, tabs } = await loadClaim(claimId);

  return (
    <DomainModulePage
      title={`Timeline · ${claim.claimNumber}`}
      description='Every step of the claim, oldest first, with who took it.'
    >
      <Tabs items={tabs} activeId='timeline'>
        <Section title='Steps'>
          {story ? (
            <ol className='space-y-3'>
              {story.steps.map((step, index) => (
                <li key={step.stage} className='flex flex-wrap items-start justify-between gap-2 border-b border-line pb-3 text-sm last:border-0'>
                  <div>
                    <p className='font-medium text-ink'>
                      {index + 1}. {step.label}
                    </p>
                    <p className='text-dim'>{step.by}</p>
                  </div>
                  <Badge tone={step.stage === 'Certificate' ? 'success' : 'neutral'}>{shortDateTime(step.at)}</Badge>
                </li>
              ))}
            </ol>
          ) : (
            <NotYet>Only the first notice has been recorded for this claim ({claim.status.toLowerCase()}).</NotYet>
          )}
        </Section>
      </Tabs>
    </DomainModulePage>
  );
}
