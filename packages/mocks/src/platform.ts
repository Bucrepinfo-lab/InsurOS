import type { ActivityEvent } from '@insuros/domain';

export const mockActivityEvents: ActivityEvent[] = [
  {
    id: 'act-001',
    module: 'Claims',
    entityId: 'CLM-2026-0001',
    entityReference: 'CLM-2026-0001',
    type: 'Submitted',
    title: 'Claim submitted',
    description: 'Motor claim was submitted for assessment.',
    actor: 'Claims Officer',
    occurredAt: '2026-07-01T09:30:00Z'
  },
  {
    id: 'act-002',
    module: 'Policies',
    entityId: 'POL-2026-0001',
    entityReference: 'POL-2026-0001',
    type: 'Approved',
    title: 'Policy approved',
    description: 'Policy issuance was approved by underwriting.',
    actor: 'Underwriting',
    occurredAt: '2026-07-01T10:15:00Z'
  },
  {
    id: 'act-003',
    module: 'Operations',
    entityId: 'wf-003',
    entityReference: 'FIN-2026-0088',
    type: 'Escalated',
    title: 'Workflow escalated',
    description: 'Invoice reconciliation workflow was escalated due to SLA risk.',
    actor: 'Finance Manager',
    occurredAt: '2026-07-01T11:00:00Z'
  }
];