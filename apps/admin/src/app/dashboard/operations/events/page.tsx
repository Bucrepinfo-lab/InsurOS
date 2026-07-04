import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  KPICard,
  type DataTableColumn
} from '@insuros/ui';
import { PlatformEventService } from '@insuros/services';

const platformEventService = new PlatformEventService();

export default async function PlatformEventsPage() {
  const events = await platformEventService.getPlatformEvents();

  type PlatformEventRow = (typeof events)[number];

  const columns: DataTableColumn<PlatformEventRow>[] = [
    { key: 'eventType', header: 'Event Type' },
    { key: 'sourceModule', header: 'Source' },
    { key: 'entityId', header: 'Entity ID' },
    { key: 'createdAt', header: 'Created At' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge
          tone={
            row.status === 'Completed'
              ? 'success'
              : row.status === 'Failed'
                ? 'danger'
                : row.status === 'Processing'
                  ? 'warning'
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
      title='Platform Events'
      description='Review cross-domain platform events used for workflow orchestration, audit, notifications, and future integrations.'
      actions={<Button>Replay Events</Button>}
    >
      <div className='mb-6 grid gap-4 md:grid-cols-3'>
        <KPICard title='Events' value={String(events.length)} change='Platform bus' />
        <KPICard title='Pending' value={String(events.filter((event) => event.status === 'Pending').length)} change='Awaiting processing' />
        <KPICard title='Completed' value={String(events.filter((event) => event.status === 'Completed').length)} change='Processed events' />
      </div>

      <DomainEntityList
        title='Event Bus'
        description='Cross-domain event stream for platform orchestration.'
        searchPlaceholder='Search platform events...'
        columns={columns}
        data={events}
        emptyTitle='No platform events'
        emptyDescription='No platform events have been emitted yet.'
        emptyAction={<Button>Replay Events</Button>}
        actions={<Button variant='secondary'>Export</Button>}
      />
    </DomainModulePage>
  );
}
