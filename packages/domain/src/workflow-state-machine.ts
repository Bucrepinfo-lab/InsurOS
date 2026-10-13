import type { WorkflowStatus } from "./workflow-status";
import type { WorkflowTransitionAction } from "./workflow-transition";
import type { WorkflowType } from "./workflow-type";

export interface WorkflowStateMachine {
  workflowType: WorkflowType;
  currentStatus: WorkflowStatus;
  allowedActions: WorkflowTransitionAction[];
}
