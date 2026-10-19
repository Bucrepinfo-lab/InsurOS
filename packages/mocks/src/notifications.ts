import type { PlatformNotification } from '@insuros/domain';

export const mockNotifications: PlatformNotification[] = [
  {
    id: 'notif-001',
    title: 'Claim escalation',
    message: 'Claim CLM-2026-0001 requires management review.',
    module: 'Claims',
    severity: 'Critical',
    status: 'Unread',
    createdAt: '2026-07-01T09:30:00Z'
  },
  {
    id: 'notif-002',
    title: 'Policy approved',
    message: 'Policy POL-2026-0001 has been approved.',
    module: 'Policies',
    severity: 'Success',
    status: 'Read',
    createdAt: '2026-07-01T10:15:00Z'
  },
  {
    id: 'notif-003',
    title: 'Reconciliation warning',
    message: 'Finance reconciliation has pending mismatches.',
    module: 'Finance',
    severity: 'Warning',
    status: 'Unread',
    createdAt: '2026-07-01T11:00:00Z'
  }
];