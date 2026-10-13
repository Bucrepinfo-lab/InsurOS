import type { WorkflowTransitionRule } from '@insuros/domain';

export const mockWorkflowTransitionRules: WorkflowTransitionRule[] = [
  {
    id: 'rule-001',
    workflowType: 'Claim Assessment',
    fromStatus: 'Submitted',
    action: 'Submit',
    toStatus: 'In Review'
  },
  {
    id: 'rule-002',
    workflowType: 'Claim Assessment',
    fromStatus: 'In Review',
    action: 'Approve',
    toStatus: 'Approved',
    requiresApproval: true
  },
  {
    id: 'rule-003',
    workflowType: 'Claim Assessment',
    fromStatus: 'In Review',
    action: 'Reject',
    toStatus: 'Rejected',
    requiresReason: true
  },
  {
    id: 'rule-004',
    workflowType: 'Finance Reconciliation',
    fromStatus: 'In Review',
    action: 'Escalate',
    toStatus: 'Escalated',
    requiresReason: true
  },
  {
    id: 'rule-005',
    workflowType: 'Policy Issuance',
    fromStatus: 'Draft',
    action: 'Submit',
    toStatus: 'Submitted'
  }
];
