import type { WorkflowTransitionAction } from "./workflow-transition";

export interface WorkflowPolicy {
  id: string;
  workflowType: string;
  action: WorkflowTransitionAction;
  requiredRoles: string[];
  requiresApproval: boolean;
  requiresReason: boolean;
}
