import type { WorkflowTransitionAction } from './workflow-transition';

export interface WorkflowStateMachine {
  workflowType: string;
  currentStatus: string;
  allowedActions: WorkflowTransitionAction[];
}
