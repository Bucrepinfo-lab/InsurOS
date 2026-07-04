export type NotificationChannel =
  | "InApp"
  | "Email"
  | "SMS"
  | "Webhook";

export type NotificationStatus =
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
  status: NotificationStatus;
  createdAt: string;
}
