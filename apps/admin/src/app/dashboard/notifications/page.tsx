import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  KPICard,
  type DataTableColumn
} from '@insuros/ui';
import { NotificationEventService, NotificationService } from '@insuros/services';
import { ActionButton } from '@/components/ActionButton';
import { queueDemoRequest } from '@/app/dashboard/actions';

export const metadata = { title: 'Notifications' };

const notificationService = new NotificationService();
const notificationEventService = new NotificationEventService();

export default async function NotificationsPage() {
  const notifications = await notificationService.getNotifications();
  const unread = await notificationService.getUnreadNotifications();
  const events = await notificationEventService.getNotificationEvents();

  type NotificationRow = (typeof notifications)[number];
  type NotificationEventRow = (typeof events)[number];

  const columns: DataTableColumn<NotificationRow>[] = [
    { key: 'title', header: 'Notification' },
    { key: 'module', header: 'Module' },
    { key: 'message', header: 'Message' },
    { key: 'createdAt', header: 'Created At' },
    {
      key: 'severity',
      header: 'Severity',
      render: (row) => (
        <Badge
          tone={
            row.severity === 'Critical'
              ? 'danger'
              : row.severity === 'Success'
                ? 'success'
                : row.severity === 'Warning'
                  ? 'warning'
                  : 'neutral'
          }
        >
          {row.severity}
        </Badge>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge tone={row.status === 'Unread' ? 'warning' : 'neutral'}>
          {row.status}
        </Badge>
      )
    }
  ];

  const eventColumns: DataTableColumn<NotificationEventRow>[] = [
    { key: 'title', header: 'Event' },
    { key: 'entityType', header: 'Entity Type' },
    { key: 'entityId', header: 'Entity ID' },
    { key: 'channel', header: 'Channel' },
    { key: 'createdAt', header: 'Created At' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge
          tone={
            row.status === 'Sent'
              ? 'success'
              : row.status === 'Failed'
                ? 'danger'
                : row.status === 'Queued'
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
      title='Notification Center'
      description='Review platform notifications, notification events, alerts, warnings, approvals, and operational messages.'
      actions={<ActionButton label='Notification Rules' action={queueDemoRequest.bind(null, 'Notification Rules')} />}
    >
      <div className='mb-6 grid gap-4 md:grid-cols-3'>
        <KPICard title='Notifications' value={String(notifications.length)} change='Across platform' />
        <KPICard title='Unread' value={String(unread.length)} change='Needs review' />
        <KPICard title='Notification Events' value={String(events.length)} change='Delivery pipeline' />
      </div>

      <div className='space-y-6'>
        <DomainEntityList
          title='Notification Events'
          description='Platform notification events prepared for in-app, email, SMS, and webhook delivery.'
          searchPlaceholder='Search notification events...'
          columns={eventColumns}
          data={events}
          emptyTitle='No notification events'
          emptyDescription='No platform notification events are currently available.'
          emptyAction={<Button>Notification Rules</Button>}
          actions={<Button variant='secondary'>Export</Button>}
        />

        <DomainEntityList
          title='Notifications'
          description='Platform notifications generated across modules and workflows.'
          searchPlaceholder='Search notifications...'
          columns={columns}
          data={notifications}
          emptyTitle='No notifications'
          emptyDescription='No platform notifications are currently available.'
          emptyAction={<Button>Notification Rules</Button>}
          actions={<Button variant='secondary'>Export</Button>}
        />
      </div>
    </DomainModulePage>
  );
}
