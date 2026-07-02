import type { ActorStamped, IsoDateTime } from './base';

export type WorkflowTransitionAction =
  | 'Submit'
  | 'Approve'
  | 'Reject'
  | 'Escalate'
  | 'Reopen'
  | 'Close';

export interface WorkflowTransition
  extends ActorStamped {
  id: string;
  workflowId: string;
  fromStatus: string;
  toStatus: string;
  action: WorkflowTransitionAction;
  reason?: string;
  occurredAt: IsoDateTime;
}
