import type { WorkflowStatus } from "./workflow-status";
import type { WorkflowTransitionAction } from "./workflow-transition";
import type { WorkflowType } from "./workflow-type";

export interface WorkflowTransitionRule {
  id: string;
  workflowType: WorkflowType;
  fromStatus: WorkflowStatus;
  action: WorkflowTransitionAction;
  toStatus: WorkflowStatus;
  requiresReason?: boolean;
  requiresApproval?: boolean;
}
