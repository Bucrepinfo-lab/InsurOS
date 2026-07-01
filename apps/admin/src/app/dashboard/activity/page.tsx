import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  KPICard,
  type DataTableColumn
} from '@insuros/ui';
import { PlatformActivityService } from '@insuros/services';

const activityService = new PlatformActivityService();

export default async function ActivityPage() {
  const events = await activityService.getActivityEvents();

  type ActivityRow = (typeof events)[number];

  const columns: DataTableColumn<ActivityRow>[] = [
    { key: 'entityReference', header: 'Reference' },
    { key: 'module', header: 'Module' },
    { key: 'title', header: 'Activity' },
    { key: 'actor', header: 'Actor' },
    { key: 'occurredAt', header: 'Occurred At' },
    {
      key: 'type',
      header: 'Type',
      render: (row) => (
        <Badge tone={row.type === 'Escalated' ? 'danger' : row.type === 'Approved' ? 'success' : 'warning'}>
          {row.type}
        </Badge>
      )
    }
  ];

  return (
    <DomainModulePage
      title='Activity & Timeline'
      description='Review cross-module activity, operational history, audit events, and lifecycle changes.'
      actions={<Button>Export Activity</Button>}
    >
      <div className='mb-6 grid gap-4 md:grid-cols-3'>
        <KPICard title='Activity Events' value={String(events.length)} change='Across modules' />
        <KPICard title='Modules' value={String(new Set(events.map((event) => event.module)).size)} change='Reporting activity' />
        <KPICard title='Escalations' value={String(events.filter((event) => event.type === 'Escalated').length)} change='Needs review' />
      </div>

      <DomainEntityList
        title='Recent Activity'
        description='Cross-module activity events generated across the insurance platform.'
        searchPlaceholder='Search activity...'
        columns={columns}
        data={events}
        emptyTitle='No activity'
        emptyDescription='No activity events have been recorded yet.'
        emptyAction={<Button>Export Activity</Button>}
        actions={<Button variant='secondary'>Export</Button>}
      />
    </DomainModulePage>
  );
}