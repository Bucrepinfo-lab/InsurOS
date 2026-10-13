import type { NotificationEvent } from "@insuros/domain";

export const mockNotificationEvents: NotificationEvent[] = [
  {
    id: "notification-event-001",
    entityType: "Claim",
    entityId: "CLM-2026-0001",
    title: "Claim workflow action available",
    message: "A claim workflow action is available for review.",
    channel: "InApp",
    status: "Pending",
    createdAt: "2026-07-03T10:00:00Z"
  },
  {
    id: "notification-event-002",
    entityType: "Policy",
    entityId: "POL-2026-0001",
    title: "Policy requires underwriting review",
    message: "A policy workflow has entered underwriting review.",
    channel: "InApp",
    status: "Queued",
    createdAt: "2026-07-03T10:15:00Z"
  },
  {
    id: "notification-event-003",
    entityType: "Finance",
    entityId: "REC-2026-0001",
    title: "Finance reconciliation needs attention",
    message: "A reconciliation workflow is waiting for finance review.",
    channel: "InApp",
    status: "Pending",
    createdAt: "2026-07-03T10:30:00Z"
  }
];
