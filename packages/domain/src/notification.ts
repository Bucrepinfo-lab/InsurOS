export type NotificationSeverity = 'Info' | 'Success' | 'Warning' | 'Critical';

export type NotificationStatus = 'Unread' | 'Read' | 'Archived';

export interface PlatformNotification {
  id: string;
  title: string;
  message: string;
  module: 'Marketplace' | 'Customers' | 'Policies' | 'Claims' | 'Finance' | 'Operations' | 'Identity';
  severity: NotificationSeverity;
  status: NotificationStatus;
  createdAt: string;
}