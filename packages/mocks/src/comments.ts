import type { PlatformComment } from '@insuros/domain';

export const mockComments: PlatformComment[] = [
  {
    id: 'comment-001',
    module: 'Claims',
    entityId: 'CLM-2026-0001',
    entityReference: 'CLM-2026-0001',
    body: 'Assessment documents have been reviewed and require manager approval.',
    author: 'Claims Officer',
    createdAt: '2026-07-01T12:00:00Z'
  },
  {
    id: 'comment-002',
    module: 'Policies',
    entityId: 'POL-2026-0001',
    entityReference: 'POL-2026-0001',
    body: 'Customer requested confirmation of policy holder details before issuance.',
    author: 'Underwriting',
    createdAt: '2026-07-01T12:30:00Z'
  },
  {
    id: 'comment-003',
    module: 'Operations',
    entityId: 'wf-003',
    entityReference: 'FIN-2026-0088',
    body: 'Escalation reviewed. Finance team should reconcile the mismatch before close.',
    author: 'Finance Manager',
    createdAt: '2026-07-01T13:00:00Z'
  }
];