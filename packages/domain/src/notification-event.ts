export type NotificationChannel =
  | "InApp"
  | "Email"
  | "SMS"
  | "Webhook";

export type NotificationEventStatus =
  | "Pending"
  | "Queued"
  | "Sent"
  | "Failed";

export interface NotificationEvent {
  id: string;
  entityType: string;
  entityId: string;
  title: string;
  message: string;
  channel: NotificationChannel;
  status: NotificationEventStatus;
  createdAt: string;
}
