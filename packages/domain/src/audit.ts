import type { ActorStamped, IsoDateTime, ModuleScoped, ReferencedEntity } from './base';

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

export interface AuditRecord
  extends ReferencedEntity,
    ModuleScoped<AuditModule>,
    ActorStamped {
  action: AuditAction;
  timestamp: IsoDateTime;
  details: string;
}
