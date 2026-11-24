import Link from 'next/link';
import {
  Badge,
  DomainEntityList,
  DomainModulePage,
  KPICard,
  type DataTableColumn
} from '@insuros/ui';
import { DOCUMENT_FIELD_LABELS, DOCUMENT_TYPE_LABELS } from '@insuros/domain';
import { DocumentIntelligenceService } from '@insuros/services';
import { requirePageAccess } from "@/lib/auth/page-access";

export const metadata = { title: 'Document intelligence' };

const documentIntelligenceService = new DocumentIntelligenceService();

export default async function DocumentIntelligencePage() {
  await requirePageAccess("/dashboard/operations/documents");
  const extractions = await documentIntelligenceService.getExtractions();

  type ExtractionRow = (typeof extractions)[number];

  const columns: DataTableColumn<ExtractionRow>[] = [
    { key: 'attachmentReference', header: 'Reference' },
    {
      key: 'claimReference',
      header: 'Claim',
      render: (row) => row.claimReference ?? '—'
    },
    {
      key: 'documentType',
      header: 'Document',
      render: (row) => (DOCUMENT_TYPE_LABELS as Record<string, string>)[row.documentType] ?? row.documentType
    },
    { key: 'engine', header: 'How captured' },
    {
      key: 'fields',
      header: 'Extracted Fields',
      render: (row) =>
        row.fields
          .map((field) => `${(DOCUMENT_FIELD_LABELS[field.key] ?? field.key).replace(/ ?\(.*\)$|, in shillings$/, '')}: ${field.value || 'missing'}`)
          .join('; ')
    },
    {
      key: 'overallConfidence',
      header: 'Confidence',
      render: (row) => (
        <Badge
          tone={
            row.overallConfidence >= 0.85
              ? 'success'
              : row.overallConfidence >= 0.6
                ? 'warning'
                : 'danger'
          }
        >
          {`${Math.round(row.overallConfidence * 100)}%`}
        </Badge>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge
          tone={
            row.status === 'Verified'
              ? 'success'
              : row.status === 'NeedsHumanReview'
                ? 'warning'
                : row.status === 'Rejected'
                  ? 'danger'
                  : 'neutral'
          }
        >
          {row.status === 'NeedsHumanReview' ? 'Needs review' : row.status}
        </Badge>
      )
    }
  ];

  return (
    <DomainModulePage
      title='Documents'
      description='Document details per claim. Required details are checked, and anything missing goes to a person to review. A photo can be read on your own device to save typing; the photo itself is not stored.'
      actions={
        <Link href='/dashboard/operations/documents/new' className='inline-flex items-center justify-center gap-2 rounded-lg bg-[linear-gradient(180deg,#22344f_0%,#1b2a41_100%)] px-4 py-2 text-sm font-medium text-paper shadow-[0_1px_2px_rgba(18,28,49,0.3),0_8px_20px_-10px_rgba(18,28,49,0.5)] transition-all duration-200 hover:-translate-y-px hover:bg-[linear-gradient(180deg,#128a6b_0%,#0f6e56_100%)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal'>
          Record a document
        </Link>
      }
    >
      <div className='mb-6 grid gap-4 md:grid-cols-3'>
        <KPICard
          title='Extractions'
          value={String(extractions.length)}
          change='Documents processed'
        />
        <KPICard
          title='Auto-Verified'
          value={String(extractions.filter((item) => item.status === 'Verified').length)}
          change='No human touch needed'
        />
        <KPICard
          title='Needs Review'
          value={String(extractions.filter((item) => item.status === 'NeedsHumanReview').length)}
          change='Low confidence or missing fields'
        />
      </div>

      <DomainEntityList
        title='Extraction Ledger'
        description='Details recorded per document, with each value and how sure the record is.'
        searchPlaceholder='Search extractions...'
        columns={columns}
        data={extractions}
        emptyTitle='No extractions'
        emptyDescription='No documents have been processed.'
      />
    </DomainModulePage>
  );
}
