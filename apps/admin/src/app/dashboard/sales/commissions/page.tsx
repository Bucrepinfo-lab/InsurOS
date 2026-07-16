import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  KPICard,
  type DataTableColumn
} from '@insuros/ui';
import { ActionButton } from '@/components/ActionButton';
import { accrueDemoPremium } from '@/app/dashboard/actions';
import { CommissionService, SalesHierarchyService } from '@insuros/services';

export const metadata = { title: 'Commissions' };

const commissionService = new CommissionService();
const salesService = new SalesHierarchyService();

export default async function CommissionsPage() {
  const schedules = await commissionService.getSchedules();
  const accruals = await commissionService.getAccruals();
  const agents = await salesService.getAgents();

  type ScheduleRow = (typeof schedules)[number];
  type AccrualRow = (typeof accruals)[number];

  const agentName = (id: string) =>
    agents.find((agent) => agent.id === id)?.name ?? id;

  const scheduleColumns: DataTableColumn<ScheduleRow>[] = [
    { key: 'name', header: 'Schedule' },
    { key: 'rank', header: 'Rank' },
    { key: 'insuranceLine', header: 'Line' },
    {
      key: 'directRatePercent',
      header: 'Direct Rate',
      render: (row) => `${row.directRatePercent}%`
    },
    {
      key: 'overrideRatePercent',
      header: 'Override Rate',
      render: (row) => `${row.overrideRatePercent}%`
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge tone={row.status === 'Active' ? 'success' : 'neutral'}>
          {row.status}
        </Badge>
      )
    }
  ];

  const accrualColumns: DataTableColumn<AccrualRow>[] = [
    {
      key: 'agentId',
      header: 'Beneficiary',
      render: (row) => agentName(row.agentId)
    },
    { key: 'kind', header: 'Kind' },
    {
      key: 'sourceAgentId',
      header: 'Written By',
      render: (row) => agentName(row.sourceAgentId)
    },
    { key: 'policyReference', header: 'Policy' },
    {
      key: 'grossPremium',
      header: 'Premium',
      render: (row) => `${row.currency} ${row.grossPremium.toLocaleString()}`
    },
    {
      key: 'amount',
      header: 'Commission',
      render: (row) => `${row.currency} ${row.amount.toLocaleString()} (${row.ratePercent}%)`
    },
    { key: 'period', header: 'Period' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge
          tone={
            row.status === 'Paid'
              ? 'success'
              : row.status === 'ClawedBack'
                ? 'danger'
                : row.status === 'Approved'
                  ? 'success'
                  : 'warning'
          }
        >
          {row.status}
        </Badge>
      )
    }
  ];

  const payable = accruals
    .filter((item) => item.status === 'Accrued' || item.status === 'Approved')
    .reduce((sum, item) => sum + item.amount, 0);

  const clawedBack = accruals
    .filter((item) => item.status === 'ClawedBack')
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <DomainModulePage
      title='Commissions'
      description='Commission schedules per rank, accruals with override chains, and clawbacks for lapsed business.'
      actions={<ActionButton label='Accrue premium' action={accrueDemoPremium} />}
    >
      <div className='mb-6 grid gap-4 md:grid-cols-4'>
        <KPICard
          title='Schedules'
          value={String(schedules.filter((item) => item.status === 'Active').length)}
          change='Active rate cards'
        />
        <KPICard
          title='Accruals'
          value={String(accruals.length)}
          change='Current cycle'
        />
        <KPICard
          title='Payable'
          value={`KES ${payable.toLocaleString()}`}
          change='Accrued + approved'
        />
        <KPICard
          title='Clawed Back'
          value={`KES ${clawedBack.toLocaleString()}`}
          change='Lapsed or non-compliant'
        />
      </div>

      <div className='mb-8'>
        <DomainEntityList
          title='Commission Schedules'
          description='Direct and override rates by sales rank.'
          searchPlaceholder='Search schedules...'
          columns={scheduleColumns}
          data={schedules}
          emptyTitle='No schedules'
          emptyDescription='No commission schedules have been configured.'
          emptyAction={<Button>Create Schedule</Button>}
        />
      </div>

      <DomainEntityList
        title='Accrual Ledger'
        description='Every accrual names its writing agent — override chains are auditable end to end.'
        searchPlaceholder='Search accruals...'
        columns={accrualColumns}
        data={accruals}
        emptyTitle='No accruals'
        emptyDescription='No commissions have been accrued.'
        emptyAction={<Button>Accrue Premium</Button>}
      />
    </DomainModulePage>
  );
}
