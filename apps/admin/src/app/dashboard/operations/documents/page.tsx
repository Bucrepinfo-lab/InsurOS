import {
  Badge,
  DomainEntityList,
  DomainModulePage,
  KPICard,
  type DataTableColumn
} from '@insuros/ui';
import { ActionButton } from '@/components/ActionButton';
import { ingestDemoDocument } from '@/app/dashboard/actions';
import { DocumentIntelligenceService } from '@insuros/services';

export const metadata = { title: 'Document intelligence' };

const documentIntelligenceService = new DocumentIntelligenceService();

export default async function DocumentIntelligencePage() {
  const extractions = await documentIntelligenceService.getExtractions();

  type ExtractionRow = (typeof extractions)[number];

  const columns: DataTableColumn<ExtractionRow>[] = [
    { key: 'attachmentReference', header: 'Attachment' },
    {
      key: 'claimReference',
      header: 'Claim',
      render: (row) => row.claimReference ?? '—'
    },
    { key: 'documentType', header: 'Document Type' },
    {
      key: 'fields',
      header: 'Extracted Fields',
      render: (row) =>
        row.fields.map((field) => `${field.key}: ${field.value}`).join(' · ')
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
          {row.status}
        </Badge>
      )
    }
  ];

  return (
    <DomainModulePage
      title='Documents'
      description='Document details per claim: required details are checked, and anything missing or doubtful goes to a person to review. Reading uploaded files automatically is not switched on in this release.'
      actions={<ActionButton label='Scan document' action={ingestDemoDocument} />}
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
