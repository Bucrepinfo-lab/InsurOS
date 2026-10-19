import type { IsoDateTime, ModuleScoped } from './base';
import type { PlatformModule } from './modules';

export type NotificationSeverity = 'Info' | 'Success' | 'Warning' | 'Critical';

export type NotificationStatus = 'Unread' | 'Read' | 'Archived';

export interface PlatformNotification extends ModuleScoped<PlatformModule> {
  id: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  status: NotificationStatus;
  createdAt: IsoDateTime;
}
