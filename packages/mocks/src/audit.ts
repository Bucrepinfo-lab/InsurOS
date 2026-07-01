import type { AuditRecord } from '@insuros/domain';

export const mockAuditRecords: AuditRecord[] = [
  {
    id: 'audit-001',
    module: 'Claims',
    entityId: 'CLM-2026-0001',
    entityReference: 'CLM-2026-0001',
    action: 'Create',
    actor: 'Claims Officer',
    timestamp: '2026-07-01T09:20:00Z',
    details: 'Claim was created.'
  },
  {
    id: 'audit-002',
    module: 'Policies',
    entityId: 'POL-2026-0001',
    entityReference: 'POL-2026-0001',
    action: 'Approve',
    actor: 'Underwriter',
    timestamp: '2026-07-01T10:10:00Z',
    details: 'Policy approved.'
  },
  {
    id: 'audit-003',
    module: 'Finance',
    entityId: 'FIN-2026-0088',
    entityReference: 'FIN-2026-0088',
    action: 'Update',
    actor: 'Finance Manager',
    timestamp: '2026-07-01T11:40:00Z',
    details: 'Reconciliation updated.'
  }
];