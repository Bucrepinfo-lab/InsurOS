import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  KPICard,
  type DataTableColumn
} from '@insuros/ui';
import { NotificationService } from '@insuros/services';

const notificationService = new NotificationService();

export default async function NotificationsPage() {
  const notifications = await notificationService.getNotifications();
  const unread = await notificationService.getUnreadNotifications();

  type NotificationRow = (typeof notifications)[number];

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

  return (
    <DomainModulePage
      title='Notification Center'
      description='Review platform notifications, alerts, warnings, approvals, and operational messages.'
      actions={<Button>Notification Rules</Button>}
    >
      <div className='mb-6 grid gap-4 md:grid-cols-3'>
        <KPICard title='Notifications' value={String(notifications.length)} change='Across platform' />
        <KPICard title='Unread' value={String(unread.length)} change='Needs review' />
        <KPICard title='Critical' value={String(notifications.filter((item) => item.severity === 'Critical').length)} change='Immediate attention' />
      </div>

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
    </DomainModulePage>
  );
}