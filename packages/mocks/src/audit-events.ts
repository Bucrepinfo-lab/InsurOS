import type { AuditEvent } from "@insuros/domain";

export const mockAuditEvents: AuditEvent[] = [
  {
    id: "audit-event-001",
    entityType: "Claim",
    entityId: "CLM-2026-0001",
    action: "WorkflowActionPreviewed",
    actor: "Claims Manager",
    occurredAt: "2026-07-03T09:00:00Z",
    details: "Previewed claim workflow action Submit."
  },
  {
    id: "audit-event-002",
    entityType: "Policy",
    entityId: "POL-2026-0001",
    action: "PolicyWorkflowViewed",
    actor: "Underwriter",
    occurredAt: "2026-07-03T09:15:00Z",
    details: "Viewed policy workflow state."
  },
  {
    id: "audit-event-003",
    entityType: "Finance",
    entityId: "REC-2026-0001",
    action: "FinanceWorkflowReviewed",
    actor: "Finance Manager",
    occurredAt: "2026-07-03T09:30:00Z",
    details: "Reviewed finance reconciliation workflow."
  }
];
