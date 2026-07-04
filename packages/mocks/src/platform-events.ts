import type { PlatformEvent } from "@insuros/domain";

export const mockPlatformEvents: PlatformEvent[] = [
  {
    id: "platform-event-001",
    eventType: "Claim.WorkflowActionPreviewed",
    sourceModule: "Claims",
    entityId: "CLM-2026-0001",
    payload: {
      action: "Submit",
      nextStatus: "In Review"
    },
    status: "Completed",
    createdAt: "2026-07-03T11:00:00Z"
  },
  {
    id: "platform-event-002",
    eventType: "Finance.WorkflowReviewed",
    sourceModule: "Finance",
    entityId: "REC-2026-0001",
    payload: {
      stage: "Reconciliation",
      status: "In Review"
    },
    status: "Completed",
    createdAt: "2026-07-03T11:15:00Z"
  },
  {
    id: "platform-event-003",
    eventType: "Identity.VerificationQueued",
    sourceModule: "Identity",
    entityId: "IDV-2026-0002",
    payload: {
      stage: "Document Verification"
    },
    status: "Pending",
    createdAt: "2026-07-03T11:30:00Z"
  }
];
