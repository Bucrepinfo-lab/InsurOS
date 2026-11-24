import { Badge, DomainModulePage, Tabs } from '@insuros/ui';
import { NotYet, Section } from '@/components/record-view';
import { loadClaim, shortDateTime } from '@/lib/records';
import { requirePageAccess } from "@/lib/auth/page-access";

export const metadata = { title: 'Claim timeline' };

export default async function ClaimTimelinePage({ params }: { params: Promise<{ claimId: string }> }) {
  await requirePageAccess("/dashboard/claims/[claimId]/timeline");
  const { claimId } = await params;
  const { claim, steps, tabs } = await loadClaim(claimId);

  return (
    <DomainModulePage
      title={`Timeline · ${claim.claimNumber}`}
      description='Every step of the claim, oldest first, with who took it.'
    >
      <Tabs items={tabs} activeId='timeline'>
        <Section title='Steps'>
          {steps.length ? (
            <ol className='space-y-3'>
              {steps.map((step, index) => (
                <li key={`${step.stage}-${index}`} className='flex flex-wrap items-start justify-between gap-2 border-b border-line pb-3 text-sm last:border-0'>
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
            <NotYet>No steps yet: the claim is {claim.status.toLowerCase()} and waiting for its review to start.</NotYet>
          )}
        </Section>
      </Tabs>
    </DomainModulePage>
  );
}
