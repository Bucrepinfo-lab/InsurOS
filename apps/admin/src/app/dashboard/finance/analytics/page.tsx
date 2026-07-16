import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  KPICard,
  type DataTableColumn
} from '@insuros/ui';
import { ActionButton } from '@/components/ActionButton';
import { recordDemoSnapshot } from '@/app/dashboard/actions';
import { AnalyticsService } from '@insuros/services';

const analyticsService = new AnalyticsService();

export default async function AnalyticsPage() {
  const reports = await analyticsService.getReports();

  const latest = reports[reports.length - 1];

  type ReportRow = (typeof reports)[number];

  const columns: DataTableColumn<ReportRow>[] = [
    {
      key: 'period',
      header: 'Period',
      render: (row) => row.snapshot.period
    },
    {
      key: 'country',
      header: 'Country',
      render: (row) => row.snapshot.countryCode
    },
    {
      key: 'gwp',
      header: 'GWP',
      render: (row) =>
        `${row.snapshot.currency} ${row.snapshot.grossWrittenPremium.toLocaleString()}`
    },
    {
      key: 'lossRatioPercent',
      header: 'Loss Ratio',
      render: (row) => `${row.lossRatioPercent}%`
    },
    {
      key: 'expenseRatioPercent',
      header: 'Expense Ratio',
      render: (row) => `${row.expenseRatioPercent}%`
    },
    {
      key: 'combinedRatioPercent',
      header: 'Combined',
      render: (row) => (
        <Badge tone={row.underwritingProfitable ? 'success' : 'danger'}>
          {`${row.combinedRatioPercent}%`}
        </Badge>
      )
    },
    {
      key: 'stp',
      header: 'STP Rate',
      render: (row) => `${row.snapshot.stpRatePercent}%`
    },
    {
      key: 'cycle',
      header: 'Claim Cycle',
      render: (row) => `${row.snapshot.avgClaimCycleDays}d`
    },
    {
      key: 'retention',
      header: 'Retention',
      render: (row) => `${row.snapshot.policyRetentionPercent}%`
    }
  ];

  return (
    <DomainModulePage
      title='Executive Analytics'
      description='The economics of digitalization in one view: combined ratio below 100% means the book underwrites at a profit. STP rate and claim cycle track how automation is cutting expenses.'
      actions={<ActionButton label='Record snapshot' action={recordDemoSnapshot} />}
    >
      <div className='mb-6 grid gap-4 md:grid-cols-4'>
        <KPICard
          title='Latest Combined Ratio'
          value={latest ? `${latest.combinedRatioPercent}%` : '—'}
          change={latest?.underwritingProfitable ? 'Underwriting profitable' : 'Above 100% — review'}
        />
        <KPICard
          title='Loss Ratio'
          value={latest ? `${latest.lossRatioPercent}%` : '—'}
          change='Claims / GWP'
        />
        <KPICard
          title='Expense Ratio'
          value={latest ? `${latest.expenseRatioPercent}%` : '—'}
          change='Falling as manual work is digitalized'
        />
        <KPICard
          title='STP Rate'
          value={latest ? `${latest.snapshot.stpRatePercent}%` : '—'}
          change='Target: 55%+ (insurtech benchmark)'
        />
      </div>

      <DomainEntityList
        title='KPI Snapshots'
        description='Per-country, per-period core insurer economics.'
        searchPlaceholder='Search periods...'
        columns={columns}
        data={reports}
        emptyTitle='No snapshots'
        emptyDescription='No KPI snapshots recorded.'
        emptyAction={<Button>Record Snapshot</Button>}
      />
    </DomainModulePage>
  );
}
