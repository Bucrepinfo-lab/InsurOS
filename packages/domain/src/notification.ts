import type { IsoDateTime, ModuleScoped } from './base';

export type NotificationSeverity = 'Info' | 'Success' | 'Warning' | 'Critical';

export type NotificationStatus = 'Unread' | 'Read' | 'Archived';

export type NotificationModule =
  | 'Marketplace'
  | 'Customers'
  | 'Policies'
  | 'Claims'
  | 'Finance'
  | 'Operations'
  | 'Identity';

export interface PlatformNotification
  extends ModuleScoped<NotificationModule> {
  id: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  status: NotificationStatus;
  createdAt: IsoDateTime;
}
