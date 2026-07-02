import type { WorkflowTransitionAction } from "./workflow-transition";
import type { WorkflowType } from "./workflow-type";

export interface WorkflowTransitionRule {
  id: string;
  workflowType: WorkflowType;
  fromStatus: string;
  action: WorkflowTransitionAction;
  toStatus: string;
  requiresReason?: boolean;
  requiresApproval?: boolean;
}
