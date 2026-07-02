import type { WorkflowPolicy } from '@insuros/domain';

export const mockWorkflowPolicies: WorkflowPolicy[] = [
  {
    id: 'policy-001',
    workflowType: 'Claim Assessment',
    action: 'Approve',
    requiredRoles: ['Claims Manager'],
    requiresApproval: true,
    requiresReason: false
  },
  {
    id: 'policy-002',
    workflowType: 'Claim Assessment',
    action: 'Reject',
    requiredRoles: ['Claims Manager'],
    requiresApproval: true,
    requiresReason: true
  },
  {
    id: 'policy-003',
    workflowType: 'Finance Reconciliation',
    action: 'Escalate',
    requiredRoles: ['Finance Manager'],
    requiresApproval: false,
    requiresReason: true
  },
  {
    id: 'policy-004',
    workflowType: 'Policy Issuance',
    action: 'Submit',
    requiredRoles: ['Underwriting'],
    requiresApproval: false,
    requiresReason: false
  }
];
