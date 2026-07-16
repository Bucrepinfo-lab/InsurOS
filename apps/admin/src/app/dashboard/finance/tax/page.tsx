import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  KPICard,
  type DataTableColumn
} from '@insuros/ui';
import { ActionButton } from '@/components/ActionButton';
import { computeDemoRemittance } from '@/app/dashboard/actions';
import { TaxRemittanceService } from '@insuros/services';

const taxService = new TaxRemittanceService();

export default async function TaxRemittancePage() {
  const jurisdictions = await taxService.getJurisdictions();
  const remittances = await taxService.getRemittances();

  type JurisdictionRow = (typeof jurisdictions)[number];
  type RemittanceRow = (typeof remittances)[number];

  const jurisdictionColumns: DataTableColumn<JurisdictionRow>[] = [
    { key: 'countryCode', header: 'Country' },
    { key: 'countryName', header: 'Jurisdiction' },
    { key: 'authorityName', header: 'Authority' },
    {
      key: 'components',
      header: 'Tax Components',
      render: (row) =>
        row.components
          .map((component) => `${component.name} (${component.ratePercent}%)`)
          .join(', ')
    },
    { key: 'filingFrequency', header: 'Filing' },
    {
      key: 'portalUrl',
      header: 'Statutory Payment Portal',
      render: (row) => (
        <a
          href={row.portalUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='text-blue-600 underline'
        >
          {row.portalName}
        </a>
      )
    }
  ];

  const remittanceColumns: DataTableColumn<RemittanceRow>[] = [
    { key: 'countryCode', header: 'Country' },
    { key: 'period', header: 'Period' },
    { key: 'insuranceLine', header: 'Line' },
    {
      key: 'grossPremium',
      header: 'Gross Premium',
      render: (row) => `${row.currency} ${row.grossPremium.toLocaleString()}`
    },
    {
      key: 'totalDue',
      header: 'Tax Due',
      render: (row) => `${row.currency} ${row.totalDue.toLocaleString()}`
    },
    { key: 'dueDate', header: 'Due Date' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge
          tone={
            row.status === 'Paid'
              ? 'success'
              : row.status === 'Overdue'
                ? 'danger'
                : row.status === 'Draft'
                  ? 'neutral'
                  : 'warning'
          }
        >
          {row.status}
        </Badge>
      )
    },
    {
      key: 'paymentUrl',
      header: 'Pay',
      render: (row) => (
        <a
          href={row.paymentUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='text-blue-600 underline'
        >
          Remit Now
        </a>
      )
    }
  ];

  const outstanding = remittances.filter(
    (item) => item.status !== 'Paid' && item.status !== 'Filed'
  );

  return (
    <DomainModulePage
      title='Tax Remittance'
      description='Statutory tax computation and remittance per country. Rates verified 2026-07-06 — always re-verify with the named authority before filing.'
      actions={<ActionButton label='Compute remittance' action={computeDemoRemittance} />}
    >
      <div className='mb-6 grid gap-4 md:grid-cols-4'>
        <KPICard
          title='Jurisdictions'
          value={String(jurisdictions.length)}
          change='Configured countries'
        />
        <KPICard
          title='Remittances'
          value={String(remittances.length)}
          change='Current cycle'
        />
        <KPICard
          title='Outstanding'
          value={String(outstanding.length)}
          change='Awaiting filing or payment'
        />
        <KPICard
          title='Overdue'
          value={String(remittances.filter((item) => item.status === 'Overdue').length)}
          change='Requires immediate action'
        />
      </div>

      <div className='mb-8'>
        <DomainEntityList
          title='Statutory Jurisdictions'
          description='Tax components, rates, and official remittance portals per country.'
          searchPlaceholder='Search jurisdictions...'
          columns={jurisdictionColumns}
          data={jurisdictions}
          emptyTitle='No jurisdictions'
          emptyDescription='No tax jurisdictions have been configured.'
          emptyAction={<Button>Add Jurisdiction</Button>}
        />
      </div>

      <DomainEntityList
        title='Remittance Ledger'
        description='Computed statutory obligations with direct payment links.'
        searchPlaceholder='Search remittances...'
        columns={remittanceColumns}
        data={remittances}
        emptyTitle='No remittances'
        emptyDescription='No tax remittances have been computed.'
        emptyAction={<Button>Compute Remittance</Button>}
      />
    </DomainModulePage>
  );
}
