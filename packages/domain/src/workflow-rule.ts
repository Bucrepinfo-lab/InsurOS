import type { WorkflowTransitionAction } from './workflow-transition';

export interface WorkflowTransitionRule {
  id: string;
  workflowType: string;
  fromStatus: string;
  action: WorkflowTransitionAction;
  toStatus: string;
  requiresReason?: boolean;
  requiresApproval?: boolean;
}
