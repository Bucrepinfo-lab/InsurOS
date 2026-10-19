import type { WorkflowTransitionAction } from "./workflow-transition";
import type { WorkflowType } from "./workflow-type";

export interface WorkflowPolicy {
  id: string;
  workflowType: WorkflowType;
  action: WorkflowTransitionAction;
  requiredRoles: string[];
  requiresApproval: boolean;
  requiresReason: boolean;
}
