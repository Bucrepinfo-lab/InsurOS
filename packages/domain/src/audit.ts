export type AuditModule =
  | 'Marketplace'
  | 'Customers'
  | 'Policies'
  | 'Claims'
  | 'Finance'
  | 'Operations'
  | 'Identity';

export type AuditAction =
  | 'Create'
  | 'Update'
  | 'Delete'
  | 'Approve'
  | 'Reject'
  | 'Assign'
  | 'Upload'
  | 'Download'
  | 'Login'
  | 'Logout';

export interface AuditRecord {
  id: string;
  module: AuditModule;
  entityId: string;
  entityReference: string;
  action: AuditAction;
  actor: string;
  timestamp: string;
  details: string;
}