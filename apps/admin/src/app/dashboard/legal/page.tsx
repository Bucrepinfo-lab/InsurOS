import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  KPICard,
  type DataTableColumn
} from '@insuros/ui';
import { TermsService } from '@insuros/services';

const termsService = new TermsService();

export default async function LegalPage() {
  const documents = await termsService.getTermsDocuments();
  const acceptances = await termsService.getAcceptances();

  type DocumentRow = (typeof documents)[number];
  type AcceptanceRow = (typeof acceptances)[number];

  const documentColumns: DataTableColumn<DocumentRow>[] = [
    { key: 'title', header: 'Document' },
    { key: 'version', header: 'Version' },
    { key: 'audience', header: 'Audience' },
    { key: 'jurisdiction', header: 'Jurisdiction' },
    { key: 'effectiveDate', header: 'Effective' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge
          tone={
            row.status === 'Active'
              ? 'success'
              : row.status === 'Draft'
                ? 'warning'
                : 'neutral'
          }
        >
          {row.status}
        </Badge>
      )
    },
    {
      key: 'sections',
      header: 'Sections',
      render: (row) => String(row.sections.length)
    }
  ];

  const acceptanceColumns: DataTableColumn<AcceptanceRow>[] = [
    { key: 'userName', header: 'User' },
    { key: 'termsVersion', header: 'Version' },
    { key: 'method', header: 'Method' },
    { key: 'acceptedAt', header: 'Accepted At' },
    {
      key: 'ipAddress',
      header: 'IP',
      render: (row) => row.ipAddress ?? '—'
    }
  ];

  return (
    <DomainModulePage
      title='Legal & Terms'
      description='Versioned terms & conditions with click-wrap acceptance tracking across all audiences and jurisdictions.'
      actions={<Button>Publish New Version</Button>}
    >
      <div className='mb-6 grid gap-4 md:grid-cols-3'>
        <KPICard
          title='Documents'
          value={String(documents.length)}
          change='Terms documents'
        />
        <KPICard
          title='Active'
          value={String(documents.filter((item) => item.status === 'Active').length)}
          change='Currently binding'
        />
        <KPICard
          title='Acceptances'
          value={String(acceptances.length)}
          change='Recorded acceptances'
        />
      </div>

      <div className='mb-8'>
        <DomainEntityList
          title='Terms & Conditions Registry'
          description='All versions of platform legal documents.'
          searchPlaceholder='Search documents...'
          columns={documentColumns}
          data={documents}
          emptyTitle='No documents'
          emptyDescription='No terms documents have been published.'
          emptyAction={<Button>Publish Terms</Button>}
          actions={<Button variant='secondary'>Export</Button>}
        />
      </div>

      <DomainEntityList
        title='Acceptance Log'
        description='Immutable record of who accepted which version, when, and how.'
        searchPlaceholder='Search acceptances...'
        columns={acceptanceColumns}
        data={acceptances}
        emptyTitle='No acceptances'
        emptyDescription='No terms acceptances have been recorded.'
        emptyAction={<Button>Request Acceptance</Button>}
        actions={<Button variant='secondary'>Export</Button>}
      />
    </DomainModulePage>
  );
}
