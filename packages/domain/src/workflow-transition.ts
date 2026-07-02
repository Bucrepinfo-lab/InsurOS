import type { ActorStamped, IsoDateTime } from "./base";
import type { WorkflowStatus } from "./workflow-status";

export type WorkflowTransitionAction =
  | "Submit"
  | "Approve"
  | "Reject"
  | "Escalate"
  | "Reopen"
  | "Close";

export interface WorkflowTransition extends ActorStamped {
  id: string;
  workflowId: string;
  fromStatus: WorkflowStatus;
  toStatus: WorkflowStatus;
  action: WorkflowTransitionAction;
  reason?: string;
  occurredAt: IsoDateTime;
}
