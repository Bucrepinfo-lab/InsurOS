import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  KPICard,
  type DataTableColumn
} from '@insuros/ui';
import { PricingService } from '@insuros/services';

const pricingService = new PricingService();

export default async function PricingEnginePage() {
  const factors = await pricingService.getRiskFactors();
  const bands = await pricingService.getAffordabilityBands();
  const benchmarks = await pricingService.getBenchmarks();

  // Worked example: urban safe driver, Jua Kali band, Kenya motor.
  const sampleQuote = await pricingService.quote({
    insuranceLine: 'Motor',
    countryCode: 'KE',
    baseMonthlyPremium: 3_000,
    riskFactorIds: ['risk-urban', 'risk-telematics-good'],
    affordabilityBandId: 'band-jua-kali',
    expenseLoadingPercent: 12,
    commissionLoadingPercent: 8
  });

  type FactorRow = (typeof factors)[number];
  type BenchmarkRow = (typeof benchmarks)[number];

  const factorColumns: DataTableColumn<FactorRow>[] = [
    { key: 'name', header: 'Risk Factor' },
    { key: 'insuranceLine', header: 'Line' },
    {
      key: 'multiplier',
      header: 'Multiplier',
      render: (row) => (
        <Badge tone={row.multiplier < 1 ? 'success' : 'warning'}>
          ×{row.multiplier}
        </Badge>
      )
    },
    { key: 'description', header: 'Description' }
  ];

  const benchmarkColumns: DataTableColumn<BenchmarkRow>[] = [
    { key: 'competitor', header: 'Competitor' },
    { key: 'insuranceLine', header: 'Line' },
    { key: 'countryCode', header: 'Country' },
    {
      key: 'monthlyPremium',
      header: 'Monthly Premium',
      render: (row) => `${row.currency} ${row.monthlyPremium.toLocaleString()}`
    },
    { key: 'capturedAt', header: 'Captured' }
  ];

  return (
    <DomainModulePage
      title='Pricing Engine'
      description='Competitive-friendly premiums: risk-adjusted technical price, lean digital loadings, competitor undercut, affordability floors. Never priced below expected risk cost.'
      actions={<Button>New Quote</Button>}
    >
      <div className='mb-6 grid gap-4 md:grid-cols-4'>
        <KPICard
          title='Sample Quote (KE Motor)'
          value={`KES ${sampleQuote.recommendedPremium.toLocaleString()}`}
          change='Urban safe driver, Jua Kali band'
        />
        <KPICard
          title='Technical Premium'
          value={`KES ${sampleQuote.technicalPremium.toLocaleString()}`}
          change='Risk-cost floor'
        />
        <KPICard
          title='Competitor Median'
          value={`KES ${(sampleQuote.competitorMedian ?? 0).toLocaleString()}`}
          change='KE motor market'
        />
        <KPICard
          title='Margin'
          value={`${sampleQuote.marginPercent}%`}
          change='Above risk cost'
        />
      </div>

      <div className='mb-8'>
        <DomainEntityList
          title='Risk Factors'
          description='Granular multipliers — telematics and mitigation earn discounts.'
          searchPlaceholder='Search factors...'
          columns={factorColumns}
          data={factors}
          emptyTitle='No factors'
          emptyDescription='No risk factors configured.'
          emptyAction={<Button>Add Factor</Button>}
        />
      </div>

      <DomainEntityList
        title='Competitor Benchmarks'
        description={`Market intelligence feeding the undercut logic. Affordability bands: ${bands
          .map((band) => `${band.name} (−${band.discountPercent}%)`)
          .join(', ')}.`}
        searchPlaceholder='Search benchmarks...'
        columns={benchmarkColumns}
        data={benchmarks}
        emptyTitle='No benchmarks'
        emptyDescription='No competitor benchmarks captured.'
        emptyAction={<Button>Add Benchmark</Button>}
        actions={<Button variant='secondary'>Export</Button>}
      />
    </DomainModulePage>
  );
}
