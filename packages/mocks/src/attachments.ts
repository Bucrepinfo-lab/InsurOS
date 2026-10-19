import type { PlatformAttachment } from '@insuros/domain';

export const mockAttachments: PlatformAttachment[] = [
  {
    id: 'att-001',
    module: 'Claims',
    entityId: 'CLM-2026-0001',
    entityReference: 'CLM-2026-0001',
    fileName: 'claim-assessment.pdf',
    fileType: 'application/pdf',
    uploadedBy: 'Claims Officer',
    uploadedAt: '2026-07-01T09:45:00Z',
    status: 'Uploaded'
  },
  {
    id: 'att-002',
    module: 'Policies',
    entityId: 'POL-2026-0001',
    entityReference: 'POL-2026-0001',
    fileName: 'policy-schedule.pdf',
    fileType: 'application/pdf',
    uploadedBy: 'Underwriting',
    uploadedAt: '2026-07-01T10:30:00Z',
    status: 'Verified'
  },
  {
    id: 'att-003',
    module: 'Finance',
    entityId: 'FIN-2026-0088',
    entityReference: 'FIN-2026-0088',
    fileName: 'reconciliation-report.xlsx',
    fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    uploadedBy: 'Finance Manager',
    uploadedAt: '2026-07-01T11:15:00Z',
    status: 'Rejected'
  }
];