import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  KPICard,
  type DataTableColumn
} from '@insuros/ui';
import { ActionButton } from '@/components/ActionButton';
import { addDemoRegionalRule } from '@/app/dashboard/actions';
import { RegionalTaxService } from '@insuros/services';

const regionalTaxService = new RegionalTaxService();

export default async function RegionalTaxPage() {
  const rules = await regionalTaxService.getRules();

  // Worked example: motor premium written in California.
  const example = await regionalTaxService.computeRegional(
    'US',
    'US-CA',
    1_000_000,
    'Motor'
  );

  type RuleRow = (typeof rules)[number];

  const columns: DataTableColumn<RuleRow>[] = [
    { key: 'countryCode', header: 'Country' },
    {
      key: 'regionName',
      header: 'Region',
      render: (row) => `${row.regionName} (${row.regionCode})`
    },
    { key: 'name', header: 'Rule' },
    {
      key: 'ratePercent',
      header: 'Rate / Amount',
      render: (row) =>
        row.ratePercent !== undefined
          ? `${row.ratePercent}%`
          : `${row.currency} ${(row.flatAmount ?? 0).toLocaleString()} flat`
    },
    {
      key: 'appliesTo',
      header: 'Lines',
      render: (row) =>
        row.appliesTo.length === 0 ? 'All' : row.appliesTo.join(', ')
    },
    {
      key: 'portalUrl',
      header: 'Authority Portal',
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

  const countries = new Set(rules.map((rule) => rule.countryCode));

  return (
    <DomainModulePage
      title='Regional Tax Configuration'
      description='Per-state and per-county statutory rules layered on national components. Representative rates compiled 2026-07-06 — re-verify with each authority before filing.'
      actions={<ActionButton label='Add regional rule' action={addDemoRegionalRule} />}
    >
      <div className='mb-6 grid gap-4 md:grid-cols-4'>
        <KPICard
          title='Regional Rules'
          value={String(rules.length)}
          change='Configured subnational rules'
        />
        <KPICard
          title='Countries Covered'
          value={String(countries.size)}
          change='US, AU, KE'
        />
        <KPICard
          title='Example: CA Motor'
          value={`USD ${example.totalDue.toLocaleString()}`}
          change='Tax on USD 1,000,000 premium'
        />
        <KPICard
          title='Example Components'
          value={String(example.nationalLines.length + example.regionalLines.length)}
          change='National + regional lines'
        />
      </div>

      <DomainEntityList
        title='Subnational Rule Register'
        description='State premium taxes (US), insurance duties (AU), and county levies (KE) with authority payment links.'
        searchPlaceholder='Search regional rules...'
        columns={columns}
        data={rules}
        emptyTitle='No regional rules'
        emptyDescription='No subnational tax rules have been configured.'
        emptyAction={<Button>Add Regional Rule</Button>}
      />

      <div className='mt-4'>
        <Badge tone='warning'>
          Informational computation — statutory liability rests with the filing entity.
        </Badge>
      </div>
    </DomainModulePage>
  );
}
