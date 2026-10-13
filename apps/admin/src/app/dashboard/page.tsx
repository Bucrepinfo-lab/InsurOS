import { KPICard, WorkspaceHeader } from '@insuros/ui';

export const metadata = { title: 'Dashboard' };

const kpis = [
  { title: 'Gross written premium', value: 'KES 214M', change: '+4.1% MoM', trend: 'up' as const },
  { title: 'Avg claim cycle', value: '9 days', change: '−2 days', trend: 'up' as const },
  { title: 'Straight-through rate', value: '47%', change: '+6 pts', trend: 'up' as const },
  { title: 'Policy retention', value: '80%', change: '+2 pts', trend: 'up' as const }
];

export default function DashboardHomePage() {
  return (
    <div>
      <WorkspaceHeader
        title="The underwriter's ledger"
        description='Claims in hours, engineered fair prices, cover from 20 bob a day — every action runs a real engine over the live dataset.'
      />
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {kpis.map((kpi) => (
          <KPICard key={kpi.title} title={kpi.title} value={kpi.value} change={kpi.change} trend={kpi.trend} />
        ))}
      </div>
    </div>
  );
}
