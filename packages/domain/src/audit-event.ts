export type AuditEntityType =
  | "Claim"
  | "Policy"
  | "Customer"
  | "Finance"
  | "Marketplace"
  | "Identity"
  | "Workflow";

export interface AuditEvent {
  id: string;
  entityType: AuditEntityType;
  entityId: string;
  action: string;
  actor: string;
  occurredAt: string;
  details?: string;
}
