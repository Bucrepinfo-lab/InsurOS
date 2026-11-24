import { Badge, DomainEntityList, DomainModulePage, Tabs, type DataTableColumn } from '@insuros/ui';
import { NotYet, RecordLink, Section } from '@/components/record-view';
import { loadClaim, shortDate } from '@/lib/records';
import { requirePageAccess } from "@/lib/auth/page-access";

export const metadata = { title: 'Claim documents' };

type DocumentRow = { name: string; kind: string; receivedOn: string };

const columns: DataTableColumn<DocumentRow>[] = [
  { key: 'name', header: 'Document' },
  { key: 'kind', header: 'Kind' },
  { key: 'receivedOn', header: 'Received', render: (row) => shortDate(row.receivedOn) },
  { key: 'status', header: 'Status', render: () => <Badge tone='success'>Received</Badge> }
];

export default async function ClaimDocumentsPage({ params }: { params: Promise<{ claimId: string }> }) {
  await requirePageAccess("/dashboard/claims/[claimId]/documents");
  const { claimId } = await params;
  const { claim, story, tabs } = await loadClaim(claimId);

  return (
    <DomainModulePage
      title={`Documents · ${claim.claimNumber}`}
      description='Claim form, evidence and supporting papers received for this claim.'
    >
      <Tabs items={tabs} activeId='documents'>
        {story ? (
          <DomainEntityList
            title='Documents'
            description='Every document received for this claim.'
            columns={columns}
            data={story.documents}
            emptyTitle='No documents'
          />
        ) : (
          <Section title='No documents yet'>
            <NotYet>
              No documents are on file for this claim. Record them under{' '}
              <RecordLink href='/dashboard/operations/documents'>Operations → Documents</RecordLink>.
            </NotYet>
          </Section>
        )}
      </Tabs>
    </DomainModulePage>
  );
}
