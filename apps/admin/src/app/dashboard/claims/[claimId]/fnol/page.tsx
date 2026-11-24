import { Badge, DomainModulePage, Tabs } from '@insuros/ui';
import { Fact, NotYet, Rows, Section } from '@/components/record-view';
import { claimTone, loadClaim, shortDate, shortDateTime } from '@/lib/records';
import { requirePageAccess } from "@/lib/auth/page-access";

export const metadata = { title: 'First notice of loss' };

export default async function ClaimFnolPage({ params }: { params: Promise<{ claimId: string }> }) {
  await requirePageAccess("/dashboard/claims/[claimId]/fnol");
  const { claimId } = await params;
  const { claim, story, tabs } = await loadClaim(claimId);
  const reported = story?.steps.find((step) => step.stage === 'Reported');

  return (
    <DomainModulePage
      title={`First notice of loss · ${claim.claimNumber}`}
      description='When and how the claim was first reported, and what the customer said happened.'
    >
      <Tabs items={tabs} activeId='fnol'>
        <div className='grid gap-4 sm:grid-cols-3'>
          <Fact label='Reported by'>{story?.reportedVia ?? '—'}</Fact>
          <Fact label='Reported on'>{reported ? shortDateTime(reported.at) : '—'}</Fact>
          <Fact label='Claim status'>
            <Badge tone={claimTone(claim.status)}>{claim.status}</Badge>
          </Fact>
        </div>
        <div className='mt-6'>
          <Section title='What happened'>
            {story ? (
              <>
                <Rows rows={[['Date of the incident', shortDate(story.incidentDate)], ['Amount claimed', claim.amount]]} />
                <p className='mt-3 text-sm text-ink'>{story.description}</p>
              </>
            ) : (
              <NotYet>No description has been recorded for this claim yet. The amount claimed is {claim.amount}.</NotYet>
            )}
          </Section>
        </div>
      </Tabs>
    </DomainModulePage>
  );
}
