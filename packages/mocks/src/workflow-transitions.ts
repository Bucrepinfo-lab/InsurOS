import type { WorkflowTransition } from '@insuros/domain';

export const mockWorkflowTransitions: WorkflowTransition[] = [
  {
    id: 'transition-001',
    workflowId: 'wf-001',
    fromStatus: 'Submitted',
    toStatus: 'In Review',
    action: 'Submit',
    actor: 'Claims Officer',
    occurredAt: '2026-07-01T09:35:00Z'
  },
  {
    id: 'transition-002',
    workflowId: 'wf-002',
    fromStatus: 'Draft',
    toStatus: 'Submitted',
    action: 'Submit',
    actor: 'Underwriting',
    occurredAt: '2026-07-01T10:05:00Z'
  },
  {
    id: 'transition-003',
    workflowId: 'wf-003',
    fromStatus: 'In Review',
    toStatus: 'Escalated',
    action: 'Escalate',
    reason: 'SLA risk detected.',
    actor: 'Finance Manager',
    occurredAt: '2026-07-01T11:20:00Z'
  }
];
